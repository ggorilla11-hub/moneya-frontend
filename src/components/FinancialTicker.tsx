// src/components/FinancialTicker.tsx
// AI머니야 상단 티커 - 블룸버그/증권사 스타일
// v2.0 - 검정 바탕 + 형광 초록 + 빠른 속도

import { useState, useEffect, useMemo } from 'react';

// ═══════════════════════════════════════════════════════════
// 📊 티커 데이터
// ═══════════════════════════════════════════════════════════

const QUOTES = [
  { text: "복리는 세계 8번째 불가사의다", author: "아인슈타인" },
  { text: "남들이 탐욕스러울 때 두려워하라", author: "버핏" },
  { text: "시장은 단기 투표기계, 장기 저울이다", author: "그레이엄" },
  { text: "자신이 아는 것에 투자하라", author: "피터 린치" },
  { text: "큰 부는 기다릴 때 만들어진다", author: "찰리 멍거" },
  { text: "투자는 마라톤이다", author: "존 보글" },
  { text: "월급은 생존, 투자는 자유다", author: "격언" },
];

const MARKETS = [
  { name: "KOSPI", price: "2,687.42", change: "+1.23%", up: true },
  { name: "S&P500", price: "6,012.88", change: "-0.45%", up: false },
  { name: "NASDAQ", price: "19,245.67", change: "+0.82%", up: true },
  { name: "USD/KRW", price: "1,342.50", change: "-0.31%", up: false },
  { name: "BTC", price: "$96,842", change: "+2.14%", up: true },
];

const QUESTIONS = [
  "은퇴 후 월 얼마면 행복할까요?",
  "6개월 버틸 비상자금 있나요?",
  "10년 후 순자산 목표는?",
  "저축이 목표 달성에 충분한가요?",
];

// ═══════════════════════════════════════════════════════════
// 🎯 고객 데이터 로드
// ═══════════════════════════════════════════════════════════

interface CustomerData {
  name: string;
  wealthIndex: number;
  netAssets: number;
  savings: number;
  pension: number;
  desireStage: string;
}

const loadCustomerData = (): CustomerData | null => {
  try {
    const fr = localStorage.getItem('financialResult');
    const ab = localStorage.getItem('adjustedBudget');
    const dd = localStorage.getItem('desireRoadmapData');
    
    if (!fr) return null;
    
    const f = JSON.parse(fr);
    const a = ab ? JSON.parse(ab) : null;
    const d = dd ? JSON.parse(dd) : null;
    
    return {
      name: f.name || '고객',
      wealthIndex: f.wealthIndex || 0,
      netAssets: (f.assets || 0) - (f.debt || 0),
      savings: a?.savings || 0,
      pension: a?.pension || 0,
      desireStage: d?.currentStage || 'D',
    };
  } catch {
    return null;
  }
};

// ═══════════════════════════════════════════════════════════
// 🏗️ 티커 아이템 생성
// ═══════════════════════════════════════════════════════════

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const generateItems = (c: CustomerData | null): React.ReactNode[] => {
  const items: React.ReactNode[] = [];
  
  // 시장지수
  shuffle(MARKETS).forEach(m => {
    items.push(
      <span key={`m-${m.name}`} className="inline-flex items-center gap-1.5">
        <span className="text-[#00FF88] font-bold">{m.name}</span>
        <span className="font-mono text-white">{m.price}</span>
        <span className={m.up ? 'text-[#00FF88]' : 'text-[#FF4466]'}>
          {m.up ? '▲' : '▼'}{m.change}
        </span>
      </span>
    );
  });
  
  // 명언
  shuffle(QUOTES).slice(0, 3).forEach((q, i) => {
    items.push(
      <span key={`q-${i}`} className="inline-flex items-center gap-1.5">
        <span className="text-[#00FF88]">💡</span>
        <span className="text-[#00FF88] italic">"{q.text}"</span>
        <span className="text-[#00CC6A] text-xs">-{q.author}</span>
      </span>
    );
  });
  
  // 고객 데이터
  if (c) {
    const netMan = Math.round(c.netAssets / 10000);
    items.push(
      <span key="c-wealth" className="inline-flex items-center gap-1.5">
        <span className="text-[#FFD700]">💎</span>
        <span className="text-[#00FF88]">{c.name}님 부자지수</span>
        <span className="font-mono font-bold text-[#00FFFF]">{c.wealthIndex}점</span>
      </span>
    );
    items.push(
      <span key="c-net" className="inline-flex items-center gap-1.5">
        <span className="text-[#00FF88]">📊</span>
        <span className="text-[#00FF88]">순자산</span>
        <span className="font-mono font-bold text-[#FFD700]">{netMan.toLocaleString()}만원</span>
      </span>
    );
    if (c.savings + c.pension > 0) {
      items.push(
        <span key="c-save" className="inline-flex items-center gap-1.5">
          <span className="text-[#00FF88]">💰</span>
          <span className="text-[#00FF88]">월 저축+연금</span>
          <span className="font-mono font-bold text-[#00FF88]">{(c.savings + c.pension).toLocaleString()}만원</span>
        </span>
      );
    }
  }
  
  // 질문
  shuffle(QUESTIONS).slice(0, 2).forEach((q, i) => {
    items.push(
      <span key={`qu-${i}`} className="inline-flex items-center gap-1.5">
        <span className="bg-[#00FF88] text-black text-[10px] font-black px-1 rounded">Q</span>
        <span className="text-[#00FF88]">{q}</span>
      </span>
    );
  });
  
  return shuffle(items);
};

// ═══════════════════════════════════════════════════════════
// 🎨 메인 컴포넌트
// ═══════════════════════════════════════════════════════════

export default function FinancialTicker() {
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  
  useEffect(() => {
    setCustomer(loadCustomerData());
    const interval = setInterval(() => setCustomer(loadCustomerData()), 300000);
    return () => clearInterval(interval);
  }, []);
  
  const items = useMemo(() => generateItems(customer), [customer]);
  const doubled = [...items, ...items];
  
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-9 bg-black overflow-hidden border-b border-[#00FF88]/30">
      {/* 글로우 라인 */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#00FF88] shadow-[0_0_10px_#00FF88,0_0_20px_#00FF88]" />
      
      {/* 티커 트랙 */}
      <div className="flex items-center h-full whitespace-nowrap ticker-scroll">
        {doubled.map((item, i) => (
          <div key={i} className="inline-flex items-center px-5 h-9 text-[13px] border-r border-[#00FF88]/20">
            {item}
          </div>
        ))}
      </div>
      
      <style>{`
        .ticker-scroll {
          animation: scroll 35s linear infinite;
        }
        .ticker-scroll:hover {
          animation-play-state: paused;
        }
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
