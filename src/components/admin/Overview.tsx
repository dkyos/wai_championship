'use client'

import { Team, Question, GameStatus } from '@/types'

interface OverviewProps {
  teams: Team[]
  questions: Question[]
  gameStatus: GameStatus
}

export default function Overview({ teams, questions, gameStatus }: OverviewProps) {
  const sortedTeams = [...teams].sort((a, b) => b.totalScore - a.totalScore)
  const totalAnswers = teams.reduce((sum, t) => sum + t.answers.length, 0)
  const averageScore = teams.length > 0
    ? teams.reduce((sum, t) => sum + t.totalScore, 0) / teams.length
    : 0

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">현황 대시보드</h2>

      {/* 주요 통계 */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="text-4xl font-bold mb-2">{teams.length}</div>
          <div className="text-blue-100">참가 팀</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="text-4xl font-bold mb-2">{questions.length}</div>
          <div className="text-green-100">전체 질문</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="text-4xl font-bold mb-2">{totalAnswers}</div>
          <div className="text-purple-100">전체 답변</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <div className="text-4xl font-bold mb-2">{averageScore.toFixed(1)}</div>
          <div className="text-orange-100">평균 점수</div>
        </div>
      </div>

      {/* 팀 순위 */}
      <div className="bg-white rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4">팀 순위</h3>
        {sortedTeams.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            아직 참가 팀이 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {sortedTeams.map((team, index) => {
              const progress = questions.length > 0
                ? (team.answers.length / questions.length) * 100
                : 0

              return (
                <div
                  key={team.id}
                  className={`flex items-center gap-4 p-4 rounded-xl ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400' :
                    index === 1 ? 'bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-gray-400' :
                    index === 2 ? 'bg-gradient-to-r from-orange-100 to-orange-200 border-2 border-orange-400' :
                    'bg-gray-50'
                  }`}
                >
                  <div className="text-2xl font-bold w-12 text-center">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </div>

                  <div className="flex-1">
                    <div className="font-bold text-lg mb-1">{team.name}</div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {team.totalScore.toFixed(1)}점
                    </div>
                    <div className="text-sm text-gray-600">
                      {team.answers.length}/{questions.length} 답변
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 게임 상태 정보 */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4">게임 정보</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">게임 상태</div>
            <div className={`inline-block px-4 py-2 rounded-full font-bold ${
              gameStatus === '진행중' ? 'bg-green-500 text-white' :
              gameStatus === '종료' ? 'bg-red-500 text-white' :
              'bg-gray-300 text-gray-700'
            }`}>
              {gameStatus}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-1">전체 진행률</div>
            <div className="text-2xl font-bold text-indigo-600">
              {questions.length > 0
                ? ((totalAnswers / (teams.length * questions.length)) * 100).toFixed(0)
                : 0}%
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
