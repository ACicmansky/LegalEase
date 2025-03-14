import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

if (!process.env.HUGGINGFACE_API_KEY) {
    throw new Error('Missing env.HUGGINGFACE_API_KEY');
  }

export const embeddings = new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HUGGINGFACE_API_KEY,
    model: "intfloat/multilingual-e5-large"
});