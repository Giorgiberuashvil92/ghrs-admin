import { questionnaireRequest } from '@/lib/questionnaires-proxy';
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = new URLSearchParams({ search: params.get('search') || '', status: params.get('status') || '', page: params.get('page') || '1' });
  return questionnaireRequest(`?${query}`);
}
