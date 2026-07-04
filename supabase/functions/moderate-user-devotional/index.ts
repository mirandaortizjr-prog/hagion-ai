import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const SYSTEM = `You are a rigorous evaluator of Christian devotionals. You defend orthodox biblical Christianity (Trinitarian, sola Scriptura, salvation by grace through faith in Jesus Christ). You reject prosperity gospel, universalism, syncretism, works-based salvation, heresy, and unsound exegesis.

Evaluate the submitted devotional in TWO passes:

1) DOCTRINAL (weight 70): Is Scripture cited accurately? Is the interpretation sound? Does it align with historic orthodox Christian teaching? Are there logical fallacies, heresies, or non-biblical claims?

2) QUALITY (weight 30): Is it coherent, complete (title + scripture + reflection + prayer all present and meaningful), not spammy/self-promotional/promotional, appropriate length?

Return JSON only:
{
  "verdict": "approved" | "needs_revision" | "rejected",
  "score": 0-100,
  "doctrinal": { "pass": boolean, "notes": "..." },
  "quality": { "pass": boolean, "notes": "..." },
  "feedback": "actionable feedback for the author (empty if approved)"
}

Rules:
- "approved" only if doctrinal.pass AND quality.pass AND score >= 75
- "needs_revision" if fixable issues (minor exegetical drift, missing prayer, unclear tone) — give clear feedback
- "rejected" for heresy, prosperity gospel, promotional/spam, or content unrelated to Christian devotion`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { devotional_id } = await req.json();
    if (!devotional_id) {
      return new Response(JSON.stringify({ error: 'devotional_id required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: dev, error } = await admin.from('user_devotionals').select('*').eq('id', devotional_id).maybeSingle();
    if (error || !dev) {
      return new Response(JSON.stringify({ error: 'devotional not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const payload = `TITLE: ${dev.title}\nSCRIPTURE: ${dev.scripture_ref}\nSCRIPTURE TEXT: ${dev.scripture_text || '(not provided)'}\nREFLECTION:\n${dev.reflection}\nPRAYER:\n${dev.prayer}\nTAGS: ${(dev.tags || []).join(', ')}\nLANGUAGE: ${dev.language || 'en'}`;

    const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: payload },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (aiRes.status === 429) {
      return new Response(JSON.stringify({ error: 'rate_limited' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (aiRes.status === 402) {
      return new Response(JSON.stringify({ error: 'credits_exhausted' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (!aiRes.ok) {
      const t = await aiRes.text();
      return new Response(JSON.stringify({ error: 'ai_error', detail: t }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const aiJson = await aiRes.json();
    const raw = aiJson?.choices?.[0]?.message?.content ?? '{}';
    let verdict: any;
    try { verdict = JSON.parse(raw); } catch { verdict = { verdict: 'needs_revision', score: 0, feedback: 'Moderator could not parse result. Please resubmit.' }; }

    const status = verdict.verdict === 'approved' ? 'approved'
      : verdict.verdict === 'rejected' ? 'rejected'
      : 'needs_revision';

    await admin.from('user_devotionals').update({
      status,
      moderation_feedback: verdict,
      moderation_score: typeof verdict.score === 'number' ? verdict.score : null,
    }).eq('id', devotional_id);

    return new Response(JSON.stringify({ status, verdict }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
