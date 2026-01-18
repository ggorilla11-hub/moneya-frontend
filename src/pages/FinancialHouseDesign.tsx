// src/pages/FinancialHouseDesign.tsx
// 3단계: 은퇴 + 부채 + 저축 구현 (나머지 4개는 플레이스홀더)

import { useState } from 'react';

// ============================================
// 인터페이스
// ============================================
interface FinancialHouseDesignProps {
  userName: string;
  onComplete: () => void;
  onBack: () => void;
}

interface CardProps {
  onNext: () => void;
  onPrev: () => void;
  isLast?: boolean;
}

// ============================================
// 탭 정의
// ============================================
const DESIGN_TABS = [
  { id: 'retire', name: '은퇴', icon: '🏖️' },
  { id: 'debt', name: '부채', icon: '💳' },
  { id: 'save', name: '저축', icon: '💰' },
  { id: 'invest', name: '투자', icon: '📈' },
  { id: 'tax', name: '세금', icon: '💸' },
  { id: 'estate', name: '부동산', icon: '🏠' },
  { id: 'insurance', name: '보험', icon: '🛡️' },
];

// ============================================
// 메인 컴포넌트
// ============================================
export default function FinancialHouseDesign({ userName: _userName, onComplete, onBack }: FinancialHouseDesignProps) {
  const [currentTab, setCurrentTab] = useState('retire');
  const [completedTabs, setCompletedTabs] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState('');

  const currentStep = DESIGN_TABS.findIndex(tab => tab.id === currentTab) + 1;

  const goToNextTab = () => {
    const currentIndex = DESIGN_TABS.findIndex(tab => tab.id === currentTab);
    if (currentIndex < DESIGN_TABS.length - 1) {
      setCompletedTabs([...completedTabs, currentTab]);
      setCurrentTab(DESIGN_TABS[currentIndex + 1].id);
    } else {
      setCompletedTabs([...completedTabs, currentTab]);
      onComplete();
    }
  };

  const goToPrevTab = () => {
    const currentIndex = DESIGN_TABS.findIndex(tab => tab.id === currentTab);
    if (currentIndex > 0) {
      setCurrentTab(DESIGN_TABS[currentIndex - 1].id);
    } else {
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button onClick={goToPrevTab} className="w-9 h-9 flex items-center justify-center bg-gray-100 rounded-lg text-lg">←</button>
        <h1 className="flex-1 text-lg font-bold">7개 재무설계</h1>
        <span className="text-xs text-gray-400 font-semibold bg-gray-100 px-2.5 py-1 rounded-xl">{currentStep}/7</span>
      </header>

      {/* 탭 네비게이션 */}
      <div className="bg-white border-b border-gray-200 px-3 py-2 flex gap-1.5 overflow-x-auto">
        {DESIGN_TABS.map((tab) => {
          const isActive = currentTab === tab.id;
          const isDone = completedTabs.includes(tab.id);
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex-shrink-0 px-3 py-2 rounded-full text-xs font-semibold flex items-center gap-1 border-2 transition-all ${
                isActive ? 'bg-teal-50 text-teal-700 border-teal-400' 
                : isDone ? 'bg-green-50 text-green-600 border-transparent'
                : 'bg-gray-100 text-gray-400 border-transparent'
              }`}
            >
              {tab.icon} {tab.name}
              {isDone && <span className="w-3.5 h-3.5 bg-green-500 rounded-full text-white text-[9px] flex items-center justify-center">✓</span>}
            </button>
          );
        })}
      </div>

      {/* 컨텐츠 영역 - 마이크버튼바 + 버튼 공간 확보 (pb-44) */}
      <div className="flex-1 overflow-y-auto p-4 pb-44">
        {currentTab === 'retire' && <RetirePlanCard onNext={goToNextTab} onPrev={goToPrevTab} />}
        {currentTab === 'debt' && <DebtPlanCard onNext={goToNextTab} onPrev={goToPrevTab} />}
        {currentTab === 'save' && <SavePlanCard onNext={goToNextTab} onPrev={goToPrevTab} />}
        {currentTab === 'invest' && <PlaceholderCard name="투자설계" onNext={goToNextTab} onPrev={goToPrevTab} />}
        {currentTab === 'tax' && <PlaceholderCard name="세금설계" onNext={goToNextTab} onPrev={goToPrevTab} />}
        {currentTab === 'estate' && <PlaceholderCard name="부동산설계" onNext={goToNextTab} onPrev={goToPrevTab} />}
        {currentTab === 'insurance' && <PlaceholderCard name="보험설계" onNext={goToNextTab} onPrev={goToPrevTab} isLast />}
      </div>

      {/* 마이크버튼바 - 네비바 위로 올림 */}
      <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 z-30">
        <div className="flex items-center gap-2">
          {/* + 버튼 */}
          <button className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center hover:bg-amber-500 transition-all">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </button>
          
          {/* 마이크 버튼 */}
          <button className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center hover:bg-amber-500 transition-all">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
            </svg>
          </button>
          
          {/* 입력창 */}
          <div className="flex-1 flex items-center bg-gray-100 border border-gray-200 rounded-full px-4 py-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="지출 전에 물어보세요..."
              className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
            />
          </div>
          
          {/* 전송 버튼 */}
          <button className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-all">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 1. 은퇴설계 카드 (입력 필드 수정)
// ============================================
function RetirePlanCard({ onNext, onPrev }: CardProps) {
  const [formData, setFormData] = useState({
    currentAge: 37,
    retireAge: 65,
    lifeExpectancy: 90,
    monthlyExpense: 300,
    nationalPension: 80,
    personalPension: 50,
  });

  const yearsToRetire = formData.retireAge - formData.currentAge;
  const retirementYears = formData.lifeExpectancy - formData.retireAge;
  const totalNeeded = formData.monthlyExpense * 12 * retirementYears / 10000;
  const totalPension = (formData.nationalPension + formData.personalPension) * 12 * retirementYears / 10000;
  const gap = totalNeeded - totalPension;
  const monthlyRequired = gap > 0 ? Math.round((gap * 10000) / yearsToRetire / 12) : 0;

  // 입력 필드 포커스 시 전체 선택
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">👨‍🏫</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>이제 본격적인 <span className="text-teal-600 font-bold">재무설계</span>를 시작합니다! 첫 번째는 <span className="text-teal-600 font-bold">은퇴설계</span>예요.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 space-y-3 shadow-sm">
        <h3 className="text-base font-bold text-gray-800 mb-3">은퇴 정보 입력</h3>
        
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">현재 나이</label>
          <input 
            type="number" 
            value={formData.currentAge} 
            onChange={(e) => setFormData({...formData, currentAge: Number(e.target.value)})} 
            onFocus={handleFocus}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">은퇴 예정 나이</label>
          <input 
            type="number" 
            value={formData.retireAge} 
            onChange={(e) => setFormData({...formData, retireAge: Number(e.target.value)})} 
            onFocus={handleFocus}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">예상 수명</label>
          <input 
            type="number" 
            value={formData.lifeExpectancy} 
            onChange={(e) => setFormData({...formData, lifeExpectancy: Number(e.target.value)})} 
            onFocus={handleFocus}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">월 생활비 (만원)</label>
          <input 
            type="number" 
            value={formData.monthlyExpense} 
            onChange={(e) => setFormData({...formData, monthlyExpense: Number(e.target.value)})} 
            onFocus={handleFocus}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">예상 국민연금 (만원)</label>
          <input 
            type="number" 
            value={formData.nationalPension} 
            onChange={(e) => setFormData({...formData, nationalPension: Number(e.target.value)})} 
            onFocus={handleFocus}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">예상 개인연금 (만원)</label>
          <input 
            type="number" 
            value={formData.personalPension} 
            onChange={(e) => setFormData({...formData, personalPension: Number(e.target.value)})} 
            onFocus={handleFocus}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
          />
        </div>
      </div>

      <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-4 space-y-2">
        <h3 className="text-sm font-bold text-teal-800 mb-2">은퇴자금 분석 결과</h3>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-700">은퇴까지 남은 기간</span>
          <span className="font-bold text-teal-700">{yearsToRetire}년</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-700">은퇴 후 기간</span>
          <span className="font-bold text-teal-700">{retirementYears}년</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-700">필요 총액</span>
          <span className="font-bold text-teal-700">{totalNeeded.toFixed(1)}억원</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-700">연금 총액</span>
          <span className="font-bold text-teal-700">{totalPension.toFixed(1)}억원</span>
        </div>

        <div className="flex justify-between text-sm pt-2 border-t border-teal-200">
          <span className="text-gray-700 font-bold">추가 필요 금액</span>
          <span className="font-bold text-red-600">{gap > 0 ? `${gap.toFixed(1)}억원` : '충분함'}</span>
        </div>

        {gap > 0 && (
          <div className="bg-white rounded-lg p-2 mt-2">
            <p className="text-xs text-gray-600">지금부터 매월 <span className="font-bold text-teal-600">{monthlyRequired.toLocaleString()}만원</span>씩 저축하세요!</p>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <button onClick={onPrev} className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm">← 이전</button>
        <button onClick={onNext} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold text-sm">다음 →</button>
      </div>
    </div>
  );
}

// ============================================
// 2. 부채설계 카드 (입력 필드 수정)
// ============================================
function DebtPlanCard({ onNext, onPrev }: CardProps) {
  const [formData, setFormData] = useState({
    monthlyIncome: 500,
    mortgageBalance: 30000,
    mortgageRate: 3.5,
    mortgageMonthly: 150,
    creditBalance: 1000,
    creditRate: 5.5,
    creditMonthly: 50,
  });

  const totalMonthlyPayment = formData.mortgageMonthly + formData.creditMonthly;
  const dsr = formData.monthlyIncome > 0 ? (totalMonthlyPayment / formData.monthlyIncome * 100) : 0;
  const totalDebt = formData.mortgageBalance + formData.creditBalance;

  let dsrLevel = '';
  let dsrColor = '';
  let dsrMessage = '';
  
  if (dsr < 40) {
    dsrLevel = '안전';
    dsrColor = 'text-green-600';
    dsrMessage = '부채 관리가 양호합니다!';
  } else if (dsr < 50) {
    dsrLevel = '주의';
    dsrColor = 'text-yellow-600';
    dsrMessage = '부채 비율이 높습니다. 주의가 필요합니다.';
  } else {
    dsrLevel = '위험';
    dsrColor = 'text-red-600';
    dsrMessage = '부채 비율이 매우 높습니다. 상환 계획이 필요합니다!';
  }

  // 입력 필드 포커스 시 전체 선택
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">💳</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>두 번째는 <span className="text-teal-600 font-bold">부채설계</span>입니다. 현재 대출 상황을 입력해주세요.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 space-y-3 shadow-sm">
        <h3 className="text-base font-bold text-gray-800 mb-3">부채 정보 입력</h3>
        
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">월소득 (만원)</label>
          <input 
            type="number" 
            value={formData.monthlyIncome} 
            onChange={(e) => setFormData({...formData, monthlyIncome: Number(e.target.value)})} 
            onFocus={handleFocus}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
          />
        </div>

        <div className="border-t border-gray-200 pt-3 mt-3">
          <h4 className="text-sm font-bold text-gray-700 mb-2">담보대출</h4>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">잔액 (만원)</label>
            <input 
              type="number" 
              value={formData.mortgageBalance} 
              onChange={(e) => setFormData({...formData, mortgageBalance: Number(e.target.value)})} 
              onFocus={handleFocus}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
            />
          </div>

          <div className="space-y-2 mt-2">
            <label className="text-sm font-semibold text-gray-700">금리 (%)</label>
            <input 
              type="number" 
              step="0.1"
              value={formData.mortgageRate} 
              onChange={(e) => setFormData({...formData, mortgageRate: Number(e.target.value)})} 
              onFocus={handleFocus}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
            />
          </div>

          <div className="space-y-2 mt-2">
            <label className="text-sm font-semibold text-gray-700">월상환액 (만원)</label>
            <input 
              type="number" 
              value={formData.mortgageMonthly} 
              onChange={(e) => setFormData({...formData, mortgageMonthly: Number(e.target.value)})} 
              onFocus={handleFocus}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-3 mt-3">
          <h4 className="text-sm font-bold text-gray-700 mb-2">신용대출</h4>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">잔액 (만원)</label>
            <input 
              type="number" 
              value={formData.creditBalance} 
              onChange={(e) => setFormData({...formData, creditBalance: Number(e.target.value)})} 
              onFocus={handleFocus}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
            />
          </div>

          <div className="space-y-2 mt-2">
            <label className="text-sm font-semibold text-gray-700">금리 (%)</label>
            <input 
              type="number" 
              step="0.1"
              value={formData.creditRate} 
              onChange={(e) => setFormData({...formData, creditRate: Number(e.target.value)})} 
              onFocus={handleFocus}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
            />
          </div>

          <div className="space-y-2 mt-2">
            <label className="text-sm font-semibold text-gray-700">월상환액 (만원)</label>
            <input 
              type="number" 
              value={formData.creditMonthly} 
              onChange={(e) => setFormData({...formData, creditMonthly: Number(e.target.value)})} 
              onFocus={handleFocus}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
            />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 space-y-2">
        <h3 className="text-sm font-bold text-purple-800 mb-2">부채 분석 결과</h3>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-700">총 부채</span>
          <span className="font-bold text-purple-700">{(totalDebt / 10000).toFixed(1)}억원</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-700">월 총 상환액</span>
          <span className="font-bold text-purple-700">{totalMonthlyPayment.toLocaleString()}만원</span>
        </div>

        <div className="flex justify-between text-sm pt-2 border-t border-purple-200">
          <span className="text-gray-700 font-bold">DSR (부채상환비율)</span>
          <span className={`font-bold ${dsrColor}`}>{dsr.toFixed(1)}%</span>
        </div>

        <div className="bg-white rounded-lg p-3 mt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-700">상태 평가</span>
            <span className={`text-xs font-bold ${dsrColor}`}>{dsrLevel}</span>
          </div>
          <p className="text-xs text-gray-600">{dsrMessage}</p>
          {dsr >= 40 && (
            <p className="text-xs text-gray-600 mt-2">💡 고금리 대출부터 상환하는 것을 추천합니다!</p>
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button onClick={onPrev} className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm">← 이전</button>
        <button onClick={onNext} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold text-sm">다음 →</button>
      </div>
    </div>
  );
}

// ============================================
// 3. 저축설계 카드 (신규)
// ============================================
function SavePlanCard({ onNext, onPrev }: CardProps) {
  const [formData, setFormData] = useState({
    monthlyIncome: 500,
    monthlySaving: 100,
    targetRate: 20,
  });

  const currentRate = formData.monthlyIncome > 0 ? (formData.monthlySaving / formData.monthlyIncome * 100) : 0;
  const yearlyAmount = formData.monthlySaving * 12;
  const fiveYearAmount = yearlyAmount * 5 / 10000;

  let rateLevel = '';
  let rateColor = '';
  let rateMessage = '';
  
  if (currentRate >= 30) {
    rateLevel = '우수';
    rateColor = 'text-green-600';
    rateMessage = '훌륭한 저축 습관입니다!';
  } else if (currentRate >= 20) {
    rateLevel = '양호';
    rateColor = 'text-blue-600';
    rateMessage = '좋은 저축률을 유지하고 있습니다.';
  } else if (currentRate >= 10) {
    rateLevel = '보통';
    rateColor = 'text-yellow-600';
    rateMessage = '조금 더 저축을 늘려보세요.';
  } else {
    rateLevel = '개선 필요';
    rateColor = 'text-red-600';
    rateMessage = '저축률을 높이는 것을 추천합니다!';
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">💰</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>세 번째는 <span className="text-teal-600 font-bold">저축설계</span>입니다. 현재 저축 상황을 입력해주세요.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 space-y-3 shadow-sm">
        <h3 className="text-base font-bold text-gray-800 mb-3">저축 정보 입력</h3>
        
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">월 소득 (만원)</label>
          <input type="number" value={formData.monthlyIncome} onChange={(e) => setFormData({...formData, monthlyIncome: Number(e.target.value)})} onFocus={handleFocus} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">월 저축액 (만원)</label>
          <input type="number" value={formData.monthlySaving} onChange={(e) => setFormData({...formData, monthlySaving: Number(e.target.value)})} onFocus={handleFocus} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">목표 저축률 (%)</label>
          <input type="number" value={formData.targetRate} onChange={(e) => setFormData({...formData, targetRate: Number(e.target.value)})} onFocus={handleFocus} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 space-y-2">
        <h3 className="text-sm font-bold text-blue-800 mb-2">저축 분석 결과</h3>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-700">현재 저축률</span>
          <span className={`font-bold ${rateColor}`}>{currentRate.toFixed(1)}%</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-700">연간 저축액</span>
          <span className="font-bold text-blue-700">{yearlyAmount.toLocaleString()}만원</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-700">5년 후 예상 금액</span>
          <span className="font-bold text-blue-700">{fiveYearAmount.toFixed(1)}억원</span>
        </div>

        <div className="flex justify-between text-sm pt-2 border-t border-blue-200">
          <span className="text-gray-700 font-bold">목표 저축률과의 차이</span>
          <span className={`font-bold ${currentRate >= formData.targetRate ? 'text-green-600' : 'text-red-600'}`}>
            {currentRate >= formData.targetRate ? '달성 ✓' : `${(formData.targetRate - currentRate).toFixed(1)}% 부족`}
          </span>
        </div>

        <div className="bg-white rounded-lg p-3 mt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-700">저축 평가</span>
            <span className={`text-xs font-bold ${rateColor}`}>{rateLevel}</span>
          </div>
          <p className="text-xs text-gray-600">{rateMessage}</p>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button onClick={onPrev} className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm">← 이전</button>
        <button onClick={onNext} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold text-sm">다음 →</button>
      </div>
    </div>
  );
}

// ============================================
// 플레이스홀더 (나머지 4개)
// ============================================
function PlaceholderCard({ name, onNext, onPrev, isLast }: CardProps & { name: string }) {
  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl p-8 text-center">
        <p className="text-gray-400 text-sm">{name}는 다음 단계에서 개발됩니다</p>
      </div>
      <div className="flex gap-2">
        <button onClick={onPrev} className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm">← 이전</button>
        <button onClick={onNext} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold text-sm">
          {isLast ? '금융집 완성 🎉' : '다음 →'}
        </button>
      </div>
    </div>
  );
}
