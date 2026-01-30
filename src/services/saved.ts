import type { ExplanationResponse } from '@/types';
import { getStorageItem, setStorageItem, simulateAPICall } from './api';

const SAVED_KEY = 'explainit_saved';
const HISTORY_KEY = 'explainit_history';

export async function getSaved(): Promise<ExplanationResponse[]> {
  return simulateAPICall(
    () => {
      return getStorageItem<ExplanationResponse[]>(SAVED_KEY, []);
    },
    300,
    0
  );
}

export async function saveExplanation(explanation: ExplanationResponse): Promise<void> {
  return simulateAPICall(
    () => {
      const saved = getStorageItem<ExplanationResponse[]>(SAVED_KEY, []);
      const exists = saved.some((s) => s.id === explanation.id);
      
      if (!exists) {
        const updatedExplanation = { ...explanation, isSaved: true };
        setStorageItem(SAVED_KEY, [updatedExplanation, ...saved]);
        
        const history = getStorageItem<ExplanationResponse[]>(HISTORY_KEY, []);
        const updatedHistory = history.map((h) =>
          h.id === explanation.id ? { ...h, isSaved: true } : h
        );
        setStorageItem(HISTORY_KEY, updatedHistory);
      }
    },
    200,
    0
  );
}

export async function unsaveExplanation(id: string): Promise<void> {
  return simulateAPICall(
    () => {
      const saved = getStorageItem<ExplanationResponse[]>(SAVED_KEY, []);
      const updated = saved.filter((item) => item.id !== id);
      setStorageItem(SAVED_KEY, updated);
      
      const history = getStorageItem<ExplanationResponse[]>(HISTORY_KEY, []);
      const updatedHistory = history.map((h) =>
        h.id === id ? { ...h, isSaved: false } : h
      );
      setStorageItem(HISTORY_KEY, updatedHistory);
    },
    200,
    0
  );
}

export async function isSaved(id: string): Promise<boolean> {
  return simulateAPICall(
    () => {
      const saved = getStorageItem<ExplanationResponse[]>(SAVED_KEY, []);
      return saved.some((item) => item.id === id);
    },
    50,
    0
  );
}

export async function toggleSaved(explanation: ExplanationResponse): Promise<boolean> {
  const currentlySaved = await isSaved(explanation.id);
  
  if (currentlySaved) {
    await unsaveExplanation(explanation.id);
    return false;
  } else {
    await saveExplanation(explanation);
    return true;
  }
}
