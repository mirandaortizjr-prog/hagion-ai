import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import Stripe from 'npm:stripe@14'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-11-20.acacia',
})

// Pricing: $5/day base. Discounts for longer runs.
function priceCents(days: number, targetType: string) {
  const baseDaily = targetType === 'church' ? 800 : 500 // church boosts cost more
  let total = baseDaily * days
  if (days >= 30) total = Math.floor(total * 0.75)
  else if (days >= 7) total = Math.floor(total * 0.9)
  return total
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )
    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsErr } = await supabase.auth.getClaims(token)
    if (claimsErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const userId = claimsData.claims.sub
    const userEmail = claimsData.claims.email

    const body = await req.json().catch(() => ({}))
    const { target_type, target_id, duration_days, sponsor_name, sponsor_url } = body

    if (!['post', 'event', 'teaching', 'church'].includes(target_type)) {
      return new Response(JSON.stringify({ error: 'invalid target_type' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (!target_id || typeof target_id !== 'string') {
      return new Response(JSON.stringify({ error: 'target_id required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const days = Math.max(1, Math.min(90, Number(duration_days) || 7))
    const amount = priceCents(days, target_type)

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: sponsorship, error: insErr } = await admin
      .from('sponsorships')
      .insert({
        target_type,
        target_id,
        sponsor_user_id: userId,
        amount_cents: amount,
        duration_days: days,
        sponsor_name: sponsor_name ?? null,
        sponsor_url: sponsor_url ?? null,
        status: 'pending',
      })
      .select('id')
      .single()

    if (insErr) throw insErr

    const origin = req.headers.get('origin') || 'https://hagion-ai.lovable.app'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: userEmail,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Sponsor ${target_type} for ${days} days`,
            description: 'Promoted placement on Hagion',
          },
          unit_amount: amount,
        },
      }],
      success_url: `${origin}/monetize/sponsor?success=1&sid=${sponsorship.id}`,
      cancel_url: `${origin}/monetize/sponsor?canceled=1&sid=${sponsorship.id}`,
      metadata: {
        kind: 'sponsorship',
        sponsorship_id: sponsorship.id,
        target_type,
        target_id,
        sponsor_user_id: userId,
        duration_days: String(days),
      },
    })

    await admin
      .from('sponsorships')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', sponsorship.id)

    return new Response(JSON.stringify({ url: session.url, amount_cents: amount, days }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('create-sponsorship-checkout error', e)
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
