import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from "@/utils/supabase/server";

// GET /api/chats - Get all chats for the current user
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all chats for the user
    const { data: chats, error } = await supabase
      .from('chats')
      .select(`
        *,
        messages (*)
      `)
      .eq('user', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(chats);
  } catch (error) {
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
    const { title, documentName } = await request.json();

    // Create chat
    const { data: chat, error } = await supabase
      .from('chats')
      .insert({
        title,
        document: documentName,
        user: user.id,
      })
      .select(`
        *,
        messages (*)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(chat);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
