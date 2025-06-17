'use server';

import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  DocumentState,
  ProcessingStage,
  KeyInformation,
  LegalAnalysis,
  ConsistencyCheck,
  DocumentAnalysis
} from "./types";
import { DocumentContentExtractorTool } from "./tools/documentTools";
import { SetDocumentAnalysisTool } from "./tools/documentAnalysisTools";
import { extractKeyInformationPrompt, performLegalAnalysisPrompt, checkConsistencyPrompt, generateSummaryPrompt } from "@/lib/agents/prompts/documentProcessingAgentPrompts";
import { extractJsonFromString } from "@/lib/utils/textProcessing";
import { getModelFlashLite } from "@/lib/agents/languageModels";

// Create a model instance
const model = await getModelFlashLite(0.1);

// Initialize tools
const documentContentExtractor = new DocumentContentExtractorTool();
const documentAnalysisStore = new SetDocumentAnalysisTool();

/**
 * Process a document through a series of analysis steps
 * 
 * This function processes legal documents through the following steps:
 * 1. Extract content from the document
 * 2. Extract key information
 * 3. Perform legal analysis
 * 4. Check consistency
 * 5. Generate summary
 * 6. Store results
 * 
 * @param documentId - The ID of the document to process
 * @param documentName - The name of the document
 * @returns A promise that resolves to the final document state
 */
export async function processDocument(documentId: string, documentName: string): Promise<DocumentState> {
  // Initial state
  const initialState: DocumentState = {
    documentId,
    documentName,
    documentContent: "",
    processingStage: ProcessingStage.Started
  };

  try {
    // Step 1: Extract content
    console.debug(initialState.processingStage);
    const contentState = await extractContent(initialState);
    if (contentState.processingStage === ProcessingStage.Error) {
      return contentState;
    }

    // Step 2: Extract key information
    console.debug(contentState.processingStage);
    const keyInfoState = await extractKeyInformation(contentState);
    if (keyInfoState.processingStage === ProcessingStage.Error) {
      return keyInfoState;
    }

    // Step 3: Perform legal analysis
    console.debug(keyInfoState.processingStage);
    const legalAnalysisState = await performLegalAnalysis(keyInfoState);
    if (legalAnalysisState.processingStage === ProcessingStage.Error) {
      return legalAnalysisState;
    }

    // Step 4: Check consistency
    console.debug(legalAnalysisState.processingStage);
    const consistencyState = await checkConsistency(legalAnalysisState);
    if (consistencyState.processingStage === ProcessingStage.Error) {
      return consistencyState;
    }

    // Step 5: Generate summary
    console.debug(consistencyState.processingStage);
    const summaryState = await generateSummary(consistencyState);
    if (summaryState.processingStage === ProcessingStage.Error) {
      return summaryState;
    }

    // Step 6: Store results
    console.debug(summaryState.processingStage);
    const finalState = await storeResults(summaryState);
    return finalState;

  } catch (error) {
    console.error("Error processing document:", error);
    return {
      ...initialState,
      error: error instanceof Error ? error.message : "Unknown error processing document",
      processingStage: ProcessingStage.Error
    };
  }
}



/**
 * Extract content from a document
 */
async function extractContent(state: DocumentState): Promise<DocumentState> {
  try {
    // Use document content extractor tool
    const content = await documentContentExtractor.invoke(state.documentId);

    return {
      ...state,
      documentContent: content,
      processingStage: ProcessingStage.ContentExtracted
    };
  } catch (error) {
    console.error("Error extracting document content:", error);
    return {
      ...state,
      error: error instanceof Error ? error.message : "Error extracting document content",
      processingStage: ProcessingStage.Error
    };
  }
}

/**
 * Extract key information from document content
 */
async function extractKeyInformation(state: DocumentState): Promise<DocumentState> {
  try {
    // Prepare the prompt
    const chainResult = await extractKeyInformationPrompt
      .pipe(model)
      .pipe(new StringOutputParser())
      .invoke({
        documentContent: state.documentContent,
        agent_scratchpad: []
      });

    // Extract and parse the JSON result
    const jsonString = extractJsonFromString(chainResult);
    const keyInformation = JSON.parse(jsonString) as KeyInformation;

    return {
      ...state,
      keyInformation,
      processingStage: ProcessingStage.InformationExtracted
    };
  } catch (error) {
    console.error("Error extracting key information:", error);
    return {
      ...state,
      error: error instanceof Error ? error.message : "Error extracting key information",
      processingStage: ProcessingStage.Error
    };
  }
}

/**
 * Perform legal analysis on the document
 */
async function performLegalAnalysis(state: DocumentState): Promise<DocumentState> {
  try {
    // Prepare the prompt
    const chainResult = await performLegalAnalysisPrompt
      .pipe(model)
      .pipe(new StringOutputParser())
      .invoke({
        documentContent: state.documentContent,
        keyInformation: JSON.stringify(state.keyInformation),
        agent_scratchpad: []
      });

    // Extract and parse the JSON result
    const jsonString = extractJsonFromString(chainResult);
    const legalAnalysis = JSON.parse(jsonString) as LegalAnalysis;

    return {
      ...state,
      legalAnalysis,
      processingStage: ProcessingStage.LegalAnalysisComplete
    };
  } catch (error) {
    console.error("Error performing legal analysis:", error);
    return {
      ...state,
      error: error instanceof Error ? error.message : "Error performing legal analysis",
      processingStage: ProcessingStage.Error
    };
  }
}

/**
 * Check document consistency
 */
async function checkConsistency(state: DocumentState): Promise<DocumentState> {
  try {
    // Prepare the prompt
    const chainResult = await checkConsistencyPrompt
      .pipe(model)
      .pipe(new StringOutputParser())
      .invoke({
        documentContent: state.documentContent,
        keyInformation: JSON.stringify(state.keyInformation),
        legalAnalysis: JSON.stringify(state.legalAnalysis),
        agent_scratchpad: []
      });

    // Extract and parse the JSON result
    const jsonString = extractJsonFromString(chainResult);
    const consistencyChecks = JSON.parse(jsonString) as ConsistencyCheck[];

    return {
      ...state,
      consistencyChecks,
      processingStage: ProcessingStage.ConsistencyChecked
    };
  } catch (error) {
    console.error("Error checking consistency:", error);
    return {
      ...state,
      error: error instanceof Error ? error.message : "Error checking consistency",
      processingStage: ProcessingStage.Error
    };
  }
}

/**
 * Generate a summary of the document
 */
async function generateSummary(state: DocumentState): Promise<DocumentState> {
  try {
    // Prepare the prompt
    const chainResult = await generateSummaryPrompt
      .pipe(model)
      .pipe(new StringOutputParser())
      .invoke({
        documentContent: state.documentContent,
        keyInformation: JSON.stringify(state.keyInformation),
        legalAnalysis: JSON.stringify(state.legalAnalysis),
        consistencyChecks: JSON.stringify(state.consistencyChecks),
        agent_scratchpad: []
      });

    return {
      ...state,
      summary: chainResult,
      processingStage: ProcessingStage.SummaryGenerated
    };
  } catch (error) {
    console.error("Error generating summary:", error);
    return {
      ...state,
      error: error instanceof Error ? error.message : "Error generating summary",
      processingStage: ProcessingStage.Error
    };
  }
}

/**
 * Store analysis results
 */
async function storeResults(state: DocumentState): Promise<DocumentState> {
  try {
    // Prepare the data to store in the correct database format
    const analysisData: DocumentAnalysis = {
      document_id: state.documentId,
      key_information: state.keyInformation!,
      legal_analysis: state.legalAnalysis!,
      consistency_checks: state.consistencyChecks!,
      summary: state.summary!
    };

    // Store the results
    await documentAnalysisStore.invoke(JSON.stringify(analysisData));

    return {
      ...state,
      processingStage: ProcessingStage.Complete
    };
  } catch (error) {
    console.error("Error storing results:", error);
    return {
      ...state,
      error: error instanceof Error ? error.message : "Error storing results",
      processingStage: ProcessingStage.Error
    };
  }
}
