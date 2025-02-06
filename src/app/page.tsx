import { DocumentUpload } from "@/components/upload/DocumentUpload";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Legal Document Analysis
          </h1>
          <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">
            Upload your legal documents and ask questions about them
          </p>
        </div>
        
        <DocumentUpload />
      </div>
    </div>
  );
}