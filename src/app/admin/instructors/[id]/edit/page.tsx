'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Instructor, MultilingualContent } from '@/types/instructors';
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
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState<Instructor>({
    _id: id,
    name: '',
    email: '',
    profession: '',
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
      setFormData(instructorData);
    } catch (error) {
      console.error('Error fetching instructor:', error);
      alert('ინსტრუქტორის ჩატვირთვა ვერ მოხერხდა');
      router.push('/admin/instructors');
    } finally {
      setInitialLoading(false);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name?.trim()) errors.name = 'სახელი სავალდებულოა';
    if (!formData.email?.trim()) errors.email = 'ელ-ფოსტა სავალდებულოა';
    if (!formData.profession?.trim()) errors.profession = 'პროფესია სავალდებულოა';
    if (!formData.bio?.en?.trim() && !formData.bio?.ru?.trim()) errors.bio = 'ბიოგრაფია სავალდებულოა ინგლისურ ან რუსულ ენაზე';
    if (!formData.htmlContent?.en?.trim() && !formData.htmlContent?.ru?.trim()) errors.htmlContent = 'დეტალური ბიოგრაფია სავალდებულოა ინგლისურ ან რუსულ ენაზე';
    if (!formData.profileImage) errors.profileImage = 'პროფილის სურათი სავალდებულოა';

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
      await updateInstructor(id, formData);
      
      console.log('Instructor updated successfully:', formData);
      alert('ინსტრუქტორი წარმატებით განახლდა!');
      router.push('/admin/instructors');
      
    } catch (error) {
      console.error('Error updating instructor:', error);
      alert('ინსტრუქტორის განახლება ვერ მოხერხდა');
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
        <h1 className="text-2xl font-bold text-gray-900">ინსტრუქტორის რედაქტირება</h1>
        <p className="text-gray-600 mt-1">განაახლეთ ინსტრუქტორის ინფორმაცია</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
          {/* სახელი */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              სახელი და გვარი
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="მაგ: გიორგი გიორგაძე"
            />
          </div>

          {/* ელ-ფოსტა */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ელ-ფოსტა
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="მაგ: giorgi@gmail.com"
            />
          </div>

          {/* პროფესია */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              პროფესია
            </label>
            <input
              type="text"
              value={formData.profession}
              onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="მაგ: მასაჟისტი"
            />
          </div>

          {/* მოკლე ბიოგრაფია */}
          <div>
            <MultilingualInput
              label="მოკლე ბიოგრაფია"
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
              placeholder="მოკლე ბიოგრაფია..."
              required
              languages={['en', 'ru']}
            />
          </div>

          {/* დეტალური ბიოგრაფია */}
          <div>
            <MultilingualInput
              label="დეტალური ბიოგრაფია"
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
              height={1000}
              placeholder="დეტალური ბიოგრაფია..."
              required
              languages={['en', 'ru']}
            />
          </div>

          {/* პროფილის სურათი */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              პროფილის სურათი
            </label>
            <ImageUpload
              value={formData.profileImage}
              onChange={(url) => setFormData({ ...formData, profileImage: url as string })}
              multiple={false}
              maxFiles={1}
              required
            />
          </div>

          {/* აქტიური/არააქტიური */}
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              აქტიური ინსტრუქტორი
            </label>
          </div>
        </div>

        {/* ღილაკები */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'ინახება...' : 'შენახვა'}
          </Button>
          
          <Button
            type="button"
            onClick={() => router.push('/admin/instructors')}
            className="bg-gray-100 text-gray-600 hover:bg-gray-200"
          >
            გაუქმება
          </Button>
        </div>
      </form>
    </div>
  );
} 