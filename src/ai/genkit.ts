/**
 * @fileOverview Genkit v1.x Core Initialization.
 * Sanitized for secure production deployment.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Robust API key detection checking multiple common naming conventions.
 */
const apiKey = 
  process.env.GEMINI_API_KEY || 
  process.env.GOOGLE_API_KEY || 
  process.env.GOOGLE_GENAI_API_KEY;

/**
 * Global AI instance configured with Google AI plugin.
 */
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey,
    }),
  ],
});

/**
 * Model reference for Google AI.
 * Using Gemini 2.0 Flash for stability and performance.
 */
export const geminiModel = 'googleai/gemini-2.0-flash';

if (typeof window === 'undefined') {
  if (!apiKey) {
    console.warn("⚠️ [Genkit Warning]: GEMINI_API_KEY is missing. AI features will fail at runtime.");
  } else {
    console.log("🤖 [Genkit Engine] Initialized securely with Gemini 2.0.");
  }
}
