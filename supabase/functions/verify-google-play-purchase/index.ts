// Verifies a Google Play subscription purchase token with the Google Play
// Developer API and stores the result in google_play_purchases.
//
// POST body: { productId: string, purchaseToken: string }
// Auth: requires the caller's Supabase JWT (Authorization: Bearer ...).
import { createClient } from "npm:@supabase/supabase-js@2";

const PACKAGE_NAME = "app.lovable.491c2e4bf4f4493f88e1648be5cecac3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// --- Google service account JWT -> OAuth access token ---------------------

interface ServiceAccount {
  client_email: string;
  private_key: string;
  token_uri?: string;
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN [^-]+-----/g, "")
    .replace(/-----END [^-]+-----/g, "")
    .replace(/\s+/g, "");
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

function base64UrlEncode(input: string | Uint8Array): string {
  const bytes =
    typeof input === "string" ? new TextEncoder().encode(input) : input;
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function getAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claims = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/androidpublisher",
    aud: sa.token_uri ?? "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const unsigned = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(
    JSON.stringify(claims),
  )}`;

  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(sa.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsigned),
  );
  const jwt = `${unsigned}.${base64UrlEncode(new Uint8Array(sig))}`;

  const tokenRes = await fetch(
    sa.token_uri ?? "https://oauth2.googleapis.com/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    },
  );

  if (!tokenRes.ok) {
    const txt = await tokenRes.text();
    throw new Error(`Google token exchange failed: ${tokenRes.status} ${txt}`);
  }

  const json = await tokenRes.json();
  return json.access_token as string;
}

// --- Main handler ---------------------------------------------------------

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const saJson = Deno.env.get("GOOGLE_PLAY_SERVICE_ACCOUNT_JSON");
    if (!saJson) throw new Error("GOOGLE_PLAY_SERVICE_ACCOUNT_JSON missing");

    // Identify the calling user via their JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const { productId, purchaseToken } = await req.json();
    if (!productId || !purchaseToken) {
      return new Response(
        JSON.stringify({ error: "productId and purchaseToken required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Call Google Play Developer API
    const sa = JSON.parse(saJson) as ServiceAccount;
    const accessToken = await getAccessToken(sa);

    const url =
      `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/` +
      `${PACKAGE_NAME}/purchases/subscriptions/${encodeURIComponent(productId)}/` +
      `tokens/${encodeURIComponent(purchaseToken)}`;

    const playRes = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!playRes.ok) {
      const txt = await playRes.text();
      console.error("Google Play API error", playRes.status, txt);
      return new Response(
        JSON.stringify({ error: "verification_failed", detail: txt }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const sub = await playRes.json();

    // paymentState: 0 payment pending, 1 received, 2 free trial, 3 pending deferred upgrade
    // cancelReason: 0 user, 1 system (billing), 2 replaced, 3 developer
    const expiryMs = sub.expiryTimeMillis ? Number(sub.expiryTimeMillis) : null;
    const startMs = sub.startTimeMillis ? Number(sub.startTimeMillis) : null;
    const now = Date.now();

    let status: string;
    if (expiryMs && expiryMs < now) {
      status = "expired";
    } else if (sub.paymentState === 0) {
      status = "pending";
    } else if (sub.cancelReason !== undefined && sub.autoRenewing === false) {
      // canceled but still inside the paid period -> keep as 'active' until expiry
      status = expiryMs && expiryMs > now ? "active" : "canceled";
    } else if (sub.paymentState === 1 || sub.paymentState === 2) {
      status = "active";
    } else {
      status = "pending";
    }

    const adminClient = createClient(supabaseUrl, serviceKey);
    const { error: upsertErr } = await adminClient
      .from("google_play_purchases")
      .upsert(
        {
          user_id: userId,
          product_id: productId,
          purchase_token: purchaseToken,
          order_id: sub.orderId ?? null,
          status,
          start_time: startMs ? new Date(startMs).toISOString() : null,
          expiry_time: expiryMs ? new Date(expiryMs).toISOString() : null,
          auto_renewing: !!sub.autoRenewing,
          acknowledged: sub.acknowledgementState === 1,
          raw_response: sub,
          last_verified_at: new Date().toISOString(),
        },
        { onConflict: "purchase_token" },
      );

    if (upsertErr) {
      console.error("Upsert error", upsertErr);
      return new Response(
        JSON.stringify({ error: "db_error", detail: upsertErr.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        verified: true,
        status,
        expiryTime: expiryMs ? new Date(expiryMs).toISOString() : null,
        autoRenewing: !!sub.autoRenewing,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    console.error("verify-google-play-purchase error", e);
    return new Response(
      JSON.stringify({ error: "internal_error", detail: (e as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
