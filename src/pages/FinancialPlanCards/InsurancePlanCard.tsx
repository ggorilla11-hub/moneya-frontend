// src/pages/FinancialPlanCards/InsurancePlanCard.tsx
// 보험설계 카드 (v4.1) - FinancialPlanCards.tsx v4.4에서 분리
// 시뮬레이터 방식 가로스크롤 테이블 + 보험증권 업로드 + 준비자금 직접입력
// 기능 변경 없음 (1:1 동일)

import { useState, useEffect } from 'react';
import { saveDesignData, loadDesignData } from '../FinancialHouseDesign';
import type { CardProps } from './shared';
import { DisclaimerBox } from './shared';

export function InsurancePlanCard({ onNext, onPrev, isLast, onOpenOCR }: CardProps) {
  const [showFormula, setShowFormula] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [formData, setFormData] = useState({ annualIncome: 6000, totalDebt: 40000 });
  const [prepared, setPrepared] = useState({
    death: 20000, disability: 10000, cancer: 5000, brain: 3000, heart: 3000, medical: 5000,
    hospital: 'O' as string, dementia: 'X' as string,
  });
  
  useEffect(() => {
    const saved = loadDesignData('insurance');
    if (saved) {
      if (saved.annualIncome) setFormData({ annualIncome: saved.annualIncome, totalDebt: saved.totalDebt || 40000 });
      if (saved.prepared) setPrepared(saved.prepared);
    }
  }, []);
  
  useEffect(() => { saveDesignData('insurance', { ...formData, prepared }); }, [formData, prepared]);

  const required = {
    death: formData.annualIncome * 3 + formData.totalDebt,
    disability: formData.annualIncome * 3 + formData.totalDebt,
    cancer: formData.annualIncome * 2,
    brain: formData.annualIncome,
    heart: formData.annualIncome,
    medical: 5000,
  };

  const lack = {
    death: required.death - prepared.death,
    disability: required.disability - prepared.disability,
    cancer: required.cancer - prepared.cancer,
    brain: required.brain - prepared.brain,
    heart: required.heart - prepared.heart,
    medical: required.medical - prepared.medical,
  };

  const getLackColor = (val: number) => { if (val > 0) return 'text-red-600'; if (val < 0) return 'text-green-600'; return 'text-blue-600'; };
  const getLackBg = (val: number) => { if (val > 0) return 'bg-red-50'; if (val < 0) return 'bg-green-50'; return 'bg-blue-50'; };

  const fmt = (amount: number) => {
    if (amount >= 10000) return `${(amount / 10000).toFixed(1)}억`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)}천`;
    if (amount <= -10000) return `${(amount / 10000).toFixed(1)}억`;
    if (amount <= -1000) return `${(amount / 1000).toFixed(0)}천`;
    return `${amount}만`;
  };
  
  const fmtLack = (val: number) => { if (val > 0) return fmt(val); if (val < 0) return `+${fmt(Math.abs(val))}`; return '0원'; };
  const getSpecialColor = (val: string) => { const v = val.toUpperCase(); if (v === 'O' || v === '유' || v === 'Y') return 'text-green-600'; return 'text-red-600'; };
  const getSpecialLack = (val: string) => { const v = val.toUpperCase(); if (v === 'O' || v === '유' || v === 'Y') return { text: '-', color: 'text-green-600', bg: 'bg-green-50' }; return { text: '미가입', color: 'text-red-600', bg: 'bg-red-50' }; };

  const lackItems = [
    lack.death > 0, lack.disability > 0, lack.cancer > 0, lack.brain > 0, lack.heart > 0, lack.medical > 0,
    !['O','o','유','Y','y'].includes(prepared.hospital),
    !['O','o','유','Y','y'].includes(prepared.dementia),
  ];
  const lackCount = lackItems.filter(Boolean).length;

  const urgentList = [
    { name: '사망', val: lack.death }, { name: '장해', val: lack.disability },
    { name: '암진단', val: lack.cancer }, { name: '뇌혈관', val: lack.brain },
    { name: '심혈관', val: lack.heart }, { name: '실비', val: lack.medical },
  ].filter(i => i.val > 0).sort((a, b) => b.val - a.val);
  const mostUrgent = urgentList[0];

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();

  const handleSave = () => {
    saveDesignData('insurance', { ...formData, prepared });
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2500);
  };

  const handleUpload = () => {
    if (onOpenOCR) { onOpenOCR(); }
    else { alert('보험증권 업로드 기능은 추후 업데이트 예정입니다.\n\n⚠️ AI 분석은 참고용이며, 정확한 보험 분석은 전문 설계사 상담을 권장합니다.'); }
  };

  const hospitalLack = getSpecialLack(prepared.hospital);
  const dementiaLack = getSpecialLack(prepared.dementia);

  return (
    <div className="space-y-3">
      <div className="flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg flex-shrink-0">️</div>
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-sm leading-relaxed max-w-[calc(100%-50px)]">
          <p>마지막! <span className="text-teal-600 font-bold">보험설계</span>입니다. <span className="text-teal-600 font-bold">8대 보장 분석</span>으로 부족한 보장을 확인해볼게요! ️</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-xl">️</div>
          <div className="flex-1"><h3 className="text-base font-bold text-gray-800">보험설계</h3><p className="text-[11px] text-gray-400">8대 보장 분석</p></div>
          <span className="text-[11px] text-teal-700 font-bold bg-teal-50 px-2 py-1 rounded-md">7/7</span>
        </div>

        <div onClick={handleUpload} className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-all mb-4">
          <div className="text-2xl mb-1"></div>
          <div className="text-sm font-semibold text-gray-700">보험증권 업로드 (OCR 분석)</div>
          <div className="text-[11px] text-gray-400 mt-1">PDF, 이미지 파일 지원 · AI 자동 인식</div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="space-y-1"><label className="text-xs font-semibold text-gray-700">연봉</label><div className="flex items-center gap-1"><input type="number" value={formData.annualIncome} onChange={(e) => setFormData({...formData, annualIncome: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:border-teal-500 outline-none" /><span className="text-xs text-gray-500">만원</span></div></div>
          <div className="space-y-1"><label className="text-xs font-semibold text-gray-700">총부채</label><div className="flex items-center gap-1"><input type="number" value={formData.totalDebt} onChange={(e) => setFormData({...formData, totalDebt: Number(e.target.value)})} onFocus={handleFocus} className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:border-teal-500 outline-none" /><span className="text-xs text-gray-500">만원</span></div></div>
        </div>

        <div className="flex items-center justify-center gap-1.5 py-1.5 text-[11px] text-gray-400"><span></span> 좌우로 스크롤하여 8대 보장을 확인하세요 <span></span></div>

        <div className="mx-[-16px] px-[16px]">
          <div className="overflow-x-auto pb-2" style={{ WebkitOverflowScrolling: 'touch' }}>
            <table className="border-collapse w-full" style={{ minWidth: '700px' }}>
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
                <tr className="bg-green-50">
                  <td className="py-2 px-2 text-center text-xs font-bold text-green-800 bg-green-100 border border-gray-200 whitespace-nowrap">준비자금</td>
                  <td className="py-1 px-1 text-center border border-gray-200"><input type="number" value={prepared.death} onChange={(e) => setPrepared({...prepared, death: Number(e.target.value)})} onFocus={handleFocus} className="w-[58px] px-1 py-1 border-2 border-green-300 rounded-md text-center text-xs font-semibold text-green-700 bg-green-50 focus:border-teal-500 focus:bg-white outline-none" /></td>
                  <td className="py-1 px-1 text-center border border-gray-200"><input type="number" value={prepared.disability} onChange={(e) => setPrepared({...prepared, disability: Number(e.target.value)})} onFocus={handleFocus} className="w-[58px] px-1 py-1 border-2 border-green-300 rounded-md text-center text-xs font-semibold text-green-700 bg-green-50 focus:border-teal-500 focus:bg-white outline-none" /></td>
                  <td className="py-1 px-1 text-center border border-gray-200"><input type="number" value={prepared.cancer} onChange={(e) => setPrepared({...prepared, cancer: Number(e.target.value)})} onFocus={handleFocus} className="w-[58px] px-1 py-1 border-2 border-green-300 rounded-md text-center text-xs font-semibold text-green-700 bg-green-50 focus:border-teal-500 focus:bg-white outline-none" /></td>
                  <td className="py-1 px-1 text-center border border-gray-200"><input type="number" value={prepared.brain} onChange={(e) => setPrepared({...prepared, brain: Number(e.target.value)})} onFocus={handleFocus} className="w-[58px] px-1 py-1 border-2 border-green-300 rounded-md text-center text-xs font-semibold text-green-700 bg-green-50 focus:border-teal-500 focus:bg-white outline-none" /></td>
                  <td className="py-1 px-1 text-center border border-gray-200"><input type="number" value={prepared.heart} onChange={(e) => setPrepared({...prepared, heart: Number(e.target.value)})} onFocus={handleFocus} className="w-[58px] px-1 py-1 border-2 border-green-300 rounded-md text-center text-xs font-semibold text-green-700 bg-green-50 focus:border-teal-500 focus:bg-white outline-none" /></td>
                  <td className="py-1 px-1 text-center border border-gray-200"><input type="number" value={prepared.medical} onChange={(e) => setPrepared({...prepared, medical: Number(e.target.value)})} onFocus={handleFocus} className="w-[58px] px-1 py-1 border-2 border-green-300 rounded-md text-center text-xs font-semibold text-green-700 bg-green-50 focus:border-teal-500 focus:bg-white outline-none" /></td>
                  <td className="py-1 px-1 text-center border border-gray-200"><input type="text" value={prepared.hospital} onChange={(e) => setPrepared({...prepared, hospital: e.target.value})} onFocus={handleFocus} className={`w-[40px] px-1 py-1 border-2 border-green-300 rounded-md text-center text-xs font-semibold ${getSpecialColor(prepared.hospital)} bg-green-50 focus:border-teal-500 focus:bg-white outline-none`} placeholder="유/무" /></td>
                  <td className="py-1 px-1 text-center border border-gray-200"><input type="text" value={prepared.dementia} onChange={(e) => setPrepared({...prepared, dementia: e.target.value})} onFocus={handleFocus} className={`w-[40px] px-1 py-1 border-2 border-green-300 rounded-md text-center text-xs font-semibold ${getSpecialColor(prepared.dementia)} bg-green-50 focus:border-teal-500 focus:bg-white outline-none`} placeholder="유/무" /></td>
                </tr>
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
          <div className="text-center py-1"><span className="text-[10px] text-gray-400">← 좌우로 스크롤하세요 →</span></div>
        </div>
      </div>

      <button onClick={() => setShowFormula(!showFormula)} className="w-full flex items-center gap-1.5 px-3 py-2.5 bg-gray-100 rounded-lg text-xs font-semibold text-gray-600 hover:bg-teal-50 hover:text-teal-700 transition-all border border-transparent hover:border-teal-200">
        <span className={`text-[10px] transition-transform ${showFormula ? 'rotate-90' : ''}`}>▶</span><span> 필요자금 계산 방법 보기</span>
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

      <button onClick={handleSave} className="w-full py-3.5 rounded-lg font-bold text-sm text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 transition-all shadow-md"> 저장하고 부족자금 계산하기</button>

      {showSaveSuccess && (
        <div className="text-center py-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-300"><div className="text-3xl mb-1">✅</div><div className="text-sm font-bold text-green-700">보험 분석 저장 완료!</div></div>
      )}

      <div className="bg-gradient-to-br from-teal-50/50 to-teal-100/30 rounded-xl p-4 border border-teal-200/50">
        <div className="text-xs font-bold text-teal-700 mb-3 flex items-center gap-1.5"> 보험 분석 요약</div>
        <div className="space-y-2">
          <div className="flex justify-between items-center py-1.5 border-b border-teal-200/30"><span className="text-xs text-gray-600">총 부족 보장</span><span className={`text-sm font-bold ${lackCount > 0 ? 'text-red-500' : 'text-green-500'}`}>{lackCount > 0 ? `${lackCount}개 항목` : '모두 충족! ✅'}</span></div>
          {mostUrgent && (<div className="flex justify-between items-center py-1.5 border-b border-teal-200/30"><span className="text-xs text-gray-600">가장 시급한 보장</span><span className="text-sm font-bold text-gray-800">{mostUrgent.name} ({fmt(mostUrgent.val)} 부족)</span></div>)}
          {!['O','o','유','Y','y'].includes(prepared.dementia) && (<div className="flex justify-between items-center py-1.5"><span className="text-xs text-gray-600">치매간병 특약</span><span className="text-sm font-bold text-amber-600">미가입 (추가 권장)</span></div>)}
        </div>
      </div>

      {mostUrgent && (
        <div className="bg-blue-50 rounded-xl p-3 flex gap-2 border border-blue-200"><span className="text-base"></span><p className="text-xs text-blue-700 leading-relaxed"><strong>AI머니야 추천:</strong> {mostUrgent.name}보장이 가장 부족해요. {mostUrgent.name}{urgentList.length > 1 ? ` + ${urgentList[1].name}` : ''} 보장을 우선 보완하시는 것을 권장합니다.</p></div>
      )}

      <div className="p-2 bg-gray-100 rounded-lg"><p className="text-[10px] text-gray-500 text-center">※ AI 분석은 틀릴 수 있습니다. 정확한 보험 분석은 전문 설계사 상담을 권장합니다.</p></div>
      <DisclaimerBox />
      <div className="flex gap-2 pt-2">
        <button onClick={onPrev} className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm">← 이전</button>
        <button onClick={onNext} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold text-sm">{isLast ? '금융집 완성 ' : '다음 →'}</button>
      </div>
    </div>
  );
}
