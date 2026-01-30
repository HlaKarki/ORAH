/**
 * Memory Management System for Orah
 * Handles persistent localStorage-based learner profiles
 */

export interface LearnerProfile {
  id: string
  createdAt: string
  lastActive: string
  learningStyle: {
    prefersAnalogies: number // 0-1 score
    prefersTechnical: number
    prefersVisual: number
    detectedFrom: string[] // signals used to infer
  }
  topicsCovered: Array<{
    topic: string
    completedAt: string
    bestScore: number
    attempts: number
  }>
  performance: {
    averageScore: number
    totalAttempts: number
    improvementRate: number // trend over last 10 attempts
    recentScores: number[] // last 10 scores for trend calculation
  }
}

const STORAGE_KEY = 'orah_learner_profile'

/**
 * Create a new learner profile with default values
 */
export function createDefaultProfile(): LearnerProfile {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    learningStyle: {
      prefersAnalogies: 0.5,
      prefersTechnical: 0.5,
      prefersVisual: 0.5,
      detectedFrom: []
    },
    topicsCovered: [],
    performance: {
      averageScore: 0,
      totalAttempts: 0,
      improvementRate: 0,
      recentScores: []
    }
  }
}

/**
 * Load learner profile from localStorage
 * Creates a new profile if none exists
 */
export function loadLearnerProfile(): LearnerProfile {
  if (typeof window === 'undefined') {
    return createDefaultProfile()
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      const newProfile = createDefaultProfile()
      saveLearnerProfile(newProfile)
      return newProfile
    }

    const profile = JSON.parse(stored) as LearnerProfile
    // Update last active timestamp
    profile.lastActive = new Date().toISOString()
    saveLearnerProfile(profile)
    return profile
  } catch (error) {
    console.error('Error loading learner profile:', error)
    return createDefaultProfile()
  }
}

/**
 * Save learner profile to localStorage
 */
export function saveLearnerProfile(profile: LearnerProfile): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  } catch (error) {
    console.error('Error saving learner profile:', error)
  }
}

/**
 * Update learner profile with partial data
 */
export function updateLearnerProfile(updates: Partial<LearnerProfile>): LearnerProfile {
  const current = loadLearnerProfile()
  const updated = { ...current, ...updates, lastActive: new Date().toISOString() }
  saveLearnerProfile(updated)
  return updated
}

/**
 * Add a completed topic to the profile
 */
export function addTopicCompleted(topic: string, score: number, attempts: number = 1): LearnerProfile {
  const profile = loadLearnerProfile()
  
  // Check if topic already exists
  const existingIndex = profile.topicsCovered.findIndex(t => t.topic === topic)
  
  if (existingIndex >= 0) {
    // Update existing topic
    const existing = profile.topicsCovered[existingIndex]!
    profile.topicsCovered[existingIndex] = {
      topic,
      completedAt: new Date().toISOString(),
      bestScore: Math.max(existing.bestScore, score),
      attempts: existing.attempts + attempts
    }
  } else {
    // Add new topic
    profile.topicsCovered.push({
      topic,
      completedAt: new Date().toISOString(),
      bestScore: score,
      attempts
    })
  }

  // Update performance metrics
  profile.performance.recentScores.push(score)
  if (profile.performance.recentScores.length > 10) {
    profile.performance.recentScores.shift()
  }

  profile.performance.totalAttempts += attempts
  
  // Calculate average score
  const allScores = profile.topicsCovered.map(t => t.bestScore)
  profile.performance.averageScore = allScores.length > 0
    ? allScores.reduce((sum, s) => sum + s, 0) / allScores.length
    : 0

  // Calculate improvement rate (slope of recent scores)
  if (profile.performance.recentScores.length >= 2) {
    const scores = profile.performance.recentScores
    const n = scores.length
    const sumX = (n * (n - 1)) / 2
    const sumY = scores.reduce((sum, s) => sum + s, 0)
    const sumXY = scores.reduce((sum, s, i) => sum + i * s, 0)
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6
    
    profile.performance.improvementRate = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  }

  saveLearnerProfile(profile)
  return profile
}

/**
 * Update learning style preferences based on signals
 */
export function updateLearningStyle(
  signal: 'analogy' | 'technical' | 'visual',
  strength: number = 0.1,
  reason: string
): LearnerProfile {
  const profile = loadLearnerProfile()
  
  // Adjust the relevant preference
  switch (signal) {
    case 'analogy':
      profile.learningStyle.prefersAnalogies = Math.min(1, profile.learningStyle.prefersAnalogies + strength)
      break
    case 'technical':
      profile.learningStyle.prefersTechnical = Math.min(1, profile.learningStyle.prefersTechnical + strength)
      break
    case 'visual':
      profile.learningStyle.prefersVisual = Math.min(1, profile.learningStyle.prefersVisual + strength)
      break
  }

  // Add reason to detected signals
  if (!profile.learningStyle.detectedFrom.includes(reason)) {
    profile.learningStyle.detectedFrom.push(reason)
  }

  saveLearnerProfile(profile)
  return profile
}

/**
 * Get a formatted summary of learning style for LLM context
 */
export function getLearningStyleSummary(profile: LearnerProfile): string {
  const { prefersAnalogies, prefersTechnical, prefersVisual } = profile.learningStyle
  
  const styles: string[] = []
  
  if (prefersAnalogies > 0.6) {
    styles.push('strongly prefers analogies and real-world examples')
  } else if (prefersAnalogies > 0.4) {
    styles.push('appreciates analogies')
  }
  
  if (prefersTechnical > 0.6) {
    styles.push('prefers technical depth and precise terminology')
  } else if (prefersTechnical < 0.4) {
    styles.push('prefers simple, non-technical language')
  }
  
  if (prefersVisual > 0.6) {
    styles.push('learns well with visual descriptions and diagrams')
  }

  if (styles.length === 0) {
    return 'Learning style preferences are still being determined.'
  }

  return `This learner ${styles.join(', ')}.`
}

/**
 * Get topic history summary for LLM context
 */
export function getTopicHistory(profile: LearnerProfile, limit: number = 5): string {
  if (profile.topicsCovered.length === 0) {
    return 'This is a new learner with no topic history yet.'
  }

  const recent = profile.topicsCovered
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, limit)

  const topicList = recent.map(t => 
    `"${t.topic}" (best score: ${t.bestScore}/10, ${t.attempts} attempt${t.attempts > 1 ? 's' : ''})`
  ).join(', ')

  return `Recently covered topics: ${topicList}`
}

/**
 * Get performance summary for LLM context
 */
export function getPerformanceSummary(profile: LearnerProfile): string {
  const { averageScore, totalAttempts, improvementRate } = profile.performance

  if (totalAttempts === 0) {
    return 'No performance data yet.'
  }

  let trend = 'stable'
  if (improvementRate > 0.3) {
    trend = 'rapidly improving'
  } else if (improvementRate > 0.1) {
    trend = 'steadily improving'
  } else if (improvementRate < -0.1) {
    trend = 'declining'
  }

  return `Average score: ${averageScore.toFixed(1)}/10 over ${totalAttempts} attempts. Performance is ${trend}.`
}

/**
 * Get full context summary for agent
 */
export function getFullContextSummary(profile: LearnerProfile): string {
  return `
LEARNER PROFILE:
${getLearningStyleSummary(profile)}
${getTopicHistory(profile)}
${getPerformanceSummary(profile)}
`.trim()
}

/**
 * Reset learner profile (for testing or user request)
 */
export function resetLearnerProfile(): LearnerProfile {
  const newProfile = createDefaultProfile()
  saveLearnerProfile(newProfile)
  return newProfile
}
