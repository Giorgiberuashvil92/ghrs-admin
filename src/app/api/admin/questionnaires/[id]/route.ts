import { NextResponse } from 'next/server';
import { questionnaireRequest } from '@/lib/questionnaires-proxy';
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    if (!/^[a-f\d]{24}$/i.test(id)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    const body = await request.json();
    return questionnaireRequest(`/${id}`, { method: 'PATCH', body: JSON.stringify({ status: body.status, curatorNotes: body.curatorNotes }) });
  } catch { return NextResponse.json({ message: 'Invalid request' }, { status: 400 }); }
}
