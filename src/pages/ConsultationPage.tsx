// ConsultationPage.tsx — 상담 머니야 (5번째 탭)
// ⚠️ 기존 4개 탭과 완전히 독립된 파일. 기존 코드 의존성 없음.
// 작성일: 2026-03-05 / develop 브랜치 전용

import { useState, useEffect, useRef } from 'react';
import {
  doc, getDoc, collection, addDoc, getDocs,
  query, orderBy, limit
} from 'firebase/firestore';
import {
  ref, uploadBytes, getDownloadURL
} from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useSubscription } from '../hooks/useSubscription';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ConsultationDoc {
  docType: string;
  fileName: string;
  fileUrl: string;
  uploadDate: Date;
}

interface ConsultationHistory {
  id: string;
  date: string;
  type: string;
  duration: number;
  score: number;
  scores: { f1: number; f2: number; f3: number; f4: number; f5: number; f6: number };
  summary: string;
  tasks: string[];
  reportUrl?: string;
  certificateUrl?: string;
  zoomUrl?: string;
}

interface ConsultationPageProps {
  user: any;
}

const API_URL = import.meta.env.VITE_API_URL || 'https://moneya-server.onrender.com';

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-500';
  return 'text-red-500';
}

function getScoreIcon(score: number): string {
  if (score >= 80) return '✅';
  if (score >= 60) return '⚠️';
  return '🔴';
}

function getSavingsRateColor(rate: number): string {
  if (rate >= 20) return 'text-green-600';
  if (rate >= 10) return 'text-yellow-500';
  return 'text-red-500';
}

function getDebtRatioColor(ratio: number): string {
  if (ratio <= 40) return 'text-green-600';
  if (ratio <= 60) return 'text-yellow-500';
  return 'text-red-500';
}

function getCertGrade(count: number): { grade: string; icon: string; next: string } {
  if (count >= 12) return { grade: 'S등급', icon: '💎', next: '최고 등급 달성!' };
  if (count >= 7) return { grade: 'A등급', icon: '🥇', next: '12회 이상 → S등급' };
  if (count >= 3) return { grade: 'B등급', icon: '🥈', next: '7회 이상 → A등급' };
  if (count >= 1) return { grade: 'C등급', icon: '🥉', next: '3회 이상 → B등급' };
  return { grade: '-', icon: '⬜', next: '첫 상담 후 등급 부여' };
}

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2500);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-gray-800 text-white text-sm px-5 py-3 rounded-full shadow-lg whitespace-nowrap">
      {msg}
    </div>
  );
}

function Modal({ title, content, onClose }: { title: string; content: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <h3 className="font-bold text-gray-900 text-lg mb-3">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{content}</p>
        <button
          onClick={onClose}
          className="mt-5 w-full py-3 rounded-xl font-bold text-white text-sm"
          style={{ background: '#c9a53e' }}
        >
          확인
        </button>
      </div>
    </div>
  );
}

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${score}%`, background: color }}
      />
    </div>
  );
}

function ServiceIntro({ onToast }: { onToast: (msg: string) => void }) {
  const recommendList = [
    '노후 준비가 막막한 분',
    '보험료 정리가 필요한 분',
    '맞벌이 재무설계 고민',
    '저축/투자 방향이 필요한 분',
  ];
  const serviceList: [string, string][] = [
    ['📋', '사전 재무 진단'],
    ['💻', '줌 90분 맞춤 상담'],
    ['📊', '금융집짓기 리포트'],
    ['🏆', '수료증 발급'],
    ['💬', '머니야와 일상 대화'],
  ];

  return (
    <div className="overflow-y-auto h-full pb-6">
      <div className="bg-gradient-to-b from-amber-50 to-white px-5 py-10 text-center">
        <div className="text-5xl mb-4">🏠💰</div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-2">AI 재무설계 상담</h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          오상열 CFP(20년) × AI 머니야가 함께하는<br />맞춤 재무설계 서비스
        </p>
      </div>

      <div className="px-4 space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">이런 분께 추천</p>
          <ul className="space-y-2">
            {recommendList.map(t => (
              <li key={t} className="flex items-center gap-2 text-sm text-gray-700">
                <span className="text-green-500">✅</span>{t}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">서비스 구성</p>
          <ul className="space-y-2">
            {serviceList.map(([icon, text]) => (
              <li key={text} className="flex items-center gap-3 text-sm text-gray-700">
                <span className="text-lg">{icon}</span>{text}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border-2 p-5" style={{ borderColor: '#c9a53e', background: '#fffdf5' }}>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-600">초회 상담</span>
            <span className="text-xl font-extrabold" style={{ color: '#c9a53e' }}>29,000원</span>
          </div>
          <div className="h-px bg-amber-100 mb-3" />
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">정기 관리</span>
            <span className="text-xl font-extrabold" style={{ color: '#c9a53e' }}>월 9,900원</span>
          </div>
        </div>

        <button
          onClick={() => onToast('결제 페이지는 준비 중입니다 🙏')}
          className="w-full py-4 rounded-2xl font-extrabold text-white text-base shadow-lg active:scale-95 transition-transform"
          style={{ background: 'linear-gradient(135deg, #c9a53e, #e8c05a)' }}
        >
          상담 신청하기
        </button>

        <p className="text-center text-gray-400 text-xs leading-relaxed">
          "하루 커피 한 잔 값으로<br />평생 재무설계 완성"
        </p>

        <div className="space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">고객 후기</p>
          {[
            { name: '박○○ (38세)', text: '막연했던 노후 준비가 머니야 덕분에 구체적인 계획이 됐어요!' },
            { name: '이○○ (45세)', text: '보험 정리만으로 매달 12만원을 절약했습니다. 강추!' },
            { name: '최○○ (33세)', text: '맞벌이인데 돈이 왜 안 모이는지 드디어 알았어요 ㅠㅠ' },
          ].map((r, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs font-bold mb-1" style={{ color: '#c9a53e' }}>⭐⭐⭐⭐⭐ {r.name}</p>
              <p className="text-sm text-gray-700 leading-relaxed">{r.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HubDashboard({
  userData, onNav, onToast,
}: {
  userData: any;
  onNav: (tab: string) => void;
  onToast: (msg: string) => void;
}) {
  const scores = userData.consultationScores || {};
  const latestScore = userData.latestScore || 0;
  const nextConsult = userData.nextConsultDate || null;
  const userName = userData.name || userData.displayName || '고객';

  const floorNames = ['1층 기초체력', '2층 안전장치', '3층 부동산', '4층 보장자산', '5층 은퇴설계', '6층 투자성장'];
  const floorScores = [scores.f1 || 0, scores.f2 || 0, scores.f3 || 0, scores.f4 || 0, scores.f5 || 0, scores.f6 || 0];
  let weakestIdx = 0;
  let weakestScore = 100;
  floorScores.forEach((s, i) => {
    if (s < weakestScore) { weakestScore = s; weakestIdx = i; }
  });

  let dDay: number | null = null;
  let isZoomActive = false;
  let consultDateStr = '';
  if (nextConsult) {
    const now = new Date();
    const consult = nextConsult.toDate ? nextConsult.toDate() : new Date(nextConsult);
    const diff = consult.getTime() - now.getTime();
    dDay = Math.ceil(diff / (1000 * 60 * 60 * 24));
    isZoomActive = diff > 0 && diff <= 10 * 60 * 1000;
    consultDateStr = consult.toLocaleDateString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short',
    });
  }

  return (
    <div className="overflow-y-auto h-full px-4 py-4 pb-6 space-y-4">
      <div className="bg-white rounded-2xl border shadow-sm p-4" style={{ borderColor: '#c9a53e' }}>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">다음 정기상담</p>
        {nextConsult ? (
          <>
            <p className="text-base font-bold text-gray-900">📅 {consultDateStr}</p>
            {dDay !== null && (
              <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: '#c9a53e' }}>
                D-{dDay}
              </span>
            )}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => {
                  if (isZoomActive && userData.zoomLink) window.open(userData.zoomLink, '_blank');
                  else onToast('상담 시작 10분 전에 활성화됩니다');
                }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold ${isZoomActive ? 'text-white' : 'bg-gray-100 text-gray-400'}`}
                style={isZoomActive ? { background: '#c9a53e' } : {}}
              >
                💻 줌 입장하기
              </button>
              <button
                onClick={() => onToast('일정 변경은 3일 전까지 가능합니다')}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-gray-50 text-gray-500 border border-gray-200"
              >
                📅 일정변경
              </button>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-400">예정된 상담이 없습니다</p>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">내 금융집 현황</p>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🏠</span>
          <div>
            <span className="text-2xl font-extrabold" style={{ color: '#c9a53e' }}>{latestScore}점</span>
            <div className="w-32 bg-gray-100 rounded-full h-2 mt-1 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${latestScore}%`, background: '#c9a53e' }} />
            </div>
          </div>
        </div>
        {([
          ['1층 기초체력', floorScores[0]],
          ['2층 안전장치', floorScores[1]],
          ['3층 부동산', floorScores[2]],
          ['4층 보장자산', floorScores[3]],
          ['5층 은퇴설계', floorScores[4]],
          ['6층 투자성장', floorScores[5]],
        ] as [string, number][]).map(([label, score]) => (
          <div key={label} className="flex items-center gap-2 mb-2">
            <span className="text-xs">{getScoreIcon(score)}</span>
            <span className="text-xs text-gray-500 w-20 shrink-0">{label}</span>
            <ScoreBar score={score} color={score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444'} />
            <span className={`text-xs font-bold w-6 text-right ${getScoreColor(score)}`}>{score}</span>
          </div>
        ))}
        <button onClick={() => onNav('finance')} className="mt-3 w-full py-2 rounded-xl text-sm text-gray-500 bg-gray-50 border border-gray-100">
          상세 보기 →
        </button>
      </div>

      <div className="bg-gray-50 rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">머니야 메시지</p>
        <div className="flex gap-3">
          <span className="text-2xl">🤖</span>
          <div className="bg-white rounded-xl p-3 text-sm text-gray-700 leading-relaxed shadow-sm flex-1">
            {latestScore > 0
              ? `${userName}님, ${floorNames[weakestIdx]}이 ${weakestScore}점으로 가장 취약합니다. 다음 상담에서 함께 개선해봐요!`
              : `${userName}님, 안녕하세요! 첫 상담을 예약해보세요. 금융집짓기 6단계로 재무를 체계적으로 분석해드립니다.`}
          </div>
        </div>
        <button
          onClick={() => onNav('chat')}
          className="mt-3 w-full py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: '#c9a53e' }}
        >
          대화하기 →
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">최근 활동</p>
        {(userData.recentActivities || []).length > 0 ? (
          userData.recentActivities.slice(0, 3).map((act: any, i: number) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
              <span className="text-xs text-gray-400 w-10 shrink-0">{act.date}</span>
              <span>{act.icon}</span>
              <span className="text-sm text-gray-700">{act.text}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400">아직 활동 내역이 없습니다</p>
        )}
      </div>
    </div>
  );
}

function MyFinance({ userData }: { userData: any }) {
  const income = userData.monthlyIncome || 0;
  const expense = userData.monthlyExpense || 0;
  const netAssets = userData.netAssets || 0;
  const totalDebt = userData.totalDebt || 0;
  const totalAssets = userData.totalAssets || 0;
  const savingsRate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;
  const debtRatio = totalAssets > 0 ? Math.round((totalDebt / totalAssets) * 100) : 0;
  const emergencyFundMonths = userData.emergencyFundMonths || 0;
  const scores = userData.consultationScores || {};
  const goals = userData.monthlyGoals || [];

  return (
    <div className="overflow-y-auto h-full px-4 py-4 pb-6 space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">기본 재무 지표</p>
        {([
          ['순자산', `${netAssets.toLocaleString()}만원`, 'text-gray-900'],
          ['월소득', `${income.toLocaleString()}만원`, 'text-gray-900'],
          ['월지출', `${expense.toLocaleString()}만원`, 'text-gray-900'],
          ['저축률', `${savingsRate}%`, getSavingsRateColor(savingsRate)],
          ['부채비율', `${debtRatio}%`, getDebtRatioColor(debtRatio)],
          ['비상자금', `${emergencyFundMonths}개월분`, emergencyFundMonths >= 6 ? 'text-green-600' : emergencyFundMonths >= 3 ? 'text-yellow-500' : 'text-red-500'],
        ] as [string, string, string][]).map(([label, val, color]) => (
          <div key={label} className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0">
            <span className="text-sm text-gray-500">{label}</span>
            <span className={`text-sm font-bold ${color}`}>{val}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">금융집짓기 6단계 점수</p>
        {([
          ['1층 기초체력', scores.f1 || 0],
          ['2층 안전장치', scores.f2 || 0],
          ['3층 부동산', scores.f3 || 0],
          ['4층 보장자산', scores.f4 || 0],
          ['5층 은퇴설계', scores.f5 || 0],
          ['6층 투자성장', scores.f6 || 0],
        ] as [string, number][]).map(([label, score]) => (
          <div key={label} className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">{label}</span>
              <span className={`text-xs font-bold ${getScoreColor(score)}`}>{getScoreIcon(score)} {score}점</span>
            </div>
            <ScoreBar score={score} color={score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444'} />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">이달의 목표</p>
        {goals.length > 0 ? (
          goals.map((goal: any, i: number) => (
            <div key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
              <span className={goal.done ? 'text-green-500' : 'text-gray-300'}>{goal.done ? '☑' : '☐'}</span>
              <span className={`text-sm ${goal.done ? 'text-green-600 line-through' : 'text-gray-700'}`}>{goal.text}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400">상담 후 목표가 설정됩니다</p>
        )}
      </div>
    </div>
  );
}

function MoneyaChat({ user, userData, onToast }: { user: any; userData: any; onToast: (msg: string) => void }) {
  const userName = userData.name || userData.displayName || user.displayName || '고객';
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `안녕하세요 ${userName}님! AI 재무설계사 머니야입니다.\n오늘 재무 관련 궁금한 것이 있으신가요? 😊`, timestamp: Date.now() },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const quickQuestions = ['저축률 진단', '보험 분석', '은퇴 계산', '투자 조언'];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (msg: string) => {
    if (!msg.trim() || isLoading) return;
    setMessages(prev => [...prev, { role: 'user', content: msg, timestamp: Date.now() }]);
    setInput('');
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          userName,
          financialContext: {
            age: userData.age,
            totalAssets: userData.totalAssets,
            totalDebt: userData.totalDebt,
            netAssets: userData.netAssets,
            monthlyIncome: userData.monthlyIncome,
            monthlyExpense: userData.monthlyExpense,
            wealthIndex: userData.wealthIndex,
            financialLevel: userData.financialLevel,
          },
          budgetInfo: {
            savings: userData.savings,
            investment: userData.investment,
            insurance: userData.insurance,
            pension: userData.pension,
            loanPayment: userData.loanPayment,
          },
          conversationHistory: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.message, timestamp: Date.now() }]);
      } else {
        onToast('잠시 후 다시 시도해주세요');
      }
    } catch {
      onToast('네트워크 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
            {m.role === 'assistant' && <span className="text-xl self-end">🤖</span>}
            <div
              className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'text-white' : 'bg-gray-100 text-gray-800'}`}
              style={m.role === 'user' ? { background: '#c9a53e', borderBottomRightRadius: 4 } : { borderBottomLeftRadius: 4 }}
            >
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2 justify-start">
            <span className="text-xl">🤖</span>
            <div className="bg-gray-100 px-4 py-3 rounded-2xl text-sm text-gray-400">머니야가 생각 중...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
        {quickQuestions.map(q => (
          <button key={q} onClick={() => sendMessage(q)} className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-50 border border-amber-200" style={{ color: '#c9a53e' }}>
            {q}
          </button>
        ))}
      </div>
      <div className="px-4 pb-4 pt-2 flex gap-2 border-t border-gray-100">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
          placeholder="메시지 입력..."
          className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm outline-none focus:border-amber-300"
        />
        <button onClick={() => sendMessage(input)} disabled={!input.trim() || isLoading} className="px-4 py-2.5 rounded-full text-sm font-bold text-white disabled:opacity-40" style={{ background: '#c9a53e' }}>
          전송
        </button>
      </div>
    </div>
  );
}

function Schedule({ userData, onToast }: { userData: any; onToast: (msg: string) => void }) {
  const [checks, setChecks] = useState({ q: true, camera: false, env: false });
  const nextConsult = userData.nextConsultDate;
  const toggleCheck = (k: string) => setChecks(p => ({ ...p, [k]: !p[k as keyof typeof p] }));

  let dDay: number | null = null;
  let isZoomActive = false;
  let consultDateStr = '';
  if (nextConsult) {
    const now = new Date();
    const consult = nextConsult.toDate ? nextConsult.toDate() : new Date(nextConsult);
    const diff = consult.getTime() - now.getTime();
    dDay = Math.ceil(diff / (1000 * 60 * 60 * 24));
    isZoomActive = diff > 0 && diff <= 10 * 60 * 1000;
    consultDateStr = consult.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' })
      + ' ' + consult.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="overflow-y-auto h-full px-4 py-4 pb-6 space-y-4">
      <div className="bg-white rounded-2xl border shadow-sm p-5" style={{ borderColor: '#c9a53e' }}>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">다음 상담</p>
        {nextConsult ? (
          <>
            <p className="text-base font-bold text-gray-900">📅 {consultDateStr}</p>
            <p className="text-sm text-gray-500 mt-1">📍 줌 화상 상담</p>
            {dDay !== null && (
              <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: '#c9a53e' }}>D-{dDay}</span>
            )}
            <div className="mt-4">
              <p className="text-xs text-gray-400 mb-2">준비사항</p>
              {[
                { key: 'q', label: '사전 질문지 작성 완료' },
                { key: 'camera', label: '카메라/마이크 테스트' },
                { key: 'env', label: '조용한 환경 확보' },
              ].map(item => (
                <div key={item.key} onClick={() => toggleCheck(item.key)} className="flex items-center gap-2 py-2 border-b border-gray-50 cursor-pointer">
                  <span className={checks[item.key as keyof typeof checks] ? 'text-green-500' : 'text-gray-300'}>
                    {checks[item.key as keyof typeof checks] ? '☑' : '☐'}
                  </span>
                  <span className={`text-sm ${checks[item.key as keyof typeof checks] ? 'text-green-600' : 'text-gray-600'}`}>{item.label}</span>
                </div>
              ))}
            </div>
            <div className="h-px bg-gray-100 my-4" />
            <button
              onClick={() => { if (isZoomActive && userData.zoomLink) window.open(userData.zoomLink, '_blank'); else onToast('상담 시작 10분 전에 활성화됩니다'); }}
              className={`w-full py-3 rounded-xl text-sm font-bold mb-2 ${isZoomActive ? 'text-white' : 'bg-gray-100 text-gray-400'}`}
              style={isZoomActive ? { background: '#c9a53e' } : {}}
            >
              💻 줌 상담 입장하기
            </button>
            {!isZoomActive && <p className="text-center text-xs text-gray-400">상담 시작 10분 전 활성화</p>}
            <button onClick={() => onToast('일정 변경은 3일 전까지 가능합니다')} className="mt-2 w-full py-3 rounded-xl text-sm font-bold bg-gray-50 text-gray-500 border border-gray-100">
              📅 일정 변경 요청
            </button>
          </>
        ) : (
          <p className="text-sm text-gray-400">예정된 상담이 없습니다.<br />첫 상담을 신청해보세요!</p>
        )}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">상담 유형</p>
        <div className="flex justify-between items-center py-2"><span className="text-sm text-gray-600">초회 상담</span><span className="text-sm font-bold text-gray-900">90분</span></div>
        <div className="flex justify-between items-center py-2"><span className="text-sm text-gray-600">월례 상담</span><span className="text-sm font-bold text-gray-900">30분</span></div>
      </div>
    </div>
  );
}

function History({ uid, onToast, onModal }: { uid: string; onToast: (msg: string) => void; onModal: (title: string, content: string) => void }) {
  const [histories, setHistories] = useState<ConsultationHistory[]>([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const q = query(collection(db, 'users', uid, 'consultationHistory'), orderBy('date', 'desc'), limit(10));
        const snap = await getDocs(q);
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as ConsultationHistory));
        setHistories(list);
        setCount(list.length);
      } catch (e) {
        console.error('[History] 로드 실패:', e);
      }
    };
    load();
  }, [uid]);

  const grade = getCertGrade(count);

  return (
    <div className="overflow-y-auto h-full px-4 py-4 pb-6 space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">수료증 등급</p>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{grade.icon}</span>
          <div>
            <p className="font-bold text-gray-900">{grade.grade}</p>
            <p className="text-xs text-gray-400">총 {count}회 상담 완료</p>
          </div>
        </div>
        <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-700">{grade.next}</div>
      </div>
      {histories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <p className="text-gray-400 text-sm">아직 상담 이력이 없습니다</p>
        </div>
      ) : (
        histories.map((h, i) => (
          <div key={h.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-bold text-gray-900">상담 #{count - i}</p>
                <p className="text-xs text-gray-400 mt-0.5">📅 {h.date} · ⏱️ {h.duration}분 · {h.type}</p>
              </div>
              <span className="text-2xl font-extrabold" style={{ color: '#c9a53e' }}>{h.score}점</span>
            </div>
            {h.summary && (
              <div className="bg-gray-50 rounded-xl p-3 mb-3">
                <p className="text-xs font-bold text-gray-400 mb-1">핵심 발견</p>
                <p className="text-sm text-gray-700 leading-relaxed">"{h.summary}"</p>
              </div>
            )}
            {h.tasks && h.tasks.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-bold text-gray-400 mb-2">개선 과제</p>
                {h.tasks.map((task, j) => (
                  <p key={j} className="text-sm text-gray-700 mb-1"><span style={{ color: '#c9a53e' }}>{j + 1}.</span> {task}</p>
                ))}
              </div>
            )}
            <div className="flex gap-2 mt-3 flex-wrap">
              <button onClick={() => h.reportUrl ? window.open(h.reportUrl, '_blank') : onModal('리포트', '리포트를 준비 중입니다 📋')} className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 border border-amber-200" style={{ color: '#c9a53e' }}>📄 리포트</button>
              <button onClick={() => h.certificateUrl ? window.open(h.certificateUrl, '_blank') : onModal('수료증', '수료증을 준비 중입니다 🏆')} className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 border border-amber-200" style={{ color: '#c9a53e' }}>🏆 수료증</button>
              {h.zoomUrl && <button onClick={() => window.open(h.zoomUrl, '_blank')} className="px-3 py-2 rounded-xl text-xs font-bold bg-gray-50 border border-gray-200 text-gray-500">▶️ 녹화 보기</button>}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function Documents({ user, onToast }: { user: any; onToast: (msg: string) => void }) {
  const [docs, setDocs] = useState<{ [key: string]: ConsultationDoc | null }>({ application: null, insurance: null, pension: null, tax: null });
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<string>('');

  const docDefs = [
    { key: 'application', label: '상담신청서', required: true, sub: '' },
    { key: 'insurance', label: '보험증권', required: true, sub: '' },
    { key: 'pension', label: '연금명세서', required: true, sub: '국민연금 + 퇴직연금' },
    { key: 'tax', label: '세금신고서', required: false, sub: '' },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(collection(db, 'users', user.uid, 'consultationDocuments'));
        const map: { [key: string]: ConsultationDoc } = {};
        snap.forEach(d => { const data = d.data() as ConsultationDoc; map[data.docType] = data; });
        setDocs(prev => ({ ...prev, ...map }));
      } catch (e) { console.error('[Documents] 로드 실패:', e); }
    };
    load();
  }, [user.uid]);

  const handleUpload = async (file: File, docType: string) => {
    setUploading(docType);
    try {
      const storageRef = ref(storage, `consultation-documents/${user.uid}/${docType}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      const docData: ConsultationDoc = { docType, fileName: file.name, fileUrl: url, uploadDate: new Date() };
      await addDoc(collection(db, 'users', user.uid, 'consultationDocuments'), docData);
      setDocs(prev => ({ ...prev, [docType]: docData }));
      onToast(`${docDefs.find(d => d.key === docType)?.label} 업로드 완료! ✅`);
    } catch { onToast('업로드에 실패했습니다. 다시 시도해주세요.'); }
    finally { setUploading(null); }
  };

  const requiredDocs = docDefs.filter(d => d.required);
  const completedRequired = requiredDocs.filter(d => !!docs[d.key]).length;
  const progress = Math.round((completedRequired / requiredDocs.length) * 100);

  return (
    <div className="overflow-y-auto h-full px-4 py-4 pb-6 space-y-4">
      <input ref={fileInputRef} type="file" className="hidden" accept="image/*,application/pdf"
        onChange={e => { const file = e.target.files?.[0]; if (file && uploadTarget) handleUpload(file, uploadTarget); e.target.value = ''; }} />
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-bold text-gray-700">필수 서류 제출 현황</p>
          <span className="text-sm font-bold" style={{ color: '#c9a53e' }}>{completedRequired}/{requiredDocs.length} 완료</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: '#c9a53e' }} />
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">필수 서류</p>
        {docDefs.filter(d => d.required).map(def => (
          <div key={def.key} className="py-3 border-b border-gray-50 last:border-0">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className={docs[def.key] ? 'text-green-500' : 'text-gray-300'}>{docs[def.key] ? '✅' : '⬜'}</span>
                <div>
                  <p className="text-sm font-medium text-gray-700">{def.label}</p>
                  {def.sub && !docs[def.key] && <p className="text-xs text-gray-400">{def.sub}</p>}
                  {docs[def.key] && <p className="text-xs text-green-600">제출 완료</p>}
                </div>
              </div>
              {docs[def.key] ? (
                <button onClick={() => window.open(docs[def.key]!.fileUrl, '_blank')} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-50 border border-gray-200 text-gray-500">보기</button>
              ) : (
                <button disabled={uploading === def.key} onClick={() => { setUploadTarget(def.key); fileInputRef.current?.click(); }} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white disabled:opacity-50" style={{ background: '#c9a53e' }}>
                  {uploading === def.key ? '업로드 중...' : '📎 업로드'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">선택 서류</p>
        {docDefs.filter(d => !d.required).map(def => (
          <div key={def.key} className="py-3 border-b border-gray-50 last:border-0">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className={docs[def.key] ? 'text-green-500' : 'text-gray-300'}>{docs[def.key] ? '✅' : '⬜'}</span>
                <p className="text-sm font-medium text-gray-700">{def.label}</p>
              </div>
              {docs[def.key] ? (
                <button onClick={() => window.open(docs[def.key]!.fileUrl, '_blank')} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-50 border border-gray-200 text-gray-500">보기</button>
              ) : (
                <button disabled={uploading === def.key} onClick={() => { setUploadTarget(def.key); fileInputRef.current?.click(); }} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-50 border border-gray-100 text-gray-500">
                  {uploading === def.key ? '업로드 중...' : '📎 업로드'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="bg-amber-50 rounded-2xl p-4 text-center">
        <p className="text-sm text-amber-700 leading-relaxed">💡 서류가 완비되면<br />더 정확한 상담이 가능합니다.</p>
      </div>
    </div>
  );
}

function ConsultationHub({ user }: { user: any }) {
  const [activeSubTab, setActiveSubTab] = useState('dashboard');
  const [userData, setUserData] = useState<any>({});
  const [toast, setToast] = useState<string | null>(null);
  const [modal, setModal] = useState<{ title: string; content: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) setUserData(snap.data());
      } catch (e) { console.error('[Hub] 유저 데이터 로드 실패:', e); }
    };
    load();
  }, [user.uid]);

  const subTabs = [
    { id: 'dashboard', label: '홈', icon: '🏠' },
    { id: 'finance', label: '내 재무', icon: '📊' },
    { id: 'chat', label: '머니야', icon: '💬' },
    { id: 'schedule', label: '일정', icon: '📅' },
    { id: 'history', label: '이력', icon: '📋' },
    { id: 'files', label: '서류함', icon: '📎' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-100 px-4">
        <div className="flex overflow-x-auto">
          {subTabs.map(t => (
            <button key={t.id} onClick={() => setActiveSubTab(t.id)}
              className={`shrink-0 px-3 py-3 text-xs font-bold border-b-2 transition-colors ${activeSubTab === t.id ? '' : 'border-transparent text-gray-400'}`}
              style={activeSubTab === t.id ? { color: '#c9a53e', borderColor: '#c9a53e' } : {}}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-hidden bg-gray-50">
        {activeSubTab === 'dashboard' && <HubDashboard userData={userData} onNav={setActiveSubTab} onToast={msg => setToast(msg)} />}
        {activeSubTab === 'finance' && <MyFinance userData={userData} />}
        {activeSubTab === 'chat' && <MoneyaChat user={user} userData={userData} onToast={msg => setToast(msg)} />}
        {activeSubTab === 'schedule' && <Schedule userData={userData} onToast={msg => setToast(msg)} />}
        {activeSubTab === 'history' && <History uid={user.uid} onToast={msg => setToast(msg)} onModal={(t, c) => setModal({ title: t, content: c })} />}
        {activeSubTab === 'files' && <Documents user={user} onToast={msg => setToast(msg)} />}
      </div>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
      {modal && <Modal title={modal.title} content={modal.content} onClose={() => setModal(null)} />}
    </div>
  );
}

export default function ConsultationPage({ user }: ConsultationPageProps) {
  const { isSubscriber, loading } = useSubscription(user?.uid);
  const [toast, setToast] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
        <h1 className="text-lg font-extrabold text-gray-900">💬 상담</h1>
        {isSubscriber && (
          <span className="text-xs px-2 py-1 rounded-full font-bold text-white" style={{ background: '#c9a53e' }}>구독중</span>
        )}
      </div>
      <div className="flex-1 overflow-hidden" style={{ paddingBottom: '64px' }}>
        {isSubscriber ? <ConsultationHub user={user} /> : <ServiceIntro onToast={msg => setToast(msg)} />}
      </div>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
