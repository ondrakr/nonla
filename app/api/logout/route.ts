import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Smazání auth cookie
  response.cookies.set('auth-token', '', {
    expires: new Date(0),
  });

  return response;
} 