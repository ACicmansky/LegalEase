import { z } from "zod";

/**
 * Legal intent categories for classifying user queries
 */
export enum LegalIntentCategory {
  LegalLookup = "legal_lookup",
  DocumentQuestion = "document_question",
  General = "general",
  Procedural = "procedural",
}

/**
 * Legal domain categories
 */
export enum LegalDomain {
  Civil = "civil",
  Criminal = "criminal",
  Administrative = "administrative",
  Commercial = "commercial",
  Other = "other",
}

/**
 * Processing stages for tracking agent progress
 */
export enum ProcessingStage {
  Initial = "initial",
  IntentClassified = "intent_classified",
  EntitiesExtracted = "entities_extracted",
  ToolSelected = "tool_selected",
  LawsRetrieved = "laws_retrieved",
  ContextEnriched = "context_enriched",
  ResponseGenerated = "response_generated",
  GuidanceGenerated = "guidance_generated",
  CitationsFormatted = "citations_formatted",
  Complete = "complete",
}

/**
 * Schema for extracted legal entities
 */
export const extractedEntitiesSchema = z.object({
  laws: z.array(z.object({
    name: z.string(),
    section: z.string().optional(),
  })),
  legalTerms: z.array(z.string()),
  dates: z.array(z.string()),
  procedureTypes: z.array(z.string()),
});

export type ExtractedEntities = z.infer<typeof extractedEntitiesSchema>;

/**
 * Schema for retrieved law content
 */
export const retrievedLawContentSchema = z.array(z.object({
  law: z.string(),
  content: z.string(),
  source: z.string(),
  retrievalDate: z.string(),
}));

export type RetrievedLawContent = z.infer<typeof retrievedLawContentSchema>;

/**
 * Schema for intent classification
 */
export const intentSchema = z.object({
  category: z.nativeEnum(LegalIntentCategory),
  domain: z.nativeEnum(LegalDomain),
  confidence: z.number().min(0).max(1),
});

export type Intent = z.infer<typeof intentSchema>;

/**
 * Schema for legal guidance
 */
export const legalGuidanceSchema = z.object({
  steps: z.array(z.string()),
  relevantLaws: z.array(z.string()),
  timeframe: z.string(),
  risks: z.array(z.string()),
});

export type LegalGuidance = z.infer<typeof legalGuidanceSchema>;

/**
 * Main state schema for the legal agent
 */
export const legalAgentStateSchema = z.object({
  userQuery: z.string(),
  chatId: z.string(),
  userId: z.string().optional(),
  documentId: z.string().optional(),
  intent: intentSchema.optional(),
  extractedEntities: extractedEntitiesSchema.optional(),
  retrievedLawContent: retrievedLawContentSchema.optional(),
  conversationHistory: z.string().optional(),
  documentContext: z.string().optional(),
  response: z.string().optional(),
  guidance: legalGuidanceSchema.optional(),
  sources: z.array(z.object({
    title: z.string(),
    page: z.number().optional(),
    section: z.string().optional(),
    text: z.string().optional(),
  })).optional(),
  processingStage: z.nativeEnum(ProcessingStage),
  error: z.string().optional(),
});

export type LegalAgentState = z.infer<typeof legalAgentStateSchema>;
