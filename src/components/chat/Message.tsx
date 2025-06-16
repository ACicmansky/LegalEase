'use client';

import { ChatMessageExtended, LegalGuidance, MessageSource, MessageType } from '@/types/chat';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import Markdown from 'react-markdown';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge'

export function Message({ content, type, created_at, sources, metadata }: ChatMessageExtended) {
  // Validate message properties are properly defined
  const timestamp = typeof created_at === 'string' || created_at instanceof Date ? created_at : null;
  const t = useTranslations();
  const isUser = type === MessageType.User;
  const followUpQuestions = metadata?.followUpQuestions;
  const legalGuidance = metadata?.guidance as LegalGuidance | undefined;
  const isPlaceHolder = type === MessageType.Placeholder;

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
          <div className={`text-sm sm:text-base ${isPlaceHolder ? 'animate-pulse' : ''}`}>
            <Markdown>{content}</Markdown>
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

        {!isUser && legalGuidance && (
          <div className="mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-purple-900 dark:text-purple-300 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                  {t('chat.legalGuidance')}
                </CardTitle>
                <CardDescription className="text-purple-800 dark:text-purple-400">
                  {t('chat.legalGuidanceDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm">
                {legalGuidance.timeframe && (
                  <div className="mb-3">
                    <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-1">{t('chat.timeframe')}:</h4>
                    <div className="text-gray-800 dark:text-gray-300"><Markdown>{legalGuidance.timeframe}</Markdown></div>
                  </div>
                )}

                {legalGuidance.steps && legalGuidance.steps.length > 0 && (
                  <div className="mb-3">
                    <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-1">{t('chat.recommendedSteps')}:</h4>
                    <ol className="list-decimal pl-5 text-gray-800 dark:text-gray-300">
                      {legalGuidance.steps.map((step, index) => (
                        <li key={index} className="mb-1"><Markdown>{step}</Markdown></li>
                      ))}
                    </ol>
                  </div>
                )}

                {legalGuidance.relevantLaws && legalGuidance.relevantLaws.length > 0 && (
                  <div className="mb-3">
                    <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-1">{t('chat.relevantLaws')}:</h4>
                    <div className="flex flex-wrap gap-2">
                      {legalGuidance.relevantLaws.map((law, index) => (
                        <Badge key={index} variant="outline" className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700">
                          <Markdown>{law}</Markdown>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* {legalGuidance.risks && legalGuidance.risks.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-1">{t('chat.potentialRisks')}:</h4>
                    <ul className="list-disc pl-5 text-gray-800 dark:text-gray-300">
                      {legalGuidance.risks.map((risk, index) => (
                        <li key={index} className="mb-1">{risk}</li>
                      ))}
                    </ul>
                  </div>
                )} */}
              </CardContent>
            </Card>
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

        <div className="mt-2 text-[10px] sm:text-xs text-gray-300 dark:text-gray-400">
          {timestamp && !isNaN(new Date(timestamp).getTime())
            ? new Date(timestamp).toLocaleTimeString()
            : ''}
        </div>
      </div>
    </div>
  );
}
