'use client'

import { useState, useRef } from 'react'

interface InputScreenProps {
  onSubmit: (topic: string) => void
}

const EXAMPLE_TOPICS = [
  'How do transformers work in AI?',
  'What is quantum entanglement?',
  'How does the TCP/IP protocol work?',
  'Explain recursion in programming',
  'How do vaccines train the immune system?',
  'What is the blockchain?'
]

export default function InputScreen({ onSubmit }: InputScreenProps) {
  const [topic, setTopic] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (topic.trim()) {
      onSubmit(topic.trim())
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        stream.getTracks().forEach((track) => track.stop())
        await transcribeAudio(audioBlob)
      }

      mediaRecorder.start()
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)
      setError(null)
    } catch (err) {
      console.error('Microphone error:', err)
      setError('Microphone access denied')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true)
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob)

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Transcription failed')
      }

      const data = (await response.json()) as { transcript?: string }
      const transcript = data.transcript ?? ''
      setTopic((prev) => (prev ? `${prev} ${transcript}` : transcript).trim())
    } catch (err) {
      console.error('Transcription error:', err)
      setError('Failed to transcribe audio')
    } finally {
      setIsTranscribing(false)
    }
  }

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      void startRecording()
    }
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-10 border border-gray-700">
      <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-center">
        What do you want to master?
      </h2>
      <p className="text-gray-400 text-center mb-8">
        Type or speak your topic, and we&apos;ll teach you, then test your understanding
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., How do neural networks learn?"
            className="w-full bg-gray-900/50 border border-gray-600 rounded-xl p-4 text-lg
                     focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20
                     focus:outline-none transition-all resize-none h-32"
            disabled={isRecording || isTranscribing}
            autoFocus
          />

          {/* Voice Input Button */}
          <button
            type="button"
            onClick={toggleRecording}
            disabled={isTranscribing}
            className={`absolute bottom-4 right-4 p-3 rounded-full transition-all cursor-pointer
                     ${isRecording
                       ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                       : 'bg-purple-600 hover:bg-purple-500'
                     } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={isRecording ? 'Stop recording' : 'Start voice input'}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
        </div>

        {/* Status Messages */}
        {isRecording && (
          <p className="text-center text-purple-400 text-sm">Recording... Click the mic to stop</p>
        )}
        {isTranscribing && (
          <p className="text-center text-purple-400 text-sm">Transcribing your voice...</p>
        )}
        {error && (
          <p className="text-center text-red-400 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={!topic.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600
                   hover:from-purple-500 hover:to-pink-500
                   disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed
                   text-white font-semibold py-4 px-6 rounded-xl text-lg
                   transition-all duration-200 transform hover:scale-[1.02] cursor-pointer"
        >
          Start Learning
        </button>
      </form>

      <div className="mt-10">
        <p className="text-sm text-gray-500 mb-4 text-center">Try one of these:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {EXAMPLE_TOPICS.map((example) => (
            <button
              key={example}
              onClick={() => setTopic(example)}
              className="bg-gray-700/50 hover:bg-gray-700 text-gray-300 text-sm
                       px-3 py-2 rounded-lg transition-colors cursor-pointer"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
