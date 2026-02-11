import { CreateSetRequest, Set, UpdateSetData } from "@/types/sets";

// Consistent API base URL
const API_BASE_URL = process.env.NODE_ENV === 'development'
  ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  : process.env.NEXT_PUBLIC_API_URL || 'https://ghrs-backend.onrender.com';

// Helper function to construct API URLs
function constructApiUrl(path: string): string {
  // თუ path უკვე იწყება /api/-ით, არ დავამატოთ კიდევ ერთხელ
  if (path.startsWith("/api/")) {
    return `${API_BASE_URL}${path}`;
  }
  // თუ path იწყება /-ით, დავამატოთ /api prefix
  if (path.startsWith("/")) {
    return `${API_BASE_URL}/api${path}`;
  }
  // სხვა შემთხვევაში, დავამატოთ /api/ prefix
  return `${API_BASE_URL}/api/${path}`;
}

export async function createSet(request: CreateSetRequest): Promise<Set> {
  try {
    const url = constructApiUrl("sets");
    console.log("📤 Creating set");

    const response = await fetch(url, {
      method: "POST",
      ...(request.isFormData
        ? {
            body: request.formData as FormData,
          }
        : {
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(request.formData),
          }),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Server error response:", errorData);
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
    }

    const data = await response.json();
    console.log("✅ Set created");
    return data;
  } catch (error) {
    console.error("Error creating set:", error);
    throw error;
  }
}

export async function duplicateSet(setId: string): Promise<Set> {
  try {
    const url = constructApiUrl(`sets/${setId}/duplicate`);
    console.log("📤 Duplicating set:", setId);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Accept": "application/json"
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Server error response:", errorData);
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
    }

    const result = await response.json();
    console.log("✅ Set duplicated");
    return result;
  } catch (error) {
    console.error("Error duplicating set:", error);
    throw error;
  }
}

export async function updateSet(
  setId: string,
  data: UpdateSetData,
): Promise<Set> {
  try {
    const url = constructApiUrl(`sets/${setId}`);
    console.log("📤 Updating set:", setId);

    // Log the exact data being sent
    const jsonData = JSON.stringify(data);
    console.log("Request data:", jsonData);

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: jsonData,
      credentials: "include",
    });

    // Log the raw response
    const responseText = await response.text();
    console.log("Raw response:", responseText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { message: responseText };
      }
      console.error("Server error response:", errorData);
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
    }

    const result = JSON.parse(responseText);
    console.log("✅ Set updated");
    return result;
  } catch (error) {
    console.error("Error updating set:", error);
    throw error;
  }
}

export async function getAllSets(
  categoryId?: string,
  subCategoryId?: string,
): Promise<Set[]> {
  try {
    const queryParams = new URLSearchParams();
    if (categoryId) queryParams.append("categoryId", categoryId);
    if (subCategoryId) queryParams.append("subCategoryId", subCategoryId);

    const url = constructApiUrl(
      `sets${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
    );
    console.log("📤 Fetching sets from:", url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Fetched sets:", data.length);
    return data;
  } catch (error) {
    console.error("Error getting all sets:", error);
    throw error;
  }
}

export async function getSetById(setId: string): Promise<Set> {
  try {
    const url = constructApiUrl(`sets/${setId}`);
    console.log("📤 Fetching set:", setId);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Set fetched");
    return data;
  } catch (error) {
    console.error("Error getting set by ID:", error);
    throw error;
  }
}

export async function deleteSet(setId: string): Promise<void> {
  try {
    const url = constructApiUrl(`sets/${setId}`);
    console.log("📤 Deleting set:", setId);

    const response = await fetch(url, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log("✅ Set deleted");
  } catch (error) {
    console.error("Error deleting set:", error);
    throw error;
  }
}
