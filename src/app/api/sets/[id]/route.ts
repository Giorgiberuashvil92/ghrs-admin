import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📥 Sets API - Received request for ID:', params.id);

    const response = await fetch(`${BACKEND_URL}/sets/${params.id}`);
    
    if (!response.ok) {
      console.error('❌ Sets API - Backend error:', response.status);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Sets API - Successfully fetched set');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Sets API - Error:', error);
    return NextResponse.json(
      { error: "Failed to fetch set" },
      { status: 500 }
    );
  }
} 