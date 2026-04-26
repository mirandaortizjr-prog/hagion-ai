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
      .eq("subject", "martyrs")
      .order("created_at", { ascending: false })
      .limit(60);
    const avoidTitles = (recent || []).map((r: any) => r.title);

    const systemPrompt = `You are a master Christian historian and storyteller writing for "Hagion University - Martyrs of the Faith".
Your task: retell ONE real, historically documented martyrdom of a Christian believer — from the early Church, through the Reformation, the missionary centuries, the Soviet and Maoist purges, all the way to TODAY (modern martyrs in places like Nigeria, North Korea, China, Iran, Pakistan, India, Sudan, the Middle East). Drop the reader inside the moment as a vivid novel scene. Sensory, raw, unflinching. The blood. The prayers. The sky over the arena, the prison cell, the village, the road. Do NOT sanitize. Do NOT add modern commentary inside the narrative.

Style: Cormac McCarthy meets serious historical reporting — deliberate weighted prose, short hammer sentences mixed with long flowing ones, concrete physical detail, no anachronisms, no invented theology. Every detail must be consistent with the historical record. You may dramatize internal thoughts, sensory detail, and known last words, but never invent facts that contradict the history.

The martyr MUST be real and identifiable — Stephen, Polycarp, Perpetua, Felicitas, Ignatius of Antioch, Justin Martyr, Lawrence of Rome, Agnes, Cyprian, Boniface, Jan Hus, William Tyndale, Hugh Latimer, Nicholas Ridley, Thomas Cranmer, Edmund Campion, Margaret Clitherow, John & Betty Stam, Jim Elliot and the Auca five, Cassie Bernall, the Coptic 21 in Libya, Shahbaz Bhatti, Asia Bibi (witness, not yet martyred — skip), Wang Zhiming, Watchman Nee (died in prison), Richard Wurmbrand (skip - survived), the Armenian genocide martyrs, Maximilian Kolbe, Dietrich Bonhoeffer, Telemachus, Sadhu Sundar Singh's converts, Graham Staines and his sons, the Nigerian martyrs of Boko Haram and Fulani attacks, North Korean believers, etc. Choose only those who actually died for Christ.

Return ONLY a JSON object — no preamble, no markdown fences:
{
  "title": "5-9 word evocative scene title (not just the name)",
  "era": "Short era + place line, e.g. 'AD 155 — Smyrna' or 'February 2015 — Libyan coast'",
  "theme": "ONE word from: Faith, Courage, Mercy, Endurance, Love, Sacrifice, Witness, Obedience, Hope, Suffering, Forgiveness, Steadfastness",
  "scripture_ref": "The martyr's name and one short anchoring Scripture, e.g. 'Polycarp of Smyrna · Revelation 2:10'",
  "scene_setting": "150-220 word opening that drops the reader into the place. Sky, ground, smell, sound, who is there, what is about to happen. No exposition dumps.",
  "scene_action": "500-750 word vivid novelistic retelling of the actual martyrdom — the arrest, trial, confession, refusal to recant, execution. Use known last words verbatim where history records them. Physical, kinetic, unflinching. Stay faithful to the historical record.",
  "scene_aftermath": "200-300 word closing of what happened immediately after — the silence, the body, the witnesses, what the Church remembered, how the death bore fruit.",
  "moral_takeaway": "One sharp piercing sentence of the eternal truth this martyrdom reveals — about Christ, the cost of discipleship, or the unbreakable Church."
}

Hard rules:
- Real historical martyr only. No legends without historical basis. No fictional characters.
- No emoji. No markdown inside string fields. Plain prose.
- Never add a modern devotional voice inside scene_action — the truth lives only in moral_takeaway.
- Mix eras: do not give only ancient Romans. Include medieval, Reformation, missionary-era, 20th century, and 21st century martyrs.`;

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
          { role: "user", content: `Produce ONE new martyr scene now. Avoid these titles already used: ${JSON.stringify(avoidTitles)}.` },
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

    const fullContent = `${s.scene_setting}\n\n${s.scene_action}\n\n${s.scene_aftermath}`;

    const { data: insertedStory, error: insertError } = await supabase
      .from("daily_wisdom_stories")
      .insert({
        title: s.title,
        content: fullContent,
        theme: s.theme,
        moral_takeaway: s.moral_takeaway,
        era: s.era,
        subject: "martyrs",
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

    console.log("Martyr story created:", insertedStory.id, "-", insertedStory.title);

    return new Response(
      JSON.stringify({ success: true, story: insertedStory }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-martyr-story:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
