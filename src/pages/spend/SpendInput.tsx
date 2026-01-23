import { useState } from 'react';

interface SpendInputProps {
  isOpen: boolean;
  onClose: () => void;
  onManualInput: () => void;
}

function SpendInput({ isOpen, onClose, onManualInput }: SpendInputProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  const handleManualClick = () => {
    handleClose();
    setTimeout(() => {
      onManualInput();
    }, 250);
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-end justify-center transition-opacity duration-200 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
      onClick={handleClose}
    >
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* 바텀시트 */}
      <div 
        className={`relative w-full max-w-lg bg-white rounded-t-3xl transform transition-transform duration-200 ${isClosing ? 'translate-y-full' : 'translate-y-0'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* 핸들바 */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* 헤더 */}
        <div className="px-5 pb-3 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">어떻게 기록할까요?</h2>
          <p className="text-sm text-gray-500 mt-0.5">편한 방법을 선택하세요</p>
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

          {/* 음성 입력, 영수증 촬영, 계좌 연동 - 앱스토어 제출용 숨김 처리 (2026-01-23) */}
        </div>

        {/* 취소 버튼 */}
        <div className="px-4 pb-8">
          <button
            onClick={handleClose}
            className="w-full py-3.5 bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

export default SpendInput;
