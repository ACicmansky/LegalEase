'use server';

import { EnhancedAgentState, EnhancedProcessingStage } from "./types";
import { analyzeQuery as performQueryAnalysis, QueryAnalysis } from "./queryAnalyzer";
import { generateResponse } from "./reactAgent";

/**
 * Process a legal query through our hybrid LangChain-LangGraph approach
 * 
 * This follows our highly simplified sequential processing pattern:
 * 1. Query Analysis (Intent + Entities in one step)
 * 2. Response Generation with ReAct Agent (using tools as needed)
 * 
 * The ReAct agent decides which tools to use based on the query, including:
 * - Law retrieval via Gemini search
 * - Conversation history retrieval
 * - Document context retrieval
 * 
 * @param query - The user's query text
 * @param chatId - The chat ID for context retrieval
 * @param documentId - Optional document ID if the query is about a specific document
 * @returns Promise with the final processing result
 */
export async function processLegalQuery(
  query: string,
  chatId: string,
  documentId?: string
): Promise<EnhancedAgentState> {
  // Initial state
  const initialState: EnhancedAgentState = {
    chatId,
    messageContent: query,
    documentId,
    processingStage: EnhancedProcessingStage.Started
  };

  try {
    console.log(`[Legal Query] Started processing: "${query.substring(0, 50)}..."`);
    
    // Step 1: Query Analysis (Intent + Entities in one step)
    const analysis: QueryAnalysis = await performQueryAnalysis(query);
    console.log(`[Legal Query] Query analyzed: ${analysis.intent.category} (${analysis.intent.domain}) with confidence ${analysis.intent.confidence}`);
    console.log(`[Legal Query] Entities extracted: ${analysis.entities.laws.length} laws, ${analysis.entities.legalTerms.length} terms`);
    
    const withAnalysis: EnhancedAgentState = {
      ...initialState,
      intent: analysis.intent,
      entities: analysis.entities,
      processingStage: EnhancedProcessingStage.EntitiesExtracted
    };
    
    // Step 2: Response Generation with ReAct Agent
    // The agent will decide which tools to use based on the query
    const withResponse = await generateResponse(
      query, 
      analysis.intent, 
      analysis.entities, 
      withAnalysis
    );
    
    // Final state
    const finalState: EnhancedAgentState = {
      ...withResponse,
      processingStage: EnhancedProcessingStage.Complete
    };
    
    console.log(`[Legal Query] Processing complete`);
    return finalState;
    
  } catch (error) {
    console.error("Error processing legal query:", error);
    return {
      ...initialState,
      processingStage: EnhancedProcessingStage.Error,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      response: "I apologize, but I encountered an error while processing your request. Please try again."
    };
  }
}

/**
 * Simplified API for frontend integration
 * 
 * @param query - The user's query text
 * @param chatId - The chat ID for context retrieval
 * @param documentId - Optional document ID if the query is about a specific document
 * @returns Promise with the response and associated metadata
 */
export async function analyzeQuery(
  query: string,
  chatId: string,
  documentId?: string
) {
  const result = await processLegalQuery(query, chatId, documentId);
  
  return {
    response: result.response || "I couldn't generate a response. Please try again.",
    intent: result.intent,
    entities: result.entities,
    sources: result.sources || [],
    lawsReferenced: result.lawsRetrieved?.map(law => ({ name: law.name, section: law.section })) || [],
    followUpQuestions: result.followUpQuestions || [],
    error: result.error
  };
}
