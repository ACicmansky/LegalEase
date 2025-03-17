'use client';

import { ChatMessage, MessageSource } from '@/types/chat';
import DOMPurify from 'dompurify';
import { useTranslations } from 'next-intl';
import { marked } from 'marked';

export function Message({ content, is_user, created_at, sources }: ChatMessage) {
  const t = useTranslations();
  const sanitizedContent = DOMPurify.sanitize(marked.parse(content, { async: false }));
  return (
    <div
      className={`flex ${is_user ? 'justify-end' : 'justify-start'} mb-4`}
    >
      {!is_user && (
        <div className="flex-shrink-0 mr-2 mt-2">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-purple-600 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 text-white">
              <path d="M12 2a10 10 0 0110 10 10 10 0 01-10 10A10 10 0 012 12 10 10 0 0112 2zM7 9a1 1 0 100 2h10a1 1 0 100-2H7zm0 4a1 1 0 100 2h10a1 1 0 100-2H7z" />
            </svg>
          </div>
        </div>
      )}
      <div
        className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-3 sm:p-4 ${is_user
            ? 'bg-purple-600 text-white border-2 border-purple-700'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-purple-600'
          }`}
      >
        <div className="prose dark:prose-invert max-w-none prose-sm sm:prose-base break-words">
          <p className="text-sm sm:text-base font-semibold mb-1">{is_user ? t('chat.you') : t('chat.bot')}</p>
          <div className="text-sm sm:text-base" dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
        </div>

        {sources && sources.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs sm:text-sm text-gray-200 dark:text-gray-400">{t('chat.sources')}:</p>
            <ul className="mt-1 space-y-1">
              {sources.map((source: MessageSource, index: number) => (
                <li
                  key={index}
                  className="text-xs sm:text-sm text-gray-200 dark:text-gray-400 flex items-start"
                >
                  <span className="mr-1 sm:mr-2 flex-shrink-0">📄</span>
                  <span className="break-words">
                    {source.title} {source.page && `(${t('chat.page')} ${source.page})`}
                    {source.section && <span className="ml-1">- {source.section}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-2 text-[10px] sm:text-xs text-gray-200 dark:text-gray-400">
          {new Date(created_at).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
