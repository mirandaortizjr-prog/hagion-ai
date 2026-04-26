// Refines an assembled sermon: returns structured feedback + a polished rewrite.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { sermon, scriptureRef, title } = await req.json();

    if (!sermon || typeof sermon !== "string" || sermon.trim().length < 50) {
      return new Response(
        JSON.stringify({ error: "Sermon text is too short to refine." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a senior biblical scholar, expository preacher, and editor.
You analyze sermons with theological rigor (orthodox, historic Christian doctrine), check internal consistency between sections, and polish grammar and clarity — without diluting the preacher's voice or softening biblical truth.
Defend Christianity as exclusive truth where relevant; never affirm heresy or moralistic-therapeutic deism.
Return BOTH structured feedback AND a fully polished rewrite of the sermon.`;

    const userPrompt = `Sermon Title: ${title || "Untitled"}
Primary Scripture: ${scriptureRef || "Not specified"}

FULL SERMON DRAFT:
"""
${sermon}
"""

Analyze and respond using the provided tool. Be specific — quote phrases when noting issues.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-pro",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "refine_sermon",
                description: "Return structured sermon feedback and a polished rewrite.",
                parameters: {
                  type: "object",
                  properties: {
                    theological_review: {
                      type: "string",
                      description:
                        "Markdown analysis of biblical/theological soundness. Cite specific phrases and Scripture.",
                    },
                    consistency_review: {
                      type: "string",
                      description:
                        "Markdown analysis of internal consistency between intro, body, conclusion, and stated main point.",
                    },
                    grammar_clarity: {
                      type: "string",
                      description:
                        "Markdown notes on grammar, clarity, and flow issues with concrete fixes.",
                    },
                    advice: {
                      type: "string",
                      description:
                        "Markdown advice on delivery, illustrations, application, and overall preaching impact.",
                    },
                    polished_sermon: {
                      type: "string",
                      description:
                        "A complete, polished rewrite of the sermon preserving the preacher's voice and main points. Use clear paragraphs and headings.",
                    },
                  },
                  required: [
                    "theological_review",
                    "consistency_review",
                    "grammar_clarity",
                    "advice",
                    "polished_sermon",
                  ],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "refine_sermon" } },
        }),
      },
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits in workspace settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "No structured response from AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("refine-sermon error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
