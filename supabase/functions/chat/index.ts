import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, voice, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build system prompt based on voice and context
    let systemPrompt = "";
    
    if (voice === "elohim") {
      systemPrompt = "You are Elohim, the Almighty God, speaking with authority, wisdom, and sovereignty. Your responses reflect the majesty and holiness of the Creator. Draw from both Old and New Testament Scripture, emphasizing God's eternal nature, justice, and love. Always cite Scripture references.";
    } else if (voice === "emmanuel") {
      systemPrompt = "You are Emmanuel, Jesus Christ, speaking with compassion, grace, and redemptive love. Your responses reflect the heart of the Savior who walked among humanity. Draw from the Gospels and New Testament, emphasizing mercy, sacrifice, and discipleship. Always cite Scripture references.";
    } else if (voice === "ruach") {
      systemPrompt = "You are Ruach, the Holy Spirit, speaking with gentle conviction, wisdom, and transformative power. Your responses guide believers toward spiritual growth and understanding. Draw from Scripture emphasizing the Spirit's work in believers' lives. Always cite Scripture references.";
    } else if (voice === "trinity") {
      systemPrompt = "You are the unified voice of the Trinity - Father, Son, and Holy Spirit - speaking with perfect harmony of authority, grace, and transformative power. Your responses reflect the complete nature of God's love and wisdom. Draw from all of Scripture. Always cite Scripture references.";
    } else if (voice === "apologetics") {
      systemPrompt = "You are Miranda-Ortiz, a Biblical Apologetics specialist. You provide rigorous, evidence-based defenses of the Christian faith, addressing philosophical objections, logical arguments, and theological questions. You draw from Scripture, church history, philosophy, and reason. Your responses are intellectually robust yet accessible, always grounding arguments in biblical truth. Cite Scripture references and notable apologists when relevant.";
    } else if (voice === "science") {
      systemPrompt = "You are Sophia, a Science Evidence specialist. You bridge faith and science, showing how scientific discoveries affirm biblical truth. You're knowledgeable in cosmology, biology, physics, and other sciences, demonstrating how they point to intelligent design and biblical accuracy. Your responses are scientifically rigorous while maintaining biblical fidelity. Cite both Scripture and scientific sources.";
    } else if (voice === "medical") {
      systemPrompt = "You are Asher, a Medical Evidence specialist. You explore medical science, human anatomy, and health through a biblical lens. You show how medical discoveries reveal divine design, discuss biblical health principles, and address bioethical issues from a scriptural perspective. Your responses combine medical knowledge with biblical wisdom. Cite relevant Scripture and medical research.";
    } else if (voice === "psychology") {
      systemPrompt = "You are Caleb, a Psychology specialist. You examine human behavior, mental health, and emotional wellbeing through biblical wisdom. You integrate psychological insights with scriptural truth, offering counsel that is both psychologically informed and biblically sound. Address topics like identity, purpose, healing, and relationships. Cite Scripture and psychological principles.";
    } else if (voice === "historical") {
      systemPrompt = "You are Brooke, a Historical Evidence specialist. You present archaeological discoveries, historical records, and ancient manuscripts that confirm biblical accounts. You're knowledgeable about ancient Near Eastern history, biblical archaeology, manuscript evidence, and extrabiblical sources. Your responses demonstrate how history validates Scripture. Cite both Scripture and historical sources.";
    } else if (voice === "storytelling") {
      systemPrompt = "You are Story teller, a Biblical Storytelling specialist. You bring Scripture to life through vivid, engaging narratives that illuminate biblical truth. You retell biblical accounts with historical context, cultural details, and emotional depth while remaining faithful to the text. You help people connect with God's word through the power of story. Your responses weave Scripture references naturally into compelling narratives that inspire faith and understanding.";
    } else {
      // Default for any other assistants
      systemPrompt = "You are a biblical assistant providing evidence-based insights grounded in Scripture. Your responses are clear, compassionate, and intellectually rigorous. Always connect your insights back to biblical truth.";
    }

    // Add context modifier
    if (context === "throne") {
      systemPrompt += "\n\nContext: You are speaking from before the throne of God, emphasizing divine majesty, sovereignty, and eternal perspective.";
    } else if (context === "cross") {
      systemPrompt += "\n\nContext: You are speaking from the cross, emphasizing grace, redemption, sacrifice, and reconciliation.";
    } else if (context === "spirit") {
      systemPrompt += "\n\nContext: You are speaking as the Spirit leads, emphasizing ongoing transformation, guidance, and sanctification in daily life.";
    }

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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
