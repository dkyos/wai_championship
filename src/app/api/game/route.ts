import { NextResponse } from 'next/server'
import { gameStore } from '@/lib/store'

export async function GET() {
  const state = gameStore.getGameState()
  return NextResponse.json(state)
}

export async function POST(request: Request) {
  const { action, status } = await request.json()

  if (action === 'setStatus') {
    gameStore.setGameStatus(status)
    return NextResponse.json({ success: true, status })
  }

  if (action === 'reset') {
    gameStore.resetGame()
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
