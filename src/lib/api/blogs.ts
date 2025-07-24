import {
  Blog,
  CreateBlogData,
  UpdateBlogData,
  BlogFilters,
  BlogListResponse,
  CreateBlogRequest,
} from "@/types/blogs";

const API_BASE_URL = process.env.NODE_ENV === 'development'
  ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  : process.env.NEXT_PUBLIC_API_URL || 'https://ghrs-backend.onrender.com';


// Get all blogs with filters and pagination
export const getBlogs = async (
  filters?: Partial<BlogFilters>,
  page = 1,
  limit = 20,
): Promise<BlogListResponse | Blog[]> => {
  try {
    const params = new URLSearchParams();

    if (filters?.status && filters.status !== "all") {
      params.append("status", filters.status);
    }

    if (filters?.categoryId) {
      params.append("categoryId", filters.categoryId);
    }

    if (filters?.search) {
      params.append("search", filters.search);
    }

    if (filters?.dateRange) {
      params.append("dateFrom", filters.dateRange[0].toISOString());
      params.append("dateTo", filters.dateRange[1].toISOString());
    }

    params.append("page", page.toString());
    params.append("limit", limit.toString());

    const url = `${API_BASE_URL}/blogs?${params.toString()}`;
    console.log("Making request to:", url);

    const response = await fetch(url, {
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error(
        "API error response:",
        response.status,
        response.statusText,
      );
      const errorText = await response.text();
      console.error("Error details:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("API response data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching blogs:", error);
    throw error;
  }
};

// Get single blog by ID
export const getBlogById = async (id: string): Promise<Blog> => {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as Blog;
  } catch (error) {
    console.error("Error fetching blog:", error);
    throw error;
  }
};

// Create new blog
export const createBlog = async (request: CreateBlogRequest): Promise<Blog> => {
  try {
    const endpoint = request.isFormData ? "/blogs" : "/blogs/json";
    const headers = request.isFormData
      ? undefined
      : {
          "Content-Type": "application/json",
          Accept: "application/json",
        };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      credentials: "include",
      headers,
      body: request.isFormData
        ? (request.formData as FormData)
        : JSON.stringify(request.formData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return (await response.json()) as Blog;
  } catch (error) {
    console.error("Error creating blog:", error);
    throw error;
  }
};

// Update blog
export const updateBlog = async (
  id: string,
  request: CreateBlogRequest,
): Promise<Blog> => {
  try {
    const endpoint = request.isFormData ? `/blogs/${id}` : `/blogs/${id}/json`;
    const headers = request.isFormData
      ? undefined
      : {
          "Content-Type": "application/json",
          Accept: "application/json",
        };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PATCH",
      credentials: "include",
      headers,
      body: request.isFormData
        ? (request.formData as FormData)
        : JSON.stringify(request.formData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return (await response.json()) as Blog;
  } catch (error) {
    console.error("Error updating blog:", error);
    throw error;
  }
};

// Delete blog (soft delete)
export const deleteBlog = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error deleting blog:", error);
    throw error;
  }
};

// Get featured blogs
export const getFeaturedBlogs = async (limit = 10): Promise<Blog[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/blogs/featured?limit=${limit}`,
      {
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as Blog[];
  } catch (error) {
    console.error("Error fetching featured blogs:", error);
    throw error;
  }
};

// Get popular blogs
export const getPopularBlogs = async (limit = 10): Promise<Blog[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/blogs/popular?limit=${limit}`,
      {
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as Blog[];
  } catch (error) {
    console.error("Error fetching popular blogs:", error);
    throw error;
  }
};

// Bulk delete blogs
export const bulkDeleteBlogs = async (ids: string[]): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs/bulk-delete`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ ids }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error bulk deleting blogs:", error);
    throw error;
  }
};

// Bulk update blogs status
export const bulkUpdateBlogsStatus = async (
  ids: string[],
  updates: Partial<Pick<Blog, "isPublished" | "isFeatured">>,
): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs/bulk-update`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ ids, updates }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error bulk updating blogs:", error);
    throw error;
  }
};
