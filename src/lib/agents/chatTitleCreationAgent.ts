'use server';

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { chatTitleCreationPrompt } from "./prompts/chatTitleCreationAgentPrompts";
import { updateChatTitle } from "@/lib/services/chatsService";

const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY!,
  modelName: "gemini-2.0-flash-lite",
  temperature: 0.2,
});

export async function createChatTitle(chatId: string, message: string): Promise<string> {
  try {
    const chatTitle = await chatTitleCreationPrompt
      .pipe(model)
      .pipe(new StringOutputParser())
      .invoke({ message });

    const chat = await updateChatTitle(chatId, chatTitle);
    if (!chat) {
      throw new Error("Chat not found");
    }

    return chatTitle;
  } catch (error) {
    console.error("Error creating chat title:", error);
    throw new Error("Failed to create chat title");
  }
}