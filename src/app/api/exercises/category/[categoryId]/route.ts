import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export async function GET(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const response = await fetch(
      `${BACKEND_URL}/exercises/category/${params.categoryId}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch category exercises");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GET /api/exercises/category/[categoryId]:", error);
    return NextResponse.json(
      { error: "Failed to fetch category exercises" },
      { status: 500 }
    );
  }
} 