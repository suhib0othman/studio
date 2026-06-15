'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/firebase/errors';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      // In development, we want to see the rich contextual error
      if (process.env.NODE_ENV === 'development') {
        throw error; // This triggers the Next.js error overlay
      }
      
      // In production, we show a friendly toast
      toast({
        variant: "destructive",
        title: "خطأ في الصلاحيات",
        description: "عذراً، لا تملك الصلاحية للقيام بهذا الإجراء.",
      });
    };

    errorEmitter.on('permission-error', handleError);
    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  return null;
}
