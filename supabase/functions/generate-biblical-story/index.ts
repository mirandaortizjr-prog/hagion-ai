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
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: recent } = await supabase
      .from("daily_wisdom_stories")
      .select("title")
      .eq("subject", "biblical-stories")
      .order("created_at", { ascending: false })
      .limit(40);
    const avoidTitles = (recent || []).map((r: any) => r.title);

    const systemPrompt = `You are a master biblical storyteller writing for "Hagion University - Biblical Stories".
Your task: retell ONE real story directly from the canonical Christian Bible (Old or New Testament) as a VIVID NOVEL SCENE — as if the reader were standing inside the moment. Sensory, raw, unflinching. Smell the dust. Hear the bronze. See the blood, the tears, the sky. Do NOT sanitize, moralize early, or add modern commentary inside the narrative. Let the scripture's own weight do the work.

Style: Cormac McCarthy meets historical biblical fiction — deliberate, weighted prose; short hammer sentences mixed with long flowing ones; concrete physical detail; no anachronisms; no invented theology; every detail consistent with the biblical text and ancient Near East / first-century Roman world.

The story MUST be drawn faithfully from a specific Bible passage. Use real names, real places, real chronology. You may dramatize internal thoughts and sensory detail, but never contradict Scripture.

Return ONLY a JSON object — no preamble, no markdown fences:
{
  "title": "5-9 word evocative scene title (not the chapter name)",
  "era": "Short era line, e.g. 'c. 1446 BC — Sinai' or 'c. AD 33 — Jerusalem'",
  "theme": "ONE word from: Faith, Courage, Mercy, Judgment, Love, Sacrifice, Repentance, Obedience, Wisdom, Suffering, Deliverance, Hope",
  "scripture_ref": "Book Chapter:Verses (e.g. '1 Samuel 17:1-58')",
  "scene_setting": "150-220 word opening that drops the reader into the place. Sky, ground, smell, sound, who is there. No exposition dumps.",
  "scene_action": "500-750 word vivid novelistic retelling of the actual biblical events. Dialogue when Scripture gives it. Physical, kinetic, unflinching. Stay faithful to the text.",
  "scene_aftermath": "200-300 word closing of what happens immediately after — the silence, the bodies, the witnesses, the changed world.",
  "moral_takeaway": "One sharp piercing sentence of the eternal truth this scene reveals."
}

Hard rules:
- Real Bible story only — no apocrypha, no extra-biblical legends.
- No emoji. No markdown inside string fields. Plain prose.
- Never add a modern devotional voice inside scene_action — the moral lives only in moral_takeaway.`;

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
          { role: "user", content: `Produce ONE new biblical scene now. Avoid these titles already used: ${JSON.stringify(avoidTitles)}.` },
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
    if (!jsonMatch) throw new Error("Could not extract JSON from AI response");
    const s = JSON.parse(jsonMatch[0]);

    const required = ["title","era","theme","scripture_ref","scene_setting","scene_action","scene_aftermath","moral_takeaway"];
    for (const k of required) {
      if (!s[k] || typeof s[k] !== "string") throw new Error(`Missing field: ${k}`);
    }

    // Map to existing daily_wisdom_stories schema:
    //   law_statement     -> scripture_ref (shown as small ref under era)
    //   law_transgression -> scene_setting
    //   law_observance    -> scene_action
    //   law_interpretation-> scene_aftermath
    //   content           -> full novel (fallback / share)
    const fullContent = `${s.scene_setting}\n\n${s.scene_action}\n\n${s.scene_aftermath}`;

    const { data: insertedStory, error: insertError } = await supabase
      .from("daily_wisdom_stories")
      .insert({
        title: s.title,
        content: fullContent,
        theme: s.theme,
        moral_takeaway: s.moral_takeaway,
        era: s.era,
        subject: "biblical-stories",
        law_statement: s.scripture_ref,
        law_transgression: s.scene_setting,
        law_observance: s.scene_action,
        law_interpretation: s.scene_aftermath,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      throw insertError;
    }

    console.log("Biblical story created:", insertedStory.id, "-", insertedStory.title);

    return new Response(
      JSON.stringify({ success: true, story: insertedStory }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-biblical-story:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
