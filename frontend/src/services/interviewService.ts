import api from './api';
import type {
  InterviewSessionCreate,
  InterviewSessionResponse,
  QuestionResponse,
  SubmitAnswerResponse,
  StartPreparationResponse,
} from '../types/interview';

export const interviewService = {
  createSession: async (data: InterviewSessionCreate): Promise<InterviewSessionResponse> => {
    const response = await api.post<InterviewSessionResponse>('/interview-sessions/', data);
    return response.data;
  },

  startPreparation: async (sessionId: string): Promise<StartPreparationResponse> => {
    const response = await api.post<StartPreparationResponse>(
      `/interview-sessions/${sessionId}/start`
    );
    return response.data;
  },

  beginInterview: async (sessionId: string): Promise<QuestionResponse> => {
    const response = await api.post<QuestionResponse>(
      `/interview-sessions/${sessionId}/begin`
    );
    return response.data;
  },

  submitAnswer: async (sessionId: string, answer: string): Promise<SubmitAnswerResponse> => {
    const response = await api.post<SubmitAnswerResponse>(
      `/interview-sessions/${sessionId}/answer`,
      { answer }
    );
    return response.data;
  },
};
