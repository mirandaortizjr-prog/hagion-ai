import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import Stripe from 'npm:stripe@14'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-11-20.acacia',
})

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
    const { church_id, plan = 'monthly', return_url } = body
    if (!church_id || typeof church_id !== 'string') {
      return new Response(JSON.stringify({ error: 'church_id required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: church } = await admin
      .from('churches')
      .select('id, name, pastor_id')
      .eq('id', church_id)
      .maybeSingle()

    if (!church || church.pastor_id !== userId) {
      return new Response(JSON.stringify({ error: 'You must be the church owner' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // $19/mo or $190/yr
    const priceCents = plan === 'yearly' ? 19000 : 1900
    const interval = plan === 'yearly' ? 'year' : 'month'

    const origin = req.headers.get('origin') || return_url || 'https://hagion-ai.lovable.app'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: userEmail,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Hagion Ministry Pro — ${church.name}`,
            description: 'Verified badge, featured placement, analytics, unlimited events',
          },
          unit_amount: priceCents,
          recurring: { interval },
        },
      }],
      success_url: `${origin}/monetize/church-pro?success=1&church_id=${church_id}`,
      cancel_url: `${origin}/monetize/church-pro?canceled=1&church_id=${church_id}`,
      metadata: {
        kind: 'church_pro',
        church_id,
        owner_user_id: userId,
        plan,
      },
    })

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('create-church-pro-checkout error', e)
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
