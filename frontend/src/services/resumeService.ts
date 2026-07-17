import api from './api';
import type { ResumeResponse } from '../types/interview';

export const resumeService = {
  uploadResume: async (sessionId: string, file: File): Promise<ResumeResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<ResumeResponse>(
      `/interview-sessions/${sessionId}/resume`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};
