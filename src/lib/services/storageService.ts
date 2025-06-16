'use server';

import { createSupabaseServerClient } from "@/lib/utils/supabase/server";

// Upload file to supabase storage
export async function uploadFile(filepath: string, file: File) {
    const { error } = await (await createSupabaseServerClient())
        .storage
        .from('documents')
        .upload(filepath, file);

    if (error) {
        console.error('Failed to upload file:', error);
        throw new Error(`Failed to upload file: ${error.message}`);
    }
}

// Delete file from storage
export async function deleteFile(filepath: string, supabaseClient?: Awaited<ReturnType<typeof createSupabaseServerClient>>) {
    const client = supabaseClient || await createSupabaseServerClient();
    const { error } = await client
        .storage
        .from('documents')
        .remove([filepath!]);

    if (error) {
        console.error('Failed to delete file:', error);
        throw new Error(`Failed to delete file: ${error.message}`);
    }
}