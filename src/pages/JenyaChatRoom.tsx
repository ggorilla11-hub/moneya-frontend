// ════════════════════════════════════════════════════════════════
// 제니야 대화방 (Phase 4 약식 통합)
// 대표님 전용 음성 + 텍스트 통합 대화 공간
// 작성: 2026-04-30
// 위치: src/pages/JenyaChatRoom.tsx
//
// Step 1: UI 시뮬레이터 (디자인만, 기능 0%)
// Step 2-3: 텍스트 + 음성 기능 추가 예정
// ════════════════════════════════════════════════════════════════

import { useState, useRef, useEffect } from 'react';

// ─── Vapi 환경변수 ────────────────────────────────────────────
const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY;
const VAPI_ASSISTANT_ID_JENNYA = import.meta.env.VITE_VAPI_ASSISTANT_ID_JENNYA;

// ─── 전역 타입 (financial-house-building 패턴) ────────────────
declare global {
  interface Window {
    VapiClass?: any;
    VapiReady?: boolean;
  }
}

interface User {
  uid?: string;
  email?: string | null;
  displayName?: string | null;
}

interface JenyaChatRoomProps {
  user: User;
  onBack?: () => void;
}

// ─── 메시지 타입 ──────────────────────────────────────────────
type MessageRole = 'user' | 'jenya' | 'system';
type MessageType = 'text' | 'voice' | 'tool_use' | 'tool_result';

interface ChatMessage {
  id: string;
  role: MessageRole;
  type: MessageType;
  content: string;
  timestamp: Date;
  metadata?: {
    tool_name?: string;
    duration_ms?: number;
  };
}

// ─── 빠른 명령 버튼 ───────────────────────────────────────────
const QUICK_COMMANDS = [
  { label: '어제 KPI', command: '어제 KPI 알려줘' },
  { label: '핫리드 확인', command: '지금 핫리드 있어?' },
  { label: '주간 분석', command: '이번주 어땠어?' },
  { label: '메모리 현황', command: '메모리 얼마나 쌓였어?' },
  { label: '회원 통계', command: '전체 회원 통계 보여줘' },
  { label: '시스템 상태', command: '시스템 상태 점검해줘' },
];

// ─── 데모용 초기 메시지 (시뮬레이터 검증) ─────────────────────
const DEMO_MESSAGES: ChatMessage[] = [
  {
    id: 'demo-1',
    role: 'jenya',
    type: 'text',
    content: '네 대표님, 제니야입니다. 오늘도 든든하게 옆에서 함께하겠습니다. 무엇을 도와드릴까요?',
    timestamp: new Date(),
  },
];

function JenyaChatRoom({ user, onBack }: JenyaChatRoomProps) {
  // ─── 상태 ──────────────────────────────────────────────────
  const [messages, setMessages] = useState<ChatMessage[]>(DEMO_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isJenyaTyping, setIsJenyaTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [voiceMode, setVoiceMode] = useState<'text' | 'voice'>('text');
  const [voiceCallStatus, setVoiceCallStatus] = useState<'idle' | 'active'>('idle');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const vapiRef = useRef<any>(null);
  const [vapiReady, setVapiReady] = useState(false);

  // ─── 자동 스크롤 ──────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isJenyaTyping]);

  // ─── Vapi SDK 동적 로드 ────────────────────────────────
  useEffect(() => {
    if (window.VapiReady && window.VapiClass) {
      setVapiReady(true);
      return;
    }
    (async () => {
      try {
        const vapiUrl: string = 'https://cdn.jsdelivr.net/npm/@vapi-ai/web@2.5.2/+esm';
        const module = await import(/* @vite-ignore */ vapiUrl);
        window.VapiClass = module.default;
        window.VapiReady = true;
        setVapiReady(true);
        console.log('[JenyaChatRoom] Vapi SDK 로드 완료');
      } catch (error: any) {
        console.error('[JenyaChatRoom] Vapi SDK 로드 실패:', error);
      }
    })();
  }, []);

  // ─── 컴포넌트 언마운트 시 Vapi 정리 ─────────────────────
  useEffect(() => {
    return () => {
      if (vapiRef.current) {
        try {
          vapiRef.current.stop();
          vapiRef.current.removeAllListeners();
          vapiRef.current = null;
        } catch (error) {
          // 정리 중 오류는 무시
        }
      }
    };
  }, []);

  // ─── 텍스트 메시지 보내기 (시뮬레이터 - 데모 응답) ─────────
  const handleSendText = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    // 사용자 메시지 추가
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      type: 'text',
      content: messageText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsJenyaTyping(true);

    // ━━━━ 실제 chat.ts API 호출 ━━━━
    try {
      const response = await fetch('/api/jennya/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-UID': user.uid || '',
        },
        body: JSON.stringify({
          message: messageText,
          conversationId: conversationId,
          useTools: true,
        }),
      });

      const data = await response.json();

      if (data.success && data.response) {
        // 대화 ID 저장 (이어서 대화)
        if (data.conversationId) {
          setConversationId(data.conversationId);
        }

        // 도구 호출 정보 (있으면 시스템 메시지로)
        if (data.metadata?.tool_calls && data.metadata.tool_calls.length > 0) {
          const toolNames = data.metadata.tool_calls.map((t: any) => t.tool).join(', ');
          const toolMsg: ChatMessage = {
            id: `sys-${Date.now()}`,
            role: 'system',
            type: 'tool_use',
            content: `🔧 도구 사용: ${toolNames}`,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, toolMsg]);
        }

        // 제니야 응답
        const jenyaMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'jenya',
          type: 'text',
          content: data.response,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, jenyaMsg]);
      } else {
        // 에러 응답
        const errorMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'jenya',
          type: 'text',
          content: `죄송합니다, 대표님. 응답을 받지 못했습니다. (${data.error || data.message || '알 수 없는 오류'})`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMsg]);
      }
    } catch (error: any) {
      console.error('[JenyaChatRoom] API 호출 실패:', error);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'jenya',
        type: 'text',
        content: `죄송합니다, 대표님. 통신 오류가 발생했습니다. (${error.message})`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsJenyaTyping(false);
    }
  };

  // ─── 빠른 명령 클릭 ───────────────────────────────────────
  const handleQuickCommand = (command: string) => {
    handleSendText(command);
  };

  // ─── 음성 모드 전환 ───────────────────────────────────────
  const handleToggleVoice = async () => {
    if (voiceMode === 'text') {
      // ━━━━ 음성 시작 ━━━━
      if (!vapiReady || !window.VapiClass) {
        const errorMsg: ChatMessage = {
          id: `sys-${Date.now()}`,
          role: 'system',
          type: 'text',
          content: '⚠️ Vapi SDK가 아직 준비되지 않았습니다. 잠시 후 다시 시도하세요.',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMsg]);
        return;
      }

      // ━━━━ 디버그: 실제 환경변수 값 표시 ━━━━
      const debugInfo = `[디버그] PUBLIC_KEY: ${VAPI_PUBLIC_KEY ? VAPI_PUBLIC_KEY.substring(0, 10) + '...' : 'undefined'} / JENYA_ID: ${VAPI_ASSISTANT_ID_JENNYA ? VAPI_ASSISTANT_ID_JENNYA.substring(0, 10) + '...' : 'undefined'}`;
      console.log('[JenyaChatRoom DEBUG]', debugInfo);
      
      if (!VAPI_PUBLIC_KEY || !VAPI_ASSISTANT_ID_JENNYA) {
        const errorMsg: ChatMessage = {
          id: `sys-${Date.now()}`,
          role: 'system',
          type: 'text',
          content: `⚠️ Vapi 환경변수가 설정되지 않았습니다. ${debugInfo}`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMsg]);
        return;
      }

      try {
        setVoiceMode('voice');
        setVoiceCallStatus('active');

        const systemMsg: ChatMessage = {
          id: `sys-${Date.now()}`,
          role: 'system',
          type: 'text',
          content: '🎙️ 음성 모드 연결 중...',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, systemMsg]);

        // 검증된 패턴 (financial-house-building 동일)
        const VapiConstructor = window.VapiClass.default || window.VapiClass;
        console.log('[JenyaChatRoom] VapiConstructor type:', typeof VapiConstructor);
        const vapi = new VapiConstructor(VAPI_PUBLIC_KEY);
        vapiRef.current = vapi;

        vapi.on('call-start', () => {
          console.log('[JenyaChatRoom] 음성 통화 시작');
          const startMsg: ChatMessage = {
            id: `sys-${Date.now()}`,
            role: 'system',
            type: 'text',
            content: '🟢 음성 대화 시작 — 말씀하세요',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, startMsg]);
        });

        vapi.on('call-end', () => {
          console.log('[JenyaChatRoom] 음성 통화 종료');
          setVoiceMode('text');
          setVoiceCallStatus('idle');
        });

        vapi.on('message', (message: any) => {
          if (message.type === 'transcript' && message.transcriptType === 'final') {
            const role = message.role === 'user' ? 'user' : 'jenya';
            const newMsg: ChatMessage = {
              id: `voice-${Date.now()}-${Math.random()}`,
              role: role,
              type: 'voice',
              content: message.transcript,
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, newMsg]);
          }
        });

        vapi.on('error', (error: any) => {
          console.error('[JenyaChatRoom] Vapi 에러:', error);
          const errorMsg: ChatMessage = {
            id: `sys-${Date.now()}`,
            role: 'system',
            type: 'text',
            content: `⚠️ 음성 오류: ${error.message || '알 수 없음'}`,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, errorMsg]);
          setVoiceMode('text');
          setVoiceCallStatus('idle');
        });

        await vapi.start(VAPI_ASSISTANT_ID_JENNYA);
      } catch (error: any) {
        console.error('[JenyaChatRoom] 음성 시작 실패:', error);
        const errorMsg: ChatMessage = {
          id: `sys-${Date.now()}`,
          role: 'system',
          type: 'text',
          content: `⚠️ 음성 시작 실패: ${error.message}`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMsg]);
        setVoiceMode('text');
        setVoiceCallStatus('idle');
      }
    } else {
      // ━━━━ 음성 종료 ━━━━
      if (vapiRef.current) {
        try {
          vapiRef.current.stop();
          vapiRef.current.removeAllListeners();
          vapiRef.current = null;
        } catch (error) {
          console.error('[JenyaChatRoom] 종료 중 오류:', error);
        }
      }
      setVoiceMode('text');
      setVoiceCallStatus('idle');
      const systemMsg: ChatMessage = {
        id: `sys-${Date.now()}`,
        role: 'system',
        type: 'text',
        content: '📝 텍스트 모드로 전환',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, systemMsg]);
    }
  };

  // ─── Enter 키로 전송 ──────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  // ─── 시간 포맷 ─────────────────────────────────────────────
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ════════════════════════════════════════════════════════════
  // UI 렌더링
  // ════════════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white flex flex-col" style={{ top: 0, bottom: 64 }}>
      
      {/* ━━━━ 상단 헤더 ━━━━ */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center gap-4 backdrop-blur-sm bg-black/20">
        {onBack && (
          <button
            onClick={onBack}
            className="text-white/70 hover:text-white text-sm transition-colors"
          >
            ←
          </button>
        )}
        
        {/* 제니야 아바타 */}
        <div className={`
          w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 
          flex items-center justify-center shadow-lg
          ${voiceCallStatus === 'active' ? 'ring-2 ring-green-400 animate-pulse' : ''}
        `}>
          <span className="text-xl">🎙️</span>
        </div>

        <div className="flex-1">
          <h1 className="font-bold">제니야</h1>
          <p className="text-xs text-blue-200">
            {voiceMode === 'voice' && voiceCallStatus === 'active' 
              ? '🟢 음성 대화 중' 
              : isJenyaTyping 
                ? '입력 중...' 
                : '온라인 - 대표님 전용'}
          </p>
        </div>

        {/* 모드 표시 */}
        <div className="text-xs px-2 py-1 rounded-full bg-white/10">
          {voiceMode === 'voice' ? '🎙️ 음성' : '📝 텍스트'}
        </div>
      </div>

      {/* ━━━━ 메시지 영역 ━━━━ */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === 'user' 
                ? 'justify-end' 
                : msg.role === 'system'
                  ? 'justify-center'
                  : 'justify-start'
            }`}
          >
            {/* 시스템 메시지 (중앙) */}
            {msg.role === 'system' && (
              <div className="text-xs text-white/50 bg-white/5 px-3 py-1 rounded-full">
                {msg.content}
              </div>
            )}

            {/* 사용자 또는 제니야 메시지 */}
            {msg.role !== 'system' && (
              <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                <div
                  className={`
                    px-4 py-3 rounded-2xl shadow-md
                    ${msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-sm' 
                      : 'bg-white/10 backdrop-blur-sm text-white rounded-bl-sm border border-white/10'}
                  `}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
                <p className={`text-xs text-white/40 mt-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            )}
          </div>
        ))}

        {/* 제니야 타이핑 인디케이터 */}
        {isJenyaTyping && (
          <div className="flex justify-start">
            <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-2xl rounded-bl-sm border border-white/10">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ━━━━ 빠른 명령 ━━━━ */}
      {voiceMode === 'text' && messages.length < 3 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-white/40 mb-2">빠른 명령</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {QUICK_COMMANDS.map((cmd) => (
              <button
                key={cmd.label}
                onClick={() => handleQuickCommand(cmd.command)}
                className="flex-shrink-0 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-full text-xs text-white/80 transition-colors border border-white/10"
              >
                {cmd.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ━━━━ 입력 영역 ━━━━ */}
      <div className="px-4 py-3 border-t border-white/10 backdrop-blur-sm bg-black/30">
        {voiceMode === 'text' ? (
          // ─── 텍스트 입력 ───
          <div className="flex items-end gap-2">
            <button
              onClick={handleToggleVoice}
              className="w-12 h-12 rounded-full bg-blue-600/20 hover:bg-blue-600/40 flex items-center justify-center transition-colors flex-shrink-0"
              title="음성 모드 시작"
            >
              <span className="text-xl">🎙️</span>
            </button>

            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="제니야에게 말씀하세요..."
              rows={1}
              className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 resize-none max-h-32"
              style={{ minHeight: '48px' }}
            />

            <button
              onClick={() => handleSendText()}
              disabled={!inputText.trim()}
              className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 flex items-center justify-center transition-colors flex-shrink-0"
              title="전송"
            >
              <span className="text-xl">↑</span>
            </button>
          </div>
        ) : (
          // ─── 음성 모드 ───
          <div className="flex items-center justify-center gap-4 py-2">
            <button
              onClick={handleToggleVoice}
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center shadow-lg transition-all"
              title="음성 종료"
            >
              <span className="text-2xl">⏹</span>
            </button>
            <div className="text-center">
              <p className="text-sm font-bold">음성 대화 중</p>
              <p className="text-xs text-white/60">말씀하세요</p>
            </div>
          </div>
        )}

        {/* 사용자 정보 */}
        <p className="text-center text-xs text-white/30 mt-2">
          {user.displayName || user.email || '대표님'} · 제니야 v1.0
        </p>
      </div>
    </div>
  );
}

export default JenyaChatRoom;
