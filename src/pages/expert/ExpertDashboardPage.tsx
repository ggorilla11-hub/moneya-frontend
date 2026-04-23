// FC 대시보드 메인 페이지 (시뮬레이터 화면 7)
// FCProfileHeader + StatsGrid + TrojanLinkBox + ActivityFeed 조합
// v1.0 (2026-04-23) - 더미 데이터 버전

import { useState } from 'react';
import FCProfileHeader from '../../components/expert/FCProfileHeader';
import StatsGrid from '../../components/expert/StatsGrid';
import TrojanLinkBox from '../../components/expert/TrojanLinkBox';
import ActivityFeed from '../../components/expert/ActivityFeed';
import type { Activity } from '../../components/expert/ActivityFeed';
import type { FCProfile, FCCustomer } from '../../types/expert';

interface ExpertDashboardPageProps {
  onNavigateToCustomers?: () => void;
  onNavigateToSettings?: () => void;
  onLogout?: () => void;
}

// ═══════════════════════════════════════════════
// 더미 데이터 (Phase B에서 Firebase 실데이터로 대체)
// ═══════════════════════════════════════════════

const DUMMY_PROFILE: FCProfile = {
  uid: 'fc_dummy_001',
  fc_name: '오상열',
  email: 'ggorilla11@gmail.com',
  phone: '01054245332',
  company: '오원트금융연구소',
  plan: 'expert-silver',
  agt_code: 'AGT_OS847',
  plan_expires: Date.now() + (37 * 24 * 60 * 60 * 1000), // 37일 후
  created_at: Date.now() - (23 * 24 * 60 * 60 * 1000),   // 23일 전
  is_fp: false,
  stats: {
    linksShared: 47,
    clientsCompleted: 12,
    connectRequests: 5,
    hotLeads: 3,
  },
};

const DUMMY_ACTIVITIES: Activity[] = [
  {
    id: 'a1',
    type: 'hot_lead',
    customerName: '김철수',
    timestamp: Date.now() - (5 * 60 * 1000), // 5분 전
    extra: '진단 점수 72점',
  },
  {
    id: 'a2',
    type: 'diagnosis',
    customerName: '이영희',
    timestamp: Date.now() - (1 * 60 * 60 * 1000), // 1시간 전
    extra: '진단 점수 85점',
  },
  {
    id: 'a3',
    type: 'new_customer',
    customerName: '박민수',
    timestamp: Date.now() - (3 * 60 * 60 * 1000), // 3시간 전
  },
  {
    id: 'a4',
    type: 'diagnosis',
    customerName: '정수정',
    timestamp: Date.now() - (6 * 60 * 60 * 1000), // 6시간 전
    extra: '진단 점수 78점',
  },
  {
    id: 'a5',
    type: 'link_shared',
    timestamp: Date.now() - (1 * 24 * 60 * 60 * 1000), // 1일 전
    extra: '카톡 공유',
  },
  {
    id: 'a6',
    type: 'new_customer',
    customerName: '최용준',
    timestamp: Date.now() - (2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'a7',
    type: 'hot_lead',
    customerName: '강미영',
    timestamp: Date.now() - (3 * 24 * 60 * 60 * 1000),
    extra: '진단 점수 68점',
  },
  {
    id: 'a8',
    type: 'diagnosis',
    customerName: '윤도현',
    timestamp: Date.now() - (5 * 24 * 60 * 60 * 1000),
    extra: '진단 점수 91점',
  },
];

// 플랜별 최대 고객 수
const PLAN_MAX_CLIENTS: Record<string, number> = {
  'expert-month': 100,
  'expert-year': 100,
  'expert-silver': 500,
  'expert-silver-year': 500,
  'expert-gold': 9999,
  'expert-gold-year': 9999,
};

function ExpertDashboardPage({ onNavigateToCustomers, onLogout }: ExpertDashboardPageProps) {
  const [profile] = useState<FCProfile>(DUMMY_PROFILE);
  const [activities] = useState<Activity[]>(DUMMY_ACTIVITIES);

  const maxClients = PLAN_MAX_CLIENTS[profile.plan] || 100;

  const handleShare = (type: 'copy' | 'kakao' | 'sms') => {
    console.log(`[FC 대시보드] 링크 공유: ${type}`);
    // Phase B: Firebase에 공유 기록 저장
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 상단 바 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-bold text-gray-900">전문가 대시보드</h1>
          <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full font-bold">
            FC
          </span>
        </div>
        <button
          onClick={onLogout}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          로그아웃
        </button>
      </div>

      {/* FC 프로필 헤더 */}
      <FCProfileHeader profile={profile} />

      {/* 통계 그리드 (헤더와 살짝 겹침) */}
      <StatsGrid stats={profile.stats} maxClients={maxClients} />

      {/* 트로이목마 링크 박스 */}
      <TrojanLinkBox
        agtCode={profile.agt_code}
        fcName={profile.fc_name}
        onShare={handleShare}
      />

      {/* 이달의 활동 */}
      <ActivityFeed activities={activities} maxItems={10} />

      {/* 고객 리스트 진입 버튼 */}
      <div className="mx-4 mt-4">
        <button
          onClick={onNavigateToCustomers}
          className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-4 flex items-center justify-between hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-xl">
              👥
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-gray-900">고객 리스트 보기</div>
              <div className="text-xs text-gray-500">
                {profile.stats.linksShared}명의 고객 관리
              </div>
            </div>
          </div>
          <span className="text-gray-300 text-lg">›</span>
        </button>
      </div>

      {/* 하단 면책 */}
      <div className="mx-4 mt-6 mb-4 text-center">
        <p className="text-[10px] text-gray-400 leading-relaxed">
          AI 머니야는 재무 교육 서비스로, 개별 투자 권유나 금융 상품 판매를 하지 않습니다.<br />
          모든 판단은 고객의 책임입니다.
        </p>
      </div>
    </div>
  );
}

export default ExpertDashboardPage;
