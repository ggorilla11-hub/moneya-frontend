import { useState } from 'react';
import type { AdjustedBudget } from './BudgetAdjustPage';
import AIConversation from './spend/AIConversation';
import SpendTimeline from './spend/SpendTimeline';
import SpendInput from './spend/SpendInput';
import type { SpendItem } from './spend/SpendTimeline';

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

  // 지출 데이터 (추후 DB 연동)
  const [spendItems] = useState<SpendItem[]>([
    { id: '1', name: '적금 자동이체', amount: 500000, type: 'investment', category: '저축투자', time: '09:00', tag: '실제저축' },
    { id: '2', name: '커피 참음!', amount: 15000, type: 'saved', category: '충동', time: '14:30', tag: 'AI 조언 후 취소' },
    { id: '3', name: '점심 김밥천국', amount: 8000, type: 'spent', category: '필수', time: '12:30', tag: '바로 지출' },
  ]);

  // 예산 계산
  const dailyBudget = adjustedBudget ? Math.round(adjustedBudget.livingExpense / 30) : 66667;
  const todaySpent = spendItems.filter(item => item.type === 'spent').reduce((sum, item) => sum + item.amount, 0);
  const todaySaved = spendItems.filter(item => item.type === 'saved').reduce((sum, item) => sum + item.amount, 0);
  const todayInvestment = spendItems.filter(item => item.type === 'investment').reduce((sum, item) => sum + item.amount, 0);
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
        {/* 지출 타임라인 컴포넌트 - 헤더 바로 아래 */}
        <SpendTimeline
          spendItems={spendItems}
          todaySpent={todaySpent}
          todaySaved={todaySaved}
          todayInvestment={todayInvestment}
        />
      </AIConversation>

      {/* 지출 입력 모달 컴포넌트 */}
      <SpendInput
        isInputMethodOpen={isInputMethodOpen}
        setIsInputMethodOpen={setIsInputMethodOpen}
      />
    </div>
  );
}

export default AISpendPage;
