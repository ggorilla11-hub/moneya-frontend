import { useState, useEffect } from 'react';
import type { AdjustedBudget } from './BudgetAdjustPage';

interface BudgetConfirmPageProps {
  adjustedBudget: AdjustedBudget;
  onStart: () => void;
}

function BudgetConfirmPage({ adjustedBudget, onStart }: BudgetConfirmPageProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const formatWon = (manwon: number) => `₩${manwon.toLocaleString()}`;

  const budgetItems = [
    { icon: '🏠', label: '생활비', value: adjustedBudget.livingExpense, percent: Math.round((adjustedBudget.livingExpense / adjustedBudget.totalIncome) * 100) },
    { icon: '💰', label: '저축/투자', value: adjustedBudget.savings, percent: Math.round((adjustedBudget.savings / adjustedBudget.totalIncome) * 100) },
    { icon: '🏦', label: '노후연금', value: adjustedBudget.pension, percent: Math.round((adjustedBudget.pension / adjustedBudget.totalIncome) * 100) },
    { icon: '🛡️', label: '보장성보험', value: adjustedBudget.insurance, percent: Math.round((adjustedBudget.insurance / adjustedBudget.totalIncome) * 100) },
    { icon: '💳', label: '대출원리금', value: adjustedBudget.loanPayment, percent: Math.round((adjustedBudget.loanPayment / adjustedBudget.totalIncome) * 100) },
    { icon: '💵', label: '잉여자금', value: adjustedBudget.surplus, percent: Math.round((adjustedBudget.surplus / adjustedBudget.totalIncome) * 100) },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-green-50 to-amber-50 flex flex-col relative overflow-hidden">
      
      {/* 폭죽 애니메이션 */}
      <div className="absolute top-0 left-0 right-0 h-48 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2.5 h-2.5 animate-confetti"
            style={{
              left: `${15 + i * 15}%`,
              animationDelay: `${i * 0.3}s`,
              backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444', '#0ea5e9'][i],
            }}
          />
        ))}
      </div>

      {/* 메인 콘텐츠 */}
      <div className={`flex-1 flex flex-col p-5 pt-8 transition-all duration-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* 성공 섹션 */}
        <div className="text-center mb-6">
          {/* 체크 아이콘 */}
          <div className="relative w-24 h-24 mx-auto mb-5">
            {/* 글로우 효과 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-green-500/30 rounded-full animate-pulse" />
            {/* 회전 링 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-green-400/40 rounded-full animate-spin" style={{ animationDuration: '8s' }}>
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-green-500 rounded-full shadow-lg" />
            </div>
            {/* 메인 원 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-xl">
              <svg className="w-9 h-9 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
          </div>
          
          <h1 className="text-2xl font-extrabold text-gray-800 mb-2">예산 설정 완료! 🎉</h1>
          <p className="text-gray-600 leading-relaxed">
            이제 <span className="text-green-600 font-bold">AI머니야</span>가<br/>
            지출 전후 똑똑한 조언을 해드릴게요
          </p>
        </div>

        {/* 예산 카드 */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-md mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-gray-800">📋 확정된 월 예산</span>
            <span className="font-extrabold text-blue-600 text-lg">{formatWon(adjustedBudget.totalIncome)}</span>
          </div>
          <div className="space-y-2.5">
            {budgetItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
                <span className="text-sm font-semibold text-gray-700">
                  {item.icon} {item.label}
                </span>
                <span className="font-bold text-gray-800">
                  {formatWon(item.value)}
                  <span className="text-xs text-gray-400 ml-1">({item.percent}%)</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI 메시지 카드 */}
        <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-2xl p-4 mb-4 flex gap-3">
          {/* 아바타 */}
          <div className="relative flex-shrink-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-sky-400/30 rounded-full animate-pulse" />
            <div className="relative w-11 h-11 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-extrabold text-xl">M</span>
            </div>
          </div>
          {/* 메시지 */}
          <div className="flex-1">
            <p className="text-gray-800 leading-relaxed mb-1">
              바쁜 하루,<br/>
              <strong className="text-sky-700">돈까지 혼자 고민하지 마세요.</strong>
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              지출 전후 <span className="text-sky-500 font-bold">10초</span>만 저와 대화하면<br/>
              '새는 돈'을 제가 찾아드릴게요.
            </p>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="mt-auto pt-4">
          <button
            onClick={onStart}
            className="w-full py-4 bg-gradient-to-r from-sky-500 to-sky-600 text-white font-bold text-lg rounded-2xl shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform animate-btnPulse"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
            </svg>
            내 돈 지키러 가기
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* 애니메이션 스타일 */}
      <style>{`
        @keyframes confetti {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(200px) rotate(360deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti 3s ease-in-out infinite;
        }
        @keyframes btnPulse {
          0%, 100% { box-shadow: 0 8px 24px rgba(14, 165, 233, 0.35); }
          50% { box-shadow: 0 8px 32px rgba(14, 165, 233, 0.5); }
        }
        .animate-btnPulse {
          animation: btnPulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default BudgetConfirmPage;