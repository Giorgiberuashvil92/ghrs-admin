import { NextRequest, NextResponse } from "next/server";
import {
  createCatalog,
  deleteCatalog,
  updateCatalog,
  validCatalogId,
  validName,
} from "@/lib/video-library";

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

export async function POST(request: NextRequest) {
  const denied = validateOrigin(request);
  if (denied) return denied;
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

export async function PATCH(request: NextRequest) {
  const denied = validateOrigin(request);
  if (denied) return denied;
  try {
    const { id, name } = await request.json();
    if (!validCatalogId(id) || !validName(name))
      return NextResponse.json(
        { message: "Enter a catalog name (1–200 characters)." },
        { status: 400 },
      );
    const catalog = await updateCatalog(id, name);
    if (!catalog)
      return NextResponse.json(
        { message: "Catalog not found." },
        { status: 404 },
      );
    return NextResponse.json({ catalog });
  } catch {
    return NextResponse.json(
      { message: "Could not update catalog. Please retry." },
      { status: 503 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const denied = validateOrigin(request);
  if (denied) return denied;
  try {
    const { id } = await request.json();
    if (!validCatalogId(id))
      return NextResponse.json(
        { message: "Invalid catalog id." },
        { status: 400 },
      );
    const deleted = await deleteCatalog(id);
    if (!deleted)
      return NextResponse.json(
        { message: "Catalog not found." },
        { status: 404 },
      );
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { message: "Could not delete catalog. Please retry." },
      { status: 503 },
    );
  }
}
