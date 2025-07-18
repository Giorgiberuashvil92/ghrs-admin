import { getCategoryById } from '@/lib/api/categories';
import { getSetById } from '@/lib/api/sets';
import EditSetClient from './EditSetClient';

interface EditSetPageProps {
  params: {
    id: string;
    setId: string;
  };
}

export default async function EditSetPage({ params }: EditSetPageProps) {
  const [category, set] = await Promise.all([
    getCategoryById(params.id),
    getSetById(params.setId)
  ]);

  return <EditSetClient category={category} set={set} />;
} 