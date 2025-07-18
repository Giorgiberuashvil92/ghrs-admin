import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // მონაცემების მომზადება API-სთვის
    const data = {
      name: {
        ka: formData.get("name[ka]"),
        en: formData.get("name[en]"),
        ru: formData.get("name[ru]"),
      },
      description: {
        ka: formData.get("description[ka]"),
        en: formData.get("description[en]"),
        ru: formData.get("description[ru]"),
      },
      price: {
        monthly: formData.get("price[monthly]"),
        threeMonths: formData.get("price[threeMonths]"),
        sixMonths: formData.get("price[sixMonths]"),
        yearly: formData.get("price[yearly]"),
      },
      isActive: formData.get("isActive") === "true",
      isPublished: formData.get("isPublished") === "true",
      sortOrder: formData.get("sortOrder"),
      categoryId: formData.get("categoryId"),
      subCategoryId: formData.get("subCategoryId") || undefined,
    };

    // სურათის დამუშავება
    const thumbnailImage = formData.get("thumbnailImage") as File | null;
    if (thumbnailImage) {
      // აქ დაამატეთ სურათის ატვირთვის ლოგიკა
      // მაგალითად: const imageUrl = await uploadImage(thumbnailImage);
      // data.thumbnailImage = imageUrl;
    }

    // API მოთხოვნის გაგზავნა
    const response = await fetch(`${API_BASE_URL}/sets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to create set");
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in POST /api/sets:", error);
    return NextResponse.json(
      { error: "Failed to create set" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    
    let url = `${API_BASE_URL}/sets`;
    if (categoryId) {
      url += `?categoryId=${categoryId}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch sets");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GET /api/sets:", error);
    return NextResponse.json(
      { error: "Failed to fetch sets" },
      { status: 500 }
    );
  }
} 