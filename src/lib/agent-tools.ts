/**
 * LangChain Agent Tools for Orah
 * Defines tools that the agent can use to help learners
 */

import { DynamicStructuredTool } from '@langchain/core/tools'
import { z } from 'zod'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

/**
 * Quiz Generator Tool
 * Generates practice quiz questions on a topic
 */
export const quizGeneratorTool = new DynamicStructuredTool({
  name: 'generate_quiz',
  description: 'Generate practice quiz questions to help the learner reinforce their understanding of a topic. Use this when the learner wants to practice or test their knowledge.',
  schema: z.object({
    topic: z.string().describe('The topic to generate quiz questions about'),
    difficulty: z.enum(['easy', 'medium', 'hard']).describe('The difficulty level of the questions'),
    count: z.number().min(1).max(10).describe('Number of questions to generate (1-10)')
  }),
  func: async ({ topic, difficulty, count }) => {
    try {
      const prompt = `Generate ${count} ${difficulty} difficulty quiz questions about "${topic}".

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
        response_format: { type: 'json_object' }
      })

      const text = completion.choices[0]?.message?.content || '{}'
      const data = JSON.parse(text)
      
      return JSON.stringify(data.questions || [])
    } catch (error) {
      console.error('Quiz generation error:', error)
      return JSON.stringify({ error: 'Failed to generate quiz questions' })
    }
  }
})

/**
 * Teaching Generator Tool
 * Creates personalized teaching content based on learner profile
 */
export const teachingGeneratorTool = new DynamicStructuredTool({
  name: 'generate_teaching',
  description: 'Generate a teaching explanation tailored to the learner\'s style and prior knowledge. Use this when starting a new topic or when the learner needs a concept explained.',
  schema: z.object({
    topic: z.string().describe('The topic to teach'),
    learningStyle: z.string().describe('Description of the learner\'s preferred learning style'),
    priorKnowledge: z.array(z.string()).describe('Topics the learner has already covered'),
    focusQuestion: z.string().optional().describe('Specific aspect to focus on, if any')
  }),
  func: async ({ topic, learningStyle, priorKnowledge, focusQuestion }) => {
    try {
      const priorContext = priorKnowledge.length > 0
        ? `The learner has already studied: ${priorKnowledge.join(', ')}. Build on this knowledge.`
        : 'This is a new learner. Start with fundamentals.'

      const prompt = focusQuestion
        ? `You are a brilliant teacher using the Feynman Technique. The student is learning about "${topic}" and needs help understanding this specific aspect: "${focusQuestion}"

LEARNER CONTEXT:
${learningStyle}
${priorContext}

Create a teaching explanation that:
1. Explains this specific concept clearly in simple language
2. Adapts to the learner's style preferences
3. Uses a relatable analogy or real-world example
4. Builds on their prior knowledge
5. Is about 60-90 seconds when read aloud (roughly 150-200 words)

Then create ONE follow-up question that tests deep understanding of this concept. The question should require the student to explain HOW or WHY something works, not just WHAT it is.

Respond in this exact JSON format:
{
  "teaching": "Your teaching explanation here...",
  "question": "Your follow-up question here..."
}`
        : `You are a brilliant teacher using the Feynman Technique. A student wants to deeply understand: "${topic}"

LEARNER CONTEXT:
${learningStyle}
${priorContext}

Create a teaching explanation that:
1. Starts with WHY this matters or a hook that creates curiosity
2. Breaks down the core concept using simple, jargon-free language
3. Uses a vivid analogy or real-world example that makes it click
4. Adapts to the learner's style preferences
5. Explains the key mechanism or process
6. Is about 60-90 seconds when read aloud (roughly 150-200 words)

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
      
      return JSON.stringify({
        teaching: data.teaching || '',
        question: data.question || ''
      })
    } catch (error) {
      console.error('Teaching generation error:', error)
      return JSON.stringify({ error: 'Failed to generate teaching content' })
    }
  }
})

/**
 * Explanation Analyzer Tool
 * Analyzes learner's explanation and provides feedback
 */
export const explanationAnalyzerTool = new DynamicStructuredTool({
  name: 'analyze_explanation',
  description: 'Analyze a learner\'s explanation of a concept and provide detailed feedback. Use this after the learner has attempted to explain something.',
  schema: z.object({
    topic: z.string().describe('The topic being explained'),
    question: z.string().describe('The specific question that was asked'),
    userExplanation: z.string().describe('The learner\'s explanation'),
    teachingContext: z.string().describe('The original teaching content for reference'),
    performanceHistory: z.string().describe('Summary of the learner\'s past performance')
  }),
  func: async ({ topic, question, userExplanation, teachingContext, performanceHistory }) => {
    try {
      const prompt = `You are an expert teacher analyzing a student's explanation using the Feynman Technique.

TOPIC: ${topic}

ORIGINAL TEACHING:
${teachingContext}

QUESTION ASKED:
${question}

STUDENT'S EXPLANATION:
${userExplanation}

PERFORMANCE CONTEXT:
${performanceHistory}

Analyze their explanation thoroughly and provide feedback. Consider:
1. Accuracy - Did they get the core concepts right?
2. Completeness - Did they cover the key points?
3. Clarity - Was their explanation clear and understandable?
4. Examples - Did they use good analogies or examples?
5. Depth - Do they understand the "why" or just the "what"?

Be encouraging but honest. Identify specific gaps in understanding.

Also detect learning style signals:
- If they used analogies effectively, note "uses_analogies"
- If they used technical terms correctly, note "technical_comfort"
- If they described visual/spatial concepts, note "visual_thinking"

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
  "nextQuestion": "Your next question to deepen understanding...",
  "learningStyleSignals": ["signal1", "signal2"]
}

Important:
- Score 8-10: Excellent understanding, could teach others
- Score 6-7: Good understanding, minor gaps
- Score 4-5: Partial understanding, significant gaps
- Score 0-3: Fundamental misconceptions
- Always provide at least 2 items in each array
- Be specific, not generic`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert teacher analyzing student explanations. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' }
      })

      const text = completion.choices[0]?.message?.content || '{}'
      const data = JSON.parse(text)
      
      return JSON.stringify({
        score: Math.min(10, Math.max(0, Number(data.score) || 5)),
        whatYouNailed: data.whatYouNailed || ['Attempted to explain the concept'],
        whatYouMissed: data.whatYouMissed || ['Some key details were missing'],
        howToImprove: data.howToImprove || ['Review the core concept'],
        nextQuestion: data.nextQuestion || `Can you explain another aspect of ${topic}?`,
        learningStyleSignals: data.learningStyleSignals || []
      })
    } catch (error) {
      console.error('Analysis error:', error)
      return JSON.stringify({ error: 'Failed to analyze explanation' })
    }
  }
})

/**
 * Get all tools for the agent
 */
export function getAllTools() {
  return [
    quizGeneratorTool,
    teachingGeneratorTool,
    explanationAnalyzerTool
  ]
}
