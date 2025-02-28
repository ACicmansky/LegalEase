'use server';

import { createSupabaseServerClient } from "@/utils/supabase/server";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { BaseDocumentLoader } from "langchain/document_loaders/base";
import { TextLoader } from "langchain/document_loaders/fs/text";

import { vectorStore } from "@/utils/supabase/server";

export type SupportedFileType = 'pdf' | 'docx' | 'txt';

interface IngestConfig {
  chunkSize?: number;
  chunkOverlap?: number;
}

interface IngestResult {
  success: boolean;
  message: string;
}

const DEFAULT_CHUNK_SIZE = 1000;
const DEFAULT_CHUNK_OVERLAP = 200;

const getFileExtension = (filename: string): SupportedFileType | null => {
  const extension = filename.split('.').pop()?.toLowerCase();
  if (extension === 'pdf' || extension === 'docx' || extension === 'txt') {
    return extension as SupportedFileType;
  }
  return null;
};

const getLoader = async (input: string | File | Blob): Promise<BaseDocumentLoader> => {
  let extension: SupportedFileType | null;

  if (input instanceof File || input instanceof Blob) {
    extension = getFileExtension(input instanceof File ? input.name : 'document.pdf');

    switch (extension) {
      case 'pdf':
        return new WebPDFLoader(input);
      case 'docx':
        throw new Error('DOCX files are not supported in browser environment yet');
      case 'txt':
        return new TextLoader(input);
      default:
        throw new Error(`Unsupported file type. Supported types are: pdf, txt`);
    }
  } else {
    extension = getFileExtension(input);

    switch (extension) {
      case 'pdf':
        return new PDFLoader(input);
      case 'docx':
        return new DocxLoader(input);
      case 'txt':
        return new TextLoader(input);
      default:
        throw new Error(`Unsupported file type. Supported types are: pdf, docx, txt`);
    }
  }
};

export async function ingestDocument(
  id: string,
  input: string | File | Blob,
  config: IngestConfig = {}
): Promise<IngestResult> {
  try {    
    // Validate input
    if (!input) {
      throw new Error('Input is required');
    }

    // Get appropriate loader based on input type
    const loader = await getLoader(input);

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

    // Assign document ID and user_id to each chunk
    for (const chunk of finalChunks) {
      chunk.metadata = {
        ...chunk.metadata,
        document_id: id
      };
    }

    // Store chunks in vector store
    const vector = await vectorStore();
    const result = await vector.addDocuments(finalChunks);

    if (result) {
      // Create document record in Supabase with user_id
      const { data: document, error: documentError } = await (await createSupabaseServerClient())
        .from('documents')
        .insert({
          id,
          name: input instanceof File ? input.name : id,
        })
        .select()
        .single();

      if (documentError) {
        console.error('Failed to create document record:', documentError);
        throw new Error(`Failed to create document record: ${documentError.message}`);
      }

      return {
        success: true,
        message: `Successfully processed document with ${finalChunks.length} chunks`,
      };
    }

    throw new Error('Failed to store document chunks in vector store');
  } catch (error) {
    console.error('Error in ingestDocument:', error);
    // If there's an error, clean up the document if it was created
    if (id) {
      (await createSupabaseServerClient()).from('documents').delete().match({ id });
    }
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}
