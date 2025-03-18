'use server';

import { createSupabaseServerClient } from "@/lib/utils/supabase/server";

// Delete file from storage
export async function deleteFile(filePath: string) {
    const { error } = await (await createSupabaseServerClient())
        .storage
        .from('documents')
        .remove([filePath!]);

    if (error) {
        console.error('Failed to delete file:', error);
        throw new Error(`Failed to delete file: ${error.message}`);
    }
}

// Delete file by chatId

// Upload file to supabase storage
export async function uploadFile(filePath: string, file: File) {
    const { error } = await (await createSupabaseServerClient())
        .storage
        .from('documents')
        .upload(filePath, file);

    if (error) {
        console.error('Failed to upload file:', error);
        throw new Error(`Failed to upload file: ${error.message}`);
    }
}