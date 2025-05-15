'use server';

import { LegalAgentState, ProcessingStage } from "@/lib/agents/langgraph/types";
import { ConversationHistoryFetcher, DocumentContextFetcher } from "@/lib/agents/tools/messageTools";

/**
 * Initialize the agent state with conversation history and document context
 */
export async function initializeState({ state }: { state: LegalAgentState }): Promise<{ state: LegalAgentState }> {
  try {
    // Create instances of our fetchers
    const conversationHistoryFetcher = new ConversationHistoryFetcher();
    const documentContextFetcher = new DocumentContextFetcher();

    // Initialize state with additional context
    const updatedState: LegalAgentState = {
      ...state,
      processingStage: ProcessingStage.Initial,
    };

    // Fetch conversation history if we have a chat ID
    if (state.chatId) {
      try {
        const history = await conversationHistoryFetcher.invoke(state.chatId);
        updatedState.conversationHistory = history;
      } catch (error) {
        console.error("Error fetching conversation history:", error);
        updatedState.conversationHistory = "No previous conversation available.";
      }
    }

    // Fetch document context if we have a document ID
    if (state.documentId) {
      try {
        const context = await documentContextFetcher.invoke(state.documentId);
        updatedState.documentContext = context;
      } catch (error) {
        console.error("Error fetching document context:", error);
        updatedState.documentContext = "No document context available.";
      }
    }

    return { state: updatedState };
  } catch (error) {
    console.error("Error in initializeState:", error);
    return {
      state: {
        ...state,
        error: `Error initializing state: ${error instanceof Error ? error.message : String(error)}`,
        processingStage: ProcessingStage.Complete,
      }
    };
  }
}
