'use client';

import { DocumentUpload } from "@/components/upload/DocumentUpload";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { signIn, user } = useAuth();

  useEffect(() => {
    // Only attempt auto-login if we're in development and not already logged in
    if (process.env.NODE_ENV === 'development' && !user) {
      const testEmail = process.env.NEXT_PUBLIC_TEST_EMAIL;
      const testPassword = process.env.NEXT_PUBLIC_TEST_PASSWORD;
      
      if (testEmail && testPassword) {
        signIn(testEmail, testPassword)
          .catch(error => console.error('Auto-login failed:', error));
      }
    }
  }, [signIn, user]);

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
          {process.env.NODE_ENV === 'development' && (
            <p className="mt-2 text-sm text-gray-500">
              {user ? `Logged in as: ${user.email}` : 'Not logged in'}
            </p>
          )}
        </div>
        
        <DocumentUpload />
      </div>
    </div>
  );
}