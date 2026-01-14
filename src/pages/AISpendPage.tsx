// src/pages/AISpendPage.tsx
// AI지출 페이지 - Context 연동, 실제 데이터 사용

import { useState } from 'react';
import type { AdjustedBudget } from './BudgetAdjustPage';
import AIConversation from './spend/AIConversation';
import SpendTimeline from './spend/SpendTimeline';
import SpendInput from './spend/SpendInput';
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

  // Context에서 실제 데이터 가져오기
  const { todaySpent, todaySaved, todayInvestment } = useSpend();

  // 예산 계산
  const dailyBudget = adjustedBudget ? Math.round(adjustedBudget.livingExpense / 30) : 66667;
  const remainingBudget = dailyBudget - todaySpent;

  const displayName = financialResult?.name || userName.split('(')[0].trim();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      {/* AI 대화 컴포넌트 */}
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
        {/* 지출 타임라인 */}
        <SpendTimeline />
      </AIConversation>

      {/* 지출 입력 모달 */}
      <SpendInput
        isInputMethodOpen={isInputMethodOpen}
        setIsInputMethodOpen={setIsInputMethodOpen}
      />
    </div>
  );
}

export default AISpendPage;
