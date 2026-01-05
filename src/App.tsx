import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import LoginPage from './pages/LoginPage';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white text-2xl font-bold">M</span>
          </div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-green-50 flex flex-col items-center justify-center p-4">
      {/* 로고 */}
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 bg-purple-500 rounded-full animate-pulse opacity-30"></div>
        <div className="absolute inset-2 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white text-4xl font-bold">M</span>
        </div>
      </div>

      {/* 환영 메시지 */}
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        안녕하세요, {user.displayName}님!
      </h1>
      <p className="text-gray-600 text-center mb-8">
        <span className="text-purple-600 font-semibold">AI머니야</span>에 오신 것을 환영합니다
      </p>

      {/* 사용자 정보 카드 */}
      <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-sm mb-6">
        <div className="flex items-center gap-4 mb-4">
          {user.photoURL && (
            <img 
              src={user.photoURL} 
              alt="프로필" 
              className="w-12 h-12 rounded-full"
            />
          )}
          <div>
            <p className="font-semibold text-gray-800">{user.displayName}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        <div className="border-t pt-4">
          <p className="text-center text-green-600 font-semibold">
            ✅ 로그인 성공!
          </p>
        </div>
      </div>

      {/* 로그아웃 버튼 */}
      <button
        onClick={() => auth.signOut()}
        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-8 rounded-xl transition-all"
      >
        로그아웃
      </button>
    </div>
  );
}

export default App;