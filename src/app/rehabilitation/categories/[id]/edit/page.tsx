import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCategoryById } from "@/lib/api/categories";
import EditCategoryForm from "./EditCategoryForm";

interface EditCategoryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const resolvedParams = await params;
  
  try {
    const category = await getCategoryById(resolvedParams.id);
    
    if (!category) {
      return notFound();
    }

    return (
      <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
        <EditCategoryForm category={category} />
      </Suspense>
    );
  } catch (error) {
    console.error('Error loading category:', error);
    return notFound();
  }
} 