/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Article,
  CreateArticleData,
  UpdateArticleData,
  ArticleFilters,
  ArticleListResponse,
  CreateArticleRequest,
} from "@/types/articles";

const API_BASE_URL = process.env.NODE_ENV === 'development'
  ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  : process.env.NEXT_PUBLIC_API_URL || 'https://ghrs-backend.onrender.com';

// Helper function to upload file to Cloudinary
const uploadToCloudinary = async (
  file: File | Blob,
  folder: string = "articles",
): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload file");
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};

// Create Article interface
interface CreateArticlePayload {
  title: {
    ka: string;
    en: string;
    ru: string;
  };
  excerpt: {
    ka: string;
    en: string;
    ru: string;
  };
  content: {
    ka: string;
    en: string;
    ru: string;
  };
  blogId: string;
  categoryIds: string[]; // Changed from categoryId to categoryIds
  author: {
    name: string;
    bio?: string;
    avatar?: string;
  };
  tags?: string[];
  isPublished?: boolean;
  isFeatured?: boolean;
}

// Get articles with filters and pagination
export async function getArticles(
  filters?: ArticleFilters,
  page: number = 1,
  limit: number = 20,
) {
  try {
    // let url = `http://localhost:4000/articles?page=${page}&limit=${limit}`;
    let url = `${API_BASE_URL}/articles?page=${page}&limit=${limit}`;

    // Add filters to URL if they exist
    if (filters) {
      if (filters.status && filters.status !== "all") {
        if (filters.status === "published") {
          url += "&isPublished=true";
        } else if (filters.status === "draft") {
          url += "&isPublished=false";
        } else if (filters.status === "featured") {
          url += "&isFeatured=true";
        }
      }

      if (filters.categoryId) {
        url += `&categoryId=${filters.categoryId}`;
      }

      if (filters.search) {
        url += `&search=${encodeURIComponent(filters.search)}`;
      }
    }

    console.log("Fetching articles from URL:", url);
    const response = await fetch(url, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Raw API response:", data);

    // Transform function to handle article data
    const transformArticle = (article: any) => {
      // Handle category data
      const categoryId =
        typeof article.categoryId === "string"
          ? article.categoryId
          : article.categoryId?._id || "";

      return {
        _id: article._id,
        title: article.title || { ka: "", en: "", ru: "" },
        excerpt: article.excerpt || { ka: "", en: "", ru: "" },
        content: article.content || { ka: "", en: "", ru: "" },
        categoryId: categoryId,
        category:
          typeof article.categoryId === "object"
            ? article.categoryId
            : undefined,
        blogId:
          typeof article.blogId === "string"
            ? article.blogId
            : article.blogId?._id || "",
        authorName: article.author?.name || "",
        authorBio: article.author?.bio || "",
        authorAvatar: article.author?.avatar || "",
        isPublished: article.isPublished || false,
        isFeatured: article.isFeatured || false,
        views: article.viewsCount || 0,
        featuredImages: article.featuredImages || [],
        tableOfContents: article.tableOfContents || [],
        tags: article.tags || [],
        sortOrder: article.sortOrder || 0,
        createdAt: article.createdAt || new Date().toISOString(),
        updatedAt: article.updatedAt || new Date().toISOString(),
      };
    };

    // Handle both array and object responses
    if (Array.isArray(data)) {
      const transformedArticles = data.map(transformArticle);
      return {
        articles: transformedArticles,
        total: transformedArticles.length,
        page: 1,
        limit: transformedArticles.length,
      };
    }

    // If data is an object with articles property
    if (data.articles) {
      const transformedArticles = data.articles.map(transformArticle);
      return {
        articles: transformedArticles,
        total: data.total || transformedArticles.length,
        page: data.page || page,
        limit: data.limit || limit,
      };
    }

    // If data is a single article, wrap it in an array
    if (data._id) {
      const transformedArticle = transformArticle(data);
      return {
        articles: [transformedArticle],
        total: 1,
        page: 1,
        limit: 1,
      };
    }

    // Fallback for empty or invalid response
    return {
      articles: [],
      total: 0,
      page: page,
      limit: limit,
    };
  } catch (error) {
    console.error("Error fetching articles:", error);
    throw error;
  }
}

// Get single article by ID
export const getArticleById = async (id: string): Promise<Article> => {
  try {
    const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Raw article data:", data);

    // Normalize category IDs from either categoryIds (array) or categoryId (single or array)
    const categoryIds: string[] = Array.isArray((data as any).categoryIds)
      ? (data as any).categoryIds
          .map((c: any) => (typeof c === "string" ? c : c?._id))
          .filter((v: any): v is string => Boolean(v))
      : Array.isArray((data as any).categoryId)
      ? (data as any).categoryId
          .map((c: any) => (typeof c === "string" ? c : c?._id))
          .filter((v: any): v is string => Boolean(v))
      : typeof (data as any).categoryId === "string"
      ? [(data as any).categoryId]
      : (data as any).categoryId?._id
      ? [(data as any).categoryId._id]
      : [];

    return {
      _id: data._id,
      title: data.title || { ka: "", en: "", ru: "" },
      excerpt: data.excerpt || { ka: "", en: "", ru: "" },
      content: data.content || { ka: "", en: "", ru: "" },
      categoryIds,
      blogId:
        typeof data.blogId === "string" ? data.blogId : data.blogId?._id || "",
      authorName: data.author?.name || "",
      authorBio: data.author?.bio || "",
      authorAvatar: data.author?.avatar || "",
      isPublished: data.isPublished || false,
      isFeatured: data.isFeatured || false,
      views: data.viewsCount || 0,
      featuredImages: data.featuredImages || [],
      tableOfContents: data.tableOfContents || [],
      tags: data.tags || [],
      sortOrder: data.sortOrder || 0,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error fetching article:", error);
    throw error;
  }
};

export async function createArticle(data: FormData | CreateArticleData) {
  try {
    const isFormData = data instanceof FormData;
    const endpoint = isFormData ? "/articles" : "/articles/json";

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      credentials: "include",
      ...(isFormData
        ? {}
        : {
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          }),
      ...(isFormData ? { body: data } : {}),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server error response:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log("Server response:", responseData);
    return responseData;
  } catch (error) {
    console.error("Error creating article:", error);
    throw error;
  }
}

// Update article
export const updateArticle = async (
  id: string,
  request: CreateArticleRequest,
): Promise<Article> => {
  try {
    console.log(`Updating article ${id} with:`, {
      isFormData: request.isFormData,
      data: request.isFormData
        ? "FormData object..."
        : JSON.stringify(request.formData, null, 2),
    });

    // Always use FormData
    const formDataToSend = new FormData();

    if (request.isFormData) {
      // If it's already FormData, just use it directly
      const formData = request.formData as FormData;
      
      // Upload new images if any
      const images = formData.getAll('featuredImages');
      console.log('Found images to upload:', images);
      
      if (images.length > 0) {
        const uploadedUrls = await Promise.all(
          images.map(async (image: any) => {
            if (image instanceof File) {
              console.log('Uploading image file:', image.name);
              const url = await uploadToCloudinary(image, 'articles');
              console.log('Uploaded image URL:', url);
              return url;
            }
            console.log('Using existing image URL:', image);
            return image;
          })
        );
        
        console.log('All uploaded URLs:', uploadedUrls);
        
        // Remove old images field
        formData.delete('featuredImages');
        
        // Add uploaded URLs
        formData.append('featuredImages', JSON.stringify(uploadedUrls));
      }

      // Get existing images if any
      const existingImages = formData.get('existingFeaturedImages');
      if (existingImages) {
        const existingUrls = JSON.parse(existingImages as string);
        console.log('Existing image URLs:', existingUrls);
        
        // Combine with uploaded URLs if any
        const allImages = images.length > 0 
          ? [...existingUrls, ...JSON.parse(formData.get('featuredImages') as string)]
          : existingUrls;
        
        // Update images with all URLs
        formData.delete('featuredImages');
        formData.delete('existingFeaturedImages');
        formData.append('featuredImages', JSON.stringify(allImages));
      }

      // Log final FormData content
      console.log('Final FormData content:');
      const entries = Array.from(formData.entries());
      for (const [key, value] of entries) {
        console.log(`${key}:`, value);
      }
      
      const response = await sendFormDataRequest(id, formData);
      console.log('Server response:', response);
      
      return response;
    } else {
      // Convert JSON data to FormData
      const data = request.formData as any;

      // Add all fields as JSON strings
      formDataToSend.append("title", JSON.stringify(data.title));
      formDataToSend.append("excerpt", JSON.stringify(data.excerpt));
      formDataToSend.append("content", JSON.stringify(data.content));
      formDataToSend.append("categoryIds", JSON.stringify(data.categoryIds));
      formDataToSend.append("blogId", data.blogId);
      formDataToSend.append(
        "author",
        JSON.stringify({
          name: data.authorName || "",
          bio: data.authorBio || "",
          avatar: data.authorAvatar || "",
        }),
      );

      if (data.tags && data.tags.length > 0) {
        formDataToSend.append("tags", JSON.stringify(data.tags));
      }

      if (data.tableOfContents && data.tableOfContents.length > 0) {
        formDataToSend.append(
          "tableOfContents",
          JSON.stringify(data.tableOfContents),
        );
      }

      formDataToSend.append("isPublished", data.isPublished.toString());
      formDataToSend.append("isFeatured", data.isFeatured.toString());
      formDataToSend.append("sortOrder", data.sortOrder.toString());

      if (data.featuredImages && data.featuredImages.length > 0) {
        formDataToSend.append(
          "featuredImages",
          JSON.stringify(data.featuredImages),
        );
      }

      const response = await sendFormDataRequest(id, formDataToSend);
      console.log('Server response:', response);
      
      return response;
    }
  } catch (error) {
    console.error("Error updating article:", error);
    throw error;
  }
};

// Helper function to send FormData request
async function sendFormDataRequest(
  id: string,
  formData: FormData,
): Promise<Article> {
  const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
    method: "PATCH",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Server error response:", errorText);
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const responseData = await response.json();
  console.log("Server response in sendFormDataRequest:", responseData);
  
  // Ensure featuredImages is properly set in the response
  if (responseData.featuredImages) {
    console.log('Featured images in response:', responseData.featuredImages);
  }
  
  return responseData;
}

// Delete article (soft delete)
export const deleteArticle = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error deleting article:", error);
    throw error;
  }
};

// Get featured articles
export const getFeaturedArticles = async (limit = 10): Promise<Article[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/articles/featured?limit=${limit}`,
      {
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching featured articles:", error);
    throw error;
  }
};

// Get popular articles
export const getPopularArticles = async (limit = 10): Promise<Article[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/articles/popular?limit=${limit}`,
      {
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching popular articles:", error);
    throw error;
  }
};

// Bulk delete articles
export const bulkDeleteArticles = async (ids: string[]): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/articles/bulk-delete`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error bulk deleting articles:", error);
    throw error;
  }
};

// Bulk update articles status
export const bulkUpdateArticlesStatus = async (
  ids: string[],
  updates: Partial<Pick<Article, "isPublished" | "isFeatured">>,
): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/articles/bulk-update`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids, updates }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error bulk updating articles:", error);
    throw error;
  }
};

// Helper function to convert base64 to blob
function base64ToBlob(base64: string): Blob {
  const parts = base64.split(";base64,");
  const contentType = parts[0].split(":")[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}
