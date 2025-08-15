'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Exercise } from '@/types/categories';
import { Category } from '@/lib/api/categories';
import { SubCategory } from '@/types/categories';
import { Set } from '@/types/sets';
import { Button } from '@/components/ui/button';
import { 
  PlusIcon, 
  PlayIcon, 
  PencilIcon, 
  TrashIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  FireIcon,
  ChartBarIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import { 
  CheckCircleIcon as CheckCircleIconSolid,
  XCircleIcon as XCircleIconSolid 
} from '@heroicons/react/24/solid';
import { useLanguage } from '@/i18n/language-context';

// Exercise ტიპის გაფართოება, რომ thumbnailUrl იყოს
interface ExerciseWithThumbnailUrl extends Exercise {
  thumbnailUrl?: string;
}

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
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useLanguage();

  console.log(initialExercises)
  
  // Build paths dynamically based on whether we have a subcategory
  const basePath = subcategory 
    ? `/rehabilitation/categories/${category._id}/subcategories/${subcategory._id}`
    : `/rehabilitation/categories/${category._id}`;
  
  const addExercisePath = `${basePath}/sets/${set._id}/exercises/add`;
  
  const title = subcategory 
    ? `${category.name.en} › ${subcategory.name.en} › ${set?.name?.en}`
    : `${category.name.en} › ${set?.name?.en}`;
    
  const description = t('exercisesList');

  // ამოვატრიალოთ მასივი და შემდეგ გავფილტროთ
  const filteredExercises = [...initialExercises].reverse().filter(exercise =>
    exercise.name.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exercise.description?.en.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log(filteredExercises)

  const difficultyLabels = {
    easy: t('easy'),
    medium: t('medium'),
    hard: t('hard')
  };

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800'
  };

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-full">
                <FireIcon className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">{title}</span> - {t('exercises')}
            </h1>
            <p className="text-lg text-blue-100 mb-6 max-w-2xl mx-auto">
              {description}
            </p>
            <div className="flex justify-center gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <ChartBarIcon className="h-5 w-5" />
                <span>{initialExercises.length} {t('exercises')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIconSolid className="h-5 w-5 text-green-400" />
                <span>{initialExercises.filter(ex => ex.isActive && ex.isPublished).length} {t('active')}</span>
              </div>
              <div className="flex items-center gap-2">
                <VideoCameraIcon className="h-5 w-5" />
                <span>{t('videoMaterial')}</span>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-cyan-400/20 rounded-full blur-xl"></div>
      </div>

      {/* Search and Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('searchExercises')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
              />
            </div>
            
            <Link
              href={addExercisePath}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-4 rounded-xl font-medium transition-all"
            >
              <PlusIcon className="h-5 w-5" />
              {t('addNewExercise')}
            </Link>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            {t('foundSets')} {filteredExercises.length} {t('exercises')}
          </h2>
        </div>

        {/* Exercises Grid */}
        {filteredExercises.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredExercises.map((exerciseRaw) => {
              const exercise = exerciseRaw as ExerciseWithThumbnailUrl;
              const imageSrc = exercise.thumbnailImage
                ? exercise.thumbnailImage
                : exercise.thumbnailUrl;
              return (
                <div key={exercise.id} className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  {/* Thumbnail */}
                  <div className="relative overflow-hidden">
                    {imageSrc && typeof imageSrc === 'string' ? (
                      <img 
                        src={imageSrc} 
                        alt={exercise.name.en} 
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center group-hover:from-purple-200 group-hover:to-blue-200 transition-colors duration-300">
                        <ChartBarIcon className="h-16 w-16 text-purple-400" />
                      </div>
                    )}
                    
                    {/* Play Button Overlay */}
                    {exercise.videoFile && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <button className="bg-white/20 backdrop-blur-sm rounded-full p-4 hover:bg-white/30 transition-colors">
                          <PlayIcon className="h-8 w-8 text-white" />
                        </button>
                      </div>
                    )}

                    {/* Duration Badge */}
                    <div className="absolute top-4 right-4">
                      <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1">
                        <ClockIcon className="h-4 w-4" />
                        {exercise.duration}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-4 left-4">
                      {exercise.isActive && exercise.isPublished ? (
                        <div className="bg-green-100/90 backdrop-blur-sm text-green-800 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1">
                          <CheckCircleIconSolid className="h-4 w-4" />
                          {t('active')}
                        </div>
                      ) : (
                        <div className="bg-yellow-100/90 backdrop-blur-sm text-yellow-800 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1">
                          <XCircleIconSolid className="h-4 w-4" />
                          {t('inactive')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Difficulty Badge */}
                    <div className="flex justify-between items-start mb-3">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${difficultyColors[exercise.difficulty]}`}>
                        {difficultyLabels[exercise.difficulty]}
                      </span>
                      <div className="flex items-center gap-1">
                        {exercise.videoFile && (
                          <div className="p-1 bg-blue-100 rounded-full">
                            <VideoCameraIcon className="h-3 w-3 text-blue-600" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {exercise.name.en}
                    </h3>

                    {/* Description */}
                    {exercise.description?.en && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {exercise.description.en}
                      </p>
                    )}

                    {/* Exercise Stats */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">{t('repetitions')}:</span>
                          <span className="font-semibold text-gray-900 ml-2">{exercise.repetitions}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">{t('sets')}:</span>
                          <span className="font-semibold text-gray-900 ml-2">{exercise.sets}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">{t('restTime')}:</span>
                          <span className="font-semibold text-gray-900 ml-2">{exercise.restTime}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      {/* Primary Action */}
                      {exercise.videoFile && (
                        <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-xl text-sm font-medium transition-all">
                          <PlayIcon className="h-4 w-4" />
                          {t('watchVideo')}
                        </button>
                      )}
                      
                      {/* Secondary Actions */}
                      <div className="grid grid-cols-2 gap-3">
                        <Link
                          href={`${basePath}/sets/${set._id}/exercises/${exercise.id}/edit`}
                          className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                        >
                          <PencilIcon className="h-4 w-4" />
                          {t('edit')}
                        </Link>
                        
                        <button className="flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-xl text-sm font-medium transition-all">
                          <TrashIcon className="h-4 w-4" />
                          {t('delete')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty States */
          <div className="text-center py-16">
            {initialExercises.length === 0 ? (
              // No exercises at all
              <>
                <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <ChartBarIcon className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">{t('noExercisesFound')}</h3>
                <p className="text-gray-500 mb-6">{t('startFirstExercise')}</p>
                <Link
                  href={addExercisePath}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-all inline-flex items-center gap-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  {t('createFirstExercise')}
                </Link>
              </>
            ) : (
              // Search returned no results
              <>
                <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <MagnifyingGlassIcon className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">{t('exerciseNotFound')}</h3>
                <p className="text-gray-500 mb-6">{t('tryDifferentSearch')}</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('clearSearch')}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 