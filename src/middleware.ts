import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

// Define public routes that don't require authentication
const publicRoutes = ['/auth', '/api/trpc/auth.login', '/api/trpc/auth.register'];
const authRoutes = ['/auth'];

interface AuthUser {
  userId: string;
  email: string;
}

export const runtime = 'nodejs';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the current route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  );

  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Get the auth token from cookies
  const authToken = request.cookies.get('auth_token')?.value;

  // If there's no auth token and the route is not public, redirect to auth page
  if (!authToken) {
    if (!isPublicRoute) {
      const loginUrl = new URL('/auth', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // For public routes, just continue
    return NextResponse.next();
  }

  // Verify the token
  let user: AuthUser | null = null;
  try {
    user = jwt.verify(authToken, process.env.JWT_SECRET as string) as AuthUser;
  } catch (error) {
    console.warn('Invalid token in middleware:', error);
    
    // Clear invalid token
    const response = NextResponse.redirect(new URL('/auth', request.url));
    response.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    
    return response;
  }

  // If user is authenticated and tries to access auth routes, redirect to dashboard
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // // Add user info to request headers for tRPC context
  // const requestHeaders = new Headers(request.headers);
  // requestHeaders.set('x-user-id', user.userId);
  // requestHeaders.set('x-user-email', user.email);

  // const response = NextResponse.next({
  //   request: {
  //     headers: requestHeaders,
  //   },
  // });

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};