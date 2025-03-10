import { cookies, headers } from 'next/headers';
import { NextResponse } from 'next/server';

const allowedOrigins = [
  'https://jootalkpia.netlify.app',
  'http://localhost:3000',
];

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value || '';

  const headersList = await headers();
  const origin = allowedOrigins.includes(headersList.get('origin') || '')
    ? headersList.get('origin')
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
