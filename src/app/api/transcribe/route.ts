import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File | null

    if (!audioFile) {
      return NextResponse.json({ error: 'Audio file is required' }, { status: 400 })
    }

    // Create form data for ElevenLabs
    const elevenlabsFormData = new FormData()
    elevenlabsFormData.append('file', audioFile)
    elevenlabsFormData.append('model_id', 'scribe_v2')

    // Call ElevenLabs Speech-to-Text API
    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY || '',
      },
      body: elevenlabsFormData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('ElevenLabs API error:', errorText)
      throw new Error(`Transcription failed: ${response.status}`)
    }

    const data = await response.json()
    const transcript = data.text || ''

    return NextResponse.json({ transcript })

  } catch (error) {
    console.error('Transcribe API error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error details:', message)
    console.error('ELEVENLABS_API_KEY present:', !!process.env.ELEVENLABS_API_KEY)
    return NextResponse.json(
      { error: `Failed to transcribe audio: ${message}` },
      { status: 500 }
    )
  }
}
