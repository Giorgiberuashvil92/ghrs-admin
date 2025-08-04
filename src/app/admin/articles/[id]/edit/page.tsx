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
    title: { en: '', ru: '' },
    excerpt: { en: '', ru: '' },
    content: { en: '', ru: '' },
    featuredImages: [],
    categoryIds: [],
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
  const [currentCategoryId, setCurrentCategoryId] = useState('');

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
        categoryIds: articleData.categoryIds || [],
        blogId: articleData.blogId,
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
    

    const validCategoryIds = formData.categoryIds?.filter(id => id && id.trim() !== '') || [];
    if (!validCategoryIds.length) {
      alert('კატეგორიის არჩევა სავალდებულოა');
      return;
    }

    if (!formData.authorName) {
      alert('ავტორის სახელი სავალდებულოა');
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // JSON fields
      formDataToSend.append('title', JSON.stringify(formData.title));
      formDataToSend.append('excerpt', JSON.stringify(formData.excerpt));
      formDataToSend.append('content', JSON.stringify(formData.content));
      formDataToSend.append('categoryIds', JSON.stringify(validCategoryIds));
      formDataToSend.append('blogId', formData.blogId!);
      formDataToSend.append('readTime', formData.readTime!);
      
      // ავტორის ინფორმაცია
      formDataToSend.append('author', JSON.stringify({
        name: formData.authorName,
        bio: formData.authorBio || '',
        avatar: formData.authorAvatar || ''
      }));
      
      if (formData.tableOfContents && formData.tableOfContents.length > 0) {
        formDataToSend.append('tableOfContents', JSON.stringify(formData.tableOfContents));
      }
      
      if (formData.tags && formData.tags.length > 0) {
        formDataToSend.append('tags', JSON.stringify(formData.tags));
      }

      formDataToSend.append('isPublished', formData.isPublished!.toString());
      formDataToSend.append('isFeatured', formData.isFeatured!.toString());
      formDataToSend.append('sortOrder', formData.sortOrder!.toString());

      // არსებული სურათების URL-ები
      if (formData.featuredImages && formData.featuredImages.length > 0) {
        console.log('Processing existing images:', formData.featuredImages);
        const existingUrls = formData.featuredImages.filter(img => 
          img.startsWith('http') && !img.startsWith('blob:')
        );
        console.log('Filtered existing URLs:', existingUrls);
        if (existingUrls.length > 0) {
          formDataToSend.append('existingFeaturedImages', JSON.stringify(existingUrls));
        }
      }

      // ახალი სურათების ფაილები
      if (imageFiles.length > 0) {
        console.log('Adding new image files:', imageFiles);
        imageFiles.forEach((file, index) => {
          formDataToSend.append('featuredImages', file);
        });
      } else if (formData.featuredImages && formData.featuredImages.length > 0) {
        // თუ ახალი ფაილები არ არის, მაგრამ გვაქვს არსებული URL-ები
        formDataToSend.append('featuredImages', JSON.stringify(formData.featuredImages));
      }

      // ავტორის ავატარი
      if (formData.authorAvatar) {
        if (formData.authorAvatar.startsWith('data:')) {
          const response = await fetch(formData.authorAvatar);
          const blob = await response.blob();
          formDataToSend.append('authorAvatar', blob, 'avatar.jpg');
        } else if (formData.authorAvatar.startsWith('http')) {
          formDataToSend.append('authorAvatarUrl', formData.authorAvatar);
        }
      }

      console.log('Sending FormData to API...');
      const result = await updateArticle(resolvedParams.id, { formData: formDataToSend, isFormData: true });
      console.log('API Response:', result);

      if (!result.featuredImages || result.featuredImages.length === 0) {
        console.warn('No featured images in response!');
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

  const handleAddCategoryId = () => {
    const trimmedId = currentCategoryId.trim();
    if (trimmedId && !formData.categoryIds?.includes(trimmedId)) {
      setFormData(prev => ({
        ...prev,
        categoryIds: [...(prev.categoryIds || []), trimmedId]
      }));
      setCurrentCategoryId('');
    }
  };

  const handleRemoveCategoryId = (index: number) => {
    setFormData(prev => ({
      ...prev,
      categoryIds: prev.categoryIds?.filter((_, i) => i !== index) || []
    }));
  };

  const handleAddTOCItem = () => {
    const newItem: TOCItem = {
      title: { en: '', ru: '' },
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

  const handleFeaturedImagesChange = (urls: string | string[] | File[]) => {
    const urlArray = Array.isArray(urls) ? urls : [urls];
    
    console.log('handleFeaturedImagesChange received:', urlArray);
    
    // თუ ფაილებია, შევინახოთ imageFiles-ში
    if (urlArray[0] instanceof File) {
      console.log('Saving files:', urlArray);
      setImageFiles(urlArray as File[]);
    }
    
    // შევინახოთ URL-ები ან data URL-ები formData-ში
    const processedUrls = urlArray.map(item => {
      if (item instanceof File) {
        console.log('Creating URL for file:', item.name);
        return URL.createObjectURL(item);
      }
      console.log('Using existing URL:', item);
      return item;
    });
    
    console.log('Setting formData with URLs:', processedUrls);
    setFormData(prev => ({ 
      ...prev, 
      featuredImages: processedUrls
    }));
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
                    value={formData.title || { en: '', ru: '' }}
                    onChange={(value) => setFormData(prev => ({ ...prev, title: value }))}
                    required
                    maxLength={200}
                  />

                  <MultilingualInput
                    label="Excerpt"
                    value={formData.excerpt || { en: '', ru: '' }}
                    onChange={(value) => setFormData(prev => ({ ...prev, excerpt: value }))}
                    required
                    type="textarea"
                    maxLength={500}
                    rows={4}
                  />

                  <MultilingualInput
                    label="Content"
                    value={formData.content || { en: '', ru: '' }}
                    onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                    required
                    type="richtext"
                    height={1000}
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

                  {/* Categories */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categories *
                    </label>

                    {/* Add Category ID manually */}
                    <div className="mb-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={currentCategoryId}
                          onChange={(e) => setCurrentCategoryId(e.target.value)}
                          placeholder="Add category ID..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategoryId())}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddCategoryId}
                        >
                          Add
                        </Button>
                      </div>
                      
                      {/* Display added category IDs */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(formData.categoryIds || []).map((categoryId, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                          >
                            {categoryId}
                            <button
                              type="button"
                              onClick={() => handleRemoveCategoryId(index)}
                              className="hover:text-green-600"
                            >
                              <TrashIcon className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-3">
                      {/* Show existing categories */}
                      {categories.map(category => (
                        <label key={category._id} className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.categoryIds?.includes(category._id) || false}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({
                                  ...prev,
                                  categoryIds: [...(prev.categoryIds || []), category._id]
                                }));
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  categoryIds: (prev.categoryIds || []).filter(id => id !== category._id)
                                }));
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-900">{category.name[language]}</span>
                        </label>
                      ))}

                      {/* Show manually added category IDs that are not in the categories list */}
                      {(formData.categoryIds || [])
                        .filter(categoryId => !categories.find(cat => cat._id === categoryId))
                        .map(categoryId => (
                          <label key={categoryId} className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={true}
                              onChange={(e) => {
                                if (!e.target.checked) {
                                  setFormData(prev => ({
                                    ...prev,
                                    categoryIds: (prev.categoryIds || []).filter(id => id !== categoryId)
                                  }));
                                }
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-900 italic">
                              {categoryId} <span className="text-gray-500">(Manual ID)</span>
                            </span>
                          </label>
                        ))}
                    </div>
                    {(!formData.categoryIds || formData.categoryIds.length === 0) && (
                      <p className="mt-1 text-sm text-red-500">
                        გთხოვთ აირჩიოთ მინიმუმ ერთი კატეგორია
                      </p>
                    )}
                    <p className="mt-1 text-sm text-gray-500">
                      არჩეული კატეგორიები: {formData.categoryIds?.length || 0}
                    </p>
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