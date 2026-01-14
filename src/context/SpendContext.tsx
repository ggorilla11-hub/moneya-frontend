// src/context/SpendContext.tsx
// 지출 데이터 전역 상태 관리 (공용 서랍장)

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { SpendItem, SpendType } from '../types/spend';

interface SpendContextType {
  spendItems: SpendItem[];
  addSpendItem: (item: Omit<SpendItem, 'id' | 'createdAt'>) => void;
  deleteSpendItem: (id: string) => void;
  updateSpendItem: (id: string, updates: Partial<SpendItem>) => void;
  getTodayItems: () => SpendItem[];
  getMonthItems: () => SpendItem[];
  todaySpent: number;
  todaySaved: number;
  todayInvestment: number;
}

const SpendContext = createContext<SpendContextType | undefined>(undefined);

interface SpendProviderProps {
  children: ReactNode;
  userId?: string;
}

export function SpendProvider({ children, userId = 'default' }: SpendProviderProps) {
  const [spendItems, setSpendItems] = useState<SpendItem[]>([]);
  const storageKey = `moneya_spend_${userId}`;

  // localStorage에서 데이터 불러오기
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        const items = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
          createdAt: new Date(item.createdAt),
        }));
        setSpendItems(items);
      }
    } catch (e) {
      console.error('데이터 로드 실패:', e);
    }
  }, [storageKey]);

  // localStorage에 데이터 저장
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(spendItems));
    } catch (e) {
      console.error('데이터 저장 실패:', e);
    }
  }, [spendItems, storageKey]);

  // 지출 추가
  const addSpendItem = (item: Omit<SpendItem, 'id' | 'createdAt'>) => {
    const newItem: SpendItem = {
      ...item,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };
    setSpendItems(prev => [newItem, ...prev]);
  };

  // 지출 삭제
  const deleteSpendItem = (id: string) => {
    setSpendItems(prev => prev.filter(item => item.id !== id));
  };

  // 지출 수정
  const updateSpendItem = (id: string, updates: Partial<SpendItem>) => {
    setSpendItems(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  // 오늘 데이터 조회
  const getTodayItems = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return spendItems.filter(item => {
      const itemDate = new Date(item.timestamp);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate.getTime() === today.getTime();
    });
  };

  // 이번 달 데이터 조회
  const getMonthItems = () => {
    const now = new Date();
    return spendItems.filter(item => {
      const itemDate = new Date(item.timestamp);
      return (
        itemDate.getMonth() === now.getMonth() &&
        itemDate.getFullYear() === now.getFullYear()
      );
    });
  };

  // 오늘 합계 계산
  const todayItems = getTodayItems();
  
  const todaySpent = todayItems
    .filter(item => item.type === 'spent')
    .reduce((sum, item) => sum + item.amount, 0);

  const todaySaved = todayItems
    .filter(item => item.type === 'saved')
    .reduce((sum, item) => sum + item.amount, 0);

  const todayInvestment = todayItems
    .filter(item => item.type === 'investment')
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <SpendContext.Provider
      value={{
        spendItems,
        addSpendItem,
        deleteSpendItem,
        updateSpendItem,
        getTodayItems,
        getMonthItems,
        todaySpent,
        todaySaved,
        todayInvestment,
      }}
    >
      {children}
    </SpendContext.Provider>
  );
}

// 사용하기 쉽게 만든 Hook
export function useSpend() {
  const context = useContext(SpendContext);
  if (!context) {
    throw new Error('useSpend must be used within a SpendProvider');
  }
  return context;
}
