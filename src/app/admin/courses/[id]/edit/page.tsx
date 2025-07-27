'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CourseFormData, Course, CategoryOption, SubcategoryOption, InstructorOption, LearningOutcome, MultilingualContent } from '@/types/courses';
import { useLanguage } from '@/i18n/language-context';
import MultilingualInput from '@/components/FormElements/MultilingualInput';
import ImageUpload from '@/components/FormElements/ImageUpload';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeftIcon, 
  AcademicCapIcon,
  TrashIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface EditCoursePageProps {
  params: { id: string };
}

export default function EditCoursePage({ params }: EditCoursePageProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryOption[]>([]);
  const [instructors, setInstructors] = useState<InstructorOption[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  
  const [formData, setFormData] = useState<CourseFormData>({
    title: { ka: '', en: '', ru: '' },
    description: { ka: '', en: '', ru: '' },
    shortDescription: { ka: '', en: '', ru: '' },
    price: '',
    category: '',
    subcategory: '',
    thumbnail: '',
    additionalImages: [],
    previewVideoUrl: '',
    duration: '',
    isPublished: false,
    teacher: {
      name: '',
      profession: '',
      image: '',
      bio: { ka: '', en: '', ru: '' }
    },
    prerequisites: { ka: '', en: '', ru: '' },
    certificateDescription: { ka: '', en: '', ru: '' },
    learningOutcomes: [],
    languages: ['ka'],
    tags: [],
    materials: [],
    startDate: '',
    endDate: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([
      fetchCourse(),
      fetchDropdownData()
    ]).finally(() => setInitialLoading(false));
  }, [params.id]);

  const fetchCourse = async () => {
    try {
      // TODO: API integration
      // const courseData = await getCourse(params.id);
      // setCourse(courseData);
      // populateForm(courseData);
    } catch (error) {
      console.error('Error fetching course:', error);
      alert('კურსის ჩატვირთვა ვერ მოხერხდა');
      router.push('/admin/courses');
    }
  };

  const fetchDropdownData = async () => {
    try {
      // TODO: API integration
      setCategories([]);
      setInstructors([]);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  const populateForm = (courseData: Course) => {
    setFormData({
      title: courseData.title,
      description: courseData.description,
      shortDescription: courseData.shortDescription || { ka: '', en: '', ru: '' },
      price: courseData.price.toString(),
      category: courseData.category,
      subcategory: courseData.subcategory || '',
      thumbnail: courseData.thumbnail,
      additionalImages: courseData.additionalImages || [],
      previewVideoUrl: courseData.previewVideoUrl || '',
      duration: courseData.duration.toString(),
      isPublished: courseData.isPublished,
      teacher: courseData.teacher,
      prerequisites: courseData.prerequisites || { ka: '', en: '', ru: '' },
      certificateDescription: courseData.certificateDescription || { ka: '', en: '', ru: '' },
      learningOutcomes: courseData.learningOutcomes,
      languages: courseData.languages,
      tags: courseData.tags || [],
      materials: courseData.materials || [],
      startDate: courseData.startDate,
      endDate: courseData.endDate || ''
    });
  };

  const handleCategoryChange = async (categoryId: string) => {
    setFormData(prev => ({ ...prev, category: categoryId, subcategory: '' }));
    
    if (categoryId) {
      try {
        // TODO: API integration for subcategories
        setSubcategories([]);
      } catch (error) {
        console.error('Error fetching subcategories:', error);
      }
    } else {
      setSubcategories([]);
    }
  };

  const addLearningOutcome = () => {
    setFormData(prev => ({
      ...prev,
      learningOutcomes: [...prev.learningOutcomes, { ka: '', en: '', ru: '' }]
    }));
  };

  const updateLearningOutcome = (index: number, value: LearningOutcome) => {
    setFormData(prev => ({
      ...prev,
      learningOutcomes: prev.learningOutcomes.map((outcome, i) => 
        i === index ? value : outcome
      )
    }));
  };

  const removeLearningOutcome = (index: number) => {
    setFormData(prev => ({
      ...prev,
      learningOutcomes: prev.learningOutcomes.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.ka) newErrors.title = 'სათაური სავალდებულოა ქართულ ენაზე';
    if (!formData.description.ka) newErrors.description = 'აღწერა სავალდებულოა ქართულ ენაზე';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'ფასი სავალდებულოა და უნდა იყოს 0-ზე მეტი';
    if (!formData.category) newErrors.category = 'კატეგორია სავალდებულოა';
    if (!formData.thumbnail) newErrors.thumbnail = 'მთავარი სურათი სავალდებულოა';
    if (!formData.duration || parseInt(formData.duration) <= 0) newErrors.duration = 'ხანგრძლივობა სავალდებულოა';
    if (!formData.teacher.name) newErrors.teacher = 'ინსტრუქტორი სავალდებულოა';
    if (!formData.startDate) newErrors.startDate = 'დაწყების თარიღი სავალდებულოა';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const updateData = {
        title: formData.title,
        description: formData.description,
        shortDescription: formData.shortDescription,
        price: parseFloat(formData.price),
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        thumbnail: formData.thumbnail,
        additionalImages: formData.additionalImages.length > 0 ? formData.additionalImages : undefined,
        previewVideoUrl: formData.previewVideoUrl || undefined,
        duration: parseInt(formData.duration),
        isPublished: formData.isPublished,
        teacher: formData.teacher,
        prerequisites: formData.prerequisites,
        certificateDescription: formData.certificateDescription,
        learningOutcomes: formData.learningOutcomes,
        languages: formData.languages,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        materials: formData.materials.length > 0 ? formData.materials : undefined,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined
      };

      // TODO: API integration
      // await updateCourse(params.id, updateData);
      // router.push('/admin/courses');
      
      console.log('Course data to update:', updateData);
      alert('კურსი წარმატებით განახლდა!');
      
    } catch (error) {
      console.error('Error updating course:', error);
      alert('კურსის განახლება ვერ მოხერხდა');
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
              კურსის რედაქტირება
            </h1>
            <p className="text-gray-600 mt-1">განაახლეთ კურსის ინფორმაცია</p>
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
                    value={formData.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">აირჩიეთ კატეგორია</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
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
                    value={formData.subcategory}
                    onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!formData.category}
                  >
                    <option value="">აირჩიეთ ქვეკატეგორია</option>
                    {subcategories.map(subcategory => (
                      <option key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
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
                        onClick={() => removeLearningOutcome(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                                         <MultilingualInput
                       label=""
                       value={outcome}
                       onChange={(value) => updateLearningOutcome(index, value as LearningOutcome)}
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