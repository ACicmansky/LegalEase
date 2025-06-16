import { z } from 'zod';
import { getMessagesByChatId } from "@/lib/services/messagesService";
import { getDocumentAnalysis } from "@/lib/services/documentAnalysesService";
import { MessageType } from "@/types/chat";

/**
 * Conversation history tool converted to Vercel AI SDK format
 * Gets recent conversation history for a given chat
 */
export const getConversationHistoryTool = {
  name: "get_conversation_history",
  description: "Fetches recent conversation history for a chat",
  parameters: z.object({
    chatId: z.string().describe("The ID of the chat to retrieve history for")
  }),
  handler: async ({ chatId }: { chatId: string }) => {
    try {
      const messages = await getMessagesByChatId(chatId, [MessageType.User, MessageType.Assistant], 20);

      if (!messages || messages.length === 0) {
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
};

/**
 * Document analysis tool converted to Vercel AI SDK format
 * Retrieves analysis of a document by ID
 */
export const getDocumentAnalysisTool = {
  name: "get_document_analysis",
  description: "Fetches document context and analysis by document ID",
  parameters: z.object({
    documentId: z.string().describe("The ID of the document to analyze")
  }),
  handler: async ({ documentId }: { documentId: string }) => {
    try {
      const analysis = await getDocumentAnalysis(documentId);

      if (!analysis) {
        return "No document analysis available.";
      }

      return analysis;
    } catch (error) {
      console.error('Error fetching document analysis:', error);
      throw new Error(`Failed to fetch document analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};

/**
 * Web search tool for legal information
 * Uses Google Search with dynamic retrieval configuration
 */
// export const searchWebTool = {
//   name: "search_web",
//   description: "Searches the web for relevant legal information",
//   parameters: z.object({
//     query: z.string().describe("The search query"),
//     region: z.string().optional().default("sk-sk").describe("Region for search results, defaults to Slovak region")
//   }),
//   handler: async ({ query, region }: { query: string; region?: string }) => {
//     try {
//       // Format search query to focus on legal information
//       const formattedQuery = `${query} legal information ${region === 'sk-sk' ? 'Slovakia' : region}`;

//       // In a real implementation, this would use an actual search API
//       // This is a placeholder for the actual implementation
//       console.log(`Performing web search for: ${formattedQuery}`);

//       return `Search results for "${formattedQuery}" would appear here. In the actual implementation, this would return real search results.`;
//     } catch (error) {
//       console.error('Error performing web search:', error);
//       throw new Error(`Failed to search web: ${error instanceof Error ? error.message : 'Unknown error'}`);
//     }
//   }
// };