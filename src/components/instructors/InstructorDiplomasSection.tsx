'use client';

import ImageUpload from '@/components/FormElements/ImageUpload';
import { Button } from '@/components/ui/button';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { InstructorCertificateFormItem } from '@/types/instructors';
import type { TranslationKey } from '@/i18n/translations';

interface Props {
  items: InstructorCertificateFormItem[];
  onChange: (items: InstructorCertificateFormItem[]) => void;
  t: (key: TranslationKey) => string;
}

function newDiplomaId() {
  return `diploma-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function InstructorDiplomasSection({ items, onChange }: Props) {
  const add = () => {
    onChange([
      ...items,
      {
        id: newDiplomaId(),
        imageUrl: '',
      },
    ]);
  };

  const update = (id: string, patch: Partial<InstructorCertificateFormItem>) => {
    onChange(items.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  };

  const remove = (id: string) => onChange(items.filter((x) => x.id !== id));

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Diplomas</h2>
        <Button type="button" onClick={add} size="sm" variant="outline">
          <PlusIcon className="h-4 w-4 mr-2" />
          Add diploma
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No diplomas added</p>
      ) : (
        <div className="space-y-6">
          {items.map((diploma, index) => (
            <div key={diploma.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-800">Diploma #{index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(diploma.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
              <ImageUpload
                label="Diploma image"
                value={diploma.imageUrl}
                onChange={(url) => update(diploma.id, { imageUrl: url as string })}
                multiple={false}
                maxFiles={1}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
