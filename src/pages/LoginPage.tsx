import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../config/firebase';

interface LoginPageProps {
  onLogin: () => void;
}

function LoginPage({ onLogin }: LoginPageProps) {
  const isInAppBrowser = () => {
    const ua = navigator.userAgent || navigator.vendor;
    return /KAKAOTALK|NAVER|LINE|Instagram|FBAN|FBAV/i.test(ua);
  };

  const handleGoogleLogin = async () => {
    if (isInAppBrowser()) {
      const currentUrl = window.location.href;
      const externalUrl = `intent://${currentUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;
      
      if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        window.location.href = currentUrl;
        setTimeout(() => {
          alert('Safari에서 열어주세요.\n\n우측 하단 ··· 메뉴 → Safari로 열기');
        }, 100);
        return;
      }
      
      window.location.href = externalUrl;
      setTimeout(() => {
        window.location.href = currentUrl;
      }, 1000);
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      await signInWithPopup(auth, provider);
      onLogin();
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        return;
      }
      console.error('로그인 에러:', error);
      alert('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  if (isInAppBrowser()) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-green-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">M</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">외부 브라우저에서 열어주세요</h2>
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            카카오톡 내 브라우저에서는<br/>
            Google 로그인이 지원되지 않습니다.
          </p>
          
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
            <p className="text-amber-800 text-sm font-medium mb-2">📱 여는 방법</p>
            <p className="text-amber-700 text-xs leading-relaxed">
              <strong>아이폰:</strong> 우측 하단 ··· → Safari로 열기<br/>
              <strong>안드로이드:</strong> 우측 상단 ⋮ → 다른 브라우저로 열기
            </p>
          </div>

          <button
            onClick={() => {
              const url = window.location.href;
              if (navigator.clipboard) {
                navigator.clipboard.writeText(url);
                alert('링크가 복사되었습니다!\n\nSafari 또는 Chrome에서 붙여넣기 해주세요.');
              } else {
                prompt('아래 링크를 복사해서 Safari/Chrome에서 열어주세요:', url);
              }
            }}
            className="w-full py-3 bg-blue-500 text-white font-bold rounded-xl mb-3"
          >
            📋 링크 복사하기
          </button>
          
          <p className="text-gray-400 text-xs">
            복사 후 Safari 또는 Chrome에서 붙여넣기
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-green-50 flex flex-col items-center justify-center p-6">
      <div className="relative w-32 h-32 mb-8">
        <div className="absolute inset-0 bg-purple-500 rounded-full animate-pulse opacity-30"></div>
        <div className="absolute inset-4 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-xl">
          <span className="text-white text-5xl font-bold">M</span>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-gray-800 mb-2">AI머니야</h1>
      <p className="text-gray-600 text-center mb-8">
        당신의 AI 재무 파트너<br/>
        <span className="text-purple-600 font-semibold">10초 만에 지출 상담</span>
      </p>

      <div className="w-full max-w-sm space-y-4">
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 rounded-2xl py-4 px-6 shadow-md hover:shadow-lg hover:border-purple-300 transition-all"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="text-gray-700 font-semibold text-lg">Google로 시작하기</span>
        </button>
      </div>

      <p className="mt-8 text-gray-400 text-sm text-center">
        로그인하면 <span className="text-purple-500">이용약관</span> 및{' '}
        <span className="text-purple-500">개인정보처리방침</span>에<br/>
        동의하는 것으로 간주됩니다.
      </p>
    </div>
  );
}

export default LoginPage;