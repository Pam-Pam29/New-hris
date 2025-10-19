import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter content...",
  className = "",
  minHeight = "200px"
}) => {
  // Quill toolbar configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'align',
    'link'
  ];

  return (
    <div className={`rich-text-editor w-full ${className}`}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
        className="w-full"
        style={{
          minHeight: minHeight,
        }}
      />
      
      <style jsx global>{`
        .rich-text-editor .ql-editor {
          min-height: ${minHeight};
          font-family: inherit;
          line-height: 1.5;
        }
        
        .rich-text-editor .ql-toolbar {
          border-top: 1px solid hsl(var(--border));
          border-left: 1px solid hsl(var(--border));
          border-right: 1px solid hsl(var(--border));
          border-bottom: 1px solid hsl(var(--border));
          border-top-left-radius: 0.375rem;
          border-top-right-radius: 0.375rem;
          background: hsl(var(--muted) / 0.3);
        }
        
        .rich-text-editor .ql-container {
          border-left: 1px solid hsl(var(--border));
          border-right: 1px solid hsl(var(--border));
          border-bottom: 1px solid hsl(var(--border));
          border-bottom-left-radius: 0.375rem;
          border-bottom-right-radius: 0.375rem;
          background: hsl(var(--background));
        }
        
        .rich-text-editor .ql-editor {
          color: hsl(var(--foreground));
        }
        
        .rich-text-editor .ql-editor.ql-blank::before {
          color: hsl(var(--muted-foreground));
          font-style: italic;
        }
        
        .rich-text-editor .ql-toolbar .ql-stroke {
          stroke: hsl(var(--foreground));
        }
        
        .rich-text-editor .ql-toolbar .ql-fill {
          fill: hsl(var(--foreground));
        }
        
        .rich-text-editor .ql-toolbar .ql-picker-label {
          color: hsl(var(--foreground));
        }
        
        .rich-text-editor .ql-snow .ql-picker-options {
          background: hsl(var(--background));
          border: 1px solid hsl(var(--border));
        }
        
        .rich-text-editor .ql-snow .ql-picker-item:hover {
          background: hsl(var(--muted));
        }
      `}</style>
    </div>
  );
};