// src/pages/AISpendPage.tsx
// v2.0: 오늘/달력 탭 전환 추가
// ★★★ 변경사항 ★★★
// 1. 상단에 "오늘" / "달력" 탭 추가
// 2. "오늘" 탭 = 기존 AIConversation + SpendTimeline (기존 기능 100% 유지)
// 3. "달력" 탭 = CalendarView 컴포넌트 (달력+통계 서브탭 포함)
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
  
  // ★★★ v2.0: 탭 상태 추가 ★★★
  const [activeTab, setActiveTab] = useState<'today' | 'calendar'>('today');

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
      
      {/* ★★★ v2.0: 상단 탭 바 ★★★ */}
      <div className="flex bg-white border-b border-gray-200 sticky top-0 z-20">
        <button
          onClick={() => setActiveTab('today')}
          className={`flex-1 text-center py-3 text-sm font-semibold border-b-3 transition-all
            ${activeTab === 'today' 
              ? 'text-blue-600 border-blue-600' 
              : 'text-gray-400 border-transparent'}
          `}
          style={{ borderBottomWidth: '3px' }}
        >
          📋 오늘
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex-1 text-center py-3 text-sm font-semibold border-b-3 transition-all
            ${activeTab === 'calendar' 
              ? 'text-blue-600 border-blue-600' 
              : 'text-gray-400 border-transparent'}
          `}
          style={{ borderBottomWidth: '3px' }}
        >
          📅 달력/통계
        </button>
      </div>

      {/* ★★★ v2.0: 탭 콘텐츠 ★★★ */}
      {activeTab === 'today' ? (
        <>
          {/* 기존 오늘 탭 (100% 기존 코드 유지) */}
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
            {/* 지출 타임라인 - 자동 펼침 연동 */}
            <SpendTimeline 
              autoExpand={autoExpandTimeline} 
              onExpandComplete={handleExpandComplete}
            />
          </AIConversation>
        </>
      ) : (
        /* ★★★ v2.0: 달력/통계 탭 (신규) ★★★ */
        <CalendarView
          dailyBudget={dailyBudget}
          monthlyBudget={monthlyBudget}
        />
      )}

      {/* 지출 입력 모달 (양쪽 탭 모두 사용 가능) */}
      <SpendInput
        isInputMethodOpen={isInputMethodOpen}
        setIsInputMethodOpen={setIsInputMethodOpen}
      />
    </div>
  );
}

export default AISpendPage;
