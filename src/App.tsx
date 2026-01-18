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
import MyPage from './pages/MyPage';
import SubscriptionPage from './pages/SubscriptionPage';
import ConsultingPage from './pages/ConsultingPage';
import ConsultingApplyPage from './pages/ConsultingApplyPage';
import MonthlyReportPage from './pages/MonthlyReportPage';
import FinancialHouseDisclaimer from './pages/FinancialHouseDisclaimer';
import FinancialHouseBasic from './pages/FinancialHouseBasic';
import type { ConsultingProduct } from './pages/ConsultingApplyPage';
import BottomNav from './components/BottomNav';
import { SpendProvider } from './context/SpendContext';
import { FinancialHouseProvider } from './context/FinancialHouseContext';
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
  | 'subscription'
  | 'consulting'
  | 'consulting-apply'
  | 'monthly-report';

type MainTab = 'home' | 'ai-spend' | 'financial-house' | 'mypage';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<AppStep>('login');
  const [currentTab, setCurrentTab] = useState<MainTab>('home');
  const [financialResult, setFinancialResult] = useState<FinancialResult | null>(null);
  const [incomeExpenseData, setIncomeExpenseData] = useState<IncomeExpenseData | null>(null);
  const [adjustedBudget, setAdjustedBudget] = useState<AdjustedBudget | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ConsultingProduct | null>(null);
  
  // 금융집짓기 스텝 관리
  const [financialHouseStep, setFinancialHouseStep] = useState<'disclaimer' | 'basic' | 'design' | 'result'>('disclaimer');

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

  // 마이페이지 하위 페이지 네비게이션
  const handleMyPageNavigate = (page: 'subscription' | 'consulting' | 'monthly-report') => {
    if (page === 'subscription') {
      setCurrentStep('subscription');
    } else if (page === 'consulting') {
      setCurrentStep('consulting');
    } else if (page === 'monthly-report') {
      setCurrentStep('monthly-report');
    }
  };

  // 구독 페이지에서 마이페이지로 돌아가기
  const handleSubscriptionBack = () => {
    setCurrentStep('main');
    setCurrentTab('mypage');
  };

  // 상담 페이지에서 마이페이지로 돌아가기
  const handleConsultingBack = () => {
    setCurrentStep('main');
    setCurrentTab('mypage');
  };

  // 상담 신청 페이지로 이동 (상품 정보 전달)
  const handleConsultingApply = (product: ConsultingProduct) => {
    setSelectedProduct(product);
    setCurrentStep('consulting-apply');
  };

  // 신청 페이지에서 상담 페이지로 돌아가기
  const handleConsultingApplyBack = () => {
    setSelectedProduct(null);
    setCurrentStep('consulting');
  };

  // 로그아웃
  const handleLogout = () => {
    auth.signOut();
  };

  // 처음부터 다시하기
  const handleRestart = () => {
    if (user) {
      localStorage.removeItem(`onboarding_${user.uid}`);
      localStorage.removeItem(`financial_${user.uid}`);
      localStorage.removeItem(`financialData_${user.uid}`);
      localStorage.removeItem(`incomeExpense_${user.uid}`);
      localStorage.removeItem(`incomeExpenseData_${user.uid}`);
      localStorage.removeItem(`adjustedBudget_${user.uid}`);
      localStorage.removeItem(`budgetConfirmed_${user.uid}`);
      localStorage.removeItem(`moneya_spend_${user.uid}`);
      
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
      <DetailReportPage
        adjustedBudget={adjustedBudget}
        onBack={handleDetailReportBack}
      />
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

  if (currentStep === 'subscription') {
    return (
      <SubscriptionPage
        onBack={handleSubscriptionBack}
      />
    );
  }

  if (currentStep === 'consulting') {
    return (
      <ConsultingPage
        onBack={handleConsultingBack}
        onApply={handleConsultingApply}
      />
    );
  }

  if (currentStep === 'consulting-apply' && selectedProduct) {
    return (
      <ConsultingApplyPage
        product={selectedProduct}
        onBack={handleConsultingApplyBack}
      />
    );
  }

  // ✅ 수정: SpendProvider로 감싸기
  if (currentStep === 'monthly-report') {
    return (
      <SpendProvider userId={user.uid}>
        <MonthlyReportPage
          onBack={() => {
            setCurrentStep('main');
            setCurrentTab('mypage');
          }}
          adjustedBudget={adjustedBudget}
        />
      </SpendProvider>
    );
  }

  // 재무진단 다시하기 화면
  if (currentStep === 're-diagnosis' && financialResult) {
    return (
      <FinancialResultPage
        result={financialResult}
        onRetry={handleFinancialRetry}
        onNext={handleBackToHome}
        isFromHome={true}
      />
    );
  }

  // 재무분석 다시하기 → 예산조정화면 (첨부1)
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

  // 다시 분석하기 → 정보입력화면 (첨부2)
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
          {/* ✅ Phase 9: 금융집짓기 탭 */}
          {currentTab === 'financial-house' && (
            <FinancialHouseProvider userId={user.uid}>
              {financialHouseStep === 'disclaimer' && (
                <FinancialHouseDisclaimer
                  userName={user.displayName || '사용자'}
                  onStart={() => setFinancialHouseStep('basic')}
                />
              )}
              {financialHouseStep === 'basic' && (
                <FinancialHouseBasic
                  userName={user.displayName || '사용자'}
                  onComplete={() => {
                    // 재무설계 화면으로 이동
                    setFinancialHouseStep('design');
                  }}
                  onBack={() => setFinancialHouseStep('disclaimer')}
                  existingFinancialResult={financialResult}
                  existingIncomeExpense={incomeExpenseData}
                />
              )}
            </FinancialHouseProvider>
          )}
          {currentTab === 'mypage' && (
            <MyPage
              userName={user.displayName || '사용자'}
              userEmail={user.email || ''}
              userPhoto={user.photoURL}
              financialResult={financialResult}
              onNavigate={handleMyPageNavigate}
              onLogout={handleLogout}
              onReset={handleRestart}
            />
          )}
          
          <BottomNav currentTab={currentTab} onTabChange={handleTabChange} />
        </div>
      </SpendProvider>
    );
  }

  return null;
}

export default App;
