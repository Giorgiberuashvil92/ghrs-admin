import axios from "axios";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://grs-bkbc.onrender.com/api";
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Categories API
export const categoriesApi = {
  // Public endpoints
  getAll: () => apiClient.get("/categories"),
  getAllWithSubcategories: () =>
    apiClient.get("/categories/with-subcategories"),
  getAllSubcategories: () => apiClient.get("/categories/subcategories"),
  getHierarchy: () => apiClient.get("/categories/hierarchy"),
  getById: (id: string) => apiClient.get(`/categories/${id}`),
  getWithChildren: (id: string) =>
    apiClient.get(`/categories/${id}/with-children`),
  getSubcategories: (id: string) =>
    apiClient.get(`/categories/${id}/subcategories`),

  // Admin endpoints
  create: (data: FormData) =>
    apiClient.post("/admin/categories", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  update: (id: string, data: FormData) =>
    apiClient.put(`/admin/categories/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  delete: (id: string) => apiClient.delete(`/admin/categories/${id}`),

  // Subcategories admin endpoints
  createSubcategory: (categoryId: string, data: FormData) =>
    apiClient.post(`/categories/${categoryId}/subcategories`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  updateSubcategory: (categoryId: string, subId: string, data: FormData) =>
    apiClient.put(
      `/admin/categories/${categoryId}/subcategories/${subId}`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    ),
  deleteSubcategory: (categoryId: string, subId: string) =>
    apiClient.delete(`/admin/categories/${categoryId}/subcategories/${subId}`),
};
