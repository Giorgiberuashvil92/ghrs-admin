'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Exercise, ExerciseFormData } from '@/types/categories';
import { Category } from '@/lib/api/categories';
import { Set } from '@/types/sets';
import { Button } from '@/components/ui/button';
import { createExercise } from '@/lib/api/exercises';
import { TrashIcon, PhotoIcon, LinkIcon, VideoCameraIcon, ClockIcon, ChartBarIcon, CogIcon } from '@heroicons/react/24/outline';

interface AddExerciseClientProps {
  category: Category;
  set: Set;
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

export default function AddExerciseClient({ category, set }: AddExerciseClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isThumbnailUrlInput, setIsThumbnailUrlInput] = useState(false);
  const [isVideoUrlInput, setIsVideoUrlInput] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const thumbnailFileRef = useRef<HTMLInputElement>(null);
  const videoFileRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<ExerciseFormData>({
    name: { ka: '', en: '', ru: '' },
    description: { ka: '', en: '', ru: '' },
    recommendations: { ka: '', en: '', ru: '' },
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
    description?: boolean;
    recommendations?: boolean;
    videoDuration?: boolean;
    duration?: boolean;
    repetitions?: boolean;
    sets?: boolean;
    restTime?: boolean;
    media?: boolean;
  }>({});

  const validateForm = () => {
    const isValidObjectId = (id: string) => /^[a-f\d]{24}$/i.test(id);

    const errors = {
      name: !formData.name.ka.trim(),
      description: !formData.description.ka.trim(),
      recommendations: !formData.recommendations.ka.trim(),
      videoDuration: !formData.videoDuration.trim(),
      duration: !formData.duration.trim(),
      repetitions: !formData.repetitions.trim(),
      sets: !formData.sets.trim(),
      restTime: !formData.restTime.trim(),
      media: !formData.videoFile && !formData.thumbnailImage,
    };
    
    setFormErrors(errors);

    // შევამოწმოთ ObjectId-ები
    if (!isValidObjectId(formData.setId) || !isValidObjectId(formData.categoryId)) {
      alert('სეტის ან კატეგორიის ID არასწორია');
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
      alert('გთხოვთ შეიყვანოთ URL');
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
      alert('გთხოვთ შეიყვანოთ URL');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // ვალიდაცია
      if (!validateForm()) {
        setIsLoading(false);
        alert('გთხოვთ შეავსოთ ყველა სავალდებულო ველი');
        return;
      }

      // შეამოწმე რომ name და description არ არის URL-ები
      if (formData.name.ka.includes('http') || formData.description.ka.includes('http')) {
        alert('გთხოვთ შეიყვანოთ ტექსტი, არა URL-ები სახელისა და აღწერის ველებში');
        setIsLoading(false);
        return;
      }

      const formDataToSend = new FormData();
      
      // ტექსტური ველები
      formDataToSend.append('name', JSON.stringify(formData.name));
      formDataToSend.append('description', JSON.stringify(formData.description));
      formDataToSend.append('recommendations', JSON.stringify(formData.recommendations));
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
      }
      
      if (formData.thumbnailImage instanceof File) {
        formDataToSend.append('thumbnailFile', formData.thumbnailImage);
      } else if (formData.thumbnailImage && typeof formData.thumbnailImage === 'string') {
        formDataToSend.append('thumbnailUrl', formData.thumbnailImage);
      }

      // Debug: დავინახოთ რა იგზავნება
      console.log('Sending form data:');
      for (let [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          console.log(`${key}:`, `File: ${value.name} (${value.type}), size: ${value.size} bytes`);
        } else {
          console.log(`${key}:`, value);
        }
      }

      const exercise = await createExercise(formDataToSend);
      router.push(`/rehabilitation/categories/${category._id}/sets/${set._id}/exercises`);
      router.refresh();
    } catch (error) {
      console.error('Error creating exercise:', error);
      alert('შეცდომა სავარჯიშოს შექმნისას');
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
                ახალი სავარჯიშოს დამატება
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                {set.name.ka} - {category.name.ka}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>კატეგორია:</span>
            <span className="font-medium">{category.name.ka}</span>
            <span>•</span>
            <span>სეტი:</span>
            <span className="font-medium">{set.name.ka}</span>
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
                <h2 className="text-xl font-semibold text-gray-900">ძირითადი ინფორმაცია</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name-ka" className="block text-sm font-semibold text-gray-700 mb-2">
                      სახელი (ქართულად)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="name-ka"
                        id="name-ka"
                        value={formData.name.ka}
                        onChange={(e) => {
                          setFormData({ ...formData, name: { ...formData.name, ka: e.target.value } });
                          handleInputChange('name', e.target.value);
                        }}
                        className={`block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg ${formErrors.name ? 'border-red-500' : ''}`}
                        placeholder="ჩაწერეთ სავარჯიშოს სახელი"
                      />
                      {formErrors.name && (
                        <p className="mt-1 text-xs text-red-500">სავალდებულო ველი</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="name-en" className="block text-sm font-semibold text-gray-700 mb-2">
                      სახელი (ინგლისურად)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="name-en"
                        id="name-en"
                        value={formData.name.en}
                        onChange={(e) => setFormData({ ...formData, name: { ...formData.name, en: e.target.value } })}
                        className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg"
                        placeholder="Enter exercise name"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label htmlFor="description-ka" className="block text-sm font-semibold text-gray-700 mb-2">
                      აღწერა (ქართულად)
                    </label>
                    <div className="relative">
                      <textarea
                        id="description-ka"
                        name="description-ka"
                        rows={4}
                        value={formData.description.ka}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            description: {
                              ka: e.target.value,
                              en: formData.description?.en || '',
                              ru: formData.description?.ru || '',
                            }
                          });
                          handleInputChange('description', e.target.value);
                        }}
                        className={`block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none ${formErrors.description ? 'border-red-500' : ''}`}
                        placeholder="დაწერეთ სავარჯიშოს აღწერა"
                      />
                      {formErrors.description && (
                        <p className="mt-1 text-xs text-red-500">სავალდებულო ველი</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="description-en" className="block text-sm font-semibold text-gray-700 mb-2">
                      აღწერა (ინგლისურად)
                    </label>
                    <div className="relative">
                      <textarea
                        id="description-en"
                        name="description-en"
                        rows={4}
                        value={formData.description.en}
                        onChange={(e) => setFormData({
                          ...formData,
                          description: {
                            ka: formData.description?.ka || '',
                            en: e.target.value,
                            ru: formData.description?.ru || '',
                          }
                        })}
                        className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none"
                        placeholder="Write exercise description"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* რეკომენდაციები */}
            <div className="border-t border-gray-200 pt-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CogIcon className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">რეკომენდაციები</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                  <label htmlFor="recommendations-ka" className="block text-sm font-semibold text-gray-700 mb-2">
                    რეკომენდაციები (ქართულად)
                  </label>
                  <div className="relative">
                    <textarea
                      id="recommendations-ka"
                      name="recommendations-ka"
                      rows={4}
                      value={formData.recommendations.ka}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          recommendations: {
                            ka: e.target.value,
                            en: formData.recommendations?.en || '',
                            ru: formData.recommendations?.ru || '',
                          }
                        });
                        handleInputChange('recommendations', e.target.value);
                      }}
                      className={`block w-full rounded-xl border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 resize-none ${formErrors.recommendations ? 'border-red-500' : ''}`}
                      placeholder="დაწერეთ რეკომენდაციები"
                    />
                    {formErrors.recommendations && (
                      <p className="mt-1 text-xs text-red-500">სავალდებულო ველი</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="recommendations-en" className="block text-sm font-semibold text-gray-700 mb-2">
                    რეკომენდაციები (ინგლისურად)
                  </label>
                  <div className="relative">
                    <textarea
                      id="recommendations-en"
                      name="recommendations-en"
                      rows={4}
                      value={formData.recommendations.en}
                      onChange={(e) => setFormData({
                        ...formData,
                        recommendations: {
                          ka: formData.recommendations?.ka || '',
                          en: e.target.value,
                          ru: formData.recommendations?.ru || '',
                        }
                      })}
                      className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 resize-none"
                      placeholder="Write recommendations"
                    />
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
                <h2 className="text-xl font-semibold text-gray-900">მედია ფაილები</h2>
              </div>
              
              <div className={`grid grid-cols-1 gap-8 lg:grid-cols-2 ${formErrors.media ? 'border-red-500 border rounded-xl p-4' : ''}`}>
                {formErrors.media && (
                  <div className="lg:col-span-2">
                    <p className="text-sm text-red-500">გთხოვთ ატვირთოთ სურათი ან ვიდეო</p>
                  </div>
                )}
                {/* სურათი */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    სავარჯიშოს სურათი
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
                        >
                          <PhotoIcon className="h-4 w-4 mr-2" />
                          სურათის ატვირთვა
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsThumbnailUrlInput(true)}
                          className="rounded-lg"
                        >
                          <LinkIcon className="h-4 w-4 mr-2" />
                          URL-ის ჩაწერა
                        </Button>
                      </div>

                      {isThumbnailUrlInput && (
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={thumbnailUrl}
                            onChange={(e) => setThumbnailUrl(e.target.value)}
                            placeholder="ჩაწერეთ სურათის URL"
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm"
                          />
                          <Button
                            type="button"
                            onClick={handleThumbnailUrlSubmit}
                            variant="default"
                            className="whitespace-nowrap rounded-lg bg-purple-600 hover:bg-purple-700"
                          >
                            დამატება
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
                    სავარჯიშოს ვიდეო
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
                      >
                        <VideoCameraIcon className="h-4 w-4 mr-2" />
                        ვიდეოს ატვირთვა
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsVideoUrlInput(true)}
                        className="rounded-lg"
                      >
                        <LinkIcon className="h-4 w-4 mr-2" />
                        URL-ის ჩაწერა
                      </Button>
                    </div>

                    {isVideoUrlInput && (
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          placeholder="ჩაწერეთ ვიდეოს URL"
                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm"
                        />
                        <Button
                          type="button"
                          onClick={handleVideoUrlSubmit}
                          variant="default"
                          className="whitespace-nowrap rounded-lg bg-purple-600 hover:bg-purple-700"
                        >
                          დამატება
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
              </div>
            </div>

            {/* სავარჯიშოს დეტალები */}
            <div className="border-t border-gray-200 pt-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ClockIcon className="h-5 w-5 text-orange-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">სავარჯიშოს დეტალები</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label htmlFor="duration" className="block text-sm font-semibold text-gray-700 mb-2">
                    ხანგრძლივობა
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
                      <p className="mt-1 text-xs text-red-500">სავალდებულო ველი</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="difficulty" className="block text-sm font-semibold text-gray-700 mb-2">
                    სირთულე
                  </label>
                  <div className="relative">
                    <select
                      id="difficulty"
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                      className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    >
                      <option value="easy">მარტივი</option>
                      <option value="medium">საშუალო</option>
                      <option value="hard">რთული</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="repetitions" className="block text-sm font-semibold text-gray-700 mb-2">
                    გამეორებები
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
                      placeholder="მაგ: 10-15"
                    />
                    {formErrors.repetitions && (
                      <p className="mt-1 text-xs text-red-500">სავალდებულო ველი</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="sets" className="block text-sm font-semibold text-gray-700 mb-2">
                    სეტები
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
                      placeholder="მაგ: 3"
                    />
                    {formErrors.sets && (
                      <p className="mt-1 text-xs text-red-500">სავალდებულო ველი</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="restTime" className="block text-sm font-semibold text-gray-700 mb-2">
                    დასვენების დრო
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
                      <p className="mt-1 text-xs text-red-500">სავალდებულო ველი</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="videoDuration" className="block text-sm font-semibold text-gray-700 mb-2">
                    ვიდეოს ხანგრძლივობა
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
                      <p className="mt-1 text-xs text-red-500">სავალდებულო ველი</p>
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
                <h2 className="text-xl font-semibold text-gray-900">სტატუსი</h2>
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
                    აქტიური
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
                    გამოქვეყნებული
                  </label>
                </div>
              </div>
            </div>

            {/* ღილაკები */}
            <div className="border-t border-gray-200 pt-8 flex justify-end gap-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push(`/rehabilitation/categories/${category._id}/sets/${set._id}/exercises`)}
                disabled={isLoading}
                className="rounded-xl px-8 py-3"
              >
                გაუქმება
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
                    ინახება...
                  </div>
                ) : (
                  'სავარჯიშოს დამატება'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}