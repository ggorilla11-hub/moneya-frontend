// ConsultationPage.tsx v5.1
// v5.0 수정사항:
// 1. 서브탭 "머니야" → "AI 화상상담" (id: 'chat', icon: 📹)
// 2. chat 탭 렌더링: MoneyaInfo → VideoConsult (WebRTC)
// 3. schedule 탭: 기존 Schedule + MoneyaInfo(금융집 현황) 합체 → ScheduleWithHouse
// 4. 지출탭 및 기타 컴포넌트 일절 변경 없음
// 5. VideoConsult: Phase1(WebRTC) + Phase2(스마트노트) 완전 통합
// v5.1 추가사항:
// 6. [자동재연결] 서버에서 reconnecting/reconnected 메시지 수신 시 UI 표시
//    - reconnecting: 하단에 "🔄 연결 최적화 중..." 작은 배너 표시
//    - reconnected: 배너 자동 숨김 (2초 후)
//    - session_max_reached: 상담 종료 안내

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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// [추가 v5.1] 자동재연결 배너 컴포넌트
// 서버에서 reconnecting 메시지가 오면 표시, reconnected 오면 숨김
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ReconnectBanner({ visible, count }: { visible: boolean; count: number }) {
  if (!visible) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999,
      background: 'rgba(30,30,30,0.92)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(212,160,23,0.4)',
      borderRadius: 24,
      padding: '8px 18px',
      display: 'flex', alignItems: 'center', gap: 8,
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      pointerEvents: 'none',
      animation: 'rcFadeIn 0.3s ease',
    }}>
      <style>{`@keyframes rcFadeIn{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}} @keyframes rcSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 14, height: 14, border: '2px solid rgba(212,160,23,0.3)', borderTop: '2px solid #D4A017', borderRadius: '50%', animation: 'rcSpin 0.8s linear infinite', flexShrink: 0 }} />
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>🔄 연결 최적화 중... ({count}/3회)</span>
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
  // ── [추가 v5.1] 홈탭 자동재연결 배너 상태 ──
  const [reconnecting, setReconnecting] = useState(false);
  const [reconnectCount, setReconnectCount] = useState(0);
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
          // ── [추가 v5.1] 자동재연결 메시지 처리 ──
          if (msg.type === 'reconnecting') {
            setReconnecting(true);
            setReconnectCount(msg.count || 1);
          }
          if (msg.type === 'reconnected') {
            // 2초 후 배너 숨김 (고객이 확인할 시간)
            setTimeout(() => setReconnecting(false), 2000);
          }
          if (msg.type === 'session_max_reached') {
            setReconnecting(false);
            setVoiceStatus('상담시간 종료');
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', text: '최대 상담 시간(75분)에 도달했습니다. 상담을 마무리하겠습니다. 오늘 상담 감사합니다! 😊' }]);
            stopVoiceMode();
          }
        } catch {}
      };
      ws.onerror = () => { setVoiceStatus('연결 실패'); cleanupVoiceMode(); setIsVoiceMode(false); };
      ws.onclose = () => { isConnectedRef.current = false; setVoiceStatus('대기중'); setIsVoiceMode(false); setReconnecting(false); };
    } catch { alert('마이크 권한이 필요합니다.'); cleanupVoiceMode(); setIsVoiceMode(false); setVoiceStatus('대기중'); }
  };

  const stopVoiceMode = () => { cleanupVoiceMode(); setIsVoiceMode(false); setVoiceStatus('대기중'); setReconnecting(false); };
  const toggleVoiceMode = () => { isVoiceMode ? stopVoiceMode() : startVoiceMode(); };
  const CHIPS = ['재무상담', '저축률 진단', '보험 분석', '은퇴 계산', '투자 조언'];

  return (
    <div className="flex flex-col h-full" style={{ paddingBottom: '64px' }}>
      {/* ── [추가 v5.1] 자동재연결 배너 ── */}
      <ReconnectBanner visible={reconnecting} count={reconnectCount} />

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
                style={{ height: (10 + (i % 4) * 6)+'px', animationDelay: (i * 80)+'ms' }} />
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
                {[0,150,300].map(d => <div key={d} className="w-2 h-2 rounded-full animate-bounce" style={{ background: GOLD, animationDelay: d+'ms' }} />)}
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
// ── AI 화상상담 탭 (WebRTC + 스마트노트 + Function Calling) ────
// ══════════════════════════════════════════════════════════════

type NoteType = 'house_svg' | 'chart' | 'calculation' | 'video' | 'web' | 'image' | 'checklist';
type HighlightFloor = 'basement' | 'pillar_debt' | 'pillar_savings' | 'pillar_retirement' | 'eaves' | 'roof_investment' | 'roof_tax' | 'chimney' | 'none';

interface NoteState {
  noteType: NoteType;
  title: string;
  content: any;
  highlightFloor: HighlightFloor;
}
interface VCMessage { role: 'ai' | 'user'; text: string; tag?: string; time: string; }

const DEFAULT_NOTE_STATE: NoteState = {
  noteType: 'house_svg',
  title: '금융집짓기®',
  content: {},
  highlightFloor: 'none',
};

type NoteTabId = 'house' | 'chart' | 'calc' | 'video' | 'web';
const NOTE_TYPE_TO_TAB: Partial<Record<NoteType, NoteTabId>> = {
  house_svg: 'house', chart: 'chart', calculation: 'calc', video: 'video', web: 'web', checklist: 'house',
};

function VideoConsult({ displayName, onToast }: { displayName: string; onToast: (msg: string) => void }) {
  const [phase, setPhase] = useState<'idle'|'connecting'|'active'|'chat'|'ended'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [noteState, setNoteState] = useState<NoteState>(DEFAULT_NOTE_STATE);
  const [activeNoteTab, setActiveNoteTab] = useState<NoteTabId>('house');
  const [messages, setMessages] = useState<VCMessage[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [aiStatus, setAiStatus] = useState('🤖 분석 중...');
  const [playingVideo, setPlayingVideo] = useState('');
  // ── [추가 v5.1] 화상탭 자동재연결 배너 상태 ──
  const [reconnecting, setReconnecting] = useState(false);
  const [reconnectCount, setReconnectCount] = useState(0);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<Int16Array[]>([]);
  const isPlayingRef = useRef(false);
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

  const handleSmartNoteUpdate = useCallback((msg: any) => {
    const noteType: NoteType = msg.noteType || 'house_svg';
    const title: string = msg.title || '';
    const content = msg.content || {};
    const highlightFloor: HighlightFloor = msg.highlightFloor || 'none';
    setNoteState({ noteType, title, content, highlightFloor });
    const tab = NOTE_TYPE_TO_TAB[noteType];
    if (tab) setActiveNoteTab(tab);
    const statusMap: Partial<Record<NoteType, string>> = {
      house_svg: '🏠 금융집짓기 분석 중', chart: '📊 차트 생성 중', calculation: '🧮 계산 완료',
      video: '🎬 영상 준비됨', web: '🌐 웹 자료 검색 완료', checklist: '✅ 액션플랜 생성됨',
    };
    if (statusMap[noteType]) setAiStatus(statusMap[noteType]!);
  }, []);

  const handleSmartNoteClear = useCallback(() => {
    setNoteState(DEFAULT_NOTE_STATE);
    setActiveNoteTab('house');
    setAiStatus('🤖 분석 중...');
  }, []);

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

  const endCall = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) { wsRef.current.send(JSON.stringify({ type: 'stop' })); wsRef.current.close(); }
    localStreamRef.current?.getTracks().forEach(t => t.stop()); localStreamRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
    setElapsed(0);
    setReconnecting(false);
    setPhase('ended');
  }, []);

  const startCall = useCallback(async () => {
    setPhase('connecting');
    let audioStream: MediaStream | null = null;
    try {
      audioStream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 24000, channelCount: 1, echoCancellation: true, noiseSuppression: true } });
    } catch {
      onToast('마이크 권한이 필요합니다');
      setPhase('idle');
      return;
    }
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } });
      videoStream.getTracks().forEach(t => audioStream!.addTrack(t));
    } catch { /* 카메라 없어도 OK */ }
    localStreamRef.current = audioStream;
    if (localVideoRef.current) localVideoRef.current.srcObject = audioStream;

    setTimeout(() => {
      setPhase('active');
      const t = new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'});
      setMessages([{ role:'ai', text:`안녕하세요, ${displayName}님! 오상열 CFP의 금융집짓기® 8단계 재무상담을 시작하겠습니다. 현재 월 수입과 지출을 말씀해 주세요.`, tag:'📊 1단계: 수입지출 분석 시작', time:t }]);
      timerRef.current = setInterval(() => setElapsed(e => e+1), 1000);
      try {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;
        ws.onopen = () => {
          ws.send(JSON.stringify({ type: 'start_consult', userName: displayName, mode: 'video' }));
        };
        ws.onmessage = (event) => {
          if (event.data instanceof ArrayBuffer) { playAudioChunk(new Int16Array(event.data)); return; }
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'session_started') {
              const ac = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
              const src = ac.createMediaStreamSource(audioStream!);
              const prc = ac.createScriptProcessor(4096, 1, 1);
              src.connect(prc); prc.connect(ac.destination);
              prc.onaudioprocess = (ev) => {
                if (ws.readyState !== WebSocket.OPEN) return;
                const f32 = ev.inputBuffer.getChannelData(0);
                const i16 = new Int16Array(f32.length);
                for (let i = 0; i < f32.length; i++) i16[i] = Math.max(-32768, Math.min(32767, Math.round(f32[i]*32768)));
                ws.send(JSON.stringify({ type: 'audio', data: btoa(String.fromCharCode(...new Uint8Array(i16.buffer))) }));
              };
            }
            if (msg.type === 'transcript') {
              const t2 = new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'});
              setMessages(p => [...p, { role: msg.role === 'assistant' ? 'ai' : 'user', text: msg.text, time: t2 }]);
              if (msg.role === 'assistant') detectStep(msg.text || '');
            }
            if (msg.type === 'audio' && msg.data) {
              try {
                const raw = atob(msg.data);
                const i16 = new Int16Array(raw.length / 2);
                for (let i2 = 0; i2 < i16.length; i2++) i16[i2] = (raw.charCodeAt(i2*2)) | (raw.charCodeAt(i2*2+1) << 8);
                playAudioChunk(i16);
              } catch {}
            }
            if (msg.type === 'smart_note_update') handleSmartNoteUpdate(msg);
            if (msg.type === 'smart_note_clear') handleSmartNoteClear();
            if (msg.type === 'interrupt') { audioQueueRef.current = []; isPlayingRef.current = false; }
            // ── [추가 v5.1] 화상탭 자동재연결 메시지 처리 ──
            if (msg.type === 'reconnecting') {
              setReconnecting(true);
              setReconnectCount(msg.count || 1);
            }
            if (msg.type === 'reconnected') {
              setTimeout(() => setReconnecting(false), 2000);
            }
            if (msg.type === 'session_max_reached') {
              setReconnecting(false);
              onToast('최대 상담 시간(75분)에 도달했습니다. 상담을 마무리합니다.');
              endCall();
            }
          } catch {}
        };
        ws.onerror = () => {};
        ws.onclose = () => { setReconnecting(false); };
      } catch {}
    }, 2000);
  }, [displayName, playAudioChunk, handleSmartNoteUpdate, handleSmartNoteClear, detectStep, onToast, endCall]);

  useEffect(() => { return () => { endCall(); audioCtxRef.current?.close(); }; }, []);

  if (phase === 'chat') {
    return (
      <div style={{ background:'#0D0D0D', height:'100%', display:'flex', flexDirection:'column' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', background:'rgba(0,0,0,0.7)', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ color:'white', fontSize:14, fontWeight:600 }}>💬 대화 기록</span>
          <button onClick={() => setPhase('active')} style={{ background:'rgba(255,255,255,0.1)', border:'none', color:'rgba(255,255,255,0.7)', padding:'5px 12px', borderRadius:20, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>← 화상으로</button>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:16, display:'flex', flexDirection:'column', gap:12 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display:'flex', gap:8, flexDirection:msg.role==='user'?'row-reverse':'row', alignItems:'flex-end' }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background:msg.role==='ai'?'linear-gradient(135deg,'+GOLD+',#e8c05a)':'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, overflow:'hidden' }}>
                {msg.role==='ai' ? <img src={MONEYA_IMG} alt="" style={{ width:22, height:22, objectFit:'contain' }} /> : <span style={{ fontSize:14 }}>👤</span>}
              </div>
              <div style={{ maxWidth:'70%' }}>
                <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', marginBottom:2 }}>{msg.role==='ai'?'AI 머니야':'고객'} · {msg.time}</div>
                <div style={{ background:msg.role==='ai'?'rgba(255,255,255,0.1)':'rgba(212,160,23,0.15)', borderRadius:msg.role==='ai'?'4px 14px 14px 14px':'14px 4px 14px 14px', padding:'9px 12px', fontSize:12, color:msg.role==='ai'?'rgba(255,255,255,0.9)':'white', lineHeight:1.5, border:msg.role==='ai'?'1px solid rgba(255,255,255,0.06)':'1px solid rgba(212,160,23,0.3)' }}>{msg.text}</div>
                {msg.tag && <div style={{ display:'inline-flex', alignItems:'center', gap:4, background:'rgba(212,160,23,0.15)', border:'1px solid rgba(212,160,23,0.3)', borderRadius:20, padding:'3px 8px', fontSize:10, color:GOLD, marginTop:4 }}>{msg.tag}</div>}
              </div>
            </div>
          ))}
          {messages.length === 0 && <div style={{ textAlign:'center', color:'rgba(255,255,255,0.3)', fontSize:12, marginTop:40 }}>대화가 시작되면 여기에 표시됩니다</div>}
        </div>
      </div>
    );
  }

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
            { icon: '⏱', label: '상담 시간', value: '최대 75분 (자동재연결 3회 보장)' },
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
        <button onClick={startCall} style={{ background: 'linear-gradient(135deg,'+GOLD+',#e8c05a)', color: 'white', border: 'none', width: '100%', padding: 18, borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 20px rgba(212,160,23,0.4)', fontFamily: 'inherit' }}>
          📹 화상상담 시작하기
        </button>
        <p style={{ textAlign: 'center', fontSize: 11, color: '#AAA', marginTop: 8 }}>카메라와 마이크 권한이 필요합니다</p>
      </div>
    );
  }

  if (phase === 'connecting') {
    return (
      <div style={{ background: '#0A0A0A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px 20px' }}>
        <style>{`@keyframes vcPulse{0%,100%{box-shadow:0 0 0 0 rgba(212,160,23,0.4)}50%{box-shadow:0 0 0 20px rgba(212,160,23,0)}} @keyframes vcBounce{0%,100%{transform:translateY(0);opacity:0.4}50%{transform:translateY(-8px);opacity:1}}`}</style>
        <div style={{ width: 100, height: 100, background: 'linear-gradient(135deg,'+GOLD+',#e8c05a)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, animation: 'vcPulse 2s ease-in-out infinite', overflow: 'hidden' }}>
          <img src={MONEYA_IMG} alt="머니야" style={{ width: 80, height: 80, objectFit: 'contain' }} />
        </div>
        <h3 style={{ color: 'white', fontSize: 18, fontWeight: 600, marginBottom: 8 }}>AI 머니야 연결 중...</h3>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 32 }}>카메라와 AI 음성을 준비하고 있습니다</p>
        <div style={{ display: 'flex', gap: 8 }}>
          {[0, 0.2, 0.4].map((delay, i) => <div key={i} style={{ width: 8, height: 8, background: GOLD, borderRadius: '50%', animation: 'vcBounce 1.2s ease-in-out '+delay+'s infinite' }} />)}
        </div>
        <button onClick={() => { localStreamRef.current?.getTracks().forEach(t => t.stop()); setPhase('idle'); }} style={{ marginTop: 40, background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.2)', padding: '10px 28px', borderRadius: 30, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>취소</button>
      </div>
    );
  }

  const STEPS = ['수입지출 분석','보험 적정성','저축 설계','부채 관리','은퇴 설계','투자 설계','세금 설계','부동산 설계'];
  const NOTE_STATUS: Record<string,string> = {
    house:'🏠 금융집짓기 분석 중', chart:'📊 포트폴리오 계산 중',
    calc:'🧮 수치 계산 완료', video:'🎬 영상 라이브러리', web:'🌐 웹 자료 검색 완료'
  };
  const handleTabChange = (tab: 'house'|'chart'|'calc'|'video'|'web') => {
    setActiveNoteTab(tab);
    setAiStatus(NOTE_STATUS[tab]);
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#111', color:'#F5F5F7', overflow:'hidden', fontFamily:'inherit' }}>
      {/* ── [추가 v5.1] 화상탭 자동재연결 배너 ── */}
      <ReconnectBanner visible={reconnecting} count={reconnectCount} />

      <style>{`
        @keyframes sLivep{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes sWave{0%,100%{height:4px;opacity:0.4}50%{height:18px;opacity:1}}
        @keyframes sRing{0%,100%{opacity:0.6;transform:scale(1)}50%{opacity:1;transform:scale(1.03)}}
        @keyframes sFadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes sDot{0%,100%{transform:translateY(0);opacity:0.4}50%{transform:translateY(-4px);opacity:1}}
        .sntab{padding:5px 10px;border-radius:6px;font-size:11px;font-weight:600;color:#888;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:4px;border:none;background:transparent;font-family:inherit;}
        .sntab:hover{background:#F5F5F5;color:#444;}
        .sntab.son{background:#FFF3CC;color:#D4A017;}
        .saitem{background:#3A3A3C;border-radius:10px;padding:10px 12px;margin-bottom:8px;border-left:3px solid transparent;animation:sFadeIn 0.4s ease;}
        .saitem.red{border-left-color:#FF3B30;}.saitem.yellow{border-left-color:#FF9500;}.saitem.green{border-left-color:#34C759;}.saitem.blue{border-left-color:#0A84FF;}
        .sstep{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:8px;margin-bottom:3px;font-size:11px;color:rgba(255,255,255,0.55);transition:all 0.3s;}
        .sstep.done{color:#34C759;}.sstep.active{background:rgba(212,160,23,0.1);color:#D4A017;font-weight:600;}
        .sstepnum{width:18px;height:18px;border-radius:50%;background:#3A3A3C;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;flex-shrink:0;}
        .sstep.done .sstepnum{background:#34C759;color:white;}.sstep.active .sstepnum{background:#D4A017;color:white;}
        .ssmsg{display:flex;align-items:flex-start;gap:8px;animation:sFadeIn 0.3s ease;}
        .ssmsg.user{flex-direction:row-reverse;}
      `}</style>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 16px', height:48, background:'rgba(0,0,0,0.8)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.08)', flexShrink:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:28, height:28, borderRadius:'50%', overflow:'hidden', background:'linear-gradient(135deg,#B8820A,#E8C040)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <img src={MONEYA_IMG} alt="" style={{ width:24, height:24, objectFit:'contain' }} />
          </div>
          <span style={{ fontSize:14, fontWeight:700, color:'white' }}>AI <span style={{ color:'#D4A017' }}>머니야</span></span>
          <span style={{ fontSize:10, color:'rgba(255,255,255,0.5)' }}>스마트 화상상담</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(52,199,89,0.15)', border:'1px solid rgba(52,199,89,0.3)', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, color:'#34C759' }}>
            <div style={{ width:6, height:6, background:'#34C759', borderRadius:'50%', animation:'sLivep 1.8s ease-in-out infinite' }} />LIVE
          </div>
          <div style={{ fontSize:14, fontWeight:700, color:'white', fontVariantNumeric:'tabular-nums' }}>{formatTime(elapsed)}</div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.5)' }}>{displayName} 고객님</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {[
            { id:'mic', label: isMuted?'🔇 음소거':'🎤 마이크', on:!isMuted, action:()=>{localStreamRef.current?.getAudioTracks().forEach(t=>{t.enabled=isMuted});setIsMuted(p=>!p);} },
            { id:'cam', label: isCamOff?'🚫 카메라꺼짐':'📹 카메라', on:!isCamOff, action:()=>{localStreamRef.current?.getVideoTracks().forEach(t=>{t.enabled=isCamOff});setIsCamOff(p=>!p);} },
            { id:'rec', label:'⏺ 녹화', on:false, action:()=>onToast('녹화 준비 중') },
          ].map(btn => (
            <div key={btn.id} onClick={btn.action} style={{ background: btn.on?'rgba(212,160,23,0.2)':'rgba(255,255,255,0.1)', border: btn.on?'1px solid rgba(212,160,23,0.4)':'1px solid rgba(255,255,255,0.15)', padding:'4px 12px', borderRadius:20, fontSize:11, color: btn.on?'#D4A017':'rgba(255,255,255,0.6)', cursor:'pointer' }}>{btn.label}</div>
          ))}
          <div onClick={endCall} style={{ background:'rgba(255,59,48,0.15)', border:'1px solid rgba(255,59,48,0.3)', padding:'4px 14px', borderRadius:20, fontSize:11, color:'#FF3B30', cursor:'pointer', fontWeight:600 }}>📞 종료</div>
        </div>
      </div>

      <div style={{ flex:1, display:'grid', gridTemplateColumns:'220px 1fr 240px', gridTemplateRows:'1fr 150px', overflow:'hidden' }}>

        <div style={{ gridRow:'1/2', background:'linear-gradient(145deg,#0D1B3E,#0F2A5C,#163A6A)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden', borderRight:'1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 50% 40%,rgba(212,160,23,0.08) 0%,transparent 65%)' }} />
          <div style={{ position:'absolute', top:12, left:12, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(8px)', border:'1px solid rgba(212,160,23,0.3)', padding:'4px 10px', borderRadius:20, fontSize:10, color:'#D4A017', fontWeight:600, zIndex:3 }}>{aiStatus}</div>
          <div style={{ position:'relative', zIndex:2, display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
            <div style={{ width:88, height:88, borderRadius:'50%', overflow:'hidden', background:'linear-gradient(135deg,#B8820A,#E8C040)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 40px rgba(212,160,23,0.3)', position:'relative' }}>
              <img src={MONEYA_IMG} alt="머니야" style={{ width:76, height:76, objectFit:'contain' }} />
              <div style={{ position:'absolute', inset:-4, borderRadius:'50%', border:'2px solid rgba(212,160,23,0.4)', animation:'sRing 2s ease-in-out infinite', pointerEvents:'none' }} />
            </div>
            <div style={{ fontSize:13, fontWeight:700, color:'white' }}>AI 머니야</div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.5)', marginTop:-8 }}>오상열 CFP 20년 학습</div>
            <div style={{ display:'flex', alignItems:'center', gap:3, height:20, marginTop:4 }}>
              {[0,0.12,0.24,0.12,0].map((d,i) => <div key={i} style={{ width:3, borderRadius:3, background:'#E8C040', animation:'sWave 0.9s ease-in-out '+d+'s infinite' }} />)}
            </div>
          </div>
          <div style={{ position:'absolute', bottom:12, right:12, width:72, height:96, background:'linear-gradient(145deg,#2a2a2a,#1a1a1a)', borderRadius:10, border:'1.5px solid rgba(255,255,255,0.15)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:5, cursor:'pointer', zIndex:3, boxShadow:'0 4px 16px rgba(0,0,0,0.5)', overflow:'hidden' }}>
            <video ref={localVideoRef} autoPlay playsInline muted style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', transform:'scaleX(-1)' }} />
            <span style={{ fontSize:24, position:'relative', zIndex:1 }}>👤</span>
            <span style={{ fontSize:9, color:'rgba(255,255,255,0.4)', position:'relative', zIndex:1 }}>내 화면</span>
          </div>
        </div>

        <div style={{ gridRow:'1/2', background:'#FAFAF8', display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 14px', background:'white', borderBottom:'1px solid #E8E8E8', flexShrink:0, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ display:'flex', gap:2 }}>
              {([['house','🏠 금융집짓기'],['chart','📊 포트폴리오'],['calc','🧮 계산기'],['video','🎬 영상'],['web','🌐 웹자료']] as any[]).map(([id,label]: any) => (
                <button key={id} className={'sntab'+(activeNoteTab===id?' son':'')} onClick={() => handleTabChange(id)}>{label}</button>
              ))}
            </div>
            <div style={{ display:'flex', gap:4 }}>
              {['💾','⛶','↗'].map((ic,i) => <div key={i} style={{ width:28, height:28, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, cursor:'pointer', color:'#666' }}>{ic}</div>)}
            </div>
          </div>

          <div style={{ flex:1, overflowY:'auto', overflowX:'hidden', padding:'20px 24px', scrollbarWidth:'thin', scrollbarColor:'rgba(0,0,0,0.1) transparent' }}>
            {noteState.title && noteState.title !== '금융집짓기®' && (
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14, padding:'8px 12px', background:'rgba(212,160,23,0.08)', borderRadius:10, border:'1px solid rgba(212,160,23,0.2)' }}>
                <div style={{ width:3, height:14, background:'#D4A017', borderRadius:2, flexShrink:0 }} />
                <span style={{ fontSize:12, fontWeight:700, color:'#0F2A5C' }}>{noteState.title}</span>
                <span style={{ fontSize:10, color:'#888', marginLeft:'auto' }}>AI 머니야 분석</span>
              </div>
            )}

            {activeNoteTab === 'house' && noteState.noteType !== 'checklist' && (
              <div style={{animation:'sFadeIn 0.3s ease'}}>
                <div style={{fontSize:12,fontWeight:700,color:'#0F2A5C',marginBottom:12,display:'flex',alignItems:'center',gap:6}}>
                  <span style={{width:3,height:14,background:'#D4A017',borderRadius:2,display:'inline-block'}}/>
                  🏠 금융집짓기® — {displayName} 고객님 현황
                </div>
                <svg width="100%" viewBox="0 0 520 340" xmlns="http://www.w3.org/2000/svg" style={{display:'block',borderRadius:8,overflow:'hidden'}}>
                  <defs>
                    <linearGradient id="snGold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style={{stopColor:'#C8920F'}}/><stop offset="100%" style={{stopColor:'#E8C040'}}/></linearGradient>
                    <linearGradient id="snNavy" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style={{stopColor:'#1A3A6E'}}/><stop offset="100%" style={{stopColor:'#0F2A5C'}}/></linearGradient>
                    <filter id="snShadow"><feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15"/></filter>
                  </defs>
                  <rect width="520" height="340" fill="#F8F9FC"/>
                  <rect x="360" y="30" width="40" height="60" rx="4" fill="#9B59B6" opacity={(noteState.highlightFloor==='chimney')?1:0.7}/>
                  {(noteState.highlightFloor==='chimney')&&<rect x="360" y="30" width="40" height="60" rx="4" fill="none" stroke="#D4A017" strokeWidth="3"/>}
                  <text x="380" y="53" textAnchor="middle" fontSize="9" fill="white" fontWeight="700">부동산</text>
                  <text x="380" y="66" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.8)">설계</text>
                  {noteState.content?.scores?.chimney!==undefined&&<text x="380" y="82" textAnchor="middle" fontSize="10" fill="#E8C040" fontWeight="700">{noteState.content?.scores?.chimney}점</text>}
                  <polygon points="80,130 260,40 440,130" fill="url(#snNavy)" filter="url(#snShadow)" opacity={(noteState.highlightFloor==='roof_investment')||(noteState.highlightFloor==='roof_tax')?1:0.9}/>
                  {((noteState.highlightFloor==='roof_investment')||(noteState.highlightFloor==='roof_tax'))&&<polygon points="80,130 260,40 440,130" fill="none" stroke="#D4A017" strokeWidth="3"/>}
                  <text x="260" y="88" textAnchor="middle" fontSize="11" fill="white" fontWeight="700">투자설계</text>
                  <text x="260" y="103" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.7)">다락방 / 세금설계</text>
                  <rect x="80" y="128" width="360" height="22" fill="#E67E22" opacity={(noteState.highlightFloor==='eaves')?1:0.85}/>
                  {(noteState.highlightFloor==='eaves')&&<rect x="80" y="128" width="360" height="22" fill="none" stroke="#D4A017" strokeWidth="2"/>}
                  <text x="260" y="143" textAnchor="middle" fontSize="10" fill="white" fontWeight="700">생로병사 (처마보)</text>
                  <rect x="82" y="150" width="100" height="110" rx="4" fill="#3498DB" opacity={(noteState.highlightFloor==='pillar_debt')?1:0.8} filter="url(#snShadow)"/>
                  {(noteState.highlightFloor==='pillar_debt')&&<rect x="82" y="150" width="100" height="110" rx="4" fill="none" stroke="#D4A017" strokeWidth="3"/>}
                  <text x="132" y="197" textAnchor="middle" fontSize="10" fill="white" fontWeight="700">부채설계</text>
                  <text x="132" y="212" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.65)">(거실)</text>
                  {noteState.content?.scores?.pillar_debt!==undefined&&<text x="132" y="228" textAnchor="middle" fontSize="10" fill="#E8C040" fontWeight="700">{noteState.content?.scores?.pillar_debt}점</text>}
                  <rect x="210" y="150" width="100" height="110" rx="4" fill="#27AE60" opacity={(noteState.highlightFloor==='pillar_savings')?1:0.8} filter="url(#snShadow)"/>
                  {(noteState.highlightFloor==='pillar_savings')&&<rect x="210" y="150" width="100" height="110" rx="4" fill="none" stroke="#D4A017" strokeWidth="3"/>}
                  <text x="260" y="197" textAnchor="middle" fontSize="10" fill="white" fontWeight="700">저축설계</text>
                  <text x="260" y="212" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.65)">(건넌방)</text>
                  {noteState.content?.scores?.pillar_savings!==undefined&&<text x="260" y="228" textAnchor="middle" fontSize="10" fill="#E8C040" fontWeight="700">{noteState.content?.scores?.pillar_savings}점</text>}
                  <rect x="338" y="146" width="104" height="118" rx="4" fill="url(#snGold)" filter="url(#snShadow)" opacity={(noteState.highlightFloor==='pillar_retirement')?1:0.95}/>
                  {(noteState.highlightFloor==='pillar_retirement')&&<rect x="338" y="146" width="104" height="118" rx="4" fill="none" stroke="white" strokeWidth="3"/>}
                  <text x="390" y="193" textAnchor="middle" fontSize="10" fill="white" fontWeight="700">은퇴설계 ★</text>
                  <text x="390" y="208" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.75)">(안방)</text>
                  {noteState.content?.scores?.pillar_retirement!==undefined&&<text x="390" y="226" textAnchor="middle" fontSize="10" fill="white" fontWeight="700">{noteState.content?.scores?.pillar_retirement}점</text>}
                  <rect x="82" y="262" width="360" height="60" rx="4" fill="#2C3E50" opacity={(noteState.highlightFloor==='basement')?1:0.9} filter="url(#snShadow)"/>
                  {(noteState.highlightFloor==='basement')&&<rect x="82" y="262" width="360" height="60" rx="4" fill="none" stroke="#E74C3C" strokeWidth="3"/>}
                  <text x="200" y="290" textAnchor="middle" fontSize="10" fill="white" fontWeight="700">🛡️ 보장자산 (보험)</text>
                  <text x="200" y="308" textAnchor="middle" fontSize="9" fill={(noteState.highlightFloor==='basement')?'#FF6B6B':'rgba(255,255,255,0.65)'}>
                    {noteState.content?.scores?.basement!==undefined?noteState.content?.scores?.basement+'점':'지하층 — 재무 토대'}
                  </text>
                  <text x="380" y="290" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.8)" fontWeight="600">🔥 비상예비금</text>
                  <text x="380" y="308" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.55)">생활비 3~6개월</text>
                </svg>
                {noteState.content?.message&&<div style={{marginTop:10,padding:'10px 14px',background:'rgba(212,160,23,0.08)',border:'1px solid rgba(212,160,23,0.2)',borderRadius:10,fontSize:12,color:'#0F2A5C',lineHeight:1.6}}>💡 {noteState.content?.message}</div>}
              </div>
            )}

            {activeNoteTab === 'chart' && noteState.noteType !== 'chart' && (
              <div style={{animation:'sFadeIn 0.3s ease'}}>
                <div style={{fontSize:12,fontWeight:700,color:'#0F2A5C',marginBottom:14,display:'flex',alignItems:'center',gap:6}}>
                  <span style={{width:3,height:14,background:'#0A84FF',borderRadius:2,display:'inline-block'}}/>📊 자산 포트폴리오 분석
                </div>
                <svg width="100%" viewBox="0 0 320 180" style={{display:'block',margin:'0 auto 16px'}}>
                  <text x="160" y="20" textAnchor="middle" fontSize="11" fill="#333" fontWeight="700">현재 자산배분</text>
                  <circle cx="100" cy="100" r="60" fill="none" stroke="#F0F0F0" strokeWidth="28"/>
                  <circle cx="100" cy="100" r="60" fill="none" stroke="#2C3E50" strokeWidth="28" strokeDasharray="113 264" strokeDashoffset="0" transform="rotate(-90 100 100)"/>
                  <circle cx="100" cy="100" r="60" fill="none" stroke="#27AE60" strokeWidth="28" strokeDasharray="75 264" strokeDashoffset="-113" transform="rotate(-90 100 100)"/>
                  <circle cx="100" cy="100" r="60" fill="none" stroke="#3498DB" strokeWidth="28" strokeDasharray="38 264" strokeDashoffset="-188" transform="rotate(-90 100 100)"/>
                  <circle cx="100" cy="100" r="60" fill="none" stroke="#E8C040" strokeWidth="28" strokeDasharray="38 264" strokeDashoffset="-226" transform="rotate(-90 100 100)"/>
                  <text x="100" y="97" textAnchor="middle" fontSize="11" fill="#333" fontWeight="700">총 자산</text>
                  <text x="100" y="112" textAnchor="middle" fontSize="13" fill="#0F2A5C" fontWeight="700">3,200만</text>
                  <rect x="185" y="40" width="10" height="10" rx="2" fill="#2C3E50"/><text x="200" y="50" fontSize="10" fill="#444">보험자산 43%</text>
                  <rect x="185" y="60" width="10" height="10" rx="2" fill="#27AE60"/><text x="200" y="70" fontSize="10" fill="#444">저축 28%</text>
                  <rect x="185" y="80" width="10" height="10" rx="2" fill="#3498DB"/><text x="200" y="90" fontSize="10" fill="#444">투자 14%</text>
                  <rect x="185" y="100" width="10" height="10" rx="2" fill="#E8C040"/><text x="200" y="110" fontSize="10" fill="#444">부동산 15%</text>
                  <text x="185" y="135" fontSize="9" fill="#888">권장: 보험20/저축30/투자35/부동산15</text>
                  <text x="185" y="150" fontSize="9" fill="#E74C3C">투자 비중 21% 부족</text>
                </svg>
              </div>
            )}
            {activeNoteTab === 'chart' && noteState.noteType === 'chart' && noteState.content?.labels && (
              <div style={{animation:'sFadeIn 0.3s ease'}}>
                <div style={{fontSize:11,fontWeight:700,color:'#333',textAlign:'center',marginBottom:8}}>{noteState.title}</div>
                <div style={{display:'flex',alignItems:'flex-end',gap:4,height:100,padding:'0 8px',background:'#F8F9FC',borderRadius:8}}>
                  {(noteState.content?.labels||[]).map((label: string, i: number)=>{
                    const vals: number[] = noteState.content?.values||[];
                    const maxVal = Math.max(...vals, 1);
                    const pct = Math.round((vals[i]/maxVal)*90);
                    const clrs = ['#3498DB','#2C3E50','#27AE60','#E74C3C','#E8C040','#9B59B6'];
                    return (
                      <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
                        <div style={{fontSize:8,color:clrs[i%clrs.length],fontWeight:700}}>{vals[i]}</div>
                        <div style={{width:'60%',height:pct,background:clrs[i%clrs.length],borderRadius:'2px 2px 0 0'}}/>
                        <div style={{fontSize:8,color:'#555',textAlign:'center'}}>{label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeNoteTab === 'calc' && noteState.noteType !== 'calculation' && (
              <div style={{animation:'sFadeIn 0.3s ease'}}>
                <div style={{background:'linear-gradient(135deg,#0F2A5C,#1A3A6E)',borderRadius:12,padding:16,color:'white'}}>
                  <div style={{fontSize:10,color:'rgba(255,255,255,0.55)',marginBottom:4}}>📌 은퇴자금 시뮬레이션</div>
                  <div style={{fontSize:28,fontWeight:700,color:'#E8C040'}}>3억 8,400만원</div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,0.6)',marginTop:2}}>월 170만원 저축 × 15년 (연 4% 수익률)</div>
                  <div style={{display:'flex',justifyContent:'space-between',marginTop:10,paddingTop:10,borderTop:'1px solid rgba(255,255,255,0.1)'}}>
                    {[{val:'60세',label:'목표 은퇴'},{val:'25년',label:'사용 기간'},{val:'월 128만',label:'수령 가능',color:'#34C759'},{val:'국민연금',label:'예상 65만',color:'#FF9500'}].map((r: any,i: number)=>(
                      <div key={i} style={{textAlign:'center'}}>
                        <div style={{fontSize:13,fontWeight:700,color:r.color||'white'}}>{r.val}</div>
                        <div style={{fontSize:9,color:'rgba(255,255,255,0.5)',marginTop:2}}>{r.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {activeNoteTab === 'calc' && noteState.noteType === 'calculation' && (
              <div style={{animation:'sFadeIn 0.3s ease'}}>
                <div style={{background:'linear-gradient(135deg,#0F2A5C,#1A3A6E)',borderRadius:12,padding:18,color:'white',marginBottom:12}}>
                  <div style={{fontSize:10,color:'rgba(255,255,255,0.55)',marginBottom:6}}>{noteState.content?.formula||noteState.title}</div>
                  <div style={{fontSize:32,fontWeight:700,color:'#E8C040',letterSpacing:'-1px'}}>{noteState.content?.result}</div>
                  {noteState.content?.current&&<div style={{fontSize:11,color:'rgba(255,255,255,0.6)',marginTop:4}}>현재: {noteState.content.current}</div>}
                  {noteState.content?.gap&&<div style={{marginTop:10,padding:'8px 12px',background:'rgba(231,76,60,0.2)',borderRadius:8,border:'1px solid rgba(231,76,60,0.3)',fontSize:12,color:'#FF6B6B',fontWeight:700}}>⚠️ {noteState.content.gap}</div>}
                </div>
                {noteState.content?.monthlyNeeded&&<div style={{background:'white',borderRadius:10,padding:'12px 14px',border:'2px solid '+(noteState.content?.urgency==='high'?'#E74C3C':noteState.content?.urgency==='medium'?'#FF9500':'#27AE60')}}>
                  <div style={{fontSize:10,color:'#888',marginBottom:4}}>권장 액션</div>
                  <div style={{fontSize:14,fontWeight:700,color:noteState.content?.urgency==='high'?'#E74C3C':noteState.content?.urgency==='medium'?'#FF9500':'#27AE60'}}>💡 {noteState.content.monthlyNeeded}</div>
                </div>}
              </div>
            )}

            {activeNoteTab === 'video' && (
              <div style={{animation:'sFadeIn 0.3s ease'}}>
                <div style={{fontSize:12,fontWeight:700,color:'#0F2A5C',marginBottom:12,display:'flex',alignItems:'center',gap:6}}>
                  <span style={{width:3,height:14,background:'#D4A017',borderRadius:2,display:'inline-block'}}/>🎬 니즈환기 영상 라이브러리
                </div>
                {noteState.noteType==='video'&&noteState.content?.url&&<div style={{marginBottom:14,borderRadius:12,overflow:'hidden',boxShadow:'0 4px 16px rgba(0,0,0,0.15)',border:'2px solid rgba(212,160,23,0.4)'}}>
                  <iframe src={noteState.content.url} title={noteState.content.title} width="100%" height="180" style={{border:'none',display:'block'}} allowFullScreen/>
                  <div style={{padding:'10px 14px',background:'white'}}>
                    <div style={{fontSize:12,fontWeight:700,color:'#0F2A5C'}}>{noteState.content.title}</div>
                    {noteState.content.duration&&<div style={{fontSize:10,color:'#888',marginTop:2}}>재생시간 {noteState.content.duration}</div>}
                  </div>
                </div>}
                {[{emoji:'👴👵',title:'노후준비, 왜 지금 해야 하나요?',duration:'2:34',bg:'linear-gradient(145deg,#1a1a2e,#16213e)'},{emoji:'🛡️',title:'보험, 제대로 알고 계신가요?',duration:'1:58',bg:'linear-gradient(145deg,#1a2a1a,#163016)'},{emoji:'📈',title:'복리의 기적 — 10년의 차이',duration:'3:12',bg:'linear-gradient(145deg,#2a1a0a,#3a2a10)'}].map((v: any,i: number)=>(
                  <div key={i} onClick={()=>setPlayingVideo(v.title)} style={{marginBottom:12,cursor:'pointer',borderRadius:12,overflow:'hidden',boxShadow:'0 4px 16px rgba(0,0,0,0.2)',border:playingVideo===v.title?'2px solid #D4A017':'2px solid transparent'}}>
                    <div style={{background:v.bg,height:90,display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
                      <div style={{fontSize:32}}>{v.emoji}</div>
                      <div style={{position:'absolute',width:44,height:44,background:'rgba(212,160,23,0.9)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>▶</div>
                      <div style={{position:'absolute',bottom:6,right:8,background:'rgba(0,0,0,0.7)',color:'white',fontSize:10,padding:'2px 6px',borderRadius:4}}>{v.duration}</div>
                    </div>
                    <div style={{padding:'8px 12px',background:'white',fontSize:11,fontWeight:600,color:'#1A1A1A'}}>{v.title}</div>
                  </div>
                ))}
                {playingVideo&&<div style={{background:'rgba(212,160,23,0.1)',border:'1px solid rgba(212,160,23,0.3)',borderRadius:8,padding:10,fontSize:12,color:'#D4A017'}}>▶ 재생 중: {playingVideo}</div>}
              </div>
            )}

            {activeNoteTab === 'web' && (
              <div style={{animation:'sFadeIn 0.3s ease'}}>
                <div style={{fontSize:12,fontWeight:700,color:'#0F2A5C',marginBottom:12,display:'flex',alignItems:'center',gap:6}}>
                  <span style={{width:3,height:14,background:'#D4A017',borderRadius:2,display:'inline-block'}}/>🌐 실시간 웹 참조 자료
                </div>
                {noteState.noteType==='web'&&noteState.content?.url&&<div style={{background:'white',borderRadius:12,border:'2px solid rgba(212,160,23,0.3)',overflow:'hidden',marginBottom:14,boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
                  <div style={{background:'#F5F5F5',padding:'8px 12px',display:'flex',alignItems:'center',gap:8,borderBottom:'1px solid #E8E8E8'}}>
                    <span style={{fontSize:14}}>🔗</span>
                    <a href={noteState.content.url} target="_blank" rel="noreferrer" style={{fontSize:10,color:'#0A84FF',textDecoration:'none'}}>{String(noteState.content.url).slice(0,50)}...</a>
                  </div>
                  <div style={{padding:'14px 16px'}}>
                    <div style={{fontSize:13,fontWeight:700,color:'#0F2A5C',marginBottom:6}}>{noteState.content.title}</div>
                    {noteState.content.description&&<div style={{fontSize:11,color:'#555',lineHeight:1.6}}>{noteState.content.description}</div>}
                  </div>
                </div>}
                <div style={{background:'white',borderRadius:12,border:'1px solid #E8E8E8',overflow:'hidden',boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
                  <div style={{background:'#F5F5F5',padding:'8px 12px',display:'flex',alignItems:'center',gap:8,borderBottom:'1px solid #E8E8E8'}}>
                    <span style={{fontSize:14}}>🏛️</span><span style={{fontSize:10,color:'#888'}}>nps.or.kr — 국민연금공단</span>
                  </div>
                  <div style={{padding:'14px 16px'}}>
                    <div style={{fontSize:12,fontWeight:700,color:'#0F2A5C',marginBottom:8}}>2025년 국민연금 예상 수령액 기준표</div>
                    <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
                      <thead><tr style={{background:'#F5F5F5'}}>
                        <th style={{padding:'5px 8px',textAlign:'left',border:'1px solid #E0E0E0'}}>가입기간</th>
                        <th style={{padding:'5px 8px',textAlign:'right',border:'1px solid #E0E0E0'}}>월 수령액</th>
                        <th style={{padding:'5px 8px',textAlign:'right',border:'1px solid #E0E0E0'}}>연 환산</th>
                      </tr></thead>
                      <tbody>
                        <tr><td style={{padding:'5px 8px',border:'1px solid #E0E0E0'}}>10년</td><td style={{padding:'5px 8px',textAlign:'right',border:'1px solid #E0E0E0'}}>약 23만원</td><td style={{padding:'5px 8px',textAlign:'right',border:'1px solid #E0E0E0'}}>276만원</td></tr>
                        <tr style={{background:'#FFF9EC'}}><td style={{padding:'5px 8px',border:'1px solid #E0E0E0',fontWeight:700,color:'#C8920F'}}>20년 (해당)</td><td style={{padding:'5px 8px',textAlign:'right',border:'1px solid #E0E0E0',fontWeight:700,color:'#C8920F'}}>약 65만원</td><td style={{padding:'5px 8px',textAlign:'right',border:'1px solid #E0E0E0',fontWeight:700,color:'#C8920F'}}>780만원</td></tr>
                        <tr><td style={{padding:'5px 8px',border:'1px solid #E0E0E0'}}>30년</td><td style={{padding:'5px 8px',textAlign:'right',border:'1px solid #E0E0E0'}}>약 97만원</td><td style={{padding:'5px 8px',textAlign:'right',border:'1px solid #E0E0E0'}}>1,164만원</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {noteState.noteType === 'checklist' && activeNoteTab === 'house' && (
              <div style={{animation:'sFadeIn 0.3s ease'}}>
                <div style={{fontSize:12,fontWeight:700,color:'#0F2A5C',marginBottom:12,display:'flex',alignItems:'center',gap:6}}>
                  <span style={{width:3,height:14,background:'#27AE60',borderRadius:2,display:'inline-block'}}/>✅ {noteState.content?.title||'오늘 상담 액션플랜'}
                </div>
                {(noteState.content?.items||[]).map((item: any, i: number)=>(
                  <div key={i} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'10px 12px',background:item.done?'#F0FFF4':'white',borderRadius:10,marginBottom:8,border:'1px solid '+(item.done?'#C5E1A5':'#E8E8E8'),boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
                    <div style={{width:20,height:20,borderRadius:'50%',background:item.done?'#27AE60':'white',border:'2px solid '+(item.done?'#27AE60':'#DDD'),display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1}}>
                      {item.done&&<span style={{fontSize:11,color:'white',fontWeight:700}}>✓</span>}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:600,color:item.done?'#27AE60':'#1A1A1A',textDecoration:item.done?'line-through':'none'}}>{item.text}</div>
                      {item.priority&&<div style={{fontSize:10,color:item.priority==='high'?'#E74C3C':item.priority==='medium'?'#FF9500':'#27AE60',marginTop:3,fontWeight:600}}>{item.priority==='high'?'🔴 즉시 실행':item.priority==='medium'?'🟡 1개월 내':'🟢 3개월 내'}</div>}
                    </div>
                  </div>
                ))}
                {(noteState.content?.items||[]).length===0&&<div style={{textAlign:'center',padding:'30px 20px',color:'#AAA',fontSize:12}}>AI 머니야가 상담 중 액션플랜을 생성합니다</div>}
              </div>
            )}

            {noteState.noteType === 'image' && (
              <div style={{animation:'sFadeIn 0.3s ease'}}>
                <div style={{fontSize:12,fontWeight:700,color:'#0F2A5C',marginBottom:12,display:'flex',alignItems:'center',gap:6}}>
                  <span style={{width:3,height:14,background:'#9B59B6',borderRadius:2,display:'inline-block'}}/>🖼 참조 자료
                </div>
                {noteState.content?.url&&<img src={noteState.content.url} alt={noteState.title} style={{width:'100%',borderRadius:10,boxShadow:'0 4px 16px rgba(0,0,0,0.1)',border:'1px solid #E8E8E8'}}/>}
              </div>
            )}
          </div>
        </div>

        <div style={{ gridRow:'1/2', background:'#2C2C2E', borderLeft:'1px solid rgba(255,255,255,0.08)', display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.08)', fontSize:12, fontWeight:700, color:'#D4A017', display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>📊 실시간 분석</div>
          <div style={{ flex:1, overflowY:'auto', padding:12, scrollbarWidth:'none' }}>
            <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.55)', marginBottom:6, letterSpacing:'0.5px' }}>8단계 진행 현황</div>
            {STEPS.map((s,i) => (
              <div key={i} className={'sstep'+(i < currentStep-1 ? ' done' : i === currentStep-1 ? ' active' : '')}>
                <div className="sstepnum">{i < currentStep-1 ? '✓' : i+1}</div>
                {s}
              </div>
            ))}
            <div style={{ height:1, background:'rgba(255,255,255,0.08)', margin:'10px 0' }} />
            <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.55)', marginBottom:6, letterSpacing:'0.5px' }}>핵심 발견사항</div>
            {[
              {cls:'red', label:'🛡️ 보험 보장', val:'사망보장 1억 부족', sub:'현재 종신 → 정기 전환 권장'},
              {cls:'yellow', label:'💸 지출 블랙홀', val:'월 120만원 미파악', sub:'카드 내역 분석 필요'},
              {cls:'blue', label:'🎯 은퇴 자금', val:'2.4억 → 목표 4억', sub:'월 120만 추가 시 달성 가능'},
              {cls:'green', label:'✅ 보험료 비율', val:'7.5% 적정 수준', sub:'수입 400만 대비 적정'},
            ].map((a,i) => (
              <div key={i} className={'saitem '+a.cls}>
                <div style={{ fontSize:9, color:'rgba(255,255,255,0.55)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:3 }}>{a.label}</div>
                <div style={{ fontSize:13, fontWeight:700, color:'white' }}>{a.val}</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.55)', marginTop:2 }}>{a.sub}</div>
              </div>
            ))}
            <div style={{ height:1, background:'rgba(255,255,255,0.08)', margin:'10px 0' }} />
            <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.55)', marginBottom:6, letterSpacing:'0.5px' }}>AI 엔진 상태</div>
            <div style={{ background:'#3A3A3C', borderRadius:8, padding:'8px 10px', fontSize:10 }}>
              {[['RAG 검색','활성 ●','#34C759'],['참조 청크','5,706개','white'],['Function Call','12회 호출','#D4A017'],['응답 속도','1.2초','white']].map(([k,v,c],i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', marginBottom: i<3 ? 4:0 }}>
                  <span style={{ color:'rgba(255,255,255,0.55)' }}>{k}</span>
                  <span style={{ color:c, fontWeight:700 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ gridColumn:'1/4', gridRow:'2/3', background:'rgba(0,0,0,0.7)', backdropFilter:'blur(20px)', borderTop:'1px solid rgba(255,255,255,0.08)', display:'flex', flexDirection:'column', padding:'10px 20px 12px', gap:8, overflow:'hidden' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.55)' }}>
              💬 실시간 STT 대화
              <div style={{ background:'rgba(10,132,255,0.2)', border:'1px solid rgba(10,132,255,0.3)', color:'#0A84FF', fontSize:9, padding:'2px 7px', borderRadius:10, fontWeight:700 }}>● 음성인식 중</div>
            </div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)' }}>상담 종료 후 자동 저장 → 서류함</div>
          </div>
          <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column', gap:5, justifyContent:'flex-end' }}>
            {messages.slice(-3).map((msg, i) => (
              <div key={i} className={'ssmsg'+(msg.role==='user'?' user':'')}>
                <div style={{ width:22, height:22, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, flexShrink:0, marginTop:1, background: msg.role==='ai'?'linear-gradient(135deg,#B8820A,#E8C040)':'rgba(255,255,255,0.15)', overflow:'hidden' }}>
                  {msg.role==='ai' ? <img src={MONEYA_IMG} alt="" style={{ width:18, height:18, objectFit:'contain' }} /> : displayName.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize:12, lineHeight:1.5, padding:'5px 10px', borderRadius:10, maxWidth:'75%', background: msg.role==='ai'?'rgba(255,255,255,0.08)':'rgba(212,160,23,0.15)', color: msg.role==='ai'?'rgba(255,255,255,0.85)':'#E8C040' }}>{msg.text}</div>
                  {msg.tag && <div style={{ fontSize:9, color:'#D4A017', marginTop:2, display:'flex', alignItems:'center', gap:3 }}>💡 {msg.tag}</div>}
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'rgba(255,255,255,0.4)' }}>
                <span style={{ fontSize:12 }}>🤖</span> AI 머니야가 응답을 준비하고 있습니다...
                <span style={{ display:'inline-flex', gap:3 }}>{[0,0.18,0.36].map((delay,i) => <span key={i} style={{ width:5, height:5, background:'#ccc', borderRadius:'50%', display:'inline-block', animation:'sDot 1.2s ease-in-out '+delay+'s infinite' }} />)}</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// ── 일정 + 금융집 현황 합체 ──
function ScheduleWithHouse({ userData, displayName, onToast }: { userData: any; displayName: string; onToast: (msg: string) => void }) {
  const [checks, setChecks] = useState({ q: true, camera: false, env: false });
  const nextConsult = userData.nextConsultDate;
  const scores = userData.consultationScores || {};
  const latestScore = userData.latestScore || 0;
  const floorLabels = ['1층 기초체력','2층 안전장치','3층 부동산','4층 보장자산','5층 은퇴설계','6층 투자성장'];
  const floorScores = [scores.f1||0, scores.f2||0, scores.f3||0, scores.f4||0, scores.f5||0, scores.f6||0];
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

// ── 이력 ──
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

// ── 서류함 ──
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
      {(['필수','선택'] as string[]).map((section: string) => (
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

// ── 구독자 허브 ──
function ConsultationHub({ user }: { user: any }) {
  const [activeSubTab, setActiveSubTab] = useState('dashboard');
  const [userData] = useState<any>({});
  const [toast, setToast] = useState<string | null>(null);
  const [modal, setModal] = useState<{ title: string; content: string } | null>(null);
  const displayName = user.displayName || '고객';

  const subTabs = [
    { id: 'dashboard', label: '홈',        icon: '🏠' },
    { id: 'finance',   label: '내 재무',    icon: '📊' },
    { id: 'chat',      label: 'AI 화상상담', icon: '📹' },
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

// ── 비구독자 서비스 소개 ──
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

// ── 메인 페이지 ──
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
