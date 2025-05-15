# Pivot to Vercel AI SDK for Legal Conversational Agent
*May 15, 2025*

## Overview

Today we've decided to pivot from our LangGraph-based implementation to using Vercel AI SDK for our legal conversational agent. After encountering documentation and implementation challenges with LangGraph, we've identified Vercel AI SDK as a more suitable alternative with cleaner abstractions, better documentation, and tighter integration with our Next.js stack.

## Vercel AI SDK Advantages

1. **Simplified API Design** - Vercel AI SDK provides a more intuitive and developer-friendly approach to building agents
2. **Better Integration with Next.js** - As we're already using Next.js, the Vercel AI SDK offers native integration benefits
3. **Robust Tool Usage Patterns** - The SDK provides straightforward handling of tool calling with the `maxSteps` parameter
4. **Built-in Streaming Support** - Better user experience with incremental responses
5. **TypeScript-First Design** - Strong typing support with Zod schema integration for safer implementation
6. **Clear Pattern Documentation** - Well-documented patterns for building agents with different complexity levels

## Identified Agent Patterns for Our Implementation

After reviewing the Vercel AI SDK documentation, we've identified several patterns that will be valuable for our legal conversational agent:

1. **Sequential Processing (Chains)** - Perfect for our step-by-step processing flow, where we can:
   - First classify intent and extract legal entities
   - Then retrieve and process relevant laws
   - Finally generate comprehensive responses with proper citations

2. **Routing** - Will enable our agent to handle different types of legal queries appropriately:
   - Route document-related questions to document context processors
   - Direct legal lookup queries to our law retrieval system
   - Handle procedural questions with specific guidance generators

3. **Multi-Step Tool Usage** - Essential for law searching and research:
   - Allow the agent to dynamically search for relevant laws
   - Extract specific sections from legal documents
   - Compare document content against current legislation

## Implementation Plan

### Phase 1: Core Implementation (Estimated: 1 week)

1. **Set up Vercel AI SDK**
   - Install required packages
   - Configure model providers (OpenAI/Azure)
   - Set up basic agent structure
   
2. **Implement Core Processing Chain**
   - Intent classification with structured output
   - Legal entity extraction
   - Basic response generation
   
3. **Create Tool Definitions**
   - Law search tool interface
   - Document context retrieval
   - Conversation history management

### Phase 2: Law Retrieval System (Estimated: 1.5 weeks)

1. **Implement Law Database Schema**
   - Create tables for cached laws
   - Define version tracking fields
   - Set up Supabase indexes for efficient retrieval

2. **Build Law Retrieval Tools**
   - Database lookup function
   - Web search integration for slov-lex.sk and zakonypreludi.sk
   - Caching mechanism with freshness tracking

3. **Implement RSS Monitoring Service**
   - Create scheduled function for checking updates
   - Set up notification system for law changes
   - Automate database updates for changed laws

### Phase 3: Advanced Features (Estimated: 1 week)

1. **Enhanced Context Management**
   - Semantic conversation history retrieval
   - Document-law comparison tools
   - Citation formatting helpers

2. **UI Improvements**
   - Add typing indicators for streaming responses
   - Implement source attribution displays
   - Create interactive guidance components

## Code Structure Example

The new approach will look something like this:

```typescript
import { openai } from '@ai-sdk/openai';
import { generateObject, generateText, createTool } from 'ai';
import { z } from 'zod';

// Define our intent schema
const intentSchema = z.object({
  category: z.enum(['legal_lookup', 'document_question', 'general', 'procedural']),
  domain: z.enum(['civil', 'criminal', 'administrative', 'commercial', 'other']),
  confidence: z.number().min(0).max(1),
});

// Define our law search tool
const searchLawTool = createTool({
  name: 'searchLaw',
  description: 'Search for Slovak laws and legal documents',
  parameters: z.object({
    lawName: z.string().describe('Name or number of the law to search for'),
    section: z.string().optional().describe('Specific section of the law'),
  }),
  handler: async ({ lawName, section }) => {
    // First check database for cached version
    // If not found, perform web search
    return { 
      content: '...law content...',
      source: 'slov-lex.sk',
      retrievalDate: new Date().toISOString()
    };
  },
});

// Process a legal query
async function processLegalQuery(query: string, chatId: string, documentId?: string) {
  const model = openai('gpt-4o');

  // Step 1: Classify intent
  const { object: intent } = await generateObject({
    model,
    schema: intentSchema,
    prompt: `Analyze this legal query and classify its intent and domain: ${query}`
  });

  // Step 2: Generate response with relevant tools
  const { text: response, toolCalls } = await generateText({
    model,
    prompt: query,
    system: 'You are a legal assistant specialized in Slovak law...',
    tools: [searchLawTool],
    maxSteps: 5, // Allow multiple tool usage steps
  });

  return {
    response,
    intent,
    lawsReferenced: toolCalls.map(call => call.args)
  };
}
```

## Next Steps

1. Install and configure Vercel AI SDK
2. Set up model providers and authentication
3. Create core tool definitions
4. Implement intent classification flow
5. Test basic response generation

## Decisions Made

1. We will use Vercel AI SDK instead of LangGraph for our agent implementation
2. We will follow sequential processing for the main flow with routing for different query types
3. We will maintain our law caching design as originally planned
4. We will leverage Zod schemas for type-safe tool definitions and structured outputs
5. We will implement streaming responses for better user experience
