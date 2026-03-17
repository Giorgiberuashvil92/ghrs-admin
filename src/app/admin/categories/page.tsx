"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getAllCourseCategories,
  deleteCourseCategory,
  type CourseCategoryType,
} from "@/lib/api/course-categories";
import { useLanguage } from "@/i18n/language-context";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  FolderIcon,
  TagIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

const BASE = "/admin/categories";

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [categories, setCategories] = useState<CourseCategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getAllCourseCategories();
      const categoriesOnly = data.filter((item) => !item.parentId);
      setCategories(categoriesOnly);
    } catch (error) {
      console.error("Error fetching course categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirmDelete"))) return;
    try {
      await deleteCourseCategory(id);
      setCategories((prev) => prev.filter((cat) => cat._id !== id));
    } catch (error) {
      console.error("Error deleting course category:", error);
      alert(t("errorDeleting"));
    }
  };

  const lang = (language === "ka" ? "ka" : language === "ru" ? "ru" : "en") as "ka" | "en" | "ru";
  const filteredCategories = categories.filter(
    (category) =>
                (category.name[lang] || category.name?.en || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (category.description?.[lang] || category.description?.en || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
                <TagIcon className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
              {t("categoryManagement")}{" "}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                {t("management")}
              </span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-blue-100">
              {t("categoryManagementDesc")}
            </p>
            <button
              onClick={() => router.push(`${BASE}/add`)}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3 text-white backdrop-blur-sm transition-all hover:bg-white/20"
            >
              <PlusIcon className="h-5 w-5" />
              {t("addNewCategory")}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t("searchCategories")}
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="mx-auto px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((category) => (
            <div
              key={category._id}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-lg"
            >
              <div className="relative h-44">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={(category.name[lang] || category.name?.en) || ""}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-100">
                    <FolderIcon className="h-16 w-16 text-gray-300" />
                  </div>
                )}
                <div className="absolute left-4 top-4">
                  {category.isPublished ? (
                    <span className="flex items-center gap-1 rounded-lg bg-blue-100/90 px-3 py-1 text-sm font-medium text-blue-800 backdrop-blur-sm">
                      <EyeIcon className="h-4 w-4" />
                      {t("published")}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-lg bg-yellow-100/90 px-3 py-1 text-sm font-medium text-yellow-800 backdrop-blur-sm">
                      <EyeSlashIcon className="h-4 w-4" />
                      {t("draft")}
                    </span>
                  )}
                </div>
              </div>
              <div className="p-5">
                <h3 className="mb-2 text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-600">
                  {(category.name[lang] || category.name?.en) || ""}
                </h3>
                {category.description?.[lang] && (
                  <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                    {category.description[lang]}
                  </p>
                )}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() =>
                      router.push(`${BASE}/${category._id}/subcategories`)
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-3 text-sm font-medium text-white transition-all hover:from-purple-600 hover:to-purple-700"
                  >
                    <FolderIcon className="h-4 w-4" />
                    {t("subcategories")}
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() =>
                        router.push(`${BASE}/${category._id}/edit`)
                      }
                      className="flex items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                    >
                      <PencilIcon className="h-4 w-4" />
                      {t("edit")}
                    </button>
                    <button
                      onClick={() => handleDelete(category._id)}
                      className="flex items-center justify-center gap-2 rounded-xl bg-red-100 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-200"
                    >
                      <TrashIcon className="h-4 w-4" />
                      {t("delete")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && categories.length > 0 && (
          <div className="py-16 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
              <MagnifyingGlassIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="mb-2 text-xl font-medium text-gray-900">
              {t("searchNotFound")}
            </h3>
            <p className="mb-6 text-gray-500">{t("tryDifferentSearch")}</p>
            <button
              onClick={() => setSearchTerm("")}
              className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
            >
              {t("clearSearch")}
            </button>
          </div>
        )}

        {categories.length === 0 && (
          <div className="py-16 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
              <FolderIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="mb-2 text-xl font-medium text-gray-900">
              {t("noCategories")}
            </h3>
            <p className="mb-6 text-gray-500">{t("startFirstCategory")}</p>
            <button
              onClick={() => router.push(`${BASE}/add`)}
              className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-white transition-all hover:from-blue-700 hover:to-purple-700"
            >
              {t("createFirstCategory")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
