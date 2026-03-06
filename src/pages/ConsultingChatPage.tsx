import { useState, useRef, useEffect } from 'react';

// ════════════════════════════════════════════════════════════
//  ConsultingChatPage.tsx
//  - 뇌: Claude API (Anthropic claude-sonnet-4-20250514)
//  - 귀: OpenAI Whisper (음성입력) → moneya-server 경유
//  - 입: ElevenLabs 오상열 목소리 클론 → moneya-server 경유
//  - UI: AI지출탭(AIConversation.tsx) 입력바 100% 동일 구조
//  - NEW: 음성 모드 중 보조 분석 패널 (RAG+멀티에이전트)
// ════════════════════════════════════════════════════════════

const API_URL = 'https://moneya-server.onrender.com';
const WS_URL  = 'wss://moneya-server.onrender.com';

const PROFILE_IMAGE_URL =
  'https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/%EC%98%A4%EC%83%81%EC%97%B4%20%EC%82%AC%EC%A7%84.png?alt=media&token=63eaf15e-9d0b-4d72-8fbb-ee03d6ecc8e5';

interface Message {
  id: string;
  type: 'ai' | 'user';
  text: string;
  timestamp: Date;
}

interface FinancialResult {
  name: string;
  age: number;
  income: number;
  assets: number;
  debt: number;
  wealthIndex: number;
  level: number;
  houseName: string;
}

interface ConsultingChatPageProps {
  displayName: string;
  financialResult: FinancialResult | null;
  onBack: () => void;
}

// ────────────────────────────────────────────────────────────
//  메인 컴포넌트
// ────────────────────────────────────────────────────────────
export default function ConsultingChatPage({
  displayName,
  financialResult,
  onBack,
}: ConsultingChatPageProps) {

  const [messages, setMessages]       = useState<Message[]>([]);
  const [inputText, setInputText]     = useState('');
  const [isLoading, setIsLoading]     = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [status, setStatus]           = useState('대기중');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [serverReady, setServerReady]   = useState(false);
  const [consultStep, setConsultStep]   = useState(1);

  // ── [NEW] 보조 분석 패널 상태 ──────────────────────────────
  const [panelData, setPanelData]       = useState<any[]>([]);
  const [panelLoading, setPanelLoading] = useState(false);

  const chatAreaRef     = useRef<HTMLDivElement>(null);
  const wsRef           = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef  = useRef<MediaStream | null>(null);
  const processorRef    = useRef<any>(null);
  const audioQueueRef   = useRef<string[]>([]);
  const isPlayingRef    = useRef(false);
  const isConnectedRef  = useRef(false);

  // ── 재무 컨텍스트 ──────────────────────────────────────────
  const getFinancialContext = () => ({
    name:          financialResult?.name  || displayName,
    age:           financialResult?.age   || 0,
    monthlyIncome: financialResult?.income || 0,
    totalAssets:   financialResult?.assets || 0,
    totalDebt:     financialResult?.debt   || 0,
    netAssets:     (financialResult?.assets || 0) - (financialResult?.debt || 0),
    wealthIndex:   financialResult?.wealthIndex || 0,
    financialLevel: financialResult?.level || 0,
    houseName:     financialResult?.houseName || '',
  });

  // ── 서버 헬스체크 ──────────────────────────────────────────
  useEffect(() => {
    const warmup = async () => {
      try {
        const r = await fetch(`${API_URL}/api/health`);
        if (r.ok) setServerReady(true);
      } catch {
        setTimeout(warmup, 3000);
      }
    };
    warmup();
  }, []);

  // ── 초기 인삿말 (1단계 Opening 트리거) ─────────────────────
  useEffect(() => {
    const openingText =
      `반갑습니다! 저는 AI 재무설계사 머니야입니다.\n` +
      `오상열 CFP 선생님의 금융집짓기 방법론으로 ${displayName}님의 재무 현황을 함께 살펴드릴게요.\n` +
      `오늘 상담은 수입지출 분석부터 보험, 저축, 투자, 은퇴까지 7대 영역 전체를 60~90분 동안 진행합니다.\n` +
      `먼저 성함과 나이를 확인해드릴게요. ${displayName}님, 현재 나이가 어떻게 되세요?`;
    setMessages([{ id: '1', type: 'ai', text: openingText, timestamp: new Date() }]);
    return () => cleanupVoiceMode();
  }, []);

  // ── 스크롤 ─────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      if (chatAreaRef.current)
        chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }, 80);
    return () => clearTimeout(t);
  }, [messages]);

  // ────────────────────────────────────────────────────────────
  //  텍스트 채팅 → Claude API (/api/consult-chat)
  // ────────────────────────────────────────────────────────────
  const sendTextMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), type: 'user', text: text.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/consult-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          userName: displayName,
          financialContext: getFinancialContext(),
          conversationHistory: messages.map(m => ({
            role: m.type === 'user' ? 'user' : 'assistant',
            content: m.text,
          })),
        }),
      });

      const data = await response.json();
      const aiText = data.success ? data.message : '다시 말씀해주세요!';

      // 단계 감지
      if (aiText.includes('수입') || aiText.includes('월 소득')) setConsultStep(3);
      else if (aiText.includes('금융집')) setConsultStep(4);
      else if (aiText.includes('버킷') || aiText.includes('포트폴리오')) setConsultStep(5);
      else if (aiText.includes('은퇴') || aiText.includes('부채') || aiText.includes('보험')) setConsultStep(6);
      else if (aiText.includes('강점') || aiText.includes('등급')) setConsultStep(7);
      else if (aiText.includes('리포트') || aiText.includes('수료증')) setConsultStep(8);

      // [NEW] 텍스트 모드에서도 panelData 수신 시 패널 업데이트
      if (data.panelData) setPanelData(data.panelData);

      const aiMsg: Message = { id: (Date.now() + 1).toString(), type: 'ai', text: aiText, timestamp: new Date() };
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
            const blob = new Blob(
              [Uint8Array.from(atob(ttsData.audio), c => c.charCodeAt(0))],
              { type: 'audio/mp3' }
            );
            const url   = URL.createObjectURL(blob);
            const audio = new Audio(url);
            audio.onended = () => URL.revokeObjectURL(url);
            await audio.play();
          }
        } catch (e) { console.error('TTS 에러:', e); }
      }

    } catch (err) {
      console.error('상담 API 에러:', err);
      const errMsg: Message = {
        id: (Date.now() + 1).toString(), type: 'ai',
        text: '서버 연결 중입니다. 잠시 후 다시 시도해주세요.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // ────────────────────────────────────────────────────────────
  //  음성 모드 (귀: Whisper / 입: ElevenLabs → WebSocket)
  // ────────────────────────────────────────────────────────────
  const playAudio = async (base64Audio: string) => {
    audioQueueRef.current.push(base64Audio);
    if (!isPlayingRef.current) processAudioQueue();
  };

  const processAudioQueue = async () => {
    if (!audioQueueRef.current.length) { isPlayingRef.current = false; return; }
    isPlayingRef.current = true;
    const b64 = audioQueueRef.current.shift()!;
    try {
      if (!audioContextRef.current || audioContextRef.current.state === 'closed')
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      if (audioContextRef.current.state === 'suspended')
        await audioContextRef.current.resume();

      const raw    = atob(b64);
      const buf    = new ArrayBuffer(raw.length);
      const view   = new Uint8Array(buf);
      for (let i = 0; i < raw.length; i++) view[i] = raw.charCodeAt(i);

      const pcm16  = new Int16Array(buf);
      const f32    = new Float32Array(pcm16.length);
      for (let i = 0; i < pcm16.length; i++) f32[i] = pcm16[i] / 32768;

      const ab = audioContextRef.current.createBuffer(1, f32.length, 24000);
      ab.getChannelData(0).set(f32);
      const src = audioContextRef.current.createBufferSource();
      src.buffer = ab;
      src.connect(audioContextRef.current.destination);
      src.onended = () => processAudioQueue();
      src.start();
    } catch { processAudioQueue(); }
  };

  const cleanupVoiceMode = () => {
    if (wsRef.current) {
      try { wsRef.current.send(JSON.stringify({ type: 'stop' })); wsRef.current.close(); } catch {}
      wsRef.current = null;
    }
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
        const inp  = e.inputBuffer.getChannelData(0);
        const pcm  = new Int16Array(inp.length);
        for (let i = 0; i < inp.length; i++) pcm[i] = Math.max(-32768, Math.min(32767, inp[i] * 32768));
        const b64  = btoa(String.fromCharCode(...new Uint8Array(pcm.buffer)));
        ws.send(JSON.stringify({ type: 'audio', data: b64 }));
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
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { sampleRate: 24000, channelCount: 1, echoCancellation: true, noiseSuppression: true }
      });
      mediaStreamRef.current = stream;

      const ws = new WebSocket(`${WS_URL}?mode=consult`);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({
          type: 'start_consult',
          userName: displayName,
          financialContext: getFinancialContext(),
          conversationHistory: messages.map(m => ({
            role: m.type === 'user' ? 'user' : 'assistant',
            content: m.text,
          })),
        }));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'session_started') {
            isConnectedRef.current = true;
            setStatus('듣는중...');
            startAudioCapture(stream, ws);
          }
          if (msg.type === 'audio' && msg.data) playAudio(msg.data);

          // ── [NEW] 사용자 발화 수신 시 백그라운드 멀티에이전트 분석 ──
          if (msg.type === 'transcript' && msg.role === 'user') {
            setMessages(prev => [...prev, { id: Date.now().toString(), type: 'user', text: msg.text, timestamp: new Date() }]);

            // 백그라운드: 멀티에이전트+RAG 분석 요청 (음성 답변과 병렬)
            if (msg.text.length > 5) {
              setPanelLoading(true);
              fetch(`${API_URL}/api/consult-chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  message: msg.text,
                  userName: displayName,
                  financialContext: null,
                  conversationHistory: messages.slice(-6).map(m => ({ role: m.type === 'user' ? 'user' : 'assistant', content: m.text })),
                }),
              })
              .then(r => r.json())
              .then(data => {
                if (data.panelData) setPanelData(data.panelData);
                setPanelLoading(false);
              })
              .catch(() => setPanelLoading(false));
            }
          }

          if (msg.type === 'transcript' && msg.role === 'assistant')
            setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), type: 'ai', text: msg.text, timestamp: new Date() }]);
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

  const stopVoiceMode   = () => { cleanupVoiceMode(); setIsVoiceMode(false); setStatus('대기중'); };
  const toggleVoiceMode = () => { isVoiceMode ? stopVoiceMode() : startVoiceMode(); };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendTextMessage(inputText); }
  };

  // ── 단계 라벨 ──────────────────────────────────────────────
  const stepLabels: { [k: number]: string } = {
    1: '1단계 · Opening',
    2: '2단계 · Fact Finding',
    3: '3단계 · 수입지출 분석',
    4: '4단계 · 금융집짓기',
    5: '5단계 · 포트폴리오',
    6: '6단계 · 7대 영역 설계',
    7: '7단계 · 최종의견',
    8: '8단계 · Closing',
  };

  // ── [NEW] 에이전트 라벨 매핑 ───────────────────────────────
  const agentNames: Record<string, string> = {
    analysis:       '📊 예산진단',
    insurance:      '🛡️ 보험분석',
    retirement:     '🏦 은퇴설계',
    debt_savings:   '💰 부채/저축',
    investment_tax: '📈 투자/세금',
    realestate:     '🏘️ 부동산',
    emotion:        '😊 감정분석',
  };

  // ────────────────────────────────────────────────────────────
  //  렌더링
  // ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── 헤더 ── */}
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-white text-lg">←</button>
        <img src={PROFILE_IMAGE_URL} alt="오상열" className="w-9 h-9 rounded-full object-cover border-2 border-white/50"/>
        <div className="flex-1">
          <p className="text-white font-bold text-sm">AI 재무설계 상담</p>
          <p className="text-yellow-100 text-xs">{stepLabels[consultStep]}</p>
        </div>
        {/* 단계 진행바 */}
        <div className="flex gap-1">
          {[1,2,3,4,5,6,7,8].map(s => (
            <div key={s} className={`w-2 h-2 rounded-full ${s <= consultStep ? 'bg-white' : 'bg-white/30'}`}/>
          ))}
        </div>
        {/* 음성 토글 */}
        <button onClick={() => setVoiceEnabled(!voiceEnabled)} className={`w-9 h-9 rounded-full flex items-center justify-center ${voiceEnabled ? 'bg-white/30' : 'bg-white/10'}`}>
          {voiceEnabled
            ? <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
            : <svg className="w-4 h-4 text-white/50" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3z"/></svg>
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
                <div key={i} className="w-1 bg-green-500 rounded-full animate-pulse"
                  style={{ height: `${12 + Math.random() * 12}px`, animationDelay: `${i * 100}ms` }}/>
              ))}
            </div>
            <span className="text-green-700 font-semibold text-sm">머니야와 대화중... "{status}"</span>
          </div>
          <button onClick={stopVoiceMode} className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">종료</button>
        </div>
      )}

      {/* ── 채팅 영역 ── */}
      <div
        ref={chatAreaRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        style={{ paddingBottom: '160px' }}
      >
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-2.5 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
            {message.type === 'ai' && (
              <img src={PROFILE_IMAGE_URL} alt="머니야" className="w-9 h-9 rounded-full object-cover flex-shrink-0 mt-1"/>
            )}
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
              ${message.type === 'ai'
                ? 'bg-white border border-gray-100 text-gray-800 rounded-tl-none shadow-sm'
                : 'bg-yellow-500 text-white rounded-tr-none'}`}>
              {message.text}
            </div>
          </div>
        ))}

        {/* 로딩 */}
        {isLoading && (
          <div className="flex gap-2.5">
            <img src={PROFILE_IMAGE_URL} alt="머니야" className="w-9 h-9 rounded-full object-cover flex-shrink-0"/>
            <div className="px-4 py-3 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center gap-1">
                {[0, 150, 300].map((d) => (
                  <div key={d} className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }}/>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── [NEW] 보조 분석 패널 (음성 모드에서만 표시) ── */}
      {isVoiceMode && (panelData.length > 0 || panelLoading) && (
        <div className="fixed bottom-[88px] left-0 right-0 mx-4 mb-2 rounded-xl border border-yellow-200 bg-yellow-50 p-3 z-40">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-bold text-yellow-800">📊 AI 분석</span>
            {panelLoading && <span className="text-xs text-yellow-600 animate-pulse">분석중...</span>}
          </div>
          <div className="space-y-1">
            {panelData.map((item, i) => {
              const label = agentNames[item.agent] || item.agent;
              const summary = item.summary;

              let displayText = '';
              if (summary.diagnosis)        displayText = summary.diagnosis;
              else if (summary.coverageAnalysis) displayText = summary.coverageAnalysis;
              else if (summary.retirementGap)    displayText = `부족: ${summary.retirementGap}`;
              else if (summary.debtPlan)         displayText = summary.debtPlan;
              else if (summary.readiness)        displayText = summary.readiness;
              else if (summary.affordability)    displayText = summary.affordability;
              else if (summary.emotion)          displayText = `${summary.emotion} → ${summary.suggestedTone}`;
              else if (summary.warning)          displayText = `⚠️ ${summary.warning}`;
              else if (summary.raw)              displayText = String(summary.raw).slice(0, 80);
              else                               displayText = JSON.stringify(summary).slice(0, 80);

              return (
                <div key={i} className="flex items-start gap-2 text-xs text-yellow-900">
                  <span className="font-medium whitespace-nowrap">{label}</span>
                  <span className="text-yellow-700">{displayText}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 입력바 ── */}
      <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 z-50">
        <div className="flex items-center gap-2 max-w-md mx-auto">

          {/* + 버튼 */}
          <button
            className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center"
            onClick={() => { /* 추후 파일첨부 기능 */ }}
          >
            <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </button>

          {/* 마이크 버튼 */}
          <button
            onClick={toggleVoiceMode}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all
              ${isVoiceMode ? 'bg-red-500 animate-pulse scale-110' : 'bg-amber-400'}`}
          >
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
            </svg>
          </button>

          {/* 텍스트 입력 */}
          <div className="flex-1 flex items-center bg-gray-100 border border-gray-200 rounded-full px-4 py-2">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="머니야에게 답변해주세요..."
              className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
              disabled={isLoading || isVoiceMode}
            />
          </div>

          {/* 전송 버튼 */}
          <button
            onClick={() => sendTextMessage(inputText)}
            disabled={!inputText.trim() || isLoading || isVoiceMode}
            className={`w-10 h-10 rounded-full flex items-center justify-center
              ${inputText.trim() && !isLoading && !isVoiceMode ? 'bg-yellow-500' : 'bg-gray-300'}`}
          >
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
