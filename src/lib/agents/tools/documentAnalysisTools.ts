import { Tool } from "@langchain/core/tools";
import { createSupabaseServerClient } from "@/lib/utils/supabase/server";
import { DocumentAnalysis } from '../types';
import { createDocumentAnalysis, checkDocumentAnalysisExists, updateDocumentAnalysis, getDocumentAnalysis } from "@/lib/services/documentAnalysesService";

// Tool for storing document analysis results
export class SetDocumentAnalysisTool extends Tool {
    name = "document_analysis_store";
    description = "Stores the analysis results for a document in the database";

    constructor() {
        super();
    }

    async _call(input: string): Promise<string> {
        try {
            const analysisData = JSON.parse(input) as DocumentAnalysis;
            const { document_id } = analysisData;

            if (!document_id) {
                throw new Error('Document ID is required');
            }

            const supabase = await createSupabaseServerClient();

            // Check if analysis already exists
            const existingAnalysis = await checkDocumentAnalysisExists(document_id, supabase);

            if (existingAnalysis) {
                // Update existing analysis
                const updatedAnalysis = await updateDocumentAnalysis(document_id, analysisData, supabase);

                if (!updatedAnalysis) {
                    throw new Error('Failed to update document analysis');
                }

                return `Successfully updated analysis for document ${document_id}`;
            } else {
                // Create new analysis
                const documentAnalysis = await createDocumentAnalysis(analysisData, supabase);

                if (!documentAnalysis) {
                    throw new Error('Failed to create document analysis');
                }

                return `Successfully stored analysis for document ${document_id}`;
            }
        } catch (error) {
            console.error('Error storing document analysis:', error);
            throw new Error(`Failed to store document analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}

/**
 * Tool for fetching document context
 */
export class GetDocumentAnalysisTool extends Tool {
    name = "document_analysis_fetcher";
    description = "Fetches document analysis and context for a given document ID";

    constructor() {
        super();
    }

    async _call(documentId: string): Promise<string> {
        try {
            if (!documentId) {
                return "No document context available.";
            }

            const supabaseClient = await createSupabaseServerClient();

            const analysis = await getDocumentAnalysis(documentId, supabaseClient);

            if (!analysis) {
                return "Document analysis not found.";
            }

            // Format document context
            return `
DOCUMENT SUMMARY:
${analysis.summary}

KEY INFORMATION:
${JSON.stringify(analysis.key_information, null, 2)}

LEGAL ANALYSIS:
${JSON.stringify(analysis.legal_analysis, null, 2)}
      `;
        } catch (error) {
            console.error('Error fetching document context:', error);
            return "Error fetching document context.";
        }
    }
}