import {
  ref,
  uploadBytesResumable,
  getDownloadURL as getFirebaseDownloadURL,
  listAll,
  deleteObject,
} from 'firebase/storage';
import { storage } from '@/lib/firebase';

// Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['application/pdf'];
const STORAGE_PATH = 'pdfs';

// Custom error class for file-related errors
class FileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileError';
  }
}

// Types
export type UploadProgressCallback = (progress: number) => void;

/**
 * Validates a file before upload
 * @param file File to validate
 * @throws FileError if validation fails
 */
const validateFile = (file: File) => {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new FileError('Only PDF files are allowed');
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new FileError('File size must be less than 10MB');
  }
};

/**
 * Generates a unique file name for storage
 * @param originalName Original file name
 * @returns Unique file name
 */
const generateUniqueFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  return `${timestamp}-${randomString}.${extension}`;
};

/**
 * Uploads a file to Firebase Storage
 * @param file File to upload
 * @param onProgress Optional callback for upload progress
 * @returns Promise resolving to the download URL
 */
export const uploadFile = async (
  file: File,
  onProgress?: UploadProgressCallback
): Promise<string> => {
  try {
    validateFile(file);

    const fileName = generateUniqueFileName(file.name);
    const storageRef = ref(storage, `${STORAGE_PATH}/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          reject(new Error('Failed to upload file'));
        },
        async () => {
          try {
            const downloadURL = await getFirebaseDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            console.error('Error getting download URL:', error);
            reject(new Error('Failed to get download URL'));
          }
        }
      );
    });
  } catch (error) {
    if (error instanceof FileError) {
      throw error;
    }
    console.error('Upload error:', error);
    throw new Error('Failed to upload file');
  }
};

/**
 * Deletes a file from Firebase Storage
 * @param path Full path or URL of the file to delete
 */
export const deleteFile = async (path: string): Promise<void> => {
  try {
    // Extract file path from URL if needed
    const filePath = path.includes('firebase')
      ? path.split('/o/')[1].split('?')[0].replace(/%2F/g, '/')
      : path;

    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Delete error:', error);
    throw new Error('Failed to delete file');
  }
};

/**
 * Gets the download URL for a file
 * @param path Path to the file in storage
 * @returns Promise resolving to the download URL
 */
export const getDownloadURL = async (path: string): Promise<string> => {
  try {
    const fileRef = ref(storage, path);
    return await getFirebaseDownloadURL(fileRef);
  } catch (error) {
    console.error('Download URL error:', error);
    throw new Error('Failed to get download URL');
  }
};

/**
 * Lists all files in the storage
 * @returns Promise resolving to an array of file paths
 */
export const listFiles = async (): Promise<string[]> => {
  try {
    const storageRef = ref(storage, STORAGE_PATH);
    const result = await listAll(storageRef);
    return result.items.map(item => item.fullPath);
  } catch (error) {
    console.error('List files error:', error);
    throw new Error('Failed to list files');
  }
};
