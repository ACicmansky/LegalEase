'use server';

import { ConversationIntent, LegalGuidance } from '@/types/chat';
import { getConversationHistoryTool, getDocumentAnalysisTool } from './tools/aiTools';
import { conversationSystemPrompt, guidanceSystemPrompt, createConversationHumanPrompt, createGuidanceHumanPrompt } from './prompts/aiPrompts';
import { getGeminiFlashFromAiSdk } from '@/lib/agents/languageModels';
import { CoreMessage, generateText } from 'ai';
import { ConversationResponse } from './schemas/conversationSchemas';
import { extractJsonFromString } from '@/lib/utils/textProcessing';

/**
 * Process a conversation message and return structured response objects
 * 
 * This is the main entry point for conversation processing. It processes
 * user messages and returns typed objects for the UI.
 * 
 * @param chatId - The ID of the chat
 * @param messageContent - The user's message content
 * @param documentId - Optional document ID for context
 * @returns An object containing the conversation response and potentially legal guidance
 */
export async function processConversation(
  chatId: string,
  messageContent: string,
  documentId?: string,
): Promise<{
  response: ConversationResponse;
  guidance?: LegalGuidance;
}> {
  // Get the structured response as a typed object
  const response = await streamStructuredResponse(
    chatId,
    messageContent,
    documentId,
  );

  let guidance: LegalGuidance | undefined;
  // For legal guidance queries, also return guidance
  if (response.intent.toLocaleLowerCase() === ConversationIntent.LegalGuidance.toLocaleLowerCase()) {
    guidance = await getLegalGuidance(
      chatId,
      messageContent,
      response.text,
      documentId,
    );
  }

  return {
    response,
    guidance
  };
}

/**
 * Stream a structured conversation response with JSON format
 * 
 * @param chatId - The ID of the chat
 * @param messageContent - The user's message
 * @param documentId - Optional document ID for context
 * @param options - Optional streaming options
 * @returns A typed conversation response object
 */
export async function streamStructuredResponse(
  chatId: string,
  messageContent: string,
  documentId?: string,
): Promise<ConversationResponse> {
  try {
    // Step 1: Gather context
    let conversationHistory = "No previous conversation.";
    let documentContext = "No document context available.";

    try {
      conversationHistory = await getConversationHistoryTool.handler({ chatId });

      if (documentId) {
        const documentAnalysis = await getDocumentAnalysisTool.handler({ documentId });
        documentContext = typeof documentAnalysis === 'string'
          ? documentAnalysis
          : JSON.stringify(documentAnalysis);
      }
    } catch (contextError) {
      console.error("Error fetching context:", contextError);
      // Continue with defaults
    }

    // Step 2: Create the human prompt with context
    const humanPrompt = createConversationHumanPrompt(
      messageContent,
      conversationHistory,
      documentContext
    );

    // Step 3: Get the Google Gemini model with search grounding enabled
    const model = await getGeminiFlashFromAiSdk(true);

    // Set up messages for Vercel AI SDK
    const messages: CoreMessage[] = [
      { role: "system", content: conversationSystemPrompt },
      { role: "user", content: humanPrompt }
    ];

    try {
      // Use Vercel AI SDK streamText to create a streaming response
      const stream = await generateText({
        model,
        messages,
        temperature: 0.1
      });

      // Get the text from the stream and parse it as ConversationResponse
      const jsonString = extractJsonFromString(stream.text);
      const parsedResponse = JSON.parse(jsonString);

      if (!parsedResponse || typeof parsedResponse !== 'object') {
        throw new Error("Failed to parse response as JSON");
      }

      return parsedResponse as ConversationResponse;
    } catch (error) {
      console.error('Error generating structured response:', error);
      return {
        text: "Narazil som na chybu pri spracovaní vašej požiadavky. Skúste to znova.",
        intent: ConversationIntent.General,
        followUpQuestions: [],
        sources: []
      };
    }
  } catch (error) {
    console.error("Error streaming structured response:", error);
    return {
      text: "Narazil som na chybu pri spracovaní vašej požiadavky. Skúste to znova.",
      intent: ConversationIntent.General,
      followUpQuestions: [],
      sources: []
    };
  }
}

/**
 * Get legal guidance for a conversation query
 * 
 * @param chatId - The ID of the chat
 * @param messageContent - The user's original message
 * @param initialResponse - The initial response to the query
 * @param documentId - Optional document ID for context
 * @returns A typed legal guidance object
 */
export async function getLegalGuidance(
  chatId: string,
  messageContent: string,
  initialResponse: string,
  documentId?: string,
): Promise<LegalGuidance> {
  try {
    // Step 1: Gather context
    let conversationHistory = "No previous conversation.";
    let documentContext = "No document context available.";

    try {
      conversationHistory = await getConversationHistoryTool.handler({ chatId });

      if (documentId) {
        const documentAnalysis = await getDocumentAnalysisTool.handler({ documentId });
        documentContext = typeof documentAnalysis === 'string'
          ? documentAnalysis
          : JSON.stringify(documentAnalysis);
      }
    } catch (contextError) {
      console.error("Error fetching context:", contextError);
      // Continue with defaults
    }

    // Step 2: Create the guidance prompt with context
    const guidanceHumanPrompt = createGuidanceHumanPrompt(
      messageContent,
      initialResponse,
      conversationHistory,
      documentContext
    );

    // Step 3: Get the Google Gemini model with search grounding enabled
    const model = await getGeminiFlashFromAiSdk(true);

    // Set up messages for Vercel AI SDK
    const messages: CoreMessage[] = [
      { role: "system", content: guidanceSystemPrompt },
      { role: "user", content: guidanceHumanPrompt }
    ];

    try {
      // Use Vercel AI SDK streamText to create a streaming response
      const stream = await generateText({
        model,
        messages,
        temperature: 0.1
      });

      // Get the text from the stream and parse it as LegalGuidance
      const jsonString = extractJsonFromString(stream.text);
      const parsedGuidance = JSON.parse(jsonString);

      if (!parsedGuidance || typeof parsedGuidance !== 'object') {
        throw new Error("Failed to parse guidance as JSON");
      }

      return parsedGuidance as LegalGuidance;
    } catch (error) {
      console.error('Error generating legal guidance:', error);
      return {
        steps: ["Nastala chyba pri spracovaní podrobného usmernenia."],
        relevantLaws: [],
        timeframe: "Neurčené",
        risks: ["Nie je možné analyzovať riziká kvôli chybe spracovania"]
      };
    }
  } catch (error) {
    console.error("Error streaming legal guidance:", error);
    return {
      steps: ["Nastala chyba pri spracovaní podrobného usmernenia."],
      relevantLaws: [],
      timeframe: "Neurčené",
      risks: ["Nie je možné analyzovať riziká kvôli chybe spracovania"]
    };
  }
}