// PinSetupScreen.tsx v1.0: PIN 설정/변경/해제 화면 컴포넌트
// ★★★ 신규 파일 - 기존 코드 영향 없음 ★★★
// 위치: src/components/PinSetupScreen.tsx

import React, { useState, useCallback } from 'react';

type PinMode = 'setup' | 'change' | 'disable';

interface PinSetupScreenProps {
  uid: string;
  mode: PinMode;
  onComplete: () => void;
  onCancel: () => void;
}

const PinSetupScreen: React.FC<PinSetupScreenProps> = ({ uid, mode, onComplete, onCancel }) => {
  const [phase, setPhase] = useState<'verify' | 'enter' | 'confirm'>(
    mode === 'setup' ? 'enter' : 'verify'
  );
  const [pin, setPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState('');

  const hashPin = (input: string): string => {
    return btoa(input + '_moneya_pin_salt_' + uid);
  };

  const getStoredPinHash = (): string | null => {
    return localStorage.getItem(`moneya_pin_${uid}`);
  };

  const savePinHash = (pinValue: string) => {
    localStorage.setItem(`moneya_pin_${uid}`, hashPin(pinValue));
    localStorage.setItem(`moneya_pin_enabled_${uid}`, 'true');
  };

  const removePinData = () => {
    localStorage.removeItem(`moneya_pin_${uid}`);
    localStorage.removeItem(`moneya_pin_enabled_${uid}`);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const processPin = useCallback((inputPin: string) => {
    if (phase === 'verify') {
      const storedHash = getStoredPinHash();
      if (storedHash && hashPin(inputPin) === storedHash) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setPin('');
          if (mode === 'disable') {
            removePinData();
            showToast('🔓 PIN 잠금이 해제되었습니다');
            setTimeout(() => onComplete(), 800);
          } else {
            setPhase('enter');
            showToast('현재 PIN 확인 완료');
          }
        }, 500);
      } else {
        triggerShake();
        setTimeout(() => {
          setPin('');
          showToast('❌ 현재 PIN이 일치하지 않습니다');
        }, 300);
      }
    } else if (phase === 'enter') {
      setNewPin(inputPin);
      setPin('');
      setPhase('confirm');
    } else if (phase === 'confirm') {
      if (inputPin === newPin) {
        setSuccess(true);
        savePinHash(inputPin);
        setTimeout(() => {
          showToast('✅ PIN이 설정되었습니다');
          setTimeout(() => onComplete(), 800);
        }, 500);
      } else {
        triggerShake();
        setTimeout(() => {
          setPin('');
          setNewPin('');
          setPhase('enter');
          showToast('❌ PIN이 일치하지 않습니다. 다시 설정해주세요');
        }, 300);
      }
    }
  }, [phase, newPin, mode, uid, onComplete]);

  const handleKey = useCallback((key: string) => {
    if (key === 'delete') {
      setPin(prev => prev.slice(0, -1));
      return;
    }

    if (pin.length >= 4) return;

    const currentPin = pin + key;
    setPin(currentPin);

    if (currentPin.length === 4) {
      setTimeout(() => processPin(currentPin), 200);
    }
  }, [pin, processPin]);

  const getScreenInfo = () => {
    if (phase === 'verify') {
      return {
        headerTitle: mode === 'change' ? 'PIN 변경' : 'PIN 해제',
        emoji: mode === 'change' ? '🔄' : '🔓',
        title: '현재 PIN을 입력해주세요',
        sub: mode === 'change' ? '확인 후 새 PIN을 설정합니다' : 'PIN 잠금을 해제합니다',
      };
    }
    if (phase === 'enter') {
      return {
        headerTitle: 'PIN 설정',
        emoji: '🔑',
        title: '새 PIN 입력',
        sub: '4자리 숫자를 입력해주세요',
      };
    }
    return {
      headerTitle: 'PIN 설정',
      emoji: '🔐',
      title: 'PIN 다시 입력',
      sub: '확인을 위해 한 번 더 입력해주세요',
    };
  };

  const info = getScreenInfo();
  const showStepDots = phase === 'enter' || phase === 'confirm';

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', 'delete'],
  ];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        background: 'linear-gradient(180deg, #FAFAFA 0%, #F0F0F0 100%)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 헤더 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        borderBottom: '1px solid #E5E7EB',
        background: 'white',
      }}>
        <button
          onClick={onCancel}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 20,
            cursor: 'pointer',
            padding: '4px 8px',
          }}
        >
          ←
        </button>
        <span style={{ fontSize: 16, fontWeight: 700, marginLeft: 8 }}>
          {info.headerTitle}
        </span>
      </div>

      {/* 콘텐츠 */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>{info.emoji}</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1A1A2E', marginBottom: 8 }}>
          {info.title}
        </div>
        <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 32 }}>
          {info.sub}
        </div>

        {/* PIN 도트 */}
        <div style={{ animation: shake ? 'pinSetupShake 0.5s ease' : 'none' }}>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 32 }}>
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  border: `2px solid ${i < pin.length ? (success ? '#10B981' : '#00C853') : '#D1D5DB'}`,
                  background: i < pin.length ? (success ? '#10B981' : '#00C853') : 'transparent',
                  transition: 'all 0.15s ease',
                  transform: i < pin.length ? 'scale(1.2)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        </div>

        {/* 키패드 */}
        <div style={{ padding: '0 32px' }}>
          {keys.map((row, ri) => (
            <div key={ri} style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 12 }}>
              {row.map((key, ki) => (
                <button
                  key={ki}
                  onClick={() => key && handleKey(key)}
                  disabled={!key}
                  style={{
                    width: 72,
                    height: 56,
                    borderRadius: 12,
                    border: 'none',
                    background: !key ? 'transparent' : '#F3F4F6',
                    fontSize: key === 'delete' ? 18 : 22,
                    fontWeight: 600,
                    color: '#1A1A2E',
                    cursor: key ? 'pointer' : 'default',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  {key === 'delete' ? '⌫' : key}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* 단계 도트 */}
        {showStepDots && (
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#00C853',
            }} />
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: phase === 'confirm' ? '#00C853' : '#D1D5DB',
            }} />
          </div>
        )}
      </div>

      {/* 토스트 */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.85)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: 12,
          fontSize: 14,
          fontWeight: 600,
          zIndex: 10000,
          whiteSpace: 'nowrap',
        }}>
          {toast}
        </div>
      )}

      {/* 흔들림 애니메이션 CSS */}
      <style>{`
        @keyframes pinSetupShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-12px); }
          40% { transform: translateX(12px); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
};

export default PinSetupScreen;
