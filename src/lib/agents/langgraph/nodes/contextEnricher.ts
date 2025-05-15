'use server';

import { LegalAgentState, ProcessingStage } from "../types";

/**
 * Enriches document context with retrieved law content
 * This is a stub implementation for Phase 1
 * Will be fully implemented in Phase 3
 */
export async function enrichContext({ state }: { state: LegalAgentState }): Promise<{ state: LegalAgentState }> {
  try {
    // If there's already an error, pass it through
    if (state.error) {
      return { state };
    }

    // For Phase 1, we'll just use the existing document context without enrichment
    console.log("Context enrichment stub called");
    
    // Create a simple enriched context for development purposes
    let enrichedContext = state.documentContext || "";
    
    // If we have retrieved law content, add it to the context
    if (state.retrievedLawContent && state.retrievedLawContent.length > 0) {
      enrichedContext += "\n\n--- Relevant Laws ---\n\n";
      state.retrievedLawContent.forEach(law => {
        enrichedContext += `${law.law}: ${law.content}\n\n`;
      });
    }

    return {
      state: {
        ...state,
        documentContext: enrichedContext,
        processingStage: ProcessingStage.ContextEnriched,
      }
    };
  } catch (error) {
    console.error("Error in enrichContext:", error);
    return {
      state: {
        ...state,
        error: `Error enriching context: ${error instanceof Error ? error.message : String(error)}`,
        processingStage: ProcessingStage.Complete,
      }
    };
  }
}
