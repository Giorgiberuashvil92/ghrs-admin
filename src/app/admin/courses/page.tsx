'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Course } from '@/types/courses';
import { useLanguage } from '@/i18n/language-context';
import { Button } from '@/components/ui/button';
import CoursesTable from '@/components/Tables/courses-table';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const API_BASE_URL = process.env.NODE_ENV === 'development'
  ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  : process.env.NEXT_PUBLIC_API_URL || 'https://ghrs-backend.onrender.com';

export default function CoursesPage() {
  const { language, t } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/courses`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const data = await response.json();
      console.log('Fetched courses:', data);
      
      // Extract courses array from response and add missing fields with defaults
      const coursesData = data.courses || [];
      setCourses(coursesData.map((course: any) => ({
        ...course,
        id: course._id, // Convert _id to id for frontend
        // Add default values for missing fields
        advertisementImage: course.advertisementImage || '',
        rating: course.rating || { averageRating: 0, totalReviews: 0 },
        reviews: course.reviews || [],
        videoReviews: course.videoReviews || [],
        relatedCourses: course.relatedCourses || [],
        startDate: course.startDate || new Date().toISOString(),
        endDate: course.endDate || '',
        studentsCount: course.studentsCount || 0,
        // Ensure required fields have proper structure
        shortDescription: course.shortDescription || course.description || { en: '', ru: '' },
        announcements: course.announcements || [],
        additionalImages: course.additionalImages || [],
        certificateImages: course.certificateImages || [],
        learningOutcomes: course.learningOutcomes || [],
        syllabus: course.syllabus || [],
        languages: course.languages || ['en'],
        tags: course.tags || []
      })));
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]); // Empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete course');
      }

      setCourses(courses.filter(course => course.id !== id));
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('კურსის წაშლა ვერ მოხერხდა');
    }
  };

  const handleTogglePublish = async (id: string) => {
    try {
      const course = courses.find(c => c.id === id);
      if (!course) return;

      const response = await fetch(`${API_BASE_URL}/courses/${id}/toggle-publish`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to update course');
      }

      setCourses(courses.map(course => 
        course.id === id ? { ...course, isPublished: !course.isPublished } : course
      ));
    } catch (error) {
      console.error('Error toggling course publish status:', error);
      alert('კურსის სტატუსის შეცვლა ვერ მოხერხდა');
    }
  };

  const filteredCourses = courses?.filter(course => {
    // Safe title access with fallback
    const title = course.title?.[language as keyof typeof course.title] || 
                  course.title?.en || 
                  course.title?.ru || 
                  '';
    
    const matchesSearch = !searchTerm || 
      title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
      (filter === 'published' && course.isPublished) ||
      (filter === 'draft' && !course.isPublished);
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AcademicCapIcon className="h-8 w-8 text-blue-600" />
            კურსების მართვა
          </h1>
          <p className="text-gray-600 mt-1">შექმენით და მართავით სასწავლო კურსები</p>
        </div>
        
        <Link href="/admin/courses/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <PlusIcon className="h-4 w-4 mr-2" />
            ახალი კურსი
          </Button>
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="კურსების ძიება..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">ყველა კურსი</option>
            <option value="published">გამოქვეყნებული</option>
            <option value="draft">მუშაობის რეჟიმში</option>
          </select>
        </div>
      </div>

      {/* Courses List */}
      <CoursesTable
        courses={filteredCourses}
        loading={loading}
        onDelete={handleDelete}
        onTogglePublish={handleTogglePublish}
      />
    </div>
  );
} 