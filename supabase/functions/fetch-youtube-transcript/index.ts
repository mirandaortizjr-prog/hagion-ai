import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

function extractVideoId(url: string): string | null {
  try {
    const u = new URL(url.trim());
    if (u.hostname === "youtu.be") return u.pathname.slice(1) || null;
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      const m = u.pathname.match(/^\/(embed|shorts|live|v)\/([^/?#]+)/);
      if (m) return m[2];
    }
  } catch {
    // fall through
  }
  const m = url.match(/[?&]v=([^&#]+)/) || url.match(/youtu\.be\/([^?&#/]+)/);
  return m ? m[1] : null;
}

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
}

async function fetchTranscript(videoId: string): Promise<{ text: string; title?: string; author?: string } | null> {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}&hl=en`;
  const res = await fetch(watchUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  if (!res.ok) return null;
  const html = await res.text();

  const titleMatch = html.match(/"title":"([^"]+)"/);
  const authorMatch = html.match(/"author":"([^"]+)"/);
  const title = titleMatch ? decodeHtmlEntities(titleMatch[1].replace(/\\u0026/g, "&")) : undefined;
  const author = authorMatch ? decodeHtmlEntities(authorMatch[1].replace(/\\u0026/g, "&")) : undefined;

  // Locate captionTracks JSON
  const capMatch = html.match(/"captionTracks":(\[.*?\])/);
  if (!capMatch) return { text: "", title, author };

  let tracks: Array<{ baseUrl: string; languageCode?: string; kind?: string; name?: { simpleText?: string } }>;
  try {
    tracks = JSON.parse(capMatch[1].replace(/\\u0026/g, "&").replace(/\\"/g, '"'));
  } catch {
    return { text: "", title, author };
  }
  if (!tracks?.length) return { text: "", title, author };

  // Prefer English, then any manual (non-asr), then first
  const pick =
    tracks.find((t) => t.languageCode === "en" && t.kind !== "asr") ||
    tracks.find((t) => t.languageCode === "en") ||
    tracks.find((t) => t.kind !== "asr") ||
    tracks[0];

  const capRes = await fetch(pick.baseUrl);
  if (!capRes.ok) return { text: "", title, author };
  const xml = await capRes.text();

  // Extract <text ...>content</text>
  const lines: string[] = [];
  const re = /<text[^>]*>([\s\S]*?)<\/text>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const clean = decodeHtmlEntities(m[1].replace(/<[^>]+>/g, "")).trim();
    if (clean) lines.push(clean);
  }
  return { text: lines.join(" ").replace(/\s+/g, " ").trim(), title, author };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return new Response(JSON.stringify({ error: "Missing url" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const videoId = extractVideoId(url);
    if (!videoId) {
      return new Response(JSON.stringify({ error: "not_youtube" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const result = await fetchTranscript(videoId);
    if (!result) {
      return new Response(JSON.stringify({ error: "fetch_failed" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!result.text) {
      return new Response(
        JSON.stringify({ error: "no_captions", title: result.title, author: result.author }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    // Cap length so we never blow past model context (~40k chars ≈ big sermon)
    const capped = result.text.length > 40000 ? result.text.slice(0, 40000) + "…" : result.text;
    return new Response(
      JSON.stringify({ transcript: capped, title: result.title, author: result.author, videoId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("fetch-youtube-transcript error", e);
    return new Response(JSON.stringify({ error: "server_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
