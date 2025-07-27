// ინსტრუქტორების ტიპები - გამარტივებული ვერსია + ფრონტენდისთვის საჭირო ველები
export interface MultilingualContent {
  ka: string;
  en?: string;
  ru?: string;
}

// ბექენდისთვის საჭირო ფორმატი (განსხვავებულია ფრონტენდისგან)
export interface BackendInstructorData {
  name: string;                           // firstName + lastName ერთად
  email: string;
  profession: string;                     // role-ის ნაცვლად
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

// ბექენდიდან მოსული ინსტრუქტორის ტიპი
export interface Instructor {
  _id: string;
  name: string;
  email: string;
  profession: string;
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
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profession: string;
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
  email: string;
  profession: string;
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
  return {
    name: `${formData.firstName} ${formData.lastName}`.trim(),
    email: formData.email,
    profession: formData.profession,
    bio: formData.bio,
    htmlContent: formData.detailedBio, // detailedBio -> htmlContent
    profileImage: formData.profileImage,
    isActive: formData.isActive,
  };
}

// Helper ფუნქცია - ბექენდის ფორმატიდან ფრონტენდის ფორმატში გადაყვანა
export function mapFromBackendFormat(backendData: any): Instructor {
  const nameParts = backendData.name?.split(' ') || ['', ''];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return {
    _id: backendData._id || backendData.id,
    name: `${firstName} ${lastName}`.trim(),
    email: backendData.email,
    profession: backendData.profession,
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