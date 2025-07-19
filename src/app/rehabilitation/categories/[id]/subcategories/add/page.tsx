"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSubCategory, getCategoryById, type Category } from "@/lib/api/categories";
import { LocalizedString } from "@/types/categories";

interface AddSubCategoryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function AddSubCategoryPage({ params }: AddSubCategoryPageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: { ka: '', en: '', ru: '' } as LocalizedString,
    description: { ka: '', en: '', ru: '' } as LocalizedString,
    image: '',
    isActive: true,
    isPublished: false,
    sortOrder: 0
  });

  useEffect(() => {
    fetchCategory();
  }, [resolvedParams.id]);

  const fetchCategory = async () => {
    try {
      const categoryData = await getCategoryById(resolvedParams.id);
      setCategory(categoryData);
    } catch (error) {
      console.error('Error fetching category:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createSubCategory(resolvedParams.id, formData);
      alert('საბ კატეგორია წარმატებით დაემატა');
      router.push(`/rehabilitation/categories/${resolvedParams.id}/subcategories`);
    } catch (error) {
      console.error('Error creating subcategory:', error);
      alert('შეცდომა საბ კატეგორიის შექმნისას');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: 'name' | 'description', language: 'ka' | 'en' | 'ru', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [language]: value
      }
    }));
  };

  if (!category) {
    return (
      <div className="p-8">
        <div className="animate-pulse">იტვირთება...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6">
            <button 
              onClick={() => router.push(`/rehabilitation/categories/${resolvedParams.id}/subcategories`)}
              className="text-purple-100 hover:text-white mb-2 flex items-center"
            >
              ← უკან საბ კატეგორიებზე
            </button>
            <h1 className="text-3xl font-bold text-white">ახალი საბ კატეგორია</h1>
            <p className="text-purple-100 mt-2">
              {category.name.ka}-ში საბ კატეგორიის დამატება
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* სახელი */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  სახელი (ქართული) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name.ka}
                  onChange={(e) => handleInputChange('name', 'ka', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="მაგ. ქვედა კიდურები"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  სახელი (ინგლისური)
                </label>
                <input
                  type="text"
                  value={formData.name.en}
                  onChange={(e) => handleInputChange('name', 'en', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="e.g. Lower Limbs"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  სახელი (რუსული)
                </label>
                <input
                  type="text"
                  value={formData.name.ru}
                  onChange={(e) => handleInputChange('name', 'ru', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="напр. Нижние конечности"
                />
              </div>
            </div>

            {/* აღწერა */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  აღწერა (ქართული)
                </label>
                <textarea
                  rows={4}
                  value={formData.description.ka}
                  onChange={(e) => handleInputChange('description', 'ka', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  placeholder="საბ კატეგორიის აღწერა..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  აღწერა (ინგლისური)
                </label>
                <textarea
                  rows={4}
                  value={formData.description.en}
                  onChange={(e) => handleInputChange('description', 'en', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  placeholder="Subcategory description..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  აღწერა (რუსული)
                </label>
                <textarea
                  rows={4}
                  value={formData.description.ru}
                  onChange={(e) => handleInputChange('description', 'ru', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  placeholder="Описание подкатегории..."
                />
              </div>
            </div>

            {/* სურათის URL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                სურათის URL
              </label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* რიგითი ნომერი */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                რიგითი ნომერი
              </label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="0"
                min="0"
              />
            </div>

            {/* სტატუსები */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                სტატუსები
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-x-3">
                  <input
                    id="is-active"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="is-active" className="block text-sm font-semibold leading-6 text-gray-900">
                    აქტიური
                  </label>
                </div>

                <div className="flex items-center gap-x-3">
                  <input
                    id="is-published"
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="is-published" className="block text-sm font-semibold leading-6 text-gray-900">
                    გამოქვეყნებული
                  </label>
                </div>
              </div>
            </div>

            {/* ღილაკები */}
            <div className="border-t border-gray-200 pt-8 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.push(`/rehabilitation/categories/${resolvedParams.id}/subcategories`)}
                disabled={loading}
                className="rounded-xl px-8 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold disabled:opacity-50"
              >
                გაუქმება
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ინახება...
                  </div>
                ) : (
                  'საბ კატეგორიის შექმნა'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 