'use server';

import { createSupabaseServerClient } from "@/lib/utils/supabase/server";
import { DocumentProcessingResult } from "@/lib/agents/schemas/documentProcessingSchemas";

// Create new processing
export async function addDocumentProcessing(documentProcessing: DocumentProcessingResult, supabaseClient?: Awaited<ReturnType<typeof createSupabaseServerClient>>): Promise<DocumentProcessingResult> {
    const client = supabaseClient || await createSupabaseServerClient();

    const { data: processing, error } = await client
        .from('document_processnig')
        .insert({
            anonymizedContent: documentProcessing.anonymizedContent,
            keyInformation: documentProcessing.keyInformation,
            legalAnalysis: documentProcessing.legalAnalysis,
            consistencyChecks: documentProcessing.consistencyChecks,
            detailedAnalysis: documentProcessing.detailedAnalysis,
            simplifiedSummary: documentProcessing.simplifiedSummary
        })
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to create processing: ${error.message}`);
    }

    return processing;
}

// Get processing by chat_id
export async function getDocumentProcessing(chatId: string, supabaseClient?: Awaited<ReturnType<typeof createSupabaseServerClient>>): Promise<DocumentProcessingResult | null> {
    const client = supabaseClient || await createSupabaseServerClient();

    const { data: processing, error } = await client
        .from('document_processnig')
        .select('*')
        .eq('chat_id', chatId)
        .single();

    if (error) {
        throw new Error(`Failed to get processing: ${error.message}`);
    }

    return processing;
}

// Check if processing already exists
export async function checkDocumentProcessingExists(chatId: string, supabaseClient?: Awaited<ReturnType<typeof createSupabaseServerClient>>): Promise<boolean> {
    const client = supabaseClient || await createSupabaseServerClient();

    const { data: processing, error } = await client
        .from('document_processnig')
        .select('id')
        .eq('chat_id', chatId)
        .maybeSingle();

    if (error) {
        throw new Error(`Failed to check processing: ${error.message}`);
    }

    return !!processing;
}

// Update existing processing by chat_id
export async function updateDocumentProcessing(chatId: string, processing: DocumentProcessingResult, supabaseClient?: Awaited<ReturnType<typeof createSupabaseServerClient>>): Promise<DocumentProcessingResult> {
    const client = supabaseClient || await createSupabaseServerClient();

    const { data: updatedProcessing, error } = await client
        .from('document_processnig')
        .update({
            anonymizedContent: processing.anonymizedContent,
            keyInformation: processing.keyInformation,
            legalAnalysis: processing.legalAnalysis,
            consistencyChecks: processing.consistencyChecks,
            detailedAnalysis: processing.detailedAnalysis,
            simplifiedSummary: processing.simplifiedSummary
        })
        .eq('chat_id', chatId)
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to update processing: ${error.message}`);
    }

    return updatedProcessing;
}