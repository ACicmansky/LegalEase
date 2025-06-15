'use server';

import { createSupabaseServerClient } from '@/lib/utils/supabase/server';
import { getChatById } from '@/lib/services/chatsService';
import { createMessageExtended, createMessage } from '@/lib/services/messagesService';
import { MessageType } from '@/types/chat';
import { processConversation } from '@/lib/agents/conversationalAgentStreaming';

// POST /api/chats/[chatId]/process - Process a message through the Conversational Agent with streaming support
export async function POST(
  request: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;
    const supabaseClient = await createSupabaseServerClient();

    // Get current user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify chat exists and belongs to user
    const chat = await getChatById(chatId, user.id, false, supabaseClient);
    if (!chat) {
      return new Response(JSON.stringify({ error: 'Chat not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get request body
    const { content } = await request.json();
    if (!content) {
      return new Response(JSON.stringify({ error: 'Content is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      // Use the updated processConversation function
      const { response, guidance } = await processConversation(chatId, content, chat.document_id || undefined);

      // Store assistant response in database
      const message = await createMessageExtended(
        chatId,
        response.text,
        MessageType.Assistant,
        response.sources,
        {
          intent: response.intent,
          followUpQuestions: response.followUpQuestions,
          guidance: guidance
        },
        supabaseClient
      );

      // Return the response with proper headers
      return new Response(
        JSON.stringify({
          message
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (processingError) {
      console.error('Error processing user message:', processingError);

      // Create fallback response
      const message = await createMessage(
        chatId,
        'Prepáčte, nepodarilo sa mi spracovať vašu požiadavku. Opýtajte sa znova prosím.',
        MessageType.Error,
        supabaseClient
      );

      return new Response(
        JSON.stringify({
          error: 'Processing error',
          message
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    console.error('Message processing error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
