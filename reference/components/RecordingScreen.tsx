'use client'

import { useState } from 'react'
import VoiceRecorder from './VoiceRecorder'

interface RecordingScreenProps {
  question: string
  attempt: number
  onComplete: (audioBlob: Blob | null, transcript?: string) => void
}

export default function RecordingScreen({
  question,
  attempt,
  onComplete
}: RecordingScreenProps) {
  const [mode, setMode] = useState<'choose' | 'voice' | 'type'>('choose')
  const [typedExplanation, setTypedExplanation] = useState('')

  const handleVoiceComplete = (audioBlob: Blob) => {
    onComplete(audioBlob)
  }

  const handleTypeSubmit = () => {
    if (typedExplanation.trim()) {
      onComplete(null, typedExplanation.trim())
    }
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-10 border border-gray-700">
      {/* Attempt Badge */}
      {attempt > 1 && (
        <div className="inline-block bg-orange-500/20 text-orange-300 text-sm px-3 py-1 rounded-full mb-4">
          Attempt #{attempt}
        </div>
      )}

      {/* Question */}
      <div className="bg-purple-900/30 border border-purple-500/30 rounded-xl p-6 mb-8">
        <p className="text-purple-300 text-sm font-medium mb-2">EXPLAIN THIS:</p>
        <p className="text-xl md:text-2xl text-white font-medium">{question}</p>
      </div>

      {/* Mode Selection */}
      {mode === 'choose' && (
        <div className="space-y-4">
          <p className="text-gray-400 text-center mb-6">How would you like to explain?</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setMode('voice')}
              className="bg-gray-700/50 hover:bg-gray-700 border border-gray-600
                       rounded-xl p-6 transition-all hover:border-purple-500 group"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500
                            rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-white">Voice Recording</p>
              <p className="text-gray-400 text-sm mt-1">Speak your explanation out loud</p>
            </button>

            <button
              onClick={() => setMode('type')}
              className="bg-gray-700/50 hover:bg-gray-700 border border-gray-600
                       rounded-xl p-6 transition-all hover:border-purple-500 group"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-cyan-500
                            rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-white">Type It Out</p>
              <p className="text-gray-400 text-sm mt-1">Write your explanation</p>
            </button>
          </div>
        </div>
      )}

      {/* Voice Recording Mode */}
      {mode === 'voice' && (
        <div>
          <button
            onClick={() => setMode('choose')}
            className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <VoiceRecorder onComplete={handleVoiceComplete} />
        </div>
      )}

      {/* Typing Mode */}
      {mode === 'type' && (
        <div>
          <button
            onClick={() => setMode('choose')}
            className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <textarea
            value={typedExplanation}
            onChange={(e) => setTypedExplanation(e.target.value)}
            placeholder="Type your explanation here... Pretend you're teaching this to a 5-year-old or someone who knows nothing about the topic."
            className="w-full bg-gray-900/50 border border-gray-600 rounded-xl p-4 text-lg
                     focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20
                     focus:outline-none transition-all resize-none h-48"
            autoFocus
          />

          <div className="flex items-center justify-between mt-4">
            <p className="text-gray-500 text-sm">
              {typedExplanation.length} characters
            </p>
            <button
              onClick={handleTypeSubmit}
              disabled={typedExplanation.trim().length < 50}
              className="bg-gradient-to-r from-purple-600 to-pink-600
                       hover:from-purple-500 hover:to-pink-500
                       disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed
                       text-white font-semibold py-3 px-8 rounded-xl
                       transition-all duration-200"
            >
              Submit Explanation
            </button>
          </div>
          {typedExplanation.trim().length < 50 && typedExplanation.length > 0 && (
            <p className="text-orange-400 text-sm mt-2">
              Please write at least 50 characters for a meaningful analysis
            </p>
          )}
        </div>
      )}

      {/* Tips */}
      <div className="mt-8 bg-gray-900/30 rounded-xl p-4">
        <p className="text-gray-400 text-sm font-medium mb-2">Tips for a great explanation:</p>
        <ul className="text-gray-500 text-sm space-y-1">
          <li>• Use simple language - avoid jargon</li>
          <li>• Give an example or analogy</li>
          <li>• Explain the &ldquo;why&rdquo; not just the &ldquo;what&rdquo;</li>
          <li>• Pretend you&apos;re teaching a curious friend</li>
        </ul>
      </div>
    </div>
  )
}
