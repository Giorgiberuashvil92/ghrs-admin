export interface MultilingualContent {
  en: string;
  ru: string;
}

export interface CourseReview {
  userId: string;
  text: string;
  rating: number;
  createdAt: string;
}

export interface VideoReview {
  title: string;
  videoUrl: string;
  thumbnail: string;
  authorName: string;
}

export interface CourseInstructor {
  name: string;
  profession?: string;
  image?: string;
  bio?: MultilingualContent;
}

export interface CourseSyllabus {
  title: MultilingualContent;
  description: MultilingualContent;
  duration?: number; // გავხადოთ ოფციონალური
}

export interface CourseAnnouncement {
  title: MultilingualContent;
  content: MultilingualContent;
  isActive: boolean;
}

export interface Course {
  id: string;
  title: MultilingualContent;
  description: MultilingualContent;
  shortDescription: MultilingualContent;
  announcements: CourseAnnouncement[]; // ცვლილება: ერთი ველის ნაცვლად მასივი
  price: number;
  thumbnail: string;
  additionalImages: string[];
  advertisementImage: string; // რეკლამის სურათი
  previewVideoUrl?: string;
  duration?: number; // გავხადოთ ოფციონალური
  isPublished: boolean;
  instructor: CourseInstructor;
  prerequisites: MultilingualContent;
  certificateDescription: MultilingualContent;
  certificateImages: string[]; // დავამატოთ სერტიფიკატების სურათების მასივი
  learningOutcomes: MultilingualContent[];
  syllabus: CourseSyllabus[];
  languages: string[];
  tags: string[];
  rating: number;
  reviews: CourseReview[];
  videoReviews: VideoReview[];
  relatedCourses: string[];
  categoryId: string;
  subcategoryId?: string;
  createdAt: string;
  updatedAt: string;
  startDate: string;
  endDate?: string;
  studentsCount?: number;
}

export interface CourseFormData extends Omit<Course, 'id' | 'rating' | 'reviews' | 'videoReviews' | 'relatedCourses' | 'createdAt' | 'updatedAt'> {
  // Form specific fields can be added here
}

// კურსის შექმნის მონაცემების ტიპი (ბექენდზე გასაგზავნი)
export interface CreateCourseData extends CourseFormData {}

// კურსის განახლების მონაცემების ტიპი (ბექენდზე გასაგზავნი)
export interface UpdateCourseData extends Partial<CourseFormData> {
  _id?: string;
}

// კურსების API პასუხის ტიპი
export interface CoursesResponse {
  courses: Course[];
  total: number;
} 