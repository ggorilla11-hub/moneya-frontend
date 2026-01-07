import { useState, useEffect } from 'react';
import type { AdjustedBudget } from './BudgetAdjustPage';

interface BudgetConfirmPageProps {
  adjustedBudget: AdjustedBudget;
  onStart: () => void;
}

function BudgetConfirmPage({ adjustedBudget, onStart }: BudgetConfirmPageProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setShowContent(true), 500);
    const timer2 = setTimeout(() => setShowConfetti(false), 2500);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const formatWon = (manwon: number) => `₩${manwon.toLocaleString()}원`;

  const budgetItems = [
    { icon: '🏠', label: '생활비', value: adjustedBudget.livingExpense, percent: Math.round((adjustedBudget.livingExpense / adjustedBudget.totalIncome) * 100) },
    { icon: '💰', label: '저축/투자', value: adjustedBudget.savings, percent: Math.round((adjustedBudget.savings / adjustedBudget.totalIncome) * 100) },
    { icon: '🏦', label: '노후연금', value: adjustedBudget.pension, percent: Math.round((adjustedBudget.pension / adjustedBudget.totalIncome) * 100) },
    { icon: '🛡️', label: '보장성보험', value: adjustedBudget.insurance, percent: Math.round((adjustedBudget.insurance / adjustedBudget.totalIncome) * 100) },
    { icon: '💳', label: '대출원리금', value: adjustedBudget.loanPayment, percent: Math.round((adjustedBudget.loanPayment / adjustedBudget.totalIncome) * 100) },
    { icon: '💵', label: '잉여자금', value: adjustedBudget.surplus, percent: Math.round((adjustedBudget.surplus / adjustedBudget.totalIncome) * 100) },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 flex flex-col relative overflow-hidden">
      
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                animationDelay: `${Math.random() * 1}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              <div
                className="w-3 h-3 rounded-sm"
                style={{
                  backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'][Math.floor(Math.random() * 8)],
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            </div>
          ))}
        </div>
      )}

      <div className={`flex-1 flex flex-col items-center justify-center p-6 transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        
        <div className="relative mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-xl shadow-green-500/30">
            <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-xs">✨</span>
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-gray-800 mb-2 text-center">
          예산 설정 완료! 🎉
        </h1>
        <p className="text-gray-600 text-center mb-6 leading-relaxed">
          이제 <span className="text-purple-600 font-bold">AI머니야</span>가<br/>
          지출 전후 똑똑한 조언을 해드릴게요
        </p>

        <div className="w-full max-w-sm">
          <div 
            className="relative p-1 rounded-2xl"
            style={{
              background: 'linear-gradient(145deg, #8B7355, #6B5344)',
              boxShadow: '0 8px 32px rgba(107, 83, 68, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            <div 
              className="absolute inset-2 rounded-xl pointer-events-none"
              style={{ border: '2px dashed rgba(139, 115, 85, 0.6)' }}
            />
            
            <div 
              className="relative rounded-xl p-5"
              style={{
                background: 'linear-gradient(145deg, #D4B896 0%, #C4A574 50%, #B8956C 100%)',
                boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <div 
                className="absolute inset-0 rounded-xl opacity-10 pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
              />

              <div className="text-center mb-4 relative">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-2xl">🗺️</span>
                  <h2 className="text-lg font-bold" style={{ color: '#5D4E37' }}>확정된 월 예산</h2>
                </div>
                <div 
                  className="text-3xl font-extrabold"
                  style={{ color: '#8B6914', textShadow: '1px 1px 0 rgba(255,255,255,0.5)' }}
                >
                  {formatWon(adjustedBudget.totalIncome)}
                </div>
              </div>

              <div 
                className="h-0.5 mb-4 rounded-full"
                style={{ background: 'linear-gradient(90deg, transparent, #8B7355, transparent)' }}
              />

              <div className="space-y-3">
                {budgetItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-semibold text-sm" style={{ color: '#5D4E37' }}>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold" style={{ color: '#8B6914', textShadow: '0.5px 0.5px 0 rgba(255,255,255,0.5)' }}>
                        {formatWon(item.value)}
                      </span>
                      <span 
                        className="text-xs px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: 'rgba(139, 105, 20, 0.15)', color: '#6B5419' }}
                      >
                        {item.percent}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 rounded-tl-lg" style={{ borderColor: '#8B7355' }} />
              <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 rounded-tr-lg" style={{ borderColor: '#8B7355' }} />
              <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 rounded-bl-lg" style={{ borderColor: '#8B7355' }} />
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 rounded-br-lg" style={{ borderColor: '#8B7355' }} />
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-6 text-center">
          이 예산은 언제든지 설정에서 수정할 수 있어요
        </p>
      </div>

      <div className={`p-4 pb-8 transition-all duration-700 delay-300 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <button
          onClick={onStart}
          className="w-full py-4 bg-gradient-to-r from-purple-500 to-purple-700 text-white font-bold text-lg rounded-2xl shadow-xl shadow-purple-500/30 flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <span>🚀</span>
          AI머니야 시작하기
        </button>
      </div>

      <style>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti { animation: confetti linear forwards; }
      `}</style>
    </div>
  );
}

export default BudgetConfirmPage;