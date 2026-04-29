# 제니야 메모리 시스템 - Firestore 컬렉션 설계 v1.0

> Phase 3-1: 영원한 기억의 토대
> 작성일: 2026-04-29
> 버전: v1.0

---

## ⭐ 설계 철학

```
인간 기억과 비슷한 3계층:

1. 단기 기억 (Working Memory)
   - 현재 대화 (in-context)
   - 최근 1주일 대화
   - 빠른 접근, 휘발성

2. 장기 기억 (Long-term Memory)
   - 중요한 결정 / 학습 / 패턴
   - 압축된 형태로 영구 보존
   - 검색 가능 (임베딩)

3. 절차 기억 (Procedural Memory)
   - 시스템 프롬프트 (항상 인-컨텍스트)
   - 지식베이스 9개 문서
   - 변경 시 명시적 업데이트
```

---

## 📂 컬렉션 구조

### 1. manager_conversations (대화 세션)

```javascript
manager_conversations/{conversation_id}
{
  // 메타 정보
  conversation_id: "conv_20260429_001",
  user_uid: "ggorilla11_xyz",  // 대표님 UID
  
  // 시간
  started_at: Timestamp,
  last_message_at: Timestamp,
  ended_at: Timestamp,  // null이면 활성
  
  // 요약 (압축용)
  title: "Phase 3 메모리 설계 논의",
  summary: "Firestore 컬렉션 구조 결정...",  // 매일 새벽 자동 생성
  topics: ["phase_3", "firestore", "memory"],  // 자동 태깅
  
  // 통계
  message_count: 15,
  total_tokens: 4523,
  
  // 채널 (음성 통화는 별도 표시)
  channel: "text",  // "text" | "voice" | "voice_to_text"
  
  // 중요도 (자동 평가)
  importance: 4,  // 1-5
  
  // 상태
  archived: false,  // 90일 후 true
  
  // 메타데이터
  created_at: Timestamp,
  updated_at: Timestamp
}
```

### 2. manager_messages (개별 메시지) - 서브컬렉션

```javascript
manager_conversations/{conv_id}/messages/{msg_id}
{
  // 메타
  message_id: "msg_001",
  conversation_id: "conv_20260429_001",
  
  // 내용
  role: "user",  // "user" | "assistant" | "system"
  content: "안녕 제니야",
  
  // 시간
  created_at: Timestamp,
  
  // 토큰 (비용 추적)
  tokens: { input: 0, output: 47 },
  
  // 도구 사용 (Phase 5 이후)
  tool_calls: [
    {
      name: "queryFirebase",
      args: { collection: "users", limit: 10 },
      result_summary: "47명 조회 성공"
    }
  ],
  
  // 첨부 (이미지 / 파일)
  attachments: [],
  
  // 평가 (Phase 9 학습용)
  user_feedback: null,  // "good" | "bad" | null
  notes: null  // 대표님이 직접 추가하는 메모
}
```

### 3. manager_memories (장기 기억) ⭐ 핵심

```javascript
manager_memories/{memory_id}
{
  // 메타
  memory_id: "mem_20260429_001",
  user_uid: "ggorilla11_xyz",
  
  // 출처
  source_conversation_id: "conv_20260429_001",
  source_messages: ["msg_007", "msg_008"],  // 관련 메시지
  
  // 내용 (압축)
  content: "Phase 3 메모리 시스템 설계 - Firestore 컬렉션 3개 (conversations/messages/memories) + 매일 03시 자동 압축 + 임베딩 벡터로 검색",
  
  // 카테고리
  category: "decision",  // decision | pattern | learning | issue | preference
  topics: ["phase_3", "memory", "architecture"],
  
  // 중요도
  importance: 5,  // 1-5
  // 5: 사업 핵심 결정 (영구 보존)
  // 4: 중요 결정 (영구 보존)
  // 3: 일반 작업 (1년 보존)
  // 2: 사소한 결정 (90일 보존)
  // 1: 임시 (30일 보존)
  
  // 임베딩 (검색용)
  embedding: [0.123, -0.456, ...],  // 1536차원
  
  // 시간
  created_at: Timestamp,
  last_accessed_at: Timestamp,
  access_count: 0,
  
  // 만료 (자동 정리용)
  expires_at: Timestamp,  // null = 영구
  
  // 관련 메모리 (그래프)
  related_memories: ["mem_20260420_005", "mem_20260415_012"],
  
  // 검증
  verified_by_user: true,  // 대표님이 명시적 승인
  
  // 메타
  created_at: Timestamp,
  updated_at: Timestamp
}
```

### 4. manager_summaries (시간별 요약) - Phase 9 학습용

```javascript
manager_summaries/{summary_id}
{
  summary_id: "sum_20260429_daily",
  type: "daily",  // daily | weekly | monthly
  date: "2026-04-29",
  
  // 통계
  conversation_count: 5,
  total_messages: 47,
  total_tokens: 12000,
  
  // 핵심 내용
  topics: ["phase_3", "memory_design"],
  key_decisions: [
    "Firestore 컬렉션 3개로 결정",
    "매일 03시 자동 압축"
  ],
  pending_actions: [
    "Step 3-2 메모리 압축 알고리즘 작성"
  ],
  
  // 패턴 (학습)
  user_patterns: {
    preferred_response_style: "단계별",
    decision_speed: "빠름",
    common_topics: ["phase", "design"]
  },
  
  created_at: Timestamp
}
```

### 5. manager_facts (사실 저장소) - Phase 9 RAG용

```javascript
manager_facts/{fact_id}
{
  fact_id: "fact_001",
  
  // 사실
  fact: "AI머니야 월 구독료는 4,900원이다",
  category: "pricing",
  
  // 출처
  source: "knowledge_base/business.md",
  source_section: "가격 정책",
  
  // 검증
  verified: true,
  last_verified_at: Timestamp,
  
  // 임베딩
  embedding: [...],
  
  // 갱신
  superseded_by: null,  // 새 사실이 이걸 대체하면
  
  created_at: Timestamp,
  updated_at: Timestamp
}
```

---

## 🔐 보안 규칙 (Firestore Security Rules)

```javascript
// 제니야 메모리는 대표님만 접근
match /manager_conversations/{conv_id} {
  allow read, write: if request.auth.uid == "ggorilla11_xyz";
}

match /manager_conversations/{conv_id}/messages/{msg_id} {
  allow read, write: if request.auth.uid == "ggorilla11_xyz";
}

match /manager_memories/{mem_id} {
  allow read, write: if request.auth.uid == "ggorilla11_xyz";
}

match /manager_summaries/{sum_id} {
  allow read, write: if request.auth.uid == "ggorilla11_xyz";
}

match /manager_facts/{fact_id} {
  allow read, write: if request.auth.uid == "ggorilla11_xyz";
}
```

---

## 📊 인덱스 설계 (성능)

```
Firestore Composite Indexes:

1. manager_conversations
   - user_uid + last_message_at (DESC)
   - 용도: 최근 대화 목록

2. manager_memories
   - user_uid + importance (DESC) + created_at (DESC)
   - 용도: 중요한 기억 검색
   
3. manager_memories
   - user_uid + category + created_at (DESC)
   - 용도: 카테고리별 검색

4. messages (서브컬렉션)
   - created_at (ASC)
   - 용도: 시간순 정렬
```

---

## 🔄 데이터 흐름

### 새 메시지 발생 시

```
1. 대표님 메시지 입력
   ↓
2. 컨텍스트 조립
   - 시스템 프롬프트 (5KB)
   - 지식베이스 핵심 (10KB)
   - 최근 5개 메시지 (조정 가능)
   - 관련 장기 기억 3-5개 (RAG 검색)
   - 현재 메시지
   ↓
3. Claude API 호출
   ↓
4. 응답 받기
   ↓
5. Firestore 저장
   - 사용자 메시지: messages/{msg_id} 저장
   - 어시스턴트 응답: messages/{msg_id+1} 저장
   - conversation 메타 업데이트
   ↓
6. 사용자에게 표시
```

### 매일 새벽 03시 자동 작업

```
1. 어제 대화 모두 조회
   - last_message_at >= yesterday
   
2. 각 대화 분석 (Claude API)
   - 요약 생성
   - 중요도 평가 (1-5)
   - 토픽 추출
   - 결정 사항 추출
   
3. 중요한 내용 → manager_memories 저장
   - importance >= 4 → 영구 보존
   - importance 3 → 1년 보존
   - importance 2 → 90일 보존
   - importance 1 → 30일 보존
   
4. 임베딩 벡터 생성
   - OpenAI text-embedding-3-small
   - 1536차원
   - 비용: $0.02 / 1M tokens

5. 일일 요약 생성
   - manager_summaries/{date}_daily

6. 만료된 메모리 정리
   - expires_at < now → 삭제
```

### 대화 시 메모리 검색 (RAG)

```
1. 사용자 메시지 임베딩
   "지난주 결정한 메모리 설계 알려줘"
   ↓
2. manager_memories에서 유사도 검색
   - 코사인 유사도 0.7 이상
   - 최대 5개
   - 중요도 가중치 적용
   ↓
3. 검색 결과 컨텍스트에 추가
   "관련 메모리:
    [memory_001] Phase 3 메모리 시스템 설계 - ..."
   ↓
4. Claude가 자연스럽게 활용
```

---

## 💰 비용 추정

### 일일 비용 (대표님 1명, 평균 사용)

```
대화량 추정:
- 일 평균 대화 5건
- 평균 메시지 10개/대화
- 평균 토큰 500/메시지

Claude API 비용:
- 입력: 50회 × 5K = 250K tokens
- 출력: 50회 × 1K = 50K tokens
- claude-opus-4-7: 입력 $15/1M, 출력 $75/1M
- 일 비용: $3.75 + $3.75 = $7.5

매일 새벽 압축:
- 50개 메시지 분석
- 약 30K tokens 입력 + 5K 출력
- $0.45 + $0.375 = $0.825

임베딩 비용:
- 일 5개 메모리 × 1K tokens
- $0.02 / 1M = $0.0001
- 무시 가능

Firestore 비용:
- 읽기 200회 + 쓰기 100회 + 저장 1MB
- 무료 tier 한도 내

월간 총 예상: $250 (약 35만원)

→ 비용 최적화 (Phase 3-3에서):
  - claude-sonnet-4 사용 (10배 저렴)
  - 캐시 활용 (90% 절감)
  - 최종 월 ~$30 (4만원)
```

---

## 🎯 핵심 결정 사항

### 결정 1: Firestore vs 다른 DB

```
선택: Firestore ⭐
이유:
- 이미 사용 중 (moneya-72fe6)
- 실시간 구독 (Phase 5 이후 유용)
- 보안 규칙 통합
- Vercel + Firebase 친화

대안 고려:
- PostgreSQL: 비용 ↑, 관리 부담
- MongoDB: 유사하지만 신규 도입
- Pinecone (벡터): 별도 시스템

결론: Firestore + 임베딩 벡터 자체 저장
```

### 결정 2: 임베딩 서비스

```
선택: OpenAI text-embedding-3-small
이유:
- 비용 매우 저렴 ($0.02/1M)
- 품질 우수
- 1536차원 (적정)

대안:
- Anthropic 임베딩: 미제공
- Cohere: 더 비쌈
- 자체 모델: 운영 부담

결론: OpenAI 임베딩 사용
(API 키 추가 필요)
```

### 결정 3: 압축 시점

```
선택: 매일 새벽 03시
이유:
- 사용자 활동 적은 시간
- 24시간치 모아서 효율적
- Vercel Cron Job 활용

대안:
- 실시간 압축: API 비용 낭비
- 주간 압축: 컨텍스트 너무 큼
- 월간 압축: 검색 부정확

결론: 일일 압축 + 주간 종합 + 월간 종합
```

### 결정 4: 보관 기간

```
중요도별 차등:
- 5 (사업 핵심): 영구
- 4 (중요): 영구
- 3 (일반): 1년
- 2 (사소): 90일
- 1 (임시): 30일

이유:
- 비용 최적화
- 검색 정확도 (오래된 노이즈 제거)
- 한국 PIPA 준수 (불필요 데이터 삭제)

결론: 자동 만료 + 중요한 것 영구
```

---

## 📋 다음 단계 (Step 3-2)

```
Step 3-2: 메모리 압축 알고리즘 (1.5h)
- Firebase Functions 구현
- 매일 03시 Cron
- Claude API 호출 로직
- 중요도 평가 프롬프트
- 임베딩 생성

Step 3-3: 컨텍스트 우선순위 (1h)
- 단기 vs 장기 메모리
- RAG 검색 로직
- 토큰 예산 관리

Step 3-4: 메모리 검색 인터페이스 (30분)
- searchMemory(query) 함수
- getRecentDecisions() 함수
- 대화 중 자동 호출
```

---

## ⚠️ 위험 / 주의사항

### 위험 1: API 비용 폭증

```
시나리오: 대표님이 하루 500개 메시지 보냄
→ 월 비용 $750 (약 100만원)

대응:
- 일일 토큰 한도 설정 (50K)
- 한도 초과 시 알림
- claude-sonnet-4로 자동 전환
- 캐시 적극 활용
```

### 위험 2: 메모리 오염

```
시나리오: 잘못된 정보가 영구 메모리에 저장
→ 모든 후속 대화에 영향

대응:
- 사용자 검증 (verified_by_user)
- 정기 메모리 정합성 점검
- 잘못된 메모리 직접 삭제 가능 (UI)
```

### 위험 3: 개인정보 누출

```
시나리오: 메모리에 다른 고객 정보 포함
→ 익명화 안 됐을 시 위험

대응:
- 대표님 대화는 사업 정보만
- 고객 데이터는 별도 시스템 (PIPA)
- 메모리 저장 전 자동 익명화
```

---

## 핵심 한 줄

> **"치매 걸리지 않는 매니저, 그러나 잊을 것은 정확히 잊는 매니저"**

이게 제니야 메모리의 본질입니다.
