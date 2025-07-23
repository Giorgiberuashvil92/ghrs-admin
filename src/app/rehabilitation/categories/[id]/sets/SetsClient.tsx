'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Set } from '@/types/sets';
import { Category } from '@/lib/api/categories';
import { SubCategory } from '@/types/categories';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/language-context';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  RectangleStackIcon,
  ClockIcon,
  BanknotesIcon,
  PlayIcon,
  PencilIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { 
  CheckCircleIcon as CheckCircleIconSolid,
  XCircleIcon as XCircleIconSolid 
} from '@heroicons/react/24/solid';

interface SetsClientProps {
  initialSets: Set[];
  category: Category;
  subcategory?: SubCategory; // ოფციონალური საბ კატეგორია
}

export default function SetsClient({ initialSets, category, subcategory }: SetsClientProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Build paths dynamically based on whether we have a subcategory
  const basePath = subcategory 
    ? `/rehabilitation/categories/${category._id}/subcategories/${subcategory._id}`
    : `/rehabilitation/categories/${category._id}`;
  
  const addSetPath = `${basePath}/sets/add`;
  
  const title = subcategory 
    ? `${category.name.ka} › ${subcategory.name.ka}`
    : category.name.ka;
    
  const description = subcategory
    ? t('subcategorySetsList')
    : t('categorySetsList');

  const filteredSets = initialSets.filter(set =>
    set.name.ka.toLowerCase().includes(searchTerm.toLowerCase()) ||
    set.description?.ka?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-600">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-full">
                <RectangleStackIcon className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">{title}</span> - {t('sets')}
            </h1>
            <p className="text-lg text-blue-100 mb-6 max-w-2xl mx-auto">
              {description}
            </p>
            <div className="flex justify-center gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <RectangleStackIcon className="h-5 w-5" />
                <span>{initialSets.length} {t('totalSets')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIconSolid className="h-5 w-5 text-green-400" />
                <span>{initialSets.filter(s => s.isActive && s.isPublished).length} {t('activeSets')}</span>
              </div>
              <div className="flex items-center gap-2">
                <BanknotesIcon className="h-5 w-5" />
                <span>{t('pricingPackages')}</span>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-teal-400/20 rounded-full blur-xl"></div>
      </div>

      {/* Search and Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('searchSets')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
              />
            </div>
            
            <Link
              href={addSetPath}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-4 rounded-xl font-medium transition-all"
            >
              <PlusIcon className="h-5 w-5" />
              {t('addNewSet')}
            </Link>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            {t('foundSets')} {filteredSets.length} {t('totalSets')}
          </h2>
        </div>

        {/* Sets Grid */}
        {filteredSets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSets.map((set) => (
              <div key={set._id} className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                {/* Image/Thumbnail */}
                <div className="relative overflow-hidden">
                  {set.thumbnailImage ? (
                    <img 
                      src={set.thumbnailImage} 
                      alt={set.name.ka} 
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center group-hover:from-indigo-200 group-hover:to-blue-200 transition-colors duration-300">
                      <RectangleStackIcon className="h-16 w-16 text-indigo-400" />
                    </div>
                  )}
                  
                  {/* Status Badges */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    {set.isActive && set.isPublished ? (
                      <div className="bg-green-100/90 backdrop-blur-sm text-green-800 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1">
                        <CheckCircleIconSolid className="h-4 w-4" />
                        {t('active')}
                      </div>
                    ) : (
                      <div className="bg-yellow-100/90 backdrop-blur-sm text-yellow-800 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1">
                        <XCircleIconSolid className="h-4 w-4" />
                        {t('inactive')}
                      </div>
                    )}
                  </div>

                  {/* Price Badge */}
                  <div className="absolute top-4 left-4">
                    <div className="bg-blue-100/90 backdrop-blur-sm text-blue-800 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1">
                      <BanknotesIcon className="h-4 w-4" />
                      {set.price.monthly}₾/{t('monthly')}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {set.name.ka}
                  </h3>

                  {/* Description */}
                  {set.description?.ka && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {set.description.ka}
                    </p>
                  )}

                  {/* Pricing Info */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">{t('monthly')}:</span>
                        <span className="font-semibold text-gray-900 ml-2">{set.price.monthly}₾</span>
                      </div>
                      <div>
                        <span className="text-gray-500">{t('threeMonths')}:</span>
                        <span className="font-semibold text-gray-900 ml-2">{set.price.threeMonths}₾</span>
                      </div>
                      <div>
                        <span className="text-gray-500">{t('sixMonths')}:</span>
                        <span className="font-semibold text-gray-900 ml-2">{set.price.sixMonths}₾</span>
                      </div>
                      <div>
                        <span className="text-gray-500">{t('yearly')}:</span>
                        <span className="font-semibold text-gray-900 ml-2">{set.price.yearly}₾</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {/* Primary Action */}
                    <Link
                      href={`${basePath}/sets/${set._id}/exercises`}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-xl text-sm font-medium transition-all"
                    >
                      <PlayIcon className="h-4 w-4" />
                      {t('exercises')}
                    </Link>
                    
                    {/* Secondary Action */}
                    <Link
                      href={`${basePath}/sets/${set._id}/edit`}
                      className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                    >
                      <PencilIcon className="h-4 w-4" />
                      {t('edit')}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty States */
          <div className="text-center py-16">
            {initialSets.length === 0 ? (
              // No sets at all
              <>
                <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <RectangleStackIcon className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">{t('noSetsFound')}</h3>
                <p className="text-gray-500 mb-6">{t('startByCreatingSet')}</p>
                <Link
                  href={addSetPath}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-all inline-flex items-center gap-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  {t('createFirstSet')}
                </Link>
              </>
            ) : (
              // Search returned no results
              <>
                <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <MagnifyingGlassIcon className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">{t('setNotFound')}</h3>
                <p className="text-gray-500 mb-6">{t('tryDifferentSearch')}</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('clearSearch')}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 