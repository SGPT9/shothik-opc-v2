import { vi } from 'vitest';

// Define mocks before importing tested files to guarantee correct Vitest hoisting
vi.mock('child_process', () => {
  const m = {
    execSync: vi.fn(),
  };
  return {
    ...m,
    default: m,
  };
});

vi.mock('fs', () => {
  const m = {
    existsSync: vi.fn().mockReturnValue(true),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
    rmSync: vi.fn(),
  };
  return {
    ...m,
    default: m,
  };
});

import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { GitWorkspaceClient, getGitWorkspaceClient } from '../git/git-workspace-client';
import { execSync } from 'child_process';

describe('GitWorkspaceClient', () => {
  let client: GitWorkspaceClient;

  beforeEach(() => {
    process.env.GITHUB_TOKEN = 'mock-github-token';
    client = new GitWorkspaceClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates singleton client instance', () => {
    const instance1 = getGitWorkspaceClient();
    const instance2 = getGitWorkspaceClient();
    expect(instance1).toBe(instance2);
  });

  it('runs git commands correctly when preparing workspace', async () => {
    const mockFiles = [
      { relativePath: 'index.html', content: '<h1>Test</h1>' },
      { relativePath: 'src/main.ts', content: 'console.log("hi");' },
    ];

    const result = await client.prepareAndPushWorkspace('run-12345678', mockFiles);

    expect(result.branchName).toBe('deploys/run-run-1234');
    expect(execSync).toHaveBeenCalled();
    
    // Checks that configuration, commit, and push were run
    const commandsCalled = vi.mocked(execSync).mock.calls.map(call => call[0] as string);
    expect(commandsCalled.some(cmd => cmd.includes('git clone'))).toBe(true);
    expect(commandsCalled.some(cmd => cmd.includes('git checkout -b'))).toBe(true);
    expect(commandsCalled.some(cmd => cmd.includes('git commit -m'))).toBe(true);
    expect(commandsCalled.some(cmd => cmd.includes('git push origin'))).toBe(true);
  });

  it('gracefully triggers mock mode when GITHUB_TOKEN is missing', async () => {
    process.env.GITHUB_TOKEN = '';
    (client as any).githubToken = '';
    const result = await client.prepareAndPushWorkspace('run-12345678', []);
    
    expect(result.branchName).toBe('deploys/run-run-1234');
    expect(execSync).not.toHaveBeenCalled();
  });
});
