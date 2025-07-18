import { CreateSetRequest, Set, UpdateSetData } from "@/types/sets";

const API_BASE_URL = '/api';

export async function createSet(request: CreateSetRequest): Promise<Set> {
  try {
    const response = await fetch(`${API_BASE_URL}/sets`, {
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
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating set:", error);
    throw error;
  }
}

export async function updateSet(setId: string, data: UpdateSetData): Promise<Set> {
  try {
    const response = await fetch(`${API_BASE_URL}/sets/${setId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Server error response:", errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating set:", error);
    throw error;
  }
}

export async function getAllSets(categoryId?: string): Promise<Set[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}/sets`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error getting all sets:", error);
    throw error;
  }
}

export async function getSetById(setId: string): Promise<Set> {
  try {
    const response = await fetch(`${API_BASE_URL}/sets/${setId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error getting set by ID:", error);
    throw error;
  }
}

export async function deleteSet(setId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/sets/${setId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error deleting set:", error);
    throw error;
  }
} 