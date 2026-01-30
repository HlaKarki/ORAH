import type { ExplanationResponse, HistoryFilter } from '@/types';
import { apiRequest, APIError } from './api';

interface HistoryResponse {
  history: ExplanationResponse[];
}

interface ExplanationByIdResponse {
  explanation: ExplanationResponse;
}

interface AddHistoryResponse {
  success: boolean;
  explanation: ExplanationResponse;
}

export async function getHistory(filter: HistoryFilter = { type: 'all' }): Promise<ExplanationResponse[]> {
  try {
    const params = new URLSearchParams();
    params.set('filter', filter.type);
    
    const response = await apiRequest<HistoryResponse>(`/api/history?${params.toString()}`);
    return response.history;
  } catch (error) {
    if (error instanceof APIError && error.statusCode === 401) {
      return [];
    }
    throw error;
  }
}

export async function addToHistory(explanation: Omit<ExplanationResponse, 'id' | 'createdAt' | 'isSaved'>): Promise<ExplanationResponse> {
  const response = await apiRequest<AddHistoryResponse>('/api/history', {
    method: 'POST',
    body: JSON.stringify(explanation),
  });
  return response.explanation;
}

export async function deleteFromHistory(id: string): Promise<void> {
  await apiRequest<{ success: boolean }>(`/api/history?id=${id}`, {
    method: 'DELETE',
  });
}

export async function clearHistory(): Promise<void> {
  await apiRequest<{ success: boolean }>('/api/history?clearAll=true', {
    method: 'DELETE',
  });
}

export async function getExplanationById(id: string): Promise<ExplanationResponse | null> {
  try {
    const response = await apiRequest<ExplanationByIdResponse>(`/api/history/${id}`);
    return response.explanation;
  } catch (error) {
    if (error instanceof APIError && (error.statusCode === 404 || error.statusCode === 401)) {
      return null;
    }
    throw error;
  }
}

export async function searchHistory(query: string): Promise<ExplanationResponse[]> {
  try {
    const params = new URLSearchParams();
    params.set('search', query);
    
    const response = await apiRequest<HistoryResponse>(`/api/history?${params.toString()}`);
    return response.history;
  } catch (error) {
    if (error instanceof APIError && error.statusCode === 401) {
      return [];
    }
    throw error;
  }
}
