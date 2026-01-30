<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/assets/brand/logo-dark.svg" />
    <img src="public/assets/brand/logo-light.svg" alt="ExplainIt" height="32" />
  </picture>
</p>

<p align="center">
  Learn anything faster with guided explanations, voice input, and a review loop.
</p>



---

## What is ExplainIt?

ExplainIt is a learning companion that helps you turn a topic into a clear explanation you can actually repeat back. It combines:

- A quick **explanation** you can listen to (Web Speech API) or play back if you recorded yourself
- A **transcript view** with seekable segments
- A **Feynman-style loop** (teach → answer → get feedback) via API routes

## Features

- **Audience levels** — Choose from 5-year-old → expert
- **Voice input + recording** — Record your question and get live speech-to-text while you talk
- **Audio playback** — Uses Web Speech API (TTS) or plays your recorded audio when available
- **Transcript + seek** — Click around the transcript (and segments when recording) to jump in audio
- **History** — All generated explanations are stored locally for quick access
- **Saved items** — Bookmark explanations you want to keep
- **Share links** — Share a direct `/results/[id]` URL (copy + social share shortcuts)
- **Settings** — Voice selection, playback speed, theme, autoplay, default transcript view
- **Teaching + grading loop (API)** — Teach and analyze explanations using the Feynman Technique

> Note: **PDF download is currently a placeholder** (UI shows “PDF”, but download isn’t implemented yet).

## Quick Start

```bash
# Install
bun install

# Configure env
cp .env.example .env
# Add required keys (see Environment Variables below)

# Run
bun dev
```

Open `http://localhost:3000`

## Environment Variables

Create a `.env` file (copy from `.env.example`) and set:

- **`NEXT_PUBLIC_OPENAI_API_KEY`**: used by server routes like `/api/teach` and `/api/analyze`
- **`ELEVENLABS_API_KEY`**: used by `/api/transcribe` (speech-to-text) and optional ElevenLabs TTS in `/api/teach`

## Pages

- **Home**: input topic (text or voice), pick audience/output
- **Results**: audio player, summary, transcript, key terms, share/save
- **History**: search/filter and revisit prior explanations
- **Saved**: your bookmarked explanations
- **Settings**: voice/speed/theme/autoplay/transcript defaults
- **Auth**: UI-only login/register screen (no backend yet)

## Tech Stack

- **Next.js 15** — App Router
- **React 19**
- **Tailwind CSS v4**
- **Web Speech API** — Text-to-speech + in-browser speech recognition (where supported)
- **OpenAI SDK** — Teaching + analysis routes
- **ElevenLabs** — Speech-to-text (and optional TTS in `/api/teach`)
- **LocalStorage** — History / saved / settings persistence

## API

### Routes

- **`POST /api/teach`**: returns a short teaching explanation + a deep-understanding question (and optionally `audioUrl`)
- **`POST /api/analyze`**: scores and gives feedback on a user’s explanation + proposes the next question
- **`POST /api/transcribe`**: converts an uploaded audio blob to text via ElevenLabs Speech-to-Text

### Data Model (frontend)

The main UI flows around `ExplanationResponse` in `src/types/index.ts` (id, title, script, one-page content, optional recording segments).

## License

MIT
