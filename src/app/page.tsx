import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  TrendingUp, 
  Users, 
  Star,
  Cpu,
  Target,
  BarChart3
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function LandingPage() {
  const heroImg = PlaceHolderImages.find(img => img.id === 'hero-bg');

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6 animate-fade-in">
              <Zap className="w-4 h-4" />
              <span>Next-Generation AI Income Analysis</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-headline font-bold mb-6 tracking-tight leading-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Discover Your Best <span className="gradient-text">AI-Powered</span> Income Opportunities
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Answer 10 simple questions and instantly receive your personalized income roadmap built with advanced machine learning.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Link href="/assessment">
                <Button size="lg" className="h-14 px-8 text-lg font-semibold bg-primary hover:bg-primary/90 group">
                  Start Free Assessment
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-semibold border-white/10 hover:bg-white/5">
                View Demo Result
              </Button>
            </div>
          </div>
        </div>
        
        {/* Background visual */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl aspect-video opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-20" />
          {heroImg && (
            <Image 
              src={heroImg.imageUrl} 
              alt={heroImg.description}
              width={1200}
              height={800}
              className="object-cover rounded-[3rem] animate-float blur-2xl"
              data-ai-hint={heroImg.imageHint}
            />
          )}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-headline font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">Four steps to your personalized financial roadmap</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Target, title: "Answer 10 Questions", desc: "Share your background, skills, and goals through our assessment." },
              { icon: Cpu, title: "AI Analysis", desc: "Our engine processes thousands of data points to find your match." },
              { icon: BarChart3, title: "Top 5 Opportunities", desc: "Get highly specific, tailored income pathways just for you." },
              { icon: TrendingUp, title: "Start Building", desc: "Execute with a step-by-step plan and recommended AI tools." }
            ].map((step, i) => (
              <div key={i} className="relative p-6 glass-card rounded-2xl border border-white/5">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
                {i < 3 && <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-[1px] bg-white/10" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Users Love Us */}
      <section id="why-us" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-headline font-bold mb-8 leading-tight">
                Why Professionals Choose <span className="gradient-text">AI Assist Pro</span>
              </h2>
              <div className="space-y-6">
                {[
                  { title: "Personalized Recommendations", desc: "No generic advice. We match opportunities to your specific DNA." },
                  { title: "AI-Powered Analysis", desc: "Leveraging the latest in generative AI to calculate income probability." },
                  { title: "Actionable Roadmaps", desc: "We don't just tell you 'what', we show you exactly 'how' with 7-day plans." },
                  { title: "Startup-Grade Experience", desc: "Designed with the same precision as the tools built in Silicon Valley." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1">
                      <CheckCircle2 className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                      <p className="text-muted-foreground text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card rounded-[2.5rem] p-8 border border-white/10 relative overflow-hidden">
               <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 blur-[100px] rounded-full" />
               <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/20 blur-[100px] rounded-full" />
               <div className="relative z-10">
                 <div className="flex items-center justify-between mb-8">
                   <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-mono">ASSESSMENT_RESULTS.json</div>
                   <div className="w-3 h-3 rounded-full bg-red-500/50" />
                 </div>
                 <div className="space-y-6">
                   <div className="h-4 w-3/4 bg-white/5 rounded" />
                   <div className="h-4 w-1/2 bg-white/5 rounded" />
                   <div className="pt-8">
                     <div className="flex items-end justify-between mb-2">
                       <span className="text-sm font-medium text-muted-foreground">Wealth Potential</span>
                       <span className="text-2xl font-bold text-primary">87/100</span>
                     </div>
                     <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-primary w-[87%]" />
                     </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4 pt-4">
                     <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                       <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Badge</div>
                       <div className="text-sm font-bold">Automation Expert</div>
                     </div>
                     <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                       <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Best Fit</div>
                       <div className="text-sm font-bold">AI SaaS Dev</div>
                     </div>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-headline font-bold mb-4">Success Stories</h2>
            <p className="text-muted-foreground">Joined by 10,000+ creators building their future</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Sarah Chen", role: "Digital Entrepreneur", content: "I was stuck in a corporate job and didn't know where to start. AI Assist Pro gave me a specific roadmap for AI Content Services. Three months later, I'm earning $4k/month.", avatar: "SC" },
              { name: "Marcus Miller", role: "Freelance Automator", content: "The level of personalization is insane. It correctly identified my skills in logic and suggested AI Automation. The step-by-step plan saved me weeks of research.", avatar: "MM" },
              { name: "David Kim", role: "E-com Strategist", content: "I've tried many quizzes, but this feels like a $1,000 consultation. The tools database alone is worth its weight in gold.", avatar: "DK" }
            ].map((t, i) => (
              <Card key={i} className="glass-card border-white/5">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-primary text-primary" />)}
                  </div>
                  <p className="text-muted-foreground italic mb-6">"{t.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold">{t.avatar}</div>
                    <div>
                      <div className="font-bold text-sm">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-headline font-bold mb-12 text-center">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-white/5">
              <AccordionTrigger className="hover:no-underline text-left">Is the assessment really free?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes, our core assessment and top 5 opportunity results are completely free. We believe everyone should have access to high-quality career guidance.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-white/5">
              <AccordionTrigger className="hover:no-underline text-left">How accurate is the AI analysis?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                We use advanced LLMs and specialized market data to correlate your skills with current digital business trends. While no prediction is 100%, our models are tuned on thousands of success stories.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border-white/5">
              <AccordionTrigger className="hover:no-underline text-left">What kind of opportunities are suggested?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                We focus on high-leverage digital business models including AI-assisted services, modern freelancing, SaaS, content ecosystems, and automation consulting.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-primary" />
              <span className="font-bold">AI Assist Pro</span>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground">About</Link>
              <Link href="#" className="hover:text-foreground">Contact</Link>
              <Link href="#" className="hover:text-foreground">Privacy</Link>
              <Link href="#" className="hover:text-foreground">Terms</Link>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 AI Assist Pro. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}