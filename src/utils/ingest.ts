import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import { vectorStore } from "@/lib/vector-store";

const testFilePath = "C:\Source\Assets\rag-app\testFile.pdf";
const loader = new PDFLoader(testFilePath);
const rawDocs = await loader.load();

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});
const finalChunks = await splitter.splitDocuments(rawDocs);

await vectorStore.addDocuments(finalChunks);
