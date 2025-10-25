import { NextResponse } from 'next/server'
import { gameStore } from '@/lib/store'
import { calculateScore } from '@/lib/similarity'

export async function POST(request: Request) {
  const { teamId, questionId, userQuestion, answer } = await request.json()

  // 게임이 진행중인지 확인
  const gameState = gameStore.getGameState()
  if (gameState.status !== '진행중') {
    return NextResponse.json(
      { error: '게임이 진행중이 아닙니다' },
      { status: 400 }
    )
  }

  // 질문 확인
  const question = gameStore.getQuestion(questionId)
  if (!question) {
    return NextResponse.json(
      { error: '질문을 찾을 수 없습니다' },
      { status: 404 }
    )
  }

  // 점수 계산 (제출한 답변과 목표 답변의 유사도)
  const score = calculateScore(answer, question.targetAnswer)

  // 답변 저장 (팀이 만든 질문 + WAi 답변)
  gameStore.submitAnswer(teamId, questionId, userQuestion, answer, score)

  return NextResponse.json({
    success: true,
    score,
    questionId,
  })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const teamId = searchParams.get('teamId')
  const questionId = searchParams.get('questionId')

  if (!teamId || !questionId) {
    return NextResponse.json(
      { error: 'teamId and questionId are required' },
      { status: 400 }
    )
  }

  const answer = gameStore.getTeamAnswer(teamId, questionId)
  return NextResponse.json(answer || null)
}
