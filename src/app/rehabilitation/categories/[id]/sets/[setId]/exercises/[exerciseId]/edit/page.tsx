import EditExerciseClient from '@/components/Exercises/EditExerciseClient';

interface EditExercisePageProps {
  params: Promise<{
    id: string;
    setId: string;
    exerciseId: string;
  }>;
}

export default async function EditExercisePage({ params }: EditExercisePageProps) {
  return <EditExerciseClient params={await params} />;
}
