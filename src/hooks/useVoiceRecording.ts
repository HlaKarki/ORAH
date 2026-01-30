'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseVoiceRecordingReturn {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  transcript: string;
  error: string | null;
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
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const isRecordingRef = useRef(false);
  const shouldRestartRef = useRef(false);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

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
      };

      recognition.onend = () => {
        if (shouldRestartRef.current && isRecordingRef.current) {
          try {
            recognition.start();
          } catch {
            setIsRecording(false);
            stopTimer();
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
    }
  }, [startTimer, stopTimer]);

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
  }, [stopTimer]);

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
    };
  }, []);

  return {
    isRecording,
    isPaused,
    duration,
    transcript,
    error,
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
