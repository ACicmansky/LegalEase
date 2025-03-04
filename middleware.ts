import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';
import { routing } from './src/i18n/routing';

// Define public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/auth',
  '/register',
  '/forgot-password',
  '/reset-password',
];

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
  
  // Check if the URL contains a locale
  const pathname = req.nextUrl.pathname;
  const pathnameHasLocale = routing.locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  
  // Get the path without locale prefix
  const pathWithoutLocale = pathnameHasLocale 
    ? pathname.replace(/^\/[^\/]+/, '')
    : pathname;
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`)
  );
  
  // Get user from session response
  const supabase = req.cookies.get('sb-access-token');
  const isAuthenticated = !!supabase;
  
  // If no user and not a public route, redirect to login
  if (!isAuthenticated && !isPublicRoute) {
    // Determine which locale to use for the login page
    const locale = pathnameHasLocale 
      ? pathname.split('/')[1] 
      : routing.defaultLocale;
      
    // Redirect to the localized login page
    const loginUrl = new URL(`/${locale}/login`, req.url);
    // Add a return_to parameter to redirect back after login
    loginUrl.searchParams.set('return_to', encodeURIComponent(pathname));
    return NextResponse.redirect(loginUrl);
  }
  
  // If user is authenticated and trying to access login page, redirect to home
  if (isAuthenticated && isPublicRoute) {
    // Determine which locale to use
    const locale = pathnameHasLocale 
      ? pathname.split('/')[1] 
      : routing.defaultLocale;
      
    // Redirect to the localized home page
    return NextResponse.redirect(new URL(`/${locale}`, req.url));
  }
  
  return sessionResponse;
}

export const config = {
  // Match paths that should be handled by middleware
  matcher: [
    // Match root path
    '/',
    // Match all locale paths
    '/(en|sk)',
    '/(en|sk)/:path*',
    // Match API routes
    '/api/:path*'
  ]
};