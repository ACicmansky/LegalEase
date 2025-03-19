'use server';

import { createSupabaseServerClient } from "@/lib/utils/supabase/server";
import { Chat } from "@/types/chat";

// Get all chats for the user
export async function getChats(user_id: string, supabaseClient?: Awaited<ReturnType<typeof createSupabaseServerClient>>): Promise<Chat[]> {
    const client = supabaseClient || await createSupabaseServerClient();

    const { data: chats, error } = await client
        .from('chats')
        .select(`*, messages (*)`)
        .eq('user_id', user_id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Failed to fetch chats:', error);
        throw new Error(`Failed to fetch chats: ${error.message}`);
    }

    return chats;
}

// Get chat by id and user_id
export async function getChatById(
    id: string,
    user_id: string,
    include_messages: boolean,
    supabaseClient?: Awaited<ReturnType<typeof createSupabaseServerClient>>
): Promise<Chat> {
    const client = supabaseClient || await createSupabaseServerClient();

    if (include_messages) {
        const { data: chat, error } = await client
            .from('chats')
            .select(`*, messages (*)`)
            .eq('id', id)
            .eq('user_id', user_id)
            .single();

        if (error) {
            console.error('Failed to fetch chat:', error);
            throw new Error(`Failed to fetch chat: ${error.message}`);
        }

        return chat;
    } else {
        const { data: chat, error } = await client
            .from('chats')
            .select('*')
            .eq('id', id)
            .eq('user_id', user_id)
            .single();

        if (error) {
            console.error('Failed to fetch chat:', error);
            throw new Error(`Failed to fetch chat: ${error.message}`);
        }

        // Add empty messages array to match Chat type
        return {
            ...chat,
            messages: []
        } as Chat;
    }
}

// Create chat
export async function createChat(title: string, document_id: string, supabaseClient?: Awaited<ReturnType<typeof createSupabaseServerClient>>): Promise<Chat> {
    const client = supabaseClient || await createSupabaseServerClient();

    const { data: chat, error } = await client
        .from('chats')
        .insert({
            title,
            document_id
        })
        .select(`*, messages (*)`)
        .single();

    if (error) {
        console.error('Failed to create chat:', error);
        throw new Error(`Failed to create chat: ${error.message}`);
    }

    return chat;
}

//Delete chat by id and user_id
export async function deleteChat(chatId: string, user_id: string, supabaseClient?: Awaited<ReturnType<typeof createSupabaseServerClient>>): Promise<void> {
    const client = supabaseClient || await createSupabaseServerClient();

    const { error } = await client
        .from('chats')
        .delete()
        .eq('id', chatId)
        .eq('user_id', user_id);

    if (error) {
        console.error('Failed to delete chat:', error);
        throw new Error(`Failed to delete chat: ${error.message}`);
    }
}