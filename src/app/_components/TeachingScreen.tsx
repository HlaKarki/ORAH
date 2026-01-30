'use client'

import { useState, useRef, useEffect } from 'react'

interface TeachingScreenProps {
  teaching: string
  question: string
  audioUrl?: string
  onComplete: () => void
}

export default function TeachingScreen({
  teaching,
  question,
  audioUrl,
  onComplete
}: TeachingScreenProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasListened, setHasListened] = useState(false)
  const [showText, setShowText] = useState(!audioUrl)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => {
        setIsPlaying(false)
        setHasListened(true)
      }
    }
  }, [])

  const togglePlayPause = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
      if (!hasListened) setHasListened(true)
    }
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-10 border border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold">Listen & Learn</h2>
      </div>

      {/* Audio Player */}
      {audioUrl && (
        <div className="bg-gray-900/50 rounded-xl p-6 mb-6">
          <audio ref={audioRef} src={audioUrl} />
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlayPause}
              className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full
                       flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <div className="flex-1">
              <p className="text-gray-400 text-sm">
                {isPlaying ? 'Playing...' : hasListened ? 'Click to replay' : 'Click to listen'}
              </p>
              <p className="text-gray-500 text-xs mt-1">~60-90 seconds</p>
            </div>
            <button
              onClick={() => setShowText(!showText)}
              className="text-purple-400 hover:text-purple-300 text-sm underline"
            >
              {showText ? 'Hide text' : 'Show text'}
            </button>
          </div>
        </div>
      )}

      {/* Text Content */}
      {(showText || !audioUrl) && (
        <div className="bg-gray-900/30 rounded-xl p-6 mb-6 max-h-80 overflow-y-auto">
          <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{teaching}</p>
        </div>
      )}

      {/* Question Preview */}
      <div className="bg-purple-900/30 border border-purple-500/30 rounded-xl p-6 mb-6">
        <p className="text-purple-300 text-sm font-medium mb-2">YOU&apos;LL BE ASKED TO EXPLAIN:</p>
        <p className="text-xl text-white font-medium">{question}</p>
      </div>

      {/* Continue Button */}
      <button
        onClick={onComplete}
        disabled={audioUrl && !hasListened}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600
                 hover:from-purple-500 hover:to-pink-500
                 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed
                 text-white font-semibold py-4 px-6 rounded-xl text-lg
                 transition-all duration-200"
      >
        {audioUrl && !hasListened ? 'Listen first, then continue' : 'I\'m ready to explain!'}
      </button>
    </div>
  )
}
