# 제니야 운영 지식베이스 - operations.md v1.0

> AI머니야 일일 운영 매뉴얼
> 작성일: 2026-04-29
> 버전: v1.0
> 작성자: Claude (개발자) → 제니야 (인계)

---

## ⭐ 이 문서의 목적

제니야가 출장 중인 대표님 대신 사업을 운영할 수 있도록 모든 운영 흐름을 기록.

---

## 1️⃣ 일일 운영 사이클 (24시간)

### 시간대별 자동 작업

```
03:00 - 메모리 정리 (제니야 내부)
  - 어제 대화 압축
  - 중요도 낮은 메시지 폐기
  - Firestore 백업

06:00 - 콘텐츠 준비
  - 오늘의 영상 #N 활성화
  - 어제 답 공개 처리
  - 데일리 퀴즈 1개 발급

09:00 - 일일 알림 발송 ⭐
  - 카톡 알림톡 (전체 활성 구독자)
  - 내용: D-Day, 오늘 미션, 어제 답 공개

09:00 - 대표님 일일 KPI 보고
  - 어제 가입자 수
  - 어제 결제 건수 / 매출
  - 어제 핫리드 처리 현황
  - 특이사항

12:00 - 핫리드 미처리 체크
  - 3시간 이상 미응답 핫리드 발견
  - 담당 FP에게 재알림
  - 또는 CEO에게 에스컬레이션

15:00 - 영상 시청률 점검
  - 오늘 영상 시청 미달자 식별
  - 푸시 알림 (선택적)

18:00 - 결제 패턴 분석
  - 결제 실패 / 성공 비율
  - 이상치 감지

21:00 - 미접속자 알림 (선택)
  - 3일 이상 미접속 사용자
  - 스트릭 끊김 위험 알림

22:00 - 신규 가입 24시간 팔로업
  - 어제 가입자 중 미결제자
  - 친화적 안내 메시지

23:00 - 일일 데이터 집계
  - DAU / 결제 / 매출 / 신규 / 해지
  - Firestore 통계 저장

매주 일요일 23:00 - 주간 종합
매월 마지막날 23:00 - 월간 종합
```

---

## 2️⃣ 결제 흐름 (페이플 통합)

### 결제 종류별 흐름

#### 단일 결제 (Silver 9,900원)

```
1. 사용자 "Silver 결제" 버튼 클릭
   ↓
2. payple.js 동적 로드 (frontend)
   ↓
3. 결제 모달 표시 (페이플 UI)
   ↓
4. 사용자 카드 정보 입력
   ↓
5. 페이플 서버 결제 처리
   ↓
6. 페이플 → moneya-server webhook
   POST /api/payment/webhook
   {
     PCD_PAY_GOODS: "silver_subscription",
     PCD_PAY_TOTAL: 9900,
     PCD_PAYER_ID: "user_uid_123",
     PCD_AUTH_KEY: "...",
     PCD_PAY_OID: "20260429_001"
   }
   ↓
7. moneya-server 처리:
   - 결제 검증 (페이플 서버 재확인)
   - Firestore payments/ 컬렉션 기록
   - users/{uid} 권한 활성화 (silver_active: true)
   - subscription_end_date 30일 추가
   ↓
8. moneya-server → make.com webhook (자동화)
   - 결제 완료 카톡 발송
   - Google Sheets 기록
   - 영수증 이메일
   ↓
9. moneya-server → frontend 응답
   - 사용자에게 "결제 완료" 화면 표시
   - 즉시 음성 진단 활성화
```

#### 정기 결제 (구독 4,900원/월)

```
첫 결제 (빌링키 발급):
1. 사용자 "구독 시작" 클릭
   ↓
2. payple.js 빌링키 모드
   ↓
3. 카드 정보 입력 (1회만)
   ↓
4. 페이플 빌링키 발급
   ↓
5. moneya-server 저장:
   users/{uid}/billingKey: "..."
   subscription: {
     plan: "monthly_4900",
     status: "active",
     next_billing: "2026-05-29",
     started: "2026-04-29"
   }
   ↓
6. 첫 결제 즉시 실행

매월 자동 결제 (D-1 ~ D+0):
1. moneya-server 크론 (매일 자정)
   - subscriptions 컬렉션 조회
   - next_billing 도래한 사용자 추출
   ↓
2. 빌링키로 자동 결제 요청
   - 페이플 API 호출
   ↓
3. 결제 성공 시:
   - subscription_end 30일 연장
   - next_billing 30일 추가
   - 결제 영수증 카톡 발송
   ↓
4. 결제 실패 시:
   - 1차 재시도 (다음 날)
   - 2차 재시도 (3일 후)
   - 3차 실패 시 구독 중지
   - 사용자에게 알림
```

#### 환불 처리

```
환불 요청 (대표님 승인 필요 - HIGH 등급):
1. 고객 환불 요청 (이메일/카톡)
   ↓
2. 제니야 정보 확인:
   - 결제 내역
   - 사용 내역 (영상 시청, 진단 횟수)
   - 환불 가능 여부 (30일 이내)
   ↓
3. 대표님 승인 요청
   "다음 환불 요청 들어왔습니다.
    - 고객: [이름]
    - 플랜: Silver
    - 결제일: 2026-04-15
    - 환불 사유: [이유]
    - 사용량: 영상 5편 시청 / 음성 0분
    - 환불 가능 (30일 이내)
    승인하시겠습니까?"
   ↓
4. 대표님 "승인" → 환불 실행
   - 페이플 환불 API 호출
   - Firestore payments/{id}/refunded: true
   - 사용자 권한 비활성화
   - 환불 완료 카톡 발송
```

### 페이플 PLAN_MAP

```javascript
const PLAN_MAP = {
  // 일반 고객
  silver_subscription: {
    price: 9900,
    name: "Silver",
    duration_days: 30,
    features: ["voice_20min", "text_30days", "diagnosis"]
  },
  gold_subscription: {
    price: 99900,
    name: "Gold",
    duration_days: 90,
    features: ["voice_50min", "text_90days", "cfp_consultation"]
  },
  credit_charge: {
    price: 9900,
    name: "Credit",
    type: "one_time",
    features: ["voice_minutes_10"]
  },
  monthly_4900: {
    price: 4900,
    name: "월 구독",
    type: "recurring",
    duration_days: 30,
    features: ["daily_video", "daily_quiz", "moneya_chat"]
  },
  
  // FP 전용
  fp_bronze: {
    price: 33000,
    name: "FP Bronze",
    type: "recurring",
    duration_days: 30,
    features: ["customers_100", "trojan_link", "hot_lead_alert"]
  },
  fp_silver: {
    price: 99000,
    name: "FP Silver",
    type: "recurring",
    duration_days: 30,
    features: ["customers_500", "all_bronze", "priority_support"]
  }
};
```

---

## 3️⃣ 핫리드 라우팅 (가장 중요한 운영)

### 핫리드란?

```
정의: AI 진단 결과 즉시 전문가 상담 요청한 고객
가치: 실제 매출 직결 (Gold 99,900원 + 보험/투자 상담)
시급도: 분 단위 응답 (3시간 골든타임)
```

### 핫리드 발생 흐름

```
1. 사용자 AI 진단 완료
   ↓
2. 진단 결과 화면에서 "전문가 상담 신청" 클릭
   ↓
3. Firestore hot_leads/ 컬렉션 생성:
   {
     uid: "...",
     name: "김철수",
     phone: "010-1234-5678",
     email: "...",
     diagnosis_score: 72,
     desire_stage: "D",
     priority_concerns: ["보험", "부채"],
     created_at: "2026-04-29T14:30:00",
     status: "new",
     assigned_fp: null
   }
   ↓
4. 트리거 자동 라우팅:
   - 사용자가 트로이목마 링크로 가입했나? (referrer_fc_uid)
     YES → 해당 FP에게 알림 (FP 플랜)
     NO → CEO (대표님)에게 알림 (일반 플랜)
```

### FP 라우팅 (트로이목마 링크)

```
조건: users/{uid}/referrer_fc_uid 존재

흐름:
1. FP 정보 조회
   fp_members/{fc_uid}
   {
     name: "정민수",
     email: "fp@example.com",
     phone: "010-...",
     plan: "fp_bronze",
     active: true
   }

2. FP에게 즉시 알림
   - 카톡 알림톡: "신규 핫리드: 김철수님 (진단 점수 72)"
   - 이메일: 진단 리포트 PDF 첨부
   - 상세 정보: 우선 관심 영역 (보험, 부채)

3. FP가 6시간 내 응답:
   YES → 처리 완료, hot_leads/{id}/status: "responded"
   NO → CEO 에스컬레이션 (대표님 알림)

4. 24시간 내 미응답:
   - hot_leads/{id}/status: "escalated"
   - 다른 활성 FP에게 재배정
   - 또는 CEO 직접 처리
```

### CEO 라우팅 (일반 가입)

```
조건: referrer_fc_uid 없음

흐름:
1. CEO (대표님)에게 즉시 알림
   - 카톡 알림톡 (긴급)
   - 이메일 (진단 리포트)

2. 대표님이 직접 처리:
   - 직접 전화
   - 또는 FP 매칭 (수동 배정)
   - 또는 자동 응답 (시간 외)

3. 처리 결과 기록:
   hot_leads/{id}/handled_by: "ceo"
   hot_leads/{id}/handler_action: "direct_call"
   hot_leads/{id}/resolved_at: "..."
```

### 핫리드 SLA (Service Level Agreement)

```
응답 시간 목표:
- 1차 응답: 3시간 이내
- 통화 연결: 24시간 이내
- 상담 완료: 72시간 이내

미달 시 액션:
- 3시간 → 담당자 푸시 알림
- 6시간 → CEO 에스컬레이션
- 24시간 → 다른 FP 재배정
- 72시간 → 대표님 직접 개입
```

### 제니야의 핫리드 운영

```
제니야가 자동 수행:
1. hot_leads/ 새 문서 감지 (실시간)
2. 라우팅 결정 (FP vs CEO)
3. 알림 발송 (카톡 + 이메일)
4. SLA 모니터링 (3시간/6시간/24시간)
5. 미응답 시 에스컬레이션
6. 대표님께 일일 보고

대표님 승인 필요:
- 다른 FP로 재배정 (HIGH 등급)
- 직접 응대 결정
- 환불 처리 (불만 발생 시)
```

---

## 4️⃣ 자동화 시퀀스 (make.com)

### Webhook URL 목록

```
1. 강의 결제 (현재 운영 중) ⭐
   URL: https://hook.eu1.make.com/ap0haywvwzdanu3x0yp6ewvh76x3khuk
   트리거: 페이플 결제 완료 (강의)
   액션:
   - Google Sheets "강의신청" 시트에 행 추가
   - 카카오 알림톡 발송 (구매자)
   - 이메일 발송 (오상열 + 구매자)

2. 음성 진단 결제 (예정)
   URL: 별도 생성 필요
   트리거: 페이플 결제 완료 (Silver/Gold/Credit)
   액션:
   - Google Sheets "결제내역" 행 추가
   - 카톡 알림톡 (영수증)
   - 진단 활성화 알림

3. 핫리드 라우팅 (예정)
   URL: 별도 생성 필요
   트리거: hot_leads 새 문서
   액션:
   - referrer_fc_uid 조회
   - FP 또는 CEO 라우팅
   - 카톡 + 이메일 발송

4. 일일 리포트 (예정)
   URL: 매일 9시 크론
   트리거: 시간 기반
   액션:
   - Firestore 통계 조회
   - 카톡 발송 (대표님)

5. 신규 가입 환영 (예정)
   URL: 별도 생성 필요
   트리거: users 새 문서
   액션:
   - 환영 카톡
   - 24시간 후 팔로업 예약

6. 100일 수료증 (예정)
   URL: 별도 생성 필요
   트리거: 100일 출석 달성
   액션:
   - 수료증 자동 생성
   - 카톡 발송
   - SNS 공유 카드 생성
```

### make.com 시나리오 표준 구조

```
1. Webhook 수신 모듈
2. 데이터 검증 (Filter)
3. 분기 처리 (Router)
4. 외부 시스템 호출 (Sheets, Kakao, Email 등)
5. 응답 반환
6. 에러 핸들링

표준 에러 처리:
- 재시도 3회
- 실패 시 Slack 알림
- 데이터 손실 방지 (큐 저장)
```

---

## 5️⃣ Firebase Firestore 스키마

### 컬렉션 목록

```
users/                          (사용자 정보)
consultations/                  (상담 기록)
payments/                       (결제 내역)
subscriptions/                  (구독 관리)
hot_leads/                      (핫리드)
ai_diagnoses/                   (AI 진단 결과)
fp_members/                     (FP 회원)
content_videos/                 (영상 콘텐츠)
content_quizzes/                (퀴즈)
attendance_records/             (출석 기록)
desire_progress/                (DESIRE 진척)
manager_conversations/          (제니야 대화) ⭐ Phase 3
manager_memories/               (제니야 장기 기억) ⭐ Phase 3
admin_logs/                     (관리자 로그)
system_alerts/                  (시스템 알림)
```

### 핵심 컬렉션 상세

#### users/

```javascript
{
  uid: "ggorilla11_xyz",          // Firebase Auth UID
  email: "user@example.com",
  name: "김철수",
  phone: "010-1234-5678",
  
  // 가입 정보
  signed_up_at: Timestamp,
  signed_up_via: "kakao_link",    // 또는 "fp_link", "direct"
  referrer_fc_uid: "fp_xxx",      // 트로이목마 링크 (있을 경우)
  
  // 권한
  silver_active: true,
  silver_end_date: Timestamp,
  gold_active: false,
  credit_balance: 0,              // 분 단위
  monthly_4900_active: true,
  
  // 빌링
  billingKey: "encrypted_...",
  subscription_status: "active",
  next_billing_date: Timestamp,
  
  // DESIRE 정보
  desire_stage: "D",              // D, E, S, I, R, E
  desire_progress_pct: 67,
  fire_target_date: "2048-07-25",
  fire_d_day: 8235,
  
  // 출석
  attendance_streak: 47,           // 연속 출석일
  total_attended_days: 156,
  last_login: Timestamp,
  
  // 학습
  videos_watched: [1, 2, 3, ..., 47],
  quizzes_correct: 23,
  moneya_coins: 47,
  
  // 메타
  created_at: Timestamp,
  updated_at: Timestamp
}
```

#### payments/

```javascript
{
  payment_id: "20260429_001",
  uid: "ggorilla11_xyz",
  
  // 결제 정보
  plan: "silver_subscription",
  amount: 9900,
  payment_method: "card",
  
  // 페이플 정보
  payple_oid: "PCD_PAY_OID_...",
  payple_auth_key: "...",
  
  // 상태
  status: "paid",                 // paid, refunded, failed
  paid_at: Timestamp,
  refunded_at: null,
  
  // 자동 갱신 (정기 결제)
  is_recurring: true,
  next_billing: Timestamp,
  cycle_count: 3                  // 3번째 갱신
}
```

#### hot_leads/

```javascript
{
  lead_id: "lead_20260429_001",
  uid: "user_xyz",
  
  // 사용자 정보
  name: "김철수",
  phone: "010-1234-5678",
  email: "...",
  
  // 진단 결과
  diagnosis_score: 72,
  desire_stage: "D",
  priority_concerns: ["보험", "부채"],
  diagnosis_pdf_url: "...",
  
  // 라우팅
  referrer_fc_uid: "fp_xxx",      // FP 트로이목마 (있을 경우)
  routed_to: "fp",                // "fp" 또는 "ceo"
  assigned_to: "fp_xxx_or_ceo",
  
  // SLA
  created_at: Timestamp,
  first_response_at: null,
  resolved_at: null,
  status: "new",                  // new, in_progress, responded, escalated, resolved
  
  // 처리 기록
  handler_actions: [
    { action: "kakao_sent", at: Timestamp },
    { action: "email_sent", at: Timestamp }
  ]
}
```

#### subscriptions/

```javascript
{
  subscription_id: "sub_xyz",
  uid: "user_xyz",
  plan: "monthly_4900",
  
  // 상태
  status: "active",               // active, cancelled, paused, failed
  started_at: Timestamp,
  ended_at: null,
  
  // 결제
  next_billing: Timestamp,
  last_billing: Timestamp,
  total_paid: 14700,              // 누적 매출
  
  // 갱신 이력
  billing_cycles: 3,              // 3번 갱신됨
  
  // 해지
  cancelled_at: null,
  cancellation_reason: null
}
```

---

## 6️⃣ 자동 메시지 발송 정책

### 메시지 종류 (5단)

```
1. 인앱 (App in-message)
   - 사용자 앱 사용 중
   - 머니야 채팅창 자동 메시지
   - 무료, 즉시

2. 푸시 (Push notification)
   - 앱 외부, 모바일 알림
   - 무료
   - 사용자 OFF 가능

3. 카톡 (Kakao 알림톡)
   - 가장 강력 (열람률 80%+)
   - 비용 약 8원/건
   - 사전 승인 템플릿 필수

4. 이메일 (Email)
   - 정기 리포트, 영수증
   - 무료
   - 열람률 낮음

5. SMS (긴급만)
   - 결제 실패, 만료 임박
   - 비용 약 30원/건
```

### 발송 기준 매트릭스

```
이벤트                    인앱  푸시  카톡  이메일  SMS
─────────────────────────────────────────────────
신규 가입 환영            ✅    ✅    ✅    -      -
결제 완료                  ✅    ✅    ✅    ✅    -
결제 실패                  ✅    ✅    -     -      ✅
핫리드 발생 (FP/CEO)       -     -     ✅    ✅    -
일일 미션 알림             ✅    ✅    ✅    -      -
영상 답 공개               ✅    ✅    -     -      -
주간 체크인                ✅    ✅    ✅    -      -
단계 승격                  ✅    ✅    ✅    ✅    -
100일 수료                 ✅    ✅    ✅    ✅    -
3일 미접속                 -     ✅    -     -      -
구독 만료 D-3             ✅    ✅    ✅    ✅    -
구독 만료 D-1             -     -     ✅    -      ✅
환불 완료                  -     -     ✅    ✅    -
긴급 시스템 장애           ✅    ✅    -     -      ✅(대표님)
```

### 빈도 제한 (스팸 방지)

```
사용자별:
- 카톡: 일 최대 2건
- 푸시: 일 최대 5건
- 이메일: 주 최대 3건
- SMS: 월 최대 5건

전체 시스템:
- 발송 차단 시간: 22:00 ~ 08:00 (긴급 제외)
- 주말 카톡: 09:00 ~ 18:00 만
```

### 메시지 OFF 옵션

```
사용자 설정 페이지:
- 마케팅 메시지 OFF
- 야간 알림 OFF
- 이메일 수신 OFF

법적 의무:
- 모든 마케팅 메시지에 OFF 옵션 명시
- "수신 거부" 링크 (이메일)
- "거부" 키워드 응답 시 자동 차단
```

---

## 7️⃣ 일일 KPI 모니터링

### 핵심 지표

```
실시간 (5분 단위):
- 현재 활성 사용자 (DAU)
- 진행 중 음성 진단 수
- 결제 시도 / 성공
- 핫리드 발생 / 처리

일일 (매일 9시 보고):
- 신규 가입 (수)
- 결제 완료 (건수, 매출)
- 환불 (있을 시)
- 핫리드 (생성, 처리, 미처리)
- 영상 시청률
- 평균 출석률
- DESIRE 단계 변경 (승격 / 후퇴)

주간 (일요일):
- 7일 그래프
- 전주 대비 변동
- 인기 콘텐츠 TOP 3

월간 (마지막 날):
- MRR (Monthly Recurring Revenue)
- 신규 / 해지 / 순증
- 단계별 분포
- 100일 수료자
```

### 이상 패턴 감지

```
가입 -50% 이상:
  → 광고 / 마케팅 문제?
  → 시스템 다운?
  → 즉시 보고

결제 실패율 +30%:
  → 페이플 장애?
  → 카드사 점검?
  → 즉시 알림 + 재시도 자동화

핫리드 0건:
  → AI 진단 시스템 다운?
  → 음성 22 깨짐?
  → 즉시 grep 검증 + 보고

DAU -30%:
  → 콘텐츠 문제?
  → 앱 다운?
  → 패턴 분석 후 보고

영상 시청률 < 30%:
  → 콘텐츠 매력 부족?
  → 발송 시간 문제?
  → 다음 주 콘텐츠 재검토
```

---

## 8️⃣ 보안 / 사기 모니터링

### 의심 패턴

```
결제 사기 의심:
- 같은 카드로 짧은 시간 다중 결제
- 동일 IP에서 다중 계정 가입
- 환불 후 즉시 재가입

대응:
- 자동 차단 (즉시)
- 대표님 알림
- Firestore: users/{uid}/security_flag: "suspicious"

봇 / 스크래핑 의심:
- 분당 100회 이상 API 호출
- 동일 패턴 반복
- User-Agent 비정상

대응:
- IP 차단
- 대표님 알림
- API 게이트웨이 강화

데이터 유출 의심:
- 개인정보 일괄 다운로드 시도
- DB 직접 접근 시도
- 권한 없는 영역 접근

대응:
- 즉시 차단
- 보안 인시던트 기록
- 대표님 + Claude 개발자 동시 알림
```

---

## 9️⃣ FP 관리

### FP 등급 / 권한

```
FP Bronze (33,000원/월):
- 트로이목마 링크 1개
- 고객 100명 관리
- 핫리드 알림 (자동 라우팅)
- 진단 리포트에 이름 표기

FP Silver (99,000원/월):
- 트로이목마 링크 5개 (다중 채널)
- 고객 500명 관리
- 우선 처리 (응답 5분 내)
- 전용 대시보드

FP Gold (별도 협의):
- 무제한 고객
- 화이트라벨 (자체 브랜드)
- 별도 계약
```

### FP 활동 모니터링

```
일일 FP KPI:
- 활성 FP 수
- 핫리드 응답률
- 평균 응답 시간
- 신규 가입 (트로이목마 효과)

주간 분석:
- TOP 5 활성 FP
- 비활성 FP (3일 미응답)
- 신규 FP 가입

이상 패턴:
- FP 응답 지연 (6시간 초과)
  → CEO 에스컬레이션
- FP 휴면 (7일 미응답)
  → 활성화 메시지 발송
- FP 구독 만료
  → 사전 안내 (D-7, D-3, D-1)
```

---

## 🔟 출장 / 비상 모드

### 대표님 출장 시 운영

```
필수 자동화 (출장 전 검증):
1. 신규 가입 환영 카톡
2. 결제 처리 (자동)
3. 핫리드 라우팅 (FP)
4. 일일 리포트 (제니야 → 대표님)
5. 시스템 모니터링 (24시간)

CEO 라우팅 (대표님 부재 시):
- 옵션 A: 다른 활성 FP에게 재배정
- 옵션 B: 자동 응답 + 다음 영업일 처리
- 옵션 C: 비상 연락처 (제니야가 결정 후 보고)

대표님 일일 보고 (간소화):
- 카톡 1통 (3줄 이내)
- 특이사항 있을 때만 음성 통화 시도
- 긴급 시 SMS
```

### 비상 시나리오

```
시나리오 1: 결제 시스템 다운
- 1시간 이상 지속 시 대표님 SMS
- 사용자 안내 페이지 활성화
- 결제 시도 큐 저장 (복구 시 재처리)

시나리오 2: 음성 22 깨짐
- 즉시 대표님 음성 통화 시도
- 음성 진단 일시 중단 (사용자 안내)
- v2.0-before-jennya 롤백 준비

시나리오 3: Firebase 장애
- 사용자에게 점검 안내
- 데이터 큐 저장 (복구 시 동기화)
- Firebase 상태 페이지 모니터링

시나리오 4: 보안 사고
- 즉시 모든 발신 차단
- 데이터 백업
- 대표님 + Claude 개발자 동시 알림
- 외부 보안 전문가 호출 (필요 시)
```

---

## 핵심 한 줄

> **"24시간 자동, 3시간 골든타임, 1시간 비상 응답"**

이게 제니야 운영의 시간 약속입니다.
