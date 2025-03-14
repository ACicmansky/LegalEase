'use server';

import { createSupabaseServerClient } from "@/lib/utils/supabase/server";

// Create document record in Supabase
export async function addDocument(id: string, name: string, chat_id: string) {
  const { data: document, error: documentError } = await (await createSupabaseServerClient())
    .from('documents')
    .insert({
      id,
      name,
      chat_id
    })
    .select()
    .single();

  if (documentError) {
    console.error('Failed to create document record:', documentError);
    throw new Error(`Failed to create document record: ${documentError.message}`);
  }
}
