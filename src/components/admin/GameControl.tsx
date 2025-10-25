'use client'

import { GameStatus } from '@/types'
import { useState } from 'react'

interface GameControlProps {
  gameStatus: GameStatus
  onUpdate: () => void
}

export default function GameControl({ gameStatus, onUpdate }: GameControlProps) {
  const [loading, setLoading] = useState(false)

  const handleStatusChange = async (newStatus: GameStatus) => {
    if (loading) return

    const confirmMessages = {
      '진행중': '게임을 시작하시겠습니까?',
      '종료': '게임을 종료하시겠습니까?',
      '준비중': '게임을 준비중 상태로 변경하시겠습니까?',
    }

    if (!confirm(confirmMessages[newStatus])) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setStatus', status: newStatus }),
      })

      if (response.ok) {
        onUpdate()
      } else {
        alert('상태 변경에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to change status:', error)
      alert('상태 변경 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('게임을 초기화하시겠습니까? 모든 답변과 반응이 삭제됩니다.')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      })

      if (response.ok) {
        alert('게임이 초기화되었습니다.')
        onUpdate()
      } else {
        alert('초기화에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to reset game:', error)
      alert('초기화 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">게임 제어</h2>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">현재 상태</h3>
        <div className="text-center py-8">
          <div className={`inline-block px-8 py-4 rounded-full text-2xl font-bold ${
            gameStatus === '진행중' ? 'bg-green-500 text-white animate-pulse-slow' :
            gameStatus === '종료' ? 'bg-red-500 text-white' :
            'bg-gray-300 text-gray-700'
          }`}>
            {gameStatus}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">상태 변경</h3>
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => handleStatusChange('준비중')}
            disabled={loading || gameStatus === '준비중'}
            className={`py-4 px-6 rounded-xl font-semibold transition-all ${
              gameStatus === '준비중'
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-500 text-white hover:bg-gray-600 hover:scale-105'
            }`}
          >
            준비중으로 변경
          </button>

          <button
            onClick={() => handleStatusChange('진행중')}
            disabled={loading || gameStatus === '진행중'}
            className={`py-4 px-6 rounded-xl font-semibold transition-all ${
              gameStatus === '진행중'
                ? 'bg-green-200 text-green-400 cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600 hover:scale-105'
            }`}
          >
            게임 시작
          </button>

          <button
            onClick={() => handleStatusChange('종료')}
            disabled={loading || gameStatus === '종료'}
            className={`py-4 px-6 rounded-xl font-semibold transition-all ${
              gameStatus === '종료'
                ? 'bg-red-200 text-red-400 cursor-not-allowed'
                : 'bg-red-500 text-white hover:bg-red-600 hover:scale-105'
            }`}
          >
            게임 종료
          </button>
        </div>
      </div>

      <div className="bg-orange-50 rounded-2xl p-6 border-2 border-orange-200">
        <h3 className="text-lg font-semibold mb-4 text-orange-800">위험한 작업</h3>
        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full py-4 px-6 rounded-xl font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-all hover:scale-105"
        >
          게임 초기화 (모든 답변 삭제)
        </button>
        <p className="text-sm text-orange-600 mt-2">
          ⚠️ 주의: 이 작업은 되돌릴 수 없습니다.
        </p>
      </div>
    </div>
  )
}
