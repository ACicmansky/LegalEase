import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Security headers
  const response = NextResponse.next();
  
  response.headers.set("Content-Security-Policy", "default-src 'self'");
  response.headers.set("X-Content-Type-Options", "nosniff");
  
  // Rate limiting header
  response.headers.set("RateLimit-Limit", "100");
  response.headers.set("RateLimit-Remaining", "99");
  response.headers.set("RateLimit-Reset", "60");

  return response;
}

// Apply middleware to specific routes
export const config = {
  matcher: "/api/chat",
};
