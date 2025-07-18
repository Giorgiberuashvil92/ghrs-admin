'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateSet, type Set, type UpdateSetData } from '@/lib/api/sets';
import { Category } from '@/lib/api/categories';

interface EditSetClientProps {
  category: Category;
  set: Set;
}

export default function EditSetClient({ category, set }: EditSetClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      
      const setData: UpdateSetData = {
        name: {
          ka: formData.get('name_ka') as string,
          en: formData.get('name_en') as string,
          ru: formData.get('name_ru') as string,
        },
        description: {
          ka: formData.get('description_ka') as string,
          en: formData.get('description_en') as string,
          ru: formData.get('description_ru') as string,
        },
        image: formData.get('image') as File || null,
        isActive: formData.get('isActive') === 'true',
        isPublished: formData.get('isPublished') === 'true',
        prices: [
          { months: 1, price: Number(formData.get('price_1')) },
          { months: 3, price: Number(formData.get('price_3')) },
          { months: 6, price: Number(formData.get('price_6')) },
          { months: 12, price: Number(formData.get('price_12')) },
        ]
      };

      await updateSet(set._id, setData);
      router.push(`/rehabilitation/categories/${category._id}/sets`);
    } catch (err) {
      console.error('Error updating set:', err);
      setError('სეტის განახლება ვერ მოხერხდა. გთხოვთ სცადოთ თავიდან.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">სეტის რედაქტირება - {category.name.ka}</h1>
        <p className="mt-2 text-sm text-gray-700">
          შეავსეთ ფორმა სეტის რედაქტირებისთვის
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          {/* სახელი */}
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">სახელი</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="name_ka" className="block text-sm font-medium text-gray-700">
                  ქართულად
                </label>
                <input
                  type="text"
                  name="name_ka"
                  id="name_ka"
                  required
                  defaultValue={set.name.ka}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="name_en" className="block text-sm font-medium text-gray-700">
                  ინგლისურად
                </label>
                <input
                  type="text"
                  name="name_en"
                  id="name_en"
                  required
                  defaultValue={set.name.en}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="name_ru" className="block text-sm font-medium text-gray-700">
                  რუსულად
                </label>
                <input
                  type="text"
                  name="name_ru"
                  id="name_ru"
                  required
                  defaultValue={set.name.ru}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* აღწერა */}
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">აღწერა</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="description_ka" className="block text-sm font-medium text-gray-700">
                  ქართულად
                </label>
                <textarea
                  name="description_ka"
                  id="description_ka"
                  rows={3}
                  defaultValue={set.description?.ka}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="description_en" className="block text-sm font-medium text-gray-700">
                  ინგლისურად
                </label>
                <textarea
                  name="description_en"
                  id="description_en"
                  rows={3}
                  defaultValue={set.description?.en}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="description_ru" className="block text-sm font-medium text-gray-700">
                  რუსულად
                </label>
                <textarea
                  name="description_ru"
                  id="description_ru"
                  rows={3}
                  defaultValue={set.description?.ru}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* სურათი */}
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">სურათი</h3>
            <div>
              <input
                type="file"
                name="image"
                id="image"
                accept="image/*"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-opacity-90"
              />
              {set.image && (
                <div className="mt-2">
                  <img src={set.image} alt={set.name.ka} className="h-20 w-20 object-cover rounded-md" />
                </div>
              )}
            </div>
          </div>

          {/* ფასები */}
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">ფასები</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div>
                <label htmlFor="price_1" className="block text-sm font-medium text-gray-700">
                  1 თვე
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="number"
                    name="price_1"
                    id="price_1"
                    required
                    min="0"
                    step="0.01"
                    defaultValue={set.prices.find(p => p.months === 1)?.price}
                    className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-primary focus:ring-primary sm:text-sm"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">₾</span>
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="price_3" className="block text-sm font-medium text-gray-700">
                  3 თვე
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="number"
                    name="price_3"
                    id="price_3"
                    required
                    min="0"
                    step="0.01"
                    defaultValue={set.prices.find(p => p.months === 3)?.price}
                    className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-primary focus:ring-primary sm:text-sm"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">₾</span>
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="price_6" className="block text-sm font-medium text-gray-700">
                  6 თვე
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="number"
                    name="price_6"
                    id="price_6"
                    required
                    min="0"
                    step="0.01"
                    defaultValue={set.prices.find(p => p.months === 6)?.price}
                    className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-primary focus:ring-primary sm:text-sm"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">₾</span>
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="price_12" className="block text-sm font-medium text-gray-700">
                  12 თვე
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="number"
                    name="price_12"
                    id="price_12"
                    required
                    min="0"
                    step="0.01"
                    defaultValue={set.prices.find(p => p.months === 12)?.price}
                    className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-primary focus:ring-primary sm:text-sm"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">₾</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* სტატუსი */}
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">სტატუსი</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  value="true"
                  defaultChecked={set.isActive}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="isActive" className="ml-3 block text-sm font-medium text-gray-700">
                  აქტიური
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isPublished"
                  id="isPublished"
                  value="true"
                  defaultChecked={set.isPublished}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="isPublished" className="ml-3 block text-sm font-medium text-gray-700">
                  გამოქვეყნებული
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-5">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              გაუქმება
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-primary py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? 'ინახება...' : 'შენახვა'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 