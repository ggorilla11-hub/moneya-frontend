// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  AdminPage.tsx — MONEYA OS 관리자 시스템
//  moneya-frontend/src/pages/AdminPage.tsx (신규 파일)
//  기존 코드 완전 무관 — 독립 실행
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { useState, useEffect, useCallback } from 'react';

// ── 상수 ──────────────────────────────────────────────
const API = 'https://moneya-server.onrender.com';
const ADMIN_KEY = localStorage.getItem('moneyaAdminKey') || 'moneya-admin-2026';
const GOLD = '#c9a53e';

// ── 타입 ──────────────────────────────────────────────
type Tab = 'briefing' | 'pipeline' | 'alerts' | 'bitter' | 'reports' | 'test' | 'shadow' | 'rag' | 'system' | 'engine';

interface Customer {
  id: string; name: string; phone?: string; stage: number; stageLabel: string;
  hoursInStage?: number; subscription?: { renewalDate?: string; active?: boolean };
  consultation?: { reportSent?: boolean }; documents?: Record<string, boolean>;
}

interface Alert {
  severity: string; icon: string; pushTitle: string; pushBody: string;
  action: string; customerName?: string; stage?: number;
}

// ── API 호출 헬퍼 ──────────────────────────────────────
async function api(path: string, method = 'GET', body?: any) {
  try {
    const res = await fetch(`${API}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_KEY },
      body: body ? JSON.stringify(body) : undefined
    });
    return await res.json();
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── 단계 정의 ──────────────────────────────────────────
const STAGES = [
  { n: 1, icon: '⬜', label: '유입',        color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
  { n: 2, icon: '🔵', label: '신청+결제',   color: '#3b82f6', bg: 'rgba(59,130,246,0.10)' },
  { n: 3, icon: '🟡', label: '접수(전화)',  color: '#eab308', bg: 'rgba(234,179,8,0.10)'  },
  { n: 4, icon: '🟠', label: '준비(자료)',  color: '#f97316', bg: 'rgba(249,115,22,0.10)' },
  { n: 5, icon: '🟢', label: '상담(줌90)', color: '#22c55e', bg: 'rgba(34,197,94,0.10)'  },
  { n: 6, icon: '🟣', label: '후속(브리핑)',color: '#a855f7', bg: 'rgba(168,85,247,0.10)' },
  { n: 7, icon: '⭐', label: '구독(월례)',  color: '#c9a53e', bg: 'rgba(201,165,62,0.12)' },
  { n: 8, icon: '💎', label: '성장(VIP)',   color: '#06b6d4', bg: 'rgba(6,182,212,0.10)'  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  서브 컴포넌트들
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ── 통계 카드 ─────────────────────────────────
function StatCard({ num, label, color }: { num: string | number; label: string; color?: string }) {
  return (
    <div style={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '14px', textAlign: 'center' }}>
      <div style={{ fontSize: 26, fontWeight: 900, color: color || GOLD }}>{num}</div>
      <div style={{ fontSize: 11, color: '#6b6b85', marginTop: 3 }}>{label}</div>
    </div>
  );
}

// ── 카드 래퍼 ─────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 16, marginBottom: 12, ...style }}>
      {children}
    </div>
  );
}

// ── 섹션 제목 ─────────────────────────────────
function CardTitle({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: color || '#6b6b85', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
      {children}
    </div>
  );
}

// ── 버튼 ─────────────────────────────────────
function Btn({ children, onClick, color = GOLD, textColor = '#000', style }: {
  children: React.ReactNode; onClick?: () => void;
  color?: string; textColor?: string; style?: React.CSSProperties;
}) {
  return (
    <button onClick={onClick} style={{
      background: color, color: textColor, border: 'none', borderRadius: 8,
      padding: '9px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
      fontFamily: 'inherit', ...style
    }}>{children}</button>
  );
}

// ── 알림 카드 ─────────────────────────────────
function AlertCard({ alert }: { alert: Alert }) {
  const colors: Record<string, { bg: string; border: string; text: string }> = {
    high:   { bg: 'rgba(255,68,68,0.08)',   border: '#ff4444', text: '#ff8888' },
    medium: { bg: 'rgba(255,204,0,0.06)',   border: '#ffcc00', text: '#ffdd66' },
    low:    { bg: 'rgba(0,204,136,0.06)',   border: '#00cc88', text: '#44ddaa' },
  };
  const c = colors[alert.severity] || colors.low;
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10, padding: 14, marginBottom: 8 }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <span style={{ fontSize: 20 }}>{alert.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{alert.pushTitle}</div>
          {alert.customerName && <div style={{ fontSize: 11, color: '#6b6b85', marginTop: 2 }}>고객: {alert.customerName}</div>}
          <div style={{ fontSize: 12, color: c.text, marginTop: 4 }}>→ {alert.action}</div>
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  탭 패널들
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ── 모닝 브리핑 ───────────────────────────────
function BriefingPanel() {
  const [briefing, setBriefing] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const d = await api('/admin/morning-briefing');
    if (d.success && d.briefing) setBriefing(d.briefing);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

  return (
    <div>
      {/* 헤더 배너 */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1500 0%, #2a1f00 60%, #1a1500 100%)',
        border: `1px solid rgba(201,165,62,0.3)`, borderRadius: 12,
        padding: 20, marginBottom: 12, position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ fontSize: 11, color: GOLD, fontFamily: 'monospace' }}>📅 {today}</div>
        <div style={{ fontSize: 17, fontWeight: 700, marginTop: 6, lineHeight: 1.5 }}>
          {briefing?.greeting || '오상열 대표님, 좋은 아침입니다! ☀️'}
        </div>
        {briefing && (
          <div style={{ display: 'flex', gap: 20, marginTop: 14, flexWrap: 'wrap' }}>
            {[
              { n: briefing.yesterday?.newCustomers ?? 0, l: '어제 신규' },
              { n: briefing.yesterday?.consultations ?? 0, l: '상담 완료' },
              { n: briefing.yesterday?.subscriptions ?? 0, l: '구독자' },
              { n: `${briefing.monthRevenue?.percent ?? 0}%`, l: '월 목표' },
            ].map((m, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: GOLD }}>{m.n}</div>
                <div style={{ fontSize: 10, color: '#888' }}>{m.l}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        {/* 오늘 할 일 */}
        <Card>
          <CardTitle>📅 오늘 할 일</CardTitle>
          {briefing?.today?.length > 0 ? briefing.today.map((t: any, i: number) => (
            <div key={i} style={{ display: 'flex', gap: 8, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 12 }}>
              <span>{t.urgent ? '🔴' : '⚪'}</span>
              <span style={{ color: '#aaa', minWidth: 45, fontFamily: 'monospace', fontSize: 11 }}>{t.time}</span>
              <span style={{ color: t.urgent ? '#ff8888' : '#ccc' }}>{t.task}</span>
            </div>
          )) : (
            <div style={{ fontSize: 12, color: '#555' }}>할 일을 불러오는 중...</div>
          )}
        </Card>

        {/* 주의사항 */}
        <Card>
          <CardTitle>⚠️ 주의사항</CardTitle>
          {briefing?.warnings?.length > 0 ? briefing.warnings.map((w: string, i: number) => (
            <div key={i} style={{ fontSize: 12, color: '#ff9999', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>• {w}</div>
          )) : (
            <div style={{ fontSize: 12, color: '#555' }}>주의사항 없음 ✅</div>
          )}
        </Card>
      </div>

      {/* 목표 진행률 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <Card>
          <CardTitle>📊 주간 목표</CardTitle>
          <div style={{ fontSize: 28, fontWeight: 900, color: GOLD }}>
            {briefing?.weekSummary?.done ?? 0} / {briefing?.weekSummary?.target ?? 5}
          </div>
          <div style={{ fontSize: 11, color: '#666', marginTop: 3 }}>상담 완료</div>
          <div style={{ background: '#222', borderRadius: 4, height: 6, marginTop: 8, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: GOLD, borderRadius: 4, width: `${((briefing?.weekSummary?.done ?? 0) / (briefing?.weekSummary?.target ?? 5)) * 100}%`, transition: 'width 1s ease' }} />
          </div>
        </Card>
        <Card>
          <CardTitle>💰 월 매출</CardTitle>
          <div style={{ fontSize: 28, fontWeight: 900, color: GOLD }}>{briefing?.monthRevenue?.percent ?? 0}%</div>
          <div style={{ fontSize: 11, color: '#666', marginTop: 3 }}>목표 {(briefing?.monthRevenue?.target ?? 5000000).toLocaleString()}원</div>
          <div style={{ background: '#222', borderRadius: 4, height: 6, marginTop: 8, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: GOLD, borderRadius: 4, width: `${briefing?.monthRevenue?.percent ?? 0}%`, transition: 'width 1s ease' }} />
          </div>
        </Card>
      </div>

      {/* 쓴소리 */}
      {briefing?.bitterAdvice && (
        <Card style={{ background: 'rgba(170,68,255,0.07)', border: '1px solid rgba(170,68,255,0.2)' }}>
          <CardTitle color="#aa44ff">💬 AI 매니저 쓴소리</CardTitle>
          <div style={{ fontSize: 13, color: '#cc99ff', fontWeight: 600, lineHeight: 1.7 }}>
            "{briefing.bitterAdvice}"
          </div>
        </Card>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <Btn onClick={load} color="#1a1a24" textColor={GOLD} style={{ border: `1px solid ${GOLD}`, flex: 1 }}>
          {loading ? '⏳ 생성 중...' : '🔄 브리핑 새로고침'}
        </Btn>
        <Btn onClick={async () => { await api('/admin/engine/morning-now', 'POST'); }} color="#1a1a24" textColor="#44aaff" style={{ border: '1px solid #44aaff', flex: 1 }}>
          📧 이메일+푸시 발송
        </Btn>
      </div>
    </div>
  );
}

// ── 고객 여정 파이프라인 ───────────────────────
function PipelinePanel({ onToast }: { onToast: (m: string) => void }) {
  const [pipeline, setPipeline] = useState<Record<string, any>>({});
  const [selected, setSelected] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const d = await api('/admin/pipeline');
    if (d.success && d.pipeline) setPipeline(d.pipeline);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const totalCustomers = Object.values(pipeline).reduce((s: number, v: any) => s + (v.count || 0), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: '#666' }}>총 {totalCustomers}명 | 실시간 현황</div>
        <Btn onClick={load} color="#1a2233" textColor="#4488ff" style={{ border: '1px solid #4488ff', fontSize: 12 }}>
          {loading ? '⏳' : '🔄 새로고침'}
        </Btn>
      </div>

      {/* 요약 통계 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 12 }}>
        <StatCard num={pipeline[1]?.count ?? 0} label="유입" color="#6b7280" />
        <StatCard num={pipeline[2]?.count ?? 0} label="신청" color="#3b82f6" />
        <StatCard num={pipeline[7]?.count ?? 0} label="구독중" color={GOLD} />
        <StatCard num={pipeline[8]?.count ?? 0} label="VIP" color="#06b6d4" />
      </div>

      {/* 파이프라인 행 */}
      {STAGES.map(stage => {
        const data = pipeline[stage.n] || { count: 0, customers: [] };
        return (
          <div key={stage.n} style={{
            display: 'flex', alignItems: 'stretch',
            background: stage.bg, border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 10, marginBottom: 7, overflow: 'hidden'
          }}>
            {/* 단계명 */}
            <div style={{ width: 160, minWidth: 160, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 7, borderRight: '1px solid rgba(255,255,255,0.07)' }}>
              <span style={{ fontSize: 16 }}>{stage.icon}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: stage.color }}>{stage.label}</div>
              </div>
            </div>
            {/* 고객 수 */}
            <div style={{ width: 44, minWidth: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, color: stage.color, borderRight: '1px solid rgba(255,255,255,0.07)' }}>
              {data.count || 0}
            </div>
            {/* 고객 칩 */}
            <div style={{ flex: 1, padding: '8px 12px', display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
              {data.customers?.length > 0 ? data.customers.map((c: Customer, i: number) => (
                <span key={i} onClick={() => setSelected(c)} style={{
                  padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                  cursor: 'pointer', color: '#ddd'
                }}>{c.name}</span>
              )) : (
                <span style={{ fontSize: 11, color: '#444' }}>— 대기 없음</span>
              )}
            </div>
            {/* 액션 버튼 */}
            <div style={{ width: 76, minWidth: 76, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px' }}>
              <button onClick={() => onToast(`${stage.label} 단계 액션 (Firebase 연동 후 활성화)`)} style={{
                fontSize: 10, fontWeight: 700, background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.13)', color: '#aaa',
                padding: '5px 8px', borderRadius: 6, cursor: 'pointer'
              }}>액션</button>
            </div>
          </div>
        );
      })}

      {/* 고객 상세 모달 */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#111118', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16, padding: 24, width: 420, maxWidth: '95vw'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700 }}>{selected.name}</div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{selected.phone || '연락처 없음'} · {STAGES[selected.stage - 1]?.label}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#666', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>
            {/* 여정 단계 */}
            <div style={{ display: 'flex', marginBottom: 16, gap: 0 }}>
              {STAGES.map(s => (
                <div key={s.n} style={{ flex: 1, textAlign: 'center', fontSize: 9, position: 'relative' }}>
                  <div style={{ fontSize: 16, opacity: s.n <= selected.stage ? 1 : 0.25 }}>{s.icon}</div>
                  <div style={{ color: s.n === selected.stage ? GOLD : '#555', fontWeight: s.n === selected.stage ? 700 : 400, marginTop: 2 }}>
                    {s.label.split('(')[0]}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn onClick={() => { onToast('전화 연결 중...'); setSelected(null); }} style={{ flex: 1 }}>📞 전화하기</Btn>
              <Btn onClick={() => setSelected(null)} color="#1a1a24" textColor="#aaa" style={{ border: '1px solid #333', flex: 1 }}>닫기</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 알림 센터 ─────────────────────────────────
function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const d = await api('/admin/auto-alerts');
    if (d.success && d.alerts) setAlerts(d.alerts);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: '#666' }}>AI 매니저 자동 감지 알림</div>
        <Btn onClick={load} color="#2a0a0a" textColor="#ff6666" style={{ border: '1px solid #ff4444', fontSize: 12 }}>
          {loading ? '⏳' : '🔔 새로고침'}
        </Btn>
      </div>
      {loading && <div style={{ textAlign: 'center', color: '#666', padding: 40 }}>AI 분석 중...</div>}
      {!loading && alerts.length === 0 && (
        <div style={{ textAlign: 'center', color: '#555', padding: 40 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
          <div>현재 긴급 알림 없음</div>
        </div>
      )}
      {alerts.map((a, i) => <AlertCard key={i} alert={a} />)}
    </div>
  );
}

// ── 쓴소리 ──────────────────────────────────
function BitterPanel() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const d = await api('/admin/bitter-advice', 'POST', {});
    if (d.success && d.advice) setItems(d.advice);
    setLoading(false);
  };

  const colors: Record<string, { bg: string; border: string }> = {
    high:   { bg: 'rgba(255,68,68,0.08)',  border: 'rgba(255,68,68,0.35)' },
    medium: { bg: 'rgba(255,204,0,0.06)',  border: 'rgba(255,204,0,0.35)' },
    low:    { bg: 'rgba(0,204,136,0.06)',  border: 'rgba(0,204,136,0.35)' },
  };

  return (
    <div>
      <Btn onClick={load} color="#1a0a2a" textColor="#bb77ff" style={{ border: '1px solid #aa44ff', marginBottom: 14, width: '100%' }}>
        {loading ? '⏳ AI 매니저 분석 중...' : '💬 이번 주 쓴소리 받기'}
      </Btn>
      {items.map((b, i) => {
        const c = colors[b.severity] || colors.low;
        return (
          <div key={i} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10, padding: 14, marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.6 }}>{b.icon} {b.message}</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 6 }}>→ {b.action}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── 실적 보고 ─────────────────────────────────
function ReportsPanel() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = async (p: string) => {
    setLoading(true);
    const d = await api(`/admin/reports/${p}`);
    if (d.success && d.report) setReport(d.report);
    setLoading(false);
  };

  useEffect(() => { load('daily'); }, []);

  const periodLabel: Record<string, string> = { daily: '일간', weekly: '주간', monthly: '월간' };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {(['daily', 'weekly', 'monthly'] as const).map(p => (
          <button key={p} onClick={() => { setPeriod(p); load(p); }} style={{
            padding: '7px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            border: '1px solid', fontFamily: 'inherit',
            background: period === p ? 'rgba(201,165,62,0.15)' : '#1a1a24',
            color: period === p ? GOLD : '#666',
            borderColor: period === p ? 'rgba(201,165,62,0.4)' : 'rgba(255,255,255,0.07)'
          }}>{periodLabel[p]}</button>
        ))}
      </div>
      {loading && <div style={{ textAlign: 'center', color: '#666', padding: 40 }}>보고서 생성 중...</div>}
      {report && !loading && (
        <>
          <Card>
            <CardTitle>{periodLabel[period]} 보고</CardTitle>
            <div style={{ fontSize: 15, fontWeight: 700, color: GOLD, marginBottom: 12 }}>{report.summary}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              <StatCard num={report.metrics?.customers ?? 0} label="고객 수" />
              <StatCard num={report.metrics?.consultations ?? 0} label="상담" />
              <StatCard num={`${report.metrics?.satisfaction ?? 0}`} label="만족도" />
            </div>
          </Card>
          {report.highlights?.length > 0 && (
            <Card>
              <CardTitle color="#22c55e">✅ 주요 성과</CardTitle>
              {report.highlights.map((h: string, i: number) => (
                <div key={i} style={{ fontSize: 12, padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#ccc' }}>{h}</div>
              ))}
            </Card>
          )}
          {report.concerns?.length > 0 && (
            <Card>
              <CardTitle color="#ff6666">⚠️ 우려 사항</CardTitle>
              {report.concerns.map((c: string, i: number) => (
                <div key={i} style={{ fontSize: 12, padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#ff9999' }}>{c}</div>
              ))}
            </Card>
          )}
          {report.nextActions?.length > 0 && (
            <Card>
              <CardTitle color="#4488ff">→ 행동 계획</CardTitle>
              {report.nextActions.map((a: string, i: number) => (
                <div key={i} style={{ fontSize: 12, padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#88bbff' }}>{'①②③④⑤'[i]} {a}</div>
              ))}
            </Card>
          )}
        </>
      )}
    </div>
  );
}

// ── 자율실행엔진 ──────────────────────────────
function EnginePanel({ onToast }: { onToast: (m: string) => void }) {
  const [status, setStatus] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [running, setRunning] = useState(false);

  const loadStatus = async () => {
    const d = await api('/admin/engine/status');
    if (d.success) setStatus(d);
  };
  const loadLogs = async () => {
    const d = await api('/admin/engine/logs');
    if (d.success) setLogs(d.logs || []);
  };
  const runNow = async () => {
    setRunning(true);
    await api('/admin/engine/run-now', 'POST');
    onToast('🤖 자율실행엔진 시작! 30초 후 로그 확인하세요.');
    setTimeout(() => { loadLogs(); setRunning(false); }, 5000);
  };

  useEffect(() => { loadStatus(); loadLogs(); }, []);

  return (
    <div>
      <Card style={{ background: 'rgba(0,204,136,0.06)', border: '1px solid rgba(0,204,136,0.2)' }}>
        <CardTitle color="#00cc88">🤖 자율실행엔진 상태</CardTitle>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#00cc88', animation: 'pulse 2s infinite' }} />
          <span style={{ color: '#00cc88', fontWeight: 700 }}>실행 중</span>
        </div>
        {status?.schedules?.map((s: any, i: number) => (
          <div key={i} style={{ fontSize: 12, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#ccc' }}>{s.name}</span>
            <span style={{ color: '#666', fontFamily: 'monospace' }}>{s.cron}</span>
          </div>
        ))}
      </Card>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <Btn onClick={runNow} style={{ flex: 1 }} color={running ? '#333' : GOLD} textColor="#000">
          {running ? '⏳ 실행 중...' : '▶️ 지금 즉시 실행'}
        </Btn>
        <Btn onClick={loadLogs} color="#1a1a24" textColor="#aaa" style={{ border: '1px solid #333' }}>
          🔄 로그
        </Btn>
      </div>

      <Card>
        <CardTitle>📋 실행 로그 (최근 {logs.length}건)</CardTitle>
        {logs.length === 0 && <div style={{ fontSize: 12, color: '#555' }}>로그 없음. 실행 후 확인하세요.</div>}
        {logs.slice(0, 10).map((log, i) => (
          <div key={i} style={{ fontSize: 11, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: 8 }}>
            <span style={{ color: log.severity === 'high' ? '#ff6666' : log.severity === 'medium' ? '#ffcc00' : '#00cc88' }}>
              {log.icon || '•'}
            </span>
            <span style={{ color: '#aaa', flex: 1 }}>{log.pushTitle || log.type || '실행됨'}</span>
            <span style={{ color: '#444', fontFamily: 'monospace', fontSize: 10 }}>
              {log.executedAt?.toDate ? log.executedAt.toDate().toLocaleTimeString('ko-KR') : ''}
            </span>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ── 시스템 상태 ───────────────────────────────
function SystemPanel() {
  const [sys, setSys] = useState<any>(null);

  const load = async () => {
    const d = await api('/admin/system-status');
    if (d.success) setSys(d);
  };

  useEffect(() => { load(); }, []);

  const DotRow = ({ label, status, detail }: { label: string; status: 'ok' | 'warn' | 'off'; detail?: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 13 }}>
      <span style={{ color: '#ccc' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: status === 'ok' ? '#00cc88' : status === 'warn' ? '#ffcc00' : '#ff4444' }} />
        <span style={{ fontSize: 11, color: status === 'ok' ? '#00cc88' : status === 'warn' ? '#ffcc00' : '#ff6666' }}>{detail}</span>
      </div>
    </div>
  );

  return (
    <div>
      <Card>
        <CardTitle>🖥️ 서버</CardTitle>
        <DotRow label="Render 서버" status="ok" detail="정상 운영" />
        <DotRow label="업타임" status="ok" detail={sys?.server?.uptime || '확인 중'} />
        <DotRow label="메모리" status="warn" detail={sys?.server?.memory || '확인 중'} />
      </Card>
      <Card>
        <CardTitle>🔌 API 연결</CardTitle>
        <DotRow label="Claude API" status="ok" detail="claude-sonnet-4" />
        <DotRow label="Zoom API" status="ok" detail="Server-to-Server" />
        <DotRow label="Firebase" status="warn" detail="Admin SDK 대기" />
        <DotRow label="FCM 푸시" status="warn" detail="토큰 등록 필요" />
        <DotRow label="카카오 알림톡" status="off" detail="연동 예정" />
      </Card>
      <Card>
        <CardTitle>📚 RAG 지식베이스</CardTitle>
        <DotRow label="총 청크" status="ok" detail={`${sys?.rag?.total ?? 5706}개`} />
        <DotRow label="저서" status="ok" detail="로드됨" />
        <DotRow label="AFPK 교재" status="ok" detail="로드됨" />
        <DotRow label="상담 사례" status="ok" detail="로드됨" />
      </Card>
      <Btn onClick={load} color="#1a1a24" textColor={GOLD} style={{ border: `1px solid ${GOLD}`, width: '100%' }}>🔄 상태 새로고침</Btn>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  메인 AdminPage
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('briefing');
  const [toast, setToast] = useState<string | null>(null);
  const [authed, setAuthed] = useState(false);
  const [keyInput, setKeyInput] = useState('');

  // 인증 체크
  useEffect(() => {
    const saved = localStorage.getItem('moneyaAdminKey');
    if (saved === 'moneya-admin-2026') setAuthed(true);
  }, []);

  const handleLogin = () => {
    if (keyInput === 'moneya-admin-2026') {
      localStorage.setItem('moneyaAdminKey', keyInput);
      setAuthed(true);
    } else {
      showToast('❌ 잘못된 관리자 키');
    }
  };

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const today = new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });

  const TABS: { id: Tab; icon: string; label: string; badge?: number }[] = [
    { id: 'briefing',  icon: '📋', label: '브리핑' },
    { id: 'pipeline',  icon: '🔄', label: '고객여정' },
    { id: 'alerts',    icon: '🔔', label: '알림', badge: 3 },
    { id: 'bitter',    icon: '💬', label: '쓴소리' },
    { id: 'reports',   icon: '📈', label: '보고서' },
    { id: 'engine',    icon: '🤖', label: '엔진' },
    { id: 'system',    icon: '🔗', label: '시스템' },
  ];

  // ── 로그인 화면 ─────────────────────────────
  if (!authed) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0a0a0f',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Noto Sans KR, sans-serif', color: '#e8e8f0'
      }}>
        <div style={{ width: 320, textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, background: GOLD, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, color: '#000', margin: '0 auto 16px' }}>M</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: GOLD }}>MONEYA OS</div>
          <div style={{ fontSize: 12, color: '#555', marginBottom: 32 }}>관리자 전용 시스템</div>
          <input
            type="password"
            placeholder="관리자 키 입력"
            value={keyInput}
            onChange={e => setKeyInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{
              width: '100%', background: '#1a1a24', border: '1px solid #333',
              borderRadius: 10, padding: '12px 16px', color: '#fff',
              fontSize: 14, fontFamily: 'inherit', marginBottom: 10, boxSizing: 'border-box'
            }}
          />
          <Btn onClick={handleLogin} style={{ width: '100%', padding: '12px' }}>
            🔐 로그인
          </Btn>
        </div>
      </div>
    );
  }

  // ── 메인 관리자 화면 ─────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: 'Noto Sans KR, sans-serif', color: '#e8e8f0', display: 'flex', flexDirection: 'column' }}>

      {/* 헤더 */}
      <header style={{
        background: '#111118', borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: GOLD, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#000', fontSize: 14 }}>M</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: GOLD }}>MONEYA OS</div>
            <div style={{ fontSize: 10, color: '#555', fontFamily: 'monospace' }}>{today}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00cc88' }} />
          <span style={{ fontSize: 11, color: '#555' }}>서버 연결됨</span>
          <div style={{ background: 'rgba(201,165,62,0.15)', border: '1px solid rgba(201,165,62,0.3)', color: GOLD, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
            👑 오상열 대표님
          </div>
          <button onClick={() => { localStorage.removeItem('moneyaAdminKey'); setAuthed(false); }} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: 12 }}>로그아웃</button>
        </div>
      </header>

      {/* 탭 네비게이션 */}
      <div style={{ background: '#111118', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 16px', display: 'flex', overflowX: 'auto', flexShrink: 0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '12px 14px', fontWeight: 700, fontSize: 12,
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'inherit', whiteSpace: 'nowrap', position: 'relative',
            color: tab === t.id ? GOLD : '#555',
            borderBottom: tab === t.id ? `2px solid ${GOLD}` : '2px solid transparent',
          }}>
            {t.icon} {t.label}
            {t.badge && <span style={{ position: 'absolute', top: 8, right: 6, background: '#ff4444', color: '#fff', fontSize: 9, fontWeight: 700, padding: '1px 4px', borderRadius: 8 }}>{t.badge}</span>}
          </button>
        ))}
      </div>

      {/* 콘텐츠 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', maxWidth: 900, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        {tab === 'briefing' && <BriefingPanel />}
        {tab === 'pipeline' && <PipelinePanel onToast={showToast} />}
        {tab === 'alerts'   && <AlertsPanel />}
        {tab === 'bitter'   && <BitterPanel />}
        {tab === 'reports'  && <ReportsPanel />}
        {tab === 'engine'   && <EnginePanel onToast={showToast} />}
        {tab === 'system'   && <SystemPanel />}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)',
          color: '#e8e8f0', padding: '10px 20px', borderRadius: 24,
          fontSize: 13, fontWeight: 600, zIndex: 200, whiteSpace: 'nowrap',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}>{toast}</div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}
