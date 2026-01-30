'use client';

import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { InputCard, RecentExplanations } from '@/components/home';
import ProcessingOverlay from '@/components/shared/ProcessingOverlay';
import ErrorOverlay from '@/components/shared/ErrorOverlay';
import { generateExplanation } from '@/services/explain';
import { addToHistory } from '@/services/history';
import type { AudienceLevel, OutputFormat, ExplanationResponse } from '@/types';

export default function HomePage() {
  const router = useRouter();
  const { 
    appState, 
    setAppState, 
    setError,
    clearExplanation,
    addToast
  } = useApp();

  const handleSubmit = async (topic: string, audience: AudienceLevel, _output: OutputFormat) => {
    setAppState('processing');
    
    try {
      const explanation = await generateExplanation(topic, audience);
      await addToHistory(explanation);
      addToast('success', 'Explanation generated successfully!');
      router.push(`/results/${explanation.id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate explanation');
      addToast('error', 'Failed to generate explanation');
    }
  };

  const handleSelectRecent = (explanation: ExplanationResponse) => {
    if (explanation) {
      router.push(`/results/${explanation.id}`);
    }
  };

  const handleBackToHome = () => {
    clearExplanation();
    setAppState('idle');
  };

  const handleRetry = () => {
    setAppState('idle');
    setError(null);
  };

  return (
    <>
      {(appState === 'idle' || appState === 'results') && (
        <div className="p-6 md:p-12 max-w-4xl mx-auto">
          <div className="mb-10 md:mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              What would you like to learn?
            </h1>
            <p className="text-[#8B8B90] text-lg">
              Paste any topic, article, or concept and get a simple explanation.
            </p>
          </div>
          
          <div className="space-y-10">
            <InputCard 
              onSubmit={handleSubmit} 
              isLoading={false}
            />
            
            <RecentExplanations onSelect={handleSelectRecent} />
          </div>
        </div>
      )}

      {appState === 'processing' && <ProcessingOverlay />}

      {appState === 'error' && (
        <ErrorOverlay 
          onRetry={handleRetry}
          onGoBack={handleBackToHome}
        />
      )}
    </>
  );
}
