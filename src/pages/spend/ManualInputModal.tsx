// src/pages/spend/ManualInputModal.tsx
// 수동 입력 모달 - 지출/감정저축 직접 입력 + 고정지출 추가

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

    // 고정지출이면 investment, 감정저축이면 saved, 그 외는 spent
    let spendType: SpendType = activeTab as SpendType;
    if (activeTab === 'spent' && isFixedCategory) {
      spendType = 'investment';
    }

    // 카테고리 이름 찾기
    let categoryName = category;
    if (isFixedCategory) {
      const fixedCat = SPEND_CATEGORIES.fixed.find(c => c.id === category);
      categoryName = fixedCat?.name || category;
    } else {
      const varCat = SPEND_CATEGORIES.variable.find(c => c.id === category);
      categoryName = varCat?.name || category;
    }

    addSpendItem({
      userId: 'default',
      amount: numAmount,
      type: spendType,
      category: categoryName,
      emotionType: activeTab === 'spent' && !isFixedCategory ? emotionType : undefined,
      memo: memo.trim(),
      tag: activeTab === 'saved' ? savedReason : undefined,
      inputMethod: 'manual',
      timestamp: new Date(),
    });

    setAmount('');
    setMemo('');
    setCategory('food');
    setIsFixedCategory(false);
    setEmotionType('선택');
    onClose();
    
    if (activeTab === 'saved') {
      alert('감정저축이 기록되었습니다! 💪');
    } else if (isFixedCategory) {
      alert('고정지출이 기록되었습니다! 🏦');
    } else {
      alert('지출이 기록되었습니다!');
    }
  };

  const formatAmount = (value: string) => {
    const num = value.replace(/[^0-9]/g, '');
    return num ? parseInt(num, 10).toLocaleString() : '';
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100]" onClick={onClose}>
      <div 
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[24px] z-[101]"
        onClick={(e) => e.stopPropagation()}
        style={{ height: '75vh' }}
      >
        {/* 헤더 */}
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">✏️ 수동 입력</h2>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-gray-500 text-lg">✕</span>
          </button>
        </div>

        {/* 탭 */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('spent')}
            className={`flex-1 py-2 text-sm font-bold ${activeTab === 'spent' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-400'}`}
          >
            💸 지출
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-2 text-sm font-bold ${activeTab === 'saved' ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-400'}`}
          >
            💪 감정저축
          </button>
        </div>

        {/* 스크롤 영역 */}
        <div className="overflow-y-auto p-4 space-y-3" style={{ height: 'calc(75vh - 160px)' }}>
          {/* 내용 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">내용</label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder={activeTab === 'spent' ? '예: 점심 김치찌개' : '예: 커피 참음'}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
            />
          </div>

          {/* 금액 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">금액</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₩</span>
              <input
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(formatAmount(e.target.value))}
                placeholder="0"
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold text-right"
              />
            </div>
          </div>

          {/* 지출일 때 */}
          {activeTab === 'spent' && (
            <>
              {/* 카테고리 섹션 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">📁 카테고리</label>
                
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

                {/* 고정지출 (저축) */}
                <p className="text-xs text-gray-400 mb-1">고정지출 (저축)</p>
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

              {/* 감정지출 - 변동지출일 때만 표시 */}
              {!isFixedCategory && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">🧠 이 지출은 어떤 소비인가요?</label>
                  <p className="text-xs text-gray-400 mb-2">(리포트에 반영돼요)</p>
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
                        {type === '충동' ? '🔥' : type === '선택' ? '🤔' : '✅'} {type}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 고정지출 안내 */}
              {isFixedCategory && (
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                  <p className="text-sm text-blue-700 font-medium">💡 고정지출은 순저축에 반영됩니다</p>
                  <p className="text-xs text-blue-500 mt-1">저축투자, 노후연금은 자산 증가로, 보험/대출은 고정비용으로 기록됩니다.</p>
                </div>
              )}
            </>
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

        {/* 저장 버튼 */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
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
