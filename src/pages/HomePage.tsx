import { useState } from 'react';
import type { AdjustedBudget } from './BudgetAdjustPage';

interface HomePageProps {
  userName: string;
  adjustedBudget: AdjustedBudget | null;
  onMoreDetail: () => void;
}

function HomePage({ userName, adjustedBudget, onMoreDetail }: HomePageProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const today = new Date();
  const month = today.getMonth() + 1;
  const date = today.getDate();
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dayName = dayNames[today.getDay()];

  const budgetCards = adjustedBudget ? [
    { id: 'living', label: '생활비', icon: '🛒', amount: adjustedBudget.livingExpense, spent: Math.round(adjustedBudget.livingExpense * 0.45), color: 'from-blue-500 to-blue-700' },
    { id: 'saving', label: '저축/투자', icon: '📈', amount: adjustedBudget.savings, spent: adjustedBudget.savings, color: 'from-green-500 to-green-700' },
    { id: 'pension', label: '노후연금', icon: '🏦', amount: adjustedBudget.pension, spent: adjustedBudget.pension, color: 'from-purple-500 to-purple-700' },
    { id: 'insurance', label: '보장성보험', icon: '🛡️', amount: adjustedBudget.insurance, spent: adjustedBudget.insurance, color: 'from-sky-500 to-sky-700' },
    { id: 'loan', label: '대출원리금', icon: '💳', amount: adjustedBudget.loanPayment, spent: adjustedBudget.loanPayment, color: 'from-gray-500 to-gray-700' },
  ] : [];

  const formatWon = (amount: number) => `₩${amount.toLocaleString()}`;

  const handlePrevSlide = () => {
    setCurrentSlide(prev => (prev === 0 ? budgetCards.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide(prev => (prev === budgetCards.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      
      {/* 헤더 */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-800">{userName}님, 안녕하세요!</h1>
            <p className="text-xs text-gray-500">오늘도 현명한 소비 하세요 💪</p>
          </div>
        </div>
        <button className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
          </svg>
        </button>
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
            <span className="bg-white/60 px-3 py-1 rounded-lg text-sm font-bold text-amber-700">D-17</span>
            <span className="text-amber-600">›</span>
          </div>
        </div>

        {/* 오늘 날짜 카드 */}
        <div className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl p-4 flex items-center justify-between border border-blue-300">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📅</span>
            <div>
              <p className="font-bold text-blue-900">{month}월 {date}일 ({dayName}요일)</p>
              <p className="text-xs text-blue-600">이번 주기 <span className="font-bold">8</span>일차</p>
            </div>
          </div>
          <span className="text-blue-600">›</span>
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
                  const percent = Math.round((card.spent / card.amount) * 100);
                  const remaining = card.amount - card.spent;
                  return (
                    <div 
                      key={card.id}
                      className={`min-w-full p-5 bg-gradient-to-br ${card.color} text-white rounded-2xl`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm opacity-90">{card.icon} {card.label}</span>
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-lg">이번 달</span>
                      </div>
                      <div className="text-3xl font-extrabold mb-2">
                        {formatWon(card.spent)}
                        <span className="text-lg font-normal opacity-80"> / {formatWon(card.amount)}</span>
                      </div>
                      <div className="bg-white/20 rounded-full h-2.5 mb-3">
                        <div 
                          className="bg-white rounded-full h-2.5 transition-all"
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm opacity-90">
                        <span>{percent}% 사용</span>
                        <span className={remaining >= 0 ? 'text-green-200' : 'text-red-200'}>
                          {remaining >= 0 ? `${formatWon(remaining)} 남음` : `${formatWon(Math.abs(remaining))} 초과`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* 슬라이드 컨트롤 */}
            <button 
              onClick={handlePrevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow-md"
            >
              <span className="text-gray-600">‹</span>
            </button>
            <button 
              onClick={handleNextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow-md"
            >
              <span className="text-gray-600">›</span>
            </button>

            {/* 도트 인디케이터 */}
            <div className="flex justify-center gap-1.5 mt-3">
              {budgetCards.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    currentSlide === index ? 'w-5 bg-blue-600' : 'w-2 bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* 출석체크 카드 */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800">🔥 출석 현황</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 text-center">
              <span className="text-2xl">🔥</span>
              <p className="text-2xl font-extrabold text-gray-800 mt-1">7일</p>
              <p className="text-xs text-gray-500">연속 출석</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
              <span className="text-2xl">📅</span>
              <p className="text-2xl font-extrabold text-gray-800 mt-1">15일</p>
              <p className="text-xs text-gray-500">이번 달 출석</p>
            </div>
          </div>
        </div>

        {/* 동년배 비교 카드 */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800">📊 동년배 비교</h3>
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-semibold">30대 기준</span>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">저축률</p>
              <p className="font-bold text-gray-800">상위 <span className="text-green-600">12%</span></p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">지출률</p>
              <p className="font-bold text-gray-800">상위 <span className="text-green-600">8%</span></p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">순자산</p>
              <p className="font-bold text-gray-800">상위 <span className="text-green-600">15%</span></p>
            </div>
          </div>
          <button className="w-full py-2.5 bg-gray-100 rounded-xl text-sm font-semibold text-gray-600">
            자세히 보기 →
          </button>
        </div>

        {/* 재무설계 달성 현황 */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800">🎯 재무설계 달성 현황</h3>
            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full font-semibold">금융집짓기</span>
          </div>
          <div className="space-y-3">
            {[
              { label: '비상예비자금', percent: 100, color: 'bg-green-500' },
              { label: '목돈마련', percent: 45, color: 'bg-blue-500' },
              { label: '내집마련', percent: 20, color: 'bg-blue-500' },
              { label: '노후자금', percent: 30, color: 'bg-blue-500' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-20">{item.label}</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percent}%` }} />
                </div>
                <span className={`text-sm font-bold ${item.percent >= 100 ? 'text-green-600' : 'text-gray-700'}`}>
                  {item.percent}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 더보기 버튼 */}
        <button 
          onClick={onMoreDetail}
          className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"
        >
          📋 상세 리포트 보기
          <span>→</span>
        </button>

      </div>
    </div>
  );
}

export default HomePage;