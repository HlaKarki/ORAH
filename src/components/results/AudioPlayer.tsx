'use client';

import { useState, useEffect, useCallback, useRef, useMemo, useImperativeHandle, forwardRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, ChevronDown } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface AudioPlayerProps {
  script: string;
  duration: number;
  onTimeUpdate?: (currentTime: number) => void;
  seekTime?: number;
}

export interface AudioPlayerRef {
  seekTo: (time: number) => void;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const WAVEFORM_BARS = 60;

const AudioPlayer = forwardRef<AudioPlayerRef, AudioPlayerProps>(function AudioPlayer(
  { script, duration, onTimeUpdate, seekTime },
  ref
) {
  const { settings } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(settings.speed);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  const waveformHeights = useMemo(() => 
    Array.from({ length: WAVEFORM_BARS }, () => Math.random() * 20 + 8), 
  []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };


  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startSpeech = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    
    stopSpeech();
    
    const utterance = new SpeechSynthesisUtterance(script);
    utterance.rate = speed;
    
    if (settings.voice && settings.voice !== 'default') {
      const voices = window.speechSynthesis.getVoices();
      const selectedVoice = voices.find(v => v.voiceURI === settings.voice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }
    
    utterance.onstart = () => {
      startTimeRef.current = Date.now() - (pausedTimeRef.current * 1000);
      intervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const adjustedTime = Math.min(elapsed * speed, duration);
        setCurrentTime(adjustedTime);
        onTimeUpdate?.(adjustedTime);
      }, 100);
    };
    
    utterance.onend = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      pausedTimeRef.current = 0;
      stopSpeech();
    };
    
    utterance.onerror = () => {
      setIsPlaying(false);
      stopSpeech();
    };
    
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [script, speed, settings.voice, duration, onTimeUpdate, stopSpeech]);

  const togglePlay = useCallback(() => {
    if (!isPlaying) {
      setIsPlaying(true);
      startSpeech();
    } else {
      setIsPlaying(false);
      pausedTimeRef.current = currentTime;
      stopSpeech();
    }
  }, [isPlaying, startSpeech, stopSpeech, currentTime]);

  const handleSkipBack = () => {
    const newTime = Math.max(0, currentTime - 10);
    setCurrentTime(newTime);
    pausedTimeRef.current = newTime;
    onTimeUpdate?.(newTime);
    
    if (isPlaying) {
      stopSpeech();
      startSpeech();
    }
  };

  const handleSkipForward = () => {
    const newTime = Math.min(duration, currentTime + 10);
    setCurrentTime(newTime);
    pausedTimeRef.current = newTime;
    onTimeUpdate?.(newTime);
    
    if (isPlaying) {
      stopSpeech();
      startSpeech();
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickPercent = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = clickPercent * duration;
    
    setCurrentTime(newTime);
    pausedTimeRef.current = newTime;
    onTimeUpdate?.(newTime);
    
    if (isPlaying) {
      stopSpeech();
      startSpeech();
    }
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    setShowSpeedMenu(false);
    
    if (isPlaying) {
      pausedTimeRef.current = currentTime;
      stopSpeech();
      setTimeout(() => startSpeech(), 50);
    }
  };

  const seekTo = useCallback((time: number) => {
    const newTime = Math.max(0, Math.min(duration, time));
    setCurrentTime(newTime);
    pausedTimeRef.current = newTime;
    onTimeUpdate?.(newTime);
    
    if (isPlaying) {
      stopSpeech();
      startSpeech();
    }
  }, [duration, isPlaying, onTimeUpdate, startSpeech, stopSpeech]);

  useImperativeHandle(ref, () => ({
    seekTo
  }), [seekTo]);

  useEffect(() => {
    if (seekTime !== undefined) {
      seekTo(seekTime);
    }
  }, [seekTime, seekTo]);

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, [stopSpeech]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const currentBarIndex = Math.floor((currentTime / duration) * WAVEFORM_BARS);

  return (
    <div className="card p-4 md:p-6">
      <div 
        className="flex items-end h-10 mb-2 cursor-pointer"
        onClick={handleProgressClick}
      >
        {waveformHeights.map((height, i) => {
          const isPast = i < currentBarIndex;
          const isCurrent = i === currentBarIndex;
          
          return (
            <div
              key={i}
              className="flex-1 mx-[1px] rounded-full transition-all duration-100"
              style={{
                height: `${height}px`,
                backgroundColor: isPast || isCurrent ? '#FF5C00' : '#3A3A3D',
                opacity: isPast ? 1 : isCurrent ? 1 : 0.5,
              }}
            />
          );
        })}
      </div>
      
      <div 
        className="h-2 bg-[#1F1F22] rounded-full cursor-pointer mb-4 relative group"
        onClick={handleProgressClick}
      >
        <div 
          className="h-full bg-gradient-to-r from-[#FF5C00] to-[#FF7A00] rounded-full transition-all"
          style={{ width: `${progressPercent}%` }}
        />
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `calc(${progressPercent}% - 6px)` }}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-[#8B8B90] min-w-[90px]">
          <span className="text-white">{formatTime(currentTime)}</span>
          <span className="mx-1">/</span>
          <span>{formatTime(duration)}</span>
        </span>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleSkipBack}
            className="btn-icon w-10 h-10"
            title="Skip back 10s"
          >
            <SkipBack size={18} />
          </button>
          
          <button 
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-[#FF5C00] hover:bg-[#FF7A00] flex items-center justify-center transition-colors cursor-pointer"
          >
            {isPlaying ? (
              <Pause size={20} className="text-white" />
            ) : (
              <Play size={20} className="text-white" />
            )}
          </button>
          
          <button 
            onClick={handleSkipForward}
            className="btn-icon w-10 h-10"
            title="Skip forward 10s"
          >
            <SkipForward size={18} />
          </button>
        </div>
        
        <div className="relative w-12 text-right">
          <button
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            className="text-sm text-[#6B6B70] hover:text-white transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            {speed}x
            <ChevronDown size={12} />
          </button>
          
          {showSpeedMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowSpeedMenu(false)} 
              />
              <div className="absolute right-0 bottom-full mb-2 bg-[#111113] border border-[#1F1F22] rounded-lg overflow-hidden z-20">
                {SPEED_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSpeedChange(s)}
                    className={`block w-full px-4 py-2 text-sm text-left transition-colors cursor-pointer ${
                      speed === s
                        ? 'bg-[#FF5C00]/20 text-[#FF5C00]'
                        : 'text-white hover:bg-[#1A1A1D]'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

export default AudioPlayer;
