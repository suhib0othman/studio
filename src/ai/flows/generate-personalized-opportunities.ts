'use server';
/**
 * @fileOverview This file implements a Genkit flow to generate personalized online income opportunities.
 */

import { ai, geminiModel } from '@/ai/genkit';
import { z } from 'genkit';

const GeneratePersonalizedOpportunitiesInputSchema = z.object({
  primaryExpertise: z.string().describe('User\'s primary expertise or passion.'),
  availableHoursPerWeek: z.string().describe('Weekly time commitment available.'),
  incomeGoal: z.string().describe('Monthly income goal.'),
  availableBudget: z.string().describe('Available startup capital.'),
  experienceLevel: z.string().describe('Online work experience level.'),
  workPreference: z.string().describe('Preferred work style (Solo/Team).'),
  preferredActivity: z.string().describe('Preferred type of activity.'),
  greatestStrength: z.string().describe('User\'s greatest strength.'),
  riskTolerance: z.string().describe('Risk tolerance level.'),
  primaryGoal: z.string().describe('Primary current goal.'),
});
export type GeneratePersonalizedOpportunitiesInput = z.infer<typeof GeneratePersonalizedOpportunitiesInputSchema>;

const OpportunitySchema = z.object({
  name: z.string().describe('Name of the income opportunity in Arabic.'),
  compatibilityScore: z.number().int().min(0).max(100).describe('Compatibility score from 0-100.'),
  monthlyIncomePotential: z.string().describe('Estimated monthly earning potential in Arabic.'),
  difficultyLevel: z.string().describe('Difficulty level in Arabic.'),
  startupCost: z.string().describe('Estimated startup cost in Arabic.'),
  timeToFirstIncome: z.string().describe('Estimated time to first income in Arabic.'),
  requiredSkills: z.array(z.string()).describe('List of skills required in Arabic.'),
  recommendedAiTools: z.array(z.string()).describe('List of recommended AI tools.'),
  shortExplanation: z.string().describe('A brief explanation of the opportunity in Arabic.'),
  whyThisFitsYou: z.string().describe('Detailed explanation of why this fits the user in Arabic.'),
  stepByStepExecutionPlan: z.array(z.string()).describe('Actionable step-by-step plan in Arabic.'),
  commonMistakes: z.array(z.string()).describe('Common mistakes to avoid in Arabic.'),
  successTips: z.array(z.string()).describe('Expert success tips in Arabic.'),
  expectedTimeline: z.string().describe('Estimated timeline for milestones in Arabic.'),
});

const GeneratePersonalizedOpportunitiesOutputSchema = z.object({
  aiWealthScore: z.number().int().min(0).max(100).describe('Overall potential score.'),
  achievementBadge: z.string().describe('Personalized achievement badge in Arabic.'),
  profileSummary: z.string().describe('Concise personalized profile summary in Arabic.'),
  personalityType: z.string().describe('Identified personality type in Arabic.'),
  growthPotential: z.string().describe('Description of growth potential in Arabic.'),
  bestBusinessModel: z.string().describe('Recommended business model in Arabic.'),
  bestMonetizationMethod: z.string().describe('Recommended monetization method in Arabic.'),
  opportunities: z.array(OpportunitySchema).length(5).describe('Top 5 most suitable opportunities.'),
});
export type GeneratePersonalizedOpportunitiesOutput = z.infer<typeof GeneratePersonalizedOpportunitiesOutputSchema>;

const generateOpportunitiesPrompt = ai.definePrompt({
  name: 'generateOpportunitiesPrompt',
  model: geminiModel,
  input: { schema: GeneratePersonalizedOpportunitiesInputSchema },
  output: { schema: GeneratePersonalizedOpportunitiesOutputSchema },
  prompt: `أنت خبير استراتيجي في الأعمال والذكاء الاصطناعي. حلل البيانات التالية وقدم تقريراً استشارياً كاملاً باللغة العربية:
  
مجال الخبرة: {{{primaryExpertise}}}
الوقت المتاح: {{{availableHoursPerWeek}}}
الهدف المالي: {{{incomeGoal}}}
رأس المال: {{{availableBudget}}}
مستوى الخبرة: {{{experienceLevel}}}
أسلوب العمل: {{{workPreference}}}
نوع الأنشطة المفضلة: {{{preferredActivity}}}
نقطة القوة الكبرى: {{{greatestStrength}}}
مستوى المخاطرة: {{{riskTolerance}}}
الهدف الأساسي: {{{primaryGoal}}}`,
});

export async function generatePersonalizedOpportunities(
  input: GeneratePersonalizedOpportunitiesInput
): Promise<GeneratePersonalizedOpportunitiesOutput> {
  try {
    const { output } = await generateOpportunitiesPrompt(input);
    if (!output) {
      throw new Error("AI engine returned an empty result.");
    }
    return output;
  } catch (error: any) {
    console.error("❌ [AI Flow Error]:", error);
    
    if (error.message?.includes('403')) {
      throw new Error("Gemini API 403: خطأ في الصلاحيات. تأكد من تفعيل 'Generative Language API' و 'Identity Toolkit API' للمفتاح المستخدم.");
    }
    
    if (error.message?.includes('404')) {
      throw new Error("Gemini API 404: الموديل غير موجود. تم تحديث الإعدادات، يرجى إعادة تشغيل الخادم (npm run dev).");
    }

    throw new Error(error.message || "فشل توليد خارطة الطريق الاستشارية المخصصة.");
  }
}
