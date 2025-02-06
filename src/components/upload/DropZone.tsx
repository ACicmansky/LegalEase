'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud } from 'react-icons/fi';

interface DropZoneProps {
  onFilesDrop: (files: File[]) => void;
  maxFileSize?: number;
  acceptedFileTypes?: string[];
  maxFiles?: number;
}

export const DropZone = ({
  onFilesDrop,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  acceptedFileTypes = ['.pdf', '.docx', '.txt'],
  maxFiles = 5,
}: DropZoneProps) => {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      // Reset error state
      setError(null);

      // Handle rejected files
      if (rejectedFiles.length > 0) {
        const errors = rejectedFiles.map((file) => {
          const error = file.errors[0];
          return `${file.file.name}: ${error.message}`;
        });
        setError(errors.join('\n'));
        return;
      }

      // Handle accepted files
      onFilesDrop(acceptedFiles);
    },
    [onFilesDrop]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxSize: maxFileSize,
    maxFiles,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8
          flex flex-col items-center justify-center
          transition-colors duration-200 ease-in-out
          cursor-pointer
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
          }
        `}
      >
        <input {...getInputProps()} />
        
        <FiUploadCloud className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
        
        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          {isDragActive ? (
            'Drop the files here...'
          ) : (
            <>
              Drag and drop legal documents here, or click to select files
              <br />
              <span className="text-xs mt-2 block">
                Accepts {acceptedFileTypes.join(', ')} (max {(maxFileSize / (1024 * 1024)).toFixed(0)}MB per file)
              </span>
            </>
          )}
        </p>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
};
