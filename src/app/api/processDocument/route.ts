'use server';

import { NextRequest, NextResponse } from 'next/server';
import { processDocument } from '@/lib/agents/documentProcessingAgent';
import { addDocumentProcessing } from '@/lib/services/documentProcessnigService';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const document = formData.get('document') as File | null;

        if (!document) {
            return NextResponse.json({ error: 'Document is required' }, { status: 400 });
        }

        // Process the document
        const result = await processDocument(document);

        // Add document processing to DB
        const documentProcessing = await addDocumentProcessing(result);
        if (!documentProcessing) {
            return NextResponse.json({ error: 'Failed to add document processing' }, { status: 500 });
        }

        // Return success with processing result
        return NextResponse.json({
            success: true,
            summary: result.simplifiedSummary,
        });
    }
    catch (error) {
        console.error('Error in document analysis service:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error occurred during document analysis' },
            { status: 500 }
        );
    }
}