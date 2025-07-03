import { NextRequest, NextResponse } from 'next/server';
import { processDocument } from '@/lib/agents/documentProcessingAgent';
import { addDocumentProcessing } from '@/lib/services/documentProcessnigService';

export async function POST(request: NextRequest) {
    try {
        // Read the file as ArrayBuffer
        const fileBuffer = await request.arrayBuffer();

        // Process the document
        const timer = performance.now();
        const result = await processDocument(fileBuffer);
        const processingTime = performance.now() - timer;
        console.log(`Processing time: ${processingTime} ms`);

        // Add document processing to DB
        const documentProcessing = await addDocumentProcessing(result);
        if (!documentProcessing) {
            return NextResponse.json({ error: 'Failed to add document processing' }, { status: 500 });
        }

        // Return success with processing result
        return NextResponse.json(result.simplifiedSummary);
    }
    catch (error) {
        console.error('Error in document analysis service:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error occurred during document analysis' },
            { status: 500 }
        );
    }
}