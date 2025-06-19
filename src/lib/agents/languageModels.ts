'use server'

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { google } from '@ai-sdk/google';
import { mistral } from '@ai-sdk/mistral';
import { groq } from '@ai-sdk/groq';

export async function getGeminiFlashLiteFromAiSdk(useSearchGrounding: boolean = false) {
    return google('gemini-2.0-flash-lite', {
        useSearchGrounding,
    });
}

export async function getGeminiFlashFromAiSdk(useSearchGrounding: boolean = false) {
    return google('gemini-2.0-flash', {
        useSearchGrounding,
    });
}

export async function getMistralFromAiSdk() {
    return mistral('mistral-small-latest', {
        safePrompt: true
    });
}

export async function getGroqFromAiSdk() {
    return groq('llama-3.1-8b-instant');
}

export async function getModelFlashLite(temperature: number = 0.1): Promise<ChatGoogleGenerativeAI> {
    return new ChatGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
        modelName: "gemini-2.0-flash-lite",
        temperature: temperature,
    });
}