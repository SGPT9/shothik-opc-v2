import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  createRoomShareConfig,
  createPlotBranch,
  mergePlotBranch,
  generateAuthorshipCertificate,
  createResumableUploadTicket,
  getPodcastFeedUrl,
} from '../writing-studio.service';

vi.mock('axios', () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    defaults: { baseURL: 'https://api.shothik.test' },
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };
  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
      isAxiosError: vi.fn(),
    },
  };
});

describe('WritingStudio DeepTech Service APIs', () => {
  let mockClient: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockClient = (axios.create as any)();
  });

  it('createRoomShareConfig posts to share endpoint with accessMode', async () => {
    const mockData = {
      projectId: 'proj-123',
      accessMode: 'passcode',
      shareToken: 'tok-abc',
      passcode: '4829',
      roomUrl: 'https://shothik.ai/studio/join/tok-abc',
    };
    mockClient.post.mockResolvedValueOnce({ data: mockData });

    const result = await createRoomShareConfig('proj-123', 'passcode', '4829');
    expect(mockClient.post).toHaveBeenCalledWith('/api/v1/projects/proj-123/share', {
      accessMode: 'passcode',
      passcode: '4829',
    });
    expect(result).toEqual(mockData);
  });

  it('createPlotBranch posts branch creation payload', async () => {
    const mockBranch = {
      id: 'branch-alt-1',
      parentProjectId: 'proj-123',
      branchName: 'Alternative Ending',
      lineageRootId: 'proj-123',
    };
    mockClient.post.mockResolvedValueOnce({ data: mockBranch });

    const result = await createPlotBranch('proj-123', 'Alternative Ending');
    expect(mockClient.post).toHaveBeenCalledWith('/api/v1/projects/proj-123/branches', {
      branchName: 'Alternative Ending',
    });
    expect(result.branchName).toBe('Alternative Ending');
  });

  it('mergePlotBranch posts to merge endpoint and returns diff summary', async () => {
    const mockMergeResult = {
      success: true,
      mergedContent: 'Merged chapter content',
      conflictCount: 0,
      diffSummary: { added: 12, removed: 4, unmodified: 150 },
    };
    mockClient.post.mockResolvedValueOnce({ data: mockMergeResult });

    const result = await mergePlotBranch('proj-123', 'branch-alt-1');
    expect(mockClient.post).toHaveBeenCalledWith('/api/v1/projects/proj-123/branches/branch-alt-1/merge');
    expect(result.conflictCount).toBe(0);
    expect(result.diffSummary.added).toBe(12);
  });

  it('generateAuthorshipCertificate returns immutable crypto certificate', async () => {
    const mockCert = {
      certificateId: 'cert-sha-99',
      projectId: 'proj-123',
      authorName: 'Professor Rahman',
      authorEmail: 'rahman@du.ac.bd',
      title: 'Bengali Linguistics in Modern AI',
      merkleRoot: '0xabc123...',
      signature: 'sig-ecdsa-ed25519...',
      issuedAt: '2026-10-31T03:00:00.000Z',
      status: 'verified',
    };
    mockClient.post.mockResolvedValueOnce({ data: mockCert });

    const result = await generateAuthorshipCertificate('proj-123', {
      name: 'Professor Rahman',
      email: 'rahman@du.ac.bd',
      title: 'Bengali Linguistics in Modern AI',
    });
    expect(mockClient.post).toHaveBeenCalledWith('/api/v1/projects/proj-123/authorship-certificate', {
      name: 'Professor Rahman',
      email: 'rahman@du.ac.bd',
      title: 'Bengali Linguistics in Modern AI',
    });
    expect(result.status).toBe('verified');
  });

  it('createResumableUploadTicket requests a chunked TUS session', async () => {
    const mockSession = {
      success: true,
      sessionId: 'tus-session-42',
      uploadUrl: 'https://supabase.shothik.internal/storage/v1/upload/resumable/tus-session-42',
      chunkSize: 6291456,
      bucket: 'academic-manuscripts',
      filename: 'thesis-final.pdf',
      expiresAt: '2026-11-01T03:00:00.000Z',
    };
    mockClient.post.mockResolvedValueOnce({ data: mockSession });

    const result = await createResumableUploadTicket({
      bucket: 'academic-manuscripts',
      filename: 'thesis-final.pdf',
      contentType: 'application/pdf',
      sizeBytes: 45000000,
    });
    expect(mockClient.post).toHaveBeenCalledWith('/api/v1/storage/resumable-session', {
      bucket: 'academic-manuscripts',
      filename: 'thesis-final.pdf',
      contentType: 'application/pdf',
      sizeBytes: 45000000,
    });
    expect(result.sessionId).toBe('tus-session-42');
  });

  it('getPodcastFeedUrl constructs valid XML endpoint', () => {
    const feedUrl = getPodcastFeedUrl('proj-123');
    expect(feedUrl).toContain('/api/v1/podcasts/proj-123/feed.xml');
  });
});
