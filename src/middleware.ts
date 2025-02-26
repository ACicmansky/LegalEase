import type { NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(req: NextRequest) {
  return await updateSession(req);
}

export const config = {
  matcher: [
    '/',               // Root path
    '/api/:path*',        // API routes
  ],
}