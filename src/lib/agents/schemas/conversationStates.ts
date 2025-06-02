import { z } from 'zod';
import { ConversationIntent } from '@/types/chat';
import { LegalGuidance, MessageSource } from './conversationSchemas';

/**
 * Enum representing the different stages of conversation processing
 */
export enum ConversationProcessingStage {
  Started = 'started',
  ContextGathered = 'context_gathered',
  ResponseGenerated = 'response_generated',
  GuidanceGenerated = 'guidance_generated',
  Complete = 'complete',
  Error = 'error'
}

/**
 * Schema for conversation state
 * Tracks the processing state and results during the conversation flow
 */
export const conversationStateSchema = z.object({
  chatId: z.string().uuid(),
  messageContent: z.string(),
  documentId: z.string().uuid().optional(),
  processingStage: z.nativeEnum(ConversationProcessingStage),

  // Optional state properties that get populated during processing
  conversationHistory: z.string().optional(),
  documentContext: z.string().optional(),

  // Response data
  response: z.string().optional(),
  intent: z.nativeEnum(ConversationIntent).optional(),
  sources: z.array(z.custom<MessageSource>()).optional(),
  followUpQuestions: z.array(z.string()).optional(),

  // Guidance data
  guidance: z.custom<LegalGuidance>().optional(),

  // Error information
  error: z.string().optional(),

  // Tracking metadata
  startTime: z.date().optional(),
  endTime: z.date().optional(),
  processingTime: z.number().optional() // in milliseconds
});

export type ConversationState = z.infer<typeof conversationStateSchema>;


/**
 * Response schema for conversation processing
 * The final output format returned to the client
 */
export const conversationCompletionSchema = z.object({
  success: z.boolean(),
  messageId: z.string().uuid().optional(),
  response: z.string().optional(),
  intent: z.nativeEnum(ConversationIntent).optional(),
  followUpQuestions: z.array(z.string()).optional(),
  sources: z.array(z.custom<MessageSource>()).optional(),
  guidance: z.custom<LegalGuidance>().optional(),
  error: z.string().optional(),
  processingTime: z.number().optional()
});

export type ConversationCompletion = z.infer<typeof conversationCompletionSchema>;
