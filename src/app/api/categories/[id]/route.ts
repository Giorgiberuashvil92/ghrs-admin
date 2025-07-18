import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📥 Categories API - Received request for ID:', params.id);

    const response = await fetch(`${BACKEND_URL}/categories/${params.id}`);
    
    if (!response.ok) {
      console.error('❌ Categories API - Backend error:', response.status);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Categories API - Successfully fetched category');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Categories API - Error:', error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
} 