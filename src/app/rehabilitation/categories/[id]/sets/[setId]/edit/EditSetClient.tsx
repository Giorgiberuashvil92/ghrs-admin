'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Set } from '@/types/sets';
import { Category } from '@/lib/api/categories';
import { updateSet } from '@/lib/api/sets';
import { toast } from 'react-hot-toast';
import { useLanguage } from '@/i18n/language-context';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import { Button } from '@/components/ui/button';
import InputGroup from '@/components/FormElements/InputGroup';
import { TextAreaGroup } from '@/components/FormElements/InputGroup/text-area';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { TrashIcon, PhotoIcon, LinkIcon, VideoCameraIcon } from '@heroicons/react/24/outline';

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
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  );
};

interface EditSetClientProps {
  category: Category;
  subcategory?: any;
  initialSet: Set;
}

export default function EditSetClient({ category, subcategory, initialSet }: EditSetClientProps) {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(initialSet.thumbnailImage || null);
  const [isImageUrlInput, setIsImageUrlInput] = useState(false);
  const imageFileRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: initialSet.name || { en: '', ru: '' },
    description: initialSet.description || { en: '', ru: '' },
    duration: initialSet.duration || '',
    difficulty: (initialSet.difficulty || 'easy') as 'easy' | 'medium' | 'hard',
    equipment: initialSet.equipment || { en: '', ru: '' },
    warnings: initialSet.warnings || { en: '', ru: '' },
    recommendations: initialSet.recommendations || { en: '', ru: '' },
    additional: initialSet.additional || { en: '', ru: '' },
    demoVideoUrl: initialSet.demoVideoUrl || '',
    price: initialSet.price || { monthly: 0, threeMonths: 0, sixMonths: 0, yearly: 0 },
    discountedPrice: initialSet.discountedPrice || { monthly: 0, threeMonths: 0, sixMonths: 0, yearly: 0 },
    isActive: initialSet.isActive ?? true,
    isPublished: initialSet.isPublished ?? false,
    image: initialSet.thumbnailImage || ''
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageDelete = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image: '' }));
    if (imageFileRef.current) {
      imageFileRef.current.value = '';
    }
  };

  const handleImageUrlSubmit = () => {
    if (formData.image.trim()) {
      setImagePreview(formData.image);
      setIsImageUrlInput(false);
    } else {
      alert(t('pleaseEnterImageUrl'));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create a clean update object with correct types
      const updateData = {
        name: {
          en: String(formData.name.en || ''),
          ru: String(formData.name.ru || '')
        },
        description: {
          en: String(formData.description?.en || ''),
          ru: String(formData.description?.ru || '')
        },
        duration: String(formData.duration || ''),
        difficulty: formData.difficulty as 'easy' | 'medium' | 'hard',
        equipment: {
          en: String(formData.equipment?.en || ''),
          ru: String(formData.equipment?.ru || '')
        },
        warnings: {
          en: String(formData.warnings?.en || ''),
          ru: String(formData.warnings?.ru || '')
        },
        recommendations: {
          en: String(formData.recommendations?.en || ''),
          ru: String(formData.recommendations?.ru || '')
        },
        additional: {
          en: String(formData.additional?.en || ''),
          ru: String(formData.additional?.ru || '')
        },
        demoVideoUrl: String(formData.demoVideoUrl || ''),
        thumbnailImage: String(formData.image || ''),
        price: {
          monthly: Number(formData.price.monthly) || 0,
          threeMonths: Number(formData.price.threeMonths) || 0,
          sixMonths: Number(formData.price.sixMonths) || 0,
          yearly: Number(formData.price.yearly) || 0
        },
        discountedPrice: {
          monthly: Number(formData.discountedPrice.monthly) || 0,
          threeMonths: Number(formData.discountedPrice.threeMonths) || 0,
          sixMonths: Number(formData.discountedPrice.sixMonths) || 0,
          yearly: Number(formData.discountedPrice.yearly) || 0
        },
        isActive: Boolean(formData.isActive),
        isPublished: Boolean(formData.isPublished)
      };

      await updateSet(initialSet._id, updateData);

      const redirectPath = subcategory 
        ? `/rehabilitation/categories/${category._id}/subcategories/${subcategory._id}/sets`
        : `/rehabilitation/categories/${category._id}/sets`;
      
      toast.success('Set updated successfully / Набор успешно обновлен');
      router.push(redirectPath);
      router.refresh();
    } catch (error) {
      console.error('Error updating set:', error);
      toast.error('Failed to update set / Не удалось обновить набор');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mx-auto max-w-270">
        <Breadcrumb pageName={
          subcategory 
            ? `${t('editSet')} - ${category.name[language]} › ${subcategory.name[language]}`
            : `${t('editSet')} - ${category.name[language]}`
        } />

        <div className="grid grid-cols-12 gap-4">
          {/* მთავარი ფორმა */}
          <div className="col-span-12 xl:col-span-8">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  {t('editSet')} - {formData.name.en || formData.name.ru}
                </h3>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="p-7">
                  {/* სურათი */}
                  <div className="mb-5.5">
                    <div className="bg-gray-50 rounded-xl p-6 dark:bg-boxdark">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center dark:text-white">
                        <PhotoIcon className="h-5 w-5 mr-2" />
                        {t('setImage')}
                      </h3>
                      
                      <div className="space-y-4">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {t('uploadImage')}
                        </label>
                        
                        {imagePreview ? (
                          <div className="relative">
                            <ImageComponent src={imagePreview} alt={t('thumbnailAlt')} />
                            <button
                              type="button"
                              onClick={handleImageDelete}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center dark:border-strokedark">
                            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('noImageUploaded')}</p>
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <input
                            ref={imageFileRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline" 
                            size="sm"
                            onClick={() => imageFileRef.current?.click()}
                            className="flex-1"
                          >
                            <PhotoIcon className="h-4 w-4 mr-1" />
                            {t('file')}
                          </Button>
                          <Button
                            type="button"
                            variant="outline" 
                            size="sm"
                            onClick={() => setIsImageUrlInput(!isImageUrlInput)}
                            className="flex-1"
                          >
                            <LinkIcon className="h-4 w-4 mr-1" />
                            {t('url')}
                          </Button>
                        </div>
                        
                        {isImageUrlInput && (
                          <div className="flex gap-2">
                            <input
                              type="url"
                              value={formData.image}
                              onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                              placeholder={t('enterImageUrl')}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:border-strokedark dark:bg-boxdark"
                            />
                            <Button
                              type="button"
                              onClick={handleImageUrlSubmit}
                              size="sm"
                            >
                              {t('add')}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* სახელები */}
                  <div className="mb-5.5">
                    <h4 className="mb-4 text-lg font-medium text-black dark:text-white">
                      {t('name')}
                    </h4>
                    <div className="flex flex-col gap-5.5">
                      <div className="w-full">
                        <InputGroup
                          label={t('nameInEnglish')}
                          name="name_en"
                          type="text"
                          placeholder={t('enterEnglishName')}
                          value={formData.name.en}
                          handleChange={(e) =>
                            setFormData(prev => ({
                              ...prev,
                              name: { ...prev.name, en: e.target.value }
                            }))
                          }
                          required
                        />
                      </div>
                      <div className="w-full">
                        <InputGroup
                          label={t('nameInRussian')}
                          name="name_ru"
                          type="text"
                          placeholder={t('enterRussianName')}
                          value={formData.name.ru}
                          handleChange={(e) =>
                            setFormData(prev => ({
                              ...prev,
                              name: { ...prev.name, ru: e.target.value }
                            }))
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* აღწერები */}
                  <div className="mb-5.5">
                    <h4 className="mb-4 text-lg font-medium text-black dark:text-white">
                      {t('description')}
                    </h4>
                    <div className="flex flex-col gap-5.5">
                      <div className="w-full">
                        <TextAreaGroup
                          label="Description (English)"
                          placeholder="Detailed description..."
                          value={formData.description?.en || ''}
                          onChange={(e) =>
                            setFormData(prev => ({
                              ...prev,
                              description: { 
                                ...(prev.description || { en: '', ru: '' }), 
                                en: e.target.value 
                              }
                            }))
                          }
                        />
                      </div>
                      <div className="w-full">
                        <TextAreaGroup
                          label="Описание (Русский)"
                          placeholder="Подробное описание..."
                          value={formData.description?.ru || ''}
                          onChange={(e) =>
                            setFormData(prev => ({
                              ...prev,
                              description: { 
                                ...(prev.description || { en: '', ru: '' }), 
                                ru: e.target.value 
                              }
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* ხანგრძლივობა და სირთულე */}
                  <div className="mb-5.5">
                    <h4 className="mb-4 text-lg font-medium text-black dark:text-white">
                      Duration and Difficulty
                    </h4>
                    <div className="flex flex-col gap-5.5">
                      <div className="w-full">
                        <InputGroup
                          label="Duration"
                          name="duration"
                          type="text"
                          placeholder="e.g. 45 minutes"
                          value={formData.duration}
                          handleChange={(e) =>
                            setFormData(prev => ({
                              ...prev,
                              duration: e.target.value
                            }))
                          }
                        />
                      </div>
                      <div className="w-full">
                        <label className="mb-2.5 block font-medium text-black dark:text-white">
                          Difficulty
                        </label>
                        <select
                          value={formData.difficulty}
                          onChange={(e) =>
                            setFormData(prev => ({
                              ...prev,
                              difficulty: e.target.value as "easy" | "medium" | "hard"
                            }))
                          }
                          className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* აღჭურვილობა */}
                  <div className="mb-5.5">
                    <h4 className="mb-4 text-lg font-medium text-black dark:text-white">
                      Equipment
                    </h4>
                    <div className="flex flex-col gap-5.5">
                      <div className="w-full">
                        <TextAreaGroup
                          label="Equipment (English)"
                          placeholder="Required equipment..."
                          value={formData.equipment?.en || ''}
                          onChange={(e) =>
                            setFormData(prev => ({
                              ...prev,
                              equipment: { 
                                ...(prev.equipment || { en: '', ru: '' }), 
                                en: e.target.value 
                              }
                            }))
                          }
                        />
                      </div>
                      <div className="w-full">
                        <TextAreaGroup
                          label="Оборудование (Русский)"
                          placeholder="Необходимое оборудование..."
                          value={formData.equipment?.ru || ''}
                          onChange={(e) =>
                            setFormData(prev => ({
                              ...prev,
                              equipment: { 
                                ...(prev.equipment || { en: '', ru: '' }), 
                                ru: e.target.value 
                              }
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* გაფრთხილებები */}
                  <div className="mb-5.5">
                    <h4 className="mb-4 text-lg font-medium text-black dark:text-white">
                      Warnings
                    </h4>
                    <div className="flex flex-col gap-5.5">
                      <div className="w-full">
                        <TextAreaGroup
                          label="Warnings (English)"
                          placeholder="Health warnings and contraindications..."
                          value={formData.warnings?.en || ''}
                          onChange={(e) =>
                            setFormData(prev => ({
                              ...prev,
                              warnings: { 
                                ...(prev.warnings || { en: '', ru: '' }), 
                                en: e.target.value 
                              }
                            }))
                          }
                        />
                      </div>
                      <div className="w-full">
                        <TextAreaGroup
                          label="Предупреждения (Русский)"
                          placeholder="Предупреждения о здоровье и противопоказания..."
                          value={formData.warnings?.ru || ''}
                          onChange={(e) =>
                            setFormData(prev => ({
                              ...prev,
                              warnings: { 
                                ...(prev.warnings || { en: '', ru: '' }), 
                                ru: e.target.value 
                              }
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* რეკომენდაციები */}
                  <div className="mb-5.5">
                    <h4 className="mb-4 text-lg font-medium text-black dark:text-white">
                      {t('recommendations')}
                    </h4>
                    <div className="flex flex-col gap-5.5">
                      <div className="w-full">
                        <TextAreaGroup
                          label="Recommendations (English)"
                          placeholder="Enter recommendations..."
                          value={formData.recommendations?.en || ''}
                          onChange={(e) =>
                            setFormData(prev => ({
                              ...prev,
                              recommendations: { 
                                ...(prev.recommendations || { en: '', ru: '' }), 
                                en: e.target.value 
                              }
                            }))
                          }
                        />
                      </div>
                      <div className="w-full">
                        <TextAreaGroup
                          label="Рекомендации (Русский)"
                          placeholder="Введите рекомендации..."
                          value={formData.recommendations?.ru || ''}
                          onChange={(e) =>
                            setFormData(prev => ({
                              ...prev,
                              recommendations: { 
                                ...(prev.recommendations || { en: '', ru: '' }), 
                                ru: e.target.value 
                              }
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* დამატებითი ინფორმაცია */}
                  <div className="mb-5.5">
                    <h4 className="mb-4 text-lg font-medium text-black dark:text-white">
                      {t('additionalInformation')}
                    </h4>
                    <div className="flex flex-col gap-5.5">
                      <div className="w-full">
                        <label className="mb-2.5 block font-medium text-black dark:text-white">
                          Additional Information (English)
                        </label>
                        <RichTextEditor
                          value={formData.additional?.en || ''}
                          onChange={(value) =>
                            setFormData(prev => ({
                              ...prev,
                              additional: {
                                ...(prev.additional || { en: '', ru: '' }),
                                en: value
                              }
                            }))
                          }
                        />
                      </div>
                      <div className="w-full">
                        <label className="mb-2.5 block font-medium text-black dark:text-white">
                          Дополнительная информация (Русский)
                        </label>
                        <RichTextEditor
                          value={formData.additional?.ru || ''}
                          onChange={(value) =>
                            setFormData(prev => ({
                              ...prev,
                              additional: {
                                ...(prev.additional || { en: '', ru: '' }),
                                ru: value
                              }
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* დემო ვიდეო */}
                  <div className="mb-5.5">
                    <h4 className="mb-4 text-lg font-medium text-black dark:text-white">
                      {t('demoVideo')}
                    </h4>
                    <div className="w-full">
                      <InputGroup
                        label={t('demoVideoUrl')}
                        name="demo_video_url"
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={formData.demoVideoUrl || ''}
                        handleChange={(e) =>
                          setFormData(prev => ({
                            ...prev,
                            demoVideoUrl: e.target.value
                          }))
                        }
                      />
                    </div>
                  </div>

                  {/* ფასები */}
                  <div className="mb-5.5">
                    <h4 className="mb-4 text-lg font-medium text-black dark:text-white">
                      {t('pricing')}
                    </h4>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 flex-shrink-0">
                          <span className="text-sm font-medium">{t('oneMonth')}:</span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.price?.monthly || 0}
                          onChange={(e) =>
                            setFormData(prev => ({
                              ...prev,
                              price: {
                                ...(prev.price || {
                                  monthly: 0,
                                  threeMonths: 0,
                                  sixMonths: 0,
                                  yearly: 0
                                }),
                                monthly: Number(e.target.value)
                              }
                            }))
                          }
                          className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark"
                          placeholder="0.00"
                        />
                        <span className="flex-shrink-0 text-sm">₾</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 flex-shrink-0">
                          <span className="text-sm font-medium">{t('threeMonths')}:</span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.price?.threeMonths || 0}
                          onChange={(e) =>
                            setFormData(prev => ({
                              ...prev,
                              price: {
                                ...(prev.price || {
                                  monthly: 0,
                                  threeMonths: 0,
                                  sixMonths: 0,
                                  yearly: 0
                                }),
                                threeMonths: Number(e.target.value)
                              }
                            }))
                          }
                          className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark"
                          placeholder="0.00"
                        />
                        <span className="flex-shrink-0 text-sm">₾</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 flex-shrink-0">
                          <span className="text-sm font-medium">{t('sixMonths')}:</span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.price?.sixMonths || 0}
                          onChange={(e) =>
                            setFormData(prev => ({
                              ...prev,
                              price: {
                                ...(prev.price || {
                                  monthly: 0,
                                  threeMonths: 0,
                                  sixMonths: 0,
                                  yearly: 0
                                }),
                                sixMonths: Number(e.target.value)
                              }
                            }))
                          }
                          className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark"
                          placeholder="0.00"
                        />
                        <span className="flex-shrink-0 text-sm">₾</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 flex-shrink-0">
                          <span className="text-sm font-medium">{t('yearly')}:</span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.price?.yearly || 0}
                          onChange={(e) =>
                            setFormData(prev => ({
                              ...prev,
                              price: {
                                ...(prev.price || {
                                  monthly: 0,
                                  threeMonths: 0,
                                  sixMonths: 0,
                                  yearly: 0
                                }),
                                yearly: Number(e.target.value)
                              }
                            }))
                          }
                          className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark"
                          placeholder="0.00"
                        />
                        <span className="flex-shrink-0 text-sm">₾</span>
                      </div>
                    </div>
                  </div>

                  {/* ფასდაკლებები */}
                  <div className="mb-5.5">
                    <h4 className="mb-4 text-lg font-medium text-black dark:text-white">
                      {t('discountedPrices')}
                    </h4>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 flex-shrink-0">
                          <span className="text-sm font-medium">{t('oneMonth')}:</span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.discountedPrice?.monthly || 0}
                          onChange={(e) =>
                            setFormData(prev => ({
                              ...prev,
                              discountedPrice: {
                                ...(prev.discountedPrice || {
                                  monthly: 0,
                                  threeMonths: 0,
                                  sixMonths: 0,
                                  yearly: 0
                                }),
                                monthly: Number(e.target.value)
                              }
                            }))
                          }
                          className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark"
                          placeholder="0.00"
                        />
                        <span className="flex-shrink-0 text-sm">₾</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 flex-shrink-0">
                          <span className="text-sm font-medium">{t('threeMonths')}:</span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.discountedPrice?.threeMonths || 0}
                          onChange={(e) =>
                            setFormData(prev => ({
                              ...prev,
                              discountedPrice: {
                                ...(prev.discountedPrice || {
                                  monthly: 0,
                                  threeMonths: 0,
                                  sixMonths: 0,
                                  yearly: 0
                                }),
                                threeMonths: Number(e.target.value)
                              }
                            }))
                          }
                          className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark"
                          placeholder="0.00"
                        />
                        <span className="flex-shrink-0 text-sm">₾</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 flex-shrink-0">
                          <span className="text-sm font-medium">{t('sixMonths')}:</span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.discountedPrice?.sixMonths || 0}
                          onChange={(e) =>
                            setFormData(prev => ({
                              ...prev,
                              discountedPrice: {
                                ...(prev.discountedPrice || {
                                  monthly: 0,
                                  threeMonths: 0,
                                  sixMonths: 0,
                                  yearly: 0
                                }),
                                sixMonths: Number(e.target.value)
                              }
                            }))
                          }
                          className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark"
                          placeholder="0.00"
                        />
                        <span className="flex-shrink-0 text-sm">₾</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 flex-shrink-0">
                          <span className="text-sm font-medium">{t('yearly')}:</span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.discountedPrice?.yearly || 0}
                          onChange={(e) =>
                            setFormData(prev => ({
                              ...prev,
                              discountedPrice: {
                                ...(prev.discountedPrice || {
                                  monthly: 0,
                                  threeMonths: 0,
                                  sixMonths: 0,
                                  yearly: 0
                                }),
                                yearly: Number(e.target.value)
                              }
                            }))
                          }
                          className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark"
                          placeholder="0.00"
                        />
                        <span className="flex-shrink-0 text-sm">₾</span>
                      </div>
                    </div>
                  </div>

                  {/* სტატუსები */}
                  <div className="mb-5.5">
                    <h4 className="mb-4 text-lg font-medium text-black dark:text-white">
                      {t('status')}
                    </h4>
                    <div className="flex items-center gap-x-3 mb-4">
                      <input
                        id="is-active"
                        name="is-active"
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label htmlFor="is-active" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                        {t('active')}
                      </label>
                    </div>

                    <div className="flex items-center gap-x-3">
                      <input
                        id="is-published"
                        name="is-published"
                        type="checkbox"
                        checked={formData.isPublished}
                        onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label htmlFor="is-published" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                        {t('published')}
                      </label>
                    </div>
                  </div>

                  {/* ღილაკები */}
                  <div className="flex gap-4 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={isLoading}
                    >
                      {t('cancel')}
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {isLoading ? 'Updating / Обновление...' : 'Update Set / Обновить набор'}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 