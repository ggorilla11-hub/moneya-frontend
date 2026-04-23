// 고객 개별 카드 (시뮬레이터 화면 8 고객 리스트)
// 이름 / 가입일 / 진단 상태 / 핫리드 배지
// v1.0 (2026-04-23)

import type { FCCustomer } from '../../types/expert';

interface CustomerCardProps {
  customer: FCCustomer;
  onClick?: (customer: FCCustomer) => void;
}

// 진단 상태 뱃지
function getStatusBadge(customer: FCCustomer) {
  if (customer.is_hot_lead) {
    return {
      label: '🔥 상담 요청',
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-300',
      pulse: true,
    };
  }
  if (customer.diagnosis_completed) {
    return {
      label: '✅ 진단 완료',
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-200',
      pulse: false,
    };
  }
  return {
    label: '⏳ 진단 대기',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    border: 'border-gray-200',
    pulse: false,
  };
}

// 가입일 포맷
function formatJoinDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - timestamp) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '오늘 가입';
  if (diffDays === 1) return '어제 가입';
  if (diffDays < 7) return `${diffDays}일 전 가입`;

  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

// 마지막 활동 포맷
function formatLastActivity(timestamp?: number): string | null {
  if (!timestamp) return null;
  const diff = Date.now() - timestamp;
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (hours < 1) return '방금 활동';
  if (hours < 24) return `${hours}시간 전 활동`;
  if (days < 7) return `${days}일 전 활동`;
  return null;
}

function CustomerCard({ customer, onClick }: CustomerCardProps) {
  const status = getStatusBadge(customer);
  const joinDate = formatJoinDate(customer.joined_at);
  const lastActivity = formatLastActivity(customer.last_activity);

  // 진단 점수 색상
  const scoreColor = (() => {
    if (!customer.diagnosis_score) return 'text-gray-400';
    if (customer.diagnosis_score >= 80) return 'text-green-600';
    if (customer.diagnosis_score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  })();

  return (
    <button
      onClick={() => onClick?.(customer)}
      className={`w-full bg-white border ${status.border} rounded-xl p-4 text-left hover:shadow-md transition-all ${
        customer.is_hot_lead ? 'ring-2 ring-red-200' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {/* 아바타 */}
        <div className={`w-11 h-11 rounded-full ${
          customer.is_hot_lead ? 'bg-red-100' : 'bg-gray-100'
        } flex items-center justify-center text-lg flex-shrink-0`}>
          {customer.name.charAt(0)}
        </div>

        {/* 정보 */}
        <div className="flex-1 min-w-0">
          {/* 이름 + 상태 */}
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-bold text-gray-900 truncate">
              {customer.name}
            </h4>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.bg} ${status.text} flex-shrink-0 ${
              status.pulse ? 'animate-pulse' : ''
            }`}>
              {status.label}
            </span>
          </div>

          {/* 가입일 + 최근 활동 */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{joinDate}</span>
            {lastActivity && (
              <>
                <span>·</span>
                <span>{lastActivity}</span>
              </>
            )}
          </div>

          {/* 진단 점수 (완료 시) */}
          {customer.diagnosis_completed && customer.diagnosis_score !== undefined && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-gray-500">진단 점수</span>
              <span className={`text-sm font-bold ${scoreColor}`}>
                {customer.diagnosis_score}점
              </span>
              {customer.diagnosis_score >= 80 && (
                <span className="text-[10px] text-green-600 font-bold">우수</span>
              )}
              {customer.diagnosis_score >= 60 && customer.diagnosis_score < 80 && (
                <span className="text-[10px] text-yellow-600 font-bold">보통</span>
              )}
              {customer.diagnosis_score < 60 && (
                <span className="text-[10px] text-red-600 font-bold">주의</span>
              )}
            </div>
          )}
        </div>

        {/* 화살표 */}
        <span className="text-gray-300 flex-shrink-0">›</span>
      </div>

      {/* 핫 리드인 경우 CTA 표시 */}
      {customer.is_hot_lead && (
        <div className="mt-3 pt-3 border-t border-red-100 text-xs text-red-700 font-bold">
          📞 고객이 상담을 요청했습니다. 빠른 연락이 필요합니다.
        </div>
      )}
    </button>
  );
}

export default CustomerCard;
