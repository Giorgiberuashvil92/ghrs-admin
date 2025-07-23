"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createCategory } from "@/lib/api/categories";
import { useLanguage } from "@/i18n/language-context";
import { TrashIcon, PhotoIcon, LinkIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

const API_BASE_URL = 'http://localhost:4000';

// ცალკე ფუნქცია ფაილების ატვირთვისთვის
const createCategoryWithFile = async (formData: FormData) => {
  try {
    console.log('Creating category with file upload');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    const response = await fetch(`${API_BASE_URL}/categories`, {
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
    console.error('Error creating category with file:', error);
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

export default function AddCategoryPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isImageUrlInput, setIsImageUrlInput] = useState(false);
  const imageFileRef = useRef<HTMLInputElement>(null);
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
    imageUrl: "",
    isActive: true,
    isPublished: false,
    sortOrder: 0
  });

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
      alert(t('pleaseEnterGeorgianName'));
      return;
    }
    
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

        await createCategoryWithFile(dataToSend);
      } else {
        // ფაილი არ არის, JSON ობიექტი გავაგზავნოთ
        const jsonData = {
          name: formData.name,
          description: formData.description,
          isActive: formData.isActive,
          isPublished: formData.isPublished,
          sortOrder: formData.sortOrder
        };
        
        await createCategory(jsonData);
      }
      
      alert(t('categoryCreatedSuccess'));
      router.push('/rehabilitation/categories');
    } catch (error) {
      console.error('Error creating category:', error);
      alert(t('categoryCreateError'));
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

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{t('addNewCategory')}</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ქართული სახელი */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('nameInGeorgian')} *</label>
            <input
              type="text"
              required
              value={formData.name.ka}
              onChange={(e) => handleInputChange('name', 'ka', e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder={t('enterGeorgianName')}
            />
          </div>

          {/* ინგლისური სახელი */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('nameInEnglish')}</label>
            <input
              type="text"
              value={formData.name.en}
              onChange={(e) => handleInputChange('name', 'en', e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder={t('enterEnglishName')}
            />
          </div>

          {/* რუსული სახელი */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('nameInRussian')}</label>
            <input
              type="text"
              value={formData.name.ru}
              onChange={(e) => handleInputChange('name', 'ru', e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder={t('enterRussianName')}
            />
          </div>

          {/* ქართული აღწერა */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('descriptionInGeorgian')}</label>
            <textarea
              value={formData.description.ka}
              onChange={(e) => handleInputChange('description', 'ka', e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder={t('enterGeorgianDescription')}
            />
          </div>

          {/* ინგლისური აღწერა */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('descriptionInEnglish')}</label>
            <textarea
              value={formData.description.en}
              onChange={(e) => handleInputChange('description', 'en', e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder={t('enterEnglishDescription')}
            />
          </div>

          {/* რუსული აღწერა */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('descriptionInRussian')}</label>
            <textarea
              value={formData.description.ru}
              onChange={(e) => handleInputChange('description', 'ru', e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder={t('enterRussianDescription')}
            />
          </div>

          {/* სურათის URL */}
          <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <PhotoIcon className="h-5 w-5 mr-2" />
                {t('categoryImage')}
              </h3>
              
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700">
                  {t('uploadImage')} *
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
                
                {isImageUrlInput && ( // Add this block for URL input
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder={t('enterImageUrl')}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

          {/* ღილაკები */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
            >
              {loading ? t('creating') : t('create')}
            </button>
            
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 