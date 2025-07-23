'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CreateArticleData } from '@/types/articles';
import { getBlogs } from '@/lib/api/blogs';
import { getAllCategories } from '@/lib/api/categories';
import { useLanguage } from '@/i18n/language-context';
import MultilingualInput from '@/components/FormElements/MultilingualInput';
import ImageUpload from '@/components/FormElements/ImageUpload';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeftIcon, 
  NewspaperIcon,
  TrashIcon,
  BookOpenIcon,
  TagIcon
} from '@heroicons/react/24/outline';

export default function NewArticlePage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<CreateArticleData>({
    title: {
      ka: '',
      en: '',
      ru: ''
    },
    excerpt: {
      ka: '',
      en: '',
      ru: ''
    },
    content: {
      ka: '',
      en: '',
      ru: ''
    },
    blogId: '',
    categoryId: '',
    readTime: '',
    authorName: '',
    authorBio: '',
    authorAvatar: '',
    featuredImages: [],
    tags: [],
    isPublished: false,
    isFeatured: false,
    sortOrder: 0
  });

  useEffect(() => {
    // Fetch blogs when component mounts
    const fetchBlogs = async () => {
      try {
        const response = await getBlogs();
        const blogsData = Array.isArray(response) ? response : response.blogs;
        setBlogs(blogsData || []);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      }
    };

    const fetchCategories = async () => {
      try {
        const categoriesData = await getAllCategories();
        setCategories(categoriesData || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchBlogs();
    fetchCategories();
  }, []);

  const [currentTag, setCurrentTag] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.ka || !formData.excerpt.ka || !formData.content.ka) {
      alert('ქართული სათაური, მოკლე აღწერა და კონტენტი სავალდებულოა');
      return;
    }

    if (!formData.categoryId) {
      alert('კატეგორიის არჩევა სავალდებულოა');
      return;
    }

    if (!formData.blogId) {
      alert('ბლოგის არჩევა სავალდებულოა');
      return;
    }

    if (!formData.authorName) {
      alert('ავტორის სახელი სავალდებულოა');
      return;
    }

    setLoading(true);

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();

      // Add all images to FormData
      if (formData.featuredImages && formData.featuredImages.length > 0) {
        for (const [index, imageUrl] of formData.featuredImages.entries()) {
          if (imageUrl.startsWith('data:')) {
            // Convert base64 to blob and append
            const blob = await fetch(imageUrl).then(r => r.blob());
            formDataToSend.append('images', blob, `image-${index}.jpg`);
          }
        }
      }

      // Prepare article data
      const articleData = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        blogId: formData.blogId,
        categoryId: formData.categoryId,
        readTime: formData.readTime,
        author: {
          name: formData.authorName,
          bio: formData.authorBio || '',
          avatar: formData.authorAvatar || ''
        },
        tags: formData.tags || [],
        isPublished: formData.isPublished,
        isFeatured: formData.isFeatured,
        sortOrder: formData.sortOrder || 0
      };

      // Add stringified JSON data to FormData
      Object.entries(articleData).forEach(([key, value]) => {
        // Don't stringify IDs and primitive values
        if (key === 'blogId' || key === 'categoryId' || typeof value === 'boolean' || typeof value === 'number') {
          formDataToSend.append(key, value as string);
        } else {
          formDataToSend.append(key, JSON.stringify(value));
        }
      });

      // Create article
      // const article = await createArticle(formDataToSend);

      alert('სტატია წარმატებით დაემატა');
      router.push('/admin/articles');
    } catch (error) {
      console.error('Error creating article:', error);
      alert('შეცდომა სტატიის შექმნისას');
    } finally {
      setLoading(false);
    }
  };

  const handleFeaturedImagesChange = (urls: string | string[]) => {
    const urlArray = Array.isArray(urls) ? urls : [urls];
    setFormData(prev => ({ ...prev, featuredImages: urlArray }));
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin/articles">
              <Button variant="outline" size="sm">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Articles
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <NewspaperIcon className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Create New Article</h1>
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
              form="article-form"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Publishing...' : 'Publish Article'}
            </Button>
          </div>
        </div>

        <form id="article-form" onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <BookOpenIcon className="h-5 w-5" />
                  Basic Information
                </h2>
                
                <div className="space-y-6">
                  <MultilingualInput
                    label="Title"
                    value={formData.title}
                    onChange={(value) => setFormData(prev => ({ ...prev, title: value }))}
                    required
                    maxLength={200}
                  />

                  <MultilingualInput
                    label="Excerpt"
                    value={formData.excerpt}
                    onChange={(value) => setFormData(prev => ({ ...prev, excerpt: value }))}
                    required
                    type="textarea"
                    maxLength={500}
                    rows={4}
                  />

                  <MultilingualInput
                    label="Content"
                    value={formData.content}
                    onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                    required
                    type="richtext"
                    rows={15}
                  />
                </div>
              </div>

              {/* Featured Images */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Featured Images</h2>
                <ImageUpload
                  multiple
                  maxFiles={10}
                  maxSize={10}
                  value={formData.featuredImages}
                  onChange={handleFeaturedImagesChange}
                  required
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Article Settings */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Article Settings</h3>
                
                <div className="space-y-4">
                  {/* Blog Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blog *
                    </label>
                    <select
                      value={formData.blogId}
                      onChange={(e) => setFormData(prev => ({ ...prev, blogId: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">აირჩიეთ ბლოგი</option>
                      {blogs.map(blog => (
                        <option key={blog._id} value={blog._id}>
                          {blog.title[language]}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category._id} value={category._id}>
                          {category.name[language]}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Read Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Read Time *
                    </label>
                    <input
                      type="text"
                      value={formData.readTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, readTime: e.target.value }))}
                      placeholder="5 minutes"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Sort Order */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: Number(e.target.value) }))}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Status Checkboxes */}
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isPublished}
                        onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                        className="rounded border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Published</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                        className="rounded border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Featured</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Author Information */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Author Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Author Name *
                    </label>
                    <input
                      type="text"
                      value={formData.authorName}
                      onChange={(e) => setFormData(prev => ({ ...prev, authorName: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Author Bio
                    </label>
                    <textarea
                      value={formData.authorBio}
                      onChange={(e) => setFormData(prev => ({ ...prev, authorBio: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <ImageUpload
                    label="Author Avatar"
                    value={formData.authorAvatar}
                    onChange={(url) => setFormData(prev => ({ ...prev, authorAvatar: url as string }))}
                    maxSize={5}
                  />
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
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(index)}
                          className="hover:text-blue-600"
                        >
                          <TrashIcon className="h-3 w-3" />
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