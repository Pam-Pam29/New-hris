import React, { useState } from 'react';
import { Input } from '../../../../../components/ui/input';
import { Select } from '../../../../../components/atoms/Select';
import { Button } from '../../../../../components/ui/button';
import { RichTextEditor } from '../../../../../components/ui/rich-text-editor';
import { Upload, FileText, Type } from 'lucide-react';

interface PolicyFormProps {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  handleSubmit: (e: React.FormEvent) => void;
  sending: boolean;
  submitLabel?: string;
}

const categoryOptions = [
  { value: 'HR', label: 'HR' },
  { value: 'IT', label: 'IT' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Legal', label: 'Legal' },
  { value: 'Ethics', label: 'Ethics' },
  { value: 'Safety', label: 'Safety' },
  { value: 'Operations', label: 'Operations' },
  { value: 'Other', label: 'Other' }
];

const statusOptions = [
  { value: 'Draft', label: 'Draft' },
  { value: 'Under Review', label: 'Under Review' }
];

export const PolicyForm: React.FC<PolicyFormProps> = ({
  form,
  setForm,
  handleSubmit,
  sending,
  submitLabel
}) => {
  const [inputMethod, setInputMethod] = useState<'type' | 'upload'>('type');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
      'text/plain'
    ];

    if (!validTypes.includes(file.type)) {
      setUploadStatus('❌ Please upload a PDF, DOCX, DOC, or TXT file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus('❌ File size must be less than 10MB');
      return;
    }

    setUploadedFile(file);
    setUploadStatus(`✅ Uploaded: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);

    // For text files, read and populate description
    if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setForm(f => ({ ...f, description: content }));
        setUploadStatus(`✅ Content loaded from ${file.name}`);
      };
      reader.readAsText(file);
    } else {
      // For PDF/DOCX, just store the file name and reference
      setForm(f => ({
        ...f,
        description: `[Document uploaded: ${file.name}]\n\nPolicy content from uploaded document. Full document available for download.`,
        attachmentName: file.name,
        attachmentSize: file.size,
        attachmentType: file.type
      }));
    }
  };

  return (
    <form className="mx-auto max-w-xl p-8 bg-background rounded-lg shadow-md grid grid-cols-1 gap-6 mt-8" onSubmit={handleSubmit} style={{ width: '800px' }}>
      <div className="flex flex-col gap-2 md:col-span-2">
        <label htmlFor="title" className="text-sm font-medium text-foreground">Policy Title</label>
        <Input
          id="title"
          type="text"
          placeholder="e.g., Remote Work Policy"
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="category" className="text-sm font-medium text-foreground">Category</label>
        <Select
          id="category"
          value={form.category}
          onValueChange={val => setForm(f => ({ ...f, category: val }))}
          placeholder="Select Category"
          options={categoryOptions}
          className="w-full"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="version" className="text-sm font-medium text-foreground">Version</label>
        <Input
          id="version"
          type="text"
          placeholder="e.g., 1.0"
          value={form.version}
          onChange={e => setForm(f => ({ ...f, version: e.target.value }))}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="status" className="text-sm font-medium text-foreground">Initial Status</label>
        <Select
          id="status"
          value={form.status}
          onValueChange={val => setForm(f => ({ ...f, status: val }))}
          placeholder="Select Status"
          options={statusOptions}
          className="w-full"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="effectiveDate" className="text-sm font-medium text-foreground">Effective Date</label>
        <Input
          id="effectiveDate"
          type="date"
          value={form.effectiveDate}
          onChange={e => setForm(f => ({ ...f, effectiveDate: e.target.value }))}
        />
      </div>

      {/* Content Input Method Toggle */}
      <div className="flex flex-col gap-3 md:col-span-2 p-4 bg-muted/50 rounded-lg border border-input">
        <label className="text-sm font-medium text-foreground">Policy Content Input Method</label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setInputMethod('type')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${inputMethod === 'type'
                ? 'border-violet-600 bg-violet-50 text-violet-700 font-semibold'
                : 'border-input bg-background text-muted-foreground hover:border-violet-300'
              }`}
          >
            <Type className="h-5 w-5" />
            <span>Type Content</span>
          </button>
          <button
            type="button"
            onClick={() => setInputMethod('upload')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${inputMethod === 'upload'
                ? 'border-violet-600 bg-violet-50 text-violet-700 font-semibold'
                : 'border-input bg-background text-muted-foreground hover:border-violet-300'
              }`}
          >
            <Upload className="h-5 w-5" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Content Input - Type Method */}
      {inputMethod === 'type' && (
        <div className="flex flex-col gap-2 md:col-span-2">
          <label htmlFor="description" className="text-sm font-medium text-foreground">Policy Description / Content</label>
          <RichTextEditor
            value={form.description}
            onChange={(val: string) => setForm(f => ({ ...f, description: val }))}
            placeholder="Type or paste your policy content here..."
            minHeight="150px"
            className="w-full border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
        </div>
      )}

      {/* Content Input - Upload Method */}
      {inputMethod === 'upload' && (
        <div className="flex flex-col gap-3 md:col-span-2">
          <label className="text-sm font-medium text-foreground">Upload Policy Document</label>

          <div className="border-2 border-dashed border-input rounded-lg p-6 bg-muted/20 hover:bg-muted/40 transition-colors">
            <div className="flex flex-col items-center gap-3">
              <FileText className="h-12 w-12 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium text-foreground mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, DOCX, DOC, or TXT (max 10MB)
                </p>
              </div>
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileUpload}
                className="hidden"
                id="fileUpload"
              />
              <label htmlFor="fileUpload">
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => document.getElementById('fileUpload')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Select File
                </Button>
              </label>
            </div>
          </div>

          {/* Upload Status */}
          {uploadStatus && (
            <div className={`p-3 rounded-lg text-sm ${uploadStatus.startsWith('✅')
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
              {uploadStatus}
            </div>
          )}

          {/* File Preview */}
          {uploadedFile && (
            <div className="p-4 bg-background border border-input rounded-lg">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-violet-600 mt-1" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">{uploadedFile.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(uploadedFile.size / 1024).toFixed(2)} KB · {uploadedFile.type}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUploadedFile(null);
                    setUploadStatus('');
                    setForm(f => ({ ...f, description: '', attachmentName: '', attachmentSize: 0, attachmentType: '' }));
                  }}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            💡 <strong>Tip:</strong> For TXT files, content will be extracted automatically. For PDF/DOCX files, the document will be referenced and stored for employee download.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2 md:col-span-2">
        <label htmlFor="tags" className="text-sm font-medium text-foreground">Tags (comma-separated)</label>
        <Input
          id="tags"
          type="text"
          placeholder="e.g., remote, work-from-home, equipment"
          value={form.tags}
          onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
        />
      </div>

      <div className="flex items-center gap-2 md:col-span-2">
        <input
          type="checkbox"
          id="acknowledgmentRequired"
          checked={form.acknowledgmentRequired}
          onChange={e => setForm(f => ({ ...f, acknowledgmentRequired: e.target.checked }))}
          className="rounded border-input"
        />
        <label htmlFor="acknowledgmentRequired" className="text-sm font-medium text-foreground">
          Require employee acknowledgment
        </label>
      </div>

      <div className="col-span-1 md:col-span-2">
        <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white mt-2" disabled={sending}>
          {sending
            ? (submitLabel ? submitLabel.replace('Update', 'Updating').replace('Create', 'Creating') + '...' : 'Creating Policy...')
            : (submitLabel || 'Create Policy')}
        </Button>
      </div>
    </form>
  );
};