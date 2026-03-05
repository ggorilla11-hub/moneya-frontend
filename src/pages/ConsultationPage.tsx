// ConsultationPage.tsx v2.0 — 상담 탭
// v2.0: 상담탭 진입 즉시 Claude AI 상담 화면 표시
// - 뇌: Claude API (8단계 금융집짓기 상담)
// - 입: ElevenLabs 오상열 목소리
// - 귀: Whisper STT (마이크 → 텍스트 실시간 표시)
// - UI: 상단 대시보드 + 하단 입력바 (+ 마이크 텍스트 전송)

import { useState, useRef, useEffect } from 'react';

interface ConsultationPageProps { user: any; }

const API_URL = 'https://moneya-server.onrender.com';
const WS_URL  = 'wss://moneya-server.onrender.com';
const GOLD    = '#c9a53e';
const MONEYA_IMG = 'https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/AI%EB%A8%B8%EB%8B%88%EC%95%BC%20%ED%99%95%EC%A0%95%EC%9D%B4%EB%AF%B8%EC%A7%80%EC%95%88.png?alt=media&token=c250863d-7cda-424a-800d-884b20e30b1a';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export default function ConsultationPage({ user }: ConsultationPageProps) {
  const displayName = user?.displayName || '고객';

  const [messages, setMessages]         = useState<Message[]>([]);
  const [inputText, setInputText]       = useState('');
  const [isLoading, setIsLoading]       = useState(false);
  const [isVoiceMode, setIsVoiceMode]   = useState(false);
  const [status, setStatus]             = useState('대기중');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [serverReady, setServerReady]   = useState(false);
  const [consultStep, setConsultStep]   = useState(1);

  const chatAreaRef      = useRef<HTMLDivElement>(null);
  const wsRef            = useRef<WebSocket | null>(null);
  const audioContextRef  = useRef<AudioContext | null>(null);
  const mediaStreamRef   = useRef<MediaStream | null>(null);
  const processorRef     = useRef<any>(null);
  const audioQueueRef    = useRef<string[]>([]);
  const isPlayingRef     = useRef(false);
  const isConnectedRef   = useRef(false);

  // ── 서버 헬스체크 ──────────────────────────────
  useEffect(() => {
    const warmup = async () => {
      try {
        const r = await fetch(`${API_URL}/api/health`);
        if (r.ok) setServerReady(true);
      } catch { setTimeout(warmup, 3000); }
    };
    warmup();
  }, []);

  // ── 초기 인삿말 ────────────────────────────────
  useEffect(() => {
    setMessages([{
      id: '1',
      role: 'assistant',
      text: `반갑습니다 ${displayName}님! 저는 AI 재무설계사 머니야입니다.\n오상열 CFP 선생님의 금융집짓기 방법론으로 재무상담을 도와드릴게요.\n\n텍스트로 입력하시거나, 마이크 버튼을 눌러 음성으로 말씀해주세요! 😊`,
      timestamp: new Date(),
    }]);
    return () => cleanupVoiceMode();
  }, []);

  // ── 스크롤 ─────────────────────────────────────
  useEffect(() => {
    setTimeout(() => {
      if (chatAreaRef.current)
        chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }, 80);
  }, [messages]);

  // ── 단계 감지 ──────────────────────────────────
  const detectStep = (text: string) => {
    if (text.includes('수입') || text.includes('월 소득')) setConsultStep(3);
    else if (text.includes('금융집')) setConsultStep(4);
    else if (text.includes('버킷') || text.includes('포트폴리오')) setConsultStep(5);
    else if (text.includes('은퇴') || text.includes('보험')) setConsultStep(6);
    else if (text.includes('강점') || text.includes('등급')) setConsultStep(7);
    else if (text.includes('리포트') || text.includes('수료')) setConsultStep(8);
  };

  // ── 텍스트 전송 → Claude API ───────────────────
  const sendTextMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: text.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
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
      detectStep(aiText);

      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', text: aiText, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);

      // ElevenLabs TTS
      if (voiceEnabled) {
        try {
          const ttsRes = await fetch(`${API_URL}/api/consult-tts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: aiText }),
          });
          const ttsData = await ttsRes.json();
          if (ttsData.success && ttsData.audio) {
            const blob  = new Blob([Uint8Array.from(atob(ttsData.audio), c => c.charCodeAt(0))], { type: 'audio/mp3' });
            const url   = URL.createObjectURL(blob);
            const audio = new Audio(url);
            audio.onended = () => URL.revokeObjectURL(url);
            await audio.play();
          }
        } catch (e) { console.error('TTS 에러:', e); }
      }
    } catch {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', text: '서버 연결 중입니다. 잠시 후 다시 시도해주세요.', timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ── 음성 모드 ───────────────────────────────────
  const playAudio = async (b64: string) => {
    audioQueueRef.current.push(b64);
    if (!isPlayingRef.current) processAudioQueue();
  };

  const processAudioQueue = async () => {
    if (!audioQueueRef.current.length) { isPlayingRef.current = false; return; }
    isPlayingRef.current = true;
    const b64 = audioQueueRef.current.shift()!;
    try {
      if (!audioContextRef.current || audioContextRef.current.state === 'closed')
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
      const raw  = atob(b64);
      const buf  = new ArrayBuffer(raw.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < raw.length; i++) view[i] = raw.charCodeAt(i);
      const pcm  = new Int16Array(buf);
      const f32  = new Float32Array(pcm.length);
      for (let i = 0; i < pcm.length; i++) f32[i] = pcm[i] / 32768;
      const ab   = audioContextRef.current.createBuffer(1, f32.length, 24000);
      ab.getChannelData(0).set(f32);
      const src  = audioContextRef.current.createBufferSource();
      src.buffer = ab;
      src.connect(audioContextRef.current.destination);
      src.onended = () => processAudioQueue();
      src.start();
    } catch { processAudioQueue(); }
  };

  const cleanupVoiceMode = () => {
    if (wsRef.current) { try { wsRef.current.send(JSON.stringify({ type: 'stop' })); wsRef.current.close(); } catch {} wsRef.current = null; }
    if (mediaStreamRef.current) { mediaStreamRef.current.getTracks().forEach(t => t.stop()); mediaStreamRef.current = null; }
    if (processorRef.current) {
      try { const { processor, source, audioContext } = processorRef.current; processor.disconnect(); source.disconnect(); audioContext.close(); } catch {}
      processorRef.current = null;
    }
    audioQueueRef.current = [];
    isPlayingRef.current  = false;
    isConnectedRef.current = false;
  };

  const startAudioCapture = (stream: MediaStream, ws: WebSocket) => {
    try {
      const ac  = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const src = ac.createMediaStreamSource(stream);
      const prc = ac.createScriptProcessor(4096, 1, 1);
      prc.onaudioprocess = (e) => {
        if (!ws || ws.readyState !== WebSocket.OPEN) return;
        const inp = e.inputBuffer.getChannelData(0);
        const pcm = new Int16Array(inp.length);
        for (let i = 0; i < inp.length; i++) pcm[i] = Math.max(-32768, Math.min(32767, inp[i] * 32768));
        ws.send(JSON.stringify({ type: 'audio', data: btoa(String.fromCharCode(...new Uint8Array(pcm.buffer))) }));
      };
      src.connect(prc);
      prc.connect(ac.destination);
      processorRef.current = { processor: prc, source: src, audioContext: ac };
    } catch (e) { console.error('오디오 캡처 에러:', e); }
  };

  const startVoiceMode = async () => {
    if (isConnectedRef.current) return;
    try {
      setStatus('연결중...');
      setIsVoiceMode(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 24000, channelCount: 1, echoCancellation: true, noiseSuppression: true } });
      mediaStreamRef.current = stream;
      const ws = new WebSocket(`${WS_URL}?mode=consult`);
      wsRef.current = ws;
      ws.onopen = () => {
        ws.send(JSON.stringify({
          type: 'start_consult',
          userName: displayName,
          conversationHistory: messages.map(m => ({ role: m.role, content: m.text })),
        }));
      };
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'session_started') { isConnectedRef.current = true; setStatus('듣는중...'); startAudioCapture(stream, ws); }
          if (msg.type === 'audio' && msg.data) playAudio(msg.data);
          if (msg.type === 'transcript' && msg.role === 'user')
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: msg.text, timestamp: new Date() }]);
          if (msg.type === 'transcript' && msg.role === 'assistant') {
            detectStep(msg.text);
            setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', text: msg.text, timestamp: new Date() }]);
          }
          if (msg.type === 'interrupt') { audioQueueRef.current = []; isPlayingRef.current = false; }
        } catch (e) { console.error('메시지 파싱 에러:', e); }
      };
      ws.onerror = () => { setStatus('연결 실패'); cleanupVoiceMode(); setIsVoiceMode(false); };
      ws.onclose = () => { isConnectedRef.current = false; setStatus('대기중'); setIsVoiceMode(false); };
    } catch {
      alert('마이크 권한이 필요합니다.');
      cleanupVoiceMode();
      setIsVoiceMode(false);
      setStatus('대기중');
    }
  };

  const stopVoiceMode  = () => { cleanupVoiceMode(); setIsVoiceMode(false); setStatus('대기중'); };
  const toggleVoiceMode = () => { isVoiceMode ? stopVoiceMode() : startVoiceMode(); };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendTextMessage(inputText); }
  };

  const stepLabels: { [k: number]: string } = {
    1: '1단계 · Opening',       2: '2단계 · Fact Finding',
    3: '3단계 · 수입지출 분석', 4: '4단계 · 금융집짓기',
    5: '5단계 · 포트폴리오',    6: '6단계 · 7대 영역 설계',
    7: '7단계 · 최종의견',      8: '8단계 · Closing',
  };

  return (
    <div className="flex flex-col bg-gray-50" style={{ height: '100dvh', paddingBottom: '64px' }}>

      {/* ── 헤더 ── */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
        <img src={MONEYA_IMG} alt="머니야" className="w-9 h-9 object-contain" />
        <div className="flex-1">
          <p className="font-extrabold text-gray-900 text-sm">💬 AI 재무상담</p>
          <p className="text-xs" style={{ color: GOLD }}>{stepLabels[consultStep]}</p>
        </div>
        {/* 단계 진행 점 */}
        <div className="flex gap-1">
          {[1,2,3,4,5,6,7,8].map(s => (
            <div key={s} className="w-2 h-2 rounded-full" style={{ background: s <= consultStep ? GOLD : '#e5e7eb' }} />
          ))}
        </div>
        {/* 음성 ON/OFF */}
        <button onClick={() => setVoiceEnabled(!voiceEnabled)} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: voiceEnabled ? '#fef3c7' : '#f3f4f6' }}>
          {voiceEnabled
            ? <svg className="w-4 h-4" style={{ color: GOLD }} fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
            : <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3z"/></svg>
          }
        </button>
      </div>

      {/* ── 서버 준비중 배너 ── */}
      {!serverReady && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-center">
          <span className="text-yellow-700 text-xs">서버 준비중... 잠시만 기다려주세요</span>
        </div>
      )}

      {/* ── 음성모드 표시 ── */}
      {isVoiceMode && (
        <div className="mx-4 mt-3 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-1 bg-green-500 rounded-full animate-pulse" style={{ height: `${12 + (i % 3) * 6}px`, animationDelay: `${i * 100}ms` }} />
              ))}
            </div>
            <span className="text-green-700 font-semibold text-sm">머니야가 듣고 있어요 · {status}</span>
          </div>
          <button onClick={stopVoiceMode} className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">종료</button>
        </div>
      )}

      {/* ── 빠른 질문 칩 ── */}
      <div className="px-4 pt-3 pb-1 flex gap-2 overflow-x-auto">
        {['저축률 진단', '보험 분석', '은퇴 계산', '투자 조언'].map(q => (
          <button key={q} onClick={() => sendTextMessage(q)}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border"
            style={{ color: GOLD, borderColor: GOLD, background: '#fffdf5' }}>
            {q}
          </button>
        ))}
      </div>

      {/* ── 대화창 ── */}
      <div ref={chatAreaRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {messages.map(m => (
          <div key={m.id} className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {m.role === 'assistant' && (
              <img src={MONEYA_IMG} alt="머니야" className="w-9 h-9 rounded-full object-cover flex-shrink-0 mt-1" />
            )}
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
              ${m.role === 'assistant'
                ? 'bg-white border border-gray-100 text-gray-800 rounded-tl-none shadow-sm'
                : 'text-white rounded-tr-none'}`}
              style={m.role === 'user' ? { background: GOLD } : {}}>
              {m.text}
            </div>
          </div>
        ))}

        {/* 로딩 */}
        {isLoading && (
          <div className="flex gap-2.5">
            <img src={MONEYA_IMG} alt="머니야" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
            <div className="px-4 py-3 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center gap-1">
                {[0, 150, 300].map(d => (
                  <div key={d} className="w-2 h-2 rounded-full animate-bounce" style={{ background: GOLD, animationDelay: `${d}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 하단 입력바 (지출탭과 동일 구조, 노란색) ── */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 z-50">
        <div className="flex items-center gap-2 max-w-md mx-auto">

          {/* + 버튼 */}
          <button className="w-10 h-10 rounded-full flex items-center justify-center border-2"
            style={{ borderColor: GOLD, background: '#fffdf5' }}
            onClick={() => {}}>
            <svg className="w-5 h-5" style={{ color: GOLD }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </button>

          {/* 마이크 버튼 */}
          <button onClick={toggleVoiceMode}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
            style={{ background: isVoiceMode ? '#ef4444' : GOLD }}>
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
            </svg>
          </button>

          {/* 텍스트 입력 */}
          <div className="flex-1 flex items-center bg-gray-100 border border-gray-200 rounded-full px-4 py-2">
            <input type="text" value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="머니야에게 말씀해주세요..."
              className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
              disabled={isLoading || isVoiceMode} />
          </div>

          {/* 전송 버튼 */}
          <button onClick={() => sendTextMessage(inputText)}
            disabled={!inputText.trim() || isLoading || isVoiceMode}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
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
