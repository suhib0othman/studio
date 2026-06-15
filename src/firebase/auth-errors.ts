/**
 * @fileOverview Friendly Arabic translation for Firebase Auth error codes.
 */

export interface FriendlyError {
  message: string;
  steps: string[];
}

export const getFriendlyAuthErrorMessage = (errorCode: string): FriendlyError => {
  const code = errorCode.toLowerCase().trim();

  // Mapping specific technical errors to friendly guidance
  if (code.includes('api-key-not-valid') || code.includes('invalid-api-key')) {
    return {
      message: 'إعدادات الاتصال غير مكتملة',
      steps: [
        'تأكد من إعداد متغيرات البيئة (Environment Variables) بشكل صحيح.',
        'تأكد من إضافة NEXT_PUBLIC_FIREBASE_API_KEY في ملف الـ .env',
        'أعد تشغيل الخادم بعد تحديث المتغيرات.'
      ]
    };
  }

  if (code.includes('unauthorized-domain')) {
    return {
      message: 'نطاق الوصول غير مصرح به',
      steps: [
        'يجب إضافة النطاق الحالي إلى قائمة النطاقات المعتمدة في Firebase Console.',
        'اذهب إلى Authentication > Settings > Authorized Domains وأضف الرابط الحالي.'
      ]
    };
  }

  switch (code) {
    case 'auth/popup-blocked':
      return {
        message: 'تم حجب نافذة الدخول',
        steps: [
          'يرجى السماح بالنوافذ المنبثقة في متصفحك.',
          'حاول تسجيل الدخول مرة أخرى.'
        ]
      };
    case 'auth/network-request-failed':
      return {
        message: 'خطأ في الاتصال بالشبكة',
        steps: [
          'تأكد من استقرار اتصالك بالإنترنت.',
          'أغلق أي برنامج (VPN) قد يعيق الاتصال.'
        ]
      };
    case 'auth/popup-closed-by-user':
      return {
        message: 'تم إغلاق النافذة',
        steps: ['يرجى إكمال عملية الدخول عبر النافذة المنبثقة دون إغلاقها.']
      };
    default:
      return {
        message: 'حدث خطأ في المصادقة',
        steps: [
          'أعد تحميل الصفحة وحاول مجدداً.',
          'تأكد من تفعيل مزود Google في لوحة تحكم Firebase.'
        ]
      };
  }
};
