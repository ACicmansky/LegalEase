import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { BaseDocumentLoader } from "langchain/document_loaders/base";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { TextLoader } from "langchain/document_loaders/fs/text";

import { vectorStore } from "@/lib/vector-store";

export type SupportedFileType = 'pdf' | 'docx' | 'txt';

interface IngestConfig {
  chunkSize?: number;
  chunkOverlap?: number;
}

const DEFAULT_CHUNK_SIZE = 1000;
const DEFAULT_CHUNK_OVERLAP = 200;

const getFileExtension = (filePath: string): SupportedFileType | null => {
  const extension = filePath.split('.').pop()?.toLowerCase();
  if (extension === 'pdf' || extension === 'docx' || extension === 'txt') {
    return extension as SupportedFileType;
  }
  return null;
};

const getLoader = (filePath: string): BaseDocumentLoader => {
  const extension = getFileExtension(filePath);
  
  switch (extension) {
    case 'pdf':
      return new PDFLoader(filePath);
    case 'docx':
      return new DocxLoader(filePath);
    case 'txt':
      return new TextLoader(filePath);
    default:
      throw new Error(`Unsupported file type. Supported types are: pdf, docx, txt`);
  }
};

export async function ingestDocument(
  filePath: string,
  config: IngestConfig = {}
): Promise<{ success: boolean; message: string; chunks?: Document[] }> {
  try {
    // Validate file path
    if (!filePath) {
      throw new Error('File path is required');
    }

    // Get appropriate loader based on file type
    const loader = getLoader(filePath);
    
    // Load document
    const rawDocs = await loader.load();
    
    if (!rawDocs.length) {
      throw new Error('No content found in document');
    }

    // Create text splitter with provided config or defaults
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: config.chunkSize || DEFAULT_CHUNK_SIZE,
      chunkOverlap: config.chunkOverlap || DEFAULT_CHUNK_OVERLAP,
    });

    // Split documents into chunks
    const finalChunks = await splitter.splitDocuments(rawDocs);

    if (!finalChunks.length) {
      throw new Error('Failed to split document into chunks');
    }

    // Store chunks in vector store
    await vectorStore.addDocuments(finalChunks);

    return {
      success: true,
      message: `Successfully processed document with ${finalChunks.length} chunks`,
      chunks: finalChunks,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      message: `Failed to process document: ${errorMessage}`,
    };
  }
}
