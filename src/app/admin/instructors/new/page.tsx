'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { InstructorFormData, MultilingualContent, CreateInstructorData, FAQContent } from '@/types/instructors';
import { useLanguage } from '@/i18n/language-context';
import MultilingualInput from '@/components/FormElements/MultilingualInput';
import ImageUpload from '@/components/FormElements/ImageUpload';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeftIcon, 
  UserGroupIcon,
  CameraIcon,
  BriefcaseIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

export default function NewInstructorPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<InstructorFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profession: '',
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
    
    if (!formData.firstName.trim()) newErrors.firstName = 'სახელი სავალდებულოა';
    if (!formData.lastName.trim()) newErrors.lastName = 'გვარი სავალდებულოა';
    if (!formData.email.trim()) newErrors.email = 'ელ-ფოსტა სავალდებულოა';
    if (!formData.profession.trim()) newErrors.profession = 'პროფესია სავალდებულოა';
    if (!formData.role.en.trim()) newErrors.role = 'როლი სავალდებულოა ქართულ ენაზე';    
    if (!formData.bio.en.trim()) newErrors.bio = 'მოკლე ბიოგრაფია სავალდებულოა ქართულ ენაზე';
    if (!formData.detailedBio.en.trim()) newErrors.detailedBio = 'დეტალური ბიოგრაფია სავალდებულოა ქართულ ენაზე';
    if (!formData.profileImage) newErrors.profileImage = 'პროფილის სურათი სავალდებულოა';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const instructorData: CreateInstructorData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        profession: formData.profession,
        bio: formData.bio,
        htmlContent: formData.detailedBio,
        profileImage: formData.profileImage,
        isActive: formData.isActive,
        isVerified: formData.isVerified,
        faqContent: formData.faqContent
      };

      // API integration
      const { createInstructor } = await import('@/lib/api/instructors');
      const newInstructor = await createInstructor(instructorData);
      
      console.log('Instructor created successfully:', newInstructor);
      alert('ინსტრუქტორი წარმატებით შეიქმნა!');
      router.push('/admin/instructors');
      
    } catch (error) {
      console.error('Error creating instructor:', error);
      alert('ინსტრუქტორის შექმნა ვერ მოხერხდა');
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
              ახალი ინსტრუქტორის დამატება
            </h1>
            <p className="text-gray-600 mt-1">შეავსეთ ძირითადი ინფორმაცია ახალი ინსტრუქტორის დასამატებლად</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">ძირითადი ინფორმაცია</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      სახელი <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="მაგ. ლაშა"
                    />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      გვარი <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="მაგ. ჯიქია"
                    />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ელ-ფოსტა <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="lasha@example.com"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ტელეფონი
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+995 555 123 456"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    პროფესია <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.profession}
                    onChange={(e) => setFormData(prev => ({ ...prev, profession: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.profession ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="მაგ. სოფთვერ დეველოპერი, მასაჟისტი, ფიზიოთერაპევტი"
                  />
                  {errors.profession && <p className="text-red-500 text-sm mt-1">{errors.profession}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    სრული ტიტული/წოდება
                  </label>
                  <input
                    type="text"
                    value={formData.fullTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullTitle: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="მაგ. Dr. ლაშა ჯიქია, Ph.D, C.A., P.T."
                  />
                </div>

                <MultilingualInput
                  label="როლი/პოზიცია"
                  value={formData.role}
                  onChange={(value) => setFormData(prev => ({ ...prev, role: value as MultilingualContent }))}
                  required
                  type="textarea"
                  rows={2}
                  className={errors.role ? 'border-red-500' : ''}
                  placeholder="მაგ. კოლეჯის დამფუძნებელი და ხელმძღვანელი"
                />
                {errors.role && <p className="text-red-500 text-sm">{errors.role}</p>}

                <MultilingualInput
                  label="მოკლე ბიოგრაფია"
                  value={formData.bio}
                  onChange={(value) => setFormData(prev => ({ ...prev, bio: value as MultilingualContent }))}
                  required
                  type="textarea"
                  rows={4}
                  className={errors.bio ? 'border-red-500' : ''}
                  placeholder="ინსტრუქტორის შესახებ მოკლე ინფორმაცია..."
                />
                {errors.bio && <p className="text-red-500 text-sm">{errors.bio}</p>}

                <MultilingualInput
                  label="დეტალური ბიოგრაფია"
                  value={formData.detailedBio}
                  onChange={(value) => setFormData(prev => ({ ...prev, detailedBio: value as MultilingualContent }))}
                  required
                  type="richtext"
                  rows={12}
                  className={errors.detailedBio ? 'border-red-500' : ''}
                  placeholder="ინსტრუქტორის დეტალური ბიოგრაფია, განათლება, გამოცდილება..."
                />
                {errors.detailedBio && <p className="text-red-500 text-sm">{errors.detailedBio}</p>}
              </div>
            </div>

            {/* FAQ Content */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">FAQ კონტენტი</h2>
                <Button type="button" onClick={addFAQItem} size="sm">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  კითხვის დამატება
                </Button>
              </div>

              {formData.faqContent.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  FAQ კითხვები არ არის დამატებული
                </p>
              ) : (
                <div className="space-y-6">
                  {formData.faqContent.map((faq, index) => (
                    <div key={faq.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium text-gray-900">კითხვა #{index + 1}</h3>
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
                          label="კითხვა"
                          value={faq.question}
                          onChange={(value) => updateFAQItem(index, 'question', value as MultilingualContent)}
                          type="text"
                          placeholder="შეიყვანეთ კითხვა..."
                        />

                        <MultilingualInput
                          label="პასუხი"
                          value={faq.answer}
                          onChange={(value) => updateFAQItem(index, 'answer', value as MultilingualContent)}
                          type="richtext"
                          rows={4}
                          placeholder="შეიყვანეთ პასუხი..."
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
                პროფილის სურათი
              </h2>
              
              <ImageUpload
                label="ატვირთეთ სურათი"
                required
                value={formData.profileImage}
                onChange={(url) => setFormData(prev => ({ ...prev, profileImage: url as string }))}
                className={errors.profileImage ? 'border-red-500' : ''}
              />
              {errors.profileImage && <p className="text-red-500 text-sm mt-2">{errors.profileImage}</p>}
            </div>

            {/* Status Settings */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">სტატუსი</h2>
              
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    აქტიური ინსტრუქტორი
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
                    ვერიფიცირებული ინსტრუქტორი
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
                  {loading ? 'მუშავდება...' : 'ინსტრუქტორის შექმნა'}
                </Button>
                
                <Link href="/admin/instructors">
                  <Button type="button" variant="outline" className="w-full">
                    გაუქმება
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