import { z } from 'zod';
import { ConversationIntent, MessageType } from "@/types/chat";

/**
 * Schema for message sources referenced in responses
 * Used to provide attribution for information sources
 */
export const messageSourceSchema = z.object({
  title: z.string().describe("Title of the information source"),
  url: z.string().url().optional().describe("URL of the information source if available"),
  snippet: z.string().optional().describe("Relevant text snippet from the source"),
  relevance: z.number().min(0).max(1).optional().describe("Relevance score of the source (0-1)")
});

export type MessageSource = z.infer<typeof messageSourceSchema>;

/**
 * Schema for structured conversation response
 * Contains the main response text, detected intent, sources, and follow-up questions
 */
export const conversationResponseSchema = z.object({
  text: z.string().describe("The response text to the user's query"),
  intent: z.nativeEnum(ConversationIntent).describe("The detected intent of the query"),
  sources: z.array(messageSourceSchema).describe("Sources used in the response"),
  followUpQuestions: z.array(z.string()).describe("Suggested follow-up questions"),
  confidence: z.number().min(0).max(1).optional().describe("Confidence score for the intent classification (0-1)")
});

export type ConversationResponse = z.infer<typeof conversationResponseSchema>;

/**
 * Schema for legal references
 * Used to reference specific laws and regulations
 */
export const legalReferenceSchema = z.object({
  title: z.string().describe("Title or name of the law or regulation"),
  identifier: z.string().optional().describe("Official identifier or reference number of the law"),
  section: z.string().optional().describe("Specific section or paragraph"),
  url: z.string().url().optional().describe("URL to the official text if available"),
  relevance: z.string().optional().describe("Brief explanation of why this law is relevant")
});

export type LegalReference = z.infer<typeof legalReferenceSchema>;

/**
 * Schema for structured legal guidance
 * Provides step-by-step guidance, relevant laws, timeframes, and risk analysis
 */
export const legalGuidanceSchema = z.object({
  steps: z.array(z.string()).describe("Step-by-step guidance for the legal query"),
  relevantLaws: z.array(legalReferenceSchema).describe("Relevant laws and regulations with detailed information"),
  timeframe: z.string().describe("Estimated timeframe for the legal process"),
  risks: z.array(z.object({
    description: z.string().describe("Description of the potential risk"),
    severity: z.enum(["LOW", "MEDIUM", "HIGH"]).describe("Severity level of the risk"),
    mitigation: z.string().optional().describe("Possible mitigation strategy")
  })).describe("Potential risks or complications with severity assessment")
});

export type LegalGuidance = z.infer<typeof legalGuidanceSchema>;

/**
 * Schema for conversation message
 * Represents a single message in the conversation history
 */
export const conversationMessageSchema = z.object({
  id: z.string().uuid().optional(),
  chatId: z.string().uuid(),
  type: z.nativeEnum(MessageType),
  content: z.string(),
  createdAt: z.date().optional(),
  metadata: z.record(z.any()).optional()
});

export type ConversationMessage = z.infer<typeof conversationMessageSchema>;

/**
 * Schema for document analysis results
 * Contains extracted document information and analysis
 */
export const documentAnalysisSchema = z.object({
  documentId: z.string().uuid(),
  title: z.string().optional(),
  summary: z.string().describe("Brief summary of the document content"),
  keyPoints: z.array(z.string()).describe("Key points extracted from the document"),
  entities: z.array(z.object({
    name: z.string().describe("Name of the entity"),
    type: z.string().describe("Type of entity (person, organization, date, etc.)"),
    mentions: z.array(z.object({
      text: z.string(),
      position: z.number().optional()
    }))
  })).optional(),
  legalContext: z.string().optional().describe("Legal context extracted from the document"),
  analysisDate: z.date().optional()
});

export type DocumentAnalysis = z.infer<typeof documentAnalysisSchema>;
