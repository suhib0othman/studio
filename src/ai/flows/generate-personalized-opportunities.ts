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
    temperature: 0.15, // Low temperature for maximum schema compliance
    topP: 0.7,
  },
  system: `أنت خبير استراتيجي في الأعمال والذكاء الاصطناعي.
مهمتك: توليد تقرير JSON متوافق تماماً مع الهيكل المطلوب.

قواعد صارمة:
1. الرد يجب أن يكون JSON فقط. لا تضف أي نص توضيحي أو علامات Markdown.
2. جميع القيم النصية يجب أن تكون باللغة العربية الاحترافية.
3. تأكد من تقديم 5 فرص متنوعة بدقة.
4. ابدأ الرد بـ { وانتهِ بـ }.`,
  prompt: `حلل البيانات التالية وقدم تقريراً استشارياً:
خبرة المستخدم: {{{primaryExpertise}}}
الوقت: {{{availableHoursPerWeek}}}
الهدف المالي: {{{incomeGoal}}}
الميزانية: {{{availableBudget}}}
المستوى: {{{experienceLevel}}}
النمط: {{{workPreference}}}
النشاط المفضل: {{{preferredActivity}}}
القوة: {{{greatestStrength}}}
المخاطرة: {{{riskTolerance}}}
الهدف: {{{primaryGoal}}}`,
});

export async function generatePersonalizedOpportunities(
  input: GeneratePersonalizedOpportunitiesInput
): Promise<GeneratePersonalizedOpportunitiesOutput> {
  try {
    const { output, response } = await generateOpportunitiesPrompt(input);
    
    if (!output) {
      const reason = response?.candidates?.[0]?.finishReason;
      if (reason === 'SAFETY') throw new Error("تم حجب المحتوى لدواعي الأمان. يرجى تعديل مدخلاتك.");
      throw new Error("فشل الذكاء الاصطناعي في تنسيق النتائج. يرجى المحاولة مرة أخرى.");
    }
    
    return output;
  } catch (error: any) {
    console.error("AI Flow Error:", error);
    if (error.message?.includes('429')) throw new Error("تم تجاوز حد الطلبات (Rate Limit). يرجى الانتظار دقيقة.");
    throw new Error(error.message || "حدث خطأ غير متوقع أثناء توليد التقرير.");
  }
}
