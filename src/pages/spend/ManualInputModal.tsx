// src/pages/spend/ManualInputModal.tsx
// 수동 입력 모달 - 지출/감정저축 직접 입력 + 고정지출 카테고리 추가
// v2: userId 제거 (SpendContext에서 자동 설정)

import { useState } from 'react';
import { useSpend } from '../../context/SpendContext';
import { SPEND_CATEGORIES, SAVED_REASONS, URGENCY_OPTIONS } from '../../types/spend';
import type { SpendType, EmotionType } from '../../types/spend';

interface ManualInputModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function ManualInputModal({ isOpen, onClose }: ManualInputModalProps) {
  const { addSpendItem } = useSpend();
  const [activeTab, setActiveTab] = useState<'spent' | 'saved'>('spent');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [category, setCategory] = useState('food');
  const [isFixedCategory, setIsFixedCategory] = useState(false);
  const [emotionType, setEmotionType] = useState<EmotionType>('선택');
  const [savedReason, setSavedReason] = useState('충동 억제');
  const [urgency, setUrgency] = useState('오늘중으로');

  if (!isOpen) return null;

  const handleCategorySelect = (catId: string, isFixed: boolean) => {
    setCategory(catId);
    setIsFixedCategory(isFixed);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value) {
      setAmount(Number(value).toLocaleString());
    } else {
      setAmount('');
    }
  };

  const handleSubmit = () => {
    const numAmount = parseInt(amount.replace(/,/g, ''), 10);
    if (!memo.trim()) {
      alert('내용을 입력해주세요');
      return;
    }
    if (!numAmount || numAmount <= 0) {
      alert('금액을 입력해주세요');
      return;
    }

    let spendType: SpendType = activeTab as SpendType;
    if (activeTab === 'spent' && isFixedCategory) {
      spendType = 'investment';
    }

    let categoryName = category;
    if (isFixedCategory) {
      const fixedCat = SPEND_CATEGORIES.fixed.find(c => c.id === category);
      categoryName = fixedCat?.name || category;
    } else {
      const varCat = SPEND_CATEGORIES.variable.find(c => c.id === category);
      categoryName = varCat?.name || category;
    }

    // 🆕 v2: userId 제거 (SpendContext에서 자동 설정)
    addSpendItem({
      amount: numAmount,
      type: spendType,
      category: categoryName,
      emotionType: activeTab === 'spent' && !isFixedCategory ? emotionType : undefined,
      memo: memo.trim(),
      tag: activeTab === 'saved' ? savedReason : isFixedCategory ? '고정지출' : undefined,
      inputMethod: 'manual',
      timestamp: new Date(),
    });

    setAmount('');
    setMemo('');
    setCategory('food');
    setIsFixedCategory(false);
    setEmotionType('선택');
    setSavedReason('충동 억제');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div 
        className="bg-white w-full max-w-md rounded-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: 'calc(100vh - 120px)' }}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-800">✏️ 직접 입력</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
            <span className="text-gray-400 text-xl">×</span>
          </button>
        </div>

        {/* 탭 */}
        <div className="flex border-b border-gray-100 flex-shrink-0">
          <button
            onClick={() => { setActiveTab('spent'); setIsFixedCategory(false); setCategory('food'); }}
            className={`flex-1 py-3 text-sm font-bold ${activeTab === 'spent' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-400'}`}
          >
            💸 지출
          </button>
          <button
            onClick={() => { setActiveTab('saved'); setIsFixedCategory(false); setCategory('food'); }}
            className={`flex-1 py-3 text-sm font-bold ${activeTab === 'saved' ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-400'}`}
          >
            💪 감정저축
          </button>
        </div>

        {/* 입력 폼 - 스크롤 영역 */}
        <div 
          className="overflow-y-auto p-4 space-y-4"
          style={{ maxHeight: 'calc(100vh - 320px)' }}
        >
          {/* 내용 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">내용</label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="예: 점심 김치찌개"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:border-blue-400"
            />
          </div>

          {/* 금액 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">금액</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₩</span>
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-base text-right focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {/* 카테고리 - 지출 탭일 때만 */}
          {activeTab === 'spent' && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">카테고리</label>
              
              {/* 변동지출 (생활비) */}
              <p className="text-xs text-gray-400 mb-1">변동지출 (생활비)</p>
              <div className="grid grid-cols-4 gap-1 mb-3">
                {SPEND_CATEGORIES.variable.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id, false)}
                    className={`py-2 rounded-xl text-[11px] font-medium flex flex-col items-center gap-0.5 ${
                      category === cat.id && !isFixedCategory 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <span className="text-base">{cat.emoji}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>

              {/* 고정지출 */}
              <p className="text-xs text-blue-500 font-semibold mb-1">고정지출</p>
              <div className="grid grid-cols-4 gap-1">
                {SPEND_CATEGORIES.fixed.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id, true)}
                    className={`py-2 rounded-xl text-[11px] font-medium flex flex-col items-center gap-0.5 ${
                      category === cat.id && isFixedCategory 
                        ? 'bg-green-500 text-white' 
                        : 'bg-blue-50 text-blue-600 border border-blue-200'
                    }`}
                  >
                    <span className="text-base">{cat.emoji}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 감정지출 - 변동지출일 때만 */}
          {activeTab === 'spent' && !isFixedCategory && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">감정지출</label>
              <div className="flex gap-2">
                {(['충동', '선택', '필수'] as EmotionType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setEmotionType(type)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium ${
                      emotionType === type
                        ? type === '충동' ? 'bg-red-500 text-white' : type === '선택' ? 'bg-amber-500 text-white' : 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {type === '충동' ? '🔥' : type === '🤔' ? '🤔' : '✅'} {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 고정지출 안내 */}
          {activeTab === 'spent' && isFixedCategory && (
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
              <p className="text-sm text-blue-700 font-medium">💡 고정지출은 순저축에 반영됩니다</p>
              <p className="text-xs text-blue-500 mt-1">저축투자, 노후연금은 자산 증가로, 보험/대출은 고정비용으로 기록됩니다.</p>
            </div>
          )}

          {/* 감정저축일 때 */}
          {activeTab === 'saved' && (
            <>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">참은 이유</label>
                <div className="flex flex-wrap gap-1">
                  {SAVED_REASONS.map((reason) => (
                    <button
                      key={reason}
                      onClick={() => setSavedReason(reason)}
                      className={`px-2 py-1 rounded-full text-[11px] font-medium ${savedReason === reason ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">긴급도</label>
                <div className="flex gap-2">
                  {URGENCY_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setUrgency(opt)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium ${urgency === opt ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* 저장 버튼 - 모달 내부 하단 고정 */}
        <div className="p-4 border-t border-gray-100 bg-white flex-shrink-0">
          <button
            onClick={handleSubmit}
            className={`w-full py-3 rounded-xl text-white font-bold text-base ${
              isFixedCategory ? 'bg-green-500' : 'bg-blue-500'
            }`}
          >
            {isFixedCategory ? '💰 고정지출 저장하기' : '저장하기'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManualInputModal;
