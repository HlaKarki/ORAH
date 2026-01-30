import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const { topic, focusQuestion } = await request.json()

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
    }

    const prompt = focusQuestion
      ? `You are a brilliant teacher using the Feynman Technique. The student is learning about "${topic}" and needs help understanding this specific aspect: "${focusQuestion}"

Create a teaching explanation that:
1. Explains this specific concept clearly in simple language
2. Uses a relatable analogy or real-world example
3. Builds on foundational concepts
4. Is about 60-90 seconds when read aloud (roughly 150-200 words)

Then create ONE follow-up question that tests deep understanding of this concept. The question should require the student to explain HOW or WHY something works, not just WHAT it is.

Respond in this exact JSON format:
{
  "teaching": "Your teaching explanation here...",
  "question": "Your follow-up question here..."
}`
      : `You are a brilliant teacher using the Feynman Technique. A student wants to deeply understand: "${topic}"

Create a teaching explanation that:
1. Starts with WHY this matters or a hook that creates curiosity
2. Breaks down the core concept using simple, jargon-free language
3. Uses a vivid analogy or real-world example that makes it click
4. Explains the key mechanism or process
5. Is about 60-90 seconds when read aloud (roughly 150-200 words)

Then create ONE question that tests true understanding. The question should:
- Focus on a specific aspect of the concept
- Require explaining HOW or WHY, not just reciting facts
- Be something that reveals gaps in understanding

Respond in this exact JSON format:
{
  "teaching": "Your teaching explanation here...",
  "question": "Your follow-up question here..."
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a brilliant teacher using the Feynman Technique. Always respond with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    })

    const text = completion.choices[0]?.message?.content || '{}'
    const data = JSON.parse(text)

    // Generate audio if ElevenLabs key is available
    let audioUrl: string | undefined

    if (process.env.ELEVENLABS_API_KEY) {
      try {
        const audioResponse = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': process.env.ELEVENLABS_API_KEY
          },
          body: JSON.stringify({
            text: data.teaching,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75
            }
          })
        })

        if (audioResponse.ok) {
          const audioBuffer = await audioResponse.arrayBuffer()
          const base64Audio = Buffer.from(audioBuffer).toString('base64')
          audioUrl = `data:audio/mpeg;base64,${base64Audio}`
        }
      } catch (audioError) {
        console.error('TTS error:', audioError)
        // Continue without audio
      }
    }

    return NextResponse.json({
      teaching: data.teaching,
      question: data.question,
      audioUrl
    })

  } catch (error) {
    console.error('Teach API error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('OPENAI_API_KEY present:', !!process.env.NEXT_PUBLIC_OPENAI_API_KEY)
    console.error('ELEVENLABS_API_KEY present:', !!process.env.ELEVENLABS_API_KEY)
    return NextResponse.json(
      { error: `Failed to generate teaching content: ${message}` },
      { status: 500 }
    )
  }
}
