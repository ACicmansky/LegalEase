'use client';

import { useRouter } from 'next/navigation';
import DocIcon from '@/components/ui/DocIcon';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { uploadFile } from '@/services/firebaseStorage';
import PDFUploader from '@/components/PDFUploader';

export default function DashboardClient({ docsList }: { docsList: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (file: File) => {
    try {
      if (docsList.length > 3) {
        throw new Error("You've reached your limit for PDFs.");
      }

      setLoading(true);
      setUploadProgress(0);

      const fileUrl = await uploadFile(file, (progress) => {
        setUploadProgress(progress);
      });

      await ingestPdf(fileUrl, file.name);
    } catch (error) {
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload file');
      setLoading(false);
    }
  };

  async function ingestPdf(fileUrl: string, fileName: string) {
    try {
      const res = await fetch('/api/ingestPdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileUrl,
          fileName,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to process PDF');
      }

      const data = await res.json();
      router.push(`/document/${data.id}`);
    } catch (error) {
      console.error('Ingest error:', error);
      alert('Failed to process PDF');
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex flex-col gap-4 container mt-10">
      <h1 className="text-4xl leading-[1.1] tracking-tighter font-medium text-center">
        Chat With Your PDFs
      </h1>
      {docsList.length > 0 && (
        <div className="flex flex-col gap-4 mx-10 my-5">
          <div className="flex flex-col shadow-sm border divide-y-2 sm:min-w-[650px] mx-auto">
            {docsList.map((doc: any) => (
              <div
                key={doc.id}
                className="flex justify-between p-3 hover:bg-gray-100 transition sm:flex-row flex-col sm:gap-0 gap-3"
              >
                <button
                  onClick={() => router.push(`/document/${doc.id}`)}
                  className="flex gap-4"
                >
                  <DocIcon />
                  <span>{doc.fileName}</span>
                </button>
                <span>{formatDistanceToNow(doc.createdAt)} ago</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {docsList.length > 0 ? (
        <h2 className="text-3xl leading-[1.1] tracking-tighter font-medium text-center">
          Or upload a new PDF
        </h2>
      ) : (
        <h2 className="text-3xl leading-[1.1] tracking-tighter font-medium text-center mt-5">
          No PDFs found. Upload a new PDF below!
        </h2>
      )}
      <div className="mx-auto min-w-[450px] flex justify-center">
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center mt-4 px-4 py-2 font-semibold leading-6 text-lg shadow rounded-md text-black transition ease-in-out duration-150 cursor-not-allowed"
            >
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {uploadProgress < 100 ? 'Uploading...' : 'Processing your PDF...'}
            </button>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </div>
        ) : (
          <PDFUploader onFileSelect={handleFileUpload} />
        )}
      </div>
    </div>
  );
}
