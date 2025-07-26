import { Exercise, LocalizedString } from "@/types/categories";

const API_BASE_URL = process.env.NODE_ENV === 'development'
  ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  : process.env.NEXT_PUBLIC_API_URL || 'https://ghrs-backend.onrender.com';

// Helper function to construct API URLs
function constructApiUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

// ლოკალიზებული ველების ვალიდაცია
function validateLocalizedFields(data: FormData): void {
  const requiredFields = ["name"];

  console.group("🔍 ლოკალიზებული ველების ვალიდაცია");
  
  // სავალდებულო ველების შემოწმება
  for (const field of requiredFields) {
    const value = data.get(field);
    console.log(`📝 მოწმდება ${field}:`, value);
    
    if (!value) {
      console.error(`❌ ${field} არ არის მითითებული`);
      throw new Error(`${field} სავალდებულოა`);
    }

    try {
      const localizedValue = JSON.parse(value as string) as LocalizedString;
      console.log(`📋 დაპარსული ${field}:`, localizedValue);
      
      // მხოლოდ en და ru არის სავალდებულო
      if (!localizedValue.en || !localizedValue.ru) {
        console.error(`❌ ${field}-ის en ან ru თარგმანი აკლია:`, { en: !!localizedValue.en, ru: !!localizedValue.ru });
        throw new Error(`${field}-ის ინგლისური (en) და რუსული (ru) თარგმანები სავალდებულოა`);
      }
      
      console.log(`✅ ${field} ვალიდურია`);
    } catch (error) {
      console.error(`❌ JSON პარსინგის შეცდომა ${field}-ისთვის:`, error);
      throw new Error(`არასწორი JSON ფორმატი ${field}-ისთვის`);
    }
  }

  // description-ის შემოწმება თუ გამოგზავნილია
  const description = data.get('description');
  if (description) {
    try {
      const localizedValue = JSON.parse(description as string) as LocalizedString;
      console.log(`📋 დაპარსული description:`, localizedValue);
    } catch (error) {
      console.error(`❌ JSON პარსინგის შეცდომა description-ისთვის:`, error);
      throw new Error(`არასწორი JSON ფორმატი description-ისთვის`);
    }
  }
  
  console.groupEnd();
}

// სავალდებულო ველების ვალიდაცია
function validateRequiredFields(data: FormData): void {
  const requiredFields = [
    "videoDuration",
    "duration",
    "difficulty",
    "repetitions",
    "sets",
    "restTime",
    "setId",
    "categoryId",
  ];

  console.group("🔍 სავალდებულო ველების ვალიდაცია");
  
  for (const field of requiredFields) {
    const value = data.get(field);
    console.log(`📝 მოწმდება ${field}:`, value);
    
    if (!value) {
      console.error(`❌ ${field} არ არის მითითებული`);
      throw new Error(`${field} სავალდებულოა`);
    }
    
    console.log(`✅ ${field} ვალიდურია`);
  }

  // სირთულის ვალიდაცია
  const difficulty = data.get("difficulty");
  console.log("📝 მოწმდება სირთულე:", difficulty);
  
  if (difficulty && !["easy", "medium", "hard"].includes(difficulty as string)) {
    console.error(`❌ არასწორი სირთულის მნიშვნელობა:`, difficulty);
    throw new Error("სირთულე უნდა იყოს: easy, medium, ან hard");
  }
  
  console.log("✅ სირთულე ვალიდურია");
  console.groupEnd();
}

// URL-ების ვალიდაცია
function validateUrls(data: FormData): void {
  console.group("🔍 URL-ების ვალიდაცია");
  
  const videoUrl = data.get("videoUrl") as string;
  const thumbnailUrl = data.get("thumbnailUrl") as string;

  console.log("📝 ვიდეოს URL:", videoUrl);
  console.log("📝 თამბნეილის URL:", thumbnailUrl);

  if (videoUrl) {
    try {
      new URL(videoUrl);
      console.log("✅ ვიდეოს URL ვალიდურია");
    } catch {
      console.error("❌ არასწორი ვიდეოს URL ფორმატი:", videoUrl);
      throw new Error("არასწორი ვიდეოს URL ფორმატი");
    }
  }

  if (thumbnailUrl) {
    try {
      new URL(thumbnailUrl);
      console.log("✅ თამბნეილის URL ვალიდურია");
    } catch {
      console.error("❌ არასწორი თამბნეილის URL ფორმატი:", thumbnailUrl);
      throw new Error("არასწორი თამბნეილის URL ფორმატი");
    }
  }
  
  console.groupEnd();
}

// ფაილების ვალიდაცია
function validateFiles(data: FormData): void {
  console.group("🔍 ფაილების ვალიდაცია");
  
  const files = data.getAll("files");
  const videoUrl = data.get("videoUrl");
  const thumbnailUrl = data.get("thumbnailUrl");

  console.log("📝 ფაილების რაოდენობა:", files.length);
  console.log("📝 ვიდეოს URL:", videoUrl);
  console.log("📝 თამბნეილის URL:", thumbnailUrl);

  // თუ ფაილები გვაქვს, შევამოწმოთ მათი ტიპები
  if (files.length > 0) {
    if (files.length !== 2) {
      console.error("❌ არასწორი ფაილების რაოდენობა:", files.length);
      throw new Error("საჭიროა ორივე ფაილის (ვიდეო და თამბნეილი) მითითება");
    }

    const [videoFile, thumbnailFile] = files as File[];

    console.log("📝 ვიდეო ფაილის ტიპი:", videoFile.type);
    console.log("📝 თამბნეილის ფაილის ტიპი:", thumbnailFile.type);

    if (!videoFile.type.startsWith("video/")) {
      console.error("❌ არასწორი ვიდეო ფაილის ტიპი:", videoFile.type);
      throw new Error("პირველი ფაილი უნდა იყოს ვიდეო");
    }

    if (!thumbnailFile.type.startsWith("image/")) {
      console.error("❌ არასწორი თამბნეილის ფაილის ტიპი:", thumbnailFile.type);
      throw new Error("მეორე ფაილი უნდა იყოს სურათი");
    }
    
    console.log("✅ ფაილების ტიპები ვალიდურია");
  }
  
  console.log("✅ ფაილების ვალიდაცია წარმატებით დასრულდა");
  console.groupEnd();
}

export async function getExercises(params?: {
  categoryId?: string;
  subCategoryId?: string;
}): Promise<Exercise[]> {
  const queryParams = new URLSearchParams();
  if (params?.categoryId) queryParams.append("categoryId", params.categoryId);
  if (params?.subCategoryId)
    queryParams.append("subCategoryId", params.subCategoryId);

  const url = constructApiUrl(
    `exercises${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
  );
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to fetch exercises" }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function getExercisesBySetId(setId: string): Promise<Exercise[]> {
  try {
    console.log("📤 Fetching exercises for setId:", setId);
    const response = await fetch(constructApiUrl(`exercises/set/${setId}`));

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Fetched exercises:", data.length);
    return data;
  } catch (error) {
    console.error("❌ Error fetching exercises:", error);
    throw error;
  }
}

export async function getExercisesByCategory(
  categoryId: string,
): Promise<Exercise[]> {
  const response = await fetch(
    constructApiUrl(`exercises/category/${categoryId}`),
  );

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to fetch exercises by category" }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function getExercisesByDifficulty(
  difficulty: "easy" | "medium" | "hard",
): Promise<Exercise[]> {
  const response = await fetch(
    constructApiUrl(`exercises/difficulty/${difficulty}`),
  );

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to fetch exercises by difficulty" }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function getExerciseById(id: string): Promise<Exercise> {
  const response = await fetch(constructApiUrl(`exercises/${id}`));

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to fetch exercise" }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function createExercise(data: FormData): Promise<Exercise> {
  try {
    console.group("🏋️‍♂️ სავარჯიშოს შექმნის მოთხოვნა");
    console.log("📍 URL:", `${API_BASE_URL}/exercises`);

    // ლოკალიზებული ველების ლოგირება
    console.group("🌐 ლოკალიზებული ველები:");
    ["name", "description"].forEach((field) => {
      try {
        const value = data.get(field);
        const localizedValue = value ? JSON.parse(value as string) : {};
        console.log(`${field}:`, {
          en: localizedValue.en || "❌ არ არის",
          ru: localizedValue.ru || "❌ არ არის",
        });
      } catch (error) {
        console.error(`Error parsing ${field}:`, error);
      }
    });
    console.groupEnd();

    // სავალდებულო ველების ლოგირება
    console.group("📝 სავალდებულო ველები:");
    const requiredFields = [
      "videoDuration",
      "duration",
      "difficulty",
      "repetitions",
      "sets",
      "restTime",
      "setId",
      "categoryId",
    ];

    requiredFields.forEach((field) => {
      console.log(`${field}: ${data.get(field)}`);
    });
    console.groupEnd();

    // არასავალდებულო ველების ლოგირება
    console.group("📎 არასავალდებულო ველები:");
    const optionalFields = [
      "subCategoryId",
      "isActive",
      "isPublished",
      "sortOrder",
    ];

    optionalFields.forEach((field) => {
      const value = data.get(field);
      console.log(`${field}: ${value || "❌ არ არის მითითებული"}`);
    });
    console.groupEnd();

    // ფაილების ლოგირება
    console.group("📁 ფაილები და URL-ები:");
    const files = data.getAll("files");
    if (files.length > 0) {
      console.group("📂 ფაილების დეტალები:");
      files.forEach((file: any, index) => {
        console.log(`ფაილი ${index + 1}:`, {
          სახელი: file.name,
          ტიპი: file.type,
          ზომა: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          ბოლოს_შეცვლილია: new Date(file.lastModified).toLocaleString(),
        });
      });
      console.groupEnd();
    } else {
      console.log("ფაილები: ❌ არ არის მითითებული");
    }

    const videoUrl = data.get("videoUrl");
    const thumbnailUrl = data.get("thumbnailUrl");

    console.log("ვიდეოს URL:", videoUrl || "❌ არ არის მითითებული");
    console.log("თამბნეილის URL:", thumbnailUrl || "❌ არ არის მითითებული");
    console.groupEnd();

    // ვალიდაციები
    validateLocalizedFields(data);
    validateRequiredFields(data);
    validateUrls(data);
    validateFiles(data);

    const response = await fetch(constructApiUrl("exercises"), {
      method: "POST",
      body: data,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Server error response:", errorData);
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
    }

    const result = await response.json();
    console.log("✅ სავარჯიშო წარმატებით შეიქმნა:", result);
    return result;
  } catch (error: any) {
    console.error("❌ შეცდომა createExercise-ში:");
    console.error("შეცდომის დეტალები:", error);
    console.error("შეცდომის მესიჯი:", error.message);
    console.error("შეცდომის სტეკი:", error.stack);
    throw error;
  } finally {
    console.groupEnd();
  }
}

export async function updateExercise(
  id: string,
  data: FormData,
): Promise<Exercise> {
  const response = await fetch(constructApiUrl(`exercises/${id}`), {
    method: "PATCH",
    body: data,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to update exercise" }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function deleteExercise(id: string): Promise<void> {
  const response = await fetch(constructApiUrl(`exercises/${id}`), {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to delete exercise" }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
}

// Get all exercises
export async function getAllExercises(): Promise<Exercise[]> {
  try {
    console.log("📤 Fetching all exercises...");
    const response = await fetch(constructApiUrl("exercises"));

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Fetched all exercises:", data.length);
    return data;
  } catch (error) {
    console.error("❌ Error fetching all exercises:", error);
    throw error;
  }
}

// Get popular exercises with filtering and sorting
export async function getPopularExercises(filters?: {
  category?: string;
  subcategory?: string;
  difficulty?: "easy" | "medium" | "hard";
  duration?: string;
  search?: string;
  limit?: number;
}): Promise<Exercise[]> {
  try {
    console.log("📤 Fetching popular exercises with filters:", filters);

    // Get all exercises first
    const allExercises = await getAllExercises();

    // Filter only published and active exercises
    let filteredExercises = allExercises.filter(
      (exercise) => exercise.isActive && exercise.isPublished,
    );

    // Apply filters
    if (filters?.category) {
      filteredExercises = filteredExercises.filter(
        (exercise) => exercise.categoryId === filters.category,
      );
    }

    if (filters?.subcategory) {
      filteredExercises = filteredExercises.filter(
        (exercise) => exercise.subCategoryId === filters.subcategory,
      );
    }

    if (filters?.difficulty) {
      filteredExercises = filteredExercises.filter(
        (exercise) => exercise.difficulty === filters.difficulty,
      );
    }

    if (filters?.duration) {
      filteredExercises = filteredExercises.filter(
        (exercise) =>
          exercise.duration?.includes(filters.duration!) ||
          exercise.videoDuration?.includes(filters.duration!),
      );
    }

    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredExercises = filteredExercises.filter(
        (exercise) =>
          exercise.name?.en?.toLowerCase().includes(searchTerm) ||
          exercise.description?.en?.toLowerCase().includes(searchTerm),
      );
    }

    // Calculate popularity score and sort by popularity
    const exercisesWithPopularity = filteredExercises.map((exercise) => {
      // Popularity calculation:
      // - Base score from existing fields (if any)
      // - Views weight: 1 point per view
      // - Likes weight: 5 points per like
      // - Rating weight: rating * 10
      // - Completion rate: completions * 3

      const views =
        (exercise as any).views || Math.floor(Math.random() * 1000) + 100; // Mock views for now
      const likes =
        (exercise as any).likes || Math.floor(Math.random() * 50) + 10; // Mock likes for now
      const rating = (exercise as any).rating || 4.0 + Math.random() * 1.0; // Mock rating 4.0-5.0
      const completions =
        (exercise as any).completions || Math.floor(Math.random() * 200) + 50; // Mock completions

      const popularityScore =
        views * 1 + likes * 5 + rating * 10 + completions * 3;

      return {
        ...exercise,
        views,
        likes,
        rating: Math.round(rating * 10) / 10, // Round to 1 decimal
        completions,
        popularityScore,
      };
    });

    // Sort by popularity score (highest first)
    exercisesWithPopularity.sort(
      (a, b) => b.popularityScore - a.popularityScore,
    );

    // Apply limit
    const limit = filters?.limit || 50;
    const popularExercises = exercisesWithPopularity.slice(0, limit);

    console.log("✅ Popular exercises calculated:", popularExercises.length);
    console.log(
      "📊 Top 3 popular exercises:",
      popularExercises.slice(0, 3).map((ex) => ({
        name: ex.name?.en,
        score: ex.popularityScore,
        views: ex.views,
        likes: ex.likes,
        rating: ex.rating,
      })),
    );

    return popularExercises;
  } catch (error) {
    console.error("❌ Error fetching popular exercises:", error);
    throw error;
  }
}

// *** POPULAR EXERCISES API ***

// Toggle single exercise popularity 💖
export async function toggleExercisePopular(
  id: string,
  isPopular: boolean,
): Promise<Exercise> {
  try {
    console.log(`💖 Toggling exercise ${id} popular to:`, isPopular);

    const url = constructApiUrl(`/exercises/${id}/popular`);
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isPopular }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ Exercise popularity updated successfully");
    return data;
  } catch (error) {
    console.error("❌ Error updating exercise popularity:", error);
    throw error;
  }
}

// Bulk update exercises popularity 🔥
export async function bulkUpdateExercisesPopular(
  exerciseIds: string[],
  isPopular: boolean,
): Promise<any> {
  try {
    console.log(
      `🔥 Bulk updating ${exerciseIds.length} exercises to popular:`,
      isPopular,
    );

    const url = constructApiUrl("/exercises/bulk/popular");
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ exerciseIds, isPopular }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ Bulk popular update successful");
    return data;
  } catch (error) {
    console.error("❌ Error in bulk popular update:", error);
    throw error;
  }
}

// Get only popular exercises 🔥
export async function getOnlyPopularExercises(filters?: {
  category?: string;
  subcategory?: string;
  difficulty?: "easy" | "medium" | "hard";
  duration?: string;
  search?: string;
  limit?: number;
  page?: number;
}): Promise<Exercise[]> {
  try {
    console.log("🔥 Fetching only popular exercises with filters:", filters);

    const params = new URLSearchParams();
    if (filters?.category) params.append("category", filters.category);
    if (filters?.subcategory) params.append("subcategory", filters.subcategory);
    if (filters?.difficulty) params.append("difficulty", filters.difficulty);
    if (filters?.duration) params.append("duration", filters.duration);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.page) params.append("page", filters.page.toString());

    const url = constructApiUrl(`/api/exercises/popular?${params.toString()}`);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Found ${data?.length || 0} popular exercises`);
    return data;
  } catch (error) {
    console.error("❌ Error fetching popular exercises:", error);
    throw error;
  }
}
