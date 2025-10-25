import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="glass-effect rounded-3xl p-12 max-w-4xl w-full text-center">
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          WAi Championship
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          WAi 챗봇 활성화 전사 이벤트
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          <Link
            href="/admin"
            className="glass-effect p-8 rounded-xl card-hover group"
          >
            <div className="text-4xl mb-4">⚙️</div>
            <h2 className="text-2xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
              관리자
            </h2>
            <p className="text-gray-600">게임 설정 및 관리</p>
          </Link>

          <Link
            href="/team/login"
            className="glass-effect p-8 rounded-xl card-hover group"
          >
            <div className="text-4xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
              참가하기
            </h2>
            <p className="text-gray-600">팀으로 참가</p>
          </Link>

          <Link
            href="/scoreboard"
            className="glass-effect p-8 rounded-xl card-hover group"
          >
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-2xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
              스코어보드
            </h2>
            <p className="text-gray-600">실시간 순위 확인</p>
          </Link>
        </div>
      </div>
    </main>
  )
}
