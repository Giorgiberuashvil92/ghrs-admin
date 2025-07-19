"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getExercises } from "@/lib/api/exercises";
import type { Exercise } from "@/types/categories";

export default function ExercisesPage() {
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const data = await getExercises();
      setExercises(data);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">სავარჯიშოები იტვირთება...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">ყველა სავარჯიშო</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exercises.map((exercise) => (
          <div key={exercise.id} className="border rounded-lg p-4 shadow-sm">
            {exercise.thumbnailImage && typeof exercise.thumbnailImage === 'string' && (
              <img 
                src={exercise.thumbnailImage} 
                alt={exercise.name.ka} 
                className="w-full h-48 object-cover rounded mb-4"
              />
            )}
            
            <h3 className="text-xl font-semibold mb-2">{exercise.name.ka}</h3>
            
            {exercise.description?.ka && (
              <p className="text-gray-600 mb-4 line-clamp-3">{exercise.description.ka}</p>
            )}
            
            <div className="flex gap-2 mb-4">
              <span className={`px-2 py-1 rounded text-sm ${
                exercise.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                exercise.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {exercise.difficulty === 'easy' ? 'მარტივი' : 
                 exercise.difficulty === 'medium' ? 'საშუალო' : 'რთული'}
              </span>
              
              {exercise.duration && (
                <span className="px-2 py-1 rounded text-sm bg-blue-100 text-blue-800">
                  {exercise.duration}
                </span>
              )}
            </div>
            
            <div className="text-sm text-gray-500 space-y-1">
              {exercise.repetitions && <div>განმეორება: {exercise.repetitions}</div>}
              {exercise.sets && <div>სეტები: {exercise.sets}</div>}
              {exercise.restTime && <div>დასვენება: {exercise.restTime}</div>}
            </div>
          </div>
        ))}
      </div>

      {exercises.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">სავარჯიშოები არ არის</p>
        </div>
      )}
    </div>
  );
} 