'use server';

import { createSupabaseServerClient } from "@/lib/utils/supabase/server";
import { DocumentAnalysis } from "@/lib/agents/types";

// Create new analysis
export async function createDocumentAnalysis(documentAnalysis: DocumentAnalysis, supabaseClient?: Awaited<ReturnType<typeof createSupabaseServerClient>>): Promise<DocumentAnalysis> {
    const client = supabaseClient || await createSupabaseServerClient();

    const { data: analysis, error } = await client
        .from('document_analyses')
        .insert({
            document_id: documentAnalysis.document_id,
            key_information: documentAnalysis.key_information,
            legal_analysis: documentAnalysis.legal_analysis,
            consistency_checks: documentAnalysis.consistency_checks,
            summary: documentAnalysis.summary
        })
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to create analysis: ${error.message}`);
    }

    return analysis;
}

// Get analysis by document_id
export async function getDocumentAnalysis(documentId: string, supabaseClient?: Awaited<ReturnType<typeof createSupabaseServerClient>>): Promise<DocumentAnalysis | null> {
    const client = supabaseClient || await createSupabaseServerClient();

    const { data: analysis, error } = await client
        .from('document_analyses')
        .select('*')
        .eq('document_id', documentId)
        .single();

    if (error) {
        throw new Error(`Failed to get analysis: ${error.message}`);
    }

    return analysis;
}

// Check if analysis already exists
export async function checkDocumentAnalysisExists(documentId: string, supabaseClient?: Awaited<ReturnType<typeof createSupabaseServerClient>>): Promise<boolean> {
    const client = supabaseClient || await createSupabaseServerClient();

    const { data: analysis, error } = await client
        .from('document_analyses')
        .select('id')
        .eq('document_id', documentId)
        .maybeSingle();

    if (error) {
        throw new Error(`Failed to check analysis: ${error.message}`);
    }

    return !!analysis;
}

// Update existing analysis by document_id
export async function updateDocumentAnalysis(documentId: string, analysis: DocumentAnalysis, supabaseClient?: Awaited<ReturnType<typeof createSupabaseServerClient>>): Promise<DocumentAnalysis> {
    const client = supabaseClient || await createSupabaseServerClient();

    const { data: updatedAnalysis, error } = await client
        .from('document_analyses')
        .update({
            key_information: analysis.key_information,
            legal_analysis: analysis.legal_analysis,
            consistency_checks: analysis.consistency_checks,
            summary: analysis.summary
        })
        .eq('document_id', documentId)
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to update analysis: ${error.message}`);
    }

    return updatedAnalysis;
}