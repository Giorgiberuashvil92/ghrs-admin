import { NextRequest, NextResponse } from "next/server";

const isValidObjectId = (id: string) => /^[a-f\d]{24}$/i.test(id);

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

interface LocalizedField {
  ka: string;
  en: string;
  ru: string;
}

interface ExerciseData {
  name: LocalizedField;
  description: LocalizedField;
  recommendations: LocalizedField;
  videoUrl?: string;
  thumbnailUrl?: string;
  videoDuration: string;
  duration: string;
  difficulty: string;
  repetitions: string;
  sets: string;
  restTime: string;
  isActive: boolean;
  isPublished: boolean;
  sortOrder: number;
  setId: string;
  categoryId: string;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    console.log('Received form data fields:', Array.from(formData.keys()));
    
    // შევამოწმოთ setId და categoryId
    const setId = formData.get('setId') as string;
    const categoryId = formData.get('categoryId') as string;

    console.log('IDs:', { setId, categoryId });

    if (!isValidObjectId(setId) || !isValidObjectId(categoryId)) {
      return NextResponse.json(
        { error: "Invalid setId or categoryId" },
        { status: 400 }
      );
    }

    // მივიღოთ ფაილები ან URL-ები
    const videoFile = formData.get('videoFile');
    const thumbnailFile = formData.get('thumbnailFile');
    const videoUrl = formData.get('videoUrl');
    const thumbnailUrl = formData.get('thumbnailUrl');
    
    const backendFormData = new FormData();

    console.log('Files/URLs:', {
      videoFile: videoFile instanceof File ? `File: ${videoFile.name}` : 'No video file',
      thumbnailFile: thumbnailFile instanceof File ? `File: ${thumbnailFile.name}` : 'No thumbnail file',
      videoUrl,
      thumbnailUrl
    });

    // დავამატოთ ფაილები ან URL-ები
    if (videoFile instanceof File && thumbnailFile instanceof File) {
      backendFormData.append('videoFile', videoFile);
      backendFormData.append('thumbnailFile', thumbnailFile);
    } else if (videoUrl && thumbnailUrl) {
      backendFormData.append('videoUrl', videoUrl as string);
      backendFormData.append('thumbnailUrl', thumbnailUrl as string);
    } else {
      return NextResponse.json(
        { error: "Either both files or both URLs must be provided" },
        { status: 400 }
      );
    }

    // დავამატოთ JSON მონაცემები
    const jsonData: ExerciseData = {
      name: JSON.parse(formData.get('name') as string || '{}'),
      description: JSON.parse(formData.get('description') as string || '{}'),
      recommendations: JSON.parse(formData.get('recommendations') as string || '{}'),
      videoDuration: formData.get('videoDuration') as string || '',
      duration: formData.get('duration') as string || '',
      difficulty: formData.get('difficulty') as string || '',
      repetitions: formData.get('repetitions') as string || '',
      sets: formData.get('sets') as string || '',
      restTime: formData.get('restTime') as string || '',
      isActive: formData.get('isActive') === 'true',
      isPublished: formData.get('isPublished') === 'true',
      sortOrder: Number(formData.get('sortOrder') || 0),
      setId,
      categoryId,
    };

    if (videoUrl && thumbnailUrl) {
      jsonData.videoUrl = videoUrl as string;
      jsonData.thumbnailUrl = thumbnailUrl as string;
    }

    console.log('JSON data:', jsonData);

    // შევამოწმოთ სავალდებულო ველები
    const requiredFields = [
      'name.ka',
      'description.ka',
      'recommendations.ka',
      'videoDuration',
      'duration',
      'repetitions',
      'sets',
      'restTime',
    ];

    const errors: string[] = [];

    requiredFields.forEach(field => {
      if (field.includes('.')) {
        const [obj, key] = field.split('.');
        const value = jsonData[obj as keyof ExerciseData] as LocalizedField;
        if (!value[key as keyof LocalizedField]?.trim()) {
          errors.push(`${field} is required`);
        }
      } else if (!jsonData[field as keyof ExerciseData]?.toString().trim()) {
        errors.push(`${field} is required`);
      }
    });

    if (errors.length > 0) {
      console.log('Validation errors:', errors);
      return NextResponse.json(
        { error: "Validation failed", errors },
        { status: 400 }
      );
    }

    // დავამატოთ ყველა ველი FormData-ში
    (Object.entries(jsonData) as [keyof ExerciseData, any][]).forEach(([key, value]) => {
      if (typeof value === 'object') {
        backendFormData.append(key, JSON.stringify(value));
      } else if (value !== undefined) {
        backendFormData.append(key, String(value));
      }
    });

    console.log('Sending request to:', `${BACKEND_URL}/exercises`);
    console.log('Backend FormData fields:', Array.from(backendFormData.keys()));
    
    const response = await fetch(`${BACKEND_URL}/exercises`, {
      method: "POST",
      body: backendFormData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Backend error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      return NextResponse.json(errorData, { status: response.status });
    }

    const resData = await response.json();
    return NextResponse.json(resData);
  } catch (error) {
    console.error("Error creating exercise:", error);
    return NextResponse.json(
      { error: "Failed to create exercise" },
      { status: 500 }
    );
  }
} 

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');
    const subCategoryId = searchParams.get('subCategoryId');
    
    let url = `${BACKEND_URL}/exercises`;
    const params = new URLSearchParams();
    
    if (categoryId) params.append('categoryId', categoryId);
    if (subCategoryId) params.append('subCategoryId', subCategoryId);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch exercises');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercises' },
      { status: 500 }
    );
  }
} 