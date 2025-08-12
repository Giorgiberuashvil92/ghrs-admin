'use client';

import { useState, useEffect, useRef } from 'react';
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

export default function NewCoursePage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
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
    advertisementImage: '', // დავამატოთ რეკლამის სურათის ველი
    previewVideoUrl: '',
    duration: 0,
    isPublished: false,
    instructor: {
      name: ''  // მხოლოდ სახელი დავტოვოთ
    },
    prerequisites: emptyMultilingualContent,
    certificateDescription: emptyMultilingualContent,
    certificateImages: [], // დავამატოთ ახალი ველი
    learningOutcomes: [],
    syllabus: [],
    languages: ['en', 'ru'], // ორივე ენა default-ად ჩართული
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

  // ინსტრუქტორების და კატეგორიების ჩამოტვირთვა
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data from:', `${API_URL}/instructors`);
        
        const [instructorsResponse, categoriesResponse] = await Promise.all([
          fetch(`${API_URL}/instructors`),
          fetch(`${API_URL}/categories`)
        ]);

        console.log('Instructors response status:', instructorsResponse.status);
        console.log('Categories response status:', categoriesResponse.status);

        if (!instructorsResponse.ok || !categoriesResponse.ok) {
          throw new Error('Network response was not ok');
        }

        const instructorsData = await instructorsResponse.json();
        const categoriesData = await categoriesResponse.json();

        console.log('Instructors data:', instructorsData);
        console.log('Categories data:', categoriesData);

        // Ensure we're setting arrays even if the response is empty or invalid
        setInstructors(Array.isArray(instructorsData.instructors) ? instructorsData.instructors : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Set empty arrays on error to prevent undefined errors
        setInstructors([]);
        setCategories([]);
      }
    };

    fetchData();
  }, []);

  // ქვეკატეგორიების წამოღება კატეგორიის არჩევისას
  const fetchSubcategories = async (categoryId: string, subcategoryId: string) => {
    setLoadingSubcategories(true);
    try {
      const response = await fetch(`${API_URL}/categories/${categoryId}/subcategories/${subcategoryId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch subcategories');
      }

      const data = await response.json();
      // თუ ერთი ობიექტი მოვიდა, გადავაქციოთ მასივად
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
        shortDescription: {
          en: formData.shortDescription.en || '',
          ru: formData.shortDescription.ru || formData.shortDescription.en || ''
        },
        price: formData.price,
        thumbnail: formData.thumbnail,
        isPublished: formData.isPublished,
        instructor: {
          name: formData.instructor.name
        },
        prerequisites: {
          en: formData.prerequisites.en || '',
          ru: formData.prerequisites.ru || formData.prerequisites.en || ''
        },
        certificateDescription: {
          en: formData.certificateDescription.en || '',
          ru: formData.certificateDescription.ru || formData.certificateDescription.en || ''
        },
        languages: formData.languages,
        categoryId: formData.categoryId,
        additionalImages: formData.additionalImages,
        certificateImages: formData.certificateImages,
        learningOutcomes: formData.learningOutcomes,
        tags: formData.tags,
        announcements: formData.announcements.map(announcement => ({
          title: {
            en: announcement.title.en || '',
            ru: announcement.title.ru || announcement.title.en || ''
          },
          content: {
            en: announcement.content.en || '',
            ru: announcement.content.ru || announcement.content.en || ''
          },
          isActive: announcement.isActive
        })),
        syllabus: formData.syllabus.map(item => ({
          title: { 
            en: item.title.en || '',
            ru: item.title.ru || item.title.en || ''
          },
          description: { 
            en: item.description.en || '',
            ru: item.description.ru || item.description.en || ''
          },
          duration: item.duration || 0
        })),
        ...(formData.subcategoryId && { subcategoryId: formData.subcategoryId }),
        ...(formData.duration && { duration: formData.duration }),
        ...(formData.startDate && { startDate: formData.startDate }),
        ...(formData.endDate && { endDate: formData.endDate }),
        ...(formData.previewVideoUrl && { previewVideoUrl: formData.previewVideoUrl }),
        ...(formData.advertisementImage && { advertisementImage: formData.advertisementImage })
      };

      console.log('Course data to create:', courseData);
      
      const response = await fetch(`${API_URL}/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create course');
      }

      const createdCourse = await response.json();
      console.log('Created course:', createdCourse);

      alert(language === 'en' 
        ? 'Course created successfully!'
        : language === 'ru'
        ? 'Курс успешно создан!'
        : 'კურსი წარმატებით შეიქმნა!');
      router.push('/admin/courses');
      
    } catch (error) {
      console.error('Error creating course:', error);
      alert(language === 'en'
        ? error instanceof Error ? error.message : 'Failed to create course'
        : language === 'ru'
        ? error instanceof Error ? error.message : 'Не удалось создать курс'
        : error instanceof Error ? error.message : 'კურსის შექმნა ვერ მოხერხდა');
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
            href="/admin/courses" 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <AcademicCapIcon className="h-8 w-8 text-blue-600" />
              {language === 'en' ? 'New Course' : language === 'ru' ? 'Новый курс' : 'ახალი კურსი'}
            </h1>
            <p className="text-gray-600 mt-1">
              {language === 'en' 
                ? 'Fill in the information to create a new course'
                : language === 'ru'
                ? 'Заполните информацию для создания нового курса'
                : 'შეავსეთ ინფორმაცია ახალი კურსის შესაქმნელად'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="description" className="space-y-8">
              <TabsList className="bg-white border-b">
                <TabsTrigger value="description">
                  {language === 'en' ? 'Description' : language === 'ru' ? 'Описание' : 'აღწერა'}
                </TabsTrigger>
                <TabsTrigger value="syllabus">
                  {language === 'en' ? 'Syllabus' : language === 'ru' ? 'Учебный план' : 'სასწავლო გეგმა'}
                </TabsTrigger>
                <TabsTrigger value="announcement">
                  {language === 'en' ? 'Announcements' : language === 'ru' ? 'Объявления' : 'განცხადება'}
                </TabsTrigger>
                <TabsTrigger value="reviews">
                  {language === 'en' ? 'Reviews' : language === 'ru' ? 'Отзывы' : 'შეფასებები'}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    {language === 'en' ? 'Course Description' : language === 'ru' ? 'Описание курса' : 'კურსის აღწერა'}
                  </h2>
                  
                  <div className="space-y-6">
                    <MultilingualInput
                      label={language === 'en' ? 'Course Title' : language === 'ru' ? 'Название курса' : 'კურსის სათაური'}
                      value={formData.title}
                      onChange={(value) => setFormData(prev => ({ ...prev, title: value as MultilingualContent }))}
                      required
                      maxLength={200}
                      className={errors.title ? 'border-red-500' : ''}
                    />
                    {errors.title && <p className="text-red-500 text-sm">
                      {language === 'en' 
                        ? 'Title is required in at least one language'
                        : language === 'ru'
                        ? 'Название требуется как минимум на одном языке'
                        : 'სათაური სავალდებულოა მინიმუმ ერთ ენაზე'}
                    </p>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <ImageUpload
                          label={language === 'en' ? 'Main Image' : language === 'ru' ? 'Главное изображение' : 'მთავარი სურათი'}
                          required
                          value={formData.thumbnail}
                          onChange={(url) => setFormData(prev => ({ ...prev, thumbnail: url as string }))}
                        />
                        {errors.thumbnail && <p className="text-red-500 text-sm">
                          {language === 'en' 
                            ? 'Main image is required'
                            : language === 'ru'
                            ? 'Главное изображение обязательно'
                            : 'მთავარი სურათი სავალდებულოა'}
                        </p>}
                      </div>
                      
                      <div>
                        <ImageUpload
                          label={language === 'en' ? 'Additional Images' : language === 'ru' ? 'Дополнительные изображения' : 'დამატებითი სურათები'}
                          multiple
                          maxFiles={5}
                          value={formData.additionalImages}
                          onChange={(urls) => setFormData(prev => ({ ...prev, additionalImages: urls as string[] }))}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === 'en' ? 'Preview Video URL' : language === 'ru' ? 'URL демонстрационного видео' : 'სადემონსტრაციო ვიდეოს ბმული'}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={formData.previewVideoUrl}
                          onChange={(e) => setFormData(prev => ({ ...prev, previewVideoUrl: e.target.value }))}
                          placeholder={language === 'en' 
                            ? 'https://youtube.com/watch?v=...'
                            : language === 'ru'
                            ? 'https://youtube.com/watch?v=...'
                            : 'https://youtube.com/watch?v=...'}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <Button 
                          type="button"
                          variant="outline"
                          className="flex-shrink-0"
                          onClick={() => {/* TODO: Add video preview */}}
                        >
                          <VideoCameraIcon className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>

                    <MultilingualInput
                      label={language === 'en' ? 'Short Description' : language === 'ru' ? 'Краткое описание' : 'მოკლე აღწერა'}
                      value={formData.shortDescription}
                      onChange={(value) => setFormData(prev => ({ ...prev, shortDescription: value as MultilingualContent }))}
                      type="textarea"
                      maxLength={500}
                      rows={3}
                    />

                    <MultilingualInput
                      label={language === 'en' ? 'Full Description' : language === 'ru' ? 'Полное описание' : 'სრული აღწერა'}
                      value={formData.description}
                      onChange={(value) => setFormData(prev => ({ ...prev, description: value as MultilingualContent }))}
                      required
                      type="richtext"
                      rows={10}
                      height={1500}
                      className={errors.description ? 'border-red-500' : ''}
                    />
                    {errors.description && <p className="text-red-500 text-sm">
                      {language === 'en' 
                        ? 'Description is required in at least one language'
                        : language === 'ru'
                        ? 'Описание требуется как минимум на одном языке'
                        : 'აღწერა სავალდებულოა მინიმუმ ერთ ენაზე'}
                    </p>}

                    <MultilingualInput
                      label={language === 'en' ? 'Prerequisites' : language === 'ru' ? 'Предварительные требования' : 'წინაპირობები'}
                      value={formData.prerequisites}
                      onChange={(value) => setFormData(prev => ({ ...prev, prerequisites: value as MultilingualContent }))}
                      type="textarea"
                      rows={3}
                    />

                    <MultilingualInput
                      label={language === 'en' ? 'Certificate Description' : language === 'ru' ? 'Описание сертификата' : 'სერტიფიკატის აღწერა'}
                      value={formData.certificateDescription}
                      onChange={(value) => setFormData(prev => ({ ...prev, certificateDescription: value as MultilingualContent }))}
                      type="textarea"
                      rows={3}
                    />

                    <div>
                      <ImageUpload
                        label={language === 'en' ? 'Certificate Images' : language === 'ru' ? 'Изображения сертификатов' : 'სერტიფიკატების სურათები'}
                        multiple
                        maxFiles={5}
                        value={formData.certificateImages}
                        onChange={(urls) => setFormData(prev => ({ ...prev, certificateImages: urls as string[] }))}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="syllabus" className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {language === 'en' ? 'Syllabus' : language === 'ru' ? 'Учебный план' : 'სასწავლო გეგმა'}
                    </h2>
                    <Button type="button" onClick={addSyllabusItem} size="sm">
                      <PlusIcon className="h-4 w-4 mr-2" />
                      {language === 'en' ? 'Add Topic' : language === 'ru' ? 'Добавить тему' : 'თემის დამატება'}
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {formData.syllabus.map((item, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-medium text-gray-900">
                            {language === 'en' ? `Topic ${index + 1}` : language === 'ru' ? `Тема ${index + 1}` : `თემა ${index + 1}`}
                          </h3>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                syllabus: prev.syllabus.filter((_, i) => i !== index)
                              }));
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="space-y-4">
                          <MultilingualInput
                            label={language === 'en' ? 'Topic Title' : language === 'ru' ? 'Название темы' : 'თემის სათაური'}
                            value={item.title}
                            onChange={(value) => {
                              setFormData(prev => ({
                                ...prev,
                                syllabus: prev.syllabus.map((s, i) => 
                                  i === index ? { ...s, title: value as MultilingualContent } : s
                                )
                              }));
                            }}
                          />
                          
                          <MultilingualInput
                            label={language === 'en' ? 'Topic Description' : language === 'ru' ? 'Описание темы' : 'თემის აღწერა'}
                            value={item.description}
                            onChange={(value) => {
                              setFormData(prev => ({
                                ...prev,
                                syllabus: prev.syllabus.map((s, i) => 
                                  i === index ? { ...s, description: value as MultilingualContent } : s
                                )
                              }));
                            }}
                            type="textarea"
                            rows={3}
                          />
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {language === 'en' ? 'Duration (minutes)' : language === 'ru' ? 'Продолжительность (минуты)' : 'ხანგრძლივობა (წუთები)'}
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={item.duration || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormData(prev => ({
                                  ...prev,
                                  syllabus: prev.syllabus.map((s, i) => 
                                    i === index ? { 
                                      ...s, 
                                      duration: val === '' ? undefined : parseInt(val)
                                    } : s
                                  )
                                }));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="120"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="announcement" className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {language === 'en' ? 'Announcements' : language === 'ru' ? 'Объявления' : 'განცხადებები'}
                    </h2>
                    <Button type="button" onClick={addAnnouncement} size="sm">
                      <PlusIcon className="h-4 w-4 mr-2" />
                      {language === 'en' ? 'Add Announcement' : language === 'ru' ? 'Добавить объявление' : 'განცხადების დამატება'}
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {formData.announcements.map((announcement, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-medium text-gray-900">
                            {language === 'en' ? `Announcement ${index + 1}` : language === 'ru' ? `Объявление ${index + 1}` : `განცხადება ${index + 1}`}
                          </h3>
                          <div className="flex items-center gap-2">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={announcement.isActive}
                                onChange={(e) => {
                                  setFormData(prev => ({
                                    ...prev,
                                    announcements: prev.announcements.map((a, i) => 
                                      i === index ? { ...a, isActive: e.target.checked } : a
                                    )
                                  }));
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="ml-2 text-sm text-gray-700">
                                {language === 'en' ? 'Active' : language === 'ru' ? 'Активно' : 'აქტიური'}
                              </span>
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  announcements: prev.announcements.filter((_, i) => i !== index)
                                }));
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <MultilingualInput
                            label={language === 'en' ? 'Title' : language === 'ru' ? 'Заголовок' : 'სათაური'}
                            value={announcement.title}
                            onChange={(value) => {
                              setFormData(prev => ({
                                ...prev,
                                announcements: prev.announcements.map((a, i) => 
                                  i === index ? { ...a, title: value as MultilingualContent } : a
                                )
                              }));
                            }}
                          />
                          
                          <MultilingualInput
                            label={language === 'en' ? 'Content' : language === 'ru' ? 'Содержание' : 'შინაარსი'}
                            value={announcement.content}
                            onChange={(value) => {
                              setFormData(prev => ({
                                ...prev,
                                announcements: prev.announcements.map((a, i) => 
                                  i === index ? { ...a, content: value as MultilingualContent } : a
                                )
                              }));
                            }}
                            type="textarea"
                            rows={4}
                          />
                        </div>
                      </div>
                    ))}

                    {formData.announcements.length === 0 && (
                      <p className="text-gray-500 text-center py-8">
                        {language === 'en' 
                          ? 'No announcements added'
                          : language === 'ru'
                          ? 'Объявления не добавлены'
                          : 'განცხადებები არ არის დამატებული'}
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    {language === 'en' ? 'Reviews' : language === 'ru' ? 'Отзывы' : 'შეფასებები'}
                  </h2>
                  
                  <div className="text-center text-gray-500 py-8">
                    {language === 'en' 
                      ? 'Reviews will appear after the course is published'
                      : language === 'ru'
                      ? 'Отзывы появятся после публикации курса'
                      : 'შეფასებები გამოჩნდება კურსის გამოქვეყნების შემდეგ'}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Publication Settings */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                {language === 'en' ? 'Publication' : language === 'ru' ? 'Публикация' : 'გამოქვეყნება'}
              </h2>
              
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {language === 'en' ? 'Publish course' : language === 'ru' ? 'Опубликовать курс' : 'კურსის გამოქვეყნება'}
                  </span>
                </label>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'en' ? 'Start Date' : language === 'ru' ? 'Дата начала' : 'დაწყების თარიღი'}
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'en' ? 'End Date' : language === 'ru' ? 'Дата окончания' : 'დასრულების თარიღი'}
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

            {/* Course Details */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                {language === 'en' ? 'Course Details' : language === 'ru' ? 'Детали курса' : 'კურსის დეტალები'}
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'en' ? 'Price (GEL)' : language === 'ru' ? 'Цена (GEL)' : 'ფასი (ლარი)'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="99.99"
                  />
                  {errors.price && <p className="text-red-500 text-sm mt-1">
                    {language === 'en' 
                      ? 'Price is required and must be greater than 0'
                      : language === 'ru'
                      ? 'Цена обязательна и должна быть больше 0'
                      : 'ფასი სავალდებულოა და უნდა იყოს 0-ზე მეტი'}
                  </p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'en' ? 'Instructor' : language === 'ru' ? 'Инструктор' : 'ინსტრუქტორი'} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={instructors.find(i => i.name === formData.instructor.name)?._id || ''}
                    onChange={(e) => {
                      const selectedInstructor = instructors.find(i => i._id === e.target.value);
                      if (selectedInstructor) {
                        setFormData(prev => ({
                          ...prev,
                          instructor: {
                            name: selectedInstructor.name
                          }
                        }));
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.instructor ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">
                      {language === 'en' ? 'Select instructor' : language === 'ru' ? 'Выберите инструктора' : 'აირჩიეთ ინსტრუქტორი'}
                    </option>
                    {instructors.map(instructor => (
                      <option key={instructor._id} value={instructor._id}>
                        {instructor.name}
                      </option>
                    ))}
                  </select>
                  {errors.instructor && <p className="text-red-500 text-sm mt-1">
                    {language === 'en' 
                      ? 'Instructor is required'
                      : language === 'ru'
                      ? 'Инструктор обязателен'
                      : 'ინსტრუქტორი სავალდებულოა'}
                  </p>}
                </div>

                <div>
                  <ImageUpload
                    label={language === 'en' ? 'Advertisement Image' : language === 'ru' ? 'Рекламное изображение' : 'რეკლამის სურათი'}
                    value={formData.advertisementImage}
                    onChange={(url) => setFormData(prev => ({ ...prev, advertisementImage: url as string }))}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {language === 'en' 
                      ? 'Recommended size: 1920x1080px'
                      : language === 'ru'
                      ? 'Рекомендуемый размер: 1920x1080px'
                      : 'რეკომენდებული ზომა: 1920x1080px'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'en' ? 'Duration (minutes)' : language === 'ru' ? 'Продолжительность (минуты)' : 'ხანგრძლივობა (წუთები)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.duration || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        duration: val === '' ? undefined : parseInt(val)
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="120"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'en' ? 'Category' : language === 'ru' ? 'Категория' : 'კატეგორია'} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={async (e) => {
                      const newCategoryId = e.target.value;
                      setFormData(prev => ({ 
                        ...prev, 
                        categoryId: newCategoryId,
                        // აღარ ვარესეტებთ subcategoryId-ს აქ
                      }));
                      
                      if (newCategoryId) {
                        const selectedCategory = categories.find(cat => cat._id === newCategoryId);
                        if (selectedCategory && selectedCategory.subcategories.length > 0) {
                          await fetchSubcategories(newCategoryId, selectedCategory.subcategories[0]);
                        } else {
                          setSubcategories([]);
                          // მხოლოდ მაშინ ვარესეტებთ, როცა კატეგორიას არ აქვს ქვეკატეგორიები
                          setFormData(prev => ({
                            ...prev,
                            subcategoryId: ''
                          }));
                        }
                      } else {
                        setSubcategories([]);
                        // ან როცა კატეგორია საერთოდ არ არის არჩეული
                        setFormData(prev => ({
                          ...prev,
                          subcategoryId: ''
                        }));
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">
                      {language === 'en' ? 'Select category' : language === 'ru' ? 'Выберите категорию' : 'აირჩიეთ კატეგორია'}
                    </option>
                    {categories.map(category => (
                      <option key={category._id} value={category._id}>
                        {category.name[language as keyof typeof category.name] || category.name.en}
                      </option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-500 text-sm mt-1">
                    {language === 'en' 
                      ? 'Category is required'
                      : language === 'ru'
                      ? 'Категория обязательна'
                      : 'კატეგორია სავალდებულოა'}
                  </p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'en' ? 'Subcategory' : language === 'ru' ? 'Подкатегория' : 'ქვეკატეგორია'}
                  </label>
                  <div className="relative">
                    <select
                      ref={subcategoryRef}
                      value={formData.subcategoryId}
                      onChange={(e) => setFormData(prev => ({ ...prev, subcategoryId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={!formData.categoryId || loadingSubcategories}
                    >
                      <option value="">
                        {loadingSubcategories 
                          ? (language === 'en' 
                              ? 'Loading subcategories...' 
                              : language === 'ru' 
                              ? 'Загрузка подкатегорий...' 
                              : 'ქვეკატეგორიების ჩატვირთვა...')
                          : (language === 'en' 
                              ? 'Select subcategory' 
                              : language === 'ru' 
                              ? 'Выберите подкатегорию' 
                              : 'აირჩიეთ ქვეკატეგორია')}
                      </option>
                      {subcategories.map(sub => (
                        <option key={sub._id} value={sub._id}>
                          {sub.name[language as keyof typeof sub.name] || sub.name.en}
                        </option>
                      ))}
                    </select>
                    {loadingSubcategories && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'en' ? 'Languages' : language === 'ru' ? 'Языки' : 'ენები'} <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {['en', 'ru'].map(lang => (
                      <label key={lang} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.languages.includes(lang)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                languages: [...prev.languages, lang]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                languages: prev.languages.filter(l => l !== lang)
                              }));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {lang === 'en' 
                            ? language === 'en' ? 'English' : language === 'ru' ? 'Английский' : 'ინგლისური'
                            : language === 'en' ? 'Russian' : language === 'ru' ? 'Русский' : 'რუსული'}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.languages && <p className="text-red-500 text-sm mt-1">
                    {language === 'en' 
                      ? 'At least one language must be selected'
                      : language === 'ru'
                      ? 'Необходимо выбрать хотя бы один язык'
                      : 'მინიმუმ ერთი ენა უნდა იყოს არჩეული'}
                  </p>}
                </div>
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
                  {loading 
                    ? language === 'en' ? 'Processing...' : language === 'ru' ? 'Обработка...' : 'მუშავდება...'
                    : language === 'en' ? 'Create Course' : language === 'ru' ? 'Создать курс' : 'კურსის შექმნა'}
                </Button>
                
                <Link href="/admin/courses">
                  <Button type="button" variant="outline" className="w-full">
                    {language === 'en' ? 'Cancel' : language === 'ru' ? 'Отмена' : 'გაუქმება'}
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