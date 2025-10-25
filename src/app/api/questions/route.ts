import { NextResponse } from 'next/server'
import { gameStore } from '@/lib/store'

export async function GET() {
  const questions = gameStore.getQuestions()
  return NextResponse.json(questions)
}

export async function POST(request: Request) {
  const { action, ...data } = await request.json()

  if (action === 'create') {
    const { targetAnswer, order } = data
    const newQuestion = gameStore.addQuestion({ targetAnswer, order })
    return NextResponse.json(newQuestion)
  }

  if (action === 'update') {
    const { questionId, ...updates } = data
    gameStore.updateQuestion(questionId, updates)
    return NextResponse.json({ success: true })
  }

  if (action === 'delete') {
    const { questionId } = data
    gameStore.deleteQuestion(questionId)
    return NextResponse.json({ success: true })
  }

  if (action === 'setAll') {
    const { questions } = data
    gameStore.setQuestions(questions)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
