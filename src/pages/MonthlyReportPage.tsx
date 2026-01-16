// MonthlyReportPage.tsx
// 월간 리포트 페이지 - 타입 에러 + 미사용 변수 에러 모두 수정 완료
// AdjustedBudget 타입: livingExpense, savings, pension, insurance, loanPayment, surplus, totalIncome

import { useState } from 'react';
import type { AdjustedBudget } from './BudgetAdjustPage';

interface MonthlyReportPageProps {
  onBack: () => void;
  adjustedBudget?: AdjustedBudget | null;
}

export default function MonthlyReportPage({ onBack, adjustedBudget }: MonthlyReportPageProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // 월 이동
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    const now = new Date();
    if (currentMonth.getMonth() < now.getMonth() || currentMonth.getFullYear() < now.getFullYear()) {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    }
  };

  // 월 표시
  const formatMonth = (date: Date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
  };

  // AdjustedBudget에서 데이터 가져오기 (올바른 속성명 사용)
  const totalIncome = adjustedBudget?.totalIncome || 500; // 만원 단위
  const livingExpense = adjustedBudget?.livingExpense || 250;
  const savings = adjustedBudget?.savings || 100;
  const pension = adjustedBudget?.pension || 50;
  const insurance = adjustedBudget?.insurance || 35;
  const loanPayment = adjustedBudget?.loanPayment || 50;
  // surplus는 잉여자금 표시에 사용
  const surplus = adjustedBudget?.surplus || 15;

  // 총 지출 계산 (생활비 + 보험 + 대출)
  const totalExpense = livingExpense + insurance + loanPayment;
  
  // 예산 대비 (생활비 기준)
  const budgetAmount = livingExpense;
  const budgetDiff = 0; // 예산과 동일하면 0
  const lastMonthDiff = -20; // 지난달 대비 (샘플)
  const budgetRate = 100; // 예산 달성률

  // 카테고리별 데이터 (생활비 세부 내역 - 샘플)
  const categories = [
    { id: 'food', name: '식비', icon: '🍽️', color: '#EF4444', bgColor: '#FEE2E2', amount: Math.round(livingExpense * 0.35), percent: 35 },
    { id: 'transport', name: '교통', icon: '🚗', color: '#F59E0B', bgColor: '#FEF3C7', amount: Math.round(livingExpense * 0.15), percent: 15 },
    { id: 'shopping', name: '쇼핑', icon: '🛍️', color: '#3B82F6', bgColor: '#DBEAFE', amount: Math.round(livingExpense * 0.20), percent: 20 },
    { id: 'culture', name: '문화/여가', icon: '🎮', color: '#10B981', bgColor: '#D1FAE5', amount: Math.round(livingExpense * 0.15), percent: 15 },
    { id: 'health', name: '건강', icon: '💊', color: '#8B5CF6', bgColor: '#EDE9FE', amount: Math.round(livingExpense * 0.08), percent: 8 },
    { id: 'etc', name: '기타', icon: '📦', color: '#EC4899', bgColor: '#FCE7F3', amount: Math.round(livingExpense * 0.07), percent: 7 },
  ];

  // 금액 포맷 (만원 단위)
  const formatAmount = (amount: number) => {
    return amount.toLocaleString() + '만원';
  };

  // 공유하기
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'AI머니야 월간 리포트',
        text: `${formatMonth(currentMonth)} 지출 리포트`,
        url: window.location.href,
      });
    } else {
      alert('공유 기능을 지원하지 않는 브라우저입니다.');
    }
  };

  // PDF 다운로드 (준비 중)
  const handleDownload = () => {
    alert('PDF 다운로드 기능은 준비 중입니다.');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-5 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">월간 리포트</h1>
        </div>
        
        {/* 월 선택 */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <button onClick={prevMonth} className="p-2 hover:bg-white/20 rounded-full transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-lg font-semibold min-w-[120px] text-center">{formatMonth(currentMonth)}</span>
          <button onClick={nextMonth} className="p-2 hover:bg-white/20 rounded-full transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-5 -mt-4 space-y-4">
        {/* 총 지출 카드 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-gray-500 text-sm mb-1">이번 달 총 지출</p>
          <p className="text-3xl font-bold text-gray-900">{formatAmount(totalExpense)}</p>
          
          <div className="flex gap-4 mt-3 text-sm">
            <div className={`flex items-center gap-1 ${budgetDiff > 0 ? 'text-red-500' : 'text-green-500'}`}>
              <span>{budgetDiff > 0 ? '▲' : budgetDiff < 0 ? '▼' : '•'}</span>
              <span>예산 대비 {budgetDiff === 0 ? '동일' : `${Math.abs(budgetDiff)}만원 ${budgetDiff > 0 ? '초과' : '절약'}`}</span>
            </div>
            <div className={`flex items-center gap-1 ${lastMonthDiff > 0 ? 'text-red-500' : 'text-green-500'}`}>
              <span>{lastMonthDiff > 0 ? '▲' : '▼'}</span>
              <span>지난달 대비 {Math.abs(lastMonthDiff)}만원</span>
            </div>
          </div>
        </div>

        {/* 예산 현황 카드 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <p className="font-semibold text-gray-900">예산 현황</p>
            <p className="text-teal-600 font-bold">{budgetRate}% 달성</p>
          </div>
          
          {/* 프로그레스 바 */}
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(budgetRate, 100)}%` }}
            />
          </div>
          
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span>0</span>
            <span>예산 {formatAmount(budgetAmount)}</span>
          </div>
        </div>

        {/* 수입/지출/저축 요약 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="font-semibold text-gray-900 mb-4">이번 달 요약</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">수입</p>
              <p className="text-lg font-bold text-blue-600">{formatAmount(totalIncome)}</p>
            </div>
            <div className="text-center border-x border-gray-100">
              <p className="text-xs text-gray-500 mb-1">지출</p>
              <p className="text-lg font-bold text-red-500">{formatAmount(totalExpense)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">저축</p>
              <p className="text-lg font-bold text-green-600">{formatAmount(savings + pension)}</p>
            </div>
          </div>
        </div>

        {/* 잉여자금 카드 */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-5 border border-amber-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-amber-700 font-medium">💰 이번 달 잉여자금</p>
              <p className="text-2xl font-bold text-amber-800 mt-1">{formatAmount(surplus)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-amber-600">추가 저축 가능 금액</p>
            </div>
          </div>
        </div>

        {/* 카테고리별 지출 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="font-semibold text-gray-900 mb-4">카테고리별 지출</p>
          
          <div className="space-y-3">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ backgroundColor: cat.bgColor }}
                >
                  {cat.icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                    <span className="text-sm font-semibold text-gray-900">{formatAmount(cat.amount)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${cat.percent}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
                <span className="text-xs text-gray-400 w-8 text-right">{cat.percent}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI 코멘트 */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-5 border border-purple-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🤖</span>
            <span className="font-semibold text-purple-700">AI 머니야 코멘트</span>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">
            이번 달 식비 비중이 {categories[0].percent}%로 가장 높았어요. 
            외식 비중이 높았던 것 같아요. 다음 달에는 <span className="text-blue-600 font-bold">주 2회 외식</span>으로 
            줄이면 약 15만원 절약 가능해요! 💪
          </p>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 py-3.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 flex items-center justify-center gap-2"
          >
            📄 PDF 다운로드
          </button>
          <button
            onClick={handleShare}
            className="flex-1 py-3.5 bg-teal-500 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
          >
            📤 공유하기
          </button>
        </div>
      </div>
    </div>
  );
}
