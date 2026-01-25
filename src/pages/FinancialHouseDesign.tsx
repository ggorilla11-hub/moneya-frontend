// src/pages/FinancialHouseDesign.tsx
// v4.0: 마이크 음성 기능 + 대화 공간 + OCR 모달 추가
// ★★★ 기존 AI지출탭 AIConversation.tsx 음성 코드 100% 복사 적용 ★★★
// ★★★ 기존 AI지출탭 음성 코드는 절대 수정하지 않음 ★★★

import { useState, useEffect, useRef } from 'react';
import { RetirePlanCard, DebtPlanCard, SavePlanCard, InvestPlanCard, TaxPlanCard, EstatePlanCard, InsurancePlanCard } from './FinancialPlanCards';

// ============================================
// 상수 정의
// ============================================
const STORAGE_KEY = 'financialHouseDesignData';
const API_URL = 'https://moneya-server.onrender.com';
const WS_URL = 'wss://moneya-server.onrender.com';

// ============================================
// 데이터 저장/불러오기 함수
// ============================================
export const saveDesignData = (tabId: string, data: any) => {
  try {
    const existingData = localStorage.getItem(STORAGE_KEY);
    const allData = existingData ? JSON.parse(existingData) : {};
    allData[tabId] = data;
    allData.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
  } catch (e) {
    console.error('[금융집짓기] 데이터 저장 실패:', e);
  }
};

export const loadDesignData = (tabId: string) => {
  try {
    const existingData = localStorage.getItem(STORAGE_KEY);
    if (existingData) {
      const allData = JSON.parse(existingData);
      return allData[tabId] || null;
    }
  } catch (e) {
    console.error('[금융집짓기] 데이터 로드 실패:', e);
  }
  return null;
};

const loadFinancialHouseDesignData = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('[FinancialHouseDesign] 데이터 로드 실패:', e);
  }
  return null;
};

// ============================================
// 한글 금액 변환 함수 (AIConversation.tsx와 동일)
// ============================================
const koreanNumbers: { [key: string]: number } = {
  '영': 0, '일': 1, '이': 2, '삼': 3, '사': 4,
  '오': 5, '육': 6, '칠': 7, '팔': 8, '구': 9
};

const koreanToNumber = (koreanStr: string): number => {
  koreanStr = koreanStr.replace('원', '');
  let result = 0, temp = 0, bigUnit = 0;
  for (let i = 0; i < koreanStr.length; i++) {
    const char = koreanStr[i];
    if (koreanNumbers[char] !== undefined) {
      temp = koreanNumbers[char];
    } else if (char === '십' || char === '백' || char === '천') {
      if (temp === 0) temp = 1;
      const units: { [key: string]: number } = { '십': 10, '백': 100, '천': 1000 };
      temp *= units[char];
      bigUnit += temp;
      temp = 0;
    } else if (char === '만') {
      if (temp === 0 && bigUnit === 0) bigUnit = 1;
      bigUnit += temp;
      result += bigUnit * 10000;
      bigUnit = 0;
      temp = 0;
    } else if (char === '억') {
      if (temp === 0 && bigUnit === 0) bigUnit = 1;
      bigUnit += temp;
      result += bigUnit * 100000000;
      bigUnit = 0;
      temp = 0;
    }
  }
  result += bigUnit + temp;
  return result;
};

const convertKoreanAmountInText = (text: string): string => {
  const koreanAmountPattern = /([일이삼사오육칠팔구십백천만억]+원)/g;
  return text.replace(koreanAmountPattern, (match) => {
    const number = koreanToNumber(match);
    return number.toLocaleString() + '원';
  });
};

// ============================================
// 인터페이스
// ============================================
interface FinancialHouseDesignProps {
  userName: string;
  onComplete: () => void;
  onBack: () => void;
}

interface Message {
  id: string;
  type: 'ai' | 'user';
  text: string;
  timestamp: Date;
}

// ============================================
// 탭 정의
// ============================================
const DESIGN_TABS = [
  { id: 'retire', name: '은퇴', icon: '🏖️' },
  { id: 'debt', name: '부채', icon: '💳' },
  { id: 'save', name: '저축', icon: '💰' },
  { id: 'invest', name: '투자', icon: '📈' },
  { id: 'tax', name: '세금', icon: '💸' },
  { id: 'estate', name: '부동산', icon: '🏠' },
  { id: 'insurance', name: '보험', icon: '🛡️' },
];

// ============================================
// 메인 컴포넌트
// ============================================
export default function FinancialHouseDesign({ userName, onComplete, onBack }: FinancialHouseDesignProps) {
  // 탭 상태
  const [currentTab, setCurrentTab] = useState('retire');
  const [completedTabs, setCompletedTabs] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  
  // ★★★ 음성 모드 관련 상태 (AIConversation.tsx와 동일) ★★★
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [status, setStatus] = useState('대기중');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled] = useState(true);
  const [, setServerReady] = useState(false);
  
  // OCR 모달 상태
  const [isOCRModalOpen, setIsOCRModalOpen] = useState(false);
  
  // ★★★ Refs (AIConversation.tsx와 동일) ★★★
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<any>(null);
  const audioQueueRef = useRef<string[]>([]);
  const isPlayingRef = useRef(false);
  const isConnectedRef = useRef(false);
  const chatAreaRef = useRef<HTMLDivElement>(null);

  const currentStep = DESIGN_TABS.findIndex(tab => tab.id === currentTab) + 1;
  const displayName = userName || '고객';

  // ★★★ 서버 워밍업 (AIConversation.tsx와 동일) ★★★
  useEffect(() => {
    const warmupServer = async () => {
      try {
        const response = await fetch(`${API_URL}/api/health`);
        if (response.ok) {
          setServerReady(true);
          console.log('[금융집짓기] 서버 준비 완료');
        }
      } catch (e) {
        console.log('[금융집짓기] 서버 깨우는 중...');
        setTimeout(warmupServer, 3000);
      }
    };
    warmupServer();
  }, []);

  // ★★★ 초기 인사 메시지 ★★★
  useEffect(() => {
    const greetingText = `안녕하세요, ${displayName}님! 머니야예요. 재무설계에 대해 궁금한 점이 있으시면 말씀해주세요.`;
    setMessages([{ id: '1', type: 'ai', text: greetingText, timestamp: new Date() }]);
    return () => { cleanupVoiceMode(); };
  }, [displayName]);

  // ★★★ 메시지 스크롤 ★★★
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // ★★★ 재무 컨텍스트 ★★★
  const getFullFinancialContext = () => {
    const designData = loadFinancialHouseDesignData();
    return { name: displayName, currentTab, designData };
  };

  // ============================================
  // ★★★ 오디오 함수들 (AIConversation.tsx와 100% 동일) ★★★
  // ============================================
  const playAudio = async (base64Audio: string) => {
    audioQueueRef.current.push(base64Audio);
    if (!isPlayingRef.current) {
      processAudioQueue();
    }
  };

  const processAudioQueue = async () => {
    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      return;
    }
    isPlayingRef.current = true;
    const base64Audio = audioQueueRef.current.shift()!;
    try {
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      const audioData = atob(base64Audio);
      const arrayBuffer = new ArrayBuffer(audioData.length);
      const view = new Uint8Array(arrayBuffer);
      for (let i = 0; i < audioData.length; i++) {
        view[i] = audioData.charCodeAt(i);
      }
      const pcm16 = new Int16Array(arrayBuffer);
      const float32 = new Float32Array(pcm16.length);
      for (let i = 0; i < pcm16.length; i++) {
        float32[i] = pcm16[i] / 32768;
      }
      const audioBuffer = audioContextRef.current.createBuffer(1, float32.length, 24000);
      audioBuffer.getChannelData(0).set(float32);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => processAudioQueue();
      source.start();
    } catch (e) {
      console.error('[금융집짓기] 오디오 재생 에러:', e);
      processAudioQueue();
    }
  };

  const cleanupVoiceMode = () => {
    if (wsRef.current) {
      try {
        wsRef.current.send(JSON.stringify({ type: 'stop' }));
        wsRef.current.close();
      } catch (e) {}
      wsRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (processorRef.current) {
      try {
        const { processor, source, audioContext } = processorRef.current;
        processor.disconnect();
        source.disconnect();
        audioContext.close();
      } catch (e) {}
      processorRef.current = null;
    }
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    isConnectedRef.current = false;
  };

  const startAudioCapture = (stream: MediaStream, ws: WebSocket) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processor.onaudioprocess = (e) => {
        if (!ws || ws.readyState !== WebSocket.OPEN) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcm16[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
        }
        const base64 = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));
        ws.send(JSON.stringify({ type: 'audio', data: base64 }));
      };
      source.connect(processor);
      processor.connect(audioContext.destination);
      processorRef.current = { processor, source, audioContext };
    } catch (e) {
      console.error('[금융집짓기] 오디오 캡처 에러:', e);
    }
  };

  // ============================================
  // ★★★ 음성 모드 시작 (AIConversation.tsx와 100% 동일) ★★★
  // ============================================
  const startVoiceMode = async () => {
    if (isConnectedRef.current) return;
    try {
      setStatus('연결중...');
      setIsVoiceMode(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { sampleRate: 24000, channelCount: 1, echoCancellation: true, noiseSuppression: true } 
      });
      mediaStreamRef.current = stream;
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;
      
      ws.onopen = () => {
        console.log('[금융집짓기] WebSocket 연결됨!');
        const financialContext = getFullFinancialContext();
        const designData = loadFinancialHouseDesignData();
        const startMessage = { 
          type: 'start_app',
          userName: displayName,
          financialContext,
          budgetInfo: { remainingBudget: 0, dailyBudget: 0, todaySpent: 0 },
          designData: designData
        };
        ws.send(JSON.stringify(startMessage));
        console.log('[금융집짓기] start_app 메시지 전송 완료');
      };
      
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'session_started') {
            console.log('[금융집짓기] 세션 시작됨!');
            isConnectedRef.current = true;
            setStatus('듣는중...');
            startAudioCapture(stream, ws);
          }
          if (msg.type === 'audio' && msg.data) {
            playAudio(msg.data);
          }
          if (msg.type === 'transcript' && msg.role === 'user') {
            const userMsg: Message = { id: Date.now().toString(), type: 'user', text: msg.text, timestamp: new Date() };
            setMessages(prev => [...prev, userMsg]);
          }
          if (msg.type === 'transcript' && msg.role === 'assistant') {
            const aiMsg: Message = { id: (Date.now() + 1).toString(), type: 'ai', text: msg.text, timestamp: new Date() };
            setMessages(prev => [...prev, aiMsg]);
          }
          if (msg.type === 'interrupt') {
            audioQueueRef.current = [];
            isPlayingRef.current = false;
          }
          if (msg.type === 'error') {
            console.error('[금융집짓기] 서버 에러:', msg.error);
          }
        } catch (e) {
          console.error('[금융집짓기] 메시지 파싱 에러:', e);
        }
      };
      
      ws.onerror = (error) => {
        console.error('[금융집짓기] WebSocket 에러:', error);
        setStatus('연결 실패');
        cleanupVoiceMode();
        setIsVoiceMode(false);
      };
      
      ws.onclose = () => {
        console.log('[금융집짓기] WebSocket 연결 종료');
        isConnectedRef.current = false;
        setStatus('대기중');
        setIsVoiceMode(false);
      };
    } catch (error) {
      console.error('[금융집짓기] 마이크 에러:', error);
      alert('마이크 권한이 필요합니다.');
      cleanupVoiceMode();
      setIsVoiceMode(false);
      setStatus('대기중');
    }
  };

  const stopVoiceMode = () => {
    cleanupVoiceMode();
    setIsVoiceMode(false);
    setStatus('대기중');
  };

  const toggleVoiceMode = () => {
    if (isVoiceMode) {
      stopVoiceMode();
    } else {
      startVoiceMode();
    }
  };

  // ============================================
  // ★★★ 텍스트 메시지 전송 (AIConversation.tsx와 동일) ★★★
  // ============================================
  const sendTextMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMessage: Message = { id: Date.now().toString(), type: 'user', text: text.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    try {
      const financialContext = getFullFinancialContext();
      const designData = loadFinancialHouseDesignData();
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          userName: displayName,
          financialContext,
          budgetInfo: { remainingBudget: 0, dailyBudget: 0, todaySpent: 0 },
          designData: designData
        }),
      });
      const data = await response.json();
      const aiText = data.success ? data.message : '다시 말씀해주세요!';
      const aiResponse: Message = { id: (Date.now() + 1).toString(), type: 'ai', text: aiText, timestamp: new Date() };
      setMessages(prev => [...prev, aiResponse]);
      
      // TTS 재생 (voice: 'shimmer' - 여성 목소리)
      if (voiceEnabled) {
        try {
          const ttsResponse = await fetch(`${API_URL}/api/tts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: aiText, voice: 'shimmer' }),
          });
          const ttsData = await ttsResponse.json();
          if (ttsData.success && ttsData.audio) {
            const audioBlob = new Blob([Uint8Array.from(atob(ttsData.audio), c => c.charCodeAt(0))], { type: 'audio/mp3' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.onended = () => URL.revokeObjectURL(audioUrl);
            await audio.play();
          }
        } catch (e) {
          console.error('[금융집짓기] TTS 에러:', e);
        }
      }
    } catch (error) {
      console.error('[금융집짓기] API 에러:', error);
      const errorMsg: Message = { id: (Date.now() + 1).toString(), type: 'ai', text: '서버 연결 중입니다. 잠시 후 다시 시도해주세요.', timestamp: new Date() };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendTextMessage(inputMessage);
    }
  };

  // ============================================
  // 탭 이동 함수
  // ============================================
  const goToNextTab = () => {
    const currentIndex = DESIGN_TABS.findIndex(tab => tab.id === currentTab);
    if (currentIndex < DESIGN_TABS.length - 1) {
      setCompletedTabs([...completedTabs, currentTab]);
      setCurrentTab(DESIGN_TABS[currentIndex + 1].id);
    } else {
      setCompletedTabs([...completedTabs, currentTab]);
      onComplete();
    }
  };

  const goToPrevTab = () => {
    const currentIndex = DESIGN_TABS.findIndex(tab => tab.id === currentTab);
    if (currentIndex > 0) {
      setCurrentTab(DESIGN_TABS[currentIndex - 1].id);
    } else {
      onBack();
    }
  };

  // ============================================
  // OCR 관련 함수
  // ============================================
  const handleCameraCapture = () => {
    setIsOCRModalOpen(false);
    const msg: Message = { id: Date.now().toString(), type: 'ai', text: '사진을 촬영하면 자동으로 갤러리에 저장되고, OCR 분석을 시작할게요!', timestamp: new Date() };
    setMessages(prev => [...prev, msg]);
    if (!isVoiceMode) setIsVoiceMode(true);
  };

  const handleGallerySelect = () => {
    setIsOCRModalOpen(false);
    const msg: Message = { id: Date.now().toString(), type: 'ai', text: '갤러리에서 보험증권이나 세금자료 이미지를 선택해주세요!', timestamp: new Date() };
    setMessages(prev => [...prev, msg]);
    if (!isVoiceMode) setIsVoiceMode(true);
  };

  const handleFileSelect = () => {
    setIsOCRModalOpen(false);
    const msg: Message = { id: Date.now().toString(), type: 'ai', text: 'PDF나 문서 파일을 선택해주시면 분석해드릴게요!', timestamp: new Date() };
    setMessages(prev => [...prev, msg]);
    if (!isVoiceMode) setIsVoiceMode(true);
  };

  // ============================================
  // 렌더링
  // ============================================
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={goToPrevTab} className="w-9 h-9 flex items-center justify-center bg-gray-100 rounded-lg text-lg">←</button>
        <h1 className="flex-1 text-lg font-bold">7개 재무설계</h1>
        <span className="text-xs text-gray-400 font-semibold bg-gray-100 px-2.5 py-1 rounded-xl">{currentStep}/7</span>
      </header>

      {/* 탭 네비게이션 */}
      <div className="bg-white border-b border-gray-200 px-3 py-2 flex gap-1.5 overflow-x-auto flex-shrink-0">
        {DESIGN_TABS.map((tab) => {
          const isActive = currentTab === tab.id;
          const isDone = completedTabs.includes(tab.id);
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex-shrink-0 px-3 py-2 rounded-full text-xs font-semibold flex items-center gap-1 border-2 transition-all ${
                isActive ? 'bg-teal-50 text-teal-700 border-teal-400' 
                : isDone ? 'bg-green-50 text-green-600 border-transparent'
                : 'bg-gray-100 text-gray-400 border-transparent'
              }`}
            >
              {tab.icon} {tab.name}
              {isDone && <span className="w-3.5 h-3.5 bg-green-500 rounded-full text-white text-[9px] flex items-center justify-center">✓</span>}
            </button>
          );
        })}
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* 입력 폼 영역 (토글 시 위로 접힘) */}
        <div 
          className={`overflow-y-auto p-4 transition-all duration-300 ${
            isVoiceMode ? 'max-h-32 overflow-hidden' : 'flex-1'
          }`}
          style={{ scrollbarWidth: 'thin' }}
        >
          {currentTab === 'retire' && <RetirePlanCard onNext={goToNextTab} onPrev={goToPrevTab} />}
          {currentTab === 'debt' && <DebtPlanCard onNext={goToNextTab} onPrev={goToPrevTab} />}
          {currentTab === 'save' && <SavePlanCard onNext={goToNextTab} onPrev={goToPrevTab} />}
          {currentTab === 'invest' && <InvestPlanCard onNext={goToNextTab} onPrev={goToPrevTab} />}
          {currentTab === 'tax' && <TaxPlanCard onNext={goToNextTab} onPrev={goToPrevTab} />}
          {currentTab === 'estate' && <EstatePlanCard onNext={goToNextTab} onPrev={goToPrevTab} />}
          {currentTab === 'insurance' && <InsurancePlanCard onNext={goToNextTab} onPrev={goToPrevTab} isLast />}
        </div>

        {/* 대화 영역 (토글 시 중간에 나타남) */}
        {isVoiceMode && (
          <div className="flex-1 flex flex-col mx-4 mb-2 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden">
            {/* 음성 모드 인디케이터 */}
            <div className="p-3 bg-green-50 border-b border-green-200 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-1 bg-green-500 rounded-full animate-pulse" 
                      style={{ height: `${12 + Math.random() * 8}px`, animationDelay: `${i * 100}ms` }}
                    />
                  ))}
                </div>
                <span className="text-green-700 font-semibold text-sm">머니야와 대화중... "{status}"</span>
              </div>
              <button onClick={stopVoiceMode} className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                종료
              </button>
            </div>
            
            {/* 대화 메시지 영역 (스크롤 가능) */}
            <div 
              ref={chatAreaRef}
              className="flex-1 p-3 space-y-3 overflow-y-auto"
              style={{ scrollbarWidth: 'thin' }}
            >
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-2 max-w-[90%] ${message.type === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                  {message.type === 'ai' && (
                    <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
                      </svg>
                    </div>
                  )}
                  <div className={`px-3 py-2 rounded-2xl text-sm ${
                    message.type === 'ai' ? 'bg-white border border-gray-200 text-gray-800' : 'bg-blue-600 text-white'
                  }`}>
                    {message.type === 'ai' ? convertKoreanAmountInText(message.text) : message.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2 max-w-[90%]">
                  <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
                    </svg>
                  </div>
                  <div className="px-3 py-2 rounded-2xl text-sm bg-white border border-gray-200">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 하단 입력 영역 */}
      <div className="flex-shrink-0 bg-white border-t border-gray-100 px-4 py-3 mb-16">
        <div className="flex items-center gap-2">
          {/* + 버튼 (노란색) */}
          <button 
            onClick={() => setIsOCRModalOpen(true)}
            className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center hover:bg-amber-500 transition-all shadow-md"
          >
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </button>
          
          {/* 마이크 버튼 */}
          <button 
            onClick={toggleVoiceMode}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md ${
              isVoiceMode ? 'bg-red-500 animate-pulse' : 'bg-amber-400 hover:bg-amber-500'
            }`}
          >
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
            </svg>
          </button>
          
          {/* 입력창 */}
          <div className="flex-1 flex items-center bg-gray-100 border border-gray-200 rounded-full px-4 py-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="지출 전에 물어보세요..."
              className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
              disabled={isLoading || isVoiceMode}
            />
          </div>
          
          {/* 전송 버튼 */}
          <button 
            onClick={() => sendTextMessage(inputMessage)}
            disabled={!inputMessage.trim() || isLoading || isVoiceMode}
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
              inputMessage.trim() && !isLoading && !isVoiceMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300'
            }`}
          >
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* OCR 모달 (라이트 모드) */}
      {isOCRModalOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-end"
          onClick={() => setIsOCRModalOpen(false)}
        >
          <div 
            className="bg-white w-full rounded-t-3xl p-6 pb-8"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'slideUp 0.3s ease-out' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">📎 파일 첨부</h3>
              <button 
                onClick={() => setIsOCRModalOpen(false)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {/* 사진촬영 */}
              <button 
                onClick={handleCameraCapture}
                className="flex flex-col items-center gap-3 p-4 bg-purple-50 rounded-2xl border-2 border-purple-100 hover:border-purple-300 transition-all"
              >
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-700">사진촬영</span>
              </button>
              
              {/* 사진/이미지 */}
              <button 
                onClick={handleGallerySelect}
                className="flex flex-col items-center gap-3 p-4 bg-amber-50 rounded-2xl border-2 border-amber-100 hover:border-amber-300 transition-all"
              >
                <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-700">사진/이미지</span>
              </button>
              
              {/* 파일첨부 */}
              <button 
                onClick={handleFileSelect}
                className="flex flex-col items-center gap-3 p-4 bg-blue-50 rounded-2xl border-2 border-blue-100 hover:border-blue-300 transition-all"
              >
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-700">파일첨부</span>
              </button>
            </div>
            
            <p className="text-center text-xs text-gray-400 mt-4">
              보험증권, 세금자료, 국민연금자료 등을 첨부해주세요
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
