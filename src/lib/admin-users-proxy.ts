import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function adminUsersRequest(path: string, init?: RequestInit) {
  const incoming = await headers();
  if (init?.method && init.method !== 'GET') {
    const origin = incoming.get('origin');
    const host = incoming.get('host');
    if (!origin || new URL(origin).host !== host) return NextResponse.json({ message: 'Invalid request origin.' }, { status: 403 });
  }
  const fallback = process.env.NODE_ENV === 'production' ? 'https://ghrs-backend.onrender.com/api' : 'http://localhost:4000/api';
  const base = (process.env.ADMIN_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || fallback).replace(/\/$/, '').replace(/\/api$/, '');
  try {
    const response = await fetch(`${base}/api/admin/users${path}`, {
      ...init, cache: 'no-store', signal: AbortSignal.timeout(15000),
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ message: 'The server is unavailable. Please try again.' }, { status: 502 });
  }
}
