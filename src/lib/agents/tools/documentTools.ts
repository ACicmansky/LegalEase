import { Tool } from "@langchain/core/tools";
import { createSupabaseServerClient } from "@/lib/utils/supabase/server";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { BaseDocumentLoader } from "langchain/document_loaders/base";
import { DocumentAnalysis } from '../types';
import { getDocumentById } from "@/lib/services/documentService";
import { createDocumentAnalysis, checkDocumentAnalysisExists, updateDocumentAnalysis } from "@/lib/services/documentAnalysesService";

// Tool for extracting text content from documents
export class DocumentContentExtractor extends Tool {
  name = "document_content_extractor";
  description = "Extracts the text content from a document stored in Supabase storage";

  constructor() {
    super();
  }

  async _call(documentId: string): Promise<string> {
    try {
      // Fetch document metadata from database
      const supabaseClient = await createSupabaseServerClient();
      const document = await getDocumentById(documentId, supabaseClient);

      if (!document) {
        throw new Error(`Document not found`);
      }

      // Get document file from storage
      const { data: userData } = await supabaseClient.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      // List files in the folder to find the document
      const { data: files, error: listError } = await supabaseClient.storage
        .from('documents')
        .list(`${userId}/${documentId}`);

      if (listError || !files || files.length === 0) {
        throw new Error(`No files found for document: ${listError?.message || 'Empty folder'}`);
      }

      // Get the first file (there should only be one per document ID)
      const fileName = files[0].name;
      const filePath = `${userId}/${documentId}/${fileName}`;

      // Download the file
      const { data: fileData, error: downloadError } = await supabaseClient.storage
        .from('documents')
        .download(filePath);

      if (downloadError || !fileData) {
        throw new Error(`Failed to download document: ${downloadError?.message || 'Unknown error'}`);
      }

      // Determine file type and use appropriate loader
      const fileExtension = fileName.split('.').pop()?.toLowerCase();
      let loader: BaseDocumentLoader;

      switch (fileExtension) {
        case 'pdf':
          loader = new PDFLoader(fileData);
          break;
        case 'docx':
          loader = new DocxLoader(fileData);
          break;
        case 'txt':
          loader = new TextLoader(fileData);
          break;
        default:
          throw new Error(`Unsupported file type: ${fileExtension}`);
      }

      // Load and extract text
      const docs = await loader.load();
      const fullText = docs.map(doc => doc.pageContent).join('\n\n');

      if (!fullText.trim()) {
        throw new Error('No text content extracted from document');
      }

      return fullText;
    } catch (error) {
      console.error('Error extracting document content:', error);
      throw new Error(`Failed to extract document content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Tool for storing document analysis results
export class DocumentAnalysisStore extends Tool {
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
