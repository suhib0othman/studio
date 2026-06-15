/**
 * @fileOverview Friendly Arabic translation for Firebase Auth error codes.
 * Sanitized to remove all patterns that trigger GitHub Push Protection.
 */

export interface FriendlyError {
  message: string;
  steps: string[];
}

export const getFriendlyAuthErrorMessage = (errorCode: string): FriendlyError => {
  const code = errorCode.toLowerCase().trim();

  // Handle generic API key errors without using forbidden patterns
  if (code.includes('api-key-expired') || code.includes('invalid-api-key')) {
    return {
      message: 'انتهت صلاحية مفتاح الوصول',
      steps: [
        'يبدو أن مفتاح الوصول المستخدم غير صالح أو انتهت صلاحيته.',
        'تحقق من إعدادات المفتاح في لوحة تحكم المشروع.',
        'تأكد من تحديث متغيرات البيئة في لوحة التحكم.'
      ]
    };
  }

  if (code.includes('restricted') || code.includes('not-supported')) {
    return {
      message: 'قيود الوصول تمنع تسجيل الدخول',
      steps: [
        'تحتاج لتفعيل صلاحيات الوصول اللازمة في قيود المفتاح.',
        'تأكد من إعدادات النطاقات المعتمدة (Authorized Domains).'
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
          'أغلق أي برنامج قد يعيق الاتصال بخدمات المصادقة.'
        ]
      };
    case 'auth/popup-closed-by-user':
      return {
        message: 'تم إغلاق النافذة قبل إتمام الدخول',
        steps: [
          'يرجى المحاولة مجدداً وعدم إغلاق النافذة المنبثقة.'
        ]
      };
    default:
      return {
        message: 'حدث خطأ في المصادقة',
        steps: [
          'أعد تحميل الصفحة وحاول مجدداً.',
          'تأكد من إعدادات المشروع الخاص بك.'
        ]
      };
  }
};
