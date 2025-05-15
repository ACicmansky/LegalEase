'use server';

//import { processMessageWithLegalAgent } from './legalAgentGraph';
//import { ChatMessageExtended, MessageType } from '@/types/chat';

/**
 * Processes a user message with the LangGraph-based legal agent and
 * prepares a message record for storing in the database
 */
export async function processMessageWithAgent(
  // chatId: string,
  // content: string,
  // userId?: string,
  // documentId?: string
)
//: Promise<Partial<ChatMessageExtended>>
{
  //try {
  // Process the message with the legal agent
  //   const result = await processMessageWithLegalAgent(chatId, content, userId, documentId);

  //   // Prepare message record based on agent result
  //   const messageData: Partial<ChatMessageExtended> = {
  //     chat_id: chatId,
  //     content: result.response || "I'm sorry, I couldn't process your request.",
  //     type: MessageType.Assistant,
  //     sources: result.sources || [],
  //     metadata: {
  //       //intent: result.intent, // TODO: fix intent type
  //       guidance: result.guidance,
  //     }
  //   };

  //   if (userId) {
  //     messageData.user_id = userId;
  //   }

  //   return messageData;
  // } catch (error) {
  //   console.error("Error processing message with agent:", error);

  //   // Return error message
  //   return {
  //     chat_id: chatId,
  //     content: "I'm sorry, but there was an error processing your request. Please try again.",
  //     type: MessageType.Error
  //   };
  //}
}
