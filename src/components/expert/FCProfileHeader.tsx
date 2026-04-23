// FC 프로필 헤더 카드 (시뮬레이터 화면 7 상단)
// 이름 / 회사 / 플랜 배지 / D+N일 표시
// v1.0 (2026-04-23)

import type { FCProfile } from '../../types/expert';

interface FCProfileHeaderProps {
  profile: FCProfile;
}

// 플랜 tier 별 배지 스타일
const PLAN_BADGES: Record<string, { label: string; emoji: string; bg: string; text: string }> = {
  'expert-month':        { label: 'FC 브론즈', emoji: '🥉', bg: 'bg-amber-100',  text: 'text-amber-700' },
  'expert-year':         { label: 'FC 브론즈 (연)', emoji: '🥉', bg: 'bg-amber-100',  text: 'text-amber-700' },
  'expert-silver':       { label: 'FC 실버',   emoji: '🥈', bg: 'bg-purple-100', text: 'text-purple-700' },
  'expert-silver-year':  { label: 'FC 실버 (연)', emoji: '🥈', bg: 'bg-purple-100', text: 'text-purple-700' },
  'expert-gold':         { label: 'FC 골드',   emoji: '🥇', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  'expert-gold-year':    { label: 'FC 골드 (연)', emoji: '🥇', bg: 'bg-yellow-100', text: 'text-yellow-700' },
};

function FCProfileHeader({ profile }: FCProfileHeaderProps) {
  const badge = PLAN_BADGES[profile.plan] || { label: 'FC', emoji: '👔', bg: 'bg-gray-100', text: 'text-gray-700' };
  
  // D+N일 계산
  const daysSinceJoin = Math.floor((Date.now() - profile.created_at) / (1000 * 60 * 60 * 24));
  
  // 만료까지 남은 일
  const daysUntilExpire = Math.floor((profile.plan_expires - Date.now()) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysUntilExpire <= 30;

  return (
    <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white p-5 rounded-b-3xl shadow-lg">
      {/* FP 승격 배지 (상단 우측) */}
      {profile.is_fp && (
        <div className="flex justify-end mb-2">
          <div className="bg-yellow-400 text-purple-900 text-xs font-bold px-3 py-1 rounded-full">
            🏆 FP 승격
          </div>
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* 아바타 */}
        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-2xl flex-shrink-0">
          👔
        </div>

        {/* 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold truncate">{profile.fc_name}</h2>
            {/* 플랜 배지 */}
            <span className={`${badge.bg} ${badge.text} text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0`}>
              {badge.emoji} {badge.label}
            </span>
          </div>
          <p className="text-sm text-purple-100 truncate">{profile.company || '소속 미입력'}</p>
          <p className="text-xs text-purple-200 mt-1">
            AGT · {profile.agt_code}
          </p>
        </div>
      </div>

      {/* 가입 / 만료 정보 */}
      <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center text-xs">
        <span className="text-purple-200">
          가입 D+{daysSinceJoin}일
        </span>
        <span className={isExpiringSoon ? 'text-yellow-300 font-bold' : 'text-purple-200'}>
          만료까지 D-{daysUntilExpire}일
        </span>
      </div>
    </div>
  );
}

export default FCProfileHeader;
