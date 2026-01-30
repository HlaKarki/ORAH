'use client';

import { X, Check } from 'lucide-react';

interface VoiceRecordingUIProps {
  duration: number;
  isRecording: boolean;
  audioLevels: number[];
}

export default function VoiceRecordingUI({
  duration,
  audioLevels,
}: VoiceRecordingUIProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-[#0C0C0E] rounded-xl px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="w-2.5 h-2.5 bg-[#FF3B30] rounded-full animate-pulse" />
        <span className="text-[#FF3B30] text-sm font-semibold">Recording...</span>
      </div>

      <div className="flex items-center gap-[2px] h-6">
        {audioLevels.map((height, index) => (
          <div
            key={index}
            className="w-[3px] bg-[#FF5C00] rounded-sm transition-all duration-75"
            style={{ height: `${height}px` }}
          />
        ))}
      </div>

      <span className="text-white text-base font-semibold font-mono min-w-[50px] text-right">
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
