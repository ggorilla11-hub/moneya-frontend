// src/components/CalendarView.tsx
// v1.0: 달력형 지출/예산 뷰 + 통계 탭
// ★★★ 신규 파일 ★★★
// - 달력 그리드: 각 날짜별 지출금액 + 상태 도트 표시
// - 날짜 클릭 시 상세 지출 내역 + 일예산 대비 비교 바
// - 월간 요약 (총 지출, 월 예산, 남은 예산)
// - 예산 소진률 프로그레스 바
// - 통계: 종합현황, 일별추이, 카테고리별, 주간비교, AI인사이트

import { useState, useCallback, useMemo } from 'react';
import { useSpend } from '../context/SpendContext';

interface CalendarViewProps {
  dailyBudget: number;
  monthlyBudget: number;
}

// ★ 요일 이름
const WEEKDAY_NAMES = ['일','월','화','수','목','금','토'];

// ★ 카테고리 색상/아이콘 맵
const CAT_META: Record<string, { color: string; icon: string }> = {
  '식비': { color: '#F59E0B', icon: '🍚' },
  '카페': { color: '#8B5CF6', icon: '☕' },
  '교통': { color: '#3B82F6', icon: '🚌' },
  '쇼핑': { color: '#EC4899', icon: '👕' },
  '의료': { color: '#EF4444', icon: '🏥' },
  '생활용품': { color: '#22C55E', icon: '🛒' },
  '여가': { color: '#F97316', icon: '🎬' },
  '교육': { color: '#06B6D4', icon: '📚' },
  '저축투자': { color: '#22C55E', icon: '💰' },
  '충동': { color: '#A855F7', icon: '🛑' },
  '필수': { color: '#6B7280', icon: '📌' },
  '기타': { color: '#9CA3AF', icon: '📦' },
};

function getCatMeta(cat: string) {
  return CAT_META[cat] || CAT_META['기타'];
}

function CalendarView({ dailyBudget, monthlyBudget }: CalendarViewProps) {
  const { spendItems } = useSpend();
  
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());
  const [activeSubTab, setActiveSubTab] = useState<'calendar' | 'stats'>('calendar');
  const [statsPeriod, setStatsPeriod] = useState<'week' | 'month' | 'lastMonth'>('month');

  const isCurrentMonth = currentYear === today.getFullYear() && currentMonth === today.getMonth() + 1;
  const todayDate = isCurrentMonth ? today.getDate() : 0;

  // ★ 해당 월의 일수, 시작 요일
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();

  // ★ 해당 월의 지출 데이터를 날짜별로 그룹핑
  const dailyExpenses = useMemo(() => {
    const map: Record<number, { total: number; items: typeof spendItems }> = {};
    
    spendItems.forEach(item => {
      const itemDate = new Date(item.createdAt);
      if (itemDate.getFullYear() === currentYear && itemDate.getMonth() + 1 === currentMonth) {
        // 지출(spent)만 집계 (참은것, 투자는 제외)
        if (item.type === 'spent') {
          const day = itemDate.getDate();
          if (!map[day]) map[day] = { total: 0, items: [] };
          map[day].total += item.amount;
          map[day].items.push(item);
        }
      }
    });
    
    return map;
  }, [spendItems, currentYear, currentMonth]);

  // ★ 월간 총 지출
  const monthTotalSpent = useMemo(() => {
    return Object.values(dailyExpenses).reduce((sum, d) => sum + d.total, 0);
  }, [dailyExpenses]);

  const monthRemain = monthlyBudget - monthTotalSpent;
  const progressPct = monthlyBudget > 0 ? (monthTotalSpent / monthlyBudget * 100) : 0;
  const dayProgressPct = daysInMonth > 0 ? (todayDate / daysInMonth * 100) : 0;

  // ★ 월 이동
  const prevMonth = () => {
    if (currentMonth === 1) { setCurrentYear(y => y - 1); setCurrentMonth(12); }
    else setCurrentMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (currentMonth === 12) { setCurrentYear(y => y + 1); setCurrentMonth(1); }
    else setCurrentMonth(m => m + 1);
    setSelectedDay(null);
  };

  // ★ 날짜 선택
  const handleDayClick = useCallback((day: number) => {
    if (isCurrentMonth && day > todayDate) return; // 미래 선택 불가
    setSelectedDay(day);
  }, [isCurrentMonth, todayDate]);

  // ★ 포맷 함수
  const fmt = (n: number) => n.toLocaleString();
  const fmtShort = (n: number) => n >= 10000 ? Math.round(n / 10000) + '만' : fmt(n);

  // ★ 통계용 데이터
  const statsData = useMemo(() => {
    const catTotals: Record<string, number> = {};
    let totalAll = 0;
    let daysUnderBudget = 0;
    let daysOverBudget = 0;
    const dailyAmounts: { day: number; amount: number }[] = [];

    for (let d = 1; d <= (isCurrentMonth ? todayDate : daysInMonth); d++) {
      const exp = dailyExpenses[d];
      const spent = exp ? exp.total : 0;
      dailyAmounts.push({ day: d, amount: spent });
      
      if (spent > 0) {
        if (spent <= dailyBudget) daysUnderBudget++;
        else daysOverBudget++;
        
        exp?.items.forEach(item => {
          const cat = item.category || '기타';
          catTotals[cat] = (catTotals[cat] || 0) + item.amount;
          totalAll += item.amount;
        });
      } else {
        daysUnderBudget++; // 지출 없는 날도 절약
      }
    }

    const activeDays = isCurrentMonth ? todayDate : daysInMonth;
    const avgDaily = activeDays > 0 ? Math.round(totalAll / activeDays) : 0;
    const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);

    return { catTotals, totalAll, daysUnderBudget, daysOverBudget, avgDaily, sortedCats, dailyAmounts, activeDays };
  }, [dailyExpenses, dailyBudget, isCurrentMonth, todayDate, daysInMonth]);

  // ===================== 달력 뷰 렌더링 =====================
  const renderCalendar = () => (
    <div className="px-4 py-3">
      {/* 월 네비게이션 */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-sm active:scale-95">◀</button>
        <span className="text-base font-bold text-gray-800">{currentYear}년 {currentMonth}월</span>
        <button onClick={nextMonth} className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-sm active:scale-95">▶</button>
      </div>

      {/* 월간 요약 카드 */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-gray-50 rounded-xl p-2.5 text-center">
          <div className="text-[10px] text-gray-500 font-medium mb-1">이번 달 지출</div>
          <div className="text-sm font-bold text-red-500">{fmt(monthTotalSpent)}원</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-2.5 text-center">
          <div className="text-[10px] text-gray-500 font-medium mb-1">월 예산</div>
          <div className="text-sm font-bold text-blue-500">{fmt(monthlyBudget)}원</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-2.5 text-center">
          <div className="text-[10px] text-gray-500 font-medium mb-1">남은 예산</div>
          <div className="text-sm font-bold text-green-500">{fmt(Math.max(0, monthRemain))}원</div>
        </div>
      </div>

      {/* 예산 소진률 */}
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <span className="text-xs text-gray-500 font-medium">예산 소진률</span>
          <span className="text-xs text-gray-500 font-medium">{progressPct.toFixed(1)}%</span>
        </div>
        <div className="h-2.5 bg-gray-200 rounded-full relative overflow-visible">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(progressPct, 100)}%`,
              background: progressPct < dayProgressPct
                ? 'linear-gradient(90deg, #22C55E, #4ADE80)'
                : 'linear-gradient(90deg, #F59E0B, #EF4444)',
            }}
          />
          {isCurrentMonth && (
            <div
              className="absolute top-[-3px] w-0.5 h-4 bg-gray-700 rounded-sm"
              style={{ left: `${dayProgressPct}%` }}
              title="오늘 기준"
            />
          )}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-gray-400">1일</span>
          <span className={`text-[10px] font-semibold ${progressPct < dayProgressPct ? 'text-green-500' : 'text-red-500'}`}>
            {progressPct < dayProgressPct ? '✅ 예산 여유' : '⚠️ 기준선 초과'}
          </span>
          <span className="text-[9px] text-gray-400">{daysInMonth}일</span>
        </div>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAY_NAMES.map((name, i) => (
          <div key={name} className={`text-center text-[10px] font-semibold py-1 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>
            {name}
          </div>
        ))}
      </div>

      {/* 달력 그리드 */}
      <div className="grid grid-cols-7 gap-0.5">
        {/* 빈 칸 */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        
        {/* 날짜 */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dow = (firstDayOfMonth + i) % 7;
          const isToday = day === todayDate && isCurrentMonth;
          const isSelected = day === selectedDay && !isToday;
          const isFuture = isCurrentMonth && day > todayDate;
          
          const exp = dailyExpenses[day];
          const spent = exp ? exp.total : 0;
          const ratio = dailyBudget > 0 ? spent / dailyBudget : 0;
          
          let amtClass = 'text-gray-300';
          let dotColor = '';
          
          if (!isFuture) {
            if (spent === 0) { dotColor = 'bg-green-400'; }
            else if (ratio <= 0.8) { amtClass = 'text-green-500'; dotColor = 'bg-green-400'; }
            else if (ratio <= 1.0) { amtClass = 'text-green-500'; dotColor = 'bg-amber-400'; }
            else { amtClass = 'text-red-500'; dotColor = 'bg-red-400'; }
          }

          return (
            <div
              key={day}
              onClick={() => !isFuture && handleDayClick(day)}
              className={`aspect-square flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all
                ${isToday ? 'bg-blue-500' : ''}
                ${isSelected ? 'bg-blue-50 ring-2 ring-blue-500' : ''}
                ${isFuture ? 'opacity-30' : 'active:scale-95'}
              `}
            >
              <span className={`text-xs font-semibold leading-none mb-0.5
                ${isToday ? 'text-white' : dow === 0 ? 'text-red-400' : dow === 6 ? 'text-blue-400' : 'text-gray-700'}
              `}>
                {day}
              </span>
              {!isFuture && (
                <span className={`text-[8px] font-bold leading-none ${isToday ? 'text-white/80' : amtClass}`}>
                  {spent === 0 ? '₩0' : fmtShort(spent)}
                </span>
              )}
              {dotColor && !isFuture && (
                <div className={`w-1 h-1 rounded-full mt-0.5 ${dotColor} ${isToday ? 'ring-1 ring-white' : ''}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* 선택된 날짜 상세 */}
      {selectedDay && renderDayDetail(selectedDay)}
    </div>
  );

  // ===================== 날짜 상세 렌더링 =====================
  const renderDayDetail = (day: number) => {
    const exp = dailyExpenses[day];
    const spent = exp ? exp.total : 0;
    const items = exp ? exp.items : [];
    const isOver = spent > dailyBudget;
    const diff = Math.abs(spent - dailyBudget);
    const fillPct = dailyBudget > 0 ? Math.min((spent / dailyBudget) * 100, 100) : 0;
    const fillColor = isOver ? '#EF4444' : spent / dailyBudget > 0.8 ? '#F59E0B' : '#22C55E';
    const dow = WEEKDAY_NAMES[(firstDayOfMonth + day - 1) % 7];

    return (
      <div className="mt-3 bg-white border border-gray-200 rounded-2xl p-3.5 shadow-sm animate-[slideUp_0.25s_ease]">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-sm font-bold text-gray-800">{currentMonth}월 {day}일 ({dow})</span>
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full
            ${spent === 0 ? 'bg-blue-100 text-blue-700' : isOver ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}
          `}>
            {spent === 0 ? '🎉 지출 없음' : isOver ? `🔴 ${fmt(diff)}원 초과` : `🟢 ${fmt(diff)}원 절약`}
          </span>
        </div>

        {/* 일예산 대비 바 */}
        <div className="bg-gray-50 rounded-xl p-2.5 mb-2.5">
          <div className="flex justify-between mb-1">
            <span className="text-[11px] text-gray-500 font-medium">지출 ₩{fmt(spent)}</span>
            <span className="text-[11px] text-gray-500 font-medium">일예산 ₩{fmt(dailyBudget)}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${fillPct}%`, backgroundColor: fillColor }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className={`text-[10px] font-semibold ${isOver ? 'text-red-500' : 'text-green-500'}`}>
              {isOver ? `⚠️ ${fmt(Math.abs(dailyBudget - spent))}원 초과` : spent === 0 ? `✅ ${fmt(dailyBudget)}원 남음` : `✅ ${fmt(dailyBudget - spent)}원 남음`}
            </span>
            <span className="text-[10px] text-gray-400">{spent > 0 ? Math.round(spent / dailyBudget * 100) + '% 사용' : '0% 사용'}</span>
          </div>
        </div>

        {/* 지출 내역 */}
        <div className="text-xs font-semibold text-gray-700 mb-2">💳 지출 내역 {items.length > 0 ? `(${items.length}건)` : ''}</div>
        
        {items.length === 0 ? (
          <div className="text-center py-5">
            <div className="text-3xl mb-2">🎉</div>
            <div className="text-sm font-semibold text-gray-700">지출 없는 완벽한 하루!</div>
            <div className="text-[11px] text-gray-400 mt-1">일예산 ₩{fmt(dailyBudget)} 전액 절약했어요</div>
          </div>
        ) : (
          <div className="space-y-1.5">
            {items.map(item => {
              const meta = getCatMeta(item.category);
              const itemTime = new Date(item.createdAt);
              const timeStr = `${String(itemTime.getHours()).padStart(2,'0')}:${String(itemTime.getMinutes()).padStart(2,'0')}`;
              return (
                <div key={item.id} className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-xl">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base" style={{ backgroundColor: meta.color + '20' }}>
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-800 truncate">{item.memo || item.category}</div>
                    <div className="text-[10px] text-gray-400">{item.category} · {timeStr}</div>
                  </div>
                  <div className="text-sm font-bold text-red-500 flex-shrink-0">-₩{fmt(item.amount)}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ===================== 통계 뷰 렌더링 =====================
  const renderStats = () => {
    const { totalAll, daysUnderBudget, daysOverBudget, avgDaily, sortedCats, dailyAmounts, activeDays } = statsData;
    const maxDailySpent = Math.max(...dailyAmounts.map(d => d.amount), dailyBudget);

    return (
      <div className="px-4 py-3 space-y-3">
        {/* 기간 선택 */}
        <div className="flex gap-1.5">
          {[
            { key: 'week' as const, label: '이번 주' },
            { key: 'month' as const, label: '이번 달' },
            { key: 'lastMonth' as const, label: '지난 달' },
          ].map(p => (
            <button
              key={p.key}
              onClick={() => setStatsPeriod(p.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95
                ${statsPeriod === p.key ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200 text-gray-500'}
              `}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* 종합 현황 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">📊 종합 현황</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-[10px] text-gray-500 mb-1">총 지출</div>
              <div className="text-lg font-extrabold text-red-500">{fmt(totalAll)}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-[10px] text-gray-500 mb-1">일평균 지출</div>
              <div className="text-lg font-extrabold text-gray-800">{fmt(avgDaily)}</div>
              <div className="text-[10px] text-green-500 font-semibold mt-0.5">일예산 대비 {dailyBudget > 0 ? Math.round(avgDaily / dailyBudget * 100) : 0}%</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-[10px] text-gray-500 mb-1">절약한 날</div>
              <div className="text-lg font-extrabold text-green-500">{daysUnderBudget}<span className="text-xs">일</span></div>
              <div className="text-[10px] text-gray-400">{activeDays}일 중</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-[10px] text-gray-500 mb-1">초과한 날</div>
              <div className="text-lg font-extrabold text-red-500">{daysOverBudget}<span className="text-xs">일</span></div>
              <div className="text-[10px] text-gray-400">{activeDays}일 중</div>
            </div>
          </div>
        </div>

        {/* 일별 지출 추이 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">📈 일별 지출 추이</div>
          <div className="relative h-28">
            {/* 일예산 기준선 */}
            <div
              className="absolute left-0 right-0 border-t-2 border-dashed border-amber-400 z-[1]"
              style={{ top: `${Math.max(0, 100 - (dailyBudget / (maxDailySpent * 1.2) * 100))}%` }}
            >
              <span className="absolute right-0 -top-3.5 text-[8px] text-amber-500 font-semibold">일예산 {fmtShort(dailyBudget)}</span>
            </div>
            {/* 막대 차트 */}
            <div className="flex items-end gap-px h-24">
              {dailyAmounts.slice(-14).map(({ day, amount }) => {
                const h = maxDailySpent > 0 ? (amount / (maxDailySpent * 1.2)) * 100 : 0;
                const color = amount > dailyBudget ? '#EF4444' : amount / dailyBudget > 0.8 ? '#F59E0B' : '#22C55E';
                return (
                  <div key={day} className="flex-1 flex flex-col items-center justify-end h-full">
                    <div className="w-full rounded-t min-h-[2px]" style={{ height: `${Math.max(h, 2)}%`, backgroundColor: color }} />
                    <div className="text-[7px] text-gray-400 font-semibold mt-0.5">{day}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 카테고리별 지출 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">🏷️ 카테고리별 지출</div>
          {sortedCats.length === 0 ? (
            <div className="text-center py-4 text-sm text-gray-400">지출 데이터가 없습니다</div>
          ) : (
            <div className="space-y-2.5">
              {sortedCats.map(([cat, amount]) => {
                const pct = totalAll > 0 ? (amount / totalAll * 100) : 0;
                const meta = getCatMeta(cat);
                return (
                  <div key={cat}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-gray-700 flex items-center gap-1">{meta.icon} {cat}</span>
                      <span className="text-xs font-bold text-gray-800">{fmt(amount)}원 <span className="text-gray-400 font-medium">{pct.toFixed(1)}%</span></span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: meta.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* AI 인사이트 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">🤖 AI 인사이트</div>
          
          {sortedCats.length > 0 && (
            <div className="space-y-2">
              {/* 가장 큰 카테고리 */}
              <div className="flex gap-2.5 p-2.5 bg-gray-50 rounded-xl">
                <span className="text-xl flex-shrink-0">{getCatMeta(sortedCats[0][0]).icon}</span>
                <span className="text-xs text-gray-700 leading-relaxed font-medium">
                  <strong className="text-blue-500">{sortedCats[0][0]}</strong>가 전체의 <strong className="text-blue-500">{totalAll > 0 ? (sortedCats[0][1] / totalAll * 100).toFixed(0) : 0}%</strong>로 가장 큰 비중이에요.
                </span>
              </div>
              
              {/* 절약/초과 현황 */}
              <div className="flex gap-2.5 p-2.5 bg-gray-50 rounded-xl">
                <span className="text-xl flex-shrink-0">🎉</span>
                <span className="text-xs text-gray-700 leading-relaxed font-medium">
                  {activeDays}일 중 <strong className="text-green-500">{daysUnderBudget}일</strong>을 일예산 이내로 사용했어요!
                  {daysUnderBudget > daysOverBudget && ' 잘하고 계세요! 👏'}
                </span>
              </div>
              
              {/* 평균 비교 */}
              <div className="flex gap-2.5 p-2.5 bg-gray-50 rounded-xl">
                <span className="text-xl flex-shrink-0">📉</span>
                <span className="text-xs text-gray-700 leading-relaxed font-medium">
                  일평균 지출 <strong className="text-blue-500">₩{fmt(avgDaily)}</strong>으로 일예산 대비 <strong className={avgDaily <= dailyBudget ? 'text-green-500' : 'text-red-500'}>{dailyBudget > 0 ? Math.round(avgDaily / dailyBudget * 100) : 0}%</strong> 수준이에요.
                </span>
              </div>
            </div>
          )}
          
          {sortedCats.length === 0 && (
            <div className="text-center py-4 text-sm text-gray-400">지출 데이터가 쌓이면 인사이트를 제공해요!</div>
          )}
        </div>

        {/* 절약 목표 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">🎯 이번 달 절약 현황</div>
          <div className="text-center py-2">
            <div className={`text-2xl font-extrabold ${monthRemain >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ₩{fmt(Math.abs(monthRemain))}
            </div>
            <div className="text-xs text-gray-500 font-medium mt-1">
              {monthRemain >= 0 ? '현재까지 남은 예산' : '예산 초과 금액'}
            </div>
            <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(progressPct, 100)}%`,
                  background: progressPct <= 80 ? '#22C55E' : progressPct <= 100 ? '#F59E0B' : '#EF4444',
                }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-gray-400">0원</span>
              <span className="text-[10px] text-gray-500 font-semibold">{progressPct.toFixed(0)}% 사용</span>
              <span className="text-[9px] text-gray-400">{fmt(monthlyBudget)}원</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ===================== 메인 렌더링 =====================
  return (
    <div className="flex flex-col h-full">
      {/* 서브 탭 */}
      <div className="flex bg-white border-b border-gray-100 px-4 sticky top-0 z-10">
        <button
          onClick={() => setActiveSubTab('calendar')}
          className={`flex-1 text-center py-2.5 text-xs font-semibold border-b-2 transition-all
            ${activeSubTab === 'calendar' ? 'text-blue-500 border-blue-500' : 'text-gray-400 border-transparent'}
          `}
        >
          📅 달력
        </button>
        <button
          onClick={() => setActiveSubTab('stats')}
          className={`flex-1 text-center py-2.5 text-xs font-semibold border-b-2 transition-all
            ${activeSubTab === 'stats' ? 'text-blue-500 border-blue-500' : 'text-gray-400 border-transparent'}
          `}
        >
          📊 통계
        </button>
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto pb-4">
        {activeSubTab === 'calendar' ? renderCalendar() : renderStats()}
      </div>

      {/* 슬라이드업 애니메이션 */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default CalendarView;
