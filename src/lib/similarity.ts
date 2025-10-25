import stringSimilarity from 'string-similarity'

/**
 * 텍스트 정규화
 * - 소문자 변환
 * - 앞뒤 공백 제거
 * - 연속된 공백을 하나로
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

/**
 * 두 텍스트의 유사도를 0-10점 사이의 점수로 계산
 *
 * @param answer - WAi에서 받은 답변
 * @param correctAnswer - 실제 정답
 * @returns 0-10 사이의 점수 (소수점 1자리)
 */
export function calculateSimilarity(answer: string, correctAnswer: string): number {
  if (!answer || !correctAnswer) {
    return 0
  }

  const normalizedAnswer = normalizeText(answer)
  const normalizedCorrect = normalizeText(correctAnswer)

  // 완전 일치하면 만점
  if (normalizedAnswer === normalizedCorrect) {
    return 10
  }

  // Dice's Coefficient를 사용한 유사도 계산 (0~1 사이 값)
  const similarity = stringSimilarity.compareTwoStrings(
    normalizedAnswer,
    normalizedCorrect
  )

  // 0~1 값을 0~10으로 변환하고 소수점 1자리로 반올림
  const score = Math.round(similarity * 100) / 10

  return score
}

/**
 * 키워드 기반 추가 점수 계산
 * 정답에 포함된 핵심 키워드가 답변에 얼마나 포함되어 있는지 체크
 */
export function calculateKeywordBonus(
  answer: string,
  correctAnswer: string,
  keywords: string[] = []
): number {
  if (keywords.length === 0) {
    return 0
  }

  const normalizedAnswer = normalizeText(answer)
  const matchedKeywords = keywords.filter(keyword =>
    normalizedAnswer.includes(normalizeText(keyword))
  )

  const keywordMatchRate = matchedKeywords.length / keywords.length
  return Math.round(keywordMatchRate * 20) / 10 // 최대 2점 보너스
}

/**
 * 복합 점수 계산 (유사도 + 키워드 보너스)
 */
export function calculateScore(
  answer: string,
  correctAnswer: string,
  keywords?: string[]
): number {
  const baseScore = calculateSimilarity(answer, correctAnswer)
  const bonus = keywords ? calculateKeywordBonus(answer, correctAnswer, keywords) : 0

  // 최대 10점을 넘지 않도록
  return Math.min(10, Math.round((baseScore + bonus) * 10) / 10)
}

/**
 * 답변의 길이가 적절한지 검증
 */
export function validateAnswerLength(answer: string, minLength = 5, maxLength = 5000): boolean {
  const trimmed = answer.trim()
  return trimmed.length >= minLength && trimmed.length <= maxLength
}

/**
 * 점수에 따른 피드백 메시지
 */
export function getScoreFeedback(score: number): string {
  if (score >= 9.5) return '완벽합니다! 🎉'
  if (score >= 8.5) return '훌륭해요! 🌟'
  if (score >= 7.0) return '잘했어요! 👏'
  if (score >= 5.0) return '좋습니다! 👍'
  if (score >= 3.0) return '아쉬워요 😅'
  return '다시 시도해보세요 💪'
}
