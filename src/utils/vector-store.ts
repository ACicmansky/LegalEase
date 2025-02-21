import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
// import { Document } from "@langchain/core/documents";
import { MongoClient } from "mongodb";

import { embeddings } from "@/lib/embeddings";

export async function loadMongoDBStore() {
    const mongoDbClient = new MongoClient(process.env.MONGODB_ATLAS_URI ?? '');

    await mongoDbClient.connect();

    const dbName = process.env.MONGODB_ATLAS_DB_NAME ?? '';
    const collectionName = process.env.MONGODB_ATLAS_COLLECTION_NAME ?? '';
    const collection = mongoDbClient.db(dbName).collection(collectionName);

    const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
        indexName: process.env.MONGODB_ATLAS_INDEX_NAME ?? 'vector_index',
        collection,
    });

    return {
        vectorStore,
        mongoDbClient,
    };
}

// let vectorStore: MongoDBAtlasVectorSearch | null = null;
// let mongoClient: MongoClient | null = null;

// export async function createVectorStore() {
//     const embeddings = new HuggingFaceInferenceEmbeddings({
//         apiKey: process.env.HUGGINGFACE_API_KEY,
//     });

//     if (!process.env.MONGODB_URI || !process.env.MONGODB_DB_NAME) {
//         throw new Error("MONGODB_URI and MONGODB_DB_NAME must be set in environment variables");
//     }

//     try {
//         if (!mongoClient) {
//             mongoClient = new MongoClient(process.env.MONGODB_URI);
//             await mongoClient.connect();
//         }

//         const db = mongoClient.db(process.env.MONGODB_DB_NAME);
//         const collection = db.collection("legal_docs");

//         vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
//             indexName: "rag-app_vector_index", // The name of the vector search index
//             collection,
//             // textKey: "text", // The name of the field containing the raw content
//             // embeddingKey: "embedding", // The name of the field containing the embeddings
//         });

//         if (!vectorStore) {
//             throw new Error("Failed to initialize vector store");
//         }

//         return vectorStore;
//     } catch (error) {
//         console.error("Error initializing vector store:", error);
//         throw error;
//     }
// }

// export async function similaritySearch(query: string, k = 4) {
//     const vectorStore = await createVectorStore();
//     return vectorStore.similaritySearch(query, k);
// }

// export async function similaritySearchWithScore(query: string, k = 4) {
//     const vectorStore = await createVectorStore();
//     return vectorStore.similaritySearchWithScore(query, k);
// }

// export async function addDocuments(documents: Document[]) {
//     try {
//         const store = await createVectorStore();
//         if (!store) {
//             throw new Error("Vector store not initialized");
//         }
//         await store.addDocuments(documents);
//     } catch (error) {
//         console.error("Error adding documents:", error);
//         throw error;
//     }
// }