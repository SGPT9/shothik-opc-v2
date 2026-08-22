import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@insforge/sdk@latest';

const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY') || '';
const GITHUB_TOKEN = Deno.env.get('GITHUB_TOKEN') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchRepoMetadata(owner: string, repo: string) {
  const headers = new Headers({ 'Accept': 'application/vnd.github.v3+json' });
  if (GITHUB_TOKEN) headers.set('Authorization', `Bearer ${GITHUB_TOKEN}`);
  
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
  if (!res.ok) return null;
  const data = await res.json();
  return {
    owner: data.owner.login,
    repo: data.name,
    description: data.description || '',
    stars: data.stargazers_count,
    language: data.language || '',
    topics: data.topics || [],
  };
}

async function fetchIssuesAndPRs(owner: string, repo: string) {
  const headers = new Headers({ 'Accept': 'application/vnd.github.v3+json' });
  if (GITHUB_TOKEN) headers.set('Authorization', `Bearer ${GITHUB_TOKEN}`);
  
  // Fetch latest 30 open issues/PRs
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=30`, { headers });
  if (!res.ok) return [];
  const data = await res.json();
  return data.map((item: any) => ({
    number: item.number,
    title: item.title,
    state: item.state,
    is_pr: !!item.pull_request,
    comments: item.comments,
    body: (item.body || '').substring(0, 500) // Truncate long bodies
  }));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let owner = '';
    let repo = '';

    try {
      if (url.startsWith('http')) {
        const parsedUrl = new URL(url);
        const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
        if (pathParts.length >= 2) {
          owner = pathParts[0];
          repo = pathParts[1];
        }
      } else {
        const parts = url.split('/').filter(Boolean);
        if (parts.length >= 2) {
          owner = parts[0];
          repo = parts[1];
        }
      }
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid URL format' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (!owner || !repo) {
      return new Response(JSON.stringify({ error: 'Could not parse owner and repo from URL' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    const authHeader = req.headers.get('Authorization');
    const insforgeClient = createClient({
      baseUrl: Deno.env.get('INSFORGE_URL') || '',
      anonKey: Deno.env.get('INSFORGE_ANON_KEY') || '',
      global: {
        headers: authHeader ? { Authorization: authHeader } : {}
      }
    });

    // Check Cache
    const { data: cachedAnalyses } = await insforgeClient
      .from('issue_analyses')
      .select('analysis_content')
      .eq('repo_owner', owner)
      .eq('repo_name', repo)
      .order('created_at', { ascending: false })
      .limit(1);

    if (cachedAnalyses && cachedAnalyses.length > 0) {
      return new Response(JSON.stringify({ 
        analysis: cachedAnalyses[0].analysis_content, 
        repo: `${owner}/${repo}`,
        cached: true 
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const [repoInfo, issuesAndPRs] = await Promise.all([
      fetchRepoMetadata(owner, repo),
      fetchIssuesAndPRs(owner, repo)
    ]);

    if (!repoInfo) {
      return new Response(JSON.stringify({ error: 'Repository not found or API rate limit exceeded' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (!OPENROUTER_API_KEY) {
      return new Response(JSON.stringify({ error: 'OPENROUTER_API_KEY is not set in environment.' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const formattedIssues = issuesAndPRs.map((i: any) => 
      `#${i.number} [${i.is_pr ? 'PR' : 'Issue'}] [${i.state.toUpperCase()}] ${i.title} (Comments: ${i.comments})\n${i.body}`
    ).join('\n\n');

    const systemPrompt = `You are an expert technical analyst and developer advocate. 
Your task is to analyze the recent GitHub issues and pull requests of a repository and provide a high-level summary of the project's current state.

Output a beautifully formatted Markdown report that covers:
1. Current Project Focus: What are the main things being worked on right now?
2. Top Bugs & Pain Points: What are the recurring issues or most commented bugs?
3. Upcoming Features: What new features are being discussed or built in PRs?
4. Community Engagement: Are people actively discussing? 

Context Provided:
- Repository Name: ${repoInfo.owner}/${repoInfo.repo}
- Description: ${repoInfo.description}

Recent Issues & PRs:
${formattedIssues ? formattedIssues : "No recent issues or PRs found."}`;

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'GitHub Issues Analysis',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        stream: true,
        messages: [
          { role: 'user', content: systemPrompt }
        ]
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      return new Response(JSON.stringify({ error: 'Failed to generate analysis via OpenRouter API.', details: errorText }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let fullText = '';
    let buffer = '';
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.trim() === 'data: [DONE]') continue;
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              const content = data.choices[0]?.delta?.content || '';
              if (content) {
                fullText += content;
                controller.enqueue(encoder.encode(content));
              }
            } catch (e) {
              // ignore
            }
          }
        }
      },
      async flush() {
        if (authHeader) {
          const { data: userResp } = await insforgeClient.auth.getUser(authHeader.replace('Bearer ', ''));
          const userId = userResp?.user?.id;
          
          if (userId) {
            await insforgeClient.from('issue_analyses').insert([{
              user_id: userId,
              repo_owner: owner,
              repo_name: repo,
              analysis_content: fullText
            }]);
          }
        }
      }
    });

    return new Response(res.body!.pipeThrough(transformStream), { 
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/plain; charset=utf-8' 
      } 
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
