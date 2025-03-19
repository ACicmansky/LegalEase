'use server';

import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/utils/supabase/server';
import { getChatById } from '@/lib/services/chatsService';
import { createMessage } from '@/lib/services/messagesService';

// POST /api/chats/[chatId]/messages - Add a message to a chat
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
    const { content, is_user } = await request.json();

    // Create the message
    const message = await createMessage(chatId, content, is_user, supabaseClient);
    return NextResponse.json(message);
  } catch (error) {
    console.error('Message creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
