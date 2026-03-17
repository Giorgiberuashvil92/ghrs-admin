"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getCourseCategoryById,
  getCourseSubcategories,
  deleteCourseSubcategory,
  type CourseCategoryType,
} from "@/lib/api/course-categories";
import { useLanguage } from "@/i18n/language-context";
import { FolderIcon, PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";

const BASE = "/admin/categories";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminSubcategoriesPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const { t, language } = useLanguage();
  const [category, setCategory] = useState<CourseCategoryType | null>(null);
  const [subcategories, setSubcategories] = useState<CourseCategoryType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [cat, subs] = await Promise.all([
          getCourseCategoryById(resolvedParams.id),
          getCourseSubcategories(resolvedParams.id),
        ]);
        setCategory(cat);
        setSubcategories(subs);
      } catch (e) {
        console.error(e);
        setCategory(null);
        setSubcategories([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [resolvedParams.id]);

  const handleDelete = async (subId: string) => {
    if (!confirm(t("confirmDelete"))) return;
    try {
      await deleteCourseSubcategory(resolvedParams.id, subId);
      setSubcategories((prev) => prev.filter((s) => s._id !== subId));
    } catch (e) {
      console.error(e);
      alert(t("errorDeleting"));
    }
  };

  const lang = (language === "ka" ? "ka" : language === "ru" ? "ru" : "en") as "ka" | "en" | "ru";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="p-8">
        <p className="text-red-500">{t("categoryNotFound")}</p>
        <button
          type="button"
          onClick={() => router.push(BASE)}
          className="mt-4 text-blue-600 hover:underline"
        >
          ← {t("backToCategories")}
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => router.push(BASE)}
          className="text-blue-600 hover:text-blue-700"
        >
          ← {t("backToCategories")}
        </button>
        <h1 className="text-3xl font-bold">
          {(category.name[lang] || category.name?.en) || ""} – {t("subcategories")}
        </h1>
      </div>
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={() => router.push(`${BASE}/${resolvedParams.id}/subcategories/add`)}
          className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
        >
          <PlusIcon className="h-5 w-5" />
          {t("addNewSubcategory")}
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {subcategories.map((sub) => (
          <div
            key={sub._id}
            className="rounded-xl border bg-white p-4 shadow-sm"
          >
            {sub.image && (
              <img
                src={sub.image}
                alt={(sub.name[lang] || sub.name?.en) || ""}
                className="mb-4 h-40 w-full rounded-lg object-cover"
              />
            )}
            {!sub.image && (
              <div className="mb-4 flex h-40 w-full items-center justify-center rounded-lg bg-gray-100">
                <FolderIcon className="h-12 w-12 text-gray-400" />
              </div>
            )}
            <h3 className="mb-2 text-lg font-semibold">
              {(sub.name[lang] || sub.name?.en) || ""}
            </h3>
            {sub.description?.[lang] && (
              <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                {sub.description[lang]}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  router.push(`${BASE}/${resolvedParams.id}/subcategories/${sub._id}/edit`)
                }
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                <PencilIcon className="h-4 w-4" />
                {t("edit")}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(sub._id)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
              >
                <TrashIcon className="h-4 w-4" />
                {t("delete")}
              </button>
            </div>
          </div>
        ))}
      </div>

      {subcategories.length === 0 && (
        <div className="py-12 text-center">
          <p className="mb-4 text-gray-500">{t("noSubcategories")}</p>
          <button
            type="button"
            onClick={() => router.push(`${BASE}/${resolvedParams.id}/subcategories/add`)}
            className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
          >
            {t("createFirstSubcategory")}
          </button>
        </div>
      )}
    </div>
  );
}
