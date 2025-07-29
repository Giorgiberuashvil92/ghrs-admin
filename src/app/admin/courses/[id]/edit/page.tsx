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

// Translation object for course edit page
const translations = {
  en: {
    editCourse: 'Edit Course',
    backToCourses: 'Back to Courses',
    saveDraft: 'Save Draft',
    updateCourse: 'Update Course',
    updating: 'Updating...',
    basicInfo: 'Basic Information',
    courseTitle: 'Course Title',
    shortDescription: 'Short Description',
    fullDescription: 'Full Description',
    courseDetails: 'Course Details',
    price: 'Price (₾)',
    duration: 'Duration (minutes)',
    instructor: 'Instructor',
    selectInstructor: 'Select Instructor',
    category: 'Category',
    selectCategory: 'Select Category',
    subcategory: 'Subcategory',
    selectSubcategory: 'Select Subcategory',
    media: 'Media',
    thumbnail: 'Course Thumbnail',
    additionalImages: 'Additional Images',
    advertisementImage: 'Advertisement Image',
    previewVideo: 'Preview Video URL',
    syllabus: 'Course Syllabus',
    addSection: 'Add Section',
    sectionTitle: 'Section Title',
    sectionDescription: 'Section Description',
    sectionDuration: 'Duration (minutes)',
    learningOutcomes: 'Learning Outcomes',
    addOutcome: 'Add Learning Outcome',
    prerequisites: 'Prerequisites',
    certificateInfo: 'Certificate Information',
    certificateDescription: 'Certificate Description',
    certificateImages: 'Certificate Images',
    courseSettings: 'Course Settings',
    startDate: 'Start Date',
    endDate: 'End Date',
    languages: 'Languages',
    english: 'English',
    russian: 'Russian',
    published: 'Published',
    tags: 'Tags',
    materials: 'Materials',
    actions: 'Actions',
    titleRequired: 'Title is required in at least one language',
    descriptionRequired: 'Description is required in at least one language',
    priceRequired: 'Price is required and must be greater than 0',
    categoryRequired: 'Category is required',
    thumbnailRequired: 'Course thumbnail is required',
    instructorRequired: 'Instructor is required',
    languagesRequired: 'At least one language must be selected',
    courseUpdated: 'Course updated successfully',
    updateError: 'Error updating course',
    announcements: 'Announcements',
    addAnnouncement: 'Add Announcement',
    announcement: 'Announcement',
    announcementTitle: 'Announcement Title',
    announcementContent: 'Announcement Content',
    publishAnnouncement: 'Publish Announcement',
    noAnnouncementsAdded: 'No announcements added',
    publication: 'Publication',
    publishCourse: 'Publish Course',
    images: 'Images',
    mainImage: 'Main Image',
    additionalImages: 'Additional Images',
    certificates: 'Certificates',
    certificateImage: 'Certificate Image',
    cancel: 'Cancel'
  },
  ru: {
    editCourse: 'Редактировать курс',
    backToCourses: 'Назад к курсам',
    saveDraft: 'Сохранить черновик',
    updateCourse: 'Обновить курс',
    updating: 'Обновление...',
    basicInfo: 'Основная информация',
    courseTitle: 'Название курса',
    shortDescription: 'Краткое описание',
    fullDescription: 'Полное описание',
    courseDetails: 'Детали курса',
    price: 'Цена (₾)',
    duration: 'Продолжительность (минуты)',
    instructor: 'Инструктор',
    selectInstructor: 'Выберите инструктора',
    category: 'Категория',
    selectCategory: 'Выберите категорию',
    subcategory: 'Подкатегория',
    selectSubcategory: 'Выберите подкатегорию',
    media: 'Медиа',
    thumbnail: 'Миниатюра курса',
    additionalImages: 'Дополнительные изображения',
    advertisementImage: 'Рекламное изображение',
    previewVideo: 'URL видео предпросмотра',
    syllabus: 'Учебный план курса',
    addSection: 'Добавить раздел',
    sectionTitle: 'Название раздела',
    sectionDescription: 'Описание раздела',
    sectionDuration: 'Продолжительность (минуты)',
    learningOutcomes: 'Результаты обучения',
    addOutcome: 'Добавить результат обучения',
    prerequisites: 'Предварительные требования',
    certificateInfo: 'Информация о сертификате',
    certificateDescription: 'Описание сертификата',
    certificateImages: 'Изображения сертификата',
    courseSettings: 'Настройки курса',
    startDate: 'Дата начала',
    endDate: 'Дата окончания',
    languages: 'Языки',
    english: 'Английский',
    russian: 'Русский',
    published: 'Опубликовано',
    tags: 'Теги',
    materials: 'Материалы',
    actions: 'Действия',
    titleRequired: 'Название требуется как минимум на одном языке',
    descriptionRequired: 'Описание требуется как минимум на одном языке',
    priceRequired: 'Цена обязательна и должна быть больше 0',
    categoryRequired: 'Категория обязательна',
    thumbnailRequired: 'Миниатюра курса обязательна',
    instructorRequired: 'Инструктор обязателен',
    languagesRequired: 'Должен быть выбран хотя бы один язык',
    courseUpdated: 'Курс успешно обновлен',
    updateError: 'Ошибка обновления курса',
    announcements: 'Объявления',
    addAnnouncement: 'Добавить объявление',
    announcement: 'Объявление',
    announcementTitle: 'Заголовок объявления',
    announcementContent: 'Содержание объявления',
    publishAnnouncement: 'Опубликовать объявление',
    noAnnouncementsAdded: 'Объявления не добавлены',
    publication: 'Публикация',
    publishCourse: 'Опубликовать курс',
    images: 'Изображения',
    mainImage: 'Основное изображение',
    certificates: 'Сертификаты',
    certificateImage: 'Изображение сертификата',
    cancel: 'Отмена'
  }
};

interface EditCoursePageProps {
  params: Promise<{ id: string }>;
}

export default function EditCoursePage({ params }: EditCoursePageProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const resolvedParams = React.use(params);
  
  // Get current language translations
  const currentLang = language === 'ru' ? 'ru' : 'en';
  const tr = translations[currentLang];
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
    
    if (!formData.title.en && !formData.title.ru) newErrors.title = tr.titleRequired;
    if (!formData.description.en && !formData.description.ru) newErrors.description = tr.descriptionRequired;
    if (!formData.price || formData.price <= 0) newErrors.price = tr.priceRequired;
    if (!formData.categoryId) newErrors.category = tr.categoryRequired;
    if (!formData.thumbnail) newErrors.thumbnail = tr.thumbnailRequired;
    if (!formData.instructor.name) newErrors.instructor = tr.instructorRequired;
    if (formData.languages.length === 0) newErrors.languages = tr.languagesRequired;
    
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

      alert(tr.courseUpdated);
      router.push('/admin/courses');
      
    } catch (error) {
      console.error('Error updating course:', error);
      alert(error instanceof Error ? error.message : tr.updateError);
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
              {tr.editCourse}
            </h1>
            <p className="text-gray-600 mt-1">
              Update course information
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
              <h2 className="text-lg font-semibold text-gray-900 mb-6">{tr.basicInfo}</h2>
              
              <div className="space-y-6">
                <MultilingualInput
                  label={tr.courseTitle}
                  value={formData.title}
                  onChange={(value) => setFormData(prev => ({ ...prev, title: value as MultilingualContent }))}
                  required
                  maxLength={200}
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}

                <MultilingualInput
                  label={tr.shortDescription}
                  value={formData.shortDescription}
                  onChange={(value) => setFormData(prev => ({ ...prev, shortDescription: value as MultilingualContent   }))}
                  type="textarea"
                  maxLength={500}
                  rows={3}
                />

                <MultilingualInput
                  label={tr.fullDescription}
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
              <h2 className="text-lg font-semibold text-gray-900 mb-6">{tr.courseDetails}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {tr.price} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="99.99"
                  />
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {tr.duration} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.duration ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="120"
                  />
                  {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {tr.category} <span className="text-red-500">*</span>
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
                    <option value="">{tr.selectCategory}</option>
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
                    {tr.subcategory}
                  </label>
                  <select
                    value={formData.subcategoryId}
                    onChange={(e) => setFormData(prev => ({ ...prev, subcategoryId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!formData.categoryId || loadingSubcategories}
                  >
                    <option value="">{tr.selectSubcategory}</option>
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
                <h2 className="text-lg font-semibold text-gray-900">{tr.learningOutcomes}</h2>
                <Button type="button" onClick={addLearningOutcome} size="sm">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  {tr.addOutcome}
                </Button>
              </div>
              
              <div className="space-y-4">
                {formData.learningOutcomes.map((outcome, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-medium text-gray-900">{currentLang === 'ru' ? 'Результат' : 'Outcome'} {index + 1}</h3>
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
                       placeholder={currentLang === 'ru' ? 'Результат обучения' : 'Learning outcome'}
                     />
                  </div>
                ))}
                
                {formData.learningOutcomes.length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    {currentLang === 'ru' ? 'Результаты обучения не добавлены' : 'No learning outcomes added'}
                  </p>
                )}
              </div>
            </div>

            {/* Syllabus */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">{tr.syllabus}</h2>
                <Button type="button" onClick={addSyllabusItem} size="sm">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  {tr.addSection}
                </Button>
              </div>
              
              <div className="space-y-4">
                {formData.syllabus.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-medium text-gray-900">{currentLang === 'ru' ? 'Раздел' : 'Section'} {index + 1}</h3>
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
                      label={tr.sectionTitle}
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
                      label={tr.sectionDescription}
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
                        placeholder={tr.sectionDuration}
                      />
                    </div>
                  </div>
                ))}
                
                {formData.syllabus.length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    {currentLang === 'ru' ? 'Учебный план не добавлен' : 'No syllabus added'}
                  </p>
                )}
              </div>
            </div>

            {/* Announcements */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">{tr.announcements}</h2>
                <Button type="button" onClick={addAnnouncement} size="sm">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  {tr.addAnnouncement}
                </Button>
              </div>
              
              <div className="space-y-4">
                {formData.announcements.map((announcement, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-medium text-gray-900">{tr.announcement} {index + 1}</h3>
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
                      label={tr.announcementTitle}
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
                      label={tr.announcementContent}
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
                        {tr.publishAnnouncement}
                      </span>
                    </label>
                  </div>
                ))}
                
                {formData.announcements.length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    {tr.noAnnouncementsAdded}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Publication Settings */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">{tr.publication}</h2>
              
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {tr.publishCourse}
                  </span>
                </label>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {tr.startDate} <span className="text-red-500">*</span>
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
                      {tr.endDate}
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
              <h2 className="text-lg font-semibold text-gray-900 mb-6">{tr.images}</h2>
              
              <div className="space-y-6">
                <ImageUpload
                  label={tr.mainImage}
                  required
                  value={formData.thumbnail}
                  onChange={(url) => setFormData(prev => ({ ...prev, thumbnail: url as string }))}
                />
                {errors.thumbnail && <p className="text-red-500 text-sm">{errors.thumbnail}</p>}
                
                <ImageUpload
                  label={tr.additionalImages}
                  multiple
                  maxFiles={5}
                  value={formData.additionalImages}
                  onChange={(urls) => setFormData(prev => ({ ...prev, additionalImages: urls as string[] }))}
                />
              </div>
            </div>

            {/* Certificate Images */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">{tr.certificates}</h2>
              
              <div className="space-y-6">
                <ImageUpload
                  label={tr.certificateImage}
                  multiple
                  maxFiles={3}
                  value={formData.certificateImages}
                  onChange={(urls) => setFormData(prev => ({ ...prev, certificateImages: urls as string[] }))}
                />
              </div>
            </div>

            {/* Prerequisites */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">{tr.prerequisites}</h2>
              
              <MultilingualInput
                label={tr.prerequisites}
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
              <h2 className="text-lg font-semibold text-gray-900 mb-6">{tr.certificateInfo}</h2>
              
              <MultilingualInput
                label={tr.certificateDescription}
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
              <h2 className="text-lg font-semibold text-gray-900 mb-6">{tr.tags}</h2>
              
              <MultilingualInput
                label={tr.tags}
                value={formData.tags as unknown as MultilingualContent}
                onChange={(value) => setFormData(prev => ({ ...prev, tags: value as unknown as MultilingualContent }))}
                type="textarea"
                className={errors.tags ? 'border-red-500' : ''}
              />
              {errors.tags && <p className="text-red-500 text-sm mt-1">{errors.tags}</p>}
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="space-y-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? tr.updating : tr.updateCourse}
                </Button>
                
                <Link href="/admin/courses">
                  <Button type="button" variant="outline" className="w-full">
                    {tr.cancel}
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