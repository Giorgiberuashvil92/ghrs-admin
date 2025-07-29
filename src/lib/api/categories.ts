import { SubCategory, Complex, Exercise } from "@/types/categories";

const API_BASE_URL = process.env.NODE_ENV === 'development'
  ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  : process.env.NEXT_PUBLIC_API_URL || 'https://ghrs-backend.onrender.com';

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
  ka?: string;
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
  parentId?: string;
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
    console.log("Sending data:", {
      name: data.name,
      description: data.description,
      image: data.image,
      isActive: data.isActive,
      isPublished: data.isPublished,
      sortOrder: data.sortOrder,
    });

    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        image: data.image,
        isActive: data.isActive,
        isPublished: data.isPublished,
        sortOrder: data.sortOrder,
      }),
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error("Server error response:", errorData);
        errorMessage = errorData.message || errorMessage;
      } catch (jsonError) {
        // Error response is not JSON, try to get text
        try {
          const errorText = await response.text();
          console.error("Server error response (text):", errorText);
          errorMessage = errorText || errorMessage;
        } catch (textError) {
          console.error("Could not parse error response");
        }
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
}

export async function getAllCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting all categories:", error);
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
    console.error("Error getting category by ID:", error);
    throw error;
  }
}

// Add function to get category sets according to API spec
export async function getCategorySets(categoryId: string) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/categories/${categoryId}/sets`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting category sets:", error);
    throw error;
  }
}

export async function updateCategory(
  categoryId: string,
  data: UpdateCategoryData,
): Promise<Category> {
  try {
    console.log("Sending update data:", {
      name: data.name,
      description: data.description,
      image: data.image,
      isActive: data.isActive,
      isPublished: data.isPublished,
      sortOrder: data.sortOrder,
    });

    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        image: data.image,
        isActive: data.isActive,
        isPublished: data.isPublished,
        sortOrder: data.sortOrder,
      }),
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error("Server error response:", errorData);
        errorMessage = errorData.message || errorMessage;
      } catch (jsonError) {
        // Error response is not JSON, try to get text
        try {
          const errorText = await response.text();
          console.error("Server error response (text):", errorText);
          errorMessage = errorText || errorMessage;
        } catch (textError) {
          console.error("Could not parse error response");
        }
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
}

export async function deleteCategory(categoryId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
}

// ===============================
// SUBCATEGORY API FUNCTIONS
// ===============================

// საბ კატეგორიის შექმნისთვის
interface CreateSubCategoryData {
  name: LocalizedString;
  description?: LocalizedString;
  image?: string | File | null;
  isActive?: boolean;
  isPublished?: boolean;
  sortOrder?: number;
}

// საბ კატეგორიის განახლებისთვის
interface UpdateSubCategoryData {
  name?: LocalizedString;
  description?: LocalizedString;
  image?: string | File | null;
  isActive?: boolean;
  isPublished?: boolean;
  sortOrder?: number;
}

// კატეგორიის ყველა საბ კატეგორიის მიღება
export async function getSubCategories(
  categoryId: string,
): Promise<SubCategory[]> {
  try {
    // თუ backend არ აქვს ცალკე endpoint, ვიყენებთ getAllCategories და ვფილტრავთ
    const response = await fetch(
      `${API_BASE_URL}/categories/${categoryId}/subcategories`,
    );

    if (!response.ok) {
      // თუ ცალკე endpoint არ მუშაობს, ვცდილობთ ყველა კატეგორია
      const allResponse = await fetch(`${API_BASE_URL}/categories`);
      if (!allResponse.ok) {
        throw new Error(`HTTP error! status: ${allResponse.status}`);
      }
      const allData = await allResponse.json();
      // ვფილტრავთ მხოლოდ ამ კატეგორიის subcategories
      const subcategories = allData.filter(
        (item: any) => item.parentId === categoryId,
      );
      return subcategories;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting subcategories:", error);
    throw error;
  }
}

// კონკრეტული საბ კატეგორიის მიღება
export async function getSubCategoryById(
  categoryId: string,
  subCategoryId: string,
): Promise<SubCategory> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/categories/${categoryId}/subcategories/${subCategoryId}`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting subcategory by ID:", error);
    throw error;
  }
}

// ახალი საბ კატეგორიის შექმნა
export async function createSubCategory(
  categoryId: string,
  data: CreateSubCategoryData,
): Promise<SubCategory> {
  try {
    console.log("Creating subcategory:", {
      categoryId,
      name: data.name,
      description: data.description,
      image: data.image,
      isActive: data.isActive,
      isPublished: data.isPublished,
      sortOrder: data.sortOrder,
    });

    const response = await fetch(
      `${API_BASE_URL}/categories/${categoryId}/subcategories`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          image: data.image,
          isActive: data.isActive ?? true,
          isPublished: data.isPublished ?? false,
          sortOrder: data.sortOrder ?? 0,
        }),
      },
    );

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error("Server error response:", errorData);
        errorMessage = errorData.message || errorMessage;
      } catch (jsonError) {
        try {
          const errorText = await response.text();
          console.error("Server error response (text):", errorText);
          errorMessage = errorText || errorMessage;
        } catch (textError) {
          console.error("Could not parse error response");
        }
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating subcategory:", error);
    throw error;
  }
}

// საბ კატეგორიის განახლება
export async function updateSubCategory(
  categoryId: string,
  subCategoryId: string,
  data: UpdateSubCategoryData,
): Promise<SubCategory> {
  try {
    console.log("Updating subcategory:", {
      categoryId,
      subCategoryId,
      name: data.name,
      description: data.description,
      image: data.image,
      isActive: data.isActive,
      isPublished: data.isPublished,
      sortOrder: data.sortOrder,
    });

    const response = await fetch(
      `${API_BASE_URL}/categories/${categoryId}/subcategories/${subCategoryId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          image: data.image,
          isActive: data.isActive,
          isPublished: data.isPublished,
          sortOrder: data.sortOrder,
        }),
      },
    );

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error("Server error response:", errorData);
        errorMessage = errorData.message || errorMessage;
      } catch (jsonError) {
        try {
          const errorText = await response.text();
          console.error("Server error response (text):", errorText);
          errorMessage = errorText || errorMessage;
        } catch (textError) {
          console.error("Could not parse error response");
        }
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating subcategory:", error);
    throw error;
  }
}

// საბ კატეგორიის წაშლა
export async function deleteSubCategory(
  categoryId: string,
  subCategoryId: string,
): Promise<void> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/categories/${categoryId}/subcategories/${subCategoryId}`,
      {
        method: "DELETE",
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error deleting subcategory:", error);
    throw error;
  }
}

// საბ კატეგორიის სეტების მიღება
export async function getSubCategorySets(
  categoryId: string,
  subCategoryId: string,
) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/categories/${categoryId}/subcategories/${subCategoryId}/sets`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting subcategory sets:", error);
    throw error;
  }
}
