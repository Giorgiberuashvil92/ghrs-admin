import { getAllSets } from '@/lib/api/sets';
import { getCategoryById, getSubCategoryById } from '@/lib/api/categories';
import SetsClient from '../../../sets/SetsClient';

interface SubCategorySetsPageProps {
  params: Promise<{
    id: string;
    subId: string;
  }>;
}

async function getData(categoryId: string, subCategoryId: string) {
  try {
    const [category, subcategory, sets] = await Promise.all([
      getCategoryById(categoryId),
      getSubCategoryById(categoryId, subCategoryId),
      getAllSets(categoryId, subCategoryId)
    ]);

    return { category, subcategory, sets };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to fetch data');
  }
}

export default async function SubCategorySetsPage({ params }: SubCategorySetsPageProps) {
  // Ensure params are properly awaited
  const { id, subId } = await Promise.resolve(params);

  if (!id || !subId) {
    throw new Error('Category ID and Subcategory ID are required');
  }

  const data = await getData(id, subId);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <SetsClient 
        initialSets={data.sets} 
        category={data.category} 
        subcategory={data.subcategory}
      />
    </div>
  );
} 