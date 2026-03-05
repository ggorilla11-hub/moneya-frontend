// useSubscription.ts — 구독 상태 확인 훅 (상담머니야용)
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export function useSubscription(uid: string | undefined) {
  const [isSubscriber, setIsSubscriber] = useState(false);
  const [subscriptionType, setSubscriptionType] = useState<string>('none');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    const checkSubscription = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const pType = data.paymentType || 'none';
          const status = data.subscriptionStatus || 'none';

          setSubscriptionType(pType);
          setIsSubscriber(
            (pType === 'consultation_only' || pType === 'consultation_subscription') &&
            status === 'active'
          );
        }
      } catch (e) {
        console.error('[useSubscription] 구독 확인 실패:', e);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, [uid]);

  return { isSubscriber, subscriptionType, loading };
}
