'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ChannelSentiment } from '@/lib/sentiment-analyzer'
import { getEmojiForSentiment, getSentimentLabel, getSentimentColor, getSentimentBgColor } from '@/lib/emoji-mappings'
import { TrendingUp, TrendingDown, Minus, MessageSquare, Users } from 'lucide-react'

interface ChannelCardProps {
  channel: ChannelSentiment
  onClick?: () => void
}

export function ChannelCard({ channel, onClick }: ChannelCardProps) {
  const emoji = getEmojiForSentiment(channel.averageScore)
  const label = getSentimentLabel(channel.averageScore)
  const colorClass = getSentimentColor(channel.averageScore)
  const bgColorClass = getSentimentBgColor(channel.averageScore)
  
  const trendIcon = channel.trend === 'improving' ? (
    <TrendingUp className="h-4 w-4 text-green-500" />
  ) : channel.trend === 'declining' ? (
    <TrendingDown className="h-4 w-4 text-red-500" />
  ) : (
    <Minus className="h-4 w-4 text-muted-foreground" />
  )
  
  const trendLabel = channel.trend === 'improving' ? 'Improving' :
                      channel.trend === 'declining' ? 'Declining' : 'Stable'
  
  const progressValue = ((channel.averageScore + 1) / 2) * 100

  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-md"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg capitalize">#{channel.channel}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <MessageSquare className="h-3 w-3" />
              <span>{channel.messageCount} messages</span>
            </CardDescription>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl mb-1">{emoji}</span>
            <Badge variant="outline" className={`${bgColorClass} border-0`}>
              <span className={colorClass}>{label}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Sentiment Score</span>
            <span className={`text-sm font-medium ${colorClass}`}>
              {channel.averageScore > 0 ? '+' : ''}{channel.averageScore.toFixed(2)}
            </span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            {trendIcon}
            <span className="text-sm font-medium">{trendLabel}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>{channel.recentMessages.length} recent</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface ChannelGridProps {
  channels: ChannelSentiment[]
  onChannelClick?: (channel: ChannelSentiment) => void
}

export function ChannelGrid({ channels, onChannelClick }: ChannelGridProps) {
  if (channels.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No channels to display</p>
          <p className="text-sm text-muted-foreground mt-1">Upload data to see channel breakdowns</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {channels.map((channel) => (
        <ChannelCard
          key={channel.channel}
          channel={channel}
          onClick={() => onChannelClick?.(channel)}
        />
      ))}
    </div>
  )
}