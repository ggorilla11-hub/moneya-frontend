// src/pages/FinancialPlanCards/TaxPlanCard.tsx
// 세금설계 카드 (v2.2) - FinancialPlanCards.tsx v4.4에서 분리
// v2.2: handleTaxUpload에 onOpenOCR 호출 로직 추가
// 기능 변경 없음 (1:1 동일)

import { useState, useEffect } from 'react';
import { saveDesignData, loadDesignData } from '../FinancialHouseDesign';
import { CardProps, TaxInputRow } from './shared';

export function TaxPlanCard({ onNext, onPrev, onOpenOCR }: CardProps) {
  const [activeTab, setActiveTab] = useState<'income' | 'inheritance'>('income');
  
  // ── 종합소득세 절세 state ──
  const [incomeData, setIncomeData] = useState({
    annualSalary: 6240, determinedTax: 200, prepaidTax: 300,
    selfDeduction: 150, dependentCount: 0, nationalPension: 0, healthInsurance: 0, employInsurance: 0,
    housingSubscription: 0, creditCardDeduction: 0, investmentPartnership: 0, rentLoanRepayment: 0,
    mortgageLoanInterest: 0, yellowUmbrella: 0,
    insurancePremium: 0, medicalExpense: 0, educationExpense: 0, donationAmount: 0, monthlyRent: 0,
    irpContribution: 0, pensionSaving: 0,
  });
  const [showSimulation, setShowSimulation] = useState(false);

  // ── 예상상속세 state ──
  const [inheritData, setInheritData] = useState({
    totalAssets: 0, totalDebts: 0, hasSpouse: true, childrenCount: 2,
    currentAge: 37, expectedLifespan: 85, inflationRate: 3,
  });

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
  const calcEarnedDeduction = (salary: number): number => {
    if (salary <= 500) return Math.round(salary * 0.7);
    if (salary <= 1500) return Math.round(350 + (salary - 500) * 0.4);
    if (salary <= 4500) return Math.round(750 + (salary - 1500) * 0.15);
    if (salary <= 10000) return Math.round(1200 + (salary - 4500) * 0.05);
    return Math.round(1475 + (salary - 10000) * 0.02);
  };

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
  const dependentDeduction = incomeData.dependentCount * 150;
  const housingDeductionAmount = Math.round(Math.min(incomeData.housingSubscription, 300) * 0.4);
  const totalIncomeDeduction = incomeData.selfDeduction + dependentDeduction + 
    incomeData.nationalPension + incomeData.healthInsurance + incomeData.employInsurance +
    housingDeductionAmount + incomeData.creditCardDeduction +
    incomeData.investmentPartnership + incomeData.rentLoanRepayment +
    incomeData.mortgageLoanInterest + incomeData.yellowUmbrella;
  const taxBase = Math.max(0, earnedIncome - totalIncomeDeduction);
  const { tax: calculatedTax, rate: taxRate } = calcIncomeTax(taxBase);
  const earnedTaxCredit = calcEarnedTaxCredit(calculatedTax, incomeData.annualSalary);
  const insuranceCredit = Math.round(Math.min(incomeData.insurancePremium, 100) * 0.12);
  const medicalOver = Math.max(0, incomeData.medicalExpense - Math.round(incomeData.annualSalary * 0.03));
  const medicalCredit = Math.round(medicalOver * 0.15);
  const educationCredit = Math.round(incomeData.educationExpense * 0.15);
  const donationCredit = Math.round(incomeData.donationAmount * 0.15);
  const rentCredit = Math.round(Math.min(incomeData.monthlyRent, 750) * 0.17);
  const pensionRate = incomeData.annualSalary <= 5500 ? 0.165 : 0.132;
  const pensionSavingLimit = Math.min(incomeData.pensionSaving, 600);
  const irpLimit = Math.min(incomeData.irpContribution, 900 - pensionSavingLimit);
  const pensionCredit = Math.round((pensionSavingLimit + irpLimit) * pensionRate);
  const totalTaxCredit = earnedTaxCredit + insuranceCredit + medicalCredit + educationCredit + donationCredit + rentCredit + pensionCredit;
  const simDeterminedTax = Math.max(0, calculatedTax - totalTaxCredit);
  const simRefund = incomeData.prepaidTax - simDeterminedTax;
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
  const doublingYears = inheritData.inflationRate > 0 ? Math.round(72 / inheritData.inflationRate) : 0;
  
  const simTimeline: { age: number; assets: number; tax: number }[] = [];
  if (doublingYears > 0 && netAssets > 0) {
    let currentAssets = netAssets;
    let currentAge = inheritData.currentAge;
    simTimeline.push({ age: currentAge, assets: currentAssets, tax: calcInheritanceTax(Math.max(0, currentAssets - spouseDeduction - lumpSumDeduction)) });
    while (currentAge + doublingYears <= inheritData.expectedLifespan + 5) {
      currentAge += doublingYears;
      currentAssets *= 2;
      if (currentAge > inheritData.expectedLifespan + 10) break;
      simTimeline.push({ age: currentAge, assets: currentAssets, tax: calcInheritanceTax(Math.max(0, currentAssets - spouseDeduction - lumpSumDeduction)) });
    }
  }

  const fmt = (v: number) => v.toLocaleString();

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
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">️</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>다섯 번째는 <span className="text-teal-600 font-bold">세금설계</span>입니다. 종합소득세 절세와 예상상속세를 시뮬레이션해 보세요! </p>
        </div>
      </div>

      <div onClick={handleTaxUpload} className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 p-4 text-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-all">
        <div className="text-2xl mb-1">📄</div>
        <div className="text-sm font-semibold text-gray-700">원천징수영수증 업로드 (OCR 분석)</div>
        <div className="text-[11px] text-gray-400 mt-1">PDF, 이미지 파일 지원 · AI 자동 인식</div>
        {taxFileUploaded && <div className="text-xs text-teal-600 mt-2 font-semibold">✓ 파일이 업로드되었습니다</div>}
      </div>

      <div className="bg-white rounded-xl p-1.5 shadow-sm flex gap-1">
        <button onClick={() => setActiveTab('income')} className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'income' ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>💰 종합소득세 절세</button>
        <button onClick={() => setActiveTab('inheritance')} className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'inheritance' ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>🏠 예상상속세</button>
      </div>

      {activeTab === 'income' && (
        <div className="space-y-3">
          <div className="bg-white rounded-xl p-4 space-y-2 shadow-sm">
            <h4 className="text-sm font-bold text-gray-800 mb-2">📋 기본 정보</h4>
            <TaxInputRow label="총급여 (연봉)" value={incomeData.annualSalary} onChange={v => setIncomeData(p => ({...p, annualSalary: v}))} />
            <TaxInputRow label="결정세액" value={incomeData.determinedTax} onChange={v => setIncomeData(p => ({...p, determinedTax: v}))} />
            <TaxInputRow label="기납부세액 (원천징수)" value={incomeData.prepaidTax} onChange={v => setIncomeData(p => ({...p, prepaidTax: v}))} />
            <div className={`mt-2 p-3 rounded-lg ${incomeData.prepaidTax - incomeData.determinedTax >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-700">현재 환급(+)/납부(-)</span>
                <span className={`text-base font-black ${incomeData.prepaidTax - incomeData.determinedTax >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {incomeData.prepaidTax - incomeData.determinedTax >= 0 ? '+' : ''}{fmt(incomeData.prepaidTax - incomeData.determinedTax)}만원
                </span>
              </div>
            </div>
          </div>

          <button onClick={() => setShowSimulation(!showSimulation)} className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-bold text-xs shadow-sm hover:shadow-md transition-all">
            {showSimulation ? '▲ 절세 시뮬레이션 접기' : '▼ 절세 시뮬레이션 펼치기'}
          </button>

          {showSimulation && (
            <div className="space-y-3">
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
                <div className="flex justify-between pt-2 border-t border-blue-200"><span className="text-xs font-bold text-blue-700">소득공제 합계</span><span className="text-sm font-black text-blue-600">{fmt(totalIncomeDeduction)}만원</span></div>
              </div>

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
                <div className="flex justify-between pt-2 border-t border-green-200"><span className="text-xs font-bold text-green-700">세액공제 합계</span><span className="text-sm font-black text-green-600">{fmt(totalTaxCredit)}만원</span></div>
              </div>

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

              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h4 className="text-sm font-bold text-gray-800 mb-3">🔄 Before → After</h4>
                <div className="flex items-center justify-center gap-3">
                  <div className="text-center"><div className="text-[10px] text-gray-400">현재 결정세액</div><div className="text-lg font-black text-red-500">{fmt(incomeData.determinedTax)}만원</div></div>
                  <div className="text-xl text-gray-400">→</div>
                  <div className="text-center"><div className="text-[10px] text-gray-400">시뮬 결정세액</div><div className="text-lg font-black text-green-500">{fmt(simDeterminedTax)}만원</div></div>
                </div>
                <div className={`mt-3 p-3 rounded-lg text-center ${simRefund >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <span className="text-xs text-gray-600">시뮬레이션 환급금: </span>
                  <span className={`text-base font-black ${simRefund >= 0 ? 'text-green-600' : 'text-red-600'}`}>{simRefund >= 0 ? '+' : ''}{fmt(simRefund)}만원</span>
                </div>
              </div>

              {simDeterminedTax > 0 && (
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                  <div className="flex gap-2"><span className="text-base">💡</span>
                    <div className="text-xs text-blue-700 leading-relaxed">
                      <strong>결정세액 0원 TIP:</strong> 남은 세액 {fmt(remainingTax)}만원 ÷ {(pensionRate*100).toFixed(1)}% = <strong>IRP {fmt(neededIRP)}만원</strong> 추가 납입 시 결정세액 0원!
                      {neededIRP > irpRoom && <span className="block mt-1 text-orange-600">⚠️ 연금계좌 한도 초과! 주택청약·기부금·월세 공제도 검토하세요.</span>}
                    </div>
                  </div>
                </div>
              )}
              {simDeterminedTax === 0 && showSimulation && (
                <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                  <div className="flex gap-2 items-center"><span className="text-base">🎉</span><span className="text-xs font-bold text-green-700">축하합니다! 결정세액이 0원입니다!</span></div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'inheritance' && (
        <div className="space-y-3">
          <div className="bg-white rounded-xl p-4 space-y-2 shadow-sm">
            <h4 className="text-sm font-bold text-gray-800 mb-2">🏦 자산·부채 현황 <span className="text-[10px] text-gray-400">(1단계 재무정보 연동)</span></h4>
            <TaxInputRow label="총자산" value={inheritData.totalAssets} onChange={v => setInheritData(p => ({...p, totalAssets: v}))} />
            <TaxInputRow label="총부채" value={inheritData.totalDebts} onChange={v => setInheritData(p => ({...p, totalDebts: v}))} />
            <div className="flex justify-between pt-2 border-t border-gray-200"><span className="text-xs font-bold text-gray-700">순자산</span><span className={`text-sm font-black ${netAssets >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{fmt(netAssets)}만원</span></div>
          </div>

          <div className="bg-white rounded-xl p-4 space-y-2 shadow-sm">
            <h4 className="text-sm font-bold text-gray-800 mb-2">👨‍👩‍👧‍👦 가족 정보</h4>
            <div className="flex items-center gap-2 py-1.5">
              <span className="text-xs text-gray-600 flex-1">배우자</span>
              <div className="flex gap-1">
                <button onClick={() => setInheritData(p => ({...p, hasSpouse: true}))} className={`px-3 py-1 rounded-lg text-xs font-bold ${inheritData.hasSpouse ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-500'}`}>있음</button>
                <button onClick={() => setInheritData(p => ({...p, hasSpouse: false}))} className={`px-3 py-1 rounded-lg text-xs font-bold ${!inheritData.hasSpouse ? 'bg-red-400 text-white' : 'bg-gray-100 text-gray-500'}`}>없음</button>
              </div>
            </div>
            <TaxInputRow label="자녀 수" value={inheritData.childrenCount} onChange={v => setInheritData(p => ({...p, childrenCount: v}))} unit="명" />
            <TaxInputRow label="현재 나이" value={inheritData.currentAge} onChange={v => setInheritData(p => ({...p, currentAge: v}))} unit="세" />
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 space-y-1.5 border border-purple-200">
            <h4 className="text-sm font-bold text-purple-800 mb-2">📊 상속세 산출</h4>
            <div className="flex justify-between text-xs py-1 border-b border-purple-100"><span className="text-gray-600">순자산</span><span className="font-bold">{fmt(netAssets)}만원</span></div>
            <div className="flex justify-between text-xs py-1 border-b border-purple-100"><span className="text-gray-600">배우자공제</span><span className="font-bold text-blue-600">-{fmt(spouseDeduction)}만원</span></div>
            <div className="flex justify-between text-xs py-1 border-b border-purple-100"><span className="text-gray-600">일괄공제 (max 5억, 기초+인적)</span><span className="font-bold text-blue-600">-{fmt(lumpSumDeduction)}만원</span></div>
            <div className="flex justify-between text-xs py-1 border-b border-purple-100"><span className="text-gray-600">과세표준 <span className="text-[9px] text-purple-500">({getInheritTaxBracket(inheritTaxBase).rate})</span></span><span className="font-bold text-purple-600">{fmt(inheritTaxBase)}만원</span></div>
            <div className="flex justify-between text-xs py-1.5 bg-purple-100 rounded-lg px-2"><span className="font-bold text-purple-800">예상 상속세</span><span className="font-black text-purple-700">{fmt(inheritanceTax)}만원</span></div>
            <div className="text-[10px] text-gray-400 text-right">실효세율: {inheritEffectiveRate}%</div>
          </div>

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
                  <span className="w-20">{row.range}</span><span className="w-10 text-center">{row.rate}</span><span className="w-16 text-right text-gray-500">누진공제 {row.deduction}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 space-y-3 shadow-sm">
            <h4 className="text-sm font-bold text-gray-800 mb-1">⏳ 72법칙 미래 시뮬레이션</h4>
            <div className="text-[10px] text-gray-400">자산이 물가상승률로 매년 증가한다고 가정할 때 미래 상속세 예측</div>
            <div className="flex gap-2">
              <div className="flex-1"><label className="text-[10px] text-gray-500">물가상승률 (%)</label><input type="number" value={inheritData.inflationRate} onChange={(e) => setInheritData(p => ({...p, inflationRate: Number(e.target.value)}))} onFocus={handleFocus} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs text-right focus:border-purple-500 outline-none" /></div>
              <div className="flex-1"><label className="text-[10px] text-gray-500">예상수명 (세)</label><input type="number" value={inheritData.expectedLifespan} onChange={(e) => setInheritData(p => ({...p, expectedLifespan: Number(e.target.value)}))} onFocus={handleFocus} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs text-right focus:border-purple-500 outline-none" /></div>
            </div>
            {doublingYears > 0 && <div className="text-xs text-purple-600 font-semibold text-center">📈 자산 2배 소요: {doublingYears}년 (72÷{inheritData.inflationRate}%)</div>}
            {simTimeline.length > 0 && (
              <div className="space-y-2">
                {simTimeline.map((point, idx) => (
                  <div key={idx} className={`p-2.5 rounded-lg border ${idx === 0 ? 'bg-blue-50 border-blue-200' : point.age >= inheritData.expectedLifespan ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex justify-between text-xs"><span className="font-bold">{point.age}세 {idx === 0 ? '(현재)' : point.age >= inheritData.expectedLifespan ? '(예상수명)' : ''}</span><span className="font-bold">{fmt(point.assets)}만원</span></div>
                    <div className="flex justify-between text-[10px] text-gray-500 mt-0.5"><span>예상 상속세</span><span className={`font-bold ${point.tax > 0 ? 'text-red-500' : 'text-green-500'}`}>{fmt(point.tax)}만원</span></div>
                  </div>
                ))}
              </div>
            )}
            {simTimeline.length > 1 && simTimeline[simTimeline.length - 1].tax > inheritanceTax * 2 && (
              <div className="bg-red-50 rounded-lg p-2.5 border border-red-200"><div className="flex gap-1.5"><span className="text-sm">⚠️</span><span className="text-[11px] text-red-700">미래 상속세가 크게 증가합니다. 사전 증여, 가족법인 설립 등 절세 전략을 검토하세요.</span></div></div>
            )}
          </div>
        </div>
      )}

      <div className="mt-3 p-2 bg-amber-50 rounded-lg border border-amber-200"><p className="text-[10px] text-amber-700 text-center">⚠️ 본 설계는 이해를 돕기 위한 일반적인 예시이므로 참고만 하시기 바랍니다. 구체적인 사항은 반드시 해당 전문가와 상담하시기 바랍니다.</p></div>
      <div className="flex gap-2 pt-2">
        <button onClick={onPrev} className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm">← 이전</button>
        <button onClick={onNext} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold text-sm">다음 →</button>
      </div>
    </div>
  );
}
