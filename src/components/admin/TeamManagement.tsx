'use client'

import { Team } from '@/types'
import { useState } from 'react'

interface TeamManagementProps {
  teams: Team[]
  onUpdate: () => void
}

export default function TeamManagement({ teams, onUpdate }: TeamManagementProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newTeam, setNewTeam] = useState({
    name: '',
    members: '',
    password: '',
  })

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault()

    const members = newTeam.members.split(',').map(m => m.trim()).filter(Boolean)
    if (!newTeam.name || members.length === 0 || !newTeam.password) {
      alert('모든 필드를 입력해주세요.')
      return
    }

    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          name: newTeam.name,
          members,
          password: newTeam.password,
        }),
      })

      if (response.ok) {
        setNewTeam({ name: '', members: '', password: '' })
        setIsAdding(false)
        onUpdate()
      } else {
        alert('팀 등록에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to add team:', error)
      alert('팀 등록 중 오류가 발생했습니다.')
    }
  }

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('이 팀을 삭제하시겠습니까?')) {
      return
    }

    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', teamId }),
      })

      if (response.ok) {
        onUpdate()
      } else {
        alert('팀 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to delete team:', error)
      alert('팀 삭제 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">팀 관리</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all hover:scale-105"
        >
          {isAdding ? '취소' : '+ 팀 추가'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddTeam} className="bg-blue-50 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">팀 이름</label>
            <input
              type="text"
              value={newTeam.name}
              onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:outline-none"
              placeholder="예: 개발팀"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              팀원 (쉼표로 구분)
            </label>
            <input
              type="text"
              value={newTeam.members}
              onChange={(e) => setNewTeam({ ...newTeam, members: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:outline-none"
              placeholder="예: 홍길동, 김철수, 이영희"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">비밀번호</label>
            <input
              type="text"
              value={newTeam.password}
              onChange={(e) => setNewTeam({ ...newTeam, password: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:outline-none"
              placeholder="팀 로그인용 비밀번호"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all"
          >
            팀 등록
          </button>
        </form>
      )}

      <div className="space-y-4">
        {teams.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            등록된 팀이 없습니다.
          </div>
        ) : (
          teams.map((team) => (
            <div
              key={team.id}
              className="bg-white rounded-2xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{team.name}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">팀원:</span>
                      <p className="font-medium">{team.members.join(', ')}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">비밀번호:</span>
                      <p className="font-mono font-medium">{team.password}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">총점:</span>
                      <p className="font-bold text-blue-600">{team.totalScore.toFixed(1)}점</p>
                    </div>
                    <div>
                      <span className="text-gray-500">진행률:</span>
                      <p className="font-medium">{team.answers.length}개 답변</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteTeam(team.id)}
                  className="ml-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                >
                  삭제
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-gray-50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-2">통계</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600">{teams.length}</div>
            <div className="text-sm text-gray-600">전체 팀</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600">
              {teams.reduce((sum, t) => sum + t.members.length, 0)}
            </div>
            <div className="text-sm text-gray-600">전체 참가자</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600">
              {teams.reduce((sum, t) => sum + t.answers.length, 0)}
            </div>
            <div className="text-sm text-gray-600">전체 답변</div>
          </div>
        </div>
      </div>
    </div>
  )
}
