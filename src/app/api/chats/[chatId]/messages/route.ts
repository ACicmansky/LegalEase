import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/utils/supabase/server';

/**
 * Creates a message in the database
 * 
 * @param chatId - The ID of the chat
 * @param content - The message content
 * @param isUser - Whether the message is from a user
 * @returns The created message
 */
async function createMessage(chatId: string, content: string, isUser: boolean) {
  const supabase = await createSupabaseServerClient();

  // Store message
  const { data: message, error: messageError } = await supabase
    .from('messages')
    .insert({
      content,
      chat_id: chatId,
      is_user: isUser
    })
    .select()
    .single();

  if (messageError) {
    throw new Error(`Failed to create message: ${messageError.message}`);
  }

  // Update chat's last_message if it's a user message
  if (isUser) {
    const { error: updateError } = await supabase
      .from('chats')
      .update({ last_message: content })
      .eq('id', chatId);

    if (updateError) {
      console.error('Failed to update chat last_message:', updateError);
    }
  }

  return message;
}

// POST /api/chats/[chatId]/messages - Add a message to a chat
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
    const { content, is_user } = await request.json();

    // Create the message
    const message = await createMessage(chatId, content, is_user);
    return NextResponse.json(message);
  } catch (error) {
    console.error('Message creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
