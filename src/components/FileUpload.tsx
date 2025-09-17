import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Image, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  accept?: string;
  maxSize?: number; // in MB
  currentFile?: string | null;
  currentUrl?: string | null; // optional absolute/relative URL for preview
  label: string;
  description?: string;
  isLoading?: boolean;
  className?: string;
  variant?: 'default' | 'compact';
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onFileRemove,
  accept = ".jpg,.jpeg,.png,.pdf",
  maxSize = 10,
  currentFile,
  currentUrl = null,
  label,
  description,
  isLoading = false,
  className = "",
  variant = 'default'
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Validate file type
    const allowedTypes = accept.split(',').map(type => type.trim().toLowerCase());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      toast.error(`File type not supported. Allowed types: ${accept}`);
      return;
    }

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }

    onFileSelect(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileRemove?.();
  };

  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) {
      return <Image className="w-8 h-8 text-blue-500" />;
    }
    return <FileText className="w-8 h-8 text-gray-500" />;
  };

  const getFileType = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) {
      return 'Image';
    }
    return 'Document';
  };

  const containerPad = variant === 'compact' ? 'p-4' : 'p-6';
  const minHeight = variant === 'compact' ? 'min-h-[120px]' : 'min-h-[150px]';

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
      
      <div
        className={`relative border-2 border-dashed rounded-lg ${containerPad} ${minHeight} transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : currentFile || preview
            ? 'border-green-400 bg-green-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />
        
        {currentFile || preview || currentUrl ? (
          <div className="text-center">
            {preview ? (
              <div className="space-y-2">
                <img
                  src={preview}
                  alt="Preview"
                  className="mx-auto h-24 w-24 object-cover rounded-lg shadow"
                />
                <p className="text-sm text-gray-600">Image Preview</p>
              </div>
            ) : currentUrl && /\.(jpg|jpeg|png|gif)$/i.test(currentUrl) ? (
              <div className="space-y-2">
                <img
                  src={currentUrl}
                  alt="Current"
                  className="mx-auto h-24 w-24 object-cover rounded-lg shadow"
                />
                <p className="text-xs text-gray-500">Current</p>
              </div>
            ) : currentFile ? (
              <div className="space-y-2">
                {getFileIcon(currentFile)}
                <p className="text-sm text-gray-600">{getFileType(currentFile)}</p>
                <p className="text-xs text-gray-500 truncate">{currentFile}</p>
              </div>
            ) : null}
            
            <div className="flex items-center justify-center space-x-2 mt-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600">File uploaded</span>
              {onFileRemove && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="ml-2 px-2 py-1 text-xs rounded border border-red-200 text-red-600 hover:bg-red-50"
                  disabled={isLoading}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="mx-auto h-10 w-10 text-gray-400" />
            <div className="mt-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium text-blue-600 hover:text-blue-500">
                  Click to upload
                </span>{' '}
                or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {accept} (max {maxSize}MB)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
