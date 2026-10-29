import EditExerciseClient from '@/components/Exercises/EditExerciseClient';

interface EditExercisePageProps {
  params: Promise<{
    id: string;
    subId: string;
    setId: string;
    exerciseId: string;
  }>;
}

export default async function SubCategoryEditExercisePage({ params }: EditExercisePageProps) {
  return <EditExerciseClient params={await params} />;
}
