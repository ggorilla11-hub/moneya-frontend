import { useState } from 'react';

interface IncomeExpenseInputPageProps {
  initialIncome?: number;
  onComplete: (data: IncomeExpenseData) => void;
  onBack: () => void;
}

export interface IncomeExpenseData {
  familySize: number;
  income: number;
  loanPayment: number;
  insurance: number;
  pension: number;
  savings: number;
  surplus: number;
  livingExpense: number;
}

// 가족수별 예산 비율 (오원트 공식)
export const BUDGET_RATIOS: { [key: number]: { living: number; savings: number; pension: number; insurance: number; loan: number } } = {
  1: { living: 25, savings: 50, pension: 10, insurance: 5, loan: 10 },
  2: { living: 30, savings: 40, pension: 10, insurance: 10, loan: 10 },
  3: { living: 40, savings: 30, pension: 10, insurance: 10, loan: 10 },
  4: { living: 50, savings: 20, pension: 10, insurance: 10, loan: 10 },
  5: { living: 60, savings: 10, pension: 10, insurance: 10, loan: 10 },
};

function IncomeExpenseInputPage({ initialIncome = 0, onComplete, onBack }: IncomeExpenseInputPageProps) {
  const [familySize, setFamilySize] = useState(2);
  const [income, setIncome] = useState(initialIncome.toString());
  const [loanPayment, setLoanPayment] = useState('0');
  const [insurance, setInsurance] = useState('0');
  const [pension, setPension] = useState('0');
  const [savings, setSavings] = useState('0');
  const [surplus, setSurplus] = useState('0');

  // 생활비 자동 계산
  const calculateLivingExpense = () => {
    const incomeVal = (parseInt(income) || 0) * 10000; // 만원 → 원
    const loanVal = parseInt(loanPayment) || 0;
    const insuranceVal = parseInt(insurance) || 0;
    const pensionVal = parseInt(pension) || 0;
    const savingsVal = parseInt(savings) || 0;
    const surplusVal = parseInt(surplus) || 0;

    const totalFixed = loanVal + insuranceVal + pensionVal + savingsVal + surplusVal;
    return incomeVal - totalFixed;
  };

  const livingExpense = calculateLivingExpense();

  // 고정지출 합계
  const fixedExpense = (parseInt(loanPayment) || 0) + (parseInt(insurance) || 0);
  
  // 저축투자 합계
  const totalSavings = (parseInt(pension) || 0) + (parseInt(savings) || 0) + (parseInt(surplus) || 0);

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleSubmit = () => {
    const incomeVal = parseInt(income) || 0;
    if (incomeVal <= 0) {
      alert('월 수입을 입력해주세요.');
      return;
    }

    const data: IncomeExpenseData = {
      familySize,
      income: incomeVal * 10000, // 만원 → 원
      loanPayment: parseInt(loanPayment) || 0,
      insurance: parseInt(insurance) || 0,
      pension: parseInt(pension) || 0,
      savings: parseInt(savings) || 0,
      surplus: parseInt(surplus) || 0,
      livingExpense,
    };

    onComplete(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-green-50 to-amber-50">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10 px-5 py-4 flex items-center gap-3">
        <button 
          onClick={onBack}
          className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-800">수입/지출 입력</h1>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: '50%' }}></div>
          </div>
          <span className="text-xs text-gray-400 font-semibold">2/4</span>
        </div>
      </div>

      <div className="px-5 pb-32">
        {/* 안내 배너 */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 mb-4 flex items-start gap-3">
          <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
            💰
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-1">수입과 지출을 알려주세요 👆</h3>
            <p className="text-sm text-gray-600">정확한 예산 설계를 위해 월 기준 금액을 입력해주세요.</p>
          </div>
        </div>

        {/* 가족 구성 */}
        <div className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">👨‍👩‍👧</span>
            <span className="font-bold text-blue-600">가족 구성</span>
          </div>
          
          <div className="mb-4">
            <label className="text-sm font-semibold text-gray-700 mb-2 block">가족 수</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  onClick={() => setFamilySize(num)}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                    familySize === num
                      ? 'bg-blue-100 border-2 border-blue-500 text-blue-600'
                      : 'bg-gray-50 border-2 border-gray-200 text-gray-500'
                  }`}
                >
                  {num === 5 ? '5인+' : `${num}인`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-gray-700">월 수입</label>
              <span className="text-xs text-gray-400">세후 실수령액</span>
            </div>
            <div className="relative">
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-right text-gray-800 font-semibold pr-14 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">만원</span>
            </div>
          </div>
        </div>

        {/* 고정 지출 */}
        <div className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">⭐</span>
            <span className="font-bold text-blue-600">고정 지출</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-gray-700">대출 원리금</label>
                <span className="text-xs text-gray-400">주담대, 신용대출 등</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={loanPayment}
                  onChange={(e) => setLoanPayment(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-right text-gray-800 font-semibold pr-12 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">원</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-gray-700">보장성 보험</label>
                <span className="text-xs text-gray-400">실손, 종신 등</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={insurance}
                  onChange={(e) => setInsurance(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-right text-gray-800 font-semibold pr-12 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">원</span>
              </div>
            </div>
          </div>
        </div>

        {/* 저축/투자 */}
        <div className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">📈</span>
            <span className="font-bold text-blue-600">저축/투자</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-gray-700">노후 연금</label>
                <span className="text-xs text-gray-400">연금저축, IRP 등</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={pension}
                  onChange={(e) => setPension(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-right text-gray-800 font-semibold pr-12 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">원</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-gray-700">저축/투자</label>
                <span className="text-xs text-gray-400">적금, 펀드, ETF 등</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={savings}
                  onChange={(e) => setSavings(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-right text-gray-800 font-semibold pr-12 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">원</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-gray-700">잉여자금</label>
                <span className="text-xs text-gray-400">비상금, 여유자금</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={surplus}
                  onChange={(e) => setSurplus(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-right text-gray-800 font-semibold pr-12 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">원</span>
              </div>
            </div>
          </div>
        </div>

        {/* 생활비 자동 계산 */}
        <div className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🧮</span>
            <span className="font-bold text-green-600">생활비 (자동계산)</span>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-4">
            <p className="text-sm text-gray-600 mb-1">월 생활비</p>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-bold ${livingExpense >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {formatNumber(livingExpense)}
              </span>
              <span className="text-gray-500 font-semibold">원</span>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>월 수입</span>
              <span className="font-semibold">{formatNumber((parseInt(income) || 0) * 10000)}원</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>- 고정지출</span>
              <span className="font-semibold text-red-500">{formatNumber(fixedExpense)}원</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>- 저축투자</span>
              <span className="font-semibold text-red-500">{formatNumber(totalSavings)}원</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="font-bold text-gray-800">= 생활비</span>
              <span className={`font-bold ${livingExpense >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {formatNumber(livingExpense)}원
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm px-5 py-4 border-t border-gray-100">
        <button
          onClick={handleSubmit}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
        >
          📊 수입지출분석하기
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default IncomeExpenseInputPage;
