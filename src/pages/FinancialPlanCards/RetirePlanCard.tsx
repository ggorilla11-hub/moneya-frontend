// src/pages/FinancialPlanCards/RetirePlanCard.tsx
// 은퇴설계 카드 - FinancialPlanCards.tsx v4.4에서 분리
// 기능 변경 없음 (1:1 동일)

import { useState, useEffect } from 'react';
import { saveDesignData, loadDesignData } from '../FinancialHouseDesign';
import { CardProps, DisclaimerBox } from './shared';

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
        <div className="space-y-1"><label className="text-sm font-semibold text-gray-700">은퇴 예정 나이</label><div className="flex items-center gap-2"><input type="number" value={formData.retireAge} onChange={(e) =
