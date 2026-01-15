import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import FinancialCheckPage from './pages/FinancialCheckPage';
import FinancialResultPage from './pages/FinancialResultPage';
import IncomeExpenseInputPage from './pages/IncomeExpenseInputPage';
import IncomeExpenseResultPage from './pages/IncomeExpenseResultPage';
import BudgetAdjustPage from './pages/BudgetAdjustPage';
import BudgetConfirmPage from './pages/BudgetConfirmPage';
import HomePage from './pages/HomePage';
import DetailReportPage from './pages/DetailReportPage';
import AISpendPage from './pages/AISpendPage';
import FAQMorePage from './pages/FAQMorePage';
import ConsultingRequestPage from './pages/ConsultingRequestPage';
import BottomNav from './components/BottomNav';
import { SpendProvider } from './context/SpendContext';
import { saveNetAssetsSnapshot } from './services/statsService';
import type { IncomeExpenseData } from './types/incomeExpense';
import type { AdjustedBudget } from './pages/BudgetAdjustPage';

interface FinancialResult {
  name: string;
  age: number;
  income: number;
  assets: number;
  debt: number;
  wealthIndex: number;
  level: number;
  houseName: string;
  houseImage: string;
  message: string;
}

type AppStep = 
  | 'login' 
  | 'onboarding' 
  | 'financial-check' 
  | 'financial-result' 
  | 'income-expense-input'
  | 'income-expense-result'
  | 'budget-adjust'
  | 'budget-confirm'
  | 'main'
  | 'detail-report'
  | 'faq-more'
  | 're-diagnosis'
  | 're-analysis'
  | 're-analysis-input'
  | 'consulting-request';

type MainTab = 'home' | 'ai-spend' | 'financial-house' | 'mypage';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<AppStep>('login');
  const [currentTab, setCurrentTab] = useState<MainTab>('home');
  const [financialResult, setFinancialResult] = useState<FinancialResult | null>(null);
  const [incomeExpenseData, setIncomeExpenseData] = useState<IncomeExpenseData | null>(null);
  const [adjustedBudget, setAdjustedBudget] = useState<AdjustedBudget | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      if (currentUser) {
        const budgetConfirmed = localStorage.getItem(`budgetConfirmed_${currentUser.uid}`);
        if (budgetConfirmed) {
          const savedFinancialData = localStorage.getItem(`financialData_${currentUser.uid}`);
          if (savedFinancialData) {
            setFinancialResult(JSON.parse(savedFinancialData));
          }
          const savedBudget = localStorage.getItem(`adjustedBudget_${currentUser.uid}`);
          if (savedBudget) {
            setAdjustedBudget(JSON.parse(savedBudget));
          }
          const savedIncomeExpense = localStorage.getItem(`incomeExpenseData_${currentUser.uid}`);
          if (savedIncomeExpense) {
            setIncomeExpenseData(JSON.parse(savedIncomeExpense));
          }
          setCurrentStep('main');
          setCurrentTab('home');
        } else {
          setCurrentStep('onboarding');
        }
      } else {
        setCurrentStep('login');
        setCurrentTab('home');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleOnboardingComplete = () => {
    if (user) {
      localStorage.setItem(`onboarding_${user.uid}`, 'true');
      setCurrentStep('financial-check');
    }
  };

  const handleFinancialCheckComplete = (result: FinancialResult) => {
    setFinancialResult(result);
    if (user) {
      localStorage.setItem(`financialData_${user.uid}`, JSON.stringify(result));
      // 순자산 스냅샷 저장 (재무진단 입력 시점 기록)
      saveNetAssetsSnapshot(user.uid, result.assets, result.debt);
    }
    setCurrentStep('financial-result');
  };

  const handleFinancialRetry = () => {
    setFinancialResult(null);
    setCurrentStep('financial-check');
  };

  const handleFinancialNext = () => {
    if (user) {
      localStorage.setItem(`financial_${user.uid}`, 'true');
      setCurrentStep('income-expense-input');
    }
  };

  const handleIncomeExpenseComplete = (data: IncomeExpenseData) => {
    setIncomeExpenseData(data);
    if (user) {
      localStorage.setItem(`incomeExpenseData_${user.uid}`, JSON.stringify(data));
    }
    setCurrentStep('income-expense-result');
  };

  const handleIncomeExpenseResultBack = () => {
    setCurrentStep('income-expense-input');
  };

  const handleIncomeExpenseResultNext = () => {
    if (user) {
      localStorage.setItem(`incomeExpense_${user.uid}`, 'true');
      setCurrentStep('budget-adjust');
    }
  };

  const handleBudgetAdjustBack = () => {
    setCurrentStep('income-expense-result');
  };

  const handleBudgetAdjustConfirm = (budget: AdjustedBudget) => {
    setAdjustedBudget(budget);
    if (user) {
      localStorage.setItem(`adjustedBudget_${user.uid}`, JSON.stringify(budget));
    }
    setCurrentStep('budget-confirm');
  };

  const handleBudgetConfirmStart = () => {
    if (user) {
      localStorage.setItem(`budgetConfirmed_${user.uid}`, 'true');
    }
    setCurrentStep('main');
    setCurrentTab('home');
  };

  const handleTabChange = (tab: MainTab) => {
    setCurrentTab(tab);
  };

  const handleMoreDetail = () => {
    setCurrentStep('detail-report');
  };

  const handleDetailReportBack = () => {
    setCurrentStep('main');
    setCurrentTab('home');
  };

  const handleFAQMore = () => {
    setCurrentStep('faq-more');
  };

  const handleFAQBack = () => {
    setCurrentStep('main');
    setCurrentTab('ai-spend');
  };

  const handleSelectQuestion = (question: string) => {
    console.log('Selected question:', question);
  };

  // 재무진단 다시하기
  const handleReDiagnosis = () => {
    setCurrentStep('re-diagnosis');
  };

  // 재무분석 다시하기 → 예산조정화면으로 이동
  const handleReAnalysis = () => {
    setCurrentStep('re-analysis');
  };

  // 홈으로 돌아가기
  const handleBackToHome = () => {
    setCurrentStep('main');
    setCurrentTab('home');
  };

  // 재무진단 다시하기 완료 후 저장 (향후 사용 예정)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleReDiagnosisComplete = (result: FinancialResult) => {
    setFinancialResult(result);
    if (user) {
      localStorage.setItem(`financialData_${user.uid}`, JSON.stringify(result));
      // 순자산 스냅샷 저장 (재진단 시에도 기록)
      saveNetAssetsSnapshot(user.uid, result.assets, result.debt);
    }
    setCurrentStep('re-diagnosis');
  };

  const handleRestart = async () => {
    if (user && window.confirm('처음부터 다시 시작하시겠습니까?\n모든 데이터가 초기화됩니다.')) {
      localStorage.removeItem(`onboarding_${user.uid}`);
      localStorage.removeItem(`financial_${user.uid}`);
      localStorage.removeItem(`financialData_${user.uid}`);
      localStorage.removeItem(`incomeExpense_${user.uid}`);
      localStorage.removeItem(`incomeExpenseData_${user.uid}`);
      localStorage.removeItem(`adjustedBudget_${user.uid}`);
      localStorage.removeItem(`budgetConfirmed_${user.uid}`);
      localStorage.removeItem(`moneya_spend_${user.uid}`);
      localStorage.removeItem(`moneya_snapshots_${user.uid}`);
      localStorage.removeItem(`moneya_joinDate_${user.uid}`);
      localStorage.removeItem(`moneya_netAssets_${user.uid}`);
      
      setFinancialResult(null);
      setIncomeExpenseData(null);
      setAdjustedBudget(null);
      setCurrentStep('onboarding');
      setCurrentTab('home');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white text-2xl font-bold">M</span>
          </div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={() => {}} />;
  }

  if (currentStep === 'onboarding') {
    return <OnboardingPage onComplete={handleOnboardingComplete} />;
  }

  if (currentStep === 'financial-check') {
    return <FinancialCheckPage onComplete={handleFinancialCheckComplete} />;
  }

  if (currentStep === 'financial-result' && financialResult) {
    return (
      <FinancialResultPage
        result={financialResult}
        onRetry={handleFinancialRetry}
        onNext={handleFinancialNext}
      />
    );
  }

  if (currentStep === 'income-expense-input') {
    return (
      <IncomeExpenseInputPage
        initialIncome={financialResult?.income || 0}
        onComplete={handleIncomeExpenseComplete}
        onBack={() => setCurrentStep('financial-result')}
      />
    );
  }

  if (currentStep === 'income-expense-result' && incomeExpenseData) {
    return (
      <IncomeExpenseResultPage
        data={incomeExpenseData}
        onBack={handleIncomeExpenseResultBack}
        onNext={handleIncomeExpenseResultNext}
      />
    );
  }

  if (currentStep === 'budget-adjust' && incomeExpenseData) {
    return (
      <BudgetAdjustPage
        incomeExpenseData={incomeExpenseData}
        onConfirm={handleBudgetAdjustConfirm}
        onBack={handleBudgetAdjustBack}
      />
    );
  }

  if (currentStep === 'budget-confirm' && adjustedBudget) {
    return (
      <BudgetConfirmPage
        adjustedBudget={adjustedBudget}
        onStart={handleBudgetConfirmStart}
      />
    );
  }

  if (currentStep === 'detail-report') {
    return (
      <SpendProvider userId={user.uid}>
        <DetailReportPage
          adjustedBudget={adjustedBudget}
          financialResult={financialResult}
          userId={user.uid}
          onBack={handleDetailReportBack}
        />
      </SpendProvider>
    );
  }

  if (currentStep === 'faq-more') {
    return (
      <FAQMorePage
        onBack={handleFAQBack}
        onSelectQuestion={handleSelectQuestion}
      />
    );
  }

  // 강의/상담 신청 화면
  if (currentStep === 'consulting-request') {
    return (
      <ConsultingRequestPage
        onBack={handleBackToHome}
      />
    );
  }

  // 재무진단 다시하기 화면
  if (currentStep === 're-diagnosis' && financialResult) {
    return (
      <FinancialResultPage
        result={financialResult}
        onRetry={() => {
          setFinancialResult(null);
          setCurrentStep('financial-check');
        }}
        onNext={handleBackToHome}
        isFromHome={true}
      />
    );
  }

  // 재무분석 다시하기 → 예산조정화면
  if (currentStep === 're-analysis' && incomeExpenseData) {
    return (
      <BudgetAdjustPage
        incomeExpenseData={incomeExpenseData}
        onConfirm={(budget) => {
          setAdjustedBudget(budget);
          if (user) {
            localStorage.setItem(`adjustedBudget_${user.uid}`, JSON.stringify(budget));
          }
          handleBackToHome();
        }}
        onBack={handleBackToHome}
        isFromHome={true}
        onReAnalysis={() => setCurrentStep('re-analysis-input')}
      />
    );
  }

  // 다시 분석하기 → 정보입력화면
  if (currentStep === 're-analysis-input') {
    return (
      <IncomeExpenseInputPage
        initialIncome={financialResult?.income || 0}
        onComplete={(data) => {
          setIncomeExpenseData(data);
          if (user) {
            localStorage.setItem(`incomeExpenseData_${user.uid}`, JSON.stringify(data));
          }
          setCurrentStep('income-expense-result');
        }}
        onBack={() => setCurrentStep('re-analysis')}
      />
    );
  }

  if (currentStep === 'main') {
    return (
      <SpendProvider userId={user.uid}>
        <div className="relative">
          {currentTab === 'home' && (
            <HomePage 
              userName={user.displayName || '사용자'} 
              adjustedBudget={adjustedBudget}
              financialResult={financialResult}
              onMoreDetail={handleMoreDetail}
              onReDiagnosis={handleReDiagnosis}
              onReAnalysis={handleReAnalysis}
            />
          )}
          {currentTab === 'ai-spend' && (
            <AISpendPage
              userName={user.displayName || '사용자'}
              adjustedBudget={adjustedBudget}
              financialResult={financialResult}
              onFAQMore={handleFAQMore}
            />
          )}
          {currentTab === 'financial-house' && (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-24">
              <div className="text-center p-6">
                <span className="text-6xl mb-4 block">🏗️</span>
                <h2 className="text-xl font-bold text-gray-800 mb-2">금융집짓기</h2>
                <p className="text-gray-500">Phase 4에서 개발 예정입니다</p>
              </div>
            </div>
          )}
          {currentTab === 'mypage' && (
            <div className="min-h-screen bg-gray-50 pb-24">
              {/* 프로필 영역 */}
              <div className="bg-white p-6 border-b">
                <div className="flex items-center gap-4">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="프로필" className="w-16 h-16 rounded-full" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-2xl font-bold">
                      {(financialResult?.name || user.displayName || '사')[0]}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-bold text-lg text-gray-800">{financialResult?.name || user.displayName}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                        베이직 이용 중
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* 금융집 + DESIRE 단계 */}
                {financialResult && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{financialResult.houseImage || '🏠'}</span>
                      <div>
                        <p className="font-bold text-gray-800">{financialResult.houseName}</p>
                        <p className="text-xs text-gray-500">부자지수 {financialResult.wealthIndex}점</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ⭐ 오상열 CFP 강의/상담 배너 */}
              <div 
                onClick={() => setCurrentStep('consulting-request')}
                className="mx-4 mt-4 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-xl p-4 border border-amber-200 shadow-sm cursor-pointer hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0">
                    오
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800">오상열 대표</span>
                      <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold">CFP</span>
                    </div>
                    <p className="text-xs text-amber-700 font-semibold">금융집짓기® 창시자</p>
                    <p className="text-xs text-gray-600 mt-0.5">1:1 맞춤 재무설계 상담 · 비대면 33만 / 대면 55만</p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-2 rounded-lg text-sm font-bold shadow">
                    신청
                  </div>
                </div>
              </div>

              {/* 성장 기록 */}
              <div className="mx-4 mt-4 bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  📈 성장 기록
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">출석</span>
                    <span className="font-bold text-teal-600">연속 출석 중 🔥</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">예산 달성</span>
                    <span className="font-bold text-gray-800">진행 중</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">이번 달 절약</span>
                    <span className="font-bold text-green-600">+0원</span>
                  </div>
                </div>
              </div>

              {/* 메뉴 리스트 */}
              <div className="mx-4 mt-4 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div 
                  onClick={() => setCurrentStep('consulting-request')}
                  className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center">
                    <span>👨‍🏫</span>
                  </div>
                  <span className="flex-1 font-semibold text-gray-800">전문가 상담 · 강의 신청</span>
                  <span className="text-gray-400">›</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 opacity-50">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                    <span>📊</span>
                  </div>
                  <span className="flex-1 font-semibold text-gray-800">월간 리포트</span>
                  <span className="text-xs text-gray-400 mr-2">준비 중</span>
                  <span className="text-gray-400">›</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 opacity-50">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                    <span>⚙️</span>
                  </div>
                  <span className="flex-1 font-semibold text-gray-800">설정</span>
                  <span className="text-xs text-gray-400 mr-2">준비 중</span>
                  <span className="text-gray-400">›</span>
                </div>
              </div>

              {/* 기타 메뉴 */}
              <div className="mx-4 mt-4 space-y-2">
                <button 
                  onClick={handleRestart}
                  className="w-full py-4 bg-blue-500 text-white font-bold rounded-xl"
                >
                  🔄 처음부터 다시하기
                </button>
                <button 
                  onClick={() => auth.signOut()}
                  className="w-full py-4 bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  로그아웃
                </button>
              </div>

              {/* 앱 버전 */}
              <p className="text-center text-xs text-gray-400 mt-6">앱 버전 v1.0.0 (베이스캠프 5.0)</p>
            </div>
          )}
          
          <BottomNav currentTab={currentTab} onTabChange={handleTabChange} />
        </div>
      </SpendProvider>
    );
  }

  return null;
}

export default App;
