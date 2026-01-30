import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File | null

    if (!audioFile) {
      return NextResponse.json({ error: 'Audio file is required' }, { status: 400 })
    }

    // Convert to base64
    const buffer = await audioFile.arrayBuffer()
    const base64Audio = Buffer.from(buffer).toString('base64')

    // Use Gemini for transcription
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: audioFile.type || 'audio/webm',
          data: base64Audio
        }
      },
      {
        text: `Transcribe this audio recording accurately. The speaker is explaining an educational concept.
Output ONLY the transcription text, nothing else. No commentary, no formatting, just the exact words spoken.`
      }
    ])

    const response = result.response
    const transcript = response.text().trim()

    return NextResponse.json({ transcript })

  } catch (error) {
    console.error('Transcribe API error:', error)
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    )
  }
}
