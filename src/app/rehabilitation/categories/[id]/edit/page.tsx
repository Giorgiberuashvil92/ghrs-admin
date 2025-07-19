"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCategoryById, updateCategory, type Category } from "@/lib/api/categories";

interface EditCategoryPageProps {
  params: { id: string };
}

export default function EditCategoryPage({ params }: EditCategoryPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [category, setCategory] = useState<Category | null>(null);
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
    image: "",
    isActive: true,
    isPublished: false,
    sortOrder: 0
  });

  useEffect(() => {
    fetchCategory();
  }, [params.id]);

  const fetchCategory = async () => {
    try {
      setFetchLoading(true);
      const data = await getCategoryById(params.id);
      setCategory(data);
      setFormData({
        name: data.name || { ka: "", en: "", ru: "" },
        description: data.description || { ka: "", en: "", ru: "" },
        image: data.image || "",
        isActive: data.isActive,
        isPublished: data.isPublished,
        sortOrder: data.sortOrder || 0
      });
    } catch (error) {
      console.error('Error fetching category:', error);
      alert('კატეგორიის ჩატვირთვისას შეცდომა');
      router.push('/rehabilitation/categories');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleInputChange = (field: string, lang: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field as keyof typeof prev] as any,
        [lang]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.ka) {
      alert('გთხოვთ შეიყვანოთ კატეგორიის ქართული სახელი');
      return;
    }
    
    setLoading(true);
    
    try {
      await updateCategory(params.id, formData);
      alert('კატეგორია წარმატებით განახლდა');
      router.push('/rehabilitation/categories');
    } catch (error) {
      console.error('Error updating category:', error);
      alert('შეცდომა კატეგორიის განახლებისას');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">კატეგორია იტვირთება...</div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-red-500">კატეგორია ვერ მოიძებნა</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">კატეგორიის რედაქტირება</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ქართული სახელი */}
          <div>
            <label className="block text-sm font-medium mb-2">სახელი (ქართული) *</label>
            <input
              type="text"
              required
              value={formData.name.ka}
              onChange={(e) => handleInputChange('name', 'ka', e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="მაგ. ორთოპედია"
            />
          </div>

          {/* ინგლისური სახელი */}
          <div>
            <label className="block text-sm font-medium mb-2">სახელი (ინგლისური)</label>
            <input
              type="text"
              value={formData.name.en}
              onChange={(e) => handleInputChange('name', 'en', e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Orthopedics"
            />
          </div>

          {/* რუსული სახელი */}
          <div>
            <label className="block text-sm font-medium mb-2">სახელი (რუსული)</label>
            <input
              type="text"
              value={formData.name.ru}
              onChange={(e) => handleInputChange('name', 'ru', e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="напр. Ортопедия"
            />
          </div>

          {/* ქართული აღწერა */}
          <div>
            <label className="block text-sm font-medium mb-2">აღწერა (ქართული)</label>
            <textarea
              value={formData.description.ka}
              onChange={(e) => handleInputChange('description', 'ka', e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="კატეგორიის აღწერა..."
            />
          </div>

          {/* ინგლისური აღწერა */}
          <div>
            <label className="block text-sm font-medium mb-2">აღწერა (ინგლისური)</label>
            <textarea
              value={formData.description.en}
              onChange={(e) => handleInputChange('description', 'en', e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Category description..."
            />
          </div>

          {/* რუსული აღწერა */}
          <div>
            <label className="block text-sm font-medium mb-2">აღწერა (რუსული)</label>
            <textarea
              value={formData.description.ru}
              onChange={(e) => handleInputChange('description', 'ru', e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Описание категории..."
            />
          </div>

          {/* სურათის URL */}
          <div>
            <label className="block text-sm font-medium mb-2">სურათის URL</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* რიგითობა */}
          <div>
            <label className="block text-sm font-medium mb-2">რიგითობა</label>
            <input
              type="number"
              value={formData.sortOrder}
              onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              min="0"
            />
          </div>

          {/* სტატუსები */}
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="mr-2"
              />
              <label htmlFor="isActive" className="text-sm font-medium">აქტიური</label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublished"
                checked={formData.isPublished}
                onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                className="mr-2"
              />
              <label htmlFor="isPublished" className="text-sm font-medium">გამოქვეყნებული</label>
            </div>
          </div>

          {/* ღილაკები */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push('/rehabilitation/categories')}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              გაუქმება
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'ინახება...' : 'შენახვა'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 