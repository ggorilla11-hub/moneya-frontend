// ═══════════════════════════════════════════════════════════════════
//  ConsultationPage.tsx — Phase 2 완전 통합
//  = WebRTC 화상상담 + AI 머니야 음성 + 스마트 노트 플랫폼
//  브랜치: moneya-frontend → develop
//  확인: moneya-develop.vercel.app
// ═══════════════════════════════════════════════════════════════════

import { useState, useRef, useEffect, useCallback } from 'react';

// ── 환경설정 ─────────────────────────────────────────────────────
const WS_URL  = process.env.NEXT_PUBLIC_WS_URL  || 'wss://moneya-server.onrender.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://moneya-server.onrender.com';
const MONEYA_LOGO = 'https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/AI%EB%A8%B8%EB%8B%88%EC%95%BC%20%ED%99%95%EC%A0%95%EC%9D%B4%EB%AF%B8%EC%A7%80%EC%95%88.png?alt=media&token=c250863d-7cda-424a-800d-884b20e30b1a';

// ── ICE 서버 ─────────────────────────────────────────────────────
const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ]
};

// ── 타입 정의 ─────────────────────────────────────────────────────
interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  tag?: string;
}

type NoteTab = 'house' | 'chart' | 'calc' | 'video' | 'web';
type FontSize = 'normal' | 'large';

interface NoteState {
  activeTab: NoteTab;
  highlight: string;
  calcData: Record<string, any>;
}

// ── 연령별 글자 크기 훅 ──────────────────────────────────────────
function useFontSize() {
  const [fontSize, setFontSize] = useState<FontSize>('normal');
  const toggle = useCallback(() => {
    setFontSize(p => p === 'normal' ? 'large' : 'normal');
  }, []);
  return { fontSize, toggle };
}

// ════════════════════════════════════════════════════════════════════
//  메인 컴포넌트
// ════════════════════════════════════════════════════════════════════
export default function ConsultationPage() {
  const { fontSize, toggle: toggleFontSize } = useFontSize();
  const fs = fontSize === 'large' ? 1.2 : 1; // 배율

  // ── 화상 / 음성 상태 ────────────────────────────────────────────
  const [isVideoMode,  setIsVideoMode]  = useState(false);
  const [videoStatus,  setVideoStatus]  = useState<'idle'|'connecting'|'connected'|'error'>('idle');
  const [isVoiceMode,  setIsVoiceMode]  = useState(false);
  const [isMicOn,      setIsMicOn]      = useState(true);
  const [isCamOn,      setIsCamOn]      = useState(true);
  const [isRecording,  setIsRecording]  = useState(false);
  const [callSeconds,  setCallSeconds]  = useState(0);
  const [isMobile,     setIsMobile]     = useState(false);
  const [showPCAlert,  setShowPCAlert]  = useState(false);

  // ── 스마트 노트 상태 ────────────────────────────────────────────
  const [noteState, setNoteState] = useState<NoteState>({
    activeTab: 'house',
    highlight: '',
    calcData: {}
  });
  const [showChat,  setShowChat]  = useState(false);

  // ── 대화 기록 ───────────────────────────────────────────────────
  const [messages,     setMessages]     = useState<Message[]>([]);
  const [displayName,  setDisplayName]  = useState('고객');

  // ── refs ────────────────────────────────────────────────────────
  const wsRef           = useRef<WebSocket | null>(null);
  const pcRef           = useRef<RTCPeerConnection | null>(null);
  const localStreamRef  = useRef<MediaStream | null>(null);
  const localVideoRef   = useRef<HTMLVideoElement>(null);
  const remoteVideoRef  = useRef<HTMLVideoElement>(null);
  const audioCtxRef     = useRef<AudioContext | null>(null);
  const recorderRef     = useRef<MediaRecorder | null>(null);
  const recordedRef     = useRef<Blob[]>([]);
  const timerRef        = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef  = useRef<HTMLDivElement>(null);

  // URL 파라미터 roomId (고객 입장용)
  const roomIdFromUrl = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('room')
    : null;

  // ── 모바일 감지 ─────────────────────────────────────────────────
  useEffect(() => {
    const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
      || window.innerWidth < 768;
    setIsMobile(mobile);
    if (mobile) setShowPCAlert(true);
  }, []);

  // ── 타이머 ──────────────────────────────────────────────────────
  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => setCallSeconds(s => s + 1), 1000);
  }, []);
  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setCallSeconds(0);
  }, []);
  const formatTime = (s: number) =>
    `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // ── 오디오 재생 ─────────────────────────────────────────────────
  const playAudio = useCallback(async (base64: string) => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext({ sampleRate: 24000 });
      const raw   = atob(base64);
      const bytes = new Uint8Array(raw.length).map((_, i) => raw.charCodeAt(i));
      const i16   = new Int16Array(bytes.buffer);
      const f32   = new Float32Array(i16.length);
      for (let i = 0; i < i16.length; i++) f32[i] = i16[i] / 32768;
      const buf = audioCtxRef.current.createBuffer(1, f32.length, 24000);
      buf.copyToChannel(f32, 0);
      const src = audioCtxRef.current.createBufferSource();
      src.buffer = buf;
      src.connect(audioCtxRef.current.destination);
      src.start();
    } catch(e) { console.error('[오디오]', e); }
  }, []);

  // ── 마이크 캡처 ─────────────────────────────────────────────────
  const startAudioCapture = useCallback((stream: MediaStream, ws: WebSocket) => {
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext({ sampleRate: 24000 });
    const ctx  = audioCtxRef.current;
    const src  = ctx.createMediaStreamSource(stream);
    const proc = ctx.createScriptProcessor(4096, 1, 1);
    proc.onaudioprocess = (e) => {
      if (ws.readyState !== WebSocket.OPEN) return;
      const f32 = e.inputBuffer.getChannelData(0);
      const i16 = new Int16Array(f32.length);
      for (let i = 0; i < f32.length; i++) i16[i] = Math.max(-32768, Math.min(32767, f32[i] * 32768));
      const b64 = btoa(String.fromCharCode(...new Uint8Array(i16.buffer)));
      ws.send(JSON.stringify({ type: 'audio', data: b64 }));
    };
    src.connect(proc);
    proc.connect(ctx.destination);
  }, []);

  // ── WebSocket 메시지 처리 ────────────────────────────────────────
  const handleWsMsg = useCallback(async (event: MessageEvent, ws: WebSocket) => {
    const msg = JSON.parse(event.data);

    // 화상 시그널링
    if (msg.type === 'video_guest_joined') {
      const pc = pcRef.current; if (!pc) return;
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      ws.send(JSON.stringify({ type: 'video_signal', signal: { type: 'offer', sdp: offer } }));
    }
    if (msg.type === 'video_signal') {
      const pc = pcRef.current; if (!pc) return;
      const s = msg.signal;
      if (s.type === 'offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(s.sdp));
        const ans = await pc.createAnswer();
        await pc.setLocalDescription(ans);
        ws.send(JSON.stringify({ type: 'video_signal', signal: { type: 'answer', sdp: ans } }));
      } else if (s.type === 'answer') {
        await pc.setRemoteDescription(new RTCSessionDescription(s.sdp));
      } else if (s.type === 'ice-candidate') {
        await pc.addIceCandidate(new RTCIceCandidate(s.candidate));
      }
    }
    if (msg.type === 'video_ended') stopVideoConsult();

    // ── 스마트 노트 자동 업데이트 (서버 Function Calling 결과) ──
    if (msg.type === 'note_update') {
      setNoteState(prev => ({
        ...prev,
        activeTab: msg.note_type || prev.activeTab,
        highlight: msg.highlight || prev.highlight,
        calcData: { ...prev.calcData, ...(msg.data || {}) }
      }));
    }

    // AI 머니야 음성 메시지
    if (msg.type === 'session_started') {}
    if (msg.type === 'audio' && msg.data) await playAudio(msg.data);
    if (msg.type === 'transcript' && msg.role === 'user') {
      setMessages(p => [...p, { id: Date.now().toString(), role: 'user', text: msg.text }]);
    }
    if (msg.type === 'transcript' && msg.role === 'assistant') {
      setMessages(p => [...p, {
        id: (Date.now()+1).toString(), role: 'assistant', text: msg.text,
        tag: msg.tag
      }]);
    }
    if (msg.type === 'interrupt') {}
  }, [playAudio]);

  // ── 화상상담 시작 ────────────────────────────────────────────────
  const startVideoConsult = useCallback(async (roomId?: string | null) => {
    try {
      setVideoStatus('connecting');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: { sampleRate: 24000, echoCancellation: true, noiseSuppression: true }
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const ws = new WebSocket(`${WS_URL}?mode=video`);
      wsRef.current = ws;
      ws.onmessage = (e) => handleWsMsg(e, ws);
      ws.onerror   = () => setVideoStatus('error');

      const pc = new RTCPeerConnection(ICE_SERVERS);
      pcRef.current = pc;
      stream.getTracks().forEach(t => pc.addTrack(t, stream));
      pc.ontrack = (e) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = e.streams[0];
          setVideoStatus('connected');
        }
      };
      pc.onicecandidate = (e) => {
        if (e.candidate && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'video_signal', signal: { type: 'ice-candidate', candidate: e.candidate } }));
        }
      };
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') setVideoStatus('connected');
        if (pc.connectionState === 'failed')    setVideoStatus('error');
      };

      ws.onopen = () => {
        ws.send(JSON.stringify(roomId
          ? { type: 'video_join_room', roomId }
          : { type: 'video_create_room' }
        ));
        ws.send(JSON.stringify({
          type: 'start_consult',
          userName: displayName,
          conversationHistory: messages.map(m => ({ role: m.role, content: m.text }))
        }));
        startAudioCapture(stream, ws);
      };

      setIsVideoMode(true);
      setIsVoiceMode(true);
      startTimer();

    } catch(e: any) {
      setVideoStatus('error');
      if (e.name === 'NotAllowedError') alert('카메라/마이크 권한이 필요합니다.\n브라우저 설정에서 허용해주세요.');
      else alert('화상상담 시작 오류: ' + e.message);
    }
  }, [displayName, messages, handleWsMsg, startAudioCapture, startTimer]);

  // ── 화상상담 종료 ────────────────────────────────────────────────
  const stopVideoConsult = useCallback(() => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'video_end' }));
      wsRef.current.send(JSON.stringify({ type: 'stop' }));
      wsRef.current.close();
    }
    wsRef.current = null;
    pcRef.current?.close(); pcRef.current = null;
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    if (localVideoRef.current)  localVideoRef.current.srcObject  = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setIsVideoMode(false); setIsVoiceMode(false);
    setVideoStatus('idle'); stopTimer();
  }, [stopTimer]);

  const toggleMic = useCallback(() => {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !isMicOn; });
    setIsMicOn(p => !p);
  }, [isMicOn]);

  const toggleCam = useCallback(() => {
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !isCamOn; });
    setIsCamOn(p => !p);
  }, [isCamOn]);

  const toggleRecording = useCallback(() => {
    if (!isRecording) {
      const stream = remoteVideoRef.current?.srcObject as MediaStream;
      if (!stream) return;
      recordedRef.current = [];
      const rec = new MediaRecorder(stream, { mimeType: 'video/webm' });
      rec.ondataavailable = e => { if (e.data.size > 0) recordedRef.current.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(recordedRef.current, { type: 'video/webm' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `머니야상담_${new Date().toISOString().slice(0,10)}.webm`;
        a.click();
      };
      rec.start(1000);
      recorderRef.current = rec;
      setIsRecording(true);
    } else {
      recorderRef.current?.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  useEffect(() => {
    if (roomIdFromUrl && !isVideoMode) startVideoConsult(roomIdFromUrl);
    return () => { stopVideoConsult(); stopTimer(); };
  }, []);

  // ════════════════════════════════════════════════════════════════
  //  SVG 금융집짓기 컴포넌트
  // ════════════════════════════════════════════════════════════════
  const FinancialHouseSVG = () => (
    <svg width="100%" viewBox="0 0 520 320" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: 8 }}>
      <defs>
        <linearGradient id="goldG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C8920F"/>
          <stop offset="100%" stopColor="#E8C040"/>
        </linearGradient>
        <linearGradient id="navyG" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1A3A6E"/>
          <stop offset="100%" stopColor="#0F2A5C"/>
        </linearGradient>
      </defs>
      <rect width="520" height="320" fill="#F8F9FC"/>
      {/* 굴뚝 */}
      <rect x="355" y="28" width="44" height="58" rx="4" fill="#9B59B6" opacity="0.75"/>
      <text x="377" y="52" textAnchor="middle" fontSize="9" fill="white" fontWeight="700">부동산</text>
      <text x="377" y="65" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.8)">설계</text>
      {/* 지붕 */}
      <polygon points="75,125 260,38 445,125" fill="url(#navyG)"/>
      <text x="260" y="84" textAnchor="middle" fontSize="12" fill="white" fontWeight="700">투자설계</text>
      <text x="260" y="100" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.75)">다락방 / 세금설계</text>
      {/* 처마보 */}
      <rect x="75" y="123" width="370" height="22" fill="#E67E22" opacity="0.85"/>
      <text x="260" y="138" textAnchor="middle" fontSize="10" fill="white" fontWeight="700">생로병사 (처마보)</text>
      {/* 기둥 - 부채 */}
      <rect x="77" y="145" width="105" height="108" rx="4" fill="#3498DB" opacity="0.85"/>
      <text x="129" y="191" textAnchor="middle" fontSize="11" fill="white" fontWeight="700">부채설계</text>
      <text x="129" y="207" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.8)">(거실)</text>
      {/* 기둥 - 저축 */}
      <rect x="207" y="145" width="106" height="108" rx="4" fill="#27AE60" opacity="0.85"/>
      <text x="260" y="191" textAnchor="middle" fontSize="11" fill="white" fontWeight="700">저축설계</text>
      <text x="260" y="207" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.8)">(건넌방)</text>
      {/* 기둥 - 은퇴 (강조) */}
      <rect x="337" y="141" width="108" height="116" rx="4" fill="url(#goldG)"/>
      <rect x="337" y="141" width="108" height="116" rx="4" fill="none" stroke="#D4A017" strokeWidth="2.5"/>
      <text x="391" y="183" textAnchor="middle" fontSize="11" fill="white" fontWeight="700">은퇴설계 ★</text>
      <text x="391" y="199" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.9)">(안방 — 가장 중요)</text>
      {noteState.calcData.lumpSum && (
        <>
          <text x="391" y="218" textAnchor="middle" fontSize="11" fill="white" fontWeight="700">
            {Math.round(noteState.calcData.lumpSum/10000)}억 필요
          </text>
          <text x="391" y="234" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.75)">
            월부족 {noteState.calcData.gap}만원
          </text>
        </>
      )}
      {/* 지하 */}
      <rect x="77" y="257" width="368" height="56" rx="4" fill="#2C3E50" opacity="0.9"/>
      <text x="200" y="282" textAnchor="middle" fontSize="10" fill="white" fontWeight="700">🛡️ 보장자산 (보험)</text>
      <text x="200" y="300" textAnchor="middle" fontSize="9" fill={noteState.highlight === 'insurance' ? '#FF6B6B' : 'rgba(255,255,255,0.65)'} fontWeight={noteState.highlight === 'insurance' ? '700' : '400'}>
        {noteState.highlight === 'insurance' ? '⚠️ 사망보장 부족 분석 중...' : '비상예비자금 + 보험'}
      </text>
      <text x="390" y="282" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.8)" fontWeight="600">🔥 비상예비금</text>
      <text x="390" y="300" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.55)">목표: 월생활비 × 6</text>
      {/* 연료 레이블 */}
      <text x="18" y="200" textAnchor="middle" fontSize="9" fill="#888" fontWeight="700">연료</text>
      <text x="18" y="213" textAnchor="middle" fontSize="8" fill="#aaa">수입</text>
      <text x="18" y="226" textAnchor="middle" fontSize="8" fill="#aaa">지출</text>
    </svg>
  );

  // ════════════════════════════════════════════════════════════════
  //  화상상담 전체화면 레이아웃
  // ════════════════════════════════════════════════════════════════
  if (isVideoMode) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: '#111',
        display: 'flex', flexDirection: 'column',
        fontFamily: "'Noto Sans KR', sans-serif",
        fontSize: `${fs}rem`
      }}>
        {/* PC 권장 알림 (모바일에서만) */}
        {isMobile && showPCAlert && (
          <div style={{
            background: 'rgba(212,160,23,0.95)', color: 'white',
            padding: '10px 16px', textAlign: 'center',
            fontSize: `${0.75 * fs}rem`, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <span>💡 화상상담은 PC/태블릿에서 더 편리합니다</span>
            <button onClick={() => setShowPCAlert(false)}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px' }}>×</button>
          </div>
        )}

        {/* 최상단 바 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', height: 48,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={MONEYA_LOGO} alt="머니야" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }}/>
            <span style={{ color: 'white', fontWeight: 700, fontSize: `${0.9 * fs}rem` }}>AI 머니야 화상상담</span>
            <span style={{
              background: 'rgba(52,199,89,0.2)', border: '1px solid rgba(52,199,89,0.4)',
              color: '#34C759', fontSize: `${0.65 * fs}rem`, fontWeight: 700,
              padding: '2px 8px', borderRadius: 20
            }}>● LIVE</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: 'white', fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontSize: `${0.85 * fs}rem` }}>
              {formatTime(callSeconds)}
            </span>
            {/* 글자 크기 토글 */}
            <button onClick={toggleFontSize} style={{
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.7)', padding: '3px 10px', borderRadius: 20,
              cursor: 'pointer', fontSize: `${0.7 * fs}rem`
            }}>
              {fontSize === 'normal' ? '가+ 크게' : '가- 작게'}
            </button>
          </div>
        </div>

        {/* 메인 영역 */}
        <div style={{
          flex: 1, display: 'grid', overflow: 'hidden',
          gridTemplateColumns: isMobile ? '1fr' : '220px 1fr 260px',
          gridTemplateRows: isMobile ? 'auto 1fr auto' : '1fr',
        }}>

          {/* ── 좌측: AI 머니야 화상 ── */}
          <div style={{
            background: 'linear-gradient(145deg,#0D1B3E,#0F2A5C)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden',
            ...(isMobile ? { height: 160 } : {})
          }}>
            {/* AI 아바타 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 2 }}>
              <div style={{
                width: isMobile ? 60 : 80, height: isMobile ? 60 : 80,
                borderRadius: '50%', overflow: 'hidden',
                boxShadow: '0 0 30px rgba(212,160,23,0.35)'
              }}>
                <img src={MONEYA_LOGO} alt="머니야" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
              </div>
              <span style={{ color: 'white', fontWeight: 700, fontSize: `${0.8 * fs}rem` }}>AI 머니야</span>
              {/* 음성 파형 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 16 }}>
                {[0,1,2,3,4].map(i => (
                  <div key={i} style={{
                    width: 3, background: '#E8C040', borderRadius: 3,
                    animation: `wave 0.9s ease-in-out ${i*0.12}s infinite`
                  }}/>
                ))}
              </div>
            </div>
            {/* 고객 PIP */}
            <div style={{
              position: 'absolute', bottom: 8, right: 8,
              width: isMobile ? 56 : 72, height: isMobile ? 72 : 92,
              background: 'linear-gradient(145deg,#2a2a2a,#1a1a1a)',
              borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.15)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
              overflow: 'hidden'
            }}>
              <video ref={localVideoRef} autoPlay playsInline muted
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: isCamOn ? 1 : 0 }}/>
              {!isCamOn && <span style={{ fontSize: 20, zIndex: 1 }}>👤</span>}
            </div>
            {/* 원격 영상 (연결됐을 때) */}
            <video ref={remoteVideoRef} autoPlay playsInline
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: videoStatus === 'connected' ? 1 : 0 }}/>
          </div>

          {/* ── 중앙: 스마트 노트 ── */}
          <div style={{ background: '#FAFAF8', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* 노트 툴바 */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '6px 12px', background: 'white',
              borderBottom: '1px solid #E8E8E8', flexShrink: 0, overflowX: 'auto'
            }}>
              <div style={{ display: 'flex', gap: 2 }}>
                {([
                  ['house', '🏠', '금융집짓기'],
                  ['chart', '📊', '포트폴리오'],
                  ['calc',  '🧮', '계산'],
                  ['video', '🎬', '영상'],
                  ['web',   '🌐', '웹자료'],
                ] as [NoteTab, string, string][]).map(([tab, icon, label]) => (
                  <button key={tab} onClick={() => setNoteState(p => ({ ...p, activeTab: tab }))}
                    style={{
                      padding: `4px ${isMobile ? 8 : 10}px`,
                      borderRadius: 6, border: 'none', cursor: 'pointer',
                      fontSize: `${(isMobile ? 0.65 : 0.7) * fs}rem`,
                      fontWeight: 600, whiteSpace: 'nowrap',
                      background: noteState.activeTab === tab ? '#FFF3CC' : 'transparent',
                      color: noteState.activeTab === tab ? '#C8920F' : '#888',
                      fontFamily: "'Noto Sans KR', sans-serif"
                    }}>
                    {icon} {!isMobile && label}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 4, fontSize: `${0.75 * fs}rem`, color: '#aaa' }}>
                <span title="AI가 자동 업데이트 중" style={{ cursor: 'default' }}>🤖 자동</span>
              </div>
            </div>

            {/* 노트 콘텐츠 */}
            <div style={{ flex: 1, overflowY: 'auto', padding: `${isMobile ? 12 : 20}px` }}>

              {/* 금융집짓기 */}
              {noteState.activeTab === 'house' && (
                <div>
                  <div style={{ fontWeight: 700, color: '#0F2A5C', marginBottom: 10, fontSize: `${0.8 * fs}rem`, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 3, height: 14, background: '#D4A017', display: 'inline-block', borderRadius: 2 }}/>
                    금융집짓기® — 고객님 현황
                    {noteState.highlight === 'insurance' && (
                      <span style={{ background: '#FFE5E5', color: '#C0392B', fontSize: `${0.65 * fs}rem`, padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>
                        ⚠️ 보험 분석 중
                      </span>
                    )}
                  </div>
                  <FinancialHouseSVG />
                  {/* 요약 칩 */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                    {[
                      { bg: '#FFF3CC', color: '#C8920F', text: '💰 월 수입 분석' },
                      { bg: '#FFE5E5', color: '#C0392B', text: '⚠️ 사망보장 부족' },
                      { bg: '#E8F5E9', color: '#1E7E34', text: '✅ 보험료 비율 적정' },
                      { bg: '#E3F2FD', color: '#1A5CA8', text: '🎯 은퇴 목표 설정' },
                    ].map((c, i) => (
                      <span key={i} style={{
                        background: c.bg, color: c.color,
                        fontSize: `${0.65 * fs}rem`, fontWeight: 700,
                        padding: '4px 10px', borderRadius: 20
                      }}>{c.text}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* 포트폴리오 차트 */}
              {noteState.activeTab === 'chart' && (
                <div>
                  <div style={{ fontWeight: 700, color: '#0F2A5C', marginBottom: 12, fontSize: `${0.8 * fs}rem` }}>
                    📊 자산 포트폴리오 & 은퇴 시뮬레이션
                  </div>
                  <svg width="100%" viewBox="0 0 480 200" style={{ background: '#F8F9FC', borderRadius: 8, display: 'block' }}>
                    <text x="240" y="24" textAnchor="middle" fontSize="12" fill="#333" fontWeight="700">은퇴자금 시뮬레이션</text>
                    <line x1="50" y1="40" x2="50" y2="160" stroke="#ddd" strokeWidth="1"/>
                    <line x1="50" y1="160" x2="460" y2="160" stroke="#ddd" strokeWidth="1"/>
                    <line x1="50" y1="100" x2="460" y2="100" stroke="#eee" strokeWidth="1" strokeDasharray="4,3"/>
                    <text x="44" y="44" textAnchor="end" fontSize="8" fill="#888">4억</text>
                    <text x="44" y="103" textAnchor="end" fontSize="8" fill="#888">2억</text>
                    <text x="44" y="163" textAnchor="end" fontSize="8" fill="#888">0</text>
                    <text x="90"  y="175" textAnchor="middle" fontSize="8" fill="#888">현재</text>
                    <text x="200" y="175" textAnchor="middle" fontSize="8" fill="#888">5년 후</text>
                    <text x="310" y="175" textAnchor="middle" fontSize="8" fill="#888">10년 후</text>
                    <text x="420" y="175" textAnchor="middle" fontSize="8" fill="#888">15년 후</text>
                    <polyline points="90,152 200,138 310,118 420,88" fill="none" stroke="#E74C3C" strokeWidth="2" strokeDasharray="6,3"/>
                    <polyline points="90,152 200,128 310,95 420,52" fill="none" stroke="#D4A017" strokeWidth="2.5"/>
                    <text x="300" y="55" fontSize="9" fill="#E74C3C">현재 추세</text>
                    <text x="380" y="40" fontSize="9" fill="#C8920F" fontWeight="700">개선 후</text>
                    <circle cx="420" cy="88" r="4" fill="#E74C3C"/>
                    <text x="420" y="80" textAnchor="middle" fontSize="9" fill="#E74C3C" fontWeight="700">
                      {noteState.calcData.lumpSum ? `${Math.round(noteState.calcData.lumpSum/10000)}억` : '2.4억'}
                    </text>
                    <circle cx="420" cy="52" r="4" fill="#D4A017"/>
                    <text x="420" y="44" textAnchor="middle" fontSize="9" fill="#C8920F" fontWeight="700">목표 4억 ✓</text>
                  </svg>
                </div>
              )}

              {/* 계산 결과 */}
              {noteState.activeTab === 'calc' && (
                <div>
                  <div style={{ fontWeight: 700, color: '#0F2A5C', marginBottom: 12, fontSize: `${0.8 * fs}rem` }}>
                    🧮 실시간 재무 계산 결과
                  </div>
                  <div style={{ background: 'linear-gradient(135deg,#0F2A5C,#1A3A6E)', borderRadius: 12, padding: 16, marginBottom: 12, color: 'white' }}>
                    <div style={{ fontSize: `${0.7 * fs}rem`, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>은퇴자금 시뮬레이션</div>
                    <div style={{ fontSize: `${1.6 * fs}rem`, fontWeight: 700, color: '#E8C040' }}>
                      {noteState.calcData.lumpSum ? `${noteState.calcData.lumpSum.toLocaleString()}만원` : '계산 대기 중...'}
                    </div>
                    {noteState.calcData.gap && (
                      <div style={{ fontSize: `${0.7 * fs}rem`, color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>
                        월 부족 {noteState.calcData.gap}만원 · {noteState.calcData.retireAge}세 은퇴 기준
                      </div>
                    )}
                  </div>
                  {noteState.calcData.diff && (
                    <div style={{
                      background: noteState.calcData.diff > 0 ? '#FFF3F3' : '#F1F8E9',
                      border: `1px solid ${noteState.calcData.diff > 0 ? '#FFCDD2' : '#C5E1A5'}`,
                      borderRadius: 10, padding: 12, marginBottom: 12,
                      fontSize: `${0.75 * fs}rem`,
                      color: noteState.calcData.diff > 0 ? '#C62828' : '#2E7D32'
                    }}>
                      {noteState.calcData.diff > 0
                        ? `⚠️ 생활비 ${noteState.calcData.diff}만원 초과`
                        : `✅ 생활비 양호 (기준 이내)`}
                    </div>
                  )}
                  <div style={{ fontSize: `${0.7 * fs}rem`, color: '#aaa', textAlign: 'center' }}>
                    AI 머니야가 대화 내용을 분석하여 자동으로 업데이트합니다
                  </div>
                </div>
              )}

              {/* 영상 */}
              {noteState.activeTab === 'video' && (
                <div>
                  <div style={{ fontWeight: 700, color: '#0F2A5C', marginBottom: 12, fontSize: `${0.8 * fs}rem` }}>
                    🎬 니즈환기 영상 라이브러리
                  </div>
                  {[
                    { title: '노후준비, 왜 지금 해야 하나요?', icon: '👴👵', duration: '2:34', theme: '#1a1a2e' },
                    { title: '보험, 제대로 알고 계신가요?', icon: '🛡️', duration: '1:58', theme: '#1a2a1a' },
                    { title: '복리의 기적 — 10년의 차이', icon: '📈', duration: '3:12', theme: '#2a1a0a' },
                  ].map((v, i) => (
                    <div key={i} style={{
                      background: v.theme, borderRadius: 12, overflow: 'hidden',
                      marginBottom: 10, cursor: 'pointer', position: 'relative',
                      paddingTop: '40%', display: 'block'
                    }}>
                      <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8
                      }}>
                        <span style={{ fontSize: `${2 * fs}rem` }}>{v.icon}</span>
                        <div style={{ width: 44, height: 44, background: 'rgba(212,160,23,0.9)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>▶</div>
                      </div>
                      <div style={{ position: 'absolute', bottom: 8, left: 12, color: 'white', fontSize: `${0.7 * fs}rem`, fontWeight: 700 }}>{v.title}</div>
                      <div style={{ position: 'absolute', bottom: 8, right: 12, background: 'rgba(0,0,0,0.7)', color: 'white', fontSize: `${0.65 * fs}rem`, padding: '2px 6px', borderRadius: 4 }}>{v.duration}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* 웹자료 */}
              {noteState.activeTab === 'web' && (
                <div>
                  <div style={{ fontWeight: 700, color: '#0F2A5C', marginBottom: 12, fontSize: `${0.8 * fs}rem` }}>
                    🌐 실시간 참조 자료
                  </div>
                  <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E8E8E8', overflow: 'hidden', marginBottom: 12 }}>
                    <div style={{ background: '#F5F5F5', padding: '8px 12px', borderBottom: '1px solid #E8E8E8', fontSize: `${0.65 * fs}rem`, color: '#888', display: 'flex', gap: 8 }}>
                      <span>🏛️</span><span>국민연금공단 — 예상 수령액 기준표</span>
                    </div>
                    <div style={{ padding: '12px 14px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: `${0.7 * fs}rem` }}>
                        <thead>
                          <tr style={{ background: '#F5F5F5' }}>
                            <th style={{ padding: '5px 8px', textAlign: 'left', border: '1px solid #E0E0E0' }}>가입기간</th>
                            <th style={{ padding: '5px 8px', textAlign: 'right', border: '1px solid #E0E0E0' }}>월 수령액</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[['10년','약 23만원'],['20년 (해당)','약 65만원'],['30년','약 97만원']].map(([y,amt],i) => (
                            <tr key={i} style={{ background: i === 1 ? '#FFF9EC' : 'white' }}>
                              <td style={{ padding: '5px 8px', border: '1px solid #E0E0E0', fontWeight: i === 1 ? 700 : 400, color: i === 1 ? '#C8920F' : 'inherit' }}>{y}</td>
                              <td style={{ padding: '5px 8px', border: '1px solid #E0E0E0', textAlign: 'right', fontWeight: i === 1 ? 700 : 400, color: i === 1 ? '#C8920F' : 'inherit' }}>{amt}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── 우측: 분석 패널 (모바일에서는 숨김) ── */}
          {!isMobile && (
            <div style={{
              background: '#2C2C2E', borderLeft: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#D4A017', fontSize: `${0.75 * fs}rem`, fontWeight: 700, flexShrink: 0 }}>
                📊 실시간 분석
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
                {/* 8단계 */}
                <div style={{ fontSize: `${0.65 * fs}rem`, color: 'rgba(255,255,255,0.45)', fontWeight: 700, marginBottom: 6, letterSpacing: '0.5px' }}>8단계 진행 현황</div>
                {['수입지출 분석','보험 적정성','저축 설계','부채 관리','은퇴 설계','투자 설계','세금 설계','부동산 설계'].map((s, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '5px 6px', borderRadius: 6, marginBottom: 2,
                    fontSize: `${0.7 * fs}rem`,
                    background: i === 2 ? 'rgba(212,160,23,0.1)' : 'transparent',
                    color: i < 2 ? '#34C759' : i === 2 ? '#D4A017' : 'rgba(255,255,255,0.4)',
                    fontWeight: i === 2 ? 700 : 400
                  }}>
                    <div style={{
                      width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                      background: i < 2 ? '#34C759' : i === 2 ? '#D4A017' : '#3A3A3C',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '9px', color: 'white', fontWeight: 700
                    }}>{i < 2 ? '✓' : i+1}</div>
                    {s}
                  </div>
                ))}

                <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '10px 0' }}/>

                {/* AI 엔진 상태 */}
                <div style={{ fontSize: `${0.65 * fs}rem`, color: 'rgba(255,255,255,0.45)', fontWeight: 700, marginBottom: 6 }}>AI 엔진</div>
                <div style={{ background: '#3A3A3C', borderRadius: 8, padding: '8px 10px', fontSize: `${0.68 * fs}rem` }}>
                  {[['RAG 검색','활성 ●','#34C759'],['참조 청크','5,706개','white'],['응답 속도','~1.2초','white']].map(([k,v,c],i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: i < 2 ? 4 : 0 }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>{k}</span>
                      <span style={{ color: c, fontWeight: 700 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── 하단: STT 대화 + 컨트롤 ── */}
        <div style={{
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(255,255,255,0.08)', flexShrink: 0
        }}>
          {/* STT 대화 (채팅 토글) */}
          {showChat && (
            <div style={{ maxHeight: 120, overflowY: 'auto', padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {messages.slice(-5).map(m => (
                <div key={m.id} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                    {m.role === 'assistant'
                      ? <img src={MONEYA_LOGO} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                      : <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>👤</div>}
                  </div>
                  <div style={{
                    fontSize: `${0.72 * fs}rem`, padding: '5px 10px', borderRadius: 10, maxWidth: '75%',
                    background: m.role === 'user' ? 'rgba(212,160,23,0.2)' : 'rgba(255,255,255,0.08)',
                    color: m.role === 'user' ? '#E8C040' : 'rgba(255,255,255,0.85)'
                  }}>{m.text}</div>
                </div>
              ))}
              <div ref={messagesEndRef}/>
            </div>
          )}

          {/* 컨트롤 바 */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: isMobile ? 12 : 20, padding: '10px 16px 14px' }}>
            {[
              { label: '마이크', icon: isMicOn ? '🎤' : '🔇', on: isMicOn, fn: toggleMic },
              { label: '카메라', icon: isCamOn ? '📹' : '🚫', on: isCamOn, fn: toggleCam },
            ].map(b => (
              <button key={b.label} onClick={b.fn} style={{
                width: isMobile ? 44 : 50, height: isMobile ? 44 : 50, borderRadius: '50%', border: 'none',
                background: b.on ? 'rgba(255,255,255,0.12)' : 'rgba(229,62,62,0.25)',
                cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 2, fontSize: isMobile ? 18 : 20
              }}>
                {b.icon}
                <span style={{ fontSize: `${0.55 * fs}rem`, color: 'rgba(255,255,255,0.45)' }}>{b.label}</span>
              </button>
            ))}

            {/* 종료 */}
            <button onClick={stopVideoConsult} style={{
              width: isMobile ? 52 : 60, height: isMobile ? 52 : 60, borderRadius: '50%', border: 'none',
              background: '#E53E3E', cursor: 'pointer', fontSize: isMobile ? 20 : 22,
              boxShadow: '0 4px 16px rgba(229,62,62,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>📞</button>

            {/* 녹화 */}
            <button onClick={toggleRecording} style={{
              width: isMobile ? 44 : 50, height: isMobile ? 44 : 50, borderRadius: '50%', border: 'none',
              background: isRecording ? 'rgba(229,62,62,0.25)' : 'rgba(255,255,255,0.12)',
              cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 2, fontSize: isMobile ? 16 : 18
            }}>
              {isRecording ? '⏹️' : '⏺️'}
              <span style={{ fontSize: `${0.55 * fs}rem`, color: isRecording ? '#FF6B6B' : 'rgba(255,255,255,0.45)' }}>
                {isRecording ? '녹화중' : '녹화'}
              </span>
            </button>

            {/* 대화록 */}
            <button onClick={() => setShowChat(p => !p)} style={{
              width: isMobile ? 44 : 50, height: isMobile ? 44 : 50, borderRadius: '50%', border: 'none',
              background: showChat ? 'rgba(10,132,255,0.25)' : 'rgba(255,255,255,0.12)',
              cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 2, fontSize: isMobile ? 16 : 18
            }}>
              💬
              <span style={{ fontSize: `${0.55 * fs}rem`, color: 'rgba(255,255,255,0.45)' }}>대화록</span>
            </button>
          </div>
        </div>

        {/* 음성 파형 CSS */}
        <style>{`
          @keyframes wave {
            0%,100% { height: 4px; opacity: 0.4; }
            50%      { height: 18px; opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  //  대기 화면 (화상상담 시작 전)
  // ════════════════════════════════════════════════════════════════
  return (
    <div style={{ minHeight: '100%', background: '#F9F9F9', fontFamily: "'Noto Sans KR', sans-serif", fontSize: `${fs}rem` }}>
      {/* PC 권장 배너 */}
      {isMobile && (
        <div style={{
          background: '#FFF3CC', borderBottom: '1px solid rgba(212,160,23,0.3)',
          padding: '10px 16px', textAlign: 'center',
          fontSize: `${0.75 * fs}rem`, color: '#C8920F', fontWeight: 600
        }}>
          💡 화상상담은 PC 또는 태블릿(가로모드)을 권장합니다
        </div>
      )}

      <div style={{ maxWidth: 480, margin: '0 auto', padding: 16 }}>
        {/* 히어로 카드 */}
        <div style={{
          background: 'linear-gradient(135deg,#B8820A,#E8C040)',
          borderRadius: 20, padding: '28px 20px 24px', textAlign: 'center',
          marginBottom: 14, position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'white', margin: '0 auto 14px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.18)' }}>
            <img src={MONEYA_LOGO} alt="머니야" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
          </div>
          <h2 style={{ color: 'white', fontWeight: 700, fontSize: `${1.1 * fs}rem`, marginBottom: 4 }}>AI 머니야 화상상담</h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: `${0.8 * fs}rem` }}>오상열 CFP · 금융집짓기® 전문</p>
        </div>

        {/* 상담 안내 */}
        <div style={{ background: 'white', borderRadius: 16, padding: '16px 18px', marginBottom: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: `${0.75 * fs}rem`, fontWeight: 700, color: '#666', marginBottom: 12 }}>상담 안내</div>
          {[
            ['⏱️', '상담 시간', '90분 (8단계 금융집짓기®)'],
            ['🎥', '방식', '앱 안에서 바로 화상상담 (앱 설치 불필요)'],
            ['📋', '내용', '수입지출 · 보험 · 저축 · 투자 · 은퇴'],
            ['🤖', 'AI 지원', 'RAG 5,706개 지식베이스 + 스마트 노트'],
            ['📺', '스마트 노트', '금융집짓기 SVG · 차트 · 영상 · 웹자료 실시간 표시'],
          ].map(([icon, label, val], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: i < 4 ? '1px solid #F2F2F2' : 'none' }}>
              <span style={{ fontSize: `${1 * fs}rem`, width: 24 }}>{icon}</span>
              <span style={{ fontSize: `${0.75 * fs}rem`, color: '#AAA', width: 60, flexShrink: 0, paddingTop: 1 }}>{label}</span>
              <span style={{ fontSize: `${0.8 * fs}rem`, fontWeight: 500, color: '#1A1A1A', lineHeight: 1.4 }}>{val}</span>
            </div>
          ))}
        </div>

        {/* roomId 초대 안내 */}
        {roomIdFromUrl && (
          <div style={{ background: '#EBF5FB', border: '1px solid #AED6F1', borderRadius: 12, padding: 14, marginBottom: 12 }}>
            <p style={{ color: '#1A5CA8', fontWeight: 700, fontSize: `${0.85 * fs}rem` }}>📹 화상상담에 초대되셨습니다</p>
            <button onClick={() => startVideoConsult(roomIdFromUrl)} style={{
              marginTop: 10, background: '#1A5CA8', color: 'white', border: 'none',
              padding: '10px 20px', borderRadius: 10, cursor: 'pointer',
              fontSize: `${0.8 * fs}rem`, fontFamily: "'Noto Sans KR', sans-serif"
            }}>지금 입장하기</button>
          </div>
        )}

        {/* 시작 버튼 */}
        <button onClick={() => startVideoConsult()} style={{
          background: 'linear-gradient(135deg,#C8920F,#E8C040)',
          color: 'white', border: 'none', width: '100%',
          padding: 18, borderRadius: 14,
          fontSize: `${0.95 * fs}rem`, fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: '0 4px 20px rgba(212,160,23,0.38)',
          fontFamily: "'Noto Sans KR', sans-serif"
        }}>
          🎥 화상상담 시작하기
        </button>
        <p style={{ textAlign: 'center', fontSize: `${0.7 * fs}rem`, color: '#AAA', marginTop: 8 }}>
          버튼을 누르면 카메라·마이크 권한을 요청합니다
        </p>

        {/* 글자 크기 조절 */}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button onClick={toggleFontSize} style={{
            background: 'none', border: '1px solid #DDD',
            color: '#888', padding: '6px 16px', borderRadius: 20,
            fontSize: `${0.7 * fs}rem`, cursor: 'pointer',
            fontFamily: "'Noto Sans KR', sans-serif"
          }}>
            {fontSize === 'normal' ? '가+ 글자 크게 (50대 이상 권장)' : '가- 글자 작게'}
          </button>
        </div>
      </div>
    </div>
  );
}
