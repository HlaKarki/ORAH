'use client';

import { useState, useCallback } from 'react';
import type { ExplanationResponse, AudienceLevel } from '@/types';
import { generateExplanation } from '@/services/explain';
import { addToHistory } from '@/services/history';

interface UseExplanationReturn {
  explanation: ExplanationResponse | null;
  isLoading: boolean;
  error: string | null;
  generate: (topic: string, audience: AudienceLevel) => Promise<void>;
  clear: () => void;
}

export function useExplanation(): UseExplanationReturn {
  const [explanation, setExplanation] = useState<ExplanationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (topic: string, audience: AudienceLevel) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await generateExplanation(topic, audience);
      setExplanation(result);
      await addToHistory(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate explanation';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setExplanation(null);
    setError(null);
  }, []);

  return {
    explanation,
    isLoading,
    error,
    generate,
    clear,
  };
}
