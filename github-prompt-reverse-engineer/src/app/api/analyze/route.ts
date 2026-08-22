import { NextRequest, NextResponse } from 'next/server';
import { fetchRepoMetadata, fetchRepoTree, fetchReadme } from '@/lib/github';
import { generateSyntheticPrompt } from '@/lib/llm';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Parse URL or shorthand (e.g., "vercel/next.js" or "https://github.com/vercel/next.js")
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
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    if (!owner || !repo) {
      return NextResponse.json({ error: 'Could not parse owner and repo from URL' }, { status: 400 });
    }

    // Fetch data in parallel where possible
    const [repoInfo, tree] = await Promise.all([
      fetchRepoMetadata(owner, repo),
      fetchRepoTree(owner, repo)
    ]);

    if (!repoInfo) {
      return NextResponse.json({ error: 'Repository not found or API rate limit exceeded' }, { status: 404 });
    }

    // Readme fetch is sequential in case we want to use default branch from repo metadata in the future,
    // but here we can just fetch it directly
    const readme = await fetchReadme(owner, repo);

    // Generate prompt
    const generatedPrompt = await generateSyntheticPrompt(repoInfo, tree, readme);

    return NextResponse.json({ prompt: generatedPrompt, repo: `${owner}/${repo}` });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
