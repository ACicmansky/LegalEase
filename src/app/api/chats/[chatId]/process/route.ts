import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/utils/supabase/server';
import { processConversation } from '@/lib/agents/conversationalAgent';
import { ConversationProcessingStage } from '@/lib/agents/types';
import { MessageRecord } from '@/types/chat';

// POST /api/chats/[chatId]/process - Process a message through the Conversational Agent
export async function POST(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const chatId = (await params).chatId;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify chat exists and belongs to user
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select(`*, documents(*)`)
      .eq('id', chatId)
      .eq('user_id', user.id)
      .single();

    if (chatError || !chat) {
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
      
      // Prepare message record based on conversation result
      const messageData: Partial<MessageRecord> = {
        chat_id: chatId,
        content: result.response || "I'm sorry, I couldn't process your request.",
        is_user: false,
        sources: result.sources || [],
        metadata: {
          intent: result.intent,
          guidance: result.guidance,
          followUpQuestions: result.followUpQuestions
        }
      };
      
      // Store the assistant response in the database
      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();
        
      if (error) {
        throw new Error(`Failed to create assistant message: ${error.message}`);
      }
      
      return NextResponse.json(data);
    } catch (processingError) {
      console.error("Error processing user message:", processingError);
      
      // Create fallback response
      const { data } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          content: "I'm sorry, I encountered an error processing your request. Please try again.",
          is_user: false
        })
        .select()
        .single();
        
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Message processing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
