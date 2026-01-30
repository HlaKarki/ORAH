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
    <div className="bg-[#111113] border border-[#1F1F23] rounded-2xl p-6 md:p-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-[#FF5C00] to-[#FF8A4C] rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-white">Listen & Learn</h2>
      </div>

      {/* Audio Player */}
      {audioUrl && (
        <div className="bg-[#0C0C0E] border border-[#2A2A2E] rounded-xl p-6 mb-6">
          <audio ref={audioRef} src={audioUrl} />
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlayPause}
              className="w-16 h-16 bg-gradient-to-br from-[#FF5C00] to-[#FF8A4C] rounded-full
                       flex items-center justify-center hover:scale-105 transition-transform
                       shadow-lg shadow-[#FF5C00]/20"
            >
              {isPlaying ? (
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 ml-1 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <div className="flex-1">
              <p className="text-[#ADADB0] text-sm">
                {isPlaying ? 'Playing...' : hasListened ? 'Click to replay' : 'Click to listen'}
              </p>
              <p className="text-[#6B6B70] text-xs mt-1">~60-90 seconds</p>
            </div>
            <button
              onClick={() => setShowText(!showText)}
              className="text-[#FF5C00] hover:text-[#FF8A4C] text-sm underline"
            >
              {showText ? 'Hide text' : 'Show text'}
            </button>
          </div>
        </div>
      )}

      {/* Text Content */}
      {(showText || !audioUrl) && (
        <div className="bg-[#0C0C0E] border border-[#2A2A2E] rounded-xl p-6 mb-6 max-h-80 overflow-y-auto">
          <p className="text-[#ADADB0] leading-relaxed whitespace-pre-wrap">{teaching}</p>
        </div>
      )}

      {/* Question Preview */}
      <div className="bg-[#FF5C00]/10 border border-[#FF5C00]/30 rounded-xl p-6 mb-6">
        <p className="text-[#FF5C00] text-xs font-semibold tracking-wider mb-2">YOU&apos;LL BE ASKED TO EXPLAIN</p>
        <p className="text-xl text-white font-medium">{question}</p>
      </div>

      {/* Continue Button */}
      <button
        onClick={onComplete}
        disabled={!!(audioUrl && !hasListened)}
        className="w-full bg-gradient-to-br from-[#FF5C00] to-[#FF8A4C]
                 hover:from-[#FF6A10] hover:to-[#FF9A5C]
                 disabled:from-[#2A2A2D] disabled:to-[#2A2A2D] disabled:cursor-not-allowed
                 text-white font-semibold py-4 px-6 rounded-xl text-lg
                 transition-all duration-200 shadow-lg shadow-[#FF5C00]/20
                 disabled:shadow-none"
      >
        {audioUrl && !hasListened ? 'Listen first, then continue' : 'I\'m ready to explain!'}
      </button>
    </div>
  )
}
