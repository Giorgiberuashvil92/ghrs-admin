'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Instructor } from '@/types/instructors';
import { useLanguage } from '@/i18n/language-context';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface InstructorProfilePageProps {
  params: Promise<{ id: string }>;
}

export default function InstructorProfilePage({ params }: InstructorProfilePageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [instructor, setInstructor] = useState<Instructor | null>(null);

  useEffect(() => {
    fetchInstructorData();
  }, [id]);

  const fetchInstructorData = async () => {
    try {
      setLoading(true);
      const { getInstructor } = await import('@/lib/api/instructors');
      const instructorData = await getInstructor(id);
      setInstructor(instructorData);
    } catch (error) {
      console.error('Error fetching instructor data:', error);
      alert('ინსტრუქტორის ინფორმაციის ჩატვირთვა ვერ მოხერხდა');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !instructor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/instructors" 
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {instructor.name}
          </h1>
          <p className="text-gray-600">{instructor.profession}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex flex-col items-center">
              <img
                src={instructor.profileImage}
                alt={instructor.name}
                className="w-32 h-32 rounded-full object-cover mb-4"
              />
              <h2 className="text-xl font-semibold text-gray-900">{instructor.name}</h2>
              <p className="text-gray-600">{instructor.email}</p>
              <p className="text-sm text-gray-500 mt-1">{instructor.profession}</p>
              
              <div className="mt-4 flex gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  instructor.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {instructor.isActive ? 'აქტიური' : 'არააქტიური'}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">სტატისტიკა</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">კურსები</span>
                <span className="font-medium">{instructor.coursesCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">სტუდენტები</span>
                <span className="font-medium">{instructor.studentsCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">საშუალო რეიტინგი</span>
                <span className="font-medium">{instructor.averageRating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column - Bio & Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ბიოგრაფია</h3>
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: instructor.bio.ka }} />
            </div>
          </div>

          {/* Detailed Content */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">დეტალური ინფორმაცია</h3>
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: instructor.htmlContent.ka }} />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-end">
        <Link href={`/admin/instructors/${instructor._id}/edit`}>
          <Button className="bg-blue-600 hover:bg-blue-700">
            რედაქტირება
          </Button>
        </Link>
      </div>
    </div>
  );
} 