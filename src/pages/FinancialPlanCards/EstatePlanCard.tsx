// src/pages/FinancialPlanCards/EstatePlanCard.tsx
// 부동산설계 카드 (v2.0) - FinancialPlanCards.tsx v4.4에서 분리
// 탭1: 세금 시뮬레이션 / 탭2: 대출한도 분석 / 탭3: 매매vs전세vs월세 / 탭4: ROI
// 기능 변경 없음 (1:1 동일)

import { useState, useEffect } from 'react';
import { saveDesignData, loadDesignData } from '../FinancialHouseDesign';
import type { CardProps } from './shared';
import { EstateInputRow } from './shared';

export function EstatePlanCard({ onNext, onPrev }: CardProps) {
  const [formData, setFormData] = useState({ 
    hasHouse: true, residentialProperty: 40000, investmentProperty: 10000, currentAge: 37
  });
  const [estateTab, setEstateTab] = useState<'tax' | 'loan' | 'compare' | 'roi'>('tax');

  const [taxSim, setTaxSim] = useState({
    acquisitionPrice: 40000, isFirstHome: true, houseCount: 1, officialPrice: 35000,
    sellingPrice: 50000, holdingYears: 5, livingYears: 5,
  });
  const [loanSim, setLoanSim] = useState({
    annualIncome: 6000, propertyValue: 40000, existingLoanPayment: 0,
    loanRate: 4.0, loanYears: 30, isRegulated: false,
  });
  const [compareSim, setCompareSim] = useState({
    buyPrice: 40000, jeonsePrice: 28000, monthlyRent: 80, monthlyDeposit: 5000,
    expectedAppreciation: 3, investReturn: 5, analysisPeriod: 5,
  });
  const [roiSim, setRoiSim] = useState({
    purchasePrice: 30000, acquisitionCost: 1500, monthlyRentalIncome: 100, monthlyExpense: 10,
    loanAmount: 15000, loanInterestRate: 4.5, expectedSellPrice: 35000, holdYears: 5,
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

  // ═══ 세금 시뮬레이션 계산 ═══
  const calcAcquisitionTax = () => {
    const price = taxSim.acquisitionPrice;
    let rate = 0;
    if (taxSim.houseCount >= 3) { rate = 12; } else if (taxSim.houseCount === 2) { rate = 8; }
    else { if (price <= 60000) rate = 1; else if (price <= 90000) rate = 2; else rate = 3; }
    const tax = Math.round(price * rate / 100);
    const localEdu = Math.round(tax * 0.1);
    return { rate, tax, localEdu, total: tax + localEdu };
  };
  const acqTax = calcAcquisitionTax();

  const calcHoldingTax = () => {
    const official = taxSim.officialPrice;
    let propertyTax = 0;
    if (official <= 6000) propertyTax = Math.round(official * 0.001);
    else if (official <= 15000) propertyTax = Math.round(6 + (official - 6000) * 0.0015);
    else if (official <= 30000) propertyTax = Math.round(19.5 + (official - 15000) * 0.0025);
    else propertyTax = Math.round(57 + (official - 30000) * 0.004);
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

  const calcTransferTax = () => {
    const gain = taxSim.sellingPrice - taxSim.acquisitionPrice;
    if (gain <= 0) return { gain: 0, rate: '0%', tax: 0, exemption: '', isExempt: true };
    if (taxSim.houseCount <= 1 && taxSim.holdingYears >= 2 && taxSim.livingYears >= 2 && gain <= 120000) {
      return { gain, rate: '비과세', tax: 0, exemption: '1세대1주택 비과세 (12억 이하)', isExempt: true };
    }
    let taxableGain = gain;
    if (taxSim.houseCount <= 1 && taxSim.holdingYears >= 2 && taxSim.livingYears >= 2 && gain > 120000) { taxableGain = gain - 120000; }
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

  // ═══ 대출한도 분석 계산 ═══
  const calcLoanLimits = () => {
    const val = loanSim.propertyValue;
    const ltvRate = loanSim.isRegulated ? 0.50 : 0.70;
    const dtiRate = loanSim.isRegulated ? 0.40 : 0.50;
    const dsrRate = 0.40;
    const ltvLimit = Math.round(val * ltvRate);
    const monthlyRate = loanSim.loanRate / 100 / 12;
    const totalMonths = loanSim.loanYears * 12;
    const annuityFactor = monthlyRate > 0 ? (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1) : (1 / totalMonths);
    const maxAnnualPayment = loanSim.annualIncome * dtiRate - loanSim.existingLoanPayment;
    const dtiLimit = maxAnnualPayment > 0 ? Math.round(maxAnnualPayment / (annuityFactor * 12)) : 0;
    const maxDsrPayment = loanSim.annualIncome * dsrRate - loanSim.existingLoanPayment;
    const dsrLimit = maxDsrPayment > 0 ? Math.round(maxDsrPayment / (annuityFactor * 12)) : 0;
    const finalLimit = Math.min(ltvLimit, dtiLimit, dsrLimit);
    const monthlyPayment = finalLimit > 0 ? Math.round(finalLimit * annuityFactor) : 0;
    return { ltvRate: ltvRate * 100, dtiRate: dtiRate * 100, dsrRate: dsrRate * 100, ltvLimit, dtiLimit, dsrLimit, finalLimit, monthlyPayment, binding: finalLimit === ltvLimit ? 'LTV' : finalLimit === dtiLimit ? 'DTI' : 'DSR' };
  };
  const loanResult = calcLoanLimits();

  // ═══ 매매 vs 전세 vs 월세 비교 ═══
  const calcCompare = () => {
    const years = compareSim.analysisPeriod;
    const buyAcqTax = Math.round(compareSim.buyPrice * 0.01);
    const buyAppreciation = Math.round(compareSim.buyPrice * (Math.pow(1 + compareSim.expectedAppreciation / 100, years) - 1));
    const buyTotalCost = buyAcqTax;
    const buyNetGain = buyAppreciation - buyTotalCost;
    const jeonseOpportunityCost = Math.round(compareSim.jeonsePrice * (Math.pow(1 + compareSim.investReturn / 100, years) - 1));
    const jeonseTotalCost = jeonseOpportunityCost;
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

  // ═══ ROI 계산기 ═══
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
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">🏠</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>여섯 번째는 <span className="text-teal-600 font-bold">부동산설계</span>입니다. 세금·대출·비교분석·수익률까지 종합 분석해 드릴게요! 🏗️</p>
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

      <div className="bg-white rounded-xl p-1.5 shadow-sm grid grid-cols-4 gap-1">
        <button onClick={() => setEstateTab('tax')} className={`py-2 rounded-lg text-[10px] font-bold transition-all ${estateTab === 'tax' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>💰 세금</button>
        <button onClick={() => setEstateTab('loan')} className={`py-2 rounded-lg text-[10px] font-bold transition-all ${estateTab === 'loan' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>🏦 대출한도</button>
        <button onClick={() => setEstateTab('compare')} className={`py-2 rounded-lg text-[10px] font-bold transition-all ${estateTab === 'compare' ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>⚖️ 비교분석</button>
        <button onClick={() => setEstateTab('roi')} className={`py-2 rounded-lg text-[10px] font-bold transition-all ${estateTab === 'roi' ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>📈 수익률</button>
      </div>

      {estateTab === 'tax' && (<div className="space-y-3"><div className="bg-white rounded-xl p-4 space-y-1 shadow-sm"><h4 className="text-sm font-bold text-red-700 mb-2">💰 부동산 세금 시뮬레이션</h4><EstateInputRow label="취득가액 (매매가)" value={taxSim.acquisitionPrice} onChange={v => setTaxSim(p => ({...p, acquisitionPrice: v}))} /><div className="flex items-center gap-2 py-1.5"><span className="text-xs text-gray-600 flex-1">보유 주택 수</span><div className="flex gap-1">{[1, 2, 3].map(n => (<button key={n} onClick={() => setTaxSim(p => ({...p, houseCount: n, isFirstHome: n === 1}))} className={`px-3 py-1 rounded-lg text-xs font-bold ${taxSim.houseCount === n ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'}`}>{n === 3 ? '3+' : n}주택</button>))}</div></div><EstateInputRow label="공시가격" value={taxSim.officialPrice} onChange={v => setTaxSim(p => ({...p, officialPrice: v}))} badge="보유세기준" badgeColor="bg-orange-100 text-orange-600" /><EstateInputRow label="예상 양도가액" value={taxSim.sellingPrice} onChange={v => setTaxSim(p => ({...p, sellingPrice: v}))} /><EstateInputRow label="보유기간" value={taxSim.holdingYears} onChange={v => setTaxSim(p => ({...p, holdingYears: v}))} unit="년" /><EstateInputRow label="실거주기간" value={taxSim.livingYears} onChange={v => setTaxSim(p => ({...p, livingYears: v}))} unit="년" /></div>
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4 space-y-1.5 border border-red-200"><h4 className="text-xs font-bold text-red-800 mb-2">🏷️ 취득세</h4><div className="flex justify-between text-xs py-1"><span className="text-gray-600">취득세율</span><span className="font-bold text-red-600">{acqTax.rate}%{taxSim.houseCount >= 2 ? ' (중과)' : ''}</span></div><div className="flex justify-between text-xs py-1"><span className="text-gray-600">취득세</span><span className="font-bold">{fmt(acqTax.tax)}만원</span></div><div className="flex justify-between text-xs py-1"><span className="text-gray-600">지방교육세 (10%)</span><span className="font-bold">{fmt(acqTax.localEdu)}만원</span></div><div className="flex justify-between text-xs py-1.5 bg-red-100 rounded-lg px-2"><span className="font-bold text-red-800">취득세 합계</span><span className="font-black text-red-700">{fmt(acqTax.total)}만원</span></div></div>
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-4 space-y-1.5 border border-orange-200"><h4 className="text-xs font-bold text-orange-800 mb-2">📅 보유세 (연간)</h4><div className="flex justify-between text-xs py-1"><span className="text-gray-600">재산세</span><span className="font-bold">{fmt(holdTax.propertyTax)}만원</span></div><div className="flex justify-between text-xs py-1"><span className="text-gray-600">종합부동산세</span><span className={`font-bold ${holdTax.jongbuTax > 0 ? 'text-red-600' : 'text-green-600'}`}>{holdTax.jongbuTax > 0 ? `${fmt(holdTax.jongbuTax)}만원` : '비해당'}</span></div><div className="flex justify-between text-xs py-1.5 bg-orange-100 rounded-lg px-2"><span className="font-bold text-orange-800">보유세 합계</span><span className="font-black text-orange-700">{fmt(holdTax.total)}만원/년</span></div></div>
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 space-y-1.5 border border-purple-200"><h4 className="text-xs font-bold text-purple-800 mb-2">💸 양도소득세</h4><div className="flex justify-between text-xs py-1"><span className="text-gray-600">양도차익</span><span className="font-bold">{fmt(transTax.gain)}만원</span></div><div className="flex justify-between text-xs py-1"><span className="text-gray-600">적용세율</span><span className="font-bold text-purple-600">{transTax.rate}</span></div>{transTax.isExempt && transTax.exemption && (<div className="text-[10px] text-green-600 font-bold bg-green-50 rounded px-2 py-1">✅ {transTax.exemption}</div>)}<div className="flex justify-between text-xs py-1.5 bg-purple-100 rounded-lg px-2"><span className="font-bold text-purple-800">예상 양도세</span><span className="font-black text-purple-700">{fmt(transTax.tax)}만원</span></div></div>
        <div className="bg-gray-800 rounded-xl p-3 text-center"><span className="text-[10px] text-gray-400">취득~보유~양도 세금 총 예상</span><div className="text-lg font-black text-white mt-1">{fmtOk(acqTax.total + holdTax.total * taxSim.holdingYears + transTax.tax)}원</div><span className="text-[9px] text-gray-500">취득세 {fmt(acqTax.total)} + 보유세 {fmt(holdTax.total)}×{taxSim.holdingYears}년 + 양도세 {fmt(transTax.tax)}</span></div></div>)}

      {estateTab === 'loan' && (<div className="space-y-3"><div className="bg-white rounded-xl p-4 space-y-1 shadow-sm"><h4 className="text-sm font-bold text-blue-700 mb-2">🏦 대출한도 분석</h4><EstateInputRow label="연소득" value={loanSim.annualIncome} onChange={v => setLoanSim(p => ({...p, annualIncome: v}))} /><EstateInputRow label="매매가" value={loanSim.propertyValue} onChange={v => setLoanSim(p => ({...p, propertyValue: v}))} /><EstateInputRow label="기존 대출 연상환액" value={loanSim.existingLoanPayment} onChange={v => setLoanSim(p => ({...p, existingLoanPayment: v}))} /><EstateInputRow label="대출금리" value={loanSim.loanRate} onChange={v => setLoanSim(p => ({...p, loanRate: v}))} unit="%" /><EstateInputRow label="대출기간" value={loanSim.loanYears} onChange={v => setLoanSim(p => ({...p, loanYears: v}))} unit="년" /><div className="flex items-center gap-2 py-1.5"><span className="text-xs text-gray-600 flex-1">규제지역 여부</span><div className="flex gap-1"><button onClick={() => setLoanSim(p => ({...p, isRegulated: false}))} className={`px-3 py-1 rounded-lg text-xs font-bold ${!loanSim.isRegulated ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>비규제</button><button onClick={() => setLoanSim(p => ({...p, isRegulated: true}))} className={`px-3 py-1 rounded-lg text-xs font-bold ${loanSim.isRegulated ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'}`}>규제지역</button></div></div></div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 space-y-3 border border-blue-200"><h4 className="text-xs font-bold text-blue-800 mb-2">📊 한도 비교</h4>{[{ label: 'LTV', rate: loanResult.ltvRate, limit: loanResult.ltvLimit, color: 'bg-blue-500' },{ label: 'DTI', rate: loanResult.dtiRate, limit: loanResult.dtiLimit, color: 'bg-green-500' },{ label: 'DSR', rate: loanResult.dsrRate, limit: loanResult.dsrLimit, color: 'bg-purple-500' }].map(item => { const maxLimit = Math.max(loanResult.ltvLimit, loanResult.dtiLimit, loanResult.dsrLimit, 1); const barWidth = Math.max(5, (item.limit / maxLimit) * 100); return (<div key={item.label} className="space-y-1"><div className="flex justify-between text-xs"><span className="font-semibold text-gray-700">{item.label} ({item.rate}%)</span><span className={`font-bold ${item.limit === loanResult.finalLimit ? 'text-red-600' : 'text-gray-700'}`}>{fmtOk(item.limit)}원 {item.limit === loanResult.finalLimit ? '◀ 제한' : ''}</span></div><div className="w-full bg-gray-200 rounded-full h-3"><div className={`h-3 rounded-full ${item.color} ${item.limit === loanResult.finalLimit ? 'opacity-100' : 'opacity-60'}`} style={{ width: `${barWidth}%` }} /></div></div>); })}</div>
        <div className="bg-blue-800 rounded-xl p-4 text-center space-y-2"><div className="text-[10px] text-blue-300">최대 대출 가능액 ({loanResult.binding} 제한)</div><div className="text-2xl font-black text-white">{fmtOk(loanResult.finalLimit)}원</div><div className="text-[10px] text-blue-300">필요 자기자본: {fmtOk(Math.max(0, loanSim.propertyValue - loanResult.finalLimit))}원</div><div className="text-xs text-blue-200 mt-1">예상 월상환액: <span className="font-bold text-white">{fmt(loanResult.monthlyPayment)}만원</span></div></div></div>)}

      {estateTab === 'compare' && (<div className="space-y-3"><div className="bg-white rounded-xl p-4 space-y-1 shadow-sm"><h4 className="text-sm font-bold text-green-700 mb-2">⚖️ 매매 vs 전세 vs 월세</h4><EstateInputRow label="매매가" value={compareSim.buyPrice} onChange={v => setCompareSim(p => ({...p, buyPrice: v}))} /><EstateInputRow label="전세가" value={compareSim.jeonsePrice} onChange={v => setCompareSim(p => ({...p, jeonsePrice: v}))} /><EstateInputRow label="월세 보증금" value={compareSim.monthlyDeposit} onChange={v => setCompareSim(p => ({...p, monthlyDeposit: v}))} /><EstateInputRow label="월세" value={compareSim.monthlyRent} onChange={v => setCompareSim(p => ({...p, monthlyRent: v}))} /><EstateInputRow label="연 시세상승률" value={compareSim.expectedAppreciation} onChange={v => setCompareSim(p => ({...p, expectedAppreciation: v}))} unit="%" /><EstateInputRow label="투자수익률 (기회비용)" value={compareSim.investReturn} onChange={v => setCompareSim(p => ({...p, investReturn: v}))} unit="%" /><EstateInputRow label="분석 기간" value={compareSim.analysisPeriod} onChange={v => setCompareSim(p => ({...p, analysisPeriod: v}))} unit="년" /></div>
        <div className="space-y-2">{[compareResult.buy, compareResult.jeonse, compareResult.wolse].map((opt, i) => { const isBest = opt.label === bestOption.label; const colors = [{ bg: 'from-red-50 to-red-100', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-500' },{ bg: 'from-blue-50 to-blue-100', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-500' },{ bg: 'from-green-50 to-green-100', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-500' }][i]; return (<div key={opt.label} className={`bg-gradient-to-br ${colors.bg} rounded-xl p-3 border ${colors.border} ${isBest ? 'ring-2 ring-yellow-400' : ''}`}><div className="flex justify-between items-center mb-1"><div className="flex items-center gap-2">{isBest && <span className="text-[9px] bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded-full font-bold">👑 최적</span>}<span className={`text-sm font-bold ${colors.text}`}>{opt.label}</span></div><span className={`text-base font-black ${opt.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>{opt.net >= 0 ? '+' : ''}{fmtOk(opt.net)}원</span></div><div className="text-[10px] text-gray-500">{opt.desc}</div></div>); })}</div>
        <div className="bg-blue-50 rounded-xl p-3 flex gap-2 border border-blue-200"><span className="text-base">🤖</span><p className="text-xs text-blue-700 leading-relaxed"><strong>AI머니야 분석:</strong> {compareSim.analysisPeriod}년 기준, 시세상승률 {compareSim.expectedAppreciation}% 가정 시 <strong>{bestOption.label}</strong>이 가장 유리합니다. {bestOption.label === '매매' && ` 시세차익 ${fmtOk(compareResult.buy.gain)}원이 기대됩니다.`}{bestOption.label === '전세' && ` 전세금 운용수익이 매매 시세차익보다 큽니다.`}{bestOption.label === '월세' && ` 자금 유연성과 투자수익이 높습니다.`}</p></div></div>)}

      {estateTab === 'roi' && (<div className="space-y-3"><div className="bg-white rounded-xl p-4 space-y-1 shadow-sm"><h4 className="text-sm font-bold text-purple-700 mb-2">📈 투자수익률(ROI) 계산기</h4><EstateInputRow label="매입가" value={roiSim.purchasePrice} onChange={v => setRoiSim(p => ({...p, purchasePrice: v}))} /><EstateInputRow label="취득부대비용" value={roiSim.acquisitionCost} onChange={v => setRoiSim(p => ({...p, acquisitionCost: v}))} badge="세금+복비" badgeColor="bg-orange-100 text-orange-600" /><EstateInputRow label="대출금" value={roiSim.loanAmount} onChange={v => setRoiSim(p => ({...p, loanAmount: v}))} /><EstateInputRow label="대출금리" value={roiSim.loanInterestRate} onChange={v => setRoiSim(p => ({...p, loanInterestRate: v}))} unit="%" /><EstateInputRow label="월 임대수입" value={roiSim.monthlyRentalIncome} onChange={v => setRoiSim(p => ({...p, monthlyRentalIncome: v}))} /><EstateInputRow label="월 관리비용" value={roiSim.monthlyExpense} onChange={v => setRoiSim(p => ({...p, monthlyExpense: v}))} /><EstateInputRow label="예상 매도가" value={roiSim.expectedSellPrice} onChange={v => setRoiSim(p => ({...p, expectedSellPrice: v}))} /><EstateInputRow label="보유기간" value={roiSim.holdYears} onChange={v => setRoiSim(p => ({...p, holdYears: v}))} unit="년" /></div>
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 space-y-1.5 border border-purple-200"><h4 className="text-xs font-bold text-purple-800 mb-2">💰 수익 분석</h4><div className="flex justify-between text-xs py-1 border-b border-purple-100"><span className="text-gray-600">총 투자금액</span><span className="font-bold">{fmt(roiResult.totalInvest)}만원</span></div><div className="flex justify-between text-xs py-1 border-b border-purple-100"><span className="text-gray-600">자기자본</span><span className="font-bold text-blue-600">{fmt(roiResult.selfCapital)}만원</span></div><div className="flex justify-between text-xs py-1 border-b border-purple-100"><span className="text-gray-600">연간 임대수익 (순)</span><span className="font-bold">{fmt(roiResult.annualRental)}만원</span></div><div className="flex justify-between text-xs py-1 border-b border-purple-100"><span className="text-gray-600">연간 대출이자</span><span className="font-bold text-red-500">-{fmt(roiResult.annualInterest)}만원</span></div><div className="flex justify-between text-xs py-1 border-b border-purple-100"><span className="text-gray-600">연간 순수익</span><span className={`font-bold ${roiResult.annualNetIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fmt(roiResult.annualNetIncome)}만원</span></div><div className="flex justify-between text-xs py-1 border-b border-purple-100"><span className="text-gray-600">매매차익 (시세차익)</span><span className={`font-bold ${roiResult.capitalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fmt(roiResult.capitalGain)}만원</span></div><div className="flex justify-between text-xs py-1.5 bg-purple-100 rounded-lg px-2"><span className="font-bold text-purple-800">총 수익</span><span className="font-black text-purple-700">{fmt(roiResult.totalProfit)}만원</span></div></div>
        <div className="grid grid-cols-2 gap-2"><div className="bg-white rounded-xl p-3 text-center border border-gray-200"><div className="text-[10px] text-gray-500">Cap Rate (임대수익률)</div><div className={`text-xl font-black ${roiResult.capRate >= 5 ? 'text-green-600' : roiResult.capRate >= 3 ? 'text-blue-600' : 'text-red-600'}`}>{roiResult.capRate.toFixed(1)}%</div></div><div className="bg-white rounded-xl p-3 text-center border border-gray-200"><div className="text-[10px] text-gray-500">연평균 수익률</div><div className={`text-xl font-black ${roiResult.annualROI >= 10 ? 'text-green-600' : roiResult.annualROI >= 5 ? 'text-blue-600' : 'text-red-600'}`}>{roiResult.annualROI.toFixed(1)}%</div></div><div className="bg-white rounded-xl p-3 text-center border border-gray-200"><div className="text-[10px] text-gray-500">총 ROI (투자대비)</div><div className={`text-xl font-black ${roiResult.grossROI >= 20 ? 'text-green-600' : roiResult.grossROI >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{roiResult.grossROI.toFixed(1)}%</div></div><div className="bg-white rounded-xl p-3 text-center border border-gray-200"><div className="text-[10px] text-gray-500">레버리지 ROI</div><div className={`text-xl font-black ${roiResult.leverageROI >= 30 ? 'text-green-600' : roiResult.leverageROI >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{roiResult.leverageROI.toFixed(1)}%</div><div className="text-[9px] text-gray-400">(자기자본 대비)</div></div></div>
        <div className="bg-blue-50 rounded-xl p-3 flex gap-2 border border-blue-200"><span className="text-base">🤖</span><p className="text-xs text-blue-700 leading-relaxed"><strong>AI머니야 분석:</strong> {roiSim.holdYears}년 보유 시 자기자본 {fmtOk(roiResult.selfCapital)}원 투자로 총 {fmtOk(roiResult.totalProfit)}원 수익 예상. {roiResult.capRate >= 5 ? ' 임대수익률이 양호합니다.' : roiResult.capRate >= 3 ? ' 임대수익률은 보통 수준입니다.' : ' 임대수익률이 낮아 시세차익에 의존합니다.'}{roiResult.leverageROI > roiResult.grossROI * 1.5 && ' 레버리지 효과가 크므로 금리 변동 리스크에 주의하세요.'}</p></div></div>)}

      <div className="mt-3 p-2 bg-amber-50 rounded-lg border border-amber-200"><p className="text-[10px] text-amber-700 text-center">⚠️ 본 설계는 이해를 돕기 위한 일반적인 예시이므로 참고만 하시기 바랍니다. 구체적인 사항은 반드시 해당 전문가와 상담하시기 바랍니다.</p></div>
      <div className="flex gap-2 pt-2">
        <button onClick={onPrev} className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm">← 이전</button>
        <button onClick={onNext} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold text-sm">다음 →</button>
      </div>
    </div>
  );
}
