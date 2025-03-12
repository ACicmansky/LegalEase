'use client';

import { ChatMessage } from '@/types/chat';
import DOMPurify from 'dompurify';
import { useTranslations } from 'next-intl';
import { marked } from 'marked';

export function Message({ content, is_user: is_user, created_at, sources }: ChatMessage) {
  const t = useTranslations();
  const sanitizedContent = DOMPurify.sanitize(marked.parse(content, { async: false }));
  return (
    <div
      className={`flex ${is_user ? 'justify-end' : 'justify-start'} mb-4`}
    >
      {!is_user && (
        <div className="mr-2 mt-2">
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
              <path d="M12 2a10 10 0 0110 10 10 10 0 01-10 10A10 10 0 012 12 10 10 0 0112 2zM7 9a1 1 0 100 2h10a1 1 0 100-2H7zm0 4a1 1 0 100 2h10a1 1 0 100-2H7z" />
            </svg>
          </div>
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-lg p-4 ${
          is_user
            ? 'bg-purple-600 text-white border-2 border-purple-700'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-purple-600'
        }`}
      >
        <div className="prose dark:prose-invert max-w-none">
          <p><strong>{is_user ? t('chat.you') : t('chat.bot')}</strong></p>
          <div dangerouslySetInnerHTML={{ __html: sanitizedContent }}/>
        </div>
        
        {sources && sources.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-200 dark:text-gray-400">{t('chat.sources')}:</p>
            <ul className="mt-1 space-y-1">
              {sources.map((source, index) => (
                <li
                  key={index}
                  className="text-sm text-gray-200 dark:text-gray-400 flex items-center"
                >
                  <span className="mr-2">📄</span>
                  {source.title} ({t('chat.page')} {source.page})
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="mt-2 text-xs text-gray-200 dark:text-gray-400">
          {new Date(created_at).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
