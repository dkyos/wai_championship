import { GameState, Team, Question, Answer, Reaction, ReactionType } from '@/types'
import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'game-state.json')

class GameStore {
  private state: GameState = {
    status: '준비중',
    teams: [],
    questions: [],
    reactions: [],
  }

  constructor() {
    this.loadFromFile()
  }

  // 파일에서 데이터 로드
  private loadFromFile() {
    try {
      // data 디렉토리가 없으면 생성
      const dataDir = path.dirname(DATA_FILE)
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
      }

      // 파일이 존재하면 로드
      if (fs.existsSync(DATA_FILE)) {
        const data = fs.readFileSync(DATA_FILE, 'utf-8')
        const parsed = JSON.parse(data)

        // Date 객체 복원
        this.state = {
          ...parsed,
          startedAt: parsed.startedAt ? new Date(parsed.startedAt) : undefined,
          endedAt: parsed.endedAt ? new Date(parsed.endedAt) : undefined,
          teams: parsed.teams.map((team: any) => ({
            ...team,
            createdAt: new Date(team.createdAt),
            answers: team.answers.map((answer: any) => ({
              ...answer,
              submittedAt: new Date(answer.submittedAt),
            })),
          })),
          reactions: parsed.reactions.map((reaction: any) => ({
            ...reaction,
            createdAt: new Date(reaction.createdAt),
          })),
        }

        console.log('✅ 저장된 데이터를 불러왔습니다.')
      } else {
        console.log('📝 새로운 게임 데이터 파일을 생성합니다.')
        this.saveToFile()
      }
    } catch (error) {
      console.error('❌ 데이터 로드 실패:', error)
      console.log('🔄 기본 상태로 시작합니다.')
    }
  }

  // 파일에 데이터 저장
  private saveToFile() {
    try {
      const dataDir = path.dirname(DATA_FILE)
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
      }

      fs.writeFileSync(DATA_FILE, JSON.stringify(this.state, null, 2), 'utf-8')
    } catch (error) {
      console.error('❌ 데이터 저장 실패:', error)
    }
  }

  // Game Status
  getGameState(): GameState {
    return { ...this.state }
  }

  setGameStatus(status: GameState['status']) {
    this.state.status = status
    if (status === '진행중') {
      this.state.startedAt = new Date()
    } else if (status === '종료') {
      this.state.endedAt = new Date()
    }
    this.saveToFile()
  }

  resetGame() {
    this.state = {
      status: '준비중',
      teams: this.state.teams.map(team => ({
        ...team,
        answers: [],
        totalScore: 0,
        currentQuestionIndex: 0,
      })),
      questions: this.state.questions,
      reactions: [],
    }
    this.saveToFile()
  }

  // Teams
  getTeams(): Team[] {
    return [...this.state.teams]
  }

  getTeam(teamId: string): Team | undefined {
    return this.state.teams.find(t => t.id === teamId)
  }

  addTeam(team: Omit<Team, 'id' | 'answers' | 'totalScore' | 'currentQuestionIndex' | 'createdAt'>): Team {
    const newTeam: Team = {
      ...team,
      id: `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      answers: [],
      totalScore: 0,
      currentQuestionIndex: 0,
      createdAt: new Date(),
    }
    this.state.teams.push(newTeam)
    this.saveToFile()
    return newTeam
  }

  updateTeam(teamId: string, updates: Partial<Team>) {
    const index = this.state.teams.findIndex(t => t.id === teamId)
    if (index !== -1) {
      this.state.teams[index] = { ...this.state.teams[index], ...updates }
      this.saveToFile()
    }
  }

  deleteTeam(teamId: string) {
    this.state.teams = this.state.teams.filter(t => t.id !== teamId)
    this.state.reactions = this.state.reactions.filter(r => r.teamId !== teamId)
    this.saveToFile()
  }

  authenticateTeam(teamId: string, password: string): boolean {
    const team = this.getTeam(teamId)
    return team?.password === password
  }

  // Questions
  getQuestions(): Question[] {
    return [...this.state.questions].sort((a, b) => a.order - b.order)
  }

  getQuestion(questionId: string): Question | undefined {
    return this.state.questions.find(q => q.id === questionId)
  }

  addQuestion(question: Omit<Question, 'id'>): Question {
    const newQuestion: Question = {
      ...question,
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }
    this.state.questions.push(newQuestion)
    this.saveToFile()
    return newQuestion
  }

  updateQuestion(questionId: string, updates: Partial<Question>) {
    const index = this.state.questions.findIndex(q => q.id === questionId)
    if (index !== -1) {
      this.state.questions[index] = { ...this.state.questions[index], ...updates }
      this.saveToFile()
    }
  }

  deleteQuestion(questionId: string) {
    this.state.questions = this.state.questions.filter(q => q.id !== questionId)
    this.state.reactions = this.state.reactions.filter(r => r.questionId !== questionId)
    this.saveToFile()
  }

  setQuestions(questions: Omit<Question, 'id'>[]) {
    this.state.questions = questions.map((q, index) => ({
      ...q,
      id: `q-${Date.now()}-${index}`,
      order: q.order ?? index,
    }))
    this.saveToFile()
  }

  // Answers
  submitAnswer(teamId: string, questionId: string, userQuestion: string, answer: string, score: number) {
    const team = this.getTeam(teamId)
    if (!team) return

    const newAnswer: Answer = {
      questionId,
      userQuestion,  // 팀이 만든 질문
      answer,         // WAi에서 받은 답변
      score,
      submittedAt: new Date(),
    }

    const existingAnswerIndex = team.answers.findIndex(a => a.questionId === questionId)
    if (existingAnswerIndex !== -1) {
      team.answers[existingAnswerIndex] = newAnswer
    } else {
      team.answers.push(newAnswer)
    }

    team.totalScore = team.answers.reduce((sum, a) => sum + a.score, 0)
    team.currentQuestionIndex = Math.min(team.answers.length, this.state.questions.length - 1)

    this.updateTeam(teamId, team)
  }

  getTeamAnswer(teamId: string, questionId: string): Answer | undefined {
    const team = this.getTeam(teamId)
    return team?.answers.find(a => a.questionId === questionId)
  }

  // Reactions
  addReaction(questionId: string, teamId: string, type: ReactionType, userId: string): Reaction {
    const newReaction: Reaction = {
      id: `r-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      questionId,
      teamId,
      type,
      userId,
      createdAt: new Date(),
    }
    this.state.reactions.push(newReaction)
    this.saveToFile()
    return newReaction
  }

  getReactions(questionId?: string): Reaction[] {
    if (questionId) {
      return this.state.reactions.filter(r => r.questionId === questionId)
    }
    return [...this.state.reactions]
  }

  getReactionCounts(questionId: string): Record<ReactionType, number> {
    const reactions = this.getReactions(questionId)
    const counts: Record<ReactionType, number> = {
      '좋아요': 0,
      '박수': 0,
      '불': 0,
      '하트': 0,
      '웃음': 0,
    }
    reactions.forEach(r => {
      counts[r.type]++
    })
    return counts
  }

  // Rankings
  getTeamRankings() {
    const teams = [...this.state.teams].sort((a, b) => {
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore
      }
      return a.createdAt.getTime() - b.createdAt.getTime()
    })

    return teams.map((team, index) => ({
      rank: index + 1,
      team,
      progress: (team.answers.length / this.state.questions.length) * 100,
    }))
  }
}

export const gameStore = new GameStore()
