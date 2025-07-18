"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Button } from "@/components/ui-elements/button";
import InputGroup from "@/components/FormElements/InputGroup";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";
import { categoriesApi } from "@/lib/api-client";
import { updateCategory } from "@/lib/api/categories";
import { toast } from "react-hot-toast";
import { Category } from "@/types/categories";

interface Props {
  category: Category;
}

export default function EditCategoryClient({ category }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: {
      ka: category.name.ka || "",
      en: category.name.en || "",
      ru: category.name.ru || "",
    },
    description: {
      ka: category.description?.ka || "",
      en: category.description?.en || "",
      ru: category.description?.ru || "",
    },
    image: null as File | null,
    isActive: category.isActive !== undefined ? category.isActive : true,
    isPublished: category.isPublished !== undefined ? category.isPublished : false,
    sortOrder: category.sortOrder || 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateCategory(category._id, {
        name: formData.name,
        description: formData.description,
        image: formData.image,
        isActive: formData.isActive,
        isPublished: formData.isPublished,
        sortOrder: Number(formData.sortOrder)
      });

      toast.success("კატეგორია წარმატებით განახლდა");
      router.back();
      router.refresh();
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("შეცდომა კატეგორიის განახლებისას");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, image: e.target.files![0] }));
    }
  };

  return (
    <>
      <div className="mx-auto max-w-270">
        <Breadcrumb pageName="კატეგორიის რედაქტირება" />

        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              კატეგორიის დეტალები
            </h3>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="p-6.5">
              <div className="mb-4.5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <InputGroup
                    label="სახელი (ქართულად)"
                    name="name-ka"
                    type="text"
                    placeholder="შეიყვანეთ კატეგორიის სახელი"
                    value={formData.name.ka}
                    handleChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        name: { ...prev.name, ka: e.target.value }
                      }))
                    }
                    required
                  />
                  <InputGroup
                    label="Name (English)"
                    name="name-en"
                    type="text"
                    placeholder="Enter category name"
                    value={formData.name.en}
                    handleChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        name: { ...prev.name, en: e.target.value }
                      }))
                    }
                    required
                  />
                  <InputGroup
                    label="Название (Русский)"
                    name="name-ru"
                    type="text"
                    placeholder="Введите название категории"
                    value={formData.name.ru}
                    handleChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        name: { ...prev.name, ru: e.target.value }
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="mb-4.5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <TextAreaGroup
                    label="აღწერა (ქართულად)"
                    placeholder="შეიყვანეთ კატეგორიის აღწერა"
                    value={formData.description.ka}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        description: { ...prev.description, ka: e.target.value }
                      }))
                    }
                    required
                  />
                  <TextAreaGroup
                    label="Description (English)"
                    placeholder="Enter category description"
                    value={formData.description.en}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        description: { ...prev.description, en: e.target.value }
                      }))
                    }
                    required
                  />
                  <TextAreaGroup
                    label="Описание (Русский)"
                    placeholder="Введите описание категории"
                    value={formData.description.ru}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        description: { ...prev.description, ru: e.target.value }
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="mb-4.5">
                <InputGroup
                  label="სურათი"
                  name="image"
                  type="file"
                  placeholder="აირჩიეთ სურათი"
                  fileStyleVariant="style1"
                  handleChange={handleImageChange}
                />
              </div>

              <div className="mb-4.5">
                <div className="relative flex items-start">
                  <div className="flex h-6 items-center">
                    <input
                      id="isActive"
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData(prev => ({ ...prev, isActive: e.target.checked }))
                      }
                      className="h-4 w-4 rounded border-stroke bg-transparent text-primary focus:border-primary focus-visible:shadow-none dark:border-strokedark dark:bg-dark-2"
                    />
                  </div>
                  <div className="ml-3">
                    <label 
                      htmlFor="isActive" 
                      className="text-sm font-medium text-black dark:text-white"
                    >
                      აქტიურია
                    </label>
                    <p className="text-sm text-body-color dark:text-dark-6">
                      მონიშნეთ თუ კატეგორია აქტიურია
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4.5">
                <div className="relative flex items-start">
                  <div className="flex h-6 items-center">
                    <input
                      id="isPublished"
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) =>
                        setFormData(prev => ({ ...prev, isPublished: e.target.checked }))
                      }
                      className="h-4 w-4 rounded border-stroke bg-transparent text-primary focus:border-primary focus-visible:shadow-none dark:border-strokedark dark:bg-dark-2"
                    />
                  </div>
                  <div className="ml-3">
                    <label 
                      htmlFor="isPublished" 
                      className="text-sm font-medium text-black dark:text-white"
                    >
                      გამოქვეყნებულია
                    </label>
                    <p className="text-sm text-body-color dark:text-dark-6">
                      მონიშნეთ თუ კატეგორია გამოქვეყნებულია
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4.5">
                <label 
                  htmlFor="sortOrder"
                  className="mb-3 block text-black dark:text-white"
                >
                  სორტირების რიგითობა
                </label>
                <input
                  id="sortOrder"
                  type="number"
                  min="0"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-strokedark dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                />
                <p className="mt-1 text-sm text-body-color dark:text-dark-6">
                  განსაზღვრეთ კატეგორიის პოზიცია სიაში (0-დან ზევით)
                </p>
              </div>

              <div className="flex gap-4 justify-end">
                <Button
                  variant="outlineDark"
                  label="გაუქმება"
                  onClick={() => router.back()}
                />
                <Button
                  variant="primary"
                  label={isLoading ? "ინახება..." : "შენახვა"}
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
} 