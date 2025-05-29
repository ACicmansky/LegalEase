'use server';

import { StringOutputParser } from "@langchain/core/output_parsers";
import { chatTitleCreationPrompt } from "./prompts/chatTitleCreationAgentPrompts";
import { updateChatTitle } from "@/lib/services/chatsService";
import { getModelGroq } from "@/lib/agents/languageModels";

const model = await getModelGroq();

export async function createChatTitle(chatId: string, message: string): Promise<string> {
  try {
    const chatTitle = await chatTitleCreationPrompt
      .pipe(model)
      .pipe(new StringOutputParser())
      .invoke({ message });

    const formattedTitle = chatTitle.endsWith('.') ? chatTitle.slice(0, -1) : chatTitle;
    const chat = await updateChatTitle(chatId, formattedTitle);
    if (!chat) {
      throw new Error("Chat not found");
    }

    return formattedTitle;
  } catch (error) {
    console.error("Error creating chat title:", error);
    throw new Error("Failed to create chat title");
  }
}