import { notFound } from 'next/navigation';
import { getExercisesBySetId } from '@/lib/api/exercises';
import { getCategoryById, getSubCategoryById } from '@/lib/api/categories';
import { getSetById } from '@/lib/api/sets';
import ExercisesClient from '@/app/rehabilitation/categories/[id]/sets/[setId]/exercises/ExercisesClient';

interface SubCategoryExercisesPageProps {
  params: Promise<{
    id: string;
    subId: string;
    setId: string;
  }>;
}

async function getData(categoryId: string, subCategoryId: string, setId: string) {
  try {
    const [exercises, category, subcategory, set] = await Promise.all([
      getExercisesBySetId(setId),
      getCategoryById(categoryId),
      getSubCategoryById(categoryId, subCategoryId),
      getSetById(setId)
    ]);
    return { exercises, category, subcategory, set };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to fetch data');
  }
}

export default async function SubCategoryExercisesPage({ params }: SubCategoryExercisesPageProps) {
  // Ensure params are properly awaited
  const { id, subId, setId } = await Promise.resolve(params);

  if (!id || !subId || !setId) {
    throw new Error('Category ID, Subcategory ID and Set ID are required');
  }

  try {
    const { exercises, category, subcategory, set } = await getData(id, subId, setId);
    
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <ExercisesClient 
          category={category} 
          set={set} 
          initialExercises={exercises}
          subcategory={subcategory}
        />
      </div>
    );
  } catch (error) {
    console.error('Error loading exercises:', error);
    return notFound();
  }
} 