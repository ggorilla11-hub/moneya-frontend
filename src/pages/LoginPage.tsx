import { signInWithPopup, GoogleAuthProvider, OAuthProvider, browserPopupRedirectResolver } from 'firebase/auth';
import { auth } from '../config/firebase';

// AI머니야 로고 URL (Firebase Storage)
const LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/AI%EB%A8%B8%EB%8B%88%EC%95%BC%20%ED%99%95%EC%A0%95%EC%9D%B4%EB%AF%B8%EC%A7%80%EC%95%88.png?alt=media&token=c250863d-7cda-424a-800d-884b20e30b1a";

interface LoginPageProps {
  onLogin: () => void;
}

function LoginPage({ onLogin }: LoginPageProps) {
  // 인앱브라우저 감지 (카카오톡, 네이버, 인스타그램 등)
  const isInAppBrowser = () => {
    const ua = navigator.userAgent || navigator.vendor;
    return /KAKAOTALK|NAVER|LINE|Instagram|FBAN|FBAV/i.test(ua);
  };

  // iOS 감지
  const isIOS = () => {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
  };

  const handleGoogleLogin = async () => {
    if (isInAppBrowser()) {
      const currentUrl = window.location.href;
      if (isIOS()) {
        window.location.href = currentUrl;
        setTimeout(() => {
          alert('Safari에서 열어주세요.\n\n우측 하단 ··· 메뉴 → Safari로 열기');
        }, 100);
        return;
      }
      const externalUrl = `intent://${currentUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;
      window.location.href = externalUrl;
      return;
    }

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      await signInWithPopup(auth, provider, browserPopupRedirectResolver);
      onLogin();
    } catch (error: any) {
      console.error('Google 로그인 에러:', error);
      if (error.code === 'auth/popup-blocked') {
        alert('팝업이 차단되었습니다. 팝업을 허용한 후 다시 시도해주세요.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        console.log('로그인 팝업이 닫혔습니다.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        console.log('로그인 취소됨');
      } else {
        alert('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    }
  };

  const handleAppleLogin = async () => {
    const provider = new OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');
    provider.setCustomParameters({ locale: 'ko' });

    try {
      await signInWithPopup(auth, provider, browserPopupRedirectResolver);
      onLogin();
    } catch (error: any) {
      console.error('Apple 로그인 에러:', error);
      if (error.code === 'auth/popup-blocked') {
        alert('팝업이 차단되었습니다. 팝업을 허용한 후 다시 시도해주세요.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        console.log('로그인 팝업이 닫혔습니다.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        console.log('로그인 취소됨');
      } else {
        alert('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-green-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        
        <div className="text-center mb-10">
          <img 
            src={LOGO_URL}
            alt="AI머니야 로고"
            className="w-20 h-20 mx-auto mb-4 shadow-lg"
          />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">AI머니야</h1>
          <p className="text-gray-500">AI 금융집사와 함께하는 똑똑한 돈관리</p>
        </div>

        <div className="space-y-3">
          {/* Apple 로그인 버튼 */}
          <button
            onClick={handleAppleLogin}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-black text-white rounded-2xl hover:bg-gray-900 transition-all shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            <span className="font-semibold">Apple로 계속하기</span>
          </button>

          {/* Google 로그인 버튼 */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-white border-2 border-gray-200 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-semibold text-gray-700">Google로 계속하기</span>
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          로그인 시 <span className="underline">이용약관</span> 및 <span className="underline">개인정보처리방침</span>에 동의합니다
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
