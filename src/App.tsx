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
  | 'home';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<AppStep>('login');
  const [financialResult, setFinancialResult] = useState<FinancialResult | null>(null);
  const [incomeExpenseData, setIncomeExpenseData] = useState<IncomeExpenseData | null>(null);
  const [adjustedBudget, setAdjustedBudget] = useState<AdjustedBudget | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      if (currentUser) {
        setCurrentStep('onboarding');
      } else {
        setCurrentStep('login');
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
    setCurrentStep('home');
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

  const handleRestart = async () => {
    if (user && window.confirm('처음부터 다시 시작하시겠습니까?\n로그아웃 후 새로운 고객처럼 시작합니다.')) {
      localStorage.removeItem(`onboarding_${user.uid}`);
      localStorage.removeItem(`financial_${user.uid}`);
      localStorage.removeItem(`financialData_${user.uid}`);
      localStorage.removeItem(`incomeExpense_${user.uid}`);
      localStorage.removeItem(`adjustedBudget_${user.uid}`);
      localStorage.removeItem(`budgetConfirmed_${user.uid}`);
      
      setFinancialResult(null);
      setIncomeExpenseData(null);
      setAdjustedBudget(null);
      
      await auth.signOut();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-green-50 flex flex-col items-center justify-center p-4">
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 bg-purple-500 rounded-full animate-pulse opacity-30"></div>
        <div className="absolute inset-2 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white text-4xl font-bold">M</span>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        안녕하세요, {user.displayName}님!
      </h1>
      <p className="text-gray-600 text-center mb-8">
        <span className="text-purple-600 font-semibold">AI머니야</span>에 오신 것을 환영합니다
      </p>

      <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-sm mb-6">
        <div className="flex items-center gap-4 mb-4">
          {user.photoURL && (
            <img 
              src={user.photoURL} 
              alt="프로필" 
              className="w-12 h-12 rounded-full"
            />
          )}
          <div>
            <p className="font-semibold text-gray-800">{user.displayName}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        <div className="border-t pt-4">
          <p className="text-center text-green-600 font-semibold">
            ✅ 예산 설정 완료!
          </p>
          {adjustedBudget && (
            <div className="mt-3 text-sm text-gray-600">
              <p>월 예산: ₩{adjustedBudget.totalIncome.toLocaleString()}원</p>
              <p>저축/투자: ₩{adjustedBudget.savings.toLocaleString()}원</p>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleRestart}
        className="w-full max-w-sm mb-4 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 hover:from-blue-600 hover:to-blue-700 transition-all"
      >
        🔄 처음부터 다시하기
      </button>

      <button
        onClick={() => auth.signOut()}
        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-8 rounded-xl transition-all"
      >
        로그아웃
      </button>
    </div>
  );
}

export default App;