'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface VoiceRecorderProps {
  onComplete: (audioBlob: Blob) => void
}

export default function VoiceRecorder({ onComplete }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [duration, setDuration] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [permissionDenied, setPermissionDenied] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
      }

      mediaRecorder.start()
      setIsRecording(true)
      setDuration(0)

      timerRef.current = setInterval(() => {
        setDuration(d => d + 1)
      }, 1000)

    } catch (err) {
      console.error('Error accessing microphone:', err)
      setPermissionDenied(true)
    }
  }

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      streamRef.current?.getTracks().forEach(track => track.stop())
      setIsRecording(false)
      setIsPaused(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRecording])

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      timerRef.current = setInterval(() => {
        setDuration(d => d + 1)
      }, 1000)
    }
  }

  const resetRecording = () => {
    setAudioBlob(null)
    setAudioUrl(null)
    setDuration(0)
    chunksRef.current = []
  }

  const handleSubmit = () => {
    if (audioBlob) {
      onComplete(audioBlob)
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Auto-stop after 3 minutes
  useEffect(() => {
    if (duration >= 180 && isRecording) {
      stopRecording()
    }
  }, [duration, isRecording, stopRecording])

  if (permissionDenied) {
    return (
      <div className="text-center py-8">
        <div className="w-20 h-20 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-red-400 font-medium mb-2">Microphone access denied</p>
        <p className="text-gray-500 text-sm">
          Please enable microphone access in your browser settings and refresh the page.
        </p>
      </div>
    )
  }

  return (
    <div className="text-center">
      {/* Recording Visualization */}
      <div className="relative w-40 h-40 mx-auto mb-8">
        {isRecording && !isPaused && (
          <>
            <div className="absolute inset-0 bg-purple-500/20 rounded-full recording-pulse" />
            <div className="absolute inset-4 bg-purple-500/30 rounded-full recording-pulse" style={{ animationDelay: '0.5s' }} />
          </>
        )}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={!!audioBlob}
          className={`absolute inset-8 rounded-full flex items-center justify-center transition-all
                     ${isRecording
                       ? 'bg-red-500 hover:bg-red-600'
                       : audioBlob
                         ? 'bg-gray-600'
                         : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105'}`}
        >
          {isRecording ? (
            <div className="w-8 h-8 bg-white rounded-sm" />
          ) : (
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>
      </div>

      {/* Timer */}
      <p className={`text-4xl font-mono mb-4 ${isRecording && !isPaused ? 'text-red-400' : 'text-gray-400'}`}>
        {formatTime(duration)}
      </p>

      {/* Status Text */}
      <p className="text-gray-400 mb-6">
        {!isRecording && !audioBlob && 'Tap to start recording'}
        {isRecording && !isPaused && 'Recording... Tap to stop'}
        {isPaused && 'Paused'}
        {audioBlob && 'Recording complete!'}
      </p>

      {/* Controls */}
      {isRecording && (
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={isPaused ? resumeRecording : pauseRecording}
            className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg transition-colors"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        </div>
      )}

      {/* Playback */}
      {audioUrl && (
        <div className="bg-gray-900/50 rounded-xl p-4 mb-6">
          <p className="text-gray-400 text-sm mb-3">Review your recording:</p>
          <audio src={audioUrl} controls className="w-full" />
        </div>
      )}

      {/* Submit / Re-record */}
      {audioBlob && (
        <div className="flex gap-4 justify-center">
          <button
            onClick={resetRecording}
            className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-xl transition-colors"
          >
            Re-record
          </button>
          <button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-purple-600 to-pink-600
                     hover:from-purple-500 hover:to-pink-500
                     px-8 py-3 rounded-xl font-semibold transition-all"
          >
            Submit Recording
          </button>
        </div>
      )}

      {/* Max time warning */}
      {duration >= 150 && isRecording && (
        <p className="text-orange-400 text-sm mt-4">
          Recording will auto-stop at 3:00
        </p>
      )}
    </div>
  )
}
