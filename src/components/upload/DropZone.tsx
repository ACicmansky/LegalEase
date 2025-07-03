'use client';

import { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { FiUploadCloud } from 'react-icons/fi';
import { useTranslations } from 'next-intl';

interface DropZoneProps {
  onFilesDrop: (files: File[]) => void;
  maxFileSize?: number;
  acceptedFileTypes?: string[];
  maxFiles?: number;
}

export const DropZone = ({
  onFilesDrop,
  maxFileSize = 20 * 1024 * 1024, // 20MB default
  acceptedFileTypes = ['.pdf'],
  maxFiles = 5,
}: DropZoneProps) => {
  const t = useTranslations();
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
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

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxSize: maxFileSize,
    maxFiles,
  });

  // Function to render the idle text with a clickable part
  const renderIdleText = () => {
    const text = t('upload.dropzoneIdle');

    // For Slovak, we want to make the word "kliknite" clickable
    if (text.includes('kliknite')) {
      const parts = text.split('kliknite');
      return (
        <>
          {parts[0]}
          <button
            type="button"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline focus:outline-none px-1 py-0.5"
            onClick={(e) => {
              e.stopPropagation();
              open();
            }}
          >
            kliknite
          </button>
          {parts[1]}
        </>
      );
    }

    // For English, we want to make the word "click" clickable
    if (text.includes('click')) {
      const parts = text.split('click');
      return (
        <>
          {parts[0]}
          <button
            type="button"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline focus:outline-none px-1 py-0.5"
            onClick={(e) => {
              e.stopPropagation();
              open();
            }}
          >
            click
          </button>
          {parts[1]}
        </>
      );
    }

    // Fallback for other languages
    return text;
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-4 sm:p-6 md:p-8
          flex flex-col items-center justify-center
          transition-colors duration-200 ease-in-out
          cursor-pointer min-h-[120px] sm:min-h-[150px]
          ${isDragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
          }
        `}
      >
        <input {...getInputProps()} />

        <FiUploadCloud className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-400 dark:text-gray-500 mb-2 sm:mb-4" />

        <p className="text-xs sm:text-sm text-center text-gray-600 dark:text-gray-400">
          {isDragActive ? (
            t('upload.dropzoneActive')
          ) : (
            <>
              {renderIdleText()}
              <br />
              <span className="text-[10px] sm:text-xs mt-1 sm:mt-2 block">
                {t('upload.fileAcceptedTypes', {
                  types: acceptedFileTypes.join(', '),
                  size: (maxFileSize / (1024 * 1024)).toFixed(0)
                })}
              </span>
            </>
          )}
        </p>
      </div>

      {error && (
        <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 break-words">{error}</p>
        </div>
      )}
    </div>
  );
};
