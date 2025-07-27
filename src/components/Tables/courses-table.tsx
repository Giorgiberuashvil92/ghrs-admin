'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Course } from '@/types/courses';
import { useLanguage } from '@/i18n/language-context';
import { Button } from '@/components/ui/button';
import { 
  EyeIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
  AcademicCapIcon,
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface CoursesTableProps {
  courses: Course[];
  loading?: boolean;
  onDelete?: (id: string) => void;
  onTogglePublish?: (id: string) => void;
}

export default function CoursesTable({ 
  courses, 
  loading = false, 
  onDelete,
  onTogglePublish 
}: CoursesTableProps) {
  const { language } = useLanguage();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const handleDelete = (course: Course) => {
    if (!confirm(`დარწმუნებული ხართ რომ გინდათ "${course.title[language as keyof typeof course.title] || course.title.en}" კურსის წაშლა?`)) return;
    onDelete?.(course.id);
  };

  const handleTogglePublish = (course: Course) => {
    onTogglePublish?.(course.id);
  };

  const formatRating = (rating?: any) => {
    if (!rating || !rating.averageRating) return 0;
    return rating.averageRating.toFixed(1);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}სთ ${mins}წთ`;
    }
    return `${mins}წთ`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ka-GE');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="h-12 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="text-center py-12">
          <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">კურსები არ მოიძებნა</p>
          <p className="text-gray-400 mb-6">შექმენით თქვენი პირველი კურსი</p>
          <Link href="/admin/courses/new">
            <Button>
              <AcademicCapIcon className="h-4 w-4 mr-2" />
              პირველი კურსის შექმნა
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Table Header with Stats */}
      <div className="px-6 py-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            კურსების სია ({courses.length})
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              გამოქვეყნებული: {courses.filter(c => c.isPublished).length}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              მუშაობის რეჟიმში: {courses.filter(c => !c.isPublished).length}
            </span>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                კურსი
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                ინსტრუქტორი
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                ფასი/ხანგრძლივობა
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                სტატუსი
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                სტუდენტები/რეიტინგი
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                თარიღები
              </th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                მოქმედებები
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {courses.map((course) => (
              <tr key={course.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <img
                      src={course.thumbnail}
                      alt={course.title[language as keyof typeof course.title] || course.title.en}
                      className="w-16 h-12 rounded-lg object-cover mr-4 bg-gray-100"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/placeholder-course.jpg';
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 truncate">
                        {course.title[language as keyof typeof course.title] || course.title.en}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {course.shortDescription?.[language as keyof typeof course.shortDescription] || 
                         course.shortDescription?.en || 
                         'აღწერა არ არის მითითებული'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {course.instructor.image && (
                      <img
                        src={course.instructor.image}
                        alt={course.instructor.name}
                        className="w-8 h-8 rounded-full mr-3"
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {course.instructor.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {course.instructor.profession}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <div className="flex items-center text-gray-900 font-medium">
                      <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                      ₾{course.price}
                    </div>
                    <div className="flex items-center text-gray-500">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {formatDuration(course.duration)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleTogglePublish(course)}
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-colors ${
                      course.isPublished 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    }`}
                  >
                    {course.isPublished ? 'გამოქვეყნებული' : 'მუშაობის რეჟიმში'}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <div className="flex items-center text-gray-900">
                      <UserGroupIcon className="h-4 w-4 mr-1" />
                      {course.studentsCount || 0}
                    </div>
                    <div className="flex items-center text-gray-500">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`h-3 w-3 ${
                            i < Math.floor(parseFloat(formatRating(course.rating)))
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-xs">
                        {formatRating(course.rating)}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {formatDate(course.startDate)}
                    </div>
                    {course.endDate && (
                      <div className="text-xs text-gray-400">
                        {formatDate(course.endDate)}-მდე
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setSelectedCourse(course)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                      title="ნახვა"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <Link
                      href={`/admin/courses/${course.id}/edit`}
                      className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                      title="რედაქტირება"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(course)}
                      className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                      title="წაშლა"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden">
        <div className="divide-y divide-gray-200">
          {courses.map((course) => (
            <div key={course.id} className="p-4">
              <div className="flex items-start space-x-4">
                <img
                  src={course.thumbnail}
                  alt={course.title[language as keyof typeof course.title] || course.title.en}
                  className="w-20 h-16 rounded-lg object-cover bg-gray-100"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/placeholder-course.jpg';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 truncate">
                        {course.title[language as keyof typeof course.title] || course.title.en}
                      </h4>
                      <p className="text-sm text-gray-500 truncate">
                        {course.instructor.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Link
                        href={`/admin/courses/${course.id}/edit`}
                        className="text-green-600 hover:text-green-900 p-1"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(course)}
                        className="text-red-600 hover:text-red-900 p-1"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                      ₾{course.price}
                    </span>
                    <span className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {formatDuration(course.duration)}
                    </span>
                    <span className="flex items-center">
                      <UserGroupIcon className="h-4 w-4 mr-1" />
                      {course.studentsCount || 0}
                    </span>
                  </div>
                  
                  <div className="mt-2 flex items-center justify-between">
                    <button
                      onClick={() => handleTogglePublish(course)}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        course.isPublished 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {course.isPublished ? 'გამოქვეყნებული' : 'მუშაობის რეჟიმში'}
                    </button>
                    
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`h-3 w-3 ${
                            i < Math.floor(parseFloat(formatRating(course.rating)))
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-xs text-gray-500">
                        {formatRating(course.rating)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Course Preview Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  კურსის გადახედვა
                </h3>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <img
                  src={selectedCourse.thumbnail}
                  alt={selectedCourse.title[language as keyof typeof selectedCourse.title] || selectedCourse.title.en}
                  className="w-full h-48 object-cover rounded-lg"
                />
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {selectedCourse.title[language as keyof typeof selectedCourse.title] || selectedCourse.title.en}
                  </h4>
                  <p className="text-gray-600">
                    {selectedCourse.description[language as keyof typeof selectedCourse.description] || selectedCourse.description.en}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">ინსტრუქტორი:</span>
                    <p>{selectedCourse.instructor.name}</p>
                  </div>
                  <div>
                    <span className="font-medium">ფასი:</span>
                    <p>₾{selectedCourse.price}</p>
                  </div>
                  <div>
                    <span className="font-medium">ხანგრძლივობა:</span>
                    <p>{formatDuration(selectedCourse.duration)}</p>
                  </div>
                  <div>
                    <span className="font-medium">სტუდენტები:</span>
                    <p>{selectedCourse.studentsCount || 0}</p>
                  </div>
                </div>
                
                {selectedCourse.learningOutcomes.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">სწავლის შედეგები:</h5>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      {selectedCourse.learningOutcomes.map((outcome, index) => (
                        <li key={index}>
                          {outcome[language as keyof typeof outcome] || outcome.en}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex gap-2">
                <Link
                  href={`/admin/courses/${selectedCourse.id}/edit`}
                  className="flex-1"
                >
                  <Button className="w-full">
                    რედაქტირება
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedCourse(null)}
                  className="flex-1"
                >
                  დახურვა
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 