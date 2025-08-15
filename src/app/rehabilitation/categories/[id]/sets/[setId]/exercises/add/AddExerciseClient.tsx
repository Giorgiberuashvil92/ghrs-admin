'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Exercise, ExerciseFormData, SubCategory } from '@/types/categories';
import { Category } from '@/lib/api/categories';
import { Set } from '@/types/sets';
import { Button } from '@/components/ui/button';
import { createExercise } from '@/lib/api/exercises';
import { TrashIcon, PhotoIcon, LinkIcon, VideoCameraIcon, ClockIcon, ChartBarIcon, CogIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '@/i18n/language-context';

interface AddExerciseClientProps {
  category: Category;
  set: Set;
  subcategory?: SubCategory; // ოფციონალური საბ კატეგორია
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

export default function AddExerciseClient({ category, set, subcategory }: AddExerciseClientProps) {
  const router = useRouter();
  const { t } = useLanguage();
  
  // Build redirect path based on whether we have a subcategory
  const redirectPath = subcategory 
    ? `/rehabilitation/categories/${category._id}/subcategories/${subcategory._id}/sets/${set._id}/exercises`
    : `/rehabilitation/categories/${category._id}/sets/${set._id}/exercises`;
  const [isLoading, setIsLoading] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoPreviewEn, setVideoPreviewEn] = useState<string | null>(null);
  const [isThumbnailUrlInput, setIsThumbnailUrlInput] = useState(false);
  const [isVideoUrlInput, setIsVideoUrlInput] = useState(false);
  const [isVideoUrlEnInput, setIsVideoUrlEnInput] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoUrlEn, setVideoUrlEn] = useState('');
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
    setId: set._id,
    categoryId: category._id,
  });

  const [formErrors, setFormErrors] = useState<{
    name?: boolean;
    videoDuration?: boolean;
    duration?: boolean;
    repetitions?: boolean;
    sets?: boolean;
    restTime?: boolean;
    media?: boolean;
  }>({});

  // ახალი ლოგიკა: მხოლოდ ერთი მაინც იყოს არჩეული (ფოტო ან ვიდეო)
  const validateForm = () => {
    const isValidObjectId = (id: string) => /^[a-f\d]{24}$/i.test(id);

    // მედიის ვალიდაცია: მინიმუმ ერთი მაინც იყოს არჩეული
    const hasImage = !!formData.thumbnailImage;
    const hasVideo = !!formData.videoFile;
    const errors = {
      name: !formData.name.en.trim() || !formData.name.ru.trim(),
      videoDuration: !formData.videoDuration.trim(),
      duration: !formData.duration.trim(),
      repetitions: !formData.repetitions.trim(),
      sets: !formData.sets.trim(),
      restTime: !formData.restTime.trim(),
      media: !hasImage && !hasVideo,
    };
    setFormErrors(errors);
    if (!isValidObjectId(formData.setId) || !isValidObjectId(formData.categoryId)) {
      alert(t('invalidId'));
      return false;
    }
    return !Object.values(errors).some(Boolean);
  };

  const handleInputChange = (field: keyof typeof formErrors, value: string) => {
    // გავასუფთაოთ შეცდომა თუ ველი შეივსო
    if (value.trim()) {
      setFormErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleMediaChange = () => {
    // გავასუფთაოთ მედიის შეცდომა თუ რომელიმე მედია ფაილი დაემატა
    if (formData.videoFile || formData.thumbnailImage) {
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
      setVideoPreview(URL.createObjectURL(file));
      setFormData({ ...formData, videoFile: file });
      handleMediaChange();
    }
  };

  const handleThumbnailDelete = () => {
    setThumbnailPreview(null);
    setFormData({ ...formData, thumbnailImage: null });
    setThumbnailUrl('');
  };

  const handleVideoDelete = () => {
    setVideoPreview(null);
    setFormData({ ...formData, videoFile: null });
  };

  const handleVideoEnDelete = () => {
    setVideoPreviewEn(null);
    setVideoUrlEn('');
  };

  const handleThumbnailUrlSubmit = () => {
    console.log('handleThumbnailUrlSubmit called with URL:', thumbnailUrl);
    if (thumbnailUrl.trim()) {
      console.log('Setting thumbnail preview and form data');
      setThumbnailPreview(thumbnailUrl);
      setFormData({ ...formData, thumbnailImage: thumbnailUrl as any });
      setIsThumbnailUrlInput(false);
      setThumbnailUrl(''); // გაასუფთავე ველი
      handleMediaChange();
    } else {
      alert(t('pleaseEnterUrl'));
    }
  };

  const handleVideoUrlSubmit = () => {
    console.log('handleVideoUrlSubmit called with URL:', videoUrl);
    if (videoUrl.trim()) {
      console.log('Setting video preview and form data');
      setVideoPreview(videoUrl);
      setFormData({ ...formData, videoFile: videoUrl as any });
      setIsVideoUrlInput(false);
      setVideoUrl(''); // გაასუფთავე ველი
      handleMediaChange();
    } else {
      alert(t('pleaseEnterUrl'));
    }
  };

  const handleVideoUrlEnSubmit = () => {
    console.log('handleVideoUrlEnSubmit called with URL:', videoUrlEn);
    if (videoUrlEn.trim()) {
      setVideoPreviewEn(videoUrlEn);
      setIsVideoUrlEnInput(false);
    } else {
      alert(t('pleaseEnterUrl'));
    }
  };

  // სურათის ატვირთვის ბლოკში
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!validateForm()) {
        setIsLoading(false);
        alert(t('pleaseFillAllRequiredFields'));
        return;
      }
      if (formData.name.en.includes('http') || formData.description.en.includes('http')) {
        alert(t('pleaseEnterTextNotUrl'));
        setIsLoading(false);
        return;
      }
      const formDataToSend = new FormData();
      formDataToSend.append('name', JSON.stringify(formData.name));
      // description-ს ვაგზავნით მხოლოდ თუ რომელიმე ენაზე მაინც შევსებულია
      if (formData.description.en.trim() || formData.description.ru.trim()) {
        formDataToSend.append('description', JSON.stringify(formData.description));
      }
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
      // Cloudinary-სთვის: ფაილები ერთ ველში file (array)
      if (formData.thumbnailImage instanceof File) {
        formDataToSend.append('file', formData.thumbnailImage);
      }
      if (formData.videoFile instanceof File) {
        formDataToSend.append('file', formData.videoFile);
      }
      // თუ ლინკია და ნამდვილად URL-ია, მხოლოდ მაშინ ჩაწერე
      if (typeof formData.thumbnailImage === 'string') {
        const thumbUrl = formData.thumbnailImage as string;
        if (thumbUrl.trim() && /^https?:\/\//.test(thumbUrl)) {
          formDataToSend.append('thumbnailUrl', thumbUrl);
        }
      }
      if (typeof formData.videoFile === 'string') {
        const vidUrl = formData.videoFile as string;
        if (vidUrl.trim() && /^https?:\/\//.test(vidUrl)) {
          formDataToSend.append('videoUrl', vidUrl);
        }
      }
      // თუ ინგლისურის ვიდეოს URL-ი დაფიქსირდა, გადავცეთ
      if (videoUrlEn.trim() && /^https?:\/\//.test(videoUrlEn)) {
        formDataToSend.append('videoUrlEn', videoUrlEn);
      }
      // Debug: დავინახოთ რა იგზავნება
      console.log('==== FormData to be sent ====');
      console.log('formData.thumbnailImage:', formData.thumbnailImage, typeof formData.thumbnailImage);
      console.log('formData.videoFile:', formData.videoFile, typeof formData.videoFile);
      if (thumbnailFileRef.current) {
        console.log('thumbnailFileRef.current.files:', thumbnailFileRef.current.files);
      }
      if (videoFileRef.current) {
        console.log('videoFileRef.current.files:', videoFileRef.current.files);
      }
      formDataToSend.forEach((value, key) => {
        if (value instanceof File) {
          console.log(`${key}: [File]`, value.name, value.type, value.size + ' bytes');
        } else {
          console.log(`${key}:`, value);
        }
      });
      const exercise = await createExercise(formDataToSend);
      router.push(redirectPath);
      router.refresh();
    } catch (error) {
      if (error instanceof Response) {
        error.text().then(text => {
          console.error('Server error response:', text);
        });
      } else {
        console.error('Error creating exercise:', error);
      }
      alert(t('errorCreatingExercise'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t('addNewExercise')}
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                {subcategory 
                  ? `${category.name.en} › ${subcategory.name.en} › ${set.name.en}`
                  : `${category.name.en} › ${set.name.en}`
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{t('category')}:</span>
            <span className="font-medium">{category.name.en}</span>
            {subcategory && (
              <>
                <span>•</span>
                <span>{t('subCategory')}:</span>
                <span className="font-medium">{subcategory.name.en}</span>
              </>
            )}
            <span>•</span>
            <span>{t('set')}:</span>
            <span className="font-medium">{set.name.en}</span>
          </div>
        </div>

        <div className="bg-white shadow-xl ring-1 ring-gray-900/5 rounded-2xl overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-10">
            
            {/* სახელი და აღწერა */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CogIcon className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {t('basicInformation')}
                </h2>
              </div>
              
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name-en" className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('nameEn')} *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="name-en"
                        id="name-en"
                        value={formData.name.en}
                        onChange={(e) => {
                          setFormData({ ...formData, name: { ...formData.name, en: e.target.value } });
                          handleInputChange('name', e.target.value);
                        }}
                        className={`block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg ${formErrors.name ? 'border-red-500' : ''}`}
                        placeholder={t('enterExerciseName')}
                        required
                      />
                      {formErrors.name && (
                        <p className="mt-1 text-xs text-red-500">{t('requiredField')}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="name-ru" className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('nameRu')} *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="name-ru"
                        id="name-ru"
                        value={formData.name.ru}
                        onChange={(e) => {
                          setFormData({ ...formData, name: { ...formData.name, ru: e.target.value } });
                          handleInputChange('name', e.target.value);
                        }}
                        className={`block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg ${formErrors.name ? 'border-red-500' : ''}`}
                        placeholder={t('enterExerciseName')}
                        required
                      />
                      {formErrors.name && (
                        <p className="mt-1 text-xs text-red-500">{t('requiredField')}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label htmlFor="description-en" className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('descriptionEn')}
                    </label>
                    <div className="relative">
                      <textarea
                        id="description-en"
                        name="description-en"
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
                        }}
                        className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none"
                        placeholder={t('writeExerciseDescription')}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="description-ru" className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('descriptionRu')}
                    </label>
                    <div className="relative">
                      <textarea
                        id="description-ru"
                        name="description-ru"
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
                        }}
                        className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none"
                        placeholder={t('writeExerciseDescription')}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* მედია ფაილები */}
            <div className="border-t border-gray-200 pt-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <VideoCameraIcon className="h-5 w-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {t('mediaFiles')}
                </h2>
              </div>
              
              <div className={`grid grid-cols-1 gap-8 lg:grid-cols-2 ${formErrors.media ? 'border-red-500 border rounded-xl p-4' : ''}`}>
                {formErrors.media && (
                  <div className="lg:col-span-2">
                    <p className="text-sm text-red-500">{t('pleaseUploadImageOrVideo')}</p>
                  </div>
                )}
                {/* სურათი */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    {t('exerciseThumbnail')}
                  </label>
                  <div className="flex items-start gap-4">
                    {thumbnailPreview ? (
                      <div className="relative">
                        <ImageComponent
                          src={thumbnailPreview}
                          alt="Exercise thumbnail"
                        />
                        <button
                          type="button"
                          onClick={handleThumbnailDelete}
                          className="absolute -top-2 -right-2 p-1.5 bg-red-100 rounded-full text-red-600 hover:bg-red-200 transition-colors"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-24 w-24 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-purple-400 transition-colors">
                        <PhotoIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsThumbnailUrlInput(false);
                            thumbnailFileRef.current?.click();
                          }}
                          className="rounded-lg"
                          disabled={typeof formData.thumbnailImage === 'string' && formData.thumbnailImage}
                        >
                          <PhotoIcon className="h-4 w-4 mr-2" />
                          {t('uploadImage')}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsThumbnailUrlInput(true)}
                          className="rounded-lg"
                          disabled={formData.thumbnailImage instanceof File}
                        >
                          <LinkIcon className="h-4 w-4 mr-2" />
                          {t('enterUrl')}
                        </Button>
                      </div>

                      {isThumbnailUrlInput && (
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={thumbnailUrl}
                            onChange={(e) => setThumbnailUrl(e.target.value)}
                            placeholder={t('enterImageUrl')}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm"
                          />
                          <Button
                            type="button"
                            onClick={handleThumbnailUrlSubmit}
                            variant="default"
                            className="whitespace-nowrap rounded-lg bg-purple-600 hover:bg-purple-700"
                          >
                            {t('add')}
                          </Button>
                        </div>
                      )}
                    </div>

                    <input
                      type="file"
                      ref={thumbnailFileRef}
                      onChange={handleThumbnailChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>

                {/* ვიდეო */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    {t('exerciseVideo')}
                  </label>
                  <div className="flex items-start gap-4">
                    {videoPreview ? (
                      <div className="relative">
                        <video
                          src={videoPreview}
                          className="h-24 w-24 object-cover rounded-xl"
                          controls
                        />
                        <button
                          type="button"
                          onClick={handleVideoDelete}
                          className="absolute -top-2 -right-2 p-1.5 bg-red-100 rounded-full text-red-600 hover:bg-red-200 transition-colors"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-24 w-24 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-purple-400 transition-colors">
                        <VideoCameraIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="flex flex-col gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => videoFileRef.current?.click()}
                        className="rounded-lg"
                        disabled={typeof formData.videoFile === 'string' && formData.videoFile}
                      >
                        <VideoCameraIcon className="h-4 w-4 mr-2" />
                        {t('uploadVideo')}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsVideoUrlInput(true)}
                        className="rounded-lg"
                        disabled={formData.videoFile instanceof File}
                      >
                        <LinkIcon className="h-4 w-4 mr-2" />
                        {t('enterUrl')}
                      </Button>
                    </div>

                    {isVideoUrlInput && (
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          placeholder={t('enterVideoUrl')}
                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm"
                        />
                        <Button
                          type="button"
                          onClick={handleVideoUrlSubmit}
                          variant="default"
                          className="whitespace-nowrap rounded-lg bg-purple-600 hover:bg-purple-700"
                        >
                          {t('add')}
                        </Button>
                      </div>
                    )}

                    <input
                      type="file"
                      ref={videoFileRef}
                      onChange={handleVideoChange}
                      accept="video/*"
                      className="hidden"
                    />
                  </div>
                </div>

                {/* ვიდეო (EN) მხოლოდ URL */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    {t('exerciseVideo')} (EN)
                  </label>
                  <div className="flex items-start gap-4">
                    {videoPreviewEn ? (
                      <div className="relative">
                        <video
                          src={videoPreviewEn}
                          className="h-24 w-24 object-cover rounded-xl"
                          controls
                        />
                        <button
                          type="button"
                          onClick={handleVideoEnDelete}
                          className="absolute -top-2 -right-2 p-1.5 bg-red-100 rounded-full text-red-600 hover:bg-red-200 transition-colors"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-24 w-24 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-purple-400 transition-colors">
                        <VideoCameraIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}

                    <div className="flex flex-col gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsVideoUrlEnInput(true)}
                        className="rounded-lg"
                      >
                        <LinkIcon className="h-4 w-4 mr-2" />
                        {t('enterUrl')}
                      </Button>
                    </div>

                    {isVideoUrlEnInput && (
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={videoUrlEn}
                          onChange={(e) => setVideoUrlEn(e.target.value)}
                          placeholder={t('enterVideoUrl')}
                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm"
                        />
                        <Button
                          type="button"
                          onClick={handleVideoUrlEnSubmit}
                          variant="default"
                          className="whitespace-nowrap rounded-lg bg-purple-600 hover:bg-purple-700"
                        >
                          {t('add')}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* სავარჯიშოს დეტალები */}
            <div className="border-t border-gray-200 pt-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ClockIcon className="h-5 w-5 text-orange-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {t('exerciseDetails')}
                </h2>
              </div>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label htmlFor="duration" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('duration')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="duration"
                      id="duration"
                      placeholder="MM:SS"
                      value={formData.duration}
                      onChange={(e) => {
                        setFormData({ ...formData, duration: e.target.value });
                        handleInputChange('duration', e.target.value);
                      }}
                      className={`block w-full rounded-xl border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 ${formErrors.duration ? 'border-red-500' : ''}`}
                    />
                    {formErrors.duration && (
                      <p className="mt-1 text-xs text-red-500">{t('requiredField')}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="difficulty" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('difficulty')}
                  </label>
                  <div className="relative">
                    <select
                      id="difficulty"
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                      className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    >
                      <option value="easy">{t('easy')}</option>
                      <option value="medium">{t('medium')}</option>
                      <option value="hard">{t('hard')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="repetitions" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('repetitions')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="repetitions"
                      id="repetitions"
                      value={formData.repetitions}
                      onChange={(e) => {
                        setFormData({ ...formData, repetitions: e.target.value });
                        handleInputChange('repetitions', e.target.value);
                      }}
                      className={`block w-full rounded-xl border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 ${formErrors.repetitions ? 'border-red-500' : ''}`}
                      placeholder={t('example1015')}
                    />
                    {formErrors.repetitions && (
                      <p className="mt-1 text-xs text-red-500">{t('requiredField')}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="sets" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('sets')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="sets"
                      id="sets"
                      value={formData.sets}
                      onChange={(e) => {
                        setFormData({ ...formData, sets: e.target.value });
                        handleInputChange('sets', e.target.value);
                      }}
                      className={`block w-full rounded-xl border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 ${formErrors.sets ? 'border-red-500' : ''}`}
                      placeholder={t('example3')}
                    />
                    {formErrors.sets && (
                      <p className="mt-1 text-xs text-red-500">{t('requiredField')}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="restTime" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('restTime')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="restTime"
                      id="restTime"
                      placeholder="MM:SS"
                      value={formData.restTime}
                      onChange={(e) => {
                        setFormData({ ...formData, restTime: e.target.value });
                        handleInputChange('restTime', e.target.value);
                      }}
                      className={`block w-full rounded-xl border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 ${formErrors.restTime ? 'border-red-500' : ''}`}
                    />
                    {formErrors.restTime && (
                      <p className="mt-1 text-xs text-red-500">{t('requiredField')}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="videoDuration" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('videoDuration')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="videoDuration"
                      id="videoDuration"
                      placeholder="00:02:30"
                      value={formData.videoDuration}
                      onChange={(e) => {
                        setFormData({ ...formData, videoDuration: e.target.value });
                        handleInputChange('videoDuration', e.target.value);
                      }}
                      className={`block w-full rounded-xl border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 ${formErrors.videoDuration ? 'border-red-500' : ''}`}
                    />
                    {formErrors.videoDuration && (
                      <p className="mt-1 text-xs text-red-500">{t('requiredField')}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* სტატუსი */}
            <div className="border-t border-gray-200 pt-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <CogIcon className="h-5 w-5 text-indigo-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {t('status')}
                </h2>
              </div>
              
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
                    {t('active')}
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
                    {t('published')}
                  </label>
                </div>
              </div>
            </div>

            {/* ღილაკები */}
            <div className="border-t border-gray-200 pt-8 flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/rehabilitation/categories/${category._id}/sets/${set._id}/exercises`)}
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
                  t('addExercise')
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}