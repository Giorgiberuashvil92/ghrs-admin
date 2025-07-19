import { getCategoryById, getSubCategoryById } from '@/lib/api/categories';
import AddSetClient from '../../../../sets/add/AddSetClient';

interface AddSubCategorySetPageProps {
  params: Promise<{
    id: string;
    subId: string;
  }>;
}

async function getData(categoryId: string, subCategoryId: string) {
  try {
    const [category, subcategory] = await Promise.all([
      getCategoryById(categoryId),
      getSubCategoryById(categoryId, subCategoryId)
    ]);

    return { category, subcategory };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to fetch data');
  }
}

export default async function AddSubCategorySetPage({ params }: AddSubCategorySetPageProps) {
  // Ensure params are properly awaited
  const { id, subId } = await Promise.resolve(params);

  if (!id || !subId) {
    throw new Error('Category ID and Subcategory ID are required');
  }

  const data = await getData(id, subId);

  return (
    <AddSetClient 
      category={data.category} 
      subcategory={data.subcategory}
    />
  );
} 