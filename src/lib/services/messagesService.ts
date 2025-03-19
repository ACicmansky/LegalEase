'use server';

import { createSupabaseServerClient } from "@/lib/utils/supabase/server";
import { ChatMessage, ChatMessageExtended, MessageSource, MessageType } from "@/types/chat";

//Create ChatMessage
export async function createMessage(
    chat_id: string,
    content: string,
    type: MessageType,
    supabaseClient?: Awaited<ReturnType<typeof createSupabaseServerClient>>
): Promise<ChatMessage> {
    const client = supabaseClient || await createSupabaseServerClient();

    // Insert into database
    const { data: message, error: messageError } = await client
        .from('messages')
        .insert({
            content,
            chat_id,
            type
        })
        .select()
        .single();

    if (messageError) {
        throw new Error(`Failed to create message: ${messageError.message}`);
    }

    return message;
}

//Create ChatMessageExtended
export async function createMessageExtended(
    chat_id: string,
    content: string,
    type: MessageType,
    sources: MessageSource[],
    metadata: ChatMessageExtended['metadata'],
    supabaseClient?: Awaited<ReturnType<typeof createSupabaseServerClient>>
): Promise<ChatMessageExtended> {
    const client = supabaseClient || await createSupabaseServerClient();

    // Insert into database
    const { data: message, error: messageError } = await client
        .from('messages')
        .insert({
            content,
            type,
            chat_id,
            sources,
            metadata
        })
        .select()
        .single();

    if (messageError) {
        throw new Error(`Failed to create message: ${messageError.message}`);
    }

    return message;
}

//Get ChatMessageExtended by chat_id with limit
export async function getMessagesByChatId(chat_id: string, type: MessageType[], limit: number, supabaseClient?: Awaited<ReturnType<typeof createSupabaseServerClient>>): Promise<ChatMessageExtended[]> {
    const client = supabaseClient || await createSupabaseServerClient();

    const { data: messages, error: messagesError } = await client
        .from('messages')
        .select('*')
        .eq('chat_id', chat_id)
        .in('type', type)
        .order('created_at', { ascending: true })
        .limit(limit);

    if (messagesError) {
        throw new Error(`Failed to get messages: ${messagesError.message}`);
    }

    return messages;
}

//Delete messages by chat_id
export async function deleteMessagesByChatId(chat_id: string, supabaseClient?: Awaited<ReturnType<typeof createSupabaseServerClient>>): Promise<void> {
    const client = supabaseClient || await createSupabaseServerClient();

    const { error } = await client
        .from('messages')
        .delete()
        .eq('chat_id', chat_id);

    if (error) {
        console.error('Failed to delete messages:', error);
        throw new Error(`Failed to delete messages: ${error.message}`);
    }
}