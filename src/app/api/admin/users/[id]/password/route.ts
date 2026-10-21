import { NextResponse } from 'next/server';
import { adminUsersRequest } from '@/lib/admin-users-proxy';
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const { password } = await request.json();
    return adminUsersRequest(`/${encodeURIComponent(id)}/password`, { method: 'PATCH', body: JSON.stringify({ password }) });
  } catch {
    return NextResponse.json({ message: 'Invalid request.' }, { status: 400 });
  }
}
