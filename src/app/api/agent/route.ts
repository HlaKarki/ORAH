/**
 * Agent API Route
 * Main endpoint for agent with memory and tool calling
 * Note: Using direct tool calling instead of LangChain agents for compatibility
 */

import { NextRequest, NextResponse } from 'next/server'
import { ChatOpenAI } from '@langchain/openai'
import { getAllTools } from '@/lib/agent-tools'
import type { LearnerProfile } from '@/lib/memory'
import { getFullContextSummary } from '@/lib/memory'

export async function POST(request: NextRequest) {
  try {
    const { 
      message, 
      learnerProfile,
      conversationHistory = []
    } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Initialize the LLM with tool binding
    const model = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY || '',
    })

    // Get tools
    const tools = getAllTools()

    // Create context from learner profile
    const profileContext = learnerProfile 
      ? getFullContextSummary(learnerProfile as LearnerProfile)
      : 'New learner with no history yet.'

    // Create system message with context
    const systemMessage = `You are Orah, an AI learning companion that uses the Feynman Technique to help people master concepts through explanation.

Your role:
- Help learners understand complex topics by teaching them clearly
- Ask them to explain concepts back to you to test understanding
- Provide constructive feedback on their explanations
- Generate practice quizzes when requested
- Adapt your teaching style to their preferences

${profileContext}

Guidelines:
- Use the teaching generator tool when introducing new topics
- Use the explanation analyzer tool when evaluating learner responses
- Use the quiz generator tool when the learner wants practice
- Be encouraging but honest about gaps in understanding
- Keep explanations concise (60-90 seconds when read aloud)
- Always focus on the "why" not just the "what"

Remember: The goal is deep understanding, not memorization.`

    // Build messages array
    const messages = [
      { role: 'system', content: systemMessage },
      ...conversationHistory,
      { role: 'user', content: message }
    ]

    // Invoke the model with tools
    const response = await model.invoke(messages, {
      tools: tools.map(tool => ({
        type: 'function' as const,
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.schema
        }
      }))
    })

    // Check if tool calls were made
    if (response.additional_kwargs?.tool_calls) {
      const toolCalls = response.additional_kwargs.tool_calls
      const toolResults = []

      for (const toolCall of toolCalls) {
        const tool = tools.find(t => t.name === toolCall.function.name)
        if (tool) {
          try {
            const args = JSON.parse(toolCall.function.arguments)
            const result = await tool.func(args)
            toolResults.push({
              tool: toolCall.function.name,
              result
            })
          } catch (error) {
            console.error(`Tool ${toolCall.function.name} error:`, error)
            toolResults.push({
              tool: toolCall.function.name,
              error: error instanceof Error ? error.message : 'Tool execution failed'
            })
          }
        }
      }

      return NextResponse.json({
        response: response.content || 'Tool calls executed',
        toolCalls: toolResults
      })
    }

    return NextResponse.json({
      response: response.content || 'No response generated',
      toolCalls: []
    })

  } catch (error) {
    console.error('Agent API error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error details:', message)
    return NextResponse.json(
      { error: `Agent failed: ${message}` },
      { status: 500 }
    )
  }
}
