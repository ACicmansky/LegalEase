'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface PDFUploaderProps {
  onFileSelect: (file: File) => void;
}

export default function PDFUploader({ onFileSelect }: PDFUploaderProps) {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`w-[470px] h-[250px] border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-4 transition-colors duration-200 ease-in-out cursor-pointer
        ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
    >
      <input {...getInputProps()} />
      <svg
        className="w-10 h-10 mb-3 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
        ></path>
      </svg>
      <p className="mb-2 text-sm text-gray-500">
        <span className="font-semibold">Click to upload</span> or drag and drop
      </p>
      <p className="text-xs text-gray-500">PDF files only (max 10MB)</p>
    </div>
  );
}
