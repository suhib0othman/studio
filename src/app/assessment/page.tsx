"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Clock,
  Target,
  GraduationCap,
  Wallet,
  UserCheck,
  Zap,
  Star,
  Activity,
  ShieldAlert,
  Flag,
  LogIn,
  AlertCircle,
  RefreshCcw,
  ShieldCheck
} from "lucide-react";
import { generatePersonalizedOpportunities } from "@/ai/flows/generate-personalized-opportunities";
import { cn } from "@/lib/utils";
import { useAuth, useFirestore, useUser } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { getFriendlyAuthErrorMessage, type FriendlyError } from "@/firebase/auth-errors";

export const maxDuration = 60;

interface AssessmentOption {
  label: string;
  desc?: string;
}

interface AssessmentQuestion {
  id: string;
  label: string;
  icon: any;
  options: AssessmentOption[];
}

const QUESTIONS: AssessmentQuestion[] = [
  { 
    id: "primaryExpertise", 
    label: "ما هو مجال خبرتك أو شغفك الأساسي؟", 
    icon: Star, 
    options: [
      { label: "التقنية والتطوير الرقمي", desc: "البرمجة، المواقع، الذكاء الاصعطناعي" },
      { label: "الكتابة وصناعة المحتوى", desc: "المقالات، الترجمة، الإعلانات" },
      { label: "التصميم والإبداع الرقمي", desc: "الجرافيك، الفيديو، المونتاج" },
      { label: "التسويق والمبيعات", desc: "التسويق الرقمي، إدارة العلامات التجارية" },
      { label: "الإدارة والتنظيم", desc: "إدارة المشاريع، خدمة العملاء" },
      { label: "التعليم والاستشارات", desc: "التدريب ونقل المعرفة" }
    ] 
  },
  { id: "availableHoursPerWeek", label: "كم من الوقت يمكنك تخصيصه أسبوعياً؟", icon: Clock, options: [{ label: "أقل من 5 ساعات" }, { label: "من 5 إلى 15 ساعة" }, { label: "من 15 إلى 25 ساعة" }, { label: "أكثر من 25 ساعة" }] },
  { id: "incomeGoal", label: "ما هو هدفك المالي الشهري؟", icon: Target, options: [{ label: "100 إلى 300 دولار" }, { label: "300 إلى 1000 دولار" }, { label: "1000 إلى 3000 دولار" }, { label: "3000 دولار فأكثر" }] },
  { id: "availableBudget", label: "ما مقدار رأس المال المتاح للبدء؟", icon: Wallet, options: [{ label: "بدون أي رأس مال" }, { label: "أقل من 100 دولار" }, { label: "100 إلى 500 دولار" }, { label: "أكثر من 500 دولار" }] },
  { id: "experienceLevel", label: "ما مستوى خبرتك في العمل عبر الإنترنت؟", icon: GraduationCap, options: [{ label: "مبتدئ تماماً" }, { label: "لدي معرفة بسيطة" }, { label: "متوسط الخبرة" }, { label: "محترف" }] },
  { id: "workPreference", label: "كيف تفضل العمل؟", icon: UserCheck, options: [{ label: "بمفردي (Solo)" }, { label: "ضمن فريق (Team)" }, { label: "لا فرق لدي" }] },
  { id: "preferredActivity", label: "أي نوع من الأنشطة تفضله؟", icon: Activity, options: [{ label: "الكتابة وصناعة المحتوى" }, { label: "التصميم والإبداع" }, { label: "البيع والتسويق" }, { label: "الخدمات التقنية" }] },
  { id: "greatestStrength", label: "ما هي أهم نقطة قوة لديك؟", icon: Zap, options: [{ label: "الإبداع والابتكار" }, { label: "التواصل والإقناع" }, { label: "التحليل المنطقي" }, { label: "التعلم السريع" }] },
  { id: "riskTolerance", label: "ما هو مستوى المخاطرة الذي تقبله؟", icon: ShieldAlert, options: [{ label: "منخفض جداً" }, { label: "منخفض" }, { label: "متوسط" }, { label: "مرتفع" }] },
  { id: "primaryGoal", label: "ما هو هدفك الأساسي حالياً؟", icon: Flag, options: [{ label: "دخل إضافي جانبي" }, { label: "العمل الحر الكامل" }, { label: "بناء مشروع خاص" }, { label: "الاستقلال المالي" }] },
];

const LOADING_MESSAGES = [
  "جاري فحص سماتك الشخصية...",
  "تحليل فجوات السوق الرقمي...",
  "مطابقة مهاراتك مع أدوات AI...",
  "توليد خطة عمل مخصصة لنجاحك...",
  "حساب درجات التوافق والمخاطرة..."
];

export default function AssessmentPage() {
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorInfo, setErrorInfo] = useState<FriendlyError | null>(null);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isProcessing) {
      interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isProcessing]);

  const handleLogin = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithPopup(auth, provider);
      toast({ title: "تم الربط بنجاح", description: "سيتم حفظ نتائجك تلقائياً الآن." });
      setErrorInfo(null);
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') return;
      const friendlyError = getFriendlyAuthErrorMessage(err.code);
      setErrorInfo(friendlyError);
    }
  }, [auth, toast]);

  const handleSubmit = useCallback(async (finalAnswers: Record<string, string>) => {
    setIsProcessing(true);
    setErrorInfo(null);
    try {
      const result = await generatePersonalizedOpportunities({
        primaryExpertise: finalAnswers.primaryExpertise,
        availableHoursPerWeek: finalAnswers.availableHoursPerWeek,
        incomeGoal: finalAnswers.incomeGoal,
        availableBudget: finalAnswers.availableBudget,
        experienceLevel: finalAnswers.experienceLevel,
        workPreference: finalAnswers.workPreference,
        preferredActivity: finalAnswers.preferredActivity,
        greatestStrength: finalAnswers.greatestStrength,
        riskTolerance: finalAnswers.riskTolerance,
        primaryGoal: finalAnswers.primaryGoal,
      });

      if (user && db) {
        await setDoc(doc(db, "results", user.uid), {
          ...result,
          userId: user.uid,
          createdAt: serverTimestamp(),
        }, { merge: true });
      }
      
      localStorage.setItem("ai_assist_pro_result", JSON.stringify(result));
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Submission Error:", err);
      setIsProcessing(false);
      setErrorInfo({
        message: err instanceof Error ? err.message : "حدث خطأ غير متوقع أثناء معالجة البيانات.",
        steps: [
          "تأكد من استقرار اتصال الإنترنت لديك.",
          "أعد المحاولة بعد دقيقة واحدة لتجنب ضغط الخادم.",
          "إذا استمرت المشكلة، حاول تسجيل الدخول قبل البدء بالتقييم."
        ]
      });
    }
  }, [user, db, router]);

  const handleOptionSelect = (val: string) => {
    const updated = { ...answers, [QUESTIONS[currentStep].id]: val };
    setAnswers(updated);
    if (currentStep < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 300);
    } else {
      handleSubmit(updated);
    }
  };

  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;
  const currentQuestion = QUESTIONS[currentStep];

  if (isProcessing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden" dir="rtl">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="z-10 text-center max-w-lg w-full space-y-12 animate-fade-in-up">
          <div className="relative flex justify-center">
            <div className="absolute inset-0 animate-ping bg-primary/20 rounded-full scale-125" />
            <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-xl border border-white/20">
              <Sparkles className="w-12 h-12 text-white animate-pulse" />
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold premium-gradient-text">جاري بناء مستقبلك الرقمي...</h2>
            <div className="h-6">
              <p className="text-lg text-primary font-medium">{LOADING_MESSAGES[loadingMsgIdx]}</p>
            </div>
          </div>
          <div className="space-y-4">
             <Skeleton className="h-20 rounded-2xl bg-white/5" />
             <Skeleton className="h-20 rounded-2xl bg-white/5" />
          </div>
        </div>
      </div>
    );
  }

  if (errorInfo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background" dir="rtl">
        <div className="max-w-xl w-full glass-card p-10 rounded-3xl text-right space-y-8 animate-fade-in-up">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center border border-destructive/20">
               <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
            <h2 className="text-xl font-bold text-center leading-relaxed">{errorInfo.message}</h2>
          </div>
          <div className="space-y-3 bg-white/5 p-6 rounded-2xl border border-white/5">
            <h3 className="font-bold flex items-center gap-2 text-primary text-sm">
              <ShieldAlert className="w-4 h-4" /> ماذا يمكنك أن تفعل؟
            </h3>
            <ul className="space-y-2">
              {errorInfo.steps.map((step, idx) => (
                <li key={idx} className="flex gap-3 text-muted-foreground text-sm leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-[10px] font-bold">{idx + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <Button className="w-full h-14 text-lg font-bold gap-3 rounded-2xl cta-button" onClick={() => { setErrorInfo(null); if (Object.keys(answers).length >= QUESTIONS.length) handleSubmit(answers); }}>
              <RefreshCcw className="w-5 h-5" /> إعادة المحاولة
            </Button>
            <Button variant="ghost" className="w-full h-14 rounded-2xl" onClick={() => { setErrorInfo(null); setCurrentStep(0); setAnswers({}); }}>
              بدء التقييم من جديد
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 bg-background" dir="rtl">
      <Navbar />
      <div className="max-w-4xl mx-auto animate-fade-in-up">
        
        {!user && currentStep === 0 && (
          <div className="mb-10 p-6 glass-card rounded-2xl border-primary/20 bg-primary/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-right space-y-1">
              <h3 className="font-bold text-lg">احفظ تقريرك الاستشاري</h3>
              <p className="text-xs text-muted-foreground">سجل دخولك لربط نتائجك بحسابك الدائم والوصول إليها لاحقاً.</p>
            </div>
            <Button onClick={handleLogin} variant="outline" className="gap-2 border-primary/30 w-full md:w-auto h-12 rounded-xl text-md hover:bg-primary/10">
              <LogIn className="w-4 h-4" /> سجل دخولك بـ Google
            </Button>
          </div>
        )}

        <div className="mb-12 space-y-4">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <span className="text-xs font-bold text-primary uppercase tracking-widest">المرحلة {currentStep + 1} من {QUESTIONS.length}</span>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">التقييم الاستشاري الذكي</h1>
            </div>
            <div className="text-left">
              <span className="text-xl font-bold text-primary">{Math.round(progress)}%</span>
            </div>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="space-y-10" key={currentStep}>
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
              <currentQuestion.icon className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight">{currentQuestion.label}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleOptionSelect(opt.label)}
                className={cn(
                  "group p-6 rounded-2xl border text-right transition-all duration-300 flex flex-col items-start gap-1 relative overflow-hidden",
                  answers[currentQuestion.id] === opt.label 
                    ? "bg-primary/10 border-primary" 
                    : "bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-lg font-bold">{opt.label}</span>
                  {answers[currentQuestion.id] === opt.label && <CheckCircle2 className="w-5 h-5 text-primary" />}
                </div>
                {opt.desc && <p className="text-xs text-muted-foreground leading-relaxed mt-1">{opt.desc}</p>}
              </button>
            ))}
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center mt-12 pt-8 border-t border-white/10 gap-6">
            <Button variant="ghost" onClick={() => setCurrentStep(currentStep - 1)} disabled={currentStep === 0} className="h-12 px-6 rounded-xl gap-2">
              <ChevronRight className="w-5 h-5" /> السابق
            </Button>
            
            <div className="flex items-center gap-6 text-muted-foreground text-[10px] uppercase tracking-widest font-bold">
               <div className="flex items-center gap-2">
                 <ShieldCheck className="w-3 h-3 text-accent" /> <span>تشفير آمن</span>
               </div>
               <div className="flex items-center gap-2">
                 <Zap className="w-3 h-3 text-accent" /> <span>تحليل فوري</span>
               </div>
            </div>

            {answers[currentQuestion.id] && currentStep < QUESTIONS.length - 1 && (
              <Button onClick={() => setCurrentStep(currentStep + 1)} className="h-12 px-8 rounded-xl text-md font-bold bg-primary hover:bg-primary/90 cta-button">
                التالي <ChevronLeft className="w-5 h-5 mr-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
