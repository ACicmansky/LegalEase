'use client';

interface MessageProps {
  content: string;
  isUser: boolean;
  timestamp: Date;
  sources?: Array<{
    title: string;
    page: number;
  }>;
}

export function Message({ content, isUser, timestamp, sources }: MessageProps) {
  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-4 ${
          isUser
            ? 'bg-purple-600 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
        }`}
      >
        <div className="prose dark:prose-invert max-w-none">
          {content}
        </div>
        
        {sources && sources.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-200 dark:text-gray-400">Sources:</p>
            <ul className="mt-1 space-y-1">
              {sources.map((source, index) => (
                <li
                  key={index}
                  className="text-sm text-gray-200 dark:text-gray-400 flex items-center"
                >
                  <span className="mr-2">📄</span>
                  {source.title} (Page {source.page})
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="mt-2 text-xs text-gray-200 dark:text-gray-400">
          {timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
