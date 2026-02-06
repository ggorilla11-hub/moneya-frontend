// src/pages/FinancialPlanCards/RetirePlanCard.tsx
// 은퇴설계 카드 - FinancialPlanCards.tsx v4.4에서 분리
// v4.5: 1단계 인적사항 나이/은퇴예정나이 자동 연동

import { useState, useEffect } from 'react';
import { saveDesignData, loadDesignData } from '../FinancialHouseDesign';
import type { CardProps } from './shared';
import { DisclaimerBox } from './shared';

export function RetirePlanCard({ onNext, onPrev }: CardProps) {
  const [formData, setFormData] = useState({
    currentAge: 37, retireAge: 65, monthlyLivingExpense: 300,
    expectedNationalPension: 80, currentPersonalPension: 50, expectedRetirementLumpSum: 10000,
  });
  const [showFormula, setShowFormula] = useState(false);

  useEffect(() => { 
    // ★ 1단계 인적사항에서 나이, 은퇴예정나이 연동
    let basicAge = 37;
    let basicRetireAge = 65;
    try {
      const savedHouseData = localStorage.getItem('financialHouseData');
      if (savedHouseData) {
        const parsed = JSON.parse(savedHouseData);
        if (parsed?.personalInfo?.age) basicAge = Number(parsed.personalInfo.age);
        if (parsed?.personalInfo?.retireAge) basicRetireAge = Number(parsed.personalInfo.retireAge);
      }
    } catch (e) {
      console.error('financialHouseData parse error:', e);
    }

    // 2단계 설계 데이터 로드 (나이는 1단계 값 우선 적용)
    const saved = loadDesignData('retire'); 
    setFormData({
      currentAge: basicAge,
      retireAge: basicRetireAge,
      monthlyLivingExpense: saved?.monthlyLivingExpense ?? saved?.monthlyExpense ?? 300,
      expectedNationalPension: saved?.expectedNationalPension ?? saved?.nationalPension ?? 80,
      currentPersonalPension: saved?.currentPersonalPension ?? saved?.personalPension ?? 50,
      expectedRetirementLumpSum: saved?.expectedRetirementLumpSum ?? 10000,
    });
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
