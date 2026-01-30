'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Check } from 'lucide-react';

interface VoiceRecordingUIProps {
  duration: number;
  isRecording: boolean;
  onCancel: () => void;
  onDone: () => void;
}

export default function VoiceRecordingUI({
  duration,
  isRecording,
  onCancel,
  onDone,
}: VoiceRecordingUIProps) {
  const [bars, setBars] = useState<number[]>([]);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const generateBars = () => {
      const newBars = Array.from({ length: 15 }, () => 
        Math.random() * 24 + 16
      );
      setBars(newBars);
    };

    generateBars();

    if (isRecording) {
      animationRef.current = setInterval(generateBars, 150);
    }

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [isRecording]);

  return (
    <div className="bg-[#0C0C0E] rounded-xl p-6 h-[180px] flex flex-col items-center justify-center gap-5">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 bg-[#FF3B30] rounded-full animate-pulse" />
        <span className="text-[#FF3B30] text-sm font-semibold">Recording...</span>
      </div>

      <div className="flex items-center justify-center gap-[3px] h-12">
        {bars.map((height, index) => (
          <div
            key={index}
            className="w-1 bg-[#FF5C00] rounded-sm transition-all duration-150"
            style={{ height: `${height}px` }}
          />
        ))}
      </div>

      <span className="text-white text-2xl font-semibold font-mono">
        {formatTime(duration)}
      </span>
    </div>
  );
}

interface VoiceRecordingControlsProps {
  onCancel: () => void;
  onDone: () => void;
  isDisabled?: boolean;
}

export function VoiceRecordingControls({
  onCancel,
  onDone,
  isDisabled = false,
}: VoiceRecordingControlsProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onCancel}
        disabled={isDisabled}
        className="flex items-center gap-2 px-6 py-3 bg-[#1A1A1D] rounded-[10px] text-[#8B8B90] hover:bg-[#2A2A2D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <X size={18} />
        <span className="text-sm font-medium">Cancel</span>
      </button>
      <button
        onClick={onDone}
        disabled={isDisabled}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-b from-[#FF5C00] to-[#FF7A00] rounded-[10px] text-white hover:from-[#FF6B00] hover:to-[#FF8A00] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <Check size={18} />
        <span className="text-sm font-semibold">Done</span>
      </button>
    </div>
  );
}
