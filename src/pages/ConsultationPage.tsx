// ConsultationPage.tsx v4.0
// v4.0 수정사항:
// 1. 홈 서브탭 → 기존 그대로 (대화하기 버튼 텍스트)
// 2. 머니야 서브탭(3번째) → Claude AI 음성상담 화면
//    - 상단: 머니야 프로필 + 상태 표시
//    - 하단 고정: + 마이크 텍스트입력바
//    - 텍스트/키워드 → 텍스트 답변만
//    - 마이크 → ElevenLabs 음성 답변
// 3. 키워드 칩: 재무상담/저축률 진단/보험 분석/은퇴 계산/투자 조언
// 4. 나머지 서브탭 기존 그대로

import { useState, useRef, useEffect } from 'react';

interface ConsultationDoc { docType: string; fileName: string; fileUrl: string; }
interface ConsultationPageProps { user: any; }

const API_URL = 'https://moneya-server.onrender.com';
const WS_URL  = 'wss://moneya-server.onrender.com';
const GOLD = '#c9a53e';
const MONEYA_IMG = 'https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/AI%EB%A8%B8%EB%8B%88%EC%95%BC%20%ED%99%95%EC%A0%95%EC%9D%B4%EB%AF%B8%EC%A7%80%EC%95%88.png?alt=media&token=c250863d-7cda-424a-800d-884b20e30b1a';

function sc(s: number) { return s >= 80 ? 'text-green-600' : s >= 60 ? 'text-yellow-500' : 'text-red-500'; }
function si(s: number) { return s >= 80 ? '✅' : s >= 60 ? '⚠️' : '🔴'; }
function getCertGrade(n: number) {
  if (n >= 12) return { grade: 'S등급', icon: '💎', next: '최고 등급 달성!' };
  if (n >= 7)  return { grade: 'A등급', icon: '🥇', next: '12회 이상 → S등급' };
  if (n >= 3)  return { grade: 'B등급', icon: '🥈', next: '7회 이상 → A등급' };
  if (n >= 1)  return { grade: 'C등급', icon: '🥉', next: '3회 이상 → B등급' };
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

// ── 홈 대시보드 (기존 그대로) ─────────────────────
function MoneyaInfo({ userData, displayName, onToast }: { userData: any; displayName: string; onToast: (msg: string) => void }) {
  const scores = userData.consultationScores || {};
  const latestScore = userData.latestScore || 0;
  const nextConsult = userData.nextConsultDate || null;
  const floorLabels = ['1층 기초체력', '2층 안전장치', '3층 부동산', '4층 보장자산', '5층 은퇴설계', '6층 투자성장'];
  const floorScores = [scores.f1||0, scores.f2||0, scores.f3||0, scores.f4||0, scores.f5||0, scores.f6||0];
  let weakestIdx = 0; let weakestScore = 100;
  floorScores.forEach((s, i) => { if (s < weakestScore) { weakestScore = s; weakestIdx = i; } });
  let dDay: number | null = null; let isZoomActive = false; let consultDateStr = '';
  if (nextConsult) {
    const now = new Date();
    const consult = nextConsult.toDate ? nextConsult.toDate() : new Date(nextConsult);
    const diff = consult.getTime() - now.getTime();
    dDay = Math.ceil(diff / (1000 * 60 * 60 * 24));
    isZoomActive = diff > 0 && diff <= 10 * 60 * 1000;
    consultDateStr = consult.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' });
  }
  return (
    <div className="overflow-y-auto h-full px-4 py-4 pb-6 space-y-4">
      <div className="bg-white rounded-2xl border shadow-sm p-4" style={{ borderColor: GOLD }}>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">다음 정기상담</p>
        {nextConsult ? (
          <>
            <p className="text-base font-bold text-gray-900">📅 {consultDateStr}</p>
            {dDay !== null && <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: GOLD }}>D-{dDay}</span>}
            <div className="flex gap-2 mt-3">
              <button onClick={() => { if (isZoomActive && userData.zoomLink) window.open(userData.zoomLink, '_blank'); else onToast('상담 시작 10분 전에 활성화됩니다'); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold ${isZoomActive ? 'text-white' : 'bg-gray-100 text-gray-400'}`}
                style={isZoomActive ? { background: GOLD } : {}}>💻 줌 입장하기</button>
              <button onClick={() => onToast('일정 변경은 3일 전까지 가능합니다')} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-gray-50 text-gray-500 border border-gray-200">📅 일정변경</button>
            </div>
          </>
        ) : <p className="text-sm text-gray-400">예정된 상담이 없습니다</p>}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">내 금융집 현황</p>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🏠</span>
          <div><span className="text-2xl font-extrabold" style={{ color: GOLD }}>{latestScore}점</span>
            <div className="w-32 bg-gray-100 rounded-full h-2 mt-1 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${latestScore}%`, background: GOLD }} /></div>
          </div>
        </div>
        {floorLabels.map((label, idx) => (
          <div key={label} className="flex items-center gap-2 mb-2">
            <span className="text-xs">{si(floorScores[idx])}</span>
            <span className="text-xs text-gray-500 w-20 shrink-0">{label}</span>
            <ScoreBar score={floorScores[idx]} color={floorScores[idx] >= 80 ? '#10B981' : floorScores[idx] >= 60 ? '#F59E0B' : '#EF4444'} />
            <span className={`text-xs font-bold w-6 text-right ${sc(floorScores[idx])}`}>{floorScores[idx]}</span>
          </div>
        ))}
      </div>
      <div className="bg-gray-50 rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">머니야 메시지</p>
        <div className="flex gap-3">
          <img src={MONEYA_IMG} alt="머니야" className="w-10 h-10 object-contain" />
          <div className="bg-white rounded-xl p-3 text-sm text-gray-700 leading-relaxed shadow-sm flex-1">
            {latestScore > 0 ? `${displayName}님, ${floorLabels[weakestIdx]}이 ${weakestScore}점으로 가장 취약합니다. 다음 상담에서 함께 개선해봐요!` : `${displayName}님, 안녕하세요! 첫 상담을 예약해보세요.`}
          </div>
        </div>

      </div>
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

// ── 머니야 탭 (3번째) - Claude AI 음성상담 ─────────
function HubDashboard({ user }: { user: any }) {
  const displayName = user.displayName || '고객';
  const [messages, setMessages] = useState<{ id: string; role: 'user'|'assistant'; text: string }[]>([
    { id: '1', role: 'assistant', text: `안녕하세요 ${displayName}님! 저는 AI 재무설계사 머니야입니다.\n오상열 CFP의 금융집짓기 방법론으로 재무상담을 도와드릴게요.\n\n텍스트 입력 또는 마이크 버튼으로 말씀해주세요! 😊` }
  ]);
  const [inputText, setInputText]     = useState('');
  const [isLoading, setIsLoading]     = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('대기중');
  const [serverReady, setServerReady] = useState(false);

  const chatAreaRef    = useRef<HTMLDivElement>(null);
  const wsRef          = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef  = useRef<MediaStream | null>(null);
  const processorRef    = useRef<any>(null);
  const isPlayingRef    = useRef(false);
  const isConnectedRef  = useRef(false);

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

  // 텍스트 전송 → 텍스트 답변만 (음성 없음)
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

  // 음성모드 → ElevenLabs 음성 답변
  // MP3 청크 누적 버퍼
  const pcmChunksRef = useRef<string[]>([]);

  const playAudio = (b64: string) => {
    pcmChunksRef.current.push(b64);
  };

  // audio_end 수신 시 누적 PCM16 청크 합쳐서 재생 (OpenAI Realtime shimmer)
  const playAccumulatedAudio = async () => {
    if (!pcmChunksRef.current.length) return;
    try {
      const chunks = pcmChunksRef.current;
      pcmChunksRef.current = [];
      // base64 → Uint8Array 배열로 변환
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
      // PCM16 → Float32 변환
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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 24000, channelCount: 1, echoCancellation: true, noiseSuppression: true } });
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

      {/* ── 상단 머니야 프로필 배너 ── */}
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
                  <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
                  {voiceStatus}
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
        {/* 음성모드 파형 */}
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

      {/* ── 키워드 칩 ── */}
      <div className="px-4 pt-3 pb-1 flex gap-2 overflow-x-auto">
        {CHIPS.map(q => (
          <button key={q} onClick={() => sendTextMessage(q)}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border"
            style={{ color: GOLD, borderColor: GOLD, background: '#fffdf5' }}>
            {q}
          </button>
        ))}
      </div>

      {/* ── 대화창 ── */}
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

      {/* ── 하단 입력바 고정 ── */}
      <div className="bg-white border-t border-gray-100 px-4 pt-3 pb-4" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}>
        <div className="flex items-center gap-2">
          {/* + 버튼 */}
          <button className="w-10 h-10 rounded-full flex items-center justify-center border-2 flex-shrink-0"
            style={{ borderColor: GOLD, background: '#fffdf5' }}>
            <svg className="w-5 h-5" style={{ color: GOLD }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </button>
          {/* 마이크 버튼 */}
          <button onClick={toggleVoiceMode}
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
            style={{ background: isVoiceMode ? '#ef4444' : GOLD }}>
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
            </svg>
          </button>
          {/* 텍스트 입력 */}
          <div className="flex-1 flex items-center bg-gray-100 border border-gray-200 rounded-full px-4 py-2">
            <input type="text" value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyPress={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendTextMessage(inputText); } }}
              placeholder="머니야에게 말씀해주세요..."
              className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
              disabled={isLoading || isVoiceMode} />
          </div>
          {/* 전송 버튼 */}
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

// ── 일정 (기존 그대로) ────────────────────────────
function Schedule({ userData, onToast }: { userData: any; onToast: (msg: string) => void }) {
  const [checks, setChecks] = useState({ q: true, camera: false, env: false });
  const nextConsult = userData.nextConsultDate;
  let dDay: number | null = null; let isZoomActive = false; let consultDateStr = '';
  if (nextConsult) {
    const now = new Date();
    const consult = nextConsult.toDate ? nextConsult.toDate() : new Date(nextConsult);
    const diff = consult.getTime() - now.getTime();
    dDay = Math.ceil(diff / (1000 * 60 * 60 * 24));
    isZoomActive = diff > 0 && diff <= 10 * 60 * 1000;
    consultDateStr = consult.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' }) + ' ' + consult.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  }
  return (
    <div className="overflow-y-auto h-full px-4 py-4 pb-6 space-y-4">
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
            <button onClick={() => { if (isZoomActive && userData.zoomLink) window.open(userData.zoomLink,'_blank'); else onToast('상담 시작 10분 전에 활성화됩니다'); }} className={`w-full py-3 rounded-xl text-sm font-bold mb-2 ${isZoomActive ? 'text-white' : 'bg-gray-100 text-gray-400'}`} style={isZoomActive ? { background: GOLD } : {}}>💻 줌 상담 입장하기</button>
            {!isZoomActive && <p className="text-center text-xs text-gray-400">상담 시작 10분 전 활성화</p>}
            <button onClick={() => onToast('일정 변경은 3일 전까지 가능합니다')} className="mt-2 w-full py-3 rounded-xl text-sm font-bold bg-gray-50 text-gray-500 border border-gray-100">📅 일정 변경 요청</button>
          </>
        ) : <p className="text-sm text-gray-400">예정된 상담이 없습니다.<br />첫 상담을 신청해보세요!</p>}
      </div>
    </div>
  );
}

// ── 상담 이력 (기존 그대로) ───────────────────────
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

// ── 구독자 허브 ───────────────────────────────────
function ConsultationHub({ user }: { user: any }) {
  const [activeSubTab, setActiveSubTab] = useState('dashboard');
  const [userData] = useState<any>({});
  const [toast, setToast] = useState<string | null>(null);
  const [modal, setModal] = useState<{ title: string; content: string } | null>(null);
  const displayName = user.displayName || '고객';
  const subTabs = [
    { id: 'dashboard', label: '홈',    icon: '🏠' },
    { id: 'finance',   label: '내 재무', icon: '📊' },
    { id: 'chat',      label: '머니야', icon: '💬' },
    { id: 'schedule',  label: '일정',  icon: '📅' },
    { id: 'history',   label: '이력',  icon: '📋' },
    { id: 'files',     label: '서류함', icon: '📎' },
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
        {activeSubTab === 'chat'      && <MoneyaInfo userData={userData} displayName={displayName} onToast={msg => setToast(msg)} />}
        {activeSubTab === 'schedule'  && <Schedule userData={userData} onToast={msg => setToast(msg)} />}
        {activeSubTab === 'history'   && <History />}
        {activeSubTab === 'files'     && <Documents onToast={msg => setToast(msg)} />}
      </div>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
      {modal && <Modal title={modal.title} content={modal.content} onClose={() => setModal(null)} />}
    </div>
  );
}

// ── 비구독자 서비스 소개 ───────────────────────────
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

// ── 메인 페이지 ───────────────────────────────────
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
