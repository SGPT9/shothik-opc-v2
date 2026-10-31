export interface WritingStudioTemplate {
  _id: string;
  templateId: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  docxUrl: string;
  thumbnailUrl?: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type BuildStatus = "queued" | "processing" | "completed" | "failed";

export interface DocumentBuild {
  _id: string;
  buildId: string;
  userId: string;
  bookId: string;
  status: BuildStatus;
  content?: string;
  pdfUrl?: string;
  error?: string;
  originalName?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratePdfRequest {
  html: string;
  templateId?: string;
  styles?: {
    primaryColor?: string;
    accentColor?: string;
    orientation?: 'portrait' | 'landscape';
  };
  layout?: {
    width: number;
    height: number;
    margins: {
      left: number;
      right: number;
      top: number;
      bottom: number;
    };
  };
  metadata?: {
    title?: string;
    author?: string;
    date?: string;
  };
}

export interface GeneratePdfResponse {
  buildId: string;
  status: BuildStatus;
  message?: string;
}

export interface BuildStatusResponse {
  buildId: string;
  status: BuildStatus;
  pdfUrl?: string;
  error?: string;
  metadata?: Record<string, any>;
}

export interface ConvertHtmlRequest {
  html: string;
  templateId?: string;
  styles?: Record<string, any>;
  layout?: Record<string, any>;
}

export interface ConvertHtmlResponse {
  latex: string;
  orientation?: string;
}

export interface ConvertLatexRequest {
  latex: string;
}

export interface ConvertLatexResponse {
  html: string;
  orientation?: string;
}

export interface UploadResponse {
  url: string;
  filename: string;
}

export interface AiCompletionRequest {
  context: string;
  currentText: string;
}

export interface AiCompletionResponse {
  completion: string;
}

export interface AiEditLatexRequest {
  code: string;
  instruction: string;
}

export interface AiEditLatexResponse {
  latex: string;
}


// ── Supabase DeepTech Types ──

export interface RoomShareConfig {
  projectId: string;
  accessMode: 'public' | 'passcode' | 'restricted';
  shareToken?: string;
  passcode?: string;
  roomUrl?: string;
}

export interface PlotBranch {
  id: string;
  parentProjectId: string;
  branchName: string;
  lineageRootId: string;
  content?: string;
  createdAt?: string;
}

export interface PlotBranchMergeResult {
  success: boolean;
  mergedContent: string;
  conflictCount: number;
  diffSummary: {
    added: number;
    removed: number;
    unmodified: number;
  };
}

export interface AuthorshipCertificate {
  certificateId: string;
  projectId: string;
  authorName: string;
  authorEmail: string;
  title: string;
  merkleRoot: string;
  signature: string;
  issuedAt: string;
  status: 'verified' | 'unverified';
}

export interface PodcastEpisode {
  id: string;
  title: string;
  audioUrl: string;
  duration: number;
  waveformPeaks?: number[];
}

export interface PodcastAudioFeed {
  projectId: string;
  title: string;
  feedUrl: string;
  episodes: PodcastEpisode[];
}

export interface ResumableSessionResponse {
  success: boolean;
  sessionId: string;
  uploadUrl: string;
  chunkSize: number;
  bucket: string;
  filename: string;
  expiresAt: string;
}
