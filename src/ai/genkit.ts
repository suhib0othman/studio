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
 * Migrated to gemini-2.0-flash for enhanced performance and availability.
 * The identifier 'googleai/gemini-2.0-flash' is supported by @genkit-ai/google-genai v1.28.0+.
 */
export const geminiModel = 'googleai/gemini-2.0-flash';

if (typeof window === 'undefined') {
  console.log("🤖 [Genkit Engine] Initialized securely with Gemini 2.0 Flash.");
}
