import { useRouter } from "next/navigation";
import { Button } from "@/components/ui-elements/button";
import { Category } from "@/types/categories";

function isValidImageUrl(url: string): boolean {
  if (!url || url.trim() === '') return false;
  try {
    const urlObj = new URL(url);
    return true;
  } catch {
    return url.startsWith('/') || url.startsWith('./') || url.startsWith('../');
  }
}

interface CategoryCardProps {
  category: Category;
  basePath: string;
  onDelete: () => void;
  language?: 'ka' | 'en' | 'ru';
}

export function CategoryCard({ category, basePath, onDelete, language = 'ka' }: CategoryCardProps) {
  const router = useRouter();

  return (
    <div className="bg-white dark:bg-boxdark">
      {/* სურათის სექცია */}
      <div 
        className="relative aspect-[4/3] w-full cursor-pointer overflow-hidden"
        onClick={() => router.push(`${basePath}/${category._id}/subcategories`)}
      >
        {category?.image && isValidImageUrl(category.image) ? (
          <img
            src={category.image}
            alt={category.name[language]}
            className="h-full w-full object-cover"
            onError={(e) => {
              console.log('Image failed to load:', category.image);
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-800">
            <span className="text-sm text-slate-500">სურათი არ არის</span>
          </div>
        )}
        
        {/* სტატუსის ბეჯები */}
        <div className="absolute top-2 right-2 flex gap-2">
          {!category.isActive && (
            <span className="rounded bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
              არააქტიური
            </span>
          )}
          {!category.isPublished && (
            <span className="rounded bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              გამოუქვეყნებელი
            </span>
          )}
        </div>
      </div>

      {/* კონტენტის სექცია */}
      <div className="space-y-6 p-6">
        {/* სათაური და აღწერა */}
        <div>
          <h3 
            className="cursor-pointer text-xl font-medium text-slate-900 hover:text-primary dark:text-slate-100"
            onClick={() => router.push(`${basePath}/${category._id}/subcategories`)}
          >
            {category.name[language]}
          </h3>
          {category.description && (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {category.description[language]}
            </p>
          )}
        </div>

        {/* ქვეკატეგორიების სია */}
        {category.subcategories?.length > 0 && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-200">
                ქვეკატეგორიები
              </h4>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {category.subcategories.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {category.subcategories.map((sub) => (
                <span
                  key={sub._id}
                  className="inline-flex cursor-pointer items-center whitespace-nowrap rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  onClick={() => router.push(`${basePath}/${category._id}/subcategories`)}
                >
                  {sub.name[language]}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ქმედებების ღილაკები */}
        <div className="flex items-center gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
          <Button
            label="ნახვა"
            variant="primary"
            onClick={() => router.push(`${basePath}/${category._id}/subcategories`)}
            className="flex-1"
          />
          <Button
            label="რედაქტირება"
            variant="outlinePrimary"
            onClick={() => router.push(`${basePath}/edit/${category._id}`)}
            className="flex-1"
          />
          <Button
            label="წაშლა"
            variant="outlineDark"
            onClick={onDelete}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
} 