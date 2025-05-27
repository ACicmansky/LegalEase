import { Tool } from "@langchain/core/tools";
import { getMessagesByChatId } from "@/lib/services/messagesService";
import { MessageType } from "@/types/chat";

/**
 * Tool for fetching conversation history
 */
export class GetConversationHistoryTool extends Tool {
  name = "conversation_history_fetcher";
  description = "Fetches recent conversation history for a chat";

  constructor() {
    super();
  }

  async _call(chatId: string): Promise<string> {
    try {
      const messages = await getMessagesByChatId(chatId, [MessageType.User, MessageType.Assistant], 10);

      if (!messages) {
        return "No conversation history available.";
      }

      // Format conversation history
      const formattedHistory = messages
        .map(msg => `${msg.type === MessageType.User ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n\n');

      return formattedHistory;
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      throw new Error(`Failed to fetch conversation history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
