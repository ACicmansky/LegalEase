'use client';

import { useState } from 'react';
import { DropZone } from './DropZone';
import { FiFile, FiCheck, FiTrash2 } from 'react-icons/fi';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

interface UploadedFile {
  id: string;
  file: File;
  status: 'ready' | 'error';
  error?: string;
}

interface DocumentUploadProps {
  onUploadSuccess: (document: File) => void;
}

export const DocumentUpload = ({ onUploadSuccess }: DocumentUploadProps) => {
  const t = useTranslations();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleFilesDrop = async (files: File[]) => {
    // We only process one file at a time for document analysis
    if (!files.length) return;

    const file = files[0];

    // Validate file type (PDF, DOCX, DOC, TXT, etc.)
    const acceptedTypes = ['.pdf', '.docx', '.doc', '.txt', '.rtf', '.pptx', '.ppt', '.xlsx', '.xls'];
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;

    if (!acceptedTypes.includes(fileExtension)) {
      const newFile = {
        id: crypto.randomUUID(),
        file,
        status: 'error' as const,
        error: t('upload.invalidFileType')
      };

      setUploadedFiles([newFile]);
      return;
    }

    // Check file size (max 20MB)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      const newFile = {
        id: crypto.randomUUID(),
        file,
        status: 'error' as const,
        error: t('upload.fileTooLarge', { maxMB: 20 })
      };

      setUploadedFiles([newFile]);
      return;
    }

    // Add file to list with ready status
    const newFile = {
      id: crypto.randomUUID(),
      file,
      status: 'ready' as const
    };

    // Replace any existing files (single file mode)
    setUploadedFiles([newFile]);

    // Immediately call upload success callback
    onUploadSuccess(file);
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
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
                  {fileEntry.status === 'ready' && (
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <span className="text-[10px] sm:text-xs text-green-500">{t('common.ready')}</span>
                      <FiCheck className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                    </div>
                  )}
                  {fileEntry.status === 'error' && (
                    <div className="flex items-center">
                      <span className="text-[10px] sm:text-xs text-red-500 truncate max-w-[150px] sm:max-w-none">
                        {t('common.error')}: {fileEntry.error}
                      </span>
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-2 h-6 w-6"
                    onClick={() => handleRemoveFile(fileEntry.id)}
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};