'use client';

import { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { DropZone } from './DropZone';
import { FiFile, FiX, FiCheck, FiLoader } from 'react-icons/fi';

interface UploadedFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
  progress: number;
  error?: string;
  downloadUrl?: string;
}

export const DocumentUpload = () => {
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

        // Create a storage reference
        const storageRef = ref(storage, `documents/${fileEntry.id}/${fileEntry.file.name}`);
        
        // Start upload task
        const uploadTask = uploadBytesResumable(storageRef, fileEntry.file);

        // Listen to upload progress
        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadedFiles((prev) =>
                prev.map((f) =>
                  f.id === fileEntry.id ? { ...f, progress } : f
                )
              );
            },
            (error) => {
              reject(error);
            },
            async () => {
              try {
                // Get download URL
                const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);

                // Update status to processing
                setUploadedFiles((prev) =>
                  prev.map((f) =>
                    f.id === fileEntry.id
                      ? { ...f, status: 'processing', progress: 100, downloadUrl }
                      : f
                  )
                );

                // Process the document (this will be integrated with the actual processing pipeline)
                await processDocument(fileEntry.file);

                // Update status to complete
                setUploadedFiles((prev) =>
                  prev.map((f) =>
                    f.id === fileEntry.id ? { ...f, status: 'complete' } : f
                  )
                );

                resolve(undefined);
              } catch (error) {
                reject(error);
              }
            }
          );
        });
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

  const removeFile = async (id: string) => {
    const fileToRemove = uploadedFiles.find(f => f.id === id);
    if (fileToRemove?.downloadUrl) {
      try {
        // Create a reference to the file to delete
        const fileRef = ref(storage, fileToRemove.downloadUrl);
        await deleteObject(fileRef);
      } catch (error) {
        console.error('Error removing file from storage:', error);
      }
    }
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <DropZone onFilesDrop={handleFilesDrop} />

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6 space-y-2">
          {uploadedFiles.map((fileEntry) => (
            <div
              key={fileEntry.id}
              className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center space-x-3">
                <FiFile className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {fileEntry.file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(fileEntry.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Status indicator */}
                <div className="flex items-center">
                  {fileEntry.status === 'pending' && (
                    <span className="text-gray-400">Pending</span>
                  )}
                  {fileEntry.status === 'uploading' && (
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-500">{fileEntry.progress.toFixed(0)}%</span>
                      <FiLoader className="w-4 h-4 text-blue-500 animate-spin" />
                    </div>
                  )}
                  {fileEntry.status === 'processing' && (
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-500">Processing</span>
                      <FiLoader className="w-4 h-4 text-yellow-500 animate-spin" />
                    </div>
                  )}
                  {fileEntry.status === 'complete' && (
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500">Complete</span>
                      <FiCheck className="w-4 h-4 text-green-500" />
                    </div>
                  )}
                  {fileEntry.status === 'error' && (
                    <span className="text-red-500">Error: {fileEntry.error}</span>
                  )}
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeFile(fileEntry.id)}
                  className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Temporary function to process document
const processDocument = async (file: File) => {
  // This will be replaced with actual document processing logic
  return new Promise((resolve) => setTimeout(resolve, 1500));
};
