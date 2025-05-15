'use server';

import { LegalAgentState, ProcessingStage, LegalIntentCategory } from "../types";

/**
 * Selects the appropriate tool based on the classified intent and extracted entities
 * This is a deterministic node that doesn't require LLM calls
 */
export async function selectTool({ state }: { state: LegalAgentState }): Promise<{ state: LegalAgentState }> {
  try {
    // If there's already an error, pass it through
    if (state.error) {
      return { state };
    }

    // Default tool selection logic based on intent and extracted entities
    const updatedState = { ...state, processingStage: ProcessingStage.ToolSelected };

    // If intent is legal lookup and we have laws, we'll use law retrieval
    if (state.intent?.category === LegalIntentCategory.LegalLookup &&
      state.extractedEntities?.laws &&
      state.extractedEntities?.laws.length > 0) {
      // Tool selection information can be added to state if needed
      console.log("Tool selected: Law Retrieval");
    }
    // If we have document context, we'll use context enrichment
    else if (state.documentContext) {
      console.log("Tool selected: Context Enrichment");
    }
    // Otherwise, we'll just generate a response directly
    else {
      console.log("Tool selected: Direct Response Generation");
    }

    return { state: updatedState };
  } catch (error) {
    console.error("Error in selectTool:", error);
    return {
      state: {
        ...state,
        error: `Error selecting tool: ${error instanceof Error ? error.message : String(error)}`,
        processingStage: ProcessingStage.Complete,
      }
    };
  }
}
