import { adminUsersRequest } from '@/lib/admin-users-proxy';
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return adminUsersRequest(`/${encodeURIComponent(id)}/purchases`);
}
