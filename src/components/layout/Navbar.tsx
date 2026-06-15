'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Cpu, LogIn, LogOut, User, Loader2 } from 'lucide-react';
import { useAuth, useUser } from '@/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { getFriendlyAuthErrorMessage } from '@/firebase/auth-errors';

export function Navbar() {
  const auth = useAuth();
  const { user, loading } = useUser();
  const { toast } = useToast();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = useCallback(async () => {
    setIsLoggingIn(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithPopup(auth, provider);
      toast({ title: "مرحباً بك", description: "تم تسجيل دخولك بنجاح." });
    } catch (error: any) {
      // Enhanced error logging for debugging API key issues
      console.error("❌ [Auth Error]:", error.code, error.message);
      
      const friendly = getFriendlyAuthErrorMessage(error.code);
      toast({ 
        variant: "destructive", 
        title: friendly.message, 
        description: friendly.steps[0] 
      });
    } finally {
      setIsLoggingIn(false);
    }
  }, [auth, toast]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      toast({ title: "تم تسجيل الخروج", description: "نأمل رؤيتك قريباً." });
    } catch (err) {
      console.error("Logout Error:", err);
    }
  }, [auth, toast]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-xl border-b border-white/5 h-20">
      <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2 space-x-reverse group">
          <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-all">
            <Cpu className="w-6 h-6 text-primary" />
          </div>
          <span className="font-bold text-xl tracking-tight">AI Assist <span className="text-primary">Pro</span></span>
        </Link>
        
        <div className="flex items-center space-x-6 space-x-reverse">
          <div className="hidden md:flex items-center space-x-8 space-x-reverse text-sm font-bold text-muted-foreground uppercase tracking-widest">
            <Link href="/#how-it-works" className="hover:text-foreground transition-colors">كيف يعمل</Link>
            <Link href="/#why-us" className="hover:text-foreground transition-colors">لماذا نحن</Link>
          </div>
          
          {!loading && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 w-10 rounded-xl p-0 border border-white/10 overflow-hidden">
                  <Avatar className="h-full w-full">
                    <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User"} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user.displayName?.charAt(0) || <User className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass-card border-white/10 p-2 mt-2" dir="rtl">
                <div className="px-3 py-2 border-b border-white/5 mb-1">
                   <p className="text-sm font-bold truncate">{user.displayName}</p>
                   <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                </div>
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                  <Link href="/dashboard" className="w-full text-right font-bold">لوحة التحكم</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="rounded-lg cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 text-right font-bold">
                  تسجيل الخروج <LogOut className="mr-auto h-4 w-4" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              size="sm" 
              onClick={handleLogin} 
              disabled={isLoggingIn || loading}
              className="bg-primary hover:bg-primary/90 font-bold gap-2 rounded-xl px-6 h-10 cta-button"
            >
              {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              {isLoggingIn ? "جاري الدخول..." : "تسجيل الدخول"}
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
