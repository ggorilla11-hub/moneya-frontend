import { useState } from 'react';

interface SpendInputProps {
  isInputMethodOpen: boolean;
  setIsInputMethodOpen: (open: boolean) => void;
}

interface Bank {
  id: string;
  name: string;
  logo: string;
  color: string;
}

function SpendInput({ isInputMethodOpen, setIsInputMethodOpen }: SpendInputProps) {
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [connectedBanks, setConnectedBanks] = useState<string[]>(['KB국민은행']);

  const banks: Bank[] = [
    { id: 'kb', name: 'KB국민은행', logo: 'KB', color: 'bg-amber-500' },
    { id: 'shinhan', name: '신한은행', logo: '신한', color: 'bg-blue-600' },
    { id: 'woori', name: '우리은행', logo: '우리', color: 'bg-blue-500' },
    { id: 'hana', name: '하나은행', logo: '하나', color: 'bg-green-600' },
    { id: 'kakao', name: '카카오뱅크', logo: '카카오', color: 'bg-yellow-400' },
  ];

  const handleBankConnect = (bankName: string) => {
    if (connectedBanks.includes(bankName)) {
      setConnectedBanks(prev => prev.filter(b => b !== bankName));
    } else {
      setConnectedBanks(prev => [...prev, bankName]);
    }
  };

  return (
    <>
      {/* 지출 입력 방식 선택 모달 */}
      {isInputMethodOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsInputMethodOpen(false)}>
          <div className="w-full max-w-md bg-white rounded-2xl p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">지출 입력 방식</h2>
              <button onClick={() => setIsInputMethodOpen(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
              </button>
            </div>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-4 p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-gray-800">수동 입력</p>
                  <p className="text-sm text-gray-500">직접 입력해요</p>
                </div>
              </button>
              <button onClick={() => { setIsInputMethodOpen(false); setIsReceiptModalOpen(true); }} className="w-full flex items-center gap-4 p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 24 24"><path d="M9 3L7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2h-3.17L15 3H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-gray-800">영수증 촬영</p>
                  <p className="text-sm text-gray-500">자동 인식</p>
                </div>
              </button>
              <button onClick={() => { setIsInputMethodOpen(false); setIsBankModalOpen(true); }} className="w-full flex items-center gap-4 p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24"><path d="M4 10h3v7H4zm6.5 0h3v7h-3zM2 19h20v3H2zm15-9h3v7h-3zm-5-9L2 6v2h20V6z"/></svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-gray-800">계좌 연동</p>
                  <p className="text-sm text-gray-500">자동 기록</p>
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-bold rounded-md">추천</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 영수증 촬영 모달 */}
      {isReceiptModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsReceiptModalOpen(false)}>
          <div className="w-full max-w-md bg-white rounded-2xl p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">영수증 촬영</h2>
              <button onClick={() => setIsReceiptModalOpen(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
              </button>
            </div>
            <div className="bg-gray-900 rounded-2xl p-6 mb-4">
              <div className="border-2 border-dashed border-gray-600 rounded-xl p-6 flex flex-col items-center">
                <p className="text-white font-semibold text-sm">영수증을 프레임 안에</p>
                <p className="text-blue-400 text-xs">자동 인식됩니다</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex-1 py-3 bg-gray-100 rounded-xl text-gray-700 font-semibold">앨범</button>
              <button className="flex-1 py-3 bg-blue-600 rounded-xl text-white font-semibold">촬영</button>
            </div>
          </div>
        </div>
      )}

      {/* 계좌 연동 모달 */}
      {isBankModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsBankModalOpen(false)}>
          <div className="w-full max-w-md bg-white rounded-2xl p-5 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">계좌 연동</h2>
              <button onClick={() => setIsBankModalOpen(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
              </button>
            </div>
            <div className="space-y-3">
              {banks.map((bank) => {
                const isBankConnected = connectedBanks.includes(bank.name);
                return (
                  <div key={bank.id} className={`flex items-center gap-4 p-4 rounded-2xl border-2 ${isBankConnected ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                    <div className={`w-12 h-12 ${bank.color} rounded-xl flex items-center justify-center`}>
                      <span className="text-white font-bold text-xs">{bank.logo}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800 text-sm">{bank.name}</p>
                      <p className="text-xs text-gray-500">{isBankConnected ? '연결됨' : '연결 필요'}</p>
                    </div>
                    <button onClick={() => handleBankConnect(bank.name)} className={`px-3 py-1.5 rounded-lg font-semibold text-xs ${isBankConnected ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'}`}>
                      {isBankConnected ? '연결됨' : '연결'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SpendInput;
