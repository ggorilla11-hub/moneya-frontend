export interface PeerStats {
  ageGroup: string;
  avgSavingsRate: number;
  avgWealthIndex: number;
  totalCount: number;
}

export interface DailySnapshot {
  date: string;
  daysSinceJoin: number;
  netSavings: number;
  netAssets: number;
}

// 순자산 스냅샷 (재무진단 입력 시 저장)
export interface NetAssetsSnapshot {
  date: string;
  year: number;
  month: number;
  netAssets: number;
  totalAssets: number;
  totalDebt: number;
}

export const getAgeGroup = (age: number): string => {
  if (age < 30) return '20대';
  if (age < 40) return '30대';
  if (age < 50) return '40대';
  if (age < 60) return '50대';
  return '60대 이상';
};

export const getPeerStats = async (ageGroup: string): Promise<PeerStats> => {
  const dummyStats: Record<string, PeerStats> = {
    '20대': { ageGroup: '20대', avgSavingsRate: 15, avgWealthIndex: 85, totalCount: 342 },
    '30대': { ageGroup: '30대', avgSavingsRate: 18, avgWealthIndex: 112, totalCount: 567 },
    '40대': { ageGroup: '40대', avgSavingsRate: 20, avgWealthIndex: 142, totalCount: 1247 },
    '50대': { ageGroup: '50대', avgSavingsRate: 22, avgWealthIndex: 178, totalCount: 891 },
    '60대 이상': { ageGroup: '60대 이상', avgSavingsRate: 25, avgWealthIndex: 195, totalCount: 423 },
  };
  
  return dummyStats[ageGroup] || dummyStats['40대'];
};

export const getMyRank = async (ageGroup: string, myValue: number, metric: 'savingsRate' | 'wealthIndex'): Promise<number> => {
  const stats = await getPeerStats(ageGroup);
  const avgValue = metric === 'savingsRate' ? stats.avgSavingsRate : stats.avgWealthIndex;
  
  if (myValue >= avgValue * 1.5) return 5;
  if (myValue >= avgValue * 1.3) return 10;
  if (myValue >= avgValue * 1.1) return 20;
  if (myValue >= avgValue) return 35;
  if (myValue >= avgValue * 0.8) return 50;
  if (myValue >= avgValue * 0.6) return 70;
  return 85;
};

export const saveJoinDate = (userId: string): void => {
  const key = `moneya_joinDate_${userId}`;
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, new Date().toISOString());
  }
};

export const getDaysSinceJoin = (userId: string): number => {
  const key = `moneya_joinDate_${userId}`;
  const joinDateStr = localStorage.getItem(key);
  
  if (!joinDateStr) {
    saveJoinDate(userId);
    return 0;
  }
  
  const joinDate = new Date(joinDateStr);
  const today = new Date();
  const diffTime = today.getTime() - joinDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

export const saveDailySnapshot = (userId: string, snapshot: DailySnapshot): void => {
  const key = `moneya_snapshots_${userId}`;
  const existing = localStorage.getItem(key);
  let snapshots: DailySnapshot[] = existing ? JSON.parse(existing) : [];
  
  const existingIndex = snapshots.findIndex(s => s.date === snapshot.date);
  if (existingIndex >= 0) {
    snapshots[existingIndex] = snapshot;
  } else {
    snapshots.push(snapshot);
  }
  
  snapshots = snapshots.slice(-90);
  localStorage.setItem(key, JSON.stringify(snapshots));
};

export const getSnapshots = (userId: string): DailySnapshot[] => {
  const key = `moneya_snapshots_${userId}`;
  const existing = localStorage.getItem(key);
  return existing ? JSON.parse(existing) : [];
};

// 순자산 스냅샷 저장 (재무진단 입력 시 호출)
export const saveNetAssetsSnapshot = (userId: string, totalAssets: number, totalDebt: number): void => {
  const key = `moneya_netAssets_${userId}`;
  const existing = localStorage.getItem(key);
  let snapshots: NetAssetsSnapshot[] = existing ? JSON.parse(existing) : [];
  
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const date = now.toISOString().split('T')[0];
  
  const newSnapshot: NetAssetsSnapshot = {
    date,
    year,
    month,
    netAssets: totalAssets - totalDebt,
    totalAssets,
    totalDebt,
  };
  
  // 같은 월에 이미 데이터가 있으면 업데이트, 없으면 추가
  const existingIndex = snapshots.findIndex(s => s.year === year && s.month === month);
  if (existingIndex >= 0) {
    snapshots[existingIndex] = newSnapshot;
  } else {
    snapshots.push(newSnapshot);
  }
  
  // 최근 12개월만 유지
  snapshots = snapshots
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    })
    .slice(-12);
  
  localStorage.setItem(key, JSON.stringify(snapshots));
};

// 순자산 스냅샷 조회
export const getNetAssetsSnapshots = (userId: string): NetAssetsSnapshot[] => {
  const key = `moneya_netAssets_${userId}`;
  const existing = localStorage.getItem(key);
  const snapshots: NetAssetsSnapshot[] = existing ? JSON.parse(existing) : [];
  
  return snapshots.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });
};

// 최근 N개월 라벨 생성
export const getRecentMonthLabels = (months: number = 4): { month: string; year: number; monthNum: number }[] => {
  const result = [];
  const now = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({
      month: (date.getMonth() + 1) + '월',
      year: date.getFullYear(),
      monthNum: date.getMonth() + 1,
    });
  }
  
  return result;
};
