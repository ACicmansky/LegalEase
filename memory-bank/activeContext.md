# Active Context

## Current Development Focus

After encountering challenges with the hybrid LangChain/LangGraph approach and Gemini's native search capabilities, the project has pivoted to using Vercel AI SDK for agent implementation. Current work focuses on:

1. Implementing Vercel AI SDK for conversation streaming and generation
2. Migrating the UI to Vercel AI SDK components for better integration
3. Leveraging Google Gemini's capabilities through Vercel AI SDK
4. Optimizing the UI for real-time streaming responses


## Key Components Under Development

### 1. Vercel AI SDK Integration
- Streaming response generation with Vercel AI SDK
- Google Gemini as primary LLM accessed through Vercel AI SDK
- Type-safe interfaces between processing steps
- Structured output parsing for LLM responses
- Optimized streaming experience
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

1. **Migrate UI to Vercel AI SDK**:
   - Implement Vercel AI SDK UI components
   - Create optimized streaming UI experience
   - Ensure real-time response display
   - Maintain Slovak language support

2. **Enhance Vercel AI SDK Integration**:
   - Refine streaming response generation
   - Optimize prompt design for Vercel AI SDK
   - Improve structured output parsing
   - Ensure smooth interaction with existing components

3. **Implement Search Integration via SDK**:
   - Leverage Gemini capabilities through Vercel AI SDK
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

- **Switch to Vercel AI SDK**: Decided to pivot from the LangChain/LangGraph approach to Vercel AI SDK as it provides better integration with Gemini's native search capabilities and offers superior streaming performance.
- **Google Gemini Integration**: Continuing to use Google's Gemini as our primary LLM due to its strong performance and search capabilities, now accessed through Vercel AI SDK.
- **UI Modernization**: Will update the UI components to leverage Vercel AI SDK for improved real-time streaming responses and better user experience.
- **Type-Safe Processing**: Maintaining explicit TypeScript interfaces for all processing steps to ensure type safety throughout the agent pipeline.
- **Law Caching with Attribution**: Will continue implementing our law caching system with proper attribution information from search results.

## Immediate Next Steps

1. Migrate UI components to Vercel AI SDK for streaming responses
2. Refine structured output parsing for streaming responses
3. Optimize prompt templates for Vercel AI SDK integration
4. Ensure proper error handling and fallbacks for streaming responses
5. Test performance and responsiveness with real Slovak legal queries
6. Update documentation to reflect the new architecture
