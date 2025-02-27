import { cookies, headers } from 'next/headers';
import { NextResponse } from 'next/server';

const allowedOrigins = [
  'https://jootalkpia.netlify.app',
  'http://localhost:3000',
];

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get('accessToken')?.value || '';

  const origin = allowedOrigins.includes(headers().get('origin') || '')
    ? headers().get('origin')
    : allowedOrigins[0];

  const response = NextResponse.json({ token });

  response.headers.set('Access-Control-Allow-Origin', origin || '');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE',
  );
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization',
  );

  return response;
}
