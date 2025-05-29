import { ConversationIntent, MessageSource } from '@/types/chat';
import { z } from 'zod';

/**
 * Zod schemas for validating LLM output
 */

// Intent classification schema
export const intentClassificationSchema = z.object({
  category: z.enum([
    ConversationIntent.DocumentQuestion,
    ConversationIntent.LegalGuidance,
    ConversationIntent.Clarification,
    ConversationIntent.General
  ]),
  domain: z.enum(['civil', 'criminal', 'administrative', 'commercial', 'other']),
  confidence: z.number().min(0).max(1),
  reasoning: z.string()
});

// Law schema
export const extractedLawSchema = z.object({
  name: z.string().describe('Name or number of the law'),
  section: z.string().optional().describe('Specific section if applicable'),
  description: z.string().optional().describe('Brief description of what the law covers')
});

// Law content schema
export const lawContentSchema = z.object({
  name: z.string().describe('Identifier for the law'),
  section: z.string().optional().describe('Specific section if applicable'),
  content: z.string().describe('Full text content of the law/section'),
  source: z.string().describe('Source URL or description'),
  retrievalDate: z.string().describe('When the law was retrieved'),
  attribution: z.string().optional().describe('Attribution information (especially for search results)')
});

// Response generation schema
export const responseGenerationSchema = z.object({
  text: z.string(),
  sources: z.array(
    z.object({
      title: z.string(),
      page: z.number().optional(),
      section: z.string().optional(),
      text: z.string().optional()
    })
  ),
  followUpQuestions: z.array(z.string()).optional()
});

// Legal guidance schema
export const legalGuidanceSchema = z.object({
  steps: z.array(z.string()),
  relevantLaws: z.array(z.string()),
  timeframe: z.string(),
  risks: z.array(z.string())
});

// Combined schema for query analysis (intent + entities)
export const queryAnalysisSchema = z.object({
  intent: intentClassificationSchema,
  laws: z.array(extractedLawSchema)
});

/**
 * Processing stages for the enhanced agent
 */
export enum EnhancedProcessingStage {
  Started = 'started',
  IntentClassified = 'intent_classified',
  EntitiesExtracted = 'entities_extracted',
  LawsRetrieved = 'laws_retrieved',
  ContextGathered = 'context_gathered',
  ResponseGenerated = 'response_generated',
  GuidanceGenerated = 'guidance_generated',
  Complete = 'complete',
  Error = 'error'
}

/**
 * TypeScript types derived from Zod schemas
 */

/**
 * Intent classification result
 */
export type IntentClassification = z.infer<typeof intentClassificationSchema>;

/**
 * Extracted law content from query or document
 */
export type ExtractedLaw = z.infer<typeof extractedLawSchema>;

/**
 * Law content structure for storage and retrieval
 */
export type LawContent = z.infer<typeof lawContentSchema>;

/**
 * Query analysis result combining intent and entities
 */
export type QueryAnalysis = z.infer<typeof queryAnalysisSchema>;

/**
 * Response generation result
 */
export type ResponseGeneration = z.infer<typeof responseGenerationSchema>;

/**
 * Legal guidance structure
 */
export type LegalGuidanceType = z.infer<typeof legalGuidanceSchema>;

/**
 * Enhanced agent state for tracking processing
 */
export interface EnhancedAgentState {
  // Input information
  chatId: string;
  messageContent: string;
  documentId?: string;

  // Processing metadata
  processingStage: EnhancedProcessingStage;

  // Classification results
  intent?: IntentClassification;
  laws?: ExtractedLaw[];

  // Retrieved content
  lawsRetrieved?: LawContent[];
  conversationHistory?: string;
  documentContext?: string;

  // Output content
  response?: string;
  sources?: MessageSource[];
  guidance?: LegalGuidanceType;
  followUpQuestions?: string[];

  // Error handling
  error?: string;
}
