import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { topic, teaching, question, userExplanation } = await request.json()

    if (!userExplanation) {
      return NextResponse.json({ error: 'User explanation is required' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const prompt = `You are an expert teacher analyzing a student's explanation using the Feynman Technique.

TOPIC: ${topic}

ORIGINAL TEACHING:
${teaching}

QUESTION ASKED:
${question}

STUDENT'S EXPLANATION:
${userExplanation}

Analyze their explanation thoroughly and provide feedback. Consider:
1. Accuracy - Did they get the core concepts right?
2. Completeness - Did they cover the key points?
3. Clarity - Was their explanation clear and understandable?
4. Examples - Did they use good analogies or examples?
5. Depth - Do they understand the "why" or just the "what"?

Be encouraging but honest. Identify specific gaps in understanding.

Create a follow-up question that:
- Builds on this topic but explores a different aspect
- Addresses any gaps you identified
- Helps deepen their understanding

Respond in this exact JSON format:
{
  "score": <number 0-10>,
  "whatYouNailed": ["specific thing 1", "specific thing 2", "specific thing 3"],
  "whatYouMissed": ["gap 1", "gap 2"],
  "howToImprove": ["actionable tip 1", "actionable tip 2", "actionable tip 3"],
  "nextQuestion": "Your next question to deepen understanding..."
}

Important:
- Score 8-10: Excellent understanding, could teach others
- Score 6-7: Good understanding, minor gaps
- Score 4-5: Partial understanding, significant gaps
- Score 0-3: Fundamental misconceptions
- Always provide at least 2 items in each array
- Be specific, not generic`

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Invalid response format')
    }

    const data = JSON.parse(jsonMatch[0])

    // Validate and ensure arrays have content
    const analysis = {
      score: Math.min(10, Math.max(0, Number(data.score) || 5)),
      whatYouNailed: Array.isArray(data.whatYouNailed) && data.whatYouNailed.length > 0
        ? data.whatYouNailed
        : ['Attempted to explain the concept', 'Showed willingness to learn'],
      whatYouMissed: Array.isArray(data.whatYouMissed) && data.whatYouMissed.length > 0
        ? data.whatYouMissed
        : ['Some key details were missing', 'Could use more specific examples'],
      howToImprove: Array.isArray(data.howToImprove) && data.howToImprove.length > 0
        ? data.howToImprove
        : ['Review the core concept', 'Try using a real-world analogy', 'Focus on explaining the "why"'],
      nextQuestion: data.nextQuestion || `Can you explain another aspect of ${topic}?`
    }

    return NextResponse.json(analysis)

  } catch (error) {
    console.error('Analyze API error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze explanation' },
      { status: 500 }
    )
  }
}
