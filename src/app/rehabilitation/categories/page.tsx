"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAllCategories, deleteCategory, type Category } from "@/lib/api/categories";
import { useLanguage } from "@/i18n/language-context";
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  FolderIcon,
  RectangleStackIcon,
  TagIcon,
  FireIcon,
  EyeIcon,
  EyeSlashIcon
} from "@heroicons/react/24/outline";
import { 
  CheckCircleIcon as CheckCircleIconSolid,
  XCircleIcon as XCircleIconSolid 
} from "@heroicons/react/24/solid";

export default function CategoriesPage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getAllCategories();
      // ვფილტრავთ მხოლოდ კატეგორიებს (parentId არ აქვს)
      const categoriesOnly = data.filter((item: any) => !item.parentId);
      setCategories(categoriesOnly);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirmDelete'))) return;
    
    try {
      await deleteCategory(id);
      setCategories(prev => prev.filter(cat => cat._id !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
      alert(t('errorDeleting'));
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name[language].toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.[language]?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-full">
                <FolderIcon className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              {t('categoryManagement')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">{t('management')}</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              {t('categoryManagementDesc')}
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => router.push('/rehabilitation/categories/add')}
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all"
              >
                <PlusIcon className="h-5 w-5" />
                {t('addNewCategory')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('searchCategories')}
            className="w-full px-4 py-3 pl-12 bg-white rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <div key={category._id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all group relative overflow-hidden">
              {/* Image */}
              <div className="relative h-48">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name[language]}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <FolderIcon className="h-16 w-16 text-gray-300" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  {category.isPublished ? (
                    <div className="bg-blue-100/90 backdrop-blur-sm text-blue-800 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1">
                      <EyeIcon className="h-4 w-4" />
                      {t('published')}
                    </div>
                  ) : (
                    <div className="bg-yellow-100/90 backdrop-blur-sm text-yellow-800 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1">
                      <EyeSlashIcon className="h-4 w-4" />
                      {t('draft')}
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {category.name[language]}
                </h3>

                {/* Description */}
                {category.description?.[language] && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {category.description[language]}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  {/* Primary Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => router.push(`/rehabilitation/categories/${category._id}/sets`)}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-xl text-sm font-medium transition-all"
                    >
                      <RectangleStackIcon className="h-4 w-4" />
                      {t('sets')}
                    </button>
                    
                    <button
                      onClick={() => router.push(`/rehabilitation/categories/${category._id}/subcategories`)}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-3 rounded-xl text-sm font-medium transition-all"
                    >
                      <FolderIcon className="h-4 w-4" />
                      {t('subcategories')}
                    </button>
                  </div>
                  
                  {/* Secondary Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => router.push(`/rehabilitation/categories/${category._id}/edit`)}
                      className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                    >
                      <PencilIcon className="h-4 w-4" />
                      {t('edit')}
                    </button>
                    
                    <button
                      onClick={() => handleDelete(category._id)}
                      className="flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                    >
                      <TrashIcon className="h-4 w-4" />
                      {t('delete')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCategories.length === 0 && categories.length > 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <MagnifyingGlassIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">{t('searchNotFound')}</h3>
            <p className="text-gray-500 mb-6">{t('tryDifferentSearch')}</p>
            <button
              onClick={() => setSearchTerm('')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('clearSearch')}
            </button>
          </div>
        )}

        {/* No Categories State */}
        {categories.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <FolderIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">{t('noCategories')}</h3>
            <p className="text-gray-500 mb-6">{t('startFirstCategory')}</p>
            <button 
              onClick={() => router.push('/rehabilitation/categories/add')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-all"
            >
              {t('createFirstCategory')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 