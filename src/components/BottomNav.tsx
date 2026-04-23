// src/components/BottomNav.tsx
// v4.0: 전문가(FC) 탭 추가 (6번째, 조건부 표시)
// ★★★ v4.0 변경: expert 탭 추가. FC 구독자만 표시 ★★★

interface BottomNavProps {
  currentTab: 'home' | 'ai-spend' | 'financial-house' | 'consultation' | 'expert' | 'mypage';
  onTabChange: (tab: 'home' | 'ai-spend' | 'financial-house' | 'consultation' | 'expert' | 'mypage') => void;
  showExpertTab?: boolean; // FC 구독자만 true
}

function BottomNav({ currentTab, onTabChange, showExpertTab = false }: BottomNavProps) {
  const tabs = [
    {
      id: 'home' as const,
      label: '홈',
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 ${active ? 'text-blue-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      ),
      activeColor: 'text-blue-600',
      visible: true,
    },
    {
      id: 'ai-spend' as const,
      label: 'AI지출',
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 ${active ? 'text-green-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
        </svg>
      ),
      activeColor: 'text-green-600',
      visible: true,
    },
    {
      id: 'financial-house' as const,
      label: '금융집짓기',
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 ${active ? 'text-purple-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 12h-2v3h-3v2h5v-5zM7 9h3V7H5v5h2V9zm14-6H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.99h18v14.02z"/>
        </svg>
      ),
      activeColor: 'text-purple-600',
      visible: true,
    },
    {
      id: 'consultation' as const,
      label: 'AI진단',
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 ${active ? 'text-red-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14h-4v-3h-3v-4h3V7h4v3h3v4h-3v3z"/>
        </svg>
      ),
      activeColor: 'text-red-600',
      visible: true,
    },
    {
      id: 'expert' as const,
      label: '전문가',
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 ${active ? 'text-indigo-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 6h2v2h-2V8zm0 4h2v6h-2v-6z"/>
        </svg>
      ),
      activeColor: 'text-indigo-600',
      visible: showExpertTab, // ⭐ FC 구독자만
    },
    {
      id: 'mypage' as const,
      label: '마이페이지',
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 ${active ? 'text-sky-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      ),
      activeColor: 'text-sky-600',
      visible: true,
    },
  ];

  const visibleTabs = tabs.filter(t => t.visible);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {visibleTabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
                isActive ? 'scale-105' : 'opacity-70'
              }`}
            >
              {tab.icon(isActive)}
              <span
                className={`text-xs mt-1 font-semibold ${
                  isActive ? tab.activeColor : 'text-gray-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
      <div className="h-6 bg-white" />
    </div>
  );
}

export default BottomNav;
