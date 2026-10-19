import { NextRequest, NextResponse } from "next/server";
import { createCatalog, validName } from "@/lib/video-library";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  if (
    request.headers.get("origin") &&
    request.headers.get("origin") !== request.nextUrl.origin
  )
    return NextResponse.json(
      { message: "Invalid request origin" },
      { status: 403 },
    );
  try {
    const { name } = await request.json();
    if (!validName(name))
      return NextResponse.json(
        { message: "Enter a catalog name (1–200 characters)." },
        { status: 400 },
      );
    return NextResponse.json({ catalog: await createCatalog(name) });
  } catch {
    return NextResponse.json(
      { message: "Could not save catalog. Please retry." },
      { status: 503 },
    );
  }
}
