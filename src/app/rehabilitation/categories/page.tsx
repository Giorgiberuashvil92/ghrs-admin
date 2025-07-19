"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAllCategories, deleteCategory, type Category } from "@/lib/api/categories";

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('დარწმუნებული ხართ?')) return;
    
    try {
      await deleteCategory(id);
      setCategories(prev => prev.filter(cat => cat._id !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
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

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">კატეგორიები</h1>
        <button 
          onClick={() => router.push('/rehabilitation/categories/add')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          + ახალი კატეგორია
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category._id} className="border rounded-lg p-4 shadow-sm">
            {category.image && (
              <img 
                src={category.image} 
                alt={category.name.ka} 
                className="w-full h-48 object-cover rounded mb-4"
              />
            )}
            
            <h3 className="text-xl font-semibold mb-2">{category.name.ka}</h3>
            
            {category.description?.ka && (
              <p className="text-gray-600 mb-4">{category.description.ka}</p>
            )}
            
            <div className="flex gap-2">
              <span className={`px-2 py-1 rounded text-sm ${
                category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {category.isActive ? 'აქტიური' : 'არააქტიური'}
              </span>
              
              <span className={`px-2 py-1 rounded text-sm ${
                category.isPublished ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {category.isPublished ? 'გამოქვეყნებული' : 'ნაბოლოი'}
              </span>
            </div>
            
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => router.push(`/rehabilitation/categories/${category._id}/sets`)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
              >
                სეტები
              </button>
              
              <button
                onClick={() => router.push(`/rehabilitation/categories/${category._id}/edit`)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
              >
                რედაქტირება
              </button>
              
              <button
                onClick={() => handleDelete(category._id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
              >
                წაშლა
              </button>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">კატეგორიები არ არის</p>
          <button 
            onClick={() => router.push('/rehabilitation/categories/add')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            შექმენი პირველი კატეგორია
          </button>
        </div>
      )}
    </div>
  );
} 