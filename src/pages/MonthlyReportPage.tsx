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

  // 샘플 데이터 (실제로는 adjustedBudget에서 가져옴)
  const totalExpense = adjustedBudget?.expenses?.total || 2847000;
  const budgetAmount = adjustedBudget?.totalIncome ? adjustedBudget.totalIncome * 0.7 : 2700000;
  const budgetDiff = totalExpense - budgetAmount;
  const lastMonthDiff = -203000;
  const budgetRate = Math.round((budgetAmount / totalExpense) * 100);

  // 카테고리별 데이터
  const categories = [
    { id: 'food', name: '식비', icon: '🍽️', color: '#EF4444', bgColor: '#FEE2E2', amount: 797160, percent: 28 },
    { id: 'transport', name: '교통', icon: '🚗', color: '#F59E0B', bgColor: '#FEF3C7', amount: 569400, percent: 20 },
    { id: 'shopping', name: '쇼핑', icon: '🛍️', color: '#3B82F6', bgColor: '#DBEAFE', amount: 427050, percent: 15 },
    { id: 'culture', name: '문화/여가', icon: '🎮', color: '#10B981', bgColor: '#D1FAE5', amount: 427050, percent: 15 },
    { id: 'health', name: '건강', icon: '💊', color: '#8B5CF6', bgColor: '#EDE9FE', amount: 284700, percent: 10 },
    { id: 'etc', name: '기타', icon: '📦', color: '#EC4899', bgColor: '#FCE7F3', amount: 341640, percent: 12 },
  ];

  // 금액 포맷
  const formatAmount = (amount: number) => {
    return amount.toLocaleString() + '원';
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

  // PDF 다운로드 (추후 구현)
  const handleDownload = () => {
    alert('PDF 다운로드 기능은 추후 업데이트 예정입니다.');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 text-lg"
        >
          ←
        </button>
        <h1 className="flex-1 text-lg font-bold text-gray-900">월간 리포트</h1>
        <button
          onClick={handleShare}
          className="px-3 py-1.5 bg-teal-500 text-white rounded-xl text-xs font-bold"
        >
          공유
        </button>
      </div>

      <div className="p-4">
        {/* 월 선택 */}
        <div className="flex items-center justify-center gap-4 mb-5">
          <button
            onClick={prevMonth}
            className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-sm"
          >
            ‹
          </button>
          <span className="text-lg font-extrabold text-gray-900">{formatMonth(currentMonth)}</span>
          <button
            onClick={nextMonth}
            className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-sm"
          >
            ›
          </button>
        </div>

        {/* 요약 카드 */}
        <div className="bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl p-5 mb-4 text-white">
          <p className="text-xs opacity-90 mb-1">이번 달 총 지출</p>
          <p className="text-3xl font-extrabold mb-4">{formatAmount(totalExpense)}</p>
          
          <div className="space-y-2 pt-3 border-t border-white/20">
            <div className="flex justify-between">
              <span className="text-sm opacity-90">예산 대비</span>
              <span className={`text-sm font-bold ${budgetDiff > 0 ? 'text-red-200' : 'text-green-200'}`}>
                {budgetDiff > 0 ? '+' : ''}{formatAmount(budgetDiff)} {budgetDiff > 0 ? '초과' : '절약'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm opacity-90">지난달 대비</span>
              <span className={`text-sm font-bold ${lastMonthDiff > 0 ? 'text-red-200' : 'text-green-200'}`}>
                {lastMonthDiff > 0 ? '+' : ''}{formatAmount(lastMonthDiff)} {lastMonthDiff > 0 ? '증가' : '절약'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm opacity-90">예산 달성률</span>
              <span className="text-sm font-bold">{budgetRate}%</span>
            </div>
          </div>
        </div>

        {/* 카테고리별 분석 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-1.5">
            📊 카테고리별 지출
          </h2>

          {/* 도넛 차트 영역 */}
          <div className="flex items-center gap-4 mb-4">
            {/* 도넛 차트 */}
            <div className="relative w-28 h-28 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#EF4444" strokeWidth="3.5" strokeDasharray="28 72" strokeDashoffset="0" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#F59E0B" strokeWidth="3.5" strokeDasharray="20 80" strokeDashoffset="-28" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3B82F6" strokeWidth="3.5" strokeDasharray="15 85" strokeDashoffset="-48" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10B981" strokeWidth="3.5" strokeDasharray="15 85" strokeDashoffset="-63" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#8B5CF6" strokeWidth="3.5" strokeDasharray="10 90" strokeDashoffset="-78" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#EC4899" strokeWidth="3.5" strokeDasharray="12 88" strokeDashoffset="-88" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] text-gray-400">총 지출</span>
                <span className="text-sm font-extrabold text-gray-900">284.7만</span>
              </div>
            </div>

            {/* 범례 */}
            <div className="flex-1 space-y-1.5">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: cat.color }} />
                  <span className="flex-1 text-gray-500">{cat.name}</span>
                  <span className="font-semibold text-gray-900">{cat.percent}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* 카테고리 상세 */}
          <div className="space-y-3">
            {categories.slice(0, 4).map((cat) => (
              <div key={cat.id} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                  style={{ backgroundColor: cat.bgColor }}
                >
                  {cat.icon}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-900">{cat.name}</p>
                  <div className="h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ backgroundColor: cat.color, width: `${cat.percent * 2.5}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900">{formatAmount(cat.amount)}</p>
                  <p className="text-[10px] text-gray-400">{cat.percent}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI 코멘트 */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              M
            </div>
            <span className="text-xs font-bold text-blue-600">AI머니야 분석</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            이번 달 <span className="text-blue-600 font-bold">식비</span>가 예산 대비 12% 초과했어요. 
            외식 비중이 높았던 것 같아요. 다음 달에는 <span className="text-blue-600 font-bold">주 2회 외식</span>으로 
            줄이면 약 15만원 절약 가능해요! 💪
          </p>
        </div>

        {/* PDF 다운로드 */}
        <button
          onClick={handleDownload}
          className="w-full py-3.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 flex items-center justify-center gap-2"
        >
          📄 PDF로 다운로드
        </button>
      </div>
    </div>
  );
}
