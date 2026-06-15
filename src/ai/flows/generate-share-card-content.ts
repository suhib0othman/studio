'use server';
/**
 * @fileOverview Refactored share card flow with Genkit 1.x API compatibility.
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
  aiWealthScore: z.number().min(0).max(100),
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
  system: `أنت مساعد ذكي لبرنامج "AI Assist Pro". مهمتك تحويل بيانات نجاح المستخدم إلى محتوى بطاقة مشاركة ملهمة ومختصرة.
أجب بصيغة JSON فقط، دون استخدام Markdown أو علامات \`\`\`json.
يجب أن تحتوي مصفوفة "topThreeOpportunityNames" على ما لا يقل عن 3 عناصر.`,
  prompt: `قم بتحويل بيانات المستخدم التالية إلى محتوى بطاقة مشاركة ملهم:
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
  const maxRetries = 2;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await generateShareCardContentPrompt(input);
      
      const finishReason = result.finishReason as string;
      if (finishReason === 'blocked' || finishReason === 'other') {
        throw new Error("blocked");
      }

      if (!result.output) {
        throw new Error("EMPTY_OUTPUT");
      }
      
      return result.output;
    } catch (error: any) {
      console.error(`--- [SHARE CARD ATTEMPT ${attempt + 1}] ---`, error?.message);
      
      const isRetryable = error?.status === 429 || error?.message?.includes('429') || error?.name === 'ZodError';
      if (isRetryable && attempt < maxRetries) {
        await new Promise(res => setTimeout(res, Math.pow(2, attempt) * 1500));
        continue;
      }
      throw new Error("فشل توليد محتوى بطاقة المشاركة. يرجى المحاولة لاحقاً.");
    }
  }
  throw new Error("فشلت محاولات توليد محتوى البطاقة.");
}
