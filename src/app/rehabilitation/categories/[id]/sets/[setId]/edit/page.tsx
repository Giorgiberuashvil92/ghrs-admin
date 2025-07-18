import { notFound } from 'next/navigation';
import { getCategoryById } from '@/lib/api/categories';
import { getSetById } from '@/lib/api/sets';    
import EditSetClient from '@/app/rehabilitation/categories/[id]/sets/[setId]/edit/EditSetClient';

interface EditSetPageProps {
  params: {
    id: string;
    setId: string;
  };
}

export default async function EditSetPage({ params }: EditSetPageProps) {
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
      <EditSetClient
        category={category}
        initialSet={set}
      />
    );
  } catch (error) {
    return notFound();
  }
} 