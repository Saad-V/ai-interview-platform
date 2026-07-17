export const InterviewDifficulty = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD',
} as const;

export type InterviewDifficulty = (typeof InterviewDifficulty)[keyof typeof InterviewDifficulty];

export const InterviewStatus = {
  CREATED: 'CREATED',
  PARSING: 'PARSING',
  READY: 'READY',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;

export type InterviewStatus = (typeof InterviewStatus)[keyof typeof InterviewStatus];

// ── Request Types ──

export interface InterviewSessionCreate {
  planned_duration_minutes: number;
  difficulty: InterviewDifficulty;
}

export interface SubmitAnswerRequest {
  answer: string;
}

// ── Response Types ──

export interface InterviewSessionResponse {
  id: string;
  status: InterviewStatus;
  difficulty: InterviewDifficulty;
  planned_duration_minutes: number;
  created_at: string;
}

export interface ResumeResponse {
  id: string;
  interview_session_id: string;
  original_filename: string;
  storage_path: string;
  storage_provider: string;
  mime_type: string;
  file_size: number;
}

export interface JobDescriptionResponse {
  id: string;
  interview_session_id: string;
  original_filename: string;
  storage_path: string;
  mime_type: string;
  file_size: number;
  raw_text: string | null;
}

export interface QuestionResponse {
  turn_number: number;
  section_title: string;
  question: string;
}

export interface InterviewReport {
  overall_score: number;
  technical_score: number;
  communication_score: number;
  strengths: string[];
  areas_for_improvement: string[];
  summary: string;
  recommendation: string;
}

export interface SubmitAnswerResponse {
  interview_completed: boolean;
  current_question: QuestionResponse | null;
  report: InterviewReport | null;
}

export interface StartPreparationResponse {
  Message: string;
}
