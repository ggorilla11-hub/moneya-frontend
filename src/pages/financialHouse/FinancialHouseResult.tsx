import { useNavigate } from 'react-router-dom';

const FinancialHouseResult = () => {
  const navigate = useNavigate();

  // 메타버스 기능 (개발 중)
  const handleMetaverse = () => {
    alert('메타버스 기능은 개발 중입니다.');
  };

  // 강의상담으로 이동
  const handleConsultation = () => {
    navigate('/mypage?tab=consultation');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-base font-bold text-gray-900">
          홍길동님의 금융집짓기®
        </h1>
        <div className="flex items-center gap-3">
          {/* 메타버스 버튼 */}
          <button
            onClick={handleMetaverse}
            className="flex flex-col items-center gap-0.5 active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-base">
              🏘️
            </div>
            <span className="text-[9px] text-gray-600 font-semibold">
              메타버스
            </span>
          </button>

          {/* 강의상담 버튼 */}
          <button
            onClick={handleConsultation}
            className="flex flex-col items-center gap-0.5 active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white text-lg">
              👤
            </div>
            <span className="text-[9px] text-gray-600 font-semibold">
              강의상담
            </span>
          </button>
        </div>
      </header>

      {/* 탭 네비게이션 */}
      <div className="bg-white border-b border-gray-200 px-3 py-2 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 min-w-max">
          {[
            { emoji: '🏖️', label: '은퇴' },
            { emoji: '💳', label: '부채' },
            { emoji: '💰', label: '저축' },
            { emoji: '📈', label: '투자' },
            { emoji: '💸', label: '세금' },
            { emoji: '🏠', label: '부동산' },
            { emoji: '🛡️', label: '보험' },
          ].map((tab, index) => (
            <div
              key={index}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold whitespace-nowrap"
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px]">
                ✓
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-44">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="aspect-square relative bg-gray-100 flex items-center justify-center">
            <p className="text-gray-400 text-sm">금융집 이미지 영역</p>
          </div>
        </div>

        {/* 저작권 정보 */}
        <div className="mt-4 text-center">
          <p className="text-[10px] text-gray-600 font-semibold mb-1">
            © 2017 오원트금융연구소 All rights reserved.
          </p>
          <p className="text-[10px] text-gray-400">
            특허 제10-2202486호 | 상표권 제41-0388261호
          </p>
        </div>
      </main>

      {/* 마이크 입력바 */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-20">
        <div className="flex items-center gap-2 max-w-screen-sm mx-auto">
          {/* + 버튼 */}
          <button
            onClick={() => alert('개발 중입니다')}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-white font-bold text-lg active:scale-95 transition-transform"
          >
            +
          </button>

          {/* 마이크 버튼 */}
          <button
            onClick={() => alert('개발 중입니다')}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-lg active:scale-95 transition-transform"
          >
            🎤
          </button>

          {/* 입력 필드 */}
          <input
            type="text"
            placeholder="지출 전에 물어보세요..."
            className="flex-1 px-4 py-2.5 rounded-full border border-gray-200 bg-gray-50 text-sm outline-none focus:border-teal-500 focus:bg-white transition-colors"
            readOnly
          />

          {/* 전송 버튼 */}
          <button
            onClick={() => alert('개발 중입니다')}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg active:scale-95 transition-transform"
          >
            ➤
          </button>
        </div>
      </div>

      {/* 하단 네비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="flex justify-around items-center py-2 pb-safe max-w-screen-sm mx-auto">
          {[
            { icon: '💬', label: 'AI대화', path: '/ai-spend' },
            { icon: '💰', label: '지출', path: '/home' },
            { icon: '🏠', label: '금융집짓기', path: '/financial-house/result', active: true },
            { icon: '👤', label: '마이페이지', path: '/mypage' },
          ].map((item, index) => (
            <button
              key={index}
              onClick={() => !item.active && navigate(item.path)}
              className="flex flex-col items-center gap-1 px-3 py-1 active:scale-95 transition-transform"
            >
              <span className="text-xl">{item.icon}</span>
              <span
                className={`text-[9px] font-semibold ${
                  item.active ? 'text-teal-500' : 'text-gray-500'
                }`}
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default FinancialHouseResult;
```

---

### **5단계: 커밋**

1. 페이지 아래로 스크롤
2. Commit message 입력:
```
   Phase 9-13 Step 1: 기본 레이아웃 구조 생성
