"use client";

import { useRef, useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
  height?: number;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "დაწყებული შეგიძლიათ ტექსტის ჩაწერა...",
  className = "",
  readOnly = false,
  height = 1500
}: RichTextEditorProps) {
  const editorRef = useRef<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleEditorChange = (content: string) => {
    onChange(content);
  };

  if (!isMounted) {
    return (
      <div className={`rich-text-editor ${className}`}>
        <div 
          style={{ 
            height: height, 
            border: '1px solid #d1d5db', 
            borderRadius: '0.375rem',
            background: '#f9fafb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6b7280'
          }}
        >
          ედიტორი იტვირთება...
        </div>
      </div>
    );
  }

  return (
    <div className={`rich-text-editor ${className}`}>
      <Editor
        ref={editorRef}
        apiKey="lfnniavdwz8v3mtufi94kf5jg60ga5x9n0cuatrq3xy8ra16" // For development - should be replaced with actual API key for production
        value={value}
        onEditorChange={handleEditorChange}
        disabled={readOnly}
        init={{
          height: height,
          width: '100%',
          max_width: 'none',
          menubar: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount', 'emoticons',
            'codesample', 'quickbars'
          ],
          toolbar: [
            'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough',
            'link image media table emoticons | align lineheight | checklist numlist bullist indent outdent',
            'forecolor backcolor removeformat | charmap emoticons | code fullscreen preview | help'
          ].join(' | '),
          content_style: `
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; 
              font-size: 14px; 
              line-height: 1.6;
            }
            p { margin: 0.5rem 0; }
            h1, h2, h3, h4, h5, h6 { margin: 1rem 0 0.5rem 0; }
            ul, ol { margin: 0.5rem 0; padding-left: 2rem; }
            blockquote { margin: 1rem 0; padding: 0.5rem 1rem; border-left: 4px solid #e5e7eb; background: #f9fafb; }
            code { background: #f3f4f6; padding: 0.125rem 0.25rem; border-radius: 0.25rem; font-size: 0.875em; }
            pre { background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }
          `,
          placeholder: placeholder,
          branding: false,
          promotion: false,
          resize: false,
          statusbar: false,
          skin: 'oxide',
          content_css: 'default',
          directionality: 'ltr',
          // language: 'ka', // ქართული ენის მხარდაჭერა - disabled რადგან CDN-ზე არ არის
          
          // Advanced configurations
          paste_data_images: true,
          paste_as_text: false,
          paste_webkit_styles: 'color font-size font-family',
          // paste_retain_style_properties: 'color font-size font-family', // deprecated in TinyMCE 7
          
          // Image upload configuration (can be customized)
          images_upload_handler: function (blobInfo: any, success: any, failure: any) {
            // This would typically upload to your server
            // For now, we'll convert to base64
            const reader = new FileReader();
            reader.onload = function() {
              success(reader.result);
            };
            reader.readAsDataURL(blobInfo.blob());
          },
          
          // Auto-save functionality
          setup: function (editor: any) {
            editor.on('init', function () {
              // Editor is ready
              if (readOnly) {
                editor.getBody().setAttribute('contenteditable', false);
              }
            });
            
            // Custom button examples
            editor.ui.registry.addButton('customSave', {
              text: 'შენახვა',
              onAction: function () {
                // Custom save logic
                console.log('Content saved:', editor.getContent());
              }
            });
          },
          
          // Style formats for dropdown
          style_formats: [
            { title: 'პარაგრაფი', format: 'p' },
            { title: 'სათაური 1', format: 'h1' },
            { title: 'სათაური 2', format: 'h2' },
            { title: 'სათაური 3', format: 'h3' },
            { title: 'ციტატა', format: 'blockquote' },
            { title: 'კოდი', format: 'code' },
            {
              title: 'ყვითელი ფონი',
              inline: 'span',
              styles: { backgroundColor: '#fff3cd', padding: '2px 4px', borderRadius: '3px' }
            },
            {
              title: 'ლურჯი ტექსტი',
              inline: 'span',
              styles: { color: '#0066cc', fontWeight: 'bold' }
            }
          ],
          
          // Tables
          // table_responsive_width: true, // deprecated in TinyMCE 7
          table_default_attributes: {
            border: '1'
          },
          table_default_styles: {
            borderCollapse: 'collapse',
            width: '100%'
          },
          
          // Link configuration
          link_default_target: '_blank',
          link_assume_external_targets: true,
          
          // Advanced list configuration
          lists_indent_on_tab: true,
          
          // Word count
          wordcount_countregex: /[\w\u2019\u0027\u00C0-\u1FFF\u2C00-\uD7FF\w]+/g,
          
          // Accessibility
          a11y_advanced_options: true,
          
          // Mobile configuration
          mobile: {
            theme: 'mobile',
            plugins: ['autosave', 'lists', 'autolink'],
            toolbar: ['undo', 'bold', 'italic', 'styleselect']
          }
        }}
      />
      
      <style jsx global>{`
        .tox-tinymce {
          border: 1px solid #d1d5db !important;
          border-radius: 0.375rem !important;
        }
        
        .dark .tox-tinymce {
          border-color: #4b5563 !important;
        }
        
        .tox-toolbar__primary {
          background: #f9fafb !important;
          border-bottom: 1px solid #e5e7eb !important;
        }
        
        .dark .tox-toolbar__primary {
          background: #374151 !important;
          border-bottom-color: #4b5563 !important;
        }
        
        .tox-edit-area__iframe {
          background: white !important;
        }
        
        .dark .tox-edit-area__iframe {
          background: #1f2937 !important;
        }
        
        /* Button styles */
        .tox-tbtn {
          border-radius: 0.25rem !important;
        }
        
        .tox-tbtn:hover {
          background: #e5e7eb !important;
        }
        
        .dark .tox-tbtn:hover {
          background: #4b5563 !important;
        }
        
        .tox-tbtn--enabled {
          background: #dbeafe !important;
          color: #1e40af !important;
        }
        
        .dark .tox-tbtn--enabled {
          background: #1e3a8a !important;
          color: #dbeafe !important;
        }
        
        /* Dropdown menus */
        .tox-collection {
          background: white !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 0.375rem !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
        }
        
        .dark .tox-collection {
          background: #374151 !important;
          border-color: #4b5563 !important;
        }
        
        .tox-collection__item {
          color: #374151 !important;
        }
        
        .dark .tox-collection__item {
          color: #f3f4f6 !important;
        }
        
        .tox-collection__item:hover {
          background: #f3f4f6 !important;
        }
        
        .dark .tox-collection__item:hover {
          background: #4b5563 !important;
        }
      `}</style>
    </div>
  );
} 