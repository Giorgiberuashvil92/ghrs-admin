import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Config, videoPrefix } from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ message: "Invalid request origin" }, { status: 403 });
  }
  const key = request.nextUrl.searchParams.get("key");
  const size = Number(request.headers.get("content-length"));
  const contentType = request.headers.get("content-type");
  if (!key?.startsWith(videoPrefix) || key.includes("..") ||
    !new RegExp(`^${videoPrefix}[a-f0-9-]{36}-.+\\.(mp4|mov|webm)$`, "i").test(key) ||
    !Number.isSafeInteger(size) || size <= 0 || size > 5 * 1024 ** 3 ||
    !["video/mp4", "video/quicktime", "video/webm"].includes(contentType || "") || !request.body) {
    return NextResponse.json({ message: "Invalid video upload" }, { status: 400 });
  }
  try {
    const { client, bucket } = r2Config();
    const url = await getSignedUrl(client, new PutObjectCommand({
      Bucket: bucket, Key: key, ContentType: contentType, ContentLength: size,
    }), { expiresIn: 3600 });
    // Stream the request through Node without buffering a large video in memory.
    const options: RequestInit & { duplex: "half" } = {
      method: "PUT", body: request.body, duplex: "half",
      headers: { "Content-Type": contentType, "Content-Length": String(size) },
      signal: request.signal,
    };
    const response = await fetch(url, options);
    if (!response.ok) {
      await response.body?.cancel();
      return NextResponse.json({ message: "R2 upload failed" }, { status: 502 });
    }
    await response.body?.cancel();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("R2 streaming upload failed:", error instanceof Error ? error.name : "Unknown error");
    return NextResponse.json({ message: "Video upload failed. Please retry." }, { status: 502 });
  }
}
