export interface SlackMessage {
  id: string
  user: string
  userName: string
  text: string
  timestamp: string
  reactions: string[]
  thread_count: number
  channel: string
}

export interface SlackChannel {
  id: string
  name: string
  messages: SlackMessage[]
}

const userNames = [
  'Alex Chen', 'Sarah Johnson', 'Mike Wilson', 'Emily Davis',
  'David Lee', 'Jessica Brown', 'Ryan Taylor', 'Lisa Anderson',
  'Chris Martinez', 'Amanda Thomas'
]

const positiveMessages = [
  "Great work on the deployment today! 🎉",
  "Thanks for the help with that bug fix 👍",
  "The new feature is looking awesome! ✨",
  "Appreciate everyone's hard work this week 💪",
  "Excited about the upcoming release!",
  "That solution is brilliant, nice thinking!",
  "Team collaboration has been fantastic lately",
  "Love the improvements to the codebase",
  "The demo went really well, congrats everyone! 🎊",
  "Smooth deployment, well done team!"
]

const neutralMessages = [
  "Meeting at 3pm today",
  "Has anyone seen the latest docs?",
  "PR is ready for review",
  "Updated the ticket status",
  "Pushing the changes now",
  "Can someone check the staging server?",
  "Weekly standup in 5 minutes",
  "Added comments to the issue",
  "Running the tests locally",
  "Merged to main branch"
]

const stressedMessages = [
  "Another late night debugging session...",
  "This bug is driving me crazy 😫",
  "Deadline is tomorrow and we're not ready",
  "Too many meetings today, can't focus",
  "Why is everything breaking at once? 🤦",
  "I need more coffee to deal with this",
  "Can we push the deadline? This is too much",
  "Been stuck on this issue for hours 😞",
  "The requirements keep changing...",
  "Feeling overwhelmed with all these tasks"
]

const burnoutMessages = [
  "I can't do this anymore 😔",
  "Thinking about taking a long break",
  "This pace is unsustainable",
  "My work-life balance is completely off",
  "Haven't had a proper weekend in months",
  "Too burned out to think clearly",
  "Everything feels like an emergency lately",
  "I'm exhausted and it's only Tuesday 😞",
  "Considering other options at this point",
  "The pressure is getting to be too much 😡"
]

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function generateReactions(sentiment: 'positive' | 'neutral' | 'stressed' | 'burnout'): string[] {
  const positiveEmojis = ['👍', '🎉', '✨', '💪', '🚀', '❤️', '😊']
  const neutralEmojis = ['👀', '✅', '📝', '🤔']
  const negativeEmojis = ['😔', '😞', '😫', '🤦', '😡', '😩']
  
  const reactions: string[] = []
  const count = Math.floor(Math.random() * 4)
  
  for (let i = 0; i < count; i++) {
    if (sentiment === 'positive') {
      reactions.push(getRandomElement(positiveEmojis))
    } else if (sentiment === 'neutral') {
      reactions.push(getRandomElement(neutralEmojis))
    } else {
      reactions.push(getRandomElement(negativeEmojis))
    }
  }
  
  return reactions
}

function generateMessagesForDay(
  date: Date,
  sentiment: 'positive' | 'neutral' | 'stressed' | 'burnout',
  channel: string
): SlackMessage[] {
  const messages: SlackMessage[] = []
  const messageCount = 15 + Math.floor(Math.random() * 10)
  
  const messagePool = sentiment === 'positive' ? positiveMessages :
                      sentiment === 'neutral' ? neutralMessages :
                      sentiment === 'stressed' ? stressedMessages :
                      burnoutMessages
  
  const mixedPool = [
    ...messagePool,
    ...messagePool,
    ...messagePool,
    ...neutralMessages
  ]
  
  for (let i = 0; i < messageCount; i++) {
    const hour = 9 + Math.floor(Math.random() * 9)
    const minute = Math.floor(Math.random() * 60)
    const timestamp = new Date(date)
    timestamp.setHours(hour, minute, 0, 0)
    
    const userName = getRandomElement(userNames)
    
    messages.push({
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user: `user_${userName.toLowerCase().replace(' ', '_')}`,
      userName,
      text: getRandomElement(mixedPool),
      timestamp: timestamp.toISOString(),
      reactions: generateReactions(sentiment),
      thread_count: Math.random() > 0.7 ? Math.floor(Math.random() * 5) : 0,
      channel
    })
  }
  
  return messages.sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )
}

export function generateMockData(): SlackChannel[] {
  const channels = ['engineering', 'product', 'design', 'general']
  const today = new Date()
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 6)
  
  const slackChannels: SlackChannel[] = []
  
  for (const channelName of channels) {
    const messages: SlackMessage[] = []
    
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const currentDate = new Date(weekAgo)
      currentDate.setDate(currentDate.getDate() + dayOffset)
      
      let sentiment: 'positive' | 'neutral' | 'stressed' | 'burnout'
      
      const dayOfWeek = currentDate.getDay()
      if (dayOfWeek === 1 || dayOfWeek === 2) {
        sentiment = channelName === 'engineering' ? 'positive' : 'neutral'
      } else if (dayOfWeek === 3) {
        sentiment = channelName === 'engineering' ? 'neutral' : 'neutral'
      } else if (dayOfWeek === 4) {
        sentiment = channelName === 'engineering' ? 'burnout' : 'stressed'
      } else if (dayOfWeek === 5) {
        sentiment = channelName === 'engineering' ? 'stressed' : 'neutral'
      } else {
        sentiment = 'neutral'
      }
      
      messages.push(...generateMessagesForDay(currentDate, sentiment, channelName))
    }
    
    slackChannels.push({
      id: `channel_${channelName}`,
      name: channelName,
      messages
    })
  }
  
  return slackChannels
}

export function exportToJSON(channels: SlackChannel[]): string {
  return JSON.stringify(channels, null, 2)
}

export function exportToCSV(channels: SlackChannel[]): string {
  const headers = ['channel', 'user', 'userName', 'text', 'timestamp', 'reactions', 'thread_count']
  const rows = [headers.join(',')]
  
  for (const channel of channels) {
    for (const message of channel.messages) {
      const row = [
        channel.name,
        message.user,
        message.userName,
        `"${message.text.replace(/"/g, '""')}"`,
        message.timestamp,
        message.reactions.join(' '),
        message.thread_count.toString()
      ]
      rows.push(row.join(','))
    }
  }
  
  return rows.join('\n')
}