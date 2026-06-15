"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { 
  Share2, 
  Star, 
  TrendingUp, 
  Zap, 
  CircleDollarSign,
  BarChart4,
  CheckCircle2,
  Copy,
  LayoutDashboard,
  ChevronLeft,
  Loader2,
  Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { GeneratePersonalizedOpportunitiesOutput, Opportunity } from "@/ai/flows/generate-personalized-opportunities";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [localData, setLocalData] = useState<GeneratePersonalizedOpportunitiesOutput | null>(null);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const userResultRef = useMemo(() => user ? doc(db, "results", user.uid) : null, [user, db]);
  const { data: firestoreData, loading: firestoreLoading } = useDoc<GeneratePersonalizedOpportunitiesOutput>(userResultRef as any);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("ai_assist_pro_result");
    if (saved) {
      try {
        setLocalData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse local results");
      }
    }
  }, []);

  useEffect(() => {
    if (isMounted && !authLoading && !user && !localData && !firestoreData && !firestoreLoading) {
      router.push("/assessment");
    }
  }, [isMounted, authLoading, user, localData, firestoreData, firestoreLoading, router]);

  const data = (firestoreData || localData) as GeneratePersonalizedOpportunitiesOutput | null;

  const handleCopyPlan = async (plan: string[]) => {
    try {
      await navigator.clipboard.writeText(plan.join("\n"));
      setCopySuccess(true);
      toast({ title: "تم النسخ!", description: "تم نسخ خطة التنفيذ." });
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      toast({ variant: "destructive", title: "فشل النسخ" });
    }
  };

  if (!isMounted) return null;

  if (authLoading || (user && firestoreLoading)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!data) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
       <h2 className="text-2xl font-bold mb-6">لا توجد نتائج لعرضها</h2>
       <Button onClick={() => router.push("/assessment")}>ابدأ التقييم الآن</Button>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-12" dir="rtl">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          <Card className="lg:col-span-4 glass-card">
            <CardContent className="p-8 text-center flex flex-col items-center">
              <div className="relative w-48 h-48 flex items-center justify-center mb-6">
                <svg className="w-full h-full rotate-90 scale-x-[-1]">
                  <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                  <circle
                    cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent"
                    strokeDasharray={552.92}
                    strokeDashoffset={552.92 - (552.92 * (data.aiWealthScore || 0)) / 100}
                    className="text-primary transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold">{data.aiWealthScore}</span>
                  <span className="text-xs font-bold text-muted-foreground uppercase mt-1">مؤشر النجاح</span>
                </div>
              </div>
              <Badge className="bg-primary/20 text-primary px-6 py-2 text-md mb-4 font-bold">
                {data.achievementBadge}
              </Badge>
              <p className="text-sm text-muted-foreground px-4">احتمالية نجاحك بناءً على تحليل السوق.</p>
            </CardContent>
          </Card>

          <Card className="lg:col-span-8 glass-card">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <LayoutDashboard className="w-6 h-6 text-accent" />
                <h2 className="text-3xl font-bold">تحليل خبير الأعمال</h2>
              </div>
              <p className="text-xl leading-relaxed mb-8 font-medium">{data.profileSummary}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                  <div>
                    <h4 className="font-bold text-md mb-1">الميزة التنافسية</h4>
                    <p className="text-sm text-muted-foreground">خلفيتك تمنحك أفضلية فريدة.</p>
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-4">
                  <TrendingUp className="w-6 h-6 text-primary shrink-0" />
                  <div>
                    <h4 className="font-bold text-md mb-1">إمكانية التوسع</h4>
                    <p className="text-sm text-muted-foreground">فرصة كبيرة للتوسع السريع.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">أفضل 5 فرص استثمارية</h2>
            <Button onClick={() => router.push("/share")} variant="outline" className="gap-2">
              <Share2 className="w-4 h-4" /> مشاركة النتائج
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.opportunities?.map((opp: Opportunity, i: number) => (
              <Card key={i} className="glass-card group hover:border-primary/50 transition-all">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="text-[10px]">توافق: {opp.compatibilityScore}%</Badge>
                    <Star className="w-4 h-4 text-primary fill-primary" />
                  </div>
                  <CardTitle className="text-2xl group-hover:text-primary">{opp.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1.5"><CircleDollarSign className="w-4 h-4" /> الدخل المحتمل</span>
                      <span className="font-bold">{opp.monthlyIncomePotential}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1.5"><BarChart4 className="w-4 h-4" /> الصعوبة</span>
                      <Badge variant="secondary" className="font-bold">{opp.difficultyLevel}</Badge>
                    </div>
                  </div>
                  <Button className="w-full" onClick={() => setSelectedOpp(opp)}>
                    عرض الخطة الكاملة
                    <ChevronLeft className="w-4 h-4 mr-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Dialog open={!!selectedOpp} onOpenChange={() => setSelectedOpp(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0" dir="rtl">
            {selectedOpp && (
              <div className="relative">
                <div className="h-48 bg-gradient-to-l from-primary/30 to-secondary/30 flex items-center px-12">
                   <div className="z-10">
                    <Badge className="bg-primary/20 text-primary mb-2 font-bold">فرصة عالية التوافق</Badge>
                    <DialogTitle className="text-4xl font-bold">{selectedOpp.name}</DialogTitle>
                    <DialogDescription className="text-white/60">تفاصيل الخطة التنفيذية.</DialogDescription>
                   </div>
                </div>
                <div className="p-10 space-y-12">
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <Info className="w-5 h-5 text-primary" />
                      <h3 className="text-xl font-bold">لماذا تناسبك هذه الفرصة؟</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-lg">{selectedOpp.whyThisFitsYou}</p>
                  </section>
                  <section className="bg-white/5 rounded-3xl p-8">
                    <div className="flex items-center justify-between mb-8">
                       <h3 className="text-2xl font-bold">خطة التنفيذ خطوة بخطوة</h3>
                       <Button size="sm" variant="ghost" onClick={() => handleCopyPlan(selectedOpp.stepByStepExecutionPlan)}>
                         <Copy className="w-4 h-4 ml-2" /> {copySuccess ? "تم النسخ!" : "نسخ الخطة"}
                       </Button>
                    </div>
                    <div className="space-y-6">
                      {selectedOpp.stepByStepExecutionPlan.map((step: string, i: number) => (
                        <div key={i} className="flex gap-4 items-start">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-primary font-bold">{i + 1}</div>
                          <p className="text-muted-foreground text-lg flex-1">{step}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
