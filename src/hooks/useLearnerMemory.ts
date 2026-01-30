/**
 * useLearnerMemory Hook
 * React hook for managing learner profile state and persistence
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import type { LearnerProfile } from '@/lib/memory'
import {
  loadLearnerProfile,
  saveLearnerProfile,
  updateLearnerProfile as updateProfile,
  addTopicCompleted as addTopic,
  updateLearningStyle as updateStyle,
  resetLearnerProfile as resetProfile
} from '@/lib/memory'

export function useLearnerMemory() {
  const [profile, setProfile] = useState<LearnerProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load profile on mount
  useEffect(() => {
    const loadProfile = () => {
      try {
        const loaded = loadLearnerProfile()
        setProfile(loaded)
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [])

  // Update profile with partial data
  const updateLearnerProfile = useCallback((updates: Partial<LearnerProfile>) => {
    try {
      const updated = updateProfile(updates)
      setProfile(updated)
      return updated
    } catch (error) {
      console.error('Error updating profile:', error)
      return profile
    }
  }, [profile])

  // Add a completed topic
  const addTopicCompleted = useCallback((topic: string, score: number, attempts: number = 1) => {
    try {
      const updated = addTopic(topic, score, attempts)
      setProfile(updated)
      return updated
    } catch (error) {
      console.error('Error adding topic:', error)
      return profile
    }
  }, [profile])

  // Update learning style based on signals
  const updateLearningStyle = useCallback((
    signal: 'analogy' | 'technical' | 'visual',
    strength: number = 0.1,
    reason: string
  ) => {
    try {
      const updated = updateStyle(signal, strength, reason)
      setProfile(updated)
      return updated
    } catch (error) {
      console.error('Error updating learning style:', error)
      return profile
    }
  }, [profile])

  // Reset profile
  const resetLearnerProfile = useCallback(() => {
    try {
      const newProfile = resetProfile()
      setProfile(newProfile)
      return newProfile
    } catch (error) {
      console.error('Error resetting profile:', error)
      return profile
    }
  }, [profile])

  // Manually save current profile
  const saveProfile = useCallback(() => {
    if (profile) {
      try {
        saveLearnerProfile(profile)
      } catch (error) {
        console.error('Error saving profile:', error)
      }
    }
  }, [profile])

  // Get topics mastered (score >= 8)
  const getMasteredTopics = useCallback(() => {
    if (!profile) return []
    return profile.topicsCovered.filter(t => t.bestScore >= 8)
  }, [profile])

  // Get topics that need improvement (score < 6)
  const getTopicsNeedingWork = useCallback(() => {
    if (!profile) return []
    return profile.topicsCovered.filter(t => t.bestScore < 6)
  }, [profile])

  // Check if a topic has been covered
  const hasStudiedTopic = useCallback((topic: string) => {
    if (!profile) return false
    return profile.topicsCovered.some(t => 
      t.topic.toLowerCase().includes(topic.toLowerCase()) ||
      topic.toLowerCase().includes(t.topic.toLowerCase())
    )
  }, [profile])

  return {
    profile,
    isLoading,
    updateLearnerProfile,
    addTopicCompleted,
    updateLearningStyle,
    resetLearnerProfile,
    saveProfile,
    getMasteredTopics,
    getTopicsNeedingWork,
    hasStudiedTopic
  }
}
