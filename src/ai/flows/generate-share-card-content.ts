'use server';
/**
 * @fileOverview This file implements a Genkit flow to generate personalized share card content.
 */

import { ai, geminiModel } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateShareCardContentInputSchema = z.object({
  aiWealthScore: z.number().int().min(0).max(100).describe('The user\'s AI Wealth Score from 0 to 100.'),
  profileSummary: z.string().describe('A summary of the user\'s personalized profile.'),
  achievementBadge: z.string().describe('The achievement badge awarded to the user.'),
  topOpportunities: z.array(z.string()).min(3).describe('A list of income opportunity names.'),
});
export type GenerateShareCardContentInput = z.infer<typeof GenerateShareCardContentInputSchema>;

const GenerateShareCardContentOutputSchema = z.object({
  aiWealthScore: z.number().int().min(0).max(100).describe('The user\'s AI Wealth Score.'),
  topOpportunityName: z.string().describe('The name of the single best matched income opportunity.'),
  topThreeOpportunityNames: z.array(z.string()).length(3).describe('An array of the names of the top three income opportunities.'),
  achievementBadge: z.string().describe('The user\'s achievement badge.'),
  personalizedMessage: z.string().describe('A concise, inspiring personalized message incorporating the user\'s achievements and AI Assist Pro branding.'),
});
export type GenerateShareCardContentOutput = z.infer<typeof GenerateShareCardContentOutputSchema>;

const generateShareCardContentPrompt = ai.definePrompt({
  name: 'generateShareCardContentPrompt',
  model: geminiModel,
  input: { schema: GenerateShareCardContentInputSchema },
  output: { schema: GenerateShareCardContentOutputSchema },
  prompt: `أنت مساعد ذكي لبرنامج "AI Assist Pro". قم بتوليد محتوى نصي لبطاقة مشاركة ملهمة.

بيانات المستخدم:
مؤشر الثراء: {{{aiWealthScore}}}
ملخص الملف: {{{profileSummary}}}
الوسام: {{{achievementBadge}}}
الفرص:
{{#each topOpportunities}}
- {{{this}}}
{{/each}}

قم بإنشاء رسالة قصيرة وملهمة باللغة العربية تبرز أهم 3 فرص، مع التركيز على الابتكار والذكاء الاصطناعي.`,
});

export async function generateShareCardContent(
  input: GenerateShareCardContentInput
): Promise<GenerateShareCardContentOutput> {
  try {
    const { output } = await generateShareCardContentPrompt(input);
    if (!output) throw new Error('AI returned no output.');
    return output;
  } catch (error: any) {
    console.error("❌ [Share Card Flow Error]: ", error);
    
    if (error.message?.includes('404')) {
      throw new Error(`Gemini API 404 (Not Found): لم يتم العثور على الموديل. تم تحديث الإعدادات، يرجى إعادة تشغيل الخادم.`);
    }
    
    throw new Error(error.message || "فشل توليد محتوى بطاقة المشاركة.");
  }
}
