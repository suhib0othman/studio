'use server';
/**
 * @fileOverview Production Genkit flow for personalized income roadmap generation.
 * Uses Genkit 1.x API and Gemini 2.0 Flash.
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
  compatibilityScore: z.coerce.number().min(0).max(100),
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

export type Opportunity = z.infer<typeof OpportunitySchema>;

const GeneratePersonalizedOpportunitiesOutputSchema = z.object({
  aiWealthScore: z.coerce.number().min(0).max(100),
  achievementBadge: z.string(),
  profileSummary: z.string(),
  personalityType: z.string(),
  growthPotential: z.string(),
  bestBusinessModel: z.string(),
  bestMonetizationMethod: z.string(),
  opportunities: z.array(OpportunitySchema).min(1).max(5),
});

export type GeneratePersonalizedOpportunitiesInput = z.infer<typeof GeneratePersonalizedOpportunitiesInputSchema>;
export type GeneratePersonalizedOpportunitiesOutput = z.infer<typeof GeneratePersonalizedOpportunitiesOutputSchema>;

const generateOpportunitiesPrompt = ai.definePrompt({
  name: 'generateOpportunitiesPrompt',
  model: geminiModel,
  input: { schema: GeneratePersonalizedOpportunitiesInputSchema },
  output: { schema: GeneratePersonalizedOpportunitiesOutputSchema },
  config: { temperature: 0.2 },
  system: `أنت خبير استراتيجيات الأعمال. حلل المدخلات وقدم تقريراً بصيغة JSON فقط باللغة العربية.`,
  prompt: `البيانات:
الخبرة: {{{primaryExpertise}}}
الوقت: {{{availableHoursPerWeek}}}
الهدف المالي: {{{incomeGoal}}}
الميزانية: {{{availableBudget}}}
المستوى: {{{experienceLevel}}}
النمط: {{{workPreference}}}
النشاط: {{{preferredActivity}}}
القوة: {{{greatestStrength}}}
المخاطرة: {{{riskTolerance}}}
الهدف: {{{primaryGoal}}}`,
});

export async function generatePersonalizedOpportunities(
  input: GeneratePersonalizedOpportunitiesInput
): Promise<GeneratePersonalizedOpportunitiesOutput> {
  try {
    const response = await generateOpportunitiesPrompt(input);
    
    if (String(response.finishReason) !== 'STOP') {
      throw new Error(`AI generation incomplete: ${response.finishReason}`);
    }

    if (!response.output) {
      throw new Error("لم يتمكن الذكاء الاصطناعي من توليد نتائج. حاول تعديل مدخلاتك.");
    }
    return response.output;
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    throw new Error(error.message || "فشل توليد التقرير المخصص.");
  }
}
