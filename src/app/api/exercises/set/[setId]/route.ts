import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { setId: string } }
) {
  try {
    const { setId } = params;
    console.log('📥 Fetching exercises for setId:', setId);

    const response = await fetch(`${BACKEND_URL}/exercises/set/${setId}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('❌ Backend error:', response.status);
      return NextResponse.json(
        { error: "Failed to fetch exercises" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Fetched exercises:', data.length);
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error fetching exercises:', error);
    return NextResponse.json(
      { error: "Failed to fetch exercises" },
      { status: 500 }
    );
  }
} 