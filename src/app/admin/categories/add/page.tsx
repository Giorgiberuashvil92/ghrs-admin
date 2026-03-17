"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createCourseCategory } from "@/lib/api/course-categories";
import { useLanguage } from "@/i18n/language-context";
import { TrashIcon, PhotoIcon, LinkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";

const API_BASE_URL =
  process.env.NODE_ENV === "development"
    ? process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
    : process.env.NEXT_PUBLIC_API_URL || "https://ghrs-backend.onrender.com";

const BASE = "/admin/categories";

async function createCourseCategoryWithFile(formData: FormData) {
  const response = await fetch(`${API_BASE_URL}/api/course-categories`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(err.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

const ImagePreview = ({ src, alt }: { src: string; alt: string }) => (
  <img src={src} alt={alt} className="h-24 w-24 rounded-lg object-cover" />
);

export default function AdminAddCategoryPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isImageUrlInput, setIsImageUrlInput] = useState(false);
  const imageFileRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: { en: "", ru: "" },
    description: { en: "", ru: "" },
    imageUrl: "",
    isActive: true,
    isPublished: false,
    sortOrder: 0,
  });

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
    if (!formData.name.en && !formData.name.ru) {
      alert(t("pleaseEnterEnglishOrRussianName"));
      return; 
    }
    setLoading(true);
    try {
      if (imageFile || (formData.imageUrl && formData.imageUrl.trim())) {
        const dataToSend = new FormData();
        dataToSend.append("name", JSON.stringify(formData.name));
        dataToSend.append("description", JSON.stringify(formData.description));
        dataToSend.append("isActive", formData.isActive.toString());
        dataToSend.append("isPublished", formData.isPublished.toString());
        dataToSend.append("sortOrder", formData.sortOrder.toString());
        if (imageFile) {
          dataToSend.append("image", imageFile);
        } else if (
          formData.imageUrl?.trim() &&
          /^https?:\/\//.test(formData.imageUrl)
        ) {
          dataToSend.append("imageUrl", formData.imageUrl);
        }
        await createCourseCategoryWithFile(dataToSend);
      } else {
        await createCourseCategory({
          name: formData.name,
          description: formData.description,
          isActive: formData.isActive,
          isPublished: formData.isPublished,
          sortOrder: formData.sortOrder,
        });
      }
      alert(t("categoryCreatedSuccess"));
      router.push(BASE);
    } catch (error) {
      console.error("Error creating category:", error);
      alert(t("categoryCreateError"));
    } finally {
      setLoading(false);
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

  const handleImageUrlSubmit = () => {
    if (formData.imageUrl.trim()) {
      setImagePreview(formData.imageUrl);
      setImageFile(null);
      setIsImageUrlInput(false);
    } else {
      alert(t("pleaseEnterImageUrl"));
    }
  };

  return (
    <div className="p-8">
      <div className="mx-auto max-w-2xl">
        <button
          type="button"
          onClick={() => router.push(BASE)}
          className="mb-4 text-blue-600 hover:text-blue-700"
        >
          ← {t("backToCategories")}
        </button>
        <h1 className="mb-6 text-3xl font-bold">{t("addNewCategory")}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium">
              {t("nameInEnglish")} *
            </label>
            <input
              type="text"
              required
              value={formData.name.en}
              onChange={(e) => handleInputChange("name", "en", e.target.value)}
              className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-blue-500"
              placeholder={t("enterEnglishName")}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">
              {t("nameInRussian")}
            </label>
            <input
              type="text"
              value={formData.name.ru}
              onChange={(e) => handleInputChange("name", "ru", e.target.value)}
              className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-blue-500"
              placeholder={t("enterRussianName")}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">
              {t("descriptionInEnglish")}
            </label>
            <textarea
              value={formData.description.en}
              onChange={(e) =>
                handleInputChange("description", "en", e.target.value)
              }
              className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder={t("enterEnglishDescription")}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">
              {t("descriptionInRussian")}
            </label>
            <textarea
              value={formData.description.ru}
              onChange={(e) =>
                handleInputChange("description", "ru", e.target.value)
              }
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
                  <p className="mt-2 text-sm text-gray-500">
                    {t("noImageUploaded")}
                  </p>
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
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                    placeholder={t("enterImageUrl")}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                  <Button type="button" onClick={handleImageUrlSubmit} size="sm">
                    {t("add")}
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? t("creating") : t("create")}
            </button>
            <button
              type="button"
              onClick={() => router.push(BASE)}
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
