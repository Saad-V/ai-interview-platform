import api from './api';
import type { JobDescriptionResponse } from '../types/interview';

export const jobDescriptionService = {
  uploadJobDescription: async (sessionId: string, file: File): Promise<JobDescriptionResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<JobDescriptionResponse>(
      `/interview-sessions/${sessionId}/job-description`,
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
