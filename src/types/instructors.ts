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
  qualification?: string;
  wikipedia?: string;
  qualificationLocalized?: { en?: string; ru?: string; ka?: string };
  professionLocalized?: { en?: string; ru?: string; ka?: string };
  bio: MultilingualContent;
  htmlContent: MultilingualContent;       // detailedBio-ს ნაცვლად
  profileImage: string;
  isActive: boolean;
  certificates?: Array<{ url?: string }>;
  diplomas?: Array<{ url?: string }>;
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

/** ადმინის ფორმაში სერტიფიკატი (სურათის URL → API-ზე `url`) */
export interface InstructorCertificateFormItem {
  id: string;
  imageUrl: string;
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
  qualification?: string;
  wikipedia?: string;
  qualificationLocalized?: { en?: string; ru?: string; ka?: string };
  professionLocalized?: { en?: string; ru?: string; ka?: string };
  bio: MultilingualContent;
  htmlContent: MultilingualContent;
  profileImage: string;
  isActive: boolean;
  coursesCount: number;
  studentsCount: number;
  averageRating: number;
  certificates: any[];
  diplomas?: Array<{ url?: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface InstructorFormData {
  firstNameLocalized: LocalizedNameParts;
  lastNameLocalized: LocalizedNameParts;
  email: string;
  phone: string;
  profession: string;
  wikipedia: string;
  qualification: string;
  qualificationLocalized: { en: string; ru: string; ka: string };
  professionLocalized: { en: string; ru: string; ka: string };
  role: MultilingualContent;
  fullTitle: string;
  bio: MultilingualContent; 
  detailedBio: MultilingualContent; 
  profileImage: string;
  isActive: boolean;
  isVerified: boolean;
  faqContent: FAQContent[];
  certificates: InstructorCertificateFormItem[];
  diplomas: InstructorCertificateFormItem[];
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
  qualification?: string;
  wikipedia?: string;
  qualificationLocalized?: { en?: string; ru?: string; ka?: string };
  professionLocalized?: { en?: string; ru?: string; ka?: string };
  bio: MultilingualContent;
  htmlContent: MultilingualContent;
  profileImage: string;
  isActive: boolean;
  certificates?: Array<{ url?: string }>;
  diplomas?: Array<{ url?: string }>;
}

export interface UpdateInstructorData extends Partial<CreateInstructorData> {
  _id?: string;
  /** ბექენდის PATCH DTO-სთან თანხვედრაში */
  certificates?: Array<{ url?: string }>;
  diplomas?: Array<{ url?: string }>;
}

/** PATCH-ისთვის: მხოლოდ ბექენდის DTO-ს შესაბამისი ველები, სტატისტიკის/ID-ის გარეშე */
export function toInstructorUpdatePayload(
  formData: Instructor,
  displayName: string
): UpdateInstructorData {
  const fn = formData.firstNameLocalized ?? { en: '', ru: '' };
  const ln = formData.lastNameLocalized ?? { en: '', ru: '' };
  const firstNameLocalized: LocalizedNameParts = {
    en: String(fn.en ?? '').trim(),
    ru: String(fn.ru ?? '').trim(),
    ...(String(fn.ka ?? '').trim() ? { ka: String(fn.ka).trim() } : {}),
  };
  const lastNameLocalized: LocalizedNameParts = {
    en: String(ln.en ?? '').trim(),
    ru: String(ln.ru ?? '').trim(),
    ...(String(ln.ka ?? '').trim() ? { ka: String(ln.ka).trim() } : {}),
  };

  const pl = formData.professionLocalized;
  const professionLocalized =
    pl &&
    (String(pl.en ?? '').trim() || String(pl.ru ?? '').trim() || String(pl.ka ?? '').trim())
      ? {
          ...(String(pl.en ?? '').trim() ? { en: String(pl.en).trim() } : {}),
          ...(String(pl.ru ?? '').trim() ? { ru: String(pl.ru).trim() } : {}),
          ...(String(pl.ka ?? '').trim() ? { ka: String(pl.ka).trim() } : {}),
        }
      : undefined;
  const ql = formData.qualificationLocalized;
  const qualificationLocalized =
    ql &&
    (String(ql.en ?? '').trim() || String(ql.ru ?? '').trim() || String(ql.ka ?? '').trim())
      ? {
          ...(String(ql.en ?? '').trim() ? { en: String(ql.en).trim() } : {}),
          ...(String(ql.ru ?? '').trim() ? { ru: String(ql.ru).trim() } : {}),
          ...(String(ql.ka ?? '').trim() ? { ka: String(ql.ka).trim() } : {}),
        }
      : undefined;

  const payload: UpdateInstructorData = {
    name: displayName.trim(),
    firstNameLocalized,
    lastNameLocalized,
    email: formData.email.trim(),
    profession: formData.profession.trim(),
    wikipedia: String(formData.wikipedia ?? '').trim() || undefined,
    qualification:
      String(formData.qualification ?? '').trim() ||
      String(formData.qualificationLocalized?.en ?? '').trim() ||
      String(formData.qualificationLocalized?.ru ?? '').trim() ||
      undefined,
    bio: {
      ka: String(formData.bio?.ka ?? '').trim(),
      en: String(formData.bio?.en ?? '').trim(),
      ru: String(formData.bio?.ru ?? '').trim(),
    },
    htmlContent: {
      ka: String(formData.htmlContent?.ka ?? '').trim(),
      en: String(formData.htmlContent?.en ?? '').trim(),
      ru: String(formData.htmlContent?.ru ?? '').trim(),
    },
    profileImage: formData.profileImage,
    isActive: formData.isActive,
  };

  if (professionLocalized && Object.keys(professionLocalized).length > 0) {
    payload.professionLocalized = professionLocalized;
  }
  if (qualificationLocalized && Object.keys(qualificationLocalized).length > 0) {
    payload.qualificationLocalized = qualificationLocalized;
  }

  return payload;
}

export function certificateFormItemsToApi(
  items: InstructorCertificateFormItem[]
): Array<{ url?: string }> {
  return items
    .filter((c) => c.imageUrl?.trim())
    .map((c) => ({
      url: c.imageUrl.trim(),
    }));
}

export function apiCertificatesToFormItems(certs: unknown[] | undefined): InstructorCertificateFormItem[] {
  if (!Array.isArray(certs)) return [];
  return certs.map((c, i) => {
    const r = c as Record<string, unknown>;
    return {
      id: `cert-loaded-${i}`,
      imageUrl: String(r.url ?? ''),
    };
  });
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
  const certs = (formData.certificates ?? [])
    .filter((c) => c.imageUrl?.trim())
    .map((c) => ({ url: c.imageUrl.trim() }));
  const diplomas = (formData.diplomas ?? [])
    .filter((d) => d.imageUrl?.trim())
    .map((d) => ({ url: d.imageUrl.trim() }));

  return {
    name,
    firstNameLocalized: fn.en || fn.ru || fn.ka ? fn : undefined,
    lastNameLocalized: ln.en || ln.ru || ln.ka ? ln : undefined,
    email: formData.email,
    profession: formData.profession || formData.professionLocalized?.en || formData.professionLocalized?.ru || '',
    wikipedia: formData.wikipedia?.trim() || undefined,
    qualification:
      formData.qualification?.trim() ||
      formData.qualificationLocalized?.en?.trim() ||
      formData.qualificationLocalized?.ru?.trim() ||
      undefined,
    qualificationLocalized:
      formData.qualificationLocalized &&
      (formData.qualificationLocalized.en?.trim() ||
        formData.qualificationLocalized.ru?.trim() ||
        formData.qualificationLocalized.ka?.trim())
        ? {
            en: formData.qualificationLocalized.en?.trim() || undefined,
            ru: formData.qualificationLocalized.ru?.trim() || undefined,
            ka: formData.qualificationLocalized.ka?.trim() || undefined,
          }
        : undefined,
    professionLocalized: professionLocalized && (professionLocalized.en || professionLocalized.ru || professionLocalized.ka) ? professionLocalized : undefined,
    bio: formData.bio,
    htmlContent: formData.detailedBio, // detailedBio -> htmlContent
    profileImage: formData.profileImage,
    isActive: formData.isActive,
    ...(certs.length ? { certificates: certs } : {}),
    ...(diplomas.length ? { diplomas } : {}),
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
    wikipedia: backendData.wikipedia,
    qualification: backendData.qualification,
    qualificationLocalized: backendData.qualificationLocalized,
    professionLocalized: backendData.professionLocalized,
    bio: backendData.bio,
    htmlContent: backendData.htmlContent, // htmlContent -> detailedBio
    profileImage: backendData.profileImage,
    isActive: backendData.isActive,
    coursesCount: backendData.coursesCount || 0,
    studentsCount: backendData.studentsCount || 0,
    averageRating: backendData.averageRating || 0,
    certificates: backendData.certificates || [],
    diplomas: backendData.diplomas || [],
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