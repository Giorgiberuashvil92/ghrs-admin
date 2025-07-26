import { LocalizedString } from "./categories";

interface SetPrice {
  monthly: number;
  threeMonths: number;
  sixMonths: number;
  yearly: number;
}

interface LevelData {
  exerciseCount: number;
  isLocked: boolean;
}

interface SetLevels {
  beginner: LevelData;
  intermediate: LevelData;
  advanced: LevelData;
}

export interface Set {
  _id: string;
  name: LocalizedString;
  description?: LocalizedString;
  recommendations?: LocalizedString;
  additional?: LocalizedString;
  thumbnailImage: string;
  demoVideoUrl?: string;
  duration?: string;
  difficulty?: "easy" | "medium" | "hard";
  equipment?: LocalizedString;
  warnings?: LocalizedString;
  categoryId: string;
  price: SetPrice;
  discountedPrice?: SetPrice;
  levels: SetLevels;
  isActive: boolean;
  isPublished: boolean;
  isPopular?: boolean; // პოპულარობის ფლაგი
  createdAt: string;
  updatedAt: string;
}

export interface CreateSetData {
  name: LocalizedString;
  description?: LocalizedString;
  recommendations?: LocalizedString;
  additional?: LocalizedString;
  image: string;
  demoVideoUrl?: string;
  duration?: string;
  difficulty?: "easy" | "medium" | "hard";
  equipment?: LocalizedString;
  warnings?: LocalizedString;
  categoryId: string;
  subCategoryId?: string;
  price: SetPrice;
  discountedPrice?: SetPrice;
  levels: SetLevels;
  isActive: boolean;
  isPublished: boolean;
  isPopular?: boolean; // პოპულარობის ფლაგი
}

export type CreateSetRequest = {
  formData: CreateSetData | FormData;
  isFormData: boolean;
};

export interface UpdateSetData {
  name?: LocalizedString;
  description?: LocalizedString;
  recommendations?: LocalizedString;
  additional?: LocalizedString;
  thumbnailImage?: string;
  demoVideoUrl?: string;
  duration?: string;
  difficulty?: "easy" | "medium" | "hard";
  equipment?: LocalizedString;
  warnings?: LocalizedString;
  price?: Partial<SetPrice>;
  discountedPrice?: Partial<SetPrice>;
  levels?: Partial<SetLevels>;
  isActive?: boolean;
  isPublished?: boolean;
  isPopular?: boolean; // პოპულარობის ფლაგი
} 