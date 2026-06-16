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
  Users,
  Loader2,
  Gift,
  RefreshCcw,
  AlertCircle
} from "lucide-react";
import { Card } from "@/components/ui/card";
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
  const [hydrated, setHydrated] = useState(false);

  const userId = user?.uid;
  const referralDocRef = useMemo(() => userId ? doc(db, "referrals", userId) : null, [db, userId]);
  const { data: referralData, loading: referralLoading } = useDoc<any>(referralDocRef);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const initializeShare = useCallback(async (force = false) => {
    if (initializationAttempted.current && !force) return;
    
    let rawResult: string | null = null;
    if (typeof window !== 'undefined') {
      rawResult = localStorage.getItem("ai_assist_pro_result");
    }

    if (!rawResult && !user && !loading) {
      router.push("/assessment");
      return;
    }

    setLoading(true);
    setError(null);
    initializationAttempted.current = true;

    try {
      const result: GeneratePersonalizedOpportunitiesOutput = JSON.parse(rawResult || "{}");
      if (result && result.aiWealthScore !== undefined) {
        const shareData = await generateShareCardContent({
          aiWealthScore: result.aiWealthScore,
          profileSummary: result.profileSummary,
          achievementBadge: result.achievementBadge,
          topOpportunities: result.opportunities.map(o => o.name)
        });
        setData(shareData);
      } else {
        throw new Error("بيانات التقييم غير متوفرة.");
      }
    } catch (e: any) {
      console.error("Share Card Error:", e);
      setError("حدث خطأ أثناء إعداد بطاقة المشاركة. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (hydrated && !referralLoading) {
      initializeShare();
    }
    
    if (hydrated && userId && !referralLoading && !referralData && referralDocRef) {
      const code = userId.substring(0, 6).toUpperCase();
      setDoc(referralDocRef, {
        userId,
        referralCode: code,
        referralCount: 0,
        referredUserIds: [],
        unlockedFeatures: []
      }, { merge: true });
    }
  }, [hydrated, userId, referralLoading, referralData, referralDocRef, initializeShare]);

  const referralCount = referralData?.referralCount || 0;

  const referralLink = useMemo(() => {
    if (typeof window === 'undefined') return "";
    const origin = window.location.origin;
    return referralData ? `${origin}/assessment?ref=${referralData.referralCode}` : `${origin}/assessment`;
  }, [referralData]);

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `AI-Wealth-Card.png`;
      link.href = dataUrl;
      link.click();
      toast({ title: "تم الحفظ", description: "تم تحميل البطاقة بنجاح." });
    } catch (err) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل تحميل الصورة." });
    } finally {
      setExporting(false);
    }
  };

  const handleCopyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopySuccess(true);
    toast({ title: "تم النسخ", description: "تم نسخ رابط الإحالة الخاص بك." });
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (!hydrated || loading || referralLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background" dir="rtl">
       <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
       <p className="text-primary font-bold">جاري إعداد بطاقتك المميزة...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center" dir="rtl">
       <AlertCircle className="w-12 h-12 text-destructive mb-4" />
       <h2 className="text-2xl font-bold mb-4">{error}</h2>
       <Button onClick={() => initializeShare(true)} className="gap-2">
         <RefreshCcw className="w-4 h-4" /> إعادة المحاولة
       </Button>
    </div>
  );

  if (!data) return null;

  return (
    <div className="min-h-screen pt-24 pb-12 bg-background" dir="rtl">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.push('/dashboard')} className="hover:bg-white/5 text-lg group">
            <ArrowLeft className="w-4 h-4 ml-2 group-hover:-translate-x-1 transition-transform" /> العودة
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-secondary rounded-[2rem] blur opacity-30 group-hover:opacity-100 transition duration-1000" />
            <div ref={cardRef} className="relative glass-card aspect-[4/5] flex flex-col justify-between p-10 border-white/20 overflow-hidden rounded-[2rem] bg-[#0a0c1a]">
              <div className="space-y-8 z-10 text-right">
                <div className="flex justify-between items-center flex-row-reverse">
                   <div className="flex items-center space-x-2 space-x-reverse">
                     <Cpu className="w-6 h-6 text-primary" />
                     <span className="font-bold text-xl uppercase">AI Assist <span className="text-primary">Pro</span></span>
                   </div>
                   <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">مؤشر معتمد</Badge>
                </div>

                <div className="flex gap-8 items-center flex-row-reverse">
                   <div className="w-24 h-24 rounded-3xl bg-primary flex items-center justify-center shadow-xl border border-white/20">
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
                 <p className="text-sm text-white/70 italic leading-relaxed font-medium">
                   "{data.personalizedMessage}"
                 </p>
              </div>
            </div>
          </div>

          <div className="space-y-10 text-right">
            <div>
              <h1 className="text-4xl font-bold mb-4">شارك نجاحك</h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                حمل بطاقة النتائج الخاصة بك وشاركها لفتح مميزات حصرية في برنامج الإحالة الذكي.
              </p>
            </div>

            <div className="space-y-4">
              <Button size="lg" className="w-full h-14 bg-primary hover:bg-primary/90 text-lg font-bold rounded-2xl" onClick={handleDownloadImage} disabled={exporting}>
                {exporting ? <Loader2 className="w-5 h-5 ml-3 animate-spin" /> : <Download className="w-5 h-5 ml-3" />}
                تحميل البطاقة كصورة
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-14 rounded-xl" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent("اكتشف درجتك في مؤشر ثراء الذكاء الاصطناعي: " + referralLink)}`, '_blank')}>
                   <MessageCircle className="w-6 h-6 text-green-500 ml-2" /> WhatsApp
                </Button>
                <Button variant="outline" className="h-14 rounded-xl" onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(referralLink)}`, '_blank')}>
                   <Twitter className="w-6 h-6 text-blue-400 ml-2" /> Twitter
                </Button>
              </div>
            </div>

            <Card className="glass-card p-8 bg-white/[0.02] rounded-[2rem]">
               <div className="flex items-center gap-3 mb-8 justify-end">
                 <h3 className="text-2xl font-bold">رابط الإحالة</h3>
                 <Gift className="w-6 h-6 text-accent" />
               </div>
               
               <div className="space-y-6">
                 <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5 flex-row-reverse">
                   <div className="flex items-center gap-3 flex-row-reverse">
                     <Trophy className={cn("w-5 h-5", referralCount >= 5 ? "text-primary" : "text-muted-foreground")} />
                     <span className="font-bold">المستوى الأول: 5 إحالات</span>
                   </div>
                   <Badge className={referralCount >= 5 ? "bg-primary" : "bg-white/10"}>
                     {referralCount} / 5
                   </Badge>
                 </div>
                 
                 <Progress value={(referralCount / 5) * 100} className="h-2 bg-white/5" />
               </div>

               <div className="mt-8 flex gap-2">
                 <Button size="icon" className="h-12 w-12 rounded-xl" onClick={handleCopyLink}>
                   <Copy className="w-5 h-5" />
                 </Button>
                 <div className="flex-1 h-12 flex items-center px-4 rounded-xl bg-white/5 border border-white/5 text-sm font-mono overflow-hidden">
                   {referralLink || "..."}
                 </div>
               </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
