import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get last 30 titles to avoid repeats
    const { data: recent } = await supabase
      .from("daily_wisdom_stories")
      .select("title")
      .order("created_at", { ascending: false })
      .limit(30);
    const avoidTitles = (recent || []).map((r: any) => r.title);

    const systemPrompt = `You are a master historian and theologian writing for "Hagion University - Daily Wisdom".
Write in the cold, surgical, observant style of Robert Greene's "48 Laws of Power" — Machiavellian in cadence — but the wisdom itself is unwavering, biblically sound Christian Truth. Each story illustrates a spiritual law drawn from Scripture, taught through figures from the HISTORY OF CHRISTIANITY (church fathers, martyrs, reformers, missionaries, theologians, monks, Christian rulers, heretics who fell). Use only post-apostolic Christian history (~AD 60 to AD 1950). NEVER use Bible characters or Bible-narrative events.

Each story must be deep, engaging, paragraph-rich, and end in a piercing, unforgettable truth.

Return ONLY a JSON object — no preamble, no markdown fences:
{
  "title": "5-9 word Greene-style law title",
  "era": "Short era line like '316 AD' or 'c. 1153 AD'",
  "theme": "ONE word from: Humility, Courage, Discernment, Perseverance, Truth, Mercy, Integrity, Faith, Wisdom, Repentance, Obedience, Sacrifice",
  "law_statement": "2-4 sentences. Bold statement of the spiritual law plus brief elaboration.",
  "law_transgression": "350-500 word vivid historical narrative of a real Christian-history figure who violated this law and fell.",
  "law_observance": "350-500 word vivid historical narrative of a real Christian-history figure who upheld this law and prevailed.",
  "law_interpretation": "250-400 word interpretation grounding the law in Scripture with inline references (e.g. Proverbs 16:18). Cold, clear, unwavering.",
  "moral_takeaway": "One sharp closing sentence."
}

Hard rules:
- Real figures from Christian history only — not Bible characters.
- No emoji. No markdown inside string fields. Plain prose.`;

    console.log("Generating new wisdom story... avoiding", avoidTitles.length, "titles");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Produce ONE new story now. Avoid these titles already used: ${JSON.stringify(avoidTitles)}.` },
        ],
        temperature: 0.95,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate story");
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not extract JSON from AI response");
    }

    const s = JSON.parse(jsonMatch[0]);

    const required = ["title","era","theme","law_statement","law_transgression","law_observance","law_interpretation","moral_takeaway"];
    for (const k of required) {
      if (!s[k] || typeof s[k] !== "string") {
        throw new Error(`Missing field: ${k}`);
      }
    }

    const { data: insertedStory, error: insertError } = await supabase
      .from("daily_wisdom_stories")
      .insert({
        title: s.title,
        content: s.law_statement, // legacy field kept in sync
        theme: s.theme,
        moral_takeaway: s.moral_takeaway,
        era: s.era,
        law_statement: s.law_statement,
        law_transgression: s.law_transgression,
        law_observance: s.law_observance,
        law_interpretation: s.law_interpretation,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      throw insertError;
    }

    console.log("Story created:", insertedStory.id, "-", insertedStory.title);

    return new Response(
      JSON.stringify({ success: true, story: insertedStory }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-daily-wisdom:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
