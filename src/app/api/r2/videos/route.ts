import { NextRequest, NextResponse } from "next/server";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";
import { r2Config, videoPrefix } from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function validateOrigin(request: NextRequest) {
  if (
    request.method !== "GET" &&
    request.headers.get("origin") &&
    request.headers.get("origin") !== request.nextUrl.origin
  ) {
    return NextResponse.json(
      { message: "Invalid request origin" },
      { status: 403 },
    );
  }
}
function failure(error: unknown) {
  console.error(
    "R2 operation failed:",
    error instanceof Error ? error.name : "Unknown error",
  );
  return NextResponse.json(
    {
      message:
        "R2 request failed. Check storage configuration and bucket permissions.",
    },
    { status: 503 },
  );
}
export async function GET(request: NextRequest) {
  const denied = validateOrigin(request);
  if (denied) return denied;
  try {
    const { client, bucket } = r2Config();
    const videos = [];
    let ContinuationToken: string | undefined;
    do {
      const result = await client.send(
        new ListObjectsV2Command({
          Bucket: bucket,
          Prefix: videoPrefix,
          ContinuationToken,
        }),
      );
      for (const item of result.Contents || []) {
        if (!item.Key || !item.Size) continue;
        videos.push({
          id: item.Key,
          name: item.Key.slice(videoPrefix.length + 37),
          size: item.Size,
          createdAt: item.LastModified?.toISOString(),
          url: await getSignedUrl(
            client,
            new GetObjectCommand({ Bucket: bucket, Key: item.Key }),
            { expiresIn: 86400 },
          ),
        });
      }
      ContinuationToken = result.IsTruncated
        ? result.NextContinuationToken
        : undefined;
    } while (ContinuationToken);
    return NextResponse.json(
      {
        videos: videos.sort((a, b) =>
          (b.createdAt || "").localeCompare(a.createdAt || ""),
        ),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return failure(error);
  }
}
export async function POST(request: NextRequest) {
  const denied = validateOrigin(request);
  if (denied) return denied;
  try {
    const { name, size, contentType } = await request.json();
    if (
      typeof name !== "string" ||
      name.length > 255 ||
      !/\.(mp4|mov|webm)$/i.test(name) ||
      !["video/mp4", "video/quicktime", "video/webm"].includes(contentType) ||
      !Number.isSafeInteger(size) ||
      size <= 0 ||
      size > 5 * 1024 ** 3
    ) {
      return NextResponse.json(
        { message: "Choose an MP4, MOV or WebM video up to 5 GB." },
        { status: 400 },
      );
    }
    const key = `${videoPrefix}${randomUUID()}-${name.replace(new RegExp("[^\\p{L}\\p{N}._ -]", "gu"), "_")}`;
    const directUpload = process.env.R2_UPLOAD_MODE === "direct" ||
      (process.env.VERCEL === "1" && process.env.R2_UPLOAD_MODE !== "proxy");
    let uploadUrl = `/api/r2/videos/upload?key=${encodeURIComponent(key)}`;
    if (directUpload) {
      const { client, bucket } = r2Config();
      uploadUrl = await getSignedUrl(client, new PutObjectCommand({
        Bucket: bucket, Key: key, ContentType: contentType, ContentLength: size,
      }), { expiresIn: 3600 });
    }
    return NextResponse.json(
      { key, uploadUrl },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return failure(error);
  }
}
export async function DELETE(request: NextRequest) {
  const denied = validateOrigin(request);
  if (denied) return denied;
  try {
    const { key } = await request.json();
    if (
      typeof key !== "string" ||
      !key.startsWith(videoPrefix) ||
      key.includes("..")
    ) {
      return NextResponse.json(
        { message: "Invalid video key" },
        { status: 400 },
      );
    }
    const { client, bucket } = r2Config();
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    return NextResponse.json({ success: true });
  } catch (error) {
    return failure(error);
  }
}
