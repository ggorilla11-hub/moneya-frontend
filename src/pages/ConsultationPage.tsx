// ConsultationPage.tsx v5.0
// v5.0 수정사항:
// 1. 서브탭 "머니야" → "AI 화상상담" (id: 'chat', icon: 📹)
// 2. chat 탭 렌더링: MoneyaInfo → VideoConsult (WebRTC)
// 3. schedule 탭: 기존 Schedule + MoneyaInfo(금융집 현황) 합체 → ScheduleWithHouse
// 4. 지출탭 및 기타 컴포넌트 일절 변경 없음
// 5. VideoConsult: Phase1(WebRTC) + Phase2(스마트노트) 완전 통합

import { useState, useRef, useEffect, useCallback } from 'react';

interface ConsultationDoc { docType: string; fileName: string; fileUrl: string; }
interface ConsultationPageProps { user: any; }

const API_URL = 'https://moneya-server.onrender.com';
const WS_URL = 'wss://moneya-server.onrender.com';
const GOLD = '#c9a53e';
const MONEYA_IMG = 'https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/AI%EB%A8%B8%EB%8B%88%EC%95%BC%20%ED%99%95%EC%A0%95%EC%9D%B4%EB%AF%B8%EC%A7%80%EC%95%88.png?alt=media&token=c250863d-7cda-424a-800d-884b20e30b1a';

function sc(s: number) { return s >= 80 ? 'text-green-600' : s >= 60 ? 'text-yellow-500' : 'text-red-500'; }
function si(s: number) { return s >= 80 ? '✅' : s >= 60 ? '⚠️' : '🔴'; }
function getCertGrade(n: number) {
  if (n >= 12) return { grade: 'S등급', icon: '💎', next: '최고 등급 달성!' };
  if (n >= 7) return { grade: 'A등급', icon: '🥇', next: '12회 이상 → S등급' };
  if (n >= 3) return { grade: 'B등급', icon: '🥈', next: '7회 이상 → A등급' };
  if (n >= 1) return { grade: 'C등급', icon: '🥉', next: '3회 이상 → B등급' };
  return { grade: '-', icon: '⬜', next: '첫 상담 후 등급 부여' };
}

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 2500); return () => clearTimeout(t); }, [onClose]);
  return <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-gray-800 text-white text-sm px-5 py-3 rounded-full shadow-lg whitespace-nowrap">{msg}</div>;
}

function Modal({ title, content, onClose }: { title: string; content: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <h3 className="font-bold text-gray-900 text-lg mb-3">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{content}</p>
        <button onClick={onClose} className="mt-5 w-full py-3 rounded-xl font-bold text-white text-sm" style={{ background: GOLD }}>확인</button>
      </div>
    </div>
  );
}

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, background: color }} />
    </div>
  );
}



// ── 내 재무 (기존 그대로) ─────────────────────────
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
  const goals: any[] = userData.monthlyGoals || [];
  const floorKeys = ['f1','f2','f3','f4','f5','f6'] as const;
  const floorLabels = ['1층 기초체력','2층 안전장치','3층 부동산','4층 보장자산','5층 은퇴설계','6층 투자성장'];
  return (
    <div className="overflow-y-auto h-full px-4 py-4 pb-6 space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">기본 재무 지표</p>
        {([['순자산',`${netAssets.toLocaleString()}만원`,'text-gray-900'],['월소득',`${income.toLocaleString()}만원`,'text-gray-900'],['월지출',`${expense.toLocaleString()}만원`,'text-gray-900'],['저축률',`${savingsRate}%`,savingsRate>=20?'text-green-600':savingsRate>=10?'text-yellow-500':'text-red-500'],['부채비율',`${debtRatio}%`,debtRatio<=40?'text-green-600':debtRatio<=60?'text-yellow-500':'text-red-500'],['비상자금',`${emergencyFundMonths}개월분`,emergencyFundMonths>=6?'text-green-600':emergencyFundMonths>=3?'text-yellow-500':'text-red-500']] as [string,string,string][]).map(([label,val,color]) => (
          <div key={label} className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0">
            <span className="text-sm text-gray-500">{label}</span>
            <span className={`text-sm font-bold ${color}`}>{val}</span>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">금융집짓기 6단계 점수</p>
        {floorLabels.map((label, idx) => {
          const score: number = scores[floorKeys[idx]] || 0;
          return (
            <div key={label} className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">{label}</span>
                <span className={`text-xs font-bold ${sc(score)}`}>{si(score)} {score}점</span>
              </div>
              <ScoreBar score={score} color={score>=80?'#10B981':score>=60?'#F59E0B':'#EF4444'} />
            </div>
          );
        })}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">이달의 목표</p>
        {goals.length > 0 ? goals.map((goal, i) => (
          <div key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
            <span className={goal.done ? 'text-green-500' : 'text-gray-300'}>{goal.done ? '☑' : '☐'}</span>
            <span className={`text-sm ${goal.done ? 'text-green-600 line-through' : 'text-gray-700'}`}>{goal.text}</span>
          </div>
        )) : <p className="text-sm text-gray-400">상담 후 목표가 설정됩니다</p>}
      </div>
    </div>
  );
}

// ── 홈 탭 AI 음성상담 (기존 그대로 — 절대 수정 금지) ─────────
function HubDashboard({ user }: { user: any }) {
  const displayName = user.displayName || '고객';
  const [messages, setMessages] = useState<{ id: string; role: 'user'|'assistant'; text: string }[]>([
    { id: '1', role: 'assistant', text: `안녕하세요 ${displayName}님! 저는 AI 재무설계사 머니야입니다.\n오상열 CFP의 금융집짓기 방법론으로 재무상담을 도와드릴게요.\n\n텍스트 입력 또는 마이크 버튼으로 말씀해주세요! 😊` }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('대기중');
  const [serverReady, setServerReady] = useState(false);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<any>(null);
  const isPlayingRef = useRef(false);
  const isConnectedRef = useRef(false);

  useEffect(() => {
    const warmup = async () => {
      try { const r = await fetch(`${API_URL}/api/health`); if (r.ok) setServerReady(true); }
      catch { setTimeout(warmup, 3000); }
    };
    warmup();
    return () => cleanupVoiceMode();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (chatAreaRef.current) chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }, 80);
  }, [messages]);

  const sendTextMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: text.trim() }]);
    setInputText('');
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/consult-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          userName: displayName,
          conversationHistory: messages.map(m => ({ role: m.role, content: m.text })),
        }),
      });
      const data = await res.json();
      const aiText = data.success ? data.message : '잠시 후 다시 시도해주세요.';
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'assistant', text: aiText }]);
    } catch {
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'assistant', text: '서버 연결 중입니다. 잠시 후 다시 시도해주세요.' }]);
    } finally { setIsLoading(false); }
  };

  const pcmChunksRef = useRef<string[]>([]);
  const playAudio = (b64: string) => { pcmChunksRef.current.push(b64); };

  const playAccumulatedAudio = async () => {
    if (!pcmChunksRef.current.length) return;
    try {
      const chunks = pcmChunksRef.current;
      pcmChunksRef.current = [];
      const arrays = chunks.map(b64 => {
        const raw = atob(b64);
        const arr = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
        return arr;
      });
      const totalLen = arrays.reduce((acc, a) => acc + a.length, 0);
      const merged = new Uint8Array(totalLen);
      let offset = 0;
      for (const a of arrays) { merged.set(a, offset); offset += a.length; }
      const int16 = new Int16Array(merged.buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768.0;
      if (!audioContextRef.current || audioContextRef.current.state === 'closed')
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
      const buffer = audioContextRef.current.createBuffer(1, float32.length, 24000);
      buffer.getChannelData(0).set(float32);
      const src = audioContextRef.current.createBufferSource();
      src.buffer = buffer;
      src.connect(audioContextRef.current.destination);
      src.start();
    } catch (e) { console.error('PCM 재생 에러:', e); }
  };

  const cleanupVoiceMode = () => {
    if (wsRef.current) { try { wsRef.current.send(JSON.stringify({ type: 'stop' })); wsRef.current.close(); } catch {} wsRef.current = null; }
    if (mediaStreamRef.current) { mediaStreamRef.current.getTracks().forEach(t => t.stop()); mediaStreamRef.current = null; }
    if (processorRef.current) {
      try { const { processor, source, audioContext } = processorRef.current; processor.disconnect(); source.disconnect(); audioContext.close(); } catch {}
      processorRef.current = null;
    }
    pcmChunksRef.current = []; isPlayingRef.current = false; isConnectedRef.current = false;
  };

  const startAudioCapture = (stream: MediaStream, ws: WebSocket) => {
    try {
      const ac = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const src = ac.createMediaStreamSource(stream);
      const prc = ac.createScriptProcessor(4096, 1, 1);
      prc.onaudioprocess = (e) => {
        if (!ws || ws.readyState !== WebSocket.OPEN) return;
        const inp = e.inputBuffer.getChannelData(0);
        const pcm = new Int16Array(inp.length);
        for (let i = 0; i < inp.length; i++) pcm[i] = Math.max(-32768, Math.min(32767, inp[i] * 32768));
        ws.send(JSON.stringify({ type: 'audio', data: btoa(String.fromCharCode(...new Uint8Array(pcm.buffer))) }));
      };
      src.connect(prc); prc.connect(ac.destination);
      processorRef.current = { processor: prc, source: src, audioContext: ac };
    } catch (e) { console.error('오디오 캡처 에러:', e); }
  };

  const startVoiceMode = async () => {
    if (isConnectedRef.current) return;
    try {
      setVoiceStatus('연결중...'); setIsVoiceMode(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 24000, channelCount: 1, echoCancellation: true, noiseSuppression: true } as MediaTrackConstraints });
      mediaStreamRef.current = stream;
      const ws = new WebSocket(`${WS_URL}?mode=consult`);
      wsRef.current = ws;
      ws.onopen = () => { ws.send(JSON.stringify({ type: 'start_consult', userName: displayName, conversationHistory: messages.map(m => ({ role: m.role, content: m.text })) })); };
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'session_started') { isConnectedRef.current = true; setVoiceStatus('듣는중...'); startAudioCapture(stream, ws); }
          if (msg.type === 'audio' && msg.data) playAudio(msg.data);
          if (msg.type === 'audio_end') playAccumulatedAudio();
          if (msg.type === 'transcript' && msg.role === 'user')
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: msg.text }]);
          if (msg.type === 'transcript' && msg.role === 'assistant')
            setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'assistant', text: msg.text }]);
          if (msg.type === 'interrupt') { pcmChunksRef.current = []; isPlayingRef.current = false; }
        } catch {}
      };
      ws.onerror = () => { setVoiceStatus('연결 실패'); cleanupVoiceMode(); setIsVoiceMode(false); };
      ws.onclose = () => { isConnectedRef.current = false; setVoiceStatus('대기중'); setIsVoiceMode(false); };
    } catch { alert('마이크 권한이 필요합니다.'); cleanupVoiceMode(); setIsVoiceMode(false); setVoiceStatus('대기중'); }
  };

  const stopVoiceMode = () => { cleanupVoiceMode(); setIsVoiceMode(false); setVoiceStatus('대기중'); };
  const toggleVoiceMode = () => { isVoiceMode ? stopVoiceMode() : startVoiceMode(); };
  const CHIPS = ['재무상담', '저축률 진단', '보험 분석', '은퇴 계산', '투자 조언'];

  return (
    <div className="flex flex-col h-full" style={{ paddingBottom: '64px' }}>
      <div className="mx-4 mt-3 rounded-2xl p-4 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${GOLD}, #e8c05a)` }}>
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
        <div className="flex items-center gap-3 relative z-10">
          <img src={MONEYA_IMG} alt="머니야" className={`w-14 h-14 object-contain rounded-full bg-white/20 p-1 ${isVoiceMode ? 'animate-pulse' : ''}`} />
          <div className="flex-1">
            <p className="text-white font-extrabold text-base">AI 재무설계사 머니야</p>
            <p className="text-white/80 text-xs">오상열 CFP · 금융집짓기 전문</p>
            <div className="flex items-center gap-2 mt-1">
              {isVoiceMode ? (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/30 text-green-100 text-xs rounded-full">
                  <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />{voiceStatus}
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-white/20 text-white/80 text-xs rounded-full">
                  <span className="w-1.5 h-1.5 bg-white/60 rounded-full" />
                  {serverReady ? '상담 준비됨' : '서버 준비중...'}
                </span>
              )}
            </div>
          </div>
        </div>
        {isVoiceMode && (
          <div className="flex items-center gap-1 mt-3 justify-center">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="w-1 bg-white/70 rounded-full animate-pulse"
                style={{ height: `${10 + (i % 4) * 6}px`, animationDelay: `${i * 80}ms` }} />
            ))}
            <span className="text-white/80 text-xs ml-2">머니야가 듣고 있어요</span>
            <button onClick={stopVoiceMode} className="ml-auto px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full">종료</button>
          </div>
        )}
      </div>
      <div className="px-4 pt-3 pb-1 flex gap-2 overflow-x-auto">
        {CHIPS.map(q => (
          <button key={q} onClick={() => sendTextMessage(q)}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border"
            style={{ color: GOLD, borderColor: GOLD, background: '#fffdf5' }}>{q}</button>
        ))}
      </div>
      <div ref={chatAreaRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map(m => (
          <div key={m.id} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {m.role === 'assistant' && (
              <img src={MONEYA_IMG} alt="머니야" className="w-8 h-8 object-contain flex-shrink-0 mt-1 rounded-full" />
            )}
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
              ${m.role === 'assistant' ? 'bg-white border border-gray-100 text-gray-800 shadow-sm' : 'text-white'}`}
              style={m.role === 'user' ? { background: GOLD } : {}}>
              {m.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2">
            <img src={MONEYA_IMG} alt="머니야" className="w-8 h-8 object-contain flex-shrink-0 rounded-full" />
            <div className="px-4 py-3 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center gap-1">
                {[0,150,300].map(d => <div key={d} className="w-2 h-2 rounded-full animate-bounce" style={{ background: GOLD, animationDelay: `${d}ms` }} />)}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="bg-white border-t border-gray-100 px-4 pt-3 pb-4" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-full flex items-center justify-center border-2 flex-shrink-0"
            style={{ borderColor: GOLD, background: '#fffdf5' }}>
            <svg className="w-5 h-5" style={{ color: GOLD }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </button>
          <button onClick={toggleVoiceMode}
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
            style={{ background: isVoiceMode ? '#ef4444' : GOLD }}>
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
            </svg>
          </button>
          <div className="flex-1 flex items-center bg-gray-100 border border-gray-200 rounded-full px-4 py-2">
            <input type="text" value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyPress={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendTextMessage(inputText); } }}
              placeholder="머니야에게 말씀해주세요..."
              className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
              disabled={isLoading || isVoiceMode} />
          </div>
          <button onClick={() => sendTextMessage(inputText)}
            disabled={!inputText.trim() || isLoading || isVoiceMode}
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
            style={{ background: inputText.trim() && !isLoading && !isVoiceMode ? GOLD : '#d1d5db' }}>
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ── AI 화상상담 탭 (신규 — WebRTC + 스마트노트) ────────────────
// ══════════════════════════════════════════════════════════════

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

interface NoteData {
  houseHighlights?: string[];
  chips?: { label: string; bg: string; color: string; border: string }[];
  chartContent?: string;
  calcContent?: { label: string; value: string; sub: string; rows?: { val: string; label: string; color?: string }[] }[];
  webContent?: string;
}
interface VCMessage { role: 'ai' | 'user'; text: string; tag?: string; time: string; }

function FinancialHouseSVG({ highlights = [] }: { highlights?: string[] }) {
  return (
    <svg width="100%" viewBox="0 0 520 340" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', borderRadius: 8, overflow: 'hidden' }}>
      <defs>
        <linearGradient id="vcGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#C8920F' }} /><stop offset="100%" style={{ stopColor: '#E8C040' }} />
        </linearGradient>
        <linearGradient id="vcNavyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#1A3A6E' }} /><stop offset="100%" style={{ stopColor: '#0F2A5C' }} />
        </linearGradient>
        <filter id="vcShadow"><feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" /></filter>
      </defs>
      <rect width="520" height="340" fill="#F8F9FC" />
      <rect x="360" y="30" width="40" height="60" rx="4" fill="#9B59B6" opacity={highlights.includes('real_estate') ? 1 : 0.7} />
      <text x="380" y="55" textAnchor="middle" fontSize="9" fill="white" fontWeight="700">부동산</text>
      <text x="380" y="68" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.8)">설계</text>
      <polygon points="80,130 260,40 440,130" fill="url(#vcNavyGrad)" filter="url(#vcShadow)" opacity={highlights.includes('investment') ? 1 : 0.9} />
      <text x="260" y="88" textAnchor="middle" fontSize="11" fill="white" fontWeight="700">투자설계</text>
      <text x="260" y="103" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.7)">다락방 / 세금설계</text>
      <rect x="80" y="128" width="360" height="22" fill="#E67E22" opacity="0.85" />
      <text x="260" y="143" textAnchor="middle" fontSize="10" fill="white" fontWeight="700">생로병사 (처마보)</text>
      <rect x="82" y="150" width="100" height="110" rx="4" fill="#3498DB" opacity={highlights.includes('debt') ? 1 : 0.8} filter="url(#vcShadow)" />
      <text x="132" y="200" textAnchor="middle" fontSize="10" fill="white" fontWeight="700">부채설계</text>
      <text x="132" y="215" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.65)">(거실)</text>
      <rect x="210" y="150" width="100" height="110" rx="4" fill="#27AE60" opacity={highlights.includes('savings') ? 1 : 0.8} filter="url(#vcShadow)" />
      <text x="260" y="200" textAnchor="middle" fontSize="10" fill="white" fontWeight="700">저축설계</text>
      <text x="260" y="215" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.65)">(건넌방)</text>
      <rect x="338" y="146" width="104" height="118" rx="4" fill="url(#vcGoldGrad)" filter="url(#vcShadow)" />
      {highlights.includes('retirement') && <rect x="338" y="146" width="104" height="118" rx="4" fill="none" stroke="#D4A017" strokeWidth="3" />}
      <text x="390" y="195" textAnchor="middle" fontSize="10" fill="white" fontWeight="700">은퇴설계 ★</text>
      <text x="390" y="210" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.75)">(안방)</text>
      <rect x="82" y="262" width="360" height="60" rx="4" fill="#2C3E50" opacity={highlights.includes('insurance') ? 1 : 0.9} filter="url(#vcShadow)" />
      {highlights.includes('insurance') && <rect x="82" y="262" width="360" height="60" rx="4" fill="none" stroke="#E74C3C" strokeWidth="2" />}
      <text x="200" y="290" textAnchor="middle" fontSize="10" fill="white" fontWeight="700">🛡️ 보장자산 (보험)</text>
      <text x="200" y="308" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.65)">지하층 — 재무 토대</text>
      <text x="380" y="290" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.8)" fontWeight="600">🔥 비상예비금</text>
      <text x="380" y="308" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.55)">생활비 3~6개월</text>
    </svg>
  );
}

function SmartNote({ noteData, activeTab, onTabChange }: { noteData: NoteData; activeTab: 'house'|'chart'|'calc'|'video'|'web'; onTabChange: (tab: 'house'|'chart'|'calc'|'video'|'web') => void }) {
  const tabs = [
    { id: 'house' as const, label: '🏠 금융집짓기' },
    { id: 'chart' as const, label: '📊 차트' },
    { id: 'calc' as const, label: '🧮 계산' },
    { id: 'video' as const, label: '🎬 영상' },
    { id: 'web' as const, label: '🌐 웹자료' },
  ];
  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E5E5E5', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', gap: 2, padding: '8px 8px 0', borderBottom: '1px solid #F0F0F0', background: '#FAFAFA', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => onTabChange(tab.id)} style={{ flexShrink: 0, padding: '6px 12px', borderRadius: '8px 8px 0 0', border: 'none', background: activeTab === tab.id ? 'white' : 'transparent', color: activeTab === tab.id ? '#D4A017' : '#888', fontWeight: activeTab === tab.id ? 700 : 500, fontSize: 11, cursor: 'pointer', borderBottom: activeTab === tab.id ? '2px solid #D4A017' : '2px solid transparent', transition: 'all 0.2s', fontFamily: 'inherit' }}>{tab.label}</button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
        {activeTab === 'house' && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1A1A', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 3, height: 14, background: '#D4A017', borderRadius: 2, display: 'inline-block' }} />금융집짓기® — 고객 현황
            </div>
            <FinancialHouseSVG highlights={noteData.houseHighlights || []} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              {noteData.chips?.map((chip, i) => <span key={i} style={{ background: chip.bg, color: chip.color, fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20, border: `1px solid ${chip.border}` }}>{chip.label}</span>)}
            </div>
          </div>
        )}
        {activeTab === 'chart' && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1A1A', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 3, height: 14, background: '#3498DB', borderRadius: 2, display: 'inline-block' }} />자산 포트폴리오 분석</div>
            {noteData.chartContent ? <div dangerouslySetInnerHTML={{ __html: noteData.chartContent }} /> : <div style={{ textAlign: 'center', padding: '40px 20px', color: '#AAA', fontSize: 13 }}><div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>AI 머니야와 대화하시면<br />차트가 자동으로 생성됩니다</div>}
          </div>
        )}
        {activeTab === 'calc' && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1A1A', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 3, height: 14, background: '#27AE60', borderRadius: 2, display: 'inline-block' }} />재무 계산 결과</div>
            {noteData.calcContent ? noteData.calcContent.map((item, i) => (
              <div key={i} style={{ background: 'linear-gradient(135deg,#1A1A2E,#2D2D4E)', borderRadius: 12, padding: 16, marginBottom: 10, color: 'white' }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#D4A017' }}>{item.value}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{item.sub}</div>
                {item.rows && <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.1)' }}>{item.rows.map((r, j) => <div key={j} style={{ textAlign: 'center' }}><div style={{ fontSize: 15, fontWeight: 700, color: r.color || 'white' }}>{r.val}</div><div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{r.label}</div></div>)}</div>}
              </div>
            )) : <div style={{ textAlign: 'center', padding: '40px 20px', color: '#AAA', fontSize: 13 }}><div style={{ fontSize: 32, marginBottom: 8 }}>🧮</div>은퇴자금, 보험료 등<br />계산 결과가 여기 표시됩니다</div>}
          </div>
        )}
        {activeTab === 'video' && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1A1A', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 3, height: 14, background: '#9B59B6', borderRadius: 2, display: 'inline-block' }} />니즈환기 영상 라이브러리</div>
            {[
              { emoji: '👴👵', title: '노후준비, 왜 지금 해야 하나요?', duration: '2:34', bg: 'linear-gradient(145deg,#1a1a2e,#16213e)' },
              { emoji: '🛡️', title: '보험, 제대로 알고 계신가요?', duration: '1:58', bg: 'linear-gradient(145deg,#1a2a1a,#163016)' },
              { emoji: '📈', title: '복리의 기적 — 10년의 차이', duration: '3:12', bg: 'linear-gradient(145deg,#2a1a0a,#3a2a10)' },
            ].map((v, i) => (
              <div key={i} style={{ marginBottom: 10, cursor: 'pointer', borderRadius: 12, overflow: 'hidden', border: '1px solid #E5E5E5' }}>
                <div style={{ background: v.bg, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <div style={{ fontSize: 32 }}>{v.emoji}</div>
                  <div style={{ position: 'absolute', width: 40, height: 40, background: 'rgba(255,255,255,0.9)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>▶</div>
                  <div style={{ position: 'absolute', bottom: 6, right: 8, background: 'rgba(0,0,0,0.7)', color: 'white', fontSize: 10, padding: '2px 6px', borderRadius: 4 }}>{v.duration}</div>
                </div>
                <div style={{ padding: '8px 10px', fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>{v.title}</div>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'web' && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1A1A', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 3, height: 14, background: '#E74C3C', borderRadius: 2, display: 'inline-block' }} />실시간 웹 참조 자료</div>
            {noteData.webContent ? <div dangerouslySetInnerHTML={{ __html: noteData.webContent }} /> : <div style={{ textAlign: 'center', padding: '40px 20px', color: '#AAA', fontSize: 13 }}><div style={{ fontSize: 32, marginBottom: 8 }}>🌐</div>AI 머니야가 상담 중<br />관련 자료를 여기 가져옵니다</div>}
          </div>
        )}
      </div>
    </div>
  );
}

function VideoConsult({ displayName, onToast }: { displayName: string; onToast: (msg: string) => void }) {
  const [phase, setPhase] = useState<'idle'|'connecting'|'active'|'ended'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [activeNoteTab, setActiveNoteTab] = useState<'house'|'chart'|'calc'|'video'|'web'>('house');
  const [noteData, setNoteData] = useState<NoteData>({ houseHighlights: [], chips: [{ label: '💰 월 수입 입력 전', bg: '#FFF3CC', color: '#C8920F', border: 'rgba(200,146,15,0.3)' }] });
  const [messages, setMessages] = useState<VCMessage[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<Int16Array[]>([]);
  const isPlayingRef = useRef(false);
  const steps = ['수입지출 분석','보험 적정성','저축 설계','부채 관리','은퇴 설계','투자 설계','세금 설계','부동산 설계'];
  const formatTime = (s: number) => { const m = Math.floor(s/60); const sec = s%60; return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`; };

  const processAudioQueue = useCallback(() => {
    if (!audioQueueRef.current.length) { isPlayingRef.current = false; return; }
    isPlayingRef.current = true;
    const ctx = audioCtxRef.current; if (!ctx) { isPlayingRef.current = false; return; }
    const chunk = audioQueueRef.current.shift()!;
    const buf = ctx.createBuffer(1, chunk.length, 24000);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < chunk.length; i++) ch[i] = chunk[i] / 32768;
    const src = ctx.createBufferSource(); src.buffer = buf; src.connect(ctx.destination);
    src.onended = () => processAudioQueue(); src.start();
  }, []);

  const playAudioChunk = useCallback((chunk: Int16Array) => {
    audioQueueRef.current.push(chunk);
    if (!isPlayingRef.current) processAudioQueue();
  }, [processAudioQueue]);

  // 서버 note_update 이벤트 → 스마트 노트 반영
  // 서버 구조: { type:'note_update', note_type, highlight, data, query, content }
  const handleNoteUpdate = useCallback((msg: any) => {
    const nt = msg.note_type;

    // 금융집짓기 SVG 하이라이트
    if (nt === 'house') {
      const highlightMap: Record<string, string> = {
        insurance: 'insurance', retirement: 'retirement', debt_savings: 'debt',
        investment_tax: 'investment', realestate: 'real_estate', budget: 'savings', general: '',
      };
      const highlight = msg.highlight ? (highlightMap[msg.highlight] || msg.highlight) : '';
      const chipMap: Record<string, { label: string; bg: string; color: string; border: string }> = {
        insurance:     { label: '🛡️ 보장자산 분석 중', bg: '#FFF0F0', color: '#C0392B', border: 'rgba(192,57,43,0.3)' },
        retirement:    { label: '🏠 은퇴설계 분석 중', bg: '#FFF3CC', color: '#C8920F', border: 'rgba(200,146,15,0.3)' },
        debt_savings:  { label: '💰 저축/부채 분석 중', bg: '#F0FFF4', color: '#27AE60', border: 'rgba(39,174,96,0.3)' },
        investment_tax:{ label: '📈 투자/세금 분석 중', bg: '#EFF8FF', color: '#2980B9', border: 'rgba(41,128,185,0.3)' },
        realestate:    { label: '🏢 부동산 분석 중',   bg: '#F5F0FF', color: '#8E44AD', border: 'rgba(142,68,173,0.3)' },
        budget:        { label: '📊 예산 분석 중',     bg: '#F0F4FF', color: '#2C3E50', border: 'rgba(44,62,80,0.3)'  },
      };
      const chip = msg.highlight ? chipMap[msg.highlight] : null;
      setNoteData(p => ({
        ...p,
        houseHighlights: highlight ? [highlight] : [],
        chips: chip ? [chip] : p.chips,
      }));
      setActiveNoteTab('house');
    }

    // 차트 탭
    else if (nt === 'chart') {
      const d = msg.data || {};
      if (d.gap !== undefined && d.lumpSum !== undefined) {
        // 은퇴자금 계산 결과
        const html = `
          <div style="background:linear-gradient(135deg,#1A1A2E,#2D2D4E);border-radius:12px;padding:16px;color:white;margin-bottom:10px">
            <div style="font-size:10px;color:rgba(255,255,255,0.5);margin-bottom:4px">월 부족 자금</div>
            <div style="font-size:26px;font-weight:700;color:#D4A017">${d.gap}만원/월</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.6);margin-top:2px">은퇴 후 매월 필요</div>
          </div>
          <div style="background:linear-gradient(135deg,#0F2A1E,#1A4A2E);border-radius:12px;padding:16px;color:white">
            <div style="font-size:10px;color:rgba(255,255,255,0.5);margin-bottom:4px">필요 은퇴일시금</div>
            <div style="font-size:26px;font-weight:700;color:#2ECC71">${d.lumpSum}만원</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.6);margin-top:2px">${d.retireAge || 65}세~${d.lifeExp || 90}세 (${(d.lifeExp||90)-(d.retireAge||65)}년)</div>
          </div>`;
        setNoteData(p => ({ ...p, chartContent: html }));
        setActiveNoteTab('chart');
      }
    }

    // 계산 탭
    else if (nt === 'calc') {
      const d = msg.data || {};
      const items: any[] = [];
      if (d.wealth_index !== undefined) {
        items.push({ label: '부자지수', value: `${d.wealth_index}점`, sub: `${d.grade || ''} · 100점이 평균` });
      }
      if (d.diff !== undefined) {
        items.push({
          label: `${d.family || 1}인 가구 생활비 진단`,
          value: d.diff > 0 ? `+${d.diff}만원 초과` : `${Math.abs(d.diff)}만원 여유`,
          sub: `기준 ${d.stdAmt || 0}만원 · 현재 ${d.living || 0}만원`,
        });
      }
      if (items.length > 0) {
        setNoteData(p => ({ ...p, calcContent: items }));
        setActiveNoteTab('calc');
      }
    }

    // 웹자료 탭
    else if (nt === 'web') {
      if (msg.query) {
        const html = `
          <div style="background:#F8F9FA;border-radius:10px;padding:12px;border:1px solid #E5E5E5">
            <div style="font-size:11px;color:#666;margin-bottom:8px">🔍 검색 키워드: <strong>${msg.query}</strong></div>
            <div style="font-size:12px;color:#333;line-height:1.6">${msg.content || 'RAG 지식베이스에서 관련 자료를 검색했습니다.'}</div>
          </div>`;
        setNoteData(p => ({ ...p, webContent: html }));
        setActiveNoteTab('web');
      }
    }
  }, []);

  // 단계 추적 — transcript 내용으로 자동 업데이트
  const detectStep = useCallback((text: string) => {
    const stepKeywords = [
      ['수입','지출','소득','월급'], ['보험','보장','실손'], ['저축','적금','예금'],
      ['부채','대출','빚'], ['은퇴','노후','연금'], ['투자','주식','펀드'],
      ['세금','절세','IRP'], ['부동산','아파트','전세']
    ];
    for (let i = stepKeywords.length - 1; i >= 0; i--) {
      if (stepKeywords[i].some(kw => text.includes(kw))) { setCurrentStep(i + 1); break; }
    }
  }, []);

  const initPeerConnection = useCallback(async (ws: WebSocket) => {
    const pc = new RTCPeerConnection(ICE_SERVERS); pcRef.current = pc;
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => pc.addTrack(t, localStreamRef.current!));
    pc.ontrack = (e) => { if (remoteVideoRef.current && e.streams[0]) remoteVideoRef.current.srcObject = e.streams[0]; };
    pc.onicecandidate = (e) => { if (e.candidate && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'video_signal', signal: { type: 'ice', candidate: e.candidate } })); };
    const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
    await pc.setLocalDescription(offer);
    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'video_signal', signal: { type: 'offer', sdp: offer } }));
  }, []);

  const endCall = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) { wsRef.current.send(JSON.stringify({ type: 'video_end' })); wsRef.current.send(JSON.stringify({ type: 'stop' })); wsRef.current.close(); }
    pcRef.current?.close(); pcRef.current = null;
    localStreamRef.current?.getTracks().forEach(t => t.stop()); localStreamRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('ended');
  }, []);

  const startCall = useCallback(async () => {
    setPhase('connecting');
    try {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws; ws.binaryType = 'arraybuffer';
      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'video_create_room' }));
        // 서버는 userName 필드를 사용 (start_consult 핸들러 확인)
        ws.send(JSON.stringify({ type: 'start_consult', userName: displayName, mode: 'video' }));
        const ac = new AudioContext({ sampleRate: 16000 });
        const src = ac.createMediaStreamSource(stream);
        const prc = ac.createScriptProcessor(4096, 1, 1);
        src.connect(prc); prc.connect(ac.destination);
        prc.onaudioprocess = (e) => {
          if (ws.readyState !== WebSocket.OPEN) return;
          const f32 = e.inputBuffer.getChannelData(0);
          const i16 = new Int16Array(f32.length);
          for (let i = 0; i < f32.length; i++) i16[i] = Math.max(-32768, Math.min(32767, Math.round(f32[i]*32768)));
          // 서버가 'audio' 타입으로 처리하므로 맞춤
          ws.send(JSON.stringify({ type: 'audio', data: btoa(String.fromCharCode(...new Uint8Array(i16.buffer))) }));
        };
      };
      ws.onmessage = (event) => {
        if (event.data instanceof ArrayBuffer) { playAudioChunk(new Int16Array(event.data)); return; }
        try {
          const msg = JSON.parse(event.data);

          // WebRTC 시그널링
          if (msg.type === 'video_room_created') initPeerConnection(ws);
          if (msg.type === 'video_signal') {
            const pc = pcRef.current; if (!pc) return;
            if (msg.signal.type === 'answer') pc.setRemoteDescription(new RTCSessionDescription(msg.signal.sdp));
            else if (msg.signal.type === 'ice') pc.addIceCandidate(new RTCIceCandidate(msg.signal.candidate));
          }
          if (msg.type === 'video_ended') endCall();

          // AI 세션 시작
          if (msg.type === 'session_started') {
            const t = new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'});
            setMessages([{ role:'ai', text:`안녕하세요, ${displayName} 고객님! 저는 AI 머니야입니다. 오상열 CFP 20년 노하우로 학습한 AI 재무상담사예요. 오늘 90분 동안 금융집짓기® 8단계로 고객님의 재무설계를 함께 완성해 드릴게요. 편하게 말씀해 주세요. 😊`, tag:'📊 1단계 수입지출 분석 시작', time:t }]);
            setPhase('active');
            timerRef.current = setInterval(() => setElapsed(e => e+1), 1000);
          }

          // 대화 텍스트 (STT 자막)
          if (msg.type === 'transcript') {
            const t = new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'});
            setMessages(p => [...p, { role: msg.role === 'assistant' ? 'ai' : 'user', text: msg.text, time: t }]);
            if (msg.role === 'assistant') detectStep(msg.text || '');
          }

          // 오디오 (서버가 base64로 보낼 때 — Realtime delta)
          if (msg.type === 'audio' && msg.data) {
            try {
              const raw = atob(msg.data);
              const i16 = new Int16Array(raw.length / 2);
              for (let i = 0; i < i16.length; i++) {
                i16[i] = (raw.charCodeAt(i*2)) | (raw.charCodeAt(i*2+1) << 8);
              }
              playAudioChunk(i16);
            } catch {}
          }

          // 스마트 노트 업데이트 — 서버가 'note_update' 타입으로 전송
          if (msg.type === 'note_update') {
            handleNoteUpdate(msg);
          }

          // 인터럽트 (사용자가 말 시작할 때)
          if (msg.type === 'interrupt') {
            audioQueueRef.current = [];
            isPlayingRef.current = false;
          }

        } catch {}
      };
      ws.onerror = () => { onToast('연결에 문제가 발생했습니다.'); setPhase('idle'); };
    } catch { onToast('카메라/마이크 권한이 필요합니다.'); setPhase('idle'); }
  }, [displayName, playAudioChunk, initPeerConnection, handleNoteUpdate, detectStep, endCall, onToast]);

  useEffect(() => { return () => { endCall(); audioCtxRef.current?.close(); }; }, []);

  const toggleMic = () => { localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = isMuted; }); setIsMuted(p => !p); };
  const toggleCam = () => { localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = isCamOff; }); setIsCamOff(p => !p); };

  // ── 대기/종료 화면 ──
  if (phase === 'idle' || phase === 'ended') {
    return (
      <div style={{ overflowY: 'auto', height: '100%', padding: 16 }}>
        <div style={{ background: 'linear-gradient(135deg,#B8820A 0%,#D4A017 40%,#E8C040 100%)', borderRadius: 20, padding: '28px 20px', textAlign: 'center', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
          <img src={MONEYA_IMG} alt="머니야" style={{ width: 72, height: 72, borderRadius: '50%', margin: '0 auto 14px', display: 'block', objectFit: 'contain', background: 'rgba(255,255,255,0.2)', padding: 6, boxShadow: '0 4px 20px rgba(0,0,0,0.2)', position: 'relative', zIndex: 1 }} />
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'white', marginBottom: 4, position: 'relative', zIndex: 1 }}>AI 머니야 화상상담</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', position: 'relative', zIndex: 1 }}>오상열 CFP · 금융집짓기® 전문</p>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: '16px 18px', marginBottom: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#666', marginBottom: 12 }}>상담 안내</div>
          {[
            { icon: '⏱', label: '상담 시간', value: '90분 (8단계 금융집짓기)' },
            { icon: '📹', label: '방식', value: 'AI 화상상담 (자체 WebRTC)' },
            { icon: '📋', label: '내용', value: '수입지출 · 보험 · 저축 · 투자 · 은퇴' },
            { icon: '🤖', label: 'AI 지원', value: 'RAG 5,706개 지식베이스 활용' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: i < 3 ? '1px solid #F2F2F2' : 'none' }}>
              <span style={{ fontSize: 20, width: 28, flexShrink: 0 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 11, color: '#AAA', marginBottom: 1 }}>{item.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>
        {phase === 'ended' && (
          <div style={{ background: '#F0F9F4', borderRadius: 12, padding: '12px 16px', marginBottom: 12, border: '1px solid #C5E1A5' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#2E7D32' }}>✅ 상담이 종료되었습니다</div>
            <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>상담 리포트는 서류함 탭에서 확인하세요.</div>
          </div>
        )}
        <button onClick={startCall} style={{ background: `linear-gradient(135deg,${GOLD},#e8c05a)`, color: 'white', border: 'none', width: '100%', padding: 18, borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 20px rgba(212,160,23,0.4)', fontFamily: 'inherit' }}>
          📹 화상상담 시작하기
        </button>
        <p style={{ textAlign: 'center', fontSize: 11, color: '#AAA', marginTop: 8 }}>카메라와 마이크 권한이 필요합니다</p>
      </div>
    );
  }

  // ── 연결 중 화면 ──
  if (phase === 'connecting') {
    return (
      <div style={{ background: '#0A0A0A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px 20px' }}>
        <style>{`@keyframes vcPulse{0%,100%{box-shadow:0 0 0 0 rgba(212,160,23,0.4)}50%{box-shadow:0 0 0 20px rgba(212,160,23,0)}} @keyframes vcBounce{0%,100%{transform:translateY(0);opacity:0.4}50%{transform:translateY(-8px);opacity:1}}`}</style>
        <div style={{ width: 100, height: 100, background: `linear-gradient(135deg,${GOLD},#e8c05a)`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, animation: 'vcPulse 2s ease-in-out infinite', overflow: 'hidden' }}>
          <img src={MONEYA_IMG} alt="머니야" style={{ width: 80, height: 80, objectFit: 'contain' }} />
        </div>
        <h3 style={{ color: 'white', fontSize: 18, fontWeight: 600, marginBottom: 8 }}>AI 머니야 연결 중...</h3>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 32 }}>카메라와 AI 음성을 준비하고 있습니다</p>
        <div style={{ display: 'flex', gap: 8 }}>
          {[0, 0.2, 0.4].map((delay, i) => <div key={i} style={{ width: 8, height: 8, background: GOLD, borderRadius: '50%', animation: `vcBounce 1.2s ease-in-out ${delay}s infinite` }} />)}
        </div>
        <button onClick={() => { localStreamRef.current?.getTracks().forEach(t => t.stop()); setPhase('idle'); }} style={{ marginTop: 40, background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.2)', padding: '10px 28px', borderRadius: 30, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>취소</button>
      </div>
    );
  }

  // ── 화상상담 활성 화면 ──
  const isMobile = window.innerWidth < 768;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0A0A0A', overflow: 'hidden' }}>
      <style>{`@keyframes vcLive{0%,100%{opacity:1}50%{opacity:0.4}} @keyframes vcWave{0%,100%{height:4px;opacity:0.4}50%{height:20px;opacity:1}}`}</style>
      {/* 상단 바 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: 'rgba(0,0,0,0.85)', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(229,62,62,0.2)', border: '1px solid rgba(229,62,62,0.5)', borderRadius: 20, padding: '3px 10px' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#E53E3E', animation: 'vcLive 1s infinite' }} />
            <span style={{ color: '#FC8181', fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>LIVE</span>
          </div>
          <span style={{ color: 'white', fontSize: 15, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{formatTime(elapsed)}</span>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>{steps[currentStep-1]} ({currentStep}/8)</span>
        <button onClick={endCall} style={{ background: '#E53E3E', color: 'white', border: 'none', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>종료</button>
      </div>
      {/* 메인 */}
      <div style={{ flex: 1, display: isMobile ? 'flex' : 'grid', flexDirection: isMobile ? 'column' : undefined, gridTemplateColumns: isMobile ? undefined : '260px 1fr 260px', overflow: 'hidden' }}>
        {/* 영상 */}
        <div style={{ position: 'relative', background: '#1A1A1A', flexShrink: 0, height: isMobile ? 170 : '100%' }}>
          <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#1A1A2E,#16213E)' }}>
            <div style={{ width: 80, height: 80, background: `linear-gradient(135deg,${GOLD},#e8c05a)`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, boxShadow: '0 0 30px rgba(212,160,23,0.3)', overflow: 'hidden' }}>
              <img src={MONEYA_IMG} alt="머니야" style={{ width: 68, height: 68, objectFit: 'contain' }} />
            </div>
            <div style={{ color: 'white', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>AI 머니야</div>
            <div style={{ display: 'flex', gap: 3, alignItems: 'center', height: 24 }}>
              {[0,0.1,0.2,0.1,0].map((d,i) => <div key={i} style={{ width: 3, background: GOLD, borderRadius: 3, animation: `vcWave 0.8s ease-in-out ${d}s infinite` }} />)}
            </div>
          </div>
          {/* PIP */}
          <div style={{ position: 'absolute', bottom: 10, right: 10, width: 76, height: 100, background: '#2D2D2D', borderRadius: 10, border: '2px solid rgba(255,255,255,0.15)', overflow: 'hidden', zIndex: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
            <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
            {isCamOff && <div style={{ position: 'absolute', inset: 0, background: '#2D2D2D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>👤</div>}
          </div>
          {/* 자막 */}
          {messages.length > 0 && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.85) 0%,transparent 100%)', padding: '28px 10px 8px', zIndex: 5 }}>
              <div style={{ color: GOLD, fontSize: 9, fontWeight: 700, marginBottom: 2 }}>{messages[messages.length-1].role==='ai'?'AI 머니야':'고객'}</div>
              <div style={{ color: 'white', fontSize: 11, lineHeight: 1.5, textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>{messages[messages.length-1].text.slice(0,55)}{messages[messages.length-1].text.length>55?'...':''}</div>
            </div>
          )}
        </div>
        {/* 스마트 노트 */}
        <div style={{ flex: 1, overflow: 'hidden', padding: isMobile ? '8px 10px' : 10, background: '#F5F5F5' }}>
          <SmartNote noteData={noteData} activeTab={activeNoteTab} onTabChange={setActiveNoteTab} />
        </div>
        {/* 대화 기록 */}
        <div style={{ background: '#111', display: 'flex', flexDirection: 'column', height: isMobile ? 150 : '100%', flexShrink: 0, borderTop: isMobile ? '1px solid rgba(255,255,255,0.08)' : 'none', borderLeft: isMobile ? 'none' : '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: 'white', fontSize: 11, fontWeight: 600 }}>💬 대화 기록</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 5, height: 5, borderRadius: '50%', background: '#38A169' }} /><span style={{ color: '#68D391', fontSize: 9 }}>음성인식 중</span></div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 8, scrollbarWidth: 'none' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, flexDirection: msg.role==='user'?'row-reverse':'row' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: msg.role==='ai'?`linear-gradient(135deg,${GOLD},#e8c05a)`:'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                  {msg.role==='ai' ? <img src={MONEYA_IMG} alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} /> : <span style={{ fontSize: 11 }}>👤</span>}
                </div>
                <div style={{ maxWidth: '72%' }}>
                  <div style={{ background: msg.role==='ai'?'rgba(255,255,255,0.08)':'rgba(212,160,23,0.15)', borderRadius: msg.role==='ai'?'4px 10px 10px 10px':'10px 4px 10px 10px', padding: '6px 9px', color: 'white', fontSize: 10, lineHeight: 1.5, border: msg.role==='ai'?'1px solid rgba(255,255,255,0.06)':`1px solid rgba(212,160,23,0.3)` }}>{msg.text}</div>
                  {msg.tag && <div style={{ fontSize: 9, color: GOLD, marginTop: 2, paddingLeft: 3 }}>{msg.tag}</div>}
                </div>
              </div>
            ))}
            {messages.length === 0 && <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 16 }}>대화가 시작되면 여기에 표시됩니다</div>}
          </div>
        </div>
      </div>
      {/* 컨트롤 바 */}
      <div style={{ background: 'rgba(13,13,13,0.95)', padding: '10px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexShrink: 0, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {[
          { icon: isMuted?'🔇':'🎤', label: isMuted?'음소거됨':'마이크', action: toggleMic, red: isMuted, size: 48 },
          { icon: isCamOff?'🚫':'📹', label: isCamOff?'카메라꺼짐':'카메라', action: toggleCam, red: isCamOff, size: 48 },
          { icon: '📞', label: '종료', action: endCall, red: true, size: 56 },
        ].map((btn, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' }} onClick={btn.action}>
            <div style={{ width: btn.size, height: btn.size, borderRadius: '50%', background: btn.red ? (i===2 ? '#E53E3E' : 'rgba(229,62,62,0.2)') : 'rgba(255,255,255,0.12)', border: btn.red && i!==2 ? '1px solid rgba(229,62,62,0.4)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: i===2?22:20, boxShadow: i===2?'0 4px 16px rgba(229,62,62,0.4)':'none', transition: 'all 0.2s' }}>{btn.icon}</div>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>{btn.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 일정 + 금융집 현황 합체 (기존 Schedule + MoneyaInfo 흡수) ──
function ScheduleWithHouse({ userData, displayName, onToast }: { userData: any; displayName: string; onToast: (msg: string) => void }) {
  const [checks, setChecks] = useState({ q: true, camera: false, env: false });
  const nextConsult = userData.nextConsultDate;
  const scores = userData.consultationScores || {};
  const latestScore = userData.latestScore || 0;
  const floorLabels = ['1층 기초체력','2층 안전장치','3층 부동산','4층 보장자산','5층 은퇴설계','6층 투자성장'];
  const floorScores = [scores.f1||0,scores.f2||0,scores.f3||0,scores.f4||0,scores.f5||0,scores.f6||0];
  let weakestIdx = 0; let weakestScore = 100;
  floorScores.forEach((s,i) => { if (s < weakestScore) { weakestScore = s; weakestIdx = i; } });
  let dDay: number|null = null; let consultDateStr = '';
  if (nextConsult) {
    const now = new Date();
    const consult = nextConsult.toDate ? nextConsult.toDate() : new Date(nextConsult);
    const diff = consult.getTime() - now.getTime();
    dDay = Math.ceil(diff/(1000*60*60*24));
    consultDateStr = consult.toLocaleDateString('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit',weekday:'short'}) + ' ' + consult.toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'});
  }
  return (
    <div className="overflow-y-auto h-full px-4 py-4 pb-6 space-y-4">
      {/* 다음 상담 */}
      <div className="bg-white rounded-2xl border shadow-sm p-5" style={{ borderColor: GOLD }}>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">다음 상담</p>
        {nextConsult ? (
          <>
            <p className="text-base font-bold text-gray-900">📅 {consultDateStr}</p>
            {dDay !== null && <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: GOLD }}>D-{dDay}</span>}
            <div className="mt-4">
              <p className="text-xs text-gray-400 mb-2">준비사항</p>
              {([{key:'q' as const,label:'사전 질문지 작성 완료'},{key:'camera' as const,label:'카메라/마이크 테스트'},{key:'env' as const,label:'조용한 환경 확보'}]).map(item => (
                <div key={item.key} onClick={() => setChecks(p => ({...p,[item.key]:!p[item.key]}))} className="flex items-center gap-2 py-2 border-b border-gray-50 cursor-pointer">
                  <span className={checks[item.key] ? 'text-green-500' : 'text-gray-300'}>{checks[item.key] ? '☑' : '☐'}</span>
                  <span className={`text-sm ${checks[item.key] ? 'text-green-600' : 'text-gray-600'}`}>{item.label}</span>
                </div>
              ))}
            </div>
            <div className="h-px bg-gray-100 my-4" />
            <button onClick={() => onToast('상담 시작 10분 전에 활성화됩니다')} className="w-full py-3 rounded-xl text-sm font-bold bg-gray-100 text-gray-400 mb-2">💻 AI 화상상담 입장하기</button>
            <p className="text-center text-xs text-gray-400">상담 시작 10분 전 활성화</p>
            <button onClick={() => onToast('일정 변경은 3일 전까지 가능합니다')} className="mt-2 w-full py-3 rounded-xl text-sm font-bold bg-gray-50 text-gray-500 border border-gray-100">📅 일정 변경 요청</button>
          </>
        ) : <p className="text-sm text-gray-400">예정된 상담이 없습니다.<br />AI 화상상담 탭에서 시작해보세요!</p>}
      </div>
      {/* 금융집 현황 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">내 금융집 현황</p>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🏠</span>
          <div>
            <span className="text-2xl font-extrabold" style={{ color: GOLD }}>{latestScore}점</span>
            <div className="w-32 bg-gray-100 rounded-full h-2 mt-1 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${latestScore}%`, background: GOLD }} /></div>
          </div>
        </div>
        {floorLabels.map((label, idx) => (
          <div key={label} className="flex items-center gap-2 mb-2">
            <span className="text-xs">{si(floorScores[idx])}</span>
            <span className="text-xs text-gray-500 w-20 shrink-0">{label}</span>
            <ScoreBar score={floorScores[idx]} color={floorScores[idx]>=80?'#10B981':floorScores[idx]>=60?'#F59E0B':'#EF4444'} />
            <span className={`text-xs font-bold w-6 text-right ${sc(floorScores[idx])}`}>{floorScores[idx]}</span>
          </div>
        ))}
      </div>
      {/* 머니야 메시지 */}
      <div className="bg-gray-50 rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">머니야 메시지</p>
        <div className="flex gap-3">
          <img src={MONEYA_IMG} alt="머니야" className="w-10 h-10 object-contain" />
          <div className="bg-white rounded-xl p-3 text-sm text-gray-700 leading-relaxed shadow-sm flex-1">
            {latestScore > 0 ? `${displayName}님, ${floorLabels[weakestIdx]}이 ${weakestScore}점으로 가장 취약합니다. 다음 상담에서 함께 개선해봐요!` : `${displayName}님, AI 화상상담 탭에서 첫 상담을 시작해보세요! 📹`}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 이력 (기존 그대로) ───────────────────────────
function History() {
  const count = 0;
  const grade = getCertGrade(count);
  return (
    <div className="overflow-y-auto h-full px-4 py-4 pb-6 space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">수료증 등급</p>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{grade.icon}</span>
          <div><p className="font-bold text-gray-900">{grade.grade}</p><p className="text-xs text-gray-400">총 {count}회 상담 완료</p></div>
        </div>
        <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-700">{grade.next}</div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
        <p className="text-gray-400 text-sm">아직 상담 이력이 없습니다</p>
      </div>
    </div>
  );
}

// ── 서류함 (기존 그대로) ─────────────────────────
function Documents({ onToast }: { onToast: (msg: string) => void }) {
  const [docs, setDocs] = useState<Record<string, ConsultationDoc | null>>({ application: null, insurance: null, pension: null, tax: null });
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadTarget, setUploadTarget] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docDefs = [{ key: 'application', label: '상담신청서', required: true, sub: '' }, { key: 'insurance', label: '보험증권', required: true, sub: '' }, { key: 'pension', label: '연금명세서', required: true, sub: '국민연금 + 퇴직연금' }, { key: 'tax', label: '세금신고서', required: false, sub: '' }];
  const handleUpload = async (file: File, docType: string) => {
    setUploading(docType);
    try {
      const docData: ConsultationDoc = { docType, fileName: file.name, fileUrl: URL.createObjectURL(file) };
      setDocs(prev => ({ ...prev, [docType]: docData }));
      onToast(`${docDefs.find(d => d.key === docType)?.label ?? docType} 업로드 완료! ✅`);
    } catch { onToast('업로드에 실패했습니다.'); }
    finally { setUploading(null); }
  };
  const requiredDocs = docDefs.filter(d => d.required);
  const completedRequired = requiredDocs.filter(d => !!docs[d.key]).length;
  const progress = Math.round((completedRequired / requiredDocs.length) * 100);
  return (
    <div className="overflow-y-auto h-full px-4 py-4 pb-6 space-y-4">
      <input ref={fileInputRef} type="file" className="hidden" accept="image/*,application/pdf" onChange={e => { const file = e.target.files?.[0]; if (file && uploadTarget) handleUpload(file, uploadTarget); e.target.value = ''; }} />
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex justify-between items-center mb-2"><p className="text-sm font-bold text-gray-700">필수 서류 제출 현황</p><span className="text-sm font-bold" style={{ color: GOLD }}>{completedRequired}/{requiredDocs.length} 완료</span></div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: GOLD }} /></div>
      </div>
      {(['필수','선택'] as const).map(section => (
        <div key={section} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{section} 서류</p>
          {docDefs.filter(d => section === '필수' ? d.required : !d.required).map(def => (
            <div key={def.key} className="py-3 border-b border-gray-50 last:border-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className={docs[def.key] ? 'text-green-500' : 'text-gray-300'}>{docs[def.key] ? '✅' : '⬜'}</span>
                  <div><p className="text-sm font-medium text-gray-700">{def.label}</p>{def.sub && !docs[def.key] && <p className="text-xs text-gray-400">{def.sub}</p>}{docs[def.key] && <p className="text-xs text-green-600">제출 완료</p>}</div>
                </div>
                {docs[def.key] ? (
                  <button onClick={() => window.open(docs[def.key]!.fileUrl,'_blank')} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-50 border border-gray-200 text-gray-500">보기</button>
                ) : (
                  <button disabled={uploading === def.key} onClick={() => { setUploadTarget(def.key); fileInputRef.current?.click(); }} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white disabled:opacity-50" style={{ background: GOLD }}>
                    {uploading === def.key ? '업로드 중...' : '📎 업로드'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── 구독자 허브 (핵심 변경: 탭 3개 수정) ─────────
function ConsultationHub({ user }: { user: any }) {
  const [activeSubTab, setActiveSubTab] = useState('dashboard');
  const [userData] = useState<any>({});
  const [toast, setToast] = useState<string | null>(null);
  const [modal, setModal] = useState<{ title: string; content: string } | null>(null);
  const displayName = user.displayName || '고객';

  const subTabs = [
    { id: 'dashboard', label: '홈',        icon: '🏠' },
    { id: 'finance',   label: '내 재무',    icon: '📊' },
    { id: 'chat',      label: 'AI 화상상담', icon: '📹' }, // ← 변경: 머니야 → AI 화상상담
    { id: 'schedule',  label: '일정',       icon: '📅' },
    { id: 'history',   label: '이력',       icon: '📋' },
    { id: 'files',     label: '서류함',     icon: '📎' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-100 px-4">
        <div className="flex overflow-x-auto">
          {subTabs.map(t => (
            <button key={t.id} onClick={() => setActiveSubTab(t.id)}
              className={`shrink-0 px-3 py-3 text-xs font-bold border-b-2 transition-colors ${activeSubTab === t.id ? '' : 'border-transparent text-gray-400'}`}
              style={activeSubTab === t.id ? { color: GOLD, borderColor: GOLD } : {}}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-hidden bg-gray-50">
        {activeSubTab === 'dashboard' && <HubDashboard user={user} />}
        {activeSubTab === 'finance'   && <MyFinance userData={userData} />}
        {activeSubTab === 'chat'      && <VideoConsult displayName={displayName} onToast={msg => setToast(msg)} />}
        {activeSubTab === 'schedule'  && <ScheduleWithHouse userData={userData} displayName={displayName} onToast={msg => setToast(msg)} />}
        {activeSubTab === 'history'   && <History />}
        {activeSubTab === 'files'     && <Documents onToast={msg => setToast(msg)} />}
      </div>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
      {modal && <Modal title={modal.title} content={modal.content} onClose={() => setModal(null)} />}
    </div>
  );
}

// ── 비구독자 서비스 소개 (기존 그대로) ───────────
function ServiceIntro({ onToast }: { onToast: (msg: string) => void }) {
  return (
    <div className="overflow-y-auto h-full pb-6">
      <div className="bg-gradient-to-b from-amber-50 to-white px-5 py-10 text-center">
        <div className="text-5xl mb-4">🏠💰</div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-2">AI 재무설계 상담</h2>
        <p className="text-gray-500 text-sm leading-relaxed">오상열 CFP(20년) × AI 머니야가 함께하는<br />맞춤 재무설계 서비스</p>
      </div>
      <div className="px-4 space-y-4">
        <div className="rounded-2xl border-2 p-5" style={{ borderColor: GOLD, background: '#fffdf5' }}>
          <div className="flex justify-between items-center mb-3"><span className="text-sm text-gray-600">초회 상담</span><span className="text-xl font-extrabold" style={{ color: GOLD }}>29,000원</span></div>
          <div className="h-px bg-amber-100 mb-3" />
          <div className="flex justify-between items-center"><span className="text-sm text-gray-600">정기 관리</span><span className="text-xl font-extrabold" style={{ color: GOLD }}>월 9,900원</span></div>
        </div>
        <button onClick={() => onToast('결제 페이지는 준비 중입니다 🙏')} className="w-full py-4 rounded-2xl font-extrabold text-white text-base shadow-lg" style={{ background: `linear-gradient(135deg, ${GOLD}, #e8c05a)` }}>상담 신청하기</button>
        <p className="text-center text-gray-400 text-xs">"하루 커피 한 잔 값으로<br />평생 재무설계 완성"</p>
      </div>
    </div>
  );
}

// ── 메인 페이지 (기존 그대로) ─────────────────────
export default function ConsultationPage({ user }: ConsultationPageProps) {
  const [isSubscriber] = useState(user?.email === 'ggorilla11@gmail.com');
  const [toast, setToast] = useState<string | null>(null);
  return (
    <div className="flex flex-col bg-gray-50" style={{ height: '100dvh', paddingBottom: '64px' }}>
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
        <h1 className="text-lg font-extrabold text-gray-900">💬 상담</h1>
        {isSubscriber && <span className="text-xs px-2 py-1 rounded-full font-bold text-white" style={{ background: GOLD }}>구독중</span>}
      </div>
      <div className="flex-1 overflow-hidden">
        {isSubscriber ? <ConsultationHub user={user} /> : <ServiceIntro onToast={msg => setToast(msg)} />}
      </div>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
