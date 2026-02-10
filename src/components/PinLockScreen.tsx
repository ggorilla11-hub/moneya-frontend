// PinLockScreen.tsx v1.0: PIN 잠금 화면 컴포넌트
// ★★★ 신규 파일 - 기존 코드 영향 없음 ★★★
// 위치: src/components/PinLockScreen.tsx

import React, { useState, useCallback, useEffect, useRef } from 'react';

interface PinLockScreenProps {
  uid: string;
  onSuccess: () => void;
}

const PinLockScreen: React.FC<PinLockScreenProps> = ({ uid, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [failCount, setFailCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 저장된 PIN 해시 가져오기
  const getStoredPinHash = (): string | null => {
    return localStorage.getItem(`moneya_pin_${uid}`);
  };

  // PIN 해시 생성 (SHA-256 시뮬레이션, 실제 배포 시 crypto.subtle 사용 권장)
  const hashPin = (input: string): string => {
    // 간단한 해시: btoa + salt (프로덕션에서는 SHA-256 사용)
    return btoa(input + '_moneya_pin_salt_' + uid);
  };

  // 잠금 타이머
  useEffect(() => {
    if (isLocked && lockTimer > 0) {
      timerRef.current = setInterval(() => {
        setLockTimer(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            setFailCount(0);
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [isLocked, lockTimer]);

  // 흔들림 애니메이션
  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  // 키 입력 처리
  const handleKey = useCallback((key: string) => {
    if (isLocked) return;

    if (key === 'delete') {
      setPin(prev => prev.slice(0, -1));
      return;
    }

    if (pin.length >= 4) return;

    const newPin = pin + key;
    setPin(newPin);

    if (newPin.length === 4) {
      setTimeout(() => {
        const storedHash = getStoredPinHash();
        if (storedHash && hashPin(newPin) === storedHash) {
          // 성공
          setSuccess(true);
          setFailCount(0);
          setTimeout(() => {
            onSuccess();
          }, 500);
        } else {
          // 실패
          const newFailCount = failCount + 1;
          setFailCount(newFailCount);
          triggerShake();
          setTimeout(() => setPin(''), 300);
          if (newFailCount >= 3) {
            setIsLocked(true);
            setLockTimer(30);
          }
        }
      }, 200);
    }
  }, [pin, isLocked, failCount, uid, onSuccess]);

  // PIN 도트
  const renderDots = () => (
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
  );

  // 키패드
  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', 'delete'],
  ];

  const renderKeypad = () => (
    <div style={{ padding: '0 32px' }}>
      {keys.map((row, ri) => (
        <div key={ri} style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 12 }}>
          {row.map((key, ki) => (
            <button
              key={ki}
              onClick={() => key && handleKey(key)}
              disabled={!key || isLocked}
              style={{
                width: 72,
                height: 56,
                borderRadius: 12,
                border: 'none',
                background: !key ? 'transparent' : '#F3F4F6',
                fontSize: key === 'delete' ? 18 : 22,
                fontWeight: 600,
                color: isLocked ? '#D1D5DB' : '#1A1A2E',
                cursor: key && !isLocked ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isLocked ? 0.5 : 1,
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {key === 'delete' ? '⌫' : key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );

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
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#1A1A2E', marginBottom: 8 }}>
        PIN을 입력해주세요
      </div>

      {/* 상태 메시지 */}
      {isLocked ? (
        <div style={{
          color: '#EF4444', fontSize: 13, fontWeight: 600, marginBottom: 24,
          padding: '8px 16px', background: '#FEE2E2', borderRadius: 8,
        }}>
          ⏳ {lockTimer}초 후 다시 시도해주세요
        </div>
      ) : failCount > 0 ? (
        <div style={{ color: '#EF4444', fontSize: 13, fontWeight: 500, marginBottom: 24 }}>
          PIN이 틀렸습니다 ({failCount}/3)
        </div>
      ) : (
        <div style={{ height: 20, marginBottom: 24 }} />
      )}

      {/* PIN 도트 (흔들림 적용) */}
      <div style={{ animation: shake ? 'pinShake 0.5s ease' : 'none' }}>
        {renderDots()}
      </div>

      {renderKeypad()}

      {/* 흔들림 애니메이션 CSS */}
      <style>{`
        @keyframes pinShake {
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

export default PinLockScreen;
