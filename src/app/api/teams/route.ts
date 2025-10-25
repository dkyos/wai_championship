import { NextResponse } from 'next/server'
import { gameStore } from '@/lib/store'

export async function GET() {
  const teams = gameStore.getTeams()
  return NextResponse.json(teams)
}

export async function POST(request: Request) {
  const { action, ...data } = await request.json()

  if (action === 'create') {
    const { name, members, password } = data
    const team = gameStore.addTeam({ name, members, password })
    return NextResponse.json(team)
  }

  if (action === 'authenticate') {
    const { teamId, password } = data
    const isValid = gameStore.authenticateTeam(teamId, password)
    if (isValid) {
      const team = gameStore.getTeam(teamId)
      return NextResponse.json({ success: true, team })
    }
    return NextResponse.json({ success: false }, { status: 401 })
  }

  if (action === 'delete') {
    const { teamId } = data
    gameStore.deleteTeam(teamId)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
