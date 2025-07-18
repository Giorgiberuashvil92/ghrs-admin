import { notFound } from 'next/navigation';
import { getCategoryById } from '@/lib/api/categories';
import { getSetById } from '@/lib/api/sets';
import AddExerciseClient from './AddExerciseClient';

interface AddExercisePageProps {
  params: {
    id: string;
    setId: string;
  };
}

export default async function AddExercisePage({ params }: AddExercisePageProps) {
  const { id, setId } = params;

  try {
    const [category, set] = await Promise.all([
      getCategoryById(id),
      getSetById(setId),
    ]);

    if (!category || !set) {
      return notFound();
    }

    return (
      <AddExerciseClient
        category={category}
        set={set}
      />
    );
  } catch (error) {
    return notFound();
  }
} 