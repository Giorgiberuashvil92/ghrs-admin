"use client";

import { useState, useRef, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Exercise, ExerciseFormData } from '@/types/categories';
import { Category } from '@/lib/api/categories';
import { Set } from '@/types/sets';
import { Button } from '@/components/ui/button';
import { getExerciseById, updateExercise } from '@/lib/api/exercises';
import { getCategoryById } from '@/lib/api/categories';
import { getSetById } from '@/lib/api/sets';
import { TrashIcon, PhotoIcon, LinkIcon, VideoCameraIcon, ClockIcon, ChartBarIcon, CogIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '@/i18n/language-context';

interface EditExercisePageProps {
  params: Promise<{
    id: string;
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

export default function EditExercisePage({ params }: EditExercisePageProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const resolvedParams = use(params);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [category, setCategory] = useState<Category | null>(null);
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
    name: {
      en: '',
      ru: '',
    },
    description: {
      en: '',
      ru: '',
    },
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
  }, [resolvedParams.id, resolvedParams.setId, resolvedParams.exerciseId]);

  const fetchData = async () => {
    try {
      setFetchLoading(true);
      const [exerciseData, categoryData, setData] = await Promise.all([
        getExerciseById(resolvedParams.exerciseId),
        getCategoryById(resolvedParams.id),
        getSetById(resolvedParams.setId)
      ]);
      
      setExercise(exerciseData);
      setCategory(categoryData);
      setSet(setData);
      
      // Pre-fill form data with existing exercise data
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

      // Set previews for existing media
      if (exerciseData.thumbnailImage && typeof exerciseData.thumbnailImage === 'string') {
        setThumbnailPreview(exerciseData.thumbnailImage);
        setThumbnailUrl(exerciseData.thumbnailImage);
      }
      if (exerciseData.videoFile && typeof exerciseData.videoFile === 'string') {
        setVideoPreview(exerciseData.videoFile);
        setVideoUrl(exerciseData.videoFile);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert(t('errorLoadingData'));
    } finally {
      setFetchLoading(false);
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
      alert(t('invalidId'));
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
        alert(t('pleaseFillAllRequiredFields'));
        return;
      }

      if (formData.name.ka.includes('http') || formData.description.ka.includes('http')) {
        alert(t('pleaseEnterTextNotUrls'));
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
      for (let [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          console.log(`${key}:`, `File: ${value.name} (${value.type}), size: ${value.size} bytes`);
        } else {
          console.log(`${key}:`, value);
        }
      }

      await updateExercise(resolvedParams.exerciseId, formDataToSend);  
      alert(t('exerciseUpdatedSuccessfully'));
      router.push(`/rehabilitation/categories/${resolvedParams.id}/sets/${resolvedParams.setId}/exercises`);
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

  if (!exercise || !category || !set) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">{t('exerciseCategoryOrSetNotFound')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">{t('editExercise')}</h1>
            <p className="text-blue-100 mt-2">
              {category.name.ka} / {set.name.ka}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* სახელი */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name-en" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('nameEn')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name.en}
                  onChange={(e) => {
                    setFormData({ ...formData, name: { ...formData.name, en: e.target.value } });
                    handleInputChange('name', e.target.value);
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    formErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder={t('enterExerciseName')}
                />
                {formErrors.name && (
                  <p className="mt-1 text-xs text-red-500">{t('requiredField')}</p>
                )}
              </div>

              <div>
                <label htmlFor="name-ru" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('nameRu')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name.ru}
                  onChange={(e) => {
                    setFormData({ ...formData, name: { ...formData.name, ru: e.target.value } });
                    handleInputChange('name', e.target.value);
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    formErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder={t('enterExerciseName')}
                />
                {formErrors.name && (
                  <p className="mt-1 text-xs text-red-500">{t('requiredField')}</p>
                )}
              </div>
            </div>

            {/* აღწერა */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="description-en" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('descriptionEn')} *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description.en}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      description: {
                        ...formData.description,
                        en: e.target.value
                      }
                    });
                    handleInputChange('description', e.target.value);
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                    formErrors.description ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder={t('writeExerciseDescription')}
                />
                {formErrors.description && (
                  <p className="mt-1 text-xs text-red-500">{t('requiredField')}</p>
                )}
              </div>

              <div>
                <label htmlFor="description-ru" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('descriptionRu')} *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description.ru}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      description: {
                        ...formData.description,
                        ru: e.target.value
                      }
                    });
                    handleInputChange('description', e.target.value);
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                    formErrors.description ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder={t('writeExerciseDescription')}
                />
                {formErrors.description && (
                  <p className="mt-1 text-xs text-red-500">{t('requiredField')}</p>
                )}
              </div>
            </div>

            {/* მედია ფაილები */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <VideoCameraIcon className="h-5 w-5 mr-2" />
                {t('exerciseMediaFiles')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* სურათის ატვირთვა */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    {t('exerciseThumbnail')} *
                  </label>
                  
                  {thumbnailPreview ? (
                    <div className="relative">
                      <ImageComponent src={thumbnailPreview} alt={t('thumbnailAlt')} />
                      <button
                        type="button"
                        onClick={handleThumbnailDelete}
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
                      ref={thumbnailFileRef}
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => thumbnailFileRef.current?.click()}
                      className="flex-1"
                    >
                      <PhotoIcon className="h-4 w-4 mr-1" />
                      {t('file')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsThumbnailUrlInput(!isThumbnailUrlInput)}
                      className="flex-1"
                    >
                      <LinkIcon className="h-4 w-4 mr-1" />
                      {t('url')}
                    </Button>
                  </div>
                  
                  {isThumbnailUrlInput && (
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={thumbnailUrl}
                        onChange={(e) => setThumbnailUrl(e.target.value)}
                        placeholder={t('enterImageUrl')}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <Button
                        type="button"
                        onClick={handleThumbnailUrlSubmit}
                        size="sm"
                      >
                        {t('add')}
                      </Button>
                    </div>
                  )}
                </div>

                {/* ვიდეოს ატვირთვა */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    {t('exerciseVideo')} *
                  </label>
                  
                  {videoPreview ? (
                    <div className="relative">
                      {videoPreview.startsWith('data:') ? (
                        <video className="h-24 w-24 object-cover rounded-lg" controls>
                          <source src={videoPreview} />
                        </video>
                      ) : (
                        <div className="h-24 w-24 bg-gray-200 rounded-lg flex items-center justify-center">
                          <VideoCameraIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={handleVideoDelete}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                      <VideoCameraIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">{t('noVideoUploaded')}</p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <input
                      ref={videoFileRef}
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => videoFileRef.current?.click()}
                      className="flex-1"
                    >
                      <VideoCameraIcon className="h-4 w-4 mr-1" />
                      {t('file')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsVideoUrlInput(!isVideoUrlInput)}
                      className="flex-1"
                    >
                      <LinkIcon className="h-4 w-4 mr-1" />
                      {t('url')}
                    </Button>
                  </div>
                  
                  {isVideoUrlInput && (
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder={t('enterVideoUrl')}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <Button
                        type="button"
                        onClick={handleVideoUrlSubmit}
                        size="sm"
                      >
                        {t('add')}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* სავარჯიშოს პარამეტრები */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ChartBarIcon className="h-5 w-5 mr-2" />
                {t('exerciseParameters')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('videoDuration')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.videoDuration}
                    onChange={(e) => {
                      setFormData({ ...formData, videoDuration: e.target.value });
                      handleInputChange('videoDuration', e.target.value);
                    }}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      formErrors.videoDuration ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder={t('enterVideoDuration')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('exerciseDuration')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.duration}
                    onChange={(e) => {
                      setFormData({ ...formData, duration: e.target.value });
                      handleInputChange('duration', e.target.value);
                    }}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      formErrors.duration ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder={t('enterExerciseDuration')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('difficulty')} *
                  </label>
                  <select
                    required
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="easy">{t('easy')}</option>
                    <option value="medium">{t('medium')}</option>
                    <option value="hard">{t('hard')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('sortOrder')}
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder={t('enterSortOrder')}
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('repetitions')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.repetitions}
                    onChange={(e) => {
                      setFormData({ ...formData, repetitions: e.target.value });
                      handleInputChange('repetitions', e.target.value);
                    }}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      formErrors.repetitions ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder={t('enterRepetitions')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('sets')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sets}
                    onChange={(e) => {
                      setFormData({ ...formData, sets: e.target.value });
                      handleInputChange('sets', e.target.value);
                    }}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      formErrors.sets ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder={t('enterSets')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('restTime')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.restTime}
                    onChange={(e) => {
                      setFormData({ ...formData, restTime: e.target.value });
                      handleInputChange('restTime', e.target.value);
                    }}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      formErrors.restTime ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder={t('enterRestTime')}
                  />
                </div>
              </div>
            </div>

            {/* პარამეტრები */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CogIcon className="h-5 w-5 mr-2" />
                {t('parameters')}
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-x-3">
                  <input
                    id="is-active"
                    name="is-active"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="is-active" className="block text-sm font-semibold leading-6 text-gray-900">
                    {t('isActive')}
                  </label>
                </div>

                <div className="flex items-center gap-x-3">
                  <input
                    id="is-published"
                    name="is-published"
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="is-published" className="block text-sm font-semibold leading-6 text-gray-900">
                    {t('isPublished')}
                  </label>
                </div>
              </div>
            </div>

            {/* ღილაკები */}
            <div className="border-t border-gray-200 pt-8 flex justify-end gap-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push(`/rehabilitation/categories/${resolvedParams.id}/sets/${resolvedParams.setId}/exercises`)}
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
                    {t('saving')}...
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