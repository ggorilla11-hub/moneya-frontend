// src/pages/FinancialHouseDisclaimer.tsx
// 금융집짓기 - DISCLAIMER (면책조항) 화면
// C시리즈 UI 기반

import { useState } from 'react';

interface FinancialHouseDisclaimerProps {
  userName: string;
  onStart: () => void;
  onBack?: () => void;
}

export default function FinancialHouseDisclaimer({ 
  userName, 
  onStart,
  onBack 
}: FinancialHouseDisclaimerProps) {
  const [agreed, setAgreed] = useState(false);

  const handleAgree = () => {
    if (agreed) {
      onStart();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        {onBack && (
          <button 
            onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600"
          >
            ←
          </button>
        )}
        <h1 className="flex-1 text-lg font-bold text-gray-900">서비스 안내</h1>
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto p-5">
        {/* 아이콘 */}
        <div className="w-16 h-16 mx-auto mb-5 bg-amber-50 rounded-full flex items-center justify-center">
          <span className="text-3xl">⚠️</span>
        </div>

        {/* 타이틀 */}
        <h2 className="text-xl font-extrabold text-center text-gray-900 mb-2">
          금융집짓기 서비스 안내
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          시작하기 전 아래 내용을 확인해 주세요
        </p>

        {/* 안내 박스 1: 서비스 성격 */}
        <div className="bg-gray-100 rounded-xl p-4 mb-4">
          <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
            <span>📋</span> 서비스 성격
          </h4>
          <p className="text-xs text-gray-600 leading-relaxed">
            본 서비스는 <strong className="text-gray-900">투자자문업이 아닌</strong> 금융정보 제공 서비스입니다. 
            금융머니야는 일반적인 재무설계 정보를 제공하며, 개별 투자 결정에 대한 책임은 본인에게 있습니다.
          </p>
        </div>

        {/* 안내 박스 2: 개인정보 보호 */}
        <div className="bg-gray-100 rounded-xl p-4 mb-4">
          <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
            <span>🔒</span> 개인정보 보호
          </h4>
          <p className="text-xs text-gray-600 leading-relaxed">
            입력하신 정보는 재무설계 분석 목적으로만 사용되며, 제3자에게 제공되지 않습니다.
          </p>
        </div>

        {/* 안내 박스 3: 서비스 범위 */}
        <div className="bg-gray-100 rounded-xl p-4 mb-4">
          <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
            <span>💡</span> 서비스 범위
          </h4>
          <ul className="text-xs text-gray-600 leading-relaxed list-disc pl-4 space-y-1">
            <li>은퇴설계, 저축·부채설계, 투자설계 정보 제공</li>
            <li>세금설계, 부동산, 보험 관련 일반 정보</li>
            <li>복잡한 세금·법률 문제는 전문가 상담 권장</li>
          </ul>
        </div>

        {/* 동의 체크박스 */}
        <button
          onClick={() => setAgreed(!agreed)}
          className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 transition-all ${
            agreed 
              ? 'border-emerald-500 bg-emerald-50' 
              : 'border-gray-200 bg-white'
          }`}
        >
          <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
            agreed 
              ? 'bg-emerald-500 border-emerald-500 text-white' 
              : 'border-gray-300'
          }`}>
            {agreed && <span className="text-sm">✓</span>}
          </div>
          <span className="text-sm text-gray-700 text-left leading-relaxed">
            위 내용을 모두 확인하였으며, 서비스 성격을 이해하고 동의합니다.
          </span>
        </button>
      </div>

      {/* 하단 버튼 */}
      <div className="p-4 bg-white border-t border-gray-200">
        <button
          onClick={handleAgree}
          disabled={!agreed}
          className={`w-full py-4 rounded-xl text-base font-bold transition-all ${
            agreed
              ? 'bg-gradient-to-r from-teal-400 to-teal-600 text-white shadow-lg shadow-teal-500/30'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          동의하고 시작하기
        </button>
      </div>
    </div>
  );
}
