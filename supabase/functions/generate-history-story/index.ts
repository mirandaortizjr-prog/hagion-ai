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

    // Pull recent history entries to (a) avoid duplicates and (b) advance the timeline forward.
    const { data: recent } = await supabase
      .from("daily_wisdom_stories")
      .select("title, era")
      .eq("subject", "history-christianity")
      .order("created_at", { ascending: false })
      .limit(80);

    const avoidTitles = (recent || []).map((r: any) => r.title);
    const recentEras = (recent || []).map((r: any) => r.era).filter(Boolean);

    const systemPrompt = `You are a careful Christian historian writing for "Hagion University - History of Christianity".
Your task: write ONE real, factual, chronological entry in the history of Christianity.

Coverage starts AFTER the apostolic age (after roughly AD 100) and runs forward through every era to the present day:
- Post-Apostolic Fathers and the persecuted early Church (c. 100–313)
- Constantine, the ecumenical councils, and the Christianized Empire (313–600)
- Early Medieval Church, missions to the barbarians, monasticism, the rise of the papacy (600–1054)
- The Great Schism, the Crusades, scholasticism, the high medieval Church (1054–1400)
- Pre-Reformation reformers, Renaissance, Reformation and Counter-Reformation (1400–1650)
- Puritans, Pietists, global missions, Great Awakenings (1650–1850)
- Modern missions, modernism vs. fundamentalism, Pentecostalism, world wars, communist persecution (1850–1970)
- Vatican II, the global South explosion, the underground Church in China, post-Christian West, today (1970–present)

Style: clear, sober, factual historical prose — like a serious popular history book (think Justo González, Bruce Shelley, Diarmaid MacCulloch). Plain narrative. No novelization, no invented dialogue, no dramatized inner thoughts. Concrete dates, names, places, councils, documents. Doctrinally honest, irenic, but unafraid to name heresies, schisms, and failures.

Topic must be REAL and historically documented — e.g. Ignatius of Antioch's letters, the Didache, Marcion and the canon, the persecution under Decius, the Edict of Milan, Council of Nicaea, Athanasius vs Arius, Augustine's conversion, Council of Chalcedon, Benedict and the Rule, the conversion of Clovis, Gregory the Great, the iconoclast controversy, the conversion of the Slavs, the Great Schism of 1054, the First Crusade, Anselm, Aquinas, Francis of Assisi, Wycliffe, Hus, Luther's 95 Theses, Zwingli, Calvin in Geneva, the Council of Trent, the Anabaptists, the Puritans, the Wesleys and the Methodist revival, the First Great Awakening, William Carey and modern missions, Hudson Taylor, the Azusa Street revival, the Confessing Church, Vatican II, the Lausanne Congress, the house-church movement in China, etc.

CHRONOLOGY RULE — VERY IMPORTANT:
Look at the most recent entries already written (their eras are listed below). Choose a NEW topic whose date moves the timeline FORWARD from where it currently sits, OR fills an obvious gap. Do not jump randomly across centuries. The goal is to build a coherent walk through Church history.

Return ONLY a JSON object — no preamble, no markdown fences:
{
  "title": "5-9 word clear historical title (event or figure)",
  "era": "Year or year range + place, e.g. 'AD 325 — Nicaea' or '1517 — Wittenberg'",
  "theme": "ONE word from: Doctrine, Mission, Reform, Persecution, Council, Revival, Schism, Translation, Monasticism, Apologetics, Worship, Witness",
  "scripture_ref": "Figure or event name and one anchoring Scripture, e.g. 'Council of Nicaea · John 1:1'",
  "scene_setting": "150-220 word historical context — what was happening in the Church and the world that led to this moment.",
  "scene_action": "500-750 word factual narrative of the event itself — what was decided, said, written, suffered, or built. Real names, real dates, real documents. No invented dialogue.",
  "scene_aftermath": "200-300 word account of the consequences — how this shaped Christian doctrine, worship, mission, or the wider Church.",
  "moral_takeaway": "One sober sentence on what this moment teaches the Church today."
}

Hard rules:
- Real, documented history only. No legend, no hagiographical embellishment, no invented quotes.
- No emoji. No markdown inside string fields. Plain prose.
- Honest about sin and failure (Crusader violence, slavery, abuses) without being cynical.
- Theologically orthodox in framing — Christ is Lord, Scripture is true, the Church is His.`;

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
          {
            role: "user",
            content: `Produce ONE new History of Christianity entry now.
Recent eras already covered (advance the timeline from these, do not repeat): ${JSON.stringify(recentEras.slice(0, 25))}.
Avoid these exact titles: ${JSON.stringify(avoidTitles)}.`,
          },
        ],
        temperature: 0.85,
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
        subject: "history-christianity",
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

    console.log("History story created:", insertedStory.id, "-", insertedStory.title);

    return new Response(
      JSON.stringify({ success: true, story: insertedStory }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-history-story:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
