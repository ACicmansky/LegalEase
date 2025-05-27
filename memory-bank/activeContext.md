# Active Context

## Current Development Focus

The project is adopting a hybrid approach combining LangChain's functional components with LangGraph's ReAct agent pattern, powered by Google's Gemini model. This approach leverages the strengths of each framework while utilizing Gemini's built-in Google Search capabilities for law retrieval. Current work focuses on:

1. Implementing LangChain components for intent classification and entity extraction
2. Integrating LangGraph's ReAct agent for sophisticated response generation
3. Leveraging Google Gemini's built-in search capabilities for law retrieval
4. Developing the law caching system for retrieved legal content


## Key Components Under Development

### 1. Hybrid LangChain-LangGraph Agent
- LangChain components for core processing (intent classification, entity extraction)
- LangGraph ReAct agent for response generation
- Google Gemini as primary LLM with integrated search
- Type-safe interfaces between processing steps
- Structured output parsing for LLM responses
- Tool-based reasoning for complex legal questions
- Document-law comparison capabilities
- Slovak legal citation formatting

### 2. Law Caching System with Gemini Search Integration
- Leveraging Gemini's built-in Google Search capabilities
- Database schema for storing retrieved laws with source attribution
- Optimized search queries targeting Slovak legal sources (slov-lex.sk, zakonypreludi.sk)
- Freshness policies for cached content
- Version tracking for laws
- RSS monitoring service for law updates
- Integration with Supabase

### 3. Document Processing Agent
- Document upload and storage (maintaining existing functionality)
- Text extraction and analysis
- Key information and law extraction 
- Consistency checking
- Document summary generation
- Proper database structure for document analyses

### 3. Consolidated Type System
- Tiered message type hierarchy
  - ChatMessage: Extended for frontend display with user attribution
  - MessageRecord: Extended for backend/agent processing with metadata
- Enhanced MessageSource type with optional fields
- Integration across components, API routes, and agent processing
- Alignment with database schema

### 4. API Routes
- Updated messaging endpoints
- Proper typing with MessageRecord
- Enhanced error handling
- Clearer separation of roles for each endpoint
- Optimization of data transfer

## Current Challenges

- Integrating LangChain components with LangGraph's ReAct agent pattern
- Configuring Google Gemini with appropriate search parameters for Slovak legal sources
- Creating robust type definitions between processing steps
- Managing API key security and usage limits for Google's services
- Designing an effective law caching system with proper attribution from search results
- Creating a reliable RSS monitoring service for law updates
- Handling error recovery gracefully across multiple frameworks
- Optimizing performance and cost for complex legal queries

## Next Steps

1. **Set Up LangChain with Google Gemini**:
   - Configure Google Generative AI integration
   - Create core type definitions for processing steps
   - Implement intent classification with structured output
   - Build entity extraction with Slovak legal focus

2. **Integrate LangGraph ReAct Agent**:
   - Set up the ReAct agent for response generation
   - Define tools for law search and context retrieval
   - Create the agent's prompt template
   - Implement agent invocation flow

3. **Implement Gemini Search Integration**:
   - Configure Gemini with Google Search capability
   - Create optimized search queries for Slovak legal sources
   - Implement result processing and caching
   - Develop proper attribution handling

4. **Develop Law Caching System**:
   - Create database schema for law storage with attribution
   - Implement caching logic with freshness policies
   - Set up basic RSS monitoring for law updates
   - Develop version tracking for laws
   
5. **Testing and Optimization**:
   - Test with real Slovak legal questions
   - Optimize search parameters for Slovak legal sources
   - Refine prompts for Slovak language
   - Measure and optimize token usage for cost efficiency

## Recent Decisions

- **Hybrid LangChain-LangGraph Approach**: Decided to combine LangChain for core processing components with LangGraph's ReAct agent pattern for response generation to leverage the strengths of both frameworks.
- **Google Gemini Integration**: Selected Google's Gemini as our primary LLM due to its strong performance and built-in search capabilities for law retrieval.
- **Search-Powered Law Retrieval**: Will leverage Gemini's integrated Google Search capabilities to access Slovak legal sources directly, reducing the need for custom web scraping.
- **Type-Safe Processing Boundaries**: Will create explicit TypeScript interfaces for all processing steps to ensure type safety throughout the agent pipeline.
- **Law Caching with Attribution**: Will implement our law caching system with additional fields for storing attribution information from Gemini's search results.
- **Postpone Vercel AI SDK Migration**: The migration to Vercel AI SDK will be considered in a future phase after core functionality is implemented.

## Immediate Next Steps

1. Configure Google Generative AI integration with appropriate API keys
2. Create type definitions for our processing pipeline (intent, entities, law content)
3. Implement intent classification and entity extraction using LangChain with Gemini
4. Set up LangGraph's ReAct agent for response generation
5. Implement Gemini's search integration for Slovak legal sources
6. Design database schema for law caching with attribution information
