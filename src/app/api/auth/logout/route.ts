import { NextRequest, NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_request: NextRequest) {
  try {
    const response = NextResponse.json(
      { success: true, message: 'Signed out successfully' },
      { status: 200 },
    );

    // Clear all auth-related cookies
    response.cookies.delete('authToken');
    response.cookies.delete('otpVerified');

    return response;
  } catch (error) {
    console.error('Error signing out:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
