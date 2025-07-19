import { getCategoryById, getSubCategoryById } from '@/lib/api/categories';
import { getSetById } from '@/lib/api/sets';
import AddExerciseClient from '../../../../../../sets/[setId]/exercises/add/AddExerciseClient';

interface AddSubCategoryExercisePageProps {
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

export default async function AddSubCategoryExercisePage({ params }: AddSubCategoryExercisePageProps) {
  // Ensure params are properly awaited
  const { id, subId, setId } = await Promise.resolve(params);

  if (!id || !subId || !setId) {
    throw new Error('Category ID, Subcategory ID and Set ID are required');
  }

  const data = await getData(id, subId, setId);

  return (
    <AddExerciseClient 
      category={data.category} 
      set={data.set}
      subcategory={data.subcategory}
    />
  );
} 