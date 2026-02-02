// src/pages/FinancialPlanCards/InvestPlanCard.tsx
// 투자설계 카드 (v3.0 - 부동산 포트폴리오 추가, 비상예비자금 유동성 포함)
// FinancialPlanCards.tsx v4.4에서 분리 - 기능 변경 없음 (1:1 동일)

import { useState, useEffect } from 'react';
import { saveDesignData, loadDesignData } from '../FinancialHouseDesign';
import { CardProps, DisclaimerBox } from './shared';

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
