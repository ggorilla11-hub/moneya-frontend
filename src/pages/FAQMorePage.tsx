import { useState } from 'react';

interface FAQMorePageProps {
  onBack: () => void;
  onSelectQuestion: (question: string) => void;
}

function FAQMorePage({ onBack, onSelectQuestion }: FAQMorePageProps) {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');

  const categories = ['전체', '💰 예산', '🍽️ 식비', '☕ 카페'];

  const aiRecommendations = [
    { emoji: '☕', text: '이번 주 카페 예산 얼마 남았어?', sub: '카페 지출 3회 기록됨' },
    { emoji: '🍽️', text: '오늘 저녁 외식해도 될까?', sub: '저녁 시간대에 자주 질문' },
  ];

  const popularQuestions = [
    '오늘 얼마 쓸 수 있어?',
    '이번 달 예산 초과했어?',
    '이번 주 식비 현황 알려줘',
  ];

  const categoryQuestions = {
    예산: [
      '이번 달 남은 예산 알려줘',
      '예산 대비 지출 현황은?',
      '다음 달 예산 추천해줘',
      '저축 목표 달성률은?',
    ],
    식비: [
      '오늘 점심 예산 얼마야?',
      '이번 주 식비 얼마 썼어?',
      '외식비 줄이는 방법은?',
      '배달비 많이 쓰고 있어?',
    ],
    카페: [
      '이번 달 카페 지출 현황',
      '커피 한 잔 사도 돼?',
      '카페 예산 초과했어?',
      '카페 지출 줄이는 팁',
    ],
  };

  const handleQuestionClick = (question: string) => {
    onSelectQuestion(question);
    onBack();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-4 py-3 flex items-center gap-3 border-b border-gray-200">
        <button 
          onClick={onBack}
          className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center"
        >
          <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
        </button>
        <span className="font-bold text-gray-800">자주 묻는 질문</span>
      </div>

      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center bg-gray-100 rounded-xl px-4 py-2.5">
          <svg className="w-5 h-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="질문 검색하기..."
            className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
          />
        </div>
      </div>

      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">✨</span>
            <span className="font-bold text-purple-800">대표님을 위한 추천</span>
            <span className="text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full">최근 패턴 기반 AI 추천</span>
          </div>
          
          <div className="space-y-2">
            {aiRecommendations.map((item, index) => (
              <button
                key={index}
                onClick={() => handleQuestionClick(item.text)}
                className="w-full flex items-center gap-3 p-3 bg-white rounded-xl hover:bg-gray-50 transition-all text-left"
              >
                <span className="text-2xl">{item.emoji}</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{item.text}</p>
                  <p className="text-xs text-gray-400">{item.sub}</p>
                </div>
                <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                </svg>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔥</span>
              <span className="font-bold text-gray-800">지금 인기 있는 질문</span>
            </div>
            <span className="text-xs text-red-500 font-semibold">실시간</span>
          </div>
          
          <div className="space-y-2">
            {popularQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuestionClick(question)}
                className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all text-left"
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  index === 0 ? 'bg-red-500 text-white' :
                  index === 1 ? 'bg-orange-400 text-white' :
                  'bg-amber-300 text-amber-800'
                }`}>
                  {index + 1}
                </span>
                <span className="flex-1 text-gray-800">{question}</span>
                <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                </svg>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">💰</span>
            <span className="font-bold text-gray-800">예산 관련</span>
          </div>
          
          <div className="space-y-2">
            {categoryQuestions.예산.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuestionClick(question)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all text-left"
              >
                <span className="text-gray-800">{question}</span>
                <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                </svg>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🍽️</span>
            <span className="font-bold text-gray-800">식비 관련</span>
          </div>
          
          <div className="space-y-2">
            {categoryQuestions.식비.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuestionClick(question)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all text-left"
              >
                <span className="text-gray-800">{question}</span>
                <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                </svg>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">☕</span>
            <span className="font-bold text-gray-800">카페 관련</span>
          </div>
          
          <div className="space-y-2">
            {categoryQuestions.카페.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuestionClick(question)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all text-left"
              >
                <span className="text-gray-800">{question}</span>
                <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                </svg>
              </button>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default FAQMorePage;