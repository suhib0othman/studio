/**
 * @fileOverview Genkit v1.x Core Initialization.
 * Sanitized for secure production deployment.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

/**
 * Global AI instance configured with Google AI plugin.
 * Handles missing API keys gracefully without crashing the server process.
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
 * Updated to a highly stable production identifier.
 */
export const geminiModel = 'googleai/gemini-2.0-flash';

if (typeof window === 'undefined') {
  if (!apiKey) {
    console.warn("⚠️ [Genkit Warning]: GEMINI_API_KEY is missing. AI features will fail at runtime.");
  } else {
    console.log("🤖 [Genkit Engine] Initialized securely.");
  }
}
