// Videos API Library - REAL DYNAMIC DATA ONLY!
// უკავშირდება რეალურ backend-ს, არა mock data-ს

// *** API BASE CONFIG ***
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://grs-bkbc.onrender.com";

// *** INTERFACES ***
export interface Video {
  id: string;
  name: string;
  categoryId: string;
  setId: string;
  resolution: string;
  format: string;
  url: string;
  size?: string;
  duration?: number;
  createdAt?: string;
}

export interface VideoFilters {
  page?: number;
  limit?: number;
  categoryCode?: string;
  setId?: string;
  resolution?: string;
  format?: string;
  search?: string;
}

export interface VideoResponse {
  videos: Video[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface VideoStats {
  total: number;
  categories: Record<string, number>;
  sets: Record<string, number>;
  resolutions: Record<string, number>;
  formats: Record<string, number>;
  totalSize: string;
  avgDuration: number;
}

export interface Category {
  id: string;
  name: string;
}

export interface VideoSet {
  id: string;
  name: string;
  category: string;
}

// *** HELPER FUNCTIONS ***
const handleApiResponse = async (response: Response, endpoint: string) => {
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ ${endpoint} failed:`, response.status, errorText);
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();

  console.log(`🔍 ${endpoint} raw response:`, data);

  // თუ მონაცემები პირდაპირ ბრუნდება (localhost:4000 სტილი)
  if (data && typeof data === "object" && !data.success) {
    console.log(`✅ ${endpoint} returning direct data`);
    return data;
  }

  // თუ NextJS სტილის wrapper-ია {success: true, data: ...}
  if (data.success) {
    console.log(`✅ ${endpoint} returning wrapped data`);
    return data.data;
  }

  // თუ error message-ია
  if (!data.success && data.message) {
    console.error(`❌ ${endpoint} error:`, data.message);
    throw new Error(data.message || "API request failed");
  }

  // უცნობი ფორმატი
  console.warn(`⚠️ ${endpoint} unknown response format:`, data);
  return data;
};

// *** MAIN API FUNCTIONS ***

/**
 * 🎥 GET /api/videos?page=1&limit=20&categoryCode=01&setId=001&resolution=1080p&format=m4v
 * დინამიური ვიდეო მონაცემები pagination-ით და ფილტრებით
 */
export const fetchVideos = async (
  filters: VideoFilters = {},
): Promise<VideoResponse> => {
  const {
    page = 1,
    limit = 20,
    categoryCode,
    setId,
    resolution,
    format,
    search,
  } = filters;

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (categoryCode) params.append("categoryCode", categoryCode);
  if (setId) params.append("setId", setId);
  if (resolution) params.append("resolution", resolution);
  if (format) params.append("format", format);
  if (search) params.append("search", search);

  const endpoint = `${API_BASE_URL}/api/videos?${params}`;

  try {
    console.log("🚀 Fetching videos:", endpoint);

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    });

    const data = await handleApiResponse(response, "fetchVideos");

    console.log("✅ Videos loaded:", data);

    // თუ პირდაპირ videos array და pagination არის
    if (data.videos && Array.isArray(data.videos)) {
      return {
        videos: data.videos,
        pagination: data.pagination || {
          page: page,
          limit: limit,
          total: data.total || data.videos.length,
          totalPages:
            data.pages || Math.ceil((data.total || data.videos.length) / limit),
          hasNext: false,
          hasPrev: false,
        },
      };
    }

    // თუ პირდაპირ array ბრუნდება
    if (Array.isArray(data)) {
      return {
        videos: data,
        pagination: {
          page: page,
          limit: limit,
          total: data.length,
          totalPages: Math.ceil(data.length / limit),
          hasNext: false,
          hasPrev: false,
        },
      };
    }

    // თუ შეიცავს total, pages თვისებებს (შენი API format)
    if (data.total && data.pages) {
      return {
        videos: data.videos || [],
        pagination: {
          page: page,
          limit: limit,
          total: data.total,
          totalPages: data.pages,
          hasNext: page < data.pages,
          hasPrev: page > 1,
        },
      };
    }

    // Fallback
    return {
      videos: [],
      pagination: {
        page: page,
        limit: limit,
        total: 0,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
  } catch (error) {
    console.error("❌ fetchVideos failed:", error);
    throw error;
  }
};

/**
 * 📊 GET /api/videos/stats
 * დინამიური ვიდეო სტატისტიკა
 */
export const fetchVideoStats = async (): Promise<VideoStats> => {
  const endpoint = `${API_BASE_URL}/api/videos/stats`;

  try {
    console.log("🚀 Fetching video stats:", endpoint);

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    });

    const data = await handleApiResponse(response, "fetchVideoStats");

    console.log("✅ Stats loaded:", {
      total: data.total,
      categories: Object.keys(data.categories).length,
    });
    return data;
  } catch (error) {
    console.error("❌ fetchVideoStats failed:", error);
    throw error;
  }
};

/**
 * 🎬 GET /api/videos/:id
 * ცალკეული ვიდეოს დინამიური დეტალები
 */
export const fetchVideoById = async (id: string): Promise<Video | null> => {
  const endpoint = `${API_BASE_URL}/api/videos/${id}`;

  try {
    console.log("🚀 Fetching video by ID:", endpoint);

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    });

    if (response.status === 404) {
      console.log("ℹ️ Video not found:", id);
      return null;
    }

    const data = await handleApiResponse(response, "fetchVideoById");

    console.log("✅ Video loaded:", data.name);
    return data;
  } catch (error) {
    console.error("❌ fetchVideoById failed:", error);
    return null;
  }
};

/**
 * 📂 GET /api/categories
 * დინამიური კატეგორიები
 */
export const fetchCategories = async (): Promise<Category[]> => {
  const endpoint = `${API_BASE_URL}/api/categories`;

  try {
    console.log("🚀 Fetching categories:", endpoint);

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    });

    const data = await handleApiResponse(response, "fetchCategories");

    console.log("✅ Categories loaded:", data.length);
    return data;
  } catch (error) {
    console.error("❌ fetchCategories failed:", error);

    // Fallback - ლოკალური კატეგორიები თუ API არ მუშაობს
    console.log("⚠️ Using fallback categories");
    return [
      { id: "01", name: "Orthopedics" },
      { id: "02", name: "Neurology" },
      { id: "03", name: "Aphasia and Dysarthria" },
      { id: "04", name: "Obesity" },
      { id: "05", name: "Post-traumatic Rehabilitation" },
      { id: "06", name: "Senior's Zone" },
      { id: "07", name: "COVID-19 Rehabilitation" },
      { id: "09", name: "updateTest" },
    ];
  }
};

/**
 * 📦 GET /api/sets
 * დინამიური sets
 */
export const fetchSets = async (): Promise<VideoSet[]> => {
  const endpoint = `${API_BASE_URL}/api/sets`;

  try {
    console.log("🚀 Fetching sets:", endpoint);

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    });

    const data = await handleApiResponse(response, "fetchSets");

    console.log("✅ Sets loaded:", data.length);
    return data;
  } catch (error) {
    console.error("❌ fetchSets failed:", error);

    // Fallback - ლოკალური sets თუ API არ მუშაობს
    console.log("⚠️ Using fallback sets");
    return [
      { id: "001", name: "Basic Set 1", category: "01" },
      { id: "002", name: "Basic Set 2", category: "01" },
      { id: "003", name: "Basic Set 3", category: "02" },
      { id: "016", name: "Obesity Set 1", category: "04" },
      { id: "017", name: "Obesity Set 2", category: "04" },
      { id: "018", name: "Obesity Set 3", category: "04" },
      { id: "019", name: "Obesity Set 4", category: "04" },
      { id: "020", name: "Obesity Set 5", category: "04" },
      { id: "021", name: "Senior Zone Set 1", category: "06" },
      { id: "022", name: "Senior Zone Set 2", category: "06" },
      { id: "023", name: "Senior Zone Set 3", category: "06" },
      { id: "024", name: "Senior Zone Set 4", category: "06" },
      { id: "025", name: "Senior Zone Set 5", category: "06" },
      { id: "026", name: "Senior Zone Set 6", category: "06" },
      { id: "027", name: "Senior Zone Set 7", category: "06" },
    ];
  }
};

/**
 * 🎵 GET /api/formats
 * დინამიური ფორმატები
 */
export const fetchFormats = async (): Promise<string[]> => {
  const endpoint = `${API_BASE_URL}/api/formats`;

  try {
    console.log("🚀 Fetching formats:", endpoint);

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    });

    const data = await handleApiResponse(response, "fetchFormats");

    console.log("✅ Formats loaded:", data);
    return data;
  } catch (error) {
    console.error("❌ fetchFormats failed:", error);

    // Fallback
    console.log("⚠️ Using fallback formats");
    return ["m4v", "mp4", "mov"];
  }
};

/**
 * 📺 GET /api/resolutions
 * დინამიური რეზოლუციები
 */
export const fetchResolutions = async (): Promise<string[]> => {
  const endpoint = `${API_BASE_URL}/api/resolutions`;

  try {
    console.log("🚀 Fetching resolutions:", endpoint);

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    });

    const data = await handleApiResponse(response, "fetchResolutions");

    console.log("✅ Resolutions loaded:", data);
    return data;
  } catch (error) {
    console.error("❌ fetchResolutions failed:", error);

    // Fallback
    console.log("⚠️ Using fallback resolutions");
    return ["720p", "1080p", "4K"];
  }
};

// *** LEGACY SUPPORT (Static functions) ***
// ეს ფუნქციები ჯერ კიდევ ეყრდნობა local data-ს, მაგრამ მომავალში წაიშლება

export const getCategories = () => {
  console.warn("⚠️ getCategories is deprecated! Use fetchCategories() instead");
  return [
    { id: "01", name: "Orthopedics" },
    { id: "02", name: "Neurology" },
    { id: "03", name: "Aphasia and Dysarthria" },
    { id: "04", name: "Obesity" },
    { id: "05", name: "Post-traumatic Rehabilitation" },
    { id: "06", name: "Senior's Zone" },
    { id: "07", name: "COVID-19 Rehabilitation" },
    { id: "09", name: "updateTest" },
  ];
};

export const getSets = () => {
  console.warn("⚠️ getSets is deprecated! Use fetchSets() instead");
  return [
    { id: "001", name: "Basic Set 1", category: "01" },
    { id: "002", name: "Basic Set 2", category: "01" },
    { id: "003", name: "Basic Set 3", category: "02" },
    { id: "016", name: "Obesity Set 1", category: "04" },
    { id: "017", name: "Obesity Set 2", category: "04" },
    { id: "018", name: "Obesity Set 3", category: "04" },
    { id: "019", name: "Obesity Set 4", category: "04" },
    { id: "020", name: "Obesity Set 5", category: "04" },
    { id: "021", name: "Senior Zone Set 1", category: "06" },
    { id: "022", name: "Senior Zone Set 2", category: "06" },
    { id: "023", name: "Senior Zone Set 3", category: "06" },
    { id: "024", name: "Senior Zone Set 4", category: "06" },
    { id: "025", name: "Senior Zone Set 5", category: "06" },
    { id: "026", name: "Senior Zone Set 6", category: "06" },
    { id: "027", name: "Senior Zone Set 7", category: "06" },
  ];
};

// *** DEFAULT EXPORT ***
export default {
  // Main API functions
  fetchVideos,
  fetchVideoStats,
  fetchVideoById,

  // Dynamic data fetchers
  fetchCategories,
  fetchSets,
  fetchFormats,
  fetchResolutions,

  // Legacy (will be removed)
  getCategories,
  getSets,
};
