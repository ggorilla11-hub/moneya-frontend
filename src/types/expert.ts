// FC (Financial Consultant) 전문가 플랜 타입 정의
// v1.0 (2026-04-23) - 시뮬레이터 기준

export type ExpertPlanId =
  | 'expert-month'
  | 'expert-year'
  | 'expert-silver'
  | 'expert-silver-year'
  | 'expert-gold'
  | 'expert-gold-year';

export type ExpertPlanTier = 'bronze' | 'silver' | 'gold';

export interface ExpertPlan {
  id: ExpertPlanId;
  tier: ExpertPlanTier;
  label: string;
  amount: number;          // 월 또는 연 금액
  type: 'month' | 'year';
  maxClients: number;
  features: string[];
}

export interface FCProfile {
  uid: string;
  fc_name: string;
  email: string;
  phone: string;
  company: string;
  plan: ExpertPlanId;
  agt_code: string;        // AGT_XXX
  plan_expires: number;    // Unix timestamp
  created_at: number;
  billing_key?: string;
  is_fp: boolean;          // FP 승격 여부
  stats: FCStats;
}

export interface FCStats {
  linksShared: number;
  clientsCompleted: number;
  connectRequests: number;
  hotLeads: number;        // 카톡 핫리드
}

export interface FCCustomer {
  uid: string;
  referrer_fc_uid: string; // 어느 FC 하위 고객인지
  name: string;
  joined_at: number;
  diagnosis_completed: boolean;
  diagnosis_score?: number;
  last_activity?: number;
  is_hot_lead: boolean;    // 상담 요청 여부
}

export interface TrojanLinkShare {
  type: 'copy' | 'kakao' | 'sms';
  url: string;
  shared_at: number;
}
