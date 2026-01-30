// src/components/BottomNav.tsx
// v2.0: "마이페이지" → "더보기" 변경, 아이콘 변경

interface BottomNavProps {
  currentTab: 'home' | 'ai-spend' | 'financial-house' | 'mypage';
  onTabChange: (tab: 'home' | 'ai-spend' | 'financial-house' | 'mypage') => void;
}

function BottomNav({ currentTab, onTabChange }: BottomNavProps) {
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
    },
    {
      // ★★★ v2.0: 마이페이지 → 더보기 변경 ★★★
      id: 'mypage' as const,
      label: '더보기',
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 ${active ? 'text-sky-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/>
        </svg>
      ),
      activeColor: 'text-sky-600',
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
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
