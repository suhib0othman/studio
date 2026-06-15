/**
 * @fileOverview Genkit v1.x Core Initialization.
 * Sanitized for secure production deployment.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Global AI instance configured with Google AI plugin.
 * API Key is pulled strictly from environment variables.
 */
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
    }),
  ],
});

/**
 * Model reference for Google AI.
 * The identifier 'googleai/gemini-1.5-flash' is the standard for Genkit 1.x Google AI plugin.
 */
export const geminiModel = 'googleai/gemini-1.5-flash';

if (typeof window === 'undefined') {
  console.log("🤖 [Genkit Engine] Initialized securely with Google AI plugin.");
}
