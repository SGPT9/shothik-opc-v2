import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { DokployClient, getDokployClient } from '../dokploy/dokploy-client';

describe('DokployClient', () => {
  let client: DokployClient;

  beforeEach(() => {
    process.env.DOKPLOY_API_KEY = 'test-key';
    client = getDokployClient();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('correctly creates singleton client instance', () => {
    const anotherClient = getDokployClient();
    expect(client).toBe(anotherClient);
  });

  it('submits correctly structured app creation request', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ uuid: 'app-123', domain: 'test.shothik.app' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await client.createApplication({
      name: 'TestApp',
      repository: 'ahsanhab919-ux/test-repo',
      branch: 'main',
      domain: 'test.shothik.app',
      envVariables: { STRIPE_KEY: 'sk_test_123' },
    });

    expect(result.applicationUuid).toBe('app-123');
    expect(result.cleanUrl).toBe('test.shothik.app');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [calledUrl, calledOptions] = mockFetch.mock.calls[0];
    expect(calledUrl).toContain('/api/application.create');
    expect(calledOptions.method).toBe('POST');
    expect(calledOptions.headers).toHaveProperty('x-api-key', 'test-key');
    
    const body = JSON.parse(calledOptions.body);
    expect(body.name).toBe('TestApp');
    expect(body.repository).toBe('ahsanhab919-ux/test-repo');
    expect(body.env).toContainEqual({ key: 'STRIPE_KEY', value: 'sk_test_123' });
  });

  it('triggers application deployment correctly', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, deploymentId: 'dep-456' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await client.deployApplication('app-123');

    expect(result.success).toBe(true);
    expect(result.deploymentId).toBe('dep-456');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [calledUrl, calledOptions] = mockFetch.mock.calls[0];
    expect(calledUrl).toContain('/api/application.deploy');
    expect(calledOptions.method).toBe('POST');
    expect(JSON.parse(calledOptions.body).uuid).toBe('app-123');
  });

  it('throws error if API returns bad response status', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => 'Invalid repository name',
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(client.deployApplication('app-123')).rejects.toThrow(
      'Dokploy API Error (400): Invalid repository name'
    );
  });
});
