import { NextResponse } from 'next/server';

interface ErrorLogData {
  message: string;
  error?: Error;
  context?: Record<string, unknown>;
}

export function logError(data: ErrorLogData) {
  // Log to console for development
  console.error('Error:', {
    message: data.message,
    error: data.error,
    context: data.context,
  });

  // In production, you might want to add a proper error logging service here
}

// Function to handle errors
export function handleError(error: unknown, context?: Record<string, unknown>) {
  const message = error instanceof Error ? error.message : 'An unknown error occurred';
  logError({ message, error: error instanceof Error ? error : undefined, context });

  // Return a user-friendly response
  return NextResponse.json(
    { 
      error: "An error occurred while processing your request. Please try again." 
    },
    { status: 500 }
  );
}
