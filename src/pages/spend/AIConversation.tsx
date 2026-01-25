import { useState, useRef, useEffect } from 'react';
import type { AdjustedBudget } from '../BudgetAdjustPage';
import { useSpend } from '../../context/SpendContext';  // 🆕 v3: 지출 Context

// 한글 금액 → 숫자 변환 함수
const koreanNumbers: { [key: string]: number } = {
  '영': 0, '일': 1, '이': 2, '삼': 3, '사': 4,
  '오': 5, '육': 6, '칠': 7, '팔': 8, '구': 9
};

const koreanToNumber = (koreanStr: string): number => {
  koreanStr = koreanStr.replace('원', '');
  
  let result = 0;
  let temp = 0;
  let bigUnit = 0;
  
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

interface FinancialResult {
  name: string;
  age: number;
  income: number;
  assets: number;
  debt: number;
  wealthIndex: number;
  level: number;
  houseName: string;
  houseImage: string;
  message: string;
}

interface Message {
  id: string;
  type: 'ai' | 'user';
  text: string;
  timestamp: Date;
}

// 🆕 v2: 영수증 OCR 결과 타입
interface ReceiptOCRResult {
  storeName: string;
  amount: number;
  category: string;
  categoryEmoji: string;
  date: string;
}

// 🆕 v3: 지출 유형 → emotionType 매핑
const expenseTypeToEmotionType = (type: 'variable' | 'fixed' | 'emotion'): '충동' | '선택' | '필수' | undefined => {
  switch (type) {
    case 'emotion': return '충동';
    case 'variable': return '선택';
    case 'fixed': return '필수';
    default: return undefined;
  }
};

interface AIConversationProps {
  userName: string;
  displayName: string;
  adjustedBudget: AdjustedBudget | null;
  financialResult: FinancialResult | null;
  dailyBudget: number;
  todaySpent: number;
  todaySaved: number;
  todayInvestment: number;
  remainingBudget: number;
  onFAQMore: () => void;
  onPlusClick: () => void;
  children?: React.ReactNode;
}

const API_URL = 'https://moneya-server.onrender.com';
const WS_URL = 'wss://moneya-server.onrender.com';

// ★★★ 3차 금융집짓기 데이터 로드 함수 ★★★
const loadFinancialHouseDesignData = () => {
  try {
    const saved = localStorage.getItem('financialHouseDesignData');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('[AIConversation] 금융집짓기 데이터 로드 실패:', e);
  }
  return null;
};

// 🆕 v2: 카테고리 자동 분류 함수
const detectCategory = (storeName: string): { category: string; emoji: string } => {
  const lowerName = storeName.toLowerCase();
  
  // 편의점
  if (/이마트24|gs25|cu\b|세븐일레븐|미니스톱|편의점/i.test(lowerName)) {
    return { category: '편의점', emoji: '🛒' };
  }
  // 카페
  if (/스타벅스|투썸|이디야|메가커피|빽다방|카페|커피/i.test(lowerName)) {
    return { category: '카페', emoji: '☕' };
  }
  // 식비
  if (/식당|레스토랑|치킨|피자|배달|맛집|김밥|분식/i.test(lowerName)) {
    return { category: '식비', emoji: '🍱' };
  }
  // 교통
  if (/택시|지하철|버스|주유소|주차/i.test(lowerName)) {
    return { category: '교통', emoji: '🚇' };
  }
  // 쇼핑
  if (/마트|백화점|쇼핑|의류|옷/i.test(lowerName)) {
    return { category: '쇼핑', emoji: '🛍️' };
  }
  
  return { category: '기타', emoji: '📦' };
};

// 🆕 v2: OCR 결과 파싱 함수
const parseReceiptOCR = (ocrText: string): ReceiptOCRResult => {
  let storeName = '알 수 없음';
  let amount = 0;
  let category = '기타';
  let categoryEmoji = '📦';
  
  try {
    // JSON 형식 시도
    const jsonMatch = ocrText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      storeName = parsed.storeName || parsed.store || parsed.상호명 || '알 수 없음';
      amount = parseInt(String(parsed.amount || parsed.금액 || '0').replace(/[^0-9]/g, '')) || 0;
      category = parsed.category || parsed.카테고리 || '기타';
    } else {
      // 텍스트에서 추출
      const storeMatch = ocrText.match(/상호[명]?\s*[:\-]?\s*(.+)/i) || ocrText.match(/가게[명]?\s*[:\-]?\s*(.+)/i);
      if (storeMatch) storeName = storeMatch[1].trim().split('\n')[0];
      
      const amountMatch = ocrText.match(/(?:합계|총액|결제|금액)[:\s]*([0-9,]+)\s*원?/i) || 
                          ocrText.match(/([0-9,]+)\s*원/);
      if (amountMatch) amount = parseInt(amountMatch[1].replace(/,/g, '')) || 0;
    }
    
    // 카테고리 자동 분류
    const detected = detectCategory(storeName);
    category = detected.category;
    categoryEmoji = detected.emoji;
    
  } catch (e) {
    console.error('[OCR 파싱] 에러:', e);
  }
  
  return {
    storeName,
    amount,
    category,
    categoryEmoji,
    date: new Date().toISOString().split('T')[0]
  };
};

function AIConversation({
  userName: _userName,
  displayName,
  adjustedBudget,
  financialResult,
  dailyBudget,
  todaySpent,
  todaySaved,
  todayInvestment,
  remainingBudget,
  onFAQMore,
  onPlusClick,
  children,
}: AIConversationProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [serverReady, setServerReady] = useState(false);
  const chatAreaRef = useRef<HTMLDivElement>(null);

  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [status, setStatus] = useState('대기중');
  
  // 🆕 v3: SpendContext에서 addSpendItem 가져오기
  const { addSpendItem } = useSpend();
  
  // 🆕 v2: 영수증 OCR 관련 상태
  const [showInputMethodModal, setShowInputMethodModal] = useState(false);
  const [showReceiptUploadModal, setShowReceiptUploadModal] = useState(false);
  const [showReceiptResultModal, setShowReceiptResultModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [ocrResult, setOcrResult] = useState<ReceiptOCRResult | null>(null);
  const [selectedExpenseType, setSelectedExpenseType] = useState<'variable' | 'fixed' | 'emotion'>('variable');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<any>(null);
  const audioQueueRef = useRef<string[]>([]);
  const isPlayingRef = useRef(false);
  const isConnectedRef = useRef(false);

  const usagePercent = Math.round((todaySpent / dailyBudget) * 100);

  const faqChips = [
    { emoji: '💰', text: '오늘 얼마 쓸 수 있어?' },
    { emoji: '🍽️', text: '점심 예산은?' },
    { emoji: '📊', text: '이번 주 현황' },
  ];

  // ★★★ 1차/2차 재무 컨텍스트 ★★★
  const getFullFinancialContext = () => {
    return {
      name: financialResult?.name || displayName,
      age: financialResult?.age || 0,
      monthlyIncome: financialResult?.income || 0,
      totalAssets: financialResult?.assets || 0,
      totalDebt: financialResult?.debt || 0,
      netAssets: (financialResult?.assets || 0) - (financialResult?.debt || 0),
      wealthIndex: financialResult?.wealthIndex || 0,
      financialLevel: financialResult?.level || 0,
      houseName: financialResult?.houseName || '',
      livingExpense: adjustedBudget?.livingExpense || 0,
      savings: adjustedBudget?.savings || 0,
      pension: adjustedBudget?.pension || 0,
      insurance: adjustedBudget?.insurance || 0,
      loanPayment: adjustedBudget?.loanPayment || 0,
      surplus: adjustedBudget?.surplus || 0,
      dailyBudget,
      todaySpent,
      todaySaved,
      todayInvestment,
      remainingBudget,
    };
  };

  useEffect(() => {
    const warmupServer = async () => {
      try {
        const response = await fetch(`${API_URL}/api/health`);
        if (response.ok) {
          setServerReady(true);
          console.log('서버 준비 완료');
        }
      } catch (e) {
        console.log('서버 깨우는 중...');
        setTimeout(warmupServer, 3000);
      }
    };
    warmupServer();
  }, []);

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
      console.error('오디오 재생 에러:', e);
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
      console.error('오디오 캡처 에러:', e);
    }
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
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;
      ws.onopen = () => {
        console.log('WebSocket 연결됨!');
        const financialContext = getFullFinancialContext();
        const designData = loadFinancialHouseDesignData();
        const startMessage = { 
          type: 'start_app',
          userName: displayName,
          financialContext,
          budgetInfo: { remainingBudget, dailyBudget, todaySpent },
          designData: designData
        };
        ws.send(JSON.stringify(startMessage));
        console.log('start_app 메시지 전송 완료');
      };
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'session_started') {
            console.log('세션 시작됨!');
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
            console.error('서버 에러:', msg.error);
          }
        } catch (e) {
          console.error('메시지 파싱 에러:', e);
        }
      };
      ws.onerror = (error) => {
        console.error('WebSocket 에러:', error);
        setStatus('연결 실패');
        cleanupVoiceMode();
        setIsVoiceMode(false);
      };
      ws.onclose = () => {
        console.log('WebSocket 연결 종료');
        isConnectedRef.current = false;
        setStatus('대기중');
        setIsVoiceMode(false);
      };
    } catch (error) {
      console.error('마이크 에러:', error);
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

  const sendTextMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMessage: Message = { id: Date.now().toString(), type: 'user', text: text.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
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
          budgetInfo: { remainingBudget, dailyBudget, todaySpent },
          designData: designData
        }),
      });
      const data = await response.json();
      const aiText = data.success ? data.message : '다시 말씀해주세요!';
      const aiResponse: Message = { id: (Date.now() + 1).toString(), type: 'ai', text: aiText, timestamp: new Date() };
      setMessages(prev => [...prev, aiResponse]);
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
          console.error('TTS 에러:', e);
        }
      }
    } catch (error) {
      console.error('API 에러:', error);
      const errorMsg: Message = { id: (Date.now() + 1).toString(), type: 'ai', text: '서버 연결 중입니다. 잠시 후 다시 시도해주세요.', timestamp: new Date() };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // 🆕 v2: +버튼 클릭 핸들러
  const handlePlusClick = () => {
    setShowInputMethodModal(true);
  };

  // 🆕 v2: 영수증 촬영 선택
  const handleReceiptClick = () => {
    setShowInputMethodModal(false);
    setShowReceiptUploadModal(true);
  };

  // 🆕 v2: 파일 선택 핸들러
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, source: 'camera' | 'gallery') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    console.log(`[영수증 OCR] ${source}에서 파일 선택:`, file.name);
    setShowReceiptUploadModal(false);
    setShowReceiptResultModal(true);
    setIsAnalyzing(true);
    setOcrResult(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);
      formData.append('fileType', 'image');
      formData.append('currentTab', 'receipt');  // 영수증 전용
      
      const response = await fetch(`${API_URL}/api/analyze-file`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success && data.analysis) {
        console.log('[영수증 OCR] 분석 완료:', data.analysis.substring(0, 100));
        const parsed = parseReceiptOCR(data.analysis);
        setOcrResult(parsed);
      } else {
        console.error('[영수증 OCR] 분석 실패:', data.error);
        setOcrResult({
          storeName: '분석 실패',
          amount: 0,
          category: '기타',
          categoryEmoji: '❌',
          date: new Date().toISOString().split('T')[0]
        });
      }
    } catch (error) {
      console.error('[영수증 OCR] 에러:', error);
      setOcrResult({
        storeName: '오류 발생',
        amount: 0,
        category: '기타',
        categoryEmoji: '❌',
        date: new Date().toISOString().split('T')[0]
      });
    } finally {
      setIsAnalyzing(false);
      // input 초기화
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  // 🆕 v3: 지출 저장 (SpendContext 사용)
  const handleSaveExpense = () => {
    if (!ocrResult || ocrResult.amount === 0) {
      alert('금액을 확인해주세요.');
      return;
    }
    
    // SpendContext에 추가 (타임라인에 자동 반영)
    addSpendItem({
      amount: ocrResult.amount,
      type: 'spent',
      category: ocrResult.category,
      emotionType: expenseTypeToEmotionType(selectedExpenseType),
      memo: ocrResult.storeName,
      inputMethod: 'ocr',
      timestamp: new Date(),
    });
    
    // 채팅에 확인 메시지 추가
    const confirmMsg: Message = {
      id: Date.now().toString(),
      type: 'ai',
      text: `✅ ${ocrResult.storeName}에서 ${ocrResult.amount.toLocaleString()}원 지출이 기록되었어요!`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, confirmMsg]);
    
    // 모달 닫기 및 초기화
    setShowReceiptResultModal(false);
    setOcrResult(null);
    setSelectedExpenseType('variable');
    
    console.log('[영수증 OCR] 지출 저장 완료 - SpendContext에 추가됨');
  };

  useEffect(() => {
    const greetingText = `안녕하세요, ${displayName}님! 머니야예요. 무엇을 도와드릴까요?`;
    setMessages([{ id: '1', type: 'ai', text: greetingText, timestamp: new Date() }]);
    return () => { cleanupVoiceMode(); };
  }, []);

  const scrollToBottom = () => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendTextMessage(inputText);
    }
  };

  return (
    <>
      {/* 헤더 카드 */}
      <div className="mx-4 mt-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-4 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full"></div>
        <div className="flex items-center gap-3 relative z-10">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isVoiceMode ? 'bg-green-500 animate-pulse' : 'bg-white/20'}`}>
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-white font-bold">안녕하세요, {displayName}님!</p>
              {isVoiceMode && (<span className="px-2 py-0.5 bg-green-500/30 text-green-200 text-xs rounded-full">● {status}</span>)}
              {!serverReady && (<span className="px-2 py-0.5 bg-yellow-500/30 text-yellow-200 text-xs rounded-full">서버 준비중...</span>)}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/80 text-sm">오늘 남은 예산</span>
              <span className="text-white text-xl font-extrabold">₩{remainingBudget.toLocaleString()}</span>
            </div>
          </div>
          <button onClick={() => setVoiceEnabled(!voiceEnabled)} className={`w-10 h-10 rounded-full flex items-center justify-center ${voiceEnabled ? 'bg-white/30' : 'bg-white/10'}`}>
            {voiceEnabled ? (
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
            ) : (
              <svg className="w-5 h-5 text-white/50" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
            )}
          </button>
        </div>
        <div className="mt-3 bg-white/20 rounded-full h-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all" style={{ width: `${100 - usagePercent}%` }}></div>
        </div>
        <div className="flex justify-between mt-1.5 text-xs text-white/70">
          <span>일예산 ₩{dailyBudget.toLocaleString()}</span>
          <span>지출 ₩{todaySpent.toLocaleString()} ({usagePercent}%)</span>
        </div>
      </div>

      {/* 지출 타임라인 (children으로 전달받음) */}
      {children}

      {/* 음성 모드 표시 */}
      {isVoiceMode && (
        <div className="mx-4 mt-3 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (<div key={i} className="w-1 bg-green-500 rounded-full animate-pulse" style={{ height: `${12 + Math.random() * 12}px`, animationDelay: `${i * 100}ms` }}></div>))}
            </div>
            <span className="text-green-700 font-semibold text-sm">머니야와 대화중... "{status}"</span>
          </div>
          <button onClick={stopVoiceMode} className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">종료</button>
        </div>
      )}

      {/* FAQ 칩 */}
      <div className="px-4 mt-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-gray-400"># 자주 묻는 질문</span>
          <button onClick={onFAQMore} className="text-xs font-semibold text-blue-600">더보기 &gt;</button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {faqChips.map((chip, index) => (
            <button key={index} onClick={() => sendTextMessage(chip.text)} className="flex-shrink-0 px-3 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all">{chip.emoji} {chip.text}</button>
          ))}
        </div>
      </div>

      {/* 채팅 영역 */}
      <div 
        ref={chatAreaRef} 
        className="mx-4 mt-3 overflow-y-auto space-y-4 bg-gray-50 rounded-xl p-3"
        style={{ height: 'calc(100vh - 480px)', minHeight: '150px', maxHeight: '300px' }}
      >
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-2.5 max-w-[90%] ${message.type === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            {message.type === 'ai' && (
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/></svg>
              </div>
            )}
            <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${message.type === 'ai' ? 'bg-white border border-gray-100 text-gray-800' : 'bg-blue-600 text-white'}`}>{message.type === 'ai' ? convertKoreanAmountInText(message.text) : message.text}</div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2.5 max-w-[90%]">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/></svg>
            </div>
            <div className="px-4 py-3 rounded-2xl text-sm bg-white border border-gray-100">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 입력 영역 */}
      <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 z-50">
        <div className="flex items-center gap-2 max-w-md mx-auto">
          <button onClick={handlePlusClick} className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          </button>
          <button onClick={toggleVoiceMode} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isVoiceMode ? 'bg-red-500 animate-pulse scale-110' : 'bg-amber-400'}`}>
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/></svg>
          </button>
          <div className="flex-1 flex items-center bg-gray-100 border border-gray-200 rounded-full px-4 py-2">
            <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyPress={handleKeyPress} placeholder="머니야에게 물어보세요..." className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400" disabled={isLoading || isVoiceMode} />
          </div>
          <button onClick={() => sendTextMessage(inputText)} disabled={!inputText.trim() || isLoading || isVoiceMode} className={`w-10 h-10 rounded-full flex items-center justify-center ${inputText.trim() && !isLoading && !isVoiceMode ? 'bg-blue-600' : 'bg-gray-300'}`}>
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
      </div>

      {/* 🆕 v2: 입력 방식 선택 모달 */}
      {showInputMethodModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">지출 입력 방식</h3>
              <button onClick={() => setShowInputMethodModal(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">✕</button>
            </div>
            
            <div className="space-y-3">
              {/* 수동 입력 */}
              <button 
                onClick={() => { setShowInputMethodModal(false); onPlusClick(); }}
                className="w-full flex items-center gap-3 p-4 bg-gray-50 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all"
              >
                <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center text-xl">✏️</div>
                <div className="flex-1 text-left">
                  <p className="font-bold">수동 입력</p>
                  <p className="text-xs text-gray-500">지출 또는 참음 직접 입력</p>
                </div>
                <span className="text-gray-400">›</span>
              </button>
              
              {/* 영수증 촬영 */}
              <button 
                onClick={handleReceiptClick}
                className="w-full flex items-center gap-3 p-4 bg-amber-50 border-2 border-amber-400 rounded-xl hover:bg-amber-100 transition-all"
              >
                <div className="w-11 h-11 bg-amber-200 rounded-xl flex items-center justify-center text-xl">📷</div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-amber-800">영수증 촬영</p>
                  <p className="text-xs text-amber-600">OCR 자동 인식</p>
                </div>
                <span className="text-amber-600">›</span>
              </button>
              
              {/* 음성 입력 */}
              <button 
                onClick={() => { setShowInputMethodModal(false); startVoiceMode(); }}
                className="w-full flex items-center gap-3 p-4 bg-gray-50 border-2 border-gray-200 rounded-xl hover:border-pink-400 hover:bg-pink-50 transition-all"
              >
                <div className="w-11 h-11 bg-pink-100 rounded-xl flex items-center justify-center text-xl">🎤</div>
                <div className="flex-1 text-left">
                  <p className="font-bold">음성 입력</p>
                  <p className="text-xs text-gray-500">머니야에게 말하기</p>
                </div>
                <span className="text-gray-400">›</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 v2: 영수증 업로드 모달 */}
      {showReceiptUploadModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">📷 영수증 업로드</h3>
              <button onClick={() => setShowReceiptUploadModal(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">✕</button>
            </div>
            
            <div className="space-y-3">
              {/* 사진 촬영 */}
              <button 
                onClick={() => cameraInputRef.current?.click()}
                className="w-full flex items-center gap-3 p-4 bg-gray-50 border-2 border-gray-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all"
              >
                <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center text-xl">📸</div>
                <div className="flex-1 text-left">
                  <p className="font-bold">사진 촬영</p>
                  <p className="text-xs text-gray-500">카메라로 영수증 촬영</p>
                </div>
                <span className="text-gray-400">›</span>
              </button>
              
              {/* 사진/이미지 업로드 */}
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-3 p-4 bg-gray-50 border-2 border-gray-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all"
              >
                <div className="w-11 h-11 bg-purple-100 rounded-xl flex items-center justify-center text-xl">🖼️</div>
                <div className="flex-1 text-left">
                  <p className="font-bold">사진/이미지</p>
                  <p className="text-xs text-gray-500">갤러리에서 선택</p>
                </div>
                <span className="text-gray-400">›</span>
              </button>
            </div>
            
            {/* 숨겨진 파일 입력 */}
            <input 
              ref={cameraInputRef}
              type="file" 
              accept="image/*" 
              capture="environment"
              onChange={(e) => handleFileSelect(e, 'camera')}
              className="hidden" 
            />
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*"
              onChange={(e) => handleFileSelect(e, 'gallery')}
              className="hidden" 
            />
          </div>
        </div>
      )}

      {/* 🆕 v2: 영수증 분석 결과 모달 */}
      {showReceiptResultModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">🧾 영수증 분석 결과</h3>
              <button onClick={() => { setShowReceiptResultModal(false); setOcrResult(null); }} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">✕</button>
            </div>
            
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <p className="text-lg font-bold text-gray-700">🔍 영수증 분석 중...</p>
                <p className="text-sm text-gray-500 mt-2">잠시만 기다려주세요</p>
              </div>
            ) : ocrResult ? (
              <div className="space-y-4">
                {/* 분석 완료 배지 */}
                <div className="bg-green-100 border border-green-400 rounded-xl p-3 flex items-center gap-2">
                  <span className="text-2xl">✅</span>
                  <div>
                    <p className="font-bold text-green-800">OCR 분석 완료!</p>
                    <p className="text-xs text-green-600">아래 내용이 자동으로 입력되었습니다</p>
                  </div>
                </div>
                
                {/* 내용 (상호명) */}
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">내용 (상호명)</label>
                  <input 
                    type="text" 
                    value={ocrResult.storeName}
                    onChange={(e) => setOcrResult({ ...ocrResult, storeName: e.target.value })}
                    className="w-full border-2 border-green-400 bg-green-50 rounded-xl px-4 py-3 font-medium"
                  />
                  <p className="text-xs text-green-600 mt-1">✨ OCR 자동 인식 (수정 가능)</p>
                </div>
                
                {/* 금액 */}
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">금액</label>
                  <input 
                    type="number" 
                    value={ocrResult.amount}
                    onChange={(e) => setOcrResult({ ...ocrResult, amount: parseInt(e.target.value) || 0 })}
                    className="w-full border-2 border-green-400 bg-green-50 rounded-xl px-4 py-3 font-bold text-xl text-right"
                  />
                  <p className="text-xs text-green-600 mt-1">✨ OCR 자동 인식 (수정 가능)</p>
                </div>
                
                {/* 카테고리 */}
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">카테고리</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { name: '식비', emoji: '🍱' },
                      { name: '편의점', emoji: '🛒' },
                      { name: '카페', emoji: '☕' },
                      { name: '교통', emoji: '🚇' },
                      { name: '쇼핑', emoji: '🛍️' },
                      { name: '기타', emoji: '📦' },
                    ].map((cat) => (
                      <button 
                        key={cat.name}
                        onClick={() => setOcrResult({ ...ocrResult, category: cat.name, categoryEmoji: cat.emoji })}
                        className={`p-2 rounded-lg text-center text-sm transition-all ${ocrResult.category === cat.name ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                      >
                        {cat.emoji} {cat.name}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-green-600 mt-1">✨ "{ocrResult.storeName}" → {ocrResult.category} 자동 분류</p>
                </div>
                
                {/* 지출 유형 */}
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">지출 유형</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => setSelectedExpenseType('variable')}
                      className={`p-3 rounded-xl text-center font-medium transition-all ${selectedExpenseType === 'variable' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                    >
                      📊 변동지출
                    </button>
                    <button 
                      onClick={() => setSelectedExpenseType('fixed')}
                      className={`p-3 rounded-xl text-center font-medium transition-all ${selectedExpenseType === 'fixed' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                    >
                      📌 고정지출
                    </button>
                    <button 
                      onClick={() => setSelectedExpenseType('emotion')}
                      className={`p-3 rounded-xl text-center font-medium transition-all ${selectedExpenseType === 'emotion' ? 'bg-pink-500 text-white' : 'bg-gray-100'}`}
                    >
                      💜 감정지출
                    </button>
                  </div>
                </div>
                
                {/* 저장 버튼 */}
                <button 
                  onClick={handleSaveExpense}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity mt-4"
                >
                  저장하기
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease;
        }
      `}</style>
    </>
  );
}

export default AIConversation;
