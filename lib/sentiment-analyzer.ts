import Sentiment from 'sentiment'
import { SlackMessage, SlackChannel } from './mock-data'
import { calculateEmojiScore } from './emoji-mappings'

const sentiment = new Sentiment()

export interface MessageSentiment {
  message: SlackMessage
  textScore: number
  emojiScore: number
  combinedScore: number
  timestamp: string
}

export interface ChannelSentiment {
  channel: string
  averageScore: number
  messageCount: number
  trend: 'improving' | 'declining' | 'stable'
  recentMessages: MessageSentiment[]
}

export interface DailySentiment {
  date: string
  score: number
  messageCount: number
  channels: { [key: string]: number }
}

export interface BurnoutIndicator {
  type: 'declining_sentiment' | 'low_engagement' | 'negative_keywords' | 'overtime_activity'
  severity: 'low' | 'medium' | 'high'
  message: string
  affectedChannels: string[]
}

const burnoutKeywords = [
  'burned out', 'burnout', 'exhausted', 'overwhelmed', 'stressed',
  'can\'t do this', 'too much', 'breaking point', 'need a break',
  'work life balance', 'quit', 'leaving', 'done with this',
  'sustainable', 'unsustainable', 'overtime', 'weekend work'
]

const positiveKeywords = [
  'great', 'awesome', 'excellent', 'amazing', 'fantastic',
  'love', 'appreciate', 'thanks', 'brilliant', 'perfect',
  'excited', 'happy', 'celebrate', 'success', 'achievement'
]

export function analyzeMessage(message: SlackMessage): MessageSentiment {
  // Create a copy of the message text to avoid readonly issues
  const messageText = String(message.text || '')
  const textAnalysis = sentiment.analyze(messageText)
  let textScore = textAnalysis.score
  
  let normalizedTextScore = Math.max(-5, Math.min(5, textScore)) / 5
  
  const lowerText = messageText.toLowerCase()
  for (const keyword of burnoutKeywords) {
    if (lowerText.includes(keyword)) {
      normalizedTextScore -= 0.3
    }
  }
  for (const keyword of positiveKeywords) {
    if (lowerText.includes(keyword)) {
      normalizedTextScore += 0.2
    }
  }
  
  // Create a copy of reactions array to avoid readonly issues
  const reactions = [...(message.reactions || [])]
  const emojiScore = calculateEmojiScore(reactions)
  
  const weight = reactions.length > 0 ? 0.6 : 0.8
  const combinedScore = (normalizedTextScore * weight) + (emojiScore * (1 - weight))
  
  return {
    message: { ...message }, // Create a shallow copy of the message
    textScore: normalizedTextScore,
    emojiScore,
    combinedScore: Math.max(-1, Math.min(1, combinedScore)),
    timestamp: message.timestamp
  }
}

export function analyzeChannel(channel: SlackChannel): ChannelSentiment {
  const sentiments = channel.messages.map(analyzeMessage)
  
  if (sentiments.length === 0) {
    return {
      channel: channel.name,
      averageScore: 0,
      messageCount: 0,
      trend: 'stable',
      recentMessages: []
    }
  }
  
  const totalScore = sentiments.reduce((sum, s) => sum + s.combinedScore, 0)
  const averageScore = totalScore / sentiments.length
  
  const sortedByTime = [...sentiments].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
  const recentMessages = sortedByTime.slice(0, 10)
  
  const firstHalf = sentiments.slice(0, Math.floor(sentiments.length / 2))
  const secondHalf = sentiments.slice(Math.floor(sentiments.length / 2))
  
  const firstHalfAvg = firstHalf.reduce((sum, s) => sum + s.combinedScore, 0) / firstHalf.length
  const secondHalfAvg = secondHalf.reduce((sum, s) => sum + s.combinedScore, 0) / secondHalf.length
  
  let trend: 'improving' | 'declining' | 'stable' = 'stable'
  if (secondHalfAvg - firstHalfAvg > 0.2) {
    trend = 'improving'
  } else if (firstHalfAvg - secondHalfAvg > 0.2) {
    trend = 'declining'
  }
  
  return {
    channel: channel.name,
    averageScore,
    messageCount: channel.messages.length,
    trend,
    recentMessages
  }
}

export function calculateDailySentiments(channels: SlackChannel[]): DailySentiment[] {
  const dailyMap = new Map<string, { scores: number[], count: number, channels: Map<string, number[]> }>()
  
  for (const channel of channels) {
    for (const message of channel.messages) {
      const date = new Date(message.timestamp).toISOString().split('T')[0]
      const sentiment = analyzeMessage(message)
      
      if (!dailyMap.has(date)) {
        dailyMap.set(date, { scores: [], count: 0, channels: new Map() })
      }
      
      const daily = dailyMap.get(date)!
      daily.scores.push(sentiment.combinedScore)
      daily.count++
      
      if (!daily.channels.has(channel.name)) {
        daily.channels.set(channel.name, [])
      }
      daily.channels.get(channel.name)!.push(sentiment.combinedScore)
    }
  }
  
  const dailySentiments: DailySentiment[] = []
  
  for (const [date, data] of dailyMap.entries()) {
    const channelScores: { [key: string]: number } = {}
    
    for (const [channelName, scores] of data.channels.entries()) {
      channelScores[channelName] = scores.reduce((a, b) => a + b, 0) / scores.length
    }
    
    dailySentiments.push({
      date,
      score: data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
      messageCount: data.count,
      channels: channelScores
    })
  }
  
  return dailySentiments.sort((a, b) => a.date.localeCompare(b.date))
}

export function detectBurnoutIndicators(
  channels: SlackChannel[],
  dailySentiments: DailySentiment[]
): BurnoutIndicator[] {
  const indicators: BurnoutIndicator[] = []
  
  // Check for declining sentiment (3+ consecutive days)
  if (dailySentiments.length >= 3) {
    let consecutiveDeclines = 0
    for (let i = 1; i < dailySentiments.length; i++) {
      if (dailySentiments[i].score < dailySentiments[i - 1].score) {
        consecutiveDeclines++
      } else {
        consecutiveDeclines = 0
      }
      
      if (consecutiveDeclines >= 2) {
        const affectedChannels = Object.entries(dailySentiments[i].channels)
          .filter(([_, score]) => score < 0)
          .map(([channel]) => channel)
        
        indicators.push({
          type: 'declining_sentiment',
          severity: dailySentiments[i].score < -0.5 ? 'high' : 'medium',
          message: 'Team sentiment has been declining for 3+ consecutive days',
          affectedChannels
        })
        break
      }
    }
  }
  
  // Check for low engagement
  const recentDays = dailySentiments.slice(-3)
  const avgRecentMessages = recentDays.reduce((sum, d) => sum + d.messageCount, 0) / recentDays.length
  const overallAvgMessages = dailySentiments.reduce((sum, d) => sum + d.messageCount, 0) / dailySentiments.length
  
  if (avgRecentMessages < overallAvgMessages * 0.6) {
    indicators.push({
      type: 'low_engagement',
      severity: avgRecentMessages < overallAvgMessages * 0.4 ? 'high' : 'medium',
      message: 'Team engagement has dropped significantly in recent days',
      affectedChannels: channels.map(c => c.name)
    })
  }
  
  // Check for negative keywords
  for (const channel of channels) {
    const recentMessages = channel.messages.slice(-20)
    const burnoutCount = recentMessages.filter(m => 
      burnoutKeywords.some(keyword => m.text.toLowerCase().includes(keyword))
    ).length
    
    if (burnoutCount >= 3) {
      indicators.push({
        type: 'negative_keywords',
        severity: burnoutCount >= 5 ? 'high' : 'medium',
        message: `Multiple burnout-related keywords detected in ${channel.name}`,
        affectedChannels: [channel.name]
      })
    }
  }
  
  // Check for overtime activity (messages outside 9-6)
  for (const channel of channels) {
    const recentMessages = channel.messages.slice(-50)
    const overtimeMessages = recentMessages.filter(m => {
      const hour = new Date(m.timestamp).getHours()
      return hour < 9 || hour >= 18
    })
    
    if (overtimeMessages.length > recentMessages.length * 0.3) {
      indicators.push({
        type: 'overtime_activity',
        severity: overtimeMessages.length > recentMessages.length * 0.5 ? 'high' : 'low',
        message: `High amount of after-hours activity in ${channel.name}`,
        affectedChannels: [channel.name]
      })
    }
  }
  
  return indicators
}