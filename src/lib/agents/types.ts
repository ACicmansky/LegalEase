// Agent and state types for the document processing system

// Document Analysis State
export interface DocumentState {
  documentId: string;
  documentContent: string;
  documentName: string;
  
  // Analysis results
  keyInformation?: KeyInformation;
  legalAnalysis?: LegalAnalysis;
  consistencyChecks?: ConsistencyCheck[];
  summary?: string;
  
  // Processing metadata
  processingStage: ProcessingStage;
  error?: string;
}

// Processing stages for document analysis
export enum ProcessingStage {
  Started = 'started',
  ContentExtracted = 'content_extracted',
  InformationExtracted = 'information_extracted',
  LegalAnalysisComplete = 'legal_analysis_complete',
  ConsistencyChecked = 'consistency_checked',
  SummaryGenerated = 'summary_generated',
  Complete = 'complete',
  Error = 'error'
}

// Structured representation of key information found in the document
export interface KeyInformation {
  parties: Party[];
  dates: DocumentDate[];
  obligations: Obligation[];
  terms: Term[];
  monetaryValues: MonetaryValue[];
}

// Types for structured legal information
export interface Party {
  name: string;
  role: string;
  description?: string;
}

export interface DocumentDate {
  description: string;
  date: string;
  significance: string;
}

export interface Obligation {
  party: string;
  description: string;
  condition?: string;
  deadline?: string;
}

export interface Term {
  name: string;
  definition: string;
  section?: string;
}

export interface MonetaryValue {
  amount: string;
  currency: string;
  description: string;
}

// Legal analysis of the document
export interface LegalAnalysis {
  documentType: string;
  jurisdiction?: string;
  governingLaw?: string;
  relevantLaws: RelevantLaw[];
  riskAssessment?: RiskAssessment[];
}

export interface RelevantLaw {
  name: string;
  description: string;
  relevance: string;
  reference?: string;
}

export interface RiskAssessment {
  risk: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  recommendation?: string;
}

// Consistency check results
export interface ConsistencyCheck {
  issueType: 'inconsistency' | 'ambiguity' | 'omission';
  description: string;
  location?: string;
  severity: 'low' | 'medium' | 'high';
  recommendation?: string;
}

// Database types

/**
 * Document analysis record structure matching the database schema
 */
export interface DocumentAnalysisRecord {
  id?: string;                    // UUID, auto-generated
  document_id: string;            // Foreign key to documents table
  key_information: KeyInformation;
  legal_analysis: LegalAnalysis;
  consistency_checks: ConsistencyCheck[];
  summary: string;
  created_at?: string;            // Timestamp with time zone, auto-generated
  updated_at?: string;            // Timestamp with time zone, auto-generated
}

import { ConversationIntent, LegalGuidance, MessageSource } from '@/types/chat';

/**
 * Processing stages for conversation
 */
export enum ConversationProcessingStage {
  Started = 'started',
  ContextGathered = 'context_gathered',
  IntentDetermined = 'intent_determined',
  ResponseGenerated = 'response_generated',
  GuidanceGenerated = 'guidance_generated',
  Complete = 'complete',
  Error = 'error'
}

/**
 * Conversation state for tracking processing
 */
export interface ConversationState {
  chatId: string;
  messageContent: string;
  documentId?: string;
  processingStage: ConversationProcessingStage;
  conversationHistory?: string;
  documentContext?: string;
  response?: string;
  intent?: ConversationIntent;
  sources?: MessageSource[];
  guidance?: LegalGuidance;
  followUpQuestions?: string[];
  error?: string;
}
