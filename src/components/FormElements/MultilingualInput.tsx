'use client';

import { useState } from 'react';
import { LocalizedString } from '@/types/categories';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('@/components/ui/rich-text-editor'), { ssr: false });

interface MultilingualInputProps {
  label: string;
  value: LocalizedString;
  onChange: (value: LocalizedString) => void;
  type?: 'text' | 'textarea' | 'richtext';
  required?: boolean;
  maxLength?: number;
  rows?: number;
  placeholder?: string;
  className?: string;
}

export default function MultilingualInput({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  maxLength,
  rows = 3,
  placeholder,
  className = ''
}: MultilingualInputProps) {
  const [activeTab, setActiveTab] = useState<'en' | 'ru'>('en');

  const handleChange = (lang: 'en' | 'ru', newValue: string) => {
    onChange({
      ...value,
      [lang]: newValue
    });
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div className="space-y-2">
        <div className="flex gap-2">
          <Button
            type="button"
            variant={activeTab === 'en' ? 'default' : 'outline'}
            onClick={() => setActiveTab('en')}
            size="sm"
          >
            English
          </Button>
          <Button
            type="button"
            variant={activeTab === 'ru' ? 'default' : 'outline'}
            onClick={() => setActiveTab('ru')}
            size="sm"
          >
            Русский
          </Button>
        </div>

        <div>
          {type === 'richtext' ? (
            <RichTextEditor
              value={value[activeTab]}
              onChange={(newValue) => handleChange(activeTab, newValue)}
              placeholder={placeholder}
            />
          ) : type === 'textarea' ? (
            <textarea
              value={value[activeTab]}
              onChange={(e) => handleChange(activeTab, e.target.value)}
              rows={rows}
              maxLength={maxLength}
              placeholder={placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <input
              type="text"
              value={value[activeTab]}
              onChange={(e) => handleChange(activeTab, e.target.value)}
              maxLength={maxLength}
              placeholder={placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}
        </div>
      </div>
    </div>
  );
} 