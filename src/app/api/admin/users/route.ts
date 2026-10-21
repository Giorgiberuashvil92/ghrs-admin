import { NextRequest } from 'next/server';
import { adminUsersRequest } from '@/lib/admin-users-proxy';
export async function GET(request: NextRequest) {
  const params = new URLSearchParams();
  params.set('search', request.nextUrl.searchParams.get('search') || '');
  params.set('page', request.nextUrl.searchParams.get('page') || '1');
  return adminUsersRequest(`?${params}`);
}
