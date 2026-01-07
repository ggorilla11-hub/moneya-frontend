import { useState, useRef, useEffect } from 'react';
import type { AdjustedBudget } from './BudgetAdjustPage';

interface AISpendPageProps {
  userName: string;
  adjustedBudget: AdjustedBudget | null;
  onFAQMore: () => void;
}

interface Message {
  id: string;
  type: 'ai' | 'user';
  text: string;
  timestamp: Date;
}

interface SpendItem {
  id: string;
  name: string;
  amount: number;
  type: 'spent' | 'saved' | 'investment';
  category: string;
  time: string;
  tag?: string;
}

const API_URL = 'https://moneya-backend-x77a.onrender.com';

function AISpendPage({ userName, adjustedBudget, onFAQMore }: AISpendPageProps) {
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      text: `안녕하세요, ${userName.split('(')[0]}님! 👋\n\nAI머니야예요. 오늘 하루도 현명한 소비 함께해요!`,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isInputMethodOpen, setIsInputMethodOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const chatAreaRef = useRef<HTMLDivElement>(null);

  const [spendItems] = useState<SpendItem[]>([
    { id: '1', name: '적금 자동이체', amount: 500000, type: 'investment', category: '저축투자', time: '09:00', tag: '실제저축' },
    { id: '2', name: '커피 참음!', amount: 15000, type: 'saved', category: '충동', time: '14:30', tag: 'AI 조언 후 취소' },
    { id: '3', name: '점심 김밥천국', amount: 8000, type: 'spent', category: '필수', time: '12:30', tag: '바로 지출' },
  ]);

  const [connectedBanks, setConnectedBanks] = useState<string[]>(['KB국민은행']);

  const dailyBudget = adjustedBudget ? Math.round(adjustedBudget.livingExpense / 30) : 66667;
  const todaySpent = spendItems.filter(item => item.type === 'spent').reduce((sum, item) => sum + item.amount, 0);
  const todaySaved = spendItems.filter(item => item.type === 'saved').reduce((sum, item) => sum + item.amount, 0);
  const todayInvestment = spendItems.filter(item => item.type === 'investment').reduce((sum, item) => sum + item.amount, 0);
  const remainingBudget = dailyBudget - todaySpent;
  const usagePercent = Math.round((todaySpent / dailyBudget) * 100);

  const faqChips = [
    { emoji: '💰', text: '오늘 얼마 쓸 수 있어?' },
    { emoji: '🍽️', text: '점심 예산은?' },
    { emoji: '📊', text: '이번 주 현황' },
  ];

  const banks = [
    { id: 'kb', name: 'KB국민은행', logo: 'KB', color: 'bg-amber-500' },
    { id: 'shinhan', name: '신한은행', logo: '신한', color: 'bg-blue-600' },
    { id: 'woori', name: '우리은행', logo: '우리', color: 'bg-blue-500' },
    { id: 'hana', name: '하나은행', logo: '하나', color: 'bg-green-600' },
    { id: 'kakao', name: '카카오뱅크', logo: '카카오', color: 'bg-yellow-400' },
  ];

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputText;
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          budgetInfo: {
            remainingBudget,
            dailyBudget,
            todaySpent,
            livingExpense: adjustedBudget?.livingExpense || 2000000,
          },
        }),
      });

      const data = await response.json();

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: data.success ? data.message : '죄송해요, 잠시 문제가 생겼어요. 다시 말씀해주세요! 🙏',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('API 에러:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: '네트워크 연결을 확인해주세요! 🌐',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFAQClick = (text: string) => {
    handleSendMessage(text);
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      setTimeout(() => {
        const sampleTexts = [
          '오늘 점심 뭐 먹을까?',
          '커피 마셔도 돼?',
          '이번 주 예산 현황 알려줘',
        ];
        const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
        handleSendMessage(randomText);
        setIsListening(false);
      }, 2000);
    }
  };

  const handleBankConnect = (bankName: string) => {
    if (connectedBanks.includes(bankName)) {
      setConnectedBanks(prev => prev.filter(b => b !== bankName));
    } else {
      setConnectedBanks(prev => [...prev, bankName]);
    }
  };

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      
      <div className="mx-4 mt-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-4 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full"></div>
        
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
            </svg>
          </div>
          
          <div className="flex-1">
            <p className="text-white font-bold">안녕하세요, {userName.split('(')[0]}님! 👋</p>
            <div className="flex items-center gap-2">
              <span className="text-white/80 text-sm">오늘 남은 예산</span>
              <span className="text-white text-xl font-extrabold">₩{remainingBudget.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-3 bg-white/20 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all"
            style={{ width: `${100 - usagePercent}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1.5 text-xs text-white/70">
          <span>일예산 ₩{dailyBudget.toLocaleString()}</span>
          <span>지출 ₩{todaySpent.toLocaleString()} ({usagePercent}%)</span>
        </div>
      </div>

      <div className="mx-4 mt-3 bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div 
          className="p-3 flex items-center cursor-pointer hover:bg-gray-50"
          onClick={() => setIsTimelineExpanded(!isTimelineExpanded)}
        >
          <span className="font-bold text-gray-800 mr-2">오늘</span>
          <div className="flex gap-1.5 flex-1">
            <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md">
              지출 -₩{todaySpent.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
              참음 +₩{todaySaved.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
              저축 +₩{todayInvestment.toLocaleString()}
            </span>
          </div>
          <div className={`w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center transition-transform ${isTimelineExpanded ? 'rotate-180' : ''}`}>
            <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
            </svg>
          </div>
        </div>
        
        <div className={`border-t border-gray-100 overflow-hidden transition-all duration-300 ${isTimelineExpanded ? 'max-h-60' : 'max-h-0'}`}>
          <div className="p-3 space-y-2 max-h-52 overflow-y-auto">
            {spendItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  item.type === 'spent' ? 'bg-red-500' : 
                  item.type === 'saved' ? 'bg-green-500' : 'bg-blue-500'
                }`}></div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{item.time}</span>
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                      item.category === '충동' ? 'bg-amber-50 text-amber-600' :
                      item.category === '필수' ? 'bg-green-50 text-green-600' :
                      'bg-blue-50 text-blue-600'
                    }`}>{item.category}</span>
                    {item.tag && <span className="text-gray-300">• {item.tag}</span>}
                  </div>
                </div>
                <span className={`font-bold text-sm ${
                  item.type === 'spent' ? 'text-red-500' : 
                  item.type === 'saved' ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {item.type === 'spent' ? '-' : '+'}₩{item.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 mt-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-gray-400"># 자주 묻는 질문</span>
          <button onClick={onFAQMore} className="text-xs font-semibold text-blue-600">
            더보기 &gt;
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {faqChips.map((chip, index) => (
            <button
              key={index}
              onClick={() => handleFAQClick(chip.text)}
              className="flex-shrink-0 px-3 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all"
            >
              {chip.emoji} {chip.text}
            </button>
          ))}
        </div>
      </div>

      <div 
        ref={chatAreaRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-4 min-h-[200px] max-h-[400px]"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-2.5 max-w-[90%] ${
              message.type === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            {message.type === 'ai' && (
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
                </svg>
              </div>
            )}
            
            <div
              className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                message.type === 'ai'
                  ? 'bg-white border border-gray-100 text-gray-800'
                  : 'bg-blue-600 text-white'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-2.5 max-w-[90%]">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
              </svg>
            </div>
            <div className="px-4 py-3 rounded-2xl text-sm bg-white border border-gray-100 text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        {isListening && (
          <div className="flex gap-2.5 max-w-[90%] ml-auto flex-row-reverse">
            <div className="px-4 py-3 rounded-2xl text-sm bg-amber-100 text-amber-700 flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-amber-500 rounded-full animate-pulse"
                    style={{
                      height: `${12 + Math.random() * 8}px`,
                      animationDelay: `${i * 0.15}s`,
                    }}
                  ></div>
                ))}
              </div>
              <span>음성 인식중...</span>
            </div>
          </div>
        )}
        
        <div className="text-center text-xs text-gray-300">방금 전</div>
      </div>

      <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsInputMethodOpen(true)}
            className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50"
          >
            <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </button>
          
          <button
            onClick={handleVoiceToggle}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              isListening 
                ? 'bg-red-500 animate-pulse' 
                : 'bg-amber-400 hover:bg-amber-500'
            }`}
          >
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
            </svg>
          </button>
          
          <div className="flex-1 flex items-center bg-gray-100 border border-gray-200 rounded-full px-4 py-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isListening ? "음성 인식중..." : "지출전후에 물어보세요..."}
              className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
              disabled={isListening || isLoading}
            />
          </div>
          
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isListening || isLoading}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              inputText.trim() && !isListening && !isLoading
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-300'
            }`}
          >
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>

      {isInputMethodOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setIsInputMethodOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-white rounded-2xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">📝 지출 입력 방식</h2>
              <button 
                onClick={() => setIsInputMethodOpen(false)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
              >
                <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              <button className="w-full flex items-center gap-4 p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-gray-800">수동 입력</p>
                  <p className="text-sm text-gray-500">지출 또는 참음(가상저축)을 직접 입력해요</p>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                </svg>
              </button>
              
              <button 
                onClick={() => {
                  setIsInputMethodOpen(false);
                  setIsReceiptModalOpen(true);
                }}
                className="w-full flex items-center gap-4 p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl hover:border-amber-400 hover:bg-amber-50 transition-all"
              >
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 3L7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2h-3.17L15 3H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-gray-800">영수증 촬영 (OCR)</p>
                  <p className="text-sm text-gray-500">영수증 사진 찍으면 자동으로 인식해요</p>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                </svg>
              </button>
              
              <button 
                onClick={() => {
                  setIsInputMethodOpen(false);
                  setIsBankModalOpen(true);
                }}
                className="w-full flex items-center gap-4 p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl hover:border-purple-400 hover:bg-purple-50 transition-all"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 10h3v7H4zm6.5 0h3v7h-3zM2 19h20v3H2zm15-9h3v7h-3zm-5-9L2 6v2h20V6z"/>
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-gray-800">금융결제원 API 연동</p>
                  <p className="text-sm text-gray-500">계좌 연결하면 지출이 자동으로 기록돼요</p>
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-bold rounded-md">추천</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {isReceiptModalOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setIsReceiptModalOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-white rounded-2xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">📷 영수증 촬영</h2>
              <button 
                onClick={() => setIsReceiptModalOpen(false)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
              >
                <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            
            <div className="bg-gray-900 rounded-2xl p-6 mb-4">
              <div className="border-2 border-dashed border-gray-600 rounded-xl p-6 flex flex-col items-center justify-center">
                <svg className="w-10 h-10 text-gray-500 mb-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/>
                </svg>
                <p className="text-white font-semibold text-sm mb-1">영수증을 프레임 안에 맞춰주세요</p>
                <p className="text-blue-400 text-xs">자동으로 인식됩니다</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 rounded-xl text-gray-700 font-semibold hover:bg-gray-200 transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11-4l2.03 2.71L16 11l4 5H8l3-4zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z"/>
                </svg>
                앨범에서 선택
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 rounded-xl text-white font-semibold hover:bg-blue-700 transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 3L7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2h-3.17L15 3H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
                </svg>
                촬영하기
              </button>
            </div>
          </div>
        </div>
      )}

      {isBankModalOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setIsBankModalOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-white rounded-2xl p-5 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">🏦 계좌 연동</h2>
              <button 
                onClick={() => setIsBankModalOpen(false)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
              >
                <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              {banks.map((bank) => {
                const isConnected = connectedBanks.includes(bank.name);
                return (
                  <div 
                    key={bank.id}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                      isConnected 
                        ? 'border-green-400 bg-green-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className={`w-12 h-12 ${bank.color} rounded-xl flex items-center justify-center`}>
                      <span className="text-white font-bold text-xs">{bank.logo}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800 text-sm">{bank.name}</p>
                      <p className="text-xs text-gray-500">
                        {isConnected ? '***-****-1234 · 연결됨' : '계좌를 연결해주세요'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleBankConnect(bank.name)}
                      className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                        isConnected
                          ? 'bg-green-500 text-white'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isConnected ? '연결됨' : '연결'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default AISpendPage;