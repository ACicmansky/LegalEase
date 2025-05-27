'use server';

import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  ConversationState,
  ConversationProcessingStage
} from "./types";
import { ConversationIntent, LegalGuidance, MessageSource } from "@/types/chat";
import { GetConversationHistoryTool } from "./tools/conversationTools";
import { GetDocumentAnalysisTool } from "./tools/documentAnalysisTools";
import { conversationPrompt, guidancePrompt } from "./prompts/conversationalAgentPrompts";
import { extractJsonFromString } from "@/lib/utils/textProcessing";
import { getModelFlash } from "@/lib/agents/languageModels";

// Create a model instance
const model = await getModelFlash();

// Initialize tools
const conversationHistoryFetcher = new GetConversationHistoryTool();
const documentContextFetcher = new GetDocumentAnalysisTool();

/**
 * Process a conversation message through a series of steps
 * 
 * This function processes user messages through the following steps:
 * 1. Gather context (conversation history and document context)
 * 2. Generate a response with intent classification
 * 3. Generate additional legal guidance for guidance intents
 * 
 * @param chatId - The ID of the chat
 * @param messageContent - The user's message
 * @param documentId - Optional document ID for context
 * @returns A promise that resolves to the final conversation state
 * 
 * @deprecated Use new hybrid agent instead
 */
export async function processConversation(
  chatId: string,
  messageContent: string,
  documentId?: string
): Promise<ConversationState> {
  // Initial state
  const initialState: ConversationState = {
    chatId,
    messageContent,
    documentId,
    processingStage: ConversationProcessingStage.Started
  };

  try {
    // Process conversation through a series of steps
    console.debug(initialState.processingStage);
    const withContext = await gatherContext(initialState);

    console.debug(withContext.processingStage);
    const withResponse = await generateResponse(withContext);

    console.debug(withResponse.processingStage);
    const finalState = await generateGuidance(withResponse);
    console.debug(finalState.processingStage);

    // Return the final state
    return {
      ...finalState,
      processingStage: ConversationProcessingStage.Complete
    };
  } catch (error) {
    console.error("Error processing conversation:", error);
    return {
      ...initialState,
      processingStage: ConversationProcessingStage.Error,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

/**
 * Gathers context for the conversation from various sources
 */
async function gatherContext(state: ConversationState): Promise<ConversationState> {
  try {
    // Fetch conversation history
    const conversationHistory = await conversationHistoryFetcher.invoke(state.chatId);

    // Fetch document context if available
    let documentContext = "";
    if (state.documentId) {
      documentContext = await documentContextFetcher.invoke(state.documentId);
    }

    // Update state with gathered context
    return {
      ...state,
      conversationHistory,
      documentContext,
      processingStage: ConversationProcessingStage.ContextGathered
    };
  } catch (error) {
    console.error("Error gathering context:", error);
    throw new Error(`Failed to gather context: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Generates a response based on the user's message and context
 */
async function generateResponse(state: ConversationState): Promise<ConversationState> {
  try {
    // Use conversation prompt to generate a response
    const chainResult = await conversationPrompt
      .pipe(model)
      .pipe(new StringOutputParser())
      .invoke({
        message: state.messageContent,
        conversationHistory: state.conversationHistory || "No previous conversation.",
        documentContext: state.documentContext || "No document context available.",
        agent_scratchpad: [] // Required placeholder for the prompt template
      });

    // Extract and parse JSON from the 
    const jsonString = extractJsonFromString(chainResult);
    const parsedResponse = JSON.parse(jsonString);

    if (!parsedResponse || typeof parsedResponse !== 'object') {
      throw new Error("Failed to parse response as JSON");
    }

    // Extract components from the response
    const {
      text = "I'm sorry, I couldn't process your request.",
      intent = ConversationIntent.General,
      sources = [],
      followUpQuestions = []
    } = parsedResponse as {
      text: string;
      intent: ConversationIntent;
      sources: MessageSource[];
      followUpQuestions: string[];
    };

    // Update state with response information
    return {
      ...state,
      response: text,
      intent,
      sources,
      followUpQuestions,
      processingStage: ConversationProcessingStage.ResponseGenerated
    };
  } catch (error) {
    console.error("Error generating response:", error);
    throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Generates additional legal guidance if the intent is legal guidance
 */
async function generateGuidance(state: ConversationState): Promise<ConversationState> {
  // Only generate guidance for legal guidance intent
  if (state.intent !== ConversationIntent.LegalGuidance) {
    return {
      ...state,
      processingStage: ConversationProcessingStage.Complete
    };
  }

  try {
    // Use guidance prompt to generate structured legal guidance
    const guidanceResult = await guidancePrompt
      .pipe(model)
      .pipe(new StringOutputParser())
      .invoke({
        message: state.messageContent,
        conversationHistory: state.conversationHistory || "No previous conversation.",
        documentContext: state.documentContext || "No document context available.",
        initialResponse: state.response || "",
        agent_scratchpad: [] // Required placeholder for the prompt template
      });

    // Extract and parse JSON from the guidance response
    const jsonString = extractJsonFromString(guidanceResult);
    const parsedGuidance = JSON.parse(jsonString);

    if (!parsedGuidance || typeof parsedGuidance !== 'object') {
      throw new Error("Failed to parse guidance as JSON");
    }

    // Extract guidance components
    const {
      steps = [],
      relevantLaws = [],
      timeframe = "",
      risks = []
    } = parsedGuidance as LegalGuidance;

    // Create structured legal guidance
    const guidance: LegalGuidance = {
      steps,
      relevantLaws,
      timeframe,
      risks
    };

    // Update state with guidance information
    return {
      ...state,
      guidance,
      processingStage: ConversationProcessingStage.GuidanceGenerated
    };
  } catch (error) {
    console.error("Error generating guidance:", error);
    // Continue without guidance rather than failing the entire process
    return {
      ...state,
      processingStage: ConversationProcessingStage.Complete
    };
  }
}
