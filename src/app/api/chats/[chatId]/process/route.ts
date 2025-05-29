'use server';

import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/utils/supabase/server';
import { getChatById } from '@/lib/services/chatsService';
import { createMessageExtended, createMessage } from '@/lib/services/messagesService';
import { ConversationIntent, MessageType } from '@/types/chat';
import { processConversation } from '@/lib/agents/hybridAgent/index';

/**
 * Maps our new agent's intent categories to the existing ConversationIntent enum
 */
function mapIntentToConversationIntent(intentCategory: string): ConversationIntent {
  switch (intentCategory.toLowerCase()) {
    case 'legal_lookup':
    case 'law_citation':
    case 'legal_guidance':
      return ConversationIntent.LegalGuidance;
    case 'document_question':
    case 'document_analysis':
      return ConversationIntent.DocumentQuestion;
    case 'clarification':
      return ConversationIntent.Clarification;
    case 'general':
    default:
      return ConversationIntent.General;
  }
}

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
      // Process the message through the hybrid agent
      const result = await processConversation(content, chatId, chat.document_id);

      if (result.error) {
        throw new Error(result.error || "Error processing message");
      }

      // Map the intent from our new agent format to the ConversationIntent enum
      const mappedIntent = result.intent ? mapIntentToConversationIntent(result.intent.category) : undefined;

      // Create a guidance object from our entities and laws
      const guidance = {
        steps: [],
        relevantLaws: result.lawsReferenced?.map(law => `${law.name}${law.section ? ` §${law.section}` : ''}`) || [],
        timeframe: '',
        risks: []
      };

      // Store the assistant response in the database
      const type = result.response ? MessageType.Assistant : MessageType.Error;
      const message = await createMessageExtended(
        chatId,
        result.response || "Prepáčte, nepodarilo sa mi spracovať vašu požiadavku.",
        type,
        result.sources || [],
        {
          intent: mappedIntent,
          guidance: guidance,
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
