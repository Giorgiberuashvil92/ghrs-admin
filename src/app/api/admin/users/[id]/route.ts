import { NextResponse } from 'next/server';
import { adminUsersRequest } from '@/lib/admin-users-proxy';
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, context: Context) {
  return adminUsersRequest(`/${encodeURIComponent((await context.params).id)}`);
}
export async function PATCH(request: Request, context: Context) {
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({ message: 'Invalid request.' }, { status: 400 });
    return adminUsersRequest(`/${encodeURIComponent((await context.params).id)}`, { method: 'PATCH', body: JSON.stringify(body) });
  } catch { return NextResponse.json({ message: 'Invalid request.' }, { status: 400 }); }
}
export async function DELETE(_request: Request, context: Context) {
  return adminUsersRequest(`/${encodeURIComponent((await context.params).id)}`, { method: 'DELETE' });
}
