"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  Share2, 
  MessageCircle, 
  Twitter, 
  Linkedin, 
  Copy,
  ArrowLeft,
  Cpu,
  Trophy,
  Zap,
  Users,
  Loader2,
  Gift,
  RefreshCcw,
  AlertCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { generateShareCardContent, type GenerateShareCardContentOutput } from "@/ai/flows/generate-share-card-content";
import type { GeneratePersonalizedOpportunitiesOutput } from "@/ai/flows/generate-personalized-opportunities";
import { toPng } from 'html-to-image';
import { useFirestore, useDoc, useUser } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export const maxDuration = 60;

export default function SharePage() {
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);
  const initializationAttempted = useRef(false);
  
  const [data, setData] = useState<GenerateShareCardContentOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [origin, setOrigin] = useState("");

  const userId = user?.uid;
  const referralDocRef = useMemo(() => userId ? doc(db, "referrals", userId) : null, [db, userId]);
  const { data: referralData, loading: referralLoading } = useDoc<any>(referralDocRef);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const initializeShare = useCallback(async (force = false) => {
    if (initializationAttempted.current && !force) return;
    
    const rawResult = typeof window !== 'undefined' ? localStorage.getItem("ai_assist_pro_result") : null;
    if (!rawResult && !user && !loading) {
      router.push("/assessment");
      return;
    }

    setLoading(true);
    setError(null);
    initializationAttempted.current = true;

    try {
      const result: GeneratePersonalizedOpportunitiesOutput = JSON.parse(rawResult || "{}");
      
      if (result.aiWealthScore !== undefined) {
        const shareData = await generateShareCardContent({
          aiWealthScore: result.aiWealthScore,
          profileSummary: result.profileSummary,
          achievementBadge: result.achievementBadge,
          topOpportunities: result.opportunities.map(o => o.name)
        });
        setData(shareData);
      } else {
        throw new Error("Missing assessment data in local storage.");
      }
    } catch (e: any) {
      console.error("Share Card Initialization Error:", e);
      if (e.message?.includes("quota") || e.message?.includes("429")) {
        setError("نعتذر، لقد وصلنا للحد الأقصى من الطلبات حالياً. يرجى المحاولة مرة أخرى بعد قليل.");
      } else {
        setError("حدث خطأ أثناء إنشاء بطاقة المشاركة. يرجى التأكد من اتصالك والمحاولة مرة أخرى.");
      }
    } finally {
      setLoading(false);
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!referralLoading) {
      initializeShare();
    }
    
    if (userId && !referralLoading && !referralData && referralDocRef) {
      const code = userId.substring(0, 6).toUpperCase();
      setDoc(referralDocRef, {
        userId,
        referralCode: code,
        referralCount: 0,
        referredUserIds: [],
        unlockedFeatures: []
      }, { merge: true });
    }
  }, [userId, referralLoading, referralData, referralDocRef, initializeShare]);

  const referralLink = useMemo(() => {
    if (!origin) return "";
    return referralData ? `${origin}/assessment?ref=${referralData.referralCode}` : `${origin}/assessment`;
  }, [referralData, origin]);

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, { 
        cacheBust: true, 
        quality: 1,
        pixelRatio: 2
      });
      const link = document.createElement('a');
      link.download = `AI-Assist-Pro-${referralData?.referralCode || 'Result'}.png`;
      link.href = dataUrl;
      link.click();
      toast({ title: "تم الحفظ!", description: "تم تحميل بطاقة النتائج بنجاح." });
    } catch (err) {
      console.error('Export failed:', err);
      toast({ variant: "destructive", title: "خطأ", description: "فشل تحميل الصورة." });
    } finally {
      setExporting(false);
    }
  };

  const handleNativeShare = async () => {
    const shareText = `اكتشفت للتو أن درجتي في مؤشر ثراء الذكاء الاصطناعي هي ${data?.aiWealthScore}! 🚀 انضم إلي واكتشف مستقبلك المالي عبر AI Assist Pro.`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'نتائج AI Assist Pro الخاصة بي',
          text: shareText,
          url: referralLink,
        });
      } catch (err) {
        console.log("Share cancelled or failed:", err);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopySuccess(true);
    toast({ title: "تم النسخ!", description: "تم نسخ رابط الإحالة الخاص بك." });
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(`حصلت على درجة ${data?.aiWealthScore} في مؤشر ثراء الذكاء الاصطناعي! 🚀 اكتشف أفضل الفرص المتاحة لك مع AI Assist Pro.`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(referralLink)}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`تحقق من هذا! حصلت على درجة ${data?.aiWealthScore} في مؤشر ثراء الذكاء الاصطناعي. اكتشف الفرص الخاصة بك هنا: ${referralLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const referralCount = referralData?.referralCount || 0;
  const milestone = 5;
  const progress = Math.min((referralCount / milestone) * 100, 100);

  if (loading || referralLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background" dir="rtl">
       <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
       <p className="text-primary font-bold text-xl">جاري إنشاء بطاقة المشاركة المخصصة...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center" dir="rtl">
       <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
         <AlertCircle className="w-8 h-8 text-destructive" />
       </div>
       <h2 className="text-2xl font-bold mb-4">{error}</h2>
       <div className="flex gap-4">
         <Button onClick={() => initializeShare(true)} className="gap-2">
           <RefreshCcw className="w-4 h-4" /> إعادة المحاولة
         </Button>
         <Button variant="outline" onClick={() => router.push('/dashboard')}>العودة للوحة التحكم</Button>
       </div>
    </div>
  );

  if (!data) return (
     <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center" dir="rtl">
        <h2 className="text-2xl font-bold mb-4">لا توجد نتائج لمشاركتها</h2>
        <Button onClick={() => router.push('/assessment')}>ابدأ التقييم الآن</Button>
     </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-12 bg-background" dir="rtl">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.push('/dashboard')} className="hover:bg-white/5 text-lg group">
            <ArrowLeft className="w-4 h-4 ml-2 group-hover:-translate-x-1 transition-transform" /> العودة إلى لوحة التحكم
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-secondary rounded-[2rem] blur opacity-30 group-hover:opacity-100 transition duration-1000" />
            <div ref={cardRef} className="relative glass-card aspect-[4/5] flex flex-col justify-between p-10 border-white/20 overflow-hidden rounded-[2rem] bg-[#0a0c1a]">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <Cpu className="w-64 h-64" />
              </div>
              
              <div className="space-y-8 z-10 text-right">
                <div className="flex justify-between items-center flex-row-reverse">
                   <div className="flex items-center space-x-2 space-x-reverse">
                     <Cpu className="w-6 h-6 text-primary" />
                     <span className="font-bold text-xl tracking-tight uppercase">AI Assist <span className="text-primary">Pro</span></span>
                   </div>
                   <Badge className="bg-primary/20 text-primary border-primary/30 uppercase text-[10px] py-1 px-3">إمكانات معتمدة</Badge>
                </div>

                <div className="flex gap-8 items-center flex-row-reverse">
                   <div className="w-24 h-24 rounded-3xl bg-primary flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.3)] border border-white/20">
                      <span className="text-4xl font-bold text-white">{data.aiWealthScore}</span>
                   </div>
                   <div>
                     <h3 className="text-muted-foreground uppercase text-[10px] tracking-widest mb-1">AI WEALTH SCORE</h3>
                     <h4 className="text-2xl font-bold">{data.achievementBadge}</h4>
                   </div>
                </div>

                <div className="space-y-2">
                  <h5 className="text-xs font-medium text-primary uppercase tracking-wider">أفضل تطابق مهني</h5>
                  <p className="text-3xl font-bold leading-tight">{data.topOpportunityName}</p>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h5 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">مسارات عالية التوافق</h5>
                  <div className="flex flex-wrap gap-2 justify-end">
                    {data.topThreeOpportunityNames.map(name => (
                      <Badge key={name} variant="outline" className="border-white/10 bg-white/5 px-4 py-1.5 text-xs">{name}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="z-10 pt-8 mt-auto text-right">
                 <p className="text-sm text-white/70 leading-relaxed font-medium italic">
                   "{data.personalizedMessage}"
                 </p>
              </div>
            </div>
          </div>

          <div className="space-y-10 text-right">
            <div>
              <h1 className="text-4xl font-bold mb-4">شارك نجاحك وانطلق</h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                قم بتحميل بطاقة النتائج المخصصة لك أو شاركها مباشرة مع شبكتك لفتح مميزات استشارية حصرية وزيادة فرصك.
              </p>
            </div>

            <div className="space-y-4">
              <Button 
                size="lg" 
                className="w-full h-14 bg-primary hover:bg-primary/90 text-lg font-bold shadow-lg shadow-primary/20 rounded-2xl"
                onClick={handleDownloadImage}
                disabled={exporting}
              >
                {exporting ? <Loader2 className="w-5 h-5 ml-3 animate-spin" /> : <Download className="w-5 h-5 ml-3" />}
                {exporting ? "جاري المعالجة..." : "تحميل بطاقة النتائج كصورة"}
              </Button>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Button variant="outline" className="h-14 border-white/10 hover:bg-white/10 hover:border-green-500/50 transition-all rounded-xl" onClick={shareOnWhatsApp}>
                  <MessageCircle className="w-6 h-6 text-green-500" />
                </Button>
                <Button variant="outline" className="h-14 border-white/10 hover:bg-white/10 hover:border-blue-400/50 transition-all rounded-xl" onClick={shareOnTwitter}>
                  <Twitter className="w-6 h-6 text-blue-400" />
                </Button>
                <Button variant="outline" className="h-14 border-white/10 hover:bg-white/10 hover:border-accent/50 transition-all rounded-xl" onClick={handleNativeShare}>
                  <Share2 className="w-6 h-6 text-accent" />
                </Button>
                <Button variant="outline" className="h-14 border-white/10 hover:bg-white/10 hover:border-blue-700/50 transition-all rounded-xl" onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${referralLink}`, '_blank')}>
                  <Linkedin className="w-6 h-6 text-blue-700" />
                </Button>
              </div>
            </div>

            <Card className="glass-card border-white/5 p-8 bg-white/[0.02] relative overflow-hidden rounded-[2rem]">
               <div className="absolute top-0 left-0 p-4 opacity-10 pointer-events-none">
                 <Gift className="w-24 h-24 text-accent" />
               </div>
               
               <div className="flex items-center gap-3 mb-8 justify-end">
                 <h3 className="text-2xl font-bold">برنامج الإحالة الذكي</h3>
                 <div className="p-2 rounded-lg bg-accent/10 text-accent">
                   <Users className="w-6 h-6" />
                 </div>
               </div>
               
               <div className="space-y-6 mb-8">
                 <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5 flex-row-reverse">
                   <div className="flex items-center gap-3 flex-row-reverse">
                     <Trophy className={cn("w-5 h-5 transition-colors duration-500", referralCount >= milestone ? "text-primary fill-primary" : "text-muted-foreground")} />
                     <span className="font-bold">دعوة {milestone} أصدقاء</span>
                   </div>
                   <Badge className={cn("transition-colors duration-500", referralCount >= milestone ? "bg-primary" : "bg-white/10")}>
                     {referralCount >= milestone ? "تم الفتح" : `${referralCount} / ${milestone}`}
                   </Badge>
                 </div>
                 
                 <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex-row-reverse">
                      <span>التقدم للمرحلة التالية</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2 bg-white/5" />
                 </div>
               </div>

               <div className="space-y-3">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block text-right">رابط الإحالة الخاص بك</label>
                 <div className="flex gap-2">
                   <Button size="icon" className="h-12 w-12 bg-white/5 hover:bg-white/10 border border-white/5 shrink-0 rounded-xl" onClick={handleCopyLink}>
                     <Copy className="w-5 h-5" />
                   </Button>
                   <div className="flex-1 h-12 flex items-center px-4 rounded-xl bg-white/5 border border-white/5 text-sm font-mono overflow-hidden text-left whitespace-nowrap">
                     {referralLink || "جاري التحميل..."}
                   </div>
                 </div>
                 {copySuccess && <p className="text-xs text-primary font-bold text-right animate-fade-in">تم نسخ الرابط بنجاح!</p>}
               </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
