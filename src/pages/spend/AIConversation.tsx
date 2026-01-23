import { useState, useRef, useEffect } from 'react';
import type { AdjustedBudget } from '../BudgetAdjustPage';

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
        const startMessage = { 
          type: 'start_app',
          userName: displayName,
          financialContext,
          budgetInfo: { remainingBudget, dailyBudget, todaySpent }
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
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          userName: displayName,
          financialContext,
          budgetInfo: { remainingBudget, dailyBudget, todaySpent },
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

  useEffect(() => {
    const greetingText = `안녕하세요, ${displayName}님! 머니야예요. 무엇을 도와드릴까요?`;
    setMessages([{ id: '1', type: 'ai', text: greetingText, timestamp: new Date() }]);
    return () => { cleanupVoiceMode(); };
  }, []);

  // 스크롤을 맨 아래로 이동하는 함수
  const scrollToBottom = () => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  };

  // 메시지 변경 시 스크롤
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

      {/* 채팅 영역 - 고정 높이, 내부 스크롤 */}
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

      {/* 입력 영역 - 하단 네비게이션 위에 완전 고정 */}
      <div className="fixed bottom-24 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 z-50">
        <div className="flex items-center gap-2 max-w-md mx-auto">
          <button onClick={onPlusClick} className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center">
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

      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
    </>
  );
}

export default AIConversation;
