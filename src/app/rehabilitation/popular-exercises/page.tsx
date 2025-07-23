"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getExercises } from "@/lib/api/exercises";
import { useLanguage } from "@/i18n/language-context";
import type { Exercise } from "@/types/categories";
import { 
  FireIcon,
  PlayIcon,
  StarIcon,
  HeartIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  VideoCameraIcon,
  CheckCircleIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";

export default function PopularExercisesPage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const data = await getExercises();
      setExercises(data);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-full">
                <FireIcon className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              {t('popularExercises')}
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              {t('popularExercisesDesc')}
            </p>
            <div className="flex justify-center gap-4 text-white/90">
              <div className="flex items-center gap-2">
                <PlayIcon className="h-5 w-5" />
                <span>{t('totalVideos')}</span>
              </div>
              <div className="flex items-center gap-2">
                <StarIcon className="h-5 w-5" />
                <span>{t('rating')}</span>
              </div>
              <div className="flex items-center gap-2">
                <HeartIcon className="h-5 w-5" />
                <span>{t('likes')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exercises Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.map((exercise) => (
            <div key={exercise.id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all group relative overflow-hidden">
              {/* Image */}
              <div className="relative h-48">
                {exercise.thumbnailImage && typeof exercise.thumbnailImage === 'string' && (
                  <img 
                    src={exercise.thumbnailImage} 
                    alt={exercise.name[language]} 
                    className="w-full h-full object-cover"
                  />
                )}
                
                {/* Difficulty Badge */}
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1 ${
                    exercise.difficulty === 'easy' ? 'bg-green-100/90 backdrop-blur-sm text-green-800' :
                    exercise.difficulty === 'medium' ? 'bg-yellow-100/90 backdrop-blur-sm text-yellow-800' :
                    'bg-red-100/90 backdrop-blur-sm text-red-800'
                  }`}>
                    {t(exercise.difficulty)}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {exercise.name[language]}
                </h3>

                {/* Description */}
                {exercise.description?.[language] && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {exercise.description[language]}
                  </p>
                )}

                {/* Exercise Details */}
                <div className="space-y-2 text-sm text-gray-500">
                  {exercise.repetitions && (
                    <div className="flex items-center gap-2">
                      <ChartBarIcon className="h-4 w-4" />
                      <span>{t('repetitions')}: {exercise.repetitions}</span>
                    </div>
                  )}
                  
                  {exercise.sets && (
                    <div className="flex items-center gap-2">
                      <ArrowTrendingUpIcon className="h-4 w-4" />
                      <span>{t('sets')}: {exercise.sets}</span>
                    </div>
                  )}
                  
                  {exercise.duration && (
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4" />
                      <span>{t('duration')}: {exercise.duration}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {exercises.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <FireIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">{t('noExercisesFound')}</h3>
          </div>
        )}
      </div>
    </div>
  );
} 