import { SubCategory, Complex, Exercise } from "@/types/categories";

const API_BASE_URL = '/api';

// API პასუხის ინტერფეისები
interface ApiResponse<T> {
  data: T;
  error: number;
  status: string;
}

interface ApiWrapper<T> {
  data: ApiResponse<T>;
}

interface LocalizedString {
  ka: string;
  en: string;
  ru: string;
}

// კატეგორიის ინტერფეისები
export interface Category {
  _id: string;
  name: LocalizedString;
  description?: LocalizedString;
  image?: string;
  isActive: boolean;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface CreateCategoryData {
  name: LocalizedString;
  description?: LocalizedString;
  image?: string | File | null;
  isActive?: boolean;
  isPublished?: boolean;
  sortOrder?: number;
}

interface UpdateCategoryData {
  name?: LocalizedString;
  description?: LocalizedString;
  image?: string | File | null;
  isActive?: boolean;
  isPublished?: boolean;
  sortOrder?: number;
}

// კატეგორიის ძირითადი ფუნქციები
export async function createCategory(data: CreateCategoryData) {
  try {
    console.log('Sending data:', {
      name: data.name,
      description: data.description,
      image: data.image,
      isActive: data.isActive,
      isPublished: data.isPublished,
      sortOrder: data.sortOrder
    });

    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        image: data.image,
        isActive: data.isActive,
        isPublished: data.isPublished,
        sortOrder: data.sortOrder
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server error response:', errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
}

export async function getAllCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting all categories:', error);
    throw error;
  }
}

export async function getCategoryById(categoryId: string): Promise<Category> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting category by ID:', error);
    throw error;
  }
}

export async function updateCategory(categoryId: string, data: UpdateCategoryData): Promise<Category> {
  try {
    console.log('Sending update data:', {
      name: data.name,
      description: data.description,
      image: data.image,
      isActive: data.isActive,
      isPublished: data.isPublished,
      sortOrder: data.sortOrder
    });

    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
      method: "PATCH",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        image: data.image,
        isActive: data.isActive,
        isPublished: data.isPublished,
        sortOrder: data.sortOrder
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server error response:', errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
}

export async function deleteCategory(categoryId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
} 