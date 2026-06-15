'use server';
/**
 * @fileOverview Production-hardened Genkit flow for personalized income roadmap generation.
 * Includes improved validation handling to prevent 500 Internal Server Errors.
 */

import { ai, geminiModel } from '@/ai/genkit';
import { z } from 'genkit';

const GeneratePersonalizedOpportunitiesInputSchema = z.object({
  primaryExpertise: z.string(),
  availableHoursPerWeek: z.string(),
  incomeGoal: z.string(),
  availableBudget: z.string(),
  experienceLevel: z.string(),
  workPreference: z.string(),
  preferredActivity: z.string(),
  greatestStrength: z.string(),
  riskTolerance: z.string(),
  primaryGoal: z.string(),
});

const OpportunitySchema = z.object({
  name: z.string().describe('Opportunity name in Arabic'),
  compatibilityScore: z.number().int().min(0).max(100),
  monthlyIncomePotential: z.string(),
  difficultyLevel: z.string(),
  startupCost: z.string(),
  timeToFirstIncome: z.string(),
  requiredSkills: z.array(z.string()),
  recommendedAiTools: z.array(z.string()),
  shortExplanation: z.string(),
  whyThisFitsYou: z.string(),
  stepByStepExecutionPlan: z.array(z.string()),
  commonMistakes: z.array(z.string()),
  successTips: z.array(z.string()),
  expectedTimeline: z.string(),
});

const GeneratePersonalizedOpportunitiesOutputSchema = z.object({
  aiWealthScore: z.number().int().min(0).max(100),
  achievementBadge: z.string(),
  profileSummary: z.string(),
  personalityType: z.string(),
  growthPotential: z.string(),
  bestBusinessModel: z.string(),
  bestMonetizationMethod: z.string(),
  // Use min(1) instead of exact length to prevent validation crashes if AI returns 4 or 6 items
  opportunities: z.array(OpportunitySchema).min(1),
});

export type GeneratePersonalizedOpportunitiesInput = z.infer<typeof GeneratePersonalizedOpportunitiesInputSchema>;
export type GeneratePersonalizedOpportunitiesOutput = z.infer<typeof GeneratePersonalizedOpportunitiesOutputSchema>;

const generateOpportunitiesPrompt = ai.definePrompt({
  name: 'generateOpportunitiesPrompt',
  model: geminiModel,
  input: { schema: GeneratePersonalizedOpportunitiesInputSchema },
  output: { schema: GeneratePersonalizedOpportunitiesOutputSchema },
  config: {
    temperature: 0.1,
    topP: 0.8,
  },
  system: `أنت خبير استراتيجي في الأعمال والذكاء الاصطناعي.
مهمتك الأساسية هي توليد تقرير JSON متوافق تماماً مع الهيكل المطلوب.

تعليمات تقنية حاسمة:
1. يجب أن يكون الرد بصيغة JSON خام فقط.
2. لا تضف أي نصوص مقدمة أو خاتمة أو علامات Markdown.
3. جميع القيم النصية يجب أن تكون باللغة العربية الاحترافية والملهمة.
4. تأكد من تقديم 5 فرص متنوعة بدقة وتفصيل.`,
  prompt: `حلل البيانات التالية وقدم تقريراً استشارياً كاملاً بصيغة JSON:
خبرة المستخدم: {{{primaryExpertise}}}
الوقت المتاح: {{{availableHoursPerWeek}}}
الهدف المالي: {{{incomeGoal}}}
الميزانية المتاحة: {{{availableBudget}}}
المستوى: {{{experienceLevel}}}
النمط المفضل: {{{workPreference}}}
النشاط المفضل: {{{preferredActivity}}}
نقطة القوة: {{{greatestStrength}}}
المخاطرة: {{{riskTolerance}}}
الهدف الأساسي: {{{primaryGoal}}}`,
});

export async function generatePersonalizedOpportunities(
  input: GeneratePersonalizedOpportunitiesInput
): Promise<GeneratePersonalizedOpportunitiesOutput> {
  const maxRetries = 2;
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await generateOpportunitiesPrompt(input);
      
      if (!result.output) {
        if (result.finishReason === 'SAFETY') {
          throw new Error("تم حجب المحتوى لدواعي الأمان. يرجى تعديل بعض الكلمات في مدخلاتك.");
        }
        throw new Error("فشل الذكاء الاصطناعي في تنسيق النتائج بالهيكل المطلوب.");
      }
      
      return result.output;
    } catch (error: any) {
      lastError = error;
      console.error(`--- [AI ERROR DEBUG] (Attempt ${attempt + 1}) ---`, error.message);
      
      const isRateLimit = error.message?.includes('429') || (error.status === 429);
      
      if (isRateLimit && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 2000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // If it's a validation error (Zod), we don't retry, just throw a cleaner message
      if (error.name === 'ZodError' || error.message?.includes('validation')) {
        throw new Error("حدث خطأ في معالجة البيانات من قبل الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.");
      }

      throw error;
    }
  }
  throw lastError;
}
