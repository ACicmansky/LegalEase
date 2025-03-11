const API_BASE = '/api';

/**
 * Interface for document analysis response
 */
interface DocumentAnalysisResponse {
  success: boolean;
  documentId: string;
  processingStage: string;
  summary?: string;
  error?: string;
}

/**
 * Service for document analysis operations
 */
export class DocumentAnalyzeService {
  /**
   * Analyze a document by its ID
   * @param documentId The ID of the document to analyze
   * @returns Promise with the analysis results
   */
  static async analyzeDocument(documentId: string): Promise<DocumentAnalysisResponse> {
    try {
      const response = await fetch(`${API_BASE}/documents/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to analyze document: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in document analysis service:', error);
      return {
        success: false,
        documentId,
        processingStage: 'Error',
        error: error instanceof Error ? error.message : 'Unknown error occurred during document analysis',
      };
    }
  }
}