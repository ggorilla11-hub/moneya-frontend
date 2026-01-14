import { getFirestore, collection, doc, setDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { auth } from '../config/firebase';

const db = getFirestore();

export const getAgeGroup = (age: number): string => {
  if (age < 20) return '10대';
  if (age < 30) return '20대';
  if (age < 40) return '30대';
  if (age < 50) return '40대';
  if (age < 60) return '50대';
  return '60대 이상';
};

export const getIncomeRange = (income: number): string => {
  if (income < 200) return '0-200';
  if (income < 300) return '200-300';
  if (income < 400) return '300-400';
  if (income < 500) return '400-500';
  if (income < 700) return '500-700';
  if (income < 1000) return '700-1000';
  return '1000+';
};

export interface UserStats {
  odId visitorId visitorId visitorId: string;
  ageGroup: string;
  incomeRange: string;
  familySize: number;
  savingsRate: number;
  wealthIndex: number;
  debtRatio: number;
  netAssets: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const saveUserStats = async (
  odId visitorId visitorId visitorId: string,
  age: number,
  income: number,
  familySize: number,
  savingsRate: number,
  wealthIndex: number,
  debtRatio: number,
  netAssets: number
): Promise<void> => {
  try {
    const statsRef = doc(db, 'userStats', odId visitorId visitorId visitorId);
    const now = Timestamp.now();
    
    await setDoc(statsRef, {
      odId visitorId visitorId visitorId: odId visitorId visitorId visitorId,
      ageGroup: getAgeGroup(age),
      incomeRange: getIncomeRange(income),
      familySize,
      savingsRate,
      wealthIndex,
visitorId      debtRatio,
      netAssets,
      createdAt: now,
      updatedAt: now,
    }, { merge: true });
    
    console.log('User stats saved successfully');
  } catch (error) {
    console.error('Error saving user stats:', error);
  }
};

export interface PeerStats {
  avgSavingsRate: number;
  avgWealthIndex: number;
  avgDebtRatio: number;
  avgNetAssets: number;
  totalCount: number;
}

export const getPeerStats = async (ageGroup: string): Promise<PeerStats> => {
  try {
    const statsRef = collection(db, 'userStats');
    const q = query(statsRef, where('ageGroup', '==', ageGroup));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return {
        avgSavingsRate: 18,
        avgWealthIndex: 142,
        avgDebtRatio: 32,
        avgNetAssets: 8000,
        totalCount: 0,
      };
    }
    
    let totalSavingsRate = 0;
    let totalWealthIndex = 0;
    let totalDebtRatio = 0;
    let totalNetAssets = 0;
    let count = 0;
    
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      totalSavingsRate += data.savingsRate || 0;
      totalWealthIndex += data.wealthIndex || 0;
      totalDebtRatio += data.debtRatio || 0;
      totalNetAssets += data.netAssets || 0;
      count++;
    });
    
    return {
      avgSavingsRate: Math.round(totalSavingsRate / count),
      avgWealthIndex: Math.round(totalWealthIndex / count),
      avgDebtRatio: Math.round(totalDebtRatio / count),
      avgNetAssets: Math.round(totalNetAssets / count),
      totalCount: count,
    };
  } catch (error) {
    console.error('Error getting peer stats:', error);
    return {
      avgSavingsRate: 18,
      avgWealthIndex: 142,
      avgDebtRatio: 32,
      avgNetAssets: 8000,
      totalCount: 0,
    };
  }
};

export const getMyRank = async (ageGroup: string, myValue: number, field: string): Promise<number> => {
  try {
    const statsRef = collection(db, 'userStats');
    const q = query(statsRef, where('ageGroup', '==', ageGroup));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return 15;
    
    const values: number[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      values.push(data[field] || 0);
    });
    
    values.sort((a, b) => b - a);
    const myPosition = values.findIndex(v => myValue >= v) + 1;
    const percentile = Math.round((myPosition / values.length) * 100);
    
    return Math.max(1, Math.min(percentile, 99));
  } catch (error) {
    console.error('Error calculating rank:', error);
    return 15;
  }
};

export interface DailySnapshot {
  date: string;
  daysSinceJoin: number;
  netSavings: number;
  netAssets: number;
}

export const saveDailySnapshot = (userId: string, snapshot: DailySnapshot): void => {
  const key = `moneya_snapshots_${userId}`;
  const existing = localStorage.getItem(key);
  const snapshots: DailySnapshot[] = existing ? JSON.parse(existing) : [];
  
  const todayIndex = snapshots.findIndex(s => s.date === snapshot.date);
  if (todayIndex >= 0) {
    snapshots[todayIndex] = snapshot;
  } else {
    snapshots.push(snapshot);
  }
  
  localStorage.setItem(key, JSON.stringify(snapshots));
};

export const getSnapshots = (userId: string): DailySnapshot[] => {
  const key = `moneya_snapshots_${userId}`;
  const existing = localStorage.getItem(key);
  return existing ? JSON.parse(existing) : [];
};

export const saveJoinDate = (userId: string): void => {
  const key = `moneya_joinDate_${userId}`;
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, new Date().toISOString());
  }
};

export const getJoinDate = (userId: string): Date => {
  const key = `moneya_joinDate_${userId}`;
  const saved = localStorage.getItem(key);
  return saved ? new Date(saved) : new Date();
};

export const getDaysSinceJoin = (userId: string): number => {
  const joinDate = getJoinDate(userId);
  const today = new Date();
  const diffTime = today.getTime() - joinDate.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};
