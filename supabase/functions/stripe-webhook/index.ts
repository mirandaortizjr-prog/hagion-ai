import { createClient } from 'npm:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@14'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-11-20.acacia',
})

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''

const admin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

async function activateSponsorship(sessionId: string, paymentIntentId: string | null) {
  const { data: sp } = await admin
    .from('sponsorships')
    .select('*')
    .eq('stripe_checkout_session_id', sessionId)
    .maybeSingle()
  if (!sp) return

  const now = new Date()
  const ends = new Date(now.getTime() + sp.duration_days * 24 * 60 * 60 * 1000)

  await admin
    .from('sponsorships')
    .update({
      status: 'active',
      starts_at: now.toISOString(),
      ends_at: ends.toISOString(),
      stripe_payment_intent_id: paymentIntentId,
    })
    .eq('id', sp.id)

  const table =
    sp.target_type === 'post' ? 'posts' :
    sp.target_type === 'event' ? 'events' :
    sp.target_type === 'teaching' ? 'teachings' : 'churches'

  if (sp.target_type === 'church') {
    await admin.from('churches').update({
      is_featured: true,
      featured_until: ends.toISOString(),
    }).eq('id', sp.target_id)
  } else {
    const patch: Record<string, unknown> = {
      is_sponsored: true,
      sponsored_until: ends.toISOString(),
    }
    if (sp.target_type === 'post') {
      patch.sponsor_name = sp.sponsor_name
      patch.sponsor_url = sp.sponsor_url
    }
    await admin.from(table).update(patch).eq('id', sp.target_id)
  }
}

async function activateChurchPro(session: Stripe.Checkout.Session) {
  const churchId = session.metadata?.church_id
  const ownerId = session.metadata?.owner_user_id
  if (!churchId || !ownerId) return

  const subId = typeof session.subscription === 'string'
    ? session.subscription
    : session.subscription?.id
  const customerId = typeof session.customer === 'string'
    ? session.customer
    : session.customer?.id

  let periodEnd: string | null = null
  if (subId) {
    const sub = await stripe.subscriptions.retrieve(subId)
    periodEnd = new Date(sub.current_period_end * 1000).toISOString()
  }

  await admin.from('church_subscriptions').upsert({
    church_id: churchId,
    owner_user_id: ownerId,
    stripe_customer_id: customerId ?? null,
    stripe_subscription_id: subId ?? null,
    status: 'active',
    tier: 'ministry_pro',
    current_period_end: periodEnd,
  }, { onConflict: 'stripe_subscription_id' })

  await admin.from('churches').update({
    verified: true,
    pro_tier: 'ministry_pro',
  }).eq('id', churchId)
}

async function syncSubscription(sub: Stripe.Subscription) {
  const periodEnd = new Date(sub.current_period_end * 1000).toISOString()
  await admin.from('church_subscriptions').update({
    status: sub.status,
    current_period_end: periodEnd,
  }).eq('stripe_subscription_id', sub.id)

  if (sub.status === 'canceled' || sub.status === 'unpaid') {
    const { data: row } = await admin
      .from('church_subscriptions')
      .select('church_id')
      .eq('stripe_subscription_id', sub.id)
      .maybeSingle()
    if (row) {
      await admin.from('churches').update({
        verified: false,
        pro_tier: null,
      }).eq('id', row.church_id)
    }
  }
}

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  if (!signature || !webhookSecret) {
    return new Response('missing signature', { status: 400 })
  }
  const raw = await req.text()

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(raw, signature, webhookSecret)
  } catch (e) {
    console.error('signature verification failed', e)
    return new Response('invalid signature', { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const kind = session.metadata?.kind
        if (kind === 'sponsorship') {
          const pi = typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id ?? null
          await activateSponsorship(session.id, pi)
        } else if (kind === 'church_pro') {
          await activateChurchPro(session)
        }
        break
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        await syncSubscription(event.data.object as Stripe.Subscription)
        break
      }
    }
    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('webhook handler error', e)
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500 })
  }
})
