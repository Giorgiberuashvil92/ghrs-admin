import { getCategoryById, getSubCategoryById, type Category } from '@/lib/api/categories';
import { getSetById } from '@/lib/api/sets';
import EditSetClient from '../../../../../sets/[setId]/edit/EditSetClient';

interface EditSubCategorySetPageProps {
  params: Promise<{
    id: string;
    subId: string;
    setId: string;
  }>;
}

async function getData(categoryId: string, subCategoryId: string, setId: string) {
  try {
    const [category, subcategory, set] = await Promise.all([
      getCategoryById(categoryId),
      getSubCategoryById(categoryId, subCategoryId),
      getSetById(setId)
    ]);

    return { category, subcategory, set };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to fetch data');
  }
}

export default async function EditSubCategorySetPage({ params }: EditSubCategorySetPageProps) {
  // Ensure params are properly awaited
  const { id, subId, setId } = await Promise.resolve(params);

  if (!id || !subId || !setId) {
    throw new Error('Category ID, Subcategory ID, and Set ID are required');
  }

  const data = await getData(id, subId, setId);

  return (
    <EditSetClient 
      category={data.category} 
      initialSet={data.set}
    />
  );
} 