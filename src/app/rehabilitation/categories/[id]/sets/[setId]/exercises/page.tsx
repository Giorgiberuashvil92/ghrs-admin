import { notFound } from 'next/navigation';
import { getExercisesBySetId } from '@/lib/api/exercises';
import { getCategoryById } from '@/lib/api/categories';
import { getSetById } from '@/lib/api/sets';
import ExercisesClient from './ExercisesClient';

interface ExercisesPageProps {
  params: {
    id: string;
    setId: string;
  };
}

async function getData(categoryId: string, setId: string) {
  try {
    const [exercises, category, set] = await Promise.all([
      getExercisesBySetId(setId),
      getCategoryById(categoryId),
      getSetById(setId)
    ]);
    return { exercises, category, set };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to fetch data');
  }
}

export default async function ExercisesPage({ params }: ExercisesPageProps) {
  // Ensure params are properly awaited
  const { id, setId } = await Promise.resolve(params);

  if (!id || !setId) {
    throw new Error('Category ID and Set ID are required');
  }

  try {
    const { exercises, category, set } = await getData(id, setId);
    
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <ExercisesClient 
          category={category} 
          set={set} 
          initialExercises={exercises} 
        />
      </div>
    );
  } catch (error) {
    console.error('Error loading exercises:', error);
    return notFound();
  }
} 