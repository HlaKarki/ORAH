'use client'

import { useState, useCallback } from 'react'
import InputScreen from '@/app/_components/InputScreen'
import TeachingScreen from '@/app/_components/TeachingScreen'
import RecordingScreen from '@/app/_components/RecordingScreen'
import AnalysisDashboard from '@/app/_components/AnalysisDashboard'

type AppState = 'input' | 'teaching' | 'recording' | 'analysis'

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
  const [state, setState] = useState<AppState>('input')
  const [topic, setTopic] = useState('')
  const [teachingData, setTeachingData] = useState<TeachingData | null>(null)
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [attemptHistory, setAttemptHistory] = useState<AttemptHistory[]>([])
  const [currentAttempt, setCurrentAttempt] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTopicSubmit = async (submittedTopic: string) => {
    setTopic(submittedTopic)
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/teach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: submittedTopic })
      })

      if (!response.ok) throw new Error('Failed to generate teaching')

      const data = await response.json()
      setTeachingData(data)
      setState('teaching')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTeachingComplete = () => {
    setState('recording')
  }

  const handleRecordingComplete = async (audioBlob: Blob | null, transcript?: string) => {
    setIsLoading(true)
    setError(null)

    try {
      let userTranscript = transcript

      // If we have audio but no transcript, transcribe it
      if (audioBlob && !transcript) {
        const formData = new FormData()
        formData.append('audio', audioBlob)

        const transcribeResponse = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData
        })

        if (transcribeResponse.ok) {
          const transcribeData = await transcribeResponse.json()
          userTranscript = transcribeData.transcript
        }
      }

      if (!userTranscript) {
        throw new Error('No explanation provided')
      }

      // Analyze the explanation
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          teaching: teachingData?.teaching,
          question: teachingData?.question,
          userExplanation: userTranscript
        })
      })

      if (!response.ok) throw new Error('Failed to analyze explanation')

      const analysis = await response.json()
      setAnalysisData(analysis)

      // Add to attempt history
      setAttemptHistory(prev => [...prev, {
        attempt: currentAttempt,
        score: analysis.score,
        transcript: userTranscript!
      }])

      setState('analysis')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTryAgain = () => {
    setCurrentAttempt(prev => prev + 1)
    setAnalysisData(null)
    setState('recording')
  }

  const handleNextQuestion = useCallback(async () => {
    if (!analysisData?.nextQuestion) return

    setIsLoading(true)
    setError(null)
    setCurrentAttempt(1)
    setAttemptHistory([])

    try {
      // Use the next question as the new teaching prompt
      const response = await fetch('/api/teach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          focusQuestion: analysisData.nextQuestion
        })
      })

      if (!response.ok) throw new Error('Failed to generate next teaching')

      const data = await response.json()
      setTeachingData(data)
      setAnalysisData(null)
      setState('teaching')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }, [analysisData, topic])

  const handleNewTopic = () => {
    setTopic('')
    setTeachingData(null)
    setAnalysisData(null)
    setAttemptHistory([])
    setCurrentAttempt(1)
    setError(null)
    setState('input')
  }

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400 bg-clip-text text-transparent">
            Orah
          </h1>
          <p className="text-gray-400 mt-2 text-sm md:text-base">
            &ldquo;If you can&apos;t explain it, you don&apos;t understand it&rdquo;
          </p>
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

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-8 rounded-2xl flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-300">Processing...</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        {state === 'input' && (
          <InputScreen onSubmit={handleTopicSubmit} />
        )}

        {state === 'teaching' && teachingData && (
          <TeachingScreen
            teaching={teachingData.teaching}
            question={teachingData.question}
            audioUrl={teachingData.audioUrl}
            onComplete={handleTeachingComplete}
          />
        )}

        {state === 'recording' && teachingData && (
          <RecordingScreen
            question={teachingData.question}
            attempt={currentAttempt}
            onComplete={handleRecordingComplete}
          />
        )}

        {state === 'analysis' && analysisData && (
          <AnalysisDashboard
            analysis={analysisData}
            attemptHistory={attemptHistory}
            onTryAgain={handleTryAgain}
            onNextQuestion={handleNextQuestion}
            onNewTopic={handleNewTopic}
          />
        )}
      </div>
    </main>
  )
}
