# 제니야 기술 지식베이스 - tech.md v1.0

> AI머니야 기술 환경 핵심 지식
> 작성일: 2026-04-29
> 버전: v1.0
> 작성자: Claude (개발자) → 제니야 (인계)

---

## ⭐ 이 문서의 목적

제니야가 "기술 책임자" 역할을 하기 위한 핵심 지식. 저장소, 배포, API, 음성 22, 디버깅 노하우 모두 포함.

---

## 1️⃣ 저장소 구조

### 핵심 저장소 3개

```
1. moneya-frontend (본체 React 앱)
   - URL: github.com/ggorilla11-hub/moneya-frontend
   - 언어: TypeScript + React + Vite
   - 주력 브랜치: develop ⭐
   - 배포: Vercel (자동)
   - 역할: 메인 앱 (가입/로그인/탭 구조)

2. financial-house-building (AI 진단 - iframe)
   - URL: github.com/ggorilla11-hub/financial-house-building
   - 언어: 단일 HTML 파일 (Vanilla JS)
   - 주력 브랜치: develop ⭐
   - 배포: Vercel (자동)
   - 역할: AI 진단 + 음성 22 보유
   - 특징: 본체 앱에 iframe으로 임베드됨

3. moneya-server (백엔드 Node.js)
   - URL: github.com/ggorilla11-hub/moneya-server
   - 언어: Node.js + Express
   - 주력 브랜치: main ⭐ (frontend와 다름)
   - 배포: Render
   - 역할: API 서버 (페이플 webhook 등)
```

### 브랜치 전략 (대표님 결정)

```
moneya-frontend / financial-house-building:
  - main: 운영 환경 (사용자 접속)
  - develop: 개발 환경 (테스트)
  - 작업: develop만 (main은 develop에서 머지)

moneya-server:
  - main: 유일 브랜치
  - 직접 작업

이유:
- 본체와 iframe 모두 develop만 작업
- main은 검증된 코드만
- 출장/장애 시 빠른 롤백 가능
```

### 폴더 구조 - moneya-frontend

```
moneya-frontend/
├── src/
│   ├── pages/                  (페이지 컴포넌트)
│   │   ├── HomePage.tsx
│   │   ├── ConsultationPage.tsx
│   │   ├── AIDiagIframePage.tsx (AI진단 iframe)
│   │   ├── FinancialHouseDesign.tsx
│   │   ├── FinancialHouseResult.tsx
│   │   ├── ManagerPage.tsx     (대표님 only)
│   │   └── MorePage.tsx
│   ├── components/             (재사용 컴포넌트)
│   │   ├── BottomNav.tsx
│   │   ├── FinancialPlanCards.tsx
│   │   └── manager/            (제니야 컴포넌트)
│   │       ├── ManagerDashboard.tsx
│   │       └── ManagerChat.tsx
│   ├── lib/                    (라이브러리)
│   │   ├── firebase.ts
│   │   ├── payple.ts
│   │   └── jennya/             (제니야 라이브러리)
│   │       ├── api.ts
│   │       └── memory.ts
│   ├── manager/                (제니야 핵심) ⭐
│   │   ├── prompts/
│   │   │   ├── master-prompt.md
│   │   │   ├── honorifics-glossary.md
│   │   │   ├── work-principles.md
│   │   │   └── response-templates.md
│   │   └── knowledge/
│   │       ├── business.md
│   │       ├── tech.md         (이 문서)
│   │       ├── operations.md
│   │       ├── content.md
│   │       └── history.md
│   └── App.tsx
├── public/
├── package.json
├── vite.config.ts
├── tsconfig.json
└── vercel.json
```

### 폴더 구조 - financial-house-building

```
financial-house-building/
├── index.html                  ⚠️ 음성 22 보유 - 절대 보호
├── api/                        (Vercel Functions)
│   ├── ai-chat.js
│   ├── ai-diagnosis.js
│   └── ...
├── public/
├── package.json
└── vercel.json
```

---

## 2️⃣ 배포 환경

### Vercel 배포 URL

```
운영 (Production):
- moneya-frontend.vercel.app (본체 main)
- financial-house-building.vercel.app (iframe main)
- 사용자 실제 접속 URL

개발 (Develop):
- moneya-develop.vercel.app (본체 develop) ⭐ 주력
- financial-house-building-dev.vercel.app (iframe develop)
- 대표님 + 제니야 테스트용

자동 배포:
- develop 브랜치 push → 자동 빌드 + 배포 (1-2분)
- main 브랜치 push → 자동 빌드 + 배포 (1-2분)
```

### Vercel 설정 (중요)

```
vercel.json (moneya-frontend):
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "ALLOW-FROM https://financial-house-building-dev.vercel.app"
        }
      ]
    }
  ]
}

⚠️ Vercel Authentication 설정:
- Settings > Deployment Protection > Vercel Authentication
- "Disable" (사용자 접근 차단 해제)
- iframe 임베드를 위해 필수
```

### 백엔드 (Render)

```
moneya-server URL: moneya-server.onrender.com
역할:
- 페이플 webhook 수신
- DB 저장 / 조회
- 알림톡 발송 트리거

자동 배포:
- main 브랜치 push → 5-10분 빌드
- 콜드 스타트 있음 (무료 플랜)
```

---

## 3️⃣ 음성 22 (절대 불가침) ⭐⭐⭐

### 음성 22의 정의

```
financial-house-building/index.html 내
다음 패턴을 grep한 결과의 합 = 정확히 22개:

grep -c "diagConnectVoice|vapi.start|forceCleanupVapi|_vapiConnecting" \
  financial-house-building/index.html

= 반드시 22

이 숫자가 변동되면 음성 진단 시스템 깨짐
```

### 보호 대상 6가지

```
1. VapiClass
   - Vapi SDK의 핵심 클래스
   - 동적 ESM import 사용

2. vapi.start()
   - 음성 통화 시작 함수
   - 매개변수: assistantId

3. vapi.stop()
   - 음성 통화 종료 함수

4. diagConnectVoice
   - 음성 진단 연결 함수 (커스텀)
   - 음성 22의 핵심

5. vapiCallActive
   - 통화 활성 상태 변수
   - 중복 호출 방지

6. audio.volume (절대 audio.muted X)
   - 마이크 볼륨 제어
   - audio.muted 사용 시 Chrome 마이크 소유권 문제 발생
```

### 음성 22 검증 명령

```bash
# 매번 변경 후 실행 필수
grep -c "diagConnectVoice\|vapi.start\|forceCleanupVapi\|_vapiConnecting" \
  financial-house-building/index.html

# 결과:
# 22 → 정상
# 22가 아닌 숫자 → 즉시 롤백
```

### 음성 22 영역 작업 금지 사항

```
❌ index.html에서 위 6개 패턴 수정
❌ vapi.start() 매개변수 변경
❌ audio.muted로 변경
❌ 함수 이름 리팩토링
❌ Vapi SDK 버전 업그레이드 (검증 없이)

✅ 허용 사항:
- 음성 22 외부 영역 (UI, CSS, 다른 함수)
- 새 함수 추가 (기존 22개 안 건드림)
- 주석 추가
```

### Vapi 외부 키 (중요)

```
Vapi Public Key: 40b0ac9b-... (financial-house-building/index.html 내)
Vapi Assistant ID: 0406e775-...

위 키는 클라이언트 측에 노출되어 있음 (의도된 설계)
- Public Key는 노출 OK (Vapi 정책)
- Assistant ID는 노출 OK (제한된 권한)

⚠️ 절대 변경 금지: 변경 시 음성 22 깨짐
```

---

## 4️⃣ 외부 시스템 (API)

### 4-1. Firebase

```
프로젝트: moneya-72fe6
역할:
- Firebase Auth (사용자 인증)
- Firestore (데이터베이스)
- Firebase Functions (서버리스 함수)
- Firebase Storage (파일 저장)

Console:
console.firebase.google.com/project/moneya-72fe6

핵심 컬렉션 (Firestore):
- users (사용자 정보)
- consultations (상담 기록)
- payments (결제 내역)
- hot_leads (핫리드)
- ai_diagnoses (AI 진단)
- subscriptions (구독)
- fp_members (FP 회원)
- manager_conversations (제니야 대화)
- manager_memories (제니야 장기 기억)

승인된 도메인 (Auth):
- localhost
- moneya-72fe6.firebaseapp.com
- moneya-frontend.vercel.app
- moneya-develop.vercel.app
- financial-house-building.vercel.app
- financial-house-building-dev.vercel.app

⚠️ 새 도메인 추가 시:
Firebase Console > Authentication > Settings > Authorized domains
```

### 4-2. Vapi (음성 AI)

```
대시보드: dashboard.vapi.ai
계정: ggorilla11

핵심:
- Public Key (frontend 노출 OK)
- Assistant ID (frontend 노출 OK)
- Private Key (서버 only, 절대 노출 X)

기존 Assistant: 0406e775-... (음성 진단용)
신규 Assistant 필요: 제니야 전용 (Phase 6에서 생성)

음성 통화 흐름:
1. 사용자 마이크 권한 허용
2. vapi.start(assistantId) 호출
3. WebSocket 연결
4. STT (Speech to Text) 실시간
5. LLM 응답 생성
6. TTS (Text to Speech) 출력
7. vapi.stop() 종료
```

### 4-3. 페이플 (결제)

```
대시보드: payple.kr
계정 정보: 사업자 등록 기반

핵심 키:
- Client Key: A5FAA5CC8F3A24C178790CF50FD1A19B
- 서버 시크릿: payple_secret (.env 보관)

결제 흐름:
1. 사용자 결제 버튼 클릭
2. payple.js 로드
3. 결제 모달 띄움
4. 사용자 카드 정보 입력
5. 페이플 → 서버 webhook
6. moneya-server가 결제 처리
7. Firestore에 결제 기록
8. 사용자 권한 활성화

플랜 매핑 (PLAN_MAP):
{
  "silver_subscription": { price: 9900, name: "Silver" },
  "gold_subscription": { price: 99900, name: "Gold" },
  "credit_charge": { price: 9900, name: "Credit" },
  "fp_bronze": { price: 33000, name: "FP Bronze" },
  "fp_silver": { price: 99000, name: "FP Silver" }
}

빌링키 (정기 결제):
- 첫 결제 시 카드 등록
- 다음부터 1탭 결제
- Firestore: users/{uid}/billingKey 보관
```

### 4-4. make.com (자동화)

```
대시보드: make.com (계정: ggorilla11)
역할: webhook 기반 자동화 허브

핵심 시나리오:

1. 강의 결제 webhook (현재 운영 중)
   URL: hook.eu1.make.com/ap0haywvwzdanu3x0yp6ewvh76x3khuk
   흐름: 페이플 → make.com → Google Sheets + 카톡 + 이메일

2. 음성 진단 결제 webhook (예정)
   URL: 별도 생성 필요
   흐름: 페이플 → make.com → 위와 동일

3. 핫리드 라우팅 (예정)
   URL: 별도 생성 필요
   흐름: AI 진단 결과 → make.com → FP 또는 CEO 이메일

4. 일일 리포트 (예정)
   매일 9시 자동 트리거
   Firestore 조회 → 카톡 알림톡

연동 시스템:
- Google Sheets (자동 기록)
- KakaoTalk (알림톡)
- Gmail (자동 메일)
- Firebase (DB 조회)
- HeyGen (AI 영상)
- Creatomate (영상 편집)
```

### 4-5. KakaoTalk 비즈니스

```
서비스: 카카오 알림톡
계정: 오원트금융연구소

발신 프로필 등록 완료
사전 승인 템플릿 사용

템플릿 종류:
- 신규 가입 환영
- 결제 완료
- 핫리드 알림 (FP / CEO)
- 일일 KPI 리포트
- 단계 승격 축하
- 100일 수료증
- 미션 알림
```

### 4-6. Anthropic API (제니야 백본)

```
계정: ggorilla11
모델: claude-opus-4-7 (제니야 메인) / claude-sonnet-4 (보조)

API 엔드포인트:
https://api.anthropic.com/v1/messages

키 보관:
- 환경 변수: ANTHROPIC_API_KEY
- Vercel Settings > Environment Variables
- 절대 코드에 하드코딩 X
- 절대 GitHub 커밋 X

사용량 관리:
- Workbench: console.anthropic.com
- 비용 추적: 매월 모니터링
```

---

## 5️⃣ 환경 변수 (.env)

### moneya-frontend (.env.local)

```bash
# Firebase
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=moneya-72fe6.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=moneya-72fe6
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

# Vapi
VITE_VAPI_PUBLIC_KEY=40b0ac9b-...
VITE_VAPI_ASSISTANT_ID_DIAGNOSIS=0406e775-...
VITE_VAPI_ASSISTANT_ID_JENNYA=(Phase 6 생성)

# 페이플
VITE_PAYPLE_CLIENT_KEY=A5FAA5CC8F3A24C178790CF50FD1A19B

# 백엔드 API
VITE_API_BASE_URL=https://moneya-server.onrender.com

# 제니야 (Phase 4 추가)
VITE_ANTHROPIC_API_KEY=sk-ant-...  # 보안상 백엔드 경유 권장
```

### moneya-server (.env)

```bash
# 페이플 시크릿
PAYPLE_SECRET_KEY=...

# Firebase Admin
FIREBASE_PROJECT_ID=moneya-72fe6
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...

# Anthropic (제니야 백엔드)
ANTHROPIC_API_KEY=sk-ant-...

# make.com
MAKE_WEBHOOK_LECTURE=https://hook.eu1.make.com/...
MAKE_WEBHOOK_PAYMENT=...
```

### Vercel 환경 변수

```
Vercel Dashboard > Settings > Environment Variables

3가지 환경:
- Production (운영)
- Preview (PR 미리보기)
- Development (로컬)

설정 후:
- 새 빌드 트리거 필요
- 또는 기존 배포 재실행
```

---

## 6️⃣ 빌드 / 배포 흐름

### 일반 작업 흐름

```
1. 로컬 코드 수정
2. git add + commit + push (develop)
3. Vercel 자동 빌드 시작 (1분 후)
4. 빌드 성공 시 자동 배포
5. moneya-develop.vercel.app 즉시 반영
6. 검증 후 main 머지

전체 시간: 평균 3-5분
```

### Vercel 자동 배포 흐름

```
GitHub push
  ↓
Webhook 트리거
  ↓
Vercel 빌드 큐 진입
  ↓
빌드 시작 (npm install + npm run build)
  ↓
빌드 결과 dist/ 생성
  ↓
Edge Network 배포
  ↓
URL 즉시 반영 (캐시 무효화)
```

### 빌드 에러 시

```
1. Vercel Dashboard > 해당 배포 > Logs 확인
2. 에러 종류 파악:
   - TypeScript 에러 (TS1234, TS6133 등)
   - ESLint 에러
   - 의존성 누락
   - 환경 변수 누락
3. 로컬에서 수정
4. 재 push
5. 재 빌드 대기

⚠️ Vercel 자동 배포 지연 버그:
- 가끔 Production 자동 배포 안 됨
- 해결: Vercel Dashboard에서 수동 "Promote to Production"
- 의심: Output Directory 설정 (dist 명시 권장)
```

---

## 7️⃣ 환경 회피 노하우 (실전 학습) ⭐

### 7-1. 메신저 자동 변환 (가장 빈번)

```
문제 1: .md 확장자 자동 링크화
  텍스트: "master-prompt.md"
  메신저 표시: "[master-prompt.md](http://master-prompt.md)"
  
  영향: cat heredoc 명령 실행 시 파일명 깨짐

문제 2: 이메일 자동 변환
  텍스트: "ggorilla11@gmail.com"
  메신저 표시: "[ggorilla11@gmail.com](mailto:ggorilla11@gmail.com)"

문제 3: URL 자동 변환
  텍스트: "https://example.com"
  메신저 표시: "[https://example.com](https://example.com)"

해결 전략 (순위):
1순위: GitHub Upload files 직접 사용 (변환 회피)
2순위: 파일은 outputs 폴더 → 다운로드 → GitHub 업로드
3순위: 헥스 검증 (실제 파일명 정확 확인)
   → python -c "print(hex(ord('m')))" = 0x6d 등

❌ 절대 사용 금지:
- cat << 'EOF' > file.md (긴 .md 파일)
- echo "[email](mailto:...)" 같은 표시 명령
```

### 7-2. Vercel Preview 보호

```
문제:
- develop 브랜치 자동 배포 URL = SSO 보호 (기본값)
- iframe 임베드 시 401 Unauthorized
- X-Frame-Options: DENY 헤더

해결:
1. Vercel Dashboard > Settings > Deployment Protection
2. Vercel Authentication: Disable
3. 또는 Production URL 사용 (main 브랜치)

검증:
curl -I https://moneya-develop.vercel.app
→ X-Frame-Options 없거나 ALLOW-FROM이면 OK
```

### 7-3. Firebase 도메인 등록

```
문제:
- 새 Vercel 배포 URL은 Firebase Auth 미등록
- 에러: "auth/unauthorized-domain"

해결:
1. Firebase Console > Authentication > Settings > Authorized domains
2. 사용 도메인 모두 사전 등록:
   - moneya-frontend.vercel.app
   - moneya-develop.vercel.app
   - financial-house-building.vercel.app
   - financial-house-building-dev.vercel.app

대안: 안정 도메인 사용 (moneya-develop.vercel.app)
```

### 7-4. npm 명령 PATH 문제 (Git Bash)

```
문제:
- Windows + Git Bash 환경에서 npm command not found
- "npm은(는) 내부 또는 외부 명령..."

원인: Windows PATH 설정 + Git Bash 환경 변수

해결:
1. Vercel 자동 배포 활용 (push만 하면 빌드)
2. Windows CMD에서 npm 실행
3. Node.js 재설치 + Git Bash 재시작
4. 또는 nvm 사용

⭐ 추천: Vercel 자동 배포 (로컬 npm 빌드 불필요)
```

### 7-5. TypeScript 빌드 에러 패턴

```
TS1002: Unterminated string literal
  원인: 따옴표 미닫음
  해결: 코드 주의 깊게 검토

TS6133: 'X' is declared but its value is never read
  원인: 미사용 import / 변수
  해결:
  - 사용 안 할 import 제거
  - 일시 미사용은 underscore prefix (_변수명)
  - 또는 // @ts-ignore (최소 사용)

TS6196: 'X' is declared but never used
  원인: 미사용 함수 / 인터페이스
  해결: 즉시 제거 또는 export

TS2322: Type 'X' is not assignable to type 'Y'
  원인: 타입 불일치
  해결: 타입 정확히 맞추거나 as Y 캐스팅 (마지막 수단)
```

### 7-6. iframe 메시지 통신

```
문제:
- 본체 앱과 iframe 앱 간 데이터 공유 필요
- 직접 접근 불가 (CORS / Same-Origin Policy)

해결: postMessage API

본체 (parent):
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://financial-house-building-dev.vercel.app') return;
  // 처리
});

iframe (child):
window.parent.postMessage({
  type: 'DIAGNOSIS_COMPLETE',
  data: { ... }
}, 'https://moneya-develop.vercel.app');
```

### 7-7. Chrome 마이크 소유권

```
문제:
- audio.muted = true 사용 시 Chrome이 마이크 권한 회수
- 음성 22 깨짐

해결: audio.volume 사용
- audio.volume = 0 (음소거 효과)
- audio.volume = 1 (정상)
- 절대 audio.muted 사용 X
```

---

## 8️⃣ 디버깅 표준 절차

### 빌드 실패 디버깅

```
Step 1: Vercel Logs 확인
  Vercel Dashboard > 배포 > Build Logs
  
Step 2: 에러 패턴 분류
  - TS 에러 → 7-5 참고
  - 의존성 누락 → npm install
  - 환경 변수 → Vercel Settings 확인
  - Vite 설정 → vite.config.ts 검토

Step 3: 로컬 빌드 시도 (가능하면)
  npm run build
  → 에러 재현 후 수정

Step 4: 작은 변경 + 재 push
  → Vercel 자동 빌드 대기

Step 5: 검증
  → 배포 성공 확인
  → 기능 테스트
```

### 음성 22 깨짐 의심 시

```
Step 1: grep 검증
  grep -c "diagConnectVoice\|vapi.start\|forceCleanupVapi\|_vapiConnecting" \
    financial-house-building/index.html
  → 22가 아니면 즉시 롤백

Step 2: git log 확인
  git log --oneline -20 financial-house-building/index.html
  → 최근 커밋 확인

Step 3: 문제 커밋 식별
  git diff <커밋전> <커밋후> financial-house-building/index.html
  
Step 4: 롤백
  git revert <문제 커밋>
  또는
  git reset --hard <안전 태그>
  git push --force-with-lease
```

### 결제 시스템 장애

```
Step 1: 페이플 대시보드 확인
  → 시스템 장애 공지?
  → 카드사 점검?

Step 2: webhook 로그 확인
  make.com Dashboard > Scenarios > Run history

Step 3: 백엔드 로그
  Render Dashboard > Logs

Step 4: Firestore 확인
  payments 컬렉션 최근 5건

Step 5: 임시 조치
  - 결제 실패 알림 발송 보류
  - 사용자에게 일시 장애 안내
  - 수동 처리 필요 시 대표님 알림
```

---

## 9️⃣ Git 작업 노하우

### 안전 태그 명명 규칙

```
v[버전]-before-[변경내용]

예시:
- v2.0-before-jennya
- v2.1-before-knowledge-move
- v2.5-before-payment-update
- v3.0-before-production-merge

명명 의도:
- 한 눈에 "무엇 전 상태"인지 파악
- 롤백 시 빠른 결정 가능
```

### 자주 쓰는 명령

```bash
# 안전 태그 생성
git tag v2.5-before-XXX
git push origin v2.5-before-XXX

# 롤백
git reset --hard v2.5-before-XXX
git push --force-with-lease origin develop

# 변경 사항 검토
git diff develop main
git log --oneline -20

# 파일 이동 (변경 이력 보존)
git mv old/path.md new/path.md

# 마지막 커밋 수정
git commit --amend
```

### 충돌 해결

```
1. git pull origin develop
2. 충돌 발생 시
3. 해당 파일 열어 수정
4. <<<<<<< / ======= / >>>>>>> 마커 제거
5. git add 충돌파일
6. git commit
7. git push
```

---

## 🔟 보안 체크리스트

### 절대 GitHub 커밋 금지

```
❌ API 키 (Anthropic, Firebase, Vapi 등)
❌ 페이플 시크릿
❌ 사용자 비밀번호 / 개인정보
❌ JWT 시크릿
❌ DB 연결 문자열

→ 모두 환경 변수로
→ .gitignore에 .env 추가 필수
```

### 보안 점검 명령

```bash
# 키 노출 검사
grep -rn "sk-ant-" src/
grep -rn "AIzaSy" src/  # Firebase 키 패턴
grep -rn "PAYPLE_SECRET" src/

# .env 추적 안 함 확인
git ls-files | grep "\.env"
→ 결과 없어야 정상

# .gitignore 확인
cat .gitignore | grep -E "env|secret|key"
```

---

## 핵심 한 줄

> **"음성 22 = 22, 다른 모든 것은 검증 후 진행"**

이게 제니야의 기술 신조입니다.
