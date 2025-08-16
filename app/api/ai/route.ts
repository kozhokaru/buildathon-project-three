import { anthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Get the request body
    const { messages, model = 'claude-3-5-sonnet-20241022', temperature = 0.7 } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid request: messages array required', { status: 400 })
    }

    // Validate API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is not configured')
      return new Response('AI service is not configured', { status: 500 })
    }

    // Stream the response using Vercel AI SDK
    const result = streamText({
      model: anthropic(model),
      messages,
      temperature,
      maxRetries: 2,
      onFinish: async ({ text, usage }) => {
        // Optional: Log usage to your database
        console.log('AI request completed:', {
          userId: user.id,
          tokens: usage.totalTokens,
          model,
        })
      },
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('AI API error:', error)
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return new Response('Rate limit exceeded. Please try again later.', { status: 429 })
      }
      if (error.message.includes('API key')) {
        return new Response('AI service configuration error', { status: 500 })
      }
    }
    
    return new Response('An error occurred processing your request', { status: 500 })
  }
}

// Example endpoint for non-streaming completion
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Example response showing the endpoint is working
    return Response.json({
      message: 'AI endpoint is ready',
      user: user.email,
      models: [
        'claude-3-5-sonnet-20241022',
        'claude-3-5-haiku-20241022',
        'claude-3-opus-20240229'
      ],
      features: [
        'Streaming responses',
        'Function calling',
        'Multiple models',
        'Token usage tracking'
      ]
    })
  } catch (error) {
    console.error('AI API error:', error)
    return new Response('An error occurred', { status: 500 })
  }
}