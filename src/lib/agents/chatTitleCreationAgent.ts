'use server';

import { StringOutputParser } from "@langchain/core/output_parsers";
import { chatTitleCreationPrompt } from "./prompts/chatTitleCreationAgentPrompts";
import { updateChatTitle } from "@/lib/services/chatsService";
import { getModelFlashLite } from "@/lib/agents/languageModels";

const model = await getModelFlashLite();

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