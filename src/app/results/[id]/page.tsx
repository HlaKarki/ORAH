'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { getExplanationById } from '@/services/history';
import { toggleSaved } from '@/services/saved';
import type { ExplanationResponse } from '@/types';
import ResultsHeader from '@/components/results/ResultsHeader';
import AudioPlayer, { type AudioPlayerRef } from '@/components/results/AudioPlayer';
import SummaryView from '@/components/results/SummaryView';
import TranscriptView from '@/components/results/TranscriptView';
import KeyTermsCard from '@/components/results/KeyTermsCard';
import ShareModal from '@/components/shared/ShareModal';
import { LogIn } from 'lucide-react';

type ViewTab = 'summary' | 'transcript';

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useApp();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [explanation, setExplanation] = useState<ExplanationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ViewTab>('summary');
  const [currentTime, setCurrentTime] = useState(0);
  const [seekTime, setSeekTime] = useState<number | undefined>(undefined);
  const [showShareModal, setShowShareModal] = useState(false);
  const audioPlayerRef = useRef<AudioPlayerRef>(null);

  const id = params.id as string;

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    if (id) {
      void getExplanationById(id)
        .then((data) => {
          if (data) {
            setExplanation(data);
          }
        })
        .catch((error) => {
          console.error('Failed to load explanation:', error);
          addToast('error', 'Failed to load explanation');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isAuthenticated, authLoading, addToast]);

  const handleBack = () => {
    router.push('/');
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleToggleSave = async () => {
    if (!explanation) return;
    try {
      const newSavedState = await toggleSaved(explanation.id);
      setExplanation({ ...explanation, isSaved: newSavedState });
      addToast('success', newSavedState ? 'Saved to collection' : 'Removed from saved');
    } catch {
      addToast('error', 'Failed to update saved status');
    }
  };

  const handleDownload = () => {
    addToast('info', 'PDF download coming soon!');
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handleSeek = (time: number) => {
    setSeekTime(time);
    setCurrentTime(time);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.seekTo(time);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="p-6 md:p-12 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-[#1A1A1D] rounded w-1/3" />
          <div className="card p-6 space-y-4">
            <div className="h-12 bg-[#1A1A1D] rounded" />
            <div className="h-2 bg-[#1A1A1D] rounded" />
            <div className="h-12 bg-[#1A1A1D] rounded w-1/2 mx-auto" />
          </div>
          <div className="card p-6">
            <div className="h-40 bg-[#1A1A1D] rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-6 md:p-12 max-w-6xl mx-auto">
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#1A1A1D] flex items-center justify-center">
            <LogIn size={32} className="text-[#6B6B70]" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Sign in required</h3>
          <p className="text-[#6B6B70] mb-6">
            Please sign in to view this explanation
          </p>
          <button
            onClick={() => router.push('/auth')}
            className="btn btn-primary"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (!explanation) {
    return (
      <div className="p-6 md:p-12 max-w-6xl mx-auto">
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#1A1A1D] flex items-center justify-center">
            <svg className="w-8 h-8 text-[#6B6B70]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Explanation not found</h3>
          <p className="text-[#6B6B70] mb-6">
            This explanation may have been deleted or the link is invalid.
          </p>
          <button
            onClick={() => router.push('/')}
            className="btn btn-primary cursor-pointer"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto">
      <ResultsHeader
        explanation={explanation}
        onBack={handleBack}
        onShare={handleShare}
        onToggleSave={handleToggleSave}
        onDownload={handleDownload}
      />
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AudioPlayer
            ref={audioPlayerRef}
            script={explanation.script_for_audio}
            duration={explanation.audioDuration}
            audioUrl={explanation.recordingData?.audioUrl}
            onTimeUpdate={handleTimeUpdate}
            seekTime={seekTime}
          />
          
          <div className="card overflow-hidden">
            <div className="flex border-b border-[#1F1F22]">
              <button
                onClick={() => setActiveTab('summary')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === 'summary'
                    ? 'text-white border-b-2 border-[#FF5C00] -mb-px'
                    : 'text-[#6B6B70] hover:text-white'
                }`}
              >
                Summary
              </button>
              <button
                onClick={() => setActiveTab('transcript')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === 'transcript'
                    ? 'text-white border-b-2 border-[#FF5C00] -mb-px'
                    : 'text-[#6B6B70] hover:text-white'
                }`}
              >
                Transcript
              </button>
            </div>
            
            <div className="p-5 md:p-6">
              {activeTab === 'summary' ? (
                <SummaryView content={explanation.one_page_content} />
              ) : (
                <TranscriptView
                  script={explanation.script_for_audio}
                  currentTime={currentTime}
                  duration={explanation.audioDuration}
                  segments={explanation.recordingData?.segments}
                  onSeek={handleSeek}
                />
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <KeyTermsCard
            terms={explanation.one_page_content.key_terms}
            relatedTopics={explanation.one_page_content.related_topics}
          />
        </div>
      </div>
      
      {showShareModal && (
        <ShareModal 
          explanationId={explanation.id}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
