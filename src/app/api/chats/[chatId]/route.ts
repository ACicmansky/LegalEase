'use server';

import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from "@/lib/utils/supabase/server";
import { getChatById, deleteChat } from "@/lib/services/chatsService";
import { deleteMessagesByChatId } from "@/lib/services/messagesService";
import { getDocumentByChatId, deleteDocumentByChatId } from '@/lib/services/documentService';
import { deleteFile } from '@/lib/services/storageService';

// GET /api/chats/[chatId] - Get a specific chat
export async function GET(
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

    // Get chat
    const chat = await getChatById(chatId, user.id, true, supabaseClient);

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    return NextResponse.json(chat);
  } catch (error) {
    console.error('Error fetching chat:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/chats/[chatId] - Delete a chat
export async function DELETE(
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

    // if exist delete document from table and delete file from storage
    const document = await getDocumentByChatId(chatId, supabaseClient);
    if (document) {
      await deleteFile(document.filepath, supabaseClient);
      await deleteDocumentByChatId(chatId, supabaseClient);
    }

    // Delete chat messages first due to foreign key constraint
    await deleteMessagesByChatId(chatId, supabaseClient);

    // Delete chat
    await deleteChat(chatId, user.id, supabaseClient);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
