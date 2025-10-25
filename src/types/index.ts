export type GameStatus = '준비중' | '진행중' | '종료'

export type ReactionType = '좋아요' | '박수' | '불' | '하트' | '웃음'

export interface Question {
  id: string
  targetAnswer: string  // 참가자가 맞춰야 할 목표 답변
  order: number
}

export interface Answer {
  questionId: string
  userQuestion: string  // 팀이 만든 질문
  answer: string        // WAi에서 받은 답변
  score: number
  submittedAt: Date
}

export interface Team {
  id: string
  name: string
  members: string[]
  password: string
  answers: Answer[]
  totalScore: number
  currentQuestionIndex: number
  createdAt: Date
}

export interface Reaction {
  id: string
  questionId: string
  teamId: string
  type: ReactionType
  userId: string
  createdAt: Date
}

export interface GameState {
  status: GameStatus
  teams: Team[]
  questions: Question[]
  reactions: Reaction[]
  startedAt?: Date
  endedAt?: Date
}

export interface QuestionWithReactions extends Question {
  reactions: {
    [key in ReactionType]: number
  }
  teamAnswer?: {
    teamId: string
    teamName: string
    userQuestion: string  // 팀이 만든 질문
    answer: string        // WAi에서 받은 답변
    score: number
  }
}

export interface TeamRanking {
  rank: number
  team: Team
  progress: number
}
