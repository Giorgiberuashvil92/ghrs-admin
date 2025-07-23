'use client';

import { useState, useRef, useCallback } from 'react';
import { PhotoIcon, LinkIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/language-context';

const API_BASE_URL = 'http://localhost:4000';

interface ImageUploadProps {
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in MB
  value?: string | string[];
  onChange: (urls: string | string[]) => void;
  accept?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

const ImageComponent = ({ src, alt }: { src: string; alt: string }) => {
  if (src.startsWith('data:')) {
    return (
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover rounded-lg"
      />
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover rounded-lg"
    />
  );
};

export default function ImageUpload({
  multiple = false,
  maxFiles = 10,
  maxSize = 10, // 10MB default
  value,
  onChange,
  accept = 'image/*',
  label,
  required = false,
  className = ''
}: ImageUploadProps) {
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const [isUrlInput, setIsUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert value to array for consistent handling
  const images = multiple
    ? (Array.isArray(value) ? value : [])
    : (value ? [value as string] : []);

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files) return;

    const validFiles = Array.from(files).filter(file => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} არ არის სურათის ფაილი`);
        return false;
      }

      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        alert(`${file.name} ძალიან დიდია. მაქსიმუმ ${maxSize}MB`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    // Check max files limit
    const currentCount = images.length;
    const totalCount = currentCount + validFiles.length;
    
    if (multiple && totalCount > maxFiles) {
      alert(`მაქსიმუმ ${maxFiles} ფაილის ატვირთვა შეიძლება`);
      return;
    }

    setIsUploading(true);

    try {
      const uploadedUrls = await Promise.all(
        validFiles.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);

          const response = await fetch(`${API_BASE_URL}/upload/image`, {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
          }

          const data = await response.json();
          return data.url; // Assuming the response contains the uploaded image URL
        })
      );

      if (multiple) {
        onChange([...images, ...uploadedUrls]);
      } else {
        onChange(uploadedUrls[0]);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('სურათის ატვირთვა ვერ მოხერხდა');
    } finally {
      setIsUploading(false);
    }
  }, [images, maxFiles, maxSize, multiple, onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUrlSubmit = () => {
    if (!urlValue.trim()) {
      alert(t('pleaseEnterImageUrl'));
      return;
    }

    if (!/^https?:\/\//.test(urlValue)) {
      alert('URL უნდა იყოს http:// ან https:// ფორმატში');
      return;
    }

    if (multiple) {
      onChange([...images, urlValue]);
    } else {
      onChange(urlValue);
    }
    
    setUrlValue('');
    setIsUrlInput(false);
  };

  const handleRemoveImage = (index: number) => {
    if (multiple) {
      const newImages = images.filter((_, i) => i !== index);
      onChange(newImages);
    } else {
      onChange('');
    }
  };

  const renderImagePreview = (src: string, index: number) => (
    <div key={index} className="relative group">
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
        <ImageComponent src={src} alt={`${t('image')} ${index + 1}`} />
      </div>
      <button
        type="button"
        onClick={() => handleRemoveImage(index)}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className={`grid gap-4 ${
          multiple 
            ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' 
            : 'grid-cols-1 max-w-xs'
        }`}>
          {images.map((src, index) => renderImagePreview(src, index))}
        </div>
      )}

      {/* Upload Area */}
      {(multiple ? images.length < maxFiles : images.length === 0) && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
            isDragging
              ? 'border-blue-400 bg-blue-50'
              : isUploading
              ? 'border-gray-400 bg-gray-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mx-auto" />
              <p className="mt-2 text-sm text-gray-500">
                სურათის ატვირთვა...
              </p>
            </>
          ) : (
            <>
              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                {multiple 
                  ? 'გადმოწიეთ სურათები ან დააკლიკეთ ატვირთვისთვის'
                  : 'გადმოწიეთ სურათი ან დააკლიკეთ ატვირთვისთვის'
                }
              </p>
              <p className="text-xs text-gray-400 mt-1">
                მაქსიმუმ {maxSize}MB {multiple && `• ${maxFiles} ფაილი მაქსიმუმ`}
              </p>

              <div className="flex gap-2 mt-4 justify-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={accept}
                  multiple={multiple}
                  onChange={handleFileInputChange}
                  className="hidden"
                  disabled={isUploading}
                />
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <PhotoIcon className="h-4 w-4 mr-1" />
                  {t('file') || 'ფაილი'}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsUrlInput(!isUrlInput)}
                  disabled={isUploading}
                >
                  <LinkIcon className="h-4 w-4 mr-1" />
                  URL
                </Button>
              </div>
            </>
          )}

          {/* URL Input */}
          {isUrlInput && !isUploading && (
            <div className="flex gap-2 mt-4">
              <input
                type="url"
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
                placeholder={t('enterImageUrl') || 'შეიყვანეთ სურათის URL'}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isUploading}
              />
              <Button
                type="button"
                onClick={handleUrlSubmit}
                size="sm"
                disabled={isUploading}
              >
                {t('add') || 'დამატება'}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Add More Button (for multiple images) */}
      {multiple && images.length > 0 && images.length < maxFiles && (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="w-full"
          disabled={isUploading}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          სურათის დამატება ({images.length}/{maxFiles})
        </Button>
      )}

      {/* Validation Message */}
      {required && images.length === 0 && (
        <p className="text-red-500 text-xs">
          {multiple ? 'მინიმუმ ერთი სურათი საჭიროა' : 'სურათი საჭიროა'}
        </p>
      )}
    </div>
  );
} 