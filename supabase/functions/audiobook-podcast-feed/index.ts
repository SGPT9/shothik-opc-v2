// Supabase Edge Function: audiobook-podcast-feed
// Serves dynamic iTunes-compliant RSS 2.0 XML feeds with signed Supabase Storage URLs.
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const projectId = url.searchParams.get("projectId") || "proj-default";

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch project metadata
    const { data: project } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .maybeSingle();

    const title = project?.title || "Bengali Audiobook & Literary Narrations";
    const description = project?.description || "Autonomous episodic audio narration produced by Shothik Neural Voice AI.";
    const sections = Array.isArray(project?.sections) ? project.sections : [
      { id: "ch-1", title: "Chapter 1: The Quantum Horizon (Bengali Narration)", wordCount: 1500 },
      { id: "ch-2", title: "Chapter 2: Neural Horizons & Deep Currents", wordCount: 1800 },
    ];

    // Generate signed audio URLs from Supabase Storage bucket 'audiobooks'
    const items = await Promise.all(
      sections.map(async (sec: any, idx: number) => {
        const audioPath = `${projectId}/${sec.id || `ch-${idx + 1}`}.mp3`;
        const { data: signedData } = await supabase.storage
          .from("audiobooks")
          .createSignedUrl(audioPath, 86400 * 7);

        const enclosureUrl = signedData?.signedUrl || `https://shothik.ai/audio/preview/${sec.id}.mp3`;
        const durationSec = Math.max(180, Math.round((sec.wordCount || 1200) / 2.5));
        const pubDate = new Date(Date.now() - (sections.length - idx) * 86400000).toUTCString();

        return `
    <item>
      <title>${escapeXml(sec.title || `Chapter ${idx + 1}`)}</title>
      <description>${escapeXml(`Chapter ${idx + 1} audio narration (${sec.wordCount || 1200} words).`)}</description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="false">shothik-podcast-${projectId}-${sec.id || idx}</guid>
      <itunes:episode>${idx + 1}</itunes:episode>
      <itunes:duration>${durationSec}</itunes:duration>
      <enclosure url="${enclosureUrl}" length="${durationSec * 16000}" type="audio/mpeg" />
      <itunes:explicit>no</itunes:explicit>
    </item>`;
      })
    );

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>https://shothik.ai/writing-studio</link>
    <language>bn-BD</language>
    <copyright>© 2026 Shothik AI / Ekushey Authorship</copyright>
    <itunes:author>Shothik Neural Audio Studio</itunes:author>
    <description>${escapeXml(description)}</description>
    <itunes:summary>${escapeXml(description)}</itunes:summary>
    <itunes:category text="Arts"><itunes:category text="Books"/></itunes:category>
    <itunes:explicit>no</itunes:explicit>
    ${items.join("")}
  </channel>
</rss>`;

    return new Response(rssXml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=1800",
      },
      status: 200,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}
