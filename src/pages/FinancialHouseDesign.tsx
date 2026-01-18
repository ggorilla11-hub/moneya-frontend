import { useState } from 'react';

interface FinancialHouseDesignProps {
  userName: string;
  onComplete: () => void;
  onBack: () => void;
}

const DESIGN_TABS = [
  { id: 'retire', name: '은퇴', icon: '🏖️', step: 1 },
  { id: 'debt', name: '부채', icon: '💳', step: 2 },
  { id: 'save', name: '저축', icon: '💰', step: 3 },
  { id: 'invest', name: '투자', icon: '📈', step: 4 },
  { id: 'tax', name: '세금', icon: '💸', step: 5 },
  { id: 'estate', name: '부동산', icon: '🏠', step: 6 },
  { id: 'insurance', name: '보험', icon: '🛡️', step: 7 },
];

export default function FinancialHouseDesign({ userName, onComplete, onBack }: FinancialHouseDesignProps) {
  const [currentTab, setCurrentTab] = useState('retire');
  const [completedTabs, setCompletedTabs] = useState<string[]>([]);

  const handleTabComplete = (tabId: string) => {
    if (!completedTabs.includes(tabId)) {
      setCompletedTabs([...completedTabs, tabId]);
    }
  };

  const goToNextTab = () => {
    const currentIndex = DESIGN_TABS.findIndex(t => t.id === currentTab);
    if (currentIndex < DESIGN_TABS.length - 1) {
      handleTabComplete(currentTab);
      setCurrentTab(DESIGN_TABS[currentIndex + 1].id);
    } else {
      handleTabComplete(currentTab);
      onComplete();
    }
  };

  const goToPrevTab = () => {
    const currentIndex = DESIGN_TABS.findIndex(t => t.id === currentTab);
    if (currentIndex > 0) {
      setCurrentTab(DESIGN_TABS[currentIndex - 1].id);
    } else {
      onBack();
    }
  };

  const currentStep = DESIGN_TABS.find(t => t.id === currentTab)?.step || 1;

  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      // TODO: AI 메시지 처리 로직
      console.log('메시지 전송:', inputMessage);
      setInputMessage('');
    }
  };

  const handleVoiceInput = () => {
    // TODO: 음성 입력 로직
    console.log('음성 입력 시작');
  };

  const handleAttach = () => {
    // TODO: 첨부파일 로직
    console.log('첨부파일 추가');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-36">
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
        {currentTab === 'retire' && <RetirePlanCard onNext={goToNextTab} onPrev={goToPrevTab} />}
        {currentTab === 'debt' && <DebtPlanCard onNext={goToNextTab} onPrev={goToPrevTab} />}
        {currentTab === 'save' && <SavePlanCard onNext={goToNextTab} onPrev={goToPrevTab} />}
        {currentTab === 'invest' && <InvestPlanCard onNext={goToNextTab} onPrev={goToPrevTab} />}
        {currentTab === 'tax' && <TaxPlanCard onNext={goToNextTab} onPrev={goToPrevTab} />}
        {currentTab === 'estate' && <EstatePlanCard onNext={goToNextTab} onPrev={goToPrevTab} />}
        {currentTab === 'insurance' && <InsurancePlanCard onNext={goToNextTab} onPrev={goToPrevTab} isLast={true} />}
      </div>

      {/* 마이크버튼바 (입력바) - 2단계 재무설계에서만 표시 */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 px-3 py-2 flex items-center gap-2">
        {/* + 버튼 (첨부) */}
        <button 
          onClick={handleAttach}
          className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-teal-400 to-teal-600 text-white rounded-full text-xl font-bold shadow-md"
        >
          +
        </button>
        
        {/* 마이크 버튼 */}
        <button 
          onClick={handleVoiceInput}
          className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full text-xl"
        >
          🎤
        </button>
        
        {/* 텍스트 입력 */}
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="지출 전에 물어보세요..."
          className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
        
        {/* 전송 버튼 */}
        <button 
          onClick={handleSendMessage}
          className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-teal-400 to-teal-600 text-white rounded-full shadow-md"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ============================================
// 1. 은퇴설계 카드
// ============================================
function RetirePlanCard({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const [formData, setFormData] = useState({
    currentAge: 37,
    retireAge: 65,
    lifeExpectancy: 90,
    monthlyExpense: 300,
    nationalPension: 80,
    privatePension: 50,
  });

  const yearsToRetire = formData.retireAge - formData.currentAge;
  const retirementYears = formData.lifeExpectancy - formData.retireAge;
  const totalNeeded = formData.monthlyExpense * 12 * retirementYears / 10000;
  const totalPension = (formData.nationalPension + formData.privatePension) * 12 * retirementYears / 10000;
  const gap = totalNeeded - totalPension;
  const monthlyRequired = gap > 0 ? Math.round((gap * 10000) / yearsToRetire / 12) : 0;

  return (
    <div className="space-y-3">
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">👨‍🏫</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>이제 본격적인 <span className="text-teal-600 font-bold">재무설계</span>를 시작합니다! 첫 번째는 <span className="text-teal-600 font-bold">은퇴설계</span>예요. 은퇴 후 필요한 자금을 계산해볼게요! 🏖️</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-xl">🏖️</div>
          <div className="flex-1">
            <h3 className="text-[15px] font-bold">은퇴설계</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">노후 필요자금 계산</p>
          </div>
          <span className="text-[11px] text-teal-700 font-bold bg-teal-50 px-2 py-1 rounded-md">1/7</span>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2.5">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">현재 나이</label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.currentAge}
                  onChange={(e) => setFormData({...formData, currentAge: Number(e.target.value)})}
                  className="w-full px-3.5 py-3 border-2 border-gray-200 rounded-lg text-sm pr-10 focus:border-teal-400 focus:outline-none"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">세</span>
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">은퇴 예정 나이</label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.retireAge}
                  onChange={(e) => setFormData({...formData, retireAge: Number(e.target.value)})}
                  className="w-full px-3.5 py-3 border-2 border-gray-200 rounded-lg text-sm pr-10 focus:border-teal-400 focus:outline-none"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">세</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2.5">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">기대 수명</label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.lifeExpectancy}
                  onChange={(e) => setFormData({...formData, lifeExpectancy: Number(e.target.value)})}
                  className="w-full px-3.5 py-3 border-2 border-gray-200 rounded-lg text-sm pr-10 focus:border-teal-400 focus:outline-none"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">세</span>
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">노후 월생활비</label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.monthlyExpense}
                  onChange={(e) => setFormData({...formData, monthlyExpense: Number(e.target.value)})}
                  className="w-full px-3.5 py-3 border-2 border-gray-200 rounded-lg text-sm pr-12 focus:border-teal-400 focus:outline-none"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">만원</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2.5">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">예상 국민연금 (월)</label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.nationalPension}
                  onChange={(e) => setFormData({...formData, nationalPension: Number(e.target.value)})}
                  className="w-full px-3.5 py-3 border-2 border-gray-200 rounded-lg text-sm pr-12 focus:border-teal-400 focus:outline-none"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">만원</span>
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">예상 개인연금 (월)</label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.privatePension}
                  onChange={(e) => setFormData({...formData, privatePension: Number(e.target.value)})}
                  className="w-full px-3.5 py-3 border-2 border-gray-200 rounded-lg text-sm pr-12 focus:border-teal-400 focus:outline-none"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">만원</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-200 rounded-lg p-3.5 mt-4">
          <div className="text-xs font-bold text-teal-700 mb-2.5 flex items-center gap-1.5">📊 은퇴설계 분석 결과</div>
          <div className="space-y-2">
            <div className="flex justify-between items-center py-2 border-b border-dashed border-teal-200">
              <span className="text-xs text-gray-500">은퇴까지 남은 기간</span>
              <span className="text-sm font-bold">{yearsToRetire}년</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-dashed border-teal-200">
              <span className="text-xs text-gray-500">노후 생활 기간</span>
              <span className="text-sm font-bold">{retirementYears}년</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-dashed border-teal-200">
              <span className="text-xs text-gray-500">노후 총 필요자금</span>
              <span className="text-sm font-bold text-teal-700">{totalNeeded.toFixed(1)}억원</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-dashed border-teal-200">
              <span className="text-xs text-gray-500">연금 예상 수령액</span>
              <span className="text-sm font-bold text-green-600">{totalPension.toFixed(1)}억원</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-xs text-gray-500">추가 준비 필요</span>
              <span className="text-sm font-bold text-red-500">{gap > 0 ? gap.toFixed(1) : 0}억원</span>
            </div>
          </div>
        </div>

        {gap > 0 && (
          <div className="flex gap-2.5 p-3 bg-blue-50 rounded-lg mt-3">
            <span className="text-base">💡</span>
            <span className="text-xs text-blue-700 leading-relaxed">
              은퇴 준비를 위해 <span className="font-bold">월 약 {monthlyRequired}만원</span>의 추가 저축/투자가 권장됩니다.
            </span>
          </div>
        )}

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
function DebtPlanCard({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const [formData, setFormData] = useState({
    mortgageBalance: 35000,
    mortgageRate: 4.5,
    creditBalance: 5000,
    creditRate: 6.5,
    monthlyPayment: 150,
  });

  const totalDebt = formData.mortgageBalance + formData.creditBalance;
  const monthlyInterest = Math.round((formData.mortgageBalance * formData.mortgageRate / 100 / 12) + (formData.creditBalance * formData.creditRate / 100 / 12));
  const dsr = Math.round((formData.monthlyPayment / 520) * 100);

  return (
    <div className="space-y-3">
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">👨‍🏫</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>두 번째는 <span className="text-teal-600 font-bold">부채설계</span>입니다. 대출 상환 전략을 세워볼게요! 💳</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-xl">💳</div>
          <div className="flex-1">
            <h3 className="text-[15px] font-bold">부채설계</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">대출 상환 전략</p>
          </div>
          <span className="text-[11px] text-teal-700 font-bold bg-teal-50 px-2 py-1 rounded-md">2/7</span>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2.5">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">주택담보대출 잔액</label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.mortgageBalance}
                  onChange={(e) => setFormData({...formData, mortgageBalance: Number(e.target.value)})}
                  className="w-full px-3.5 py-3 border-2 border-gray-200 rounded-lg text-sm pr-12 focus:border-teal-400 focus:outline-none"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">만원</span>
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">담보대출 금리</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={formData.mortgageRate}
                  onChange={(e) => setFormData({...formData, mortgageRate: Number(e.target.value)})}
                  className="w-full px-3.5 py-3 border-2 border-gray-200 rounded-lg text-sm pr-10 focus:border-teal-400 focus:outline-none"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">%</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2.5">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">신용대출 잔액</label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.creditBalance}
                  onChange={(e) => setFormData({...formData, creditBalance: Number(e.target.value)})}
                  className="w-full px-3.5 py-3 border-2 border-gray-200 rounded-lg text-sm pr-12 focus:border-teal-400 focus:outline-none"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">만원</span>
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">신용대출 금리</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={formData.creditRate}
                  onChange={(e) => setFormData({...formData, creditRate: Number(e.target.value)})}
                  className="w-full px-3.5 py-3 border-2 border-gray-200 rounded-lg text-sm pr-10 focus:border-teal-400 focus:outline-none"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">%</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">월 상환액</label>
            <div className="relative">
              <input
                type="number"
                value={formData.monthlyPayment}
                onChange={(e) => setFormData({...formData, monthlyPayment: Number(e.target.value)})}
                className="w-full px-3.5 py-3 border-2 border-gray-200 rounded-lg text-sm pr-12 focus:border-teal-400 focus:outline-none"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">만원</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-200 rounded-lg p-3.5 mt-4">
          <div className="text-xs font-bold text-teal-700 mb-2.5 flex items-center gap-1.5">📊 부채설계 분석 결과</div>
          <div className="space-y-2">
            <div className="flex justify-between items-center py-2 border-b border-dashed border-teal-200">
              <span className="text-xs text-gray-500">총 부채</span>
              <span className="text-sm font-bold text-red-500">{(totalDebt / 10000).toFixed(1)}억원</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-dashed border-teal-200">
              <span className="text-xs text-gray-500">월 이자 비용</span>
              <span className="text-sm font-bold">{monthlyInterest}만원</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-xs text-gray-500">DSR (예상)</span>
              <span className={`text-sm font-bold ${dsr > 40 ? 'text-red-500' : 'text-green-600'}`}>{dsr}%</span>
            </div>
          </div>
        </div>

        {formData.creditBalance > 0 && (
          <div className="flex gap-2.5 p-3 bg-amber-50 rounded-lg mt-3">
            <span className="text-base">⚠️</span>
            <span className="text-xs text-amber-800 leading-relaxed">
              <span className="font-bold">신용대출 우선 상환</span>을 권장합니다. 금리가 높은 신용대출을 먼저 갚으면 이자 부담을 크게 줄일 수 있어요.
            </span>
          </div>
        )}

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
function SavePlanCard({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const [formData, setFormData] = useState({
    monthlySaving: 100,
    savingGoal: 5000,
    savingPurpose: '결혼자금',
    monthlyIncome: 520,
  });

  const savingRate = Math.round((formData.monthlySaving / formData.monthlyIncome) * 100);
  const monthsToGoal = Math.ceil(formData.savingGoal / formData.monthlySaving);
  const yearsToGoal = Math.floor(monthsToGoal / 12);
  const remainMonths = monthsToGoal % 12;

  return (
    <div className="space-y-3">
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">👨‍🏫</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>세 번째는 <span className="text-teal-600 font-bold">저축설계</span>입니다. 목표 자금을 모으는 계획을 세워볼게요! 💰</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl">💰</div>
          <div className="flex-1">
            <h3 className="text-[15px] font-bold">저축설계</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">목표 자금 설계</p>
          </div>
          <span className="text-[11px] text-teal-700 font-bold bg-teal-50 px-2 py-1 rounded-md">3/7</span>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2.5">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">월 저축액</label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.monthlySaving}
                  onChange={(e) => setFormData({...formData, monthlySaving: Number(e.target.value)})}
                  className="w-full px-3.5 py-3 border-2 border-gray-200 rounded-lg text-sm pr-12 focus:border-teal-400 focus:outline-none"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">만원</span>
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">목표 금액</label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.savingGoal}
                  onChange={(e) => setFormData({...formData, savingGoal: Number(e.target.value)})}
                  className="w-full px-3.5 py-3 border-2 border-gray-200 rounded-lg text-sm pr-12 focus:border-teal-400 focus:outline-none"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">만원</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">저축 목적</label>
            <div className="flex gap-2 flex-wrap">
              {['결혼자금', '주택자금', '자녀교육', '노후준비', '기타'].map((purpose) => (
                <button
                  key={purpose}
                  onClick={() => setFormData({...formData, savingPurpose: purpose})}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border-2 transition-all
                    ${formData.savingPurpose === purpose 
                      ? 'border-teal-400 bg-teal-50 text-teal-700' 
                      : 'border-gray-200 text-gray-500'}`}
                >
                  {purpose}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-200 rounded-lg p-3.5 mt-4">
          <div className="text-xs font-bold text-teal-700 mb-2.5 flex items-center gap-1.5">📊 저축설계 분석 결과</div>
          <div className="space-y-2">
            <div className="flex justify-between items-center py-2 border-b border-dashed border-teal-200">
              <span className="text-xs text-gray-500">저축률</span>
              <span className={`text-sm font-bold ${savingRate >= 20 ? 'text-green-600' : 'text-amber-500'}`}>{savingRate}%</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-dashed border-teal-200">
              <span className="text-xs text-gray-500">목표 달성까지</span>
              <span className="text-sm font-bold text-teal-700">{yearsToGoal}년 {remainMonths}개월</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-xs text-gray-500">5년 후 예상 저축액</span>
              <span className="text-sm font-bold">{(formData.monthlySaving * 60 / 10000).toFixed(1)}억원</span>
            </div>
          </div>
        </div>

        {savingRate < 20 && (
          <div className="flex gap-2.5 p-3 bg-blue-50 rounded-lg mt-3">
            <span className="text-base">💡</span>
            <span className="text-xs text-blue-700 leading-relaxed">
              권장 저축률은 <span className="font-bold">소득의 20% 이상</span>입니다. 지출을 점검하고 저축액을 늘려보세요.
            </span>
          </div>
        )}

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
function InvestPlanCard({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const [formData, setFormData] = useState({
    financialAssets: 15000,
    monthlyIncome: 520,
    age: 37,
    investmentStyle: '중립형',
  });

  const wealthIndex = Math.round((formData.financialAssets * 10) / (formData.age * formData.monthlyIncome * 12) * 100);
  const targetAsset = 100000; // 10억
  const gap = targetAsset - formData.financialAssets;

  return (
    <div className="space-y-3">
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">👨‍🏫</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>네 번째는 <span className="text-teal-600 font-bold">투자설계</span>입니다. 부자지수와 DESIRE 단계를 확인해볼게요! 📈</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-xl">📈</div>
          <div className="flex-1">
            <h3 className="text-[15px] font-bold">투자설계</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">부자지수 & DESIRE 분석</p>
          </div>
          <span className="text-[11px] text-teal-700 font-bold bg-teal-50 px-2 py-1 rounded-md">4/7</span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">총 금융자산</label>
            <div className="relative">
              <input
                type="number"
                value={formData.financialAssets}
                onChange={(e) => setFormData({...formData, financialAssets: Number(e.target.value)})}
                className="w-full px-3.5 py-3 border-2 border-gray-200 rounded-lg text-sm pr-12 focus:border-teal-400 focus:outline-none"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">만원</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">투자 성향</label>
            <div className="flex gap-2">
              {['안정형', '중립형', '공격형'].map((style) => (
                <button
                  key={style}
                  onClick={() => setFormData({...formData, investmentStyle: style})}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-medium border-2 transition-all
                    ${formData.investmentStyle === style 
                      ? 'border-teal-400 bg-teal-50 text-teal-700' 
                      : 'border-gray-200 text-gray-500'}`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-200 rounded-lg p-3.5 mt-4">
          <div className="text-xs font-bold text-teal-700 mb-2.5 flex items-center gap-1.5">📊 투자설계 분석 결과</div>
          <div className="space-y-2">
            <div className="flex justify-between items-center py-2 border-b border-dashed border-teal-200">
              <span className="text-xs text-gray-500">부자지수</span>
              <span className={`text-sm font-bold ${wealthIndex >= 100 ? 'text-green-600' : 'text-amber-500'}`}>{wealthIndex}%</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-dashed border-teal-200">
              <span className="text-xs text-gray-500">현재 금융자산</span>
              <span className="text-sm font-bold">{(formData.financialAssets / 10000).toFixed(1)}억원</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-dashed border-teal-200">
              <span className="text-xs text-gray-500">목표 금융자산</span>
              <span className="text-sm font-bold text-teal-700">10억원</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-xs text-gray-500">목표까지 필요</span>
              <span className="text-sm font-bold text-red-500">{(gap / 10000).toFixed(1)}억원</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2.5 p-3 bg-purple-50 rounded-lg mt-3">
          <span className="text-base">🎯</span>
          <span className="text-xs text-purple-700 leading-relaxed">
            <span className="font-bold">DESIRE 4단계 (Investment)</span>에 해당합니다. 10억 목돈 마련을 위한 투자 전략이 필요해요.
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
// 5. 세금설계 카드
// ============================================
function TaxPlanCard({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const [formData, setFormData] = useState({
    annualIncome: 6200,
    pensionSaving: 400,
    irpContribution: 300,
  });

  const taxDeduction = Math.min(formData.pensionSaving + formData.irpContribution, 900);
  const estimatedTaxSaving = Math.round(taxDeduction * 0.165);

  return (
    <div className="space-y-3">
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">👨‍🏫</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>다섯 번째는 <span className="text-teal-600 font-bold">세금설계</span>입니다. 절세 전략을 확인해볼게요! 💸</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-xl">💸</div>
          <div className="flex-1">
            <h3 className="text-[15px] font-bold">세금설계</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">절세 전략</p>
          </div>
          <span className="text-[11px] text-teal-700 font-bold bg-teal-50 px-2 py-1 rounded-md">5/7</span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">연간 총급여</label>
            <div className="relative">
              <input
                type="number"
                value={formData.annualIncome}
                onChange={(e) => setFormData({...formData, annualIncome: Number(e.target.value)})}
                className="w-full px-3.5 py-3 border-2 border-gray-200 rounded-lg text-sm pr-12 focus:border-teal-400 focus:outline-none"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">만원</span>
            </div>
          </div>

          <div className="flex gap-2.5">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">연금저축 납입액 (연)</label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.pensionSaving}
                  onChange={(e) => setFormData({...formData, pensionSaving: Number(e.target.value)})}
                  className="w-full px-3.5 py-3 border-2 border-gray-200 rounded-lg text-sm pr-12 focus:border-teal-400 focus:outline-none"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">만원</span>
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">IRP 납입액 (연)</label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.irpContribution}
                  onChange={(e) => setFormData({...formData, irpContribution: Number(e.target.value)})}
                  className="w-full px-3.5 py-3 border-2 border-gray-200 rounded-lg text-sm pr-12 focus:border-teal-400 focus:outline-none"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">만원</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-200 rounded-lg p-3.5 mt-4">
          <div className="text-xs font-bold text-teal-700 mb-2.5 flex items-center gap-1.5">📊 세금설계 분석 결과</div>
          <div className="space-y-2">
            <div className="flex justify-between items-center py-2 border-b border-dashed border-teal-200">
              <span className="text-xs text-gray-500">세액공제 대상</span>
              <span className="text-sm font-bold">{taxDeduction}만원</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-dashed border-teal-200">
              <span className="text-xs text-gray-500">예상 세액공제</span>
              <span className="text-sm font-bold text-green-600">{estimatedTaxSaving}만원</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-xs text-gray-500">추가 납입 가능</span>
              <span className="text-sm font-bold text-teal-700">{Math.max(0, 900 - taxDeduction)}만원</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2.5 p-3 bg-blue-50 rounded-lg mt-3">
          <span className="text-base">💡</span>
          <span className="text-xs text-blue-700 leading-relaxed">
            <span className="font-bold">금융감독원 파인</span>에서 연금저축/IRP 비교 정보를 확인하세요.
            <a href="https://fine.fss.or.kr" target="_blank" rel="noopener noreferrer" className="underline ml-1">바로가기</a>
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
function EstatePlanCard({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const [hasHouse, setHasHouse] = useState(true);
  const [formData, setFormData] = useState({
    residentialEstate: 40000,
    investmentEstate: 10000,
  });

  const totalEstate = formData.residentialEstate + formData.investmentEstate;

  return (
    <div className="space-y-3">
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">👨‍🏫</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>여섯 번째는 <span className="text-teal-600 font-bold">부동산설계</span>입니다. 주택 보유 현황을 확인해볼게요! 🏠</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center text-xl">🏠</div>
          <div className="flex-1">
            <h3 className="text-[15px] font-bold">부동산설계</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">주택 현황 분석</p>
          </div>
          <span className="text-[11px] text-teal-700 font-bold bg-teal-50 px-2 py-1 rounded-md">6/7</span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">주택 보유 여부</label>
            <div className="flex gap-2">
              <button
                onClick={() => setHasHouse(true)}
                className={`flex-1 py-2.5 rounded-lg text-xs font-medium border-2 transition-all
                  ${hasHouse ? 'border-teal-400 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-500'}`}
              >
                🏠 보유
              </button>
              <button
                onClick={() => setHasHouse(false)}
                className={`flex-1 py-2.5 rounded-lg text-xs font-medium border-2 transition-all
                  ${!hasHouse ? 'border-teal-400 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-500'}`}
              >
                ❌ 미보유
              </button>
            </div>
          </div>

          {hasHouse && (
            <div className="flex gap-2.5">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">거주용 부동산</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.residentialEstate}
                    onChange={(e) => setFormData({...formData, residentialEstate: Number(e.target.value)})}
                    className="w-full px-3.5 py-3 border-2 border-gray-200 rounded-lg text-sm pr-12 focus:border-teal-400 focus:outline-none"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">만원</span>
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">투자용 부동산</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.investmentEstate}
                    onChange={(e) => setFormData({...formData, investmentEstate: Number(e.target.value)})}
                    className="w-full px-3.5 py-3 border-2 border-gray-200 rounded-lg text-sm pr-12 focus:border-teal-400 focus:outline-none"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">만원</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {hasHouse && (
          <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-200 rounded-lg p-3.5 mt-4">
            <div className="text-xs font-bold text-teal-700 mb-2.5 flex items-center gap-1.5">🏠 부동산 현황</div>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-dashed border-teal-200">
                <span className="text-xs text-gray-500">거주용 부동산</span>
                <span className="text-sm font-bold">{(formData.residentialEstate / 10000).toFixed(1)}억원</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-dashed border-teal-200">
                <span className="text-xs text-gray-500">투자용 부동산</span>
                <span className="text-sm font-bold">{(formData.investmentEstate / 10000).toFixed(1)}억원</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs text-gray-500">총 부동산 자산</span>
                <span className="text-sm font-bold text-teal-700">{(totalEstate / 10000).toFixed(1)}억원</span>
              </div>
            </div>
          </div>
        )}

        {!hasHouse && (
          <div className="flex gap-2.5 p-3 bg-blue-50 rounded-lg mt-3">
            <span className="text-base">💡</span>
            <span className="text-xs text-blue-700 leading-relaxed">
              주택 구입 계획이 있으시다면 <span className="font-bold">청약 점수</span>와 <span className="font-bold">대출 한도</span>를 미리 확인해보세요.
            </span>
          </div>
        )}

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
function InsurancePlanCard({ onNext, onPrev, isLast }: { onNext: () => void; onPrev: () => void; isLast?: boolean }) {
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

  const lackCount = insuranceData.filter(d => d.status === 'lack').length;

  return (
    <div className="space-y-3">
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">👨‍🏫</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>마지막! <span className="text-teal-600 font-bold">보험설계</span>입니다. 8대 보장 분석으로 부족한 보장을 확인해볼게요! 🛡️</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-xl">🛡️</div>
          <div className="flex-1">
            <h3 className="text-[15px] font-bold">보험설계</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">8대 보장 분석</p>
          </div>
          <span className="text-[11px] text-teal-700 font-bold bg-teal-50 px-2 py-1 rounded-md">7/7</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-2 px-2 border border-gray-200 font-semibold text-gray-500">담보</th>
                <th className="py-2 px-2 border border-gray-200 font-semibold text-gray-500">필요</th>
                <th className="py-2 px-2 border border-gray-200 font-semibold text-gray-500">준비</th>
                <th className="py-2 px-2 border border-gray-200 font-semibold text-gray-500">부족</th>
              </tr>
            </thead>
            <tbody>
              {insuranceData.map((item, index) => (
                <tr key={index}>
                  <td className="py-2 px-2 border border-gray-200 text-center">{item.name}</td>
                  <td className="py-2 px-2 border border-gray-200 text-center">{item.need}</td>
                  <td className="py-2 px-2 border border-gray-200 text-center text-green-600">{item.have}</td>
                  <td className={`py-2 px-2 border border-gray-200 text-center font-bold ${item.status === 'lack' ? 'text-red-500' : 'text-green-600'}`}>
                    {item.lack}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-2.5 p-3 bg-gray-50 rounded-lg mt-3">
          <span className="text-base">📋</span>
          <span className="text-[11px] text-gray-600 leading-relaxed">
            <b>필요자금 기준:</b> 사망/장해 = 연봉×3+부채, 암진단 = 연봉×2, 뇌/심 = 연봉×1, 실비 = 5천만원
          </span>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-200 rounded-lg p-3.5 mt-3">
          <div className="text-xs font-bold text-teal-700 mb-2.5 flex items-center gap-1.5">📊 보험 분석 요약</div>
          <div className="space-y-2">
            <div className="flex justify-between items-center py-2 border-b border-dashed border-teal-200">
              <span className="text-xs text-gray-500">총 부족 보장</span>
              <span className="text-sm font-bold text-red-500">{lackCount}개 항목</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-dashed border-teal-200">
              <span className="text-xs text-gray-500">가장 시급한 보장</span>
              <span className="text-sm font-bold">장해 (4.9억 부족)</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-xs text-gray-500">치매 특약</span>
              <span className="text-sm font-bold text-amber-500">미가입 (추가 권장)</span>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-gray-400 mt-3 text-center">
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
