'use server';
/**
 * @fileOverview Production-hardened Genkit flow for personalized income roadmap generation.
 * Handles Gemini errors, retries with exponential backoff, and provides Arabic feedback.
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
    temperature: 0.2,
    topP: 0.9,
  },
  system: `أنت خبير استراتيجي عالمي في الأعمال والذكاء الاصطناعي.
مهمتك هي تحليل مدخلات المستخدم وتوليد تقرير "خارطة طريق" بصيغة JSON فقط.

قواعد الإنتاج الصارمة:
1. يجب أن يكون الرد JSON صالحاً تماماً (Strict JSON).
2. لا تستخدم Markdown (لا تضع \`\`\`json).
3. جميع القيم النصية يجب أن تكون باللغة العربية الاحترافية والملهمة.
4. املأ جميع الحقول المطلوبة في المخطط (Schema)؛ لا تترك حقولاً فارغة أو غير موجودة.`,
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

/**
 * Helper to map Gemini errors to Arabic user-friendly messages.
 */
function handleGeminiError(error: any): string {
  // If it's a validation error from Genkit/Zod
  if (error.name === 'ZodError' || error.message?.includes('validation')) {
    console.error("Schema Validation Failed:", JSON.stringify(error, null, 2));
    return "حدث خطأ في معالجة البيانات من قبل الذكاء الاصطناعي. يرجى المحاولة مرة أخرى بصياغة مختلفة قليلاً.";
  }

  const status = error.status || error.code || (error.details && error.details.status);
  const msg = error.message || "";

  if (status === 429 || msg.includes('429')) return "تم تجاوز حد الطلبات المسموح به (Rate Limit). يرجى الانتظار دقيقة والمحاولة مجدداً.";
  if (status === 404 || msg.includes('404')) return "نموذج الذكاء الاصطناعي غير متوفر حالياً في منطقتك.";
  if (status === 500 || status === 503) return "خوادم الذكاء الاصطناعي تواجه ضغطاً كبيراً. حاول مجدداً بعد قليل.";
  if (msg.includes('blocked') || error.finishReason === 'blocked') return "تم حجب المحتوى بسبب قيود السلامة. يرجى تعديل مدخلاتك لتكون أكثر وضوحاً.";
  
  return "حدث خطأ غير متوقع أثناء توليد التقرير. يرجى المحاولة مرة أخرى.";
}

export async function generatePersonalizedOpportunities(
  input: GeneratePersonalizedOpportunitiesInput
): Promise<GeneratePersonalizedOpportunitiesOutput> {
  const maxRetries = 2;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await generateOpportunitiesPrompt(input);
      
      if (result.finishReason === 'blocked') {
        throw new Error("blocked");
      }

      if (!result.output) {
        throw new Error("EMPTY_OUTPUT");
      }
      
      return result.output;
    } catch (error: any) {
      console.error(`--- [AI ATTEMPT ${attempt + 1}] ---`, error.message);
      
      const isRetryable = error.message?.includes('429') || error.status === 429 || error.message === 'EMPTY_OUTPUT';
      
      if (isRetryable && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1500;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // Instead of throwing a raw object (which Next.js might fail to serialize, causing 500), 
      // we throw a standard Error with a string message.
      throw new Error(handleGeminiError(error));
    }
  }
  throw new Error("فشلت جميع المحاولات لتوليد التقرير. يرجى التحقق من اتصالك.");
}
