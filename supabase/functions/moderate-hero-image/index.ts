// Moderates a hero image submission using Lovable AI Gateway (Gemini vision).
// On success: marks the row 'approved'. On rejection: marks 'rejected' with reason.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Body {
  hero_image_id: string;
  image_url: string;
}

const SYSTEM_PROMPT = `You are a content moderator for a Christian devotional app's hero slideshow.
Approve images that are: peaceful, inspirational, nature, sky/clouds, light, scripture, art, places of worship, hands praying, candles, or other reverent imagery suitable for a worship setting.
Reject images that contain: nudity, sexual content, violence, gore, weapons, hate symbols, drugs/alcohol, advertising/logos/watermarks, memes, screenshots, low-quality blurry photos, selfies/portraits of identifiable people, text overlays promoting other apps, or imagery from non-Christian religions presented devotionally (e.g. idols, other deities).
Respond ONLY with strict JSON: {"approved": boolean, "reason": string}. Reason must be ≤120 chars and user-friendly when rejecting.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SERVICE_ROLE) {
      throw new Error("Missing required environment variables");
    }

    const body = (await req.json()) as Body;
    if (!body?.hero_image_id || !body?.image_url) {
      return new Response(JSON.stringify({ error: "hero_image_id and image_url required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify caller is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Call Lovable AI vision
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: "Moderate this image for the worship hero slideshow." },
              { type: "image_url", image_url: { url: body.image_url } },
            ],
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI gateway error:", aiRes.status, errText);
      // On AI failure, leave as pending; do not auto-approve
      return new Response(
        JSON.stringify({ status: "pending", error: "Moderation service unavailable" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const aiData = await aiRes.json();
    const raw = aiData?.choices?.[0]?.message?.content ?? "{}";
    let verdict: { approved: boolean; reason: string };
    try {
      verdict = JSON.parse(raw);
    } catch {
      verdict = { approved: false, reason: "Moderation parse error" };
    }

    const newStatus = verdict.approved ? "approved" : "rejected";

    // Update DB using service role (bypasses RLS for status flip)
    const updateRes = await fetch(
      `${SUPABASE_URL}/rest/v1/hero_images?id=eq.${body.hero_image_id}`,
      {
        method: "PATCH",
        headers: {
          apikey: SERVICE_ROLE,
          Authorization: `Bearer ${SERVICE_ROLE}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          status: newStatus,
          rejection_reason: verdict.approved ? null : (verdict.reason || "Did not pass review"),
          approved_at: verdict.approved ? new Date().toISOString() : null,
        }),
      },
    );

    if (!updateRes.ok) {
      const txt = await updateRes.text();
      throw new Error(`DB update failed [${updateRes.status}]: ${txt}`);
    }

    return new Response(
      JSON.stringify({ status: newStatus, reason: verdict.reason }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("moderate-hero-image error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
