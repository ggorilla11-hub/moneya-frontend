// src/pages/FinancialPlanCards.tsx
// v4.4: handleTaxUpload에 onOpenOCR 호출 로직 추가 (보험설계 handleUpload와 동일 패턴)
// v4.3: 7개 재무설계 카드 컴포넌트
// v4.3 변경: 세금설계 카드 v2.1 (InputRow 외부 분리 + 원천징수영수증 업로드 추가)
// 수정사항:
// 1. 투자설계에 부동산 포트폴리오 추가 (주거용70%, 투자용30%)
// 2. 포트폴리오 제목 옆에 총 금액 표시
// 3. 비상예비자금을 유동성자산에 포함
// v4.0 추가:
// 4. 세금설계 - 원천징수영수증 업로드 UI + 절세 Tip
// 5. 부동산설계 - 주택보유여부 + 주택연금 예상 + Coming Soon
// 6. 보험설계 - 8대 보장 테이블 + 분석 요약
// v4.1 추가:
// 7. 보험설계 - 시뮬레이터 방식 가로스크롤 테이블 + 보험증권 업로드 UI + 준비자금 직접입력 + 부족자금 자동계산/색상표시

import { useState, useEffect } from 'react';
import { saveDesignData, loadDesignData } from './FinancialHouseDesign';

interface CardProps {
  onNext: () => void;
  onPrev: () => void;
  isLast?: boolean;
  onOpenOCR?: () => void;
}

const DisclaimerBox = () => (
  <div className="mt-3 p-2 bg-amber-50 rounded-lg border border-amber-200">
    <p className="text-[10px] text-amber-700 text-center">
      ⚠️ 본 설계는 이해를 돕기 위한 일반적인 예시이므로 참고만 하시기 바랍니다. 이해를 돕기 위해 원가계산방식을 사용하였습니다.
    </p>
  </div>
);

// ============================================
// 1. 은퇴설계 카드
// ============================================
export function RetirePlanCard({ onNext, onPrev }: CardProps) {
  const [formData, setFormData] = useState({
    currentAge: 37, retireAge: 65, monthlyLivingExpense: 300,
    expectedNationalPension: 80, currentPersonalPension: 50, expectedRetirementLumpSum: 10000,
  });
  const [showFormula, setShowFormula] = useState(false);

  useEffect(() => { 
    const saved = loadDesignData('retire'); 
    if (saved) {
      setFormData({
        currentAge: saved.currentAge ?? 37, retireAge: saved.retireAge ?? 65,
        monthlyLivingExpense: saved.monthlyLivingExpense ?? saved.monthlyExpense ?? 300,
        expectedNationalPension: saved.expectedNationalPension ?? saved.nationalPension ?? 80,
        currentPersonalPension: saved.currentPersonalPension ?? saved.personalPension ?? 50,
        expectedRetirementLumpSum: saved.expectedRetirementLumpSum ?? 10000,
      });
    }
  }, []);
  
  useEffect(() => { saveDesignData('retire', formData); }, [formData]);

  const economicYears = formData.retireAge - formData.currentAge;
  const monthlyGap = formData.monthlyLivingExpense - formData.expectedNationalPension - formData.currentPersonalPension;
  const retirementYears = 90 - formData.retireAge;
  const totalRetirementNeeded = monthlyGap * 12 * retirementYears;
  const netRetirementNeeded = totalRetirementNeeded - formData.expectedRetirementLumpSum;
  const monthlyRequiredSaving = netRetirementNeeded > 0 ? Math.round(netRetirementNeeded / economicYears / 12) : 0;
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();

  return (
    <div className="space-y-3">
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">️</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>첫 번째는 <span className="text-teal-600 font-bold">은퇴설계</span>입니다. 노후 준비 상태를 분석해 드릴게요.</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-4 space-y-3 shadow-sm">
        <h3 className="text-base font-bold text-gray-800 mb-3">️ 은퇴설계</h3>
        <div className="space-y-1"><label className="text-sm font-semibold text-gray-700">현재 나이</label><div className="flex items-center gap-2"><input type="number" value={formData.currentAge} onChange={(e) => setFormData({...formData, currentAge: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" /><span className="text-sm text-gray-500 font-medium w-8">세</span></div></div>
        <div className="space-y-1"><label className="text-sm font-semibold text-gray-700">은퇴 예정 나이</label><div className="flex items-center gap-2"><input type="number" value={formData.retireAge} onChange={(e) => setFormData({...formData, retireAge: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" /><span className="text-sm text-gray-500 font-medium w-8">세</span></div></div>
        <div className="space-y-1"><label className="text-sm font-semibold text-gray-700">예상 노후생활비 (월)</label><div className="flex items-center gap-2"><input type="number" value={formData.monthlyLivingExpense} onChange={(e) => setFormData({...formData, monthlyLivingExpense: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" /><span className="text-sm text-gray-500 font-medium w-10">만원</span></div></div>
        <div className="space-y-1"><label className="text-sm font-semibold text-gray-700">예상 국민연금 (월)</label><div className="flex items-center gap-2"><input type="number" value={formData.expectedNationalPension} onChange={(e) => setFormData({...formData, expectedNationalPension: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" /><span className="text-sm text-gray-500 font-medium w-10">만원</span></div></div>
        <div className="space-y-1"><label className="text-sm font-semibold text-gray-700">납입중인 개인연금 (월)</label><div className="flex items-center gap-2"><input type="number" value={formData.currentPersonalPension} onChange={(e) => setFormData({...formData, currentPersonalPension: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" /><span className="text-sm text-gray-500 font-medium w-10">만원</span></div></div>
        <div className="space-y-1"><label className="text-sm font-semibold text-gray-700">예상 퇴직연금 일시금</label><div className="flex items-center gap-2"><input type="number" value={formData.expectedRetirementLumpSum} onChange={(e) => setFormData({...formData, expectedRetirementLumpSum: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" /><span className="text-sm text-gray-500 font-medium w-10">만원</span></div></div>
      </div>
      
      <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-4 space-y-2 border border-teal-200">
        <h3 className="text-sm font-bold text-teal-800 mb-2"> 은퇴설계 분석 결과</h3>
        <div className="flex justify-between text-sm py-1"><span className="text-gray-700">경제활동 기간</span><span className="font-bold text-teal-700">{economicYears}년</span></div>
        <div className="flex justify-between text-sm py-1"><span className="text-gray-700">은퇴 후 기간</span><span className="font-bold text-teal-700">{retirementYears}년</span></div>
        <div className="flex justify-between text-sm py-1"><span className="text-gray-700">월 부족액</span><span className="font-bold text-red-600">{monthlyGap.toLocaleString()}만원</span></div>
        <div className="flex justify-between text-sm py-1"><span className="text-gray-700">은퇴일시금 필요액</span><span className="font-bold text-red-600">{(totalRetirementNeeded / 10000).toFixed(1)}억원</span></div>
        <div className="flex justify-between text-sm py-1"><span className="text-gray-700">예상 퇴직연금 일시금</span><span className="font-bold text-teal-700">{(formData.expectedRetirementLumpSum / 10000).toFixed(1)}억원</span></div>
        <div className="flex justify-between text-sm py-1 border-t border-teal-200 pt-2"><span className="text-gray-700 font-bold">순 은퇴일시금</span><span className="font-bold text-red-600">{(netRetirementNeeded / 10000).toFixed(1)}억원</span></div>
        <div className="bg-white rounded-lg p-3 mt-2 border border-teal-300"><div className="flex justify-between items-center"><span className="text-sm text-gray-700 font-bold"> 월 저축연금액</span><span className="font-bold text-teal-600 text-lg">{monthlyRequiredSaving.toLocaleString()}만원</span></div></div>
        <button onClick={() => setShowFormula(!showFormula)} className="w-full text-left text-xs text-teal-600 font-medium mt-2 flex items-center gap-1 hover:text-teal-800 transition-colors"><span> 계산 방법 보기</span><span className="text-sm">{showFormula ? '▲' : '▼'}</span></button>
        {showFormula && (
          <div className="bg-white/70 rounded-lg p-3 mt-1 text-xs text-gray-600 space-y-1 border border-teal-200">
            <p><strong>공식:</strong></p>
            <p>① 월 부족액 = 노후생활비 - 국민연금 - 개인연금 = {monthlyGap}만원</p>
            <p>② 은퇴일시금 = {monthlyGap}만원 × 12개월 × {retirementYears}년 = {(totalRetirementNeeded / 10000).toFixed(1)}억원</p>
            <p>③ 순 은퇴일시금 = {(totalRetirementNeeded / 10000).toFixed(1)}억 - {(formData.expectedRetirementLumpSum / 10000).toFixed(1)}억 = {(netRetirementNeeded / 10000).toFixed(1)}억원</p>
            <p>④ 월 저축연금액 = {(netRetirementNeeded / 10000).toFixed(1)}억 ÷ {economicYears}년 ÷ 12 = {monthlyRequiredSaving}만원</p>
          </div>
        )}
      </div>
      <DisclaimerBox />
      <div className="flex gap-2 pt-2">
        <button onClick={onPrev} className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-300 transition-colors">← 이전</button>
        <button onClick={onNext} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold text-sm hover:from-teal-600 hover:to-teal-700 transition-colors">다음 →</button>
      </div>
    </div>
  );
}
// ============================================
// 2. 부채설계 카드
// ============================================
interface DebtItem {
  id: string;
  name: string;
  amount: number;
  rate: number;
  type: 'mortgage' | 'credit' | 'other';
}

export function DebtPlanCard({ onNext, onPrev }: CardProps) {
  const [showFormula, setShowFormula] = useState(false);
  const [debtData, setDebtData] = useState<{
    mortgageDebts: DebtItem[]; creditDebts: DebtItem[]; otherDebts: DebtItem[];
    emergencyFund: number; totalMortgageDebt: number; totalCreditDebt: number; totalOtherDebt: number; totalDebt: number;
  }>({ mortgageDebts: [], creditDebts: [], otherDebts: [], emergencyFund: 0, totalMortgageDebt: 0, totalCreditDebt: 0, totalOtherDebt: 0, totalDebt: 0 });
  const [monthlyIncome, setMonthlyIncome] = useState(500);

  useEffect(() => {
    const savedHouseData = localStorage.getItem('financialHouseData');
    if (savedHouseData) {
      try {
        const parsed = JSON.parse(savedHouseData);
        if (parsed.debts) {
          setDebtData({
            mortgageDebts: (parsed.debts.mortgageDebts || []).map((d: DebtItem) => ({ ...d, type: 'mortgage' as const })),
            creditDebts: (parsed.debts.creditDebts || []).map((d: DebtItem) => ({ ...d, type: 'credit' as const })),
            otherDebts: (parsed.debts.otherDebts || []).map((d: DebtItem) => ({ ...d, type: 'other' as const })),
            emergencyFund: parsed.debts.emergencyFund || 0, totalMortgageDebt: parsed.debts.totalMortgageDebt || 0,
            totalCreditDebt: parsed.debts.totalCreditDebt || 0, totalOtherDebt: parsed.debts.totalOtherDebt || 0, totalDebt: parsed.debts.totalDebt || 0,
          });
        }
        if (parsed.income?.myIncome) { setMonthlyIncome(parsed.income.myIncome + (parsed.income.spouseIncome || 0) + (parsed.income.otherIncome || 0)); }
      } catch (e) { console.error('Failed to parse financialHouseData:', e); }
    }
    const savedDebtDesign = loadDesignData('debt');
    if (savedDebtDesign?.monthlyIncome) { setMonthlyIncome(savedDebtDesign.monthlyIncome); }
  }, []);

  const generateRepaymentPriority = (): DebtItem[] => {
    const allDebts: DebtItem[] = [];
    const sortedCreditDebts = [...debtData.creditDebts].filter(d => d.amount > 0).sort((a, b) => a.amount - b.amount);
    allDebts.push(...sortedCreditDebts);
    const sortedOtherDebts = [...debtData.otherDebts].filter(d => d.amount > 0).sort((a, b) => a.amount - b.amount);
    allDebts.push(...sortedOtherDebts);
    const sortedMortgageDebts = [...debtData.mortgageDebts].filter(d => d.amount > 0).sort((a, b) => b.rate - a.rate);
    allDebts.push(...sortedMortgageDebts);
    return allDebts;
  };

  const repaymentPriority = generateRepaymentPriority();
  const totalDebt = debtData.totalDebt;
  const estimatedMonthlyPayment = Math.round(totalDebt / 240);
  const dsr = monthlyIncome > 0 ? (estimatedMonthlyPayment / monthlyIncome * 100) : 0;
  let dsrLevel = '', dsrColor = '', dsrBgColor = '';
  if (dsr < 40) { dsrLevel = '안전'; dsrColor = 'text-green-600'; dsrBgColor = 'bg-green-50 border-green-200'; }
  else if (dsr < 50) { dsrLevel = '주의'; dsrColor = 'text-yellow-600'; dsrBgColor = 'bg-yellow-50 border-yellow-200'; }
  else { dsrLevel = '위험'; dsrColor = 'text-red-600'; dsrBgColor = 'bg-red-50 border-red-200'; }

  const getTypeLabel = (type: string) => { switch (type) { case 'mortgage': return '담보'; case 'credit': return '신용'; case 'other': return '기타'; default: return ''; } };
  const getTypeColor = (type: string) => { switch (type) { case 'mortgage': return 'bg-blue-100 text-blue-700'; case 'credit': return 'bg-red-100 text-red-700'; default: return 'bg-gray-100 text-gray-700'; } };

  return (
    <div className="space-y-3">
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0"></div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>두 번째는 <span className="text-teal-600 font-bold">부채설계</span>입니다. 대출상환 우선순위를 분석해 드릴게요.</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-base font-bold text-gray-800 mb-3"> 부채 현황</h3>
        <div className="space-y-2">
          {debtData.totalCreditDebt > 0 && (<div className="flex justify-between text-sm py-1"><span className="text-gray-600"> 신용대출 ({debtData.creditDebts.length}건)</span><span className="font-bold text-red-600">{debtData.totalCreditDebt.toLocaleString()}만원</span></div>)}
          {debtData.totalOtherDebt > 0 && (<div className="flex justify-between text-sm py-1"><span className="text-gray-600"> 기타부채 ({debtData.otherDebts.length}건)</span><span className="font-bold text-gray-600">{debtData.totalOtherDebt.toLocaleString()}만원</span></div>)}
          {debtData.totalMortgageDebt > 0 && (<div className="flex justify-between text-sm py-1"><span className="text-gray-600"> 담보대출 ({debtData.mortgageDebts.length}건)</span><span className="font-bold text-blue-600">{debtData.totalMortgageDebt.toLocaleString()}만원</span></div>)}
          <div className="flex justify-between text-sm py-2 border-t border-gray-200 mt-2"><span className="font-bold text-gray-800">총 부채</span><span className="font-bold text-purple-700 text-lg">{totalDebt > 0 ? (totalDebt / 10000).toFixed(1) + '억원' : '0원'}</span></div>
        </div>
      </div>
      
      {totalDebt > 0 && (
        <div className={`rounded-xl p-4 border ${dsrBgColor}`}>
          <div className="flex justify-between items-center"><span className="text-sm font-semibold text-gray-700"> DSR (추정)</span><span className={`font-bold text-lg ${dsrColor}`}>{dsr.toFixed(1)}% ({dsrLevel})</span></div>
          <p className="text-xs text-gray-500 mt-1">월소득 {monthlyIncome.toLocaleString()}만원 기준</p>
        </div>
      )}
      
      {repaymentPriority.length > 0 ? (
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
          <h3 className="text-sm font-bold text-purple-800 mb-3"> 대출상환 우선순위</h3>
          <div className="space-y-2">
            {repaymentPriority.map((debt, index) => (
              <div key={debt.id} className="flex items-center gap-2 bg-white rounded-lg p-2.5">
                <div className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{index + 1}</div>
                <div className="flex-1 min-w-0"><div className="flex items-center gap-1.5"><span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${getTypeColor(debt.type)}`}>{getTypeLabel(debt.type)}</span><span className="text-sm font-medium text-gray-800 truncate">{debt.name || '무명'}</span></div></div>
                <div className="text-right flex-shrink-0"><div className="text-sm font-bold text-gray-800">{debt.amount.toLocaleString()}만원</div><div className="text-[10px] text-gray-500">{debt.rate}%</div></div>
              </div>
            ))}
          </div>
          <div className="mt-3 p-3 bg-white/70 rounded-lg"><p className="text-xs text-purple-800 font-semibold mb-1"> 상환 전략</p><p className="text-[11px] text-gray-600 leading-relaxed">1️⃣ <strong>신용대출</strong>부터 상환 (금액 작은 순)<br/>2️⃣ <strong>기타부채</strong> 상환<br/>3️⃣ <strong>담보대출</strong>은 이자율 높은 순으로 상환</p></div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200 text-center"><span className="text-4xl"></span><p className="text-sm font-bold text-green-700 mt-2">부채가 없습니다!</p><p className="text-xs text-green-600">건전한 재무 상태입니다.</p></div>
      )}
      
      <button onClick={() => setShowFormula(!showFormula)} className="w-full text-left text-xs text-teal-600 font-medium flex items-center gap-1 hover:text-teal-800 transition-colors"><span> 상환 우선순위 기준 보기</span><span>{showFormula ? '▲' : '▼'}</span></button>
      {showFormula && (<div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-1 border border-gray-200"><p><strong>상환 우선순위 기준:</strong></p><p>① 신용대출: 금액이 작은 것부터 (스노우볼 효과)</p><p>② 기타부채: 금액이 작은 것부터</p><p>③ 담보대출: 이자율이 높은 것부터 (이자 절감)</p></div>)}
      <DisclaimerBox />
      <div className="flex gap-2 pt-2">
        <button onClick={onPrev} className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-300 transition-colors">← 이전</button>
        <button onClick={onNext} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold text-sm hover:from-teal-600 hover:to-teal-700 transition-colors">다음 →</button>
      </div>
    </div>
  );
}
// ============================================
// 3. 저축설계 카드
// ============================================
const savingPurposeOptions = [
  { id: 'house', label: ' 내집마련', icon: '' }, { id: 'education', label: ' 자녀교육', icon: '' },
  { id: 'car', label: ' 자동차', icon: '' }, { id: 'travel', label: '✈️ 여행', icon: '✈️' },
  { id: 'wedding', label: ' 결혼', icon: '' }, { id: 'emergency', label: ' 비상금', icon: '' },
  { id: 'retirement', label: '️ 노후자금', icon: '️' }, { id: 'other', label: ' 기타목적', icon: '' },
];

export function SavePlanCard({ onNext, onPrev }: CardProps) {
  const [showFormula, setShowFormula] = useState(false);
  const [formData, setFormData] = useState({ purpose: 'house', targetAmount: 10000, targetYears: 5 });
  const [basicData, setBasicData] = useState({ age: 37, cmaAmount: 0, savingsAmount: 0, fundAmount: 0, housingSubAmount: 0, isaAmount: 0, pensionAmount: 0 });

  useEffect(() => {
    const savedHouseData = localStorage.getItem('financialHouseData');
    if (savedHouseData) {
      try {
        const parsed = JSON.parse(savedHouseData);
        setBasicData({
          age: parsed.personalInfo?.age || 37, cmaAmount: parsed.expense?.cmaAmount || 0, savingsAmount: parsed.expense?.savingsAmount || 0,
          fundAmount: parsed.expense?.fundAmount || 0, housingSubAmount: parsed.expense?.housingSubAmount || 0, isaAmount: parsed.expense?.isaAmount || 0, pensionAmount: parsed.expense?.pensionAmount || 0,
        });
      } catch (e) { console.error('Failed to parse financialHouseData:', e); }
    }
    const saved = loadDesignData('save');
    if (saved?.purpose) { setFormData(saved); }
  }, []);

  useEffect(() => { saveDesignData('save', formData); }, [formData]);

  const targetMonths = formData.targetYears * 12;
  const monthlyRequired = Math.round(formData.targetAmount / targetMonths);
  const currentTotalSaving = basicData.cmaAmount + basicData.savingsAmount + basicData.fundAmount + basicData.housingSubAmount + basicData.isaAmount;
  const additionalRequired = Math.max(0, monthlyRequired - currentTotalSaving);
  const getTermCategory = (years: number) => { if (years <= 1) return 'immediate'; if (years <= 3) return 'short'; if (years <= 5) return 'mid'; return 'long'; };
  const termCategory = getTermCategory(formData.targetYears);

  const generatePortfolio = () => {
    const items = [];
    items.push({ term: '수시', product: 'CMA', existing: basicData.cmaAmount, additional: termCategory === 'immediate' ? additionalRequired : 0 });
    items.push({ term: '1~3년', product: '적금', existing: basicData.savingsAmount, additional: termCategory === 'short' ? additionalRequired : 0 });
    items.push({ term: '3~5년', product: 'ISA', existing: basicData.isaAmount, additional: termCategory === 'mid' ? additionalRequired : 0 });
    items.push({ term: '5년+', product: '연금/펀드/ETF', existing: basicData.pensionAmount + basicData.fundAmount, additional: termCategory === 'long' ? additionalRequired : 0 });
    return items;
  };
  const portfolio = generatePortfolio();
  const formatTargetAmount = (amount: number) => amount >= 10000 ? `${(amount / 10000).toFixed(1)}억원` : `${amount.toLocaleString()}만원`;
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();

  return (
    <div className="space-y-3">
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0"></div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>세 번째는 <span className="text-teal-600 font-bold">저축설계</span>입니다. 목적자금별로 저축 계획을 세워볼까요?</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-base font-bold text-gray-800 mb-3"> 저축설계</h3>
        <div className="mb-4"><label className="text-sm font-semibold text-gray-700 block mb-2"> 저축 목적</label>
          <div className="flex flex-wrap gap-2">
            {savingPurposeOptions.map(option => (
              <button key={option.id} onClick={() => setFormData({...formData, purpose: option.id})} className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-colors ${formData.purpose === option.id ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>{option.label}</button>
            ))}
          </div>
        </div>
        <div className="mb-3"><label className="text-sm font-semibold text-gray-700 block mb-1"> 목표 금액</label><div className="flex items-center gap-2"><input type="number" value={formData.targetAmount} onChange={(e) => setFormData({...formData, targetAmount: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" /><span className="text-sm text-gray-500 font-medium w-10">만원</span></div></div>
        <div><label className="text-sm font-semibold text-gray-700 block mb-1"> 목표 기간</label><div className="flex items-center gap-2"><input type="number" value={formData.targetYears} onChange={(e) => setFormData({...formData, targetYears: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" /><span className="text-sm text-gray-500 font-medium w-8">년</span></div></div>
      </div>
      
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
        <h3 className="text-sm font-bold text-blue-800 mb-3"> 저축 계획 분석</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm py-1"><span className="text-gray-700">목표 금액</span><span className="font-bold text-blue-700">{formatTargetAmount(formData.targetAmount)}</span></div>
          <div className="flex justify-between text-sm py-1"><span className="text-gray-700">목표 기간</span><span className="font-bold text-blue-700">{formData.targetYears}년 ({targetMonths}개월)</span></div>
          <div className="flex justify-between text-sm py-1 border-t border-blue-200 pt-2"><span className="text-gray-700">월 필요 저축액</span><span className="font-bold text-blue-600 text-lg">약 {monthlyRequired.toLocaleString()}만원</span></div>
          <div className="flex justify-between text-sm py-1"><span className="text-gray-700">현재 월 저축액</span><span className="font-bold text-gray-700">{currentTotalSaving.toLocaleString()}만원</span></div>
          <div className="flex justify-between text-sm py-1 border-t border-blue-200 pt-2"><span className="text-gray-700 font-bold">월 추가 필요액</span><span className={`font-bold text-lg ${additionalRequired > 0 ? 'text-red-600' : 'text-green-600'}`}>{additionalRequired > 0 ? `${additionalRequired.toLocaleString()}만원` : '충분함 ✓'}</span></div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <h3 className="text-sm font-bold text-gray-800 mb-3"> 추천 배분</h3>
        <div className="space-y-2">
          {portfolio.map((item, index) => {
            const hasExisting = item.existing > 0; const hasAdditional = item.additional > 0;
            if (!hasExisting && !hasAdditional) return null;
            return (
              <div key={index} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2.5">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${index < 2 ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{index < 2 ? '저축' : '투자'}</span>
                <div className="flex-1"><div className="text-sm font-medium text-gray-800">{item.term} · {item.product}</div></div>
                <div className="text-right">{hasExisting && (<span className="text-sm font-bold text-blue-600">{item.existing.toLocaleString()}만원</span>)}{hasExisting && hasAdditional && <span className="text-gray-400 mx-1">+</span>}{hasAdditional && (<span className="text-sm font-bold text-red-600">{item.additional.toLocaleString()}만원</span>)}</div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-center gap-4 mt-3 pt-2 border-t border-gray-100"><span className="text-[10px] text-blue-600">● 기존 유지</span><span className="text-[10px] text-red-600">● 신규 추가</span></div>
      </div>
      
      <button onClick={() => setShowFormula(!showFormula)} className="w-full text-left text-xs text-teal-600 font-medium flex items-center gap-1 hover:text-teal-800 transition-colors"><span> 계산 방법 보기</span><span>{showFormula ? '▲' : '▼'}</span></button>
      {showFormula && (<div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-1 border border-gray-200"><p><strong>월 필요 저축액:</strong> = 목표금액 ÷ 목표기간(개월)</p><p className="mt-2"><strong>기간별 상품 배분:</strong></p><p>• 수시: CMA / 1~3년: 적금 / 3~5년: ISA / 5년+: 연금/펀드/ETF</p></div>)}
      <DisclaimerBox />
      <div className="flex gap-2 pt-2">
        <button onClick={onPrev} className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-300 transition-colors">← 이전</button>
        <button onClick={onNext} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold text-sm hover:from-teal-600 hover:to-teal-700 transition-colors">다음 →</button>
      </div>
    </div>
  );
}
// ============================================
// 4. 투자설계 카드 (v3.0 - 부동산 포트폴리오 추가, 비상예비자금 유동성 포함)
// ============================================
export function InvestPlanCard({ onNext, onPrev }: CardProps) {
  const [showFormula, setShowFormula] = useState(false);
  const [formData, setFormData] = useState({
    currentAge: 37, monthlyIncome: 500, totalAssets: 25000, totalDebt: 10000,
    liquidAssets: 1500, safeAssets: 10000, growthAssets: 2500, highRiskAssets: 1000,
    emergencyFund: 0, residentialRealEstate: 0, investmentRealEstate: 0, dualIncome: false,
  });

  useEffect(() => {
    let baseData = { currentAge: 37, monthlyIncome: 500, totalAssets: 25000, totalDebt: 10000, liquidAssets: 1500, safeAssets: 10000, growthAssets: 2500, highRiskAssets: 1000, emergencyFund: 0, residentialRealEstate: 0, investmentRealEstate: 0, dualIncome: false };
    const saved = loadDesignData('invest');
    if (saved) { baseData = { ...baseData, currentAge: saved.currentAge || baseData.currentAge, monthlyIncome: saved.monthlyIncome || baseData.monthlyIncome, totalAssets: saved.totalAssets || baseData.totalAssets, totalDebt: saved.totalDebt || baseData.totalDebt }; }
    
    const savedHouseData = localStorage.getItem('financialHouseData');
    if (savedHouseData) {
      try {
        const parsed = JSON.parse(savedHouseData);
        const fa = parsed.financialAssets || {};
        const debts = parsed.debts || {};
        const realEstate = parsed.realEstateAssets || {};
        const emergencyFundValue = debts.emergencyFund || 0;
        const liquidAssets = (fa.cmaAsset || 0) + (fa.goldAsset || 0) + emergencyFundValue;
        const safeAssets = (fa.depositAsset || 0) + (fa.bondAsset || 0) + (fa.installmentAsset || 0) + (fa.pensionAsset || 0) + (fa.savingsAsset || 0);
        const growthAssets = (fa.fundSavingsAsset || 0) + (fa.etfAsset || 0);
        const highRiskAssets = (fa.stockAsset || 0) + (fa.cryptoAsset || 0);
        const monthlyIncome = (parsed.income?.myIncome || 0) + (parsed.income?.spouseIncome || 0) + (parsed.income?.otherIncome || 0);
        const residentialRealEstate = realEstate.residentialRealEstate || 0;
        const investmentRealEstate = realEstate.investmentRealEstate || 0;
        const dualIncome = parsed.personalInfo?.dualIncome ?? false;
        
        baseData = { ...baseData, dualIncome };
        
        const hasFinancialAssets = liquidAssets > 0 || safeAssets > 0 || growthAssets > 0 || highRiskAssets > 0;
        if (hasFinancialAssets || residentialRealEstate > 0 || investmentRealEstate > 0) {
          baseData = { ...baseData, currentAge: parsed.personalInfo?.age || baseData.currentAge, monthlyIncome: monthlyIncome || baseData.monthlyIncome, totalAssets: parsed.totalAsset || baseData.totalAssets, totalDebt: parsed.debts?.totalDebt || baseData.totalDebt, liquidAssets, safeAssets, growthAssets, highRiskAssets, emergencyFund: emergencyFundValue, residentialRealEstate, investmentRealEstate };
        }
      } catch (e) { console.error('Failed to parse financialHouseData:', e); }
    }
    setFormData(baseData);
  }, []);

  useEffect(() => { saveDesignData('invest', formData); }, [formData]);

  const totalFinancialAssets = formData.liquidAssets + formData.safeAssets + formData.growthAssets + formData.highRiskAssets;
  const totalRealEstateAssets = formData.residentialRealEstate + formData.investmentRealEstate;
  const netAssets = formData.totalAssets - formData.totalDebt;
  const wealthIndex = formData.currentAge > 0 && formData.monthlyIncome > 0 ? ((netAssets * 10) / (formData.currentAge * formData.monthlyIncome * 12)) * 100 : 0;
  
  const getWealthGrade = (index: number) => {
    if (index >= 200) return { grade: '궁전', icon: '', color: 'text-purple-600', bgColor: 'bg-purple-100' };
    if (index >= 100) return { grade: '4단계', icon: '️', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (index >= 50) return { grade: '3단계', icon: '', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (index >= 0) return { grade: '2단계', icon: '', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { grade: '텐트', icon: '️', color: 'text-red-600', bgColor: 'bg-red-100' };
  };
  const wealthGrade = getWealthGrade(wealthIndex);
  
  const targetRatios = { liquid: 20, safe: 50, growth: 20, highRisk: 10 };
  const targetAmounts = { liquid: Math.round(totalFinancialAssets * 0.20), safe: Math.round(totalFinancialAssets * 0.50), growth: Math.round(totalFinancialAssets * 0.20), highRisk: Math.round(totalFinancialAssets * 0.10) };
  const realEstateTargetRatios = { residential: 70, investment: 30 };
  const realEstateTargetAmounts = { residential: Math.round(totalRealEstateAssets * 0.70), investment: Math.round(totalRealEstateAssets * 0.30) };
  
  const emergencyFundMonths = formData.dualIncome ? 3 : 6;
  const emergencyFundRequired = formData.monthlyIncome * emergencyFundMonths;
  const emergencyGap = emergencyFundRequired - formData.emergencyFund;
  const hasEmergencyFund = formData.emergencyFund >= emergencyFundRequired;
  const formatAmount = (amount: number) => amount >= 10000 ? `${(amount / 10000).toFixed(1)}억` : `${amount.toLocaleString()}만`;
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();

  const assetAllocation = [
    { type: '유동성', icon: '', iconBg: 'bg-blue-100', current: formData.liquidAssets, ratio: targetRatios.liquid, target: targetAmounts.liquid, note: 'CMA, 금, 비상예비자금', status: formData.liquidAssets >= targetAmounts.liquid ? 'ok' : 'under' },
    { type: '안전성', icon: '', iconBg: 'bg-green-100', current: formData.safeAssets, ratio: targetRatios.safe, target: targetAmounts.safe, note: '예금, 채권, 연금', status: formData.safeAssets > targetAmounts.safe * 1.1 ? 'over' : 'ok' },
    { type: '수익성', icon: '', iconBg: 'bg-orange-100', current: formData.growthAssets, ratio: targetRatios.growth, target: targetAmounts.growth, note: '펀드, ETF', status: formData.growthAssets >= targetAmounts.growth ? 'ok' : 'under' },
    { type: '고수익', icon: '', iconBg: 'bg-red-100', current: formData.highRiskAssets, ratio: targetRatios.highRisk, target: targetAmounts.highRisk, note: '주식, 가상화폐', status: formData.highRiskAssets > targetAmounts.highRisk * 1.5 ? 'over' : 'ok' },
  ];
  const realEstateAllocation = [
    { type: '주거용', icon: '', iconBg: 'bg-indigo-100', current: formData.residentialRealEstate, ratio: realEstateTargetRatios.residential, target: realEstateTargetAmounts.residential, note: '아파트, 빌라, 단독' },
    { type: '투자용', icon: '', iconBg: 'bg-purple-100', current: formData.investmentRealEstate, ratio: realEstateTargetRatios.investment, target: realEstateTargetAmounts.investment, note: '건물, 주택, 토지, 기타' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0"></div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>네 번째는 <span className="text-teal-600 font-bold">투자설계</span>입니다. 부자지수와 자산배분 포트폴리오를 분석해 드릴게요.</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-base font-bold text-gray-800 mb-3"> 투자설계</h3>
        <div className="space-y-2">
          <div className="flex items-center"><label className="text-sm font-semibold text-gray-700 w-20">현재 나이</label><input type="number" value={formData.currentAge} onChange={(e) => setFormData({...formData, currentAge: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus:border-teal-500 outline-none" /><span className="text-sm text-gray-500 w-12 text-right">세</span></div>
          <div className="flex items-center"><label className="text-sm font-semibold text-gray-700 w-20">월 소득</label><input type="number" value={formData.monthlyIncome} onChange={(e) => setFormData({...formData, monthlyIncome: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus:border-teal-500 outline-none" /><span className="text-sm text-gray-500 w-12 text-right">만원</span></div>
          <div className="flex items-center"><label className="text-sm font-semibold text-gray-700 w-20">총 자산</label><input type="number" value={formData.totalAssets} onChange={(e) => setFormData({...formData, totalAssets: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus:border-teal-500 outline-none" /><span className="text-sm text-gray-500 w-12 text-right">만원</span></div>
          <div className="flex items-center"><label className="text-sm font-semibold text-gray-700 w-20">총 부채</label><input type="number" value={formData.totalDebt} onChange={(e) => setFormData({...formData, totalDebt: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus:border-teal-500 outline-none" /><span className="text-sm text-gray-500 w-12 text-right">만원</span></div>
        </div>
        <div className="border-t border-gray-200 pt-3 mt-3">
          <h4 className="text-sm font-bold text-gray-700 mb-2">금융자산 배분 입력</h4>
          <div className="space-y-2">
            <div className="flex items-center"><label className="text-sm text-gray-700 w-20"> 유동성</label><input type="number" value={formData.liquidAssets} onChange={(e) => setFormData({...formData, liquidAssets: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus:border-teal-500 outline-none" /><span className="text-sm text-gray-500 w-12 text-right">만원</span></div>
            <p className="text-[10px] text-gray-400 ml-20">CMA, 파킹통장, 금, 비상예비자금</p>
            <div className="flex items-center"><label className="text-sm text-gray-700 w-20"> 안전성</label><input type="number" value={formData.safeAssets} onChange={(e) => setFormData({...formData, safeAssets: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus:border-teal-500 outline-none" /><span className="text-sm text-gray-500 w-12 text-right">만원</span></div>
            <p className="text-[10px] text-gray-400 ml-20">예금, 채권, 연금</p>
            <div className="flex items-center"><label className="text-sm text-gray-700 w-20"> 수익성</label><input type="number" value={formData.growthAssets} onChange={(e) => setFormData({...formData, growthAssets: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus:border-teal-500 outline-none" /><span className="text-sm text-gray-500 w-12 text-right">만원</span></div>
            <p className="text-[10px] text-gray-400 ml-20">펀드, ETF</p>
            <div className="flex items-center"><label className="text-sm text-gray-700 w-20"> 고수익</label><input type="number" value={formData.highRiskAssets} onChange={(e) => setFormData({...formData, highRiskAssets: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus:border-teal-500 outline-none" /><span className="text-sm text-gray-500 w-12 text-right">만원</span></div>
            <p className="text-[10px] text-gray-400 ml-20">주식, 코인</p>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
        <div className="text-center">
          <p className="text-sm font-bold text-purple-800 mb-2"> 나의 부자지수</p>
          <p className={`text-4xl font-bold ${wealthGrade.color}`}>{wealthIndex.toFixed(0)}%</p>
          <div className={`inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full ${wealthGrade.bgColor}`}><span className="text-xl">{wealthGrade.icon}</span><span className={`font-bold ${wealthGrade.color}`}>{wealthGrade.grade}</span></div>
          <p className="text-[10px] text-gray-500 mt-2">순자산 {formatAmount(netAssets)} 기준</p>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-2 text-[10px] text-gray-600 flex flex-wrap gap-2 justify-center"><span>️ 0%↓</span><span> 50%↓</span><span> 100%↓</span><span>️ 200%↓</span><span> 200%↑</span></div>
      
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-50 to-teal-100 px-3 py-2 border-b border-gray-200 flex justify-between items-center"><span className="text-sm font-bold text-teal-800"> 금융자산 포트폴리오</span><span className="text-sm font-bold text-teal-600">{formatAmount(totalFinancialAssets)}원</span></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ minWidth: '420px' }}>
            <thead><tr className="bg-gray-50"><th className="px-2 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">자산유형</th><th className="px-2 py-2 text-right font-semibold text-gray-600 whitespace-nowrap">현재금액</th><th className="px-2 py-2 text-center font-semibold text-gray-600 whitespace-nowrap">기준비율</th><th className="px-2 py-2 text-right font-semibold text-gray-600 whitespace-nowrap">기준금액</th><th className="px-2 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">비고</th></tr></thead>
            <tbody>
              {assetAllocation.map((item, index) => (
                <tr key={index} className="border-t border-gray-100">
                  <td className="px-2 py-2"><div className="flex items-center gap-1.5"><span className={`w-6 h-6 rounded-full ${item.iconBg} flex items-center justify-center text-sm`}>{item.icon}</span><span className="font-medium whitespace-nowrap">{item.type}</span></div></td>
                  <td className={`px-2 py-2 text-right font-bold whitespace-nowrap ${item.status === 'under' ? 'text-red-500' : item.status === 'over' ? 'text-yellow-600' : 'text-gray-800'}`}>{formatAmount(item.current)}</td>
                  <td className="px-2 py-2 text-center text-gray-600 whitespace-nowrap">{item.ratio}%</td>
                  <td className="px-2 py-2 text-right text-gray-600 whitespace-nowrap">{formatAmount(item.target)}</td>
                  <td className="px-2 py-2 text-left text-gray-500 text-[10px] whitespace-nowrap">{item.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-center py-1 bg-gray-50 border-t border-gray-100"><span className="text-[10px] text-gray-400">← 좌우로 스크롤하세요 →</span></div>
      </div>
      
      {totalRealEstateAssets > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 px-3 py-2 border-b border-gray-200 flex justify-between items-center"><span className="text-sm font-bold text-indigo-800"> 부동산 포트폴리오</span><span className="text-sm font-bold text-indigo-600">{formatAmount(totalRealEstateAssets)}원</span></div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{ minWidth: '420px' }}>
              <thead><tr className="bg-gray-50"><th className="px-2 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">부동산유형</th><th className="px-2 py-2 text-right font-semibold text-gray-600 whitespace-nowrap">현재금액</th><th className="px-2 py-2 text-center font-semibold text-gray-600 whitespace-nowrap">기준비율</th><th className="px-2 py-2 text-right font-semibold text-gray-600 whitespace-nowrap">기준금액</th><th className="px-2 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">비고</th></tr></thead>
              <tbody>
                {realEstateAllocation.map((item, index) => (
                  <tr key={index} className="border-t border-gray-100">
                    <td className="px-2 py-2"><div className="flex items-center gap-1.5"><span className={`w-6 h-6 rounded-full ${item.iconBg} flex items-center justify-center text-sm`}>{item.icon}</span><span className="font-medium whitespace-nowrap">{item.type}</span></div></td>
                    <td className="px-2 py-2 text-right font-bold whitespace-nowrap text-gray-800">{formatAmount(item.current)}</td>
                    <td className="px-2 py-2 text-center text-gray-600 whitespace-nowrap">{item.ratio}%</td>
                    <td className="px-2 py-2 text-right text-gray-600 whitespace-nowrap">{formatAmount(item.target)}</td>
                    <td className="px-2 py-2 text-left text-gray-500 text-[10px] whitespace-nowrap">{item.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-center py-1 bg-gray-50 border-t border-gray-100"><span className="text-[10px] text-gray-400">← 좌우로 스크롤하세요 →</span></div>
        </div>
      )}
      
      <div className={`rounded-xl p-3 flex items-center gap-3 ${hasEmergencyFund ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <span className="text-2xl"></span>
        <div className="flex-1">
          <p className={`text-sm font-bold ${hasEmergencyFund ? 'text-green-700' : 'text-red-700'}`}>비상예비자금: {hasEmergencyFund ? '확보 ✅' : '부족 ❌'}</p>
          <p className="text-xs text-gray-600">필요액: {emergencyFundRequired.toLocaleString()}만원 ({formData.dualIncome ? '맞벌이 3개월' : '외벌이 6개월'}치)</p>
          <p className="text-xs text-blue-600 mt-1">입력한 비상예비자금: {formData.emergencyFund.toLocaleString()}만원 (유동성에 포함됨)</p>
          {!hasEmergencyFund && (<p className="text-xs mt-1">부족액: <span className="font-bold text-red-600">{emergencyGap.toLocaleString()}만원</span></p>)}
        </div>
      </div>
      
      <button onClick={() => setShowFormula(!showFormula)} className="w-full text-left text-xs text-teal-600 font-medium flex items-center gap-1 hover:text-teal-800 transition-colors"><span> 계산 방법 보기</span><span>{showFormula ? '▲' : '▼'}</span></button>
      {showFormula && (<div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-1 border border-gray-200"><p><strong>부자지수 공식:</strong> ((순자산 × 10) ÷ (나이 × 월소득 × 12)) × 100</p><p className="mt-2"><strong>금융자산 배분 기준:</strong> 유동성 20% / 안전성 50% / 수익성 20% / 고수익 10%</p><p className="mt-2"><strong>부동산 배분 기준:</strong> 주거용 70% / 투자용 30%</p></div>)}
      <DisclaimerBox />
      <div className="flex gap-2 pt-2">
        <button onClick={onPrev} className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-300 transition-colors">← 이전</button>
        <button onClick={onNext} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold text-sm hover:from-teal-600 hover:to-teal-700 transition-colors">다음 →</button>
      </div>
    </div>
  );
}

// ============================================
// TaxInputRow - 세금설계 전용 입력 행 (외부 컴포넌트)
// TaxPlanCard 밖에 정의하여 불필요한 re-mount 방지
// ============================================
const TaxInputRow = ({ label, value, onChange, unit = '만원', badge, badgeColor }: { 
  label: string; value: number; onChange: (v: number) => void; unit?: string; badge?: string; badgeColor?: string;
}) => {
  const handleFocusInput = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();
  return (
    <div className="flex items-center gap-2 py-1.5">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-600 truncate">{label}</span>
          {badge && <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${badgeColor || 'bg-blue-100 text-blue-600'}`}>{badge}</span>}
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} onFocus={handleFocusInput}
          className="w-28 px-2 py-1.5 border border-gray-300 rounded-lg text-xs text-right focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" />
        <span className="text-[10px] text-gray-400 w-6">{unit}</span>
      </div>
    </div>
  );
};

// ============================================
// 5. 세금설계 카드 (v2.2)
// v2.2 변경: handleTaxUpload에 onOpenOCR 호출 로직 추가 (보험설계 handleUpload와 동일 패턴)
// v2.1 변경: InputRow 외부 분리 (입력 오류 수정) + 원천징수영수증 업로드 UI 추가
// - 종합소득세: 시뮬레이터 기반 연봉/결정세액/기납부세액 → 환급금 + 소득공제/세액공제 시뮬레이션
// - 예상상속세: 1단계 재무정보 연동 순자산 → 상속세 산출 + 72법칙 시뮬레이션
// ============================================
export function TaxPlanCard({ onNext, onPrev, onOpenOCR }: CardProps) {
  const [activeTab, setActiveTab] = useState<'income' | 'inheritance'>('income');
  
  // ── 종합소득세 절세 state ──
  const [incomeData, setIncomeData] = useState({
    annualSalary: 6240,      // 총급여 (만원)
    determinedTax: 200,      // 결정세액 (만원)
    prepaidTax: 300,         // 기납부세액 (만원)
    // 소득공제 항목
    selfDeduction: 150,      // 본인공제 (만원)
    dependentCount: 0,       // 부양가족 수
    nationalPension: 0,      // 국민연금보험료 (만원)
    healthInsurance: 0,      // 건강보험료 (만원)
    employInsurance: 0,      // 고용보험료 (만원)
    housingSubscription: 0,  // 주택청약저축 납입 (만원)
    creditCardDeduction: 0,  // 신용카드 등 공제 (만원)
    investmentPartnership: 0,  // 투자조합출자 (만원)
    rentLoanRepayment: 0,      // 전세대출원리금 (만원)
    mortgageLoanInterest: 0,   // 주택담보대출이자 (만원)
    yellowUmbrella: 0,         // 노란우산공제 (만원)
    // 세액공제 항목
    insurancePremium: 0,     // 보장성보험료 (만원)
    medicalExpense: 0,       // 의료비 (만원)
    educationExpense: 0,     // 교육비 (만원)
    donationAmount: 0,       // 기부금 (만원)
    monthlyRent: 0,          // 월세액 (만원)
    irpContribution: 0,      // IRP 납입 (만원)
    pensionSaving: 0,        // 연금저축 납입 (만원)
  });
  const [showSimulation, setShowSimulation] = useState(false);

  // ── 예상상속세 state ──
  const [inheritData, setInheritData] = useState({
    totalAssets: 0,          // 총자산 (만원) - 1단계에서 자동
    totalDebts: 0,           // 총부채 (만원) - 1단계에서 자동
    hasSpouse: true,         // 배우자 유무
    childrenCount: 2,        // 자녀 수
    currentAge: 37,          // 현재 나이
    expectedLifespan: 85,    // 예상수명나이
    inflationRate: 3,        // 예상물가상승률 (%)
  });

  // ── 원천징수영수증 업로드 state ──
  const [taxFileUploaded, setTaxFileUploaded] = useState(false);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();

  // ── 데이터 로드/저장 ──
  useEffect(() => {
    const saved = loadDesignData('tax');
    if (saved) {
      if (saved.incomeData) setIncomeData(prev => ({ ...prev, ...saved.incomeData }));
      if (saved.inheritData) setInheritData(prev => ({ ...prev, ...saved.inheritData }));
      if (saved.activeTab) setActiveTab(saved.activeTab);
      if (saved.showSimulation) setShowSimulation(saved.showSimulation);
    }
    // 1단계 재무정보에서 자산/부채/나이/가족 정보 가져오기
    const savedHouseData = localStorage.getItem('financialHouseData');
    if (savedHouseData) {
      try {
        const parsed = JSON.parse(savedHouseData);
        const fa = parsed.financialAssets || {};
        const debts = parsed.debts || {};
        const realEstate = parsed.realEstateAssets || {};
        
        const financialTotal = Object.values(fa).reduce((sum: number, v: any) => sum + (Number(v) || 0), 0);
        const realEstateTotal = (realEstate.residentialRealEstate || 0) + (realEstate.investmentRealEstate || 0);
        const totalAssets = financialTotal + realEstateTotal;
        
        const mortgageTotal = (debts.mortgageDebts || []).reduce((sum: number, d: any) => sum + (Number(d.amount) || 0), 0);
        const creditTotal = (debts.creditDebts || []).reduce((sum: number, d: any) => sum + (Number(d.amount) || 0), 0);
        const otherTotal = (debts.otherDebts || []).reduce((sum: number, d: any) => sum + (Number(d.amount) || 0), 0);
        const totalDebts = mortgageTotal + creditTotal + otherTotal;

        const age = parsed.personalInfo?.age || 37;
        const isMarried = parsed.personalInfo?.isMarried;
        const familyCount = parsed.personalInfo?.familyCount || 1;

        setInheritData(prev => ({
          ...prev,
          totalAssets: totalAssets > 0 ? totalAssets : prev.totalAssets,
          totalDebts: totalDebts > 0 ? totalDebts : prev.totalDebts,
          currentAge: age,
          hasSpouse: isMarried !== undefined ? isMarried : prev.hasSpouse,
          childrenCount: Math.max(0, (familyCount || 1) - (isMarried ? 2 : 1)),
        }));
      } catch (e) { console.error('Failed to parse financialHouseData:', e); }
    }
  }, []);

  useEffect(() => {
    saveDesignData('tax', { incomeData, inheritData, activeTab, showSimulation });
  }, [incomeData, inheritData, activeTab, showSimulation]);

  // ════════════════════════════════════════════
  // 종합소득세 계산 로직
  // ════════════════════════════════════════════

  // 근로소득공제 (만원 단위)
  const calcEarnedDeduction = (salary: number): number => {
    if (salary <= 500) return Math.round(salary * 0.7);
    if (salary <= 1500) return Math.round(350 + (salary - 500) * 0.4);
    if (salary <= 4500) return Math.round(750 + (salary - 1500) * 0.15);
    if (salary <= 10000) return Math.round(1200 + (salary - 4500) * 0.05);
    return Math.round(1475 + (salary - 10000) * 0.02);
  };

  // 종합소득세 세율
  const calcIncomeTax = (base: number): { tax: number; rate: string } => {
    if (base <= 1400) return { tax: Math.round(base * 0.06), rate: '6%' };
    if (base <= 5000) return { tax: Math.round(84 + (base - 1400) * 0.15), rate: '15%' };
    if (base <= 8800) return { tax: Math.round(624 + (base - 5000) * 0.24), rate: '24%' };
    if (base <= 15000) return { tax: Math.round(1536 + (base - 8800) * 0.35), rate: '35%' };
    if (base <= 30000) return { tax: Math.round(3706 + (base - 15000) * 0.38), rate: '38%' };
    if (base <= 50000) return { tax: Math.round(9406 + (base - 30000) * 0.4), rate: '40%' };
    if (base <= 100000) return { tax: Math.round(17406 + (base - 50000) * 0.42), rate: '42%' };
    return { tax: Math.round(38406 + (base - 100000) * 0.45), rate: '45%' };
  };

  // 근로소득 세액공제
  const calcEarnedTaxCredit = (calculatedTax: number, salary: number): number => {
    let credit = 0;
    if (calculatedTax <= 130) credit = Math.round(calculatedTax * 0.55);
    else credit = Math.round(71.5 + (calculatedTax - 130) * 0.3);
    let limit = 50;
    if (salary <= 3300) limit = 74;
    else if (salary <= 7000) limit = 66;
    return Math.min(credit, limit);
  };

  // ════════════════════════════════════════════
  // 상속세 계산 로직
  // ════════════════════════════════════════════
  const calcInheritanceTax = (base: number): number => {
    if (base <= 0) return 0;
    if (base <= 10000) return Math.round(base * 0.1);
    if (base <= 50000) return Math.round(1000 + (base - 10000) * 0.2);
    if (base <= 100000) return Math.round(9000 + (base - 50000) * 0.3);
    if (base <= 300000) return Math.round(24000 + (base - 100000) * 0.4);
    return Math.round(104000 + (base - 300000) * 0.5);
  };

  // 상속세율 표시
  const getInheritTaxBracket = (base: number): { rate: string; bracket: string } => {
    if (base <= 0) return { rate: '0%', bracket: '-' };
    if (base <= 10000) return { rate: '10%', bracket: '1억 이하' };
    if (base <= 50000) return { rate: '20%', bracket: '1억~5억' };
    if (base <= 100000) return { rate: '30%', bracket: '5억~10억' };
    if (base <= 300000) return { rate: '40%', bracket: '10억~30억' };
    return { rate: '50%', bracket: '30억 초과' };
  };

  // ════════════════════════════════════════════
  // 종합소득세 계산 결과
  // ════════════════════════════════════════════
  const earnedDeduction = calcEarnedDeduction(incomeData.annualSalary);
  const earnedIncome = Math.max(0, incomeData.annualSalary - earnedDeduction);

  // 소득공제 합계
  const dependentDeduction = incomeData.dependentCount * 150;
  const housingDeductionAmount = Math.round(Math.min(incomeData.housingSubscription, 300) * 0.4);
  const totalIncomeDeduction = incomeData.selfDeduction + dependentDeduction + 
    incomeData.nationalPension + incomeData.healthInsurance + incomeData.employInsurance +
    housingDeductionAmount + incomeData.creditCardDeduction +
    incomeData.investmentPartnership + incomeData.rentLoanRepayment +
    incomeData.mortgageLoanInterest + incomeData.yellowUmbrella;
  
  // 과세표준
  const taxBase = Math.max(0, earnedIncome - totalIncomeDeduction);
  const { tax: calculatedTax, rate: taxRate } = calcIncomeTax(taxBase);
  
  // 세액공제
  const earnedTaxCredit = calcEarnedTaxCredit(calculatedTax, incomeData.annualSalary);
  const insuranceCredit = Math.round(Math.min(incomeData.insurancePremium, 100) * 0.12);
  const medicalOver = Math.max(0, incomeData.medicalExpense - Math.round(incomeData.annualSalary * 0.03));
  const medicalCredit = Math.round(medicalOver * 0.15);
  const educationCredit = Math.round(incomeData.educationExpense * 0.15);
  const donationCredit = Math.round(incomeData.donationAmount * 0.15);
  const rentCredit = Math.round(Math.min(incomeData.monthlyRent, 750) * 0.17);
  
  // 연금계좌 세액공제율
  const pensionRate = incomeData.annualSalary <= 5500 ? 0.165 : 0.132;
  const pensionSavingLimit = Math.min(incomeData.pensionSaving, 600);
  const irpLimit = Math.min(incomeData.irpContribution, 900 - pensionSavingLimit);
  const pensionCredit = Math.round((pensionSavingLimit + irpLimit) * pensionRate);
  
  const totalTaxCredit = earnedTaxCredit + insuranceCredit + medicalCredit + educationCredit + donationCredit + rentCredit + pensionCredit;
  const simDeterminedTax = Math.max(0, calculatedTax - totalTaxCredit);
  const simRefund = incomeData.prepaidTax - simDeterminedTax;
  
  // 결정세액 0원 TIP
  const remainingTax = Math.max(0, calculatedTax - totalTaxCredit);
  const neededIRP = pensionRate > 0 ? Math.ceil(remainingTax / pensionRate) : 0;
  const irpRoom = 900 - pensionSavingLimit - incomeData.irpContribution;

  // ════════════════════════════════════════════
  // 예상상속세 계산 결과
  // ════════════════════════════════════════════
  const netAssets = inheritData.totalAssets - inheritData.totalDebts;
  const spouseDeduction = inheritData.hasSpouse ? 50000 : 0;
  const childDeduction = inheritData.childrenCount * 5000;
  const basicDeduction = 20000;
  const personalDeduction = childDeduction;
  const lumpSumDeduction = Math.max(50000, basicDeduction + personalDeduction);
  const inheritTaxBase = Math.max(0, netAssets - spouseDeduction - lumpSumDeduction);
  const inheritanceTax = calcInheritanceTax(inheritTaxBase);
  const inheritEffectiveRate = netAssets > 0 ? ((inheritanceTax / netAssets) * 100).toFixed(1) : '0.0';

  // 72법칙 시뮬레이션
  const doublingYears = inheritData.inflationRate > 0 ? Math.round(72 / inheritData.inflationRate) : 0;
  
  // 시뮬레이션 타임라인 생성
  const simTimeline: { age: number; assets: number; tax: number }[] = [];
  if (doublingYears > 0 && netAssets > 0) {
    let currentAssets = netAssets;
    let currentAge = inheritData.currentAge;
    
    // 현재
    simTimeline.push({ age: currentAge, assets: currentAssets, tax: calcInheritanceTax(Math.max(0, currentAssets - spouseDeduction - lumpSumDeduction)) });
    
    // 2배씩 증가
    while (currentAge + doublingYears <= inheritData.expectedLifespan + 5) {
      currentAge += doublingYears;
      currentAssets *= 2;
      if (currentAge > inheritData.expectedLifespan + 10) break;
      simTimeline.push({ age: currentAge, assets: currentAssets, tax: calcInheritanceTax(Math.max(0, currentAssets - spouseDeduction - lumpSumDeduction)) });
    }
  }

  // 포맷팅 함수
  const fmt = (v: number) => v.toLocaleString();

  // ★★★ v2.2 수정: 원천징수영수증 업로드 핸들러 - onOpenOCR 호출 (보험설계 handleUpload와 동일 패턴) ★★★
  const handleTaxUpload = () => {
    if (onOpenOCR) {
      onOpenOCR();
    } else {
      setTaxFileUploaded(true);
      alert('원천징수영수증 업로드 기능은 추후 업데이트 예정입니다.\n\n⚠️ AI 분석은 참고용이며, 정확한 세금 분석은 전문 세무사 상담을 권장합니다.');
    }
  };

  return (
    <div className="space-y-3">
      {/* 말풍선 */}
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">️</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>다섯 번째는 <span className="text-teal-600 font-bold">세금설계</span>입니다. 종합소득세 절세와 예상상속세를 시뮬레이션해 보세요! </p>
        </div>
      </div>

      {/* 원천징수영수증 업로드 */}
      <div 
        onClick={handleTaxUpload}
        className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 p-4 text-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-all"
      >
        <div className="text-2xl mb-1">📄</div>
        <div className="text-sm font-semibold text-gray-700">원천징수영수증 업로드 (OCR 분석)</div>
        <div className="text-[11px] text-gray-400 mt-1">PDF, 이미지 파일 지원 · AI 자동 인식</div>
        {taxFileUploaded && <div className="text-xs text-teal-600 mt-2 font-semibold">✓ 파일이 업로드되었습니다</div>}
      </div>

      {/* 탭 선택 */}
      <div className="bg-white rounded-xl p-1.5 shadow-sm flex gap-1">
        <button onClick={() => setActiveTab('income')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'income' ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>
          💰 종합소득세 절세
        </button>
        <button onClick={() => setActiveTab('inheritance')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'inheritance' ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>
          🏠 예상상속세
        </button>
      </div>

      {/* ═══════════════════════════════════════ */}
      {/* 종합소득세 절세 탭 */}
      {/* ═══════════════════════════════════════ */}
      {activeTab === 'income' && (
        <div className="space-y-3">
          {/* 기본 입력 */}
          <div className="bg-white rounded-xl p-4 space-y-2 shadow-sm">
            <h4 className="text-sm font-bold text-gray-800 mb-2">📋 기본 정보</h4>
            <TaxInputRow label="총급여 (연봉)" value={incomeData.annualSalary} onChange={v => setIncomeData(p => ({...p, annualSalary: v}))} />
            <TaxInputRow label="결정세액" value={incomeData.determinedTax} onChange={v => setIncomeData(p => ({...p, determinedTax: v}))} />
            <TaxInputRow label="기납부세액 (원천징수)" value={incomeData.prepaidTax} onChange={v => setIncomeData(p => ({...p, prepaidTax: v}))} />
            
            {/* 현재 환급금 계산 */}
            <div className={`mt-2 p-3 rounded-lg ${incomeData.prepaidTax - incomeData.determinedTax >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-700">현재 환급(+)/납부(-)</span>
                <span className={`text-base font-black ${incomeData.prepaidTax - incomeData.determinedTax >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {incomeData.prepaidTax - incomeData.determinedTax >= 0 ? '+' : ''}{fmt(incomeData.prepaidTax - incomeData.determinedTax)}만원
                </span>
              </div>
            </div>
          </div>

          {/* 시뮬레이션 토글 */}
          <button onClick={() => setShowSimulation(!showSimulation)}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-bold text-xs shadow-sm hover:shadow-md transition-all">
            {showSimulation ? '▲ 절세 시뮬레이션 접기' : '▼ 절세 시뮬레이션 펼치기'}
          </button>

          {showSimulation && (
            <div className="space-y-3">
              {/* 소득공제 */}
              <div className="bg-white rounded-xl p-4 space-y-1 shadow-sm">
                <h4 className="text-sm font-bold text-blue-700 mb-2">📘 소득공제 <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">과세표준↓</span></h4>
                <TaxInputRow label="본인공제" value={incomeData.selfDeduction} onChange={v => setIncomeData(p => ({...p, selfDeduction: v}))} badge="자동" badgeColor="bg-gray-100 text-gray-500" />
                <TaxInputRow label="부양가족 (인원)" value={incomeData.dependentCount} onChange={v => setIncomeData(p => ({...p, dependentCount: v}))} unit="명" />
                <TaxInputRow label="국민연금보험료" value={incomeData.nationalPension} onChange={v => setIncomeData(p => ({...p, nationalPension: v}))} />
                <TaxInputRow label="건강보험료(장기요양포함)" value={incomeData.healthInsurance} onChange={v => setIncomeData(p => ({...p, healthInsurance: v}))} />
                <TaxInputRow label="고용보험료" value={incomeData.employInsurance} onChange={v => setIncomeData(p => ({...p, employInsurance: v}))} />
                <TaxInputRow label="주택청약저축 (납입액)" value={incomeData.housingSubscription} onChange={v => setIncomeData(p => ({...p, housingSubscription: v}))} badge="40%공제" badgeColor="bg-orange-100 text-orange-600" />
                <TaxInputRow label="신용카드 등 공제액" value={incomeData.creditCardDeduction} onChange={v => setIncomeData(p => ({...p, creditCardDeduction: v}))} />
                <TaxInputRow label="투자조합출자" value={incomeData.investmentPartnership} onChange={v => setIncomeData(p => ({...p, investmentPartnership: v}))} />
                <TaxInputRow label="전세대출원리금" value={incomeData.rentLoanRepayment} onChange={v => setIncomeData(p => ({...p, rentLoanRepayment: v}))} badge="주택임차차입금" badgeColor="bg-purple-100 text-purple-600" />
                <TaxInputRow label="주택담보대출이자" value={incomeData.mortgageLoanInterest} onChange={v => setIncomeData(p => ({...p, mortgageLoanInterest: v}))} badge="장기주택저당" badgeColor="bg-purple-100 text-purple-600" />
                <TaxInputRow label="노란우산공제" value={incomeData.yellowUmbrella} onChange={v => setIncomeData(p => ({...p, yellowUmbrella: v}))} badge="소기업·소상공인" badgeColor="bg-yellow-100 text-yellow-700" />
                <div className="flex justify-between pt-2 border-t border-blue-200">
                  <span className="text-xs font-bold text-blue-700">소득공제 합계</span>
                  <span className="text-sm font-black text-blue-600">{fmt(totalIncomeDeduction)}만원</span>
                </div>
              </div>

              {/* 세액공제 */}
              <div className="bg-white rounded-xl p-4 space-y-1 shadow-sm">
                <h4 className="text-sm font-bold text-green-700 mb-2">📗 세액공제 <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full">결정세액↓</span></h4>
                <div className="text-[10px] text-gray-400 mb-1">근로소득 세액공제: {fmt(earnedTaxCredit)}만원 (자동)</div>
                <TaxInputRow label="보장성보험료 (100만한도)" value={incomeData.insurancePremium} onChange={v => setIncomeData(p => ({...p, insurancePremium: v}))} badge="12%" badgeColor="bg-green-100 text-green-600" />
                <TaxInputRow label="의료비" value={incomeData.medicalExpense} onChange={v => setIncomeData(p => ({...p, medicalExpense: v}))} badge="15%" badgeColor="bg-green-100 text-green-600" />
                <TaxInputRow label="교육비" value={incomeData.educationExpense} onChange={v => setIncomeData(p => ({...p, educationExpense: v}))} badge="15%" badgeColor="bg-green-100 text-green-600" />
                <TaxInputRow label="기부금" value={incomeData.donationAmount} onChange={v => setIncomeData(p => ({...p, donationAmount: v}))} badge="15%" badgeColor="bg-green-100 text-green-600" />
                <TaxInputRow label="월세액 (750만한도)" value={incomeData.monthlyRent} onChange={v => setIncomeData(p => ({...p, monthlyRent: v}))} badge="17%" badgeColor="bg-green-100 text-green-600" />
                <TaxInputRow label="IRP 납입 (900만한도)" value={incomeData.irpContribution} onChange={v => setIncomeData(p => ({...p, irpContribution: v}))} badge={`${(pensionRate*100).toFixed(1)}%`} badgeColor="bg-teal-100 text-teal-600" />
                <TaxInputRow label="연금저축 (600만한도)" value={incomeData.pensionSaving} onChange={v => setIncomeData(p => ({...p, pensionSaving: v}))} badge={`${(pensionRate*100).toFixed(1)}%`} badgeColor="bg-teal-100 text-teal-600" />
                <div className="flex justify-between pt-2 border-t border-green-200">
                  <span className="text-xs font-bold text-green-700">세액공제 합계</span>
                  <span className="text-sm font-black text-green-600">{fmt(totalTaxCredit)}만원</span>
                </div>
              </div>

              {/* 실시간 계산 결과 (6단계) */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 space-y-1.5 border border-indigo-200">
                <h4 className="text-sm font-bold text-indigo-800 mb-2">📊 시뮬레이션 계산 결과</h4>
                <div className="flex justify-between text-xs py-1 border-b border-indigo-100"><span className="text-gray-600">① 총급여</span><span className="font-bold text-gray-800">{fmt(incomeData.annualSalary)}만원</span></div>
                <div className="flex justify-between text-xs py-1 border-b border-indigo-100"><span className="text-gray-600">② 근로소득공제</span><span className="font-bold text-purple-600">-{fmt(earnedDeduction)}만원</span></div>
                <div className="flex justify-between text-xs py-1 border-b border-indigo-100"><span className="text-gray-600">③ 근로소득금액</span><span className="font-bold text-gray-800">{fmt(earnedIncome)}만원</span></div>
                <div className="flex justify-between text-xs py-1 border-b border-indigo-100"><span className="text-gray-600">④ 소득공제 합계</span><span className="font-bold text-blue-600">-{fmt(totalIncomeDeduction)}만원</span></div>
                <div className="flex justify-between text-xs py-1 border-b border-indigo-100"><span className="text-gray-600">⑤ 과세표준 <span className="text-[9px] text-indigo-500">({taxRate})</span></span><span className="font-bold text-indigo-600">{fmt(taxBase)}만원</span></div>
                <div className="flex justify-between text-xs py-1 border-b border-indigo-100"><span className="text-gray-600">⑥ 산출세액</span><span className="font-bold text-gray-800">{fmt(calculatedTax)}만원</span></div>
                <div className="flex justify-between text-xs py-1 border-b border-indigo-100"><span className="text-gray-600">⑦ 세액공제 합계</span><span className="font-bold text-green-600">-{fmt(totalTaxCredit)}만원</span></div>
                <div className="flex justify-between text-xs py-1.5 bg-indigo-100 rounded-lg px-2"><span className="font-bold text-indigo-800">⑧ 시뮬 결정세액</span><span className="font-black text-indigo-700">{fmt(simDeterminedTax)}만원</span></div>
              </div>

              {/* Before → After 비교 */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h4 className="text-sm font-bold text-gray-800 mb-3">🔄 Before → After</h4>
                <div className="flex items-center justify-center gap-3">
                  <div className="text-center">
                    <div className="text-[10px] text-gray-400">현재 결정세액</div>
                    <div className="text-lg font-black text-red-500">{fmt(incomeData.determinedTax)}만원</div>
                  </div>
                  <div className="text-xl text-gray-400">→</div>
                  <div className="text-center">
                    <div className="text-[10px] text-gray-400">시뮬 결정세액</div>
                    <div className="text-lg font-black text-green-500">{fmt(simDeterminedTax)}만원</div>
                  </div>
                </div>
                <div className={`mt-3 p-3 rounded-lg text-center ${simRefund >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <span className="text-xs text-gray-600">시뮬레이션 환급금: </span>
                  <span className={`text-base font-black ${simRefund >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {simRefund >= 0 ? '+' : ''}{fmt(simRefund)}만원
                  </span>
                </div>
              </div>

              {/* 결정세액 0원 TIP */}
              {simDeterminedTax > 0 && (
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                  <div className="flex gap-2">
                    <span className="text-base">💡</span>
                    <div className="text-xs text-blue-700 leading-relaxed">
                      <strong>결정세액 0원 TIP:</strong> 남은 세액 {fmt(remainingTax)}만원 ÷ {(pensionRate*100).toFixed(1)}% = <strong>IRP {fmt(neededIRP)}만원</strong> 추가 납입 시 결정세액 0원!
                      {neededIRP > irpRoom && <span className="block mt-1 text-orange-600">⚠️ 연금계좌 한도 초과! 주택청약·기부금·월세 공제도 검토하세요.</span>}
                    </div>
                  </div>
                </div>
              )}
              {simDeterminedTax === 0 && showSimulation && (
                <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                  <div className="flex gap-2 items-center">
                    <span className="text-base">🎉</span>
                    <span className="text-xs font-bold text-green-700">축하합니다! 결정세액이 0원입니다!</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* 예상상속세 탭 */}
      {/* ═══════════════════════════════════════ */}
      {activeTab === 'inheritance' && (
        <div className="space-y-3">
          {/* 자산/부채 요약 (1단계 연동) */}
          <div className="bg-white rounded-xl p-4 space-y-2 shadow-sm">
            <h4 className="text-sm font-bold text-gray-800 mb-2">🏦 자산·부채 현황 <span className="text-[10px] text-gray-400">(1단계 재무정보 연동)</span></h4>
            <TaxInputRow label="총자산" value={inheritData.totalAssets} onChange={v => setInheritData(p => ({...p, totalAssets: v}))} />
            <TaxInputRow label="총부채" value={inheritData.totalDebts} onChange={v => setInheritData(p => ({...p, totalDebts: v}))} />
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-xs font-bold text-gray-700">순자산</span>
              <span className={`text-sm font-black ${netAssets >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{fmt(netAssets)}만원</span>
            </div>
          </div>

          {/* 가족 정보 */}
          <div className="bg-white rounded-xl p-4 space-y-2 shadow-sm">
            <h4 className="text-sm font-bold text-gray-800 mb-2">👨‍👩‍👧‍👦 가족 정보</h4>
            <div className="flex items-center gap-2 py-1.5">
              <span className="text-xs text-gray-600 flex-1">배우자</span>
              <div className="flex gap-1">
                <button onClick={() => setInheritData(p => ({...p, hasSpouse: true}))}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${inheritData.hasSpouse ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-500'}`}>있음</button>
                <button onClick={() => setInheritData(p => ({...p, hasSpouse: false}))}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${!inheritData.hasSpouse ? 'bg-red-400 text-white' : 'bg-gray-100 text-gray-500'}`}>없음</button>
              </div>
            </div>
            <TaxInputRow label="자녀 수" value={inheritData.childrenCount} onChange={v => setInheritData(p => ({...p, childrenCount: v}))} unit="명" />
            <TaxInputRow label="현재 나이" value={inheritData.currentAge} onChange={v => setInheritData(p => ({...p, currentAge: v}))} unit="세" />
          </div>

          {/* 상속세 계산 결과 */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 space-y-1.5 border border-purple-200">
            <h4 className="text-sm font-bold text-purple-800 mb-2">📊 상속세 산출</h4>
            <div className="flex justify-between text-xs py-1 border-b border-purple-100"><span className="text-gray-600">순자산</span><span className="font-bold">{fmt(netAssets)}만원</span></div>
            <div className="flex justify-between text-xs py-1 border-b border-purple-100"><span className="text-gray-600">배우자공제</span><span className="font-bold text-blue-600">-{fmt(spouseDeduction)}만원</span></div>
            <div className="flex justify-between text-xs py-1 border-b border-purple-100"><span className="text-gray-600">일괄공제 (max 5억, 기초+인적)</span><span className="font-bold text-blue-600">-{fmt(lumpSumDeduction)}만원</span></div>
            <div className="flex justify-between text-xs py-1 border-b border-purple-100"><span className="text-gray-600">과세표준 <span className="text-[9px] text-purple-500">({getInheritTaxBracket(inheritTaxBase).rate})</span></span><span className="font-bold text-purple-600">{fmt(inheritTaxBase)}만원</span></div>
            <div className="flex justify-between text-xs py-1.5 bg-purple-100 rounded-lg px-2"><span className="font-bold text-purple-800">예상 상속세</span><span className="font-black text-purple-700">{fmt(inheritanceTax)}만원</span></div>
            <div className="text-[10px] text-gray-400 text-right">실효세율: {inheritEffectiveRate}%</div>
          </div>

          {/* 상속세 세율표 */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h4 className="text-sm font-bold text-gray-800 mb-2">📋 상속세율표</h4>
            <div className="space-y-0.5 text-[11px]">
              {[
                { range: '1억 이하', rate: '10%', deduction: '-', max: 10000 },
                { range: '1억~5억', rate: '20%', deduction: '1,000만', max: 50000 },
                { range: '5억~10억', rate: '30%', deduction: '6,000만', max: 100000 },
                { range: '10억~30억', rate: '40%', deduction: '1.6억', max: 300000 },
                { range: '30억 초과', rate: '50%', deduction: '4.6억', max: Infinity },
              ].map((row, i) => (
                <div key={i} className={`flex justify-between py-1 px-2 rounded ${inheritTaxBase > 0 && inheritTaxBase <= row.max && (i === 0 || inheritTaxBase > [0, 10000, 50000, 100000, 300000][i]) ? 'bg-purple-100 font-bold' : ''}`}>
                  <span className="w-20">{row.range}</span>
                  <span className="w-10 text-center">{row.rate}</span>
                  <span className="w-16 text-right text-gray-500">누진공제 {row.deduction}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 72법칙 시뮬레이션 */}
          <div className="bg-white rounded-xl p-4 space-y-3 shadow-sm">
            <h4 className="text-sm font-bold text-gray-800 mb-1">⏳ 72법칙 미래 시뮬레이션</h4>
            <div className="text-[10px] text-gray-400">자산이 물가상승률로 매년 증가한다고 가정할 때 미래 상속세 예측</div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[10px] text-gray-500">물가상승률 (%)</label>
                <input type="number" value={inheritData.inflationRate} onChange={(e) => setInheritData(p => ({...p, inflationRate: Number(e.target.value)}))} onFocus={handleFocus}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs text-right focus:border-purple-500 outline-none" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-gray-500">예상수명 (세)</label>
                <input type="number" value={inheritData.expectedLifespan} onChange={(e) => setInheritData(p => ({...p, expectedLifespan: Number(e.target.value)}))} onFocus={handleFocus}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs text-right focus:border-purple-500 outline-none" />
              </div>
            </div>

            {doublingYears > 0 && <div className="text-xs text-purple-600 font-semibold text-center">📈 자산 2배 소요: {doublingYears}년 (72÷{inheritData.inflationRate}%)</div>}

            {/* 타임라인 */}
            {simTimeline.length > 0 && (
              <div className="space-y-2">
                {simTimeline.map((point, idx) => (
                  <div key={idx} className={`p-2.5 rounded-lg border ${idx === 0 ? 'bg-blue-50 border-blue-200' : point.age >= inheritData.expectedLifespan ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex justify-between text-xs">
                      <span className="font-bold">{point.age}세 {idx === 0 ? '(현재)' : point.age >= inheritData.expectedLifespan ? '(예상수명)' : ''}</span>
                      <span className="font-bold">{fmt(point.assets)}만원</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
                      <span>예상 상속세</span>
                      <span className={`font-bold ${point.tax > 0 ? 'text-red-500' : 'text-green-500'}`}>{fmt(point.tax)}만원</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {simTimeline.length > 1 && simTimeline[simTimeline.length - 1].tax > inheritanceTax * 2 && (
              <div className="bg-red-50 rounded-lg p-2.5 border border-red-200">
                <div className="flex gap-1.5">
                  <span className="text-sm">⚠️</span>
                  <span className="text-[11px] text-red-700">미래 상속세가 크게 증가합니다. 사전 증여, 가족법인 설립 등 절세 전략을 검토하세요.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-3 p-2 bg-amber-50 rounded-lg border border-amber-200">
        <p className="text-[10px] text-amber-700 text-center">
          ⚠️ 본 설계는 이해를 돕기 위한 일반적인 예시이므로 참고만 하시기 바랍니다. 구체적인 사항은 반드시 해당 전문가와 상담하시기 바랍니다.
        </p>
      </div>
      <div className="flex gap-2 pt-2">
        <button onClick={onPrev} className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm">← 이전</button>
        <button onClick={onNext} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold text-sm">다음 →</button>
      </div>
    </div>
  );
}

// ============================================
// 부동산설계 입력행 컴포넌트 (외부 분리)
// ============================================
const EstateInputRow = ({ label, value, onChange, unit = '만원', badge, badgeColor }: { 
  label: string; value: number; onChange: (v: number) => void; unit?: string; badge?: string; badgeColor?: string;
}) => {
  const handleFocusInput = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();
  return (
    <div className="flex items-center gap-2 py-1.5">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-600 truncate">{label}</span>
          {badge && <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${badgeColor || 'bg-blue-100 text-blue-600'}`}>{badge}</span>}
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} onFocus={handleFocusInput}
          className="w-28 px-2 py-1.5 border border-gray-300 rounded-lg text-xs text-right focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" />
        <span className="text-[10px] text-gray-400 w-6">{unit}</span>
      </div>
    </div>
  );
};

// ============================================
// 6. 부동산설계 카드 (v2.0)
// v2.0: Coming Soon → 4가지 실제 기능으로 교체
//   탭1: 세금 시뮬레이션 (취득세/보유세/양도세)
//   탭2: 대출한도 분석 (LTV/DTI/DSR)
//   탭3: 매매 vs 전세 vs 월세 비교
//   탭4: 투자수익률(ROI) 계산기
// ============================================
export function EstatePlanCard({ onNext, onPrev }: CardProps) {
  const [formData, setFormData] = useState({ 
    hasHouse: true, residentialProperty: 40000, investmentProperty: 10000, currentAge: 37
  });
  const [estateTab, setEstateTab] = useState<'tax' | 'loan' | 'compare' | 'roi'>('tax');

  // ── 세금 시뮬레이션 state ──
  const [taxSim, setTaxSim] = useState({
    acquisitionPrice: 40000,   // 취득가액 (만원)
    isFirstHome: true,         // 1주택 여부
    houseCount: 1,             // 보유 주택 수
    officialPrice: 35000,      // 공시가격 (만원)
    sellingPrice: 50000,       // 양도가액 (만원)
    holdingYears: 5,           // 보유기간 (년)
    livingYears: 5,            // 실거주기간 (년)
  });

  // ── 대출한도 분석 state ──
  const [loanSim, setLoanSim] = useState({
    annualIncome: 6000,        // 연소득 (만원)
    propertyValue: 40000,      // 매매가 (만원)
    existingLoanPayment: 0,    // 기존 대출 연상환액 (만원)
    loanRate: 4.0,             // 대출금리 (%)
    loanYears: 30,             // 대출기간 (년)
    isRegulated: false,        // 규제지역 여부
  });

  // ── 매매 vs 전세 vs 월세 비교 state ──
  const [compareSim, setCompareSim] = useState({
    buyPrice: 40000,           // 매매가 (만원)
    jeonsePrice: 28000,        // 전세가 (만원)
    monthlyRent: 80,           // 월세 (만원)
    monthlyDeposit: 5000,      // 월세 보증금 (만원)
    expectedAppreciation: 3,   // 연 시세상승률 (%)
    investReturn: 5,           // 투자수익률 (%)
    analysisPeriod: 5,         // 분석기간 (년)
  });

  // ── ROI 계산기 state ──
  const [roiSim, setRoiSim] = useState({
    purchasePrice: 30000,      // 매입가 (만원)
    acquisitionCost: 1500,     // 취득부대비용 (만원)
    monthlyRentalIncome: 100,  // 월 임대수입 (만원)
    monthlyExpense: 10,        // 월 관리비용 (만원)
    loanAmount: 15000,         // 대출금 (만원)
    loanInterestRate: 4.5,     // 대출금리 (%)
    expectedSellPrice: 35000,  // 예상매도가 (만원)
    holdYears: 5,              // 보유기간 (년)
  });

  useEffect(() => { 
    const saved = loadDesignData('estate'); 
    if (saved) {
      if (saved.hasHouse !== undefined) setFormData({ hasHouse: saved.hasHouse, residentialProperty: saved.residentialProperty ?? 40000, investmentProperty: saved.investmentProperty ?? 10000, currentAge: saved.currentAge ?? 37 });
      if (saved.estateTab) setEstateTab(saved.estateTab);
      if (saved.taxSim) setTaxSim(prev => ({...prev, ...saved.taxSim}));
      if (saved.loanSim) setLoanSim(prev => ({...prev, ...saved.loanSim}));
      if (saved.compareSim) setCompareSim(prev => ({...prev, ...saved.compareSim}));
      if (saved.roiSim) setRoiSim(prev => ({...prev, ...saved.roiSim}));
    }
  }, []);
  useEffect(() => { saveDesignData('estate', { ...formData, estateTab, taxSim, loanSim, compareSim, roiSim }); }, [formData, estateTab, taxSim, loanSim, compareSim, roiSim]);
  
  const totalProperty = formData.residentialProperty + formData.investmentProperty;
  const estimatedMonthlyPension = Math.round((formData.residentialProperty / 40000) * 100);
  const canApplyPension = formData.currentAge >= 55 && formData.residentialProperty <= 90000;
  const yearsUntil55 = Math.max(0, 55 - formData.currentAge);
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();
  const fmt = (v: number) => v.toLocaleString();
  const fmtOk = (v: number) => v >= 10000 ? `${(v / 10000).toFixed(1)}억` : `${v.toLocaleString()}만`;

  // ════════════════════════════════════════════
  // 세금 시뮬레이션 계산
  // ════════════════════════════════════════════
  // 취득세
  const calcAcquisitionTax = () => {
    const price = taxSim.acquisitionPrice;
    let rate = 0;
    if (taxSim.houseCount >= 3) { rate = 12; }
    else if (taxSim.houseCount === 2) { rate = 8; }
    else {
      if (price <= 60000) rate = 1;
      else if (price <= 90000) rate = 2;
      else rate = 3;
    }
    const tax = Math.round(price * rate / 100);
    const localEdu = Math.round(tax * 0.1);
    return { rate, tax, localEdu, total: tax + localEdu };
  };
  const acqTax = calcAcquisitionTax();

  // 보유세 (재산세 + 종합부동산세)
  const calcHoldingTax = () => {
    const official = taxSim.officialPrice;
    // 재산세 (공시가격 기준 간이계산)
    let propertyTax = 0;
    if (official <= 6000) propertyTax = Math.round(official * 0.001);
    else if (official <= 15000) propertyTax = Math.round(6 + (official - 6000) * 0.0015);
    else if (official <= 30000) propertyTax = Math.round(19.5 + (official - 15000) * 0.0025);
    else propertyTax = Math.round(57 + (official - 30000) * 0.004);
    // 종부세 (1주택 기준 12억 공제, 다주택 6억 공제)
    const exempt = taxSim.houseCount <= 1 ? 120000 : 60000;
    const taxableForJongbu = Math.max(0, official - exempt);
    let jongbuTax = 0;
    if (taxableForJongbu > 0) {
      if (taxableForJongbu <= 30000) jongbuTax = Math.round(taxableForJongbu * 0.005);
      else if (taxableForJongbu <= 60000) jongbuTax = Math.round(150 + (taxableForJongbu - 30000) * 0.007);
      else if (taxableForJongbu <= 120000) jongbuTax = Math.round(360 + (taxableForJongbu - 60000) * 0.01);
      else jongbuTax = Math.round(960 + (taxableForJongbu - 120000) * 0.014);
    }
    return { propertyTax, jongbuTax, total: propertyTax + jongbuTax };
  };
  const holdTax = calcHoldingTax();

  // 양도세
  const calcTransferTax = () => {
    const gain = taxSim.sellingPrice - taxSim.acquisitionPrice;
    if (gain <= 0) return { gain: 0, rate: '0%', tax: 0, exemption: '', isExempt: true };
    // 1주택 비과세: 2년 이상 보유 + 실거주 2년
    if (taxSim.houseCount <= 1 && taxSim.holdingYears >= 2 && taxSim.livingYears >= 2 && gain <= 120000) {
      return { gain, rate: '비과세', tax: 0, exemption: '1세대1주택 비과세 (12억 이하)', isExempt: true };
    }
    // 과세 양도차익
    let taxableGain = gain;
    if (taxSim.houseCount <= 1 && taxSim.holdingYears >= 2 && taxSim.livingYears >= 2 && gain > 120000) {
      taxableGain = gain - 120000;
    }
    // 장기보유특별공제 (1주택)
    let longTermDeduction = 0;
    if (taxSim.houseCount <= 1) {
      const holdRate = Math.min(taxSim.holdingYears, 10) * 4;
      const liveRate = Math.min(taxSim.livingYears, 10) * 4;
      longTermDeduction = Math.round(taxableGain * Math.min(holdRate + liveRate, 80) / 100);
    } else {
      const holdRate = Math.min(taxSim.holdingYears, 15) * 2;
      longTermDeduction = Math.round(taxableGain * Math.min(holdRate, 30) / 100);
    }
    const taxBase = Math.max(0, taxableGain - longTermDeduction - 250);
    // 세율 적용
    let tax = 0; let rate = '';
    if (taxSim.houseCount >= 3) { tax = Math.round(taxBase * 0.68 + 6544); rate = '기본+30%'; }
    else if (taxSim.houseCount === 2) { tax = Math.round(taxBase * 0.58 + 5544); rate = '기본+20%'; }
    else {
      if (taxBase <= 1400) { tax = Math.round(taxBase * 0.06); rate = '6%'; }
      else if (taxBase <= 5000) { tax = Math.round(84 + (taxBase - 1400) * 0.15); rate = '15%'; }
      else if (taxBase <= 8800) { tax = Math.round(624 + (taxBase - 5000) * 0.24); rate = '24%'; }
      else if (taxBase <= 15000) { tax = Math.round(1536 + (taxBase - 8800) * 0.35); rate = '35%'; }
      else if (taxBase <= 30000) { tax = Math.round(3706 + (taxBase - 15000) * 0.38); rate = '38%'; }
      else if (taxBase <= 50000) { tax = Math.round(9406 + (taxBase - 30000) * 0.4); rate = '40%'; }
      else { tax = Math.round(17406 + (taxBase - 50000) * 0.42); rate = '42%'; }
    }
    return { gain, rate, tax, exemption: '', isExempt: false, taxBase, longTermDeduction };
  };
  const transTax = calcTransferTax();

  // ════════════════════════════════════════════
  // 대출한도 분석 계산
  // ════════════════════════════════════════════
  const calcLoanLimits = () => {
    const val = loanSim.propertyValue;
    const ltvRate = loanSim.isRegulated ? 0.50 : 0.70;
    const dtiRate = loanSim.isRegulated ? 0.40 : 0.50;
    const dsrRate = 0.40;
    const ltvLimit = Math.round(val * ltvRate);
    // DTI: (대출 연상환액 + 기존 대출이자) / 연소득 ≤ DTI%
    const monthlyRate = loanSim.loanRate / 100 / 12;
    const totalMonths = loanSim.loanYears * 12;
    const annuityFactor = monthlyRate > 0 ? (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1) : (1 / totalMonths);
    const maxAnnualPayment = loanSim.annualIncome * dtiRate - loanSim.existingLoanPayment;
    const dtiLimit = maxAnnualPayment > 0 ? Math.round(maxAnnualPayment / (annuityFactor * 12)) : 0;
    // DSR: 모든 대출 연상환액 합 / 연소득 ≤ 40%
    const maxDsrPayment = loanSim.annualIncome * dsrRate - loanSim.existingLoanPayment;
    const dsrLimit = maxDsrPayment > 0 ? Math.round(maxDsrPayment / (annuityFactor * 12)) : 0;
    const finalLimit = Math.min(ltvLimit, dtiLimit, dsrLimit);
    const monthlyPayment = finalLimit > 0 ? Math.round(finalLimit * annuityFactor) : 0;
    return { ltvRate: ltvRate * 100, dtiRate: dtiRate * 100, dsrRate: dsrRate * 100, ltvLimit, dtiLimit, dsrLimit, finalLimit, monthlyPayment, binding: finalLimit === ltvLimit ? 'LTV' : finalLimit === dtiLimit ? 'DTI' : 'DSR' };
  };
  const loanResult = calcLoanLimits();

  // ════════════════════════════════════════════
  // 매매 vs 전세 vs 월세 비교
  // ════════════════════════════════════════════
  const calcCompare = () => {
    const years = compareSim.analysisPeriod;
    // 매매: 취득세 + 대출이자 - 시세차익
    const buyAcqTax = Math.round(compareSim.buyPrice * 0.01);
    const buyAppreciation = Math.round(compareSim.buyPrice * (Math.pow(1 + compareSim.expectedAppreciation / 100, years) - 1));
    const buyTotalCost = buyAcqTax;
    const buyNetGain = buyAppreciation - buyTotalCost;
    // 전세: 기회비용 (전세금의 투자수익률)
    const jeonseOpportunityCost = Math.round(compareSim.jeonsePrice * (Math.pow(1 + compareSim.investReturn / 100, years) - 1));
    const jeonseTotalCost = jeonseOpportunityCost;
    // 월세: 총 월세 지출 + 기회비용
    const totalRent = compareSim.monthlyRent * 12 * years;
    const depositOpportunity = Math.round(compareSim.monthlyDeposit * (Math.pow(1 + compareSim.investReturn / 100, years) - 1));
    const wolseTotalCost = totalRent + depositOpportunity;
    return {
      buy: { label: '매매', totalCost: buyTotalCost, gain: buyAppreciation, net: buyNetGain, desc: `시세차익 ${fmtOk(buyAppreciation)} - 취득세 ${fmtOk(buyAcqTax)}` },
      jeonse: { label: '전세', totalCost: jeonseTotalCost, gain: 0, net: -jeonseTotalCost, desc: `전세금 기회비용 ${fmtOk(jeonseOpportunityCost)}` },
      wolse: { label: '월세', totalCost: wolseTotalCost, gain: 0, net: -wolseTotalCost, desc: `월세 ${fmtOk(totalRent)} + 보증금 기회비용 ${fmtOk(depositOpportunity)}` },
    };
  };
  const compareResult = calcCompare();
  const bestOption = [compareResult.buy, compareResult.jeonse, compareResult.wolse].sort((a, b) => b.net - a.net)[0];

  // ════════════════════════════════════════════
  // ROI 계산기
  // ════════════════════════════════════════════
  const calcROI = () => {
    const totalInvest = roiSim.purchasePrice + roiSim.acquisitionCost;
    const selfCapital = totalInvest - roiSim.loanAmount;
    const annualRental = (roiSim.monthlyRentalIncome - roiSim.monthlyExpense) * 12;
    const annualInterest = Math.round(roiSim.loanAmount * roiSim.loanInterestRate / 100);
    const annualNetIncome = annualRental - annualInterest;
    const totalNetIncome = annualNetIncome * roiSim.holdYears;
    const capitalGain = roiSim.expectedSellPrice - roiSim.purchasePrice;
    const totalProfit = totalNetIncome + capitalGain;
    const grossROI = totalInvest > 0 ? (totalProfit / totalInvest * 100) : 0;
    const leverageROI = selfCapital > 0 ? (totalProfit / selfCapital * 100) : 0;
    const annualROI = roiSim.holdYears > 0 ? (leverageROI / roiSim.holdYears) : 0;
    const capRate = roiSim.purchasePrice > 0 ? (annualRental / roiSim.purchasePrice * 100) : 0;
    return { totalInvest, selfCapital, annualRental, annualInterest, annualNetIncome, totalNetIncome, capitalGain, totalProfit, grossROI, leverageROI, annualROI, capRate };
  };
  const roiResult = calcROI();

  return (
    <div className="space-y-3">
      {/* AI 멘트 */}
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">🏠</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>여섯 번째는 <span className="text-teal-600 font-bold">부동산설계</span>입니다. 세금·대출·비교분석·수익률까지 종합 분석해 드릴게요! 🏗️</p>
        </div>
      </div>
      
      {/* 기본 정보 입력 */}
      <div className="bg-white rounded-xl p-4 space-y-4 shadow-sm">
        <h3 className="text-base font-bold text-gray-800">🏠 부동산설계</h3>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">주택 보유 여부</label>
          <div className="flex gap-2">
            <button onClick={() => setFormData({...formData, hasHouse: true})} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${formData.hasHouse ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>🏠 보유</button>
            <button onClick={() => setFormData({...formData, hasHouse: false})} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${!formData.hasHouse ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>❌ 미보유</button>
          </div>
        </div>
        {formData.hasHouse && (
          <>
            <div className="space-y-1"><label className="text-sm font-semibold text-gray-700">현재 나이</label><div className="flex items-center gap-2"><input type="number" value={formData.currentAge} onChange={(e) => setFormData({...formData, currentAge: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" /><span className="text-sm text-gray-500 font-medium w-8">세</span></div></div>
            <div className="space-y-1"><label className="text-sm font-semibold text-gray-700">거주용 부동산</label><div className="flex items-center gap-2"><input type="number" value={formData.residentialProperty} onChange={(e) => setFormData({...formData, residentialProperty: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" /><span className="text-sm text-gray-500 font-medium w-10">만원</span></div></div>
            <div className="space-y-1"><label className="text-sm font-semibold text-gray-700">투자용 부동산</label><div className="flex items-center gap-2"><input type="number" value={formData.investmentProperty} onChange={(e) => setFormData({...formData, investmentProperty: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" /><span className="text-sm text-gray-500 font-medium w-10">만원</span></div></div>
          </>
        )}
      </div>
      
      {/* 부동산 현황 + 주택연금 (기존 유지) */}
      {formData.hasHouse && (
        <>
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4 space-y-2 border border-pink-200">
            <h3 className="text-sm font-bold text-pink-800 mb-2">📊 부동산 현황</h3>
            <div className="flex justify-between text-sm py-1 border-b border-pink-200/50"><span className="text-gray-700">거주용 부동산</span><span className="font-bold text-gray-800">{(formData.residentialProperty / 10000).toFixed(1)}억원</span></div>
            <div className="flex justify-between text-sm py-1 border-b border-pink-200/50"><span className="text-gray-700">투자용 부동산</span><span className="font-bold text-gray-800">{(formData.investmentProperty / 10000).toFixed(1)}억원</span></div>
            <div className="flex justify-between text-sm py-1"><span className="text-gray-700 font-semibold">총 부동산 자산</span><span className="font-bold text-pink-600">{(totalProperty / 10000).toFixed(1)}억원</span></div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 space-y-2 border border-amber-200">
            <h3 className="text-sm font-bold text-amber-800 mb-2">🏦 주택연금 예상 (참고)</h3>
            <div className="flex justify-between text-sm py-1 border-b border-amber-200/50"><span className="text-gray-700">가입 조건</span><span className="font-bold text-gray-600 text-xs">만 55세 이상, 9억원 이하</span></div>
            <div className="flex justify-between text-sm py-1 border-b border-amber-200/50"><span className="text-gray-700">현재 상태</span>{canApplyPension ? (<span className="font-bold text-green-600">가입 가능 ✓</span>) : (<span className="font-bold text-amber-600">{formData.currentAge < 55 ? `${yearsUntil55}년 후 가능` : '9억 초과'}</span>)}</div>
            <div className="flex justify-between text-sm py-1"><span className="text-gray-700">65세 가입 시 예상 월수령</span><span className="font-bold text-teal-600">약 {estimatedMonthlyPension}만원</span></div>
          </div>
        </>
      )}

      {!formData.hasHouse && (
        <div className="bg-gray-100 rounded-xl p-6 text-center"><div className="text-3xl mb-2">🔍</div><div className="text-sm font-semibold text-gray-600">주택 미보유</div><div className="text-xs text-gray-400 mt-1">아래 분석 도구로 매입 계획을<br/>시뮬레이션해 보세요!</div></div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* 4개 탭 선택 */}
      {/* ═══════════════════════════════════════ */}
      <div className="bg-white rounded-xl p-1.5 shadow-sm grid grid-cols-4 gap-1">
        <button onClick={() => setEstateTab('tax')}
          className={`py-2 rounded-lg text-[10px] font-bold transition-all ${estateTab === 'tax' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>
          💰 세금
        </button>
        <button onClick={() => setEstateTab('loan')}
          className={`py-2 rounded-lg text-[10px] font-bold transition-all ${estateTab === 'loan' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>
          🏦 대출한도
        </button>
        <button onClick={() => setEstateTab('compare')}
          className={`py-2 rounded-lg text-[10px] font-bold transition-all ${estateTab === 'compare' ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>
          ⚖️ 비교분석
        </button>
        <button onClick={() => setEstateTab('roi')}
          className={`py-2 rounded-lg text-[10px] font-bold transition-all ${estateTab === 'roi' ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>
          📈 수익률
        </button>
      </div>

      {/* ═══════════════════════════════════════ */}
      {/* 탭1: 세금 시뮬레이션 */}
      {/* ═══════════════════════════════════════ */}
      {estateTab === 'tax' && (
        <div className="space-y-3">
          <div className="bg-white rounded-xl p-4 space-y-1 shadow-sm">
            <h4 className="text-sm font-bold text-red-700 mb-2">💰 부동산 세금 시뮬레이션</h4>
            <EstateInputRow label="취득가액 (매매가)" value={taxSim.acquisitionPrice} onChange={v => setTaxSim(p => ({...p, acquisitionPrice: v}))} />
            <div className="flex items-center gap-2 py-1.5">
              <span className="text-xs text-gray-600 flex-1">보유 주택 수</span>
              <div className="flex gap-1">
                {[1, 2, 3].map(n => (
                  <button key={n} onClick={() => setTaxSim(p => ({...p, houseCount: n, isFirstHome: n === 1}))}
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${taxSim.houseCount === n ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    {n === 3 ? '3+' : n}주택
                  </button>
                ))}
              </div>
            </div>
            <EstateInputRow label="공시가격" value={taxSim.officialPrice} onChange={v => setTaxSim(p => ({...p, officialPrice: v}))} badge="보유세기준" badgeColor="bg-orange-100 text-orange-600" />
            <EstateInputRow label="예상 양도가액" value={taxSim.sellingPrice} onChange={v => setTaxSim(p => ({...p, sellingPrice: v}))} />
            <EstateInputRow label="보유기간" value={taxSim.holdingYears} onChange={v => setTaxSim(p => ({...p, holdingYears: v}))} unit="년" />
            <EstateInputRow label="실거주기간" value={taxSim.livingYears} onChange={v => setTaxSim(p => ({...p, livingYears: v}))} unit="년" />
          </div>

          {/* 취득세 결과 */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4 space-y-1.5 border border-red-200">
            <h4 className="text-xs font-bold text-red-800 mb-2">🏷️ 취득세</h4>
            <div className="flex justify-between text-xs py-1"><span className="text-gray-600">취득세율</span><span className="font-bold text-red-600">{acqTax.rate}%{taxSim.houseCount >= 2 ? ' (중과)' : ''}</span></div>
            <div className="flex justify-between text-xs py-1"><span className="text-gray-600">취득세</span><span className="font-bold">{fmt(acqTax.tax)}만원</span></div>
            <div className="flex justify-between text-xs py-1"><span className="text-gray-600">지방교육세 (10%)</span><span className="font-bold">{fmt(acqTax.localEdu)}만원</span></div>
            <div className="flex justify-between text-xs py-1.5 bg-red-100 rounded-lg px-2"><span className="font-bold text-red-800">취득세 합계</span><span className="font-black text-red-700">{fmt(acqTax.total)}만원</span></div>
          </div>

          {/* 보유세 결과 */}
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-4 space-y-1.5 border border-orange-200">
            <h4 className="text-xs font-bold text-orange-800 mb-2">📅 보유세 (연간)</h4>
            <div className="flex justify-between text-xs py-1"><span className="text-gray-600">재산세</span><span className="font-bold">{fmt(holdTax.propertyTax)}만원</span></div>
            <div className="flex justify-between text-xs py-1"><span className="text-gray-600">종합부동산세</span><span className={`font-bold ${holdTax.jongbuTax > 0 ? 'text-red-600' : 'text-green-600'}`}>{holdTax.jongbuTax > 0 ? `${fmt(holdTax.jongbuTax)}만원` : '비해당'}</span></div>
            <div className="flex justify-between text-xs py-1.5 bg-orange-100 rounded-lg px-2"><span className="font-bold text-orange-800">보유세 합계</span><span className="font-black text-orange-700">{fmt(holdTax.total)}만원/년</span></div>
          </div>

          {/* 양도세 결과 */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 space-y-1.5 border border-purple-200">
            <h4 className="text-xs font-bold text-purple-800 mb-2">💸 양도소득세</h4>
            <div className="flex justify-between text-xs py-1"><span className="text-gray-600">양도차익</span><span className="font-bold">{fmt(transTax.gain)}만원</span></div>
            <div className="flex justify-between text-xs py-1"><span className="text-gray-600">적용세율</span><span className="font-bold text-purple-600">{transTax.rate}</span></div>
            {transTax.isExempt && transTax.exemption && (
              <div className="text-[10px] text-green-600 font-bold bg-green-50 rounded px-2 py-1">✅ {transTax.exemption}</div>
            )}
            <div className="flex justify-between text-xs py-1.5 bg-purple-100 rounded-lg px-2"><span className="font-bold text-purple-800">예상 양도세</span><span className="font-black text-purple-700">{fmt(transTax.tax)}만원</span></div>
          </div>

          {/* 세금 총합 */}
          <div className="bg-gray-800 rounded-xl p-3 text-center">
            <span className="text-[10px] text-gray-400">취득~보유~양도 세금 총 예상</span>
            <div className="text-lg font-black text-white mt-1">{fmtOk(acqTax.total + holdTax.total * taxSim.holdingYears + transTax.tax)}원</div>
            <span className="text-[9px] text-gray-500">취득세 {fmt(acqTax.total)} + 보유세 {fmt(holdTax.total)}×{taxSim.holdingYears}년 + 양도세 {fmt(transTax.tax)}</span>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* 탭2: 대출한도 분석 */}
      {/* ═══════════════════════════════════════ */}
      {estateTab === 'loan' && (
        <div className="space-y-3">
          <div className="bg-white rounded-xl p-4 space-y-1 shadow-sm">
            <h4 className="text-sm font-bold text-blue-700 mb-2">🏦 대출한도 분석</h4>
            <EstateInputRow label="연소득" value={loanSim.annualIncome} onChange={v => setLoanSim(p => ({...p, annualIncome: v}))} />
            <EstateInputRow label="매매가" value={loanSim.propertyValue} onChange={v => setLoanSim(p => ({...p, propertyValue: v}))} />
            <EstateInputRow label="기존 대출 연상환액" value={loanSim.existingLoanPayment} onChange={v => setLoanSim(p => ({...p, existingLoanPayment: v}))} />
            <EstateInputRow label="대출금리" value={loanSim.loanRate} onChange={v => setLoanSim(p => ({...p, loanRate: v}))} unit="%" />
            <EstateInputRow label="대출기간" value={loanSim.loanYears} onChange={v => setLoanSim(p => ({...p, loanYears: v}))} unit="년" />
            <div className="flex items-center gap-2 py-1.5">
              <span className="text-xs text-gray-600 flex-1">규제지역 여부</span>
              <div className="flex gap-1">
                <button onClick={() => setLoanSim(p => ({...p, isRegulated: false}))}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${!loanSim.isRegulated ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>비규제</button>
                <button onClick={() => setLoanSim(p => ({...p, isRegulated: true}))}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${loanSim.isRegulated ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'}`}>규제지역</button>
              </div>
            </div>
          </div>

          {/* 한도 비교 바 */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 space-y-3 border border-blue-200">
            <h4 className="text-xs font-bold text-blue-800 mb-2">📊 한도 비교</h4>
            {[
              { label: 'LTV', rate: loanResult.ltvRate, limit: loanResult.ltvLimit, color: 'bg-blue-500' },
              { label: 'DTI', rate: loanResult.dtiRate, limit: loanResult.dtiLimit, color: 'bg-green-500' },
              { label: 'DSR', rate: loanResult.dsrRate, limit: loanResult.dsrLimit, color: 'bg-purple-500' },
            ].map(item => {
              const maxLimit = Math.max(loanResult.ltvLimit, loanResult.dtiLimit, loanResult.dsrLimit, 1);
              const barWidth = Math.max(5, (item.limit / maxLimit) * 100);
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-gray-700">{item.label} ({item.rate}%)</span>
                    <span className={`font-bold ${item.limit === loanResult.finalLimit ? 'text-red-600' : 'text-gray-700'}`}>{fmtOk(item.limit)}원 {item.limit === loanResult.finalLimit ? '◀ 제한' : ''}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className={`h-3 rounded-full ${item.color} ${item.limit === loanResult.finalLimit ? 'opacity-100' : 'opacity-60'}`} style={{ width: `${barWidth}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* 최종 결과 */}
          <div className="bg-blue-800 rounded-xl p-4 text-center space-y-2">
            <div className="text-[10px] text-blue-300">최대 대출 가능액 ({loanResult.binding} 제한)</div>
            <div className="text-2xl font-black text-white">{fmtOk(loanResult.finalLimit)}원</div>
            <div className="text-[10px] text-blue-300">필요 자기자본: {fmtOk(Math.max(0, loanSim.propertyValue - loanResult.finalLimit))}원</div>
            <div className="text-xs text-blue-200 mt-1">예상 월상환액: <span className="font-bold text-white">{fmt(loanResult.monthlyPayment)}만원</span></div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* 탭3: 매매 vs 전세 vs 월세 비교 */}
      {/* ═══════════════════════════════════════ */}
      {estateTab === 'compare' && (
        <div className="space-y-3">
          <div className="bg-white rounded-xl p-4 space-y-1 shadow-sm">
            <h4 className="text-sm font-bold text-green-700 mb-2">⚖️ 매매 vs 전세 vs 월세</h4>
            <EstateInputRow label="매매가" value={compareSim.buyPrice} onChange={v => setCompareSim(p => ({...p, buyPrice: v}))} />
            <EstateInputRow label="전세가" value={compareSim.jeonsePrice} onChange={v => setCompareSim(p => ({...p, jeonsePrice: v}))} />
            <EstateInputRow label="월세 보증금" value={compareSim.monthlyDeposit} onChange={v => setCompareSim(p => ({...p, monthlyDeposit: v}))} />
            <EstateInputRow label="월세" value={compareSim.monthlyRent} onChange={v => setCompareSim(p => ({...p, monthlyRent: v}))} />
            <EstateInputRow label="연 시세상승률" value={compareSim.expectedAppreciation} onChange={v => setCompareSim(p => ({...p, expectedAppreciation: v}))} unit="%" />
            <EstateInputRow label="투자수익률 (기회비용)" value={compareSim.investReturn} onChange={v => setCompareSim(p => ({...p, investReturn: v}))} unit="%" />
            <EstateInputRow label="분석 기간" value={compareSim.analysisPeriod} onChange={v => setCompareSim(p => ({...p, analysisPeriod: v}))} unit="년" />
          </div>

          {/* 비교 결과 카드 */}
          <div className="space-y-2">
            {[compareResult.buy, compareResult.jeonse, compareResult.wolse].map((opt, i) => {
              const isBest = opt.label === bestOption.label;
              const colors = [
                { bg: 'from-red-50 to-red-100', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-500' },
                { bg: 'from-blue-50 to-blue-100', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-500' },
                { bg: 'from-green-50 to-green-100', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-500' },
              ][i];
              return (
                <div key={opt.label} className={`bg-gradient-to-br ${colors.bg} rounded-xl p-3 border ${colors.border} ${isBest ? 'ring-2 ring-yellow-400' : ''}`}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      {isBest && <span className="text-[9px] bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded-full font-bold">👑 최적</span>}
                      <span className={`text-sm font-bold ${colors.text}`}>{opt.label}</span>
                    </div>
                    <span className={`text-base font-black ${opt.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>{opt.net >= 0 ? '+' : ''}{fmtOk(opt.net)}원</span>
                  </div>
                  <div className="text-[10px] text-gray-500">{opt.desc}</div>
                </div>
              );
            })}
          </div>

          {/* AI 추천 */}
          <div className="bg-blue-50 rounded-xl p-3 flex gap-2 border border-blue-200">
            <span className="text-base">🤖</span>
            <p className="text-xs text-blue-700 leading-relaxed">
              <strong>AI머니야 분석:</strong> {compareSim.analysisPeriod}년 기준, 시세상승률 {compareSim.expectedAppreciation}% 가정 시 <strong>{bestOption.label}</strong>이 가장 유리합니다. 
              {bestOption.label === '매매' && ` 시세차익 ${fmtOk(compareResult.buy.gain)}원이 기대됩니다.`}
              {bestOption.label === '전세' && ` 전세금 운용수익이 매매 시세차익보다 큽니다.`}
              {bestOption.label === '월세' && ` 자금 유연성과 투자수익이 높습니다.`}
            </p>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* 탭4: 투자수익률(ROI) 계산기 */}
      {/* ═══════════════════════════════════════ */}
      {estateTab === 'roi' && (
        <div className="space-y-3">
          <div className="bg-white rounded-xl p-4 space-y-1 shadow-sm">
            <h4 className="text-sm font-bold text-purple-700 mb-2">📈 투자수익률(ROI) 계산기</h4>
            <EstateInputRow label="매입가" value={roiSim.purchasePrice} onChange={v => setRoiSim(p => ({...p, purchasePrice: v}))} />
            <EstateInputRow label="취득부대비용" value={roiSim.acquisitionCost} onChange={v => setRoiSim(p => ({...p, acquisitionCost: v}))} badge="세금+복비" badgeColor="bg-orange-100 text-orange-600" />
            <EstateInputRow label="대출금" value={roiSim.loanAmount} onChange={v => setRoiSim(p => ({...p, loanAmount: v}))} />
            <EstateInputRow label="대출금리" value={roiSim.loanInterestRate} onChange={v => setRoiSim(p => ({...p, loanInterestRate: v}))} unit="%" />
            <EstateInputRow label="월 임대수입" value={roiSim.monthlyRentalIncome} onChange={v => setRoiSim(p => ({...p, monthlyRentalIncome: v}))} />
            <EstateInputRow label="월 관리비용" value={roiSim.monthlyExpense} onChange={v => setRoiSim(p => ({...p, monthlyExpense: v}))} />
            <EstateInputRow label="예상 매도가" value={roiSim.expectedSellPrice} onChange={v => setRoiSim(p => ({...p, expectedSellPrice: v}))} />
            <EstateInputRow label="보유기간" value={roiSim.holdYears} onChange={v => setRoiSim(p => ({...p, holdYears: v}))} unit="년" />
          </div>

          {/* 수익 분석 결과 */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 space-y-1.5 border border-purple-200">
            <h4 className="text-xs font-bold text-purple-800 mb-2">💰 수익 분석</h4>
            <div className="flex justify-between text-xs py-1 border-b border-purple-100"><span className="text-gray-600">총 투자금액</span><span className="font-bold">{fmt(roiResult.totalInvest)}만원</span></div>
            <div className="flex justify-between text-xs py-1 border-b border-purple-100"><span className="text-gray-600">자기자본</span><span className="font-bold text-blue-600">{fmt(roiResult.selfCapital)}만원</span></div>
            <div className="flex justify-between text-xs py-1 border-b border-purple-100"><span className="text-gray-600">연간 임대수익 (순)</span><span className="font-bold">{fmt(roiResult.annualRental)}만원</span></div>
            <div className="flex justify-between text-xs py-1 border-b border-purple-100"><span className="text-gray-600">연간 대출이자</span><span className="font-bold text-red-500">-{fmt(roiResult.annualInterest)}만원</span></div>
            <div className="flex justify-between text-xs py-1 border-b border-purple-100"><span className="text-gray-600">연간 순수익</span><span className={`font-bold ${roiResult.annualNetIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fmt(roiResult.annualNetIncome)}만원</span></div>
            <div className="flex justify-between text-xs py-1 border-b border-purple-100"><span className="text-gray-600">매매차익 (시세차익)</span><span className={`font-bold ${roiResult.capitalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fmt(roiResult.capitalGain)}만원</span></div>
            <div className="flex justify-between text-xs py-1.5 bg-purple-100 rounded-lg px-2"><span className="font-bold text-purple-800">총 수익</span><span className="font-black text-purple-700">{fmt(roiResult.totalProfit)}만원</span></div>
          </div>

          {/* ROI 지표 */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white rounded-xl p-3 text-center border border-gray-200">
              <div className="text-[10px] text-gray-500">Cap Rate (임대수익률)</div>
              <div className={`text-xl font-black ${roiResult.capRate >= 5 ? 'text-green-600' : roiResult.capRate >= 3 ? 'text-blue-600' : 'text-red-600'}`}>{roiResult.capRate.toFixed(1)}%</div>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-gray-200">
              <div className="text-[10px] text-gray-500">연평균 수익률</div>
              <div className={`text-xl font-black ${roiResult.annualROI >= 10 ? 'text-green-600' : roiResult.annualROI >= 5 ? 'text-blue-600' : 'text-red-600'}`}>{roiResult.annualROI.toFixed(1)}%</div>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-gray-200">
              <div className="text-[10px] text-gray-500">총 ROI (투자대비)</div>
              <div className={`text-xl font-black ${roiResult.grossROI >= 20 ? 'text-green-600' : roiResult.grossROI >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{roiResult.grossROI.toFixed(1)}%</div>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-gray-200">
              <div className="text-[10px] text-gray-500">레버리지 ROI</div>
              <div className={`text-xl font-black ${roiResult.leverageROI >= 30 ? 'text-green-600' : roiResult.leverageROI >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{roiResult.leverageROI.toFixed(1)}%</div>
              <div className="text-[9px] text-gray-400">(자기자본 대비)</div>
            </div>
          </div>

          {/* ROI 해석 */}
          <div className="bg-blue-50 rounded-xl p-3 flex gap-2 border border-blue-200">
            <span className="text-base">🤖</span>
            <p className="text-xs text-blue-700 leading-relaxed">
              <strong>AI머니야 분석:</strong> {roiSim.holdYears}년 보유 시 자기자본 {fmtOk(roiResult.selfCapital)}원 투자로 총 {fmtOk(roiResult.totalProfit)}원 수익 예상. 
              {roiResult.capRate >= 5 ? ' 임대수익률이 양호합니다.' : roiResult.capRate >= 3 ? ' 임대수익률은 보통 수준입니다.' : ' 임대수익률이 낮아 시세차익에 의존합니다.'}
              {roiResult.leverageROI > roiResult.grossROI * 1.5 && ' 레버리지 효과가 크므로 금리 변동 리스크에 주의하세요.'}
            </p>
          </div>
        </div>
      )}

      <div className="mt-3 p-2 bg-amber-50 rounded-lg border border-amber-200">
        <p className="text-[10px] text-amber-700 text-center">
          ⚠️ 본 설계는 이해를 돕기 위한 일반적인 예시이므로 참고만 하시기 바랍니다. 구체적인 사항은 반드시 해당 전문가와 상담하시기 바랍니다.
        </p>
      </div>
      <div className="flex gap-2 pt-2">
        <button onClick={onPrev} className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm">← 이전</button>
        <button onClick={onNext} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold text-sm">다음 →</button>
      </div>
    </div>
  );
}

// ============================================
// 7. 보험설계 카드 (v4.1) - 시뮬레이터 방식 가로스크롤 테이블 + 보험증권 업로드 + 준비자금 직접입력
// ============================================
export function InsurancePlanCard({ onNext, onPrev, isLast, onOpenOCR }: CardProps) {
  const [showFormula, setShowFormula] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [formData, setFormData] = useState({ 
    annualIncome: 6000,
    totalDebt: 40000,
  });
  // 준비자금: 사용자가 직접 입력 (만원 단위)
  const [prepared, setPrepared] = useState({
    death: 20000,       // 사망 준비자금
    disability: 10000,  // 장해 준비자금
    cancer: 5000,       // 암진단 준비자금
    brain: 3000,        // 뇌혈관 준비자금
    heart: 3000,        // 심혈관 준비자금
    medical: 5000,      // 실비 준비자금
    hospital: 'O' as string,  // 입원수술 가입여부
    dementia: 'X' as string,  // 치매간병 가입여부
  });
  
  useEffect(() => {
    const saved = loadDesignData('insurance');
    if (saved) {
      if (saved.annualIncome) setFormData({ annualIncome: saved.annualIncome, totalDebt: saved.totalDebt || 40000 });
      if (saved.prepared) setPrepared(saved.prepared);
    }
  }, []);
  
  useEffect(() => { saveDesignData('insurance', { ...formData, prepared }); }, [formData, prepared]);

  // 필요자금 계산 (만원 단위)
  const required = {
    death: formData.annualIncome * 3 + formData.totalDebt,
    disability: formData.annualIncome * 3 + formData.totalDebt,
    cancer: formData.annualIncome * 2,
    brain: formData.annualIncome,
    heart: formData.annualIncome,
    medical: 5000,
  };

  // 부족자금 계산
  const lack = {
    death: required.death - prepared.death,
    disability: required.disability - prepared.disability,
    cancer: required.cancer - prepared.cancer,
    brain: required.brain - prepared.brain,
    heart: required.heart - prepared.heart,
    medical: required.medical - prepared.medical,
  };

  // 색상 결정: 부족=빨간색, 충분=녹색, 동일=파란색
  const getLackColor = (val: number) => {
    if (val > 0) return 'text-red-600';   // 부족
    if (val < 0) return 'text-green-600'; // 충분 (초과)
    return 'text-blue-600';               // 동일
  };
  const getLackBg = (val: number) => {
    if (val > 0) return 'bg-red-50';
    if (val < 0) return 'bg-green-50';
    return 'bg-blue-50';
  };

  // 금액 포맷 (만원 → 억/천 표시)
  const fmt = (amount: number) => {
    if (amount >= 10000) return `${(amount / 10000).toFixed(1)}억`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)}천`;
    if (amount <= -10000) return `${(amount / 10000).toFixed(1)}억`;
    if (amount <= -1000) return `${(amount / 1000).toFixed(0)}천`;
    return `${amount}만`;
  };
  
  // 부족자금 표시 텍스트
  const fmtLack = (val: number) => {
    if (val > 0) return fmt(val);        // 부족
    if (val < 0) return `+${fmt(Math.abs(val))}`;  // 초과(충분)
    return '0원';                         // 동일
  };

  // 특약 상태 색상
  const getSpecialColor = (val: string) => {
    const v = val.toUpperCase();
    if (v === 'O' || v === '유' || v === 'Y') return 'text-green-600';
    return 'text-red-600';
  };
  const getSpecialLack = (val: string) => {
    const v = val.toUpperCase();
    if (v === 'O' || v === '유' || v === 'Y') return { text: '-', color: 'text-green-600', bg: 'bg-green-50' };
    return { text: '미가입', color: 'text-red-600', bg: 'bg-red-50' };
  };

  // 부족 항목 수 계산
  const lackItems = [
    lack.death > 0, lack.disability > 0, lack.cancer > 0, lack.brain > 0, lack.heart > 0, lack.medical > 0,
    !['O','o','유','Y','y'].includes(prepared.hospital),
    !['O','o','유','Y','y'].includes(prepared.dementia),
  ];
  const lackCount = lackItems.filter(Boolean).length;

  // 가장 시급한 보장
  const urgentList = [
    { name: '사망', val: lack.death },
    { name: '장해', val: lack.disability },
    { name: '암진단', val: lack.cancer },
    { name: '뇌혈관', val: lack.brain },
    { name: '심혈관', val: lack.heart },
    { name: '실비', val: lack.medical },
  ].filter(i => i.val > 0).sort((a, b) => b.val - a.val);
  const mostUrgent = urgentList[0];

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();

  // 저장 & 부족자금 계산
  const handleSave = () => {
    saveDesignData('insurance', { ...formData, prepared });
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2500);
  };

  // 보험증권 업로드 (현재 +버튼 면책사항과 동일)
  const handleUpload = () => {
    if (onOpenOCR) {
      onOpenOCR();
    } else {
      alert('보험증권 업로드 기능은 추후 업데이트 예정입니다.\n\n⚠️ AI 분석은 참고용이며, 정확한 보험 분석은 전문 설계사 상담을 권장합니다.');
    }
  };

  const hospitalLack = getSpecialLack(prepared.hospital);
  const dementiaLack = getSpecialLack(prepared.dementia);

  return (
    <div className="space-y-3">
      {/* AI 멘트 */}
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">️</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>마지막! <span className="text-teal-600 font-bold">보험설계</span>입니다. <span className="text-teal-600 font-bold">8대 보장 분석</span>으로 부족한 보장을 확인해볼게요! ️</p>
        </div>
      </div>
      
      {/* 보험설계 카드 */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-xl">️</div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-800">보험설계</h3>
            <p className="text-[11px] text-gray-400">8대 보장 분석</p>
          </div>
          <span className="text-[11px] text-teal-700 font-bold bg-teal-50 px-2 py-1 rounded-md">7/7</span>
        </div>

        {/* ④ 보험증권 업로드 UI */}
        <div 
          onClick={handleUpload}
          className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-all mb-4"
        >
          <div className="text-2xl mb-1"></div>
          <div className="text-sm font-semibold text-gray-700">보험증권 업로드 (OCR 분석)</div>
          <div className="text-[11px] text-gray-400 mt-1">PDF, 이미지 파일 지원 · AI 자동 인식</div>
        </div>

        {/* 기본 정보 입력 - 연봉/총부채 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">연봉</label>
            <div className="flex items-center gap-1">
              <input type="number" value={formData.annualIncome} onChange={(e) => setFormData({...formData, annualIncome: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:border-teal-500 outline-none" />
              <span className="text-xs text-gray-500">만원</span>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">총부채</label>
            <div className="flex items-center gap-1">
              <input type="number" value={formData.totalDebt} onChange={(e) => setFormData({...formData, totalDebt: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:border-teal-500 outline-none" />
              <span className="text-xs text-gray-500">만원</span>
            </div>
          </div>
        </div>

        {/* ③ 스크롤 힌트 */}
        <div className="flex items-center justify-center gap-1.5 py-1.5 text-[11px] text-gray-400">
          <span></span> 좌우로 스크롤하여 8대 보장을 확인하세요 <span></span>
        </div>

        {/* ②③ 8대 보장 가로스크롤 테이블 */}
        <div className="mx-[-16px] px-[16px]">
          <div className="overflow-x-auto pb-2" style={{ WebkitOverflowScrolling: 'touch' }}>
            <table className="border-collapse w-full" style={{ minWidth: '700px' }}>
              {/* 헤더 */}
              <thead>
                <tr>
                  <th className="py-2.5 px-2 text-center text-[11px] font-bold text-white bg-gray-600 border border-gray-300 whitespace-nowrap" style={{ minWidth: '60px' }}>구분</th>
                  <th className="py-2.5 px-2 text-center text-[11px] font-bold text-white bg-purple-700 border border-gray-300 whitespace-nowrap">사망</th>
                  <th className="py-2.5 px-2 text-center text-[11px] font-bold text-white bg-purple-700 border border-gray-300 whitespace-nowrap">장해</th>
                  <th className="py-2.5 px-2 text-center text-[11px] font-bold text-white bg-purple-700 border border-gray-300 whitespace-nowrap">암진단</th>
                  <th className="py-2.5 px-2 text-center text-[11px] font-bold text-white bg-purple-700 border border-gray-300 whitespace-nowrap">뇌혈관</th>
                  <th className="py-2.5 px-2 text-center text-[11px] font-bold text-white bg-purple-700 border border-gray-300 whitespace-nowrap">심혈관</th>
                  <th className="py-2.5 px-2 text-center text-[11px] font-bold text-white bg-purple-700 border border-gray-300 whitespace-nowrap">실비</th>
                  <th className="py-2.5 px-2 text-center text-[11px] font-bold text-white bg-purple-700 border border-gray-300 whitespace-nowrap">입원수술</th>
                  <th className="py-2.5 px-2 text-center text-[11px] font-bold text-white bg-purple-700 border border-gray-300 whitespace-nowrap">치매간병</th>
                </tr>
              </thead>
              <tbody>
                {/* 필요자금 행 */}
                <tr className="bg-purple-50">
                  <td className="py-2 px-2 text-center text-xs font-bold text-purple-800 bg-purple-100 border border-gray-200 whitespace-nowrap">필요자금</td>
                  <td className="py-2 px-2 text-center text-xs font-semibold text-purple-700 border border-gray-200 whitespace-nowrap">{fmt(required.death)}</td>
                  <td className="py-2 px-2 text-center text-xs font-semibold text-purple-700 border border-gray-200 whitespace-nowrap">{fmt(required.disability)}</td>
                  <td className="py-2 px-2 text-center text-xs font-semibold text-purple-700 border border-gray-200 whitespace-nowrap">{fmt(required.cancer)}</td>
                  <td className="py-2 px-2 text-center text-xs font-semibold text-purple-700 border border-gray-200 whitespace-nowrap">{fmt(required.brain)}</td>
                  <td className="py-2 px-2 text-center text-xs font-semibold text-purple-700 border border-gray-200 whitespace-nowrap">{fmt(required.heart)}</td>
                  <td className="py-2 px-2 text-center text-xs font-semibold text-purple-700 border border-gray-200 whitespace-nowrap">{fmt(required.medical)}</td>
                  <td className="py-2 px-2 text-center text-xs font-semibold text-purple-700 border border-gray-200 whitespace-nowrap">특약필요</td>
                  <td className="py-2 px-2 text-center text-xs font-semibold text-purple-700 border border-gray-200 whitespace-nowrap">특약필요</td>
                </tr>
                {/* ⑤ 준비자금 행 - 클릭하여 직접 입력 */}
                <tr className="bg-green-50">
                  <td className="py-2 px-2 text-center text-xs font-bold text-green-800 bg-green-100 border border-gray-200 whitespace-nowrap">준비자금</td>
                  <td className="py-1 px-1 text-center border border-gray-200">
                    <input type="number" value={prepared.death} onChange={(e) => setPrepared({...prepared, death: Number(e.target.value)})} onFocus={handleFocus}
                      className="w-[58px] px-1 py-1 border-2 border-green-300 rounded-md text-center text-xs font-semibold text-green-700 bg-green-50 focus:border-teal-500 focus:bg-white outline-none" />
                  </td>
                  <td className="py-1 px-1 text-center border border-gray-200">
                    <input type="number" value={prepared.disability} onChange={(e) => setPrepared({...prepared, disability: Number(e.target.value)})} onFocus={handleFocus}
                      className="w-[58px] px-1 py-1 border-2 border-green-300 rounded-md text-center text-xs font-semibold text-green-700 bg-green-50 focus:border-teal-500 focus:bg-white outline-none" />
                  </td>
                  <td className="py-1 px-1 text-center border border-gray-200">
                    <input type="number" value={prepared.cancer} onChange={(e) => setPrepared({...prepared, cancer: Number(e.target.value)})} onFocus={handleFocus}
                      className="w-[58px] px-1 py-1 border-2 border-green-300 rounded-md text-center text-xs font-semibold text-green-700 bg-green-50 focus:border-teal-500 focus:bg-white outline-none" />
                  </td>
                  <td className="py-1 px-1 text-center border border-gray-200">
                    <input type="number" value={prepared.brain} onChange={(e) => setPrepared({...prepared, brain: Number(e.target.value)})} onFocus={handleFocus}
                      className="w-[58px] px-1 py-1 border-2 border-green-300 rounded-md text-center text-xs font-semibold text-green-700 bg-green-50 focus:border-teal-500 focus:bg-white outline-none" />
                  </td>
                  <td className="py-1 px-1 text-center border border-gray-200">
                    <input type="number" value={prepared.heart} onChange={(e) => setPrepared({...prepared, heart: Number(e.target.value)})} onFocus={handleFocus}
                      className="w-[58px] px-1 py-1 border-2 border-green-300 rounded-md text-center text-xs font-semibold text-green-700 bg-green-50 focus:border-teal-500 focus:bg-white outline-none" />
                  </td>
                  <td className="py-1 px-1 text-center border border-gray-200">
                    <input type="number" value={prepared.medical} onChange={(e) => setPrepared({...prepared, medical: Number(e.target.value)})} onFocus={handleFocus}
                      className="w-[58px] px-1 py-1 border-2 border-green-300 rounded-md text-center text-xs font-semibold text-green-700 bg-green-50 focus:border-teal-500 focus:bg-white outline-none" />
                  </td>
                  <td className="py-1 px-1 text-center border border-gray-200">
                    <input type="text" value={prepared.hospital} onChange={(e) => setPrepared({...prepared, hospital: e.target.value})} onFocus={handleFocus}
                      className={`w-[40px] px-1 py-1 border-2 border-green-300 rounded-md text-center text-xs font-semibold ${getSpecialColor(prepared.hospital)} bg-green-50 focus:border-teal-500 focus:bg-white outline-none`} placeholder="유/무" />
                  </td>
                  <td className="py-1 px-1 text-center border border-gray-200">
                    <input type="text" value={prepared.dementia} onChange={(e) => setPrepared({...prepared, dementia: e.target.value})} onFocus={handleFocus}
                      className={`w-[40px] px-1 py-1 border-2 border-green-300 rounded-md text-center text-xs font-semibold ${getSpecialColor(prepared.dementia)} bg-green-50 focus:border-teal-500 focus:bg-white outline-none`} placeholder="유/무" />
                  </td>
                </tr>
                {/* 부족자금 행 - 자동 계산 + 색상 표시 */}
                <tr className="bg-red-50">
                  <td className="py-2 px-2 text-center text-xs font-bold text-red-800 bg-red-100 border border-gray-200 whitespace-nowrap">부족자금</td>
                  <td className={`py-2 px-2 text-center text-[13px] font-extrabold border border-gray-200 whitespace-nowrap ${getLackColor(lack.death)} ${getLackBg(lack.death)}`}>{fmtLack(lack.death)}</td>
                  <td className={`py-2 px-2 text-center text-[13px] font-extrabold border border-gray-200 whitespace-nowrap ${getLackColor(lack.disability)} ${getLackBg(lack.disability)}`}>{fmtLack(lack.disability)}</td>
                  <td className={`py-2 px-2 text-center text-[13px] font-extrabold border border-gray-200 whitespace-nowrap ${getLackColor(lack.cancer)} ${getLackBg(lack.cancer)}`}>{fmtLack(lack.cancer)}</td>
                  <td className={`py-2 px-2 text-center text-[13px] font-extrabold border border-gray-200 whitespace-nowrap ${getLackColor(lack.brain)} ${getLackBg(lack.brain)}`}>{fmtLack(lack.brain)}</td>
                  <td className={`py-2 px-2 text-center text-[13px] font-extrabold border border-gray-200 whitespace-nowrap ${getLackColor(lack.heart)} ${getLackBg(lack.heart)}`}>{fmtLack(lack.heart)}</td>
                  <td className={`py-2 px-2 text-center text-[13px] font-extrabold border border-gray-200 whitespace-nowrap ${getLackColor(lack.medical)} ${getLackBg(lack.medical)}`}>{fmtLack(lack.medical)}</td>
                  <td className={`py-2 px-2 text-center text-[13px] font-extrabold border border-gray-200 whitespace-nowrap ${hospitalLack.color} ${hospitalLack.bg}`}>{hospitalLack.text}</td>
                  <td className={`py-2 px-2 text-center text-[13px] font-extrabold border border-gray-200 whitespace-nowrap ${dementiaLack.color} ${dementiaLack.bg}`}>{dementiaLack.text}</td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* 스크롤바 힌트 */}
          <div className="text-center py-1"><span className="text-[10px] text-gray-400">← 좌우로 스크롤하세요 →</span></div>
        </div>
      </div>

      {/* 공식 보기 토글 */}
      <button onClick={() => setShowFormula(!showFormula)} className="w-full flex items-center gap-1.5 px-3 py-2.5 bg-gray-100 rounded-lg text-xs font-semibold text-gray-600 hover:bg-teal-50 hover:text-teal-700 transition-all border border-transparent hover:border-teal-200">
        <span className={`text-[10px] transition-transform ${showFormula ? 'rotate-90' : ''}`}>▶</span>
        <span> 필요자금 계산 방법 보기</span>
      </button>
      {showFormula && (
        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200 space-y-1.5 text-[11px] text-purple-800">
          <div className="flex justify-between py-0.5 border-b border-purple-200/50"><span className="font-semibold">사망</span><span className="font-bold text-purple-600">(연봉×3) + 총부채</span></div>
          <div className="flex justify-between py-0.5 border-b border-purple-200/50"><span className="font-semibold">장해</span><span className="font-bold text-purple-600">(연봉×3) + 총부채</span></div>
          <div className="flex justify-between py-0.5 border-b border-purple-200/50"><span className="font-semibold">암진단</span><span className="font-bold text-purple-600">연봉 × 2배</span></div>
          <div className="flex justify-between py-0.5 border-b border-purple-200/50"><span className="font-semibold">뇌혈관</span><span className="font-bold text-purple-600">연봉 × 1배</span></div>
          <div className="flex justify-between py-0.5 border-b border-purple-200/50"><span className="font-semibold">심혈관</span><span className="font-bold text-purple-600">연봉 × 1배</span></div>
          <div className="flex justify-between py-0.5 border-b border-purple-200/50"><span className="font-semibold">실비</span><span className="font-bold text-purple-600">5,000만원</span></div>
          <div className="flex justify-between py-0.5 border-b border-purple-200/50"><span className="font-semibold">입원수술</span><span className="font-bold text-purple-600">특약 필요</span></div>
          <div className="flex justify-between py-0.5"><span className="font-semibold">치매간병</span><span className="font-bold text-purple-600">특약 필요</span></div>
        </div>
      )}

      {/* ⑥ 저장 버튼 */}
      <button 
        onClick={handleSave} 
        className="w-full py-3.5 rounded-lg font-bold text-sm text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 transition-all shadow-md"
      >
         저장하고 부족자금 계산하기
      </button>

      {/* 저장 완료 메시지 */}
      {showSaveSuccess && (
        <div className="text-center py-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-300">
          <div className="text-3xl mb-1">✅</div>
          <div className="text-sm font-bold text-green-700">보험 분석 저장 완료!</div>
        </div>
      )}

      {/* 분석 요약 */}
      <div className="bg-gradient-to-br from-teal-50/50 to-teal-100/30 rounded-xl p-4 border border-teal-200/50">
        <div className="text-xs font-bold text-teal-700 mb-3 flex items-center gap-1.5"> 보험 분석 요약</div>
        <div className="space-y-2">
          <div className="flex justify-between items-center py-1.5 border-b border-teal-200/30">
            <span className="text-xs text-gray-600">총 부족 보장</span>
            <span className={`text-sm font-bold ${lackCount > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {lackCount > 0 ? `${lackCount}개 항목` : '모두 충족! ✅'}
            </span>
          </div>
          {mostUrgent && (
            <div className="flex justify-between items-center py-1.5 border-b border-teal-200/30">
              <span className="text-xs text-gray-600">가장 시급한 보장</span>
              <span className="text-sm font-bold text-gray-800">{mostUrgent.name} ({fmt(mostUrgent.val)} 부족)</span>
            </div>
          )}
          {!['O','o','유','Y','y'].includes(prepared.dementia) && (
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-gray-600">치매간병 특약</span>
              <span className="text-sm font-bold text-amber-600">미가입 (추가 권장)</span>
            </div>
          )}
        </div>
      </div>

      {/* AI 추천 */}
      {mostUrgent && (
        <div className="bg-blue-50 rounded-xl p-3 flex gap-2 border border-blue-200">
          <span className="text-base"></span>
          <p className="text-xs text-blue-700 leading-relaxed">
            <strong>AI머니야 추천:</strong> {mostUrgent.name}보장이 가장 부족해요. {mostUrgent.name}
            {urgentList.length > 1 ? ` + ${urgentList[1].name}` : ''} 보장을 우선 보완하시는 것을 권장합니다.
          </p>
        </div>
      )}

      {/* 면책조항 */}
      <div className="p-2 bg-gray-100 rounded-lg">
        <p className="text-[10px] text-gray-500 text-center">※ AI 분석은 틀릴 수 있습니다. 정확한 보험 분석은 전문 설계사 상담을 권장합니다.</p>
      </div>

      <DisclaimerBox />
      <div className="flex gap-2 pt-2">
        <button onClick={onPrev} className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm">← 이전</button>
        <button onClick={onNext} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold text-sm">{isLast ? '금융집 완성 ' : '다음 →'}</button>
      </div>
    </div>
  );
}
