interface FinancialResult {
  name: string;
  age: number;
  income: number;
  assets: number;
  debt: number;
  wealthIndex: number;
  level: number;
  houseName: string;
  houseImage: string;
  message: string;
}

interface FinancialResultPageProps {
  result: FinancialResult;
  onRetry: () => void;
  onNext: () => void;
  isFromHome?: boolean;
}

function FinancialResultPage({ result, onRetry, onNext, isFromHome = false }: FinancialResultPageProps) {
  // 금액을 만원 단위로 표시하는 함수
  const formatManwon = (value: number): string => {
    // 이미 만원 단위인 경우 (10000 미만)
    if (value < 10000) {
      return `${value.toLocaleString()}만원`;
    }
    // 원 단위인 경우 (10000 이상) -> 만원으로 변환
    return `${Math.round(value / 10000).toLocaleString()}만원`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-green-50 to-amber-50 p-5">
      {/* 헤더 */}
      <div className="flex items-center mb-6">
        {isFromHome && (
          <button 
            onClick={onNext}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mr-3"
          >
            <span className="text-gray-600 text-lg">‹</span>
          </button>
        )}
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2 flex-1 justify-center">
          🏠 나의 금융집
        </h1>
        {isFromHome && <div className="w-10"></div>}
      </div>

      {/* 금융집 이미지 */}
      <div className="bg-white rounded-3xl p-4 mb-6 shadow-lg">
        <div className="relative rounded-2xl overflow-hidden mb-4">
          <img
            src={result.houseImage}
            alt={result.houseName}
            className="w-full h-64 object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <p className="text-white text-lg font-bold text-center">
              부자지수 {result.wealthIndex <= 0 ? '0%' : result.wealthIndex <= 50 ? '1-50%' : result.wealthIndex <= 100 ? '51-100%' : result.wealthIndex <= 200 ? '101-200%' : '200% 초과'}
            </p>
          </div>
        </div>

        {/* 결과 정보 */}
        <div className="text-center">
          <p className="text-gray-500 mb-1">{result.name}님의 부자지수는</p>
          <p className="text-5xl font-bold text-purple-600 mb-2">{result.wealthIndex}%</p>
          <p className="text-gray-500 text-sm mb-4">현재 재무 상태</p>
          
          <div className="inline-block bg-purple-100 rounded-full px-6 py-2 mb-3">
            <p className="text-xl font-bold text-purple-700">{result.level}단계: {result.houseName}</p>
          </div>
          
          <p className="text-gray-600">🎉 {result.message}</p>
        </div>

        {/* 단계 인디케이터 */}
        <div className="flex justify-center gap-2 mt-6">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={`w-3 h-3 rounded-full ${
                level === result.level ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 상세 정보 카드 */}
      <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4">📊 입력하신 정보</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-500">이름</span>
            <span className="font-medium text-gray-800">{result.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">나이</span>
            <span className="font-medium text-gray-800">{result.age}세</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">월수입</span>
            <span className="font-medium text-gray-800">{formatManwon(result.income)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">총자산</span>
            <span className="font-medium text-gray-800">{formatManwon(result.assets)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">총부채</span>
            <span className="font-medium text-gray-800">{formatManwon(result.debt)}</span>
          </div>
          <div className="border-t pt-3 flex justify-between">
            <span className="text-gray-500">순자산</span>
            <span className="font-bold text-purple-600">{formatManwon(result.assets - result.debt)}</span>
          </div>
        </div>
      </div>

      {/* 버튼들 */}
      <div className="space-y-3">
        {isFromHome ? (
          <>
            <button
              onClick={onNext}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-500/30 flex items-center justify-center gap-2"
            >
              ✓ 홈으로 돌아가기
            </button>
            <button
              onClick={onRetry}
              className="w-full py-4 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl flex items-center justify-center gap-2"
            >
              🔄 다시 진단하기
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onNext}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2"
            >
              💰 예산 수립하러 가기
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={onRetry}
              className="w-full py-4 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl flex items-center justify-center gap-2"
            >
              🔄 다시 진단하기
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default FinancialResultPage;
