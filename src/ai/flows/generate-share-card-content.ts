'use server';
/**
 * @fileOverview Share card content generator using Genkit 1.x.
 */

import { ai, geminiModel } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateShareCardContentInputSchema = z.object({
  aiWealthScore: z.number().min(0).max(100),
  profileSummary: z.string(),
  achievementBadge: z.string(),
  topOpportunities: z.array(z.string()).min(1),
});

const GenerateShareCardContentOutputSchema = z.object({
  aiWealthScore: z.coerce.number(),
  topOpportunityName: z.string(),
  topThreeOpportunityNames: z.array(z.string()).min(1).max(3),
  achievementBadge: z.string(),
  personalizedMessage: z.string(),
});

export type GenerateShareCardContentOutput = z.infer<typeof GenerateShareCardContentOutputSchema>;

const generateShareCardContentPrompt = ai.definePrompt({
  name: 'generateShareCardContentPrompt',
  model: geminiModel,
  input: { schema: GenerateShareCardContentInputSchema },
  output: { schema: GenerateShareCardContentOutputSchema },
  system: `أنت مساعد تسويقي. حول النتائج إلى محتوى بطاقة مشاركة ملهمة بصيغة JSON فقط باللغة العربية.`,
  prompt: `البيانات:
الدرجة: {{{aiWealthScore}}}
الوسام: {{{achievementBadge}}}
الفرص:
{{#each topOpportunities}}
- {{{this}}}
{{/each}}`,
});

export async function generateShareCardContent(
  input: z.infer<typeof GenerateShareCardContentInputSchema>
): Promise<GenerateShareCardContentOutput> {
  try {
    const response = await generateShareCardContentPrompt(input);
    if (!response.output) throw new Error("EMPTY_AI_RESPONSE");
    return response.output;
  } catch (error: any) {
    console.error("Share content error:", error);
    throw new Error("فشل توليد بيانات المشاركة.");
  }
}
