'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('@/components/ui/rich-text-editor'), { ssr: false });

// Flexible type that can work with both LocalizedString and BlogLocalizedString
interface FlexibleLocalizedString {
  en: string;
  ru: string;
}

interface MultilingualInputProps {
  label: string;
  value: FlexibleLocalizedString;
  onChange: (value: FlexibleLocalizedString) => void;
  type?: 'text' | 'textarea' | 'richtext';
  required?: boolean;
  maxLength?: number;
  rows?: number;
  placeholder?: string;
  className?: string;
  // Optional prop to specify which languages to show (defaults to all available)
  languages?: ('en' | 'ru')[];
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
  className = '',
  languages
}: MultilingualInputProps) {
  // Determine available languages based on the value structure and languages prop
  const availableLanguages = languages || (value && typeof value === 'object' && value !== null ? Object.keys(value).filter(key => 
    ['en', 'ru'].includes(key)
  ) : ['en', 'ru']) as ('en' | 'ru')[];
  
  const [activeTab, setActiveTab] = useState<'en' | 'ru'>(
    availableLanguages.includes('en') ? 'en' : availableLanguages[0]
  );

  const handleChange = (lang: 'en' | 'ru', newValue: string) => {
    const currentValue = value || { en: '', ru: '' };
    onChange({
      ...currentValue,
      [lang]: newValue
    });
  };

  const getLanguageLabel = (lang: 'en' | 'ru') => {
    switch (lang) {
      case 'en': return 'English';
      case 'ru': return 'Русский';
      default: return lang;
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div className="space-y-2">
        <div className="flex gap-2">
          {availableLanguages.map(lang => (
            <Button
              key={lang}
              type="button"
              variant={activeTab === lang ? 'default' : 'outline'}
              onClick={() => setActiveTab(lang)}
              size="sm"
            >
              {getLanguageLabel(lang)}
            </Button>
          ))}
        </div>

        <div>
          {type === 'richtext' ? (
            <RichTextEditor
              value={(value && value[activeTab]) || ''}
              onChange={(newValue) => handleChange(activeTab, newValue)}
              placeholder={placeholder}
            />
          ) : type === 'textarea' ? (
            <textarea
              value={(value && value[activeTab]) || ''}
              onChange={(e) => handleChange(activeTab, e.target.value)}
              rows={rows}
              maxLength={maxLength}
              placeholder={placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <input
              type="text"
              value={(value && value[activeTab]) || ''}
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