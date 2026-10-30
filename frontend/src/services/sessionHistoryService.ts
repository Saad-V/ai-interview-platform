import api from './api';
import type {
  ConversationTurnHistory,
  InterviewSessionHistoryDetail,
  InterviewSessionHistoryPage,
} from '../types/interview';

interface SessionHistoryParams {
  limit?: number;
  cursor?: string;
}

export const sessionHistoryService = {
  listSessions: async (
    params: SessionHistoryParams = {}
  ): Promise<InterviewSessionHistoryPage> => {
    const response = await api.get<InterviewSessionHistoryPage>(
      '/interview-sessions/',
      { params }
    );
    return response.data;
  },

  getSession: async (sessionId: string): Promise<InterviewSessionHistoryDetail> => {
    const response = await api.get<InterviewSessionHistoryDetail>(
      `/interview-sessions/${sessionId}`
    );
    return response.data;
  },

  getTurns: async (sessionId: string): Promise<ConversationTurnHistory[]> => {
    const response = await api.get<ConversationTurnHistory[]>(
      `/interview-sessions/${sessionId}/turns`
    );
    return response.data;
  },
};
