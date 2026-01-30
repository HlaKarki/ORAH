'use client'

import { useState } from 'react'
import QuizScreen from '@/app/_components/QuizScreen'
import ProfileDashboard from '@/app/_components/ProfileDashboard'
import { useLearnerMemory } from '@/hooks/useLearnerMemory'

export default function Home() {
  const [userInput, setUserInput] = useState('')
  const [mode, setMode] = useState<'input' | 'learn' | 'quiz' | null>('input')
  const [showProfile, setShowProfile] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Learner memory hook
  const { 
    profile, 
    addTopicCompleted, 
    resetLearnerProfile 
  } = useLearnerMemory()


  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const audioChunks: Blob[] = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
        stream.getTracks().forEach((track) => track.stop())
        await transcribeAudio(audioBlob)
      }

      mediaRecorder.start()
      setIsRecording(true)
      setError(null)

      // Auto-stop after 30 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop()
          setIsRecording(false)
        }
      }, 30000)
    } catch (err) {
      console.error('Microphone error:', err)
      setError('Microphone access denied')
    }
  }

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true)
    setIsRecording(false)
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

      const data = await response.json()
      setUserInput((prev) => (prev ? `${prev} ${data.transcript}` : data.transcript).trim())
    } catch (err) {
      console.error('Transcription error:', err)
      setError('Failed to transcribe audio')
    } finally {
      setIsTranscribing(false)
    }
  }

  const handleStartLearning = () => {
    if (!userInput.trim()) return
    setMode('learn')
    // In full implementation, this would call /api/teach
    alert('Learning mode coming soon! This will teach you about: ' + userInput)
  }

  const handleStartQuiz = () => {
    if (!userInput.trim()) return
    setMode('quiz')
  }

  const handleQuizComplete = (score: number) => {
    if (profile) {
      addTopicCompleted(`${userInput} (Quiz)`, score, 1)
    }
    // Return to input
    setMode('input')
    setUserInput('')
  }

  const handleBackToInput = () => {
    setMode('input')
  }

  const handleShowProfile = () => {
    setShowProfile(true)
  }

  const handleCloseProfile = () => {
    setShowProfile(false)
  }

  const handleResetProfile = () => {
    resetLearnerProfile()
    setShowProfile(false)
    setMode('input')
    setUserInput('')
  }

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8 relative">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400 bg-clip-text text-transparent">
            Orah
          </h1>
          <p className="text-gray-400 mt-2 text-sm md:text-base">
            &ldquo;If you can&apos;t explain it, you don&apos;t understand it&rdquo;
          </p>
          
          {/* Profile Button */}
          {profile && !showProfile && profile.topicsCovered.length > 0 && (
            <button
              onClick={handleShowProfile}
              className="absolute right-0 top-0 bg-gray-800/50 hover:bg-gray-700/50 
                       border border-gray-600 rounded-xl p-3 transition-all group"
              title="View Learning Profile"
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" 
                     fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-xs text-gray-400 group-hover:text-purple-400 transition-colors">
                  {profile.topicsCovered.length}
                </span>
              </div>
            </button>
          )}
        </header>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-4 underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main Content */}
        {mode === 'input' && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-10 border border-gray-700">
            <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-center">
              What do you want to learn?
            </h2>
            <p className="text-gray-400 text-center mb-8">
              Type or speak your topic, then choose to learn or take a quiz
            </p>

            <div className="space-y-4">
              {/* Text Input */}
              <div className="relative">
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
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
                  onClick={startRecording}
                  disabled={isTranscribing || isRecording}
                  className={`absolute bottom-4 right-4 p-3 rounded-full transition-all
                           ${isRecording
                             ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                             : 'bg-purple-600 hover:bg-purple-500'
                           } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={isRecording ? 'Recording...' : 'Start voice input'}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
              </div>

              {/* Status Messages */}
              {isRecording && (
                <p className="text-center text-red-400 text-sm">🔴 Recording... (auto-stops in 30s)</p>
              )}
              {isTranscribing && (
                <p className="text-center text-purple-400 text-sm">Transcribing your voice...</p>
              )}

              {/* Action Buttons */}
              {userInput.trim() && (
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button
                    onClick={handleStartLearning}
                    className="bg-gradient-to-r from-purple-600 to-pink-600
                             hover:from-purple-500 hover:to-pink-500
                             text-white font-semibold py-4 px-6 rounded-xl text-lg
                             transition-all duration-200 transform hover:scale-[1.02]
                             flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Start Learning
                  </button>
                  <button
                    onClick={handleStartQuiz}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600
                             hover:from-blue-500 hover:to-cyan-500
                             text-white font-semibold py-4 px-6 rounded-xl text-lg
                             transition-all duration-200 transform hover:scale-[1.02]
                             flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Take Quiz
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {mode === 'learn' && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-10 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">Learning Mode</h2>
            <p className="text-gray-300 mb-4">Topic: <span className="text-purple-400">{userInput}</span></p>
            <p className="text-gray-400 mb-6">Learning implementation coming soon...</p>
            <button
              onClick={handleBackToInput}
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl"
            >
              ← Back
            </button>
          </div>
        )}

        {mode === 'quiz' && (
          <div>
            <button
              onClick={handleBackToInput}
              className="mb-4 text-gray-400 hover:text-white flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <QuizScreen
              topic={userInput}
              onComplete={handleQuizComplete}
              onGenerateMore={() => {}}
            />
          </div>
        )}

        {/* Profile Overlay */}
        {showProfile && profile && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="max-w-4xl w-full">
              <ProfileDashboard
                profile={profile}
                onClose={handleCloseProfile}
                onReset={handleResetProfile}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
