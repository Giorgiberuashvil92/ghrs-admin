// ინსტრუქტორების ტიპები - გამარტივებული ვერსია + ფრონტენდისთვის საჭირო ველები
export interface MultilingualContent {
  ka: string;
  en?: string;
  ru?: string;
}

// ბექენდისთვის საჭირო ფორმატი (განსხვავებულია ფრონტენდისგან)
export interface BackendInstructorData {
  name: string;                           // buildInstructorDisplayName — dropdown / კურსები
  firstNameLocalized?: LocalizedNameParts;
  lastNameLocalized?: LocalizedNameParts;
  email: string;
  profession: string;                     // role-ის ნაცვლად
  professionLocalized?: { en?: string; ru?: string; ka?: string };
  bio: MultilingualContent;
  htmlContent: MultilingualContent;       // detailedBio-ს ნაცვლად
  profileImage: string;
  isActive: boolean;
}

// სასწავლო სტატისტიკა
export interface TeachingStats {
  coursesCount: number;
  certificatesCount: number;
  webinarsCount: number;
  studentsCount: number;
  averageRating: number;
  totalReviews: number;
  totalRevenue: number;
}

// FAQ კონტენტი ინსტრუქტორის გვერდისთვის
export interface FAQContent {
  id: string;
  question: MultilingualContent;
  answer: MultilingualContent;
  order: number;
}

export type LocalizedNameParts = { en: string; ru: string; ka?: string };

/** სრული სახელი კურსების dropdown-ისთვის: ჯერ EN სახელი+გვარი, შემდეგ RU */
export function buildInstructorDisplayName(
  first?: LocalizedNameParts | null,
  last?: LocalizedNameParts | null,
  fallbackName?: string
): string {
  const en = [first?.en, last?.en].filter((x) => (x || "").trim()).join(" ").trim();
  if (en) return en;
  const ru = [first?.ru, last?.ru].filter((x) => (x || "").trim()).join(" ").trim();
  if (ru) return ru;
  const ka = [first?.ka, last?.ka].filter((x) => (x || "").trim()).join(" ").trim();
  if (ka) return ka;
  return (fallbackName || "").trim();
}

/** ძველი ერთიანი `name` → EN ველებში (რუსული ცარიელი, შეავსებს მომხმარებელი) */
export function legacyFullNameToLocalizedParts(full: string): {
  firstNameLocalized: LocalizedNameParts;
  lastNameLocalized: LocalizedNameParts;
} {
  const t = full.trim();
  if (!t) {
    return {
      firstNameLocalized: { en: "", ru: "" },
      lastNameLocalized: { en: "", ru: "" },
    };
  }
  const parts = t.split(/\s+/);
  if (parts.length === 1) {
    return {
      firstNameLocalized: { en: parts[0], ru: "" },
      lastNameLocalized: { en: "", ru: "" },
    };
  }
  return {
    firstNameLocalized: { en: parts[0], ru: "" },
    lastNameLocalized: { en: parts.slice(1).join(" "), ru: "" },
  };
}

/** მინიმუმ ერთ ენაზე სრული წყვილი (სახელი + გვარი) */
export function hasCompleteLocalizedNamePair(first: LocalizedNameParts, last: LocalizedNameParts): boolean {
  const enOk =
    (first.en || "").trim().length > 0 && (last.en || "").trim().length > 0;
  const ruOk =
    (first.ru || "").trim().length > 0 && (last.ru || "").trim().length > 0;
  return enOk || ruOk;
}

// ბექენდიდან მოსული ინსტრუქტორის ტიპი
export interface Instructor {
  _id: string;
  name: string;
  firstNameLocalized?: LocalizedNameParts;
  lastNameLocalized?: LocalizedNameParts;
  email: string;
  profession: string;
  professionLocalized?: { en?: string; ru?: string; ka?: string };
  bio: MultilingualContent;
  htmlContent: MultilingualContent;
  profileImage: string;
  isActive: boolean;
  coursesCount: number;
  studentsCount: number;
  averageRating: number;
  certificates: any[];
  createdAt: string;
  updatedAt: string;
}

export interface InstructorFormData {
  firstNameLocalized: LocalizedNameParts;
  lastNameLocalized: LocalizedNameParts;
  email: string;
  phone: string;
  profession: string;
  professionLocalized: { en: string; ru: string; ka: string };
  role: MultilingualContent;
  fullTitle: string;
  bio: MultilingualContent; // მოკლე ბიოგრაფია
  detailedBio: MultilingualContent; // დეტალური ბიოგრაფია
  profileImage: string;
  isActive: boolean;
  isVerified: boolean;
  faqContent: FAQContent[];
}

// Dropdown-ისთვის გამარტივებული ტიპი
export interface InstructorOption {
  _id: string;
  name: string;
  email: string;
  profession: string;
  profileImage: string;
  isActive: boolean;
  coursesCount: number;
  studentsCount: number;
  averageRating: number;
}

export interface InstructorCourse {
  id: string;
  title: MultilingualContent;
  description: MultilingualContent;
  thumbnail: string;
  duration: number;
  studentsCount: number;
  price: number;
  rating: number;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
}

export interface InstructorsResponse {
  instructors: Instructor[];
  total: number;
  page: number;
  limit: number;
}

// ბექენდზე გასაგზავნი მონაცემების ტიპი
export interface CreateInstructorData {
  name: string;
  firstNameLocalized?: LocalizedNameParts;
  lastNameLocalized?: LocalizedNameParts;
  email: string;
  profession: string;
  professionLocalized?: { en?: string; ru?: string; ka?: string };
  bio: MultilingualContent;
  htmlContent: MultilingualContent;
  profileImage: string;
  isActive: boolean;
}

export interface UpdateInstructorData extends Partial<CreateInstructorData> {
  _id?: string;
}

// Helper ფუნქცია - ფრონტენდის ფორმატიდან ბექენდის ფორმატში გადაყვანა
export function mapToBackendFormat(formData: InstructorFormData): BackendInstructorData {
  const professionLocalized = formData.professionLocalized
    ? {
        en: formData.professionLocalized.en?.trim() || undefined,
        ru: formData.professionLocalized.ru?.trim() || undefined,
        ka: formData.professionLocalized.ka?.trim() || undefined,
      }
    : undefined;
  const fn = {
    en: formData.firstNameLocalized?.en?.trim() || "",
    ru: formData.firstNameLocalized?.ru?.trim() || "",
    ka: formData.firstNameLocalized?.ka?.trim() || "",
  };
  const ln = {
    en: formData.lastNameLocalized?.en?.trim() || "",
    ru: formData.lastNameLocalized?.ru?.trim() || "",
    ka: formData.lastNameLocalized?.ka?.trim() || "",
  };
  const name = buildInstructorDisplayName(fn, ln);
  return {
    name,
    firstNameLocalized: fn.en || fn.ru || fn.ka ? fn : undefined,
    lastNameLocalized: ln.en || ln.ru || ln.ka ? ln : undefined,
    email: formData.email,
    profession: formData.profession || formData.professionLocalized?.en || formData.professionLocalized?.ru || '',
    professionLocalized: professionLocalized && (professionLocalized.en || professionLocalized.ru || professionLocalized.ka) ? professionLocalized : undefined,
    bio: formData.bio,
    htmlContent: formData.detailedBio, // detailedBio -> htmlContent
    profileImage: formData.profileImage,
    isActive: formData.isActive,
  };
}

// Helper ფუნქცია - ბექენდის ფორმატიდან ფრონტენდის ფორმატში გადაყვანა
export function mapFromBackendFormat(backendData: any): Instructor {
  return {
    _id: backendData._id || backendData.id,
    name: backendData.name || '',
    firstNameLocalized: backendData.firstNameLocalized ?? { en: '', ru: '' },
    lastNameLocalized: backendData.lastNameLocalized ?? { en: '', ru: '' },
    email: backendData.email,
    profession: backendData.profession,
    professionLocalized: backendData.professionLocalized,
    bio: backendData.bio,
    htmlContent: backendData.htmlContent, // htmlContent -> detailedBio
    profileImage: backendData.profileImage,
    isActive: backendData.isActive,
    coursesCount: backendData.coursesCount || 0,
    studentsCount: backendData.studentsCount || 0,
    averageRating: backendData.averageRating || 0,
    certificates: backendData.certificates || [],
    createdAt: backendData.createdAt,
    updatedAt: backendData.updatedAt,
  };
}

// ეს ტიპები თუ მომავალში სჭირდება, ცალკე შეიძლება დაემატოს
export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  youtube?: string;
  website?: string;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear?: number;
  isActive: boolean;
  description?: string;
}

export interface Certificate {
  name: string;
  issuer: string;
  dateIssued: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface WorkExperience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  isCurrentRole: boolean;
  description?: string;
  responsibilities: string[];
} 