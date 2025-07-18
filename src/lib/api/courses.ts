// Course type definitions
export interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  duration?: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  instructor?: string | { _id: string; name: string; email: string; };
  category: string | { _id: string; name: string; };
  subcategory?: string | { _id: string; name: string; };
  language: 'georgian' | 'english';
  tags?: string[];
  requirements?: string[];
  objectives?: string[];
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
  lessonsCount?: number;
  studentsCount?: number;
  rating?: number;
  reviewsCount?: number;
}

export interface CourseLesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  videoUrl?: string;
  duration?: number;
  order: number;
  exercises?: string[];
  materials?: string[];
  transcript?: string;
  isCompleted?: boolean;
}

export interface CourseReview {
  id: string;
  courseId: string;
  userId: string;
  userName?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CourseCategory {
  id: string;
  name: string;
  description?: string;
  coursesCount?: number;
}

// API Types for requests
export type CreateCourseData = {
  title: string;
  description: string;
  instructor: string;
  image: string;
  price: number;
  duration: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  language: 'georgian' | 'english';
  category: string;
  subcategory?: string;
  tags: string[];
  requirements: string[];
  objectives: string[];
  isPublished: boolean;
};

type UpdateCourseData = Partial<CreateCourseData>;

type CreateLessonData = {
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  order: number;
  exercises?: string[];
  materials?: string[];
  transcript?: string;
};

type UpdateLessonData = Partial<CreateLessonData>;

type CreateReviewData = {
  rating: number;
  comment: string;
  userId: string;
};

const API_BASE_URL = "http://localhost:4000/api";

// Courses CRUD
export async function getAllCourses(): Promise<Course[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/courses`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.map((course: any) => ({
      id: course._id || course.id,
      title: course.title,
      description: course.description,
      image: course.image || course.imageUrl || '',
      price: course.price || 0,
      duration: course.duration,
      level: course.level || 'beginner',
      instructor: course.instructor,
      category: course.category,
      subcategory: course.subcategory,
      language: course.language || 'georgian',
      tags: course.tags || [],
      requirements: course.requirements || [],
      objectives: course.objectives || [],
      isPublished: course.isPublished || false,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      lessonsCount: course.lessonsCount || 0,
      studentsCount: course.studentsCount || 0,
      rating: course.rating || 0,
      reviewsCount: course.reviewsCount || 0
    }));
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
}

// კურსების ძიება
export async function searchCourses(query: string): Promise<Course[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/search?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.map((course: any) => ({
      id: course._id || course.id,
      title: course.title,
      description: course.description,
      image: course.image || course.imageUrl || '',
      price: course.price || 0,
      duration: course.duration,
      level: course.level || 'beginner',
      instructor: course.instructor,
      category: course.category,
      subcategory: course.subcategory,
      language: course.language || 'georgian',
      tags: course.tags || [],
      requirements: course.requirements || [],
      objectives: course.objectives || [],
      isPublished: course.isPublished || false,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      lessonsCount: course.lessonsCount || 0,
      studentsCount: course.studentsCount || 0,
      rating: course.rating || 0,
      reviewsCount: course.reviewsCount || 0
    }));
  } catch (error) {
    console.error('Error searching courses:', error);
    throw error;
  }
}

export async function getCourse(id: string): Promise<Course> {
  try {
    // ჯერ admin endpoint ვცადოთ
    const response = await fetch(`${API_BASE_URL}/courses/admin/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const course = await response.json();
    console.log('getCourse - ნეტვორკიდან მიღებული raw მონაცემები:', course);
    console.log('getCourse - course.instructor:', course.instructor);
    console.log('getCourse - course.category:', course.category);
    console.log('getCourse - course.subcategory:', course.subcategory);
    
    return {
      id: course._id || course.id,
      title: course.title,
      description: course.description,
      image: course.image || '',
      price: course.price || 0,
      duration: course.duration,
      level: course.level || 'beginner',
      instructor: course.instructor, // სრული ობიექტი შევინარჩუნოთ
      category: course.category, // სრული ობიექტი შევინარჩუნოთ
      subcategory: course.subcategory, // სრული ობიექტი შევინარჩუნოთ
      language: course.language || 'georgian',
      tags: course.tags || [],
      requirements: course.requirements || [],
      objectives: course.objectives || [],
      isPublished: course.isPublished || false,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      lessonsCount: course.lessonsCount || 0,
      studentsCount: course.studentsCount || 0,
      rating: course.rating || 0,
      reviewsCount: course.reviewsCount || 0
    };
  } catch (error) {
    console.error('Error fetching course:', error);
    throw error;
  }
}

export async function createCourse(data: CreateCourseData): Promise<Course> {
  try {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const course = await response.json();
    return {
      id: course._id || course.id,
      title: course.title,
      description: course.description,
      image: course.image || course.imageUrl || '',
      price: course.price || 0,
      duration: course.duration,
      level: course.level || 'beginner',
      instructor: course.instructor,
      category: course.category,
      subcategory: course.subcategory,
      language: course.language || 'georgian',
      tags: course.tags || [],
      requirements: course.requirements || [],
      objectives: course.objectives || [],
      isPublished: course.isPublished || false,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      lessonsCount: course.lessonsCount || 0,
      studentsCount: course.studentsCount || 0,
      rating: course.rating || 0,
      reviewsCount: course.reviewsCount || 0
    };
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
}

export async function updateCourse(id: string, data: UpdateCourseData): Promise<Course> {
  try {
    console.log('updateCourse - courseId:', id);
    console.log('updateCourse - request data:', JSON.stringify(data, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data)
    });
    
    console.log('updateCourse - response status:', response.status);
    console.log('updateCourse - response ok:', response.ok);

    if (!response.ok) {
      // Response body-ს ვნახოთ რა შეცდომაა
      const errorText = await response.text();
      console.error('updateCourse - error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const course = await response.json();
    return {
      id: course._id || course.id,
      title: course.title,
      description: course.description,
      image: course.image || course.imageUrl || '',
      price: course.price || 0,
      duration: course.duration,
      level: course.level || 'beginner',
      instructor: course.instructor,
      category: course.category,
      subcategory: course.subcategory,
      language: course.language || 'georgian',
      tags: course.tags || [],
      requirements: course.requirements || [],
      objectives: course.objectives || [],
      isPublished: course.isPublished || false,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      lessonsCount: course.lessonsCount || 0,
      studentsCount: course.studentsCount || 0,
      rating: course.rating || 0,
      reviewsCount: course.reviewsCount || 0
    };
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
}

export async function deleteCourse(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
}

// ადმინისტრაციის ფუნქციები
export async function getAllCoursesAdmin(): Promise<Course[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/admin/all`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.map((course: any) => ({
      id: course._id || course.id,
      title: course.title,
      description: course.description,
      image: course.image || course.imageUrl || '',
      price: course.price || 0,
      duration: course.duration,
      level: course.level || 'beginner',
      instructor: course.instructor,
      category: course.category,
      subcategory: course.subcategory,
      language: course.language || 'georgian',
      tags: course.tags || [],
      requirements: course.requirements || [],
      objectives: course.objectives || [],
      isPublished: course.isPublished || false,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      lessonsCount: course.lessonsCount || 0,
      studentsCount: course.studentsCount || 0,
      rating: course.rating || 0,
      reviewsCount: course.reviewsCount || 0
    }));
  } catch (error) {
    console.error('Error fetching admin courses:', error);
    throw error;
  }
}

export async function toggleCoursePublish(id: string): Promise<Course> {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/admin/${id}/toggle`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const course = await response.json();
    return {
      id: course._id || course.id,
      title: course.title,
      description: course.description,
      image: course.image || course.imageUrl || '',
      price: course.price || 0,
      duration: course.duration,
      level: course.level || 'beginner',
      instructor: course.instructor,
      category: course.category,
      subcategory: course.subcategory,
      language: course.language || 'georgian',
      tags: course.tags || [],
      requirements: course.requirements || [],
      objectives: course.objectives || [],
      isPublished: course.isPublished || false,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      lessonsCount: course.lessonsCount || 0,
      studentsCount: course.studentsCount || 0,
      rating: course.rating || 0,
      reviewsCount: course.reviewsCount || 0
    };
  } catch (error) {
    console.error('Error toggling course publish status:', error);
    throw error;
  }
}

// Course Lessons CRUD
export async function getCourseLessons(courseId: string): Promise<CourseLesson[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/lessons`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.map((lesson: any) => ({
      id: lesson._id || lesson.id,
      courseId: lesson.courseId,
      title: lesson.title,
      description: lesson.description,
      videoUrl: lesson.videoUrl,
      duration: lesson.duration,
      order: lesson.order,
      exercises: lesson.exercises || [],
      materials: lesson.materials || [],
      transcript: lesson.transcript,
      isCompleted: lesson.isCompleted || false
    }));
  } catch (error) {
    console.error('Error fetching course lessons:', error);
    throw error;
  }
}

export async function createLesson(courseId: string, data: CreateLessonData): Promise<CourseLesson> {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/lessons`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const lesson = await response.json();
    return {
      id: lesson._id || lesson.id,
      courseId: lesson.courseId,
      title: lesson.title,
      description: lesson.description,
      videoUrl: lesson.videoUrl,
      duration: lesson.duration,
      order: lesson.order,
      exercises: lesson.exercises || [],
      materials: lesson.materials || [],
      transcript: lesson.transcript,
      isCompleted: lesson.isCompleted || false
    };
  } catch (error) {
    console.error('Error creating lesson:', error);
    throw error;
  }
}

export async function updateLesson(courseId: string, lessonId: string, data: UpdateLessonData): Promise<CourseLesson> {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/lessons/${lessonId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const lesson = await response.json();
    return {
      id: lesson._id || lesson.id,
      courseId: lesson.courseId,
      title: lesson.title,
      description: lesson.description,
      videoUrl: lesson.videoUrl,
      duration: lesson.duration,
      order: lesson.order,
      exercises: lesson.exercises || [],
      materials: lesson.materials || [],
      transcript: lesson.transcript,
      isCompleted: lesson.isCompleted || false
    };
  } catch (error) {
    console.error('Error updating lesson:', error);
    throw error;
  }
}

export async function deleteLesson(courseId: string, lessonId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/lessons/${lessonId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting lesson:', error);
    throw error;
  }
}

// Course Reviews
export async function getCourseReviews(courseId: string): Promise<CourseReview[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/reviews`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.map((review: any) => ({
      id: review._id || review.id,
      courseId: review.courseId,
      userId: review.userId,
      userName: review.userName,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt
    }));
  } catch (error) {
    console.error('Error fetching course reviews:', error);
    throw error;
  }
}

export async function createCourseReview(courseId: string, data: CreateReviewData): Promise<CourseReview> {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const review = await response.json();
    return {
      id: review._id || review.id,
      courseId: review.courseId,
      userId: review.userId,
      userName: review.userName,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt
    };
  } catch (error) {
    console.error('Error creating course review:', error);
    throw error;
  }
}

// Course Categories
export async function getCourseCategories(): Promise<CourseCategory[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.map((category: any) => ({
      id: category._id || category.id,
      name: category.name,
      description: category.description,
      coursesCount: category.coursesCount || 0
    }));
  } catch (error) {
    console.error('Error fetching course categories:', error);
    throw error;
  }
}

// Category interface for the API response
export interface Category {
  _id: string;
  name: string;
  description: string;
  image: string;
  parentId: string | null;
  level: number;
  isActive: boolean;
  sortOrder: number;
  exercises: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Categories API functions
export async function getAllCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

// ინსტრუქტორების interface
export interface Instructor {
  _id: string;
  name: string;
  email: string;
  bio?: string;
  image?: string;
  specialties?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ინსტრუქტორების dropdown-ისთვის
export async function getInstructorsDropdown(): Promise<Instructor[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/instructors/dropdown`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('getInstructorsDropdown - raw data:', data);
    
    // ბეკენდმა შესაძლოა id უბრუნოს _id-ის ნაცვლად
    return data.map((instructor: any) => ({
      _id: instructor._id || instructor.id,
      name: instructor.name,
      email: instructor.email,
      bio: instructor.bio,
      image: instructor.image,
      specialties: instructor.specialties,
      isActive: instructor.isActive,
      createdAt: instructor.createdAt,
      updatedAt: instructor.updatedAt
    }));
  } catch (error) {
    console.error('Error fetching instructors dropdown:', error);
    throw error;
  }
}

// კატეგორიების dropdown-ისთვის  
export async function getCategoriesDropdown(): Promise<{id: string, name: string}[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/course-categories/dropdown`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching categories dropdown:', error);
    throw error;
  }
}

// სუბკატეგორიების dropdown-ისთვის
export async function getSubcategoriesDropdown(categoryId: string): Promise<{id: string, name: string, categoryId: string}[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/course-categories/${categoryId}/subcategories/dropdown`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching subcategories dropdown:', error);
    throw error;
  }
}

// კატეგორიები სუბკატეგორიებთან ერთად
export async function getCategoriesWithSubcategories(): Promise<{id: string, name: string, subcategories: {id: string, name: string}[]}[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/course-categories/with-subcategories-dropdown`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching categories with subcategories:', error);
    throw error;
  }
} 