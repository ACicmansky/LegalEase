'use client';

import { useState } from 'react';
import { createSupabaseClient } from '@/lib/utils/supabase/client';
import { uploadFile } from '@/lib/services/storageService';
import { DropZone } from './DropZone';
import { FiFile, FiCheck, FiLoader } from 'react-icons/fi';
import { useTranslations } from 'next-intl';

interface UploadedFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
  progress: number;
  error?: string;
  documentId?: string;
}

interface DocumentUploadProps {
  onUploadSuccess?: (documentId: string, fileName: string) => void;
}

export const DocumentUpload = ({ onUploadSuccess }: DocumentUploadProps) => {
  const t = useTranslations();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleFilesDrop = async (files: File[]) => {
    // Create new file entries with pending status
    const newFiles = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      status: 'pending' as const,
      progress: 0,
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);

    // Process each file
    for (const fileEntry of newFiles) {
      try {
        // Update status to uploading
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileEntry.id ? { ...f, status: 'uploading' } : f
          )
        );

        const supabaseClient = createSupabaseClient();
        const userId = (await supabaseClient.auth.getUser()).data.user?.id;
        const filePath = `${userId}/${fileEntry.id}/${fileEntry.file.name}`;

        // Set initial progress
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileEntry.id ? { ...f, progress: 0 } : f
          )
        );

        // Upload file to Supabase storage
        await uploadFile(filePath, fileEntry.file);

        // Set progress to 100% when upload is complete
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileEntry.id ? { ...f, progress: 100 } : f
          )
        );

        // Update status to processing
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileEntry.id
              ? { ...f, status: 'processing' }
              : f
          )
        );

        // Update status to complete
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileEntry.id ? { ...f, status: 'complete', documentId: fileEntry.id } : f
          )
        );

        // Call the onUploadSuccess callback if provided
        if (onUploadSuccess) {
          onUploadSuccess(fileEntry.id, fileEntry.file.name);
        }
      } catch (error) {
        // Update status to error
        const errorMessage = error instanceof Error
          ? error.message
          : 'An unknown error occurred';

        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileEntry.id
              ? { ...f, status: 'error', error: errorMessage }
              : f
          )
        );
      }
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 sm:space-y-6">
      <DropZone onFilesDrop={handleFilesDrop} />

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 sm:mt-6 space-y-2">
          {uploadedFiles.map((fileEntry) => (
            <div
              key={fileEntry.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center space-x-2 sm:space-x-3 mb-1 sm:mb-0">
                <FiFile className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                    {fileEntry.file.name}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                    {t('upload.fileSize', { size: (fileEntry.file.size / 1024 / 1024).toFixed(2) })}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-4">
                {/* Status indicator */}
                <div className="flex items-center">
                  {fileEntry.status === 'pending' && (
                    <span className="text-[10px] sm:text-xs text-gray-400">{t('common.pending')}</span>
                  )}
                  {fileEntry.status === 'uploading' && (
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <span className="text-[10px] sm:text-xs text-blue-500">{t('common.uploading', { progress: fileEntry.progress.toFixed(0) })}</span>
                      <FiLoader className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 animate-spin" />
                    </div>
                  )}
                  {fileEntry.status === 'processing' && (
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <span className="text-[10px] sm:text-xs text-yellow-500">{t('common.processing')}</span>
                      <FiLoader className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 animate-spin" />
                    </div>
                  )}
                  {fileEntry.status === 'complete' && (
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <span className="text-[10px] sm:text-xs text-green-500">{t('common.complete')}</span>
                      <FiCheck className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                    </div>
                  )}
                  {fileEntry.status === 'error' && (
                    <span className="text-[10px] sm:text-xs text-red-500 truncate max-w-[150px] sm:max-w-none">
                      {t('common.error')}: {fileEntry.error}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};