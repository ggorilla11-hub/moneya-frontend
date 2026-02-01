// src/pages/FinancialPlanCards.tsx
// v4.1: 7개 재무설계 카드 컴포넌트
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
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">🏖️</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>첫 번째는 <span className="text-teal-600 font-bold">은퇴설계</span>입니다. 노후 준비 상태를 분석해 드릴게요.</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-4 space-y-3 shadow-sm">
        <h3 className="text-base font-bold text-gray-800 mb-3">🏖️ 은퇴설계</h3>
        <div className="space-y-1"><label className="text-sm font-semibold text-gray-700">현재 나이</label><div className="flex items-center gap-2"><input type="number" value={formData.currentAge} onChange={(e) => setFormData({...formData, currentAge: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" /><span className="text-sm text-gray-500 font-medium w-8">세</span></div></div>
        <div className="space-y-1"><label className="text-sm font-semibold text-gray-700">은퇴 예정 나이</label><div className="flex items-center gap-2"><input type="number" value={formData.retireAge} onChange={(e) => setFormData({...formData, retireAge: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" /><span className="text-sm text-gray-500 font-medium w-8">세</span></div></div>
        <div className="space-y-1"><label className="text-sm font-semibold text-gray-700">예상 노후생활비 (월)</label><div className="flex items-center gap-2"><input type="number" value={formData.monthlyLivingExpense} onChange={(e) => setFormData({...formData, monthlyLivingExpense: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" /><span className="text-sm text-gray-500 font-medium w-10">만원</span></div></div>
        <div className="space-y-1"><label className="text-sm font-semibold text-gray-700">예상 국민연금 (월)</label><div className="flex items-center gap-2"><input type="number" value={formData.expectedNationalPension} onChange={(e) => setFormData({...formData, expectedNationalPension: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" /><span className="text-sm text-gray-500 font-medium w-10">만원</span></div></div>
        <div className="space-y-1"><label className="text-sm font-semibold text-gray-700">납입중인 개인연금 (월)</label><div className="flex items-center gap-2"><input type="number" value={formData.currentPersonalPension} onChange={(e) => setFormData({...formData, currentPersonalPension: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" /><span className="text-sm text-gray-500 font-medium w-10">만원</span></div></div>
        <div className="space-y-1"><label className="text-sm font-semibold text-gray-700">예상 퇴직연금 일시금</label><div className="flex items-center gap-2"><input type="number" value={formData.expectedRetirementLumpSum} onChange={(e) => setFormData({...formData, expectedRetirementLumpSum: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" /><span className="text-sm text-gray-500 font-medium w-10">만원</span></div></div>
      </div>
      
      <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-4 space-y-2 border border-teal-200">
        <h3 className="text-sm font-bold text-teal-800 mb-2">📊 은퇴설계 분석 결과</h3>
        <div className="flex justify-between text-sm py-1"><span className="text-gray-700">경제활동 기간</span><span className="font-bold text-teal-700">{economicYears}년</span></div>
        <div className="flex justify-between text-sm py-1"><span className="text-gray-700">은퇴 후 기간</span><span className="font-bold text-teal-700">{retirementYears}년</span></div>
        <div className="flex justify-between text-sm py-1"><span className="text-gray-700">월 부족액</span><span className="font-bold text-red-600">{monthlyGap.toLocaleString()}만원</span></div>
        <div className="flex justify-between text-sm py-1"><span className="text-gray-700">은퇴일시금 필요액</span><span className="font-bold text-red-600">{(totalRetirementNeeded / 10000).toFixed(1)}억원</span></div>
        <div className="flex justify-between text-sm py-1"><span className="text-gray-700">예상 퇴직연금 일시금</span><span className="font-bold text-teal-700">{(formData.expectedRetirementLumpSum / 10000).toFixed(1)}억원</span></div>
        <div className="flex justify-between text-sm py-1 border-t border-teal-200 pt-2"><span className="text-gray-700 font-bold">순 은퇴일시금</span><span className="font-bold text-red-600">{(netRetirementNeeded / 10000).toFixed(1)}억원</span></div>
        <div className="bg-white rounded-lg p-3 mt-2 border border-teal-300"><div className="flex justify-between items-center"><span className="text-sm text-gray-700 font-bold">💰 월 저축연금액</span><span className="font-bold text-teal-600 text-lg">{monthlyRequiredSaving.toLocaleString()}만원</span></div></div>
        <button onClick={() => setShowFormula(!showFormula)} className="w-full text-left text-xs text-teal-600 font-medium mt-2 flex items-center gap-1 hover:text-teal-800 transition-colors"><span>📐 계산 방법 보기</span><span className="text-sm">{showFormula ? '▲' : '▼'}</span></button>
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
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">💳</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>두 번째는 <span className="text-teal-600 font-bold">부채설계</span>입니다. 대출상환 우선순위를 분석해 드릴게요.</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-base font-bold text-gray-800 mb-3">💳 부채 현황</h3>
        <div className="space-y-2">
          {debtData.totalCreditDebt > 0 && (<div className="flex justify-between text-sm py-1"><span className="text-gray-600">💳 신용대출 ({debtData.creditDebts.length}건)</span><span className="font-bold text-red-600">{debtData.totalCreditDebt.toLocaleString()}만원</span></div>)}
          {debtData.totalOtherDebt > 0 && (<div className="flex justify-between text-sm py-1"><span className="text-gray-600">📦 기타부채 ({debtData.otherDebts.length}건)</span><span className="font-bold text-gray-600">{debtData.totalOtherDebt.toLocaleString()}만원</span></div>)}
          {debtData.totalMortgageDebt > 0 && (<div className="flex justify-between text-sm py-1"><span className="text-gray-600">🏠 담보대출 ({debtData.mortgageDebts.length}건)</span><span className="font-bold text-blue-600">{debtData.totalMortgageDebt.toLocaleString()}만원</span></div>)}
          <div className="flex justify-between text-sm py-2 border-t border-gray-200 mt-2"><span className="font-bold text-gray-800">총 부채</span><span className="font-bold text-purple-700 text-lg">{totalDebt > 0 ? (totalDebt / 10000).toFixed(1) + '억원' : '0원'}</span></div>
        </div>
      </div>
      
      {totalDebt > 0 && (
        <div className={`rounded-xl p-4 border ${dsrBgColor}`}>
          <div className="flex justify-between items-center"><span className="text-sm font-semibold text-gray-700">📊 DSR (추정)</span><span className={`font-bold text-lg ${dsrColor}`}>{dsr.toFixed(1)}% ({dsrLevel})</span></div>
          <p className="text-xs text-gray-500 mt-1">월소득 {monthlyIncome.toLocaleString()}만원 기준</p>
        </div>
      )}
      
      {repaymentPriority.length > 0 ? (
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
          <h3 className="text-sm font-bold text-purple-800 mb-3">📋 대출상환 우선순위</h3>
          <div className="space-y-2">
            {repaymentPriority.map((debt, index) => (
              <div key={debt.id} className="flex items-center gap-2 bg-white rounded-lg p-2.5">
                <div className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{index + 1}</div>
                <div className="flex-1 min-w-0"><div className="flex items-center gap-1.5"><span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${getTypeColor(debt.type)}`}>{getTypeLabel(debt.type)}</span><span className="text-sm font-medium text-gray-800 truncate">{debt.name || '무명'}</span></div></div>
                <div className="text-right flex-shrink-0"><div className="text-sm font-bold text-gray-800">{debt.amount.toLocaleString()}만원</div><div className="text-[10px] text-gray-500">{debt.rate}%</div></div>
              </div>
            ))}
          </div>
          <div className="mt-3 p-3 bg-white/70 rounded-lg"><p className="text-xs text-purple-800 font-semibold mb-1">💡 상환 전략</p><p className="text-[11px] text-gray-600 leading-relaxed">1️⃣ <strong>신용대출</strong>부터 상환 (금액 작은 순)<br/>2️⃣ <strong>기타부채</strong> 상환<br/>3️⃣ <strong>담보대출</strong>은 이자율 높은 순으로 상환</p></div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200 text-center"><span className="text-4xl">🎉</span><p className="text-sm font-bold text-green-700 mt-2">부채가 없습니다!</p><p className="text-xs text-green-600">건전한 재무 상태입니다.</p></div>
      )}
      
      <button onClick={() => setShowFormula(!showFormula)} className="w-full text-left text-xs text-teal-600 font-medium flex items-center gap-1 hover:text-teal-800 transition-colors"><span>📐 상환 우선순위 기준 보기</span><span>{showFormula ? '▲' : '▼'}</span></button>
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
  { id: 'house', label: '🏠 내집마련', icon: '🏠' }, { id: 'education', label: '🎓 자녀교육', icon: '🎓' },
  { id: 'car', label: '🚗 자동차', icon: '🚗' }, { id: 'travel', label: '✈️ 여행', icon: '✈️' },
  { id: 'wedding', label: '💍 결혼', icon: '💍' }, { id: 'emergency', label: '🆘 비상금', icon: '🆘' },
  { id: 'retirement', label: '🏖️ 노후자금', icon: '🏖️' }, { id: 'other', label: '📝 기타목적', icon: '📝' },
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
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">💰</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>세 번째는 <span className="text-teal-600 font-bold">저축설계</span>입니다. 목적자금별로 저축 계획을 세워볼까요?</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-base font-bold text-gray-800 mb-3">💰 저축설계</h3>
        <div className="mb-4"><label className="text-sm font-semibold text-gray-700 block mb-2">🎯 저축 목적</label>
          <div className="flex flex-wrap gap-2">
            {savingPurposeOptions.map(option => (
              <button key={option.id} onClick={() => setFormData({...formData, purpose: option.id})} className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-colors ${formData.purpose === option.id ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>{option.label}</button>
            ))}
          </div>
        </div>
        <div className="mb-3"><label className="text-sm font-semibold text-gray-700 block mb-1">💵 목표 금액</label><div className="flex items-center gap-2"><input type="number" value={formData.targetAmount} onChange={(e) => setFormData({...formData, targetAmount: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" /><span className="text-sm text-gray-500 font-medium w-10">만원</span></div></div>
        <div><label className="text-sm font-semibold text-gray-700 block mb-1">📅 목표 기간</label><div className="flex items-center gap-2"><input type="number" value={formData.targetYears} onChange={(e) => setFormData({...formData, targetYears: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" /><span className="text-sm text-gray-500 font-medium w-8">년</span></div></div>
      </div>
      
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
        <h3 className="text-sm font-bold text-blue-800 mb-3">📊 저축 계획 분석</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm py-1"><span className="text-gray-700">목표 금액</span><span className="font-bold text-blue-700">{formatTargetAmount(formData.targetAmount)}</span></div>
          <div className="flex justify-between text-sm py-1"><span className="text-gray-700">목표 기간</span><span className="font-bold text-blue-700">{formData.targetYears}년 ({targetMonths}개월)</span></div>
          <div className="flex justify-between text-sm py-1 border-t border-blue-200 pt-2"><span className="text-gray-700">월 필요 저축액</span><span className="font-bold text-blue-600 text-lg">약 {monthlyRequired.toLocaleString()}만원</span></div>
          <div className="flex justify-between text-sm py-1"><span className="text-gray-700">현재 월 저축액</span><span className="font-bold text-gray-700">{currentTotalSaving.toLocaleString()}만원</span></div>
          <div className="flex justify-between text-sm py-1 border-t border-blue-200 pt-2"><span className="text-gray-700 font-bold">월 추가 필요액</span><span className={`font-bold text-lg ${additionalRequired > 0 ? 'text-red-600' : 'text-green-600'}`}>{additionalRequired > 0 ? `${additionalRequired.toLocaleString()}만원` : '충분함 ✓'}</span></div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <h3 className="text-sm font-bold text-gray-800 mb-3">📊 추천 배분</h3>
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
      
      <button onClick={() => setShowFormula(!showFormula)} className="w-full text-left text-xs text-teal-600 font-medium flex items-center gap-1 hover:text-teal-800 transition-colors"><span>📐 계산 방법 보기</span><span>{showFormula ? '▲' : '▼'}</span></button>
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
    if (index >= 200) return { grade: '궁전', icon: '🏰', color: 'text-purple-600', bgColor: 'bg-purple-100' };
    if (index >= 100) return { grade: '4단계', icon: '🏘️', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (index >= 50) return { grade: '3단계', icon: '🏡', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (index >= 0) return { grade: '2단계', icon: '🏠', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { grade: '텐트', icon: '🏕️', color: 'text-red-600', bgColor: 'bg-red-100' };
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
    { type: '유동성', icon: '💧', iconBg: 'bg-blue-100', current: formData.liquidAssets, ratio: targetRatios.liquid, target: targetAmounts.liquid, note: 'CMA, 금, 비상예비자금', status: formData.liquidAssets >= targetAmounts.liquid ? 'ok' : 'under' },
    { type: '안전성', icon: '🔒', iconBg: 'bg-green-100', current: formData.safeAssets, ratio: targetRatios.safe, target: targetAmounts.safe, note: '예금, 채권, 연금', status: formData.safeAssets > targetAmounts.safe * 1.1 ? 'over' : 'ok' },
    { type: '수익성', icon: '📊', iconBg: 'bg-orange-100', current: formData.growthAssets, ratio: targetRatios.growth, target: targetAmounts.growth, note: '펀드, ETF', status: formData.growthAssets >= targetAmounts.growth ? 'ok' : 'under' },
    { type: '고수익', icon: '🚀', iconBg: 'bg-red-100', current: formData.highRiskAssets, ratio: targetRatios.highRisk, target: targetAmounts.highRisk, note: '주식, 가상화폐', status: formData.highRiskAssets > targetAmounts.highRisk * 1.5 ? 'over' : 'ok' },
  ];
  const realEstateAllocation = [
    { type: '주거용', icon: '🏠', iconBg: 'bg-indigo-100', current: formData.residentialRealEstate, ratio: realEstateTargetRatios.residential, target: realEstateTargetAmounts.residential, note: '아파트, 빌라, 단독' },
    { type: '투자용', icon: '🏢', iconBg: 'bg-purple-100', current: formData.investmentRealEstate, ratio: realEstateTargetRatios.investment, target: realEstateTargetAmounts.investment, note: '건물, 주택, 토지, 기타' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">📈</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>네 번째는 <span className="text-teal-600 font-bold">투자설계</span>입니다. 부자지수와 자산배분 포트폴리오를 분석해 드릴게요.</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-base font-bold text-gray-800 mb-3">📈 투자설계</h3>
        <div className="space-y-2">
          <div className="flex items-center"><label className="text-sm font-semibold text-gray-700 w-20">현재 나이</label><input type="number" value={formData.currentAge} onChange={(e) => setFormData({...formData, currentAge: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus:border-teal-500 outline-none" /><span className="text-sm text-gray-500 w-12 text-right">세</span></div>
          <div className="flex items-center"><label className="text-sm font-semibold text-gray-700 w-20">월 소득</label><input type="number" value={formData.monthlyIncome} onChange={(e) => setFormData({...formData, monthlyIncome: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus:border-teal-500 outline-none" /><span className="text-sm text-gray-500 w-12 text-right">만원</span></div>
          <div className="flex items-center"><label className="text-sm font-semibold text-gray-700 w-20">총 자산</label><input type="number" value={formData.totalAssets} onChange={(e) => setFormData({...formData, totalAssets: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus:border-teal-500 outline-none" /><span className="text-sm text-gray-500 w-12 text-right">만원</span></div>
          <div className="flex items-center"><label className="text-sm font-semibold text-gray-700 w-20">총 부채</label><input type="number" value={formData.totalDebt} onChange={(e) => setFormData({...formData, totalDebt: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus:border-teal-500 outline-none" /><span className="text-sm text-gray-500 w-12 text-right">만원</span></div>
        </div>
        <div className="border-t border-gray-200 pt-3 mt-3">
          <h4 className="text-sm font-bold text-gray-700 mb-2">금융자산 배분 입력</h4>
          <div className="space-y-2">
            <div className="flex items-center"><label className="text-sm text-gray-700 w-20">💧 유동성</label><input type="number" value={formData.liquidAssets} onChange={(e) => setFormData({...formData, liquidAssets: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus:border-teal-500 outline-none" /><span className="text-sm text-gray-500 w-12 text-right">만원</span></div>
            <p className="text-[10px] text-gray-400 ml-20">CMA, 파킹통장, 금, 비상예비자금</p>
            <div className="flex items-center"><label className="text-sm text-gray-700 w-20">🔒 안전성</label><input type="number" value={formData.safeAssets} onChange={(e) => setFormData({...formData, safeAssets: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus:border-teal-500 outline-none" /><span className="text-sm text-gray-500 w-12 text-right">만원</span></div>
            <p className="text-[10px] text-gray-400 ml-20">예금, 채권, 연금</p>
            <div className="flex items-center"><label className="text-sm text-gray-700 w-20">📊 수익성</label><input type="number" value={formData.growthAssets} onChange={(e) => setFormData({...formData, growthAssets: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus:border-teal-500 outline-none" /><span className="text-sm text-gray-500 w-12 text-right">만원</span></div>
            <p className="text-[10px] text-gray-400 ml-20">펀드, ETF</p>
            <div className="flex items-center"><label className="text-sm text-gray-700 w-20">🔥 고수익</label><input type="number" value={formData.highRiskAssets} onChange={(e) => setFormData({...formData, highRiskAssets: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus:border-teal-500 outline-none" /><span className="text-sm text-gray-500 w-12 text-right">만원</span></div>
            <p className="text-[10px] text-gray-400 ml-20">주식, 코인</p>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
        <div className="text-center">
          <p className="text-sm font-bold text-purple-800 mb-2">💎 나의 부자지수</p>
          <p className={`text-4xl font-bold ${wealthGrade.color}`}>{wealthIndex.toFixed(0)}%</p>
          <div className={`inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full ${wealthGrade.bgColor}`}><span className="text-xl">{wealthGrade.icon}</span><span className={`font-bold ${wealthGrade.color}`}>{wealthGrade.grade}</span></div>
          <p className="text-[10px] text-gray-500 mt-2">순자산 {formatAmount(netAssets)} 기준</p>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-2 text-[10px] text-gray-600 flex flex-wrap gap-2 justify-center"><span>🏕️ 0%↓</span><span>🏠 50%↓</span><span>🏡 100%↓</span><span>🏘️ 200%↓</span><span>🏰 200%↑</span></div>
      
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-50 to-teal-100 px-3 py-2 border-b border-gray-200 flex justify-between items-center"><span className="text-sm font-bold text-teal-800">📊 금융자산 포트폴리오</span><span className="text-sm font-bold text-teal-600">{formatAmount(totalFinancialAssets)}원</span></div>
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
          <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 px-3 py-2 border-b border-gray-200 flex justify-between items-center"><span className="text-sm font-bold text-indigo-800">🏠 부동산 포트폴리오</span><span className="text-sm font-bold text-indigo-600">{formatAmount(totalRealEstateAssets)}원</span></div>
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
        <span className="text-2xl">🆘</span>
        <div className="flex-1">
          <p className={`text-sm font-bold ${hasEmergencyFund ? 'text-green-700' : 'text-red-700'}`}>비상예비자금: {hasEmergencyFund ? '확보 ✅' : '부족 ❌'}</p>
          <p className="text-xs text-gray-600">필요액: {emergencyFundRequired.toLocaleString()}만원 ({formData.dualIncome ? '맞벌이 3개월' : '외벌이 6개월'}치)</p>
          <p className="text-xs text-blue-600 mt-1">입력한 비상예비자금: {formData.emergencyFund.toLocaleString()}만원 (유동성에 포함됨)</p>
          {!hasEmergencyFund && (<p className="text-xs mt-1">부족액: <span className="font-bold text-red-600">{emergencyGap.toLocaleString()}만원</span></p>)}
        </div>
      </div>
      
      <button onClick={() => setShowFormula(!showFormula)} className="w-full text-left text-xs text-teal-600 font-medium flex items-center gap-1 hover:text-teal-800 transition-colors"><span>📐 계산 방법 보기</span><span>{showFormula ? '▲' : '▼'}</span></button>
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
// 5. 세금설계 카드
// ============================================
export function TaxPlanCard({ onNext, onPrev }: CardProps) {
  const [formData, setFormData] = useState({ 
    annualIncome: 6240, 
    taxAmount: 320,
    pensionSaving: 400, 
    irpContribution: 0, 
    housingSubscription: 240 
  });
  const [fileUploaded, setFileUploaded] = useState(false);
  
  useEffect(() => { const saved = loadDesignData('tax'); if (saved) setFormData(saved); }, []);
  useEffect(() => { saveDesignData('tax', formData); }, [formData]);
  
  const effectiveTaxRate = formData.annualIncome > 0 ? (formData.taxAmount / formData.annualIncome * 100) : 0;
  const pensionDeduction = Math.min(formData.pensionSaving, 400) * 0.165;
  const irpDeduction = Math.min(formData.irpContribution, 300) * 0.165;
  const housingDeduction = Math.min(formData.housingSubscription, 240) * 0.165;
  const totalDeduction = pensionDeduction + irpDeduction + housingDeduction;
  const additionalPensionSaving = 400 - formData.pensionSaving;
  const additionalTaxSaving = additionalPensionSaving > 0 ? additionalPensionSaving * 0.165 : 0;
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();
  
  const handleFileUpload = () => {
    setFileUploaded(true);
    alert('원천징수영수증 업로드 기능은 추후 업데이트 예정입니다.');
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">💸</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>다섯 번째는 <span className="text-teal-600 font-bold">세금설계</span>입니다. 원천징수영수증을 업로드하시면 절세 포인트를 분석해 드릴게요! 💸</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-4 space-y-4 shadow-sm">
        <h3 className="text-base font-bold text-gray-800">💸 세금설계</h3>
        <div onClick={handleFileUpload} className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-all">
          <div className="text-2xl mb-2">📄</div>
          <div className="text-sm font-semibold text-gray-700">원천징수영수증 업로드</div>
          <div className="text-xs text-gray-400 mt-1">PDF, 이미지 파일 지원 (OCR 자동 인식)</div>
          {fileUploaded && <div className="text-xs text-teal-600 mt-2">✓ 파일이 업로드되었습니다</div>}
        </div>
        <div className="space-y-3">
          <div className="space-y-1"><label className="text-sm font-semibold text-gray-700">총급여 (연)</label><div className="flex items-center gap-2"><input type="number" value={formData.annualIncome} onChange={(e) => setFormData({...formData, annualIncome: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" /><span className="text-sm text-gray-500 font-medium w-10">만원</span></div></div>
          <div className="space-y-1"><label className="text-sm font-semibold text-gray-700">결정세액 (연)</label><div className="flex items-center gap-2"><input type="number" value={formData.taxAmount} onChange={(e) => setFormData({...formData, taxAmount: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" /><span className="text-sm text-gray-500 font-medium w-10">만원</span></div></div>
          <div className="space-y-1"><label className="text-sm font-semibold text-gray-700">연금저축 납입 (연)</label><div className="flex items-center gap-2"><input type="number" value={formData.pensionSaving} onChange={(e) => setFormData({...formData, pensionSaving: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" /><span className="text-sm text-gray-500 font-medium w-10">만원</span></div></div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 space-y-2 border border-indigo-200">
        <h3 className="text-sm font-bold text-indigo-800 mb-2">📊 세금 분석 결과</h3>
        <div className="flex justify-between text-sm py-1 border-b border-indigo-200/50"><span className="text-gray-700">총급여</span><span className="font-bold text-gray-800">{formData.annualIncome.toLocaleString()}만원</span></div>
        <div className="flex justify-between text-sm py-1 border-b border-indigo-200/50"><span className="text-gray-700">결정세액</span><span className="font-bold text-gray-800">{formData.taxAmount.toLocaleString()}만원</span></div>
        <div className="flex justify-between text-sm py-1 border-b border-indigo-200/50"><span className="text-gray-700">실효세율</span><span className="font-bold text-indigo-600">{effectiveTaxRate.toFixed(1)}%</span></div>
        <div className="flex justify-between text-sm py-1"><span className="text-gray-700">예상 세액공제</span><span className="font-bold text-teal-600">약 {totalDeduction.toFixed(0)}만원</span></div>
      </div>
      
      {additionalPensionSaving > 0 && (
        <div className="bg-blue-50 rounded-xl p-3 flex gap-2 border border-blue-200">
          <span className="text-base">💡</span>
          <p className="text-xs text-blue-700 leading-relaxed"><strong>절세 Tip:</strong> 연금저축 {additionalPensionSaving}만원 추가 납입 시 약 {additionalTaxSaving.toFixed(0)}만원 세액공제 가능!</p>
        </div>
      )}
      
      <DisclaimerBox />
      <div className="flex gap-2 pt-2">
        <button onClick={onPrev} className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm">← 이전</button>
        <button onClick={onNext} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold text-sm">다음 →</button>
      </div>
    </div>
  );
}

// ============================================
// 6. 부동산설계 카드
// ============================================
export function EstatePlanCard({ onNext, onPrev }: CardProps) {
  const [formData, setFormData] = useState({ 
    hasHouse: true, residentialProperty: 40000, investmentProperty: 10000, currentAge: 37
  });
  
  useEffect(() => { const saved = loadDesignData('estate'); if (saved) setFormData(saved); }, []);
  useEffect(() => { saveDesignData('estate', formData); }, [formData]);
  
  const totalProperty = formData.residentialProperty + formData.investmentProperty;
  const estimatedMonthlyPension = Math.round((formData.residentialProperty / 40000) * 100);
  const canApplyPension = formData.currentAge >= 55 && formData.residentialProperty <= 90000;
  const yearsUntil55 = Math.max(0, 55 - formData.currentAge);
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();

  return (
    <div className="space-y-3">
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">🏠</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>여섯 번째는 <span className="text-teal-600 font-bold">부동산설계</span>입니다. 주택 보유 현황과 주택연금 예상을 분석해 드릴게요! 🏠</p>
        </div>
      </div>
      
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
      
      {formData.hasHouse && (
        <>
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4 space-y-2 border border-pink-200">
            <h3 className="text-sm font-bold text-pink-800 mb-2">🏠 부동산 현황</h3>
            <div className="flex justify-between text-sm py-1 border-b border-pink-200/50"><span className="text-gray-700">거주용 부동산</span><span className="font-bold text-gray-800">{(formData.residentialProperty / 10000).toFixed(1)}억원</span></div>
            <div className="flex justify-between text-sm py-1 border-b border-pink-200/50"><span className="text-gray-700">투자용 부동산</span><span className="font-bold text-gray-800">{(formData.investmentProperty / 10000).toFixed(1)}억원</span></div>
            <div className="flex justify-between text-sm py-1"><span className="text-gray-700 font-semibold">총 부동산 자산</span><span className="font-bold text-pink-600">{(totalProperty / 10000).toFixed(1)}억원</span></div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 space-y-2 border border-amber-200">
            <h3 className="text-sm font-bold text-amber-800 mb-2">🏖️ 주택연금 예상 (참고)</h3>
            <div className="flex justify-between text-sm py-1 border-b border-amber-200/50"><span className="text-gray-700">가입 조건</span><span className="font-bold text-gray-600 text-xs">만 55세 이상, 9억원 이하</span></div>
            <div className="flex justify-between text-sm py-1 border-b border-amber-200/50"><span className="text-gray-700">현재 상태</span>{canApplyPension ? (<span className="font-bold text-green-600">가입 가능 ✓</span>) : (<span className="font-bold text-amber-600">{formData.currentAge < 55 ? `${yearsUntil55}년 후 가능` : '9억 초과'}</span>)}</div>
            <div className="flex justify-between text-sm py-1"><span className="text-gray-700">65세 가입 시 예상 월수령</span><span className="font-bold text-teal-600">약 {estimatedMonthlyPension}만원</span></div>
          </div>
          <div className="bg-gray-100 rounded-xl p-4 text-center"><div className="text-2xl mb-2">🚧</div><div className="text-sm font-bold text-gray-600">Coming Soon</div><div className="text-xs text-gray-400 mt-1">부동산 심층 분석 기능은<br/>추후 업데이트 예정입니다.</div></div>
        </>
      )}
      {!formData.hasHouse && (
        <div className="bg-gray-100 rounded-xl p-6 text-center"><div className="text-3xl mb-2">🏠</div><div className="text-sm font-semibold text-gray-600">주택 미보유</div><div className="text-xs text-gray-400 mt-1">주택 구입 계획이 있으시면<br/>저축설계를 참고해주세요.</div></div>
      )}
      <DisclaimerBox />
      <div className="flex gap-2 pt-2">
        <button onClick={onPrev} className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm">← 이전</button>
        <button onClick={onNext} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold text-sm">다음 →</button>
      </div>
    </div>
  );
}

// ============================================
// 7. 보험설계 카드 (v4.1) - 시뮬레이터 방식 가로스크롤 + 보험증권 업로드 + 준비자금 직접입력
// ============================================
export function InsurancePlanCard({ onNext, onPrev, isLast }: CardProps) {
  const [showFormula, setShowFormula] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showOCRModal, setShowOCRModal] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
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
    return { text: '필요', color: 'text-red-600', bg: 'bg-red-50' };
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

  // 보험증권 업로드 → +버튼과 동일한 OCR 모달 열기
  const handleUpload = () => {
    setShowOCRModal(true);
    setPrivacyAgreed(false);
  };

  // 파일 선택 핸들러 (사진촬영/갤러리/파일첨부 공통)
  const handleFileInput = (accept: string, capture?: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    if (capture) input.setAttribute('capture', capture);
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // TODO: OCR 분석 연동 (추후 구현)
        setShowOCRModal(false);
        setPrivacyAgreed(false);
        alert(`📄 "${file.name}" 업로드 완료!\n\nOCR 분석 기능은 추후 업데이트 예정입니다.`);
      }
    };
    input.click();
  };

  const hospitalLack = getSpecialLack(prepared.hospital);
  const dementiaLack = getSpecialLack(prepared.dementia);

  return (
    <div className="space-y-3">
      {/* AI 멘트 */}
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">🛡️</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>마지막! <span className="text-teal-600 font-bold">보험설계</span>입니다. <span className="text-teal-600 font-bold">8대 보장 분석</span>으로 부족한 보장을 확인해볼게요! 🛡️</p>
        </div>
      </div>
      
      {/* 보험설계 카드 */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-xl">🛡️</div>
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
          <div className="text-2xl mb-1">📋</div>
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

        {/* 스크롤 힌트 (위) */}
        <div className="flex items-center justify-center gap-1.5 py-1.5 text-[11px] text-gray-400">
          <span>👆</span> 좌우로 스크롤하여 8대 보장을 확인하세요 <span>👉</span>
        </div>

        {/* ②③ 8대 보장 가로스크롤 테이블 */}
        <div className="mx-[-16px] px-[16px]">
          <div className="overflow-x-auto pb-2" style={{ WebkitOverflowScrolling: 'touch', overflowX: 'scroll' }}>
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
                    <input type="number" value={prepared.death} onChange={(e) => setPrepared({...prepared, death: Number(e.target.value)})} onFocus={handleFocus} placeholder="만원"
                      className="w-[62px] px-1 py-1 border-2 border-green-300 rounded-md text-center text-xs font-semibold text-green-700 bg-green-50 focus:border-teal-500 focus:bg-white outline-none" />
                  </td>
                  <td className="py-1 px-1 text-center border border-gray-200">
                    <input type="number" value={prepared.disability} onChange={(e) => setPrepared({...prepared, disability: Number(e.target.value)})} onFocus={handleFocus} placeholder="만원"
                      className="w-[62px] px-1 py-1 border-2 border-green-300 rounded-md text-center text-xs font-semibold text-green-700 bg-green-50 focus:border-teal-500 focus:bg-white outline-none" />
                  </td>
                  <td className="py-1 px-1 text-center border border-gray-200">
                    <input type="number" value={prepared.cancer} onChange={(e) => setPrepared({...prepared, cancer: Number(e.target.value)})} onFocus={handleFocus} placeholder="만원"
                      className="w-[62px] px-1 py-1 border-2 border-green-300 rounded-md text-center text-xs font-semibold text-green-700 bg-green-50 focus:border-teal-500 focus:bg-white outline-none" />
                  </td>
                  <td className="py-1 px-1 text-center border border-gray-200">
                    <input type="number" value={prepared.brain} onChange={(e) => setPrepared({...prepared, brain: Number(e.target.value)})} onFocus={handleFocus} placeholder="만원"
                      className="w-[62px] px-1 py-1 border-2 border-green-300 rounded-md text-center text-xs font-semibold text-green-700 bg-green-50 focus:border-teal-500 focus:bg-white outline-none" />
                  </td>
                  <td className="py-1 px-1 text-center border border-gray-200">
                    <input type="number" value={prepared.heart} onChange={(e) => setPrepared({...prepared, heart: Number(e.target.value)})} onFocus={handleFocus} placeholder="만원"
                      className="w-[62px] px-1 py-1 border-2 border-green-300 rounded-md text-center text-xs font-semibold text-green-700 bg-green-50 focus:border-teal-500 focus:bg-white outline-none" />
                  </td>
                  <td className="py-1 px-1 text-center border border-gray-200">
                    <input type="number" value={prepared.medical} onChange={(e) => setPrepared({...prepared, medical: Number(e.target.value)})} onFocus={handleFocus} placeholder="만원"
                      className="w-[62px] px-1 py-1 border-2 border-green-300 rounded-md text-center text-xs font-semibold text-green-700 bg-green-50 focus:border-teal-500 focus:bg-white outline-none" />
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
          {/* 단위 안내 (아래) */}
          <div className="text-center py-1"><span className="text-[10px] text-gray-500 font-medium">※ 준비자금 단위: 만원</span></div>
        </div>
      </div>

      {/* 공식 보기 토글 */}
      <button onClick={() => setShowFormula(!showFormula)} className="w-full flex items-center gap-1.5 px-3 py-2.5 bg-gray-100 rounded-lg text-xs font-semibold text-gray-600 hover:bg-teal-50 hover:text-teal-700 transition-all border border-transparent hover:border-teal-200">
        <span className={`text-[10px] transition-transform ${showFormula ? 'rotate-90' : ''}`}>▶</span>
        <span>📐 필요자금 계산 방법 보기</span>
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
        💾 저장하고 부족자금 계산하기
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
        <div className="text-xs font-bold text-teal-700 mb-3 flex items-center gap-1.5">📊 보험 분석 요약</div>
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
              <span className="text-sm font-bold text-amber-600">필요 (추가 권장)</span>
            </div>
          )}
        </div>
      </div>

      {/* AI 추천 */}
      {mostUrgent && (
        <div className="bg-blue-50 rounded-xl p-3 flex gap-2 border border-blue-200">
          <span className="text-base">🤖</span>
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
        <button onClick={onNext} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold text-sm">{isLast ? '금융집 완성 🎉' : '다음 →'}</button>
      </div>

      {/* OCR 모달 (+버튼과 동일한 면책사항 + 개인정보 동의 + 파일첨부) */}
      {showOCRModal && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={() => { setShowOCRModal(false); setPrivacyAgreed(false); }}
        >
          <div 
            className="bg-white w-[90%] max-w-md rounded-3xl p-6 mx-4"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'fadeIn 0.2s ease-out' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">📎 보험증권 업로드</h3>
              <button 
                onClick={() => { setShowOCRModal(false); setPrivacyAgreed(false); }}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* 개인정보 수집이용 동의 */}
            <div className="mb-4 p-3 bg-gray-50 rounded-xl">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacyAgreed}
                  onChange={(e) => setPrivacyAgreed(e.target.checked)}
                  className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600 leading-relaxed">
                  <span className="font-semibold text-gray-800">[필수] 개인정보 수집·이용 동의</span><br/>
                  첨부하신 서류(보험증권, 연금자료 등)는 AI 분석 목적으로만 사용되며, 분석 완료 후 즉시 삭제됩니다.
                </span>
              </label>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {/* 사진촬영 */}
              <button 
                onClick={() => handleFileInput('image/*', 'environment')}
                disabled={!privacyAgreed}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                  privacyAgreed 
                    ? 'bg-purple-50 border-purple-100 hover:border-purple-300' 
                    : 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  privacyAgreed ? 'bg-purple-100' : 'bg-gray-200'
                }`}>
                  <svg className={`w-6 h-6 ${privacyAgreed ? 'text-purple-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <span className={`text-xs font-semibold ${privacyAgreed ? 'text-gray-700' : 'text-gray-400'}`}>사진촬영</span>
              </button>
              
              {/* 사진/이미지 */}
              <button 
                onClick={() => handleFileInput('image/*')}
                disabled={!privacyAgreed}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                  privacyAgreed 
                    ? 'bg-amber-50 border-amber-100 hover:border-amber-300' 
                    : 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  privacyAgreed ? 'bg-amber-100' : 'bg-gray-200'
                }`}>
                  <svg className={`w-6 h-6 ${privacyAgreed ? 'text-amber-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
                <span className={`text-xs font-semibold ${privacyAgreed ? 'text-gray-700' : 'text-gray-400'}`}>사진/이미지</span>
              </button>
              
              {/* 파일첨부 */}
              <button 
                onClick={() => handleFileInput('.pdf,.doc,.docx,.xls,.xlsx,.hwp,.jpg,.jpeg,.png,.gif,.webp,.bmp')}
                disabled={!privacyAgreed}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                  privacyAgreed 
                    ? 'bg-blue-50 border-blue-100 hover:border-blue-300' 
                    : 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  privacyAgreed ? 'bg-blue-100' : 'bg-gray-200'
                }`}>
                  <svg className={`w-6 h-6 ${privacyAgreed ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                  </svg>
                </div>
                <span className={`text-xs font-semibold ${privacyAgreed ? 'text-gray-700' : 'text-gray-400'}`}>파일첨부</span>
              </button>
            </div>

            {/* 면책 안내 */}
            <div className="mt-4 p-2.5 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-[11px] text-amber-700 text-center leading-relaxed">
                ⚠️ AI 분석은 참고용이며, 정확한 보험 분석은 전문 설계사 상담을 권장합니다.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
