'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseAudioPlayerOptions {
  onTimeUpdate?: (currentTime: number) => void;
  onEnd?: () => void;
}

interface UseAudioPlayerReturn {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  speed: number;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seek: (time: number) => void;
  setSpeed: (speed: number) => void;
  speak: (text: string, totalDuration: number) => void;
  stop: () => void;
}

export function useAudioPlayer(options: UseAudioPlayerOptions = {}): UseAudioPlayerReturn {
  const { onTimeUpdate, onEnd } = options;
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeedState] = useState(1);
  const [text, setText] = useState('');
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  const cleanup = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const updateTime = useCallback(() => {
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const adjustedTime = Math.min(elapsed * speed, duration);
    setCurrentTime(adjustedTime);
    onTimeUpdate?.(adjustedTime);
    
    if (adjustedTime >= duration) {
      cleanup();
      setIsPlaying(false);
      setCurrentTime(0);
      pausedTimeRef.current = 0;
      onEnd?.();
    }
  }, [speed, duration, onTimeUpdate, onEnd, cleanup]);

  const startSpeaking = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis || !text) return;
    
    cleanup();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speed;
    
    utterance.onstart = () => {
      startTimeRef.current = Date.now() - (pausedTimeRef.current * 1000);
      intervalRef.current = setInterval(updateTime, 100);
    };
    
    utterance.onend = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      pausedTimeRef.current = 0;
      cleanup();
      onEnd?.();
    };
    
    utterance.onerror = () => {
      setIsPlaying(false);
      cleanup();
    };
    
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [text, speed, cleanup, updateTime, onEnd]);

  const speak = useCallback((newText: string, totalDuration: number) => {
    setText(newText);
    setDuration(totalDuration);
    setCurrentTime(0);
    pausedTimeRef.current = 0;
  }, []);

  const play = useCallback(() => {
    setIsPlaying(true);
    startSpeaking();
  }, [startSpeaking]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    pausedTimeRef.current = currentTime;
    cleanup();
  }, [currentTime, cleanup]);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const seek = useCallback((time: number) => {
    setCurrentTime(time);
    pausedTimeRef.current = time;
    onTimeUpdate?.(time);
    
    if (isPlaying) {
      cleanup();
      startSpeaking();
    }
  }, [isPlaying, cleanup, startSpeaking, onTimeUpdate]);

  const setSpeed = useCallback((newSpeed: number) => {
    setSpeedState(newSpeed);
    
    if (isPlaying) {
      pausedTimeRef.current = currentTime;
      cleanup();
      setTimeout(() => startSpeaking(), 50);
    }
  }, [isPlaying, currentTime, cleanup, startSpeaking]);

  const stop = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    pausedTimeRef.current = 0;
    cleanup();
  }, [cleanup]);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  return {
    isPlaying,
    currentTime,
    duration,
    speed,
    play,
    pause,
    toggle,
    seek,
    setSpeed,
    speak,
    stop,
  };
}
