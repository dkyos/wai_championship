'use client'

import { useState, useEffect } from 'react'
import { GameStatus, Team, Question } from '@/types'
import GameControl from '@/components/admin/GameControl'
import TeamManagement from '@/components/admin/TeamManagement'
import QuestionManagement from '@/components/admin/QuestionManagement'
import Overview from '@/components/admin/Overview'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'teams' | 'questions' | 'control'>('overview')
  const [gameStatus, setGameStatus] = useState<GameStatus>('준비중')
  const [teams, setTeams] = useState<Team[]>([])
  const [questions, setQuestions] = useState<Question[]>([])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 3000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const [gameRes, teamsRes, questionsRes] = await Promise.all([
        fetch('/api/game'),
        fetch('/api/teams'),
        fetch('/api/questions'),
      ])

      const gameData = await gameRes.json()
      const teamsData = await teamsRes.json()
      const questionsData = await questionsRes.json()

      setGameStatus(gameData.status)
      setTeams(teamsData)
      setQuestions(questionsData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const tabs = [
    { id: 'overview' as const, label: '현황', icon: '📊' },
    { id: 'teams' as const, label: '팀 관리', icon: '👥' },
    { id: 'questions' as const, label: '질문 관리', icon: '❓' },
    { id: 'control' as const, label: '게임 제어', icon: '⚙️' },
  ]

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="glass-effect rounded-3xl p-8 mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            WAi Championship 관리자
          </h1>
          <div className="flex items-center gap-4 mt-4">
            <span className="text-sm font-semibold text-gray-600">게임 상태:</span>
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${
              gameStatus === '진행중' ? 'bg-green-500 text-white' :
              gameStatus === '종료' ? 'bg-red-500 text-white' :
              'bg-gray-300 text-gray-700'
            }`}>
              {gameStatus}
            </span>
          </div>
        </div>

        <div className="glass-effect rounded-3xl p-2 mb-8">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 px-6 rounded-2xl font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                    : 'bg-white/50 text-gray-600 hover:bg-white/80'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-effect rounded-3xl p-8">
          {activeTab === 'overview' && (
            <Overview teams={teams} questions={questions} gameStatus={gameStatus} />
          )}
          {activeTab === 'teams' && (
            <TeamManagement teams={teams} onUpdate={fetchData} />
          )}
          {activeTab === 'questions' && (
            <QuestionManagement questions={questions} onUpdate={fetchData} />
          )}
          {activeTab === 'control' && (
            <GameControl gameStatus={gameStatus} onUpdate={fetchData} />
          )}
        </div>
      </div>
    </div>
  )
}
