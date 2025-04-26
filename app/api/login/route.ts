import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import * as crypto from 'crypto';

const VALID_USERNAME = 'nonla';
const VALID_PASSWORD = '1582';
const TOKEN_SECRET = crypto.randomBytes(32).toString('hex');

function generateToken(username: string): string {
  const data = `${username}-${Date.now()}`;
  return crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(data)
    .digest('hex');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      const token = generateToken(username);
      
      const response = NextResponse.json({ success: true });
      
      // Nastavení HTTP-only cookie
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7200 // 2 hodiny
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: 'Neplatné přihlašovací údaje' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Chyba serveru' },
      { status: 500 }
    );
  }
} 