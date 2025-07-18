"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { useLanguage } from "@/i18n/language-context";
import { Category } from "@/types/categories";
import { deleteCategory } from "@/lib/api/categories";
import { toast } from "react-hot-toast";
import InputGroup from "@/components/FormElements/InputGroup";
import { Language } from "@/i18n/translations";
import Image from "next/image";

export default function Categories() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [categoriesData, setCategoriesData] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "published" | "draft">("all");
  const [sortBy, setSortBy] = useState<"name" | "date" | "order">("order");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    orthopedics: 0,
    neurology: 0,
    withImages: 0,
    active: 0,
    published: 0
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:4000/categories');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setCategoriesData(data);
        setFilteredCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error("კატეგორიების ჩატვირთვა ვერ მოხერხდა");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    let result = [...categoriesData];

    // ძებნა
    if (searchTerm) {
      result = result.filter(cat => 
        cat.name[language].toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.description?.[language]?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // ფილტრაცია
    switch (filterStatus) {
      case "active":
        result = result.filter(cat => cat.isActive);
        break;
      case "inactive":
        result = result.filter(cat => !cat.isActive);
        break;
      case "published":
        result = result.filter(cat => cat.isPublished);
        break;
      case "draft":
        result = result.filter(cat => !cat.isPublished);
        break;
    }

    // სორტირება
    switch (sortBy) {
      case "name":
        result.sort((a, b) => a.name[language].localeCompare(b.name[language]));
        break;
      case "date":
        result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
      case "order":
        result.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        break;
    }

    setFilteredCategories(result);
  }, [categoriesData, searchTerm, filterStatus, sortBy, language]);

  const handleStatusToggle = async (categoryId: string, field: "isActive" | "isPublished") => {
    const category = categoriesData.find(c => c._id === categoryId);
    if (!category) return;

    try {
      const response = await fetch(`http://localhost:4000/api/categories/${categoryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [field]: !category[field]
        })
      });

      if (!response.ok) throw new Error('Update failed');

      const updatedCategory = await response.json();
      setCategoriesData(prev => prev.map(c => c._id === categoryId ? updatedCategory : c));
      toast.success(`სტატუსი წარმატებით განახლდა`);
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error("სტატუსის განახლება ვერ მოხერხდა");
    }
  };

  const handleDelete = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId);
      setCategoriesData(prev => prev.filter(c => c._id !== categoryId));
      toast.success("კატეგორია წარმატებით წაიშალა");
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error("კატეგორიის წაშლა ვერ მოხერხდა");
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const updateStats = (categoriesData: Category[]) => {
    const total = categoriesData.length;
    const orthopedics = categoriesData.filter(cat => 
      cat.name.en.toLowerCase().includes('orthoped') || 
      cat.name.ka.toLowerCase().includes('ორთოპედ') ||
      cat.name.ru.toLowerCase().includes('ортопед')
    ).length;
    const neurology = categoriesData.filter(cat => 
      cat.name.en.toLowerCase().includes('neurology') || 
      cat.name.ka.toLowerCase().includes('ნევროლოგ') ||
      cat.name.ru.toLowerCase().includes('невролог')
    ).length;
    const withImages = categoriesData.filter(cat => cat.image && cat.image.trim() !== '').length;
    const active = categoriesData.filter(cat => cat.isActive).length;
    const published = categoriesData.filter(cat => cat.isPublished).length;

    setStats({
      total,
      orthopedics,
      neurology,
      withImages,
      active,
      published
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedCategories(filteredCategories.map(cat => cat._id));
    } else {
      setSelectedCategories([]);
    }
  };

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleBulkDelete = async () => {
    if (!selectedCategories.length) return;
    
    try {
      await Promise.all(selectedCategories.map(id => deleteCategory(id)));
      setCategoriesData(prev => prev.filter(cat => !selectedCategories.includes(cat._id)));
      setSelectedCategories([]);
      toast.success("არჩეული კატეგორიები წარმატებით წაიშალა");
    } catch (error) {
      console.error('Error deleting categories:', error);
      toast.error("შეცდომა კატეგორიების წაშლისას");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Breadcrumb pageName="📂 Categories Management" />
          <div className="flex gap-3">
            {selectedCategories.length > 0 && (
              <Button
                variant="destructive"
                className="px-6 py-3 text-base font-semibold w-full sm:w-auto"
                onClick={handleBulkDelete}
              >
                წაშლა ({selectedCategories.length})
              </Button>
            )}
            <Button
              variant="default"
              className="px-6 py-3 text-base font-semibold w-full sm:w-auto"
              onClick={() => router.push("/pages/rehabilitation/categories/add")}
            >
              + {t('addCategory')}
            </Button>
          </div>
        </div>

        {/* სტატისტიკის ბარათები */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-boxdark rounded-sm border border-stroke p-4">
            <div className="flex items-center">
              <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                <svg className="fill-primary dark:fill-white" width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M21.1063 18.0469L19.3875 3.23126C19.2157 1.71876 17.9438 0.584381 16.3969 0.584381H5.56878C4.05628 0.584381 2.78441 1.71876 2.57816 3.23126L0.859406 18.0469C0.756281 18.9063 1.03128 19.7313 1.61566 20.3844C2.20003 21.0375 2.99066 21.3813 3.85003 21.3813H18.1157C18.975 21.3813 19.8 21.0031 20.35 20.3844C20.9 19.7656 21.2094 18.9063 21.1063 18.0469ZM19.2157 19.3531C18.9407 19.6625 18.5625 19.8344 18.15 19.8344H3.85003C3.43753 19.8344 3.05941 19.6625 2.78441 19.3531C2.50941 19.0438 2.37191 18.6313 2.44066 18.2188L4.12503 3.40313C4.19378 2.71563 4.81253 2.16563 5.56878 2.16563H16.4313C17.1532 2.16563 17.7719 2.71563 17.875 3.40313L19.5938 18.2188C19.6282 18.6313 19.4907 19.0438 19.2157 19.3531Z" />
                  <path d="M14.884 13.1156H7.11621C6.66934 13.1156 6.29121 13.4938 6.29121 13.9406C6.29121 14.3875 6.66934 14.7656 7.11621 14.7656H14.884C15.3309 14.7656 15.709 14.3875 15.709 13.9406C15.709 13.4938 15.3309 13.1156 14.884 13.1156Z" />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-title-md font-bold text-black dark:text-white">
                  {filteredCategories.length}
                </h4>
                <span className="text-sm font-medium">სულ კატეგორია</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-boxdark rounded-sm border border-stroke p-4">
            <div className="flex items-center">
              <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                <svg className="fill-primary dark:fill-white" width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M21.1063 18.0469L19.3875 3.23126C19.2157 1.71876 17.9438 0.584381 16.3969 0.584381H5.56878C4.05628 0.584381 2.78441 1.71876 2.57816 3.23126L0.859406 18.0469C0.756281 18.9063 1.03128 19.7313 1.61566 20.3844C2.20003 21.0375 2.99066 21.3813 3.85003 21.3813H18.1157C18.975 21.3813 19.8 21.0031 20.35 20.3844C20.9 19.7656 21.2094 18.9063 21.1063 18.0469ZM19.2157 19.3531C18.9407 19.6625 18.5625 19.8344 18.15 19.8344H3.85003C3.43753 19.8344 3.05941 19.6625 2.78441 19.3531C2.50941 19.0438 2.37191 18.6313 2.44066 18.2188L4.12503 3.40313C4.19378 2.71563 4.81253 2.16563 5.56878 2.16563H16.4313C17.1532 2.16563 17.7719 2.71563 17.875 3.40313L19.5938 18.2188C19.6282 18.6313 19.4907 19.0438 19.2157 19.3531Z" />
                  <path d="M14.884 13.1156H7.11621C6.66934 13.1156 6.29121 13.4938 6.29121 13.9406C6.29121 14.3875 6.66934 14.7656 7.11621 14.7656H14.884C15.3309 14.7656 15.709 14.3875 15.709 13.9406C15.709 13.4938 15.3309 13.1156 14.884 13.1156Z" />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-title-md font-bold text-black dark:text-white">
                  {filteredCategories.filter(cat => cat.isActive).length}
                </h4>
                <span className="text-sm font-medium">აქტიური</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-boxdark rounded-sm border border-stroke p-4">
            <div className="flex items-center">
              <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                <svg className="fill-primary dark:fill-white" width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M21.1063 18.0469L19.3875 3.23126C19.2157 1.71876 17.9438 0.584381 16.3969 0.584381H5.56878C4.05628 0.584381 2.78441 1.71876 2.57816 3.23126L0.859406 18.0469C0.756281 18.9063 1.03128 19.7313 1.61566 20.3844C2.20003 21.0375 2.99066 21.3813 3.85003 21.3813H18.1157C18.975 21.3813 19.8 21.0031 20.35 20.3844C20.9 19.7656 21.2094 18.9063 21.1063 18.0469ZM19.2157 19.3531C18.9407 19.6625 18.5625 19.8344 18.15 19.8344H3.85003C3.43753 19.8344 3.05941 19.6625 2.78441 19.3531C2.50941 19.0438 2.37191 18.6313 2.44066 18.2188L4.12503 3.40313C4.19378 2.71563 4.81253 2.16563 5.56878 2.16563H16.4313C17.1532 2.16563 17.7719 2.71563 17.875 3.40313L19.5938 18.2188C19.6282 18.6313 19.4907 19.0438 19.2157 19.3531Z" />
                  <path d="M14.884 13.1156H7.11621C6.66934 13.1156 6.29121 13.4938 6.29121 13.9406C6.29121 14.3875 6.66934 14.7656 7.11621 14.7656H14.884C15.3309 14.7656 15.709 14.3875 15.709 13.9406C15.709 13.4938 15.3309 13.1156 14.884 13.1156Z" />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-title-md font-bold text-black dark:text-white">
                  {filteredCategories.filter(cat => cat.isPublished).length}
                </h4>
                <span className="text-sm font-medium">გამოქვეყნებული</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-boxdark rounded-sm border border-stroke p-4">
            <div className="flex items-center">
              <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                <svg className="fill-primary dark:fill-white" width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M21.1063 18.0469L19.3875 3.23126C19.2157 1.71876 17.9438 0.584381 16.3969 0.584381H5.56878C4.05628 0.584381 2.78441 1.71876 2.57816 3.23126L0.859406 18.0469C0.756281 18.9063 1.03128 19.7313 1.61566 20.3844C2.20003 21.0375 2.99066 21.3813 3.85003 21.3813H18.1157C18.975 21.3813 19.8 21.0031 20.35 20.3844C20.9 19.7656 21.2094 18.9063 21.1063 18.0469ZM19.2157 19.3531C18.9407 19.6625 18.5625 19.8344 18.15 19.8344H3.85003C3.43753 19.8344 3.05941 19.6625 2.78441 19.3531C2.50941 19.0438 2.37191 18.6313 2.44066 18.2188L4.12503 3.40313C4.19378 2.71563 4.81253 2.16563 5.56878 2.16563H16.4313C17.1532 2.16563 17.7719 2.71563 17.875 3.40313L19.5938 18.2188C19.6282 18.6313 19.4907 19.0438 19.2157 19.3531Z" />
                  <path d="M14.884 13.1156H7.11621C6.66934 13.1156 6.29121 13.4938 6.29121 13.9406C6.29121 14.3875 6.66934 14.7656 7.11621 14.7656H14.884C15.3309 14.7656 15.709 14.3875 15.709 13.9406C15.709 13.4938 15.3309 13.1156 14.884 13.1156Z" />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-title-md font-bold text-black dark:text-white">
                  {filteredCategories.filter(cat => cat.image).length}
                </h4>
                <span className="text-sm font-medium">სურათით</span>
              </div>
            </div>
          </div>
        </div>

        {/* ძებნის და ფილტრაციის პანელი */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <InputGroup
            label="ძებნა"
            type="text"
            placeholder="ძებნა..."
            value={searchTerm}
            handleChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <select
            className="rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">ყველა სტატუსი</option>
            <option value="active">აქტიური</option>
            <option value="inactive">არააქტიური</option>
            <option value="published">გამოქვეყნებული</option>
            <option value="draft">დრაფტი</option>
          </select>

          <select
            className="rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="order">სორტირების მიხედვით</option>
            <option value="name">სახელის მიხედვით</option>
            <option value="date">თარიღის მიხედვით</option>
          </select>

          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
            ნაპოვნია: {filteredCategories.length} კატეგორია
          </div>
        </div>

        {/* კატეგორიების ცხრილი */}
        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                  <th className="min-w-[40px] py-4 px-4 font-medium text-black dark:text-white">
                    <input
                      type="checkbox"
                      checked={selectedCategories.length === filteredCategories.length}
                      onChange={handleSelectAll}
                      className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </th>
                  <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                    სურათი
                  </th>
                  <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white">
                    სახელი
                  </th>
                  <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                    აღწერა
                  </th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                    სტატუსი
                  </th>
                  <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">
                    რიგითობა
                  </th>
                  <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">
                    განახლდა
                  </th>
                  <th className="py-4 px-4 font-medium text-black dark:text-white">
                    მოქმედებები
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category) => (
                  <tr key={category._id}>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category._id)}
                        onChange={() => handleSelectCategory(category._id)}
                        className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <div className="h-12.5 w-15 rounded-md">
                        {category.image ? (
                          <Image
                            src={category.image}
                            width={60}
                            height={50}
                            alt={category.name[language]}
                            className="rounded-md object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center rounded bg-gray-100 dark:bg-meta-4">
                            <span className="text-xl">🖼️</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {category.name[language]}
                      </p>
                      <p className="text-sm text-body-color">
                        {category.subcategories?.length || 0} ქვეკატეგორია
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p className="text-black dark:text-white line-clamp-2">
                        {category.description?.[language]}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleStatusToggle(category._id, "isActive")}
                          className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-base font-medium ${
                            category.isActive 
                              ? 'bg-success/10 text-success hover:bg-success/20' 
                              : 'bg-danger/10 text-danger hover:bg-danger/20'
                          } w-full transition-all duration-200`}
                        >
                          {category.isActive ? '✓ აქტიური' : '× არააქტიური'}
                        </button>
                        <button
                          onClick={() => handleStatusToggle(category._id, "isPublished")}
                          className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-base font-medium ${
                            category.isPublished 
                              ? 'bg-primary/10 text-primary hover:bg-primary/20' 
                              : 'bg-warning/10 text-warning hover:bg-warning/20'
                          } w-full transition-all duration-200`}
                        >
                          {category.isPublished ? '📢 გამოქვეყნებული' : '📝 დრაფტი'}
                        </button>
                      </div>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {category.sortOrder || 0}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {new Date(category.updatedAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/pages/rehabilitation/categories/${category._id}/subcategories`)}
                          className="flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-primary border border-primary/30 hover:bg-primary/10 transition-all duration-200"
                        >
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          ქვეკატეგორია
                        </button>

                        <button
                          onClick={() => router.push(`/rehabilitation/categories/${category._id}/sets`)}
                          className="flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-blue-600 border border-blue-300 hover:bg-blue-50 transition-all duration-200"
                        >
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                          </svg>
                          სეტები
                        </button>

                        <button
                          onClick={() => router.push(`/pages/rehabilitation/categories/edit/${category._id}`)}
                          className="flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all duration-200"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>

                        <button
                          onClick={() => setShowDeleteConfirm(category._id)}
                          className="flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* წაშლის დადასტურების მოდალი */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-boxdark rounded-sm p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-medium text-black dark:text-white mb-4">
              კატეგორიის წაშლა
            </h3>
            <p className="text-body-color dark:text-dark-6 mb-6">
              დარწმუნებული ხართ, რომ გსურთ კატეგორიის წაშლა? ეს მოქმედება შეუქცევადია და წაიშლება ყველა დაკავშირებული ქვეკატეგორია და კომპლექსი.
            </p>
            <div className="flex gap-4 justify-end">
              <Button
                variant="outline"
                className="px-6 py-3 text-base font-semibold w-full sm:w-auto min-w-[120px]"
                onClick={() => setShowDeleteConfirm(null)}
              >
                გაუქმება
              </Button>
              <Button
                variant="destructive"
                className="px-6 py-3 text-base font-semibold w-full sm:w-auto min-w-[120px]"
                onClick={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}
              >
                წაშლა
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 