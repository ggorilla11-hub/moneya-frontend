import { useState } from 'react';
import type { IncomeExpenseData } from '../types/incomeExpense';
import { BUDGET_RATIOS } from '../types/incomeExpense';

interface BudgetAdjustPageProps {
  incomeExpenseData: IncomeExpenseData;
  onConfirm: (adjustedBudget: AdjustedBudget) => void;
  onBack: () => void;
}

export interface AdjustedBudget {
  livingExpense: number;
  savings: number;
  pension: number;
  insurance: number;
  loanPayment: number;
  surplus: number;
  totalIncome: number;
}

function BudgetAdjustPage({ incomeExpenseData, onConfirm, onBack }: BudgetAdjustPageProps) {
  const { income, familySize } = incomeExpenseData;
  
  const recommendedRatios = BUDGET_RATIOS[Math.min(familySize, 5)] || BUDGET_RATIOS[2];
  
  const recommendedBudget = {
    livingExpense: Math.round(income * recommendedRatios.living / 100),
    savings: Math.round(income * recommendedRatios.savings / 100),
    pension: Math.round(income * recommendedRatios.pension / 100),
    insurance: Math.round(income * recommendedRatios.insurance / 100),
    loanPayment: Math.round(income * recommendedRatios.loan / 100),
  };

  const [budget, setBudget] = useState({
    livingExpense: incomeExpenseData.livingExpense || recommendedBudget.livingExpense,
    savings: incomeExpenseData.savings || recommendedBudget.savings,
    pension: incomeExpenseData.pension || recommendedBudget.pension,
    insurance: incomeExpenseData.insurance || recommendedBudget.insurance,
    loanPayment: incomeExpenseData.loanPayment || recommendedBudget.loanPayment,
  });

  const surplus = income - (budget.livingExpense + budget.savings + budget.pension + budget.insurance + budget.loanPayment);

  const [activeSlider, setActiveSlider] = useState<string | null>(null);

  const handleSliderChange = (field: keyof typeof budget, newValue: number) => {
    if (field === 'loanPayment') return;
    newValue = Math.max(0, Math.min(newValue, income));
    const oldValue = budget[field];
    const difference = newValue - oldValue;
    if (difference === 0) return;

    const newBudget = { ...budget, [field]: newValue };
    const adjustableFields = ['livingExpense', 'savings', 'pension', 'insurance']
      .filter(f => f !== field) as (keyof typeof budget)[];

    if (difference !== 0) {
      const totalAdjustable = adjustableFields.reduce((sum, f) => sum + newBudget[f], 0);
      
      if (totalAdjustable > 0 || difference < 0) {
        let remainingDiff = -difference;
        
        adjustableFields.forEach((f, index) => {
          if (index === adjustableFields.length - 1) {
            newBudget[f] = Math.max(0, newBudget[f] + remainingDiff);
          } else {
            const ratio = totalAdjustable > 0 ? newBudget[f] / totalAdjustable : 0.25;
            const adjustment = Math.round(remainingDiff * ratio);
            const newFieldValue = Math.max(0, newBudget[f] + adjustment);
            const actualAdjustment = newFieldValue - newBudget[f];
            newBudget[f] = newFieldValue;
            remainingDiff -= actualAdjustment;
          }
        });
      }
    }

    setBudget(newBudget);
  };

  const getPercent = (value: number) => Math.round((value / income) * 100);
  const formatWon = (value: number) => `₩${(value * 10000).toLocaleString()}`;

  const getDifference = (field: keyof typeof recommendedBudget) => {
    return budget[field] - recommendedBudget[field];
  };

  const wealthIndex = incomeExpenseData.surplus ? 
    ((incomeExpenseData.surplus / income) * 100).toFixed(1) : '0.0';
  
  const debtRatio = income > 0 ? Math.round((budget.loanPayment / income) * 100) : 0;
  
  const overSpendRatio = recommendedBudget.livingExpense > 0 ?
    Math.round(((budget.livingExpense - recommendedBudget.livingExpense) / recommendedBudget.livingExpense) * 100) : 0;

  const monthlySavingsIncrease = budget.savings - (incomeExpenseData.savings || 0);
  const yearlySavingsIncrease = monthlySavingsIncrease * 12;

  const handleConfirm = () => {
    const adjustedBudget: AdjustedBudget = {
      livingExpense: budget.livingExpense,
      savings: budget.savings,
      pension: budget.pension,
      insurance: budget.insurance,
      loanPayment: budget.loanPayment,
      surplus: surplus,
      totalIncome: income,
    };
    onConfirm(adjustedBudget);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-green-50 to-amber-50 flex flex-col">
      
      <div className="flex items-center gap-3 p-4 pt-6">
        <button 
          onClick={onBack}
          className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-sm"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-800">📋 예산 조정</h1>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: '83%' }}></div>
          </div>
          <span className="text-xs font-semibold text-gray-400">5/6</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-32">
        
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-4 mb-4 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
              </svg>
            </div>
            <span className="font-bold text-base">AI 머니야 권장안 📊</span>
          </div>
          <p className="text-sm leading-relaxed opacity-95">
            {familySize}인 가구 기준, 생활비를 
            <span className="bg-white/20 px-2 py-0.5 rounded mx-1 font-bold">
              {Math.abs(getDifference('livingExpense'))}만원 {getDifference('livingExpense') > 0 ? '줄이면' : '유지하면'}
            </span>
            저축/투자를 
            <span className="bg-white/20 px-2 py-0.5 rounded mx-1 font-bold">
              월 +{Math.max(0, recommendedBudget.savings - (incomeExpenseData.savings || 0))}만원
            </span>
            더 할 수 있어요!
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className={`bg-white rounded-xl p-3 text-center border ${
            parseFloat(wealthIndex) >= 1 ? 'border-green-200' : 
            parseFloat(wealthIndex) >= 0.5 ? 'border-amber-200' : 'border-red-200'
          }`}>
            <div className="text-xl mb-1">📈</div>
            <div className={`font-extrabold text-lg ${
              parseFloat(wealthIndex) >= 1 ? 'text-green-600' : 
              parseFloat(wealthIndex) >= 0.5 ? 'text-amber-500' : 'text-red-500'
            }`}>{wealthIndex}%</div>
            <div className="text-xs text-gray-400">부자지수</div>
          </div>
          <div className={`bg-white rounded-xl p-3 text-center border ${
            debtRatio <= 20 ? 'border-green-200' : 
            debtRatio <= 30 ? 'border-amber-200' : 'border-red-200'
          }`}>
            <div className="text-xl mb-1">💳</div>
            <div className={`font-extrabold text-lg ${
              debtRatio <= 20 ? 'text-green-600' : 
              debtRatio <= 30 ? 'text-amber-500' : 'text-red-500'
            }`}>{debtRatio}%</div>
            <div className="text-xs text-gray-400">부채비율</div>
          </div>
          <div className={`bg-white rounded-xl p-3 text-center border ${
            overSpendRatio <= 0 ? 'border-green-200' : 
            overSpendRatio <= 20 ? 'border-amber-200' : 'border-red-200'
          }`}>
            <div className="text-xl mb-1">🛒</div>
            <div className={`font-extrabold text-lg ${
              overSpendRatio <= 0 ? 'text-green-600' : 
              overSpendRatio <= 20 ? 'text-amber-500' : 'text-red-500'
            }`}>{overSpendRatio > 0 ? `+${overSpendRatio}` : overSpendRatio}%</div>
            <div className="text-xs text-gray-400">과소비</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-800">🎯 예산 조정 (월 기준)</h2>
              <p className="text-xs text-gray-400 mt-0.5">슬라이더를 움직여 조정하세요</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400">총 수입</div>
              <div className="font-bold text-blue-600">{formatWon(income)}</div>
            </div>
          </div>

          {/* 1. 생활비 */}
          <SliderItem
            icon="🏠"
            label="생활비"
            value={budget.livingExpense}
            recommended={recommendedBudget.livingExpense}
            maxValue={income}
            percent={getPercent(budget.livingExpense)}
            onChange={(v) => handleSliderChange('livingExpense', v)}
            isActive={activeSlider === 'livingExpense'}
            onFocus={() => setActiveSlider('livingExpense')}
            onBlur={() => setActiveSlider(null)}
            color="amber"
          />

          {/* 2. 저축/투자 */}
          <SliderItem
            icon="💰"
            label="저축/투자"
            value={budget.savings}
            recommended={recommendedBudget.savings}
            maxValue={income}
            percent={getPercent(budget.savings)}
            onChange={(v) => handleSliderChange('savings', v)}
            isActive={activeSlider === 'savings'}
            onFocus={() => setActiveSlider('savings')}
            onBlur={() => setActiveSlider(null)}
            color="green"
          />

          {/* 3. 노후연금 */}
          <SliderItem
            icon="🏦"
            label="노후연금"
            value={budget.pension}
            recommended={recommendedBudget.pension}
            maxValue={income}
            percent={getPercent(budget.pension)}
            onChange={(v) => handleSliderChange('pension', v)}
            isActive={activeSlider === 'pension'}
            onFocus={() => setActiveSlider('pension')}
            onBlur={() => setActiveSlider(null)}
            color="blue"
          />

          {/* 4. 보장성보험 */}
          <SliderItem
            icon="🛡️"
            label="보장성보험"
            value={budget.insurance}
            recommended={recommendedBudget.insurance}
            maxValue={income}
            percent={getPercent(budget.insurance)}
            onChange={(v) => handleSliderChange('insurance', v)}
            isActive={activeSlider === 'insurance'}
            onFocus={() => setActiveSlider('insurance')}
            onBlur={() => setActiveSlider(null)}
            color="purple"
          />

          {/* 5. 대출원리금 (고정) */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <span>💳</span> 대출원리금
              </span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-gray-400">{formatWon(budget.loanPayment)}</span>
                <span className="text-sm text-gray-400">({getPercent(budget.loanPayment)}%)</span>
              </div>
            </div>
            <div className="relative h-10">
              <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-3 bg-gray-200 rounded-full"></div>
              <div 
                className="absolute top-1/2 -translate-y-1/2 left-0 h-3 bg-gray-400 rounded-full"
                style={{ width: `${getPercent(budget.loanPayment)}%` }}
              ></div>
              <div 
                className="absolute top-1/2 w-7 h-7 bg-white border-4 border-gray-400 rounded-full shadow-lg"
                style={{ left: `${getPercent(budget.loanPayment)}%`, transform: 'translate(-50%, -50%)' }}
              ></div>
            </div>
            <div className="text-right text-xs font-semibold text-gray-400 mt-1">고정 지출 (조정 불가)</div>
          </div>

          {/* 6. 잉여자금 */}
          <div className="pt-4 border-t-2 border-dashed border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <span>💵</span> 잉여자금
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-3xl font-extrabold ${surplus >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
                  {formatWon(Math.abs(surplus))}
                </span>
                <span className="text-sm text-gray-400">({Math.abs(getPercent(surplus))}%)</span>
              </div>
            </div>
            <div className={`text-right text-xs mt-1 ${surplus >= 0 ? 'text-blue-500' : 'text-red-500 font-bold'}`}>
              {surplus > 0 ? '✨ 추가 저축 또는 여유자금으로 활용' : 
               surplus < 0 ? '⚠️ 예산 초과! 다른 항목을 줄여주세요' : '✅ 딱 맞게 배분되었습니다'}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4">
          <h3 className="font-bold text-green-700 mb-3">✨ 조정 효과 요약</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <div className={`text-3xl font-extrabold ${monthlySavingsIncrease >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {monthlySavingsIncrease >= 0 ? '+' : ''}{monthlySavingsIncrease}만
              </div>
              <div className="text-xs text-gray-500 mt-1">월 저축 변화</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <div className={`text-3xl font-extrabold ${yearlySavingsIncrease >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {yearlySavingsIncrease >= 0 ? '+' : ''}{yearlySavingsIncrease}만
              </div>
              <div className="text-xs text-gray-500 mt-1">연간 저축 변화</div>
            </div>
          </div>
        </div>

      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent pt-8">
        <button
          onClick={handleConfirm}
          disabled={surplus < 0}
          className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-xl transition-all ${
            surplus >= 0 
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white active:scale-95' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          이 예산으로 시작하기
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        </button>
      </div>

    </div>
  );
}

interface SliderItemProps {
  icon: string;
  label: string;
  value: number;
  recommended: number;
  maxValue: number;
  percent: number;
  onChange: (value: number) => void;
  isActive: boolean;
  onFocus: () => void;
  onBlur: () => void;
  color: 'green' | 'amber' | 'blue' | 'purple';
}

function SliderItem({ icon, label, value, recommended, maxValue, percent, onChange, isActive, onFocus, onBlur, color }: SliderItemProps) {
  const colorMap = {
    green: { fill: 'bg-green-500', border: 'border-green-500', text: 'text-green-600' },
    amber: { fill: 'bg-amber-500', border: 'border-amber-500', text: 'text-amber-600' },
    blue: { fill: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-600' },
    purple: { fill: 'bg-purple-500', border: 'border-purple-500', text: 'text-purple-600' },
  };
  
  const colors = colorMap[color];
  const difference = value - recommended;
  const formatWon = (v: number) => `₩${(v * 10000).toLocaleString()}`;

  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <span>{icon}</span> {label}
        </span>
        <div className="flex items-center gap-2">
          {difference !== 0 && (
            <span className="text-xs text-gray-400 line-through">{formatWon(recommended)}</span>
          )}
          <span className={`font-extrabold transition-all duration-200 ${colors.text} ${
            isActive ? 'text-4xl' : 'text-2xl'
          }`}>
            {formatWon(value)}
          </span>
          <span className="text-sm text-gray-400">({percent}%)</span>
        </div>
      </div>
      
      <div className="relative h-10">
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-3 bg-gray-200 rounded-full"></div>
        <div 
          className={`absolute top-1/2 -translate-y-1/2 left-0 h-3 ${colors.fill} rounded-full transition-all`}
          style={{ width: `${percent}%` }}
        ></div>
        <div 
          className="absolute top-1/2 w-0.5 h-6 bg-gray-400 -translate-y-1/2"
          style={{ left: `${(recommended / maxValue) * 100}%` }}
        ></div>
        <input
          type="range"
          min={0}
          max={maxValue}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onFocus={onFocus}
          onBlur={onBlur}
          onTouchStart={onFocus}
          onTouchEnd={onBlur}
          className="absolute top-0 left-0 w-full h-10 opacity-0 cursor-pointer z-10"
        />
        <div 
          className={`absolute top-1/2 w-7 h-7 bg-white border-4 ${colors.border} rounded-full shadow-lg pointer-events-none transition-all ${
            isActive ? 'scale-125' : ''
          }`}
          style={{ left: `${percent}%`, transform: 'translate(-50%, -50%)' }}
        ></div>
      </div>
      
      <div className={`text-right text-xs font-semibold mt-1 ${
        difference > 0 ? 'text-red-500' : difference < 0 ? 'text-green-500' : 'text-gray-400'
      }`}>
        {difference > 0 ? `▲ ${difference}만원 증가 (권장보다 높음)` : 
         difference < 0 ? `▼ ${Math.abs(difference)}만원 절감 (권장보다 낮음)` : 
         '✓ 권장 금액 유지'}
      </div>
    </div>
  );
}

export default BudgetAdjustPage;