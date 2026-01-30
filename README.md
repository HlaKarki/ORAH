<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/assets/brand/logo-dark.svg" />
    <img src="public/assets/brand/logo-light.svg" alt="ExplainIt" height="32" />
  </picture>
</p>

<p align="center">
  Transform complex topics into simple explanations with AI-powered audio and PDF summaries.
</p>

<p align="center">
  <img src="public/assets/hero.png" alt="ExplainIt App" width="720" />
</p>

---

## What is ExplainIt?

Paste any topic, article, or concept. Select your audience level. Get a complete explanation with audio narration and a downloadable one-page PDF.

## Features

- **AI Explanations** — AI-powered breakdowns tailored to your audience (5-year-old to expert)
- **Audio Playback** — Listen to explanations via browser text-to-speech
- **PDF Export** — Download a formatted one-page summary
- **Voice Input** — Ask questions by speaking

## Quick Start

```bash
# Clone and install
git clone https://github.com/yourusername/explainit.git
cd explainit
bun install

# Configure
cp .env.example .env
# Add your OPENAI_API_KEY to .env

# Run
bun dev
```

Open [localhost:3000](http://localhost:3000)

## Tech Stack

- **Next.js 14** — App Router
- **Tailwind CSS** — Styling
- **OpenAI** — GPT-4o-mini
- **Web Speech API** — Text-to-speech
- **jsPDF** — PDF generation

## API

```typescript
interface ExplanationResponse {
  title: string;
  script_for_audio: string;
  one_page_content: {
    summary_1_sentence: string;
    analogy: string;
    key_points: string[];
    key_terms: string[];
    why_it_matters: string;
  }
}
```

## License

MIT
