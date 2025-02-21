import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(req: NextRequest) {
  // // Create the response early so we can modify headers
  // const res = NextResponse.next();
  
  // // Add security headers
  // res.headers.set("Content-Security-Policy", "default-src 'self'");
  // res.headers.set("X-Content-Type-Options", "nosniff");
  
  // // Add rate limiting headers
  // res.headers.set("RateLimit-Limit", "100");
  // res.headers.set("RateLimit-Remaining", "99");
  // res.headers.set("RateLimit-Reset", "60");

  // Only check auth for protected routes
  // if (req.nextUrl.pathname.startsWith('/dashboard')) {
  //   // Initialize Supabase client
  //   const supabase = createMiddlewareClient({ req, res });

  //   const {
  //     data: { session },
  //   } = await supabase.auth.getSession();

  //   // If there's no session and the user is trying to access a protected route
  //   if (!session) {
  //     const redirectUrl = req.nextUrl.clone();
  //     redirectUrl.pathname = '/login';
  //     redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname);
  //     return NextResponse.redirect(redirectUrl);
  //   }
  // }

  return await updateSession(req);
  // return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*',  // Protected routes
    '/api/:path*',        // API routes
  ],
};
