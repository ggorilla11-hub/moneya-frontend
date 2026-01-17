import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 7개 재무설계 탭 데이터
const DESIGN_TABS = [
  { id: 'retire', name: '은퇴', icon: '🏖️', step: 1 },
  { id: 'debt', name: '부채', icon: '💳', step: 2 },
  { id: 'save', name: '저축', icon: '💰', step: 3 },
  { id: 'invest', name: '투자', icon: '📈', step: 4 },
  { id: 'tax', name: '세금', icon: '💸', step: 5 },
  { id: 'estate', name: '부동산', icon: '🏠', step: 6 },
  { id: 'insurance', name: '보험', icon: '🛡️', step: 7 },
];

export default function FinancialHouseDesign() {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState('retire');
  const [completedTabs, setCompletedTabs] = useState<string[]>([]);

  // 탭 완료 처리
  const handleComplete = (tabId: string) => {
    if (!completedTabs.includes(tabId)) {
      setCompletedTabs([...completedTabs, tabId]);
    }
  };

  // 다음 탭으로 이동
  const goToNextTab = () => {
    const currentIndex = DESIGN_TABS.findIndex(t => t.id === currentTab);
    if (currentIndex < DESIGN_TABS.length - 1) {
      handleComplete(currentTab);
      setCurrentTab(DESIGN_TABS[currentIndex + 1].id);
    } else {
      // 마지막 탭이면 결과 화면으로
      handleComplete(currentTab);
      navigate('/financial-house/result');
    }
  };

  // 이전 탭으로 이동
  const goToPrevTab = () => {
    const currentIndex = DESIGN_TABS.findIndex(t => t.id === currentTab);
    if (currentIndex > 0) {
      setCurrentTab(DESIGN_TABS[currentIndex - 1].id);
    } else {
      navigate('/financial-house/basic');
    }
  };

  const currentStep = DESIGN_TABS.find(t => t.id === currentTab)?.step || 1;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button 
          onClick={goToPrevTab}
          className="w-9 h-9 flex items-center justify-center bg-gray-100 rounded-lg text-lg"
        >
          ←
        </button>
        <h1 className="flex-1 text-lg font-bold">7개 재무설계</h1>
        <span className="text-xs text-gray-400 font-semibold bg-gray-100 px-2.5 py-1 rounded-xl">
          {currentStep}/7
        </span>
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
              className={`flex-shrink-0 px-3 py-2 rounded-full text-xs font-semibold flex items-center gap-1 border-2 transition-all
                ${isActive 
                  ? 'bg-teal-50 text-teal-700 border-teal-400' 
                  : isDone 
                    ? 'bg-green-50 text-green-600 border-transparent'
                    : 'bg-gray-100 text-gray-400 border-transparent'
                }`}
            >
              {tab.icon} {tab.name}
              {isDone && <span className="w-3.5 h-3.5 bg-green-500 rounded-full text-white text-[9px] flex items-center justify-center">✓</span>}
            </button>
          );
        })}
      </div>

      {/* 컨텐츠 영역 */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* 은퇴설계 */}
        {currentTab === 'retire' && (
          <RetireDesignCard onNext={goToNextTab} onPrev={goToPrevTab} />
        )}
        
        {/* 부채설계 */}
        {currentTab === 'debt' && (
          <DebtDesignCard onNext={goToNextTab} onPrev={goToPrevTab} />
        )}
        
        {/* 저축설계 */}
        {currentTab === 'save' && (
          <SaveDesignCard onNext={goToNextTab} onPrev={goToPrevTab} />
        )}
        
        {/* 투자설계 */}
        {currentTab === 'invest' && (
          <InvestDesignCard onNext={goToNextTab} onPrev={goToPrevTab} />
        )}
        
        {/* 세금설계 */}
        {currentTab === 'tax' && (
          <TaxDesignCard onNext={goToNextTab} onPrev={goToPrevTab} />
        )}
        
        {/* 부동산설계 */}
        {currentTab === 'estate' && (
          <EstateDesignCard onNext={goToNextTab} onPrev={goToPrevTab} />
        )}
        
        {/* 보험설계 */}
        {currentTab === 'insurance' && (
          <InsuranceDesignCard onNext={goToNextTab} onPrev={goToPrevTab} isLast={true} />
        )}
      </div>

      {/* 하단 입력바 */}
      <div className="bg-white border-t border-gray-200 p-3 flex items-center gap-2">
        <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-base">📋</button>
        <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-base">📎</button>
        <input 
          type="text" 
          placeholder="메시지를 입력하세요..." 
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-teal-400"
        />
        <button className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-white flex items-center justify-center text-base">🎤</button>
        <button className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center text-base">➤</button>
      </div>

      {/* 하단 네비게이션 */}
      <nav className="bg-white border-t border-gray-200 flex py-2 pb-6">
        <NavItem icon="🏠" label="홈" />
        <NavItem icon="💳" label="AI지출" />
        <NavItem icon="🏛️" label="금융집짓기" active />
        <NavItem icon="👤" label="마이페이지" />
      </nav>
    </div>
  );
}

// 네비게이션 아이템
function NavItem({ icon, label, active = false }: { icon: string; label: string; active?: boolean }) {
  return (
    <div className="flex-1 flex flex-col items-center gap-1 py-2">
      <span className={`text-xl ${active ? 'opacity-100' : 'opacity-50'}`}>{icon}</span>
      <span className={`text-[10px] font-medium ${active ? 'text-teal-500 font-bold' : 'text-gray-400'}`}>{label}</span>
    </div>
  );
}

// ============================================
// 1. 은퇴설계 카드
// ============================================
function RetireDesignCard({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const [formData, setFormData] = useState({
    currentAge: 37,
    retireAge: 65,
    lifeExpectancy: 90,
    monthlyExpense: 300,
    nationalPension: 80,
    privatePension: 50,
  });

  // 계산 결과
  const yearsToRetire = formData.retireAge - formData.currentAge;
  const retirementYears = formData.lifeExpectancy - formData.retireAge;
  const totalNeeded = formData.monthlyExpense * 12 * retirementYears / 10000; // 억원
  const totalPension = (formData.nationalPension + formData.privatePension) * 12 * retirementYears / 10000;
  const gap = totalNeeded - totalPension;
  const monthlyRequired = gap > 0 ? Math.round((gap * 10000) / yearsToRetire / 12) : 0;

  return (
    <div className="space-y-3">
      {/* AI 메시지 */}
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">
          👨‍🏫
        </div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>이제 본격적인 <span className="text-teal-600 font-bold">재무설계</span>를 시작합니다! 첫 번째는 <span className="text-teal-600 font-bold">은퇴설계</span>예요. 🏖️</p>
        </div>
      </div>

      {/* 폼 카드 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        {/* 카드 헤더 */}
        <div className="flex items-center gap-2.5 mb-3.5 pb-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-xl">🏖️</div>
          <div className="flex-1">
            <h3 className="text-[15px] font-bold">은퇴설계</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">노후 생활에 필요한 자금을 계산합니다</p>
          </div>
          <span className="text-[11px] text-teal-600 font-bold bg-teal-50 px-2 py-1 rounded-md">1/7</span>
        </div>

        {/* 입력 필드 */}
        <div className="space-y-3">
          <div className="flex gap-2.5">
            <InputField label="현재 나이" value={formData.currentAge} suffix="세" onChange={(v) => setFormData({...formData, currentAge: v})} />
            <InputField label="은퇴 예정 나이" value={formData.retireAge} suffix="세" onChange={(v) => setFormData({...formData, retireAge: v})} />
          </div>
          <div className="flex gap-2.5">
            <InputField label="기대 수명" value={formData.lifeExpectancy} suffix="세" onChange={(v) => setFormData({...formData, lifeExpectancy: v})} />
            <InputField label="노후 월생활비" value={formData.monthlyExpense} suffix="만원" onChange={(v) => setFormData({...formData, monthlyExpense: v})} />
          </div>
          <div className="flex gap-2.5">
            <InputField label="예상 국민연금 (월)" value={formData.nationalPension} suffix="만원" onChange={(v) => setFormData({...formData, nationalPension: v})} />
            <InputField label="예상 퇴직연금 (월)" value={formData.privatePension} suffix="만원" onChange={(v) => setFormData({...formData, privatePension: v})} />
          </div>
        </div>

        {/* 결과 카드 */}
        <div className="mt-3 bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-200/50 rounded-lg p-3.5">
          <div className="text-xs font-bold text-teal-600 mb-2.5 flex items-center gap-1.5">📊 은퇴설계 분석 결과</div>
          <ResultRow label="은퇴까지 남은 기간" value={`${yearsToRetire}년`} />
          <ResultRow label="노후 생활 기간" value={`${retirementYears}년`} />
          <ResultRow label="노후 총 필요자금" value={`${totalNeeded.toFixed(1)}억원`} highlight />
          <ResultRow label="연금 예상 수령액" value={`${totalPension.toFixed(1)}억원`} />
          <ResultRow label="추가 준비 필요" value={`${gap.toFixed(1)}억원`} danger={gap > 0} success={gap <= 0} isLast />
        </div>

        {/* 안내 박스 */}
        {gap > 0 && (
          <div className="mt-3 flex gap-2.5 p-3 bg-amber-50 rounded-lg">
            <span className="text-base">💡</span>
            <span className="text-xs text-amber-800 leading-relaxed">
              노후 자금 부족분 {gap.toFixed(1)}억원을 {yearsToRetire}년간 준비하려면 <b>월 약 {monthlyRequired}만원</b>의 추가 저축이 필요합니다.
            </span>
          </div>
        )}

        {/* 버튼 */}
        <div className="flex gap-2 mt-3.5 pt-3 border-t border-gray-100">
          <button onClick={onPrev} className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-lg text-sm font-bold">← 이전</button>
          <button onClick={onNext} className="flex-1 py-3 bg-gradient-to-r from-teal-400 to-teal-600 text-white rounded-lg text-sm font-bold">다음 →</button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 2. 부채설계 카드
// ============================================
function DebtDesignCard({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const [formData, setFormData] = useState({
    mortgageBalance: 35000,
    mortgageRate: 4.5,
    creditBalance: 5000,
    creditRate: 6.5,
    monthlyPayment: 150,
  });

  const totalDebt = formData.mortgageBalance + formData.creditBalance;
  const monthlyInterest = Math.round((formData.mortgageBalance * formData.mortgageRate / 100 / 12) + (formData.creditBalance * formData.creditRate / 100 / 12));
  const dsr = Math.round((formData.monthlyPayment / 520) * 100); // 가정: 월소득 520만원

  return (
    <div className="space-y-3">
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">👨‍🏫</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>두 번째는 <span className="text-teal-600 font-bold">부채설계</span>입니다. 대출 상환 전략을 세워볼게요! 💳</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2.5 mb-3.5 pb-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-xl">💳</div>
          <div className="flex-1">
            <h3 className="text-[15px] font-bold">부채설계</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">대출 상환 전략을 수립합니다</p>
          </div>
          <span className="text-[11px] text-teal-600 font-bold bg-teal-50 px-2 py-1 rounded-md">2/7</span>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2.5">
            <InputField label="담보대출 잔액" value={formData.mortgageBalance} suffix="만원" onChange={(v) => setFormData({...formData, mortgageBalance: v})} />
            <InputField label="담보대출 금리" value={formData.mortgageRate} suffix="%" onChange={(v) => setFormData({...formData, mortgageRate: v})} />
          </div>
          <div className="flex gap-2.5">
            <InputField label="신용대출 잔액" value={formData.creditBalance} suffix="만원" onChange={(v) => setFormData({...formData, creditBalance: v})} />
            <InputField label="신용대출 금리" value={formData.creditRate} suffix="%" onChange={(v) => setFormData({...formData, creditRate: v})} />
          </div>
          <InputField label="월 상환 가능 금액" value={formData.monthlyPayment} suffix="만원" onChange={(v) => setFormData({...formData, monthlyPayment: v})} />
        </div>

        <div className="mt-3 bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-200/50 rounded-lg p-3.5">
          <div className="text-xs font-bold text-teal-600 mb-2.5 flex items-center gap-1.5">📊 부채 분석 결과</div>
          <ResultRow label="총 부채" value={`${(totalDebt/10000).toFixed(1)}억원`} danger />
          <ResultRow label="월 이자 비용" value={`약 ${monthlyInterest}만원`} />
          <ResultRow label="DSR (총부채원리금상환비율)" value={`${dsr}%`} warning={dsr > 30} />
          <ResultRow label="예상 상환 완료" value="약 28년" highlight isLast />
        </div>

        <div className="mt-3 flex gap-2.5 p-3 bg-blue-50 rounded-lg">
          <span className="text-base">💡</span>
          <span className="text-xs text-blue-800 leading-relaxed">
            <b>AI 추천:</b> 금리가 높은 신용대출({formData.creditRate}%)을 먼저 상환하는 것이 유리합니다. {formData.creditBalance}만원 상환 시 연 {Math.round(formData.creditBalance * formData.creditRate / 100)}만원 이자 절감!
          </span>
        </div>

        <div className="flex gap-2 mt-3.5 pt-3 border-t border-gray-100">
          <button onClick={onPrev} className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-lg text-sm font-bold">← 이전</button>
          <button onClick={onNext} className="flex-1 py-3 bg-gradient-to-r from-teal-400 to-teal-600 text-white rounded-lg text-sm font-bold">다음 →</button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 3. 저축설계 카드
// ============================================
function SaveDesignCard({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const [formData, setFormData] = useState({
    monthlySavings: 130,
    savingsRate: 25,
  });
  const [selectedGoals, setSelectedGoals] = useState(['house', 'education', 'retirement']);

  const goals = [
    { id: 'house', label: '🏠 내집마련' },
    { id: 'education', label: '👶 자녀교육' },
    { id: 'car', label: '🚗 자동차' },
    { id: 'retirement', label: '🏖️ 노후준비' },
  ];

  const toggleGoal = (id: string) => {
    if (selectedGoals.includes(id)) {
      setSelectedGoals(selectedGoals.filter(g => g !== id));
    } else {
      setSelectedGoals([...selectedGoals, id]);
    }
  };

  const yearlySavings = formData.monthlySavings * 12;
  const fiveYearSavings = Math.round(yearlySavings * 5 * 1.03); // 연 3% 이자 가정

  return (
    <div className="space-y-3">
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">👨‍🏫</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>세 번째는 <span className="text-teal-600 font-bold">저축설계</span>입니다. 목적별 저축 계획을 세워볼게요! 💰</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2.5 mb-3.5 pb-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center text-xl">💰</div>
          <div className="flex-1">
            <h3 className="text-[15px] font-bold">저축설계</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">목적별 저축 계획을 수립합니다</p>
          </div>
          <span className="text-[11px] text-teal-600 font-bold bg-teal-50 px-2 py-1 rounded-md">3/7</span>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2.5">
            <InputField label="현재 월 저축액" value={formData.monthlySavings} suffix="만원" onChange={(v) => setFormData({...formData, monthlySavings: v})} />
            <InputField label="저축률" value={formData.savingsRate} suffix="%" onChange={(v) => setFormData({...formData, savingsRate: v})} />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">저축 목적 (복수 선택)</label>
            <div className="flex flex-wrap gap-2">
              {goals.map(goal => (
                <button
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className={`flex-1 min-w-[calc(50%-4px)] py-2.5 px-3 border rounded-lg text-xs font-medium text-center transition-all
                    ${selectedGoals.includes(goal.id) 
                      ? 'border-teal-400 bg-teal-50 text-teal-700 font-bold' 
                      : 'border-gray-200 bg-white text-gray-500'}`}
                >
                  {goal.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-200/50 rounded-lg p-3.5">
          <div className="text-xs font-bold text-teal-600 mb-2.5 flex items-center gap-1.5">📊 저축 분석 결과</div>
          <ResultRow label="현재 저축률" value={`${formData.savingsRate}%`} highlight />
          <ResultRow label="권장 저축률" value="30% 이상" />
          <ResultRow label="연간 저축 예상" value={`${yearlySavings.toLocaleString()}만원`} />
          <ResultRow label="5년 후 예상 저축액" value={`약 ${(fiveYearSavings/10000).toFixed(1)}억원`} highlight isLast />
        </div>

        <div className="mt-3 flex gap-2.5 p-3 bg-blue-50 rounded-lg">
          <span className="text-base">💡</span>
          <span className="text-xs text-blue-800 leading-relaxed">
            <b>AI 추천:</b> 저축률을 30%로 올리면 5년 후 약 1억원 달성 가능! 월 26만원 추가 저축을 권장합니다.
          </span>
        </div>

        <div className="flex gap-2 mt-3.5 pt-3 border-t border-gray-100">
          <button onClick={onPrev} className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-lg text-sm font-bold">← 이전</button>
          <button onClick={onNext} className="flex-1 py-3 bg-gradient-to-r from-teal-400 to-teal-600 text-white rounded-lg text-sm font-bold">다음 →</button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 4. 투자설계 카드
// ============================================
function InvestDesignCard({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  // 부자지수 계산 (순자산 / (나이 × 연소득) × 100)
  const netAsset = 25000; // 2.5억
  const age = 37;
  const annualIncome = 6240; // 만원
  const richIndex = Math.round((netAsset / (age * annualIncome / 10)) * 100);
  
  const emergencyFund = 1000;
  const recommendedEmergency = 520 * 3; // 월소득 × 3

  return (
    <div className="space-y-3">
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">👨‍🏫</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>네 번째는 <span className="text-teal-600 font-bold">투자설계</span>입니다. 부자지수와 자산배분 전략을 확인해볼게요! 📈</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2.5 mb-3.5 pb-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-xl">📈</div>
          <div className="flex-1">
            <h3 className="text-[15px] font-bold">투자설계</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">부자지수 및 자산배분 전략</p>
          </div>
          <span className="text-[11px] text-teal-600 font-bold bg-teal-50 px-2 py-1 rounded-md">4/7</span>
        </div>

        {/* 부자지수 분석 */}
        <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-200/50 rounded-lg p-3.5">
          <div className="text-xs font-bold text-teal-600 mb-2.5 flex items-center gap-1.5">🏆 부자지수 분석</div>
          <ResultRow label="순자산" value="2.5억원" />
          <ResultRow label="나이 × 연소득" value={`${age} × ${(annualIncome/100).toFixed(0)}백만원`} />
          <ResultRow label="부자지수" value={`${richIndex}%`} highlight large />
          <ResultRow label="등급" value="🏠 3단계 (100%↑)" success isLast />
        </div>

        {/* 부자지수 등급 안내 */}
        <div className="mt-3 flex gap-2.5 p-3 bg-blue-50 rounded-lg">
          <span className="text-base">📊</span>
          <span className="text-xs text-blue-800 leading-relaxed">
            <b>부자지수 등급:</b> 텐트(0%↓) → 2단계(50%↓) → 3단계(100%↓) → 4단계(200%↓) → 궁전(200%↑)
          </span>
        </div>

        {/* 자산배분 포트폴리오 */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-gray-500 mb-2">💼 권장 자산배분 포트폴리오 (예시)</label>
          <div className="flex gap-1.5 h-6">
            <div className="flex-[2] bg-blue-400 rounded flex items-center justify-center text-[10px] font-bold text-white">20%</div>
            <div className="flex-[5] bg-green-400 rounded flex items-center justify-center text-[10px] font-bold text-white">50%</div>
            <div className="flex-[2] bg-yellow-400 rounded flex items-center justify-center text-[10px] font-bold text-white">20%</div>
            <div className="flex-[1] bg-red-400 rounded flex items-center justify-center text-[10px] font-bold text-white">10%</div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <LegendItem color="bg-blue-400" label="유동 20%" />
            <LegendItem color="bg-green-400" label="안전 50%" />
            <LegendItem color="bg-yellow-400" label="수익 20%" />
            <LegendItem color="bg-red-400" label="고수익 10%" />
          </div>
        </div>

        {/* 비상예비자금 */}
        <div className="mt-3 bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-200/50 rounded-lg p-3.5">
          <div className="text-xs font-bold text-teal-600 mb-2.5 flex items-center gap-1.5">🆘 비상예비자금 체크</div>
          <ResultRow label="현재 비상예비자금" value={`${emergencyFund.toLocaleString()}만원`} />
          <ResultRow label="권장 (소득×3~6배)" value={`${recommendedEmergency.toLocaleString()}~${(recommendedEmergency*2).toLocaleString()}만원`} />
          <ResultRow label="상태" value="⚠️ 부족" warning isLast />
        </div>

        <p className="mt-3 text-[10px] text-gray-400 text-center bg-gray-50 p-2 rounded">
          ※ 위 자산배분은 참고용 예시이며, 실제 투자는 본인의 판단과 책임하에 진행하세요.
        </p>

        <div className="flex gap-2 mt-3.5 pt-3 border-t border-gray-100">
          <button onClick={onPrev} className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-lg text-sm font-bold">← 이전</button>
          <button onClick={onNext} className="flex-1 py-3 bg-gradient-to-r from-teal-400 to-teal-600 text-white rounded-lg text-sm font-bold">다음 →</button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 5. 세금설계 카드
// ============================================
function TaxDesignCard({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">👨‍🏫</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>다섯 번째는 <span className="text-teal-600 font-bold">세금설계</span>입니다. 원천징수영수증을 분석해 볼게요! 💸</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2.5 mb-3.5 pb-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-xl">💸</div>
          <div className="flex-1">
            <h3 className="text-[15px] font-bold">세금설계</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">연말정산 및 세금 최적화</p>
          </div>
          <span className="text-[11px] text-teal-600 font-bold bg-teal-50 px-2 py-1 rounded-md">5/7</span>
        </div>

        {/* 파일 업로드 */}
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-all">
          <div className="text-3xl mb-2">📄</div>
          <div className="text-sm text-gray-500">원천징수영수증 업로드</div>
          <div className="text-[11px] text-gray-400 mt-1">PDF, JPG, PNG (최대 10MB)</div>
        </div>

        {/* 세금 분석 결과 */}
        <div className="mt-4 bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-200/50 rounded-lg p-3.5">
          <div className="text-xs font-bold text-teal-600 mb-2.5 flex items-center gap-1.5">📊 세금 분석 결과 (예시)</div>
          <ResultRow label="총급여" value="6,240만원" />
          <ResultRow label="기납부세액" value="450만원" />
          <ResultRow label="결정세액" value="380만원" />
          <ResultRow label="환급/추가납부" value="+70만원 환급" success isLast />
        </div>

        {/* 연금저축 세액공제 */}
        <div className="mt-3 bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-200/50 rounded-lg p-3.5">
          <div className="text-xs font-bold text-teal-600 mb-2.5 flex items-center gap-1.5">💡 연금저축 세액공제 분석</div>
          <ResultRow label="현재 연금저축 납입" value="180만원/년" />
          <ResultRow label="최대 납입 한도" value="900만원/년" />
          <ResultRow label="세액공제율 (5,500만원↓)" value="15%" />
          <ResultRow label="추가 납입 시 절세 효과" value="최대 108만원" highlight isLast />
        </div>

        <div className="mt-3 flex gap-2.5 p-3 bg-blue-50 rounded-lg">
          <span className="text-base">💡</span>
          <span className="text-xs text-blue-800 leading-relaxed">
            <b>AI 추천:</b> IRP+연금저축 최대 900만원 납입 시 연 최대 135만원 세액공제! 담당 세무대리인 상담을 권장합니다.
          </span>
        </div>

        <div className="flex gap-2 mt-3.5 pt-3 border-t border-gray-100">
          <button onClick={onPrev} className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-lg text-sm font-bold">← 이전</button>
          <button onClick={onNext} className="flex-1 py-3 bg-gradient-to-r from-teal-400 to-teal-600 text-white rounded-lg text-sm font-bold">다음 →</button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 6. 부동산설계 카드
// ============================================
function EstateDesignCard({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const [hasHouse, setHasHouse] = useState(true);

  return (
    <div className="space-y-3">
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">👨‍🏫</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>여섯 번째는 <span className="text-teal-600 font-bold">부동산설계</span>입니다. 주택 현황과 주택연금을 확인해볼게요! 🏠</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2.5 mb-3.5 pb-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center text-xl">🏠</div>
          <div className="flex-1">
            <h3 className="text-[15px] font-bold">부동산설계</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">부동산 현황 및 주택연금 분석</p>
          </div>
          <span className="text-[11px] text-teal-600 font-bold bg-teal-50 px-2 py-1 rounded-md">6/7</span>
        </div>

        {/* 주택 보유 여부 */}
        <div className="mb-3">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">주택 보유 여부</label>
          <div className="flex gap-2">
            <button
              onClick={() => setHasHouse(true)}
              className={`flex-1 py-2.5 px-3 border rounded-lg text-xs font-medium text-center transition-all
                ${hasHouse ? 'border-teal-400 bg-teal-50 text-teal-700 font-bold' : 'border-gray-200 bg-white text-gray-500'}`}
            >
              🏠 보유
            </button>
            <button
              onClick={() => setHasHouse(false)}
              className={`flex-1 py-2.5 px-3 border rounded-lg text-xs font-medium text-center transition-all
                ${!hasHouse ? 'border-teal-400 bg-teal-50 text-teal-700 font-bold' : 'border-gray-200 bg-white text-gray-500'}`}
            >
              ❌ 미보유
            </button>
          </div>
        </div>

        {/* 부동산 현황 */}
        <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-200/50 rounded-lg p-3.5">
          <div className="text-xs font-bold text-teal-600 mb-2.5 flex items-center gap-1.5">🏠 부동산 현황</div>
          <ResultRow label="거주용 부동산" value="4억원" />
          <ResultRow label="투자용 부동산" value="1억원" />
          <ResultRow label="총 부동산 자산" value="5억원" highlight isLast />
        </div>

        {/* 주택연금 예상 */}
        <div className="mt-3 bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-200/50 rounded-lg p-3.5">
          <div className="text-xs font-bold text-teal-600 mb-2.5 flex items-center gap-1.5">🏖️ 주택연금 예상 (참고)</div>
          <ResultRow label="가입 조건" value="만 55세 이상, 9억원 이하" />
          <ResultRow label="현재 상태" value="55세 미달 (현재 37세)" warning />
          <ResultRow label="65세 가입 시 예상 월수령" value="약 100만원" highlight isLast />
        </div>

        {/* Coming Soon */}
        <div className="mt-4 text-center py-5 bg-gray-50 rounded-lg">
          <div className="text-4xl mb-3">🚧</div>
          <div className="text-lg font-bold mb-1">Coming Soon</div>
          <div className="text-sm text-gray-500">부동산 심층 분석 기능은<br/>추후 업데이트 예정입니다.</div>
        </div>

        <div className="flex gap-2 mt-3.5 pt-3 border-t border-gray-100">
          <button onClick={onPrev} className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-lg text-sm font-bold">← 이전</button>
          <button onClick={onNext} className="flex-1 py-3 bg-gradient-to-r from-teal-400 to-teal-600 text-white rounded-lg text-sm font-bold">다음 →</button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 7. 보험설계 카드
// ============================================
function InsuranceDesignCard({ onNext, onPrev, isLast }: { onNext: () => void; onPrev: () => void; isLast?: boolean }) {
  const insuranceData = [
    { name: '사망', need: '5.9억', have: '2억', lack: '3.9억', status: 'lack' },
    { name: '장해', need: '5.9억', have: '1억', lack: '4.9억', status: 'lack' },
    { name: '암진단', need: '1.2억', have: '5천', lack: '7천', status: 'lack' },
    { name: '뇌질환', need: '6천', have: '3천', lack: '3천', status: 'lack' },
    { name: '심질환', need: '6천', have: '3천', lack: '3천', status: 'lack' },
    { name: '실비', need: '5천', have: '5천', lack: '0원', status: 'ok' },
    { name: '입원', need: '가입', have: 'O', lack: '-', status: 'ok' },
    { name: '치매', need: '가입', have: 'X', lack: '미가입', status: 'lack' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">👨‍🏫</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>마지막! <span className="text-teal-600 font-bold">보험설계</span>입니다. 8대 보장 분석으로 부족한 보장을 확인해볼게요! 🛡️</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2.5 mb-3.5 pb-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-xl">🛡️</div>
          <div className="flex-1">
            <h3 className="text-[15px] font-bold">보험설계</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">8대 보장 분석</p>
          </div>
          <span className="text-[11px] text-teal-600 font-bold bg-teal-50 px-2 py-1 rounded-md">7/7</span>
        </div>

        {/* 보험 테이블 */}
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border border-gray-200 font-semibold text-gray-500">담보</th>
                <th className="p-2 border border-gray-200 font-semibold text-gray-500">필요</th>
                <th className="p-2 border border-gray-200 font-semibold text-gray-500">준비</th>
                <th className="p-2 border border-gray-200 font-semibold text-gray-500">부족</th>
              </tr>
            </thead>
            <tbody>
              {insuranceData.map((item, idx) => (
                <tr key={idx} className="bg-white">
                  <td className="p-2 border border-gray-200 text-center">{item.name}</td>
                  <td className="p-2 border border-gray-200 text-center text-gray-700">{item.need}</td>
                  <td className="p-2 border border-gray-200 text-center text-green-600">{item.have}</td>
                  <td className={`p-2 border border-gray-200 text-center font-bold ${item.status === 'lack' ? 'text-red-500' : 'text-green-600'}`}>
                    {item.lack}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 필요자금 기준 안내 */}
        <div className="mt-3 flex gap-2.5 p-3 bg-blue-50 rounded-lg">
          <span className="text-base">📋</span>
          <span className="text-xs text-blue-800 leading-relaxed">
            <b>필요자금 기준:</b> 사망/장해 = 연봉×3+부채, 암진단 = 연봉×2, 뇌/심 = 연봉×1, 실비 = 5천만원
          </span>
        </div>

        {/* 보험 분석 요약 */}
        <div className="mt-3 bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-200/50 rounded-lg p-3.5">
          <div className="text-xs font-bold text-teal-600 mb-2.5 flex items-center gap-1.5">📊 보험 분석 요약</div>
          <ResultRow label="총 부족 보장" value="4개 항목" danger />
          <ResultRow label="가장 시급한 보장" value="장해 (4.9억 부족)" />
          <ResultRow label="치매 특약" value="미가입 (추가 권장)" warning isLast />
        </div>

        {/* 면책 */}
        <p className="mt-3 text-[10px] text-gray-400 text-center bg-gray-50 p-2 rounded">
          ※ AI는 틀릴 수 있습니다. 정확한 보험 분석은 전문 설계사 상담을 권장합니다.
        </p>

        <div className="flex gap-2 mt-3.5 pt-3 border-t border-gray-100">
          <button onClick={onPrev} className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-lg text-sm font-bold">← 이전</button>
          <button onClick={onNext} className="flex-1 py-3 bg-gradient-to-r from-teal-400 to-teal-600 text-white rounded-lg text-sm font-bold">
            {isLast ? '금융집 완성 →' : '다음 →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 공통 컴포넌트
// ============================================

// 입력 필드
function InputField({ label, value, suffix, onChange }: { label: string; value: number; suffix: string; onChange: (v: number) => void }) {
  return (
    <div className="flex-1">
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-400"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">{suffix}</span>
      </div>
    </div>
  );
}

// 결과 행
function ResultRow({ label, value, highlight, danger, warning, success, large, isLast }: { 
  label: string; 
  value: string; 
  highlight?: boolean; 
  danger?: boolean; 
  warning?: boolean;
  success?: boolean;
  large?: boolean;
  isLast?: boolean;
}) {
  let valueClass = 'text-sm font-bold';
  if (highlight) valueClass += ' text-teal-600';
  else if (danger) valueClass += ' text-red-500';
  else if (warning) valueClass += ' text-amber-500';
  else if (success) valueClass += ' text-green-500';
  if (large) valueClass += ' text-lg';

  return (
    <div className={`flex justify-between items-center py-2 ${!isLast ? 'border-b border-dashed border-teal-200/50' : ''}`}>
      <span className="text-xs text-gray-500">{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}

// 범례 아이템
function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <div className={`w-2.5 h-2.5 rounded-sm ${color}`}></div>
      <span className="text-[10px] text-gray-500">{label}</span>
    </div>
  );
}
