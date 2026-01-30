/**
 * QuizScreen Component
 * Practice quiz interface for reinforcing learning
 */

'use client'

import { useState } from 'react'

interface QuizQuestion {
  question: string
  options: {
    A: string
    B: string
    C: string
    D: string
  }
  correctAnswer: 'A' | 'B' | 'C' | 'D'
  explanation: string
}

interface QuizScreenProps {
  topic: string
  onComplete: (score: number) => void
  onGenerateMore: () => void
}

export default function QuizScreen({ topic, onComplete, onGenerateMore }: QuizScreenProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [answers, setAnswers] = useState<Array<{ question: string, userAnswer: string, correctAnswer: string, isCorrect: boolean }>>([])

  const generateQuiz = async (diff: 'easy' | 'medium' | 'hard', count: number = 5) => {
    setIsGenerating(true)
    try {
      // Call OpenAI directly to generate quiz questions
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          difficulty: diff,
          count
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate quiz')
      }

      const data = await response.json()
      
      if (Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestions(data.questions)
        setQuizStarted(true)
        setCurrentQuestionIndex(0)
        setScore(0)
        setSelectedAnswer(null)
        setShowExplanation(false)
      } else {
        throw new Error('No questions generated')
      }
    } catch (error) {
      console.error('Quiz generation error:', error)
      alert('Failed to generate quiz. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAnswerSelect = (answer: string) => {
    if (showExplanation) return
    setSelectedAnswer(answer)
  }

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return
    
    const currentQuestion = questions[currentQuestionIndex]
    if (!currentQuestion) return

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer
    if (isCorrect) {
      setScore(score + 1)
    }
    
    // Track the answer
    setAnswers(prev => [...prev, {
      question: currentQuestion.question,
      userAnswer: selectedAnswer,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect
    }])
    
    setShowExplanation(true)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    } else {
      // Quiz complete - show results
      setQuizCompleted(true)
    }
  }

  const handleFinishQuiz = () => {
    const finalScore = (score / questions.length) * 10
    onComplete(Math.round(finalScore))
  }

  const handleRetakeQuiz = () => {
    setQuizCompleted(false)
    setQuizStarted(false)
    setScore(0)
    setAnswers([])
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setShowExplanation(false)
  }

  const currentQuestion = questions[currentQuestionIndex]

  // Quiz results screen
  if (quizCompleted) {
    const percentage = (score / questions.length) * 100
    const finalScore = Math.round((score / questions.length) * 10)
    
    return (
      <div className="bg-[#111113] border border-[#1F1F23] rounded-2xl p-6 md:p-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 text-white">Quiz Complete! 🎉</h2>
          <p className="text-[#6B6B70]">Here's how you did</p>
        </div>

        {/* Score Display */}
        <div className="bg-gradient-to-br from-[#FF5C00]/20 to-[#FF8A4C]/20 border border-[#FF5C00]/30 rounded-2xl p-8 mb-6 text-center">
          <div className="text-6xl font-bold mb-2">
            <span className={percentage >= 80 ? 'text-green-400' : percentage >= 60 ? 'text-yellow-400' : 'text-[#FF5C00]'}>
              {score}/{questions.length}
            </span>
          </div>
          <p className="text-2xl text-[#ADADB0] mb-2">{percentage.toFixed(0)}% Correct</p>
          <p className="text-lg text-[#FF5C00]">Score: {finalScore}/10</p>
        </div>

        {/* Performance Message */}
        <div className="bg-[#0C0C0E] border border-[#2A2A2E] rounded-xl p-6 mb-6 text-center">
          {percentage >= 80 && (
            <>
              <p className="text-2xl mb-2">🌟 Excellent Work!</p>
              <p className="text-[#6B6B70]">You have a strong understanding of this topic.</p>
            </>
          )}
          {percentage >= 60 && percentage < 80 && (
            <>
              <p className="text-2xl mb-2">👍 Good Job!</p>
              <p className="text-[#6B6B70]">You're on the right track. Review the questions you missed.</p>
            </>
          )}
          {percentage < 60 && (
            <>
              <p className="text-2xl mb-2">📚 Keep Learning!</p>
              <p className="text-[#6B6B70]">Don't worry! Review the material and try again.</p>
            </>
          )}
        </div>

        {/* Answer Review */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-[#ADADB0]">Review Your Answers</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {answers.map((answer, index) => (
              <div 
                key={index}
                className={`p-4 rounded-xl border ${
                  answer.isCorrect 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : 'bg-red-500/10 border-red-500/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`text-2xl ${answer.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                    {answer.isCorrect ? '✓' : '✗'}
                  </span>
                  <div className="flex-1">
                    <p className="text-white font-medium mb-2">Q{index + 1}: {answer.question}</p>
                    <div className="text-sm space-y-1">
                      <p className={answer.isCorrect ? 'text-green-300' : 'text-red-300'}>
                        Your answer: <span className="font-semibold">{answer.userAnswer}</span>
                      </p>
                      {!answer.isCorrect && (
                        <p className="text-green-300">
                          Correct answer: <span className="font-semibold">{answer.correctAnswer}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleRetakeQuiz}
            className="flex-1 bg-[#1A1A1D] hover:bg-[#1F1F23] border border-[#2A2A2E] text-white font-semibold
                     py-4 px-6 rounded-xl transition-all"
          >
            Retake Quiz
          </button>
          <button
            onClick={handleFinishQuiz}
            className="flex-1 bg-gradient-to-br from-[#FF5C00] to-[#FF8A4C]
                     hover:from-[#FF6A10] hover:to-[#FF9A5C]
                     text-white font-semibold py-4 px-6 rounded-xl transition-all
                     shadow-lg shadow-[#FF5C00]/20"
          >
            Continue Learning
          </button>
        </div>
      </div>
    )
  }

  // Quiz setup screen
  if (!quizStarted) {
    return (
      <div className="bg-[#111113] border border-[#1F1F23] rounded-2xl p-6 md:p-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-[#FF5C00] to-[#FF8A4C] rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-white">Practice Quiz</h2>
        </div>

        <div className="bg-[#FF5C00]/10 border border-[#FF5C00]/30 rounded-xl p-6 mb-6">
          <p className="text-[#FF5C00] text-xs font-semibold tracking-wider mb-2">TOPIC</p>
          <p className="text-xl text-white font-medium">{topic}</p>
        </div>

        <div className="mb-6">
          <label className="block text-[#ADADB0] text-sm font-medium mb-3">
            Select Difficulty:
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['easy', 'medium', 'hard'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                className={`py-3 px-4 rounded-xl font-medium transition-all
                  ${difficulty === diff
                    ? 'bg-gradient-to-br from-[#FF5C00] to-[#FF8A4C] text-white shadow-lg shadow-[#FF5C00]/20'
                    : 'bg-[#1A1A1D] border border-[#2A2A2E] text-[#ADADB0] hover:bg-[#1F1F23]'
                  }`}
              >
                {diff.charAt(0).toUpperCase() + diff.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => generateQuiz(difficulty, 5)}
          disabled={isGenerating}
          className="w-full bg-gradient-to-br from-[#FF5C00] to-[#FF8A4C]
                   hover:from-[#FF6A10] hover:to-[#FF9A5C]
                   disabled:from-[#2A2A2D] disabled:to-[#2A2A2D] disabled:cursor-not-allowed
                   text-white font-semibold py-4 px-6 rounded-xl text-lg
                   transition-all duration-200 shadow-lg shadow-[#FF5C00]/20
                   disabled:shadow-none flex items-center justify-center gap-2"
        >
          {isGenerating && (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
          {isGenerating ? 'Generating Quiz...' : 'Start Quiz (5 Questions)'}
        </button>
      </div>
    )
  }

  // Quiz in progress
  return (
    <div className="bg-[#111113] border border-[#1F1F23] rounded-2xl p-6 md:p-10">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-[#6B6B70] mb-2">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span>Score: {score}/{questions.length}</span>
        </div>
        <div className="w-full bg-[#2A2A2D] rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-[#FF5C00] to-[#FF8A4C] h-2 rounded-full transition-all"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      {currentQuestion && (
        <>
          <div className="bg-[#0C0C0E] border border-[#2A2A2E] rounded-xl p-6 mb-6">
            <p className="text-xl text-white font-medium mb-6 leading-relaxed">
              {currentQuestion.question}
            </p>

            {/* Options */}
            <div className="space-y-3">
              {Object.entries(currentQuestion.options).map(([key, value]) => {
                const isSelected = selectedAnswer === key
                const isCorrect = key === currentQuestion.correctAnswer
                const showResult = showExplanation

                return (
                  <button
                    key={key}
                    onClick={() => handleAnswerSelect(key)}
                    disabled={showExplanation}
                    className={`w-full text-left p-4 rounded-xl transition-all
                      ${!showResult && isSelected
                        ? 'bg-[#FF5C00]/20 border-2 border-[#FF5C00]'
                        : !showResult
                          ? 'bg-[#1A1A1D] border-2 border-[#2A2A2E] hover:bg-[#1F1F23] hover:border-[#3A3A3E]'
                          : showResult && isCorrect
                            ? 'bg-green-500/20 border-2 border-green-500/50'
                            : showResult && isSelected && !isCorrect
                              ? 'bg-red-500/20 border-2 border-red-500/50'
                              : 'bg-[#1A1A1D]/50 border-2 border-[#2A2A2E]'
                      } ${showExplanation ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg text-[#FF5C00]">{key}</span>
                      <span className="text-[#ADADB0] flex-1">{value}</span>
                      {showResult && isCorrect && (
                        <span className="ml-auto text-green-400 text-xl">✓</span>
                      )}
                      {showResult && isSelected && !isCorrect && (
                        <span className="ml-auto text-red-400 text-xl">✗</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Explanation */}
          {showExplanation && (
            <div className={`rounded-xl p-5 mb-6 border ${
              selectedAnswer === currentQuestion.correctAnswer
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              <p className={`font-semibold mb-2 ${
                selectedAnswer === currentQuestion.correctAnswer
                  ? 'text-green-300'
                  : 'text-red-300'
              }`}>
                {selectedAnswer === currentQuestion.correctAnswer ? 'Correct! 🎉' : 'Not quite'}
              </p>
              <p className="text-[#ADADB0] text-sm leading-relaxed">{currentQuestion.explanation}</p>
            </div>
          )}

          {/* Action Button */}
          {!showExplanation ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer}
              className="w-full bg-gradient-to-br from-[#FF5C00] to-[#FF8A4C]
                       hover:from-[#FF6A10] hover:to-[#FF9A5C]
                       disabled:from-[#2A2A2D] disabled:to-[#2A2A2D] disabled:cursor-not-allowed
                       text-white font-semibold py-4 px-6 rounded-xl text-lg
                       transition-all duration-200 shadow-lg shadow-[#FF5C00]/20
                       disabled:shadow-none"
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="w-full bg-gradient-to-br from-[#FF5C00] to-[#FF8A4C]
                       hover:from-[#FF6A10] hover:to-[#FF9A5C]
                       text-white font-semibold py-4 px-6 rounded-xl text-lg
                       transition-all duration-200 shadow-lg shadow-[#FF5C00]/20"
            >
              {currentQuestionIndex < questions.length - 1 ? 'Next Question →' : 'Finish Quiz'}
            </button>
          )}
        </>
      )}
    </div>
  )
}
