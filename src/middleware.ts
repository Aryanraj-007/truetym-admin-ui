import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow signup/login page without auth
  if (pathname === '/login' || pathname === '/') {
    return NextResponse.next();
  }

  // Check for admin routes - they require OTP verification
  if (pathname.startsWith('/(admin)') || pathname.startsWith('/dashboard')) {
    const authToken = request.cookies.get('authToken')?.value;
    const otpVerified = request.cookies.get('otpVerified')?.value;

    // If no token or OTP not verified, redirect to signup
    if (!authToken || otpVerified !== 'true') {
      const signupUrl = new URL('/login', request.url);
      const response = NextResponse.redirect(signupUrl);
      // Clear any existing auth state
      response.cookies.delete('authToken');
      response.cookies.delete('otpVerified');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|public).*)'],
};
