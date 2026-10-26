import { NextRequest, NextResponse } from 'next/server';
import { GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Config } from '@/lib/r2';
import { validVideoKey } from '@/lib/video-library';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// A stable playback address. Never cache the expiring storage redirect.
export async function GET(_request: NextRequest, context: { params: Promise<{ key: string[] }> }) {
  const key = (await context.params).key.join('/');
  const headers = { 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' };
  if (!validVideoKey(key)) return NextResponse.json({ message: 'Invalid video key' }, { status: 400, headers });
  try {
    const { client, bucket } = r2Config();
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    const url = await getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: 86400 });
    return new NextResponse(null, { status: 307, headers: { ...headers, Location: url } });
  } catch (error) {
    const status = error?.$metadata?.httpStatusCode === 404 ? 404 : 503;
    return NextResponse.json({ message: status === 404 ? 'Video not found' : 'Video storage unavailable' }, { status, headers });
  }
}
