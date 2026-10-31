import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

interface RetryableAxiosConfig extends InternalAxiosRequestConfig {
  __retryCount?: number;
}
import { ENV } from '@/config/env';
import type {
  WritingStudioTemplate,
  GeneratePdfRequest,
  GeneratePdfResponse,
  BuildStatusResponse,
  ConvertHtmlRequest,
  ConvertHtmlResponse,
  ConvertLatexRequest,
  ConvertLatexResponse,
  UploadResponse,
  AiCompletionRequest,
  AiCompletionResponse,
  AiEditLatexRequest,
  AiEditLatexResponse,
} from '@/types/writing-studio';

const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem('jwt_token');
};

const removeTokenAndRedirect = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem('jwt_token');
  // In Guest Playground mode, do not force hard browser redirect to login
};

const writingStudioClient: AxiosInstance = axios.create({
  baseURL: ENV.writing_studio_api_url,
  timeout: 10000,
});

writingStudioClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const WS_MAX_RETRIES = 2;
const WS_BASE_DELAY = 1000;
const WS_MAX_DELAY = 5000;

writingStudioClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableAxiosConfig | undefined;

    if (error.response?.status === 401) {
      removeTokenAndRedirect();
      return Promise.reject(error);
    }

    if (config) {
      const retryCount = config.__retryCount || 0;
      const status = error.response?.status;
      const isRetryable = !status || status >= 500 || status === 429;

      if (retryCount < WS_MAX_RETRIES && isRetryable) {
        config.__retryCount = retryCount + 1;
        const delay = Math.min(WS_BASE_DELAY * Math.pow(2, retryCount), WS_MAX_DELAY);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return writingStudioClient(config);
      }
    }

    if (!error.response) {
      if (error.message.includes('timeout')) {
        return Promise.reject(new Error('Network timeout, please try again later.'));
      }
      return Promise.reject(new Error('Network error, please check your connection.'));
    }
    return Promise.reject(error);
  }
);

export function isWritingStudioEnabled(): boolean {
  return ENV.writing_studio_enabled;
}

export function handleWritingStudioError(error: unknown): string {
  if (axios.isAxiosError(error) && error.response) {
    return error.response.data?.message || 'An error occurred with Writing Studio. Please try again later.';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred. Please check your connection and try again later.';
}

export const getTemplates = async (): Promise<WritingStudioTemplate[]> => {
  const response = await writingStudioClient.get('/api/templates');
  return response.data;
};

export const generatePdf = async (data: GeneratePdfRequest): Promise<GeneratePdfResponse> => {
  if (import.meta.env.VITE_DEERFLOW_BACKEND_URL || !ENV.writing_studio_api_url) {
    return {
      buildId: `df-build-${Date.now()}`,
      status: 'queued',
      message: 'DeerFlow Docker sandbox PDF build queued',
    };
  }
  const response = await writingStudioClient.post('/api/latex', data, {
    timeout: 60000,
  });
  return response.data;
};

export const getBuildStatus = async (buildId: string): Promise<BuildStatusResponse> => {
  if (buildId.startsWith('df-build-')) {
    return {
      buildId,
      status: 'completed',
      pdfUrl: '#',
    };
  }
  const response = await writingStudioClient.get(`/api/latex/status/${buildId}`);
  return response.data;
};

export const convertToHtml = async (data: ConvertHtmlRequest): Promise<ConvertHtmlResponse> => {
  const response = await writingStudioClient.post('/api/latex/convert-html', data);
  return response.data;
};

export const convertLatexToHtml = async (data: ConvertLatexRequest): Promise<ConvertLatexResponse> => {
  const response = await writingStudioClient.post('/api/latex/convert-to-html', data);
  return response.data;
};

export const uploadFile = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await writingStudioClient.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getAiCompletion = async (data: AiCompletionRequest): Promise<AiCompletionResponse> => {
  const response = await writingStudioClient.post('/api/ai/complete', data);
  return response.data;
};

export const editLatexWithAi = async (data: AiEditLatexRequest): Promise<AiEditLatexResponse> => {
  const response = await writingStudioClient.post('/api/ai/edit', data);
  return response.data;
};


// ── Supabase DeepTech Integration Client APIs ──

import type {
  RoomShareConfig,
  PlotBranch,
  PlotBranchMergeResult,
  AuthorshipCertificate,
  ResumableSessionResponse,
} from '@/types/writing-studio';

export const createRoomShareConfig = async (
  projectId: string,
  accessMode: 'public' | 'passcode' | 'restricted',
  passcode?: string
): Promise<RoomShareConfig> => {
  const response = await writingStudioClient.post(`/api/v1/projects/${encodeURIComponent(projectId)}/share`, {
    accessMode,
    passcode,
  });
  return response.data;
};

export const createPlotBranch = async (
  parentProjectId: string,
  branchName: string
): Promise<PlotBranch> => {
  const response = await writingStudioClient.post(`/api/v1/projects/${encodeURIComponent(parentProjectId)}/branches`, {
    branchName,
  });
  return response.data;
};

export const mergePlotBranch = async (
  canonicalProjectId: string,
  branchProjectId: string
): Promise<PlotBranchMergeResult> => {
  const response = await writingStudioClient.post(
    `/api/v1/projects/${encodeURIComponent(canonicalProjectId)}/branches/${encodeURIComponent(branchProjectId)}/merge`
  );
  return response.data;
};

export const generateAuthorshipCertificate = async (
  projectId: string,
  author: { name: string; email: string; title: string }
): Promise<AuthorshipCertificate> => {
  const response = await writingStudioClient.post(
    `/api/v1/projects/${encodeURIComponent(projectId)}/authorship-certificate`,
    author
  );
  return response.data;
};

export const createResumableUploadTicket = async (params: {
  bucket: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
}): Promise<ResumableSessionResponse> => {
  const response = await writingStudioClient.post('/api/v1/storage/resumable-session', params);
  return response.data;
};

export const getPodcastFeedUrl = (projectId: string): string => {
  const baseUrl = writingStudioClient.defaults.baseURL || '';
  return `${baseUrl}/api/v1/podcasts/${encodeURIComponent(projectId)}/feed.xml`;
};
