'use client';

import { useState, useRef } from 'react';
import type { ExplanationResponse } from '@/types';
import { useApp } from '@/context/AppContext';
import { toggleSaved } from '@/services/saved';
import ResultsHeader from './ResultsHeader';
import AudioPlayer, { type AudioPlayerRef } from './AudioPlayer';
import SummaryView from './SummaryView';
import TranscriptView from './TranscriptView';
import KeyTermsCard from './KeyTermsCard';
import ShareModal from '../shared/ShareModal';

interface ResultsViewProps {
  explanation: ExplanationResponse;
  onBack: () => void;
}

type ViewTab = 'summary' | 'transcript';

export default function ResultsView({ explanation, onBack }: ResultsViewProps) {
  const { addToast, toggleCurrentSaved } = useApp();
  const [activeTab, setActiveTab] = useState<ViewTab>('summary');
  const [currentTime, setCurrentTime] = useState(0);
  const [seekTime, setSeekTime] = useState<number | undefined>(undefined);
  const [showShareModal, setShowShareModal] = useState(false);
  const audioPlayerRef = useRef<AudioPlayerRef>(null);

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleToggleSave = async () => {
    try {
      const newSavedState = await toggleSaved(explanation);
      toggleCurrentSaved(newSavedState);
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

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto">
      <ResultsHeader
        explanation={explanation}
        onBack={onBack}
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
