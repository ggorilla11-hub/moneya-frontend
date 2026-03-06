// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  App.tsx 수정 — 딱 2줄만 추가합니다
//  기존 코드 절대 건드리지 않음
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ── STEP 1: import 목록 맨 아래에 1줄 추가 ──────
import AdminPage from './pages/AdminPage';

// ── STEP 2: Routes 안에 1줄 추가 ────────────────
// (기존 <Route> 들 중 맨 마지막, </Routes> 바로 위에 추가)
<Route path="/admin" element={<AdminPage />} />

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  예시: 기존 App.tsx가 이렇게 생겼다면
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/*
  // 기존 import들...
  import ConsultationPage from './pages/ConsultationPage';
  import AdminPage from './pages/AdminPage';   ← 여기 추가

  // 기존 Routes...
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/consult" element={<ConsultationPage />} />
    <Route path="/admin" element={<AdminPage />} />   ← 여기 추가
  </Routes>
*/
