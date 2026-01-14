// src/pages/spend/SpendTimeline.tsx
// 지출 타임라인 - 실제 데이터 연동

import { useState } from 'react';
import { useSpend } from '../../context/SpendContext';

function SpendTimeline() {
  const { getTodayItems, todaySpent, todaySaved, todayInvestment, deleteSpendItem } = useSpend();
  const [isExpanded, setIsExpanded] = useState(false);

  const todayItems = getTodayItems().sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const formatTime = (date: Date) => {
    const d = new Date(date);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'spent':
        return { dot: 'bg-red-500', text: 'text-red-500', sign: '-' };
      case 'saved':
        return { dot: 'bg-green-500', text: 'text-green-600', sign: '+' };
      case 'investment':
        return { dot: 'bg-blue-500', text: 'text-blue-600', sign: '+' };
      default:
        return { dot: 'bg-gray-400', text: 'text-gray-500', sign: '' };
    }
  };

  const getEmotionStyle = (emotionType?: string) => {
    switch (emotionType) {
      case '충동':
        return 'bg-red-50 text-red-600';
      case '선택':
        return 'bg-amber-50 text-amber-600';
      case '필수':
        return 'bg-green-50 text-green-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  const handleDelete = (id: string, memo: string) => {
    if (window.confirm(`"${memo}" 기록을 삭제하시겠습니까?`)) {
      deleteSpendItem(id);
    }
  };

  return (
    <div className="mx-4 mt-3 bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
      {/* 헤더 - 클릭하면 펼침/접힘 */}
      <div
        className="p-3 flex items-center cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="font-bold text-gray-800 mr-2 text-sm">📊 오늘</span>
        <div className="flex gap-1.5 flex-1 overflow-x-auto">
          <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md whitespace-nowrap">
            지출 -₩{todaySpent.toLocaleString()}
          </span>
          <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md whitespace-nowrap">
            참음 +₩{todaySaved.toLocaleString()}
          </span>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md whitespace-nowrap">
            저축 +₩{todayInvestment.toLocaleString()}
          </span>
        </div>
        <div className={`w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
          </svg>
        </div>
      </div>

      {/* 펼쳐지는 목록 */}
      <div className={`border-t border-gray-100 overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-80' : 'max-h-0'}`}>
        <div className="p-3 space-y-2 max-h-72 overflow-y-auto">
          {todayItems.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="text-3xl mb-2">📝</div>
              <p className="text-sm">아직 오늘 기록이 없어요</p>
              <p className="text-xs mt-1">+ 버튼을 눌러 지출을 기록해보세요</p>
            </div>
          ) : (
            todayItems.map((item) => {
              const style = getTypeStyle(item.type);
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 py-2.5 px-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${style.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{item.memo}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-0.5">
                      <span>{formatTime(item.timestamp)}</span>
                      <span>·</span>
                      <span className={`px-1.5 py-0.5 rounded font-medium ${getEmotionStyle(item.emotionType)}`}>
                        {item.emotionType || item.category}
                      </span>
                      {item.tag && (
                        <>
                          <span>·</span>
                          <span>{item.tag}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className={`font-bold text-sm whitespace-nowrap ${style.text}`}>
                    {style.sign}₩{item.amount.toLocaleString()}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id, item.memo);
                    }}
                    className="opacity-0 group-hover:opacity-100 w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-xs hover:bg-red-200 transition-all"
                  >
                    ✕
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default SpendTimeline;
