import { useState } from 'react';

export interface SpendItem {
  id: string;
  name: string;
  amount: number;
  type: 'spent' | 'saved' | 'investment';
  category: string;
  time: string;
  tag?: string;
}

interface SpendTimelineProps {
  spendItems: SpendItem[];
  todaySpent: number;
  todaySaved: number;
  todayInvestment: number;
}

function SpendTimeline({ spendItems, todaySpent, todaySaved, todayInvestment }: SpendTimelineProps) {
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);

  return (
    <div className="mx-4 mt-3 bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="p-3 flex items-center cursor-pointer hover:bg-gray-50" onClick={() => setIsTimelineExpanded(!isTimelineExpanded)}>
        <span className="font-bold text-gray-800 mr-2">오늘</span>
        <div className="flex gap-1.5 flex-1">
          <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md">지출 -₩{todaySpent.toLocaleString()}</span>
          <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">참음 +₩{todaySaved.toLocaleString()}</span>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">저축 +₩{todayInvestment.toLocaleString()}</span>
        </div>
        <div className={`w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center transition-transform ${isTimelineExpanded ? 'rotate-180' : ''}`}>
          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>
        </div>
      </div>
      <div className={`border-t border-gray-100 overflow-hidden transition-all duration-300 ${isTimelineExpanded ? 'max-h-60' : 'max-h-0'}`}>
        <div className="p-3 space-y-2 max-h-52 overflow-y-auto">
          {spendItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
              <div className={`w-2.5 h-2.5 rounded-full ${item.type === 'spent' ? 'bg-red-500' : item.type === 'saved' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{item.time}</span>
                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${item.category === '충동' ? 'bg-amber-50 text-amber-600' : item.category === '필수' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>{item.category}</span>
                  {item.tag && <span className="text-gray-300">• {item.tag}</span>}
                </div>
              </div>
              <span className={`font-bold text-sm ${item.type === 'spent' ? 'text-red-500' : item.type === 'saved' ? 'text-green-600' : 'text-blue-600'}`}>{item.type === 'spent' ? '-' : '+'}₩{item.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SpendTimeline;
