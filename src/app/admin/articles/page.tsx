'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArticleFilters } from '@/types/articles';
import { getArticles, deleteArticle, bulkDeleteArticles } from '@/lib/api/articles';
import { getAllCategories, Category } from '@/lib/api/categories';
import { useLanguage } from '@/i18n/language-context';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  NewspaperIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

interface APIArticle {
  _id: string;
  title: {
    ka: string;
    en: string;
    ru: string;
    _id?: string;
  };
  excerpt: {
    ka: string;
    en: string;
    ru: string;
    _id?: string;
  };
  content: {
    ka: string;
    en: string;
    ru: string;
  };
  categoryId: {
    _id: string;
    name: {
      ka: string;
      en: string;
      ru: string;
    };
    description: {
      ka: string;
      en: string;
      ru: string;
    };
    image: string;
  } | string;
  blogId?: {
    _id: string;
    title: {
      ka: string;
      en: string;
      ru: string;
    };
    description: {
      ka: string;
      en: string;
      ru: string;
    };
    imageUrl: string;
  };
  author: {
    name: string;
    bio?: string;
    avatar?: string;
  };
  isPublished: boolean;
  isFeatured: boolean;
  isActive: boolean;
  viewsCount: number;
  commentsCount: number;
  likesCount: number;
  readTime: string;
  publishDate: string;
  featuredImages: string[];
  tableOfContents: any[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface Article {
  _id: string;
  title: {
    ka: string;
    en: string;
    ru: string;
  };
  excerpt: {
    ka: string;
    en: string;
    ru: string;
  };
  content: {
    ka: string;
    en: string;
    ru: string;
  };
  categoryId: string;
  authorName: string;
  isPublished: boolean;
  isFeatured: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export default function ArticlesPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  console.log(articles);
  
  const [filters, setFilters] = useState<ArticleFilters>({
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
      console.log('Fetching articles with filters:', filters);
      const response = await getArticles(filters, pagination.page, pagination.limit);
      console.log('Articles response in component:', response);
      
      // Transform the response data to match our component's needs
      const transformedArticles = (Array.isArray(response.articles) ? response.articles : [response.articles]).map((article: APIArticle) => ({
        _id: article._id,
        title: {
          ka: article.title?.ka || '',
          en: article.title?.en || '',
          ru: article.title?.ru || ''
        },
        excerpt: {
          ka: article.excerpt?.ka || '',
          en: article.excerpt?.en || '',
          ru: article.excerpt?.ru || ''
        },
        content: {
          ka: article.content?.ka || '',
          en: article.content?.en || '',
          ru: article.content?.ru || ''
        },
        categoryId: typeof article.categoryId === 'string' ? article.categoryId : article.categoryId?._id || '',
        authorName: article.author?.name || '',
        isPublished: article.isPublished || false,
        isFeatured: article.isFeatured || false,
        views: article.viewsCount || 0,
        createdAt: article.createdAt || new Date().toISOString(),
        updatedAt: article.updatedAt || new Date().toISOString()
      }));

      console.log('Transformed articles:', transformedArticles);
      setArticles(transformedArticles);
      setPagination(prev => ({
        ...prev,
        total: response.total || transformedArticles.length
      }));
    } catch (error) {
      console.error('Error fetching articles:', error);
      alert('სტატიების ჩატვირთვა ვერ მოხერხდა');
    } finally {
      setLoading(false);
    }
  };

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
      await deleteArticle(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('შეცდომა წაშლისას');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`დარწმუნებული ხართ რომ გსურთ ${selectedIds.length} სტატიის წაშლა?`)) return;
    
    try {
      await bulkDeleteArticles(selectedIds);
      setSelectedIds([]);
      fetchData();
    } catch (error) {
      console.error('Error bulk deleting articles:', error);
      alert('შეცდომა წაშლისას');
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === articles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(articles.map(article => article._id));
    }
  };

  const getStatusIcon = (article: Article) => {
    if (!article.isPublished) {
      return <XCircleIcon className="h-4 w-4 text-yellow-500" title="Draft" />;
    } else if (article.isFeatured) {
      return <StarIcon className="h-4 w-4 text-purple-500" title="Featured" />;
    } else {
      return <CheckCircleIcon className="h-4 w-4 text-green-500" title="Published" />;
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.name[language] : 'Unknown';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ka-GE');
  };

  if (loading && articles.length === 0) {
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

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <NewspaperIcon className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Articles Management</h1>
        </div>
        <Link href="/admin/articles/new">
          <Button className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            New Article
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                placeholder="Search articles..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-blue-700">
              {selectedIds.length} articles selected
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

      {/* Articles Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedIds.length === articles.length && articles.length > 0}
                  onChange={handleSelectAll}
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
                Author
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Views
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
            {articles.map((article) => (
              <tr key={article._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(article._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds([...selectedIds, article._id]);
                      } else {
                        setSelectedIds(selectedIds.filter(id => id !== article._id));
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="max-w-xs">
                    <div className="font-medium text-gray-900 truncate">
                      {article.title[language]}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {article.excerpt[language]}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {getCategoryName(article.categoryId)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {article.authorName}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(article)}
                    <span className="text-sm text-gray-600">
                      {!article.isPublished ? 'Draft' : article.isFeatured ? 'Featured' : 'Published'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {article.views}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {formatDate(article.createdAt)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.open(`/articles/${article._id}`, '_blank')}
                      className="text-blue-600 hover:text-blue-800"
                      title="View"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => router.push(`/admin/articles/${article._id}/edit`)}
                      className="text-gray-600 hover:text-gray-800"
                      title="Edit"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(article._id)}
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

        {articles.length === 0 && !loading && (
          <div className="text-center py-12">
            <NewspaperIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No articles</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new article.</p>
            <div className="mt-6">
              <Link href="/admin/articles/new">
                <Button>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Article
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