// src/pages/AISpendPage.tsx
// v3.1: 달력/통계 탭일 때 AIConversation 숨기기
// ★★★ 변경사항 ★★★
// 1. 상단 별도 탭 바 제거
// 2. SpendTimeline 헤더의 오늘/달력/통계 탭으로 화면 전환
// 3. 오늘 = AI대화 + 타임라인 (100% 유지)
// 4. 달력/통계 = SpendTimeline 헤더(탭) + CalendarView만 표시
// ★★★ AIConversation.tsx는 절대 수정하지 않음 ★★★

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
  
  // ★★★ v3.0: 탭 상태 ★★★
  const [activeTab, setActiveTab] = useState<'today' | 'calendar' | 'stats'>('today');

  // Context에서 실제 데이터 가져오기
  const { todaySpent, todaySaved, todayInvestment, spendItems } = useSpend();

  // 지출 항목이 추가되면 타임라인 자동 펼침
  useEffect(() => {
    if (spendItems.length > 0) {
      setAutoExpandTimeline(true);
    }
  }, [spendItems.length]);

  // 자동 펼침 완료 후 상태 초기화
  const handleExpandComplete = () => {
    setTimeout(() => {
      setAutoExpandTimeline(false);
    }, 2000);
  };

  // 예산 계산
  const dailyBudget = adjustedBudget ? Math.round(adjustedBudget.livingExpense / 30) : 66667;
  const monthlyBudget = adjustedBudget ? adjustedBudget.livingExpense : 2000000;
  const remainingBudget = dailyBudget - todaySpent;

  const displayName = financialResult?.name || userName.split('(')[0].trim();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      
      {/* ★★★ v3.1: 오늘 탭일 때만 AI대화 표시 ★★★ */}
      {activeTab === 'today' && (
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
          {/* SpendTimeline with tab switching */}
          <SpendTimeline 
            autoExpand={autoExpandTimeline} 
            onExpandComplete={handleExpandComplete}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </AIConversation>
      )}

      {/* ★★★ v3.1: 달력/통계 탭일 때 - 탭 헤더 + CalendarView만 표시 ★★★ */}
      {activeTab !== 'today' && (
        <>
          {/* 탭 헤더만 독립적으로 표시 */}
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

          {/* CalendarView */}
          <CalendarView
            dailyBudget={dailyBudget}
            monthlyBudget={monthlyBudget}
            initialSubTab={activeTab === 'calendar' ? 'calendar' : 'stats'}
          />
        </>
      )}

      {/* 지출 입력 모달 */}
      <SpendInput
        isInputMethodOpen={isInputMethodOpen}
        setIsInputMethodOpen={setIsInputMethodOpen}
      />
    </div>
  );
}

export default AISpendPage;
