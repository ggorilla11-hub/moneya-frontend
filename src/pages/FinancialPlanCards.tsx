// src/pages/FinancialPlanCards.tsx
// v2.0: 7개 재무설계 카드 컴포넌트 - 신규버전 UI 적용
// ★★★ 음성/대화 코드는 FinancialHouseDesign.tsx에 있음 - 이 파일은 입력 UI만 ★★★

import { useState, useEffect } from 'react';
import { saveDesignData, loadDesignData } from './FinancialHouseDesign';

// ============================================
// 인터페이스
// ============================================
interface CardProps {
  onNext: () => void;
  onPrev: () => void;
  isLast?: boolean;
}

// ============================================
// 1. 은퇴설계 카드 (v2.0 - 용어 변경 + 공식 접기/펼치기)
// ============================================
export function RetirePlanCard({ onNext, onPrev }: CardProps) {
  const [formData, setFormData] = useState({
    currentAge: 37,
    retireAge: 65,
    monthlyLivingExpense: 300,      // 예상 노후생활비(월)
    expectedNationalPension: 80,    // 예상 국민연금(월)
    currentPersonalPension: 50,     // 납입중인 개인연금(월)
    expectedRetirementLumpSum: 10000, // 예상 퇴직연금 일시금(만원)
  });
  
  const [showFormula, setShowFormula] = useState(false);

  useEffect(() => { 
    const saved = loadDesignData('retire'); 
    if (saved) setFormData(saved); 
  }, []);
  
  useEffect(() => { 
    saveDesignData('retire', formData); 
  }, [formData]);

  // 계산 로직
  const economicYears = formData.retireAge - formData.currentAge; // 경제활동기간
  const monthlyGap = formData.monthlyLivingExpense - formData.expectedNationalPension - formData.currentPersonalPension; // 월 부족액
  const retirementYears = 90 - formData.retireAge; // 은퇴 후 기간 (90세 기준)
  const totalRetirementNeeded = monthlyGap * 12 * retirementYears; // 은퇴일시금 필요액 (만원)
  const netRetirementNeeded = totalRetirementNeeded - formData.expectedRetirementLumpSum; // 순 은퇴일시금
  const monthlyRequiredSaving = netRetirementNeeded > 0 
    ? Math.round(netRetirementNeeded / economicYears / 12) 
    : 0; // 월 저축연금액

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();

  return (
    <div className="space-y-3">
      {/* AI 메시지 */}
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">🏖️</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>첫 번째는 <span className="text-teal-600 font-bold">은퇴설계</span>입니다. 노후 준비 상태를 분석해 드릴게요.</p>
        </div>
      </div>
      
      {/* 입력 폼 */}
      <div className="bg-white rounded-xl p-4 space-y-3 shadow-sm">
        <h3 className="text-base font-bold text-gray-800 mb-3">🏖️ 은퇴설계</h3>
        
        {/* 현재 나이 */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">현재 나이</label>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              value={formData.currentAge} 
              onChange={(e) => setFormData({...formData, currentAge: Number(e.target.value)})} 
              onFocus={handleFocus} 
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" 
            />
            <span className="text-sm text-gray-500 font-medium w-8">세</span>
          </div>
        </div>
        
        {/* 은퇴 예정 나이 */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">은퇴 예정 나이</label>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              value={formData.retireAge} 
              onChange={(e) => setFormData({...formData, retireAge: Number(e.target.value)})} 
              onFocus={handleFocus} 
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" 
            />
            <span className="text-sm text-gray-500 font-medium w-8">세</span>
          </div>
        </div>
        
        {/* 예상 노후생활비(월) */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">예상 노후생활비 (월)</label>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              value={formData.monthlyLivingExpense} 
              onChange={(e) => setFormData({...formData, monthlyLivingExpense: Number(e.target.value)})} 
              onFocus={handleFocus} 
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" 
            />
            <span className="text-sm text-gray-500 font-medium w-10">만원</span>
          </div>
        </div>
        
        {/* 예상 국민연금(월) */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">예상 국민연금 (월)</label>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              value={formData.expectedNationalPension} 
              onChange={(e) => setFormData({...formData, expectedNationalPension: Number(e.target.value)})} 
              onFocus={handleFocus} 
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" 
            />
            <span className="text-sm text-gray-500 font-medium w-10">만원</span>
          </div>
        </div>
        
        {/* 납입중인 개인연금(월) */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">납입중인 개인연금 (월)</label>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              value={formData.currentPersonalPension} 
              onChange={(e) => setFormData({...formData, currentPersonalPension: Number(e.target.value)})} 
              onFocus={handleFocus} 
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" 
            />
            <span className="text-sm text-gray-500 font-medium w-10">만원</span>
          </div>
        </div>
        
        {/* 예상 퇴직연금 일시금 */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">예상 퇴직연금 일시금</label>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              value={formData.expectedRetirementLumpSum} 
              onChange={(e) => setFormData({...formData, expectedRetirementLumpSum: Number(e.target.value)})} 
              onFocus={handleFocus} 
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" 
            />
            <span className="text-sm text-gray-500 font-medium w-10">만원</span>
          </div>
        </div>
      </div>
      
      {/* 분석 결과 */}
      <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-4 space-y-2 border border-teal-200">
        <h3 className="text-sm font-bold text-teal-800 mb-2">📊 은퇴설계 분석 결과</h3>
        
        <div className="flex justify-between text-sm py-1">
          <span className="text-gray-700">경제활동 기간</span>
          <span className="font-bold text-teal-700">{economicYears}년</span>
        </div>
        
        <div className="flex justify-between text-sm py-1">
          <span className="text-gray-700">월 부족액</span>
          <span className={`font-bold ${monthlyGap > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {monthlyGap > 0 ? `${monthlyGap.toLocaleString()}만원` : '충분'}
          </span>
        </div>
        
        <div className="flex justify-between text-sm py-1">
          <span className="text-gray-700">은퇴일시금 필요액</span>
          <span className="font-bold text-teal-700">{(totalRetirementNeeded / 10000).toFixed(1)}억원</span>
        </div>
        
        <div className="flex justify-between text-sm py-1">
          <span className="text-gray-700">예상 퇴직연금</span>
          <span className="font-bold text-teal-700">{(formData.expectedRetirementLumpSum / 10000).toFixed(1)}억원</span>
        </div>
        
        <div className="flex justify-between text-sm py-1 border-t border-teal-200 pt-2">
          <span className="text-gray-700 font-bold">순 은퇴일시금</span>
          <span className={`font-bold ${netRetirementNeeded > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {netRetirementNeeded > 0 ? `${(netRetirementNeeded / 10000).toFixed(1)}억원` : '충분'}
          </span>
        </div>
        
        {/* 핵심 결과 */}
        {monthlyRequiredSaving > 0 && (
          <div className="bg-white rounded-lg p-3 mt-2 border border-teal-300">
            <p className="text-sm text-gray-700">
              💰 매월 <span className="font-bold text-teal-600 text-lg">{monthlyRequiredSaving.toLocaleString()}만원</span> 저축 필요!
            </p>
          </div>
        )}
        
        {/* 공식 보기 (접기/펼치기) */}
        <button 
          onClick={() => setShowFormula(!showFormula)}
          className="w-full text-left text-xs text-teal-600 font-medium mt-2 flex items-center gap-1 hover:text-teal-800 transition-colors"
        >
          <span>📐 계산 방법 보기</span>
          <span className="text-sm">{showFormula ? '▲' : '▼'}</span>
        </button>
        
        {showFormula && (
          <div className="bg-white/70 rounded-lg p-3 mt-1 text-xs text-gray-600 space-y-1 border border-teal-200">
            <p><strong>공식:</strong></p>
            <p>① 월 부족액 = 노후생활비 - 국민연금 - 개인연금</p>
            <p>② 은퇴일시금 = 월 부족액 × 12개월 × 은퇴 후 기간</p>
            <p>③ 순 은퇴일시금 = 은퇴일시금 - 퇴직연금</p>
            <p>④ 월 저축연금액 = 순 은퇴일시금 ÷ 경제활동기간 ÷ 12</p>
            <p className="text-gray-400 mt-2">* 은퇴 후 기간은 90세 기준으로 계산</p>
          </div>
        )}
      </div>
      
      {/* 버튼 */}
      <div className="flex gap-2 pt-2">
        <button onClick={onPrev} className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-300 transition-colors">← 이전</button>
        <button onClick={onNext} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold text-sm hover:from-teal-600 hover:to-teal-700 transition-colors">다음 →</button>
      </div>
    </div>
  );
}

// ============================================
// 2. 부채설계 카드 (기존 유지 - 다음 작업에서 수정)
// ============================================
export function DebtPlanCard({ onNext, onPrev }: CardProps) {
  const [formData, setFormData] = useState({
    monthlyIncome: 500, mortgageBalance: 30000, mortgageRate: 3.5, mortgageMonthly: 150,
    creditBalance: 1000, creditRate: 5.5, creditMonthly: 50,
  });

  useEffect(() => { const saved = loadDesignData('debt'); if (saved) setFormData(saved); }, []);
  useEffect(() => { saveDesignData('debt', formData); }, [formData]);

  const totalMonthlyPayment = formData.mortgageMonthly + formData.creditMonthly;
  const dsr = formData.monthlyIncome > 0 ? (totalMonthlyPayment / formData.monthlyIncome * 100) : 0;
  const totalDebt = formData.mortgageBalance + formData.creditBalance;
  let dsrLevel = '', dsrColor = '', dsrMessage = '';
  if (dsr < 40) { dsrLevel = '안전'; dsrColor = 'text-green-600'; dsrMessage = '부채 관리가 양호합니다!'; }
  else if (dsr < 50) { dsrLevel = '주의'; dsrColor = 'text-yellow-600'; dsrMessage = '부채 비율이 높습니다.'; }
  else { dsrLevel = '위험'; dsrColor = 'text-red-600'; dsrMessage = '상환 계획이 필요합니다!'; }
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();

  return (
    <div className="space-y-3">
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">💳</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>두 번째는 <span className="text-teal-600 font-bold">부채설계</span>입니다.</p>
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 space-y-3 shadow-sm">
        <h3 className="text-base font-bold text-gray-800 mb-3">부채 정보 입력</h3>
        <div className="space-y-2"><label className="text-sm font-semibold text-gray-700">월소득</label><div className="flex items-center gap-2"><input type="number" value={formData.monthlyIncome} onChange={(e) => setFormData({...formData, monthlyIncome: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><span className="text-sm text-gray-500 font-medium w-10">만원</span></div></div>
        <div className="border-t border-gray-200 pt-3 mt-3"><h4 className="text-sm font-bold text-gray-700 mb-2">담보대출</h4>
          <div className="space-y-2"><label className="text-sm font-semibold text-gray-700">잔액</label><div className="flex items-center gap-2"><input type="number" value={formData.mortgageBalance} onChange={(e) => setFormData({...formData, mortgageBalance: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><span className="text-sm text-gray-500 font-medium w-10">만원</span></div></div>
          <div className="space-y-2 mt-2"><label className="text-sm font-semibold text-gray-700">금리</label><div className="flex items-center gap-2"><input type="number" step="0.1" value={formData.mortgageRate} onChange={(e) => setFormData({...formData, mortgageRate: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><span className="text-sm text-gray-500 font-medium w-8">%</span></div></div>
          <div className="space-y-2 mt-2"><label className="text-sm font-semibold text-gray-700">월상환액</label><div className="flex items-center gap-2"><input type="number" value={formData.mortgageMonthly} onChange={(e) => setFormData({...formData, mortgageMonthly: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><span className="text-sm text-gray-500 font-medium w-10">만원</span></div></div>
        </div>
        <div className="border-t border-gray-200 pt-3 mt-3"><h4 className="text-sm font-bold text-gray-700 mb-2">신용대출</h4>
          <div className="space-y-2"><label className="text-sm font-semibold text-gray-700">잔액</label><div className="flex items-center gap-2"><input type="number" value={formData.creditBalance} onChange={(e) => setFormData({...formData, creditBalance: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><span className="text-sm text-gray-500 font-medium w-10">만원</span></div></div>
          <div className="space-y-2 mt-2"><label className="text-sm font-semibold text-gray-700">금리</label><div className="flex items-center gap-2"><input type="number" step="0.1" value={formData.creditRate} onChange={(e) => setFormData({...formData, creditRate: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><span className="text-sm text-gray-500 font-medium w-8">%</span></div></div>
          <div className="space-y-2 mt-2"><label className="text-sm font-semibold text-gray-700">월상환액</label><div className="flex items-center gap-2"><input type="number" value={formData.creditMonthly} onChange={(e) => setFormData({...formData, creditMonthly: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><span className="text-sm text-gray-500 font-medium w-10">만원</span></div></div>
        </div>
      </div>
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 space-y-2">
        <h3 className="text-sm font-bold text-purple-800 mb-2">부채 분석 결과</h3>
        <div className="flex justify-between text-sm"><span className="text-gray-700">총 부채</span><span className="font-bold text-purple-700">{(totalDebt / 10000).toFixed(1)}억원</span></div>
        <div className="flex justify-between text-sm"><span className="text-gray-700">월 상환액</span><span className="font-bold text-purple-700">{totalMonthlyPayment}만원</span></div>
        <div className="flex justify-between text-sm pt-2 border-t border-purple-200"><span className="text-gray-700 font-bold">DSR</span><span className={`font-bold ${dsrColor}`}>{dsr.toFixed(1)}% ({dsrLevel})</span></div>
        <div className="bg-white rounded-lg p-2 mt-2"><p className="text-xs text-gray-600">{dsrMessage}</p></div>
      </div>
      <div className="flex gap-2 pt-2">
        <button onClick={onPrev} className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm">← 이전</button>
        <button onClick={onNext} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold text-sm">다음 →</button>
      </div>
    </div>
  );
}

// ============================================
// 3. 저축설계 카드 (기존 유지 - 다음 작업에서 수정)
// ============================================
export function SavePlanCard({ onNext, onPrev }: CardProps) {
  const [formData, setFormData] = useState({ monthlyIncome: 500, monthlySaving: 100, targetRate: 20 });
  useEffect(() => { const saved = loadDesignData('save'); if (saved) setFormData(saved); }, []);
  useEffect(() => { saveDesignData('save', formData); }, [formData]);
  const currentRate = formData.monthlyIncome > 0 ? (formData.monthlySaving / formData.monthlyIncome * 100) : 0;
  const yearlyAmount = formData.monthlySaving * 12;
  let rateColor = currentRate >= 20 ? 'text-green-600' : currentRate >= 10 ? 'text-yellow-600' : 'text-red-600';
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();

  return (
    <div className="space-y-3">
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">💰</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>세 번째는 <span className="text-teal-600 font-bold">저축설계</span>입니다.</p>
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 space-y-3 shadow-sm">
        <h3 className="text-base font-bold text-gray-800 mb-3">저축 정보 입력</h3>
        <div className="space-y-2"><label className="text-sm font-semibold text-gray-700">월 소득</label><div className="flex items-center gap-2"><input type="number" value={formData.monthlyIncome} onChange={(e) => setFormData({...formData, monthlyIncome: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><span className="text-sm text-gray-500 font-medium w-10">만원</span></div></div>
        <div className="space-y-2"><label className="text-sm font-semibold text-gray-700">월 저축액</label><div className="flex items-center gap-2"><input type="number" value={formData.monthlySaving} onChange={(e) => setFormData({...formData, monthlySaving: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><span className="text-sm text-gray-500 font-medium w-10">만원</span></div></div>
        <div className="space-y-2"><label className="text-sm font-semibold text-gray-700">목표 저축률</label><div className="flex items-center gap-2"><input type="number" value={formData.targetRate} onChange={(e) => setFormData({...formData, targetRate: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><span className="text-sm text-gray-500 font-medium w-8">%</span></div></div>
      </div>
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 space-y-2">
        <h3 className="text-sm font-bold text-blue-800 mb-2">저축 분석 결과</h3>
        <div className="flex justify-between text-sm"><span className="text-gray-700">현재 저축률</span><span className={`font-bold ${rateColor}`}>{currentRate.toFixed(1)}%</span></div>
        <div className="flex justify-between text-sm"><span className="text-gray-700">연간 저축액</span><span className="font-bold text-blue-700">{yearlyAmount}만원</span></div>
      </div>
      <div className="flex gap-2 pt-2">
        <button onClick={onPrev} className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm">← 이전</button>
        <button onClick={onNext} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold text-sm">다음 →</button>
      </div>
    </div>
  );
}

// ============================================
// 4. 투자설계 카드 (기존 유지 - 다음 작업에서 수정)
// ============================================
export function InvestPlanCard({ onNext, onPrev }: CardProps) {
  const [formData, setFormData] = useState({ currentAge: 37, currentAssets: 10000, monthlyInvestment: 50, expectedReturn: 7 });
  useEffect(() => { const saved = loadDesignData('invest'); if (saved) setFormData(saved); }, []);
  useEffect(() => { saveDesignData('invest', formData); }, [formData]);
  const yearlyInvestment = formData.monthlyInvestment * 12;
  const tenYearAmount = (formData.currentAssets + yearlyInvestment * 10) * Math.pow(1 + formData.expectedReturn / 100, 10) / 10000;
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();

  return (
    <div className="space-y-3">
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">📈</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>네 번째는 <span className="text-teal-600 font-bold">투자설계</span>입니다.</p>
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 space-y-3 shadow-sm">
        <h3 className="text-base font-bold text-gray-800 mb-3">투자 정보 입력</h3>
        <div className="space-y-2"><label className="text-sm font-semibold text-gray-700">현재 나이</label><div className="flex items-center gap-2"><input type="number" value={formData.currentAge} onChange={(e) => setFormData({...formData, currentAge: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><span className="text-sm text-gray-500 font-medium w-8">세</span></div></div>
        <div className="space-y-2"><label className="text-sm font-semibold text-gray-700">현재 자산</label><div className="flex items-center gap-2"><input type="number" value={formData.currentAssets} onChange={(e) => setFormData({...formData, currentAssets: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><span className="text-sm text-gray-500 font-medium w-10">만원</span></div></div>
        <div className="space-y-2"><label className="text-sm font-semibold text-gray-700">월 투자액</label><div className="flex items-center gap-2"><input type="number" value={formData.monthlyInvestment} onChange={(e) => setFormData({...formData, monthlyInvestment: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><span className="text-sm text-gray-500 font-medium w-10">만원</span></div></div>
        <div className="space-y-2"><label className="text-sm font-semibold text-gray-700">예상 수익률</label><div className="flex items-center gap-2"><input type="number" step="0.1" value={formData.expectedReturn} onChange={(e) => setFormData({...formData, expectedReturn: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><span className="text-sm text-gray-500 font-medium w-8">%</span></div></div>
      </div>
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 space-y-2">
        <h3 className="text-sm font-bold text-orange-800 mb-2">투자 분석 결과</h3>
        <div className="flex justify-between text-sm"><span className="text-gray-700">연간 투자액</span><span className="font-bold text-orange-700">{yearlyInvestment}만원</span></div>
        <div className="flex justify-between text-sm"><span className="text-gray-700">10년 후 예상</span><span className="font-bold text-orange-700">{tenYearAmount.toFixed(1)}억원</span></div>
      </div>
      <div className="flex gap-2 pt-2">
        <button onClick={onPrev} className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm">← 이전</button>
        <button onClick={onNext} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold text-sm">다음 →</button>
      </div>
    </div>
  );
}

// ============================================
// 5. 세금설계 카드 (기존 유지 - 다음 작업에서 수정)
// ============================================
export function TaxPlanCard({ onNext, onPrev }: CardProps) {
  const [formData, setFormData] = useState({ annualIncome: 6000, pensionSaving: 400, irpContribution: 0, housingSubscription: 240 });
  useEffect(() => { const saved = loadDesignData('tax'); if (saved) setFormData(saved); }, []);
  useEffect(() => { saveDesignData('tax', formData); }, [formData]);
  const totalDeduction = Math.min(formData.pensionSaving, 400) * 0.165 + Math.min(formData.irpContribution, 300) * 0.165 + Math.min(formData.housingSubscription, 240) * 0.165;
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();

  return (
    <div className="space-y-3">
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">💸</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>다섯 번째는 <span className="text-teal-600 font-bold">세금설계</span>입니다.</p>
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 space-y-3 shadow-sm">
        <h3 className="text-base font-bold text-gray-800 mb-3">세금 정보 입력</h3>
        <div className="space-y-2"><label className="text-sm font-semibold text-gray-700">연간 소득</label><div className="flex items-center gap-2"><input type="number" value={formData.annualIncome} onChange={(e) => setFormData({...formData, annualIncome: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><span className="text-sm text-gray-500 font-medium w-10">만원</span></div></div>
        <div className="space-y-2"><label className="text-sm font-semibold text-gray-700">연금저축 (연)</label><div className="flex items-center gap-2"><input type="number" value={formData.pensionSaving} onChange={(e) => setFormData({...formData, pensionSaving: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><span className="text-sm text-gray-500 font-medium w-10">만원</span></div></div>
        <div className="space-y-2"><label className="text-sm font-semibold text-gray-700">IRP (연)</label><div className="flex items-center gap-2"><input type="number" value={formData.irpContribution} onChange={(e) => setFormData({...formData, irpContribution: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><span className="text-sm text-gray-500 font-medium w-10">만원</span></div></div>
        <div className="space-y-2"><label className="text-sm font-semibold text-gray-700">주택청약 (연)</label><div className="flex items-center gap-2"><input type="number" value={formData.housingSubscription} onChange={(e) => setFormData({...formData, housingSubscription: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><span className="text-sm text-gray-500 font-medium w-10">만원</span></div></div>
      </div>
      <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 space-y-2">
        <h3 className="text-sm font-bold text-red-800 mb-2">세금 분석 결과</h3>
        <div className="flex justify-between text-sm"><span className="text-gray-700">총 세액공제</span><span className="font-bold text-green-600">{totalDeduction.toFixed(0)}만원</span></div>
      </div>
      <div className="flex gap-2 pt-2">
        <button onClick={onPrev} className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm">← 이전</button>
        <button onClick={onNext} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold text-sm">다음 →</button>
      </div>
    </div>
  );
}

// ============================================
// 6. 부동산설계 카드 (기존 유지 - 다음 작업에서 수정)
// ============================================
export function EstatePlanCard({ onNext, onPrev }: CardProps) {
  const [formData, setFormData] = useState({ currentPrice: 50000, loanBalance: 30000, monthlyRent: 0, holdingYears: 5, expectedGrowth: 3 });
  useEffect(() => { const saved = loadDesignData('estate'); if (saved) setFormData(saved); }, []);
  useEffect(() => { saveDesignData('estate', formData); }, [formData]);
  const netEquity = formData.currentPrice - formData.loanBalance;
  const ltv = formData.currentPrice > 0 ? (formData.loanBalance / formData.currentPrice * 100) : 0;
  let ltvColor = ltv <= 40 ? 'text-green-600' : ltv <= 60 ? 'text-blue-600' : ltv <= 80 ? 'text-yellow-600' : 'text-red-600';
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();

  return (
    <div className="space-y-3">
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">🏠</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>여섯 번째는 <span className="text-teal-600 font-bold">부동산설계</span>입니다.</p>
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 space-y-3 shadow-sm">
        <h3 className="text-base font-bold text-gray-800 mb-3">부동산 정보 입력</h3>
        <div className="space-y-2"><label className="text-sm font-semibold text-gray-700">주택 가격</label><div className="flex items-center gap-2"><input type="number" value={formData.currentPrice} onChange={(e) => setFormData({...formData, currentPrice: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><span className="text-sm text-gray-500 font-medium w-10">만원</span></div></div>
        <div className="space-y-2"><label className="text-sm font-semibold text-gray-700">대출 잔액</label><div className="flex items-center gap-2"><input type="number" value={formData.loanBalance} onChange={(e) => setFormData({...formData, loanBalance: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><span className="text-sm text-gray-500 font-medium w-10">만원</span></div></div>
        <div className="space-y-2"><label className="text-sm font-semibold text-gray-700">월세 수입</label><div className="flex items-center gap-2"><input type="number" value={formData.monthlyRent} onChange={(e) => setFormData({...formData, monthlyRent: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><span className="text-sm text-gray-500 font-medium w-10">만원</span></div></div>
      </div>
      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 space-y-2">
        <h3 className="text-sm font-bold text-indigo-800 mb-2">부동산 분석 결과</h3>
        <div className="flex justify-between text-sm"><span className="text-gray-700">순자산</span><span className="font-bold text-indigo-700">{(netEquity / 10000).toFixed(1)}억원</span></div>
        <div className="flex justify-between text-sm"><span className="text-gray-700">LTV</span><span className={`font-bold ${ltvColor}`}>{ltv.toFixed(1)}%</span></div>
      </div>
      <div className="flex gap-2 pt-2">
        <button onClick={onPrev} className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm">← 이전</button>
        <button onClick={onNext} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold text-sm">다음 →</button>
      </div>
    </div>
  );
}

// ============================================
// 7. 보험설계 카드 (마지막) (기존 유지 - 다음 작업에서 수정)
// ============================================
export function InsurancePlanCard({ onNext, onPrev, isLast }: CardProps) {
  const [formData, setFormData] = useState({ monthlyPremium: 30, deathCoverage: 5, diseaseCoverage: 3, hasHealthInsurance: true, pensionInsurance: 20 });
  useEffect(() => { const saved = loadDesignData('insurance'); if (saved) setFormData(saved); }, []);
  useEffect(() => { saveDesignData('insurance', formData); }, [formData]);
  const yearlyPremium = formData.monthlyPremium * 12;
  const totalCoverage = formData.deathCoverage + formData.diseaseCoverage;
  let coverageColor = totalCoverage >= 8 ? 'text-green-600' : totalCoverage >= 5 ? 'text-blue-600' : 'text-red-600';
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();

  return (
    <div className="space-y-3">
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">🛡️</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>마지막 일곱 번째는 <span className="text-teal-600 font-bold">보험설계</span>입니다.</p>
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 space-y-3 shadow-sm">
        <h3 className="text-base font-bold text-gray-800 mb-3">보험 정보 입력</h3>
        <div className="space-y-2"><label className="text-sm font-semibold text-gray-700">월 보험료</label><div className="flex items-center gap-2"><input type="number" value={formData.monthlyPremium} onChange={(e) => setFormData({...formData, monthlyPremium: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><span className="text-sm text-gray-500 font-medium w-10">만원</span></div></div>
        <div className="space-y-2"><label className="text-sm font-semibold text-gray-700">사망보장</label><div className="flex items-center gap-2"><input type="number" step="0.1" value={formData.deathCoverage} onChange={(e) => setFormData({...formData, deathCoverage: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><span className="text-sm text-gray-500 font-medium w-10">억원</span></div></div>
        <div className="space-y-2"><label className="text-sm font-semibold text-gray-700">질병보장</label><div className="flex items-center gap-2"><input type="number" step="0.1" value={formData.diseaseCoverage} onChange={(e) => setFormData({...formData, diseaseCoverage: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><span className="text-sm text-gray-500 font-medium w-10">억원</span></div></div>
        <div className="space-y-2"><label className="text-sm font-semibold text-gray-700">실손보험</label>
          <div className="flex gap-3">
            <button onClick={() => setFormData({...formData, hasHealthInsurance: true})} className={`flex-1 py-2 rounded-lg text-sm font-semibold ${formData.hasHealthInsurance ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600'}`}>가입</button>
            <button onClick={() => setFormData({...formData, hasHealthInsurance: false})} className={`flex-1 py-2 rounded-lg text-sm font-semibold ${!formData.hasHealthInsurance ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600'}`}>미가입</button>
          </div>
        </div>
        <div className="space-y-2"><label className="text-sm font-semibold text-gray-700">연금보험 (월)</label><div className="flex items-center gap-2"><input type="number" value={formData.pensionInsurance} onChange={(e) => setFormData({...formData, pensionInsurance: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><span className="text-sm text-gray-500 font-medium w-10">만원</span></div></div>
      </div>
      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 space-y-2">
        <h3 className="text-sm font-bold text-emerald-800 mb-2">보험 분석 결과</h3>
        <div className="flex justify-between text-sm"><span className="text-gray-700">연간 보험료</span><span className="font-bold text-emerald-700">{yearlyPremium}만원</span></div>
        <div className="flex justify-between text-sm"><span className="text-gray-700">총 보장</span><span className={`font-bold ${coverageColor}`}>{totalCoverage}억원</span></div>
        <div className="flex justify-between text-sm"><span className="text-gray-700">실손보험</span><span className={`font-bold ${formData.hasHealthInsurance ? 'text-green-600' : 'text-red-600'}`}>{formData.hasHealthInsurance ? '가입 ✓' : '미가입 ✗'}</span></div>
        {!formData.hasHealthInsurance && <div className="bg-white rounded-lg p-2 mt-2"><p className="text-xs text-red-600">⚠️ 실손보험 가입을 추천합니다!</p></div>}
      </div>
      <div className="flex gap-2 pt-2">
        <button onClick={onPrev} className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm">← 이전</button>
        <button onClick={onNext} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold text-sm">{isLast ? '금융집 완성 🎉' : '다음 →'}</button>
      </div>
    </div>
  );
}
