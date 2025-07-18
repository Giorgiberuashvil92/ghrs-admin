import { notFound } from 'next/navigation';
import { getExercisesBySetId } from '@/lib/api/exercises';
import ExercisesClient from './ExercisesClient';

interface ExercisesPageProps {
  params: {
    setId: string;
  };
}

async function getData(setId: string) {
  try {
    const exercises = await getExercisesBySetId(setId);
    return exercises;
  } catch (error) {
    console.error('Error fetching exercises:', error);
    throw new Error('Failed to fetch exercises');
  }
}

export default async function ExercisesPage({ params }: ExercisesPageProps) {
  // Ensure params are properly awaited
  const { setId } = await Promise.resolve(params);

  if (!setId) {
    throw new Error('Set ID is required');
  }

  try {
    const exercises = await getData(setId);
    
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <ExercisesClient exercises={exercises} />
      </div>
    );
  } catch (error) {
    console.error('Error loading exercises:', error);
    return notFound();
  }
} 