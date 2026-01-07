import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { useEffect } from 'react';

interface LoginPageProps {
  onLogin: () => void;
}

function LoginPage({ onLogin }: LoginPageProps) {
  
  // 인앱 브라우저 감지 함수
  const isInAppBrowser = (): boolean => {
    const ua = navigator.userAgent || navigator.vendor;
    
    // 카카오톡, 네이버, 인스타그램, 페이스북 등 인앱 브라우저 감지
    if (/KAKAOTALK/i.test(ua)) return true;
    if (/NAVER/i.test(ua)) return true;
    if (/Instagram/i.test(ua)) return true;
    if (/FBAN|FBAV/i.test(ua)) return true;
    if (/Line/i.test(ua)) return true;
    
    return false;
  };

  // 외부 브라우저로 열기
  const openInExternalBrowser = () => {
    const currentUrl = window.location.href;
    
    // 안드로이드: intent 사용
    if (/android/i.test(navigator.userAgent)) {
      window.location.href = `intent://${currentUrl.replace(/https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;
      return;
    }
    
    // iOS: 사파리로 열기 시도
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      window.location.href = currentUrl;
      return;
    }
  };

  // 페이지 로드 시 인앱 브라우저 체크
  useEffect(() => {
    if (isInAppBrowser()) {
      openInExternalBrowser();
    }
  }, []);

  const handleGoogleLogin = async () => {
    // 인앱 브라우저인 경우 안내 메시지
    if (isInAppBrowser()) {
      alert('카카오톡/네이버 등의 앱 내 브라우저에서는 Google 로그인이 제한됩니다.\n\n우측 상단 메뉴(⋮)를 눌러 "다른 브라우저로 열기" 또는 "Chrome으로 열기"를 선택해주세요.');
      openInExternalBrowser();
      return;
    }

    try {
      await signInWithPopup(auth, googleProvider);
      onLogin();
    } catch (error: any) {
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
        alert('팝업이 차단되었습니다. 팝업을 허용해주세요.');
      } else if (error.code === 'auth/unauthorized-domain') {
        alert('승인되지 않은 도메인입니다.');
      } else if (error.code === 'auth/operation-not-supported-in-this-environment') {
        alert('이 브라우저에서는 Google 로그인이 지원되지 않습니다.\n\nChrome 또는 Safari 브라우저에서 직접 접속해주세요.');
      } else {
        console.error('로그인 에러:', error);
        alert('로그인에 실패했습니다.\n\nChrome 브라우저에서 직접 접속해주세요.\n\n주소: moneya-frontend.vercel.app');
      }
    }
  };

  // 인앱 브라우저인 경우 안내 화면 표시
  if (isInAppBrowser()) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-green-50 to-amber-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 shadow-xl max-w-sm w-full text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">외부 브라우저로 열어주세요</h2>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">
            카카오톡, 네이버 등의 앱 내 브라우저에서는<br />
            Google 로그인이 제한됩니다.
          </p>
          <div className="bg-amber-50 rounded-xl p-4 mb-6">
            <p className="text-amber-800 text-sm font-medium">
              📌 우측 상단 메뉴(⋮)를 눌러<br />
              <strong>"다른 브라우저로 열기"</strong> 또는<br />
              <strong>"Chrome으로 열기"</strong>를 선택해주세요
            </p>
          </div>
          <button
            onClick={openInExternalBrowser}
            className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl hover:bg-purple-700 transition-colors"
          >
            Chrome으로 열기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-green-50 to-amber-50 flex flex-col items-center justify-center p-6">
      
      {/* 로고 섹션 */}
      <div className="relative w-32 h-32 mb-8">
        {/* 글로우 효과 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-purple-400/30 rounded-full blur-xl animate-pulse"></div>
        
        {/* 회전하는 링 1 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 border-2 border-purple-400/40 rounded-full animate-spin" style={{ animationDuration: '8s' }}>
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-purple-400 rounded-full shadow-lg shadow-purple-400/50"></div>
        </div>
        
        {/* 회전하는 링 2 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-dashed border-purple-300/30 rounded-full animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }}></div>
        
        {/* 메인 원형 로고 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-xl shadow-purple-500/30">
          <span className="text-white text-4xl font-bold" style={{ fontFamily: 'Orbitron, sans-serif' }}>M</span>
        </div>
      </div>

      {/* 타이틀 */}
      <h1 className="text-3xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>AI머니야</h1>
      <p className="text-gray-600 text-center mb-2">
        <span className="text-purple-600 font-bold">AI 금융코치</span>와 함께
      </p>
      <p className="text-gray-600 text-center mb-10">
        똑똑한 소비습관을 만들어요
      </p>

      {/* 로그인 버튼 */}
      <div className="w-full max-w-sm">
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-2xl py-4 px-6 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="text-gray-700 font-semibold text-base">Google로 시작하기</span>
        </button>
      </div>

      {/* 이용약관 */}
      <p className="text-xs text-gray-400 mt-10 text-center leading-relaxed">
        로그인 시 <span className="text-purple-500 cursor-pointer">이용약관</span> 및 <span className="text-purple-500 cursor-pointer">개인정보처리방침</span>에<br />
        동의하는 것으로 간주합니다.
      </p>
    </div>
  );
}

export default LoginPage;