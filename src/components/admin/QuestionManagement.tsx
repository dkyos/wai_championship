'use client'

import { Question } from '@/types'
import { useState } from 'react'

interface QuestionManagementProps {
  questions: Question[]
  onUpdate: () => void
}

export default function QuestionManagement({ questions, onUpdate }: QuestionManagementProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [isBulkImport, setIsBulkImport] = useState(false)
  const [newQuestion, setNewQuestion] = useState({
    targetAnswer: '',
  })
  const [bulkData, setBulkData] = useState('')

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newQuestion.targetAnswer) {
      alert('목표 답변을 입력해주세요.')
      return
    }

    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          targetAnswer: newQuestion.targetAnswer,
          order: questions.length,
        }),
      })

      if (response.ok) {
        setNewQuestion({ targetAnswer: '' })
        setIsAdding(false)
        onUpdate()
      } else {
        alert('답변 등록에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to add question:', error)
      alert('답변 등록 중 오류가 발생했습니다.')
    }
  }

  const handleBulkImport = async () => {
    try {
      const lines = bulkData.trim().split('\n').filter(Boolean)
      const questionsData = lines.map((line, index) => {
        const targetAnswer = line.trim()
        return { targetAnswer, order: index }
      })

      if (questionsData.some(q => !q.targetAnswer)) {
        alert('잘못된 형식입니다. 각 줄에 답변을 하나씩 입력해주세요.')
        return
      }

      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'setAll',
          questions: questionsData,
        }),
      })

      if (response.ok) {
        setBulkData('')
        setIsBulkImport(false)
        onUpdate()
      } else {
        alert('일괄 등록에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to bulk import:', error)
      alert('일괄 등록 중 오류가 발생했습니다.')
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('이 문제를 삭제하시겠습니까?')) {
      return
    }

    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', questionId }),
      })

      if (response.ok) {
        onUpdate()
      } else {
        alert('문제 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to delete question:', error)
      alert('문제 삭제 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">답변 관리</h2>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setIsBulkImport(!isBulkImport)
              setIsAdding(false)
            }}
            className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all hover:scale-105"
          >
            📋 일괄 등록
          </button>
          <button
            onClick={() => {
              setIsAdding(!isAdding)
              setIsBulkImport(false)
            }}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all hover:scale-105"
          >
            {isAdding ? '취소' : '+ 답변 추가'}
          </button>
        </div>
      </div>

      {isBulkImport && (
        <div className="bg-green-50 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">
              목표 답변 일괄 입력 (각 줄에 하나씩)
            </label>
            <textarea
              value={bulkData}
              onChange={(e) => setBulkData(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-green-200 focus:border-green-500 focus:outline-none font-mono text-sm"
              rows={10}
              placeholder={'더 나은 세상을 만드는 연결\n서울시 강남구\n2012년\n...'}
            />
          </div>
          <button
            onClick={handleBulkImport}
            className="w-full py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all"
          >
            일괄 등록 (기존 답변 모두 교체)
          </button>
        </div>
      )}

      {isAdding && (
        <form onSubmit={handleAddQuestion} className="bg-blue-50 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">
              목표 답변 (팀이 맞춰야 할 답변)
            </label>
            <textarea
              value={newQuestion.targetAnswer}
              onChange={(e) => setNewQuestion({ targetAnswer: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:outline-none"
              rows={3}
              placeholder="예: 더 나은 세상을 만드는 연결"
            />
            <p className="text-sm text-gray-600 mt-2">
              * 팀은 이 답변을 보고, WAi에서 이 답변이 나오도록 질문을 만들어야 합니다.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all"
          >
            답변 등록
          </button>
        </form>
      )}

      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            등록된 답변이 없습니다.
          </div>
        ) : (
          questions.map((question, index) => (
            <div
              key={question.id}
              className="bg-white rounded-2xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl font-bold text-blue-600">
                      #{index + 1}
                    </span>
                    <h3 className="text-sm font-semibold text-gray-500">
                      목표 답변
                    </h3>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="font-medium text-lg">{question.targetAnswer}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteQuestion(question.id)}
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
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600">{questions.length}</div>
          <div className="text-sm text-gray-600">전체 문제</div>
        </div>
      </div>
    </div>
  )
}
