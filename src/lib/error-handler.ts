import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

// Function to handle errors
export function handleError(error: any, lastMessage: string) {
  // Log the error details for debugging
  console.error("Error processing request:", error);

  // Log to a monitoring service (e.g., Sentry)
  logToSentry({
    message: error.message || "Unknown error occurred",
    lastMessage,
    stack: error.stack || "No stack trace available"
  });

  // Return a user-friendly response
  return NextResponse.json(
    { 
      error: "An error occurred while processing your request. Please try again." 
    },
    { status: 500 }
  );
}

function logToSentry(logData: any) {
  Sentry.captureException(new Error(logData.message), {
    extra: logData
  });
}
