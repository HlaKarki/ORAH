'use client';

import { ArrowLeft, Share2, Bookmark, Download, Clock } from 'lucide-react';
import type { ExplanationResponse } from '@/types';

interface ResultsHeaderProps {
  explanation: ExplanationResponse;
  onBack: () => void;
  onShare: () => void;
  onToggleSave: () => void;
  onDownload: () => void;
}

export default function ResultsHeader({ 
  explanation, 
  onBack, 
  onShare, 
  onToggleSave, 
  onDownload 
}: ResultsHeaderProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <header className="flex items-center justify-between pb-6 border-b border-[#1F1F22]">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="btn-icon"
          title="Back to home"
        >
          <ArrowLeft size={20} />
        </button>
        
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white mb-1">
            {explanation.title}
          </h1>
          <div className="flex items-center gap-3 text-sm text-[#6B6B70]">
            <span>{formatDate(explanation.createdAt)}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{formatDuration(explanation.audioDuration)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={onShare}
          className="btn-icon"
          title="Share"
        >
          <Share2 size={18} />
        </button>
        <button 
          onClick={onToggleSave}
          className={`btn-icon ${explanation.isSaved ? 'text-[#FF5C00]' : ''}`}
          title={explanation.isSaved ? 'Remove from saved' : 'Save'}
        >
          <Bookmark size={18} fill={explanation.isSaved ? 'currentColor' : 'none'} />
        </button>
        <button 
          onClick={onDownload}
          className="btn btn-secondary"
        >
          <Download size={16} />
          <span className="hidden sm:inline">Download PDF</span>
        </button>
      </div>
    </header>
  );
}
