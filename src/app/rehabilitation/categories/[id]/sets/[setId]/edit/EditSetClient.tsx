'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Set } from '@/types/sets';
import { Category } from '@/types/categories';
import { Button } from '@/components/ui/button';
import { updateSet } from '@/lib/api/sets';
import { useLanguage } from '@/i18n/language-context';
import { TrashIcon, PhotoIcon, LinkIcon } from '@heroicons/react/24/outline';

interface EditSetClientProps {
  category: Category;
  initialSet: Set;
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
    <Image
      src={src}
      alt={alt}
      width={96}
      height={96}
      className="h-24 w-24 object-cover rounded-lg"
      unoptimized
    />
  );
};

export default function EditSetClient({ category, initialSet }: EditSetClientProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [set, setSet] = useState(initialSet);
  const [previewImage, setPreviewImage] = useState<string | null>(initialSet.thumbnailImage || null);
  const [isUrlInput, setIsUrlInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        setSet({ ...set, thumbnailImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageDelete = () => {
    setPreviewImage(null);
    setSet({ ...set, thumbnailImage: '' });
    setImageUrl('');
  };

  const handleUrlSubmit = () => {
    if (imageUrl.trim()) {
      setPreviewImage(imageUrl);
      setSet({ ...set, thumbnailImage: imageUrl });
      setIsUrlInput(false);
      setImageUrl(''); // გაასუფთავე ველი
    } else {
      alert(t('pleaseEnterImageUrl'));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateSet(set._id, {
        name: set.name,
        description: set.description,
        thumbnailImage: set.thumbnailImage,
        price: set.price,
        levels: set.levels,
        isActive: set.isActive,
        isPublished: set.isPublished,
      });

      router.push(`/rehabilitation/categories/${category._id}/sets`);
      router.refresh();
    } catch (error) {
      console.error('Error updating set:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {t('editSet')} - {set.name.ka}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {t('changeSetInfo')}
          </p>
        </div>

        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* სურათის სექცია */}
            <div className="col-span-full">
              <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
                {t('setImage')}
              </label>
              <div className="flex items-start gap-x-4">
                {previewImage ? (
                  <div className="relative">
                    <ImageComponent
                      src={previewImage}
                      alt="Set thumbnail"
                    />
                    <button
                      type="button"
                      onClick={handleImageDelete}
                      className="absolute -top-2 -right-2 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-24 w-24 rounded-lg border border-dashed border-gray-300 bg-gray-50">
                    <PhotoIcon className="h-8 w-8 text-gray-300" />
                  </div>
                )}
                
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsUrlInput(false);
                        fileInputRef.current?.click();
                      }}
                    >
                      <PhotoIcon className="h-4 w-4 mr-2" />
                      {t('uploadImage')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsUrlInput(true)}
                    >
                      <LinkIcon className="h-4 w-4 mr-2" />
                      {t('enterImageUrl')}
                    </Button>
                  </div>

                  {isUrlInput && (
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder={t('enterImageUrl')}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                      />
                      <Button
                        type="button"
                        onClick={handleUrlSubmit}
                        variant="default"
                        className="whitespace-nowrap"
                      >
                        {t('add')}
                      </Button>
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              {/* სახელის სექცია */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="name-ka" className="block text-sm font-medium text-gray-700">
                    {t('nameInGeorgian')}
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="name-ka"
                      id="name-ka"
                      value={set.name.ka}
                      onChange={(e) => setSet({ ...set, name: { ...set.name, ka: e.target.value } })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="name-en" className="block text-sm font-medium text-gray-700">
                    {t('nameInEnglish')}
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="name-en"
                      id="name-en"
                      value={set.name.en}
                      onChange={(e) => setSet({ ...set, name: { ...set.name, en: e.target.value } })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* აღწერის სექცია */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="description-ka" className="block text-sm font-medium text-gray-700">
                    {t('descriptionInGeorgian')}
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description-ka"
                      name="description-ka"
                      rows={3}
                      value={set.description?.ka || ''}
                      onChange={(e) => setSet({
                        ...set,
                        description: {
                          ka: e.target.value,
                          en: set.description?.en || '',
                          ru: set.description?.ru || '',
                        }
                      })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description-en" className="block text-sm font-medium text-gray-700">
                    {t('descriptionInEnglish')}
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description-en"
                      name="description-en"
                      rows={3}
                      value={set.description?.en || ''}
                      onChange={(e) => setSet({
                        ...set,
                        description: {
                          ka: set.description?.ka || '',
                          en: e.target.value,
                          ru: set.description?.ru || '',
                        }
                      })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ფასების სექცია */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-base font-semibold leading-7 text-gray-900 mb-4">{t('pricing')}</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div>
                  <label htmlFor="price-monthly" className="block text-sm font-medium text-gray-700">
                    {t('monthly')}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="number"
                      name="price-monthly"
                      id="price-monthly"
                      value={set.price.monthly}
                      onChange={(e) => setSet({ ...set, price: { ...set.price, monthly: Number(e.target.value) } })}
                      className="block w-full rounded-md border-gray-300 pl-3 pr-8 focus:border-primary focus:ring-primary sm:text-sm"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-gray-500 sm:text-sm">₾</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="price-three-months" className="block text-sm font-medium text-gray-700">
                    {t('threeMonths')}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="number"
                      name="price-three-months"
                      id="price-three-months"
                      value={set.price.threeMonths}
                      onChange={(e) => setSet({ ...set, price: { ...set.price, threeMonths: Number(e.target.value) } })}
                      className="block w-full rounded-md border-gray-300 pl-3 pr-8 focus:border-primary focus:ring-primary sm:text-sm"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-gray-500 sm:text-sm">₾</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="price-six-months" className="block text-sm font-medium text-gray-700">
                    {t('sixMonths')}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="number"
                      name="price-six-months"
                      id="price-six-months"
                      value={set.price.sixMonths}
                      onChange={(e) => setSet({ ...set, price: { ...set.price, sixMonths: Number(e.target.value) } })}
                      className="block w-full rounded-md border-gray-300 pl-3 pr-8 focus:border-primary focus:ring-primary sm:text-sm"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-gray-500 sm:text-sm">₾</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="price-yearly" className="block text-sm font-medium text-gray-700">
                    {t('yearly')}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="number"
                      name="price-yearly"
                      id="price-yearly"
                      value={set.price.yearly}
                      onChange={(e) => setSet({ ...set, price: { ...set.price, yearly: Number(e.target.value) } })}
                      className="block w-full rounded-md border-gray-300 pl-3 pr-8 focus:border-primary focus:ring-primary sm:text-sm"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-gray-500 sm:text-sm">₾</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* სტატუსის სექცია */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-base font-semibold leading-7 text-gray-900 mb-4">{t('status')}</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-x-3">
                  <input
                    id="is-active"
                    name="is-active"
                    type="checkbox"
                    checked={set.isActive}
                    onChange={(e) => setSet({ ...set, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="is-active" className="block text-sm font-medium leading-6 text-gray-900">
                    {t('active')}
                  </label>
                </div>

                <div className="flex items-center gap-x-3">
                  <input
                    id="is-published"
                    name="is-published"
                    type="checkbox"
                    checked={set.isPublished}
                    onChange={(e) => setSet({ ...set, isPublished: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="is-published" className="block text-sm font-medium leading-6 text-gray-900">
                    {t('published')}
                  </label>
                </div>
              </div>
            </div>

            {/* ღილაკების სექცია */}
            <div className="border-t border-gray-200 pt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                variant="default"
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90"
              >
                {isLoading ? t('updating') : t('updateSet')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 