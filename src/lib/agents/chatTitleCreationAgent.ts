'use server';

import { chatTitleCreationPrompt } from "./prompts/chatTitleCreationAgentPrompts";
import { generateText } from "ai";
import { updateChatTitle } from "@/lib/services/chatsService";
import { getGroqFromAiSdk } from "@/lib/agents/languageModels";

const model = await getGroqFromAiSdk();

export async function createChatTitle(chatId: string, message: string): Promise<string> {
  try {
    const chatTitle = await generateText({
      model,
      system: chatTitleCreationPrompt,
      prompt: "Správa: " + message,
      temperature: 0.3
    });

    const formattedTitle = chatTitle.text.endsWith('.') ? chatTitle.text.slice(0, -1) : chatTitle.text;
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