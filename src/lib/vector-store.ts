import { AstraDBVectorStore } from "@langchain/community/vectorstores/astradb";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

export const vectorStore = new AstraDBVectorStore(
    new HuggingFaceInferenceEmbeddings ({
        apiKey: process.env.HUGGINGFACE_API_KEY!,
    }),
    {
        token: process.env.ASTRA_TOKEN!,
        endpoint: process.env.ASTRA_ENDPOINT!,
        collection: "legal_docs"
    }
);