'use server';

import { createSupabaseServerClient } from "@/lib/utils/supabase/server";

// Create document record in Supabase
export async function addDocument(
  id: string,
  name: string,
  chat_id: string,
  supabaseClient?: Awaited<ReturnType<typeof createSupabaseServerClient>>
) {
  const client = supabaseClient || await createSupabaseServerClient();

  const { data: document, error: documentError } = await client
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

  return document;
}

// Delete document record from Supabase
export async function deleteDocument(id: string, supabaseClient?: Awaited<ReturnType<typeof createSupabaseServerClient>>) {
  const client = supabaseClient || await createSupabaseServerClient();

  const { error: documentError } = await client
    .from('documents')
    .delete()
    .eq('id', id);

  if (documentError) {
    console.error('Failed to delete document record:', documentError);
    throw new Error(`Failed to delete document record: ${documentError.message}`);
  }
}

// Get document by ID
export async function getDocumentById(id: string, supabaseClient?: Awaited<ReturnType<typeof createSupabaseServerClient>>) {
  const client = supabaseClient || await createSupabaseServerClient();

  const { data: document, error: documentError } = await client
    .from('documents')
    .select('*')
    .eq('id', id)
    .single();

  if (documentError) {
    console.error('Failed to fetch document:', documentError);
    throw new Error(`Failed to fetch document: ${documentError.message}`);
  }

  return document;
}