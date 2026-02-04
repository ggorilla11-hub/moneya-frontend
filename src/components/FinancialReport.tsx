// src/components/FinancialReport.tsx v3.5
// ★★★ v3.5: PDF 생성 공유, 공유모달 상단 위치 ★★★
import { useState, useEffect, useCallback, useRef } from 'react';

const LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/AI%EB%A8%B8%EB%8B%88%EC%95%BC%20%ED%99%95%EC%A0%95%EC%9D%B4%EB%AF%B8%EC%A7%80%EC%95%88.png?alt=media&token=c250863d-7cda-424a-800d-884b20e30b1a";
const PROFILE_IMAGE_URL = 'https://firebasestorage.googleapis.com/v0/b/moneya-72fe6.firebasestorage.app/o/%EC%98%A4%EC%83%81%EC%97%B4%20%EC%82%AC%EC%A7%84.png?alt=media&token=63eaf15e-9d0b-4d72-8fbb-ee03d6ecc8e5';
const BASIC_DRAFT_KEY = 'financialHouseBasicDraft';
const BASIC_FINAL_KEY = 'financialHouseData';
const DESIGN_KEY = 'financialHouseDesignData';

// ★★★ v3.5: html2pdf CDN 동적 로드 ★★★
const loadHtml2Pdf = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if ((window as any).html2pdf) { resolve((window as any).html2pdf); return; }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.onload = () => resolve((window as any).html2pdf);
    script.onerror = () => reject(new Error('html2pdf 로드 실패'));
    document.head.appendChild(script);
  });
};

const fmt = {
  manwon: (v: number): string => { if (!v) return '0만원'; if (v >= 10000) { const e = Math.floor(v/10000); const r = v%10000; return r===0 ? `${e}억원` : `${e}억 ${r.toLocaleString()}만원`; } return `${v.toLocaleString()}만원`; },
  eok: (v: number): string => { if (!v) return '0원'; if (v >= 10000) return `${(v/10000).toFixed(1)}억원`; return `${v.toLocaleString()}만원`; },
  percent: (v: number): string => `${Math.round(v)}%`,
};

const interestLabels: Record<string,{emoji:string;label:string}> = { saving:{emoji:'💰',label:'돈 모으기'}, house:{emoji:'🏠',label:'내집 마련'}, retire:{emoji:'🏖️',label:'노후 준비'}, education:{emoji:'👶',label:'자녀 교육비'}, debt:{emoji:'💳',label:'빚 갚기'}, invest:{emoji:'📈',label:'투자 시작'}, insurance:{emoji:'🛡️',label:'보험 점검'}, tax:{emoji:'💸',label:'세금 절약'} };
const goalLabels: Record<string,{emoji:string;label:string}> = { house:{emoji:'🏠',label:'내집 마련'}, retire:{emoji:'☀️',label:'행복한 노후'}, education:{emoji:'🎓',label:'자녀교육 준비'}, emergency:{emoji:'🛡️',label:'비상자금 마련'}, invest:{emoji:'📊',label:'투자 포트폴리오'}, debt_free:{emoji:'✅',label:'부채 완전 청산'}, saving_10:{emoji:'💎',label:'10억 자산 달성'} };

const gradeMap = (thresholds: number[], labels: string[], value: number) => {
  const grades = [{ grade:'A', color:'#059669', bg:'#ecfdf5' },{ grade:'B', color:'#0891b2', bg:'#ecfeff' },{ grade:'C', color:'#d97706', bg:'#fffbeb' },{ grade:'D', color:'#dc2626', bg:'#fef2f2' }];
  for (let i = 0; i < thresholds.length; i++) { if (value >= thresholds[i]) return { ...grades[i], label: labels[i] }; }
  return { ...grades[3], label: labels[3] };
};
const getDebtGrade = (r: number) => gradeMap([0,0,0,0].map((_,i)=>[80,60,40,0][i]), ['매우양호','양호','주의','위험'], 100-r);
const getSavingGrade = (r: number) => gradeMap([30,20,10,0], ['매우우수','양호','보통','개선필요'], r);
const getEmergencyGrade = (m: number) => gradeMap([6,3,1,0], ['충분','적정','부족','미확보'], m);
const getRetireGrade = (r: number) => gradeMap([100,70,40,0], ['충분','양호','보통','미흡'], r);
const getWealthGrade = (i: number) => gradeMap([100,50,25,0], ['부자','양호','보통','개선필요'], i);
const getInsuranceGrade = (r: number) => gradeMap([80,60,40,0], ['양호','보통','부족','위험'], r);

const calcInheritanceTax = (taxable: number) => {
  if (taxable <= 0) return { tax:0, rate:0, bracket:'-' };
  const b = [{l:10000,r:10},{l:50000,r:20},{l:100000,r:30},{l:300000,r:40},{l:Infinity,r:50}];
  let tax=0,prev=0,br='',rt=0;
  for (const x of b) { if (taxable<=prev) break; const t=Math.min(taxable,x.l)-prev; if(t>0){tax+=t*(x.r/100);br=`${x.l===Infinity?'30억초과':fmt.eok(x.l)}이하`;rt=x.r;} prev=x.l; }
  return { tax:Math.round(tax), rate:rt, bracket:br };
};

const loadData = () => {
  let b: any = null, d: any = null;
  try { const r = localStorage.getItem(BASIC_FINAL_KEY) || localStorage.getItem(BASIC_DRAFT_KEY); if(r) b=JSON.parse(r); } catch{}
  try { const r = localStorage.getItem(DESIGN_KEY); if(r) d=JSON.parse(r); } catch{}
  const pi = { name: b?.personalInfo?.name||b?.name||'고객', age: b?.personalInfo?.age||b?.age||0, retireAge: b?.personalInfo?.retireAge||65, married: b?.personalInfo?.married||'미혼', dualIncome: b?.personalInfo?.dualIncome||'외벌이', job: b?.personalInfo?.job||'-', familyCount: b?.personalInfo?.familyCount||1 };
  const interests: string[] = b?.interests || []; const goal: string = b?.goal || '';
  const inc = { salary: b?.income?.salary||0, spouse: b?.income?.spouse||0, other: b?.income?.other||0, total: b?.income?.total||(b?.income?.salary||0)+(b?.income?.spouse||0)+(b?.income?.other||0) };
  const exp = { living: b?.expense?.living||0, insurance: b?.expense?.insurance||0, loan: b?.expense?.loan||0, saving: b?.expense?.saving||0, pension: b?.expense?.pension||0, surplus: b?.expense?.surplus||0, total: b?.expense?.total||0 };
  const ast = { realEstate: b?.assets?.realEstate||0, financial: b?.assets?.financial||0, emergency: b?.assets?.emergency||0, total: b?.assets?.total||b?.totalAsset||0 };
  const dbt = { mortgage: b?.debts?.mortgage||[], credit: b?.debts?.credit||[], other: b?.debts?.other||[], totalDebt: b?.debts?.totalDebt||b?.totalDebt||0 };
  const mortT = Array.isArray(dbt.mortgage)?dbt.mortgage.reduce((s:number,x:any)=>s+(x.amount||0),0):0;
  const credT = Array.isArray(dbt.credit)?dbt.credit.reduce((s:number,x:any)=>s+(x.amount||0),0):0;
  const othDT = Array.isArray(dbt.other)?dbt.other.reduce((s:number,x:any)=>s+(x.amount||0),0):0;
  const emFund = b?.emergencyFund||b?.assets?.emergency||0; const mReq = exp.living+exp.insurance+exp.loan;
  const emMon = mReq>0?Math.round(emFund/mReq*10)/10:0; const totAst = ast.total||d?.invest?.totalAssets||0;
  const dRatio = totAst>0?Math.round((dbt.totalDebt/totAst)*100):0;
  const annInc = inc.total*12; const annLoan = exp.loan*12; const dsr = annInc>0?Math.round((annLoan/annInc)*100):0;
  const savRate = inc.total>0?Math.round(((exp.saving+exp.pension)/inc.total)*100):0; const netAst = totAst-dbt.totalDebt;
  const reAst = { residential: d?.estate?.residentialProperty||0, investment: d?.estate?.investmentProperty||0 };
  const sv = d?.save||{}; const svPurp=sv.purpose||'-'; const svYrs=sv.targetYears||0; const svAmt=sv.targetAmount||0; const svMon=svYrs>0?Math.round(svAmt/(svYrs*12)):0;
  const ret = d?.retire||{}; const rAge=ret.currentAge||pi.age||0; const rRAge=ret.retireAge||pi.retireAge||65;
  const rExp=ret.monthlyLivingExpense||0; const rNP=ret.expectedNationalPension||0; const rPP=ret.currentPersonalPension||0; const rLump=ret.expectedRetirementLumpSum||0;
  const yToR=Math.max(0,rRAge-rAge); const rYrs=Math.max(0,90-rRAge); const rPrep=rNP+rPP; const rLumpM=rYrs>0?Math.round(rLump/(rYrs*12)):0;
  const rTotPrep=rPrep+rLumpM; const rRate=rExp>0?Math.round((rTotPrep/rExp)*100):0; const rShort=Math.max(0,rExp-rTotPrep);
  const rTotNeed=rShort*12*rYrs; const rAddMon=yToR>0?Math.round(rTotNeed/(yToR*12)):0;
  const inv = d?.invest||{}; const iAge=inv.currentAge||rAge||0; const iInc=inv.monthlyIncome||inc.total||0;
  const iTotA=inv.totalAssets||totAst||0; const iTotD=inv.totalDebt||dbt.totalDebt||0; const iNet=iTotA-iTotD; const iAnnInc=iInc*12;
  const wIdx=(iAge>0&&iAnnInc>0)?Math.round((iNet*10)/(iAge*iAnnInc)*100):0;
  const pf = { liquid:inv.liquidAssets||0, safe:inv.safeAssets||0, growth:inv.growthAssets||0, highRisk:inv.highRiskAssets||0, emergency:inv.emergencyFund||emFund||0, resRE:inv.residentialRealEstate||reAst.residential||0, invRE:inv.investmentRealEstate||reAst.investment||0 };
  const pfTot=pf.liquid+pf.safe+pf.growth+pf.highRisk; const isDual=inv.dualIncome==='맞벌이'||pi.dualIncome==='맞벌이'; const recEm=isDual?(mReq*3):(mReq*6);
  const tx=d?.tax||{}; const txInc=tx.incomeData||{}; const txInh=tx.inheritData||{};
  const txSal=txInc.annualSalary||iAnnInc||0; const txDet=txInc.determinedTax||0; const txPre=txInc.prepaidTax||0;
  const txRef=txPre-txDet; const txEff=txSal>0?Math.round((txDet/txSal)*10000)/100:0;
  const ihA=txInh.totalAssets||0; const ihD=txInh.totalDebts||0; const ihSp=txInh.hasSpouse||false; const ihCh=txInh.childrenCount||0;
  const ihBD=50000; const ihSD=ihSp?50000:0; const ihCD=ihCh*5000; const ihTD=ihBD+ihSD+ihCD;
  const ihTax=Math.max(0,ihA-ihD-ihTD); const ihRes=calcInheritanceTax(ihTax);
  const ins=d?.insurance||{}; const insAI=ins.annualIncome||(iAnnInc>0?Math.round(iAnnInc/12):6000); const insTD=ins.totalDebt||dbt.totalDebt||0;
  const prep=ins.prepared||{}; const isIns = (v:string) => ['O','o','유','Y','y'].includes(String(v));
  const insItems = [{key:'death',label:'사망',emoji:'💀',needed:insAI*3+insTD,prepared:prep.death||0,isSpecial:false,specialVal:''},{key:'disability',label:'장해',emoji:'🦽',needed:insAI*3+insTD,prepared:prep.disability||0,isSpecial:false,specialVal:''},{key:'cancer',label:'암진단',emoji:'🏥',needed:insAI*2,prepared:prep.cancer||0,isSpecial:false,specialVal:''},{key:'brain',label:'뇌질환',emoji:'🧠',needed:insAI,prepared:prep.brain||0,isSpecial:false,specialVal:''},{key:'heart',label:'심질환',emoji:'❤️',needed:insAI,prepared:prep.heart||0,isSpecial:false,specialVal:''},{key:'medical',label:'실비',emoji:'💊',needed:5000,prepared:prep.medical||0,isSpecial:false,specialVal:''},{key:'hospital',label:'입원수술',emoji:'🏨',needed:1,prepared:isIns(prep.hospital||'X')?1:0,isSpecial:true,specialVal:String(prep.hospital||'X')},{key:'dementia',label:'치매간병',emoji:'🧓',needed:1,prepared:isIns(prep.dementia||'X')?1:0,isSpecial:true,specialVal:String(prep.dementia||'X')}];
  const insLack=insItems.filter(i=>i.isSpecial?i.prepared===0:i.prepared<i.needed).length;
  const insNeedT=insItems.filter(i=>!i.isSpecial).reduce((s,i)=>s+i.needed,0); const insPrepT=insItems.filter(i=>!i.isSpecial).reduce((s,i)=>s+i.prepared,0);
  const insRate=insNeedT>0?Math.round((insPrepT/insNeedT)*100):0;
  const dStages = [{letter:'D',name:'Debt Free',kr:'부채자유',emoji:'💳'},{letter:'E',name:'Emergency',kr:'비상자금',emoji:'🛡️'},{letter:'S',name:'Savings',kr:'저축',emoji:'💰'},{letter:'I',name:'Investment',kr:'투자',emoji:'📈'},{letter:'R',name:'Retirement',kr:'은퇴준비',emoji:'🏠'},{letter:'E',name:'Enjoy',kr:'경제적자유',emoji:'🎉'}];
  let dCur=6,dName='ENJOY',dEmoji='🎉',dDesc='경제적 자유를 달성하셨습니다!';
  if(credT>0){dCur=1;dName='DEBT FREE';dEmoji='💳';dDesc='신용대출 상환이 최우선입니다.';}
  else if(emMon<(isDual?3:6)){dCur=2;dName='EMERGENCY';dEmoji='🛡️';dDesc=`비상예비자금 ${isDual?'3':'6'}개월분을 먼저 마련하세요.`;}
  else if((exp.saving+exp.pension)<=0){dCur=3;dName='SAVINGS';dEmoji='💰';dDesc='적립식 저축투자와 노후연금을 시작하세요.';}
  else if(iTotA<100000){dCur=4;dName='INVESTMENT';dEmoji='📈';dDesc='10억 목돈 마련을 위한 포트폴리오를 구축하세요.';}
  else if(mortT>0){dCur=5;dName='RETIREMENT';dEmoji='🏠';dDesc='담보대출을 은퇴 전까지 상환하세요.';}
  return { pi, interests, goal, inc, exp, ast, dbt, mortT, credT, othDT, emFund, mReq, emMon, totAst, dRatio, dsr, savRate, netAst, reAst, save:{purpose:svPurp,targetYears:svYrs,targetAmount:svAmt,monthlySavingRequired:svMon}, retire:{currentAge:rAge,retireAge:rRAge,yearsToRetire:yToR,retireYears:rYrs,monthlyLivingExpense:rExp,expectedNationalPension:rNP,currentPersonalPension:rPP,expectedRetirementLumpSum:rLump,requiredMonthly:rExp,preparedMonthly:rPrep,monthlySavingForRetire:rLumpM,totalPreparedMonthly:rTotPrep,retirementReadyRate:rRate,monthlyShortfall:rShort,totalRequiredRetireFund:rTotNeed,additionalMonthlySaving:rAddMon}, invest:{currentAge:iAge,monthlyIncome:iInc,totalAssets:iTotA,totalDebt:iTotD,netAsset:iNet,annualIncome:iAnnInc,wealthIndex:wIdx,portfolio:pf,portfolioTotal:pfTot,isDualIncome:isDual,recommendedEmergency:recEm}, tax:{annualSalary:txSal,determinedTax:txDet,prepaidTax:txPre,taxRefund:txRef,effectiveTaxRate:txEff,inherit:{totalAssets:ihA,totalDebts:ihD,hasSpouse:ihSp,childrenCount:ihCh,basicDeduction:ihBD,spouseDeduction:ihSD,childDeduction:ihCD,totalDeduction:ihTD,taxableAmount:ihTax,tax:ihRes.tax,rate:ihRes.rate,bracket:ihRes.bracket}}, insurance:{items:insItems,lackCount:insLack,totalNeeded:insNeedT,totalPrepared:insPrepT,overallRate:insRate,annualIncome:insAI}, desire:{currentStage:dCur,stageName:dName,stageEmoji:dEmoji,stageDesc:dDesc,stages:dStages} };
};

// ★★★ v3.5: 공유 모달 - 상단 위치 + PDF 생성 기능 ★★★
const ShareModal = ({ isOpen, onClose, userName, contentRef }: { isOpen: boolean; onClose: () => void; userName: string; contentRef: React.RefObject<HTMLDivElement | null> }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  // PDF 생성 함수
  const generatePdf = async (): Promise<Blob | null> => {
    if (!contentRef.current) return null;
    setIsGenerating(true);
    try {
      const html2pdf = await loadHtml2Pdf();
      const element = contentRef.current;
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `${userName}_재무설계리포트.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, allowTaint: true, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };
      const pdfInstance = html2pdf().set(opt).from(element);
      const blob = await pdfInstance.outputPdf('blob');
      setPdfBlob(blob);
      return blob;
    } catch (err) {
      console.error('PDF 생성 실패:', err);
      alert('PDF 생성에 실패했습니다. 다시 시도해주세요.');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  // PDF 다운로드
  const downloadPdf = async () => {
    const blob = pdfBlob || await generatePdf();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${userName}_재무설계리포트.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  // 카카오톡 공유 (PDF 다운로드 후 안내)
  const shareKakao = async () => {
    await downloadPdf();
    alert('PDF가 다운로드되었습니다.\n카카오톡에서 파일을 첨부하여 공유해주세요.');
  };

  // 이메일 공유
  const shareEmail = async () => {
    await downloadPdf();
    const subject = encodeURIComponent(`${userName}님의 종합재무설계 리포트`);
    const body = encodeURIComponent(`안녕하세요,\n\n${userName}님의 종합재무설계 리포트를 첨부합니다.\n\nAI머니야 금융집짓기® 기반으로 작성된 리포트입니다.\n\n감사합니다.`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  // 문자 공유
  const shareSMS = async () => {
    await downloadPdf();
    alert('PDF가 다운로드되었습니다.\n문자에서 파일을 첨부하여 공유해주세요.');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-sm mx-4 overflow-hidden shadow-2xl animate-slide-down">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-teal-500 to-emerald-500">
          <h3 className="text-base font-bold text-white">📄 리포트 PDF 공유</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30"><svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        {isGenerating ? (
          <div className="p-8 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm text-slate-600 font-medium">PDF 생성 중...</p>
            <p className="text-xs text-slate-400 mt-1">잠시만 기다려주세요</p>
          </div>
        ) : (
          <>
            <div className="p-5 grid grid-cols-4 gap-4">
              <button onClick={shareKakao} className="flex flex-col items-center gap-2 group"><div className="w-14 h-14 rounded-2xl bg-[#FEE500] flex items-center justify-center group-hover:scale-105 transition-transform shadow-md"><svg className="w-8 h-8" viewBox="0 0 24 24" fill="#3C1E1E"><path d="M12 3C6.477 3 2 6.463 2 10.714c0 2.683 1.786 5.037 4.465 6.386-.197.727-.713 2.635-.816 3.043-.128.509.187.502.393.365.162-.107 2.58-1.747 3.625-2.456.77.108 1.567.162 2.333.162 5.523 0 10-3.463 10-7.5S17.523 3 12 3z"/></svg></div><span className="text-xs text-slate-600 font-medium">카카오톡</span></button>
              <button onClick={shareEmail} className="flex flex-col items-center gap-2 group"><div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center group-hover:scale-105 transition-transform shadow-md"><svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></div><span className="text-xs text-slate-600 font-medium">이메일</span></button>
              <button onClick={shareSMS} className="flex flex-col items-center gap-2 group"><div className="w-14 h-14 rounded-2xl bg-green-500 flex items-center justify-center group-hover:scale-105 transition-transform shadow-md"><svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg></div><span className="text-xs text-slate-600 font-medium">문자</span></button>
              <button onClick={downloadPdf} className="flex flex-col items-center gap-2 group"><div className="w-14 h-14 rounded-2xl bg-slate-700 flex items-center justify-center group-hover:scale-105 transition-transform shadow-md"><svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div><span className="text-xs text-slate-600 font-medium">PDF저장</span></button>
            </div>
            <div className="px-5 pb-5"><p className="text-[11px] text-slate-400 text-center">PDF 파일로 저장하여 공유하세요</p></div>
          </>
        )}
      </div>
      <style>{`@keyframes slideDown{from{transform:translateY(-100%);opacity:0}to{transform:translateY(0);opacity:1}}.animate-slide-down{animation:slideDown 0.3s ease-out}`}</style>
    </div>
  );
};

const Sec = ({num,title,color,pill,children}:{num:string;title:string;color:string;pill?:{grade:string;label:string;color:string};children:React.ReactNode}) => (<section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"><div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2"><span className={`w-6 h-6 rounded-lg bg-${color}-50 flex items-center justify-center text-xs font-bold text-${color}-600`}>{num}</span><h2 className="text-sm font-bold text-slate-800">{title}</h2>{pill&&<div className="ml-auto"><span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{backgroundColor:pill.color+'15',color:pill.color}}>{pill.grade} {pill.label}</span></div>}</div><div className="p-4 space-y-4">{children}</div></section>);

const IC = ({l,v,s,c='slate'}:{l:string;v:string;s?:string;c?:string}) => { const cm:Record<string,{t:string;b:string;bd:string}> = {emerald:{t:'text-emerald-600',b:'bg-emerald-50',bd:'border-emerald-200'},red:{t:'text-red-600',b:'bg-red-50',bd:'border-red-200'},blue:{t:'text-blue-600',b:'bg-blue-50',bd:'border-blue-200'},teal:{t:'text-teal-600',b:'bg-teal-50',bd:'border-teal-200'},amber:{t:'text-amber-600',b:'bg-amber-50',bd:'border-amber-200'},slate:{t:'text-slate-600',b:'bg-slate-50',bd:'border-slate-200'},indigo:{t:'text-indigo-600',b:'bg-indigo-50',bd:'border-indigo-200'},violet:{t:'text-violet-600',b:'bg-violet-50',bd:'border-violet-200'},sky:{t:'text-sky-600',b:'bg-sky-50',bd:'border-sky-200'},orange:{t:'text-orange-600',b:'bg-orange-50',bd:'border-orange-200'},pink:{t:'text-pink-600',b:'bg-pink-50',bd:'border-pink-200'}}; const x=cm[c]||cm.slate; return <div className={`${x.b} rounded-xl p-3.5 border ${x.bd}`}><p className="text-[10px] text-slate-400 mb-1">{l}</p><p className={`text-lg font-bold ${x.t}`}>{v}</p>{s&&<p className="text-[9px] text-slate-400 mt-0.5">{s}</p>}</div>; };

const GradientCard = ({label,value,from,to,sub}:{label:string;value:string;from:string;to:string;sub?:string}) => (<div className={`bg-gradient-to-br from-${from}-50 to-${to}-50 rounded-xl p-3 border border-${from}-100`}><p className={`text-[10px] text-${from}-500 font-medium`}>{label}</p><p className={`text-lg font-extrabold text-${from}-700`}>{value}</p>{sub&&<p className={`text-[9px] text-${from}-400`}>{sub}</p>}</div>);

const GB = ({g}:{g:{grade:string;label:string;color:string;bg:string}}) => (<div className="flex flex-col items-center gap-1 flex-shrink-0"><div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-extrabold border-2" style={{backgroundColor:g.bg,color:g.color,borderColor:g.color+'40'}}>{g.grade}</div><span className="text-[10px] font-semibold" style={{color:g.color}}>{g.label}</span></div>);

const DR = ({c,l,n,a,r}:{c:string;l:string;n:number;a:number;r:number}) => (<div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className={`w-2.5 h-2.5 rounded-full ${c}`}/><span className="text-xs text-slate-600">{l} ({n}건)</span></div><div className="flex items-center gap-3"><span className="text-xs font-semibold text-slate-700">{fmt.eok(a)}</span><span className="text-[10px] text-slate-400 w-8 text-right">{r}%</span></div></div>);

const EmergencyBox = ({fund,months,required,grade,isDual,recAmt}:{fund:number;months:number;required:number;grade:{grade:string;label:string;color:string};isDual:boolean;recAmt:number}) => (<div className="bg-slate-50 rounded-xl p-3 space-y-2"><div className="flex items-center justify-between"><p className="text-[10px] text-slate-400 font-semibold">🛡️ 비상예비자금</p><span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{backgroundColor:grade.color+'15',color:grade.color}}>{grade.grade} {grade.label}</span></div><div className="flex items-end justify-between"><div><p className="text-lg font-extrabold" style={{color:grade.color}}>{fmt.manwon(fund)}</p><p className="text-[10px] text-slate-400">월필수지출 {fmt.manwon(required)} × {months}개월</p></div><p className="text-[10px] text-slate-500">권장: {isDual?'3':'6'}개월 ({fmt.manwon(recAmt)})</p></div></div>);

const TimelineBar = ({age,retireAge}:{age:number;retireAge:number}) => (<div className="bg-slate-50 rounded-xl p-3"><p className="text-[10px] text-slate-400 font-semibold mb-2">📅 생애주기</p><div className="relative h-2 bg-slate-200 rounded-full overflow-hidden"><div className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full" style={{width:`${Math.min(100,age>0?(age/90)*100:0)}%`}}/>{retireAge>0&&<div className="absolute top-0 h-full w-0.5 bg-amber-500" style={{left:`${(retireAge/90)*100}%`}}/>}</div><div className="flex justify-between mt-1.5"><span className="text-[9px] text-teal-600 font-semibold">현재 {age}세</span><span className="text-[9px] text-amber-600 font-semibold">은퇴 {retireAge}세</span><span className="text-[9px] text-slate-400">90세</span></div></div>);

const BarChart = ({title,items,max,showPct,pctFn}:{title:string;items:{l:string;v:number;c:string}[];max:number;showPct?:boolean;pctFn?:(v:number)=>number}) => (<div><p className="text-[10px] text-slate-400 font-semibold mb-2">{title}</p><div className="space-y-2">{items.map(i=>(<div key={i.l} className="flex items-center gap-2"><span className="text-[10px] text-slate-500 w-12 text-right flex-shrink-0">{i.l}</span><div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{width:`${(i.v/max)*100}%`,backgroundColor:i.c}}/></div><div className="flex items-center gap-1 w-20 justify-end flex-shrink-0"><span className="text-[10px] font-semibold text-slate-600">{fmt.manwon(i.v)}</span>{showPct&&pctFn&&<span className="text-[9px] text-slate-400">({pctFn(i.v)}%)</span>}</div></div>))}</div></div>);

const RetireTable = ({data:r}:{data:any}) => (<div className="space-y-2"><p className="text-[10px] text-slate-400 font-semibold">📊 월 노후생활비 분석</p><div className="border border-slate-100 rounded-xl overflow-hidden"><div className="bg-slate-50 px-3 py-2 flex items-center justify-between"><span className="text-[10px] text-slate-500 font-semibold">필요 노후생활비</span><span className="text-sm font-extrabold text-slate-800">{fmt.manwon(r.requiredMonthly)}/월</span></div>{[{l:'국민연금',v:r.expectedNationalPension},{l:'개인연금',v:r.currentPersonalPension},{l:'퇴직금 월환산',v:r.monthlySavingForRetire}].map(x=>(<div key={x.l} className="px-3 py-2 flex items-center justify-between border-t border-slate-50"><span className="text-[10px] text-slate-500">{x.l}</span><span className="text-xs font-bold text-emerald-600">+{fmt.manwon(x.v)}</span></div>))}<div className="bg-gradient-to-r from-sky-50 to-indigo-50 px-3 py-2 flex items-center justify-between border-t border-sky-100"><span className="text-[10px] text-sky-600 font-bold">준비된 월수령액</span><span className="text-sm font-extrabold text-sky-700">{fmt.manwon(r.totalPreparedMonthly)}/월</span></div></div></div>);

const DonutSection = ({label,ratio,total,other,warn}:{label:string;ratio:number;total:number;other:number;warn?:string}) => (<div className="bg-slate-50 rounded-xl p-3"><p className="text-[10px] text-slate-400 font-semibold mb-3">🏠 {label}</p><div className="flex items-center gap-3"><div className="relative w-20 h-20 flex-shrink-0"><svg viewBox="0 0 36 36" className="w-full h-full -rotate-90"><circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3"/><circle cx="18" cy="18" r="15.9" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray={`${ratio} ${100-ratio}`} strokeLinecap="round"/></svg><div className="absolute inset-0 flex items-center justify-center"><span className="text-sm font-extrabold text-amber-600">{ratio}%</span></div></div><div className="flex-1 space-y-1.5"><div className="flex items-center justify-between"><div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-400"/><span className="text-[10px] text-slate-600">부동산</span></div><span className="text-[10px] font-semibold text-slate-700">{fmt.eok(total)}</span></div><div className="flex items-center justify-between"><div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-300"/><span className="text-[10px] text-slate-600">기타</span></div><span className="text-[10px] font-semibold text-slate-700">{fmt.eok(other)}</span></div></div></div>{warn&&<div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-2"><p className="text-[10px] text-amber-700">⚠️ {warn}</p></div>}</div>);

const InheritSection = ({inh}:{inh:any}) => (<div className="space-y-2"><p className="text-[10px] text-slate-400 font-semibold">🏛️ 상속세 시뮬레이션</p><div className="border border-slate-100 rounded-xl overflow-hidden"><div className="bg-slate-50 px-3 py-2 flex items-center justify-between"><span className="text-[10px] text-slate-500 font-semibold">상속 총자산</span><span className="text-xs font-bold text-slate-700">{fmt.eok(inh.totalAssets)}</span></div>{[{l:'(-) 채무',v:inh.totalDebts,c:'text-rose-500'},{l:'(-) 기초공제',v:inh.basicDeduction,c:'text-blue-500'}].map(x=>(<div key={x.l} className="px-3 py-2 flex items-center justify-between border-t border-slate-50"><span className="text-[10px] text-slate-500">{x.l}</span><span className={`text-xs font-bold ${x.c}`}>-{fmt.eok(x.v)}</span></div>))}{inh.hasSpouse&&<div className="px-3 py-2 flex items-center justify-between border-t border-slate-50"><span className="text-[10px] text-slate-500">(-) 배우자공제</span><span className="text-xs font-bold text-blue-500">-{fmt.eok(inh.spouseDeduction)}</span></div>}{inh.childrenCount>0&&<div className="px-3 py-2 flex items-center justify-between border-t border-slate-50"><span className="text-[10px] text-slate-500">(-) 자녀공제 ({inh.childrenCount}명)</span><span className="text-xs font-bold text-blue-500">-{fmt.eok(inh.childDeduction)}</span></div>}<div className="bg-orange-50 px-3 py-2 flex items-center justify-between border-t border-orange-100"><span className="text-[10px] text-orange-600 font-bold">과세표준</span><span className="text-sm font-extrabold text-orange-700">{fmt.eok(inh.taxableAmount)}</span></div></div><div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-3.5 border border-orange-100"><div className="flex items-center justify-between mb-2"><div><p className="text-[10px] text-orange-500 font-semibold">적용 세율</p><p className="text-xs font-bold text-orange-700">{inh.bracket} ({inh.rate}%)</p></div></div><div className="bg-white rounded-lg p-2.5 border border-orange-100"><p className="text-[10px] text-slate-500">예상 상속세</p><p className="text-xl font-extrabold text-orange-700">{fmt.eok(inh.tax)}</p></div></div></div>);

const TaxTips = () => (<div className="bg-slate-50 rounded-xl p-3 border border-slate-100"><p className="text-[10px] text-slate-500 font-semibold mb-2">💡 세금 절약 Tips</p><div className="space-y-1.5">{['연금저축+IRP: 연 최대 900만원 세액공제 (16.5%)','ISA 계좌: 비과세 혜택 (200~400만원)','주택청약저축: 소득공제 (무주택 세대주)','기부금: 세액공제 15~30%'].map((t,i)=>(<div key={i} className="flex items-start gap-1.5"><span className="text-[10px] text-orange-400 mt-0.5">•</span><p className="text-[10px] text-slate-600 leading-relaxed">{t}</p></div>))}</div></div>);

interface Props { userName?: string; onClose: () => void; }

const FinancialReport = ({ userName, onClose }: Props) => {
  const [data, setData] = useState(() => loadData());
  const [showShareModal, setShowShareModal] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const refresh = useCallback(() => setData(loadData()), []);

  // ★★★ v3.5: PDF 출력 ★★★
  const handlePrint = useCallback(async () => {
    if (!contentRef.current) return;
    try {
      const html2pdf = await loadHtml2Pdf();
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `${data.pi.name||userName||'고객'}_재무설계리포트.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, allowTaint: true, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      await html2pdf().set(opt).from(contentRef.current).save();
    } catch (err) {
      console.error('PDF 저장 실패:', err);
      window.print();
    }
  }, [data.pi.name, userName]);

  const handleShare = useCallback(() => { setShowShareModal(true); }, []);

  useEffect(() => { window.addEventListener('storage',refresh); const id=setInterval(refresh,2000); return()=>{window.removeEventListener('storage',refresh);clearInterval(id);}; }, [refresh]);

  const nm = data.pi.name||userName||'고객';
  const today = new Date();
  const dateStr = `${today.getFullYear()}년 ${today.getMonth()+1}월 ${today.getDate()}일`;
  const debtG = getDebtGrade(data.dRatio); const savG = getSavingGrade(data.savRate); const emG = getEmergencyGrade(data.emMon);
  const retG = getRetireGrade(data.retire.retirementReadyRate); const wG = getWealthGrade(data.invest.wealthIndex); const insG = getInsuranceGrade(data.insurance.overallRate);
  const reT = data.reAst.residential+data.reAst.investment; const reR = data.totAst>0?Math.round((reT/data.totAst)*100):0;
  const expItems = [{l:'생활비',v:data.exp.living,c:'#6366f1'},{l:'보험',v:data.exp.insurance,c:'#0ea5e9'},{l:'대출',v:data.exp.loan,c:'#f43f5e'},{l:'저축/투자',v:data.exp.saving,c:'#10b981'},{l:'연금',v:data.exp.pension,c:'#8b5cf6'},{l:'잉여',v:data.exp.surplus,c:'#94a3b8'}].filter(i=>i.v>0);
  const expMax = Math.max(...expItems.map(i=>i.v),1);
  const pfItems = [{l:'유동성',v:data.invest.portfolio.liquid,c:'#38bdf8'},{l:'안정성',v:data.invest.portfolio.safe,c:'#34d399'},{l:'수익성',v:data.invest.portfolio.growth,c:'#a78bfa'},{l:'고수익',v:data.invest.portfolio.highRisk,c:'#fb923c'}].filter(i=>i.v>0);
  const pfMax = Math.max(...pfItems.map(i=>i.v),1);
  const pfPct = (v:number) => data.invest.portfolioTotal>0?Math.round((v/data.invest.portfolioTotal)*100):0;
  const gradeToScore = (g:string) => g==='A'?100:g==='B'?75:g==='C'?50:25;
  const overallScore = Math.round(([debtG,savG,retG,wG,insG].map(g=>gradeToScore(g.grade)).reduce((a,b)=>a+b,0))/5);
  const overallGrade = overallScore>=80?'A':overallScore>=60?'B':overallScore>=40?'C':'D';

  const actionPlan: {priority:number;area:string;emoji:string;action:string;detail:string}[] = [];
  let prio = 1;
  if (data.desire.currentStage === 1) actionPlan.push({priority:prio++,area:'부채',emoji:'💳',action:'신용대출 즉시 상환',detail:`신용대출 ${fmt.eok(data.credT)} → 고금리부터 스노우볼 상환`});
  if (data.emMon < (data.invest.isDualIncome?3:6)) actionPlan.push({priority:prio++,area:'비상자금',emoji:'🛡️',action:'비상예비자금 확보',detail:`현재 ${data.emMon}개월분 → 목표 ${data.invest.isDualIncome?3:6}개월분 (${fmt.manwon(data.invest.recommendedEmergency)})`});
  if (data.retire.monthlyShortfall > 0) actionPlan.push({priority:prio++,area:'은퇴',emoji:'🏖️',action:'추가 노후자금 저축',detail:`월 ${fmt.manwon(data.retire.additionalMonthlySaving)} 추가 저축으로 부족분 해소`});
  if (data.insurance.lackCount > 0) actionPlan.push({priority:prio++,area:'보험',emoji:'🛡️',action:`보험 보장 ${data.insurance.lackCount}개 보완`,detail:'부족 항목 점검 후 전문 설계사 상담 권장'});
  if (data.savRate < 20) actionPlan.push({priority:prio++,area:'저축',emoji:'💰',action:'저축률 20% 이상 확보',detail:`현재 ${data.savRate}% → 목표 20%↑ (월 ${fmt.manwon(Math.max(0,Math.round(data.inc.total*0.2)-(data.exp.saving+data.exp.pension)))} 추가)`});
  if (reR > 70) actionPlan.push({priority:prio++,area:'부동산',emoji:'🏠',action:'부동산 비중 조정',detail:`현재 ${reR}% → 유동성 자산 확보 권장`});
  if (actionPlan.length === 0) actionPlan.push({priority:1,area:'종합',emoji:'🎉',action:'현재 재무상태 양호',detail:'현재 전략을 유지하며 정기적으로 리밸런싱하세요.'});

  return (
    <div className="fixed inset-0 z-50 overflow-hidden print-report-root">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm print-overlay" onClick={onClose} />
      <div className="relative h-full flex flex-col">
        <div className="fixed top-10 left-0 right-0 bg-white/95 backdrop-blur border-b border-slate-200 px-4 py-3 flex items-center justify-between print:hidden z-[60]">
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"><svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg></button>
          <h1 className="text-sm font-bold text-slate-700">종합재무설계 리포트</h1>
          <div className="flex items-center gap-2">
            <button onClick={handleShare} className="w-10 h-10 flex items-center justify-center bg-teal-500 rounded-xl hover:bg-teal-600 transition-colors shadow-md" title="PDF 공유"><svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg></button>
            <button onClick={handlePrint} className="w-10 h-10 flex items-center justify-center bg-slate-700 rounded-xl hover:bg-slate-800 transition-colors shadow-md" title="PDF 저장"><svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg></button>
          </div>
        </div>
        <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} userName={nm} contentRef={contentRef} />
        <div ref={ref} className="flex-1 overflow-y-auto bg-slate-50 mt-[104px] print-scroll-area">
          <div ref={contentRef} className="p-4 pb-20 space-y-5 print-content-area bg-slate-50">
            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white min-h-[200px] flex flex-col justify-between print:break-after-page">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-teal-500/20 to-transparent rounded-bl-full"/><div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-indigo-500/15 to-transparent rounded-tr-full"/>
              <div className="relative z-10"><div className="flex items-center gap-2 mb-1"><img src={LOGO_URL} alt="AI머니야" className="h-7 rounded"/><span className="text-[10px] text-teal-300 font-medium tracking-wider">AI MONEYA</span></div><p className="text-[10px] text-slate-400 mt-2">{dateStr} 기준</p></div>
              <div className="relative z-10 mt-6"><h1 className="text-2xl font-extrabold tracking-tight leading-snug">{nm}님의<br/><span className="text-teal-300">종합재무설계</span> 리포트</h1><p className="text-xs text-slate-400 mt-2">금융집짓기® 기반 | 오원트금융연구소</p></div>
              <div className="relative z-10 mt-4 flex items-center gap-2"><img src={PROFILE_IMAGE_URL} alt="오상열 CFP" className="w-8 h-8 rounded-full border border-slate-600 object-cover"/><div><p className="text-[10px] font-semibold text-slate-300">오상열 CFP</p><p className="text-[9px] text-slate-500">오원트금융연구소 대표</p></div></div>
            </section>

            <section className="bg-gradient-to-br from-indigo-50 via-white to-teal-50 rounded-2xl shadow-sm border border-indigo-100 overflow-hidden print:break-before-page">
              <div className="px-5 py-3.5 border-b border-indigo-100 flex items-center gap-2"><span className="text-lg">📊</span><h2 className="text-sm font-bold text-slate-800">종합재무 요약 (Executive Summary)</h2></div>
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-4"><div className="relative w-20 h-20 flex-shrink-0"><svg viewBox="0 0 36 36" className="w-full h-full -rotate-90"><circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3"/><circle cx="18" cy="18" r="15.9" fill="none" stroke={overallGrade==='A'?'#059669':overallGrade==='B'?'#0891b2':overallGrade==='C'?'#d97706':'#dc2626'} strokeWidth="3" strokeDasharray={`${overallScore} ${100-overallScore}`} strokeLinecap="round"/></svg><div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-xl font-extrabold" style={{color:overallGrade==='A'?'#059669':overallGrade==='B'?'#0891b2':overallGrade==='C'?'#d97706':'#dc2626'}}>{overallGrade}</span><span className="text-[9px] text-slate-400">{overallScore}점</span></div></div><div className="flex-1 space-y-1"><p className="text-sm font-bold text-slate-700">{nm}님의 종합 재무건강도</p><p className="text-[10px] text-slate-400">7개 영역 분석 기반 종합 평가</p><div className="flex flex-wrap gap-1 mt-1">{[{l:'부채',g:debtG},{l:'저축',g:savG},{l:'은퇴',g:retG},{l:'투자',g:wG},{l:'보험',g:insG}].map(x=>(<span key={x.l} className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{backgroundColor:x.g.color+'15',color:x.g.color}}>{x.l} {x.g.grade}</span>))}</div></div></div>
                <div className="bg-white rounded-xl p-3 border border-slate-100"><div className="flex items-center gap-2 mb-2"><span className="text-lg">{data.desire.stageEmoji}</span><div><p className="text-xs font-bold text-slate-700">DESIRE {data.desire.currentStage}단계: {data.desire.stageName}</p><p className="text-[10px] text-slate-400">{data.desire.stageDesc}</p></div></div><div className="flex gap-1">{data.desire.stages.map((s,i)=>(<div key={i} className={`flex-1 h-2 rounded-full ${i<data.desire.currentStage?'bg-teal-400':i===data.desire.currentStage-1?'bg-amber-400':'bg-slate-200'}`} title={`${s.letter}: ${s.kr}`}/>))}</div></div>
                <div className="grid grid-cols-4 gap-2">{[{l:'순자산',v:fmt.eok(data.netAst),c:'#6366f1'},{l:'부자지수',v:String(data.invest.wealthIndex),c:'#8b5cf6'},{l:'은퇴준비',v:`${data.retire.retirementReadyRate}%`,c:'#0891b2'},{l:'보험보장',v:`${data.insurance.overallRate}%`,c:'#059669'}].map(x=>(<div key={x.l} className="text-center p-2 rounded-lg" style={{backgroundColor:x.c+'10'}}><p className="text-[9px] text-slate-400">{x.l}</p><p className="text-sm font-extrabold" style={{color:x.c}}>{x.v}</p></div>))}</div>
              </div>
            </section>

            <Sec num="01" title="인적사항" color="indigo"><div className="grid grid-cols-3 gap-2"><IC l="이름" v={nm} c="indigo"/><IC l="나이" v={`${data.pi.age}세`} s={`은퇴 ${data.pi.retireAge}세`} c="blue"/><IC l="결혼" v={data.pi.married} c="teal"/><IC l="수입형태" v={data.pi.dualIncome} c="emerald"/><IC l="직업" v={data.pi.job} c="slate"/><IC l="가족수" v={`${data.pi.familyCount}명`} c="amber"/></div><div className="grid grid-cols-2 gap-2"><GradientCard label="월수입" value={fmt.manwon(data.inc.total)} from="emerald" to="teal"/><GradientCard label="월지출" value={fmt.manwon(data.exp.total)} from="rose" to="orange"/><GradientCard label="총자산" value={fmt.eok(data.totAst)} from="blue" to="indigo"/><GradientCard label="순자산" value={fmt.eok(data.netAst)} from="violet" to="purple" sub={`부채 ${fmt.eok(data.dbt.totalDebt)}`}/></div><TimelineBar age={data.pi.age} retireAge={data.pi.retireAge}/></Sec>

            <Sec num="02" title="경제적 관심사 & 재무목표" color="teal">{data.interests.length>0?(<div className="space-y-2"><p className="text-[10px] text-slate-400 font-semibold">🎯 관심사 (우선순위)</p><div className="flex flex-wrap gap-2">{data.interests.map((k,i)=>{const it=interestLabels[k]||{emoji:'🔹',label:k};return(<div key={k} className="flex items-center gap-1.5 bg-slate-50 rounded-full px-3 py-1.5 border border-slate-100"><span className="text-[10px] text-teal-600 font-bold">{i+1}</span><span className="text-xs">{it.emoji}</span><span className="text-xs font-medium text-slate-700">{it.label}</span></div>);})}</div></div>):(<p className="text-xs text-slate-400 text-center py-4">관심사 미등록</p>)}{data.goal&&goalLabels[data.goal]&&(<div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-3.5 border border-teal-100"><p className="text-[10px] text-teal-500 font-semibold mb-1">🏆 최우선 재무목표</p><div className="flex items-center gap-2"><span className="text-2xl">{goalLabels[data.goal].emoji}</span><span className="text-base font-bold text-teal-700">{goalLabels[data.goal].label}</span></div></div>)}</Sec>

            <section className="overflow-hidden rounded-2xl shadow-sm print:break-before-page">
              <div className="relative bg-gradient-to-b from-teal-400 to-teal-500 p-3">
                <div className="w-full max-w-[340px] mx-auto">
                  <div className="relative"><svg viewBox="0 0 340 90" className="w-full" preserveAspectRatio="xMidYMid meet"><polygon points="255,10 295,10 295,66 255,45" fill="#E8E8E8" stroke="#333" strokeWidth="1.5"/><polygon points="170,0 0,90 170,90" fill="#C0392B" stroke="#333" strokeWidth="1.5"/><polygon points="170,0 340,90 170,90" fill="#27AE60" stroke="#333" strokeWidth="1.5"/><line x1="170" y1="0" x2="170" y2="90" stroke="#333" strokeWidth="1"/></svg><div className="absolute inset-0 flex"><div className="flex-1 flex flex-col items-end justify-center pt-6 pr-3"><p className="text-[11px] font-extrabold text-white">📈 투자</p><p className="text-[9px] text-white/90 mt-0.5">부자지수 <span className="font-bold">{data.invest.wealthIndex > 0 ? `${data.invest.wealthIndex}%` : '-'}</span></p><p className="text-[8px] text-white/80">순자산 <span className="font-bold">{data.netAst > 0 ? fmt.eok(data.netAst) : '-'}</span></p></div><div className="flex-1 flex flex-col items-start justify-center pt-6 pl-3"><p className="text-[11px] font-extrabold text-white">💸 세금</p><p className="text-[9px] text-white/90 mt-0.5">결정세액 <span className="font-bold">{data.tax.determinedTax > 0 ? fmt.manwon(data.tax.determinedTax) : '-'}</span></p><p className="text-[8px] text-white/80">예상상속세 <span className="font-bold">{data.tax.inherit.tax > 0 ? fmt.manwon(data.tax.inherit.tax) : '-'}</span></p></div></div><div className="absolute right-[38px] top-[20px] text-center"><p className="text-[9px] font-bold text-gray-700">🏠 부동산</p><p className="text-[7px] text-gray-600">{data.reAst.residential > 0 ? fmt.eok(data.reAst.residential) : '-'}</p></div></div>
                  {(()=>{const eP=Math.max(0,data.retire.retireAge-data.pi.age);const rP=Math.max(0,90-data.retire.retireAge);return(<div className="bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 border-x-2 border-gray-800 px-2 py-1.5 flex items-center justify-between"><div className="text-center"><p className="text-[13px] font-extrabold text-gray-800">{data.pi.age}</p><p className="text-[7px] text-gray-500">현재</p></div><div className="flex-1 flex items-center justify-center mx-1"><div className="flex items-center gap-0.5"><span className="text-red-500 text-[8px]">◀</span><div className="flex-1 h-[1px] bg-red-400 min-w-[20px]"/><span className="text-[9px] font-bold text-red-500 px-1">{eP}년</span><div className="flex-1 h-[1px] bg-red-400 min-w-[20px]"/><span className="text-red-500 text-[8px]">▶</span></div></div><div className="text-center"><p className="text-[13px] font-extrabold text-gray-800">{data.retire.retireAge}</p><p className="text-[7px] text-gray-500">은퇴</p></div><div className="flex-1 flex items-center justify-center mx-1"><div className="flex items-center gap-0.5"><span className="text-red-500 text-[8px]">◀</span><div className="flex-1 h-[1px] bg-red-400 min-w-[15px]"/><span className="text-[9px] font-bold text-red-500 px-1">{rP}년</span><div className="flex-1 h-[1px] bg-red-400 min-w-[15px]"/><span className="text-red-500 text-[8px]">▶</span></div></div><div className="text-center"><p className="text-[13px] font-extrabold text-gray-800">90</p><p className="text-[7px] text-gray-500">기대수명</p></div></div>);})()}
                  <div className="flex border-x-2 border-gray-800" style={{height:'110px'}}><div className="relative border-r-2 border-gray-800" style={{flex:'50'}}><svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="none"><polygon points="0,0 100,0 0,100" fill="#F1C40F"/><polygon points="100,0 100,100 0,100" fill="#8B4513"/><line x1="0" y1="100" x2="100" y2="0" stroke="#333" strokeWidth="0.5"/></svg><div className="absolute top-2 left-2 text-left"><p className="text-[10px] font-extrabold text-gray-800">💳 부채 <span className="text-red-500">↓</span></p><p className="text-[8px] text-gray-700">총부채 <span className="font-bold">{data.dbt.totalDebt > 0 ? fmt.eok(data.dbt.totalDebt) : '-'}</span></p><p className="text-[8px] text-gray-700">부채비율 <span className="font-bold text-red-600">{data.dRatio > 0 ? `${data.dRatio}%` : '-'}</span></p></div><div className="absolute bottom-2 right-2 text-right"><p className="text-[10px] font-extrabold text-white"><span className="text-green-300">↑</span> 💰 저축</p><p className="text-[8px] text-white/90">목적: {data.save.purpose||'-'}</p><p className="text-[8px] text-white/90">기간: {data.save.targetYears>0?`${data.save.targetYears}년`:'-'}</p><p className="text-[8px] text-white/90">목표금액: <span className="font-bold">{data.save.targetAmount > 0 ? fmt.manwon(data.save.targetAmount) : '-'}</span></p><p className="text-[8px] text-white/90">월저축 <span className="font-bold">{data.save.monthlySavingRequired > 0 ? fmt.manwon(data.save.monthlySavingRequired) : '-'}</span></p></div></div><div className="flex flex-col bg-gradient-to-b from-blue-100 to-blue-200" style={{flex:'50'}}><div className="flex-1 px-2 py-1.5 flex flex-col justify-center gap-0.5"><p className="text-[10px] font-extrabold text-blue-700 mb-0.5">🏖️ 은퇴</p><div className="flex justify-between"><span className="text-[8px] text-gray-600">필요자금(월)</span><span className="text-[9px] font-semibold text-gray-800">{fmt.manwon(data.retire.requiredMonthly)}</span></div><div className="flex justify-between"><span className="text-[8px] text-gray-600">준비자금(월)</span><span className="text-[9px] font-semibold text-gray-800">{fmt.manwon(data.retire.preparedMonthly||data.retire.totalPreparedMonthly)}</span></div><div className="flex justify-between"><span className="text-[8px] text-gray-600">부족자금(월)</span><span className="text-[9px] font-bold text-red-500">{fmt.manwon(data.retire.monthlyShortfall)}</span></div><div className="border-t border-gray-300 mt-0.5 pt-0.5"><div className="flex justify-between"><span className="text-[7px] text-gray-500">순은퇴일시금</span><span className="text-[8px] font-bold text-red-500">{fmt.eok(data.retire.totalRequiredRetireFund||0)}</span></div><div className="flex justify-between"><span className="text-[7px] text-gray-500">월저축연금액</span><span className="text-[8px] font-semibold text-gray-800">{fmt.manwon(data.retire.monthlySavingForRetire||0)}</span></div><div className="flex justify-between"><span className="text-[7px] text-gray-500">은퇴준비율</span><span className="text-[8px] font-bold text-blue-600">{data.retire.retirementReadyRate}%</span></div></div></div></div></div>
                  <div className="border-2 border-t-0 border-gray-800 px-2 py-2" style={{backgroundColor:'#3E2723'}}><div className="flex items-center justify-between mb-1.5"><p className="text-[10px] font-extrabold text-amber-300">🛡️ 보장성 보험 (8대 보장)</p></div><div className="flex gap-1">{data.insurance.items.map((item: any, idx: number) => { const ratio = item.needed > 0 ? (item.prepared / item.needed) * 100 : 0; const hasData = item.needed > 0 || item.prepared > 0; const barPercent = Math.min((ratio / 200) * 100, 100); const isOver = ratio > 100; return (<div key={idx} className="flex-1 flex flex-col items-center"><div className="w-full h-12 rounded-sm overflow-hidden flex flex-col justify-end relative" style={{backgroundColor:'#5D4037'}}><div className="absolute left-0 right-0 h-[2px] bg-red-500 z-10" style={{bottom:'50%'}}/>{hasData && (<div className="w-full rounded-t-sm" style={{height:`${barPercent}%`,backgroundColor:isOver?'#F39C12':'#F1C40F',minHeight:barPercent>0?'2px':'0'}}/>)}{!hasData && (<div className="flex items-center justify-center h-full"><p className="text-[5px] text-gray-400">미입력</p></div>)}</div><p className={`text-[7px] font-semibold mt-0.5 ${ratio >= 100 ? 'text-green-400' : ratio > 0 ? 'text-amber-300' : 'text-gray-500'}`}>{hasData ? `${Math.round(ratio)}%` : '-'}</p><p className="text-[6px] text-amber-200/80 leading-tight text-center whitespace-pre-line">{item.label}</p></div>); })}</div><div className="flex items-center gap-3 mt-1.5 justify-center"><div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm" style={{backgroundColor:'#F1C40F'}}/><span className="text-[6px] text-amber-200/70">준비자금</span></div><div className="flex items-center gap-1"><div className="w-3 h-[2px] bg-red-500"/><span className="text-[6px] text-amber-200/70">필요자금(기준)</span></div></div></div>
                  <p className="text-[8px] text-white/80 text-center mt-2">출처: 한국FPSB, 오원트금융연구소</p>
                </div>
              </div>
            </section>

            <Sec num="03" title="은퇴설계" color="sky" pill={retG}><div className="flex items-start gap-3"><GB g={retG}/><div className="flex-1"><p className="text-[10px] text-slate-400 mb-1">은퇴 준비율</p><p className="text-2xl font-extrabold" style={{color:retG.color}}>{data.retire.retirementReadyRate}%</p><div className="mt-1.5 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-700" style={{width:`${Math.min(100,data.retire.retirementReadyRate)}%`,backgroundColor:retG.color}}/></div><p className="text-[9px] text-slate-400 mt-1">준비된 월수령액 ÷ 필요 월생활비</p></div></div><div className="bg-sky-50 rounded-xl p-3 border border-sky-100"><p className="text-[10px] text-sky-500 font-semibold mb-2">⏱️ 은퇴 타임라인</p><div className="grid grid-cols-3 gap-2 text-center">{[{v:data.retire.currentAge,l:'현재',c:'text-sky-700'},{v:data.retire.retireAge,l:'은퇴',c:'text-amber-600'},{v:90,l:'기대수명',c:'text-slate-500'}].map(x=>(<div key={x.l}><p className={`text-lg font-extrabold ${x.c}`}>{x.v}세</p><p className="text-[9px] text-slate-400">{x.l}</p></div>))}</div><div className="mt-2 flex items-center gap-2 text-[10px]"><span className="bg-sky-100 text-sky-700 font-bold px-2 py-0.5 rounded-full">경제활동 {data.retire.yearsToRetire}년</span><span className="text-slate-300">→</span><span className="bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">은퇴생활 {data.retire.retireYears}년</span></div></div><RetireTable data={data.retire}/>{data.retire.monthlyShortfall>0?(<div className="bg-gradient-to-r from-rose-50 to-orange-50 rounded-xl p-3.5 border border-rose-100 space-y-2"><p className="text-[10px] text-rose-500 font-semibold">⚠️ 부족분 분석</p><div className="grid grid-cols-2 gap-2"><div><p className="text-[9px] text-slate-400">월부족액</p><p className="text-base font-extrabold text-rose-600">{fmt.manwon(data.retire.monthlyShortfall)}/월</p></div><div><p className="text-[9px] text-slate-400">총부족자금</p><p className="text-base font-extrabold text-rose-700">{fmt.eok(data.retire.totalRequiredRetireFund)}</p></div></div><div className="bg-white rounded-lg p-2.5 border border-rose-100"><p className="text-[10px] text-slate-500">{data.retire.yearsToRetire}년간 매월 추가저축:</p><p className="text-xl font-extrabold text-rose-600">{fmt.manwon(data.retire.additionalMonthlySaving)}/월</p></div></div>):data.retire.requiredMonthly>0?(<div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-3.5 border border-emerald-100"><p className="text-sm font-bold text-emerald-700">✅ 은퇴 준비 충분!</p></div>):null}</Sec>

            <Sec num="04" title="부채설계" color="rose" pill={debtG}><div className="flex items-start gap-3"><GB g={debtG}/><div className="flex-1 grid grid-cols-2 gap-2"><IC l="부채비율" v={fmt.percent(data.dRatio)} s="총자산 대비" c={data.dRatio>40?'red':'emerald'}/><IC l="DSR" v={fmt.percent(data.dsr)} s="연소득 대비" c={data.dsr>40?'red':'blue'}/><IC l="총부채" v={fmt.eok(data.dbt.totalDebt)} c="red"/><IC l="총자산" v={fmt.eok(data.totAst)} c="emerald"/></div></div>{data.dbt.totalDebt>0&&(<div><p className="text-[10px] text-slate-400 font-semibold mb-2">부채 구성</p><div className="h-3 rounded-full overflow-hidden flex">{data.mortT>0&&<div className="bg-blue-400" style={{width:`${(data.mortT/data.dbt.totalDebt)*100}%`}}/>}{data.credT>0&&<div className="bg-orange-400" style={{width:`${(data.credT/data.dbt.totalDebt)*100}%`}}/>}{data.othDT>0&&<div className="bg-slate-400" style={{width:`${(data.othDT/data.dbt.totalDebt)*100}%`}}/>}</div><div className="mt-2 space-y-1.5">{data.mortT>0&&<DR c="bg-blue-400" l="담보대출" n={data.dbt.mortgage.length} a={data.mortT} r={Math.round((data.mortT/data.dbt.totalDebt)*100)}/>}{data.credT>0&&<DR c="bg-orange-400" l="신용대출" n={data.dbt.credit.length} a={data.credT} r={Math.round((data.credT/data.dbt.totalDebt)*100)}/>}{data.othDT>0&&<DR c="bg-slate-400" l="기타대출" n={data.dbt.other.length} a={data.othDT} r={Math.round((data.othDT/data.dbt.totalDebt)*100)}/>}</div></div>)}<EmergencyBox fund={data.emFund} months={data.emMon} required={data.mReq} grade={emG} isDual={data.invest.isDualIncome} recAmt={data.invest.recommendedEmergency}/></Sec>

            <Sec num="05" title="저축설계" color="emerald" pill={savG}><div className="flex items-start gap-3"><GB g={savG}/><div className="flex-1"><p className="text-[10px] text-slate-400 mb-1">저축률</p><p className="text-2xl font-extrabold" style={{color:savG.color}}>{data.savRate}%</p><p className="text-[9px] text-slate-400">월소득 대비 저축+연금 (권장 20%↑)</p></div></div>{data.save.targetAmount>0&&(<div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100"><p className="text-[10px] text-emerald-500 font-semibold mb-2">🎯 목표 달성 계획</p><div className="grid grid-cols-2 gap-2">{[{l:'목적',v:data.save.purpose},{l:'기간',v:`${data.save.targetYears}년`},{l:'목표금액',v:fmt.manwon(data.save.targetAmount)},{l:'필요 월저축',v:fmt.manwon(data.save.monthlySavingRequired)}].map(x=>(<div key={x.l}><p className="text-[9px] text-slate-400">{x.l}</p><p className="text-xs font-bold text-slate-700">{x.v}</p></div>))}</div></div>)}{expItems.length>0&&(<BarChart title="💳 월지출 구성" items={expItems} max={expMax}/>)}</Sec>

            <Sec num="06" title="투자설계" color="violet" pill={wG}><div className="flex items-start gap-3"><GB g={wG}/><div className="flex-1"><p className="text-[10px] text-slate-400 mb-1">부자지수</p><p className="text-2xl font-extrabold" style={{color:wG.color}}>{data.invest.wealthIndex}</p><p className="text-[9px] text-slate-400">(순자산×10)÷(나이×연소득)×100 | 목표: 100↑</p></div></div><div className="bg-violet-50 rounded-xl p-3 border border-violet-100"><div className="flex items-center justify-between mb-1.5"><span className="text-[10px] text-violet-500 font-semibold">부자지수 게이지</span><span className="text-[10px] text-violet-600 font-bold">{data.invest.wealthIndex}/100</span></div><div className="h-3 bg-violet-100 rounded-full overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-purple-500" style={{width:`${Math.min(100,data.invest.wealthIndex)}%`}}/></div><div className="flex justify-between mt-1 text-[8px] text-violet-400"><span>0</span><span>25(D)</span><span>50(C)</span><span>100(A)</span></div></div><div className="grid grid-cols-3 gap-2"><IC l="총자산" v={fmt.eok(data.invest.totalAssets)} c="blue"/><IC l="총부채" v={fmt.eok(data.invest.totalDebt)} c="red"/><IC l="순자산" v={fmt.eok(data.invest.netAsset)} c="emerald"/></div>{data.invest.portfolioTotal>0&&(<BarChart title="📊 금융자산 포트폴리오" items={pfItems} max={pfMax} showPct pctFn={pfPct}/>)}<EmergencyBox fund={data.invest.portfolio.emergency} months={data.emMon} required={data.mReq} grade={emG} isDual={data.invest.isDualIncome} recAmt={data.invest.recommendedEmergency}/></Sec>

            <Sec num="07" title="세금설계" color="orange"><div className="grid grid-cols-2 gap-2"><IC l="연소득" v={fmt.manwon(data.tax.annualSalary)} c="blue"/><IC l="실효세율" v={`${data.tax.effectiveTaxRate}%`} c="amber"/><IC l="결정세액" v={fmt.manwon(data.tax.determinedTax)} c="red"/><IC l="기납부세액" v={fmt.manwon(data.tax.prepaidTax)} c="emerald"/></div>{(data.tax.determinedTax>0||data.tax.prepaidTax>0)?(<div className={`rounded-xl p-3.5 border ${data.tax.taxRefund>=0?'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100':'bg-gradient-to-r from-rose-50 to-orange-50 border-rose-100'}`}><p className="text-[10px] font-semibold" style={{color:data.tax.taxRefund>=0?'#059669':'#dc2626'}}>{data.tax.taxRefund>=0?'✅ 예상 환급':'⚠️ 예상 추가납부'}</p><p className="text-xl font-extrabold mt-0.5" style={{color:data.tax.taxRefund>=0?'#047857':'#b91c1c'}}>{data.tax.taxRefund>=0?'+':''}{fmt.manwon(Math.abs(data.tax.taxRefund))}</p></div>):null}{data.tax.inherit.totalAssets>0&&(<InheritSection inh={data.tax.inherit}/>)}<TaxTips/></Sec>

            <Sec num="08" title="부동산설계" color="amber"><div className="grid grid-cols-2 gap-2"><IC l="주거용 부동산" v={fmt.eok(data.reAst.residential)} c="amber"/><IC l="투자용 부동산" v={fmt.eok(data.reAst.investment)} c="blue"/></div><DonutSection label="자산 내 부동산 비중" ratio={reR} total={reT} other={Math.max(0,data.totAst-reT)} warn={reR>70?`부동산 비중 ${reR}%로 높음. 유동성 자산 확보 권장`:undefined}/></Sec>

            <Sec num="09" title="보험설계" color="pink" pill={insG}><div className="flex items-start gap-3"><GB g={insG}/><div className="flex-1"><p className="text-[10px] text-slate-400 mb-1">보험 보장율</p><p className="text-2xl font-extrabold" style={{color:insG.color}}>{data.insurance.overallRate}%</p><p className="text-[9px] text-slate-400">6대 보장 필요자금 대비 준비율 | 부족 {data.insurance.lackCount}개</p></div></div><div className="space-y-2"><p className="text-[10px] text-slate-400 font-semibold">🛡️ 8대 보장 분석</p><div className="border border-slate-100 rounded-xl overflow-hidden"><div className="bg-slate-50 px-3 py-2 grid grid-cols-4 text-[9px] text-slate-400 font-semibold"><span>보장</span><span className="text-right">필요자금</span><span className="text-right">준비자금</span><span className="text-right">상태</span></div>{data.insurance.items.map((item:any) => { const isOk = item.isSpecial ? item.prepared>0 : item.prepared>=item.needed; const ratio = item.isSpecial ? (item.prepared>0?100:0) : (item.needed>0?Math.round((item.prepared/item.needed)*100):0); return (<div key={item.key} className={`px-3 py-2 grid grid-cols-4 items-center border-t border-slate-50 ${isOk?'':'bg-rose-50/50'}`}><span className="text-[10px] text-slate-600 font-medium">{item.emoji} {item.label}</span><span className="text-[10px] text-slate-500 text-right">{item.isSpecial?'특약':fmt.manwon(item.needed)}</span><span className={`text-[10px] text-right font-semibold ${isOk?'text-emerald-600':'text-rose-600'}`}>{item.isSpecial?(item.prepared>0?'가입':'미가입'):fmt.manwon(item.prepared)}</span><div className="flex justify-end"><span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isOk?'bg-emerald-100 text-emerald-700':'bg-rose-100 text-rose-700'}`}>{isOk?'✓':ratio+'%'}</span></div></div>); })}</div></div><div className="bg-pink-50 rounded-xl p-3 border border-pink-100"><div className="flex items-center justify-between mb-1.5"><span className="text-[10px] text-pink-500 font-semibold">종합 보장율</span><span className="text-[10px] text-pink-600 font-bold">{data.insurance.overallRate}%</span></div><div className="h-3 bg-pink-100 rounded-full overflow-hidden relative"><div className="h-full rounded-full bg-gradient-to-r from-pink-400 to-rose-500" style={{width:`${Math.min(100,data.insurance.overallRate)}%`}}/><div className="absolute top-0 h-full w-0.5 bg-red-600" style={{left:'100%'}}/></div><p className="text-[9px] text-slate-400 mt-1">빨간선 = 필요자금 100% 충족</p></div>{data.insurance.lackCount>0&&(<div className="bg-rose-50 rounded-xl p-3 border border-rose-100"><p className="text-[10px] text-rose-600 font-semibold">⚠️ {data.insurance.lackCount}개 보장 항목 보완이 필요합니다</p><p className="text-[9px] text-slate-400 mt-1">전문 보험설계사와 상담하여 부족 보장을 점검하세요.</p></div>)}</Sec>

            <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 rounded-2xl shadow-sm overflow-hidden text-white print:break-before-page"><div className="px-5 py-3.5 border-b border-white/10 flex items-center gap-2"><span className="w-6 h-6 rounded-lg bg-teal-500/20 flex items-center justify-center text-xs font-bold text-teal-300">10</span><h2 className="text-sm font-bold">DESIRE 로드맵</h2></div><div className="p-4 space-y-4"><div className="text-center"><span className="text-4xl">{data.desire.stageEmoji}</span><p className="text-xl font-extrabold mt-2">{data.desire.currentStage}단계: {data.desire.stageName}</p><p className="text-xs text-slate-400 mt-1">{data.desire.stageDesc}</p></div><div className="flex gap-1.5">{data.desire.stages.map((s,i)=>{ const done = i < data.desire.currentStage - 1; const current = i === data.desire.currentStage - 1; return (<div key={i} className="flex-1 text-center"><div className={`w-10 h-10 rounded-xl mx-auto flex items-center justify-center text-sm font-extrabold border-2 ${done?'bg-emerald-500/30 border-emerald-400 text-emerald-300':current?'bg-amber-500/30 border-amber-400 text-amber-300':'bg-white/5 border-white/10 text-slate-500'}`}>{s.letter}</div><p className="text-[8px] text-slate-400 mt-1">{s.kr}</p></div>); })}</div><div className="bg-white/5 rounded-xl p-3 border border-white/10"><p className="text-[10px] text-teal-300 font-semibold mb-1">📋 DESIRE 단계별 의미</p><div className="space-y-1">{data.desire.stages.map((s,i)=>(<div key={i} className="flex items-center gap-2 text-[10px]"><span className={`font-bold ${i<data.desire.currentStage?'text-emerald-400':i===data.desire.currentStage-1?'text-amber-400':'text-slate-500'}`}>{s.letter}</span><span className="text-slate-400">{s.name}</span><span className="text-slate-500">— {s.kr}</span></div>))}</div></div></div></section>

            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden print:break-before-page"><div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2"><span className="w-6 h-6 rounded-lg bg-teal-50 flex items-center justify-center text-xs font-bold text-teal-600">11</span><h2 className="text-sm font-bold text-slate-800">🎯 맞춤 Action Plan</h2></div><div className="p-4 space-y-3">{actionPlan.map(ap => (<div key={ap.priority} className="flex items-start gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-sm font-extrabold flex-shrink-0">{ap.priority}</div><div className="flex-1 min-w-0"><div className="flex items-center gap-1.5"><span>{ap.emoji}</span><span className="text-xs font-bold text-slate-700">{ap.action}</span><span className="text-[9px] text-slate-400">({ap.area})</span></div><p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{ap.detail}</p></div></div>))}</div></section>

            <div className="bg-slate-100 rounded-xl p-4 text-center space-y-1"><p className="text-[10px] text-slate-400 font-semibold">⚠️ 면책조항</p><p className="text-[9px] text-slate-400 leading-relaxed">본 리포트는 금융집짓기® 방법론에 기반한 참고용 분석 자료이며, 투자 권유나 재무 자문을 구성하지 않습니다. 모든 재무 결정은 본인의 판단과 전문가 상담을 통해 이루어져야 합니다.</p><p className="text-[9px] text-slate-300">© {today.getFullYear()} 오원트금융연구소 | AI머니야</p></div>
          </div>
        </div>
      </div>
      <style>{`
@media print{body>*:not(.print-report-root){display:none!important}.print-report-root{position:static!important;overflow:visible!important;height:auto!important;width:100%!important;z-index:auto!important}.print-report-root>.print-overlay{display:none!important}.print\\:hidden{display:none!important}.print-report-root .print-scroll-area{overflow:visible!important;height:auto!important;max-width:none!important;flex:none!important;margin-top:0!important}.print-report-root .print-content-area{padding:8mm!important}.print\\:break-after-page{break-after:page}.print\\:break-before-page{break-before:page}section,.sec-wrap{break-inside:avoid;page-break-inside:avoid}@page{size:A4 portrait;margin:10mm}body{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;margin:0!important;padding:0!important}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;color-adjust:exact!important}.shadow-sm,.shadow-md,.shadow-lg{box-shadow:none!important}.backdrop-blur,.backdrop-blur-sm{backdrop-filter:none!important}}
`}</style>
    </div>
  );
};

export default FinancialReport;
