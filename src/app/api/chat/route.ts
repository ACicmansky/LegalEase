import { NextRequest, NextResponse } from 'next/server';
import { createOptimizedPipeline } from '@/lib/pipeline';
import { z } from 'zod';
import { handleError } from '@/lib/error-handler';

// Request validation schema
const requestSchema = z.object({
  question: z.string().min(1).max(1000),
  sessionId: z.string().optional(),
});

// Initialize the pipeline
const pipeline = createOptimizedPipeline();

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = requestSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validatedData.error.errors },
        { status: 400 }
      );
    }

    const { question, sessionId } = validatedData.data;

    // Process the request through the pipeline
    const startTime = Date.now();
    const response = await pipeline.invoke({
      question,
      sessionId,
    });

    // Return the response with timing information
    return NextResponse.json({
      response,
      metadata: {
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      }
    });

  } catch (error: any) {
    // Use the error handler with the last user question for context
    return handleError(error, 
      `Failed to process question: ${request.body ? 
        JSON.parse(await request.text()).question : 
        'No question provided'}`
    );
  }
}

// Handle GET requests (optional - for health checks)
export async function GET() {
  try {
    return NextResponse.json(
      { status: 'healthy', timestamp: new Date().toISOString() },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, 'Health check failed');
  }
}