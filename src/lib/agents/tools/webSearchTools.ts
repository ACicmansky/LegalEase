import { GoogleCustomSearch } from "@langchain/community/tools/google_custom_search";
import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search";

export const googleCustomSearch = new GoogleCustomSearch({
    apiKey: process.env.GOOGLE_GENAI_API_KEY!,
    googleCSEId: process.env.GOOGLE_CSE_ID!,
});


export const duckDuckGoSearch = new DuckDuckGoSearch({
    maxResults: 2,
    searchOptions: { region: "sk-sk" }
});