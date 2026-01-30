/**
 * Quiz Generation API Route
 * Generates quiz questions using OpenAI
 */

import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const { topic, difficulty, count } = await request.json()

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
    }

    const difficultyLevel = difficulty || 'medium'
    const questionCount = count || 5

    const prompt = `Generate ${questionCount} ${difficultyLevel} difficulty quiz questions about "${topic}".

For each question:
- Make it test understanding, not just memorization
- Include 4 multiple choice options (A, B, C, D)
- Mark the correct answer
- Provide a brief explanation of why the answer is correct

Respond in this exact JSON format:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": {
        "A": "Option A text",
        "B": "Option B text",
        "C": "Option C text",
        "D": "Option D text"
      },
      "correctAnswer": "A",
      "explanation": "Why this answer is correct..."
    }
  ]
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a quiz generator. Always respond with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8
    })

    const text = completion.choices[0]?.message?.content || '{}'
    const data = JSON.parse(text)
    
    if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
      throw new Error('No questions generated')
    }

    return NextResponse.json({
      questions: data.questions,
      topic,
      difficulty: difficultyLevel
    })

  } catch (error) {
    console.error('Quiz generation error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error details:', message)
    console.error('OPENAI_API_KEY present:', !!process.env.OPENAI_API_KEY)
    return NextResponse.json(
      { error: `Failed to generate quiz: ${message}` },
      { status: 500 }
    )
  }
}
