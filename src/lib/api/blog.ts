// ბლოგის ტიპების განსაზღვრება
export interface BlogArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  categoryId: string;
  authorId: string;
  mainImage?: string;
  images?: string[];
  readTimeMinutes?: number;
  tags?: string[];
  relatedArticleIds?: string[];
  metaTitle?: string;
  metaDescription?: string;
  tableOfContents?: Array<{
    id: number;
    title: string;
    anchor: string;
  }>;
  isPublished?: boolean;
  isFeatured?: boolean;
  commentsCount?: number;
  viewsCount?: number;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  // Populated fields
  category?: {
    id: string;
    name: string;
  };
  author?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface BlogComment {
  id: string;
  articleId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  description?: string;
  articlesCount?: number;
}

// API Types for requests
export type CreateArticleData = {
  title: string;
  content: string;
  excerpt: string;
  categoryId: string;
  authorId: string;
  mainImage?: string;
  images?: string[];
  tags?: string[];
  relatedArticleIds?: string[];
  metaTitle?: string;
  metaDescription?: string;
  tableOfContents?: Array<{
    id: number;
    title: string;
    anchor: string;
  }>;
  isPublished?: boolean;
  isFeatured?: boolean;
};

export type UpdateArticleData = Partial<
  CreateArticleData & {
    slug?: string;
    readTimeMinutes?: number;
  }
>;

export type CreateCommentData = {
  authorName: string;
  authorEmail: string;
  content: string;
};

const API_BASE_URL = process.env.NODE_ENV === 'development'
  ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  : process.env.NEXT_PUBLIC_API_URL || 'https://ghrs-backend.onrender.com';

// სტატიების CRUD ოპერაციები
export async function getAllArticles(params?: {
  page?: number;
  limit?: number;
  categoryId?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<{ articles: BlogArticle[]; total: number; pages: number }> {
  try {
    // ტემპორალური ტესტური მონაცემები
    const testArticles = [
      {
        _id: "685ed1f37bc7c78432601cca",
        title: "ტესტ სტატია",
        excerpt: "ტესტური სტატიის მოკლე აღწერა",
        slug: "test-statia",
        categoryId: "685e84c24b3e14102174ec48",
        images: [],
        readTimeMinutes: 0,
        commentsCount: 0,
        viewsCount: 0,
        isPublished: true,
        isFeatured: false,
        publishedAt: "2025-06-27T17:16:35.089Z",
        tags: [],
        relatedArticleIds: [],
        tableOfContents: [],
        createdAt: "2025-06-27T17:16:35.095Z",
        updatedAt: "2025-06-27T17:16:35.095Z",
        __v: 0,
        content: "ეს არის ტესტური სტატიის შინაარსი",
      },
      {
        _id: "685ed0ba4989e9a0c797b716",
        title: "გიორგი",
        excerpt: "გიორგიგიორგიგიორგიგიორგიგიორგიგიორგიგიორგი",
        slug: "giorgi",
        categoryId: "685e84c24b3e14102174ec48",
        authorId: "admin",
        mainImage:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnnFf6DXcgRxe71BOQm1orHpnKjJloo9c2jg&s",
        images: [],
        readTimeMinutes: 1,
        commentsCount: 0,
        viewsCount: 0,
        isPublished: true,
        isFeatured: true,
        publishedAt: "2025-06-27T17:11:22.792Z",
        tags: ["გიორგი"],
        relatedArticleIds: [],
        metaTitle: "გიორგი",
        metaDescription: "გიორგი",
        tableOfContents: [],
        createdAt: "2025-06-27T17:11:22.798Z",
        updatedAt: "2025-06-27T17:11:22.798Z",
        __v: 0,
        content: "გიორგის შესახებ დეტალური სტატია",
      },
    ];

    // ტესტური მონაცემების ტრანსფორმაცია
    const transformedArticles = testArticles.map((article: any) =>
      transformArticle(article),
    );

    return {
      articles: transformedArticles,
      total: testArticles.length,
      pages: 1,
    };
  } catch (error) {
    console.error("Error fetching articles:", error);
    throw error;
  }
}

export async function searchArticles(query: string): Promise<BlogArticle[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/articles/search?q=${encodeURIComponent(query)}`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.map((article: any) => transformArticle(article));
  } catch (error) {
    console.error("Error searching articles:", error);
    throw error;
  }
}

export async function getFeaturedArticles(): Promise<BlogArticle[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/articles/featured`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.map((article: any) => transformArticle(article));
  } catch (error) {
    console.error("Error fetching featured articles:", error);
    throw error;
  }
}

export async function getArticle(id: string): Promise<BlogArticle> {
  try {
    const response = await fetch(`${API_BASE_URL}/articles/${id}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const article = await response.json();
    return transformArticle(article);
  } catch (error) {
    console.error("Error fetching article:", error);
    throw error;
  }
}

export async function getArticleBySlug(slug: string): Promise<BlogArticle> {
  try {
    const response = await fetch(`${API_BASE_URL}/articles/slug/${slug}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const article = await response.json();
    return transformArticle(article);
  } catch (error) {
    console.error("Error fetching article by slug:", error);
    throw error;
  }
}

export async function getArticlesByCategory(
  categoryId: string,
): Promise<BlogArticle[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/articles/category/${categoryId}`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.map((article: any) => transformArticle(article));
  } catch (error) {
    console.error("Error fetching articles by category:", error);
    throw error;
  }
}

export async function createArticle(
  data: CreateArticleData,
): Promise<BlogArticle> {
  try {
    // slug-ის ავტო-გენერაცია title-დან
    const articleData = {
      ...data,
      slug: generateSlug(data.title),
      readTimeMinutes: calculateReadTime(data.content),
    };

    const response = await fetch(`${API_BASE_URL}/articles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(articleData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const article = await response.json();
    return transformArticle(article);
  } catch (error) {
    console.error("Error creating article:", error);
    throw error;
  }
}

export async function updateArticle(
  id: string,
  data: UpdateArticleData,
): Promise<BlogArticle> {
  try {
    const updateData = { ...data };

    // slug-ის განახლება თუ title შეიცვალა
    if (data.title) {
      updateData.slug = generateSlug(data.title);
    }

    // კითხვის დროის განახლება თუ content შეიცვალა
    if (data.content) {
      updateData.readTimeMinutes = calculateReadTime(data.content);
    }

    const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const article = await response.json();
    return transformArticle(article);
  } catch (error) {
    console.error("Error updating article:", error);
    throw error;
  }
}

export async function deleteArticle(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error deleting article:", error);
    throw error;
  }
}

// კომენტარების CRUD ოპერაციები
export async function getArticleComments(
  articleId: string,
): Promise<BlogComment[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/articles/${articleId}/comments`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.map((comment: any) => transformComment(comment));
  } catch (error) {
    console.error("Error fetching article comments:", error);
    throw error;
  }
}

export async function createComment(
  articleId: string,
  data: CreateCommentData,
): Promise<BlogComment> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/articles/${articleId}/comments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const comment = await response.json();
    return transformComment(comment);
  } catch (error) {
    console.error("Error creating comment:", error);
    throw error;
  }
}

export async function approveComment(commentId: string): Promise<BlogComment> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/comments/${commentId}/approve`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const comment = await response.json();
    return transformComment(comment);
  } catch (error) {
    console.error("Error approving comment:", error);
    throw error;
  }
}

export async function deleteComment(commentId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
}

// ბლოგის კატეგორიები
export async function getBlogCategories(): Promise<BlogCategory[]> {
  try {
    // ტემპორალური ტესტური კატეგორია
    const testCategory = {
      _id: "685e84c24b3e14102174ec48",
      name: "ტესტ კატეგორია",
      description: "ტესტური კატეგორიის აღწერა",
      articlesCount: 2,
    };

    return [
      {
        id: testCategory._id,
        name: testCategory.name,
        description: testCategory.description,
        articlesCount: testCategory.articlesCount,
      },
    ];

    // // ორიგინალური კოდი (კომენტარში)
    // const response = await fetch(`${API_BASE_URL}/blog-categories`);

    // if (!response.ok) {
    //   throw new Error(`HTTP error! status: ${response.status}`);
    // }

    // const data = await response.json();
    // return data.map((category: any) => ({
    //   id: category._id || category.id,
    //   name: category.name,
    //   description: category.description,
    //   articlesCount: category.articlesCount || 0
    // }));
  } catch (error) {
    console.error("Error fetching blog categories:", error);
    throw error;
  }
}

// დამხმარე ფუნქციები
function transformArticle(article: any): BlogArticle {
  return {
    id: article._id || article.id,
    title: article.title,
    content: article.content,
    excerpt: article.excerpt,
    slug: article.slug,
    categoryId: article.categoryId,
    authorId: article.authorId,
    mainImage: article.mainImage,
    images: article.images || [],
    readTimeMinutes: article.readTimeMinutes,
    tags: article.tags || [],
    relatedArticleIds: article.relatedArticleIds || [],
    metaTitle: article.metaTitle,
    metaDescription: article.metaDescription,
    tableOfContents: article.tableOfContents || [],
    isPublished: article.isPublished || false,
    isFeatured: article.isFeatured || false,
    commentsCount: article.commentsCount || 0,
    viewsCount: article.viewsCount || 0,
    publishedAt: article.publishedAt,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    category: article.category,
    author: article.author,
  };
}

function transformComment(comment: any): BlogComment {
  return {
    id: comment._id || comment.id,
    articleId: comment.articleId,
    authorName: comment.authorName,
    authorEmail: comment.authorEmail,
    content: comment.content,
    isApproved: comment.isApproved || false,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  };
}

function generateSlug(title: string): string {
  return (
    title
      .toLowerCase()
      // ქართული ანბანის ლათინური ტრანსლიტერაცია
      .replace(/ა/g, "a")
      .replace(/ბ/g, "b")
      .replace(/გ/g, "g")
      .replace(/დ/g, "d")
      .replace(/ე/g, "e")
      .replace(/ვ/g, "v")
      .replace(/ზ/g, "z")
      .replace(/თ/g, "t")
      .replace(/ი/g, "i")
      .replace(/კ/g, "k")
      .replace(/ლ/g, "l")
      .replace(/მ/g, "m")
      .replace(/ნ/g, "n")
      .replace(/ო/g, "o")
      .replace(/პ/g, "p")
      .replace(/ჟ/g, "zh")
      .replace(/რ/g, "r")
      .replace(/ს/g, "s")
      .replace(/ტ/g, "t")
      .replace(/უ/g, "u")
      .replace(/ფ/g, "f")
      .replace(/ქ/g, "q")
      .replace(/ღ/g, "gh")
      .replace(/ყ/g, "y")
      .replace(/შ/g, "sh")
      .replace(/ჩ/g, "ch")
      .replace(/ც/g, "ts")
      .replace(/ძ/g, "dz")
      .replace(/წ/g, "w")
      .replace(/ჭ/g, "ch")
      .replace(/ხ/g, "kh")
      .replace(/ჯ/g, "j")
      .replace(/ჰ/g, "h")
      // სპეციალური სიმბოლოების მოშორება
      .replace(/[^\w\s-]/g, "")
      // spaces to hyphens
      .replace(/\s+/g, "-")
      // remove multiple hyphens
      .replace(/-+/g, "-")
      // trim hyphens
      .replace(/^-|-$/g, "")
  );
}

function calculateReadTime(content: string): number {
  // Average reading speed is about 200 words per minute
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}
