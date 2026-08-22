export interface GithubRepoInfo {
  owner: string;
  repo: string;
  description: string;
  stars: number;
  language: string;
  topics: string[];
}

export interface RepoTreeItem {
  path: string;
  type: 'blob' | 'tree';
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const headers: HeadersInit = {
  Accept: 'application/vnd.github.v3+json',
};

if (GITHUB_TOKEN) {
  headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
}

export async function fetchRepoMetadata(owner: string, repo: string): Promise<GithubRepoInfo | null> {
  try {
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
  } catch (error) {
    console.error('Error fetching repo metadata:', error);
    return null;
  }
}

export async function fetchRepoTree(owner: string, repo: string, defaultBranch: string = 'main'): Promise<RepoTreeItem[]> {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`, { headers });
    if (!res.ok) {
      // fallback to master
      if (defaultBranch === 'main') {
        return fetchRepoTree(owner, repo, 'master');
      }
      return [];
    }
    const data = await res.json();
    return (data.tree || []).map((item: any) => ({
      path: item.path,
      type: item.type,
    }));
  } catch (error) {
    console.error('Error fetching repo tree:', error);
    return [];
  }
}

export async function fetchReadme(owner: string, repo: string): Promise<string> {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers });
    if (!res.ok) return '';
    const data = await res.json();
    if (data.content) {
      // Content is base64 encoded
      return Buffer.from(data.content, 'base64').toString('utf-8');
    }
    return '';
  } catch (error) {
    console.error('Error fetching readme:', error);
    return '';
  }
}
