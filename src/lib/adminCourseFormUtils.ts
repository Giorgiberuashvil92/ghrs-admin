/** ინსტრუქტორის სია API-დან: ზოგი ჩანაწერი `id`, ზოგი `_id`-ით მოდის. */
export type InstructorOptionRow = {
  _id?: string;
  id?: string;
  name: string;
};

export type CourseCategoryRow = { _id: string };

export function instructorRowId(row: Partial<InstructorOptionRow> | undefined): string {
  if (!row) return "";
  const v = (row.id ?? row._id ?? "").trim();
  return v;
}

/** მხოლოდ ის ID-ები, რომლებიც არსებობს მიმდინარე course-categories სიაში (ძველი/არასწორი ID-ების მოცილება). */
export function filterKnownCategoryIds(
  ids: string[] | undefined,
  categories: CourseCategoryRow[],
): string[] {
  if (!ids?.length || !categories.length) return ids ?? [];
  const ok = new Set(categories.map((c) => c._id));
  return ids.filter((id) => ok.has(id));
}

export function resolveInstructorForApi(
  formInstructor: { name: string; instructorId?: string },
  instructors: InstructorOptionRow[],
): { name: string; instructorId?: string } {
  const tid = formInstructor.instructorId?.trim();
  const byId = tid
    ? instructors.find((i) => instructorRowId(i) === tid)
    : undefined;
  const nameTrim = formInstructor.name.trim();
  const byName =
    !byId && nameTrim
      ? instructors.find((i) => i.name.trim() === nameTrim)
      : undefined;
  const chosen = byId || byName;
  const instructorId = chosen ? instructorRowId(chosen) : tid;
  return {
    name: (chosen?.name ?? formInstructor.name).trim(),
    ...(instructorId ? { instructorId } : {}),
  };
}
