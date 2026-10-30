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

export type InterviewPhase = 'idle' | 'speaking' | 'listening' | 'thinking';

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

export interface InterviewSessionHistoryItem {
  id: string;
  status: InterviewStatus;
  difficulty: InterviewDifficulty;
  planned_duration_minutes: number;
  created_at: string;
  completed_at: string | null;
  turn_count: number;
  report_preview: InterviewReportPreview | null;
}

export interface InterviewReportPreview {
  overall_score: number;
  summary: string;
  recommendation: string;
}

export interface InterviewSessionHistoryPage {
  items: InterviewSessionHistoryItem[];
  next_cursor: string | null;
}

export interface InterviewSessionHistoryDetail extends Omit<InterviewSessionHistoryItem, 'report_preview'> {
  report: InterviewReport | null;
}

export interface AnswerEvaluation {
  awarded_score: number;
  maximum_score: number;
  technical_percentage: number;
  communication_percentage: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  missing_topics: string[];
  suggested_improvement: string;
}

export interface ConversationTurnHistory {
  id: string;
  interview_session_id: string;
  turn_number: number;
  created_at: string;
  completed_at: string | null;
  section_title: string;
  question: string;
  candidate_answer: string;
  evaluation: AnswerEvaluation | null;
}

export interface SubmitAnswerResponse {
  interview_completed: boolean;
  current_question: QuestionResponse | null;
  report: InterviewReport | null;
}

export interface StartPreparationResponse {
  Message: string;
}
