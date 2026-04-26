// Soft-deletes the calling user's account: cancels any active Stripe
// subscription at period end and inserts a deletion request scheduled
// 30 days out. A separate cron-driven function will hard-delete after.
import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Cancel any active Stripe subs at period end (sandbox + live)
    for (const env of ["sandbox", "live"] as StripeEnv[]) {
      const { data: subs } = await supabase
        .from("subscriptions")
        .select("stripe_subscription_id, status")
        .eq("user_id", user.id)
        .eq("environment", env)
        .in("status", ["active", "trialing", "past_due"]);
      if (!subs?.length) continue;
      try {
        const stripe = createStripeClient(env);
        for (const s of subs) {
          await stripe.subscriptions.update(s.stripe_subscription_id as string, {
            cancel_at_period_end: true,
          });
        }
      } catch (e) {
        console.error(`Failed cancelling ${env} subs:`, e);
      }
    }

    // Insert/upsert deletion request (30-day grace)
    const { error: insertErr } = await (supabase.from("account_deletion_requests") as any).upsert(
      {
        user_id: user.id,
        requested_at: new Date().toISOString(),
        scheduled_deletion_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelled_at: null,
        completed_at: null,
      },
      { onConflict: "user_id" },
    );
    if (insertErr) throw insertErr;

    // Sign the user out by invalidating their refresh tokens
    await supabase.auth.admin.signOut(user.id, "global");

    return new Response(
      JSON.stringify({
        success: true,
        scheduledDeletionAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("request-account-deletion error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
