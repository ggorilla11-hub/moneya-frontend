// src/pages/spend/SpendTimeline.tsx
// v2.0: 헤더를 오늘/달력/통계 탭으로 변경
// ★★★ 변경사항 ★★★
// 1. 헤더의 "지출/감정저축/저축" 뱃지 → "오늘/달력/통계" 탭으로 변경
// 2. 오늘 탭 = 기존 타임라인 펼침/접힘 (기능 100% 유지)
// 3. 달력/통계 클릭 시 onTabChange 콜백으로 부모에 알림
// 4. ∨ 꺽쇠 기존 기능 그대로 유지

import { useState, useEffect } from 'react';
import { useSpend } from '../../context/SpendContext';
import { inferCategory, getCategoryInfo, getEmotionColor } from '../../utils/categoryUtils';

interface SpendTimelineProps {
  autoExpand?: boolean;
  onExpandComplete?: () => void;
  // ★★★ v2.0: 탭 전환 콜백 추가 ★★★
  activeTab?: 'today' | 'calendar' | 'stats';
  onTabChange?: (tab: 'today' | 'calendar' | 'stats') => void;
}

function SpendTimeline({ autoExpand, onExpandComplete, activeTab = 'today', onTabChange }: SpendTimelineProps) {
  const { spendItems, deleteSpendItem } = useSpend();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFullView, setShowFullView] = useState(false);

  // 자동 펼침 처리
  useEffect(() => {
    if (autoExpand) {
      setIsExpanded(true);
      if (onExpandComplete) {
        onExpandComplete();
      }
    }
  }, [autoExpand, onExpandComplete]);

  // 오늘 날짜
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 7일 전 날짜
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 6);

  // 오늘 데이터
  const todayItems = spendItems.filter(item => {
    const itemDate = new Date(item.timestamp);
    itemDate.setHours(0, 0, 0, 0);
    return itemDate.getTime() === today.getTime();
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // 최근 7일 데이터 (오늘 포함)
  const weekItems = spendItems.filter(item => {
    const itemDate = new Date(item.timestamp);
    itemDate.setHours(0, 0, 0, 0);
    return itemDate >= weekAgo && itemDate <= today;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // 오늘 목록에서 최대 5개만 표시
  const displayItems = todayItems.slice(0, 5);
  const hasMoreToday = todayItems.length > 5;

  const formatTime = (date: Date) => {
    const d = new Date(date);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[d.getDay()];
    return `${month}/${day}(${weekday})`;
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

  const handleDelete = (id: string, memo: string) => {
    if (window.confirm(`"${memo}" 기록을 삭제하시겠습니까?`)) {
      deleteSpendItem(id);
    }
  };

  // ★★★ v2.0: 탭 클릭 핸들러 ★★★
  const handleTabClick = (tab: 'today' | 'calendar' | 'stats') => {
    if (onTabChange) {
      onTabChange(tab);
    }
    // 오늘 탭이면 타임라인 펼침 토글
    if (tab === 'today' && activeTab === 'today') {
      setIsExpanded(!isExpanded);
    }
  };

  // 7일 합계 계산
  const weekSpent = weekItems.filter(item => item.type === 'spent').reduce((sum, item) => sum + item.amount, 0);
  const weekSaved = weekItems.filter(item => item.type === 'saved').reduce((sum, item) => sum + item.amount, 0);

  // 날짜별 그룹핑
  const groupByDate = (items: typeof weekItems) => {
    const groups: { [key: string]: typeof weekItems } = {};
    items.forEach(item => {
      const dateKey = formatDate(new Date(item.timestamp));
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(item);
    });
    return groups;
  };

  // 아이템 렌더링 컴포넌트
  const renderItem = (item: typeof spendItems[0], isNew: boolean = false) => {
    const style = getTypeStyle(item.type);
    const category = inferCategory(item.memo, item.category);
    const categoryInfo = getCategoryInfo(category);
    const emotionColor = item.emotionType ? getEmotionColor(item.emotionType) : null;

    return (
      <div
        key={item.id}
        className={`flex items-center gap-3 py-2 px-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded-lg transition-colors group ${isNew ? 'bg-blue-50 animate-pulse' : ''}`}
      >
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${categoryInfo.bgColor}`}>
          <span className="text-lg">{categoryInfo.icon}</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm truncate">{item.memo}</p>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-0.5">
            <span>{formatTime(new Date(item.timestamp))}</span>
            <span>·</span>
            {emotionColor ? (
              <span className={`px-1.5 py-0.5 rounded font-medium ${emotionColor.bg} ${emotionColor.text}`}>
                {item.emotionType}
              </span>
            ) : (
              <span className={`px-1.5 py-0.5 rounded font-medium ${categoryInfo.bgColor} ${categoryInfo.textColor}`}>
                {category}
              </span>
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
  };

  return (
    <>
      {/* 메인 타임라인 */}
      <div className="mx-4 mt-3 bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        {/* ★★★ v2.0: 헤더 - 오늘/달력/통계 탭 ★★★ */}
        <div className="p-3 flex items-center">
          {/* 오늘 탭 */}
          <button
            onClick={() => handleTabClick('today')}
            className={`font-bold mr-2 text-sm px-2.5 py-1 rounded-lg transition-all active:scale-95
              ${activeTab === 'today' ? 'text-white bg-blue-500' : 'text-gray-500 bg-gray-100'}
            `}
          >
            📊 오늘
          </button>
          
          {/* 달력 탭 */}
          <button
            onClick={() => handleTabClick('calendar')}
            className={`font-bold mr-2 text-sm px-2.5 py-1 rounded-lg transition-all active:scale-95
              ${activeTab === 'calendar' ? 'text-white bg-blue-500' : 'text-gray-500 bg-gray-100'}
            `}
          >
            📅 달력
          </button>
          
          {/* 통계 탭 */}
          <button
            onClick={() => handleTabClick('stats')}
            className={`font-bold text-sm px-2.5 py-1 rounded-lg transition-all active:scale-95
              ${activeTab === 'stats' ? 'text-white bg-blue-500' : 'text-gray-500 bg-gray-100'}
            `}
          >
            📊 통계
          </button>
          
          <div className="flex-1" />
          
          {/* ∨ 꺽쇠 - 오늘 탭일 때만 동작 */}
          <div
            onClick={() => { if (activeTab === 'today') setIsExpanded(!isExpanded); }}
            className={`w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center transition-transform cursor-pointer active:scale-95
              ${isExpanded && activeTab === 'today' ? 'rotate-180' : ''}
              ${activeTab !== 'today' ? 'opacity-30' : ''}
            `}
          >
            <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
            </svg>
          </div>
        </div>

        {/* 펼쳐지는 목록 (오늘 탭일 때만 표시) */}
        {activeTab === 'today' && (
          <div className={`border-t border-gray-100 overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96' : 'max-h-0'}`}>
            <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
              {displayItems.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <div className="text-2xl mb-2">📝</div>
                  <p className="text-sm">아직 오늘 기록이 없어요</p>
                  <p className="text-xs mt-1">+ 버튼을 눌러 지출을 기록해보세요</p>
                </div>
              ) : (
                <>
                  {displayItems.map((item, index) => renderItem(item, index === 0 && autoExpand))}
                  
                  {(hasMoreToday || weekItems.length > 0) && (
                    <button
                      onClick={() => setShowFullView(true)}
                      className="w-full py-2 mt-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      📋 전체 내역 보기 ({weekItems.length}건) &gt;
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 전체 내역 모달 (7일) */}
      {showFullView && (
        <div className="fixed inset-0 bg-black/50 z-[100]" onClick={() => setShowFullView(false)}>
          <div 
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[24px] z-[101]"
            onClick={(e) => e.stopPropagation()}
            style={{ height: '80vh' }}
          >
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-800">📋 최근 7일 내역</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  지출 -₩{weekSpent.toLocaleString()} · 감정저축 +₩{weekSaved.toLocaleString()}
                </p>
              </div>
              <button onClick={() => setShowFullView(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-gray-500 text-lg">✕</span>
              </button>
            </div>

            <div className="overflow-y-auto p-4" style={{ height: 'calc(80vh - 80px)' }}>
              {weekItems.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-4xl mb-3">📭</div>
                  <p className="text-base">최근 7일간 기록이 없어요</p>
                </div>
              ) : (
                Object.entries(groupByDate(weekItems)).map(([date, items]) => (
                  <div key={date} className="mb-4">
                    <div className="sticky top-0 bg-white py-2 border-b border-gray-100 mb-2">
                      <span className="text-sm font-bold text-gray-700">{date}</span>
                      <span className="text-xs text-gray-400 ml-2">
                        {items.length}건 · -₩{items.filter(i => i.type === 'spent').reduce((s, i) => s + i.amount, 0).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {items.map((item) => {
                        const style = getTypeStyle(item.type);
                        const category = inferCategory(item.memo, item.category);
                        const categoryInfo = getCategoryInfo(category);
                        const emotionColor = item.emotionType ? getEmotionColor(item.emotionType) : null;
                        
                        return (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 py-2 px-3 bg-gray-50 rounded-xl"
                          >
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${categoryInfo.bgColor}`}>
                              <span className="text-lg">{categoryInfo.icon}</span>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-800 text-sm truncate">{item.memo}</p>
                              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-0.5">
                                <span>{formatTime(new Date(item.timestamp))}</span>
                                <span>·</span>
                                {emotionColor ? (
                                  <span className={`px-1.5 py-0.5 rounded font-medium ${emotionColor.bg} ${emotionColor.text}`}>
                                    {item.emotionType}
                                  </span>
                                ) : (
                                  <span className={`px-1.5 py-0.5 rounded font-medium ${categoryInfo.bgColor} ${categoryInfo.textColor}`}>
                                    {category}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <span className={`font-bold text-sm whitespace-nowrap ${style.text}`}>
                              {style.sign}₩{item.amount.toLocaleString()}
                            </span>
                            
                            <button
                              onClick={() => handleDelete(item.id, item.memo)}
                              className="w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SpendTimeline;
