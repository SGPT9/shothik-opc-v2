import { GithubRepoInfo, RepoTreeItem } from './github';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function generateSyntheticPrompt(
  repoInfo: GithubRepoInfo,
  tree: RepoTreeItem[],
  readme: string
): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    return 'Error: OPENROUTER_API_KEY is not set. Please configure your environment variables.';
  }

  // Filter and limit tree to avoid massive token count
  const interestingFiles = tree
    .filter(item => !item.path.includes('node_modules/') && !item.path.includes('.git/'))
    .map(item => item.path)
    .slice(0, 150)
    .join('\n');
    
  // Truncate README if it's too long
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

  try {
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
        messages: [
          { role: 'user', content: systemPrompt }
        ]
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('OpenRouter API error:', errorText);
      return 'Error: Failed to generate prompt via OpenRouter API.';
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || 'Error: No content returned from LLM.';
  } catch (error) {
    console.error('Error calling OpenRouter:', error);
    return 'Error: Failed to connect to OpenRouter.';
  }
}
