import { Course, CreateCourseData, UpdateCourseData } from '@/types/courses';

const API_BASE_URL = process.env.NODE_ENV === 'development'
  ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  : process.env.NEXT_PUBLIC_API_URL || 'https://ghrs-backend.onrender.com';

// კურსების CRUD
export async function getAllCourses(): Promise<Course[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/courses`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("getAllCourses - raw data:", data);

    // ბექენდი აბრუნებს { courses: [], total: number }
    return data.courses || [];
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw error;
  }
}

export async function getCourse(id: string): Promise<Course> {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const course = await response.json();
    console.log("getCourse - raw data:", course);

    return course;
  } catch (error) {
    console.error("Error fetching course:", error);
    throw error;
  }
}

export async function createCourse(data: CreateCourseData): Promise<Course> {
  try {
    console.log("createCourse - sending data:", data);
    
    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("createCourse - error response:", errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const course = await response.json();
    console.log("createCourse - response:", course);

    return course;
  } catch (error) {
    console.error("Error creating course:", error);
    throw error;
  }
}

export async function updateCourse(id: string, data: UpdateCourseData): Promise<Course> {
  try {
    console.log("updateCourse - sending data:", data);

    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("updateCourse - error response:", errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const course = await response.json();
    console.log("updateCourse - response:", course);

    return course;
  } catch (error) {
    console.error("Error updating course:", error);
    throw error;
  }
}

export async function deleteCourse(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("deleteCourse - error response:", errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    console.log("deleteCourse - success");
  } catch (error) {
    console.error("Error deleting course:", error);
    throw error;
  }
}

export async function toggleCourseStatus(id: string): Promise<Course> {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${id}/toggle-status`, {
      method: "PATCH",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("toggleCourseStatus - error response:", errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const course = await response.json();
    console.log("toggleCourseStatus - response:", course);

    return course;
  } catch (error) {
    console.error("Error toggling course status:", error);
    throw error;
  }
}
