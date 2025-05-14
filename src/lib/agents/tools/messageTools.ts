import { Tool } from "@langchain/core/tools";
import { createSupabaseServerClient } from "@/lib/utils/supabase/server";
import { getMessagesByChatId } from "@/lib/services/messagesService";
import { getDocumentAnalysis } from "@/lib/services/documentAnalysesService";
import { MessageType } from "@/types/chat";

/**
 * Tool for fetching conversation history
 */
export class ConversationHistoryFetcher extends Tool {
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

/**
 * Tool for fetching document context
 */
export class DocumentContextFetcher extends Tool {
  name = "document_context_fetcher";
  description = "Fetches document analysis and context for a given document ID";

  constructor() {
    super();
  }

  async _call(documentId: string): Promise<string> {
    try {
      if (!documentId) {
        return "No document context available.";
      }

      const supabaseClient = await createSupabaseServerClient();

      const analysis = await getDocumentAnalysis(documentId, supabaseClient);

      if (!analysis) {
        return "Document analysis not found.";
      }

      // Format document context
      return `
DOCUMENT SUMMARY:
${analysis.summary}

KEY INFORMATION:
${JSON.stringify(analysis.key_information, null, 2)}

LEGAL ANALYSIS:
${JSON.stringify(analysis.legal_analysis, null, 2)}
      `;
    } catch (error) {
      console.error('Error fetching document context:', error);
      return "Error fetching document context.";
    }
  }
}
