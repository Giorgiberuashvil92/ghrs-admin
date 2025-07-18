import { useRouter } from "next/navigation";
import { Button } from "@/components/ui-elements/button";
import { SubCategory } from "@/types/categories";

function isValidImageUrl(url: string): boolean {
  if (!url || url.trim() === '') return false;
  try {
    const urlObj = new URL(url);
    return true;
  } catch {
    return url.startsWith('/') || url.startsWith('./') || url.startsWith('../');
  }
}

interface SubCategoryCardProps {
  categoryId: string;
  subcategory: SubCategory;
  basePath: string;
  onDelete: () => void;
  language?: 'ka' | 'en' | 'ru';
}

export default function SubCategoryCard({ 
  categoryId, 
  subcategory, 
  basePath, 
  onDelete,
  language = 'ka' 
}: SubCategoryCardProps) {
  const router = useRouter();

  return (
    <div className="bg-white dark:bg-boxdark">
      {/* სურათის სექცია */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {subcategory.image && isValidImageUrl(subcategory.image) ? (
          <img
            src={subcategory.image}
            alt={subcategory.name[language]}
            className="h-full w-full object-cover"
            onError={(e) => {
              console.log('SubCategory image failed to load:', subcategory.image);
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
          {!subcategory.isActive && (
            <span className="rounded bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
              არააქტიური
            </span>
          )}
          {!subcategory.isPublished && (
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
          <h3 className="text-xl font-medium text-slate-900 dark:text-slate-100">
            {subcategory.name[language]}
          </h3>
          {subcategory.description && (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {subcategory.description[language]}
            </p>
          )}
        </div>

        {/* ქმედებების ღილაკები */}
        <div className="flex items-center gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
          <Button
            label="კომპლექსები"
            variant="primary"
            onClick={() => router.push(`${basePath}/${categoryId}/subcategories/${subcategory._id}/complexes`)}
            className="flex-1"
          />
          <Button
            label="რედაქტირება"
            variant="outlinePrimary"
            onClick={() => router.push(`${basePath}/${categoryId}/subcategories/edit/${subcategory._id}`)}
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