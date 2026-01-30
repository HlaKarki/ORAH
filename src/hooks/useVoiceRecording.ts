'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseVoiceRecordingReturn {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  transcript: string;
  error: string | null;
  audioLevels: number[];
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  clearTranscript: () => void;
}

export function useVoiceRecording(): UseVoiceRecordingReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(20).fill(4));
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const isRecordingRef = useRef(false);
  const shouldRestartRef = useRef(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isAnalyzingRef = useRef(false);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  const updateAudioLevels = useCallback(() => {
    if (!analyserRef.current || !isAnalyzingRef.current) {
      return;
    }

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    const numBars = 20;
    const step = Math.floor(dataArray.length / numBars);
    const levels: number[] = [];

    for (let i = 0; i < numBars; i++) {
      let sum = 0;
      for (let j = 0; j < step; j++) {
        sum += dataArray[i * step + j] ?? 0;
      }
      const avg = sum / step;
      const normalized = Math.max(4, (avg / 255) * 28);
      levels.push(normalized);
    }

    setAudioLevels(levels);
    animationFrameRef.current = requestAnimationFrame(updateAudioLevels);
  }, []);

  const startAudioAnalysis = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.5;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      isAnalyzingRef.current = true;
      updateAudioLevels();
    } catch (err) {
      console.error('Failed to start audio analysis:', err);
    }
  }, [updateAudioLevels]);

  const stopAudioAnalysis = useCallback(() => {
    isAnalyzingRef.current = false;
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    setAudioLevels(new Array(20).fill(4));
  }, []);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (typeof window === 'undefined') {
      setError('Speech recognition is not available');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    try {
      setTranscript('');
      setDuration(0);
      shouldRestartRef.current = true;

      await startAudioAnalysis();

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setIsPaused(false);
        setError(null);
        if (!intervalRef.current) {
          startTimer();
        }
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result?.[0]) {
            if (result.isFinal) {
              finalTranscript += result[0].transcript;
            }
          }
        }

        if (finalTranscript) {
          setTranscript((prev) => prev + finalTranscript);
        }
      };

      recognition.onerror = (event) => {
        if (event.error === 'no-speech') {
          return;
        }
        if (event.error === 'aborted') {
          return;
        }
        setError(`Speech recognition error: ${event.error}`);
        shouldRestartRef.current = false;
        setIsRecording(false);
        stopTimer();
        stopAudioAnalysis();
      };

      recognition.onend = () => {
        if (shouldRestartRef.current && isRecordingRef.current) {
          try {
            recognition.start();
          } catch {
            setIsRecording(false);
            stopTimer();
            stopAudioAnalysis();
          }
        } else {
          setIsRecording(false);
          stopTimer();
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording');
      stopAudioAnalysis();
    }
  }, [startTimer, stopTimer, startAudioAnalysis, stopAudioAnalysis]);

  const stopRecording = useCallback(() => {
    shouldRestartRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
      }
      recognitionRef.current = null;
    }
    setIsRecording(false);
    setIsPaused(false);
    stopTimer();
    stopAudioAnalysis();
  }, [stopTimer, stopAudioAnalysis]);

  const pauseRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      shouldRestartRef.current = false;
      try {
        recognitionRef.current.stop();
      } catch {
      }
      setIsPaused(true);
      stopTimer();
    }
  }, [isRecording, stopTimer]);

  const resumeRecording = useCallback(() => {
    if (recognitionRef.current && isPaused) {
      shouldRestartRef.current = true;
      try {
        recognitionRef.current.start();
      } catch {
      }
      setIsPaused(false);
      startTimer();
    }
  }, [isPaused, startTimer]);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setDuration(0);
  }, []);

  useEffect(() => {
    return () => {
      shouldRestartRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
        }
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        void audioContextRef.current.close();
      }
    };
  }, []);

  return {
    isRecording,
    isPaused,
    duration,
    transcript,
    error,
    audioLevels,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearTranscript,
  };
}

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
