// 이달의 활동 피드 (시뮬레이터 화면 7 하단 영역)
// 신규 고객 / 진단 완료 / 연결 요청 타임라인
// v1.0 (2026-04-23)

export type ActivityType = 'new_customer' | 'diagnosis' | 'hot_lead' | 'link_shared';

export interface Activity {
  id: string;
  type: ActivityType;
  customerName?: string;
  timestamp: number;
  extra?: string;  // 예: 진단 점수, 공유 채널
}

interface ActivityFeedProps {
  activities: Activity[];
  maxItems?: number;
}

// 타입별 스타일
const ACTIVITY_CONFIG: Record<ActivityType, {
  icon: string;
  bg: string;
  text: string;
  label: string;
}> = {
  new_customer: {
    icon: '👤',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    label: '신규 고객 가입',
  },
  diagnosis: {
    icon: '✅',
    bg: 'bg-green-50',
    text: 'text-green-700',
    label: '재무진단 완료',
  },
  hot_lead: {
    icon: '🔥',
    bg: 'bg-red-50',
    text: 'text-red-700',
    label: '상담 요청 (핫 리드)',
  },
  link_shared: {
    icon: '🔗',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    label: '링크 공유',
  },
};

// 상대 시간 포맷 (예: "5분 전", "2시간 전")
function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '방금';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function ActivityFeed({ activities, maxItems = 10 }: ActivityFeedProps) {
  const displayActivities = activities.slice(0, maxItems);

  return (
    <div className="mx-4 mt-4 bg-white border border-gray-200 rounded-2xl overflow-hidden">
      {/* 헤더 */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">📊 이달의 활동</h3>
          <span className="text-xs text-gray-500">{activities.length}건</span>
        </div>
      </div>

      {/* 빈 상태 */}
      {displayActivities.length === 0 && (
        <div className="py-12 text-center">
          <div className="text-3xl mb-2">📭</div>
          <p className="text-sm text-gray-500">아직 활동 내역이 없습니다</p>
          <p className="text-xs text-gray-400 mt-1">
            추천 링크를 공유해 보세요!
          </p>
        </div>
      )}

      {/* 활동 리스트 */}
      {displayActivities.length > 0 && (
        <div className="divide-y divide-gray-100">
          {displayActivities.map((activity) => {
            const config = ACTIVITY_CONFIG[activity.type];
            return (
              <div key={activity.id} className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                {/* 아이콘 */}
                <div className={`w-9 h-9 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0 text-base`}>
                  {config.icon}
                </div>

                {/* 내용 */}
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-bold ${config.text}`}>
                    {config.label}
                  </div>
                  <div className="text-sm text-gray-900 truncate">
                    {activity.customerName || '알 수 없음'}
                    {activity.extra && (
                      <span className="text-xs text-gray-500 ml-1">
                        · {activity.extra}
                      </span>
                    )}
                  </div>
                </div>

                {/* 시간 */}
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {formatRelativeTime(activity.timestamp)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* 더 보기 (10개 이상 시) */}
      {activities.length > maxItems && (
        <div className="px-4 py-3 border-t border-gray-100 text-center">
          <button className="text-sm font-bold text-purple-600 hover:text-purple-800">
            전체 {activities.length}건 보기 →
          </button>
        </div>
      )}
    </div>
  );
}

export default ActivityFeed;
