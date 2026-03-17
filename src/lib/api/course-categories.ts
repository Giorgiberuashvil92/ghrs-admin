/**
 * კურსების კატეგორიების API (Professional Development) — ცალკე რეაბილიტაციის categories-სგან.
 */

const API_BASE_URL =
  process.env.NODE_ENV === "development"
    ? process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
    : process.env.NEXT_PUBLIC_API_URL || "https://ghrs-backend.onrender.com";

const BASE = `${API_BASE_URL}/api/course-categories`;

export interface LocalizedString {
  ka?: string;
  en: string;
  ru?: string;
}

export interface CourseCategoryType {
  _id: string;
  name: LocalizedString;
  description?: LocalizedString;
  image?: string;
  isActive: boolean;
  isPublished: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
  parentId?: string;
}

export async function getAllCourseCategories(): Promise<CourseCategoryType[]> {
  const res = await fetch(BASE, { credentials: "include", headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

export async function getCourseCategoryById(id: string): Promise<CourseCategoryType> {
  const res = await fetch(`${BASE}/${id}`, { credentials: "include", headers: { Accept: "application/json" } });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP error! status: ${res.status}`);
  }
  return res.json();
}

export async function createCourseCategory(data: {
  name: LocalizedString;
  description?: LocalizedString;
  image?: string;
  isActive?: boolean;
  isPublished?: boolean;
  sortOrder?: number;
}): Promise<CourseCategoryType> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP error! status: ${res.status}`);
  }
  return res.json();
}

export async function updateCourseCategory(
  id: string,
  data: Partial<{
    name: LocalizedString;
    description: LocalizedString;
    image: string;
    isActive: boolean;
    isPublished: boolean;
    sortOrder: number;
  }>
): Promise<CourseCategoryType> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP error! status: ${res.status}`);
  }
  return res.json();
}

export async function deleteCourseCategory(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE", credentials: "include" });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
}

// ——— საბკატეგორიები ———

export async function getCourseSubcategoryById(
  parentId: string,
  subId: string
): Promise<CourseCategoryType> {
  const res = await fetch(`${BASE}/${parentId}/subcategories/${subId}`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP error! status: ${res.status}`);
  }
  return res.json();
}

export async function getCourseSubcategories(parentId: string): Promise<CourseCategoryType[]> {
  const res = await fetch(`${BASE}/${parentId}/subcategories`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

export async function createCourseSubcategory(
  parentId: string,
  data: {
    name: LocalizedString;
    description?: LocalizedString;
    image?: string;
    isActive?: boolean;
    isPublished?: boolean;
    sortOrder?: number;
  }
): Promise<CourseCategoryType> {
  const res = await fetch(`${BASE}/${parentId}/subcategories`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP error! status: ${res.status}`);
  }
  return res.json();
}

export async function updateCourseSubcategory(
  parentId: string,
  subId: string,
  data: Partial<{
    name: LocalizedString;
    description: LocalizedString;
    image: string;
    isActive: boolean;
    isPublished: boolean;
    sortOrder: number;
  }>
): Promise<CourseCategoryType> {
  const res = await fetch(`${BASE}/${parentId}/subcategories/${subId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP error! status: ${res.status}`);
  }
  return res.json();
}

export async function deleteCourseSubcategory(parentId: string, subId: string): Promise<void> {
  const res = await fetch(`${BASE}/${parentId}/subcategories/${subId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
}
