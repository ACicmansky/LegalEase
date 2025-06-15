'use client';

import { ChatMessageExtended, MessageSource, MessageType } from '@/types/chat';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import Markdown from 'react-markdown'

export function Message({ content, type, created_at, sources, metadata }: ChatMessageExtended) {
  // Validate message properties are properly defined
  const timestamp = typeof created_at === 'string' || created_at instanceof Date ? created_at : null;
  const t = useTranslations();
  const isUser = type === MessageType.User;
  const followUpQuestions = metadata?.followUpQuestions;

  const handleFollowUpClick = (question: string) => {
    // Create a custom event to handle the follow-up question
    const event = new CustomEvent('followUpQuestionClicked', {
      detail: { question }
    });
    document.dispatchEvent(event);
  };

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      {!isUser && (
        <div className="flex-shrink-0 mr-2 mt-2">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-purple-600 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 text-white">
              <path d="M12 2a10 10 0 0110 10 10 10 0 01-10 10A10 10 0 012 12 10 10 0 0112 2zM7 9a1 1 0 100 2h10a1 1 0 100-2H7zm0 4a1 1 0 100 2h10a1 1 0 100-2H7z" />
            </svg>
          </div>
        </div>
      )}
      <div
        className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-3 sm:p-4 ${isUser
          ? 'bg-purple-600 text-white border-2 border-purple-700'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-purple-600'
          }`}
      >
        <div className="prose dark:prose-invert max-w-none prose-sm sm:prose-base break-words">
          <p className="text-sm sm:text-base font-semibold mb-1">{isUser ? t('chat.you') : t('chat.bot')}</p>
          <div className="text-sm sm:text-base">
            {typeof content === 'string' && content.trim().length > 0 ?
              <Markdown>{content}</Markdown> :
              <span className="text-red-500">No content available</span>}
          </div>
        </div>

        {sources && sources.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('chat.sources')}:</p>
            <ul className="mt-1 space-y-1">
              {sources.map((source: MessageSource, index: number) => (
                <li
                  key={index}
                  className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-start"
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

        {!isUser && followUpQuestions && followUpQuestions.length > 0 && (
          <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
            {followUpQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600 max-w-full truncate"
                title={question}
                onClick={() => handleFollowUpClick(question)}
              >
                <span className="truncate block">{question}</span>
              </Button>
            ))}
          </div>
        )}

        <div className="mt-2 text-[10px] sm:text-xs text-gray-200 dark:text-gray-400">
          {timestamp && !isNaN(new Date(timestamp).getTime())
            ? new Date(timestamp).toLocaleTimeString()
            : ''}
        </div>
      </div>
    </div>
  );
}
