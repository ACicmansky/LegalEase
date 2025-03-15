import { Tool } from "@langchain/core/tools";
import { createSupabaseServerClient } from "@/lib/utils/supabase/server";

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
      const supabase = await createSupabaseServerClient();

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })
        .limit(10);

      if (error) {
        throw new Error(`Failed to fetch conversation history: ${error.message}`);
      }

      // Format conversation history
      const formattedHistory = (data || [])
        .map(msg => `${msg.is_user ? 'User' : 'Assistant'}: ${msg.content}`)
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

      const supabase = await createSupabaseServerClient();

      const { data, error } = await supabase
        .from('document_analyses')
        .select('*')
        .eq('document_id', documentId)
        .single();

      if (error) {
        throw new Error(`Failed to fetch document analysis: ${error.message}`);
      }

      if (!data) {
        return "Document analysis not found.";
      }

      // Format document context
      return `
DOCUMENT SUMMARY:
${data.summary}

KEY INFORMATION:
${JSON.stringify(data.key_information, null, 2)}

LEGAL ANALYSIS:
${JSON.stringify(data.legal_analysis, null, 2)}
      `;
    } catch (error) {
      console.error('Error fetching document context:', error);
      return "Error fetching document context.";
    }
  }
}
