// ახალი ტიპები 4-დონიანი სისტემისთვის
export interface LocalizedString {
  en?: string;
  ru?: string;
}

export interface Category {
  id: string;
  name: LocalizedString;
  description?: LocalizedString;
  image?: string;
  isActive: boolean;
  isPublished: boolean;
  sortOrder: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubCategory {
  id: string;
  categoryId: string;
  name: LocalizedString;
  description?: LocalizedString;
  image?: string;
  isActive: boolean;
  isPublished: boolean;
  sortOrder: string;
  createdAt: string;
  updatedAt: string;
}

export interface Set {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  totalExercises: number;
  totalDuration: string;
  difficultyLevels: number;
  thumbnailImage: string | null;
  price: {
    monthly: number;
    threeMonths: number;
    sixMonths: number;
    yearly: number;
  };
  isActive: boolean;
  isPublished: boolean;
  sortOrder: number;
  categoryId: string;
  subCategoryId?: string;
  levels: {
    beginner: {
      exerciseCount: number;
      isLocked: boolean;
    };
    intermediate: {
      exerciseCount: number;
      isLocked: boolean;
    };
    advanced: {
      exerciseCount: number;
      isLocked: boolean;
    };
  };
}

export interface SetFormData {
  name: LocalizedString;
  description: LocalizedString;
  thumbnailImage: File | null;
  price: {
    monthly: string;
    threeMonths: string;
    sixMonths: string;
    yearly: string;
  };
  isActive: boolean;
  isPublished: boolean;
  sortOrder: string;
  categoryId: string;
  subCategoryId?: string;
}

export interface Exercise {
  id?: string;
  name: LocalizedString;
  description: LocalizedString;
  
  // ვიდეო და სურათი
  videoFile: File | string | null;
  thumbnailImage: File | string | null;
  videoDuration: string; // format: "MM:SS"
  
  // სავარჯიშოს დეტალები
  duration: string; // format: "MM:SS"
  difficulty: "easy" | "medium" | "hard";
  repetitions: string;
  sets: string;
  restTime: string; // format: "MM:SS"
  
  // სტატუსები
  isActive: boolean;
  isPublished: boolean;
  isPopular?: boolean; // 💖 Manual popular flag for admin
  sortOrder: any;
  
  // კავშირები
  setId: string;
  categoryId: string;
  subCategoryId?: string;
}

export interface Complex {
  _id: string;
  subCategoryId: string;
  name: LocalizedString;
  description?: LocalizedString;
  image?: string;
  isActive: boolean;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  totalDuration: number;
  requiredEquipment: string[];
  generalInstructions: string;
  breathingGuidelines: string;
  recommendedFrequency: string;
  exercises: Exercise[];
  imageUrl?: string;
  // GHRS-დან ახალი ველები
  exerciseCount?: number;
  targetCondition?: string;
  price?: number;
  subscriptionPeriods?: {
    oneMonth: number;
    threeMonths: number;
    sixMonths: number;
  };
  demoVideoUrl?: string;
  relatedComplexes?: string[];
}

export interface SubCategory {
  _id: string;
  categoryId: string;
  name: LocalizedString;
  description?: LocalizedString;
  image?: string;
  isActive: boolean;
  isPublished: boolean;
  sortOrder: any;
  createdAt: string;
  updatedAt: string;
  complexes: Complex[];
}

export interface Category {
  _id: string;
  name: LocalizedString;
  description?: LocalizedString;
  image?: string;
  isActive: boolean;
  isPublished: boolean;
  sortOrder: any;
  createdAt: string;
  updatedAt: string;
  subcategories: SubCategory[];
}

// ფორმის მონაცემების ტიპები
// კატეგორიის შექმნის/რედაქტირების ფორმის მონაცემების ტიპი
export type CategoryFormData = {
  name: string;
  description: string;
  image: File | null;
};

// ქვეკატეგორიის შექმნის/რედაქტირების ფორმის მონაცემების ტიპი
export type SubCategoryFormData = {
  name: string;
  description: string;
  image: File | null;
};

// კომპლექსის შექმნის/რედაქტირების ფორმის მონაცემების ტიპი
export type ComplexFormData = {
  name: string;
  description: string;
  image: File | null;
  difficulty: 'easy' | 'medium' | 'hard';
};

export interface ExerciseFormData {
  name: LocalizedString;
  description: LocalizedString;
  videoFile: File | null;
  thumbnailImage: File | null;
  videoDuration: string;
  duration: string;
  difficulty: 'easy' | 'medium' | 'hard';
  repetitions: string;
  sets: string;
  restTime: string;
  isActive: boolean;
  isPublished: boolean;
  isPopular?: boolean; // 💖 Manual popular flag for forms
  sortOrder: any;
  setId: string;
  categoryId: string;
  subCategoryId?: string;
} 