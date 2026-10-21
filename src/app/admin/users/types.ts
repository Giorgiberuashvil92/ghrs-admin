export type User = {
  _id: string; name: string; email: string; phone?: string; location?: string; image?: string;
  createdAt?: string; updatedAt?: string; purchaseCount?: number; fullAccess?: boolean;
  diseases?: string[]; additionalInfo?: string;
  statistics?: { totalTimeSpent?: number; totalExercisesCompleted?: number; totalSetsCompleted?: number; totalCoursesCompleted?: number; currentStreak?: number; recordStreak?: number; activityDates?: string[]; completedExerciseIds?: string[]; completedSetIds?: string[]; completedCourseIds?: string[] };
  achievements?: { id: string; title: Record<string, string>; current: number; total: number; isCompleted: boolean }[];
};
export type Purchase = {
  _id: string; itemType: string; setId?: { name?: string | Record<string, string>; title?: string | Record<string, string> };
  courseId?: { title?: string | Record<string, string> }; amount: number; currency: string; hasAccess: boolean;
  isActive: boolean; expiresAt?: string; createdAt?: string;
};
export class ApiError extends Error {
  constructor(public status: number) { super('Request failed'); }
}
export async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: 'no-store', headers: { 'Content-Type': 'application/json' } });
  if (!response.ok) throw new ApiError(response.status);
  return response.json();
}
export const inputStyle = 'w-full rounded-xl border border-stroke bg-transparent px-4 py-3 outline-none transition focus:border-primary disabled:opacity-50 dark:border-dark-3';
export const panelStyle = 'rounded-2xl border border-stroke bg-white p-5 shadow-sm dark:border-dark-3 dark:bg-gray-dark md:p-6';
export const buttonStyle = 'rounded-xl bg-primary px-5 py-3 text-sm font-medium text-white transition hover:bg-opacity-90 disabled:opacity-40';
