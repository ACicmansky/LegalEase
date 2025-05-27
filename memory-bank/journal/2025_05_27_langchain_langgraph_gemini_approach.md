# Hybrid LangChain-LangGraph Approach with Google Gemini
*May 27, 2025*

## Refined Technical Approach

After further consideration, we're refining our approach to leverage the strengths of multiple frameworks:

1. **LangChain + LangGraph Hybrid** - Using LangChain for core processing components while employing LangGraph's ReAct agent pattern for response generation
2. **Google Gemini Integration** - Utilizing Google's Gemini model as our primary LLM
3. **Built-in Search Capabilities** - Leveraging Gemini's integrated Google Search retrieval

This hybrid approach gives us the best of both worlds: LangChain's mature tooling and LangGraph's sophisticated agent patterns, combined with Gemini's powerful capabilities.

## Key Technical Components

### 1. Core Processing with LangChain

We'll use LangChain's functional components for:
- Initial intent classification 
- Entity extraction
- Context retrieval

```typescript
import { ChatPromptTemplate } from "langchain/prompts";
import { GoogleGenerativeAI } from "@langchain/google-genai";

// Set up the model
const model = new GoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  modelName: "gemini-pro"
}).asChat();

// Intent classification
async function classifyIntent(query: string): Promise<IntentClassification> {
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are classifying Slovak legal queries..."],
    ["human", `Analyze this query: ${query}`]
  ]);
  
  return await prompt
    .pipe(model)
    .pipe(structuredOutputParser)
    .invoke();
}
```

### 2. ReAct Agent with LangGraph

For response generation, we'll use LangGraph's ReAct agent pattern, which is well-suited for complex reasoning tasks:

```typescript
import { createReactAgent } from "langgraph/prebuilt";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { GoogleGenerativeAI } from "@langchain/google-genai";

// Define the tools for the agent
const tools = [
  searchLawTool,
  retrieveDocumentContextTool,
  historyRetrievalTool
];

// Create the ReAct agent
const reactAgent = await createReactAgent({
  llm: new GoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY,
    modelName: "gemini-pro",
  }).asChat(),
  tools,
  prompt: ChatPromptTemplate.fromMessages([
    ["system", `You are a Slovak legal assistant...`],
    ["human", "{input}"]
  ])
});

// Invoke the agent
async function generateLegalResponse(
  query: string,
  intent: IntentClassification,
  entities: LegalEntities,
  context: any
) {
  const input = {
    input: `User query: ${query}
    Intent: ${JSON.stringify(intent)}
    Entities: ${JSON.stringify(entities)}
    Context: ${JSON.stringify(context)}`
  };
  
  const result = await reactAgent.invoke(input);
  return result.output;
}
```

### 3. Google Search Integration with Gemini

We'll leverage Gemini's built-in Google Search capabilities for law retrieval:

```typescript
import { GoogleGenerativeAI, SafetySetting, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

// Set up the Gemini model with Google search capability
const gemini = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = gemini.getGenerativeModel({
  model: "gemini-pro",
  generationConfig: {
    temperature: 0.2,
  },
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
  ],
  tools: [{
    googleSearchRetrieval: {}
  }]
});

// Law search function utilizing Gemini's search capabilities
async function searchSlovakLaw(lawName: string, section?: string): Promise<LawContent> {
  const query = section 
    ? `Full text of Slovak Law ${lawName} section ${section}`
    : `Full text of Slovak Law ${lawName}`;
    
  const searchTerms = `"${lawName}" filetype:pdf site:slov-lex.sk OR site:zakonypreludi.sk`;
  
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: query }] }],
    tools: [{
      googleSearchRetrieval: {
        disableAttribution: false,
        searchQueryOverride: searchTerms
      }
    }]
  });
  
  // Process and structure the response
  // Store in cache for future use
  
  return {
    name: lawName,
    section: section,
    content: result.response.text(),
    source: "Google Search via Gemini",
    retrievalDate: new Date().toISOString()
  };
}
```

## Integration Architecture

The overall workflow will be:

1. **Intent Classification (LangChain)** - Determine query type using Gemini
2. **Entity Extraction (LangChain)** - Extract laws, terms, dates using Gemini
3. **Law Retrieval (Gemini Search)** - Retrieve laws using Gemini's Google Search
4. **Response Generation (LangGraph ReAct)** - Generate response using ReAct agent

This provides a clean separation of concerns while leveraging the strengths of each framework.

## Database Schema for Law Caching

Our law caching system will store the results from Gemini's searches:

```typescript
interface StoredLaw {
  id: string;                // UUID primary key
  name: string;              // Law name/number
  section?: string;          // Specific section if applicable
  content: string;           // Full text content of the law/section
  source_url: string;        // URL where the law was retrieved from
  last_updated: Date;        // When the law was last updated in our system
  last_verified: Date;       // When we last verified against source
  version_identifier?: string; // Official version identifier if available
  is_current: boolean;       // Whether this is the current version
  search_query: string;      // The original search query used
  gemini_attribution?: string; // Attribution information from Gemini
}
```

## Implementation Phases

### Phase 1: Core Framework (Current Focus)

1. **Set up LangChain with Gemini**
   - Configure Google Generative AI models
   - Create base type definitions
   - Implement intent classification and entity extraction

2. **Integrate LangGraph ReAct Agent**
   - Set up the ReAct agent for response generation
   - Define tools for law search, context retrieval
   - Create the agent's prompt template

3. **Implement Gemini Search Integration**
   - Configure Gemini with Google Search capability
   - Create the law search function
   - Implement caching for search results

### Phase 2: Enhanced Features

1. **Law Database and Caching**
   - Complete database schema implementation
   - Add freshness policies and version tracking
   - Implement RSS monitoring for updates

2. **Document Integration**
   - Enhance document context retrieval
   - Implement document-law comparison
   - Add citation formatting

### Phase 3: Optimization

1. **Performance Tuning**
   - Optimize prompt design for Slovak language
   - Fine-tune search parameters
   - Implement batching for efficiency

2. **Cost Management**
   - Implement token usage tracking
   - Optimize caching strategies
   - Set up usage limits and alerts

## Technical Considerations

1. **API Key Management**
   - Secure storage of Google API keys
   - Implementation of rate limiting
   - Monitoring of usage and costs

2. **Error Handling**
   - Graceful degradation when services are unavailable
   - Fallback strategies for search failures
   - Detailed error logging for debugging

3. **Testing Strategy**
   - Unit tests for individual components
   - Integration tests for the full pipeline
   - Specialized tests for Slovak legal queries

This hybrid approach combines the best aspects of LangChain, LangGraph, and Google Gemini to create a powerful and flexible legal assistant tailored to Slovak law.
