'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Blog, UpdateBlogData } from '@/types/blogs';
import { getBlogById, updateBlog } from '@/lib/api/blogs';
import { useLanguage } from '@/i18n/language-context';
import MultilingualInput from '@/components/FormElements/MultilingualInput';
import ImageUpload from '@/components/FormElements/ImageUpload';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeftIcon, 
  BookOpenIcon,
  LinkIcon,
  TagIcon
} from '@heroicons/react/24/outline';

interface EditBlogPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditBlogPage({ params }: EditBlogPageProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const resolvedParams = React.use(params);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [blog, setBlog] = useState<Blog | null>(null);
  
  const [formData, setFormData] = useState<UpdateBlogData>({
    title: { ka: '', en: '', ru: '' },
    description: { ka: '', en: '', ru: '' },
    excerpt: { ka: '', en: '', ru: '' },
    imageUrl: '',
    link: '',
    categoryId: '',
    tags: [],
    isPublished: false,
    isFeatured: false,
    sortOrder: 0
  });

  const [currentTag, setCurrentTag] = useState('');

  useEffect(() => {
    fetchBlog();
  }, [resolvedParams.id]);

  const fetchBlog = async () => {
    try {
      setPageLoading(true);
      const blogData = await getBlogById(resolvedParams.id);
      setBlog(blogData);
      
      // Populate form with existing data
      setFormData({
        title: blogData.title,
        description: blogData.description,
        excerpt: blogData.excerpt,
        imageUrl: blogData.imageUrl,
        link: blogData.link,
        categoryId: blogData.categoryId,
        tags: blogData.tags,
        isPublished: blogData.isPublished,
        isFeatured: blogData.isFeatured,
        sortOrder: blogData.sortOrder
      });
    } catch (error) {
      console.error('Error fetching blog:', error);
      alert('შეცდომა ბლოგის ჩატვირთვისას');
      router.push('/admin/blogs');
    } finally {
      setPageLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title?.ka || !formData.excerpt?.ka || !formData.description?.ka) {
      alert('ქართული სათაური, მოკლე აღწერა და აღწერა სავალდებულოა');
      return;
    }

    if (!formData.link) {
      alert('კონტენტის ლინკი სავალდებულოა');
      return;
    }

    if (!formData.categoryId) {
      alert('კატეგორიის არჩევა სავალდებულოა');
      return;
    }

    setLoading(true);

    try {
      // If we have a data URL image, use FormData
      if (formData.imageUrl?.startsWith('data:')) {
        const formDataToSend = new FormData();
        
        // JSON fields
        formDataToSend.append('title', JSON.stringify(formData.title));
        formDataToSend.append('description', JSON.stringify(formData.description));
        formDataToSend.append('excerpt', JSON.stringify(formData.excerpt));
        formDataToSend.append('link', formData.link);
        formDataToSend.append('categoryId', formData.categoryId!);
        
        if (formData.tags && formData.tags.length > 0) {
          formDataToSend.append('tags', JSON.stringify(formData.tags));
        }

        formDataToSend.append('isPublished', (formData.isPublished || false).toString());
        formDataToSend.append('isFeatured', (formData.isFeatured || false).toString());
        formDataToSend.append('sortOrder', (formData.sortOrder || 0).toString());

        // Convert data URL to blob for file upload
        const response = await fetch(formData.imageUrl);
        const blob = await response.blob();
        formDataToSend.append('image', blob, 'featured-image.jpg');

        await updateBlog(resolvedParams.id, { formData: formDataToSend, isFormData: true });
      } else {
        // For JSON data (including image URLs), use /blogs/json endpoint
        await updateBlog(resolvedParams.id, { 
          formData: {
            title: formData.title!,
            description: formData.description!,
            excerpt: formData.excerpt!,
            link: formData.link!,
            categoryId: formData.categoryId!,
            imageUrl: formData.imageUrl || '',
            tags: formData.tags,
            isPublished: formData.isPublished,
            isFeatured: formData.isFeatured,
            sortOrder: formData.sortOrder
          }, 
          isFormData: false 
        });
      }

      alert('ბლოგი წარმატებით განახლდა');
      router.push('/admin/blogs');
    } catch (error) {
      console.error('Error updating blog:', error);
      alert('შეცდომა ბლოგის განახლებისას');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !(formData.tags || []).includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter((_, i) => i !== index)
    }));
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading blog...</div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">Blog not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin/blogs">
              <Button variant="outline" size="sm">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Blogs
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <BookOpenIcon className="h-8 w-8 text-green-600" />
              <h1 className="text-3xl font-bold text-gray-900">Edit Blog</h1>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormData(prev => ({ ...prev, isPublished: false }))}
              disabled={loading}
            >
              Save Draft
            </Button>
            <Button
              type="submit"
              form="blog-form"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Updating...' : 'Update Blog'}
            </Button>
          </div>
        </div>

        <form id="blog-form" onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>
                
                <div className="space-y-6">
                  <MultilingualInput
                    label="Title"
                    value={formData.title || { ka: '', en: '', ru: '' }}
                    onChange={(value) => setFormData(prev => ({ ...prev, title: value }))}
                    required
                    maxLength={200}
                  />

                  <MultilingualInput
                    label="Description"
                    value={formData.description || { ka: '', en: '', ru: '' }}
                    onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                    required
                    type="textarea"
                    maxLength={1000}
                    rows={6}
                  />

                  <MultilingualInput
                    label="Excerpt"
                    value={formData.excerpt || { ka: '', en: '', ru: '' }}
                    onChange={(value) => setFormData(prev => ({ ...prev, excerpt: value }))}
                    required
                    type="textarea"
                    maxLength={300}
                    rows={3}
                  />
                </div>
              </div>

              {/* Featured Image */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Featured Image</h2>
                <ImageUpload
                  value={formData.imageUrl || ''}
                  onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url as string }))}
                  maxSize={5}
                  required
                />
              </div>

              {/* Content Link */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <LinkIcon className="h-5 w-5" />
                  Content Link
                </h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link to Full Content *
                  </label>
                  <input
                    type="url"
                    value={formData.link || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                    placeholder="https://example.com/full-article"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Link to the full article or blog post content
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Blog Settings */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Blog Settings</h3>
                
                <div className="space-y-4">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.categoryId || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select Category</option>
                      <option value="ortho">Orthopedics</option>
                      <option value="neuro">Neurology</option>
                      <option value="cardio">Cardiology</option>
                    </select>
                  </div>

                  {/* Sort Order */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={formData.sortOrder || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: Number(e.target.value) }))}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  {/* Status Checkboxes */}
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isPublished || false}
                        onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                        className="rounded border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Published</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isFeatured || false}
                        onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                        className="rounded border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Featured</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <TagIcon className="h-5 w-5" />
                  Tags
                </h3>
                
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      placeholder="Add tag..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddTag}
                    >
                      Add
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(formData.tags || []).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(index)}
                          className="hover:text-green-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 