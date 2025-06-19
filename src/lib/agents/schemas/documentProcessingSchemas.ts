/**
 * Type definitions for document processing workflow
 */

export interface DocumentProcessingResult {
  anonymizedContent: string;
  keyInformation: KeyInformation;
  legalAnalysis: LegalAnalysis; 
  consistencyChecks: ConsistencyIssue[];
  detailedAnalysis: DetailedAnalysis;
  simplifiedSummary: string;
}

export interface ProcessingStageResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface KeyInformation {
  parties: Party[];
  dates: DateInfo[];
  obligations: Obligation[];
  terms: Term[];
  monetaryValues: MonetaryValue[];
}

export interface Party {
  name: string;
  role: string;
  description?: string;
}

export interface DateInfo {
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

export interface LegalAnalysis {
  documentType: string;
  jurisdiction: string;
  governingLaw: string;
  relevantLaws: RelevantLaw[];
  riskAssessment: RiskAssessment[];
}

export interface RelevantLaw {
  name: string;
  description: string;
  relevance: string;
  reference?: string;
}

export interface RiskAssessment {
  risk: string;
  severity: "low" | "medium" | "high";
  description: string;
  recommendation?: string;
}

export interface ConsistencyIssue {
  issueType: "inconsistency" | "ambiguity" | "omission";
  description: string;
  location?: string;
  severity: "low" | "medium" | "high";
  recommendation?: string;
}

export interface DetailedAnalysis {
  legalOpinion: string;
  proposedModifications: ProposedModification[];
  legalActionRecommendations: LegalActionRecommendation[];
  riskAssessment: DetailedRiskAssessment[];
}

export interface ProposedModification {
  provision: string;
  currentText: string;
  proposedText: string;
  justification: string;
}

export interface LegalActionRecommendation {
  action: string;
  timeline: string;
  priority: "high" | "medium" | "low";
  reasoning: string;
}

export interface DetailedRiskAssessment {
  risk: string;
  severity: "high" | "medium" | "low";
  probability: "high" | "medium" | "low";
  mitigation: string;
}
