import { getCategoryById } from '@/lib/api/categories';
import AddSetClient from './AddSetClient';

interface AddSetPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AddSetPage({ params }: AddSetPageProps) {
  const { id } = await params;
  const category = await getCategoryById(id);

  return (
    <>
      <AddSetClient category={category} />
    </>
  );
} 