'use server';

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/utils/supabase/server';
import { processDocument } from '@/lib/agents/documentProcessingAgent';
import { ProcessingStage } from '@/lib/agents/types';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { documentId } = await request.json();

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    // Get document info from database
    const supabase = await createSupabaseServerClient();
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      console.error('Error fetching document:', docError);
      return NextResponse.json(
        { error: `Document not found: ${docError?.message || 'Unknown error'}` },
        { status: 404 }
      );
    }

    // Process the document
    const result = await processDocument(documentId, document.name);

    // Check for processing errors
    if (result.processingStage === ProcessingStage.Error) {
      console.error('Document processing error:', result.error);
      return NextResponse.json(
        { error: result.error || 'Failed to process document' },
        { status: 500 }
      );
    }

    // Return success with processing result
    return NextResponse.json({
      success: true,
      documentId,
      processingStage: result.processingStage,
      summary: result.summary,
    });
  } catch (error) {
    console.error('Error in document analysis API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
