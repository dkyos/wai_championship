import { NextResponse } from 'next/server'
import { gameStore } from '@/lib/store'
import { ReactionType } from '@/types'

export async function POST(request: Request) {
  const { questionId, teamId, type, userId } = await request.json()

  if (!questionId || !teamId || !type || !userId) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    )
  }

  const reaction = gameStore.addReaction(questionId, teamId, type as ReactionType, userId)
  return NextResponse.json(reaction)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const questionId = searchParams.get('questionId')

  if (questionId) {
    const counts = gameStore.getReactionCounts(questionId)
    return NextResponse.json(counts)
  }

  const reactions = gameStore.getReactions()
  return NextResponse.json(reactions)
}
