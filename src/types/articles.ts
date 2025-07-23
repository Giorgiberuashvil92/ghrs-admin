import { LocalizedString } from "./categories";

// Article interface for main entity
export interface Article {
  _id: string;
  title: LocalizedString;
  excerpt: LocalizedString;
  content: LocalizedString;
  featuredImages: string[]; // Array of image URLs
  categoryId: string;
  blogId: string; // Reference to parent blog
  readTime: string; // e.g., "5 minutes"
  authorName: string;
  authorBio?: string;
  authorAvatar?: string;
  tableOfContents: TOCItem[];
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
  sortOrder: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

// Table of Contents item
export interface TOCItem {
  title: LocalizedString;
  anchor: string;
}

// Create Article Data for API
export interface CreateArticleData {
  title: LocalizedString;
  excerpt: LocalizedString;
  content: LocalizedString;
  featuredImages?: string[];
  categoryId: string;
  blogId: string; // Reference to parent blog
  readTime: string;
  authorName: string;
  authorBio?: string;
  authorAvatar?: string;
  tableOfContents?: TOCItem[];
  tags?: string[];
  isPublished?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
}

// Update Article Data for API
export interface UpdateArticleData {
  title?: LocalizedString;
  excerpt?: LocalizedString;
  content?: LocalizedString;
  featuredImages?: string[];
  categoryId?: string;
  blogId?: string; // Reference to parent blog
  readTime?: string;
  authorName?: string;
  authorBio?: string;
  authorAvatar?: string;
  tableOfContents?: TOCItem[];
  tags?: string[];
  isPublished?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
}

// Articles list filters
export interface ArticleFilters {
  status: 'all' | 'published' | 'draft' | 'featured';
  categoryId?: string;
  blogId?: string; // Filter by parent blog
  search?: string;
  dateRange?: [Date, Date] | null;
}

// Pagination config
export interface PaginationConfig {
  page: number;
  limit: number;
  total: number;
}

// Articles state for state management
export interface ArticlesState {
  articles: Article[];
  loading: boolean;
  error: string | null;
  filters: ArticleFilters;
  pagination: PaginationConfig;
}

// API Request/Response types
export type CreateArticleRequest = {
  formData: CreateArticleData | FormData;
  isFormData: boolean;
};

export type ArticleListResponse = {
  articles: Article[];
  total: number;
  page: number;
  limit: number;
}; 