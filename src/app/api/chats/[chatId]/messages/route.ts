import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from "@/utils/supabase/server";

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
      .select()
      .eq('id', chatId)
      .eq('user_id', user.id)
      .single();

    if (chatError || !chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Get request body
    const { content, is_user } = await request.json();

    // Create message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        content,
        chat_id: chatId,
        is_user,
      })
      .select()
      .single();

    if (messageError) {
      return NextResponse.json({ error: messageError.message }, { status: 500 });
    }

    // Update chat's last_message
    const { error: updateError } = await supabase
      .from('chats')
      .update({ last_message: content })
      .eq('id', chatId);

    if (updateError) {
      console.error('Failed to update chat last_message:', updateError);
    }

    return NextResponse.json(message);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
