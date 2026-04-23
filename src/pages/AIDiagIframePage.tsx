// AI 재무진단 iframe 페이지
// financial-house-building 앱을 본체에 임베드
// v1.0 (2026-04-23) - Phase D 합체 작업

import { useEffect, useState } from 'react';

interface User {
  uid?: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}

interface AIDiagIframePageProps {
  user: User;
}

// ⚠️ 배포 URL — 대표님 확인 후 필요시 변경
const AI_DIAG_BASE_URL = 'https://financial-house-building-dev.vercel.app';

function AIDiagIframePage({ user }: AIDiagIframePageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // iframe URL 구성 (사용자 정보 전달)
  const iframeUrl = (() => {
    const params = new URLSearchParams({
      embed: '1',
      uid: user.uid || '',
      email: user.email || '',
      name: user.displayName || '',
    });
    return `${AI_DIAG_BASE_URL}/?${params.toString()}`;
  })();

  // iframe 로드 타임아웃 (10초)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.warn('[AIDiagIframe] 로드 타임아웃');
      }
    }, 10000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  return (
    <div className="fixed inset-0 bg-gray-50" style={{ top: 0, bottom: 64 }}>
      {/* 로딩 인디케이터 */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
          <p className="text-sm text-gray-600">AI 재무진단 준비 중...</p>
        </div>
      )}

      {/* 에러 상태 */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 px-8">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-sm text-gray-800 font-bold mb-2">
            AI 재무진단을 불러올 수 없습니다
          </p>
          <p className="text-xs text-gray-500 text-center mb-4">
            네트워크 연결을 확인하시거나 잠시 후 다시 시도해 주세요.
          </p>
          <button
            onClick={() => {
              setHasError(false);
              setIsLoading(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* iframe */}
      <iframe
        src={iframeUrl}
        title="AI 재무진단"
        className="w-full h-full border-0"
        allow="microphone; camera; autoplay; clipboard-write"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </div>
  );
}

export default AIDiagIframePage;
