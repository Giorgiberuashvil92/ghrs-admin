import { 
  Instructor, 
  CreateInstructorData, 
  UpdateInstructorData, 
  InstructorOption,
} from '@/types/instructors';

const API_BASE_URL = process.env.NODE_ENV === 'development'
  ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  : process.env.NEXT_PUBLIC_API_URL || 'https://ghrs-backend.onrender.com';

// Instructors CRUD
export async function getAllInstructors(): Promise<Instructor[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/instructors`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("getAllInstructors - raw data:", data);

    // ბექენდი აბრუნებს { instructors: [], total: number }
    return data.instructors || [];
  } catch (error) {
    console.error("Error fetching instructors:", error);
    throw error;
  }
}

export async function getInstructor(id: string): Promise<Instructor> {
  try {
    const response = await fetch(`${API_BASE_URL}/instructors/${id}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const instructor = await response.json();
    console.log("getInstructor - raw data:", instructor);

    return instructor;
  } catch (error) {
    console.error("Error fetching instructor:", error);
    throw error;
  }
}

export async function createInstructor(data: CreateInstructorData): Promise<Instructor> {
  try {
    console.log("createInstructor - sending data:", data);
    
    const response = await fetch(`${API_BASE_URL}/instructors`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("createInstructor - error response:", errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const instructor = await response.json();
    console.log("createInstructor - response:", instructor);

    return instructor;
  } catch (error) {
    console.error("Error creating instructor:", error);
    throw error;
  }
}

export async function updateInstructor(id: string, data: UpdateInstructorData): Promise<Instructor> {
  try {
    console.log("updateInstructor - sending data:", data);

    const response = await fetch(`${API_BASE_URL}/instructors/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("updateInstructor - error response:", errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const instructor = await response.json();
    console.log("updateInstructor - response:", instructor);

    return instructor;
  } catch (error) {
    console.error("Error updating instructor:", error);
    throw error;
  }
}

export async function deleteInstructor(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/instructors/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("deleteInstructor - error response:", errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    console.log("deleteInstructor - success");
  } catch (error) {
    console.error("Error deleting instructor:", error);
    throw error;
  }
}

export async function toggleInstructorStatus(id: string): Promise<Instructor> {
  try {
    const response = await fetch(`${API_BASE_URL}/instructors/${id}/toggle-status`, {
      method: "PATCH",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("toggleInstructorStatus - error response:", errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const instructor = await response.json();
    console.log("toggleInstructorStatus - response:", instructor);

    return instructor;
  } catch (error) {
    console.error("Error toggling instructor status:", error);
    throw error;
  }
}

// Dropdown option-ებისთვის
export async function getInstructorsDropdown(): Promise<InstructorOption[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/instructors/dropdown`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("getInstructorsDropdown - raw data:", data);

    return data.instructors || [];
  } catch (error) {
    console.error("Error fetching instructors dropdown:", error);
    throw error;
  }
} 