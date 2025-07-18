import { getCategoryById } from '@/lib/api/categories';
import AddSetClient from './AddSetClient';

interface AddSetPageProps {
  params: {
    id: string;
  };
}

export default async function AddSetPage({ params }: AddSetPageProps) {
  const category = await getCategoryById(params.id);

  return <AddSetClient category={category} />;
} 