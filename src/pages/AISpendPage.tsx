// src/pages/AISpendPage.tsx
// v3.2: 탭에 따라 완전 분리 구조
// ★★★ 변경사항 ★★★
// 1. 오늘 탭: AIConversation(children=SpendTimeline) → 기존 100% 동일
// 2. 달력/통계 탭: 파란배너(간소화) + 탭헤더 + CalendarView
// 3. AIConversation.tsx 절대 수정 안 함
// ★★★ 핵심: 달력/통계에서도 파란배너는 보이되, AI대화는 숨김 ★★★

import { useState, useEffect } from 'react';
import type { AdjustedBudget } from './BudgetAdjustPage';
import AIConversation from './spend/AIConversation';
import SpendTimeline from './spend/SpendTimeline';
import SpendInput from './spend/SpendInput';
import CalendarView from '../components/CalendarView';
import { useSpend } from '../context/SpendContext';

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

interface AISpendPageProps {
  userName: string;
  adjustedBudget: AdjustedBudget | null;
  financialResult: FinancialResult | null;
  onFAQMore: () => void;
}

function AISpendPage({ userName, adjustedBudget, financialResult, onFAQMore }: AISpendPageProps) {
  const [isInputMethodOpen, setIsInputMethodOpen] = useState(false);
  const [autoExpandTimeline, setAutoExpandTimeline] = useState(false);
  const [activeTab, setActiveTab] = useState<'today' | 'calendar' | 'stats'>('today');

  const { todaySpent, todaySaved, todayInvestment, spendItems } = useSpend();

  useEffect(() => {
    if (spendItems.length > 0) {
      setAutoExpandTimeline(true);
    }
  }, [spendItems.length]);

  const handleExpandComplete = () => {
    setTimeout(() => {
      setAutoExpandTimeline(false);
    }, 2000);
  };

  const dailyBudget = adjustedBudget ? Math.round(adjustedBudget.livingExpense / 30) : 66667;
  const monthlyBudget = adjustedBudget ? adjustedBudget.livingExpense : 2000000;
  const remainingBudget = dailyBudget - todaySpent;
  const displayName = financialResult?.name || userName.split('(')[0].trim();
  const usagePercent = Math.round((todaySpent / dailyBudget) * 100);

  // ★★★ 오늘 탭: 기존 코드 100% 동일 ★★★
  if (activeTab === 'today') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
        <AIConversation
          userName={userName}
          displayName={displayName}
          adjustedBudget={adjustedBudget}
          financialResult={financialResult}
          dailyBudget={dailyBudget}
          todaySpent={todaySpent}
          todaySaved={todaySaved}
          todayInvestment={todayInvestment}
          remainingBudget={remainingBudget}
          onFAQMore={onFAQMore}
          onPlusClick={() => setIsInputMethodOpen(true)}
        >
          <SpendTimeline 
            autoExpand={autoExpandTimeline} 
            onExpandComplete={handleExpandComplete}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </AIConversation>

        <SpendInput
          isInputMethodOpen={isInputMethodOpen}
          setIsInputMethodOpen={setIsInputMethodOpen}
        />
      </div>
    );
  }

  // ★★★ 달력/통계 탭: 간소화 배너 + 탭헤더 + CalendarView ★★★
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      {/* 간소화 배너 (파란색 헤더 유지) */}
      <div className="mx-4 mt-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-4 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full"></div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/20">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-white font-bold">안녕하세요, {displayName}님!</p>
            <div className="flex items-center gap-2">
              <span className="text-white/80 text-sm">오늘 남은 예산</span>
              <span className="text-white text-xl font-extrabold">₩{remainingBudget.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="mt-3 bg-white/20 rounded-full h-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all" style={{ width: `${100 - usagePercent}%` }}></div>
        </div>
        <div className="flex justify-between mt-1.5 text-xs text-white/70">
          <span>일예산 ₩{dailyBudget.toLocaleString()}</span>
          <span>지출 ₩{todaySpent.toLocaleString()} ({usagePercent}%)</span>
        </div>
      </div>

      {/* 탭 헤더 */}
      <div className="mx-4 mt-3 bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-3 flex items-center">
          <button
            onClick={() => setActiveTab('today')}
            className="font-bold mr-2 text-sm px-2.5 py-1 rounded-lg transition-all active:scale-95 text-gray-500 bg-gray-100"
          >
            📊 오늘
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`font-bold mr-2 text-sm px-2.5 py-1 rounded-lg transition-all active:scale-95
              ${activeTab === 'calendar' ? 'text-white bg-blue-500' : 'text-gray-500 bg-gray-100'}
            `}
          >
            📅 달력
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`font-bold text-sm px-2.5 py-1 rounded-lg transition-all active:scale-95
              ${activeTab === 'stats' ? 'text-white bg-blue-500' : 'text-gray-500 bg-gray-100'}
            `}
          >
            📊 통계
          </button>
        </div>
      </div>

      {/* CalendarView 콘텐츠 */}
      <CalendarView
        dailyBudget={dailyBudget}
        monthlyBudget={monthlyBudget}
        initialSubTab={activeTab === 'calendar' ? 'calendar' : 'stats'}
      />

      {/* 지출 입력 모달 */}
      <SpendInput
        isInputMethodOpen={isInputMethodOpen}
        setIsInputMethodOpen={setIsInputMethodOpen}
      />
    </div>
  );
}

export default AISpendPage;
