// src/pages/FinancialHouseBasic.tsx
// 금융집짓기 - 1단계 기본정보 입력 (5개 스텝)

import { useState, useEffect } from 'react';
import { useFinancialHouse } from '../context/FinancialHouseContext';

interface FinancialHouseBasicProps {
  userName: string;
  onComplete: () => void;
  onBack: () => void;
  existingFinancialResult?: { name: string; age: number; income: number; assets: number; debt: number; } | null;
  existingIncomeExpense?: { income: number; expense: number; saving: number; investment: number; } | null;
}

const interestOptions = [
  { id: 'saving', label: '💰 돈 모으기' }, { id: 'house', label: '🏠 내집 마련' },
  { id: 'retire', label: '🏖️ 노후 준비' }, { id: 'education', label: '👶 자녀 교육비' },
  { id: 'debt', label: '💳 빚 갚기' }, { id: 'invest', label: '📈 투자 시작' },
  { id: 'insurance', label: '🛡️ 보험 점검' }, { id: 'tax', label: '💸 세금 절약' },
];

const goalOptions = [
  { id: 'billion', label: '10억 만들기', icon: '💵' }, { id: 'house', label: '내집 마련', icon: '🏠' },
  { id: 'early-retire', label: '조기 은퇴', icon: '🏖️' }, { id: 'children', label: '자녀 독립', icon: '🎓' },
];

const jobOptions = [
  { id: 'employee', label: '직장인', icon: '👔' }, { id: 'business', label: '자영업', icon: '🏪' },
  { id: 'freelancer', label: '프리랜서', icon: '💻' }, { id: 'public', label: '공무원', icon: '🏛️' },
  { id: 'homemaker', label: '전업주부', icon: '🏠' }, { id: 'student', label: '학생', icon: '📚' },
  { id: 'other', label: '기타', icon: '👤' },
];

export default function FinancialHouseBasic({ userName, onComplete, onBack, existingFinancialResult, existingIncomeExpense }: FinancialHouseBasicProps) {
  const { data, updatePersonalInfo, updateFinancialInfo } = useFinancialHouse();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // Step 1: 인적사항
  const [name, setName] = useState(data.personalInfo.name || existingFinancialResult?.name || userName);
  const [age, setAge] = useState(data.personalInfo.age || existingFinancialResult?.age || 35);
  const [married, setMarried] = useState(data.personalInfo.married);
  const [job, setJob] = useState(data.personalInfo.job || '');
  const [familyCount, setFamilyCount] = useState(data.personalInfo.familyCount || 1);
  const [retireAge, setRetireAge] = useState(data.retirePlan.retireAge || 65);
  const [dualIncome, setDualIncome] = useState(data.personalInfo.dualIncome);

  // Step 2: 관심사/목표
  const [interests, setInterests] = useState<string[]>([]);
  const [goal, setGoal] = useState('');

  // Step 3: 수입
  const [myIncome, setMyIncome] = useState(existingFinancialResult?.income || 0);
  const [spouseIncome, setSpouseIncome] = useState(0);
  const [otherIncome, setOtherIncome] = useState(0);
  const [bonusIncome, setBonusIncome] = useState(0);
  const [incentiveIncome, setIncentiveIncome] = useState(0);
  const [otherIrregularIncome, setOtherIrregularIncome] = useState(0);

  // 지출
  const [cmaAmount, setCmaAmount] = useState(0);
  const [savingsAmount, setSavingsAmount] = useState(existingIncomeExpense?.saving || 0);
  const [fundAmount, setFundAmount] = useState(0);
  const [housingSubAmount, setHousingSubAmount] = useState(0);
  const [isaAmount, setIsaAmount] = useState(0);
  const [pensionAmount, setPensionAmount] = useState(0);
  const [taxFreePensionAmount, setTaxFreePensionAmount] = useState(0);
  const [insuranceAmount, setInsuranceAmount] = useState(0);
  const [loanPaymentAmount, setLoanPaymentAmount] = useState(0);
  const [surplusAmount, setSurplusAmount] = useState(0);

  // Step 4: 자산
  const [cmaAsset, setCmaAsset] = useState(0);
  const [goldAsset, setGoldAsset] = useState(0);
  const [bondAsset, setBondAsset] = useState(0);
  const [depositAsset, setDepositAsset] = useState(0);
  const [pensionAsset, setPensionAsset] = useState(0);
  const [savingsAsset, setSavingsAsset] = useState(0);
  const [fundSavingsAsset, setFundSavingsAsset] = useState(0);
  const [etfAsset, setEtfAsset] = useState(0);
  const [stockAsset, setStockAsset] = useState(0);
  const [cryptoAsset, setCryptoAsset] = useState(0);

  // Step 5: 부채
  const [mortgageDebt, setMortgageDebt] = useState(0);
  const [creditDebt, setCreditDebt] = useState(0);
  const [otherDebt, setOtherDebt] = useState(0);
  const [emergencyFund, setEmergencyFund] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    if (existingFinancialResult) {
      if (existingFinancialResult.assets > 0) {
        const t = existingFinancialResult.assets;
        setDepositAsset(Math.round(t * 0.4));
        setStockAsset(Math.round(t * 0.3));
        setEtfAsset(Math.round(t * 0.2));
        setCmaAsset(Math.round(t * 0.1));
      }
      if (existingFinancialResult.debt > 0) setMortgageDebt(existingFinancialResult.debt);
    }
  }, [existingFinancialResult]);

  const totalMonthlyIncome = myIncome + spouseIncome + otherIncome;
  const totalIrregularIncome = bonusIncome + incentiveIncome + otherIrregularIncome;
  const totalExpenseWithoutLiving = cmaAmount + savingsAmount + fundAmount + housingSubAmount + isaAmount + pensionAmount + taxFreePensionAmount + insuranceAmount + loanPaymentAmount + surplusAmount;
  const livingExpense = Math.max(0, totalMonthlyIncome - totalExpenseWithoutLiving);
  const totalExpense = totalExpenseWithoutLiving + livingExpense;
  const totalAsset = cmaAsset + goldAsset + bondAsset + depositAsset + pensionAsset + savingsAsset + fundSavingsAsset + etfAsset + stockAsset + cryptoAsset;
  const totalDebt = mortgageDebt + creditDebt + otherDebt;
  const netWorth = totalAsset - totalDebt;
  const progress = (currentStep / totalSteps) * 100;

  const toggleInterest = (id: string) => {
    if (interests.includes(id)) setInterests(interests.filter(i => i !== id));
    else if (interests.length < 3) setInterests([...interests, id]);
    else alert('경제적 관심사는 최대 3개까지 선택 가능합니다.');
  };

  const goNext = () => {
    if (currentStep === 2) {
      if (interests.length < 2) { alert('경제적 관심사를 2개 이상 선택해 주세요.'); return; }
      if (!goal) { alert('재무 목표를 선택해 주세요.'); return; }
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      if (currentStep === totalSteps - 1) setTimeout(() => setShowSummary(true), 300);
    } else { saveAllData(); onComplete(); }
  };

  const goPrev = () => {
    setShowSummary(false);
    if (currentStep > 1) setCurrentStep(currentStep - 1);
    else onBack();
  };

  const saveAllData = () => {
    updatePersonalInfo({ name, age, married, job: job as any, familyCount, dualIncome });
    updateFinancialInfo({ monthlyIncome: totalMonthlyIncome, irregularIncome: totalIrregularIncome, monthlyExpense: totalExpense, totalAssets: totalAsset, totalDebt });
    localStorage.setItem('financialHouseCompleted', 'true');
    localStorage.setItem('financialHouseData', JSON.stringify({
      interests, goal, personalInfo: { name, age, married, job, familyCount, retireAge, dualIncome },
      income: { myIncome, spouseIncome, otherIncome }, irregularIncome: { bonusIncome, incentiveIncome, otherIrregularIncome },
      expense: { cmaAmount, savingsAmount, fundAmount, housingSubAmount, isaAmount, pensionAmount, taxFreePensionAmount, insuranceAmount, loanPaymentAmount, surplusAmount, livingExpense },
      assets: { cmaAsset, goldAsset, bondAsset, depositAsset, pensionAsset, savingsAsset, fundSavingsAsset, etfAsset, stockAsset, cryptoAsset },
      debts: { mortgageDebt, creditDebt, otherDebt, emergencyFund },
    }));
  };

  const stepLabels = ['인적사항 입력 중...', '경제적 관심사 선택 중...', '수입/지출 입력 중...', '자산 입력 중...', '부채/요약 확인 중...'];

  const InputRow = ({ label, value, onChange, icon }: { label: string; value: number; onChange: (v: number) => void; icon: string }) => (
    <div className="flex items-center gap-3 py-2">
      <span className="text-sm text-gray-600 w-32 flex items-center gap-1"><span>{icon}</span> {label}</span>
      <div className="flex-1 relative">
        <input type="number" value={value || ''} onChange={(e) => onChange(Number(e.target.value))} placeholder="0" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-right pr-12 focus:outline-none focus:border-teal-500" />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">만원</span>
      </div>
    </div>
  );

  const AutoCalcRow = ({ label, value, icon }: { label: string; value: number; icon: string }) => (
    <div className="flex items-center gap-3 py-2 bg-teal-50 rounded-lg px-2">
      <span className="text-sm text-teal-700 w-32 flex items-center gap-1 font-semibold"><span>{icon}</span> {label}</span>
      <div className="flex-1 text-right"><span className="text-sm font-bold text-teal-600">{value.toLocaleString()}만원</span><span className="text-xs text-teal-500 ml-1">(자동)</span></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button onClick={goPrev} className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600">←</button>
        <h1 className="flex-1 text-lg font-bold text-gray-900">기본정보 입력</h1>
        <span className="text-sm text-gray-400 font-semibold">{currentStep}/{totalSteps}</span>
      </div>
      <div className="bg-white px-4 py-3">
        <div className="flex justify-between mb-2"><span className="text-xs text-gray-500 font-semibold">{stepLabels[currentStep - 1]}</span><span className="text-xs text-teal-500 font-bold">{Math.round(progress)}%</span></div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} /></div>
      </div>
      <div className="flex justify-center gap-2 py-3 bg-white">
        {[1,2,3,4,5].map(s => <div key={s} className={`h-2 rounded-full transition-all ${s === currentStep ? 'w-6 bg-teal-500' : s < currentStep ? 'w-2 bg-emerald-500' : 'w-2 bg-gray-300'}`} />)}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {currentStep === 1 && (
          <>
            <div className="flex gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">👨‍🏫</div>
              <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm flex-1"><p className="text-sm text-gray-700">먼저 <span className="text-teal-600 font-bold">인적사항</span>부터 입력해 주세요! 😊</p></div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-xl">👤</div><div><h3 className="font-bold text-gray-900">인적사항</h3><p className="text-xs text-gray-400">기본 정보 입력</p></div></div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div><label className="block text-xs font-semibold text-gray-500 mb-1">이름 <span className="text-red-500">*</span></label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" /></div>
                <div><label className="block text-xs font-semibold text-gray-500 mb-1">나이 <span className="text-red-500">*</span></label><div className="relative"><input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 pr-8" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">세</span></div></div>
              </div>
              <div className="mb-3"><label className="block text-xs font-semibold text-gray-500 mb-2">결혼 여부</label><div className="grid grid-cols-2 gap-2"><button onClick={() => setMarried(true)} className={`py-3 rounded-lg border-2 text-sm font-semibold ${married ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-500'}`}><span className="block text-lg mb-1">💑</span>기혼</button><button onClick={() => { setMarried(false); setDualIncome(false); }} className={`py-3 rounded-lg border-2 text-sm font-semibold ${!married ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-500'}`}><span className="block text-lg mb-1">👤</span>미혼</button></div></div>
              <div className="mb-3"><label className="block text-xs font-semibold text-gray-500 mb-2">직업</label><div className="grid grid-cols-4 gap-2">{jobOptions.map(o => <button key={o.id} onClick={() => setJob(o.id)} className={`py-2 rounded-lg border-2 text-xs font-semibold ${job === o.id ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-500'}`}><span className="block text-base mb-0.5">{o.icon}</span>{o.label}</button>)}</div></div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div><label className="block text-xs font-semibold text-gray-500 mb-1">가족 수</label><div className="relative"><input type="number" value={familyCount} onChange={(e) => setFamilyCount(Number(e.target.value))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 pr-8" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">명</span></div></div>
                <div><label className="block text-xs font-semibold text-gray-500 mb-1">은퇴 예정 나이</label><div className="relative"><input type="number" value={retireAge} onChange={(e) => setRetireAge(Number(e.target.value))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 pr-8" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">세</span></div></div>
              </div>
              {married && <div><label className="block text-xs font-semibold text-gray-500 mb-2">맞벌이 여부</label><div className="grid grid-cols-2 gap-2"><button onClick={() => setDualIncome(true)} className={`py-3 rounded-lg border-2 text-sm font-semibold ${dualIncome ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-500'}`}><span className="block text-lg mb-1">👫</span>맞벌이</button><button onClick={() => setDualIncome(false)} className={`py-3 rounded-lg border-2 text-sm font-semibold ${!dualIncome ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-500'}`}><span className="block text-lg mb-1">👤</span>외벌이</button></div></div>}
            </div>
          </>
        )}
        {currentStep === 2 && (
          <>
            <div className="flex gap-3 mb-4"><div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">👨‍🏫</div><div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm flex-1"><p className="text-sm text-gray-700"><span className="text-teal-600 font-bold">관심사 2-3개</span>와 <span className="text-teal-600 font-bold">목표 1개</span>를 선택! 🎯</p></div></div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-3">
              <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl">🎯</div><div><h3 className="font-bold text-gray-900">경제적 관심사</h3><p className="text-xs text-gray-400">2-3개 선택 ({interests.length}/3)</p></div></div>
              <div className="flex flex-wrap gap-2">{interestOptions.map(o => <button key={o.id} onClick={() => toggleInterest(o.id)} className={`px-3 py-2 rounded-full border-2 text-xs font-semibold ${interests.includes(o.id) ? 'border-teal-500 bg-teal-500 text-white' : 'border-gray-200 text-gray-500'}`}>{o.label}</button>)}</div>
              {interests.length < 2 && <p className="text-xs text-amber-600 mt-2">※ 최소 2개 이상 선택</p>}
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl">🌟</div><div><h3 className="font-bold text-gray-900">재무 목표</h3><p className="text-xs text-gray-400">1개 선택</p></div></div>
              <div className="grid grid-cols-2 gap-2">{goalOptions.map(o => <button key={o.id} onClick={() => setGoal(o.id)} className={`py-3 rounded-lg border-2 text-sm font-semibold ${goal === o.id ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-500'}`}><span className="block text-xl mb-1">{o.icon}</span>{o.label}</button>)}</div>
            </div>
          </>
        )}
        {currentStep === 3 && (
          <>
            <div className="flex gap-3 mb-4"><div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">👨‍🏫</div><div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm flex-1"><p className="text-sm text-gray-700"><span className="text-teal-600 font-bold">수입과 지출</span> 입력! 생활비는 자동계산 💰</p></div></div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-3">
              <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-xl">💵</div><div><h3 className="font-bold text-gray-900">월 수입</h3><p className="text-xs text-gray-400">세후 기준</p></div></div>
              <InputRow label="본인 소득" value={myIncome} onChange={setMyIncome} icon="👨‍💼" />
              {(married && dualIncome) && <InputRow label="배우자 소득" value={spouseIncome} onChange={setSpouseIncome} icon="👩‍💼" />}
              <InputRow label="기타 소득" value={otherIncome} onChange={setOtherIncome} icon="💼" />
              <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between"><span className="text-sm font-semibold text-gray-700">월 수입 합계</span><span className="text-lg font-bold text-emerald-600">{totalMonthlyIncome.toLocaleString()}만원</span></div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-3">
              <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-xl">🎁</div><div><h3 className="font-bold text-gray-900">비정기 수입</h3><p className="text-xs text-gray-400">연간 기준</p></div></div>
              <InputRow label="상여금" value={bonusIncome} onChange={setBonusIncome} icon="🎉" />
              <InputRow label="인센티브" value={incentiveIncome} onChange={setIncentiveIncome} icon="🏆" />
              <InputRow label="기타" value={otherIrregularIncome} onChange={setOtherIrregularIncome} icon="📦" />
              <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between"><span className="text-sm font-semibold text-gray-700">비정기 수입 합계</span><span className="text-lg font-bold text-purple-600">{totalIrregularIncome.toLocaleString()}만원/년</span></div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-xl">💸</div><div><h3 className="font-bold text-gray-900">월 지출</h3><p className="text-xs text-gray-400">생활비 자동계산</p></div></div>
              <InputRow label="CMA(파킹통장)" value={cmaAmount} onChange={setCmaAmount} icon="🏦" />
              <InputRow label="적금" value={savingsAmount} onChange={setSavingsAmount} icon="💰" />
              <InputRow label="펀드(ETF)" value={fundAmount} onChange={setFundAmount} icon="📊" />
              <InputRow label="청약저축" value={housingSubAmount} onChange={setHousingSubAmount} icon="🏠" />
              <InputRow label="ISA" value={isaAmount} onChange={setIsaAmount} icon="📈" />
              <InputRow label="개인연금" value={pensionAmount} onChange={setPensionAmount} icon="🏖️" />
              <InputRow label="비과세연금보험" value={taxFreePensionAmount} onChange={setTaxFreePensionAmount} icon="🛡️" />
              <InputRow label="보장성보험료" value={insuranceAmount} onChange={setInsuranceAmount} icon="🩺" />
              <InputRow label="대출원리금" value={loanPaymentAmount} onChange={setLoanPaymentAmount} icon="💳" />
              <InputRow label="잉여자금" value={surplusAmount} onChange={setSurplusAmount} icon="💎" />
              <div className="mt-2"><AutoCalcRow label="생활비" value={livingExpense} icon="🛒" /></div>
              <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between"><span className="text-sm font-semibold text-gray-700">월 지출 합계</span><span className="text-lg font-bold text-red-500">{totalExpense.toLocaleString()}만원</span></div>
            </div>
          </>
        )}
        {currentStep === 4 && (
          <>
            <div className="flex gap-3 mb-4"><div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">👨‍🏫</div><div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm flex-1"><p className="text-sm text-gray-700">현재 보유 <span className="text-teal-600 font-bold">자산</span> 입력! 💎</p></div></div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-xl">💎</div><div><h3 className="font-bold text-gray-900">자산</h3><p className="text-xs text-gray-400">현재 보유 자산</p></div></div>
              <InputRow label="CMA(현금)" value={cmaAsset} onChange={setCmaAsset} icon="💵" />
              <InputRow label="금(GOLD)" value={goldAsset} onChange={setGoldAsset} icon="🥇" />
              <InputRow label="채권" value={bondAsset} onChange={setBondAsset} icon="📜" />
              <InputRow label="예적금" value={depositAsset} onChange={setDepositAsset} icon="🏦" />
              <InputRow label="연금적립금" value={pensionAsset} onChange={setPensionAsset} icon="🏖️" />
              <InputRow label="저축적립금" value={savingsAsset} onChange={setSavingsAsset} icon="💰" />
              <InputRow label="펀드적립금" value={fundSavingsAsset} onChange={setFundSavingsAsset} icon="📊" />
              <InputRow label="ETF(펀드)" value={etfAsset} onChange={setEtfAsset} icon="📈" />
              <InputRow label="주식" value={stockAsset} onChange={setStockAsset} icon="📉" />
              <InputRow label="가상화폐" value={cryptoAsset} onChange={setCryptoAsset} icon="₿" />
              <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between"><span className="text-sm font-semibold text-gray-700">총 자산</span><span className="text-lg font-bold text-indigo-600">{totalAsset.toLocaleString()}만원</span></div>
            </div>
          </>
        )}
        {currentStep === 5 && (
          <>
            <div className="flex gap-3 mb-4"><div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">👨‍🏫</div><div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm flex-1"><p className="text-sm text-gray-700">마지막 <span className="text-teal-600 font-bold">부채</span> 입력! 📋</p></div></div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-3">
              <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-xl">💳</div><div><h3 className="font-bold text-gray-900">부채</h3><p className="text-xs text-gray-400">현재 대출 잔액</p></div></div>
              <InputRow label="담보대출" value={mortgageDebt} onChange={setMortgageDebt} icon="🏠" />
              <InputRow label="신용대출" value={creditDebt} onChange={setCreditDebt} icon="💳" />
              <InputRow label="기타부채" value={otherDebt} onChange={setOtherDebt} icon="📦" />
              <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between"><span className="text-sm font-semibold text-gray-700">총 부채</span><span className="text-lg font-bold text-red-500">{totalDebt.toLocaleString()}만원</span></div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-3">
              <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-xl">🆘</div><div><h3 className="font-bold text-gray-900">비상예비자금</h3><p className="text-xs text-gray-400">즉시 사용 가능 현금</p></div></div>
              <InputRow label="비상예비자금" value={emergencyFund} onChange={setEmergencyFund} icon="💵" />
              <div className="mt-2 p-3 bg-blue-50 rounded-lg"><p className="text-xs text-blue-700">💡 권장: 월소득 3~6배 ({(totalMonthlyIncome*3).toLocaleString()}~{(totalMonthlyIncome*6).toLocaleString()}만원)</p></div>
            </div>
            <div className={`transform transition-all duration-500 ${showSummary ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-4 border border-teal-200">
                <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-xl text-white">✓</div><div><h3 className="font-bold text-gray-900">📋 기본정보 요약</h3><p className="text-xs text-gray-400">입력 정보 확인</p></div></div>
                <div className="space-y-2">
                  <div className="flex justify-between py-1.5"><span className="text-sm text-gray-600">이름/나이</span><span className="text-sm font-semibold text-gray-900">{name}/{age}세</span></div>
                  <div className="flex justify-between py-1.5"><span className="text-sm text-gray-600">가족구성</span><span className="text-sm font-semibold text-gray-900">{familyCount}명 ({married ? (dualIncome ? '맞벌이' : '외벌이') : '미혼'})</span></div>
                  <div className="flex justify-between py-1.5"><span className="text-sm text-gray-600">월 수입</span><span className="text-sm font-semibold text-emerald-600">{totalMonthlyIncome.toLocaleString()}만원</span></div>
                  <div className="flex justify-between py-1.5"><span className="text-sm text-gray-600">월 지출</span><span className="text-sm font-semibold text-red-500">{totalExpense.toLocaleString()}만원</span></div>
                  <div className="flex justify-between py-1.5"><span className="text-sm text-gray-600">총 자산</span><span className="text-sm font-semibold text-indigo-600">{totalAsset.toLocaleString()}만원</span></div>
                  <div className="flex justify-between py-1.5"><span className="text-sm text-gray-600">총 부채</span><span className="text-sm font-semibold text-red-500">{totalDebt.toLocaleString()}만원</span></div>
                  <div className="flex justify-between py-2 border-t border-teal-200 mt-2"><span className="text-sm font-bold text-gray-900">💎 순자산</span><span className="text-lg font-bold text-teal-600">{netWorth.toLocaleString()}만원</span></div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="p-4 bg-white border-t border-gray-200 flex gap-3">
        <button onClick={goPrev} className="flex-1 py-3.5 rounded-xl bg-gray-100 text-gray-600 font-semibold">이전</button>
        <button onClick={goNext} className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-teal-400 to-teal-600 text-white font-bold shadow-lg shadow-teal-500/30">{currentStep === totalSteps ? '재무설계 시작 →' : '다음'}</button>
      </div>
    </div>
  );
}
