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

async function fetchRepoTree(owner: string, repo: string, defaultBranch = 'main') {
  const headers = new Headers({ 'Accept': 'application/vnd.github.v3+json' });
  if (GITHUB_TOKEN) headers.set('Authorization', `Bearer ${GITHUB_TOKEN}`);
  
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`, { headers });
  if (!res.ok) {
    if (defaultBranch === 'main') return fetchRepoTree(owner, repo, 'master');
    return [];
  }
  const data = await res.json();
  return (data.tree || []).map((item: any) => ({
    path: item.path,
    type: item.type,
  }));
}

async function fetchReadme(owner: string, repo: string) {
  const headers = new Headers({ 'Accept': 'application/vnd.github.v3+json' });
  if (GITHUB_TOKEN) headers.set('Authorization', `Bearer ${GITHUB_TOKEN}`);
  
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers });
  if (!res.ok) return '';
  const data = await res.json();
  if (data.content) {
    // atob is available in Deno
    return atob(data.content);
  }
  return '';
}

serve(async (req) => {
  // Handle CORS preflight requests
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
    const { data: cachedPrompts } = await insforgeClient
      .from('prompts')
      .select('synthetic_prompt')
      .eq('repo_owner', owner)
      .eq('repo_name', repo)
      .order('created_at', { ascending: false })
      .limit(1);

    if (cachedPrompts && cachedPrompts.length > 0) {
      return new Response(JSON.stringify({ 
        prompt: cachedPrompts[0].synthetic_prompt, 
        repo: `${owner}/${repo}`,
        cached: true 
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const [repoInfo, tree] = await Promise.all([
      fetchRepoMetadata(owner, repo),
      fetchRepoTree(owner, repo)
    ]);

    if (!repoInfo) {
      return new Response(JSON.stringify({ error: 'Repository not found or API rate limit exceeded' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const readme = await fetchReadme(owner, repo);

    // AI logic
    if (!OPENROUTER_API_KEY) {
      return new Response(JSON.stringify({ error: 'OPENROUTER_API_KEY is not set in environment.' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const interestingFiles = tree
      .filter((item: any) => !item.path.includes('node_modules/') && !item.path.includes('.git/'))
      .map((item: any) => item.path)
      .slice(0, 150)
      .join('\n');
      
    const truncatedReadme = readme.length > 20000 ? readme.substring(0, 20000) + '\n...[truncated]' : readme;

    const systemPrompt = `You are an expert AI prompt engineer. Your task is to "reverse engineer" a given GitHub repository and write the highly detailed, synthetic prompt that a user would have used to ask an AI coding assistant (like Claude or Cursor) to build this exact project from scratch.

Output ONLY the prompt itself, without any introductory or concluding text. Make the prompt highly actionable, detailed, and structured. It should cover the tech stack, main features, and architecture inferred from the repository.

Context Provided:
- Repository Name: ${repoInfo.owner}/${repoInfo.repo}
- Description: ${repoInfo.description}
- Primary Language: ${repoInfo.language}
- Topics: ${repoInfo.topics.join(', ')}

File Structure (Root):
${interestingFiles}

README:
${truncatedReadme}`;

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'GitHub Prompt Reverse Engineer',
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
      return new Response(JSON.stringify({ error: 'Failed to generate prompt via OpenRouter API.', details: errorText }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let fullText = '';
    let buffer = '';
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split('\n');
        // Keep the last incomplete line in the buffer
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
              // ignore parse errors for partial chunks (shouldn't happen with proper line splitting)
            }
          }
        }
      },
      async flush() {
        if (authHeader) {
          const { data: userResp } = await insforgeClient.auth.getUser(authHeader.replace('Bearer ', ''));
          const userId = userResp?.user?.id;
          
          if (userId) {
            await insforgeClient.from('prompts').insert([{
              user_id: userId,
              repo_owner: owner,
              repo_name: repo,
              synthetic_prompt: fullText
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
