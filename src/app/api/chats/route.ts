'use server';

import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from "@/lib/utils/supabase/server";
import { getChats, createChat } from "@/lib/services/chatsService";

// GET /api/chats - Get all chats for the current user
export async function GET() {
  try {
    const supabaseClient = await createSupabaseServerClient();

    // Get current user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all chats for the user
    const chats = await getChats(user.id, supabaseClient);

    if (!chats) {
      return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 });
    }

    return NextResponse.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/chats - Create a new chat
export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const { title, document_id } = await request.json();

    // Create chat
    const chat = await createChat(title, document_id, supabase);

    if (!chat) {
      return NextResponse.json({ error: 'Failed to create chat' }, { status: 500 });
    }

    return NextResponse.json(chat);
  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
