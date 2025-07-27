'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Instructor } from '@/types/instructors';
import { useLanguage } from '@/i18n/language-context';
import { Button } from '@/components/ui/button';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  UserGroupIcon,
  AcademicCapIcon,
  StarIcon,
  CheckBadgeIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { 
  CheckBadgeIcon as CheckBadgeIconSolid,
  StarIcon as StarIconSolid 
} from '@heroicons/react/24/solid';

export default function InstructorsPage() {
  const { language } = useLanguage();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'verified'>('all');

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const { getAllInstructors } = await import('@/lib/api/instructors');
      const data = await getAllInstructors();
      setInstructors(data);
    } catch (error) {
      console.error('Error fetching instructors:', error);
      setInstructors([]); // Fallback to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`დარწმუნებული ხართ რომ გინდათ "${name}"-ის წაშლა?`)) return;
    
    try {
      const { deleteInstructor } = await import('@/lib/api/instructors');
      await deleteInstructor(id);
      setInstructors(instructors.filter(instructor => instructor._id !== id));
      alert('ინსტრუქტორი წარმატებით წაიშალა');
    } catch (error) {
      console.error('Error deleting instructor:', error);
      alert('ინსტრუქტორის წაშლა ვერ მოხერხდა');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const { toggleInstructorStatus } = await import('@/lib/api/instructors');
      const updatedInstructor = await toggleInstructorStatus(id);
      setInstructors(instructors.map(instructor => 
        instructor._id === id ? updatedInstructor : instructor
      ));
    } catch (error) {
      console.error('Error toggling instructor status:', error);
      alert('ინსტრუქტორის სტატუსის შეცვლა ვერ მოხერხდა');
    }
  };

  const filteredInstructors = instructors.filter(instructor => {
    const matchesSearch = (
      instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.profession.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesFilter = filter === 'all' || 
      (filter === 'active' && instructor.isActive) ||
      (filter === 'inactive' && !instructor.isActive);
      // verified ფილტრი წავშალოთ რადგან ბექენდიდან აღარ მოდის
    
    return matchesSearch && matchesFilter;
  });

  // Stats calculations
  const stats = {
    total: instructors.length,
    active: instructors.filter(i => i.isActive).length,
    verified: 0, // ბექენდიდან აღარ მოდის
    totalStudents: instructors.reduce((sum, i) => sum + (i.studentsCount || 0), 0),
    averageRating: instructors.length > 0 
      ? instructors.reduce((sum, i) => sum + (i.averageRating || 0), 0) / instructors.length 
      : 0
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserGroupIcon className="h-8 w-8 text-blue-600" />
            ინსტრუქტორების მართვა
          </h1>
          <p className="text-gray-600 mt-1">მართავით და ამატებთ ახალ ინსტრუქტორებს</p>
        </div>
        
        <Link href="/admin/instructors/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <PlusIcon className="h-4 w-4 mr-2" />
            ახალი ინსტრუქტორი
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">სულ ინსტრუქტორები</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckBadgeIconSolid className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">აქტიური</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>



        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AcademicCapIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">სულ სტუდენტები</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <StarIconSolid className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">საშუალო რეიტინგი</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="ინსტრუქტორების ძიება..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">ყველა ინსტრუქტორი</option>
            <option value="active">აქტიური</option>
            <option value="inactive">არააქტიური</option>
          </select>
        </div>
      </div>

      {/* Instructors List */}
      <div className="bg-white rounded-lg shadow-sm border">
        {filteredInstructors.length === 0 ? (
          <div className="text-center py-12">
            <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">ინსტრუქტორები არ მოიძებნა</p>
            <p className="text-gray-400 mb-6">დაამატეთ თქვენი პირველი ინსტრუქტორი</p>
            <Link href="/admin/instructors/new">
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                პირველი ინსტრუქტორის დამატება
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ინსტრუქტორი
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      პროფესია
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      კურსები/სტუდენტები
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      რეიტინგი
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      სტატუსი
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      მოქმედებები
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInstructors.map((instructor) => (
                    <tr key={instructor._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img
                            src={instructor.profileImage}
                            alt={instructor.name}
                            className="w-12 h-12 rounded-full object-cover mr-4"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/default-avatar.png';
                            }}
                          />
                          <div>
                            <div className="font-medium text-gray-900 flex items-center gap-2">
                              {instructor.name}
                            </div>
                            <div className="text-sm text-gray-500">{instructor.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{instructor.profession}</div>
                        <div className="text-xs text-gray-500">
                          {instructor.bio?.en && (
                            <div>🇺🇸 {instructor.bio.en}</div>
                          )}
                          {instructor.bio?.ru && (
                            <div>🇷🇺 {instructor.bio.ru}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {instructor.coursesCount || 0} კურსი
                        </div>
                        <div className="text-xs text-gray-500">
                          {instructor.studentsCount || 0} სტუდენტი
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <StarIconSolid className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-sm text-gray-900">
                            {(instructor.averageRating || 0).toFixed(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleToggleStatus(instructor._id)}
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-colors ${
                              instructor.isActive 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {instructor.isActive ? 'აქტიური' : 'არააქტიური'}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/instructors/${instructor._id}`}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                            title="ნახვა"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/admin/instructors/${instructor._id}/edit`}
                            className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                            title="რედაქტირება"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(instructor._id, instructor.name)}
                            className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                            title="წაშლა"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden">
              <div className="divide-y divide-gray-200">
                {filteredInstructors.map((instructor) => (
                  <div key={instructor._id} className="p-4">
                    <div className="flex items-start space-x-4">
                      <img
                        src={instructor.profileImage}
                        alt={instructor.name}
                        className="w-16 h-16 rounded-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/default-avatar.png';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 flex items-center gap-2">
                              {instructor.name}
                            </h4>
                            <p className="text-sm text-gray-500">{instructor.profession}</p>
                            <div className="text-xs text-gray-400">
                              {instructor.bio?.en && (
                                <div>🇺🇸 {instructor.bio.en}</div>
                              )}
                              {instructor.bio?.ru && (
                                <div>🇷🇺 {instructor.bio.ru}</div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <Link
                              href={`/admin/instructors/${instructor._id}`}
                              className="text-blue-600 hover:text-blue-900 p-1"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Link>
                            <Link
                              href={`/admin/instructors/${instructor._id}/edit`}
                              className="text-green-600 hover:text-green-900 p-1"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(instructor._id, instructor.name)}
                              className="text-red-600 hover:text-red-900 p-1"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                          <span>{instructor.coursesCount || 0} კურსი</span>
                          <span>{instructor.studentsCount || 0} სტუდენტი</span>
                          <span className="flex items-center">
                            <StarIconSolid className="h-3 w-3 text-yellow-400 mr-1" />
                            {(instructor.averageRating || 0).toFixed(1)}
                          </span>
                        </div>
                        
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={() => handleToggleStatus(instructor._id)}
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              instructor.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {instructor.isActive ? 'აქტიური' : 'არააქტიური'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 