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

    const systemPrompt = `You are a master storyteller crafting daily wisdom stories for Hagion University. Create original fables, parables, or allegories that:

- Are rooted in biblical reasoning, moral clarity, and spiritual insight (but NOT direct Scripture quotes)
- Illuminate moral and ethical truths
- Cultivate wisdom, discernment, and integrity
- Inspire logical reflection and spiritual resonance
- Encourage virtue, humility, courage, and compassion
- Use metaphor and narrative to point toward eternal principles

Each story should:
- Be 2-3 minutes to read (400-600 words)
- Have a clear beginning, middle, and end
- Include vivid characters and settings
- End with a thought-provoking insight
- Be tagged with ONE primary theme

Return your response in this JSON format:
{
  "title": "Story Title",
  "content": "The full story text with paragraphs separated by \\n\\n",
  "theme": "One of: Justice, Mercy, Truth, Perseverance, Humility, Discernment, Courage, Compassion, Integrity, Faith",
  "moral_takeaway": "A brief reflection or question for the reader"
}`;

    console.log("Generating new wisdom story...");

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
          { role: "user", content: "Create a new wisdom story for today." },
        ],
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate story");
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;
    
    console.log("Raw AI response:", generatedText);

    // Parse the JSON from the response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not extract JSON from AI response");
    }

    const storyData = JSON.parse(jsonMatch[0]);

    // Insert into database
    const { data: insertedStory, error: insertError } = await supabase
      .from("daily_wisdom_stories")
      .insert({
        title: storyData.title,
        content: storyData.content,
        theme: storyData.theme,
        moral_takeaway: storyData.moral_takeaway,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      throw insertError;
    }

    console.log("Story created successfully:", insertedStory.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        story: insertedStory 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-daily-wisdom:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
