'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Article, UpdateArticleData, TOCItem } from '@/types/articles';
import { getArticleById, updateArticle } from '@/lib/api/articles';
import { getBlogs } from '@/lib/api/blogs';
import { getAllCategories } from '@/lib/api/categories';
import { useLanguage } from '@/i18n/language-context';
import MultilingualInput from '@/components/FormElements/MultilingualInput';
import ImageUpload from '@/components/FormElements/ImageUpload';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeftIcon, 
  NewspaperIcon,
  PlusIcon,
  TrashIcon,
  BookOpenIcon,
  TagIcon
} from '@heroicons/react/24/outline';

interface EditArticlePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditArticlePage({ params }: EditArticlePageProps) {
  const router = useRouter();
  const { t, language } = useLanguage();
  const resolvedParams = React.use(params);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [article, setArticle] = useState<Article | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<UpdateArticleData>({
    title: { ka: '', en: '', ru: '' },
    excerpt: { ka: '', en: '', ru: '' },
    content: { ka: '', en: '', ru: '' },
    featuredImages: [],
    categoryId: '',
    blogId: '',
    readTime: '',
    authorName: '',
    authorBio: '',
    authorAvatar: '',
    tableOfContents: [],
    tags: [],
    isPublished: false,
    isFeatured: false,
    sortOrder: 0
  });

  const [currentTag, setCurrentTag] = useState('');

  useEffect(() => {
    fetchArticle();
    fetchBlogs();
    fetchCategories();
  }, [resolvedParams.id]);

  const fetchArticle = async () => {
    try {
      setPageLoading(true);
      const articleData = await getArticleById(resolvedParams.id);
      setArticle(articleData);
      
      // Populate form with existing data
      setFormData({
        title: articleData.title,
        excerpt: articleData.excerpt,
        content: articleData.content,
        featuredImages: articleData.featuredImages,
        categoryId: articleData.category?._id || articleData.categoryId,
        blogId: articleData.blog?._id || articleData.blogId,
        readTime: articleData.readTime,
        authorName: articleData.authorName,
        authorBio: articleData.authorBio,
        authorAvatar: articleData.authorAvatar,
        tableOfContents: articleData.tableOfContents,
        tags: articleData.tags,
        isPublished: articleData.isPublished,
        isFeatured: articleData.isFeatured,
        sortOrder: articleData.sortOrder
      });
    } catch (error) {
      console.error('Error fetching article:', error);
      alert('შეცდომა სტატიის ჩატვირთვისას');
      router.push('/admin/articles');
    } finally {
      setPageLoading(false);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title?.ka || !formData.excerpt?.ka || !formData.content?.ka) {
      alert('ქართული სათაური, მოკლე აღწერა და კონტენტი სავალდებულოა');
      return;
    }

    if (!formData.categoryId) {
      alert('კატეგორიის არჩევა სავალდებულოა');
      return;
    }

    if (!formData.authorName) {
      alert('ავტორის სახელი სავალდებულოა');
      return;
    }

    setLoading(true);

    try {
      // Handle FormData for file uploads
      if (imageFiles.length > 0 || (formData.authorAvatar && formData.authorAvatar.startsWith('data:'))) {
        const formDataToSend = new FormData();
        
        // JSON fields
        formDataToSend.append('title', JSON.stringify(formData.title));
        formDataToSend.append('excerpt', JSON.stringify(formData.excerpt));
        formDataToSend.append('content', JSON.stringify(formData.content));
        formDataToSend.append('categoryId', formData.categoryId!);
        formDataToSend.append('blogId', formData.blogId!);
        formDataToSend.append('readTime', formData.readTime!);
        formDataToSend.append('authorName', formData.authorName!);
        
        if (formData.authorBio) {
          formDataToSend.append('authorBio', formData.authorBio);
        }
        
        if (formData.tableOfContents && formData.tableOfContents.length > 0) {
          formDataToSend.append('tableOfContents', JSON.stringify(formData.tableOfContents));
        }
        
        if (formData.tags && formData.tags.length > 0) {
          formDataToSend.append('tags', JSON.stringify(formData.tags));
        }

        formDataToSend.append('isPublished', formData.isPublished!.toString());
        formDataToSend.append('isFeatured', formData.isFeatured!.toString());
        formDataToSend.append('sortOrder', formData.sortOrder!.toString());

        // Existing images URLs
        if (formData.featuredImages && formData.featuredImages.length > 0) {
          const existingUrls = formData.featuredImages.filter(img => !img.startsWith('data:'));
          if (existingUrls.length > 0) {
            formDataToSend.append('existingFeaturedImages', JSON.stringify(existingUrls));
          }
        }

        // New file uploads
        imageFiles.forEach((file) => {
          formDataToSend.append(`featuredImages`, file);
        });

        if (formData.authorAvatar && formData.authorAvatar.startsWith('data:')) {
          const response = await fetch(formData.authorAvatar);
          const blob = await response.blob();
          formDataToSend.append('authorAvatar', blob, 'avatar.jpg');
        } else if (formData.authorAvatar && formData.authorAvatar.startsWith('http')) {
          formDataToSend.append('authorAvatarUrl', formData.authorAvatar);
        }

        await updateArticle(resolvedParams.id, { formData: formDataToSend, isFormData: true });
      } else {
        // Handle JSON data
        await updateArticle(resolvedParams.id, { formData: formData as any, isFormData: false });
      }

      alert('სტატია წარმატებით განახლდა');
      router.push('/admin/articles');
    } catch (error) {
      console.error('Error updating article:', error);
      alert('შეცდომა სტატიის განახლებისას');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    if (currentTag.trim() && formData.tags && !formData.tags.includes(currentTag.trim())) {
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
      tags: prev.tags?.filter((_, i) => i !== index) || []
    }));
  };

  const handleAddTOCItem = () => {
    const newItem: TOCItem = {
      title: { ka: '', en: '', ru: '' },
      anchor: ''
    };
    setFormData(prev => ({
      ...prev,
      tableOfContents: [...(prev.tableOfContents || []), newItem]
    }));
  };

  const handleUpdateTOCItem = (index: number, item: TOCItem) => {
    setFormData(prev => ({
      ...prev,
      tableOfContents: prev.tableOfContents?.map((toc, i) => 
        i === index ? item : toc
      ) || []
    }));
  };

  const handleRemoveTOCItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tableOfContents: prev.tableOfContents?.filter((_, i) => i !== index) || []
    }));
  };

  const handleFeaturedImagesChange = (urls: string | string[]) => {
    const urlArray = Array.isArray(urls) ? urls : [urls];
    setFormData(prev => ({ ...prev, featuredImages: urlArray }));
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading article...</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">Article not found</div>
      </div>
    );
  }

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
              <h1 className="text-3xl font-bold text-gray-900">Edit Article</h1>
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
              {loading ? 'Updating...' : 'Update Article'}
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
                    value={formData.title || { ka: '', en: '', ru: '' }}
                    onChange={(value) => setFormData(prev => ({ ...prev, title: value }))}
                    required
                    maxLength={200}
                  />

                  <MultilingualInput
                    label="Excerpt"
                    value={formData.excerpt || { ka: '', en: '', ru: '' }}
                    onChange={(value) => setFormData(prev => ({ ...prev, excerpt: value }))}
                    required
                    type="textarea"
                    maxLength={500}
                    rows={4}
                  />

                  <MultilingualInput
                    label="Content"
                    value={formData.content || { ka: '', en: '', ru: '' }}
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
                  value={formData.featuredImages || []}
                  onChange={handleFeaturedImagesChange}
                  required
                />
              </div>

              {/* Table of Contents */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Table of Contents</h2>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddTOCItem}
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Section
                  </Button>
                </div>

                <div className="space-y-4">
                  {(formData.tableOfContents || []).map((item, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-gray-700">
                          Section {index + 1}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveTOCItem(index)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <MultilingualInput
                        label="Section Title"
                        value={item.title}
                        onChange={(value) => handleUpdateTOCItem(index, { ...item, title: value })}
                        required
                      />
                      
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Anchor Link
                        </label>
                        <input
                          type="text"
                          value={item.anchor}
                          onChange={(e) => handleUpdateTOCItem(index, { ...item, anchor: e.target.value })}
                          placeholder="section-anchor"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
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
                      value={formData.blogId || ''}
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
                      value={formData.categoryId || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">აირჩიეთ კატეგორია</option>
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
                      value={formData.readTime || ''}
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
                      value={formData.sortOrder || 0}
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
                      value={formData.authorName || ''}
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
                      value={formData.authorBio || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, authorBio: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <ImageUpload
                    label="Author Avatar"
                    value={formData.authorAvatar || ''}
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