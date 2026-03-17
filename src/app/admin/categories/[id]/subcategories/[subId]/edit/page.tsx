"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getCourseCategoryById,
  getCourseSubcategoryById,
  updateCourseSubcategory,
  type CourseCategoryType,
} from "@/lib/api/course-categories";
import { useLanguage } from "@/i18n/language-context";
import { TrashIcon, PhotoIcon, LinkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";

const API_BASE_URL =
  process.env.NODE_ENV === "development"
    ? process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
    : process.env.NEXT_PUBLIC_API_URL || "https://ghrs-backend.onrender.com";

const BASE = "/admin/categories";

async function updateCourseSubcategoryWithFile(
  parentId: string,
  subId: string,
  formData: FormData
) {
  const res = await fetch(
    `${API_BASE_URL}/api/course-categories/${parentId}/subcategories/${subId}`,
    { method: "PATCH", credentials: "include", body: formData }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP error! status: ${res.status}`);
  }
  return res.json();
}

const ImagePreview = ({ src, alt }: { src: string; alt: string }) => (
  <img src={src} alt={alt} className="h-24 w-24 rounded-lg object-cover" />
);

interface PageProps {
  params: Promise<{ id: string; subId: string }>;
}

export default function AdminEditSubcategoryPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const { t } = useLanguage();
  const [category, setCategory] = useState<CourseCategoryType | null>(null);
  const [sub, setSub] = useState<CourseCategoryType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isImageUrlInput, setIsImageUrlInput] = useState(false);
  const imageFileRef = React.useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: { ka: "", en: "", ru: "" },
    description: { ka: "", en: "", ru: "" },
    imageUrl: "",
    isActive: true,
    isPublished: false,
    sortOrder: 0,
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [cat, subData] = await Promise.all([
          getCourseCategoryById(resolvedParams.id),
          getCourseSubcategoryById(resolvedParams.id, resolvedParams.subId),
        ]);
        setCategory(cat);
        setSub(subData);
        setFormData({
          name: subData.name || { ka: "", en: "", ru: "" },
          description: subData.description || { ka: "", en: "", ru: "" },
          imageUrl: subData.image || "",
          isActive: subData.isActive ?? true,
          isPublished: subData.isPublished ?? false,
          sortOrder: subData.sortOrder ?? 0,
        });
        setImagePreview(subData.image || null);
      } catch {
        setCategory(null);
        setSub(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [resolvedParams.id, resolvedParams.subId]);

  const handleInputChange = (field: string, lang: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...(prev[field as keyof typeof prev] as Record<string, string>),
        [lang]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sub) return;
    if (!formData.name.ka && !formData.name.en) {
      alert(t("pleaseEnterGeorgianName"));
      return;
    }
    setSaving(true);
    try {
      if (imageFile || (formData.imageUrl && formData.imageUrl.trim())) {
        const dataToSend = new FormData();
        dataToSend.append("name", JSON.stringify(formData.name));
        dataToSend.append("description", JSON.stringify(formData.description));
        dataToSend.append("isActive", formData.isActive.toString());
        dataToSend.append("isPublished", formData.isPublished.toString());
        dataToSend.append("sortOrder", formData.sortOrder.toString());
        if (imageFile) dataToSend.append("image", imageFile);
        else if (
          formData.imageUrl?.trim() &&
          /^https?:\/\//.test(formData.imageUrl)
        )
          dataToSend.append("imageUrl", formData.imageUrl);
        await updateCourseSubcategoryWithFile(
          resolvedParams.id,
          resolvedParams.subId,
          dataToSend
        );
      } else {
        await updateCourseSubcategory(resolvedParams.id, resolvedParams.subId, {
          name: formData.name,
          description: formData.description,
          isActive: formData.isActive,
          isPublished: formData.isPublished,
          sortOrder: formData.sortOrder,
          ...(imagePreview && { image: imagePreview }),
        });
      }
      alert(t("subcategoryUpdatedSuccess") || "ქვეკატეგორია განახლდა");
      router.push(`${BASE}/${resolvedParams.id}/subcategories`);
    } catch (error) {
      console.error("Error updating subcategory:", error);
      alert(t("errorUpdatingSubcategory") || "შეცდომა განახლებისას");
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setImageFile(file);
        setFormData((prev) => ({ ...prev, imageUrl: "" }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageDelete = () => {
    setImagePreview(null);
    setImageFile(null);
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
    if (imageFileRef.current) imageFileRef.current.value = "";
  };

  if (loading || !category || !sub) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mx-auto max-w-2xl">
        <button
          type="button"
          onClick={() => router.push(`${BASE}/${resolvedParams.id}/subcategories`)}
          className="mb-4 text-blue-600 hover:text-blue-700"
        >
          ← {t("backToSubcategories")}
        </button>
        <h1 className="mb-6 text-3xl font-bold">
          {t("editSubcategory") || "ქვეკატეგორიის რედაქტირება"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium">{t("nameInGeorgian")} *</label>
            <input
              type="text"
              value={formData.name.ka}
              onChange={(e) => handleInputChange("name", "ka", e.target.value)}
              className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-blue-500"
              placeholder={t("enterGeorgianName")}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">{t("nameInEnglish")}</label>
            <input
              type="text"
              value={formData.name.en}
              onChange={(e) => handleInputChange("name", "en", e.target.value)}
              className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-blue-500"
              placeholder={t("enterEnglishName")}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">{t("nameInRussian")}</label>
            <input
              type="text"
              value={formData.name.ru}
              onChange={(e) => handleInputChange("name", "ru", e.target.value)}
              className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-blue-500"
              placeholder={t("enterRussianName")}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">{t("descriptionInGeorgian")}</label>
            <textarea
              value={formData.description.ka}
              onChange={(e) => handleInputChange("description", "ka", e.target.value)}
              className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder={t("enterGeorgianDescription")}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">{t("descriptionInEnglish")}</label>
            <textarea
              value={formData.description.en}
              onChange={(e) => handleInputChange("description", "en", e.target.value)}
              className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder={t("enterEnglishDescription")}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">{t("descriptionInRussian")}</label>
            <textarea
              value={formData.description.ru}
              onChange={(e) => handleInputChange("description", "ru", e.target.value)}
              className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder={t("enterRussianDescription")}
            />
          </div>

          <div className="rounded-xl bg-gray-50 p-6">
            <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
              <PhotoIcon className="mr-2 h-5 w-5" />
              {t("categoryImage")}
            </h3>
            <div className="space-y-4">
              {imagePreview ? (
                <div className="relative">
                  <ImagePreview src={imagePreview} alt={t("thumbnailAlt")} />
                  <button
                    type="button"
                    onClick={handleImageDelete}
                    className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-gray-300 p-6 text-center">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">{t("noImageUploaded")}</p>
                </div>
              )}
              <div className="flex gap-2">
                <input
                  ref={imageFileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => imageFileRef.current?.click()}
                  className="flex-1"
                >
                  <PhotoIcon className="mr-1 h-4 w-4" />
                  {t("file")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsImageUrlInput(!isImageUrlInput)}
                  className="flex-1"
                >
                  <LinkIcon className="mr-1 h-4 w-4" />
                  {t("url")}
                </Button>
              </div>
              {isImageUrlInput && (
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder={t("enterImageUrl")}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (formData.imageUrl.trim()) {
                        setImagePreview(formData.imageUrl);
                        setImageFile(null);
                        setIsImageUrlInput(false);
                      } else alert(t("pleaseEnterImageUrl"));
                    }}
                    size="sm"
                  >
                    {t("add")}
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-purple-600 px-6 py-3 text-white hover:bg-purple-700 disabled:opacity-50"
            >
              {saving ? t("saving") : t("save")}
            </button>
            <button
              type="button"
              onClick={() => router.push(`${BASE}/${resolvedParams.id}/subcategories`)}
              className="rounded-lg bg-gray-100 px-6 py-3 hover:bg-gray-200"
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
