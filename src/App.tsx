function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-green-50 flex flex-col items-center justify-center p-4">
      {/* 로고 */}
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 bg-purple-500 rounded-full animate-pulse opacity-30"></div>
        <div className="absolute inset-2 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white text-4xl font-bold">M</span>
        </div>
      </div>

      {/* 타이틀 */}
      <h1 className="text-3xl font-bold text-gray-800 mb-2">AI머니야</h1>
      <p className="text-gray-600 text-center mb-8">
        <span className="text-purple-600 font-semibold">AI 금융코치</span>와 함께<br />
        똑똑한 소비습관을 만들어요
      </p>

      {/* 상태 표시 */}
      <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-sm">
        <p className="text-center text-green-600 font-semibold">
          ✅ 프로젝트 셋업 완료!
        </p>
        <p className="text-center text-gray-500 text-sm mt-2">
          Phase 1 MVP 개발 준비 완료
        </p>
      </div>
    </div>
  )
}

export default App