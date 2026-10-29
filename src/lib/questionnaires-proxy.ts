import 'server-only';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
export const backendBase = () => (process.env.ADMIN_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? 'https://ghrs-backend.onrender.com' : 'http://localhost:4000')).replace(/\/$/, '').replace(/\/api$/, '');
export async function isSameOrigin() {
  const incoming = await headers();
  try { return new URL(incoming.get('origin') || '').host === incoming.get('host'); } catch { return false; }
}
export async function questionnaireRequest(path: string, init?: RequestInit) {
  if (init?.method && init.method !== 'GET' && !await isSameOrigin()) return NextResponse.json({ message: 'Invalid origin' }, { status: 403 });
  try {
    const response = await fetch(`${backendBase()}/api/questionnaires/admin${path}`, {
      ...init, cache: 'no-store', signal: AbortSignal.timeout(15000), headers: { 'Content-Type': 'application/json' },
    });
    return NextResponse.json(await response.json(), { status: response.status, headers: { 'Cache-Control': 'no-store' } });
  } catch { return NextResponse.json({ message: 'Server unavailable' }, { status: 502 }); }
}
