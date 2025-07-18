"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import InputGroup from "@/components/FormElements/InputGroup";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { ExerciseFormData } from "@/types/categories";

interface AddExerciseClientProps {
  setId: string;
  categoryId: string;
  subCategoryId?: string;
}

export default function AddExerciseClient({
  setId,
  categoryId,
  subCategoryId,
}: AddExerciseClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ExerciseFormData>({
    name: {
      ka: "",
      en: "",
      ru: "",
    },
    description: {
      ka: "",
      en: "",
      ru: "",
    },
    recommendations: {
      ka: "",
      en: "",
      ru: "",
    },
    videoFile: null,
    thumbnailImage: null,
    videoDuration: "00:00",
    duration: "00:00",
    difficulty: "medium",
    repetitions: "0",
    sets: "0",
    restTime: "00:00",
    isActive: true,
    isPublished: false,
    sortOrder: "0",
    setId,
    categoryId,
    subCategoryId,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();

      // ლოკალიზებული სტრინგების დამატება
      Object.entries(formData.name).forEach(([lang, value]) => {
        formDataToSend.append(`name[${lang}]`, value);
      });

      Object.entries(formData.description).forEach(([lang, value]) => {
        formDataToSend.append(`description[${lang}]`, value);
      });

      Object.entries(formData.recommendations).forEach(([lang, value]) => {
        formDataToSend.append(`recommendations[${lang}]`, value);
      });

      // ფაილების დამატება
      if (formData.videoFile instanceof File) {
        formDataToSend.append("videoFile", formData.videoFile);
      }

      if (formData.thumbnailImage instanceof File) {
        formDataToSend.append("thumbnailImage", formData.thumbnailImage);
      }

      // სხვა ველების დამატება
      formDataToSend.append("videoDuration", formData.videoDuration);
      formDataToSend.append("duration", formData.duration);
      formDataToSend.append("difficulty", formData.difficulty);
      formDataToSend.append("repetitions", formData.repetitions);
      formDataToSend.append("sets", formData.sets);
      formDataToSend.append("restTime", formData.restTime);
      formDataToSend.append("isActive", String(formData.isActive));
      formDataToSend.append("isPublished", String(formData.isPublished));
      formDataToSend.append("sortOrder", formData.sortOrder);
      formDataToSend.append("setId", formData.setId);
      formDataToSend.append("categoryId", formData.categoryId);

      if (formData.subCategoryId) {
        formDataToSend.append("subCategoryId", formData.subCategoryId);
      }

      const response = await fetch("/api/exercises", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error("Failed to create exercise");
      }

      router.refresh();
      router.push(`/rehabilitation/categories/${categoryId}/sets/${setId}/exercises`);
    } catch (error) {
      console.error("Error creating exercise:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "video" | "thumbnail"
  ) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({
        ...prev,
        [type === "video" ? "videoFile" : "thumbnailImage"]: e.target.files![0],
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* სახელის ველები */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">სახელი</h3>
        <InputGroup
          label="ქართულად"
          type="text"
          placeholder="შეიყვანეთ სახელი ქართულად"
          value={formData.name.ka}
          handleChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData((prev) => ({
              ...prev,
              name: { ...prev.name, ka: e.target.value },
            }))
          }
        />
        <InputGroup
          label="ინგლისურად"
          type="text"
          placeholder="Enter name in English"
          value={formData.name.en}
          handleChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData((prev) => ({
              ...prev,
              name: { ...prev.name, en: e.target.value },
            }))
          }
        />
        <InputGroup
          label="რუსულად"
          type="text"
          placeholder="Введите название на русском"
          value={formData.name.ru}
          handleChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData((prev) => ({
              ...prev,
              name: { ...prev.name, ru: e.target.value },
            }))
          }
        />
      </div>

      {/* აღწერის ველები */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">აღწერა</h3>
        <div className="space-y-4">
          <label className="block text-sm font-medium">ქართულად</label>
          <RichTextEditor
            value={formData.description.ka}
            onChange={(value: string) =>
              setFormData((prev) => ({
                ...prev,
                description: { ...prev.description, ka: value },
              }))
            }
          />
        </div>
        <div className="space-y-4">
          <label className="block text-sm font-medium">ინგლისურად</label>
          <RichTextEditor
            value={formData.description.en}
            onChange={(value: string) =>
              setFormData((prev) => ({
                ...prev,
                description: { ...prev.description, en: value },
              }))
            }
          />
        </div>
        <div className="space-y-4">
          <label className="block text-sm font-medium">რუსულად</label>
          <RichTextEditor
            value={formData.description.ru}
            onChange={(value: string) =>
              setFormData((prev) => ({
                ...prev,
                description: { ...prev.description, ru: value },
              }))
            }
          />
        </div>
      </div>

      {/* რეკომენდაციების ველები */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">რეკომენდაციები</h3>
        <div className="space-y-4">
          <label className="block text-sm font-medium">ქართულად</label>
          <RichTextEditor
            value={formData.recommendations.ka}
            onChange={(value: string) =>
              setFormData((prev) => ({
                ...prev,
                recommendations: { ...prev.recommendations, ka: value },
              }))
            }
          />
        </div>
        <div className="space-y-4">
          <label className="block text-sm font-medium">ინგლისურად</label>
          <RichTextEditor
            value={formData.recommendations.en}
            onChange={(value: string) =>
              setFormData((prev) => ({
                ...prev,
                recommendations: { ...prev.recommendations, en: value },
              }))
            }
          />
        </div>
        <div className="space-y-4">
          <label className="block text-sm font-medium">რუსულად</label>
          <RichTextEditor
            value={formData.recommendations.ru}
            onChange={(value: string) =>
              setFormData((prev) => ({
                ...prev,
                recommendations: { ...prev.recommendations, ru: value },
              }))
            }
          />
        </div>
      </div>

      {/* ვიდეო და სურათი */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">ვიდეო</h3>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => handleFileChange(e, "video")}
            className="w-full"
          />
          <InputGroup
            label="ვიდეოს ხანგრძლივობა"
            type="text"
            placeholder="MM:SS"
            value={formData.videoDuration}
            handleChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData((prev) => ({ ...prev, videoDuration: e.target.value }))
            }
          />
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-medium">სურათი</h3>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, "thumbnail")}
            className="w-full"
          />
        </div>
      </div>

      {/* სავარჯიშოს დეტალები */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <InputGroup
            label="ხანგრძლივობა"
            type="text"
            placeholder="MM:SS"
            value={formData.duration}
            handleChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData((prev) => ({ ...prev, duration: e.target.value }))
            }
          />
          <div>
            <label className="block text-sm font-medium mb-2">სირთულე</label>
            <select
              className="w-full rounded-lg border border-gray-300 p-2"
              value={formData.difficulty}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setFormData((prev) => ({ ...prev, difficulty: e.target.value as "easy" | "medium" | "hard" }))
              }
            >
              <option value="easy">მარტივი</option>
              <option value="medium">საშუალო</option>
              <option value="hard">რთული</option>
            </select>
          </div>
        </div>
        <div className="space-y-4">
          <InputGroup
            label="გამეორებების რაოდენობა"
            type="text"
            placeholder="შეიყვანეთ გამეორებების რაოდენობა"
            value={formData.repetitions}
            handleChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData((prev) => ({ ...prev, repetitions: e.target.value }))
            }
          />
          <InputGroup
            label="სერიების რაოდენობა"
            type="text"
            placeholder="შეიყვანეთ სერიების რაოდენობა"
            value={formData.sets}
            handleChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData((prev) => ({ ...prev, sets: e.target.value }))
            }
          />
          <InputGroup
            label="შესვენების დრო"
            type="text"
            placeholder="MM:SS"
            value={formData.restTime}
            handleChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData((prev) => ({ ...prev, restTime: e.target.value }))
            }
          />
        </div>
      </div>

      {/* სტატუსის ველები */}
      <div className="flex items-center space-x-6">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
            }
          />
          <span>აქტიური</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.isPublished}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData((prev) => ({ ...prev, isPublished: e.target.checked }))
            }
          />
          <span>გამოქვეყნებული</span>
        </label>
      </div>

      {/* სორტირების ველი */}
      <InputGroup
        label="სორტირების ინდექსი"
        type="text"
        placeholder="შეიყვანეთ სორტირების ინდექსი"
        value={formData.sortOrder}
        handleChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setFormData((prev) => ({ ...prev, sortOrder: e.target.value }))
        }
      />

      {/* ღილაკები */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          გაუქმება
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "იტვირთება..." : "დამატება"}
        </Button>
      </div>
    </form>
  );
} 