import { useState, useEffect, useRef } from 'react';

// 5개 집 이미지 URL (Vercel assets)
const HOUSE_IMAGES = [
  {
    level: 1,
    name: '텐트',
    image: 'https://moneya-frontend.vercel.app/assets/house1-Cg76rqP7.jpg',
    range: '0% 이하',
    message: '지금부터 시작입니다! 함께 금융 집을 지어봐요!'
  },
  {
    level: 2,
    name: '초가집',
    image: 'https://moneya-frontend.vercel.app/assets/house2-B1GiF-3L.jpg',
    range: '1-50%',
    message: '좋은 시작이에요! 조금씩 성장하고 있어요!'
  },
  {
    level: 3,
    name: '한옥',
    image: 'https://moneya-frontend.vercel.app/assets/house3-CiiNxUBf.jpg',
    range: '51-100%',
    message: '잘하고 계세요! 안정적인 재무 상태입니다!'
  },
  {
    level: 4,
    name: '고급양옥',
    image: 'https://moneya-frontend.vercel.app/assets/house4-ywz7gWNQ.jpg',
    range: '101-200%',
    message: '훌륭해요! 재무적으로 여유가 있으시네요!'
  },
  {
    level: 5,
    name: '궁전',
    image: 'https://moneya-frontend.vercel.app/assets/house5-CLgrT-Xl.jpg',
    range: '200% 초과',
    message: '축하합니다! 금융 부자예요!'
  }
];

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
  // 현재 보여줄 집 레벨 (1-5)
  const [displayLevel, setDisplayLevel] = useState(result.level);
  
  // 자동 복귀 타이머 ref 사용 (타입 에러 방지)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 현재 표시할 집 정보
  const currentHouse = HOUSE_IMAGES[displayLevel - 1];

  // 점 클릭 시 해당 집으로 전환
  const handleDotClick = (level: number) => {
    // 기존 타이머 제거
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // 해당 레벨로 전환
    setDisplayLevel(level);

    // 본인 집이 아닌 경우에만 1초 후 자동 복귀
    if (level !== result.level) {
      timerRef.current = setTimeout(() => {
        setDisplayLevel(result.level);
      }, 1000);
    }
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // result.level이 변경되면 displayLevel도 업데이트
  useEffect(() => {
    setDisplayLevel(result.level);
  }, [result.level]);

  // 금액을 만원 단위로 표시하는 함수
  const formatManwon = (value: number): string => {
    return `${value.toLocaleString()}만원`;
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
            src={currentHouse.image}
            alt={currentHouse.name}
            className="w-full h-64 object-cover transition-opacity duration-300"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <p className="text-white text-lg font-bold text-center">
              부자지수 {currentHouse.range}
            </p>
          </div>
        </div>

        {/* 결과 정보 */}
        <div className="text-center">
          <p className="text-gray-500 mb-1">{result.name}님의 부자지수는</p>
          <p className="text-5xl font-bold text-purple-600 mb-2">{result.wealthIndex}%</p>
          <p className="text-gray-500 text-sm mb-4">현재 재무 상태</p>
          
          <div className="inline-block bg-purple-100 rounded-full px-6 py-2 mb-3">
            <p className="text-xl font-bold text-purple-700">{displayLevel}단계: {currentHouse.name}</p>
          </div>
          
          <p className="text-gray-600">
            {displayLevel === result.level ? (
              <>🎉 {result.message}</>
            ) : (
              <>👀 {currentHouse.message}</>
            )}
          </p>
        </div>

        {/* 단계 인디케이터 (클릭 가능) */}
        <div className="flex justify-center gap-2 mt-6">
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              onClick={() => handleDotClick(level)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                level === displayLevel 
                  ? 'bg-purple-600 scale-125' 
                  : level === result.level
                    ? 'bg-purple-300 hover:bg-purple-400'
                    : 'bg-gray-300 hover:bg-gray-400'
              }`}
              title={`${level}단계: ${HOUSE_IMAGES[level - 1].name}`}
            />
          ))}
        </div>
        
        {/* 안내 텍스트 */}
        <p className="text-center text-xs text-gray-400 mt-2">
          점을 클릭하면 다른 단계의 집을 볼 수 있어요
        </p>
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
