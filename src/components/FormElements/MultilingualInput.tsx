'use client';

import { useState } from 'react';
import { LocalizedString } from '@/types/categories';
import { useLanguage } from '@/i18n/language-context';
import RichTextEditor from './RichTextEditor';

interface MultilingualInputProps {
  label: string;
  value: LocalizedString;
  onChange: (value: LocalizedString) => void;
  required?: boolean;
  type?: 'text' | 'textarea' | 'richtext';
  maxLength?: number;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export default function MultilingualInput({
  label,
  value,
  onChange,
  required = false,
  type = 'text',
  maxLength,
  placeholder,
  rows = 3,
  className = ''
}: MultilingualInputProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'ka' | 'en' | 'ru'>('ka');

  const handleInputChange = (lang: 'ka' | 'en' | 'ru', inputValue: string) => {
    onChange({
      ...value,
      [lang]: inputValue
    });
  };

  const getCharCount = (lang: 'ka' | 'en' | 'ru') => {
    return value[lang]?.length || 0;
  };

  const renderInput = (lang: 'ka' | 'en' | 'ru') => {
    const inputProps = {
      value: value[lang] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
        handleInputChange(lang, e.target.value),
      placeholder: placeholder || `${label} (${lang.toUpperCase()})`,
      maxLength,
      required: required && lang === 'ka', // Only Georgian is required
      className: `w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
        type === 'textarea' ? 'resize-vertical' : ''
      }`
    };

    if (type === 'richtext') {
      return (
        <RichTextEditor
          value={value[lang] || ''}
          onChange={(htmlValue) => handleInputChange(lang, htmlValue)}
          placeholder={placeholder || `${label} (${lang.toUpperCase()})`}
          height={rows ? rows * 40 : 400}
        />
      );
    }

    if (type === 'textarea') {
      return (
        <textarea
          {...inputProps}
          rows={rows}
        />
      );
    }

    return <input type="text" {...inputProps} />;
  };

  const getTabLabel = (lang: 'ka' | 'en' | 'ru') => {
    switch (lang) {
      case 'ka': return 'ქართული';
      case 'en': return 'English';
      case 'ru': return 'Русский';
    }
  };

  const getTabIcon = (lang: 'ka' | 'en' | 'ru') => {
    switch (lang) {
      case 'ka': return '🇬🇪';
      case 'en': return '🇺🇸';
      case 'ru': return '🇷🇺';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Language Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {(['ka', 'en', 'ru'] as const).map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => setActiveTab(lang)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === lang
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>{getTabIcon(lang)}</span>
            {getTabLabel(lang)}
            {required && lang === 'ka' && <span className="text-red-500">*</span>}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <div className="relative">
        {renderInput(activeTab)}
        
        {/* Character Count */}
        {maxLength && (
          <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
            <span></span>
            <span className={getCharCount(activeTab) > maxLength ? 'text-red-500' : ''}>
              {getCharCount(activeTab)}/{maxLength}
            </span>
          </div>
        )}
      </div>

      {/* Validation Messages */}
      {required && !value.ka && (
        <p className="text-red-500 text-xs mt-1">
          {t('pleaseEnterGeorgianName')}
        </p>
      )}

      {/* Quick Overview */}
      <div className="text-xs text-gray-500 space-y-1">
        {value.ka && <div><span className="font-medium">🇬🇪:</span> {value.ka.substring(0, 50)}{value.ka.length > 50 ? '...' : ''}</div>}
        {value.en && <div><span className="font-medium">🇺🇸:</span> {value.en.substring(0, 50)}{value.en.length > 50 ? '...' : ''}</div>}
        {value.ru && <div><span className="font-medium">🇷🇺:</span> {value.ru.substring(0, 50)}{value.ru.length > 50 ? '...' : ''}</div>}
      </div>
    </div>
  );
} 