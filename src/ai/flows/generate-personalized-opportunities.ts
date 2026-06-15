'use server';
/**
 * @fileOverview Production-hardened Genkit flow for personalized income roadmap generation.
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
  opportunities: z.array(OpportunitySchema).length(5),
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
2. لا تضف أي نصوص مقدمة أو خاتمة أو علامات Markdown (مثل \`\`\`json).
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
  try {
    const { output, response } = await generateOpportunitiesPrompt(input);
    
    if (!output) {
      const reason = response?.candidates?.[0]?.finishReason;
      if (reason === 'SAFETY') throw new Error("تم حجب المحتوى لدواعي الأمان. يرجى تعديل بعض الكلمات في مدخلاتك.");
      throw new Error("فشل الذكاء الاصطناعي في تنسيق النتائج بالهيكل المطلوب. يرجى المحاولة مرة أخرى.");
    }
    
    return output;
  } catch (error: any) {
    console.error("AI Flow Error:", error);
    
    if (error.message?.includes('404')) {
      throw new Error("حدث خطأ في الاتصال بنموذج الذكاء الاصطناعي (Model Not Found). يرجى التحقق من إعدادات المفتاح.");
    }
    
    if (error.message?.includes('429')) {
      throw new Error("تم تجاوز حد الطلبات المسموح به. يرجى الانتظار لمدة دقيقة واحدة ثم إعادة المحاولة.");
    }

    throw new Error(error.message || "حدث خطأ غير متوقع أثناء توليد التقرير.");
  }
}
