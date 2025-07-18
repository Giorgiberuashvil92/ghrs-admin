"use client";

import { TrashIcon } from "@/assets/icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { Category } from "@/types/categories";
import Image from "next/image";
import { useLanguage } from "@/i18n/language-context";

// ვალიდაცია სურათისთვის
function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    // ლოკალური ფაილისთვის ან relative path
    return url.startsWith('/') || url.includes('Rectangle') || url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.jpeg');
  }
}

// ID-ს ფორმატირება GHRS სტილში
function formatCategoryId(id: string): string {
  // SQL-დან მოსული _id MongoDB format-შია, ჩვენ ვაჩვენოთ მხოლოდ ბოლო 8 სიმბოლო
  const shortId = id.slice(-8);
  return shortId.toUpperCase();
}

// კატეგორიის კოდის მიღება (01, 02, 03, ...)
function getCategoryCode(id: string, index: number): string {
  // GHRS SQL-ში კატეგორიები 01-07, 09 კოდებით არის
  const codes = ['01', '02', '03', '04', '05', '06', '07', '09'];
  return codes[index] || (index + 1).toString().padStart(2, '0');
}

interface CategoriesTableProps {
  categories: Category[];
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;
  onViewSubcategories?: (id: string) => void;
}

export function CategoriesTable({ categories, onDelete, onEdit, onViewSubcategories }: CategoriesTableProps) {
  const { t } = useLanguage();
  
  return (
    <div className="rounded-[10px] border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
      {/* GHRS სტილის თავსართი */}
      <div className="mb-6 border-b border-stroke pb-4 dark:border-dark-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-dark dark:text-white">
              📂 {t('categories')} Management ({categories.length} total)
            </h3>
            <p className="text-sm text-body-color mt-1">
              GHRS ადმინ პანელი - კატეგორიების მართვა SQL მონაცემებიდან
            </p>
          </div>
          <div className="text-sm text-body-color">
            რეალური მონაცემები: 8 კატეგორია (01-07, 09)
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:font-bold [&>th]:text-dark [&>th]:dark:text-white">
            <TableHead className="min-w-[80px] xl:pl-6">ID</TableHead>
            <TableHead className="min-w-[200px]">{t('category')}</TableHead>
            <TableHead className="min-w-[80px]">Code</TableHead>
            <TableHead className="min-w-[120px]">{t('image')}</TableHead>
            <TableHead className="min-w-[150px]">{t('subcategories')}</TableHead>
            <TableHead className="text-right xl:pr-6 min-w-[180px]">{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {categories.map((category, index) => (
            <TableRow key={category.id} className="border-[#eee] dark:border-dark-3 h-16 hover:bg-gray-50 dark:hover:bg-gray-800/50">
              {/* ID ველი */}
              <TableCell className="xl:pl-6 py-4">
                <div className="text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                    {getCategoryCode(category.id, index)}
                  </span>
                </div>
              </TableCell>

              {/* Category Name */}
              <TableCell className="py-4">
                <div>
                  <h5 className="text-dark dark:text-white font-semibold text-base mb-1">
                    {category.name}
                  </h5>
                  <p className="text-xs text-body-color line-clamp-2">
                    {category.description}
                  </p>
                </div>
              </TableCell>

              {/* Code ველი */}
              <TableCell className="py-4">
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-md">
                  {getCategoryCode(category.id, index)}
                </span>
              </TableCell>

              {/* Image ველი */}
              <TableCell className="py-4">
                {category?.imageUrl && isValidImageUrl(category.imageUrl) ? (
                  <div className="relative h-12 w-12 overflow-hidden rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <Image
                      src={category.imageUrl}
                      alt={category.name}
                      fill
                      className="object-cover"
                      onError={() => console.log('Image failed to load:', category.imageUrl)}
                    />
                  </div>
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shadow-sm border border-gray-200 dark:border-gray-700">
                    <span className="text-gray-400 text-xs font-medium">NULL</span>
                  </div>
                )}
              </TableCell>

              {/* Subcategories */}
              <TableCell className="py-4">
                {onViewSubcategories && (
                  <button
                    onClick={() => onViewSubcategories(category.id)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary hover:text-primary-dark border border-primary hover:border-primary-dark rounded-md transition-colors bg-primary/5 hover:bg-primary/10"
                  >
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M5 7.5L10 12.5L15 7.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {t('viewSubcategories')}
                  </button>
                )}
              </TableCell>

              {/* Actions */}
              <TableCell className="xl:pr-6 py-4">
                <div className="flex items-center justify-end gap-x-2">
                  {onEdit && (
                    <button 
                      onClick={() => onEdit(category.id)}
                      className="hover:text-primary p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
                      title={t('edit')}
                    >
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="group-hover:scale-110 transition-transform">
                        <path
                          d="M11.05 3.00002L4.20835 10.2417C3.95002 10.5167 3.70002 11.0584 3.65002 11.4334L3.34169 14.1334C3.23335 15.1084 3.93335 15.775 4.90002 15.6084L7.58335 15.15C7.95835 15.0834 8.48335 14.8084 8.74169 14.525L15.5834 7.28335C16.7667 6.03335 17.3 4.60835 15.4583 2.86668C13.625 1.14168 12.2334 1.75002 11.05 3.00002Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeMiterlimit="10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M9.90833 4.20831C10.2667 6.50831 12.1333 8.26665 14.45 8.49998"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeMiterlimit="10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  )}

                  <button 
                    onClick={() => onDelete(category.id)}
                    className="hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group"
                    title={t('delete')}
                  >
                    <TrashIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* GHRS სტილის ქვედა ინფო */}
      {categories.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📂</div>
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
            კატეგორიები არ მოიძებნა
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            დაამატეთ თქვენი პირველი კატეგორია GHRS სისტემაში
          </p>
        </div>
      )}
    </div>
  );
} 