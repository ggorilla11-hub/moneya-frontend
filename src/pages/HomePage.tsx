import { useState } from 'react';
import type { AdjustedBudget } from './BudgetAdjustPage';

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

interface HomePageProps {
  userName: string;
  adjustedBudget: AdjustedBudget | null;
  financialResult: FinancialResult | null;
  onMoreDetail: () => void;
  onReDiagnosis: () => void;
  onReAnalysis: () => void;
}

function HomePage({ userName, adjustedBudget, financialResult, onMoreDetail, onReDiagnosis, onReAnalysis }: HomePageProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const date = today.getDate();
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dayName = dayNames[today.getDay()];

  // 표시용 이름
  const displayName = financialResult?.name || userName.split('(')[0].trim();

  // 부자지수 계산
  const wealthIndex = financialResult?.wealthIndex || 0;
  const debtRatio = financialResult ? Math.round((financialResult.debt / financialResult.assets) * 100) : 0;
  const savingsRate = adjustedBudget ? Math.round(((adjustedBudget.savings + adjustedBudget.pension) / (adjustedBudget.livingExpense + adjustedBudget.savings + adjustedBudget.pension + adjustedBudget.insurance + adjustedBudget.loanPayment)) * 100) : 0;

  // 상태별 색상
  const getWealthColor = (value: number) => {
    if (value >= 100) return 'text-green-600';
    if (value >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  const getDebtColor = (value: number) => {
    if (value <= 20) return 'text-green-600';
    if (value <= 40) return 'text-amber-500';
    return 'text-red-500';
  };

  const getDebtLabel = (value: number) => {
    if (value <= 20) return '매우 양호';
    if (value <= 40) return '양호';
    return '주의';
  };

  const budgetCards = adjustedBudget ? [
    { id: 'living', label: '생활비', icon: '🛒', amount: adjustedBudget.livingExpense, spent: Math.round(adjustedBudget.livingExpense * 0.45), color: 'from-blue-500 to-blue-700' },
    { id: 'saving', label: '저축/투자', icon: '💰', amount: adjustedBudget.savings, spent: adjustedBudget.savings, color: 'from-green-500 to-green-700' },
    { id: 'pension', label: '노후연금', icon: '🏦', amount: adjustedBudget.pension, spent: adjustedBudget.pension, color: 'from-purple-500 to-purple-700' },
    { id: 'insurance', label: '보장성보험', icon: '🛡️', amount: adjustedBudget.insurance, spent: adjustedBudget.insurance, color: 'from-sky-500 to-sky-700' },
    { id: 'loan', label: '대출원리금', icon: '💳', amount: adjustedBudget.loanPayment, spent: adjustedBudget.loanPayment, color: 'from-red-500 to-red-700' },
  ] : [];

  const formatWon = (amount: number) => `₩${amount.toLocaleString()}`;
  const formatMan = (amount: number) => `${Math.round(amount / 10000)}만`;

  const handlePrevSlide = () => {
    setCurrentSlide(prev => (prev === 0 ? budgetCards.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide(prev => (prev === budgetCards.length - 1 ? 0 : prev + 1));
  };

  // 임시 지출 데이터 (나중에 SpendContext 연동)
  const todaySpending = {
    impulse: 0,
    choice: 0,
    necessary: 8000,
    emotionSaved: 0
  };

  const categorySpending = [
    { label: '식비', icon: '🍽️', percent: 60, color: 'bg-orange-500' },
    { label: '카페', icon: '☕', percent: 0, color: 'bg-purple-500' },
    { label: '교통', icon: '🚌', percent: 20, color: 'bg-blue-500' },
    { label: '쇼핑', icon: '🛒', percent: 15, color: 'bg-pink-500' },
    { label: '기타', icon: '📦', percent: 5, color: 'bg-gray-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      
      {/* 헤더 */}
      <div className="bg-white px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-800">안녕하세요, {displayName}님 👋</h1>
            <p className="text-sm text-gray-500">오늘도 현명한 지출 함께해요</p>
          </div>
        </div>
      </div>

      {/* 스크롤 영역 */}
      <div className="px-4 py-4 space-y-4">

        {/* 예산 기준일 카드 */}
        <div className="bg-gradient-to-r from-amber-100 to-amber-200 rounded-xl p-4 flex items-center justify-between border border-amber-300">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💰</span>
            <div>
              <p className="text-xs text-amber-700">예산 기준일 (월급날)</p>
              <p className="font-bold text-amber-900">매월 <span className="text-amber-600 text-lg">25</span>일</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">D-17</span>
            <span className="text-amber-600">›</span>
          </div>
        </div>

        {/* 오늘 날짜 카드 */}
        <div className="bg-white rounded-xl p-4 flex items-center justify-between border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">📅</span>
            </div>
            <div>
              <p className="font-bold text-gray-800">{year}년 {month}월 {date}일 {dayName}요일</p>
              <p className="text-xs text-blue-600">예산 주기 <span className="font-bold text-blue-700">D+0</span> (1/14~1/31)</p>
            </div>
          </div>
          <button className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold">
            더보기
          </button>
        </div>

        {/* 예산 캐러셀 */}
        {budgetCards.length > 0 && (
          <div className="relative">
            <div className="overflow-hidden rounded-2xl">
              <div 
                className="flex transition-transform duration-300"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {budgetCards.map((card) => {
                  const isLiving = card.id === 'living';
                  const cardSpent = card.spent;
                  const cardTotal = card.amount;
                  const percent = cardTotal > 0 ? Math.round((cardSpent / cardTotal) * 100) : 0;
                  const remaining = cardTotal - cardSpent;
                  
                  return (
                    <div 
                      key={card.id}
                      className={`min-w-full p-5 bg-gradient-to-br ${card.color} text-white rounded-2xl`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm opacity-90">{card.icon} {card.label}</span>
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-lg">{month}월</span>
                      </div>
                      <div className="text-3xl font-extrabold mb-1">
                        {formatWon(cardSpent)}
                        <span className="text-base font-normal opacity-80"> / {formatWon(cardTotal)}</span>
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                        <button onClick={handlePrevSlide} className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-sm">‹</button>
                        <div className="flex-1 bg-white/20 rounded-full h-2">
                          <div 
                            className="bg-white rounded-full h-2 transition-all"
                            style={{ width: `${Math.min(percent, 100)}%` }}
                          />
                        </div>
                        <button onClick={handleNextSlide} className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-sm">›</button>
                      </div>
                      <div className="flex justify-between text-sm opacity-90">
                        <span>{percent}% 사용</span>
                        <span>{remaining >= 0 ? `${formatWon(remaining)} 남음` : `${formatWon(Math.abs(remaining))} 초과`}</span>
                      </div>
                      {!isLiving && (
                        <p className="text-xs opacity-70 mt-1">납입일: 25일</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 도트 인디케이터 */}
            <div className="flex justify-center gap-1.5 mt-3">
              {budgetCards.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    currentSlide === index ? 'w-4 bg-blue-600' : 'w-1.5 bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* 출석체크 카드 */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3">🔥 출석 현황</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl p-4 text-center border border-amber-200">
              <span className="text-3xl">🔥</span>
              <p className="text-2xl font-extrabold text-gray-800 mt-1">7일</p>
              <p className="text-xs text-gray-500">연속 출석</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-4 text-center border border-blue-200">
              <span className="text-3xl">📅</span>
              <p className="text-2xl font-extrabold text-gray-800 mt-1">15일</p>
              <p className="text-xs text-gray-500">이번 달 출석</p>
            </div>
          </div>
        </div>

        {/* ⭐ 1차 재무진단 결과 */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800">📊 1차 재무진단 결과</h3>
            <button 
              onClick={onReDiagnosis}
              className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100"
            >
              다시하기
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">부자지수</p>
              <p className={`text-xl font-black ${getWealthColor(wealthIndex)}`}>{wealthIndex}점</p>
              <p className="text-[10px] text-gray-400">상위 15%</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">부채비율</p>
              <p className={`text-xl font-black ${getDebtColor(debtRatio)}`}>{debtRatio}%</p>
              <p className="text-[10px] text-gray-400">{getDebtLabel(debtRatio)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">총자산</p>
              <p className="text-xl font-black text-gray-800">{financialResult ? formatMan(financialResult.assets) : '0만'}</p>
              <p className="text-[10px] text-gray-400">부동산 포함</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">총부채</p>
              <p className="text-xl font-black text-gray-800">{financialResult ? formatMan(financialResult.debt) : '0만'}</p>
              <p className="text-[10px] text-gray-400">대출 잔액</p>
            </div>
          </div>
        </div>

        {/* ⭐ 2차 재무분석 결과 */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800">📈 2차 재무분석 결과</h3>
            <button 
              onClick={onReAnalysis}
              className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100"
            >
              다시하기
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">월수입</p>
              <p className="text-xl font-black text-gray-800">{financialResult ? formatMan(financialResult.income) : '0만'}</p>
              <p className="text-[10px] text-gray-400">세후 기준</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">생활비 예산</p>
              <p className="text-xl font-black text-gray-800">{adjustedBudget ? formatMan(adjustedBudget.livingExpense) : '0만'}</p>
              <p className="text-[10px] text-gray-400">확정</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">저축투자</p>
              <p className="text-xl font-black text-gray-800">{adjustedBudget ? formatMan(adjustedBudget.savings) : '0만'}</p>
              <p className="text-[10px] text-gray-400">목표</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">저축률</p>
              <p className={`text-xl font-black ${savingsRate >= 30 ? 'text-green-600' : savingsRate >= 20 ? 'text-amber-500' : 'text-red-500'}`}>{savingsRate}%</p>
              <p className="text-[10px] text-gray-400">{savingsRate >= 30 ? '우수' : savingsRate >= 20 ? '양호' : '노력필요'}</p>
            </div>
          </div>
        </div>

        {/* 👥 동년배 비교 */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800">👥 동년배 비교</h3>
            <span className="text-xs bg-blue-100 text-blue-600 px-2.5 py-1 rounded-full font-bold">
              만 {financialResult?.age || 44}세
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-[10px] text-gray-500 mb-1">부자지수</p>
              <p className="text-sm font-bold text-green-600">상위15%</p>
              <p className="text-[10px] text-gray-400">평균 142점</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-[10px] text-gray-500 mb-1">부채비율</p>
              <p className="text-sm font-bold text-green-600">상위10%</p>
              <p className="text-[10px] text-gray-400">평균 32%</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-[10px] text-gray-500 mb-1">저축투자율</p>
              <p className="text-sm font-bold text-green-600">상위5%</p>
              <p className="text-[10px] text-gray-400">평균 18%</p>
            </div>
          </div>
        </div>

        {/* D+0 준비기간 분석 */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-lg">D+0</span>
            <span className="font-bold text-green-800">준비기간 분석</span>
            <span className="text-xs text-green-600 ml-auto">1/14 ~ 1/31</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-white rounded-xl p-3 text-center">
              <span className="text-2xl">🔥</span>
              <p className={`text-xl font-black ${todaySpending.impulse > 0 ? 'text-red-500' : 'text-gray-800'}`}>
                ₩{todaySpending.impulse.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">충동지출</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center">
              <span className="text-2xl">🤔</span>
              <p className={`text-xl font-black ${todaySpending.choice > 0 ? 'text-amber-500' : 'text-gray-800'}`}>
                ₩{todaySpending.choice.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">선택지출</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center">
              <span className="text-2xl">✅</span>
              <p className="text-xl font-black text-green-600">
                ₩{todaySpending.necessary.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">필수지출</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center">
              <span className="text-2xl">🎯</span>
              <p className={`text-xl font-black ${todaySpending.emotionSaved > 0 ? 'text-purple-600' : 'text-gray-800'}`}>
                ₩{todaySpending.emotionSaved.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">감정저축</p>
            </div>
          </div>

          {/* 생활비 카테고리별 소비 */}
          <div className="bg-white rounded-xl p-3">
            <p className="text-sm font-bold text-gray-700 mb-2">📊 생활비 카테고리별 소비</p>
            <div className="space-y-2">
              {categorySpending.map((cat) => (
                <div key={cat.label} className="flex items-center gap-2">
                  <span className="text-sm w-16">{cat.icon} {cat.label}</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${cat.percent}%` }} />
                  </div>
                  <span className="text-xs font-bold text-gray-600 w-10 text-right">{cat.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 상세리포트 배너 */}
        <div 
          onClick={onMoreDetail}
          className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex items-center justify-between cursor-pointer hover:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-xl">📑</span>
            </div>
            <div>
              <p className="font-bold text-gray-800">상세리포트</p>
              <p className="text-xs text-gray-500">2개월 이상 데이터 필요</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
            <span className="text-sm">🔒</span>
            <span className="text-xs font-bold text-gray-500">D+2 이후</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default HomePage;
