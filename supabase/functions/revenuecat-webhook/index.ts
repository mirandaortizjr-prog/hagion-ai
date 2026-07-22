// RevenueCat webhook handler
// Configure in RevenueCat dashboard: Project Settings → Webhooks
// URL: https://<project-ref>.supabase.co/functions/v1/revenuecat-webhook
// Authorization: Bearer <REVENUECAT_WEBHOOK_AUTH>
//
// Expected subscriber attributes set from the mobile client before purchase:
//   - Ministry Pro: church_id
//   - Featured church: church_id
//   - Sponsored content: target_type (post|event|teaching), target_id

import { createClient } from 'npm:@supabase/supabase-js@2'

const admin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const WEBHOOK_AUTH = Deno.env.get('REVENUECAT_WEBHOOK_AUTH') ?? ''

function daysFromProductId(productId: string): number | null {
  const m = productId.match(/_(\d+)_days$/)
  if (!m) return null
  return parseInt(m[1], 10)
}

function getAttribute(attrs: Record<string, any>, key: string): string | null {
  const val = attrs?.[key]
  if (!val) return null
  if (typeof val === 'string') return val
  return val?.value ?? null
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const authHeader = req.headers.get('Authorization') ?? ''
  const expected = `Bearer ${WEBHOOK_AUTH}`
  if (WEBHOOK_AUTH && authHeader !== expected) {
    console.error('Invalid RevenueCat webhook auth')
    return new Response('Unauthorized', { status: 401 })
  }

  let payload: any
  try {
    payload = await req.json()
  } catch (e) {
    return new Response('Invalid JSON', { status: 400 })
  }

  const event = payload.event ?? payload
  const eventType = event.type
  const productId = event.product_id
  const userId = event.app_user_id
  const transactionId = event.transaction_id

  console.log('RevenueCat webhook:', eventType, productId, userId)

  if (!productId || !userId) {
    return new Response(JSON.stringify({ received: true, ignored: 'missing fields' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const nowIso = new Date().toISOString()

    // Premium / Premium+ subscriptions via RevenueCat
    if (productId === 'hagion_premium_monthly' || productId === 'hagion_premium_plus_monthly' || productId === 'hagion_pro_monthly') {
      const periodEnd = event.expiration_at_ms
        ? new Date(event.expiration_at_ms).toISOString()
        : null

      if (eventType === 'INITIAL_PURCHASE' || eventType === 'RENEWAL' || eventType === 'UNCANCELLATION') {
        const purchaseToken = transactionId ?? event.original_transaction_id ?? `rc_${event.event_id ?? Date.now()}`

        const row = {
          user_id: userId,
          product_id: productId,
          purchase_token: purchaseToken,
          order_id: event.transaction_id ?? null,
          status: 'active',
          expiry_time: periodEnd,
          start_time: nowIso,
          auto_renewing: true,
          acknowledged: true,
          last_verified_at: nowIso,
          raw_response: event as any,
        }

        const { error: upsertError } = await admin.from('google_play_purchases').upsert(row, {
          onConflict: 'purchase_token',
          ignoreDuplicates: false,
        })

        if (upsertError) {
          console.error('google_play_purchases upsert error:', upsertError)
        }
      } else if (eventType === 'CANCELLATION' || eventType === 'EXPIRATION' || eventType === 'BILLING_ISSUE') {
        await admin.from('google_play_purchases').update({
          status: eventType === 'EXPIRATION' ? 'expired' : 'canceled',
          expiry_time: periodEnd,
          last_verified_at: nowIso,
        }).eq('user_id', userId).eq('product_id', productId)
      }
    }

    // Ministry Pro subscription
    if (productId === 'hagion_ministry_monthly' || productId === 'hagion_ministry_yearly') {
      const attrs = event.subscriber_attributes ?? {}
      const churchId = getAttribute(attrs, 'church_id')

      if (!churchId) {
        console.error('Ministry Pro purchase missing church_id attribute')
        return new Response(JSON.stringify({ received: true, ignored: 'missing church_id' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      if (eventType === 'INITIAL_PURCHASE' || eventType === 'RENEWAL' || eventType === 'UNCANCELLATION') {
        const periodEnd = event.expiration_at_ms
          ? new Date(event.expiration_at_ms).toISOString()
          : null

        const { data: existing } = await admin
          .from('church_subscriptions')
          .select('id')
          .eq('church_id', churchId)
          .eq('owner_user_id', userId)
          .maybeSingle()

        if (existing) {
          await admin.from('church_subscriptions').update({
            status: 'active',
            tier: 'ministry_pro',
            current_period_end: periodEnd,
            revenuecat_product_id: productId,
            revenuecat_transaction_id: transactionId,
          }).eq('id', existing.id)
        } else {
          await admin.from('church_subscriptions').insert({
            church_id: churchId,
            owner_user_id: userId,
            status: 'active',
            tier: 'ministry_pro',
            current_period_end: periodEnd,
            revenuecat_product_id: productId,
            revenuecat_transaction_id: transactionId,
          })
        }

        await admin.from('churches').update({
          verified: true,
          pro_tier: 'ministry_pro',
        }).eq('id', churchId)
      } else if (eventType === 'CANCELLATION' || eventType === 'EXPIRATION' || eventType === 'BILLING_ISSUE') {
        await admin.from('church_subscriptions').update({
          status: eventType === 'EXPIRATION' ? 'expired' : 'canceled',
        }).eq('church_id', churchId).eq('owner_user_id', userId)

        await admin.from('churches').update({
          verified: false,
          pro_tier: null,
        }).eq('id', churchId)
      }
    }

    // Sponsored content or featured church (one-time products)
    const days = daysFromProductId(productId)
    if (days) {
      const attrs = event.subscriber_attributes ?? {}
      let targetType: string | null = null
      let targetId: string | null = null

      if (productId.startsWith('featured_church_')) {
        targetType = 'church'
        targetId = getAttribute(attrs, 'church_id')
      } else if (productId.startsWith('sponsor_content_')) {
        targetType = getAttribute(attrs, 'target_type')
        targetId = getAttribute(attrs, 'target_id')
      }

      if (!targetType || !targetId) {
        console.error('Sponsorship purchase missing target attributes', productId, attrs)
        return new Response(JSON.stringify({ received: true, ignored: 'missing target attrs' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      if (eventType === 'INITIAL_PURCHASE') {
        const { data: existing } = await admin
          .from('sponsorships')
          .select('id')
          .eq('revenuecat_transaction_id', transactionId)
          .maybeSingle()

        if (existing) {
          return new Response(JSON.stringify({ received: true, ignored: 'duplicate' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        const now = new Date()
        const ends = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

        await admin.from('sponsorships').insert({
          target_type: targetType,
          target_id: targetId,
          sponsor_user_id: userId,
          amount_cents: 0,
          duration_days: days,
          status: 'active',
          starts_at: now.toISOString(),
          ends_at: ends.toISOString(),
          revenuecat_product_id: productId,
          revenuecat_transaction_id: transactionId,
        })

        if (targetType === 'church') {
          await admin.from('churches').update({
            is_featured: true,
            featured_until: ends.toISOString(),
          }).eq('id', targetId)
        } else {
          const table =
            targetType === 'post' ? 'posts' :
            targetType === 'event' ? 'events' :
            targetType === 'teaching' ? 'teachings' : null

          if (table) {
            await admin.from(table).update({
              is_sponsored: true,
              sponsored_until: ends.toISOString(),
            }).eq('id', targetId)
          }
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('RevenueCat webhook error:', e)
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
