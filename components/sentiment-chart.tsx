'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DailySentiment } from '@/lib/sentiment-analyzer'
import { getEmojiForSentiment, getSentimentLabel } from '@/lib/emoji-mappings'

interface SentimentChartProps {
  data: DailySentiment[]
  title?: string
  description?: string
}

export function SentimentChart({ 
  data, 
  title = "Weekly Sentiment Trend",
  description = "Team mood over the past 7 days"
}: SentimentChartProps) {
  const chartData = data.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    score: parseFloat((d.score).toFixed(3)),
    messageCount: d.messageCount,
    emoji: getEmojiForSentiment(d.score),
    label: getSentimentLabel(d.score)
  }))

  const getColorForScore = (score: number) => {
    if (score >= 0.3) return '#10b981' // green-500
    if (score >= -0.3) return '#eab308' // yellow-500
    return '#ef4444' // red-500
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload
      return (
        <div className="rounded-lg border bg-background p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{data.emoji}</span>
            <div>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">{data.label}</p>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">Score:</span>
              <span className="text-xs font-medium" style={{ color: getColorForScore(data.score) }}>
                {data.score > 0 ? '+' : ''}{data.score}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">Messages:</span>
              <span className="text-xs font-medium">{data.messageCount}</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  const averageScore = data.length > 0 
    ? data.reduce((sum, d) => sum + d.score, 0) / data.length 
    : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getEmojiForSentiment(averageScore)}</span>
            <div className="text-right">
              <p className="text-sm font-medium">{getSentimentLabel(averageScore)}</p>
              <p className="text-xs text-muted-foreground">Overall</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fill: 'currentColor' }}
            />
            <YAxis 
              domain={[-1, 1]}
              ticks={[-1, -0.5, 0, 0.5, 1]}
              className="text-xs"
              tick={{ fill: 'currentColor' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine 
              y={0} 
              stroke="currentColor" 
              strokeDasharray="3 3" 
              opacity={0.3}
            />
            <ReferenceLine 
              y={0.3} 
              stroke="#10b981" 
              strokeDasharray="3 3" 
              opacity={0.2}
            />
            <ReferenceLine 
              y={-0.3} 
              stroke="#ef4444" 
              strokeDasharray="3 3" 
              opacity={0.2}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#8884d8"
              fill="url(#colorScore)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-4 flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span>Positive (&gt; 0.3)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <span>Neutral (-0.3 to 0.3)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span>Negative (&lt; -0.3)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}