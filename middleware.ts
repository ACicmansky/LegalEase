import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';
import { routing } from './src/i18n/routing';

export async function middleware(req: NextRequest) {
  // First, update the session
  const sessionResponse = await updateSession(req);
  
  // If the request is for an API route, return the session response
  if (req.nextUrl.pathname.startsWith('/api/')) {
    return sessionResponse;
  }
  
  // Handle root path redirect
  if (req.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL(`/${routing.defaultLocale}`, req.url));
  }
  
  return sessionResponse;
}

export const config = {
  // Match paths that should be handled by middleware
  matcher: [
    // Match root path and API routes
    '/',
    '/api/:path*'
  ]
};
