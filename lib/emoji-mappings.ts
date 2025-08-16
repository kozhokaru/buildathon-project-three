export const emojiSentimentMap: Record<string, number> = {
  // Positive emojis
  '😀': 1, '😃': 1, '😄': 1, '😁': 1, '😊': 1,
  '😍': 1, '🥰': 1, '😘': 1, '🤗': 1, '🤩': 1,
  '🎉': 1, '🎊': 1, '✨': 1, '💪': 1, '👍': 1,
  '👏': 1, '🙌': 1, '💯': 1, '🔥': 1, '🚀': 1,
  '⭐': 1, '🌟': 1, '💫': 1, '🏆': 1, '🥇': 1,
  '❤️': 1, '💚': 1, '💙': 1, '💜': 1, '🧡': 1,
  '💛': 1, '🤍': 1, '💖': 1, '💝': 1, '💗': 1,
  
  // Negative emojis
  '😔': -1, '😞': -1, '😟': -1, '😢': -1, '😭': -1,
  '😩': -1, '😫': -1, '😤': -1, '😠': -1, '😡': -1,
  '🤬': -1, '😰': -1, '😥': -1, '😓': -1, '🤯': -1,
  '😱': -1, '😨': -1, '😵': -1, '🤮': -1, '🤢': -1,
  '👎': -1, '💔': -1, '🙁': -1, '☹️': -1, '😣': -1,
  '😖': -1, '😕': -1, '🤦': -1, '🤷': -0.5, '😑': -0.5,
  
  // Neutral emojis
  '👀': 0, '✅': 0.2, '📝': 0, '🤔': 0, '💭': 0,
  '🙏': 0.3, '🤝': 0.3, '👋': 0.2, '✋': 0, '🖐️': 0,
  '👌': 0.3, '✌️': 0.3, '🤞': 0.2, '🤟': 0.3, '🤘': 0.2,
  '📊': 0, '📈': 0.2, '📉': -0.2, '📋': 0, '📌': 0,
  '📍': 0, '🔔': 0, '🔕': 0, '💡': 0.3, '🎯': 0.3
}

export function calculateEmojiScore(emojis: string[]): number {
  if (emojis.length === 0) return 0
  
  let totalScore = 0
  let validEmojiCount = 0
  
  for (const emoji of emojis) {
    if (emoji in emojiSentimentMap) {
      totalScore += emojiSentimentMap[emoji]
      validEmojiCount++
    }
  }
  
  return validEmojiCount > 0 ? totalScore / validEmojiCount : 0
}

export function getEmojiForSentiment(score: number): string {
  if (score >= 0.6) return '😊'
  if (score >= 0.3) return '🙂'
  if (score >= -0.3) return '😐'
  if (score >= -0.6) return '😟'
  return '😔'
}

export function getSentimentLabel(score: number): string {
  if (score >= 0.6) return 'Very Positive'
  if (score >= 0.3) return 'Positive'
  if (score >= -0.3) return 'Neutral'
  if (score >= -0.6) return 'Negative'
  return 'Very Negative'
}

export function getSentimentColor(score: number): string {
  if (score >= 0.3) return 'text-green-500'
  if (score >= -0.3) return 'text-yellow-500'
  return 'text-red-500'
}

export function getSentimentBgColor(score: number): string {
  if (score >= 0.3) return 'bg-green-50 dark:bg-green-950'
  if (score >= -0.3) return 'bg-yellow-50 dark:bg-yellow-950'
  return 'bg-red-50 dark:bg-red-950'
}