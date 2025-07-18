'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Category } from '@/lib/api/categories';
import { createSet } from '@/lib/api/sets';
import { toast } from 'react-hot-toast';
import { useLanguage } from '@/i18n/language-context';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import { Button } from '@/components/ui/button';
import InputGroup from '@/components/FormElements/InputGroup';
import { TextAreaGroup } from '@/components/FormElements/InputGroup/text-area';
import { CreateSetData } from '@/types/sets';
import { UploadIcon } from '@/assets/icons';

interface AddSetClientProps {
  category: Category;
}

export default function AddSetClient({ category }: AddSetClientProps) {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [imageType, setImageType] = useState<'url' | 'file'>('url');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<Omit<CreateSetData, 'categoryId'>>({
    name: {
      ka: '',
      en: '',
      ru: '',
    },
    description: {
      ka: '',
      en: '',
      ru: '',
    },
    thumbnailImage: '',
    price: {
      monthly: 0,
      threeMonths: 0,
      sixMonths: 0,
      yearly: 0,
    },
    levels: {
      beginner: {
        exerciseCount: 0,
        isLocked: false,
      },
      intermediate: {
        exerciseCount: 0,
        isLocked: true,
      },
      advanced: {
        exerciseCount: 0,
        isLocked: true,
      },
    },
    isActive: true,
    isPublished: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const setData: CreateSetData = {
        ...formData,
        categoryId: category._id,
      };

      if (imageType === 'file' && imageFile) {
        const formDataToSend = new FormData();
        
        // დავამატოთ ყველა ველი FormData-ში
        formDataToSend.append('thumbnailImage', imageFile);
        formDataToSend.append('categoryId', category._id);
        
        // ლოკალიზებული ველები
        if (formData.name) {
          Object.entries(formData.name).forEach(([lang, value]) => {
            formDataToSend.append(`name[${lang}]`, value);
          });
        }
        
        if (formData.description) {
          Object.entries(formData.description).forEach(([lang, value]) => {
            formDataToSend.append(`description[${lang}]`, value);
          });
        }
        
        // ფასები
        Object.entries(formData.price).forEach(([period, value]) => {
          formDataToSend.append(`price[${period}]`, String(value));
        });
        
        // დონეები
        Object.entries(formData.levels).forEach(([level, data]) => {
          formDataToSend.append(`levels[${level}][exerciseCount]`, String(data.exerciseCount));
          formDataToSend.append(`levels[${level}][isLocked]`, String(data.isLocked));
        });
        
        // სტატუსები
        formDataToSend.append('isActive', String(formData.isActive));
        formDataToSend.append('isPublished', String(formData.isPublished));
        
        await createSet({
          formData: formDataToSend,
          isFormData: true
        });
      } else {
        await createSet({
          formData: setData,
          isFormData: false
        });
      }

      toast.success('სეტი წარმატებით დაემატა');
      router.push(`/rehabilitation/categories/${category._id}/sets`);
      router.refresh();
    } catch (error) {
      console.error('Error creating set:', error);
      toast.error('შეცდომა სეტის დამატებისას');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mx-auto max-w-270">
        <Breadcrumb pageName={`სეტის დამატება - ${category.name[language]}`} />

        <div className="grid grid-cols-12 gap-4">
          {/* მთავარი ფორმა */}
          <div className="col-span-12 xl:col-span-8">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  სეტის დეტალები
                </h3>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="p-7">
                  {/* სურათი */}
                  <div className="mb-5.5">
                    <h4 className="mb-4 text-lg font-medium text-black dark:text-white">
                      სურათი
                    </h4>
                    <div className="flex gap-4 mb-4">
                      <Button
                        type="button"
                        variant={imageType === 'url' ? 'default' : 'outline'}
                        onClick={() => setImageType('url')}
                      >
                        URL ბმული
                      </Button>
                      <Button
                        type="button"
                        variant={imageType === 'file' ? 'default' : 'outline'}
                        onClick={() => setImageType('file')}
                      >
                        ფაილის ატვირთვა
                      </Button>
                    </div>
                    
                    {imageType === 'url' ? (
                      <div className="w-full">
                        <InputGroup
                          label="სურათის URL"
                          name="thumbnailImage"
                          type="text"
                          placeholder="https://example.com/image.jpg"
                          value={formData.thumbnailImage}
                          handleChange={(e) =>
                            setFormData(prev => ({
                              ...prev,
                              thumbnailImage: e.target.value
                            }))
                          }
                          required={imageType === 'url'}
                        />
                      </div>
                    ) : (
                      <div className="w-full">
                        <div className="mt-1 flex justify-center rounded-lg border-2 border-dashed border-stroke px-6 py-10 dark:border-strokedark">
                          <div className="text-center">
                            {!imageFile ? (
                              <>
                                <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="mt-4 flex text-sm text-gray-600 dark:text-gray-400">
                                  <label className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80">
                                    <span>აირჩიეთ ფაილი</span>
                                    <input
                                      type="file"
                                      className="sr-only"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          setImageFile(file);
                                          setFormData(prev => ({
                                            ...prev,
                                            thumbnailImage: ''
                                          }));
                                        }
                                      }}
                                    />
                                  </label>
                                  <p className="pl-1">ან ჩააგდეთ</p>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  PNG, JPG, GIF მაქსიმუმ 10MB
                                </p>
                              </>
                            ) : (
                              <div className="space-y-2">
                                <div className="flex items-center justify-center">
                                  <img
                                    src={URL.createObjectURL(imageFile)}
                                    alt="Preview"
                                    className="max-h-40 rounded-lg object-contain"
                                  />
                                </div>
                                <div className="flex justify-center gap-2">
                                  <p className="text-sm text-gray-500">
                                    {imageFile.name}
                                  </p>
                                  <button
                                    type="button"
                                    className="text-sm text-red-500 hover:text-red-700"
                                    onClick={() => {
                                      setImageFile(null);
                                      setFormData(prev => ({
                                        ...prev,
                                        thumbnailImage: ''
                                      }));
                                    }}
                                  >
                                    წაშლა
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* სახელები */}
                  <div className="mb-5.5">
                    <h4 className="mb-4 text-lg font-medium text-black dark:text-white">
                      დასახელება
                    </h4>
                    <div className="flex flex-col gap-5.5">
                      <div className="w-full">
                        <InputGroup
                          label="სახელი (ქართულად)"
                          name="name_ka"
                          type="text"
                          placeholder="მაგ: ორთოპედიული სეტი"
                          value={formData.name.ka}
                          handleChange={(e) =>
                            setFormData(prev => ({
                              ...prev,
                              name: { ...prev.name, ka: e.target.value }
                            }))
                          }
                          required
                        />
                      </div>
                      <div className="w-full">
                        <InputGroup
                          label="Name (English)"
                          name="name_en"
                          type="text"
                          placeholder="e.g. Orthopedic Set"
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
                          label="Название (Русский)"
                          name="name_ru"
                          type="text"
                          placeholder="например: Ортопедический набор"
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
                      აღწერა
                    </h4>
                    <div className="flex flex-col gap-5.5">
                      <div className="w-full">
                        <TextAreaGroup
                          label="აღწერა (ქართულად)"
                          placeholder="დეტალური აღწერა..."
                          value={formData.description?.ka || ''}
                          onChange={(e) =>
                            setFormData(prev => ({
                              ...prev,
                              description: { 
                                ...(prev.description || { ka: '', en: '', ru: '' }), 
                                ka: e.target.value 
                              }
                            }))
                          }
                        />
                      </div>
                      <div className="w-full">
                        <TextAreaGroup
                          label="Description (English)"
                          placeholder="Detailed description..."
                          value={formData.description?.en || ''}
                          onChange={(e) =>
                            setFormData(prev => ({
                              ...prev,
                              description: { 
                                ...(prev.description || { ka: '', en: '', ru: '' }), 
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
                                ...(prev.description || { ka: '', en: '', ru: '' }), 
                                ru: e.target.value 
                              }
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* დონეები */}
                  <div className="mb-5.5">
                    <h4 className="mb-4 text-lg font-medium text-black dark:text-white">
                      დონეები
                    </h4>
                    <div className="flex flex-col gap-5.5">
                      {/* დამწყები */}
                      <div className="rounded-sm border border-stroke bg-gray-50 p-4 dark:border-strokedark dark:bg-boxdark">
                        <h5 className="mb-3 font-medium">დამწყები</h5>
                        <div className="flex items-center gap-4">
                          <label className="cursor-pointer">
                            <div className="relative flex items-center pt-0.5">
                              <input
                                type="checkbox"
                                checked={!formData.levels.beginner.isLocked}
                                onChange={(e) =>
                                  setFormData(prev => ({
                                    ...prev,
                                    levels: {
                                      ...prev.levels,
                                      beginner: {
                                        ...prev.levels.beginner,
                                        isLocked: !e.target.checked
                                      }
                                    }
                                  }))
                                }
                                className="taskCheckbox h-5 w-5 cursor-pointer rounded-full border border-stroke bg-transparent after:invisible after:flex after:h-4 after:w-4 after:items-center after:justify-center after:text-white after:content-['\2714'] checked:border-primary checked:bg-primary checked:after:visible dark:border-strokedark"
                              />
                              <p className="ml-3 font-medium">ხელმისაწვდომი</p>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* საშუალო */}
                      <div className="rounded-sm border border-stroke bg-gray-50 p-4 dark:border-strokedark dark:bg-boxdark">
                        <h5 className="mb-3 font-medium">საშუალო</h5>
                        <div className="flex items-center gap-4">
                          <label className="cursor-pointer">
                            <div className="relative flex items-center pt-0.5">
                              <input
                                type="checkbox"
                                checked={!formData.levels.intermediate.isLocked}
                                onChange={(e) =>
                                  setFormData(prev => ({
                                    ...prev,
                                    levels: {
                                      ...prev.levels,
                                      intermediate: {
                                        ...prev.levels.intermediate,
                                        isLocked: !e.target.checked
                                      }
                                    }
                                  }))
                                }
                                className="taskCheckbox h-5 w-5 cursor-pointer rounded-full border border-stroke bg-transparent after:invisible after:flex after:h-4 after:w-4 after:items-center after:justify-center after:text-white after:content-['\2714'] checked:border-primary checked:bg-primary checked:after:visible dark:border-strokedark"
                              />
                              <p className="ml-3 font-medium">ხელმისაწვდომი</p>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* რთული */}
                      <div className="rounded-sm border border-stroke bg-gray-50 p-4 dark:border-strokedark dark:bg-boxdark">
                        <h5 className="mb-3 font-medium">რთული</h5>
                        <div className="flex items-center gap-4">
                          <label className="cursor-pointer">
                            <div className="relative flex items-center pt-0.5">
                              <input
                                type="checkbox"
                                checked={!formData.levels.advanced.isLocked}
                                onChange={(e) =>
                                  setFormData(prev => ({
                                    ...prev,
                                    levels: {
                                      ...prev.levels,
                                      advanced: {
                                        ...prev.levels.advanced,
                                        isLocked: !e.target.checked
                                      }
                                    }
                                  }))
                                }
                                className="taskCheckbox h-5 w-5 cursor-pointer rounded-full border border-stroke bg-transparent after:invisible after:flex after:h-4 after:w-4 after:items-center after:justify-center after:text-white after:content-['\2714'] checked:border-primary checked:bg-primary checked:after:visible dark:border-strokedark"
                              />
                              <p className="ml-3 font-medium">ხელმისაწვდომი</p>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* გვერდითა პანელი */}
          <div className="col-span-12 xl:col-span-4">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  ფასები და სტატუსი
                </h3>
              </div>
              <div className="p-7">
                {/* ფასები */}
                <div className="mb-5.5">
                  <h4 className="mb-4 text-lg font-medium text-black dark:text-white">
                    ფასები
                  </h4>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 flex-shrink-0">
                        <span className="text-sm font-medium">1 თვე:</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price.monthly}
                        onChange={(e) =>
                          setFormData(prev => ({
                            ...prev,
                            price: { ...prev.price, monthly: Number(e.target.value) }
                          }))
                        }
                        className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark"
                        placeholder="0.00"
                      />
                      <span className="flex-shrink-0 text-sm">₾</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 flex-shrink-0">
                        <span className="text-sm font-medium">3 თვე:</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price.threeMonths}
                        onChange={(e) =>
                          setFormData(prev => ({
                            ...prev,
                            price: { ...prev.price, threeMonths: Number(e.target.value) }
                          }))
                        }
                        className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark"
                        placeholder="0.00"
                      />
                      <span className="flex-shrink-0 text-sm">₾</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 flex-shrink-0">
                        <span className="text-sm font-medium">6 თვე:</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price.sixMonths}
                        onChange={(e) =>
                          setFormData(prev => ({
                            ...prev,
                            price: { ...prev.price, sixMonths: Number(e.target.value) }
                          }))
                        }
                        className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark"
                        placeholder="0.00"
                      />
                      <span className="flex-shrink-0 text-sm">₾</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 flex-shrink-0">
                        <span className="text-sm font-medium">12 თვე:</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price.yearly}
                        onChange={(e) =>
                          setFormData(prev => ({
                            ...prev,
                            price: { ...prev.price, yearly: Number(e.target.value) }
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
                    სტატუსი
                  </h4>
                  <div className="flex flex-col gap-4">
                    <label className="cursor-pointer">
                      <div className="relative flex items-center pt-0.5">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) =>
                            setFormData(prev => ({ ...prev, isActive: e.target.checked }))
                          }
                          className="taskCheckbox h-5 w-5 cursor-pointer rounded-full border border-stroke bg-transparent after:invisible after:flex after:h-4 after:w-4 after:items-center after:justify-center after:text-white after:content-['\2714'] checked:border-primary checked:bg-primary checked:after:visible dark:border-strokedark"
                        />
                        <p className="ml-3 font-medium">აქტიური</p>
                      </div>
                    </label>
                    <label className="cursor-pointer">
                      <div className="relative flex items-center pt-0.5">
                        <input
                          type="checkbox"
                          checked={formData.isPublished}
                          onChange={(e) =>
                            setFormData(prev => ({ ...prev, isPublished: e.target.checked }))
                          }
                          className="taskCheckbox h-5 w-5 cursor-pointer rounded-full border border-stroke bg-transparent after:invisible after:flex after:h-4 after:w-4 after:items-center after:justify-center after:text-white after:content-['\2714'] checked:border-primary checked:bg-primary checked:after:visible dark:border-strokedark"
                        />
                        <p className="ml-3 font-medium">გამოქვეყნებული</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* ღილაკები */}
                <div className="flex flex-col gap-2">
                  <Button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    variant="add"
                    size="lg"
                    className="w-full"
                  >
                    {isLoading ? 'იტვირთება...' : 'დამატება'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isLoading}
                    className="w-full"
                  >
                    გაუქმება
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 