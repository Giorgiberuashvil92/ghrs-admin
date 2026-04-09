'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  Instructor,
  buildInstructorDisplayName,
  hasCompleteLocalizedNamePair,
  legacyFullNameToLocalizedParts,
} from '@/types/instructors';
import { Button } from '@/components/ui/button';
import ImageUpload from '@/components/FormElements/ImageUpload';
import MultilingualInput from '@/components/FormElements/MultilingualInput';
import { useLanguage } from '@/i18n/language-context';

interface EditInstructorPageProps {
  params: Promise<{ id: string }>;
}

export default function EditInstructorPage({ params }: EditInstructorPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState<Instructor>({
    _id: id,
    name: '',
    firstNameLocalized: { en: '', ru: '' },
    lastNameLocalized: { en: '', ru: '' },
    email: '',
    profession: '',
    professionLocalized: { en: '', ru: '', ka: '' },
    bio: { ka: '' },
    htmlContent: { ka: '' },
    profileImage: '',
    isActive: true,
    coursesCount: 0,
    studentsCount: 0,
    averageRating: 0,
    certificates: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  useEffect(() => {
    fetchInstructor();
  }, [id]);

  const fetchInstructor = async () => {
    try {
      setInitialLoading(true);
      const { getInstructor } = await import('@/lib/api/instructors');
      const instructorData = await getInstructor(id);
      let firstNameLocalized = instructorData.firstNameLocalized ?? { en: '', ru: '' };
      let lastNameLocalized = instructorData.lastNameLocalized ?? { en: '', ru: '' };
      const hasAnyLocalized = [
        firstNameLocalized.en,
        firstNameLocalized.ru,
        lastNameLocalized.en,
        lastNameLocalized.ru,
      ].some((x) => (x || '').trim());
      if (!hasAnyLocalized && (instructorData.name || '').trim()) {
        const leg = legacyFullNameToLocalizedParts(instructorData.name);
        firstNameLocalized = leg.firstNameLocalized;
        lastNameLocalized = leg.lastNameLocalized;
      }
      setFormData({
        ...instructorData,
        firstNameLocalized,
        lastNameLocalized,
        professionLocalized: instructorData.professionLocalized ?? { en: '', ru: '', ka: '' },
      });
    } catch (error) {
      console.error('Error fetching instructor:', error);
      alert(t('instructorLoadError'));
      router.push('/admin/instructors');
    } finally {
      setInitialLoading(false);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (
      !hasCompleteLocalizedNamePair(
        formData.firstNameLocalized ?? { en: '', ru: '' },
        formData.lastNameLocalized ?? { en: '', ru: '' }
      )
    ) {
      errors.namePair = t('instructorNamePairRequiredEnOrRu');
    }
    if (!formData.email?.trim()) errors.email = t('instructorEmailRequired');
    if (!formData.profession?.trim()) errors.profession = t('instructorProfessionRequired');
    if (!formData.bio?.en?.trim() && !formData.bio?.ru?.trim()) errors.bio = t('instructorBioRequiredEnRu');
    if (!formData.htmlContent?.en?.trim() && !formData.htmlContent?.ru?.trim()) errors.htmlContent = t('instructorDetailedBioRequiredEnRu');
    if (!formData.profileImage) errors.profileImage = t('instructorProfileImageRequired');

    if (Object.keys(errors).length > 0) {
      alert(Object.values(errors).join('\n'));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);

      const { updateInstructor } = await import('@/lib/api/instructors');
      const name = buildInstructorDisplayName(
        formData.firstNameLocalized,
        formData.lastNameLocalized,
        formData.name
      );
      await updateInstructor(id, {
        ...formData,
        name,
        firstNameLocalized: formData.firstNameLocalized ?? { en: '', ru: '' },
        lastNameLocalized: formData.lastNameLocalized ?? { en: '', ru: '' },
      });
      
      console.log('Instructor updated successfully:', formData);
      alert(t('instructorUpdateSuccess'));
      router.push('/admin/instructors');
      
    } catch (error) {
      console.error('Error updating instructor:', error);
      alert(t('instructorUpdateError'));
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('instructorEditTitle')}</h1>
        <p className="text-gray-600 mt-1">{t('instructorEditSubtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
          <div className="space-y-4">
            <MultilingualInput
              label={`${t('instructorFirstNameEnRu')} *`}
              value={{
                en: formData.firstNameLocalized?.en ?? '',
                ru: formData.firstNameLocalized?.ru ?? '',
              }}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  firstNameLocalized: {
                    en: value.en ?? '',
                    ru: value.ru ?? '',
                  },
                })
              }
              placeholder={t('instructorPlaceholderFirstName')}
              languages={['en', 'ru']}
            />
            <MultilingualInput
              label={`${t('instructorLastNameEnRu')} *`}
              value={{
                en: formData.lastNameLocalized?.en ?? '',
                ru: formData.lastNameLocalized?.ru ?? '',
              }}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  lastNameLocalized: {
                    en: value.en ?? '',
                    ru: value.ru ?? '',
                  },
                })
              }
              placeholder={t('instructorPlaceholderLastName')}
              languages={['en', 'ru']}
            />
            <p className="text-xs text-gray-500">
              {t('instructorSystemFullNameLabel')}:{' '}
              <span className="font-medium text-gray-700">
                {buildInstructorDisplayName(
                  formData.firstNameLocalized,
                  formData.lastNameLocalized,
                  formData.name
                ) || '—'}
              </span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('instructorEmail')}
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('instructorPlaceholderEmailEdit')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('instructorProfessionFallback')}
            </label>
            <input
              type="text"
              value={formData.profession}
              onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('instructorPlaceholderProfessionEdit')}
            />
          </div>

          <div>
            <MultilingualInput
              label={t('instructorProfessionByLanguage')}
              value={{
                en: formData.professionLocalized?.en ?? '',
                ru: formData.professionLocalized?.ru ?? '',
              }}
              onChange={(value) => setFormData({ 
                ...formData, 
                professionLocalized: {
                  en: value.en ?? '',
                  ru: value.ru ?? '',
                  ka: formData.professionLocalized?.ka ?? '',
                }
              })}
              placeholder={t('instructorPlaceholderProfessionByLanguage')}
              languages={['en', 'ru']}
            />
          </div>

          <div>
            <MultilingualInput
              label={t('instructorBio')}
              value={{
                en: formData.bio?.en || '',
                ru: formData.bio?.ru || ''
              }}
              onChange={(value) => setFormData({ 
                ...formData, 
                bio: {
                  ka: formData.bio?.ka || '',
                  en: value.en,
                  ru: value.ru
                }
              })}
              type="textarea"
              placeholder={t('instructorShortBioPlaceholder')}
              required
              languages={['en', 'ru']}
            />
          </div>

          <div>
            <MultilingualInput
              label={t('instructorDetailedBio')}
              value={{
                en: formData.htmlContent?.en || '',
                ru: formData.htmlContent?.ru || ''
              }}
              onChange={(value) => setFormData({ 
                ...formData, 
                htmlContent: {
                  ka: formData.htmlContent?.ka || '',
                  en: value.en,
                  ru: value.ru
                }
              })}
              type="richtext"
              height={1500}
              placeholder={t('instructorDetailedBioPlaceholder')}
              required
              languages={['en', 'ru']}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('instructorProfileImage')}
            </label>
            <ImageUpload
              value={formData.profileImage}
              onChange={(url) => setFormData({ ...formData, profileImage: url as string })}
              multiple={false}
              maxFiles={1}
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              {t('instructorActive')}
            </label>
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? t('saving') : t('save')}
          </Button>
          
          <Button
            type="button"
            onClick={() => router.push('/admin/instructors')}
            className="bg-gray-100 text-gray-600 hover:bg-gray-200"
          >
            {t('cancel')}
          </Button>
        </div>
      </form>
    </div>
  );
} 