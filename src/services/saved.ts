import type { ExplanationResponse } from '@/types';
import { apiRequest, APIError } from './api';

interface SavedResponse {
  saved: ExplanationResponse[];
}

interface ToggleResponse {
  success: boolean;
  isSaved: boolean;
}

export async function getSaved(): Promise<ExplanationResponse[]> {
  try {
    const response = await apiRequest<SavedResponse>('/api/saved');
    return response.saved;
  } catch (error) {
    if (error instanceof APIError && error.statusCode === 401) {
      return [];
    }
    throw error;
  }
}

export async function saveExplanation(explanationId: string): Promise<void> {
  await apiRequest<{ success: boolean }>('/api/saved', {
    method: 'POST',
    body: JSON.stringify({ explanationId }),
  });
}

export async function unsaveExplanation(id: string): Promise<void> {
  await apiRequest<{ success: boolean }>(`/api/saved?id=${id}`, {
    method: 'DELETE',
  });
}

export async function isSaved(id: string): Promise<boolean> {
  try {
    const saved = await getSaved();
    return saved.some((item) => item.id === id);
  } catch {
    return false;
  }
}

export async function toggleSaved(explanationId: string): Promise<boolean> {
  const response = await apiRequest<ToggleResponse>('/api/saved/toggle', {
    method: 'POST',
    body: JSON.stringify({ explanationId }),
  });
  return response.isSaved;
}
