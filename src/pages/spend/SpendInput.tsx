// src/pages/spend/SpendInput.tsx
// 지출 입력 방식 선택 모달 + 수동입력 연동

import { useState } from 'react';
import ManualInputModal from './ManualInputModal';

interface SpendInputProps {
  isInputMethodOpen: boolean;
  setIsInputMethodOpen: (open: boolean) => void;
  onVoiceStart?: () => void;
}

function SpendInput({ isInputMethodOpen, setIsInputMethodOpen, onVoiceStart }: SpendInputProps) {
  const [isManualInputOpen, setIsManualInputOpen] = useState(false);

  const handleManualClick = () => {
    setIsInputMethodOpen(false);
    setIsManualInputOpen(true);
  };

  const handleVoiceClick = () => {
    setIsInputMethodOpen(false);
    if (onVoiceStart) {
      onVoiceStart();
    }
  };

  return (
    <>
      {/* 입력 방식 선택 모달 */}
      {isInputMethodOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setIsInputMethodOpen(false)}>
          <div 
            className="w-full max-w-md bg-white rounded-t-[24px] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'slideUp 0.3s ease-out' }}
          >
            {/* 헤더 */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">💳 입력 방식</h2>
              <button onClick={() => setIsInputMethodOpen(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-gray-500 text-lg">✕</span>
              </button>
            </div>

            {/* 입력 방식 목록 */}
            <div className="p-4 space-y-3">
              {/* 수동 입력 */}
              <button
                onClick={handleManualClick}
                className="w-full flex items-center gap-4 p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                  <span className="text-xl">✏️</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-gray-800">수동 입력</p>
                  <p className="text-sm text-gray-500">지출 또는 참음 직접 입력</p>
                </div>
                <span className="text-gray-400 text-lg">›</span>
              </button>

              {/* 음성 입력 */}
              <button
                onClick={handleVoiceClick}
                className="w-full flex items-center gap-4 p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl hover:border-pink-400 hover:bg-pink-50 transition-all"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🎤</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-gray-800">음성 입력</p>
                  <p className="text-sm text-gray-500">머니야에게 말하기</p>
                </div>
                <span className="text-gray-400 text-lg">›</span>
              </button>

              {/* 영수증 촬영 (개발중) */}
              <button
                disabled
                className="w-full flex items-center gap-4 p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl opacity-60 cursor-not-allowed"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center">
                  <span className="text-xl">📷</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-gray-800">영수증 촬영</p>
                  <p className="text-sm text-gray-500">자동 인식</p>
                </div>
                <span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">개발중</span>
              </button>

              {/* 계좌 연동 (개발중) */}
              <button
                disabled
                className="w-full flex items-center gap-4 p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl opacity-60 cursor-not-allowed"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🏦</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-gray-800">계좌 연동</p>
                  <p className="text-sm text-gray-500">자동 기록</p>
                </div>
                <span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">개발중</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 수동입력 모달 */}
      <ManualInputModal isOpen={isManualInputOpen} onClose={() => setIsManualInputOpen(false)} />

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

export default SpendInput;
