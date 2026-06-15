'use server';
/**
 * @fileOverview Share card content generator using Genkit 1.x.
 * Fixed Zod validation and prompt instructions.
 */

import { ai, geminiModel } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateShareCardContentInputSchema = z.object({
  aiWealthScore: z.number().min(0).max(100),
  profileSummary: z.string(),
  achievementBadge: z.string(),
  topOpportunities: z.array(z.string()).min(1),
});
export type GenerateShareCardContentInput = z.infer<typeof GenerateShareCardContentInputSchema>;

const GenerateShareCardContentOutputSchema = z.object({
  aiWealthScore: z.coerce.number().min(0).max(100),
  topOpportunityName: z.string(),
  topThreeOpportunityNames: z.array(z.string()).min(1).max(5),
  achievementBadge: z.string(),
  personalizedMessage: z.string(),
});
export type GenerateShareCardContentOutput = z.infer<typeof GenerateShareCardContentOutputSchema>;

const generateShareCardContentPrompt = ai.definePrompt({
  name: 'generateShareCardContentPrompt',
  model: geminiModel,
  input: { schema: GenerateShareCardContentInputSchema },
  output: { schema: GenerateShareCardContentOutputSchema },
  config: { temperature: 0.4 },
  system: `أنت مساعد ذكي لبرنامج "AI Assist Pro". حول بيانات النجاح إلى محتوى بطاقة مشاركة ملهمة.
أجب بصيغة JSON فقط، دون Markdown.
يجب أن تحتوي قائمة "topThreeOpportunityNames" على 3 عناصر على الأقل.`,
  prompt: `قم بتحويل البيانات التالية إلى محتوى بطاقة مشاركة:
مؤشر الثراء: {{{aiWealthScore}}}
الملخص: {{{profileSummary}}}
الوسام: {{{achievementBadge}}}
الفرص:
{{#each topOpportunities}}
- {{{this}}}
{{/each}}`,
});

export async function generateShareCardContent(
  input: GenerateShareCardContentInput
): Promise<GenerateShareCardContentOutput> {
  try {
    const result = await generateShareCardContentPrompt(input);
    if (!result.output) throw new Error("EMPTY_OUTPUT");
    return result.output;
  } catch (error: any) {
    console.error("Share card error:", error);
    throw new Error("فشل توليد محتوى بطاقة المشاركة.");
  }
}
