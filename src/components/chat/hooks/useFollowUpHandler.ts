import { useEffect } from 'react';

export function useFollowUpHandler(
  chatId: string | undefined,
  handleSendMessage: (message: string) => Promise<void>
) {
  useEffect(() => {
    // Define the event handler
    const handleFollowUpQuestionClick = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { question } = customEvent.detail;

      if (question && chatId) {
        handleSendMessage(question);
      }
    };

    // Add event listener
    document.addEventListener('followUpQuestionClicked', handleFollowUpQuestionClick);

    // Cleanup: remove event listener
    return () => {
      document.removeEventListener('followUpQuestionClicked', handleFollowUpQuestionClick);
    };
  }, [chatId, handleSendMessage]);
}
