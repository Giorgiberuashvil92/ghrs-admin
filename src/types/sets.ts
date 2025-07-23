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
  thumbnailImage: string;
  categoryId: string;
  price: SetPrice;
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
  image: string;
  categoryId: string;
  subCategoryId?: string;
  price: SetPrice;
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
  thumbnailImage?: string;
  price?: Partial<SetPrice>;
  levels?: Partial<SetLevels>;
  isActive?: boolean;
  isPublished?: boolean;
  isPopular?: boolean; // პოპულარობის ფლაგი
} 