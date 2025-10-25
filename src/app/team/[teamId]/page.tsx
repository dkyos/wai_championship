'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Team, Question, Answer, GameStatus } from '@/types'
import { getScoreFeedback } from '@/lib/similarity'

export default function TeamGamePage() {
  const params = useParams()
  const teamId = params.teamId as string

  const [team, setTeam] = useState<Team | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [gameStatus, setGameStatus] = useState<GameStatus>('준비중')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userQuestion, setUserQuestion] = useState('')  // 팀이 만든 질문
  const [answer, setAnswer] = useState('')              // WAi의 답변
  const [submitting, setSubmitting] = useState(false)
  const [lastScore, setLastScore] = useState<number | null>(null)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 3000)
    return () => clearInterval(interval)
  }, [teamId])

  const fetchData = async () => {
    try {
      const [gameRes, teamRes, questionsRes] = await Promise.all([
        fetch('/api/game'),
        fetch('/api/teams'),
        fetch('/api/questions'),
      ])

      const gameData = await gameRes.json()
      const teamsData = await teamRes.json()
      const questionsData = await questionsRes.json()

      setGameStatus(gameData.status)
      setQuestions(questionsData)

      const currentTeam = teamsData.find((t: Team) => t.id === teamId)
      if (currentTeam) {
        setTeam(currentTeam)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const currentQuestion = questions[currentQuestionIndex]
  const currentAnswer = team?.answers.find(
    (a) => a.questionId === currentQuestion?.id
  )

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userQuestion.trim() || !answer.trim() || !currentQuestion) {
      alert('질문과 답변을 모두 입력해주세요.')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId,
          questionId: currentQuestion.id,
          userQuestion: userQuestion.trim(),
          answer: answer.trim(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setLastScore(data.score)
        setUserQuestion('')
        setAnswer('')
        await fetchData()

        // 자동으로 다음 질문으로 이동
        setTimeout(() => {
          if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1)
            setLastScore(null)
          }
        }, 2000)
      } else {
        alert(data.error || '답변 제출에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to submit answer:', error)
      alert('답변 제출 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const progress = questions.length > 0
    ? ((team?.answers.length || 0) / questions.length) * 100
    : 0

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔍</div>
          <div className="text-xl font-semibold text-gray-600">팀 정보를 불러오는 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="glass-effect rounded-3xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {team.name}
              </h1>
              <p className="text-gray-600 mt-1">
                팀원: {team.members.join(', ')}
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-blue-600">
                {team.totalScore.toFixed(1)}점
              </div>
              <div className="text-sm text-gray-600">총점</div>
            </div>
          </div>

          {/* 진행률 */}
          <div className="mb-2">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>진행률</span>
              <span>{team.answers.length}/{questions.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* 게임 상태 */}
          <div className="mt-4">
            <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
              gameStatus === '진행중' ? 'bg-green-500 text-white' :
              gameStatus === '종료' ? 'bg-red-500 text-white' :
              'bg-gray-300 text-gray-700'
            }`}>
              {gameStatus}
            </span>
          </div>
        </div>

        {gameStatus !== '진행중' ? (
          <div className="glass-effect rounded-3xl p-12 text-center">
            <div className="text-6xl mb-4">
              {gameStatus === '종료' ? '🎉' : '⏳'}
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {gameStatus === '종료' ? '게임이 종료되었습니다' : '게임 시작 대기 중'}
            </h2>
            <p className="text-gray-600">
              {gameStatus === '종료'
                ? `최종 점수: ${team.totalScore.toFixed(1)}점`
                : '관리자가 게임을 시작할 때까지 기다려주세요'}
            </p>
          </div>
        ) : !currentQuestion ? (
          <div className="glass-effect rounded-3xl p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold mb-2">모든 문제를 완료했습니다!</h2>
            <p className="text-gray-600">
              최종 점수: {team.totalScore.toFixed(1)}점
            </p>
          </div>
        ) : (
          <>
            {/* 질문 네비게이션 */}
            <div className="glass-effect rounded-2xl p-4 mb-6">
              <div className="flex gap-2 overflow-x-auto">
                {questions.map((q, index) => {
                  const answered = team.answers.find(a => a.questionId === q.id)
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`flex-shrink-0 w-12 h-12 rounded-xl font-bold transition-all ${
                        index === currentQuestionIndex
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white scale-110'
                          : answered
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {index + 1}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 목표 답변 카드 */}
            <div className="glass-effect rounded-3xl p-8 mb-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="text-4xl font-bold text-blue-600">
                  #{currentQuestionIndex + 1}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2 text-gray-700">
                    목표 답변
                  </h2>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
                    <p className="text-2xl font-bold text-blue-900">
                      {currentQuestion.targetAnswer}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    💡 WAi에서 위 답변이 나오도록 질문을 만들어보세요!
                  </p>
                </div>
              </div>

              {currentAnswer ? (
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-1">내가 만든 질문:</div>
                    <div className="font-medium bg-white rounded-lg p-3">{currentAnswer.userQuestion}</div>
                  </div>
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-1">WAi의 답변:</div>
                    <div className="font-medium bg-white rounded-lg p-3">{currentAnswer.answer}</div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-green-200">
                    <div>
                      <div className="text-3xl font-bold text-green-600">
                        {currentAnswer.score.toFixed(1)}점
                      </div>
                      <div className="text-sm text-gray-600">
                        {getScoreFeedback(currentAnswer.score)}
                      </div>
                    </div>
                    <button
                      onClick={() => setCurrentQuestionIndex(Math.min(currentQuestionIndex + 1, questions.length - 1))}
                      className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all"
                    >
                      다음 문제로 →
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitAnswer} className="space-y-4">
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-yellow-800 mb-2">
                      📝 진행 방법
                    </p>
                    <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                      <li>위의 <strong>목표 답변</strong>을 확인하세요</li>
                      <li><a href="https://www.wadiz.kr/web/wai" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">WAi 챗봇</a>에서 이 답변이 나오도록 여러 질문을 시도해보세요</li>
                      <li>가장 유사한 답변이 나왔다면, 그 질문과 WAi의 답변을 아래에 입력하세요</li>
                    </ol>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      내가 만든 질문
                    </label>
                    <input
                      type="text"
                      value={userQuestion}
                      onChange={(e) => setUserQuestion(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                      placeholder="예: 와디즈의 비전은 무엇인가요?"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      WAi의 답변 (복사해서 붙여넣기)
                    </label>
                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                      rows={4}
                      placeholder="WAi에서 받은 답변을 여기에 붙여넣으세요..."
                      disabled={submitting}
                    />
                  </div>

                  {lastScore !== null && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-1">
                        {lastScore.toFixed(1)}점
                      </div>
                      <div className="text-sm text-gray-600">
                        {getScoreFeedback(lastScore)}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || !userQuestion.trim() || !answer.trim()}
                    className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-xl hover:shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? '제출 중...' : '답변 제출'}
                  </button>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
