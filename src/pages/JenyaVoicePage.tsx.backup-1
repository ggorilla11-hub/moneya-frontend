// ════════════════════════════════════════════════════════════════
// 제니야 음성 페이지 (Phase 6)
// 오상열 대표님 전용 음성 비서 + 고객 총괄매니저
// 작성: 2026-04-30
// 위치: src/pages/JenyaVoicePage.tsx
//
// 머니야 음성(financial-house-building)과 완전히 분리된 독립 페이지
// 머니야 코드는 절대 건드리지 않음
//
// 검증된 Vapi 동적 import 패턴 사용 (financial-house-building 동일)
// ════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from 'react';

// ─── Vapi 환경변수 ────────────────────────────────────────────
const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY;
const VAPI_ASSISTANT_ID_JENNYA = import.meta.env.VITE_VAPI_ASSISTANT_ID_JENNYA;

// ─── 전역 타입 선언 (financial-house-building 패턴) ───────────
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

interface JenyaVoicePageProps {
  user: User;
  onBack?: () => void;
}

type CallStatus = 'idle' | 'connecting' | 'active' | 'ended' | 'error';

function JenyaVoicePage({ user, onBack }: JenyaVoicePageProps) {
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [transcript, setTranscript] = useState<Array<{ role: string; text: string }>>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [vapiReady, setVapiReady] = useState(false);
  const vapiRef = useRef<any>(null);

  // ─── 1. Vapi SDK 동적 로드 ────────────────────────────────
  useEffect(() => {
    if (window.VapiReady && window.VapiClass) {
      setVapiReady(true);
      console.log('[JenyaVoice] Vapi SDK 이미 로드됨');
      return;
    }

    console.log('[JenyaVoice] Vapi SDK 동적 import 시작');
    (async () => {
      try {
        const module = await import(
          /* @vite-ignore */
          'https://cdn.jsdelivr.net/npm/@vapi-ai/web@2.5.2/+esm'
        );
        window.VapiClass = module.default;
        window.VapiReady = true;
        setVapiReady(true);
        console.log('[JenyaVoice] Vapi SDK 로드 완료');
      } catch (error: any) {
        console.error('[JenyaVoice] Vapi SDK 로드 실패:', error);
        setErrorMessage('Vapi SDK를 로드할 수 없습니다.');
        setCallStatus('error');
      }
    })();
  }, []);

  // ─── 2. 환경변수 검증 ─────────────────────────────────────
  useEffect(() => {
    if (!VAPI_PUBLIC_KEY) {
      setErrorMessage('VITE_VAPI_PUBLIC_KEY 환경변수가 설정되지 않았습니다.');
      setCallStatus('error');
    }
    if (!VAPI_ASSISTANT_ID_JENNYA) {
      setErrorMessage('VITE_VAPI_ASSISTANT_ID_JENNYA 환경변수가 설정되지 않았습니다.');
      setCallStatus('error');
    }
  }, []);

  // ─── 3. 음성 시작 ──────────────────────────────────────────
  const handleStartCall = async () => {
    if (!vapiReady || !window.VapiClass) {
      setErrorMessage('Vapi SDK가 아직 준비되지 않았습니다.');
      return;
    }

    if (!VAPI_PUBLIC_KEY || !VAPI_ASSISTANT_ID_JENNYA) {
      setErrorMessage('환경변수가 설정되지 않았습니다.');
      return;
    }

    try {
      setCallStatus('connecting');
      setErrorMessage('');
      setTranscript([]);

      console.log('[JenyaVoice] Vapi 인스턴스 생성');
      const vapi = new window.VapiClass(VAPI_PUBLIC_KEY);
      vapiRef.current = vapi;

      // ─── 이벤트 리스너 등록 ────────────────────────────
      vapi.on('call-start', () => {
        console.log('[JenyaVoice] 통화 시작');
        setCallStatus('active');
      });

      vapi.on('call-end', () => {
        console.log('[JenyaVoice] 통화 종료');
        setCallStatus('ended');
      });

      vapi.on('speech-start', () => {
        console.log('[JenyaVoice] 제니야 발화 시작');
      });

      vapi.on('speech-end', () => {
        console.log('[JenyaVoice] 제니야 발화 종료');
      });

      vapi.on('message', (message: any) => {
        if (message.type === 'transcript' && message.transcriptType === 'final') {
          console.log(`[JenyaVoice] ${message.role}: ${message.transcript}`);
          setTranscript(prev => [
            ...prev,
            { role: message.role, text: message.transcript }
          ]);
        }
      });

      vapi.on('error', (error: any) => {
        console.error('[JenyaVoice] Vapi 에러:', error);
        setErrorMessage(error.message || '음성 통화 중 오류가 발생했습니다.');
        setCallStatus('error');
      });

      // ─── 음성 통화 시작 ────────────────────────────────
      console.log('[JenyaVoice] vapi.start 호출');
      await vapi.start(VAPI_ASSISTANT_ID_JENNYA);
      
    } catch (error: any) {
      console.error('[JenyaVoice] 통화 시작 실패:', error);
      setErrorMessage(error.message || '통화를 시작할 수 없습니다.');
      setCallStatus('error');
    }
  };

  // ─── 4. 음성 종료 ──────────────────────────────────────────
  const handleEndCall = () => {
    if (vapiRef.current) {
      try {
        console.log('[JenyaVoice] 통화 종료 요청');
        vapiRef.current.stop();
        vapiRef.current.removeAllListeners();
        vapiRef.current = null;
      } catch (error) {
        console.error('[JenyaVoice] 종료 중 오류:', error);
      }
    }
    setCallStatus('ended');
  };

  // ─── 5. 컴포넌트 언마운트 시 정리 ──────────────────────────
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

  // ─── 6. UI 렌더링 ──────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white" style={{ top: 0, bottom: 64 }}>
      
      {/* 상단 헤더 */}
      <div className="absolute top-0 left-0 right-0 px-6 py-4 flex items-center justify-between z-10">
        {onBack && (
          <button
            onClick={onBack}
            className="text-white/70 hover:text-white text-sm"
          >
            ← 뒤로
          </button>
        )}
        <h1 className="text-lg font-bold flex-1 text-center">제니야 음성 비서</h1>
        <div className="w-12"></div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 pt-16 pb-32">
        
        {/* 제니야 아바타 */}
        <div className={`
          w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 
          flex items-center justify-center shadow-2xl mb-8
          ${callStatus === 'active' ? 'animate-pulse' : ''}
        `}>
          <span className="text-5xl">🎙️</span>
        </div>

        {/* 상태 표시 */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">제니야</h2>
          <p className="text-sm text-blue-200">
            {callStatus === 'idle' && '대기 중 — 시작 버튼을 눌러주세요'}
            {callStatus === 'connecting' && '연결 중...'}
            {callStatus === 'active' && '🟢 대화 중 — 말씀하세요'}
            {callStatus === 'ended' && '통화 종료됨'}
            {callStatus === 'error' && '⚠️ 오류 발생'}
          </p>
        </div>

        {/* 에러 메시지 */}
        {errorMessage && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg px-4 py-3 mb-6 max-w-md">
            <p className="text-sm text-red-200">{errorMessage}</p>
          </div>
        )}

        {/* 대화 기록 (실시간 자막) */}
        {transcript.length > 0 && (
          <div className="bg-black/30 rounded-lg p-4 mb-6 max-w-md w-full max-h-48 overflow-y-auto">
            <p className="text-xs text-blue-300 mb-2">실시간 대화</p>
            {transcript.slice(-5).map((entry, idx) => (
              <div key={idx} className="mb-2 text-sm">
                <span className={entry.role === 'user' ? 'text-blue-300' : 'text-green-300'}>
                  {entry.role === 'user' ? '대표님: ' : '제니야: '}
                </span>
                <span className="text-white">{entry.text}</span>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* 하단 버튼 */}
      <div className="absolute bottom-20 left-0 right-0 px-6">
        {(callStatus === 'idle' || callStatus === 'ended' || callStatus === 'error') && (
          <button
            onClick={handleStartCall}
            disabled={!vapiReady}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-4 rounded-2xl shadow-lg transition-all"
          >
            {!vapiReady ? '준비 중...' : '🎙️ 제니야와 대화 시작'}
          </button>
        )}

        {callStatus === 'connecting' && (
          <button
            disabled
            className="w-full bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-lg opacity-70"
          >
            연결 중...
          </button>
        )}

        {callStatus === 'active' && (
          <button
            onClick={handleEndCall}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all"
          >
            ⏹ 통화 종료
          </button>
        )}
      </div>

      {/* 사용자 정보 (작게) */}
      <div className="absolute top-16 right-6 text-xs text-white/40">
        {user.displayName || user.email}
      </div>
    </div>
  );
}

export default JenyaVoicePage;
