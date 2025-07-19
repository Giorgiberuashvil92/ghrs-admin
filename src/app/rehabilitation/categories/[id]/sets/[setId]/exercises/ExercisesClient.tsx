'use client';

import Link from 'next/link';
import { Exercise } from '@/types/categories';
import { Category } from '@/lib/api/categories';
import { SubCategory } from '@/types/categories';
import { Set } from '@/types/sets';
import { Button } from '@/components/ui/button';
import { PlusIcon, PlayIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface ExercisesClientProps {
  category: Category;
  set: Set;
  initialExercises: Exercise[];
  subcategory?: SubCategory; // ოფციონალური საბ კატეგორია
}

const ImageComponent = ({ src, alt }: { src: string; alt: string }) => {
  if (src.startsWith('data:')) {
    return (
      <img
        src={src}
        alt={alt}
        className="h-10 w-10 rounded-full object-cover"
      />
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className="h-10 w-10 rounded-full object-cover"
    />
  );
};

export default function ExercisesClient({ category, set, initialExercises, subcategory }: ExercisesClientProps) {
  // Build paths dynamically based on whether we have a subcategory
  const basePath = subcategory 
    ? `/rehabilitation/categories/${category._id}/subcategories/${subcategory._id}`
    : `/rehabilitation/categories/${category._id}`;
  
  const addExercisePath = `${basePath}/sets/${set._id}/exercises/add`;
  
  const title = subcategory 
    ? `${category.name.ka} › ${subcategory.name.ka} › ${set?.name?.ka} - სავარჯიშოები`
    : `${category.name.ka} › ${set?.name?.ka} - სავარჯიშოები`;
    
  const description = "სეტში არსებული სავარჯიშოების სია";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">
            {title}
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            {description}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button
            variant="add"
            size="lg"
            className="gap-2"
            asChild
          >
            <Link href={addExercisePath}>
              <PlusIcon className="h-5 w-5" />
              სავარჯიშოს დამატება
            </Link>
          </Button>
        </div>
      </div>

      {initialExercises.length === 0 ? (
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
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">სავარჯიშოები არ არის</h3>
          <p className="mt-1 text-sm text-gray-500">
            დაიწყეთ ახალი სავარჯიშოს დამატებით.
          </p>
          <div className="mt-6">
            <Button
              variant="add"
              size="lg"
              className="gap-2"
              asChild
            >
              <Link href={addExercisePath}>
                <PlusIcon className="h-5 w-5" />
                სავარჯიშოს დამატება
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
                        სავარჯიშო
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        სირთულე
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        ხანგრძლივობა
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        სტატუსი
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">მოქმედებები</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {initialExercises.map((exercise) => (
                      <tr key={exercise.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                          <div className="flex items-center">
                            {exercise.thumbnailImage && (
                              <div className="h-10 w-10 flex-shrink-0">
                                <ImageComponent
                                  src={exercise.thumbnailImage as string}
                                  alt=""
                                />
                              </div>
                            )}
                            <div className="ml-4">
                              <div className="font-medium text-gray-900">{exercise.name.ka}</div>
                              {exercise.description && (
                                <div className="text-gray-500">{exercise.description.ka}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            exercise.difficulty === 'easy'
                              ? 'bg-green-100 text-green-800'
                              : exercise.difficulty === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {exercise.difficulty === 'easy' ? 'მარტივი' : 
                             exercise.difficulty === 'medium' ? 'საშუალო' : 'რთული'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {exercise.duration}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            exercise.isActive && exercise.isPublished
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {exercise.isActive && exercise.isPublished ? 'აქტიური' : 'არააქტიური'}
                          </span>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <div className="flex justify-end gap-2">
                            {exercise.videoFile && (
                              <button
                                className="text-blue-600 hover:text-blue-900"
                                title="ვიდეოს ნახვა"
                              >
                                <PlayIcon className="h-4 w-4" />
                              </button>
                            )}
                            <Link
                              href={`${basePath}/sets/${set._id}/exercises/${exercise.id}/edit`}
                              className="text-primary hover:text-opacity-90"
                              title="რედაქტირება"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Link>
                            <button
                              className="text-red-600 hover:text-red-900"
                              title="წაშლა"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
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