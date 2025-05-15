# Active Context

## Current Development Focus

The project is pivoting to a Vercel AI SDK-based agent architecture after encountering documentation and implementation challenges with LangGraph. This new approach offers better integration with our Next.js stack and more intuitive patterns for implementing our legal conversational agent. Current work focuses on:

1. Transitioning from LangGraph to Vercel AI SDK for the conversational agent
2. Implementing a sequential processing pattern with routing for different query types
3. Creating type-safe tool definitions using Zod schemas
4. Maintaining our law caching system design for efficient legal information retrieval


## Key Components Under Development

### 1. Vercel AI SDK-Based Conversational Agent
- Sequential processing chain with routing capabilities
- Type-safe tool definitions using Zod schemas
- Multi-step tool usage for complex legal research tasks
- Strong integration with Next.js framework
- Streaming responses for improved user experience
- Intent classification and entity extraction tools
- Document-law comparison capabilities
- Slovak legal citation formatting

### 2. Law Caching System
- Database schema for storing retrieved laws
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

- Learning and implementing the Vercel AI SDK architecture effectively
- Creating type-safe tool definitions for legal research capabilities
- Implementing efficient web search for Slovak legal sources
- Designing an effective law caching system with freshness policies
- Creating a reliable RSS monitoring service for law updates
- Balancing streaming responses with complex multi-step tool usage
- Optimizing performance and cost for complex legal queries

## Next Steps

1. **Implement Vercel AI SDK Framework**:
   - Install and configure Vercel AI SDK
   - Set up model providers and authentication
   - Create type-safe tool definitions using Zod schemas
   - Implement sequential processing chain with routing

2. **Develop Law Retrieval and Caching System**:
   - Create database schema for law storage
   - Implement web search functionality for Slovak legal sources
   - Develop caching logic with freshness policies
   - Set up basic RSS monitoring for law updates

3. **Enhance Context Management**:
   - Implement semantic conversation history retrieval
   - Create document-law comparison tools
   - Develop citation formatting helpers
   
4. **Testing and Optimization**:
   - Test with real Slovak legal questions
   - Optimize performance for web searches
   - Refine prompts for Slovak language
   - Measure and optimize token usage for cost efficiency

## Recent Decisions

- Decided to pivot from LangGraph to Vercel AI SDK due to documentation and implementation challenges
- Selected sequential processing pattern with routing for our conversational agent workflow
- Committed to using Zod schemas for type-safe tool definitions and structured outputs
- Maintained our law caching system design to minimize web searches and improve performance
- Planned implementation of streaming responses for better user experience

## Immediate Next Steps

1. Install and configure Vercel AI SDK with appropriate model providers
2. Create type-safe tool interfaces for law search and document analysis
3. Implement intent classification with structured output using Zod schemas
4. Design database schema for law caching system
5. Research integration points with slov-lex.sk and zakonypreludi.sk APIs
