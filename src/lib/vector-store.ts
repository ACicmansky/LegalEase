'use server'

import { AstraDBVectorStore } from "@langchain/community/vectorstores/astradb";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { Document } from "@langchain/core/documents";

let vectorStore: AstraDBVectorStore | null = null;

export async function createVectorStore() {
    const embeddings = new HuggingFaceInferenceEmbeddings({
        apiKey: process.env.HUGGINGFACE_API_KEY,
    });

    if(process.env.ASTRA_TOKEN === undefined || process.env.ASTRA_ENDPOINT === undefined) {
        throw new Error("ASTRA_TOKEN and ASTRA_ENDPOINT must be set in environment variables");
    }

    try {
        vectorStore = await AstraDBVectorStore.fromExistingIndex(embeddings, {
            token: process.env.ASTRA_TOKEN,
            endpoint: process.env.ASTRA_ENDPOINT,
            collection: "legal_docs",
        });

        if (!vectorStore) {
            throw new Error("Failed to initialize vector store");
        }

        return vectorStore;
    } catch (error) {
        console.error("Error initializing vector store:", error);
        throw error;
    }
}

export async function similaritySearch(query: string, k = 4) {
    const vectorStore = await createVectorStore();
    return vectorStore.similaritySearch(query, k);
}

export async function similaritySearchWithScore(query: string, k = 4) {
    const vectorStore = await createVectorStore();
    return vectorStore.similaritySearchWithScore(query, k);
}

export async function addDocuments(documents: Document[]) {
    try {
        const store = await createVectorStore();
        if (!store) {
            throw new Error("Vector store not initialized");
        }
        return await store.addDocuments(documents);
    } catch (error) {
        console.error("Error adding documents:", error);
        throw error;
    }
}