import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log('📤 Fetching sets for category:', id);

    const response = await fetch(`${BACKEND_URL}/sets?categoryId=${id}`);

    if (!response.ok) {
      console.error('❌ Backend error:', response.status);
      return NextResponse.json(
        { error: "Failed to fetch sets" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Fetched sets:', data.length);
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error fetching sets:', error);
    return NextResponse.json(
      { error: "Failed to fetch sets" },
      { status: 500 }
    );
  }
} 