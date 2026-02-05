// ============================================
// DeleteAccountPage - 계정 삭제 안내 페이지
// Google Play 스토어 정책 준수용
// ============================================

import React, { useState } from 'react';

const DeleteAccountPage: React.FC = () => {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      color: '#f0f9ff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* 헤더 */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
        padding: '40px 20px 30px',
        textAlign: 'center',
        borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          fontSize: '28px',
        }}>
          💰
        </div>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          margin: '0 0 8px',
          color: '#f0f9ff',
        }}>
          AI머니야 - 계정 삭제 안내
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#94a3b8',
          margin: 0,
        }}>
          AI Moneya - Account Deletion Guide
        </p>
      </div>

      {/* 본문 */}
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '24px 20px',
      }}>
        {/* 안내 섹션 */}
        <div style={{
          backgroundColor: 'rgba(30, 58, 95, 0.5)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '20px',
          border: '1px solid rgba(56, 189, 248, 0.15)',
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#38bdf8',
            marginTop: 0,
            marginBottom: '16px',
          }}>
            📋 계정 삭제 방법 (How to Delete Your Account)
          </h2>

          <div style={{ lineHeight: '1.8', fontSize: '15px', color: '#cbd5e1' }}>
            <p style={{ margin: '0 0 16px' }}>
              AI머니야 계정을 삭제하려면 아래 단계를 따라주세요:
            </p>

            <div style={{
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '12px',
            }}>
              <p style={{ margin: '0 0 8px', fontWeight: '600', color: '#f0f9ff' }}>
                Step 1. 앱 내에서 삭제 요청
              </p>
              <p style={{ margin: 0, fontSize: '14px' }}>
                AI머니야 앱 → 마이페이지(My Page) → 설정 → "계정 삭제" 버튼을 탭하세요.
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                In the app: My Page → Settings → "Delete Account" button
              </p>
            </div>

            <div style={{
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '12px',
            }}>
              <p style={{ margin: '0 0 8px', fontWeight: '600', color: '#f0f9ff' }}>
                Step 2. 이메일로 삭제 요청
              </p>
              <p style={{ margin: 0, fontSize: '14px' }}>
                앱 내 삭제가 어려운 경우, 아래 이메일로 계정 삭제를 요청하실 수 있습니다.
              </p>
              <p style={{ margin: '8px 0 0' }}>
                <a
                  href="mailto:moneyaappreview@gmail.com?subject=Account%20Deletion%20Request&body=Please%20delete%20my%20AI%20Moneya%20account.%20My%20registered%20email%20is%3A%20"
                  style={{
                    color: '#38bdf8',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '15px',
                  }}
                >
                  📧 moneyaappreview@gmail.com
                </a>
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                Email us with your registered email address for deletion.
              </p>
            </div>

            <div style={{
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              borderRadius: '12px',
              padding: '16px',
            }}>
              <p style={{ margin: '0 0 8px', fontWeight: '600', color: '#f0f9ff' }}>
                Step 3. 처리 완료
              </p>
              <p style={{ margin: 0, fontSize: '14px' }}>
                요청 접수 후 7일 이내에 계정 삭제가 완료됩니다.
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                Your account will be deleted within 7 business days after the request.
              </p>
            </div>
          </div>
        </div>

        {/* 삭제되는 데이터 */}
        <div style={{
          backgroundColor: 'rgba(30, 58, 95, 0.5)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '20px',
          border: '1px solid rgba(56, 189, 248, 0.15)',
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#f87171',
            marginTop: 0,
            marginBottom: '16px',
          }}>
            🗑️ 삭제되는 데이터 (Data to be Deleted)
          </h2>

          <div style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.8' }}>
            <p style={{ margin: '0 0 12px' }}>
              계정 삭제 시 다음 데이터가 <span style={{ color: '#f87171', fontWeight: '600' }}>영구적으로 삭제</span>됩니다:
            </p>
            <p style={{ margin: '0 0 8px' }}>• 프로필 정보 (이름, 이메일) — Profile information (name, email)</p>
            <p style={{ margin: '0 0 8px' }}>• 재무진단 데이터 — Financial diagnosis data</p>
            <p style={{ margin: '0 0 8px' }}>• 수입/지출 기록 — Income/expense records</p>
            <p style={{ margin: '0 0 8px' }}>• 금융집짓기 설계 데이터 — Financial House Building data</p>
            <p style={{ margin: '0 0 8px' }}>• AI 대화 기록 — AI conversation history</p>
            <p style={{ margin: '0 0 8px' }}>• 재무설계 리포트 — Financial planning reports</p>
            <p style={{ margin: '0 0 0' }}>• 앱 설정 및 환경설정 — App settings and preferences</p>
          </div>
        </div>

        {/* 보관되는 데이터 */}
        <div style={{
          backgroundColor: 'rgba(30, 58, 95, 0.5)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '20px',
          border: '1px solid rgba(56, 189, 248, 0.15)',
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#fbbf24',
            marginTop: 0,
            marginBottom: '16px',
          }}>
            📦 일시적으로 보관되는 데이터 (Temporarily Retained Data)
          </h2>

          <div style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.8' }}>
            <p style={{ margin: '0 0 12px' }}>
              법적 의무 준수를 위해 다음 데이터는 삭제 요청 후 <span style={{ color: '#fbbf24', fontWeight: '600' }}>최대 30일간</span> 보관 후 삭제됩니다:
            </p>
            <p style={{ margin: '0 0 8px' }}>• 서비스 이용 로그 — Service usage logs (30 days)</p>
            <p style={{ margin: '0 0 0' }}>• 본인 확인 기록 — Identity verification records (30 days)</p>
          </div>
        </div>

        {/* 주의사항 */}
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#f87171',
            marginTop: 0,
            marginBottom: '12px',
          }}>
            ⚠️ 주의사항 (Important Notice)
          </h2>

          <div style={{ fontSize: '14px', color: '#fca5a5', lineHeight: '1.8' }}>
            <p style={{ margin: '0 0 8px' }}>
              • 계정 삭제 후에는 데이터를 복구할 수 없습니다.
            </p>
            <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#94a3b8' }}>
              Account deletion is permanent and data cannot be recovered.
            </p>
            <p style={{ margin: '0 0 8px' }}>
              • 삭제 전 필요한 재무설계 리포트는 미리 PDF로 저장해 주세요.
            </p>
            <p style={{ margin: '0 0 0', fontSize: '13px', color: '#94a3b8' }}>
              Please save any financial reports as PDF before deletion.
            </p>
          </div>
        </div>

        {/* 문의 */}
        <div style={{
          textAlign: 'center',
          padding: '20px',
          borderTop: '1px solid rgba(56, 189, 248, 0.15)',
        }}>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 8px' }}>
            문의사항이 있으시면 아래로 연락해 주세요.
          </p>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 4px' }}>
            For inquiries, please contact us at:
          </p>
          <a
            href="mailto:moneyaappreview@gmail.com"
            style={{
              color: '#38bdf8',
              textDecoration: 'none',
              fontWeight: '600',
            }}
          >
            moneyaappreview@gmail.com
          </a>
          <p style={{ fontSize: '12px', color: '#475569', marginTop: '20px' }}>
            © 2026 오원트금융연구소 (Owant Financial Research Institute). All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountPage;
