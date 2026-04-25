import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  try {
    const { priceId, customerEmail, userId, returnUrl, environment } = await req.json();

    if (!priceId || !/^[a-zA-Z0-9_-]+$/.test(priceId)) {
      return new Response(JSON.stringify({ error: 'Invalid priceId' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (environment !== 'sandbox' && environment !== 'live') {
      return new Response(JSON.stringify({ error: 'Invalid environment' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (!returnUrl) {
      return new Response(JSON.stringify({ error: 'Missing returnUrl' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const env: StripeEnv = environment;
    const stripe = createStripeClient(env);

    const prices = await stripe.prices.list({ lookup_keys: [priceId] });
    if (!prices.data.length) {
      return new Response(JSON.stringify({ error: 'Price not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const stripePrice = prices.data[0];
    const isRecurring = stripePrice.type === 'recurring';

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: stripePrice.id, quantity: 1 }],
      mode: isRecurring ? 'subscription' : 'payment',
      ui_mode: 'embedded',
      return_url: returnUrl,
      managed_payments: { enabled: true },
      ...(customerEmail && { customer_email: customerEmail }),
      ...(userId && {
        metadata: { userId, managed_payments: 'true' },
        ...(isRecurring && { subscription_data: { metadata: { userId } } }),
      }),
    });

    return new Response(JSON.stringify({ clientSecret: session.client_secret }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('create-checkout error:', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
