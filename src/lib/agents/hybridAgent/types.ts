'use server';

import { ConversationIntent, LegalGuidance, MessageSource } from '@/types/chat';
import { z } from 'zod';

/**
 * Legal entity types for extraction from user queries
 */
export interface LegalEntities {
  // Laws and legal codes referenced
  laws: Array<{
    name: string;         // Name or number of the law
    section?: string;     // Specific section if applicable
    description?: string; // Brief description of what the law covers
  }>;
  
  // Legal terminology used in the query
  legalTerms: Array<{
    term: string;         // The legal term
    context?: string;     // Context in which it was used
  }>;
  
  // Dates mentioned (deadlines, effective dates, etc)
  dates: Array<{
    date: string;         // The date or timeframe
    description: string;  // What this date represents
  }>;
  
  // Procedural elements (filings, applications, etc)
  procedureTypes: Array<{
    name: string;         // Name of the procedure
    description: string;  // What the procedure involves
  }>;
}

/**
 * Intent classification result
 */
export interface IntentClassification {
  // Primary intent category
  category: ConversationIntent;
  
  // Legal domain for the query
  domain: 'civil' | 'criminal' | 'administrative' | 'commercial' | 'other';
  
  // Confidence score (0-1)
  confidence: number;
  
  // Reasoning for the classification
  reasoning: string;
}

/**
 * Law content structure for storage and retrieval
 */
export interface LawContent {
  // Identifier for the law
  name: string;
  
  // Specific section if applicable
  section?: string;
  
  // Full text content of the law/section
  content: string;
  
  // Source URL or description
  source: string;
  
  // When the law was retrieved
  retrievalDate: string;
  
  // Attribution information (especially for search results)
  attribution?: string;
}

/**
 * Database schema for cached law content
 */
export interface StoredLaw {
  id: string;                 // UUID primary key
  name: string;               // Law name/number
  section?: string;           // Specific section if applicable
  content: string;            // Full text content of the law/section
  source_url: string;         // URL where the law was retrieved from
  last_updated: Date;         // When the law was last updated in our system
  last_verified: Date;        // When we last verified against source
  version_identifier?: string; // Official version identifier if available
  is_current: boolean;        // Whether this is the current version
  search_query: string;       // The original search query used
  gemini_attribution?: string; // Attribution information from Gemini
}

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
  entities?: LegalEntities;
  
  // Retrieved content
  lawsRetrieved?: LawContent[];
  conversationHistory?: string;
  documentContext?: string;
  
  // Output content
  response?: string;
  sources?: MessageSource[];
  guidance?: LegalGuidance;
  followUpQuestions?: string[];
  
  // Error handling
  error?: string;
}

/**
 * Zod schema for intent classification
 */
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

/**
 * Zod schema for legal entities
 */
export const legalEntitiesSchema = z.object({
  laws: z.array(
    z.object({
      name: z.string(),
      section: z.string().optional(),
      description: z.string().optional()
    })
  ),
  legalTerms: z.array(
    z.object({
      term: z.string(),
      context: z.string().optional()
    })
  ),
  dates: z.array(
    z.object({
      date: z.string(),
      description: z.string()
    })
  ),
  procedureTypes: z.array(
    z.object({
      name: z.string(),
      description: z.string()
    })
  )
});

/**
 * Zod schema for law content
 */
export const lawContentSchema = z.object({
  name: z.string(),
  section: z.string().optional(),
  content: z.string(),
  source: z.string(),
  retrievalDate: z.string(),
  attribution: z.string().optional()
});

/**
 * Zod schema for response generation
 */
export const responseSchema = z.object({
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

/**
 * Zod schema for legal guidance
 */
export const legalGuidanceSchema = z.object({
  steps: z.array(z.string()),
  relevantLaws: z.array(z.string()),
  timeframe: z.string(),
  risks: z.array(z.string())
});
