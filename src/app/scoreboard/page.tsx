'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Team, Question, GameStatus, ReactionType } from '@/types'

interface TeamRanking {
  rank: number
  team: Team
  progress: number
}

const REACTION_ICONS: Record<ReactionType, string> = {
  '좋아요': '👍',
  '박수': '👏',
  '불': '🔥',
  '하트': '❤️',
  '웃음': '😂',
}

export default function ScoreboardPage() {
  const [rankings, setRankings] = useState<TeamRanking[]>([])
  const [gameStatus, setGameStatus] = useState<GameStatus>('준비중')
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [questions, setQuestions] = useState<Question[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [reactionCounts, setReactionCounts] = useState<Record<string, Record<ReactionType, number>>>({})

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 2000) // 2초마다 폴링
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const [pollRes, questionsRes, teamsRes] = await Promise.all([
        fetch('/api/poll'),
        fetch('/api/questions'),
        fetch('/api/teams'),
      ])

      const pollData = await pollRes.json()
      const questionsData = await questionsRes.json()
      const teamsData = await teamsRes.json()

      setRankings(pollData.rankings)
      setGameStatus(pollData.status)
      setTotalQuestions(pollData.totalQuestions)
      setQuestions(questionsData)
      setTeams(teamsData)

      // 각 질문별 반응 수 가져오기
      const counts: Record<string, Record<ReactionType, number>> = {}
      for (const question of questionsData) {
        const reactionRes = await fetch(`/api/reactions?questionId=${question.id}`)
        const reactionData = await reactionRes.json()
        counts[question.id] = reactionData
      }
      setReactionCounts(counts)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const handleReaction = async (questionId: string, teamId: string, type: ReactionType) => {
    try {
      await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          teamId,
          type,
          userId: `viewer-${Date.now()}-${Math.random()}`,
        }),
      })
      fetchData()
    } catch (error) {
      console.error('Failed to add reaction:', error)
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-white">
            WAi Championship
          </h1>
          <div className="flex justify-center items-center gap-6">
            <span className={`px-6 py-3 rounded-full text-xl font-bold ${
              gameStatus === '진행중' ? 'bg-green-500 text-white animate-pulse' :
              gameStatus === '종료' ? 'bg-red-500 text-white' :
              'bg-gray-300 text-gray-700'
            }`}>
              {gameStatus}
            </span>
            <span className="text-white text-xl">
              총 {totalQuestions}개 문제
            </span>
          </div>
        </motion.div>

        {/* 실시간 순위 */}
        <div className="glass-effect-dark rounded-3xl p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6 text-white drop-shadow-lg">🏆 실시간 순위</h2>
          <div className="space-y-4">
            <AnimatePresence>
              {rankings.map((ranking, index) => (
                <motion.div
                  key={ranking.team.id}
                  layout
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={`relative overflow-hidden rounded-2xl p-6 ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                    index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500' :
                    index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                    'bg-gradient-to-r from-blue-400 to-indigo-500'
                  }`}
                >
                  {/* 배경 애니메이션 */}
                  <motion.div
                    className="absolute inset-0 bg-white opacity-20"
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    style={{ width: '50%' }}
                  />

                  <div className="relative flex items-center gap-6">
                    <div className="text-5xl font-bold w-20 text-center text-white">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${ranking.rank}`}
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-2xl font-bold text-white">
                          {ranking.team.name}
                        </h3>
                        <div className="text-4xl font-bold text-white">
                          {ranking.team.totalScore.toFixed(1)}점
                        </div>
                      </div>

                      {/* 진행률 바 */}
                      <div className="bg-white/30 rounded-full h-6 overflow-hidden">
                        <motion.div
                          className="h-full bg-white flex items-center justify-end px-3"
                          initial={{ width: 0 }}
                          animate={{ width: `${ranking.progress}%` }}
                          transition={{ duration: 0.5 }}
                        >
                          <span className="text-xs font-bold text-gray-700">
                            {ranking.team.answers.length}/{totalQuestions}
                          </span>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {rankings.length === 0 && (
              <div className="text-center py-12 text-white/60">
                아직 참가 팀이 없습니다
              </div>
            )}
          </div>
        </div>

        {/* 최근 답변 및 반응 */}
        {gameStatus === '진행중' && (
          <div className="glass-effect-dark rounded-3xl p-8">
            <h2 className="text-3xl font-bold mb-6 text-white drop-shadow-lg">💬 최근 답변</h2>
            <div className="space-y-6">
              {questions.slice(0, 5).map((question) => {
                // 이 질문에 답변한 팀들 찾기
                const answeredTeams = teams.filter(team =>
                  team.answers.some(a => a.questionId === question.id)
                )

                if (answeredTeams.length === 0) return null

                return (
                  <div key={question.id} className="bg-white/25 rounded-2xl p-6">
                    <div className="mb-4">
                      <div className="text-sm text-white/80 mb-1">목표 답변:</div>
                      <h3 className="text-xl font-bold text-white drop-shadow-md">
                        {question.targetAnswer}
                      </h3>
                    </div>

                    {/* 팀별 답변 */}
                    <div className="space-y-3 mb-4">
                      {answeredTeams.map(team => {
                        const answer = team.answers.find(a => a.questionId === question.id)
                        if (!answer) return null

                        return (
                          <div key={team.id} className="bg-white/35 rounded-xl p-4">
                            <div className="flex justify-between items-start mb-3">
                              <span className="font-bold text-white drop-shadow-md">{team.name}</span>
                              <span className="text-2xl font-bold text-yellow-300 drop-shadow-md">
                                {answer.score.toFixed(1)}점
                              </span>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <div className="text-xs text-white/80 mb-1">만든 질문:</div>
                                <p className="text-white font-medium text-sm">{answer.userQuestion}</p>
                              </div>
                              <div>
                                <div className="text-xs text-white/80 mb-1">WAi 답변:</div>
                                <p className="text-white text-sm line-clamp-2">{answer.answer}</p>
                              </div>
                            </div>

                            {/* 이 팀의 답변에 반응하기 */}
                            <div className="flex gap-2 mt-3">
                              {(Object.keys(REACTION_ICONS) as ReactionType[]).map(type => (
                                <button
                                  key={type}
                                  onClick={() => handleReaction(question.id, team.id, type)}
                                  className="px-3 py-2 bg-white/30 hover:bg-white/50 rounded-lg transition-all hover:scale-110 text-2xl"
                                  title={type}
                                >
                                  {REACTION_ICONS[type]}
                                </button>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* 반응 통계 */}
                    {reactionCounts[question.id] && (
                      <div className="flex gap-4 justify-center pt-4 border-t border-white/30">
                        {(Object.entries(reactionCounts[question.id]) as [ReactionType, number][]).map(([type, count]) => (
                          count > 0 && (
                            <div key={type} className="flex items-center gap-2 bg-white/35 rounded-full px-4 py-2">
                              <span className="text-2xl">{REACTION_ICONS[type]}</span>
                              <span className="text-xl font-bold text-white drop-shadow-md">{count}</span>
                            </div>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
