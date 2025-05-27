import { DynamicRetrievalMode, GoogleSearchRetrievalTool } from "@google/generative-ai";

export const googleSearchRetrievalTool: GoogleSearchRetrievalTool = {
    googleSearchRetrieval: {
        dynamicRetrievalConfig: {
            mode: DynamicRetrievalMode.MODE_DYNAMIC,
            dynamicThreshold: 0.7,
        },
    },
};