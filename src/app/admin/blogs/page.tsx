'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Blog, BlogFilters } from '@/types/blogs';
import { getBlogs, deleteBlog, bulkDeleteBlogs } from '@/lib/api/blogs';
import { getAllCategories, Category } from '@/lib/api/categories';
import { useLanguage } from '@/i18n/language-context';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  BookOpenIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

// Add type for API response
interface BlogApiResponse extends Omit<Blog, 'categoryId' | 'featuredImage' | 'views' | 'likes'> {
  imageUrl: string;
  categoryId: {
    _id: string;
    name: {
      ka: string;
      en: string;
      ru: string;
    };
  } | null;
  viewsCount: number;
  likesCount: number;
}

export default function BlogsPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [blogs, setBlogs] = useState<BlogApiResponse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const [filters, setFilters] = useState<BlogFilters>({
    status: 'all',
    search: '',
    categoryId: undefined,
    dateRange: null
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });

  useEffect(() => {
    fetchData();
  }, [filters, pagination.page]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching blogs with filters:', filters);
      const response = await getBlogs(filters, pagination.page, pagination.limit);
      console.log('API Response:', response);
      
      // Handle array response format
      const blogsData = Array.isArray(response) ? response : response.blogs;
      console.log('Blogs data:', blogsData);
      
      setBlogs(blogsData as unknown as BlogApiResponse[]);
      setPagination(prev => ({
        ...prev,
        total: Array.isArray(response) ? response.length : response.total
      }));
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Current blogs state:', blogs);
    console.log('Loading state:', loading);
  }, [blogs, loading]);

  const fetchCategories = async () => {
    try {
      const categoriesData = await getAllCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('დარწმუნებული ხართ რომ გსურთ წაშლა?')) return;
    
    try {
      await deleteBlog(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert('შეცდომა წაშლისას');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`დარწმუნებული ხართ რომ გსურთ ${selectedIds.length} ბლოგის წაშლა?`)) return;
    
    try {
      await bulkDeleteBlogs(selectedIds);
      setSelectedIds([]);
      fetchData();
    } catch (error) {
      console.error('Error bulk deleting blogs:', error);
      alert('შეცდომა წაშლისას');
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === blogs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(blogs.map(blog => blog._id));
    }
  };

  const getStatusIcon = (blog: BlogApiResponse) => {
    if (!blog.isPublished) {
      return <XCircleIcon className="h-4 w-4 text-yellow-500" title="Draft" />;
    } else if (blog.isFeatured) {
      return <StarIcon className="h-4 w-4 text-purple-500" title="Featured" />;
    } else {
      return <CheckCircleIcon className="h-4 w-4 text-green-500" title="Published" />;
    }
  };

  const getCategoryName = (category: BlogApiResponse['categoryId']) => {
    if (!category) return 'Unknown';
    return category.name[language];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ka-GE');
  };

  if (loading && blogs?.length === 0) {
    console.log('Showing loading state');
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  console.log('Rendering main component with blogs:', blogs);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <BookOpenIcon className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold">Blogs Management</h1>
        </div>
        <Link href="/admin/blogs/new">
          <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
            <PlusIcon className="h-4 w-4" />
            New Blog
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="featured">Featured</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={filters.categoryId || ''}
              onChange={(e) => setFilters({ ...filters, categoryId: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name[language]}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search blogs..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-green-700">
              {selectedIds.length} blogs selected
            </span>
            <Button
              variant="outline"
              onClick={handleBulkDelete}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Blogs Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={!loading && selectedIds?.length === blogs?.length && blogs?.length > 0}
                  onChange={handleSelectAll}
                  disabled={loading}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Views
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Likes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {blogs?.map((blog) => (
              <tr key={blog._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(blog._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds([...selectedIds, blog._id]);
                      } else {
                        setSelectedIds(selectedIds.filter(id => id !== blog._id));
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {blog.imageUrl && (
                      <img
                        src={blog.imageUrl}
                        alt=""
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    )}
                    <div className="max-w-xs">
                      <div className="font-medium text-gray-900 truncate">
                        {blog.title[language]}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {blog.excerpt[language]}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {getCategoryName(blog.categoryId)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(blog)}
                    <span className="text-sm text-gray-600">
                      {!blog.isPublished ? 'Draft' : blog.isFeatured ? 'Featured' : 'Published'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {blog.viewsCount}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-sm text-gray-900">
                    <HeartIcon className="h-4 w-4 text-red-500" />
                    {blog.likesCount}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {formatDate(blog.createdAt)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push(`/articles?blogId=${blog._id}`)}
                      className="text-blue-600 hover:text-blue-800"
                      title="View Articles"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => router.push(`/admin/blogs/${blog._id}/edit`)}
                      className="text-gray-600 hover:text-gray-800"
                      title="Edit"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(blog._id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {blogs?.length === 0 && !loading && (
          <div className="text-center py-12">
            <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No blogs</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new blog post.</p>
            <div className="mt-6">
              <Link href="/admin/blogs/new">
                <Button className="bg-green-600 hover:bg-green-700">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Blog
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={pagination.page * pagination.limit >= pagination.total}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 