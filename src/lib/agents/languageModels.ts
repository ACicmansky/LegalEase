'use server'

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";

export async function getModelFlashLite(temperature: number = 0.1): Promise<ChatGoogleGenerativeAI> {
    return new ChatGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_GENAI_API_KEY!,
        modelName: "gemini-2.0-flash-lite",
        temperature: temperature,
    });
}

export async function getModelFlash(temperature: number = 0.2): Promise<ChatGoogleGenerativeAI> {
    return new ChatGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_GENAI_API_KEY!,
        modelName: "gemini-2.0-flash",
        temperature: temperature,
    });
}

export async function getModelGroq(): Promise<ChatGroq> {
    return new ChatGroq({
        apiKey: process.env.GROQ_API_KEY!,
        modelName: "llama-3.1-8b-instant",
    });
}
