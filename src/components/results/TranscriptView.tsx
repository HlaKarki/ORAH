'use client';

import { useMemo, useRef, useEffect } from 'react';

interface TranscriptViewProps {
  script: string;
  currentTime: number;
  duration: number;
  onSeek?: (time: number) => void;
}

export default function TranscriptView({ 
  script, 
  currentTime, 
  duration,
  onSeek 
}: TranscriptViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  const sentences = useMemo(() => {
    if (!script || script.trim().length === 0) {
      return [];
    }
    
    const parts = script
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    if (parts.length === 0) {
      return [{ text: script, startTime: 0, endTime: duration }];
    }
    
    const timePerSentence = duration / parts.length;
    
    return parts.map((text, index) => ({
      text,
      startTime: index * timePerSentence,
      endTime: (index + 1) * timePerSentence,
    }));
  }, [script, duration]);

  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (sentences.length === 0) {
    return (
      <div className="text-center py-8 text-[#6B6B70]">
        No transcript available
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-2 max-h-96 overflow-y-auto pr-2">
      {sentences.map((sentence, index) => {
        const isActive = currentTime >= sentence.startTime && currentTime < sentence.endTime;
        const isPast = currentTime >= sentence.endTime;
        
        return (
          <button
            key={index}
            ref={isActive ? activeRef : null}
            onClick={() => onSeek?.(sentence.startTime)}
            className={`w-full text-left p-3 rounded-lg transition-all cursor-pointer ${
              isActive 
                ? 'bg-[#FF5C00]/10 border border-[#FF5C00]/30' 
                : isPast
                  ? 'hover:bg-[#1A1A1D]'
                  : 'hover:bg-[#1A1A1D]'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className={`text-xs font-mono min-w-[3rem] flex-shrink-0 ${
                isActive ? 'text-[#FF5C00]' : isPast ? 'text-[#6B6B70]' : 'text-[#4A4A4F]'
              }`}>
                {formatTime(sentence.startTime)}
              </span>
              <p className={`text-sm leading-relaxed ${
                isActive ? 'text-white font-medium' : isPast ? 'text-[#8B8B90]' : 'text-[#6B6B70]'
              }`}>
                {sentence.text}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
