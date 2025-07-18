'use client';

import Link from 'next/link';
import { Set } from '@/types/sets';
import { Category } from '@/lib/api/categories';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@heroicons/react/24/outline';

interface SetsClientProps {
  initialSets: Set[];
  category: Category;
}

export default function SetsClient({ initialSets, category }: SetsClientProps) {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">
            {category.name.ka} - სეტები
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            კატეგორიაში არსებული სეტების სია
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button
            variant="add"
            size="lg"
            className="gap-2"
            asChild
          >
            <Link href={`/rehabilitation/categories/${category._id}/sets/add`}>
              <PlusIcon className="h-5 w-5" />
              სეტის დამატება
            </Link>
          </Button>
        </div>
      </div>

      {initialSets.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">სეტები არ არის</h3>
          <p className="mt-1 text-sm text-gray-500">
            დაიწყეთ ახალი სეტის დამატებით.
          </p>
          <div className="mt-6">
            <Button
              variant="add"
              size="lg"
              className="gap-2"
              asChild
            >
              <Link href={`/rehabilitation/categories/${category._id}/sets/add`}>
                <PlusIcon className="h-5 w-5" />
                სეტის დამატება
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        სახელი
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        სტატუსი
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        ფასი (თვიური)
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">რედაქტირება</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {initialSets.map((set) => (
                      <tr key={set._id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                          <div className="flex items-center">
                            {set.thumbnailImage && (
                              <div className="h-10 w-10 flex-shrink-0">
                                <img className="h-10 w-10 rounded-full object-cover" src={set.thumbnailImage} alt="" />
                              </div>
                            )}
                            <div className="ml-4">
                              <div className="font-medium text-gray-900">{set.name.ka}</div>
                              {set.description && (
                                <div className="text-gray-500">{set.description.ka}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            set.isActive && set.isPublished
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {set.isActive && set.isPublished ? 'აქტიური' : 'არააქტიური'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {set.price.monthly}₾
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/rehabilitation/categories/${category._id}/sets/${set._id}/exercises`}
                              className="text-blue-600 hover:text-blue-900"
                              title="სავარჯიშოები"
                            >
                              სავარჯიშოები
                            </Link>
                            <Link
                              href={`/rehabilitation/categories/${category._id}/sets/${set._id}/edit`}
                              className="text-primary hover:text-opacity-90"
                            >
                              რედაქტირება
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 