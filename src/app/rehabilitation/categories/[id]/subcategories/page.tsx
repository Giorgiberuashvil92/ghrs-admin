"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSubCategories, getCategoryById, deleteSubCategory, type Category } from "@/lib/api/categories";
import { SubCategory } from "@/types/categories";

interface SubCategoriesPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function SubCategoriesPage({ params }: SubCategoriesPageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [resolvedParams.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoryData, subcategoriesData] = await Promise.all([
        getCategoryById(resolvedParams.id),
        getSubCategories(resolvedParams.id)
      ]);
      setCategory(categoryData);
      setSubcategories(subcategoriesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (subCategoryId: string) => {
    if (!confirm('დარწმუნებული ხართ?')) return;
    
    try {
      await deleteSubCategory(resolvedParams.id, subCategoryId);
      setSubcategories(prev => prev.filter(sub => sub._id !== subCategoryId));
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      alert('შეცდომა წაშლისას');
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">იტვირთება...</div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="p-8">
        <div className="text-red-500">კატეგორია ვერ მოიძებნა</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* ღილაკები ზედა */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <button 
            onClick={() => router.push('/rehabilitation/categories')}
            className="text-blue-500 hover:text-blue-600 mb-2 flex items-center"
          >
            ← უკან კატეგორიებზე
          </button>
          <h1 className="text-3xl font-bold">
            {category.name.ka} - საბ კატეგორიები
          </h1>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => router.push(`/rehabilitation/categories/${resolvedParams.id}/sets`)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            ← პირდაპირ სეტები
          </button>
          <button 
            onClick={() => router.push(`/rehabilitation/categories/${resolvedParams.id}/subcategories/add`)}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
          >
            + ახალი საბ კატეგორია
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subcategories.map((subcategory) => (
          <div key={subcategory._id} className="border rounded-lg p-4 shadow-sm">
            {subcategory.image && (
              <img 
                src={subcategory.image} 
                alt={subcategory.name.ka} 
                className="w-full h-48 object-cover rounded mb-4"
              />
            )}
            
            <h3 className="text-xl font-semibold mb-2">{subcategory.name.ka}</h3>
            
            {subcategory.description?.ka && (
              <p className="text-gray-600 mb-4">{subcategory.description.ka}</p>
            )}
            
            <div className="flex gap-2 mb-4">
              <span className={`px-2 py-1 rounded text-sm ${
                subcategory.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {subcategory.isActive ? 'აქტიური' : 'არააქტიური'}
              </span>
              
              <span className={`px-2 py-1 rounded text-sm ${
                subcategory.isPublished ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {subcategory.isPublished ? 'გამოქვეყნებული' : 'ნაბოლოი'}
              </span>
            </div>
            
            <div className="flex flex-col gap-2">
              <button
                onClick={() => router.push(`/rehabilitation/categories/${resolvedParams.id}/subcategories/${subcategory._id}/sets`)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm w-full"
              >
                სეტები ({subcategory.complexes?.length || 0})
              </button>
              
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/rehabilitation/categories/${resolvedParams.id}/subcategories/${subcategory._id}/edit`)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm flex-1"
                >
                  რედაქტირება
                </button>
                
                <button
                  onClick={() => handleDelete(subcategory._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm flex-1"
                >
                  წაშლა
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {subcategories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">საბ კატეგორიები არ არის</p>
          <button 
            onClick={() => router.push(`/rehabilitation/categories/${resolvedParams.id}/subcategories/add`)}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
          >
            შექმენი პირველი საბ კატეგორია
          </button>
        </div>
      )}
    </div>
  );
} 