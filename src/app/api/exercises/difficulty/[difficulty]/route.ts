import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export async function GET(
  request: NextRequest,
  { params }: { params: { difficulty: string } }
) {
  try {
    // Validate difficulty level
    const validDifficulties = ['easy', 'medium', 'hard'];
    if (!validDifficulties.includes(params.difficulty)) {
      return NextResponse.json(
        { error: "Invalid difficulty level" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/exercises/difficulty/${params.difficulty}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch exercises by difficulty");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GET /api/exercises/difficulty/[difficulty]:", error);
    return NextResponse.json(
      { error: "Failed to fetch exercises by difficulty" },
      { status: 500 }
    );
  }
} 