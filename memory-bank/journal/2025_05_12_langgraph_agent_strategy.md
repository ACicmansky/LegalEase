# LangGraph-Based Legal Conversational Agent Implementation Strategy
*May 12, 2025*

## Overview

Today we developed a comprehensive strategy for enhancing the LegalEases conversational agent using LangGraph to create a more sophisticated workflow for legal assistance. This represents a significant evolution from our current functional approach to a state-based graph that will enable more complex reasoning, better context management, and improved law retrieval capabilities with efficient law caching.

## Key Improvements

The new agent architecture addresses several limitations in our current implementation:

1. **Dynamic Law Retrieval** - Instead of relying solely on pre-loaded document context, the agent will actively search for and retrieve current Slovak law content from authoritative sources (slov-lex.sk and zakonypreludi.sk).

2. **Enhanced Intent Understanding** - More sophisticated intent classification will better route user queries to appropriate processing paths.

3. **Legal Entity Recognition** - Specialized extraction of Slovak legal terms, law references, and procedural elements.

4. **Improved Context Management** - Adaptive conversation history that prioritizes relevant past interactions rather than just the most recent messages.

5. **Document-Law Comparison** - Ability to compare uploaded legal documents against current law requirements to identify discrepancies.

6. **Law Caching System** - Database storage of retrieved laws to minimize expensive web searches and improve response times.

## Core Architecture

The new agent will be built around a state-based graph workflow with the following key components:

```typescript
// Core state schema
interface LegalAgentState {
  userQuery: string;
  intent: {
    category: "legal_lookup" | "document_question" | "general" | "procedural";
    domain: "civil" | "criminal" | "administrative" | "commercial" | "other";
    confidence: number;
  };
  extractedEntities: {
    laws: Array<{name: string; section?: string}>;
    legalTerms: string[];
    dates: string[];
    procedureTypes: string[];
  };
  retrievedLawContent: Array<{
    law: string;
    content: string;
    source: string;
    retrievalDate: string;
  }>;
  conversationHistory: string;
  documentContext?: string;
  response: string;
  guidance?: LegalGuidance;
  processingStage: string;
}
```

## Workflow Components

1. **Intent Classification Node**
   - Categorize queries by intent (legal lookup, document question, general, procedural)
   - Identify legal domain (civil, criminal, administrative, commercial)
   - Assign confidence scores to classifications

2. **Named Entity Recognition Node**
   - Extract specific laws, sections, and legal terms
   - Identify dates, time periods, and procedural elements
   - Focus on Slovak legal terminology

3. **Enhanced Context Management**
   - Improve on existing conversation history fetcher
   - Use adaptive approach instead of fixed message count
   - Include initial query, recent messages, and semantically relevant past messages

4. **Law Retrieval with Caching System**
   - First check database for cached law content
   - If not available or outdated, search slov-lex.sk and zakonypreludi.sk for current law versions
   - Extract and process relevant legal content
   - Store retrieved laws in database for future use
   - Track law version information and last verification date
   - Verify source reliability and currency

5. **Document Context Integration**
   - Build on existing document context fetcher
   - Compare document content against retrieved laws
   - Identify alignments and discrepancies

6. **Procedural Guidance Generation**
   - Leverage existing guidance generator within new workflow
   - Provide step-by-step legal procedures
   - Include relevant forms, deadlines, and institutional contacts

7. **Source Citation Formatting**
   - Format legal citations in Slovak legal style
   - Include section references and effective dates

## Technical Implementation

The implementation will use LangGraph's StateGraph for workflow management:

```typescript
import { StateGraph, END } from "langchain/experimental/langgraph";
import { z } from "zod";

export async function createLegalAgentGraph() {
  // Define state schema with Zod
  const stateSchema = {
    // Full schema definition here
  };

  // Create graph
  const workflow = new StateGraph({
    channels: stateSchema,
    nodes: {
      intentClassifier: intentClassifierNode,
      entityExtractor: entityExtractorNode,
      toolSelector: toolSelectorNode,
      lawRetriever: lawRetrieverNode,
      documentContextEnricher: documentContextEnricherNode,
      responseGenerator: responseGeneratorNode,
      guidanceGenerator: guidanceGeneratorNode,
      sourceCitation: sourceCitationNode
    }
  });

  // Define graph edges with conditional routing
  workflow.addEdge("intentClassifier", "entityExtractor");
  workflow.addEdge("entityExtractor", "toolSelector");
  
  // Conditional paths based on intent and entity extraction
  workflow.addConditionalEdges(
    "toolSelector",
    (state) => {
      if (state.intent.category === "legal_lookup" && state.extractedEntities.laws.length > 0) {
        return "lawRetriever";
      } 
      if (state.documentContext) {
        return "documentContextEnricher";
      }
      return "responseGenerator";
    }
  );

  workflow.addEdge("lawRetriever", "documentContextEnricher");
  workflow.addEdge("documentContextEnricher", "responseGenerator");
  workflow.addEdge("responseGenerator", "guidanceGenerator");
  workflow.addEdge("guidanceGenerator", "sourceCitation");
  workflow.addEdge("sourceCitation", END);

  return workflow.compile();
}
```

## Law Caching Database Schema

We'll implement a law caching system with the following schema in Supabase:

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
}
```

We'll also create a scheduled job to monitor the RSS feed from slov-lex.sk for updates to laws in our database.

## Implementation Phases

1. **Phase 1: Core Framework** (Estimated: 1 week)
   - Set up LangGraph infrastructure
   - Implement base state management
   - Create primary nodes (intent, entity extraction, response)

2. **Phase 2: Law Retrieval and Caching System** (Estimated: 1.5 weeks)
   - Create database schema for law storage
   - Implement web search functionality for Slovak legal sources
   - Add law content extraction and processing
   - Implement caching logic with freshness policies
   - Create basic RSS monitoring for law updates
   - Implement source verification logic

3. **Phase 3: Context Enhancement** (Estimated: 1 week)
   - Integrate improved conversation history management
   - Add document context integration with law comparisons
   - Implement proper citation formatting

4. **Phase 4: Testing & Refinement** (Estimated: 1 week)
   - Test with real Slovak legal questions
   - Optimize performance (especially for web searches)
   - Refine prompts for Slovak language optimization

## Next Steps

1. Install LangGraph and set up the basic infrastructure
2. Define the complete state schema
3. Implement the core nodes (intent classifier, entity extractor)
4. Create the database schema for law caching
5. Implement the web search tool for Slovak legal sources
6. Develop the law caching logic with freshness policies
7. Set up a basic RSS monitoring service for law updates
8. Test the basic workflow with simple legal queries

## Decisions Made

1. We will use LangGraph for orchestrating the agent workflow instead of our current functional pipeline approach
2. We will implement web search capabilities specifically targeting Slovak legal sources
3. We will enhance our context management to be more adaptive and relevant
4. We will maintain compatibility with our existing document processing capabilities
5. We will optimize all prompts for Slovak legal terminology and citation styles
