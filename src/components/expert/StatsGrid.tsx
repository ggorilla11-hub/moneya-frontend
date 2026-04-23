// FC 통계 그리드 (시뮬레이터 화면 7 중간 영역)
// 고객 수 / 진단 완료 / 핫리드 3개 카드
// v1.0 (2026-04-23)

import type { FCStats } from '../../types/expert';

interface StatsGridProps {
  stats: FCStats;
  maxClients?: number;  // 플랜 한도 (예: 100, 500, 무제한)
}

interface StatCardProps {
  icon: string;
  value: number;
  total?: number;
  label: string;
  accent: 'blue' | 'green' | 'red' | 'purple';
  alertIfZero?: boolean;
}

const ACCENT_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
  green:  { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  red:    { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-300' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
};

function StatCard({ icon, value, total, label, accent, alertIfZero }: StatCardProps) {
  const style = ACCENT_STYLES[accent];
  const shouldPulse = alertIfZero && value > 0;

  return (
    <div className={`${style.bg} ${style.border} border rounded-xl p-3 text-center ${shouldPulse ? 'animate-pulse' : ''}`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className={`text-2xl font-bold ${style.text}`}>
        {value}
        {total !== undefined && (
          <span className="text-xs text-gray-500 ml-0.5">/{total === 9999 ? '∞' : total}</span>
        )}
      </div>
      <div className="text-xs text-gray-600 mt-0.5">{label}</div>
    </div>
  );
}

function StatsGrid({ stats, maxClients = 100 }: StatsGridProps) {
  return (
    <div className="px-4 mt-[-24px] relative z-10">
      <div className="grid grid-cols-3 gap-2">
        <StatCard
          icon="👥"
          value={stats.linksShared}
          total={maxClients}
          label="총 고객"
          accent="blue"
        />
        <StatCard
          icon="✅"
          value={stats.clientsCompleted}
          label="진단 완료"
          accent="green"
        />
        <StatCard
          icon="🔥"
          value={stats.hotLeads}
          label="핫 리드"
          accent="red"
          alertIfZero={true}
        />
      </div>
    </div>
  );
}

export default StatsGrid;
