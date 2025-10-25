import { NextResponse } from 'next/server'
import { gameStore } from '@/lib/store'

/**
 * 폴링 엔드포인트
 * 클라이언트가 주기적으로 호출하여 최신 상태를 가져옴
 */
export async function GET() {
  const gameState = gameStore.getGameState()
  const rankings = gameStore.getTeamRankings()

  return NextResponse.json({
    status: gameState.status,
    rankings,
    totalQuestions: gameState.questions.length,
    timestamp: new Date().toISOString(),
  })
}
