'use server';

import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/utils/supabase/server';
import { processConversation } from '@/lib/agents/conversationalAgent';
import { ConversationProcessingStage } from '@/lib/agents/types';
import { getChatById } from '@/lib/services/chatsService';
import { createMessageExtended, createMessage } from '@/lib/services/messagesService';
import { MessageType } from '@/types/chat';

// POST /api/chats/[chatId]/process - Process a message through the Conversational Agent
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify chat exists and belongs to user
    const chat = await getChatById(chatId, user.id, false, supabaseClient);

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Get request body
    const { content } = await request.json();
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    try {
      // Process the message through the conversational agent
      const result = await processConversation(chatId, content, chat.document_id);

      if (result.processingStage === ConversationProcessingStage.Error) {
        throw new Error(result.error || "Error processing message");
      }

      // Store the assistant response in the database
      const type = result.response ? MessageType.Assistant : MessageType.Error;
      const message = await createMessageExtended(
        chatId,
        result.response || "Prepáčte, nepodarilo sa mi spracovať vašu požiadavku.",
        type,
        result.sources || [],
        {
          intent: result.intent,
          guidance: result.guidance,
          followUpQuestions: result.followUpQuestions
        },
        supabaseClient
      );

      if (!message) {
        throw new Error('Failed to create assistant message');
      }

      return NextResponse.json(message);
    } catch (processingError) {
      console.error("Error processing user message:", processingError);

      // Create fallback response
      const message = await createMessage(
        chatId,
        "Prepáčte, nepodarilo sa mi spracovať vašu požiadavku. Opýtajte sa znova prosím.",
        MessageType.Error,
        supabaseClient)

      if (!message) {
        throw new Error('Failed to create fallback message');
      };

      return NextResponse.json(message);
    }
  } catch (error) {
    console.error('Message processing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
