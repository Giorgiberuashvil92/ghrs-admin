"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createSubCategory, getCategoryById, type Category } from "@/lib/api/categories";
import { LocalizedString } from "@/types/categories";
import { useLanguage } from "@/i18n/language-context";
import { TrashIcon, PhotoIcon, LinkIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

const API_BASE_URL = 'http://localhost:4000';

// ცალკე ფუნქცია ფაილების ატვირთვისთვის
const createSubCategoryWithFile = async (categoryId: string, formData: FormData) => {
  try {
    console.log('Creating subcategory with file upload');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}/subcategories`, {
      method: "POST",
      credentials: 'include',
      body: formData
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('Server error response:', errorData);
        errorMessage = errorData.message || errorMessage;
      } catch (jsonError) {
        try {
          const errorText = await response.text();
          console.error('Server error response (text):', errorText);
          errorMessage = errorText || errorMessage;
        } catch (textError) {
          console.error('Could not parse error response');
        }
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating subcategory with file:', error);
    throw error;
  }
};

const ImageComponent = ({ src, alt }: { src: string; alt: string }) => {
  if (src.startsWith('data:')) {
    return (
      <img
        src={src}
        alt={alt}
        className="h-24 w-24 object-cover rounded-lg"
      />
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className="h-24 w-24 object-cover rounded-lg"
    />
  );
};

interface AddSubCategoryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function AddSubCategoryPage({ params }: AddSubCategoryPageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const { t, language } = useLanguage();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isImageUrlInput, setIsImageUrlInput] = useState(false);
  const imageFileRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: { ka: '', en: '', ru: '' } as LocalizedString,
    description: { ka: '', en: '', ru: '' } as LocalizedString,
    imageUrl: '',
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setImageFile(file);
        setFormData(prev => ({ ...prev, imageUrl: "" })); // Clear URL input if file is chosen
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageDelete = () => {
    setImagePreview(null);
    setImageFile(null);
    setFormData(prev => ({ ...prev, imageUrl: "" }));
    if (imageFileRef.current) {
      imageFileRef.current.value = '';
    }
  };

  const handleImageUrlSubmit = () => {
    if (formData.imageUrl.trim()) {
      setImagePreview(formData.imageUrl);
      setImageFile(null); // Clear file input if URL is chosen
      setIsImageUrlInput(false);
    } else {
      alert(t('pleaseEnterImageUrl'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ფაილი თუ არის, FormData-ს გამოვიყენოთ
      if (imageFile || (formData.imageUrl && formData.imageUrl.trim())) {
        const dataToSend = new FormData();
        dataToSend.append('name', JSON.stringify(formData.name));
        dataToSend.append('description', JSON.stringify(formData.description));
        dataToSend.append('isActive', formData.isActive.toString());
        dataToSend.append('isPublished', formData.isPublished.toString());
        dataToSend.append('sortOrder', formData.sortOrder.toString());

        if (imageFile) {
          dataToSend.append('image', imageFile);
        } else if (formData.imageUrl && formData.imageUrl.trim() && /^https?:\/\//.test(formData.imageUrl)) {
          dataToSend.append('imageUrl', formData.imageUrl);
        }

        await createSubCategoryWithFile(resolvedParams.id, dataToSend);
      } else {
        // ფაილი არ არის, JSON ობიექტი გავაგზავნოთ
        const jsonData = {
          name: formData.name,
          description: formData.description,
          isActive: formData.isActive,
          isPublished: formData.isPublished,
          sortOrder: formData.sortOrder
        };
        
        await createSubCategory(resolvedParams.id, jsonData);
      }
      
      alert(t('subcategoryAddedSuccessfully'));
      router.push(`/rehabilitation/categories/${resolvedParams.id}/subcategories`);
    } catch (error) {
      console.error('Error creating subcategory:', error);
      alert(t('errorCreatingSubcategory'));
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
        <div className="animate-pulse">{t('loading')}</div>
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
              ← {t('backToSubcategories')}
            </button>
            <h1 className="text-3xl font-bold text-white">{t('addNewSubcategory')}</h1>
            <p className="text-purple-100 mt-2">
              {t('addSubcategoryInCategory', { categoryName: category.name[language] || category.name.ka })}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* სახელი */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('nameInGeorgianRequired')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name.ka}
                  onChange={(e) => handleInputChange('name', 'ka', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder={t('exampleLowerLimbs')}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('nameInEnglish')}
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
                  {t('nameInRussian')}
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
                  {t('descriptionInGeorgian')}
                </label>
                <textarea
                  rows={4}
                  value={formData.description.ka}
                  onChange={(e) => handleInputChange('description', 'ka', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  placeholder={t('subcategoryDescriptionPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('descriptionInEnglish')}
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
                  {t('descriptionInRussian')}
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
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <PhotoIcon className="h-5 w-5 mr-2" />
                {t('categoryImage')}
              </h3>
              
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700">
                  {t('uploadImage')}
                </label>
                
                {imagePreview ? (
                  <div className="relative">
                    <ImageComponent src={imagePreview} alt={t('thumbnailAlt')} />
                    <button
                      type="button"
                      onClick={handleImageDelete}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">{t('noImageUploaded')}</p>
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
                    <PhotoIcon className="h-4 w-4 mr-1" />
                    {t('file')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsImageUrlInput(!isImageUrlInput)}
                    className="flex-1"
                  >
                    <LinkIcon className="h-4 w-4 mr-1" />
                    {t('url')}
                  </Button>
                </div>
                
                {isImageUrlInput && (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder={t('enterImageUrl')}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <Button
                      type="button"
                      onClick={handleImageUrlSubmit}
                      size="sm"
                    >
                      {t('add')}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* რიგითი ნომერი */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('sortOrder')}
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
                {t('statuses')}
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
                    {t('active')}
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
                    {t('published')}
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
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {t('saving')}...
                  </div>
                ) : (
                  t('createSubcategory')
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 