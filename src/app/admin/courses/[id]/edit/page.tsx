'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CourseFormData, MultilingualContent, CourseSyllabus } from '@/types/courses';
import { useLanguage } from '@/i18n/language-context';
import MultilingualInput from '@/components/FormElements/MultilingualInput';
import ImageUpload from '@/components/FormElements/ImageUpload';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeftIcon, 
  AcademicCapIcon,
  TrashIcon,
  PlusIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

const API_URL = process.env.NODE_ENV === 'development'
  ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  : process.env.NEXT_PUBLIC_API_URL || 'https://ghrs-backend.onrender.com';

interface EditCoursePageProps {
  params: Promise<{ id: string }>;
}

export default function EditCoursePage({ params }: EditCoursePageProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const resolvedParams = React.use(params);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const subcategoryRef = useRef<HTMLSelectElement>(null);
  const [categories, setCategories] = useState<Array<{
    _id: string;
    name: {
      ka: string;
      en: string;
      ru: string;
      _id: string;
    };
    subcategories: string[];
  }>>([]);

  const [subcategories, setSubcategories] = useState<Array<{
    _id: string;
    name: {
      ka: string;
      en: string;
      ru: string;
      _id: string;
    };
    categoryId: string;
  }>>([]);
  
  const emptyMultilingualContent: MultilingualContent = { en: '', ru: '' };
  
  const [formData, setFormData] = useState<CourseFormData>({
    title: emptyMultilingualContent,
    description: emptyMultilingualContent,
    shortDescription: emptyMultilingualContent,
    announcements: [],
    price: 0,
    thumbnail: '',
    additionalImages: [],
    advertisementImage: '',
    previewVideoUrl: '',
    duration: 0,
    isPublished: false,
    instructor: {
      name: ''
    },
    prerequisites: emptyMultilingualContent,
    certificateDescription: emptyMultilingualContent,
    certificateImages: [],
    learningOutcomes: [],
    syllabus: [],
    languages: ['en', 'ru'],
    tags: [],
    categoryId: '',
    subcategoryId: '',
    startDate: '',
    endDate: ''
  });

  const [instructors, setInstructors] = useState<Array<{
    _id: string;
    name: string;
  }>>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setInitialLoading(true);
        
        // Fetch course data
        const courseResponse = await fetch(`${API_URL}/courses/${resolvedParams.id}`);
        if (!courseResponse.ok) {
          throw new Error('Failed to fetch course');
        }
        const courseData = await courseResponse.json();
        
        // Populate form with course data
        setFormData({
          title: courseData.title || emptyMultilingualContent,
          description: courseData.description || emptyMultilingualContent,
          shortDescription: courseData.shortDescription || emptyMultilingualContent,
          announcements: courseData.announcements || [],
          price: courseData.price || 0,
          thumbnail: courseData.thumbnail || '',
          additionalImages: courseData.additionalImages || [],
          advertisementImage: courseData.advertisementImage || '',
          previewVideoUrl: courseData.previewVideoUrl || '',
          duration: courseData.duration || 0,
          isPublished: courseData.isPublished || false,
          instructor: {
            name: courseData.instructor?.name || ''
          },
          prerequisites: courseData.prerequisites || emptyMultilingualContent,
          certificateDescription: courseData.certificateDescription || emptyMultilingualContent,
          certificateImages: courseData.certificateImages || [],
          learningOutcomes: courseData.learningOutcomes || [],
          syllabus: courseData.syllabus || [],
          languages: courseData.languages || ['en', 'ru'],
          tags: courseData.tags || [],
          categoryId: courseData.categoryId || '',
          subcategoryId: courseData.subcategoryId || '',
          startDate: courseData.startDate || '',
          endDate: courseData.endDate || ''
        });

        // Fetch instructors and categories
        const [instructorsResponse, categoriesResponse] = await Promise.all([
          fetch(`${API_URL}/instructors`),
          fetch(`${API_URL}/categories`)
        ]);

        if (instructorsResponse.ok && categoriesResponse.ok) {
          const instructorsData = await instructorsResponse.json();
          const categoriesData = await categoriesResponse.json();

          setInstructors(Array.isArray(instructorsData.instructors) ? instructorsData.instructors : []);
          setCategories(Array.isArray(categoriesData) ? categoriesData : []);

          // If course has subcategory, fetch subcategories
          if (courseData.categoryId && courseData.subcategoryId) {
            const selectedCategory = categoriesData.find((cat: any) => cat._id === courseData.categoryId);
            if (selectedCategory && selectedCategory.subcategories.length > 0) {
              await fetchSubcategories(courseData.categoryId, selectedCategory.subcategories[0]);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        alert(language === 'en' 
          ? 'Failed to load course data'
          : language === 'ru'
          ? 'Не удалось загрузить данные курса'
          : 'კურსის მონაცემების ჩატვირთვა ვერ მოხერხდა');
        router.push('/admin/courses');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams.id]);

  // ქვეკატეგორიების წამოღება კატეგორიის არჩევისას
  const fetchSubcategories = async (categoryId: string, subcategoryId: string) => {
    setLoadingSubcategories(true);
    try {
      const response = await fetch(`${API_URL}/categories/${categoryId}/subcategories/${subcategoryId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch subcategories');
      }

      const data = await response.json();
      const subcategoriesArray = Array.isArray(data) ? data : [data];
      setSubcategories(subcategoriesArray);

    } catch (error) {
      console.error('Error fetching subcategories:', error);
      setSubcategories([]);
    } finally {
      setLoadingSubcategories(false);
    }
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  const addLearningOutcome = () => {
    setFormData(prev => ({
      ...prev,
      learningOutcomes: [...prev.learningOutcomes, { ...emptyMultilingualContent }]
    }));
  };

  const addSyllabusItem = () => {
    setFormData(prev => ({
      ...prev,
      syllabus: [...prev.syllabus, {
        title: emptyMultilingualContent,
        description: emptyMultilingualContent,
        duration: undefined
      }]
    }));
  };

  const addAnnouncement = () => {
    setFormData(prev => ({
      ...prev,
      announcements: [...prev.announcements, {
        title: { ...emptyMultilingualContent },
        content: { ...emptyMultilingualContent },
        isActive: true
      }]
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.en && !formData.title.ru) newErrors.title = 'სათაური სავალდებულოა მინიმუმ ერთ ენაზე';
    if (!formData.description.en && !formData.description.ru) newErrors.description = 'აღწერა სავალდებულოა მინიმუმ ერთ ენაზე';
    if (!formData.price || formData.price <= 0) newErrors.price = 'ფასი სავალდებულოა და უნდა იყოს 0-ზე მეტი';
    if (!formData.categoryId) newErrors.category = 'კატეგორია სავალდებულოა';
    if (!formData.thumbnail) newErrors.thumbnail = 'მთავარი სურათი სავალდებულოა';
    if (!formData.instructor.name) newErrors.instructor = 'ინსტრუქტორი სავალდებულოა';
    if (formData.languages.length === 0) newErrors.languages = 'მინიმუმ ერთი ენა უნდა იყოს არჩეული';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const courseData = {
        title: {
          en: formData.title.en || '',
          ru: formData.title.ru || formData.title.en || ''
        },
        description: {
          en: formData.description.en || '',
          ru: formData.description.ru || formData.description.en || ''
        },
        price: formData.price,
        thumbnail: formData.thumbnail,
        isPublished: formData.isPublished,
        instructor: {
          name: formData.instructor.name
        },
        languages: formData.languages,
        categoryId: formData.categoryId,
        ...(formData.subcategoryId && { subcategoryId: formData.subcategoryId }),
        ...(formData.duration && { duration: formData.duration }),
        ...(formData.startDate && { startDate: formData.startDate }),
        ...(formData.endDate && { endDate: formData.endDate }),
        ...(formData.previewVideoUrl && { previewVideoUrl: formData.previewVideoUrl }),
        ...(formData.additionalImages.length > 0 && { additionalImages: formData.additionalImages }),
        ...(formData.advertisementImage && { advertisementImage: formData.advertisementImage }),
        ...(formData.certificateImages?.length > 0 && { certificateImages: formData.certificateImages }),
        ...(formData.syllabus.length > 0 && {
          syllabus: formData.syllabus.map(item => ({
            title: { 
              en: item.title.en || '',
              ru: item.title.ru || item.title.en || ''
            },
            description: { 
              en: item.description.en || '',
              ru: item.description.ru || item.description.en || ''
            },
            duration: 0
          }))
        })
      };

      console.log('Course data to update:', courseData);
      
      const response = await fetch(`${API_URL}/courses/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update course');
      }

      const updatedCourse = await response.json();
      console.log('Updated course:', updatedCourse);

      alert(language === 'en' 
        ? 'Course updated successfully!'
        : language === 'ru'
        ? 'Курс успешно обновлен!'
        : 'კურსი წარმატებით განახლდა!');
      router.push('/admin/courses');
      
    } catch (error) {
      console.error('Error updating course:', error);
      alert(language === 'en'
        ? error instanceof Error ? error.message : 'Failed to update course'
        : language === 'ru'
        ? error instanceof Error ? error.message : 'Не удалось обновить курс'
        : error instanceof Error ? error.message : 'კურსის განახლება ვერ მოხერხდა');
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/courses" 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <AcademicCapIcon className="h-8 w-8 text-blue-600" />
              {language === 'en' ? 'Edit Course' : language === 'ru' ? 'Редактировать курс' : 'კურსის რედაქტირება'}
            </h1>
            <p className="text-gray-600 mt-1">
              {language === 'en' 
                ? 'Update course information'
                : language === 'ru'
                ? 'Обновите информацию о курсе'
                : 'განაახლეთ კურსის ინფორმაცია'}
            </p>
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
                <MultilingualInput
                  label="კურსის სათაური"
                  value={formData.title}
                  onChange={(value) => setFormData(prev => ({ ...prev, title: value as MultilingualContent }))}
                  required
                  maxLength={200}
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}

                <MultilingualInput
                  label="მოკლე აღწერა"
                  value={formData.shortDescription}
                  onChange={(value) => setFormData(prev => ({ ...prev, shortDescription: value as MultilingualContent   }))}
                  type="textarea"
                  maxLength={500}
                  rows={3}
                />

                <MultilingualInput
                  label="სრული აღწერა"
                  value={formData.description}
                  onChange={(value) => setFormData(prev => ({ ...prev, description: value as MultilingualContent }))}
                  required
                  type="richtext"
                  rows={10}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
              </div>
            </div>

            {/* Course Details */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">კურსის დეტალები</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ფასი (ლარი) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="99.99"
                  />
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ხანგრძლივობა (წუთები) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.duration ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="120"
                  />
                  {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    კატეგორია <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, categoryId: e.target.value }));
                      setSubcategories([]); // Clear subcategories when category changes
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">აირჩიეთ კატეგორია</option>
                    {categories.map(category => (
                      <option key={category._id} value={category._id}>
                        {category.name.en || category.name.ru || category.name.ka}
                      </option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ქვეკატეგორია
                  </label>
                  <select
                    value={formData.subcategoryId}
                    onChange={(e) => setFormData(prev => ({ ...prev, subcategoryId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!formData.categoryId || loadingSubcategories}
                  >
                    <option value="">აირჩიეთ ქვეკატეგორია</option>
                    {subcategories.map(subcategory => (
                      <option key={subcategory._id} value={subcategory._id}>
                        {subcategory.name.en || subcategory.name.ru || subcategory.name.ka}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Learning Outcomes */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">სწავლის შედეგები</h2>
                <Button type="button" onClick={addLearningOutcome} size="sm">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  შედეგის დამატება
                </Button>
              </div>
              
              <div className="space-y-4">
                {formData.learningOutcomes.map((outcome, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-medium text-gray-900">შედეგი {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          learningOutcomes: prev.learningOutcomes.filter((_, i) => i !== index)
                        }))}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                                         <MultilingualInput
                       label=""
                       value={outcome}
                       onChange={(value) => setFormData(prev => ({
                         ...prev,
                         learningOutcomes: prev.learningOutcomes.map((outcome, i) => 
                           i === index ? value as MultilingualContent : outcome
                         )
                       }))}
                       placeholder="სწავლის შედეგი"
                     />
                  </div>
                ))}
                
                {formData.learningOutcomes.length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    სწავლის შედეგები არ არის დამატებული
                  </p>
                )}
              </div>
            </div>

            {/* Syllabus */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">სილაბუსი</h2>
                <Button type="button" onClick={addSyllabusItem} size="sm">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  სილაბუსის წევრის დამატება
                </Button>
              </div>
              
              <div className="space-y-4">
                {formData.syllabus.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-medium text-gray-900">წევრი {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          syllabus: prev.syllabus.filter((_, i) => i !== index)
                        }))}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <MultilingualInput
                      label="სათაური"
                      value={item.title}
                      onChange={(value) => setFormData(prev => ({
                        ...prev,
                        syllabus: prev.syllabus.map((item, i) => 
                          i === index ? { ...item, title: value as MultilingualContent } : item
                        )
                      }))}
                      required
                      maxLength={200}
                      className={errors.syllabusTitle ? 'border-red-500' : ''}
                    />
                    {errors.syllabusTitle && <p className="text-red-500 text-sm mt-1">{errors.syllabusTitle}</p>}

                    <MultilingualInput
                      label="აღწერა"
                      value={item.description}
                      onChange={(value) => setFormData(prev => ({
                        ...prev,
                        syllabus: prev.syllabus.map((item, i) => 
                          i === index ? { ...item, description: value as MultilingualContent } : item
                        )
                      }))}
                      type="richtext"
                      rows={5}
                      className={errors.syllabusDescription ? 'border-red-500' : ''}
                    />
                    {errors.syllabusDescription && <p className="text-red-500 text-sm mt-1">{errors.syllabusDescription}</p>}

                    <div className="flex items-center mt-4">
                      <VideoCameraIcon className="h-5 w-5 text-gray-500 mr-2" />
                      <input
                        type="number"
                        value={item.duration || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          syllabus: prev.syllabus.map((item, i) => 
                            i === index ? { ...item, duration: parseInt(e.target.value) || undefined } : item
                          )
                        }))}
                        className="w-24 px-2 py-1 border rounded-lg text-sm"
                        placeholder="ხანგრძლივობა (წუთები)"
                      />
                    </div>
                  </div>
                ))}
                
                {formData.syllabus.length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    სილაბუსი არ არის დამატებული
                  </p>
                )}
              </div>
            </div>

            {/* Announcements */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">განცხადებები</h2>
                <Button type="button" onClick={addAnnouncement} size="sm">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  განცხადების დამატება
                </Button>
              </div>
              
              <div className="space-y-4">
                {formData.announcements.map((announcement, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-medium text-gray-900">განცხადება {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          announcements: prev.announcements.filter((_, i) => i !== index)
                        }))}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <MultilingualInput
                      label="სათაური"
                      value={announcement.title}
                      onChange={(value) => setFormData(prev => ({
                        ...prev,
                        announcements: prev.announcements.map((announcement, i) => 
                          i === index ? { ...announcement, title: value as MultilingualContent } : announcement
                        )
                      }))}
                      required
                      maxLength={200}
                      className={errors.announcementTitle ? 'border-red-500' : ''}
                    />
                    {errors.announcementTitle && <p className="text-red-500 text-sm mt-1">{errors.announcementTitle}</p>}

                    <MultilingualInput
                      label="მასალა"
                      value={announcement.content}
                      onChange={(value) => setFormData(prev => ({
                        ...prev,
                        announcements: prev.announcements.map((announcement, i) => 
                          i === index ? { ...announcement, content: value as MultilingualContent } : announcement
                        )
                      }))}
                      type="richtext"
                      rows={5}
                      className={errors.announcementContent ? 'border-red-500' : ''}
                    />
                    {errors.announcementContent && <p className="text-red-500 text-sm mt-1">{errors.announcementContent}</p>}

                    <label className="flex items-center mt-4">
                      <input
                        type="checkbox"
                        checked={announcement.isActive}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          announcements: prev.announcements.map((announcement, i) => 
                            i === index ? { ...announcement, isActive: e.target.checked } : announcement
                          )
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        განცხადების გამოქვეყნება
                      </span>
                    </label>
                  </div>
                ))}
                
                {formData.announcements.length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    განცხადებები არ არის დამატებული
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Publication Settings */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">გამოქვეყნება</h2>
              
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    კურსის გამოქვეყნება
                  </span>
                </label>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      დაწყების თარიღი <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.startDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      დასრულების თარიღი
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Course Images */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">სურათები</h2>
              
              <div className="space-y-6">
                <ImageUpload
                  label="მთავარი სურათი"
                  required
                  value={formData.thumbnail}
                  onChange={(url) => setFormData(prev => ({ ...prev, thumbnail: url as string }))}
                />
                {errors.thumbnail && <p className="text-red-500 text-sm">{errors.thumbnail}</p>}
                
                <ImageUpload
                  label="დამატებითი სურათები"
                  multiple
                  maxFiles={5}
                  value={formData.additionalImages}
                  onChange={(urls) => setFormData(prev => ({ ...prev, additionalImages: urls as string[] }))}
                />
              </div>
            </div>

            {/* Certificate Images */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">სერტიფიკატები</h2>
              
              <div className="space-y-6">
                <ImageUpload
                  label="სერტიფიკატის სურათი"
                  multiple
                  maxFiles={3}
                  value={formData.certificateImages}
                  onChange={(urls) => setFormData(prev => ({ ...prev, certificateImages: urls as string[] }))}
                />
              </div>
            </div>

            {/* Prerequisites */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">პრეფრექსები</h2>
              
              <MultilingualInput
                label="პრეფრექსები"
                value={formData.prerequisites}
                onChange={(value) => setFormData(prev => ({ ...prev, prerequisites: value as MultilingualContent }))}
                type="textarea"
                rows={5}
                className={errors.prerequisites ? 'border-red-500' : ''}
              />
              {errors.prerequisites && <p className="text-red-500 text-sm mt-1">{errors.prerequisites}</p>}
            </div>

            {/* Certificate Description */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">სერტიფიკატის აღწერა</h2>
              
              <MultilingualInput
                label="სერტიფიკატის აღწერა"
                value={formData.certificateDescription}
                onChange={(value) => setFormData(prev => ({ ...prev, certificateDescription: value as MultilingualContent }))}
                type="richtext"
                rows={5}
                className={errors.certificateDescription ? 'border-red-500' : ''}
              />
              {errors.certificateDescription && <p className="text-red-500 text-sm mt-1">{errors.certificateDescription}</p>}
            </div>

            {/* Tags */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">ტეგები</h2>
              
              <MultilingualInput
                label="ტეგები"
                value={formData.tags}
                onChange={(value) => setFormData(prev => ({ ...prev, tags: value as string[] }))}
                type="tags"
                className={errors.tags ? 'border-red-500' : ''}
              />
              {errors.tags && <p className="text-red-500 text-sm mt-1">{errors.tags}</p>}
            </div>

            {/* Materials */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">მასალები</h2>
              
              <MultilingualInput
                label="მასალები"
                value={formData.materials}
                onChange={(value) => setFormData(prev => ({ ...prev, materials: value as string[] }))}
                type="tags"
                className={errors.materials ? 'border-red-500' : ''}
              />
              {errors.materials && <p className="text-red-500 text-sm mt-1">{errors.materials}</p>}
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="space-y-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? 'მუშავდება...' : 'კურსის განახლება'}
                </Button>
                
                <Link href="/admin/courses">
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