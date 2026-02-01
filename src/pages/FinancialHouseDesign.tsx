// src/pages/FinancialHouseDesign.tsx
// v4.0: 마이크 음성 기능 + 대화 공간 + OCR 모달 추가
// v5.0: initialTab props 추가 - back 버튼 시 마지막 탭에서 시작
// v5.1: InsurancePlanCard에 onOpenOCR props 전달 (보험증권 업로드 → +버튼 OCR 모달 연결)
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
  initialTab?: string; // ★★★ v5.0 추가: 초기 탭 설정 ★★★
}

interface Message {
  id: string;
  type: 'ai' | 'user';
  text: string;
  timestamp: Date;
  imageUrl?: string;  // OCR 이미지 썸네일용 (URL.createObjectURL)
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
export default function FinancialHouseDesign({ userName, onComplete, onBack, initialTab = 'retire' }: FinancialHouseDesignProps) {
  // ★★★ v5.0 수정: initialTab props로 초기 탭 설정 ★★★
  const [currentTab, setCurrentTab] = useState(initialTab);
  const [completedTabs, setCompletedTabs] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  
  // ★★★ 대화 모드 상태 분리 (v2.0) ★★★
  const [isChatMode, setIsChatMode] = useState(false);    // 대화창 표시 여부
  const [isMicActive, setIsMicActive] = useState(false);  // 마이크 활성화 여부
  const [status, setStatus] = useState('대기중');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled] = useState(true);
  const [, setServerReady] = useState(false);
  
  // OCR 모달 상태
  const [isOCRModalOpen, setIsOCRModalOpen] = useState(false);
  const [, setIsAnalyzing] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);  // 🆕 개인정보 동의 상태
  
  // ★★★ OCR 분석 결과 컨텍스트 (음성 대화 시 AI머니야가 기억) ★★★
  const [analysisContext, setAnalysisContext] = useState<{
    fileName: string;
    fileType: string;
    analysis: string;
    timestamp: string;
  } | null>(null);
  
  // ★★★ OCR 파일 입력 refs ★★★
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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

  // ★★★ v5.0 추가: initialTab이 변경되면 currentTab 업데이트 ★★★
  useEffect(() => {
    setCurrentTab(initialTab);
  }, [initialTab]);

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
      setIsChatMode(true);    // 대화창 열기
      setIsMicActive(true);   // 마이크 활성화
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
          designData: designData,
          // ★★★ OCR 분석 컨텍스트 전달 (AI머니야가 기억) ★★★
          analysisContext: analysisContext
        };
        ws.send(JSON.stringify(startMessage));
        console.log('[금융집짓기] start_app 메시지 전송 완료', analysisContext ? '(분석 컨텍스트 포함)' : '');
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
        setIsMicActive(false);  // 마이크만 비활성화, 대화창은 유지
      };
      
      ws.onclose = () => {
        console.log('[금융집짓기] WebSocket 연결 종료');
        isConnectedRef.current = false;
        setStatus('대기중');
        setIsMicActive(false);  // 마이크만 비활성화, 대화창은 유지
      };
    } catch (error) {
      console.error('[금융집짓기] 마이크 에러:', error);
      alert('마이크 권한이 필요합니다.');
      cleanupVoiceMode();
      setIsMicActive(false);
      setStatus('대기중');
    }
  };

  const stopVoiceMode = () => {
    cleanupVoiceMode();
    setIsMicActive(false);
    setIsChatMode(false);  // ★★★ 1번 수정: 마이크 OFF 시 대화창도 닫기 ★★★
    setStatus('대기중');
  };

  const toggleVoiceMode = () => {
    if (isMicActive) {
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
    
    // ★★★ 텍스트 입력 시 대화창 열기 (마이크는 활성화 안함) ★★★
    if (!isChatMode) setIsChatMode(true);
    
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
      // ★★★ 첫번째 탭(은퇴설계)에서 back -> App.tsx의 onBack 호출 ★★★
      onBack();
    }
  };

  // ============================================
  // OCR 관련 함수 (FormData 파일 직접 전송 - BASE64 금지)
  // ============================================
  
  // 카메라 촬영 버튼 클릭
  const handleCameraCapture = () => {
    setIsOCRModalOpen(false);
    cameraInputRef.current?.click();
  };

  // 갤러리 선택 버튼 클릭
  const handleGallerySelect = () => {
    setIsOCRModalOpen(false);
    galleryInputRef.current?.click();
  };

  // 파일첨부 버튼 클릭
  const handleFileSelect = () => {
    setIsOCRModalOpen(false);
    fileInputRef.current?.click();
  };

  // 파일 선택 후 처리 (FormData로 직접 전송 - BASE64 금지!)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, source: 'camera' | 'gallery' | 'file') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 🆕 카메라 촬영 시 MIME 타입이 빈 경우 처리
    let fileType = file.type;
    if (!fileType && source === 'camera') {
      // 카메라 촬영 시 MIME 타입이 없으면 기본값 설정
      fileType = 'image/jpeg';
    }
    
    // 파일 타입 확인
    const isImage = fileType.startsWith('image/') || source === 'camera';
    const isPDF = fileType === 'application/pdf';
    
    console.log(`[OCR] 파일 정보 - 이름: ${file.name}, 타입: ${fileType}, 소스: ${source}, 크기: ${file.size}`);
    
    if (!isImage && !isPDF) {
      const errorMsg: Message = { 
        id: Date.now().toString(), 
        type: 'ai', 
        text: '❌ 지원하지 않는 파일 형식입니다. 이미지(JPG, PNG) 또는 PDF 파일만 업로드 가능합니다.', 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, errorMsg]);
      return;
    }

    // 파일 크기 제한 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      const errorMsg: Message = { 
        id: Date.now().toString(), 
        type: 'ai', 
        text: '❌ 파일 크기가 10MB를 초과합니다. 더 작은 파일을 선택해주세요.', 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, errorMsg]);
      return;
    }

    // ★★★ 대화창만 열기 (마이크는 활성화 안함) ★★★
    if (!isChatMode) setIsChatMode(true);

    // ★★★ 이미지 썸네일 URL 생성 (BASE64 금지! URL.createObjectURL 사용) ★★★
    let imagePreviewUrl: string | undefined;
    if (isImage) {
      imagePreviewUrl = URL.createObjectURL(file);
    }

    // ★★★ 사용자 메시지에 이미지 썸네일 표시 ★★★
    const sourceText = source === 'camera' ? '📷 사진 촬영' : source === 'gallery' ? '🖼️ 이미지 선택' : '📎 파일 첨부';
    const userMsg: Message = { 
      id: Date.now().toString(), 
      type: 'user', 
      text: `${sourceText}: ${file.name}`,
      timestamp: new Date(),
      imageUrl: imagePreviewUrl  // 이미지 썸네일 URL (PDF는 undefined)
    };
    setMessages(prev => [...prev, userMsg]);

    // 분석 중 메시지
    const analyzingMsg: Message = { 
      id: (Date.now() + 1).toString(), 
      type: 'ai', 
      text: '🔍 AI머니야가 분석 중입니다... 잠시만 기다려주세요!', 
      timestamp: new Date() 
    };
    setMessages(prev => [...prev, analyzingMsg]);
    setIsAnalyzing(true);

    try {
      // FormData로 파일 직접 전송 (BASE64 변환 금지!)
      const formData = new FormData();
      
      // ★★★ 1번 수정: 카메라 촬영 시 ArrayBuffer로 읽어서 새 File 생성 ★★★
      if (source === 'camera') {
        const arrayBuffer = await file.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });
        const newFile = new File([blob], file.name || `camera_${Date.now()}.jpg`, { type: 'image/jpeg' });
        formData.append('file', newFile);
        formData.append('fileName', newFile.name);
      } else {
        formData.append('file', file);
        formData.append('fileName', file.name);
      }
      
      formData.append('fileType', isImage ? 'image' : 'pdf');
      formData.append('currentTab', currentTab);

      const response = await fetch(`${API_URL}/api/analyze-file`, {
        method: 'POST',
        body: formData, // FormData 직접 전송
      });

      const data = await response.json();

      if (data.success && data.analysis) {
        // ★★★ 분석 결과를 컨텍스트에 저장 (음성 대화 시 AI머니야가 기억) ★★★
        const contextData = {
          fileName: file.name,
          fileType: isImage ? 'image' : 'pdf',
          analysis: data.analysis,
          timestamp: new Date().toISOString()
        };
        setAnalysisContext(contextData);
        console.log('📋 [금융집짓기] 분석 컨텍스트 저장:', contextData.fileName);

        // ★★★ 음성 모드 중이면 WebSocket으로 컨텍스트 즉시 전달 ★★★
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'update_context',
            analysisContext: contextData
          }));
          console.log('📤 [금융집짓기] 분석 컨텍스트를 서버에 전달');
        }

        // 분석 성공 메시지
        const analysisMsg: Message = { 
          id: (Date.now() + 2).toString(), 
          type: 'ai', 
          text: `✅ 분석 완료!\n\n${data.analysis}`, 
          timestamp: new Date() 
        };
        setMessages(prev => [...prev, analysisMsg]);

        // ★★★ 방안 2: 머니야가 자동으로 분석 결과 요약을 음성으로 안내 ★★★
        const summaryText = `대표님, 방금 업로드하신 서류를 분석했습니다. ${data.analysis.substring(0, 200).replace(/\n/g, ' ')}`;
        
        try {
          const ttsResponse = await fetch(`${API_URL}/api/tts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: summaryText, voice: 'shimmer' }),
          });
          const ttsData = await ttsResponse.json();
          if (ttsData.success && ttsData.audio) {
            const audioBlob = new Blob([Uint8Array.from(atob(ttsData.audio), c => c.charCodeAt(0))], { type: 'audio/mp3' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.onended = () => URL.revokeObjectURL(audioUrl);
            await audio.play();
            console.log('🔊 [금융집짓기] 분석 결과 음성 안내 완료');
          }
        } catch (ttsError) {
          console.error('[금융집짓기] TTS 에러:', ttsError);
        }

        // 추가 질문 안내
        const guideMsg: Message = { 
          id: (Date.now() + 3).toString(), 
          type: 'ai', 
          text: '💬 분석 결과에 대해 궁금한 점이 있으시면 음성 또는 텍스트로 질문해주세요! AI머니야가 분석 내용을 기억하고 있습니다.', 
          timestamp: new Date() 
        };
        setMessages(prev => [...prev, guideMsg]);
      } else {
        // 분석 실패
        const errorMsg: Message = { 
          id: (Date.now() + 2).toString(), 
          type: 'ai', 
          text: `❌ 분석 중 오류가 발생했습니다: ${data.error || '알 수 없는 오류'}`, 
          timestamp: new Date() 
        };
        setMessages(prev => [...prev, errorMsg]);
      }
    } catch (error) {
      console.error('[금융집짓기] OCR 분석 에러:', error);
      const errorMsg: Message = { 
        id: (Date.now() + 2).toString(), 
        type: 'ai', 
        text: '❌ 서버 연결 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsAnalyzing(false);
      // 파일 입력 초기화 (같은 파일 다시 선택 가능)
      e.target.value = '';
    }
  };

  // ============================================
  // 렌더링
  // ============================================
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 - 상단 고정 */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 z-50">
        <button onClick={goToPrevTab} className="w-9 h-9 flex items-center justify-center bg-gray-100 rounded-lg text-lg">←</button>
        <h1 className="flex-1 text-lg font-bold">7개 재무설계</h1>
        <span className="text-xs text-gray-400 font-semibold bg-gray-100 px-2.5 py-1 rounded-xl">{currentStep}/7</span>
      </header>

      {/* 탭 네비게이션 - 헤더 아래 고정 (top-14 = 56px) */}
      <div className="fixed top-14 left-0 right-0 bg-white border-b border-gray-200 px-3 py-2 flex gap-1.5 overflow-x-auto z-50">
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

      {/* 메인 콘텐츠 영역 - 상단(헤더+탭) 고정 높이 + 하단(버튼바+내비바) 높이만큼 패딩 */}
      {/* pt-28 = 헤더(56px) + 탭(56px), pb-36 = 버튼바(64px) + 내비바(64px) + 여유 */}
      <div className="flex-1 flex flex-col mt-28 mb-36 overflow-hidden">
        
        {/* 입력 폼 영역 (토글 시 위로 접힘) */}
        <div 
          className={`overflow-y-auto p-4 transition-all duration-300 ${
            isChatMode ? 'max-h-32 overflow-hidden' : 'flex-1'
          }`}
          style={{ scrollbarWidth: 'thin' }}
        >
          {currentTab === 'retire' && <RetirePlanCard onNext={goToNextTab} onPrev={goToPrevTab} />}
          {currentTab === 'debt' && <DebtPlanCard onNext={goToNextTab} onPrev={goToPrevTab} />}
          {currentTab === 'save' && <SavePlanCard onNext={goToNextTab} onPrev={goToPrevTab} />}
          {currentTab === 'invest' && <InvestPlanCard onNext={goToNextTab} onPrev={goToPrevTab} />}
          {currentTab === 'tax' && <TaxPlanCard onNext={goToNextTab} onPrev={goToPrevTab} />}
          {currentTab === 'estate' && <EstatePlanCard onNext={goToNextTab} onPrev={goToPrevTab} />}
          {/* ★★★ v5.1 수정: onOpenOCR props 추가 → 보험증권 업로드 클릭 시 +버튼 OCR 모달 열기 ★★★ */}
          {currentTab === 'insurance' && <InsurancePlanCard onNext={goToNextTab} onPrev={goToPrevTab} isLast onOpenOCR={() => setIsOCRModalOpen(true)} />}
        </div>

        {/* 대화 영역 (토글 시 중간에 나타남) */}
        {isChatMode && (
          <div className="flex-1 flex flex-col mx-4 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden">
            {/* 대화 모드 인디케이터 */}
            <div className={`p-3 border-b flex items-center justify-between flex-shrink-0 ${
              isMicActive ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center gap-3">
                {isMicActive ? (
                  <>
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
                  </>
                ) : (
                  <span className="text-blue-700 font-semibold text-sm">💬 머니야와 대화</span>
                )}
              </div>
              <button 
                onClick={() => { stopVoiceMode(); setIsChatMode(false); }} 
                className={`px-3 py-1 text-white text-xs font-bold rounded-full ${
                  isMicActive ? 'bg-green-500' : 'bg-blue-500'
                }`}
              >
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
                    {/* ★★★ 이미지 썸네일 표시 ★★★ */}
                    {message.imageUrl && (
                      <div className="mb-2">
                        <img 
                          src={message.imageUrl} 
                          alt="업로드된 이미지" 
                          className="w-32 h-32 object-cover rounded-lg border border-white/30"
                        />
                      </div>
                    )}
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

      {/* 하단 입력 영역 - 내비바 위에 고정 (bottom-20 = 80px) */}
      <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 z-40">
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
              isMicActive ? 'bg-red-500 animate-pulse' : 'bg-amber-400 hover:bg-amber-500'
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
              disabled={isLoading || isMicActive}
            />
          </div>
          
          {/* 전송 버튼 */}
          <button 
            onClick={() => sendTextMessage(inputMessage)}
            disabled={!inputMessage.trim() || isLoading || isMicActive}
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
              inputMessage.trim() && !isLoading && !isMicActive ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300'
            }`}
          >
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* OCR 모달 (라이트 모드) - 위치 올림 + 개인정보 동의 추가 */}
      {isOCRModalOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={() => { setIsOCRModalOpen(false); setPrivacyAgreed(false); }}
        >
          <div 
            className="bg-white w-[90%] max-w-md rounded-3xl p-6 mx-4"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'fadeIn 0.2s ease-out' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">📎 파일 첨부</h3>
              <button 
                onClick={() => { setIsOCRModalOpen(false); setPrivacyAgreed(false); }}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* 개인정보 수집이용 동의 */}
            <div className="mb-4 p-3 bg-gray-50 rounded-xl">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacyAgreed}
                  onChange={(e) => setPrivacyAgreed(e.target.checked)}
                  className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600 leading-relaxed">
                  <span className="font-semibold text-gray-800">[필수] 개인정보 수집·이용 동의</span><br/>
                  첨부하신 서류(보험증권, 연금자료 등)는 AI 분석 목적으로만 사용되며, 분석 완료 후 즉시 삭제됩니다.
                </span>
              </label>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {/* 사진촬영 */}
              <button 
                onClick={handleCameraCapture}
                disabled={!privacyAgreed}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                  privacyAgreed 
                    ? 'bg-purple-50 border-purple-100 hover:border-purple-300' 
                    : 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  privacyAgreed ? 'bg-purple-100' : 'bg-gray-200'
                }`}>
                  <svg className={`w-6 h-6 ${privacyAgreed ? 'text-purple-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <span className={`text-xs font-semibold ${privacyAgreed ? 'text-gray-700' : 'text-gray-400'}`}>사진촬영</span>
              </button>
              
              {/* 사진/이미지 */}
              <button 
                onClick={handleGallerySelect}
                disabled={!privacyAgreed}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                  privacyAgreed 
                    ? 'bg-amber-50 border-amber-100 hover:border-amber-300' 
                    : 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  privacyAgreed ? 'bg-amber-100' : 'bg-gray-200'
                }`}>
                  <svg className={`w-6 h-6 ${privacyAgreed ? 'text-amber-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
                <span className={`text-xs font-semibold ${privacyAgreed ? 'text-gray-700' : 'text-gray-400'}`}>사진/이미지</span>
              </button>
              
              {/* 파일첨부 */}
              <button 
                onClick={handleFileSelect}
                disabled={!privacyAgreed}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                  privacyAgreed 
                    ? 'bg-blue-50 border-blue-100 hover:border-blue-300' 
                    : 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  privacyAgreed ? 'bg-blue-100' : 'bg-gray-200'
                }`}>
                  <svg className={`w-6 h-6 ${privacyAgreed ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                  </svg>
                </div>
                <span className={`text-xs font-semibold ${privacyAgreed ? 'text-gray-700' : 'text-gray-400'}`}>파일첨부</span>
              </button>
            </div>
            
            <p className="text-center text-xs text-gray-400 mt-4">
              보험증권, 연금자료, 세금자료 등을 첨부해주세요
            </p>
          </div>
        </div>
      )}

      {/* 숨겨진 파일 입력 요소들 (OCR용) */}
      {/* 카메라 촬영 - 폰 갤러리에 자동 저장됨 */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFileChange(e, 'camera')}
        className="hidden"
      />
      {/* 갤러리 선택 */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileChange(e, 'gallery')}
        className="hidden"
      />
      {/* 파일첨부 (PDF, 이미지) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        onChange={(e) => handleFileChange(e, 'file')}
        className="hidden"
      />

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
