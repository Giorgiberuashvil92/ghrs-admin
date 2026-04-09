'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  InstructorFormData,
  MultilingualContent,
  CreateInstructorData,
  FAQContent,
  hasCompleteLocalizedNamePair,
} from '@/types/instructors';
import { useLanguage } from '@/i18n/language-context';
import MultilingualInput from '@/components/FormElements/MultilingualInput';
import ImageUpload from '@/components/FormElements/ImageUpload';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeftIcon, 
  UserGroupIcon,
  CameraIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

export default function NewInstructorPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<InstructorFormData>({
    firstNameLocalized: { en: '', ru: '' },
    lastNameLocalized: { en: '', ru: '' },
    email: '',
    phone: '',
    profession: '',
    professionLocalized: { en: '', ru: '', ka: '' },
    role: { ka: '', en: '', ru: '' },
    fullTitle: '',
    bio: { ka: '', en: '', ru: '' },
    detailedBio: { ka: '', en: '', ru: '' },
    profileImage: '',
    isActive: true,
    isVerified: false,
    faqContent: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // FAQ Content Management
  const addFAQItem = () => {
    const newFAQ: FAQContent = {
      id: `faq-${Date.now()}`,
      question: { ka: '', en: '', ru: '' },
      answer: { ka: '', en: '', ru: '' },
      order: formData.faqContent.length + 1
    };
    setFormData(prev => ({
      ...prev,
      faqContent: [...prev.faqContent, newFAQ]
    }));
  };

  const updateFAQItem = (index: number, field: 'question' | 'answer', value: MultilingualContent) => {
    setFormData(prev => ({
      ...prev,
      faqContent: prev.faqContent.map((faq, i) => 
        i === index ? { ...faq, [field]: value } : faq
      )
    }));
  };

  const removeFAQItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      faqContent: prev.faqContent.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!hasCompleteLocalizedNamePair(formData.firstNameLocalized, formData.lastNameLocalized)) {
      newErrors.namePair = t('instructorNamePairRequiredEnOrRu');
    }
    if (!formData.email.trim()) newErrors.email = t('instructorEmailRequired');
    if (!formData.profession?.trim() && !formData.professionLocalized?.en?.trim() && !formData.professionLocalized?.ru?.trim()) newErrors.profession = t('instructorProfessionRequired');
    const hasRole = [formData.role?.ka, formData.role?.en, formData.role?.ru].some((v) => (v || '').trim());
    if (!hasRole) newErrors.role = t('instructorRoleRequired');
    const hasBio = [formData.bio?.ka, formData.bio?.en, formData.bio?.ru].some((v) => (v || '').trim());
    if (!hasBio) newErrors.bio = t('instructorBioRequired');
    const hasDetailedBio = [formData.detailedBio?.ka, formData.detailedBio?.en, formData.detailedBio?.ru].some((v) => (v || '').trim());
    if (!hasDetailedBio) newErrors.detailedBio = t('instructorDetailedBioRequired');
    if (!formData.profileImage) newErrors.profileImage = t('instructorProfileImageRequired');
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const { mapToBackendFormat } = await import('@/types/instructors');
      const backendData = mapToBackendFormat(formData);
      const instructorData: CreateInstructorData = {
        ...backendData,
        profession: backendData.profession || formData.professionLocalized?.en || formData.professionLocalized?.ru || formData.profession,
        professionLocalized: backendData.professionLocalized,
      };

      // API integration
      const { createInstructor } = await import('@/lib/api/instructors');
      const newInstructor = await createInstructor(instructorData);
      
      console.log('Instructor created successfully:', newInstructor);
      alert(t('instructorCreateSuccess'));
      router.push('/admin/instructors');
      
    } catch (error) {
      console.error('Error creating instructor:', error);
      alert(t('instructorCreateError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/instructors" 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <UserGroupIcon className="h-8 w-8 text-blue-600" />
              {t('instructorAddNew')}
            </h1>
            <p className="text-gray-600 mt-1">{t('instructorFillBasicInfo')}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">{t('basicInformation')}</h2>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <MultilingualInput
                    label={`${t('instructorFirstNameEnRu')} *`}
                    value={{
                      en: formData.firstNameLocalized.en,
                      ru: formData.firstNameLocalized.ru,
                    }}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        firstNameLocalized: {
                          en: value.en ?? '',
                          ru: value.ru ?? '',
                        },
                      }))
                    }
                    placeholder={t('instructorPlaceholderFirstName')}
                    languages={['en', 'ru']}
                    className={errors.namePair ? 'border-red-500' : ''}
                  />
                  <MultilingualInput
                    label={`${t('instructorLastNameEnRu')} *`}
                    value={{
                      en: formData.lastNameLocalized.en,
                      ru: formData.lastNameLocalized.ru,
                    }}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        lastNameLocalized: {
                          en: value.en ?? '',
                          ru: value.ru ?? '',
                        },
                      }))
                    }
                    placeholder={t('instructorPlaceholderLastName')}
                    languages={['en', 'ru']}
                    className={errors.namePair ? 'border-red-500' : ''}
                  />
                  {errors.namePair && (
                    <p className="text-red-500 text-sm">{errors.namePair}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('instructorEmail')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder={t('instructorPlaceholderEmail')}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('instructorPhone')}
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t('instructorPlaceholderPhone')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('instructorProfessionFallback')}
                  </label>
                  <input
                    type="text"
                    value={formData.profession}
                    onChange={(e) => setFormData(prev => ({ ...prev, profession: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('instructorPlaceholderProfession')}
                  />
                </div>
                <div>
                  <MultilingualInput
                    label={t('instructorProfessionByLanguage')}
                    value={{
                      en: formData.professionLocalized.en,
                      ru: formData.professionLocalized.ru,
                    }}
                    onChange={(value) => setFormData(prev => ({
                      ...prev,
                      professionLocalized: {
                        ...prev.professionLocalized,
                        en: value.en,
                        ru: value.ru,
                      },
                    }))}
                    placeholder={t('instructorPlaceholderProfessionLocalized')}
                    languages={['en', 'ru']}
                  />
                  {errors.profession && <p className="text-red-500 text-sm mt-1">{errors.profession}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('instructorFullTitle')}
                  </label>
                  <input
                    type="text"
                    value={formData.fullTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullTitle: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('instructorPlaceholderFullTitle')}
                  />
                </div>

                <MultilingualInput
                  label={t('instructorRole')}
                  value={formData.role}
                  onChange={(value) => setFormData(prev => ({ ...prev, role: value as MultilingualContent }))}
                  required
                  type="textarea"
                  rows={2}
                  className={errors.role ? 'border-red-500' : ''}
                  placeholder={t('instructorPlaceholderRole')}
                />
                {errors.role && <p className="text-red-500 text-sm">{errors.role}</p>}

                <MultilingualInput
                  label={t('instructorBio')}
                  value={formData.bio}
                  onChange={(value) => setFormData(prev => ({ ...prev, bio: value as MultilingualContent }))}
                  required
                  type="textarea"
                  rows={4}
                  className={errors.bio ? 'border-red-500' : ''}
                  placeholder={t('instructorPlaceholderBio')}
                />
                {errors.bio && <p className="text-red-500 text-sm">{errors.bio}</p>}

                <MultilingualInput
                  label={t('instructorDetailedBio')}
                  value={formData.detailedBio}
                  onChange={(value) => setFormData(prev => ({ ...prev, detailedBio: value as MultilingualContent }))}
                  required
                  type="richtext"
                  rows={12}
                  height={1500}
                  className={errors.detailedBio ? 'border-red-500' : ''}
                  placeholder={t('instructorPlaceholderDetailedBio')}
                />
                {errors.detailedBio && <p className="text-red-500 text-sm">{errors.detailedBio}</p>}
              </div>
            </div>

            {/* FAQ Content */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">{t('instructorFaqContent')}</h2>
                <Button type="button" onClick={addFAQItem} size="sm">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  {t('instructorAddQuestion')}
                </Button>
              </div>

              {formData.faqContent.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  {t('instructorNoFaqAdded')}
                </p>
              ) : (
                <div className="space-y-6">
                  {formData.faqContent.map((faq, index) => (
                    <div key={faq.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium text-gray-900">{t('instructorQuestionNumber')} #{index + 1}</h3>
                        <Button
                          type="button"
                          onClick={() => removeFAQItem(index)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <MultilingualInput
                          label={t('instructorQuestion')}
                          value={faq.question}
                          onChange={(value) => updateFAQItem(index, 'question', value as MultilingualContent)}
                          type="text"
                          placeholder={t('instructorPlaceholderQuestion')}
                        />

                        <MultilingualInput
                          label={t('instructorAnswer')}
                          value={faq.answer}
                          onChange={(value) => updateFAQItem(index, 'answer', value as MultilingualContent)}
                          type="richtext"
                          rows={4}
                          height={1000}
                          placeholder={t('instructorPlaceholderAnswer')}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Profile Image */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <CameraIcon className="h-5 w-5" />
                {t('instructorProfileImage')}
              </h2>
              
              <ImageUpload
                label={t('instructorUploadImage')}
                required
                value={formData.profileImage}
                onChange={(url) => setFormData(prev => ({ ...prev, profileImage: url as string }))}
                className={errors.profileImage ? 'border-red-500' : ''}
              />
              {errors.profileImage && <p className="text-red-500 text-sm mt-2">{errors.profileImage}</p>}
            </div>

            {/* Status Settings */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">{t('status')}</h2>
              
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {t('instructorActive')}
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isVerified}
                    onChange={(e) => setFormData(prev => ({ ...prev, isVerified: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {t('instructorVerified')}
                  </span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="space-y-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? t('instructorCreating') : t('instructorCreate')}
                </Button>
                
                <Link href="/admin/instructors">
                  <Button type="button" variant="outline" className="w-full">
                    {t('cancel')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
} 