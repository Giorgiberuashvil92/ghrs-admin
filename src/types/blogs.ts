import { LocalizedString } from "./categories";

// Updated LocalizedString for blogs (only English and Russian)
export interface BlogLocalizedString {
  en: string;
  ru: string;
}

// Blog interface for main entity
export interface Blog {
  _id: string;
  title: BlogLocalizedString;
  description: BlogLocalizedString;
  excerpt: BlogLocalizedString;
  imageUrl: string; // Single image URL
  categoryId: string;
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
  sortOrder: number;
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

// Create Blog Data for API
export interface CreateBlogData {
  title: BlogLocalizedString;
  description: BlogLocalizedString;
  excerpt: BlogLocalizedString;
  imageUrl?: string;
  categoryId: string;
  tags?: string[];
  isPublished?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
}

// Update Blog Data for API
export interface UpdateBlogData {
  title?: BlogLocalizedString;
  description?: BlogLocalizedString;
  excerpt?: BlogLocalizedString;
  imageUrl?: string;
  categoryId?: string;
  tags?: string[];
  isPublished?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
}

// Blogs list filters
export interface BlogFilters {
  status: 'all' | 'published' | 'draft' | 'featured';
  categoryId?: string;
  search?: string;
  dateRange?: [Date, Date] | null;
}

// Pagination config (reusing from articles)
export interface PaginationConfig {
  page: number;
  limit: number;
  total: number;
}

// Blogs state for state management
export interface BlogsState {
  blogs: Blog[];
  loading: boolean;
  error: string | null;
  filters: BlogFilters;
  pagination: PaginationConfig;
}

// API Request/Response types
export type CreateBlogRequest = {
  formData: CreateBlogData | FormData | Record<string, string>;
  isFormData: boolean;
};

export type BlogListResponse = {
  blogs: Blog[];
  total: number;
  page: number;
  limit: number;
}; 