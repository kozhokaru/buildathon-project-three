'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Brain, RefreshCw, Lightbulb, Target, AlertCircle } from 'lucide-react'
import { DailySentiment, ChannelSentiment, BurnoutIndicator } from '@/lib/sentiment-analyzer'

interface InsightsPanelProps {
  dailySentiments: DailySentiment[]
  channelSentiments: ChannelSentiment[]
  burnoutIndicators: BurnoutIndicator[]
}

interface AIInsight {
  summary: string
  recommendations: string[]
  trend: string
  priority_actions: string[]
}

export function InsightsPanel({ 
  dailySentiments, 
  channelSentiments, 
  burnoutIndicators 
}: InsightsPanelProps) {
  const [insights, setInsights] = useState<AIInsight | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateInsights = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = {
        dailySentiments: dailySentiments.map(d => ({
          date: d.date,
          score: d.score,
          messageCount: d.messageCount
        })),
        channelBreakdown: channelSentiments.map(c => ({
          channel: c.channel,
          score: c.averageScore,
          trend: c.trend,
          messageCount: c.messageCount
        })),
        burnoutIndicators: burnoutIndicators.map(b => ({
          type: b.type,
          severity: b.severity,
          message: b.message
        })),
        overallTrend: calculateOverallTrend()
      }

      const prompt = `Analyze this team sentiment data and provide insights:

Data: ${JSON.stringify(data, null, 2)}

Provide a response in this exact JSON format:
{
  "summary": "Brief 2-3 sentence overview of team health and mood",
  "trend": "One sentence describing the overall trend",
  "recommendations": [
    "First actionable recommendation for managers",
    "Second actionable recommendation",
    "Third actionable recommendation"
  ],
  "priority_actions": [
    "Most urgent action to take if burnout indicators present",
    "Second priority action"
  ]
}`

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are an expert in team psychology and workplace wellness. Analyze team sentiment data and provide actionable insights for managers. Always respond in valid JSON format.'
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate insights')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ''

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break
        fullResponse += decoder.decode(value)
      }

      // Parse the accumulated response
      try {
        const parsed = JSON.parse(fullResponse)
        setInsights(parsed)
      } catch (e) {
        // If direct parse fails, try to extract JSON from the response
        const jsonMatch = fullResponse.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          setInsights(parsed)
        } else {
          throw new Error('Invalid response format')
        }
      }
    } catch (err) {
      console.error('Error generating insights:', err)
      setError('Failed to generate AI insights. Please try again.')
      // Fallback to local insights
      setInsights(generateLocalInsights())
    } finally {
      setLoading(false)
    }
  }

  const calculateOverallTrend = () => {
    if (dailySentiments.length < 2) return 'stable'
    const recent = dailySentiments.slice(-3)
    const older = dailySentiments.slice(-6, -3)
    
    const recentAvg = recent.reduce((sum, d) => sum + d.score, 0) / recent.length
    const olderAvg = older.reduce((sum, d) => sum + d.score, 0) / older.length
    
    if (recentAvg > olderAvg + 0.1) return 'improving'
    if (recentAvg < olderAvg - 0.1) return 'declining'
    return 'stable'
  }

  const generateLocalInsights = (): AIInsight => {
    const trend = calculateOverallTrend()
    const avgScore = dailySentiments.reduce((sum, d) => sum + d.score, 0) / dailySentiments.length
    
    return {
      summary: `Team sentiment is ${avgScore > 0.3 ? 'positive' : avgScore < -0.3 ? 'concerning' : 'neutral'} with ${burnoutIndicators.length} burnout indicators detected. ${trend === 'declining' ? 'Immediate attention recommended.' : 'Continue monitoring team health.'}`,
      trend: `Sentiment is ${trend} over the past week`,
      recommendations: [
        burnoutIndicators.length > 0 ? "Schedule 1-on-1s with affected team members" : "Maintain current positive practices",
        trend === 'declining' ? "Review recent workload and deadlines" : "Celebrate recent team achievements",
        "Encourage regular breaks and work-life balance"
      ],
      priority_actions: burnoutIndicators.filter(b => b.severity === 'high').length > 0 ? [
        "Immediately address high-severity burnout indicators",
        "Consider redistributing workload"
      ] : [
        "Continue regular team check-ins",
        "Monitor sentiment trends daily"
      ]
    }
  }

  useEffect(() => {
    if (dailySentiments.length > 0) {
      generateInsights()
    }
  }, [dailySentiments.length])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Insights
          </CardTitle>
          <CardDescription>Generating personalized recommendations...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-red-500 mb-4">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">{error}</p>
          </div>
          <Button onClick={generateInsights} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!insights) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Insights
            </CardTitle>
            <CardDescription>Powered by Claude AI</CardDescription>
          </div>
          <Button onClick={generateInsights} variant="ghost" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="text-sm font-medium mb-2">Summary</h4>
          <p className="text-sm text-muted-foreground">{insights.summary}</p>
          <Badge variant="outline" className="mt-2">
            {insights.trend}
          </Badge>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Recommendations
          </h4>
          <ul className="space-y-2">
            {insights.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span className="text-sm">{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {insights.priority_actions.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-red-600 dark:text-red-400">
              <Target className="h-4 w-4" />
              Priority Actions
            </h4>
            <ul className="space-y-2">
              {insights.priority_actions.map((action, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Badge variant="destructive" className="mt-0.5 text-xs">
                    {i + 1}
                  </Badge>
                  <span className="text-sm">{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}