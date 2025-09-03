"use client";

import { useState, useRef, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Exercise, ExerciseFormData, SubCategory } from '@/types/categories';
import { Category } from '@/lib/api/categories';
import { Set } from '@/types/sets';
import { Button } from '@/components/ui/button';
import { getExerciseById, updateExercise } from '@/lib/api/exercises';
import { getCategoryById, getSubCategoryById } from '@/lib/api/categories';
import { getSetById } from '@/lib/api/sets';
import { TrashIcon, PhotoIcon, LinkIcon, VideoCameraIcon, ClockIcon, ChartBarIcon, CogIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '@/i18n/language-context';

interface SubCategoryEditExercisePageProps {
  params: Promise<{
    id: string;
    subId: string;
    setId: string;
    exerciseId: string;
  }>;
}

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

export default function SubCategoryEditExercisePage({ params }: SubCategoryEditExercisePageProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const resolvedParams = use(params);
  
  // Build redirect path for subcategory
  const redirectPath = `/rehabilitation/categories/${resolvedParams.id}/subcategories/${resolvedParams.subId}/sets/${resolvedParams.setId}/exercises`;
  
  const [isLoading, setIsLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategory, setSubcategory] = useState<SubCategory | null>(null);
  const [set, setSet] = useState<Set | null>(null);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isThumbnailUrlInput, setIsThumbnailUrlInput] = useState(false);
  const [isVideoUrlInput, setIsVideoUrlInput] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const thumbnailFileRef = useRef<HTMLInputElement>(null);
  const videoFileRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<ExerciseFormData>({
    name: { en: '', ru: '' },
    description: { en: '', ru: '' },
    videoFile: null,
    thumbnailImage: null,
    videoDuration: '',
    duration: '',
    difficulty: 'medium',
    repetitions: '',
    sets: '',
    restTime: '',
    isActive: true,
    isPublished: false,
    sortOrder: '',
    setId: '',
    categoryId: '',
  });

  const [formErrors, setFormErrors] = useState<{
    name?: boolean;
    description?: boolean;
    videoDuration?: boolean;
    duration?: boolean;
    repetitions?: boolean;
    sets?: boolean;
    restTime?: boolean;
    media?: boolean;
  }>({});

  useEffect(() => {
    fetchData();
  }, [resolvedParams.id, resolvedParams.subId, resolvedParams.setId, resolvedParams.exerciseId]);

  // Debug: watch key state changes
  useEffect(() => {
    console.group('🔎 EDIT STATE SNAPSHOT');
    console.log('params:', resolvedParams);
    console.log('has:', {
      exercise: Boolean(exercise),
      category: Boolean(category),
      subcategory: Boolean(subcategory),
      set: Boolean(set),
    });
    console.log('ids:', {
      exerciseId: (exercise as any)?._id || (exercise as any)?.id,
      categoryId: (category as any)?._id,
      subcategoryId: (subcategory as any)?._id,
      setId: (set as any)?._id,
    });
    console.log('formData:', formData);
    console.groupEnd();
  }, [resolvedParams, exercise, category, subcategory, set, formData]);

  const fetchData = async () => {
    try {
      setFetchLoading(true);
      console.group('📥 Subcategory Edit: fetching data');
      console.log('➡️ getSetById:', resolvedParams.setId);
      const setData = await getSetById(resolvedParams.setId);
      console.log('✅ setData:', setData);

      const derivedCategoryId = ((): string => {
        const raw = (setData as any)?.categoryId;
        if (!raw) return resolvedParams.id;
        if (typeof raw === 'string') return raw;
        if (typeof raw === 'object') return raw._id || raw.id || resolvedParams.id;
        return resolvedParams.id;
      })();

      if (derivedCategoryId !== resolvedParams.id) {
        console.warn('⚠️ params.id და set.categoryId არ ემთხვევა', { paramsId: resolvedParams.id, setCategoryId: derivedCategoryId });
      }

      console.log('➡️ getExerciseById:', resolvedParams.exerciseId);
      console.log('➡️ getCategoryById (effective):', derivedCategoryId);
      console.log('➡️ getSubCategoryById:', resolvedParams.subId);

      const [exerciseData, categoryData, subcategoryData] = await Promise.all([
        getExerciseById(resolvedParams.exerciseId),
        getCategoryById(derivedCategoryId),
        getSubCategoryById(derivedCategoryId, resolvedParams.subId)
      ]);

      setExercise(exerciseData);
      setCategory(categoryData);
      setSubcategory(subcategoryData);
      setSet(setData);

      setFormData({
        name: exerciseData.name || { en: '', ru: '' },
        description: exerciseData.description || { en: '', ru: '' },
        videoFile: null,
        thumbnailImage: null,
        videoDuration: exerciseData.videoDuration || '',
        duration: exerciseData.duration || '',
        difficulty: exerciseData.difficulty || 'medium',
        repetitions: exerciseData.repetitions || '',
        sets: exerciseData.sets || '',
        restTime: exerciseData.restTime || '',
        isActive: exerciseData.isActive ?? true,
        isPublished: exerciseData.isPublished ?? false,
        sortOrder: exerciseData.sortOrder?.toString() || '',
        setId: setData._id,
        categoryId: categoryData._id,
      });

      const thumbSrc = (exerciseData as any).thumbnailImage || (exerciseData as any).thumbnailUrl;
      if (thumbSrc && typeof thumbSrc === 'string') {
        setThumbnailPreview(thumbSrc);
        setThumbnailUrl(thumbSrc);
      }
      const vidUrl = (exerciseData as any).videoUrl || (exerciseData as any).videoFile;
      if (vidUrl && typeof vidUrl === 'string') {
        setVideoPreview(vidUrl);
        setVideoUrl(vidUrl);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert(t('errorLoadingData'));
    } finally {
      setFetchLoading(false);
      console.groupEnd();
    }
  };

  const validateForm = () => {
    const isValidObjectId = (id: string) => /^[a-f\d]{24}$/i.test(id);

    const errors = {
      name: !formData.name.en.trim() || !formData.name.ru.trim(),
      description: !formData.description.en.trim() || !formData.description.ru.trim(),
      videoDuration: !formData.videoDuration.trim(),
      duration: !formData.duration.trim(),
      repetitions: !formData.repetitions.trim(),
      sets: !formData.sets.trim(),
      restTime: !formData.restTime.trim(),
      media: !formData.videoFile && !formData.thumbnailImage && !thumbnailPreview && !videoPreview,
    };
    
    setFormErrors(errors);

    if (!isValidObjectId(formData.setId) || !isValidObjectId(formData.categoryId)) {
      alert(t('categorySubSetNotFound'));
      return false;
    }
    
    return !Object.values(errors).some(Boolean);
  };

  const handleInputChange = (field: keyof typeof formErrors, value: string) => {
    if (value.trim()) {
      setFormErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleMediaChange = () => {
    if (formData.videoFile || formData.thumbnailImage || thumbnailPreview || videoPreview) {
      setFormErrors(prev => ({ ...prev, media: false }));
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
        setFormData({ ...formData, thumbnailImage: file });
        handleMediaChange();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result as string);
        setFormData({ ...formData, videoFile: file });
        handleMediaChange();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleThumbnailDelete = () => {
    setThumbnailPreview(null);
    setThumbnailUrl('');
    setFormData({ ...formData, thumbnailImage: null });
    if (thumbnailFileRef.current) {
      thumbnailFileRef.current.value = '';
    }
  };

  const handleVideoDelete = () => {
    setVideoPreview(null);
    setVideoUrl('');
    setFormData({ ...formData, videoFile: null });
    if (videoFileRef.current) {
      videoFileRef.current.value = '';
    }
  };

  const handleThumbnailUrlSubmit = () => {
    if (thumbnailUrl.trim()) {
      setThumbnailPreview(thumbnailUrl);
      setFormData({ ...formData, thumbnailImage: thumbnailUrl as unknown as File });
      setIsThumbnailUrlInput(false);
      handleMediaChange();
    } else {
      alert(t('pleaseEnterImageUrl'));
    }
  };

  const handleVideoUrlSubmit = () => {
    if (videoUrl.trim()) {
      setVideoPreview(videoUrl);
      setFormData({ ...formData, videoFile: videoUrl as unknown as File });
      setIsVideoUrlInput(false);
      handleMediaChange();
    } else {
      alert(t('pleaseEnterVideoUrl'));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!validateForm()) {
        setIsLoading(false);
        alert(t('pleaseEnterGeorgianName'));
        return;
      }

      if (formData.name.en.includes('http') || formData.description.en.includes('http') ||
          formData.name.ru.includes('http') || formData.description.ru.includes('http')) {
        alert(t('pleaseEnterGeorgianName'));
        setIsLoading(false);
        return;
      }

      const formDataToSend = new FormData();
      
      // ტექსტური ველები
      formDataToSend.append('name', JSON.stringify(formData.name));
      formDataToSend.append('description', JSON.stringify(formData.description));
      formDataToSend.append('videoDuration', formData.videoDuration);
      formDataToSend.append('duration', formData.duration);
      formDataToSend.append('difficulty', formData.difficulty);
      formDataToSend.append('repetitions', formData.repetitions);
      formDataToSend.append('sets', formData.sets);
      formDataToSend.append('restTime', formData.restTime);
      formDataToSend.append('isActive', formData.isActive.toString());
      formDataToSend.append('isPublished', formData.isPublished.toString());
      formDataToSend.append('sortOrder', formData.sortOrder || '0');
      formDataToSend.append('setId', formData.setId);
      formDataToSend.append('categoryId', formData.categoryId);

      // ფაილები ან URL-ები
      if (formData.videoFile instanceof File) {
        formDataToSend.append('videoFile', formData.videoFile);
      } else if (formData.videoFile && typeof formData.videoFile === 'string') {
        formDataToSend.append('videoUrl', formData.videoFile);
      } else if (videoUrl) {
        formDataToSend.append('videoUrl', videoUrl);
      }
      
      if (formData.thumbnailImage instanceof File) {
        formDataToSend.append('thumbnailFile', formData.thumbnailImage);
      } else if (formData.thumbnailImage && typeof formData.thumbnailImage === 'string') {
        formDataToSend.append('thumbnailUrl', formData.thumbnailImage);
      } else if (thumbnailUrl) {
        formDataToSend.append('thumbnailUrl', thumbnailUrl);
      }

      console.log('Updating exercise with data:');
      formDataToSend.forEach((value, key) => {
        if (value instanceof File) {
          console.log(`${key}:`, `File: ${value.name} (${value.type}), size: ${value.size} bytes`);
        } else {
          console.log(`${key}:`, value as any);
        }
      });

      await updateExercise(resolvedParams.exerciseId, formDataToSend);
      alert(t('exerciseUpdatedSuccess'));
      router.push(redirectPath);
      router.refresh();
    } catch (error) {
      console.error('Error updating exercise:', error);
      alert(t('errorUpdatingExercise'));
    } finally {
      setIsLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!exercise || !category || !subcategory || !set) {
    console.warn('🔴 Missing required data for render (edit page):', {
      hasExercise: Boolean(exercise),
      hasCategory: Boolean(category),
      hasSubcategory: Boolean(subcategory),
      hasSet: Boolean(set),
    });
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">{t('categorySubSetNotFound')}</div>
      </div>
    );
  }

  console.log('🧩 Ready to render edit form with:', {
    exerciseId: (exercise as any)?._id || (exercise as any)?.id,
    categoryId: (category as any)?._id,
    subcategoryId: (subcategory as any)?._id,
    setId: (set as any)?._id,
    nameEn: (exercise as any)?.name?.en,
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* DEBUG BANNER */}
      <div className="fixed top-2 left-2 z-50 bg-black text-white text-xs px-2 py-1 rounded">
        Edit Debug: ex={Boolean(exercise) ? '1' : '0'} cat={Boolean(category) ? '1' : '0'} sub={Boolean(subcategory) ? '1' : '0'} set={Boolean(set) ? '1' : '0'}
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">{t('editExercise')}</h1>
            <p className="text-blue-100 mt-2">
              {category.name.ka} › {subcategory.name.ka} › {set.name.ka}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* სახელი */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('nameEn')} *</label>
                <input
                  type="text"
                  required
                  value={formData.name.en}
                  onChange={(e) => {
                    setFormData({ ...formData, name: { ...formData.name, en: e.target.value } });
                    handleInputChange('name', e.target.value);
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${formErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                  placeholder={t('enterExerciseName')}
                />
                {formErrors.name && <p className="mt-1 text-xs text-red-500">{t('requiredField')}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('nameRu')} *</label>
                <input
                  type="text"
                  required
                  value={formData.name.ru}
                  onChange={(e) => {
                    setFormData({ ...formData, name: { ...formData.name, ru: e.target.value } });
                    handleInputChange('name', e.target.value);
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${formErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                  placeholder={t('enterExerciseName')}
                />
                {formErrors.name && <p className="mt-1 text-xs text-red-500">{t('requiredField')}</p>}
              </div>
            </div>

            {/* აღწერა */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('descriptionEn')} *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description.en}
                  onChange={(e) => {
                    setFormData({ ...formData, description: { ...formData.description, en: e.target.value } });
                    handleInputChange('description', e.target.value);
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${formErrors.description ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                  placeholder={t('writeExerciseDescription')}
                />
                {formErrors.description && <p className="mt-1 text-xs text-red-500">{t('requiredField')}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('descriptionRu')} *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description.ru}
                  onChange={(e) => {
                    setFormData({ ...formData, description: { ...formData.description, ru: e.target.value } });
                    handleInputChange('description', e.target.value);
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${formErrors.description ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                  placeholder={t('writeExerciseDescription')}
                />
                {formErrors.description && <p className="mt-1 text-xs text-red-500">{t('requiredField')}</p>}
              </div>
            </div>
            <div className="border-t border-gray-200 pt-8 flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(redirectPath)}
                disabled={isLoading}
                className="rounded-xl px-8 py-3"
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                variant="default"
                disabled={isLoading}
                className="rounded-xl px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {t('updating')}
                  </div>
                ) : (
                  t('updateExercise')
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 