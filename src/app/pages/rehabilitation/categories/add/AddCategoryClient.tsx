"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createCategory } from "@/lib/api/categories";
import { useLanguage } from "@/i18n/language-context";

export default function AddCategoryClient() {
  const router = useRouter();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: {
      ka: "",
      en: "",
      ru: ""
    },
    description: {
      ka: "",
      en: "",
      ru: ""
    },
    image: null as File | null,
    isActive: true,
    isPublished: false,
    sortOrder: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createCategory({
        name: formData.name,
        description: formData.description,
        image: formData.image,
        isActive: formData.isActive,
        isPublished: formData.isPublished,
        sortOrder: formData.sortOrder
      });

      toast.success("კატეგორია წარმატებით შეიქმნა");
      
      // დავაყოვნოთ 1 წამით რომ კატეგორიამ მოასწროს შექმნა
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // გადავამისამართოთ კატეგორიების სიაზე
      router.push('/pages/rehabilitation/categories');
      router.refresh();
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("შეცდომა კატეგორიის შექმნისას");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-medium text-slate-900 dark:text-slate-100">
          ახალი კატეგორიის დამატება
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          შეავსეთ ფორმა კატეგორიის დასამატებლად
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* დასახელება - ქართული */}
        <div className="space-y-2">
          <label 
            htmlFor="name-ka"
            className="block text-sm font-medium text-slate-900 dark:text-slate-100"
          >
            დასახელება (ქართულად) <span className="text-red-500">*</span>
          </label>
          <input
            id="name-ka"
            type="text"
            required
            value={formData.name.ka}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              name: { ...prev.name, ka: e.target.value }
            }))}
            placeholder="მაგ: ორთოპედია"
            className="block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-primary"
          />
        </div>

        {/* დასახელება - ინგლისური */}
        <div className="space-y-2">
          <label 
            htmlFor="name-en"
            className="block text-sm font-medium text-slate-900 dark:text-slate-100"
          >
            დასახელება (ინგლისურად) <span className="text-red-500">*</span>
          </label>
          <input
            id="name-en"
            type="text"
            required
            value={formData.name.en}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              name: { ...prev.name, en: e.target.value }
            }))}
            placeholder="e.g. Orthopedics"
            className="block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-primary"
          />
        </div>

        {/* დასახელება - რუსული */}
        <div className="space-y-2">
          <label 
            htmlFor="name-ru"
            className="block text-sm font-medium text-slate-900 dark:text-slate-100"
          >
            დასახელება (რუსულად) <span className="text-red-500">*</span>
          </label>
          <input
            id="name-ru"
            type="text"
            required
            value={formData.name.ru}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              name: { ...prev.name, ru: e.target.value }
            }))}
            placeholder="например: Ортопедия"
            className="block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-primary"
          />
        </div>

        {/* აღწერა - ქართული */}
        <div className="space-y-2">
          <label 
            htmlFor="description-ka"
            className="block text-sm font-medium text-slate-900 dark:text-slate-100"
          >
            აღწერა (ქართულად)
          </label>
          <textarea
            id="description-ka"
            rows={4}
            value={formData.description.ka}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              description: { ...prev.description, ka: e.target.value }
            }))}
            placeholder="დაწერეთ მოკლე აღწერა კატეგორიისთვის..."
            className="block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-primary"
          />
        </div>

        {/* აღწერა - ინგლისური */}
        <div className="space-y-2">
          <label 
            htmlFor="description-en"
            className="block text-sm font-medium text-slate-900 dark:text-slate-100"
          >
            აღწერა (ინგლისურად)
          </label>
          <textarea
            id="description-en"
            rows={4}
            value={formData.description.en}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              description: { ...prev.description, en: e.target.value }
            }))}
            placeholder="Write a short description for the category..."
            className="block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-primary"
          />
        </div>

        {/* აღწერა - რუსული */}
        <div className="space-y-2">
          <label 
            htmlFor="description-ru"
            className="block text-sm font-medium text-slate-900 dark:text-slate-100"
          >
            აღწერა (რუსულად)
          </label>
          <textarea
            id="description-ru"
            rows={4}
            value={formData.description.ru}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              description: { ...prev.description, ru: e.target.value }
            }))}
            placeholder="Напишите краткое описание для категории..."
            className="block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-primary"
          />
        </div>

        {/* სურათი */}
        <div className="space-y-2">
          <label 
            htmlFor="image"
            className="block text-sm font-medium text-slate-900 dark:text-slate-100"
          >
            სურათი
          </label>
          <div className="mt-1 flex justify-center rounded-lg border-2 border-dashed border-slate-200 px-6 py-10 dark:border-slate-800">
            <div className="text-center">
              <div className="mt-4 flex text-sm text-slate-600 dark:text-slate-400">
                <label
                  htmlFor="image"
                  className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
                >
                  <span>აირჩიეთ ფაილი</span>
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFormData(prev => ({ ...prev, image: file }));
                      }
                    }}
                    className="sr-only"
                  />
                </label>
                <p className="pl-1">ან ჩააგდეთ</p>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                PNG, JPG, GIF მაქსიმუმ 10MB
              </p>
            </div>
          </div>
          {formData.image && (
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              არჩეული ფაილი: {formData.image.name}
            </p>
          )}
        </div>

        {/* აქტიურობის სტატუსი */}
        <div className="space-y-2">
          <div className="relative flex items-start">
            <div className="flex h-6 items-center">
              <input
                id="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, isActive: e.target.checked }))
                }
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-600 dark:focus:ring-offset-slate-900"
              />
            </div>
            <div className="ml-3">
              <label 
                htmlFor="isActive" 
                className="text-sm font-medium text-slate-900 dark:text-slate-100"
              >
                აქტიურია
              </label>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                მონიშნეთ თუ კატეგორია აქტიურია
              </p>
            </div>
          </div>
        </div>

        {/* გამოქვეყნების სტატუსი */}
        <div className="space-y-2">
          <div className="relative flex items-start">
            <div className="flex h-6 items-center">
              <input
                id="isPublished"
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, isPublished: e.target.checked }))
                }
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-600 dark:focus:ring-offset-slate-900"
              />
            </div>
            <div className="ml-3">
              <label 
                htmlFor="isPublished" 
                className="text-sm font-medium text-slate-900 dark:text-slate-100"
              >
                გამოქვეყნებულია
              </label>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                მონიშნეთ თუ კატეგორია მზადაა გამოსაქვეყნებლად
              </p>
            </div>
          </div>
        </div>

        {/* სორტირების რიგითობა */}
        <div className="space-y-2">
          <label 
            htmlFor="sortOrder"
            className="block text-sm font-medium text-slate-900 dark:text-slate-100"
          >
            სორტირების რიგითობა
          </label>
          <input
            id="sortOrder"
            type="number"
            min="0"
            value={formData.sortOrder}
            onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
            className="block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-primary"
          />
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            განსაზღვრეთ კატეგორიის პოზიცია სიაში (0-დან ზევით)
          </p>
        </div>

        {/* ქმედებების ღილაკები */}
        <div className="flex items-center justify-end space-x-4 border-t border-slate-200 pt-6 dark:border-slate-800">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => router.back()}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            გაუქმება
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? "მიმდინარეობს..." : "შექმნა"}
          </button>
        </div>
      </form>
    </div>
  );
} 