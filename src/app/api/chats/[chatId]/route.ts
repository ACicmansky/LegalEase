import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from "@/utils/supabase/server";

// GET /api/chats/[chatId] - Get a specific chat
export async function GET(
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

    // Get chat
    const { data: chat, error } = await supabase
      .from('chats')
      .select(`
        *,
        messages (*)
      `)
      .eq('id', chatId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    return NextResponse.json(chat);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/chats/[chatId] - Delete a chat
export async function DELETE(
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

    // Delete chat messages first due to foreign key constraint
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .eq('chat_id', chatId);

    if (messagesError) {
      return NextResponse.json({ error: messagesError.message }, { status: 500 });
    }

    // Delete chat
    const { error: chatError } = await supabase
      .from('chats')
      .delete()
      .eq('id', chatId)
      .eq('user_id', user.id);

    if (chatError) {
      return NextResponse.json({ error: chatError.message }, { status: 500 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
