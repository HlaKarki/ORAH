'use client'

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

interface AnalysisDashboardProps {
  analysis: AnalysisData
  attemptHistory: AttemptHistory[]
  onTryAgain: () => void
  onNextQuestion: () => void
  onNewTopic: () => void
}

function ScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (score / 10) * circumference

  const getColor = (score: number) => {
    if (score >= 8) return { stroke: '#22c55e', text: 'text-green-400', bg: 'from-green-500' }
    if (score >= 6) return { stroke: '#eab308', text: 'text-yellow-400', bg: 'from-yellow-500' }
    if (score >= 4) return { stroke: '#f97316', text: 'text-orange-400', bg: 'from-orange-500' }
    return { stroke: '#ef4444', text: 'text-red-400', bg: 'from-red-500' }
  }

  const color = getColor(score)

  return (
    <div className="relative w-32 h-32">
      <svg className="w-32 h-32 -rotate-90">
        <circle
          cx="64"
          cy="64"
          r="45"
          stroke="#374151"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx="64"
          cy="64"
          r="45"
          stroke={color.stroke}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold ${color.text}`}>{score}</span>
        <span className="text-gray-500 text-sm">/10</span>
      </div>
    </div>
  )
}

export default function AnalysisDashboard({
  analysis,
  attemptHistory,
  onTryAgain,
  onNextQuestion,
  onNewTopic
}: AnalysisDashboardProps) {
  const currentAttempt = attemptHistory[attemptHistory.length - 1]
  const showImprovement = attemptHistory.length > 1
  const previousScore = attemptHistory.length > 1 ? attemptHistory[attemptHistory.length - 2].score : 0
  const improvement = analysis.score - previousScore

  return (
    <div className="space-y-6">
      {/* Score Card */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-700">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
          <ScoreRing score={analysis.score} />
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-semibold mb-2">
              {analysis.score >= 8 && 'Excellent! 🎯'}
              {analysis.score >= 6 && analysis.score < 8 && 'Good job! 👍'}
              {analysis.score >= 4 && analysis.score < 6 && 'Getting there! 💪'}
              {analysis.score < 4 && 'Keep practicing! 📚'}
            </h2>
            <p className="text-gray-400">
              Attempt #{currentAttempt?.attempt || 1}
              {showImprovement && (
                <span className={improvement > 0 ? 'text-green-400 ml-2' : improvement < 0 ? 'text-red-400 ml-2' : 'text-gray-500 ml-2'}>
                  ({improvement > 0 ? '+' : ''}{improvement} from last)
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Attempt History Graph */}
        {attemptHistory.length > 1 && (
          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-sm text-gray-500 mb-3">Your progress:</p>
            <div className="flex items-end gap-2 h-20">
              {attemptHistory.map((attempt) => (
                <div key={attempt.attempt} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-purple-600 to-pink-500 rounded-t"
                    style={{ height: `${(attempt.score / 10) * 100}%` }}
                  />
                  <p className="text-xs text-gray-500 mt-1">#{attempt.attempt}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Feedback Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* What You Nailed */}
        <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-green-400 text-lg">✓</span>
            <h3 className="font-semibold text-green-300">What You Nailed</h3>
          </div>
          <ul className="space-y-2">
            {analysis.whatYouNailed.map((item, i) => (
              <li key={i} className="text-gray-300 text-sm flex gap-2">
                <span className="text-green-500">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* What You Missed */}
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-red-400 text-lg">✗</span>
            <h3 className="font-semibold text-red-300">What You Missed</h3>
          </div>
          <ul className="space-y-2">
            {analysis.whatYouMissed.map((item, i) => (
              <li key={i} className="text-gray-300 text-sm flex gap-2">
                <span className="text-red-500">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* How to Improve */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-blue-400 text-lg">💡</span>
          <h3 className="font-semibold text-blue-300">How to Improve</h3>
        </div>
        <ul className="space-y-2">
          {analysis.howToImprove.map((item, i) => (
            <li key={i} className="text-gray-300 text-sm flex gap-2">
              <span className="text-blue-500">{i + 1}.</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Next Question Preview */}
      <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-5">
        <p className="text-purple-300 text-sm font-medium mb-2">NEXT CHALLENGE:</p>
        <p className="text-white font-medium">{analysis.nextQuestion}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onTryAgain}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold
                   py-4 px-6 rounded-xl transition-all"
        >
          Try Again (Same Question)
        </button>
        <button
          onClick={onNextQuestion}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600
                   hover:from-purple-500 hover:to-pink-500
                   text-white font-semibold py-4 px-6 rounded-xl transition-all"
        >
          Next Question →
        </button>
      </div>

      <button
        onClick={onNewTopic}
        className="w-full text-gray-400 hover:text-white py-2 transition-colors"
      >
        ← Start with a new topic
      </button>
    </div>
  )
}
