import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

interface LoginPageProps {
  onLogin: () => void;
}

function LoginPage({ onLogin }: LoginPageProps) {
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      onLogin();
    } catch (error: any) {
      // 팝업 차단된 경우 안내
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
        alert('팝업이 차단되었습니다. 팝업을 허용해주세요.');
      } else if (error.code === 'auth/unauthorized-domain') {
        alert('승인되지 않은 도메인입니다.');
      } else {
        console.error('로그인 에러:', error);
        alert('로그인에 실패했습니다. Chrome 브라우저에서 직접 접속해주세요.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-green-50 to-amber-50 flex flex-col items-center justify-center p-6">
      {/* 로고 */}
      <div className="relative w-28 h-28 mb-8">
        <div className="absolute inset-0 bg-purple-500 rounded-full animate-pulse opacity-30"></div>
        <div className="absolute inset-2 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-xl">
          <span className="text-white text-5xl font-bold">M</span>
        </div>
      </div>

      {/* 타이틀 */}
      <h1 className="text-3xl font-bold text-gray-800 mb-2">AI머니야</h1>
      <p className="text-gray-600 text-center mb-2">
        <span className="text-purple-600 font-semibold">AI 금융코치</span>와 함께
      </p>
      <p className="text-gray-600 text-center mb-8">
        똑똑한 소비습관을 만들어요
      </p>

      {/* 슬로건 */}
      <div className="bg-white/70 rounded-xl px-6 py-3 mb-10 shadow-sm">
        <p className="text-gray-700 text-sm font-medium">
          💡 "지출 전후에 AI에게 물어보세요"
        </p>
      </div>

      {/* 로그인 버튼들 */}
      <div className="w-full max-w-sm space-y-3">
        {/* Google 로그인 */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-xl py-4 px-6 shadow-sm hover:shadow-md transition-all"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="text-gray-700 font-medium">Google로 시작하기</span>
        </button>

        {/* 카카오 로그인 (추후 구현) */}
        <button
          disabled
          className="w-full flex items-center justify-center gap-3 bg-yellow-300 rounded-xl py-4 px-6 opacity-50 cursor-not-allowed"
        >
          <span className="text-gray-800 font-medium">카카오로 시작하기 (준비중)</span>
        </button>
      </div>

      {/* 안내 메시지 */}
      <p className="text-xs text-purple-600 mt-6 text-center font-medium">
        📱 카카오톡에서 여셨나요?<br />
        Chrome 브라우저에서 직접 접속해주세요!
      </p>

      {/* 이용약관 */}
      <p className="text-xs text-gray-400 mt-4 text-center">
        로그인 시 <span className="underline">이용약관</span> 및 <span className="underline">개인정보처리방침</span>에<br />
        동의하는 것으로 간주합니다.
      </p>

      {/* 하단 브랜드 */}
      <p className="text-xs text-gray-400 mt-6">
        오원트금융연구소 | 오상열 CFP
      </p>
    </div>
  );
}

export default LoginPage;