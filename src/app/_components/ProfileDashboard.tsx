/**
 * ProfileDashboard Component
 * Displays learner insights, progress, and learning style
 */

'use client'

import type { LearnerProfile } from '@/lib/memory'

interface ProfileDashboardProps {
  profile: LearnerProfile
  onClose: () => void
  onReset: () => void
}

export default function ProfileDashboard({ profile, onClose, onReset }: ProfileDashboardProps) {
  const masteredTopics = profile.topicsCovered.filter(t => t.bestScore >= 8)
  const needsWorkTopics = profile.topicsCovered.filter(t => t.bestScore < 6)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  return (
    <div className="bg-[#111113] border border-[#1F1F23] rounded-2xl p-6 md:p-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#FF5C00] to-[#FF8A4C] rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-white">Learning Profile</h2>
        </div>
        <button
          onClick={onClose}
          className="text-[#6B6B70] hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#0C0C0E] border border-[#2A2A2E] rounded-xl p-4">
          <p className="text-[#6B6B70] text-xs mb-1 uppercase tracking-wider">Topics Studied</p>
          <p className="text-2xl font-bold text-white">{profile.topicsCovered.length}</p>
        </div>
        <div className="bg-[#0C0C0E] border border-[#2A2A2E] rounded-xl p-4">
          <p className="text-[#6B6B70] text-xs mb-1 uppercase tracking-wider">Avg Score</p>
          <p className="text-2xl font-bold text-white">
            {profile.performance.averageScore.toFixed(1)}/10
          </p>
        </div>
        <div className="bg-[#0C0C0E] border border-[#2A2A2E] rounded-xl p-4">
          <p className="text-[#6B6B70] text-xs mb-1 uppercase tracking-wider">Total Attempts</p>
          <p className="text-2xl font-bold text-white">{profile.performance.totalAttempts}</p>
        </div>
        <div className="bg-[#0C0C0E] border border-[#2A2A2E] rounded-xl p-4">
          <p className="text-[#6B6B70] text-xs mb-1 uppercase tracking-wider">Mastered</p>
          <p className="text-2xl font-bold text-green-400">{masteredTopics.length}</p>
        </div>
      </div>

      {/* Topics Breakdown */}
      <div className="space-y-4 mb-6">
        {/* Mastered Topics */}
        {masteredTopics.length > 0 && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5">
            <h3 className="font-semibold text-green-300 mb-3 flex items-center gap-2">
              <span>✓</span> Mastered Topics ({masteredTopics.length})
            </h3>
            <div className="space-y-2">
              {masteredTopics.map((topic, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-[#ADADB0]">{topic.topic}</span>
                  <span className="text-green-400 font-medium">{topic.bestScore}/10</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Needs Work Topics */}
        {needsWorkTopics.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5">
            <h3 className="font-semibold text-red-300 mb-3 flex items-center gap-2">
              <span>📚</span> Needs More Practice ({needsWorkTopics.length})
            </h3>
            <div className="space-y-2">
              {needsWorkTopics.map((topic, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-[#ADADB0]">{topic.topic}</span>
                  <span className="text-red-400 font-medium">{topic.bestScore}/10</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {profile.topicsCovered.length === 0 && (
          <div className="bg-[#0C0C0E] border border-[#2A2A2E] rounded-xl p-8 text-center">
            <p className="text-[#6B6B70]">No topics studied yet. Start learning to build your profile!</p>
          </div>
        )}
      </div>

      {/* Profile Info */}
      <div className="bg-[#0C0C0E] border border-[#2A2A2E] rounded-xl p-4 mb-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[#6B6B70]">Member Since</p>
            <p className="text-[#ADADB0]">{formatDate(profile.createdAt)}</p>
          </div>
          <div>
            <p className="text-[#6B6B70]">Last Active</p>
            <p className="text-[#ADADB0]">{formatDate(profile.lastActive)}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 bg-gradient-to-br from-[#FF5C00] to-[#FF8A4C]
                   hover:from-[#FF6A10] hover:to-[#FF9A5C]
                   text-white font-semibold py-3 px-6 rounded-xl
                   transition-all duration-200 shadow-lg shadow-[#FF5C00]/20"
        >
          Continue Learning
        </button>
        <button
          onClick={() => {
            if (confirm('Are you sure you want to reset your profile? This cannot be undone.')) {
              onReset()
            }
          }}
          className="bg-[#1A1A1D] hover:bg-[#1F1F23] border border-[#2A2A2E] text-[#ADADB0]
                   font-semibold py-3 px-6 rounded-xl transition-all"
        >
          Reset Profile
        </button>
      </div>
    </div>
  )
}
