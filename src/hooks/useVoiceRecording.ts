'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { TranscriptSegment } from '@/types';

interface UseVoiceRecordingReturn {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  transcript: string;
  error: string | null;
  audioLevels: number[];
  audioUrl: string | null;
  segments: TranscriptSegment[];
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  clearRecording: () => void;
}

export function useVoiceRecording(): UseVoiceRecordingReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(20).fill(4));
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  
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

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const segmentsRef = useRef<TranscriptSegment[]>([]);
  const lastSegmentEndRef = useRef<number>(0);

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

  const startAudioAnalysisAndRecording = useCallback(async () => {
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

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(100);

      return stream;
    } catch (err) {
      console.error('Failed to start audio analysis:', err);
      throw err;
    }
  }, [updateAudioLevels]);

  const stopAudioAnalysisAndRecording = useCallback(() => {
    isAnalyzingRef.current = false;
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    return new Promise<string | null>((resolve) => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          if (audioBlob.size > 0) {
            const url = URL.createObjectURL(audioBlob);
            setAudioUrl(url);
            resolve(url);
          } else {
            resolve(null);
          }
          mediaRecorderRef.current = null;
        };
      } else {
        resolve(null);
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
    });
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
      setAudioUrl(null);
      setSegments([]);
      segmentsRef.current = [];
      lastSegmentEndRef.current = 0;
      shouldRestartRef.current = true;

      await startAudioAnalysisAndRecording();

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
        const currentTime = (Date.now() - startTimeRef.current) / 1000;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result?.[0]) {
            if (result.isFinal) {
              finalTranscript += result[0].transcript;
            }
          }
        }

        if (finalTranscript) {
          const trimmedText = finalTranscript.trim();
          if (trimmedText) {
            const newSegment: TranscriptSegment = {
              text: trimmedText,
              startTime: lastSegmentEndRef.current,
              endTime: currentTime,
            };
            segmentsRef.current = [...segmentsRef.current, newSegment];
            setSegments([...segmentsRef.current]);
            lastSegmentEndRef.current = currentTime;
          }
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
        void stopAudioAnalysisAndRecording();
      };

      recognition.onend = () => {
        if (shouldRestartRef.current && isRecordingRef.current) {
          try {
            recognition.start();
          } catch {
            setIsRecording(false);
            stopTimer();
            void stopAudioAnalysisAndRecording();
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
      void stopAudioAnalysisAndRecording();
    }
  }, [startTimer, stopTimer, startAudioAnalysisAndRecording, stopAudioAnalysisAndRecording]);

  const stopRecording = useCallback(() => {
    shouldRestartRef.current = false;
    
    const finalDuration = (Date.now() - startTimeRef.current) / 1000;
    
    if (segmentsRef.current.length > 0) {
      const lastSegment = segmentsRef.current[segmentsRef.current.length - 1];
      if (lastSegment && lastSegment.endTime < finalDuration) {
        lastSegment.endTime = finalDuration;
        setSegments([...segmentsRef.current]);
      }
    }
    
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
    void stopAudioAnalysisAndRecording();
  }, [stopTimer, stopAudioAnalysisAndRecording]);

  const pauseRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      shouldRestartRef.current = false;
      try {
        recognitionRef.current.stop();
      } catch {
      }
      setIsPaused(true);
      stopTimer();
      
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.pause();
      }
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
      
      if (mediaRecorderRef.current?.state === 'paused') {
        mediaRecorderRef.current.resume();
      }
    }
  }, [isPaused, startTimer]);

  const clearRecording = useCallback(() => {
    setTranscript('');
    setDuration(0);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setSegments([]);
    segmentsRef.current = [];
    lastSegmentEndRef.current = 0;
  }, [audioUrl]);

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
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
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
    audioUrl,
    segments,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
  };
}

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
