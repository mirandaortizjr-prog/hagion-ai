import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON = Deno.env.get('SUPABASE_ANON_KEY')!;

const APPEAL_SYSTEM = `You are a senior reviewer performing a SECOND-OPINION appeal review of a Christian devotional that was previously flagged. You defend orthodox biblical Christianity (Trinitarian, sola Scriptura, salvation by grace through faith in Jesus Christ). You reject prosperity gospel, universalism, syncretism, works-based salvation, heresy, and unsound exegesis.

Read the PRIOR REVIEW notes and the AUTHOR'S APPEAL REASON, then re-evaluate the devotional FRESHLY and INDEPENDENTLY. Do not simply agree with the prior verdict. Overturn it if warranted; uphold it if the concerns remain valid.

Return JSON only:
{
  "verdict": "approved" | "needs_revision" | "rejected",
  "score": 0-100,
  "doctrinal": { "pass": boolean, "notes": "..." },
  "quality": { "pass": boolean, "notes": "..." },
  "feedback": "explanation for the author — clearly state whether the prior verdict was upheld or overturned, and why"
}

Rules:
- "approved" only if doctrinal.pass AND quality.pass AND score >= 75
- Be fair but rigorous — an appeal is not an automatic approval`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    // Auth: identify the caller
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const userClient = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: `Bearer ${token}` } } });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const uid = userData.user.id;

    const { devotional_id, appeal_reason } = await req.json();
    if (!devotional_id || !appeal_reason || typeof appeal_reason !== 'string' || appeal_reason.trim().length < 20) {
      return new Response(JSON.stringify({ error: 'appeal_reason must be at least 20 characters' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (appeal_reason.length > 1000) {
      return new Response(JSON.stringify({ error: 'appeal_reason too long' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: dev, error } = await admin.from('user_devotionals').select('*').eq('id', devotional_id).maybeSingle();
    if (error || !dev) {
      return new Response(JSON.stringify({ error: 'devotional not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (dev.author_id !== uid) {
      return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (dev.status === 'approved') {
      return new Response(JSON.stringify({ error: 'already_approved' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if ((dev.appeal_count || 0) >= 1) {
      return new Response(JSON.stringify({ error: 'appeal_limit_reached' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const priorFeedback = dev.moderation_feedback
      ? JSON.stringify(dev.moderation_feedback, null, 2)
      : '(no prior feedback recorded)';

    const payload = `PRIOR VERDICT: ${dev.status}
PRIOR REVIEW NOTES:
${priorFeedback}

AUTHOR'S APPEAL REASON:
${appeal_reason.trim()}

--- DEVOTIONAL UNDER APPEAL ---
TITLE: ${dev.title}
SCRIPTURE: ${dev.scripture_ref}
SCRIPTURE TEXT: ${dev.scripture_text || '(not provided)'}
REFLECTION:
${dev.reflection}
PRAYER:
${dev.prayer}
TAGS: ${(dev.tags || []).join(', ')}
LANGUAGE: ${dev.language || 'en'}`;

    const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: APPEAL_SYSTEM },
          { role: 'user', content: payload },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (aiRes.status === 429) return new Response(JSON.stringify({ error: 'rate_limited' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    if (aiRes.status === 402) return new Response(JSON.stringify({ error: 'credits_exhausted' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    if (!aiRes.ok) {
      const tx = await aiRes.text();
      return new Response(JSON.stringify({ error: 'ai_error', detail: tx }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const aiJson = await aiRes.json();
    const raw = aiJson?.choices?.[0]?.message?.content ?? '{}';
    let verdict: any;
    try { verdict = JSON.parse(raw); } catch { verdict = { verdict: 'needs_revision', score: 0, feedback: 'Appeal reviewer could not parse result.' }; }

    verdict._appeal = { reason: appeal_reason.trim(), prior_status: dev.status, reviewed_at: new Date().toISOString() };

    const status = verdict.verdict === 'approved' ? 'approved'
      : verdict.verdict === 'rejected' ? 'rejected'
      : 'needs_revision';

    await admin.from('user_devotionals').update({
      status,
      moderation_feedback: verdict,
      moderation_score: typeof verdict.score === 'number' ? verdict.score : null,
      appeal_count: (dev.appeal_count || 0) + 1,
      appealed_at: new Date().toISOString(),
    }).eq('id', devotional_id);

    return new Response(JSON.stringify({ status, verdict }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
