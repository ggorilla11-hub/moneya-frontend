import type { IncomeExpenseData } from './IncomeExpenseInputPage';
import { BUDGET_RATIOS } from './IncomeExpenseInputPage';

interface IncomeExpenseResultPageProps {
  data: IncomeExpenseData;
  onBack: () => void;
  onNext: () => void;
}

interface DiagnosisItem {
  icon: string;
  name: string;
  current: number;
  ratioPercent: number;
  budget: number;
  status: 'good' | 'proper' | 'lack' | 'excess' | 'none';
  statusText: string;
}

function IncomeExpenseResultPage({ data, onBack, onNext }: IncomeExpenseResultPageProps) {
  const { familySize, income, loanPayment, insurance, pension, savings, surplus, livingExpense } = data;

  // 가족수에 맞는 예산 비율 가져오기
  const ratios = BUDGET_RATIOS[familySize] || BUDGET_RATIOS[2];

  // 예산 금액 계산
  const budgetLiving = Math.round(income * ratios.living / 100);
  const budgetSavings = Math.round(income * ratios.savings / 100);
  const budgetPension = Math.round(income * ratios.pension / 100);
  const budgetInsurance = Math.round(income * ratios.insurance / 100);
  const budgetLoan = Math.round(income * ratios.loan / 100);

  // 진단 함수
  const getDiagnosis = (
    itemType: 'living' | 'savings' | 'pension' | 'insurance' | 'loan',
    current: number,
    budget: number
  ): { status: 'good' | 'proper' | 'lack' | 'excess'; statusText: string } => {
    if (current === budget) {
      return { status: 'proper', statusText: '적정' };
    }

    switch (itemType) {
      case 'living':
        // 생활비: 현재 > 예산 = 초과, 현재 < 예산 = 양호
        return current > budget
          ? { status: 'excess', statusText: '초과' }
          : { status: 'good', statusText: '양호' };

      case 'savings':
      case 'pension':
        // 저축투자, 노후연금: 현재 > 예산 = 양호, 현재 < 예산 = 부족
        return current > budget
          ? { status: 'good', statusText: '양호' }
          : { status: 'lack', statusText: '부족' };

      case 'insurance':
        // 보장성보험: 현재 > 예산 = 초과, 현재 < 예산 = 부족
        return current > budget
          ? { status: 'excess', statusText: '초과' }
          : { status: 'lack', statusText: '부족' };

      case 'loan':
        // 대출원리금: 현재 > 예산 = 초과, 현재 < 예산 = 양호
        return current > budget
          ? { status: 'excess', statusText: '초과' }
          : { status: 'good', statusText: '양호' };

      default:
        return { status: 'proper', statusText: '적정' };
    }
  };

  // 각 항목 진단 결과
  const livingDiagnosis = getDiagnosis('living', livingExpense, budgetLiving);
  const savingsDiagnosis = getDiagnosis('savings', savings, budgetSavings);
  const pensionDiagnosis = getDiagnosis('pension', pension, budgetPension);
  const insuranceDiagnosis = getDiagnosis('insurance', insurance, budgetInsurance);
  const loanDiagnosis = getDiagnosis('loan', loanPayment, budgetLoan);

  // 진단 항목 배열
  const diagnosisItems: DiagnosisItem[] = [
    {
      icon: '🏠',
      name: '생활비',
      current: livingExpense,
      ratioPercent: ratios.living,
      budget: budgetLiving,
      ...livingDiagnosis,
    },
    {
      icon: '💰',
      name: '저축투자',
      current: savings,
      ratioPercent: ratios.savings,
      budget: budgetSavings,
      ...savingsDiagnosis,
    },
    {
      icon: '🏦',
      name: '노후연금',
      current: pension,
      ratioPercent: ratios.pension,
      budget: budgetPension,
      ...pensionDiagnosis,
    },
    {
      icon: '🛡️',
      name: '보장보험',
      current: insurance,
      ratioPercent: ratios.insurance,
      budget: budgetInsurance,
      ...insuranceDiagnosis,
    },
    {
      icon: '💳',
      name: '대출원리금',
      current: loanPayment,
      ratioPercent: ratios.loan,
      budget: budgetLoan,
      ...loanDiagnosis,
    },
    {
      icon: '💵',
      name: '잉여자금',
      current: surplus,
      ratioPercent: 0,
      budget: 0,
      status: 'none',
      statusText: '-',
    },
  ];

  // 핵심 진단 요약 생성
  const getSummaryItems = () => {
    const items: { icon: string; color: string; text: string }[] = [];

    // 초과 항목
    const excessItems = diagnosisItems.filter(item => item.status === 'excess');
    excessItems.forEach(item => {
      const diff = Math.abs(item.current - item.budget);
      items.push({
        icon: '🚨',
        color: 'red',
        text: `<strong>${item.name} 초과</strong> - 기준 대비 ${formatNumber(diff)}원 초과`,
      });
    });

    // 부족 항목
    const lackItems = diagnosisItems.filter(item => item.status === 'lack');
    lackItems.forEach(item => {
      const diff = Math.abs(item.current - item.budget);
      items.push({
        icon: '⚠️',
        color: 'amber',
        text: `<strong>${item.name} 부족</strong> - 권장 대비 ${formatNumber(diff)}원 부족`,
      });
    });

    // 양호/적정 항목
    const goodItems = diagnosisItems.filter(item => item.status === 'good' || item.status === 'proper');
    if (goodItems.length > 0) {
      const goodNames = goodItems.map(item => item.name).join(', ');
      items.push({
        icon: '✅',
        color: 'green',
        text: `<strong>${goodNames}</strong> - 적정 수준 유지 중`,
      });
    }

    return items;
  };

  const summaryItems = getSummaryItems();

  const formatNumber = (num: number) => {
    return Math.abs(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const formatMan = (num: number) => {
    const man = Math.round(num / 10000);
    return `${man}만`;
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'good':
      case 'proper':
        return 'bg-green-50 text-green-600';
      case 'lack':
        return 'bg-amber-50 text-amber-600';
      case 'excess':
        return 'bg-red-50 text-red-600';
      default:
        return 'bg-gray-50 text-gray-400';
    }
  };

  const getSummaryIconStyle = (color: string) => {
    switch (color) {
      case 'red':
        return 'bg-red-50';
      case 'amber':
        return 'bg-amber-50';
      case 'green':
        return 'bg-green-50';
      default:
        return 'bg-gray-50';
    }
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
        <h1 className="text-lg font-bold text-gray-800">📊 진단 결과</h1>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: '75%' }}></div>
          </div>
          <span className="text-xs text-gray-400 font-semibold">3/4</span>
        </div>
      </div>

      <div className="px-5 pb-32">
        {/* 분석표 카드 */}
        <div className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
          {/* 카드 헤더 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-xl">📋</span>
              </div>
              <h2 className="font-bold text-gray-800">수입지출 분석표</h2>
            </div>
            <div className="bg-blue-600 text-white px-4 py-2 rounded-full font-bold">
              {formatMan(income)}원
            </div>
          </div>

          {/* 테이블 헤더 */}
          <div className="grid grid-cols-5 gap-2 py-3 border-b-2 border-gray-200 mb-2">
            <span className="text-xs font-bold text-gray-400">항목</span>
            <span className="text-xs font-bold text-gray-400 text-center">현재</span>
            <span className="text-xs font-bold text-gray-400 text-center">기준</span>
            <span className="text-xs font-bold text-gray-400 text-center">예산</span>
            <span className="text-xs font-bold text-gray-400 text-center">진단</span>
          </div>

          {/* 테이블 rows */}
          {diagnosisItems.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-5 gap-2 py-3 border-b border-gray-100 items-center"
            >
              <div className="flex flex-col">
                <span className="text-lg">{item.icon}</span>
                <span className="text-xs font-semibold text-gray-700">{item.name}</span>
              </div>
              <span className="text-sm font-bold text-gray-800 text-center">
                {formatMan(item.current)}
              </span>
              <span className="text-sm font-semibold text-gray-500 text-center">
                {item.status === 'none' ? '-' : `${item.ratioPercent}%`}
              </span>
              <span className="text-sm font-bold text-gray-800 text-center">
                {item.status === 'none' ? '-' : formatMan(item.budget)}
              </span>
              <span
                className={`text-xs font-bold py-1 px-2 rounded-lg text-center ${getStatusStyle(item.status)}`}
              >
                {item.statusText}
              </span>
            </div>
          ))}

          {/* 합계 */}
          <div className="flex justify-between items-center mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
            <span className="font-bold text-blue-600">합계</span>
            <span className="text-lg font-bold text-blue-600">100%</span>
          </div>

          {/* 출처 */}
          <p className="text-center text-xs text-gray-400 mt-4">
            출처: 한국FPSB, 오원트금융연구소<br />
            ({familySize}인 가구 기준)
          </p>
        </div>

        {/* 핵심 진단 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">🔍 핵심 진단</h3>
          <div className="space-y-3">
            {summaryItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getSummaryIconStyle(item.color)}`}>
                  <span>{item.icon}</span>
                </div>
                <p
                  className="text-sm text-gray-600 flex-1"
                  dangerouslySetInnerHTML={{ __html: item.text }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm px-5 py-4 border-t border-gray-100">
        <button
          onClick={onNext}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
        >
          예산 조정하기
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default IncomeExpenseResultPage;
