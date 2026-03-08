// ═══════════════════════════════════════════════════════════════
//  ConsultationPage.tsx — WebRTC 화상상담 + AI 머니야 통합
//  브랜치: moneya-frontend → develop
//  배포확인: moneya-develop.vercel.app
// ═══════════════════════════════════════════════════════════════

import { useState, useRef, useEffect, useCallback } from 'react';

// ── 환경 설정 ─────────────────────────────────────────────────
const WS_URL  = (import.meta.env.VITE_WS_URL as string) || 'wss://moneya-server.onrender.com';

// ── WebRTC ICE 서버 설정 ──────────────────────────────────────
const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

// ── 8단계 라벨 ────────────────────────────────────────────────
const CONSULT_STEPS = ['수입지출 분석','보험 적정성','저축 설계','부채 관리','은퇴 설계','투자 설계','세금 설계','부동산 설계'];

// ── 대화 키워드 → 단계 매핑 ──────────────────────────────────
function detectConsultStep(text: string): number | null {
  if (/수입|지출|월급|생활비|소득/.test(text)) return 0;
  if (/보험|보장|사망|실손|암|뇌|심장/.test(text)) return 1;
  if (/저축|적금|예금|저금/.test(text)) return 2;
  if (/부채|대출|빚|DSR|원리금/.test(text)) return 3;
  if (/은퇴|노후|연금|퇴직/.test(text)) return 4;
  if (/투자|주식|펀드|ETF|채권/.test(text)) return 5;
  if (/세금|절세|연말정산|IRP|ISA/.test(text)) return 6;
  if (/부동산|집|아파트|전세|주택/.test(text)) return 7;
  return null;
}

// ── 타입 정의 ─────────────────────────────────────────────────
interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}


// ── 컴포넌트 ─────────────────────────────────────────────────
export default function ConsultationPage({ user: _user }: { user?: any }) {
  // ── 기존 음성상담 상태 ──────────────────────────────────────
  const [isVoiceMode,   setIsVoiceMode]   = useState(false);
  const [voiceStatus,   setVoiceStatus]   = useState('대기중');
  const [messages,      setMessages]      = useState<Message[]>([]);
  const [displayName] = useState('고객');

  // ── 화상상담 상태 ───────────────────────────────────────────
  const [isVideoMode,   setIsVideoMode]   = useState(false);
  const [videoStatus,   setVideoStatus]   = useState<'idle'|'connecting'|'connected'|'error'>('idle');
  const [isMicOn,       setIsMicOn]       = useState(true);
  const [isCamOn,       setIsCamOn]       = useState(true);
  const [isRecording,   setIsRecording]   = useState(false);
  const [showChat,      setShowChat]      = useState(false);

  // ② 일시정지 상태
  const [isPaused,      setIsPaused]      = useState(false);

  // ⑤ 실시간 분석 상태 (Phase 3 — server.js analysis_update 실제 연동)
  const [currentStep,     setCurrentStep]     = useState(0);
  const [ragActive,       setRagActive]       = useState(false);
  const [ragSearching,    setRagSearching]    = useState(false);   // Phase 3: RAG 검색 중
  const [analysisData,    setAnalysisData]    = useState<{        // Phase 3: 분석 데이터
    stepIndex: number;
    stepLabel: string;
    keywords: string[];
    insight: string;
    ragCount: number;
  } | null>(null);

  // Phase 3: 스마트노트 상태
  const [smartNote, setSmartNote] = useState<{
    noteType: string;
    title: string;
    content: Record<string, unknown>;
    highlightFloor: string;
  } | null>(null);

  const ragTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ragSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── refs ────────────────────────────────────────────────────
  const wsRef             = useRef<WebSocket | null>(null);
  const pcRef             = useRef<RTCPeerConnection | null>(null);
  const localStreamRef    = useRef<MediaStream | null>(null);
  const localVideoRef     = useRef<HTMLVideoElement>(null);
  const remoteVideoRef    = useRef<HTMLVideoElement>(null);
  const audioQueueRef     = useRef<ArrayBuffer[]>([]);
  const isPlayingRef      = useRef(false);
  const audioCtxRef       = useRef<AudioContext | null>(null);
  const mediaRecorderRef  = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const messagesEndRef    = useRef<HTMLDivElement>(null);

  // URL 파라미터에서 roomId 추출 (고객 입장용)
  const roomIdFromUrl = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('room')
    : null;

  // ── 메시지 스크롤 ───────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── 오디오 재생 (기존 머니야 음성) ─────────────────────────
  const playAudio = useCallback(async (base64: string) => {
    // ② 일시정지 중이면 재생 안 함
    if (isPaused) return;
    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioContext({ sampleRate: 24000 });
      }
      const raw    = atob(base64);
      const bytes  = new Uint8Array(raw.length).map((_, i) => raw.charCodeAt(i));
      const int16  = new Int16Array(bytes.buffer);
      const float  = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) float[i] = int16[i] / 32768;

      const buf = audioCtxRef.current.createBuffer(1, float.length, 24000);
      buf.copyToChannel(float, 0);
      const src = audioCtxRef.current.createBufferSource();
      src.buffer = buf;
      src.connect(audioCtxRef.current.destination);
      src.start();
    } catch (e) {
      console.error('[오디오] 재생 에러:', e);
    }
  }, [isPaused]);

  // ── 마이크 캡처 → WebSocket 전송 (기존 Realtime API) ───────
  const startAudioCapture = useCallback((stream: MediaStream, ws: WebSocket) => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext({ sampleRate: 24000 });
    }
    const ctx    = audioCtxRef.current;
    const source = ctx.createMediaStreamSource(stream);
    const proc   = ctx.createScriptProcessor(4096, 1, 1);

    proc.onaudioprocess = (e) => {
      if (ws.readyState !== WebSocket.OPEN) return;
      if (isPaused) return; // ② 일시정지 중 마이크 전송 중단
      const float  = e.inputBuffer.getChannelData(0);
      const int16  = new Int16Array(float.length);
      for (let i = 0; i < float.length; i++) {
        int16[i] = Math.max(-32768, Math.min(32767, float[i] * 32768));
      }
      const b64 = btoa(String.fromCharCode(...new Uint8Array(int16.buffer)));
      ws.send(JSON.stringify({ type: 'audio', data: b64 }));
    };

    source.connect(proc);
    proc.connect(ctx.destination);
  }, []);

  // ── WebSocket 메시지 핸들러 (공통) ─────────────────────────
  const handleWsMessage = useCallback(async (event: MessageEvent, ws: WebSocket) => {
    const msg = JSON.parse(event.data);

    // ── 화상상담 시그널링 ──
    if (msg.type === 'video_room_created') {
      console.log('[화상] 방 생성됨:', msg.roomId);
    }

    if (msg.type === 'video_joined') {
      console.log('[화상] 방 입장:', msg.roomId);
    }

    if (msg.type === 'video_guest_joined') {
      // 호스트(대표님): 고객이 입장했으므로 offer 생성
      const pc = pcRef.current;
      if (!pc) return;
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        ws.send(JSON.stringify({
          type: 'video_signal',
          signal: { type: 'offer', sdp: offer }
        }));
        setVideoStatus('connecting');
      } catch (e) {
        console.error('[화상] offer 생성 에러:', e);
      }
    }

    if (msg.type === 'video_signal') {
      const pc     = pcRef.current;
      const signal = msg.signal;
      if (!pc) return;

      try {
        if (signal.type === 'offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          ws.send(JSON.stringify({
            type: 'video_signal',
            signal: { type: 'answer', sdp: answer }
          }));
        } else if (signal.type === 'answer') {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        } else if (signal.type === 'ice-candidate' && signal.candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
        }
      } catch (e) {
        console.error('[화상] 시그널링 에러:', e);
      }
    }

    if (msg.type === 'video_ended') {
      stopVideoConsult();
    }

    if (msg.type === 'video_error') {
      setVideoStatus('error');
      alert('화상상담 오류: ' + msg.error);
    }

    // ── 기존 머니야 음성 메시지 ──
    if (msg.type === 'session_started') { setVoiceStatus('상담중'); }
    if (msg.type === 'audio' && msg.data) { await playAudio(msg.data); }
    if (msg.type === 'transcript' && msg.role === 'user') {
      const text = msg.text as string;
      setMessages(prev => [...prev, {
        id: Date.now().toString(), role: 'user', text, timestamp: new Date()
      }]);
      // ⑤ 대화 내용으로 8단계 자동 업데이트
      const step = detectConsultStep(text);
      if (step !== null) setCurrentStep(step);
    }
    if (msg.type === 'transcript' && msg.role === 'assistant') {
      const text = msg.text as string;
      setMessages(prev => [...prev, {
        id: (Date.now()+1).toString(), role: 'assistant', text, timestamp: new Date()
      }]);
      // ⑤ AI 응답으로도 단계 업데이트
      const step = detectConsultStep(text);
      if (step !== null) setCurrentStep(step);
    }

    // ── Phase 3: RAG 검색 중 신호 ──────────────────────────────
    if (msg.type === 'rag_searching') {
      setRagSearching(true);
      setRagActive(true);
      if (ragSearchTimer.current) clearTimeout(ragSearchTimer.current);
      // 최대 8초 후 자동 해제 (서버 응답 없을 때 대비)
      ragSearchTimer.current = setTimeout(() => {
        setRagSearching(false);
      }, 8000);
    }

    // ── Phase 3: RAG 검색 완료 신호 ───────────────────────────
    if (msg.type === 'rag_done') {
      setRagSearching(false);
      if (ragSearchTimer.current) clearTimeout(ragSearchTimer.current);
      setRagActive(true);
      if (ragTimerRef.current) clearTimeout(ragTimerRef.current);
      ragTimerRef.current = setTimeout(() => setRagActive(false), 2000);
    }

    // ── Phase 3: 분석패널 실시간 업데이트 ─────────────────────
    if (msg.type === 'analysis_update') {
      setAnalysisData({
        stepIndex: typeof msg.stepIndex === 'number' ? msg.stepIndex : currentStep,
        stepLabel: msg.stepLabel || CONSULT_STEPS[currentStep] || '',
        keywords:  Array.isArray(msg.keywords) ? msg.keywords : [],
        insight:   msg.insight   || '',
        ragCount:  typeof msg.ragCount === 'number' ? msg.ragCount : 0,
      });
      if (typeof msg.stepIndex === 'number') setCurrentStep(msg.stepIndex);
      setRagActive(false);
      setRagSearching(false);
    }

    // ── Phase 3: 스마트노트 업데이트 (server.js update_smart_note FC) ──
    if (msg.type === 'smart_note_update') {
      let parsedContent: Record<string, unknown> = {};
      if (typeof msg.content === 'string') {
        try { parsedContent = JSON.parse(msg.content); } catch { parsedContent = { text: msg.content }; }
      } else if (msg.content && typeof msg.content === 'object') {
        parsedContent = msg.content as Record<string, unknown>;
      }
      setSmartNote({
        noteType:       msg.noteType       || 'house_svg',
        title:          msg.title          || '',
        content:        parsedContent,
        highlightFloor: msg.highlightFloor || 'none',
      });
    }

    // ── Phase 3: 스마트노트 초기화 ────────────────────────────
    if (msg.type === 'smart_note_clear') {
      setSmartNote(null);
    }

    // ── Phase 3: 세션 갱신 완료 확인 ──────────────────────────
    if (msg.type === 'renew_session_ok') {
      console.log('[세션갱신] 완료 — 상담 계속 진행');
      setVoiceStatus('상담중');
    }

    // ── 기존 호환: note_update (구형 신호) ────────────────────
    if (msg.type === 'note_update') {
      setRagActive(true);
      const step = msg.note_type === 'chart' ? 4
        : msg.note_type === 'calc' ? 3
        : msg.highlight === 'insurance' ? 1 : 0;
      setCurrentStep(step);
      if (ragTimerRef.current) clearTimeout(ragTimerRef.current);
      ragTimerRef.current = setTimeout(() => setRagActive(false), 1500);
    }
    if (msg.type === 'interrupt') {
      audioQueueRef.current = [];
      isPlayingRef.current  = false;
    }
  }, [playAudio]);

  // ── 화상상담 시작 ───────────────────────────────────────────
  const startVideoConsult = useCallback(async (roomId?: string | null) => {
    try {
      setVideoStatus('connecting');

      // 1. 카메라 + 마이크 권한 요청
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: { sampleRate: 24000, echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      });
      localStreamRef.current = stream;
      // ③ 고객 카메라 — srcObject 연결 후 play() 명시 호출
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch(() => {});
      }

      // 2. WebSocket 연결 (시그널링 + AI 머니야 통합)
      const ws = new WebSocket(`${WS_URL}?mode=video`);
      wsRef.current = ws;

      ws.onmessage = (e) => handleWsMessage(e, ws);
      ws.onerror   = () => setVideoStatus('error');

      // 3. RTCPeerConnection 생성
      const pc = new RTCPeerConnection(ICE_SERVERS);
      pcRef.current = pc;

      // 로컬 트랙 추가
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      // 원격 영상 수신
      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setVideoStatus('connected');
        }
      };

      // ICE candidate 전송
      pc.onicecandidate = (event) => {
        if (event.candidate && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'video_signal',
            signal: { type: 'ice-candidate', candidate: event.candidate }
          }));
        }
      };

      pc.onconnectionstatechange = () => {
        console.log('[화상] 연결 상태:', pc.connectionState);
        if (pc.connectionState === 'connected') setVideoStatus('connected');
        if (pc.connectionState === 'failed')    setVideoStatus('error');
      };

      // 4. WebSocket 열리면 방 생성 또는 입장 + AI 머니야 시작
      ws.onopen = () => {
        if (roomId) {
          // 고객: URL의 roomId로 입장
          ws.send(JSON.stringify({ type: 'video_join_room', roomId }));
        } else {
          // 대표님: 새 방 생성
          ws.send(JSON.stringify({ type: 'video_create_room' }));
        }

        // AI 머니야 음성 상담도 동시 시작
        ws.send(JSON.stringify({
          type: 'start_consult',
          userName: displayName,
          conversationHistory: messages.map(m => ({ role: m.role, content: m.text }))
        }));

        // 마이크 오디오를 Realtime API에도 전달
        startAudioCapture(stream, ws);

        // ⑥ 25분마다 세션 자동 갱신 (OpenAI 30분 제한 대응)
        setTimeout(() => {
          if (ws.readyState === WebSocket.OPEN) {
            console.log('[세션갱신] 25분 경과 → 자동 갱신');
            ws.send(JSON.stringify({ type: 'renew_session', userName: displayName }));
          }
        }, 25 * 60 * 1000);
      };

      setIsVideoMode(true);
      setIsVoiceMode(true);
      setIsPaused(false);

    } catch (e: any) {
      console.error('[화상] 시작 에러:', e);
      setVideoStatus('error');
      if (e.name === 'NotAllowedError') {
        alert('카메라/마이크 권한이 필요합니다.\n브라우저 설정에서 권한을 허용해주세요.');
      } else {
        alert('화상상담 시작 중 오류가 발생했습니다: ' + e.message);
      }
    }
  }, [displayName, messages, handleWsMessage, startAudioCapture]);

  // ── 화상상담 종료 ───────────────────────────────────────────
  const stopVideoConsult = useCallback(() => {
    // 녹화 중이면 종료
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    // WebSocket 종료 신호
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'video_end' }));
      wsRef.current.send(JSON.stringify({ type: 'stop' }));
      wsRef.current.close();
    }
    wsRef.current = null;

    // PeerConnection 닫기
    pcRef.current?.close();
    pcRef.current = null;

    // 로컬 스트림 트랙 정지
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;

    // 비디오 엘리먼트 초기화
    if (localVideoRef.current)  localVideoRef.current.srcObject  = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    // ① AudioContext 완전 종료 — 종료 후에도 음성이 계속 나오는 버그 수정
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch(e) {}
      audioCtxRef.current = null;
    }

    setIsVideoMode(false);
    setIsVoiceMode(false);
    setVideoStatus('idle');
    setVoiceStatus('대기중');
    setIsRecording(false);
    setIsPaused(false);
  }, []);

  // ② 일시정지 토글 ─────────────────────────────────────────
  const togglePause = useCallback(() => {
    setIsPaused(prev => {
      const next = !prev;
      if (next && audioCtxRef.current?.state === 'running') {
        audioCtxRef.current.suspend();
      } else if (!next && audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: next ? 'pause' : 'resume' }));
      }
      return next;
    });
  }, []);

  // ── 마이크 토글 ─────────────────────────────────────────────
  const toggleMic = useCallback(() => {
    const tracks = localStreamRef.current?.getAudioTracks();
    if (tracks) {
      const next = !isMicOn;
      tracks.forEach(t => { t.enabled = next; });
      setIsMicOn(next);
    }
  }, [isMicOn]);

  // ── 카메라 토글 ─────────────────────────────────────────────
  const toggleCam = useCallback(() => {
    const tracks = localStreamRef.current?.getVideoTracks();
    if (tracks) {
      const next = !isCamOn;
      tracks.forEach(t => { t.enabled = next; });
      setIsCamOn(next);
    }
  }, [isCamOn]);

  // ── 녹화 시작/중지 ──────────────────────────────────────────
  const toggleRecording = useCallback(() => {
    if (!isRecording) {
      const stream = remoteVideoRef.current?.srcObject as MediaStream;
      if (!stream) return;

      recordedChunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `화상상담_${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.webm`;
        a.click();
        URL.revokeObjectURL(url);
      };

      recorder.start(1000); // 1초마다 청크
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } else {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  // ── 페이지 언마운트 시 정리 ─────────────────────────────────
  useEffect(() => {
    return () => { stopVideoConsult(); };
  }, []);

  // ── URL에 room 파라미터가 있으면 자동 입장 ──────────────────
  useEffect(() => {
    if (roomIdFromUrl && !isVideoMode) {
      startVideoConsult(roomIdFromUrl);
    }
  }, [roomIdFromUrl]);

  // ══════════════════════════════════════════════════════════════
  //  렌더링
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── 화상상담 전체화면 모드 ─────────────────────────── */}
      {isVideoMode && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">

          {/* 상단 상태 바 */}
          <div className="flex items-center justify-between px-4 py-2 bg-gray-900/80">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                videoStatus === 'connected'  ? 'bg-green-400 animate-pulse' :
                videoStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
                videoStatus === 'error'      ? 'bg-red-400' : 'bg-gray-400'
              }`} />
              <span className="text-white text-sm">
                {videoStatus === 'connected'  ? '화상상담 연결됨' :
                 videoStatus === 'connecting' ? '연결 중...' :
                 videoStatus === 'error'      ? '연결 오류' : ''}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {isRecording && (
                <span className="text-red-400 text-xs flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                  녹화 중
                </span>
              )}
              <span className="text-gray-400 text-xs">AI 머니야 활성</span>
            </div>
          </div>

          {/* 영상 영역 */}
          <div className="flex-1 relative bg-gray-900 overflow-hidden">
            {/* 상대방 영상 (큰 화면) */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />

            {/* 연결 대기 오버레이 */}
            {videoStatus !== 'connected' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80">
                <div className="text-6xl mb-4">
                  {videoStatus === 'error' ? '❌' : '📹'}
                </div>
                <p className="text-white text-lg">
                  {videoStatus === 'connecting' ? '상대방 연결 대기 중...' : '연결 오류가 발생했습니다'}
                </p>
                {videoStatus === 'connecting' && (
                  <p className="text-gray-400 text-sm mt-2">상대방이 입장하면 자동으로 연결됩니다</p>
                )}
              </div>
            )}

            {/* ③ 고객 카메라 PIP — 거울모드 적용 */}
            <div className="absolute bottom-4 right-4 w-32 h-24 rounded-xl overflow-hidden border-2 border-white shadow-lg bg-gray-800">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)', display: isCamOn ? 'block' : 'none' }}
              />
              {!isCamOn && (
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
              )}
              <div className="absolute bottom-1 left-0 right-0 text-center text-white text-xs opacity-60">나</div>
            </div>

            {/* ⑤ Phase 3: 실시간 분석 패널 — server.js analysis_update 실제 연동 */}
            <div className="absolute top-4 left-4 bg-black/70 rounded-xl p-3 w-48 backdrop-blur">
              <p className="text-yellow-400 text-xs font-bold mb-2">
                📊 실시간 분석
                {ragSearching && (
                  <span className="ml-1 text-yellow-300 animate-pulse">🔍</span>
                )}
              </p>

              {/* 8단계 진행 현황 */}
              {CONSULT_STEPS.map((s, i) => (
                <div key={i} className="flex items-center gap-1.5 mb-1"
                  style={{ opacity: i > currentStep + 1 ? 0.3 : 1 }}>
                  <div style={{
                    width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                    background: i < currentStep ? '#34C759' : i === currentStep ? '#D4A017' : '#444',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 8, color: 'white', fontWeight: 700,
                    transition: 'background 0.4s'
                  }}>{i < currentStep ? '✓' : i + 1}</div>
                  <span style={{
                    fontSize: 10,
                    color: i === currentStep ? '#FFD700' : i < currentStep ? '#34C759' : 'rgba(255,255,255,0.5)',
                    fontWeight: i === currentStep ? 700 : 400
                  }}>{s}</span>
                  {i === currentStep && (
                    <span style={{ fontSize: 8, color: '#FFD700', marginLeft: 'auto' }}>◀</span>
                  )}
                </div>
              ))}

              {/* Phase 3: RAG 검색 중 표시 */}
              {ragSearching && (
                <div className="mt-2 px-2 py-1 rounded-lg bg-yellow-900/60 border border-yellow-600/40">
                  <p className="text-yellow-300 text-xs animate-pulse">🔍 RAG 검색 중...</p>
                </div>
              )}

              {/* Phase 3: 분석 인사이트 표시 */}
              {!ragSearching && analysisData && analysisData.insight && (
                <div className="mt-2 px-2 py-1 rounded-lg bg-blue-900/50 border border-blue-600/30">
                  <p className="text-blue-300 text-xs leading-relaxed">{analysisData.insight}</p>
                  {analysisData.ragCount > 0 && (
                    <p className="text-gray-400 text-xs mt-0.5">
                      RAG {analysisData.ragCount}건 참조
                    </p>
                  )}
                </div>
              )}

              {/* Phase 3: 키워드 태그 */}
              {!ragSearching && analysisData && analysisData.keywords.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {analysisData.keywords.slice(0, 3).map((kw, i) => (
                    <span key={i} className="text-xs px-1.5 py-0.5 rounded-full bg-gray-700 text-gray-300">
                      {kw}
                    </span>
                  ))}
                </div>
              )}

              {/* 기존 호환: ragActive (note_update 신호) */}
              {ragActive && !ragSearching && !analysisData?.insight && (
                <div className="mt-2 text-yellow-300 text-xs animate-pulse">🔍 RAG 검색 중...</div>
              )}
            </div>

            {/* Phase 3: 스마트노트 패널 (우측 상단, smart_note_update 수신 시) */}
            {smartNote && (
              <div className="absolute top-4 right-36 bg-black/80 rounded-xl p-3 w-52 backdrop-blur border border-yellow-600/30 max-h-64 overflow-y-auto">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-yellow-400 text-xs font-bold truncate pr-1">
                    📋 {smartNote.title || '스마트 노트'}
                  </p>
                  <button
                    onClick={() => setSmartNote(null)}
                    className="text-gray-500 hover:text-white text-xs flex-shrink-0"
                  >✕</button>
                </div>

                {/* house_svg: 금융집짓기 영역 강조 */}
                {smartNote.noteType === 'house_svg' && (
                  <div className="space-y-1">
                    {([
                      { key: 'chimney',          label: '🏠 부동산 설계',   floor: 7 },
                      { key: 'roof_tax',          label: '📋 세금 설계',    floor: 6 },
                      { key: 'roof_investment',   label: '📈 투자 설계',    floor: 5 },
                      { key: 'eaves',             label: '🛡 생로병사',      floor: 4 },
                      { key: 'pillar_retirement', label: '🧓 은퇴 설계',    floor: 3 },
                      { key: 'pillar_savings',    label: '💰 저축 설계',    floor: 2 },
                      { key: 'pillar_debt',       label: '💳 부채 설계',    floor: 1 },
                      { key: 'basement',          label: '🔐 보험·비상금', floor: 0 },
                    ] as const).map(({ key, label }) => (
                      <div key={key} className={`px-2 py-1 rounded text-xs transition-all ${
                        smartNote.highlightFloor === key
                          ? 'bg-yellow-500/40 text-yellow-200 font-bold border border-yellow-500/60'
                          : 'text-gray-400'
                      }`}>{label}</div>
                    ))}
                  </div>
                )}

                {/* calculation: 계산 결과 */}
                {smartNote.noteType === 'calculation' && (
                  <div className="space-y-1">
                    {Object.entries(smartNote.content).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-xs">
                        <span className="text-gray-400">{k}</span>
                        <span className="text-white font-bold">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* chart / 기타: 텍스트 표시 */}
                {(smartNote.noteType === 'chart' || smartNote.noteType === 'web' ||
                  smartNote.noteType === 'checklist' || smartNote.noteType === 'image') && (
                  <div className="text-gray-300 text-xs leading-relaxed whitespace-pre-wrap">
                    {typeof smartNote.content.text === 'string'
                      ? smartNote.content.text
                      : JSON.stringify(smartNote.content, null, 2)}
                  </div>
                )}

                <p className="text-gray-600 text-xs mt-2 text-right">
                  타입: {smartNote.noteType}
                </p>
              </div>
            )}
          </div>

          {/* 대화 기록 패널 (채팅 토글 시) */}
          {showChat && (
            <div className="h-36 overflow-y-auto bg-gray-900/90 px-4 py-2 border-t border-gray-700">
              {messages.length === 0 ? (
                <p className="text-gray-500 text-sm text-center pt-4">대화를 시작해보세요</p>
              ) : (
                messages.slice(-8).map(m => (
                  <p key={m.id} className={`text-sm mb-1 ${
                    m.role === 'user' ? 'text-blue-300' : 'text-yellow-300'
                  }`}>
                    <span className="font-bold">
                      {m.role === 'user' ? `${displayName}: ` : '머니야: '}
                    </span>
                    {m.text}
                  </p>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* ④ AI 머니야 자막 — 항상 표시, safe-area 적용 */}
          {messages.length > 0 && (() => {
            const last = [...messages].reverse().find(m => m.role === 'assistant');
            return last ? (
              <div style={{ background: 'rgba(0,0,0,0.85)', padding: '6px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: 13, color: 'white', background: 'rgba(212,160,23,0.12)', border: '1px solid rgba(212,160,23,0.25)', borderRadius: 8, padding: '6px 12px', lineHeight: 1.5 }}>
                  <span style={{ color: '#D4A017', fontWeight: 700, marginRight: 6 }}>AI 머니야</span>
                  {last.text.length > 80 ? last.text.slice(0, 80) + '...' : last.text}
                </div>
              </div>
            ) : null;
          })()}

          {/* 컨트롤 바 — paddingBottom safe-area로 iOS 내비게이션 대응 */}
          <div className="flex justify-center items-center gap-4 py-4 bg-gray-900"
            style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>

            {/* 마이크 */}
            <button
              onClick={toggleMic}
              className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-colors ${
                isMicOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
              }`}
              title={isMicOn ? '마이크 끄기' : '마이크 켜기'}
            >
              {isMicOn ? '🎤' : '🔇'}
            </button>

            {/* 카메라 */}
            <button
              onClick={toggleCam}
              className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-colors ${
                isCamOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
              }`}
              title={isCamOn ? '카메라 끄기' : '카메라 켜기'}
            >
              {isCamOn ? '📹' : '🚫'}
            </button>

            {/* ② 일시정지 버튼 */}
            <button
              onClick={togglePause}
              className={`w-14 h-14 rounded-full flex flex-col items-center justify-center text-xl transition-colors ${
                isPaused ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-gray-700 hover:bg-gray-600'
              }`}
              title={isPaused ? '재개' : '일시정지'}
            >
              {isPaused ? '▶' : '⏸'}
              <span className="text-xs mt-0.5" style={{ color: isPaused ? '#FFD' : 'rgba(255,255,255,0.5)', fontSize: 10 }}>
                {isPaused ? '재개' : '정지'}
              </span>
            </button>

            {/* 종료 */}
            <button
              onClick={stopVideoConsult}
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-2xl transition-colors shadow-lg"
              title="상담 종료"
            >
              📞
            </button>

            {/* 녹화 */}
            <button
              onClick={toggleRecording}
              className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-colors ${
                isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
              }`}
              title={isRecording ? '녹화 중지' : '녹화 시작'}
            >
              {isRecording ? '⏹️' : '⏺️'}
            </button>

            {/* 채팅 토글 */}
            <button
              onClick={() => setShowChat(p => !p)}
              className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-colors ${
                showChat ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'
              }`}
              title="대화 기록 보기"
            >
              💬
            </button>
          </div>
        </div>
      )}

      {/* ── 일반 상담 화면 (화상 비활성 시) ─────────────────── */}
      {!isVideoMode && (
        <div className="max-w-2xl mx-auto p-4">

          {/* 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">💰 AI 머니야</h1>
              <p className="text-sm text-gray-500">재무상담 AI 어시스턴트</p>
            </div>
            <div className="flex gap-2">
              {/* 화상상담 버튼 */}
              <button
                onClick={() => startVideoConsult(roomIdFromUrl)}
                disabled={isVoiceMode}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                <span>🎥</span>
                <span>화상상담</span>
              </button>

              {/* 음성상담 버튼 (기존) */}
              {!isVoiceMode ? (
                <button
                  onClick={() => {/* 기존 음성상담 시작 로직 */}}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors shadow-md"
                >
                  <span>🎙️</span>
                  <span>음성상담</span>
                </button>
              ) : (
                <button
                  onClick={() => {/* 기존 음성상담 종료 로직 */}}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors shadow-md"
                >
                  <span>⏹️</span>
                  <span>종료</span>
                </button>
              )}
            </div>
          </div>

          {/* URL에 room 파라미터가 있으면 자동 입장 안내 */}
          {roomIdFromUrl && !isVideoMode && (
            <div className="mb-4 p-4 rounded-xl bg-blue-50 border border-blue-200">
              <p className="text-blue-700 font-medium">📹 화상상담 초대를 받으셨습니다</p>
              <p className="text-blue-500 text-sm mt-1">방 번호: {roomIdFromUrl}</p>
              <button
                onClick={() => startVideoConsult(roomIdFromUrl)}
                className="mt-3 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
              >
                지금 입장하기
              </button>
            </div>
          )}

          {/* 대화 기록 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 h-96 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <span className="text-4xl mb-3">💬</span>
                <p>안녕하세요! 재무상담을 시작해보세요.</p>
                <p className="text-sm mt-1">음성 또는 화상상담 버튼을 눌러주세요.</p>
              </div>
            ) : (
              messages.map(m => (
                <div key={m.id} className={`mb-3 flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                    m.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 상태 표시 */}
          <div className="text-center">
            <span className={`inline-flex items-center gap-2 text-sm px-3 py-1 rounded-full ${
              voiceStatus === '상담중' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                voiceStatus === '상담중' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`} />
              {voiceStatus}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
