'use client'

import { useState } from 'react'
import QuizScreen from '@/app/_components/QuizScreen'
import ProfileDashboard from '@/app/_components/ProfileDashboard'
import TeachingScreen from '@/app/_components/TeachingScreen'
import RecordingScreen from '@/app/_components/RecordingScreen'
import AnalysisDashboard from '@/app/_components/AnalysisDashboard'
import { useLearnerMemory } from '@/hooks/useLearnerMemory'

type LearningState = 'input' | 'teaching' | 'recording' | 'analysis' | 'quiz'

interface TeachingData {
  teaching: string
  question: string
  audioUrl?: string
}

interface AnalysisData {
  score: number
  whatYouNailed: string[]
  whatYouMissed: string[]
  howToImprove: string[]
  nextQuestion: string
}

interface AttemptHistory {
  attempt: number
  score: number
  transcript: string
}

export default function Home() {
  const [userInput, setUserInput] = useState('')
  const [state, setState] = useState<LearningState>('input')
  const [showProfile, setShowProfile] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Learning flow state
  const [teachingData, setTeachingData] = useState<TeachingData | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [attemptNumber, setAttemptNumber] = useState(1)
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [attemptHistory, setAttemptHistory] = useState<AttemptHistory[]>([])
  const [isLoading, setIsLoading] = useState(false)

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

  const handleStartLearning = async () => {
    if (!userInput.trim()) return
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/teach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: userInput,
          learnerProfile: profile
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to generate teaching content')
      }

      const data = await response.json()
      setTeachingData({
        teaching: data.teaching,
        question: data.question,
        audioUrl: data.audioUrl
      })
      setCurrentQuestion(data.question)
      setState('teaching')
    } catch (err) {
      console.error('Teaching generation error:', err)
      setError('Failed to generate teaching content. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartQuiz = () => {
    if (!userInput.trim()) return
    setState('quiz')
  }

  const handleTeachingComplete = () => {
    setState('recording')
  }

  const handleRecordingComplete = async (audioBlob: Blob | null, transcript?: string) => {
    setIsLoading(true)
    setError(null)

    try {
      let finalTranscript = transcript

      // If audio was recorded, transcribe it first
      if (audioBlob && !transcript) {
        const formData = new FormData()
        formData.append('audio', audioBlob)

        const transcribeResponse = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData
        })

        if (!transcribeResponse.ok) {
          throw new Error('Transcription failed')
        }

        const transcribeData = await transcribeResponse.json()
        finalTranscript = transcribeData.transcript
      }

      if (!finalTranscript) {
        throw new Error('No explanation provided')
      }

      // Analyze the explanation
      const analyzeResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: userInput,
          teaching: teachingData?.teaching || '',
          question: currentQuestion,
          userExplanation: finalTranscript,
          attempt: attemptNumber,
          learnerProfile: profile
        })
      })

      if (!analyzeResponse.ok) {
        const errorData = await analyzeResponse.json().catch(() => ({}))
        throw new Error(errorData.error || 'Analysis failed')
      }

      const analyzeData = await analyzeResponse.json()
      
      // Store attempt history
      const newAttempt: AttemptHistory = {
        attempt: attemptNumber,
        score: analyzeData.score,
        transcript: finalTranscript
      }
      setAttemptHistory(prev => [...prev, newAttempt])
      
      setAnalysisData(analyzeData)
      setState('analysis')
    } catch (err) {
      console.error('Recording/Analysis error:', err)
      setError('Failed to analyze your explanation. Please try again.')
      setState('recording')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTryAgain = () => {
    setAttemptNumber(prev => prev + 1)
    setState('recording')
  }

  const handleNextQuestion = () => {
    if (analysisData?.nextQuestion) {
      setCurrentQuestion(analysisData.nextQuestion)
      setAttemptNumber(1)
    setAttemptHistory([])
      setState('recording')
    }
  }

  const handleNewTopic = () => {
    setUserInput('')
    setTeachingData(null)
    setCurrentQuestion('')
    setAttemptNumber(1)
    setAnalysisData(null)
    setAttemptHistory([])
    setState('input')
  }

  const handleStartQuizFromAnalysis = () => {
    setState('quiz')
  }

  const handleQuizComplete = (score: number) => {
    if (profile) {
      addTopicCompleted(`${userInput} (Quiz)`, score, 1)
    }
    // Just go back to input, don't reset everything
    setState('input')
  }

  const handleBackToInput = () => {
    setState('input')
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
    handleNewTopic()
  }

  return (
    <main className="min-h-screen bg-[#08080A]">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-12">
        {/* Header */}
        <header className="mb-12 relative">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5C00]"></div>
              <h1 className="text-lg font-semibold tracking-[0.15em] text-white">
                EXPLAINIT
          </h1>
            </div>
            
            {/* Profile Button */}
            {profile && !showProfile && profile.topicsCovered.length > 0 && (
              <button
                onClick={handleShowProfile}
                className="flex items-center gap-3 bg-[#111113] hover:bg-[#1A1A1D] 
                         border border-[#1F1F23] rounded-xl px-4 py-2.5 transition-all group"
                title="View Learning Profile"
              >
                <div className="w-9 h-9 rounded-full bg-[#2A2A2D] flex items-center justify-center">
                  <span className="text-xs font-semibold text-[#8B8B90]">
                    {profile.topicsCovered.length}
                  </span>
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-sm font-medium text-white">Your Profile</div>
                  <div className="text-xs text-[#6B6B70]">{profile.topicsCovered.length} topics</div>
                </div>
                <svg className="w-4 h-4 text-[#6B6B70]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </header>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40">
            <div className="bg-[#111113] border border-[#1F1F23] rounded-2xl p-8 flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-[#FF5C00] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-white font-medium">Processing...</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        {state === 'input' && (
          <div className="space-y-10">
            {/* Title Section */}
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                What do you want<br />to understand?
              </h2>
              <p className="text-[#6B6B70] text-base">
                Paste any topic, article, or complex concept and we&apos;ll break it down simply.
              </p>
            </div>

            {/* Input Card */}
            <div className="bg-[#111113] border border-[#1F1F23] rounded-2xl p-6 space-y-5">
              {/* Text Input Area */}
              <div className="relative">
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Type or paste anything here...

e.g. &quot;What is quantum computing?&quot; or paste a Wikipedia article"
                  className="w-full bg-[#0C0C0E] border border-[#2A2A2E] rounded-xl p-4 text-[15px] text-white placeholder:text-[#4A4A4F]
                           focus:border-[#FF5C00] focus:ring-1 focus:ring-[#FF5C00]/20
                           focus:outline-none transition-all resize-none h-36 leading-relaxed"
                  disabled={isRecording || isTranscribing}
                  autoFocus
                />
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-end">
                {/* Mic Button */}
                <div className="flex items-center gap-3">
                  {/* Voice Input Button */}
                  <button
                    type="button"
                    onClick={startRecording}
                    disabled={isTranscribing || isRecording}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all
                             ${isRecording
                               ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                               : 'bg-[#1A1A1D] hover:bg-[#1F1F23] border border-[#2A2A2E]'
                             } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={isRecording ? 'Recording...' : 'Start voice input'}
                  >
                    <svg className={`w-5 h-5 ${isRecording ? 'text-white' : 'text-[#8B8B90]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Status Messages */}
              {isRecording && (
                <div className="flex items-center justify-center gap-2 text-red-400 text-sm">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  Recording... (auto-stops in 30s)
                </div>
              )}
              {isTranscribing && (
                <div className="flex items-center justify-center gap-2 text-[#FF5C00] text-sm">
                  <div className="w-4 h-4 border-2 border-[#FF5C00] border-t-transparent rounded-full animate-spin"></div>
                  Transcribing your voice...
                </div>
              )}

              {/* Action Buttons */}
              {userInput.trim() && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <button
                    onClick={handleStartLearning}
                    disabled={isLoading}
                    className="bg-gradient-to-br from-[#FF5C00] to-[#FF8A4C]
                             hover:from-[#FF6A10] hover:to-[#FF9A5C]
                             disabled:from-[#2A2A2D] disabled:to-[#2A2A2D] disabled:cursor-not-allowed
                             text-white font-semibold py-4 px-6 rounded-xl
                             transition-all duration-200 transform hover:scale-[1.02]
                             flex items-center justify-center gap-2 shadow-lg shadow-[#FF5C00]/20
                             disabled:shadow-none"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Start Learning
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleStartQuiz}
                    className="bg-[#1A1A1D] hover:bg-[#1F1F23]
                             border border-[#2A2A2E]
                             text-white font-semibold py-4 px-6 rounded-xl
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

        {state === 'teaching' && teachingData && (
          <div className="space-y-6">
            <button
              onClick={handleBackToInput}
              className="flex items-center gap-2 text-[#ADADB0] hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          <TeachingScreen
            teaching={teachingData.teaching}
            question={teachingData.question}
            audioUrl={teachingData.audioUrl}
            onComplete={handleTeachingComplete}
          />
          </div>
        )}

        {state === 'recording' && (
          <div className="space-y-6">
            <button
              onClick={handleBackToInput}
              className="flex items-center gap-2 text-[#ADADB0] hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          <RecordingScreen
              question={currentQuestion}
              attempt={attemptNumber}
            onComplete={handleRecordingComplete}
          />
          </div>
        )}

        {state === 'analysis' && analysisData && (
          <div className="space-y-6">
            <button
              onClick={handleBackToInput}
              className="flex items-center gap-2 text-[#ADADB0] hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          <AnalysisDashboard
            analysis={analysisData}
            attemptHistory={attemptHistory}
            onTryAgain={handleTryAgain}
            onNextQuestion={handleNextQuestion}
            onNewTopic={handleNewTopic}
              onStartQuiz={handleStartQuizFromAnalysis}
            />
          </div>
        )}

        {state === 'quiz' && (
          <div className="space-y-6">
            <button
              onClick={handleBackToInput}
              className="flex items-center gap-2 text-[#ADADB0] hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
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
