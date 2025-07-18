import { getCategoryById } from '@/lib/api/categories';
import { getAllSets } from '@/lib/api/sets';
import SetsClient from './SetsClient';

interface SetsPageProps {
  params: {
    id: string;
  };
}

async function getData(categoryId: string) {
  try {
    const [category, sets] = await Promise.all([
      getCategoryById(categoryId),
      getAllSets(categoryId)
    ]);

    return { category, sets };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to fetch data');
  }
}

export default async function SetsPage({ params }: SetsPageProps) {
  // Ensure params are properly awaited
  const { id } = await Promise.resolve(params);

  if (!id) {
    throw new Error('Category ID is required');
  }

  const data = await getData(id);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <SetsClient initialSets={data.sets} category={data.category} />
    </div>
  );
} 