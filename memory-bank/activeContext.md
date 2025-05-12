# Active Context

## Current Development Focus

The project is pivoting to a more sophisticated LangGraph-based agent architecture with a focus on improved law retrieval, context management, and procedural guidance. Recent work focuses on:

1. Planning the LangGraph-based conversational agent implementation
2. Designing a law caching system to minimize web searches
3. Enhancing context management for more relevant conversation history
4. Implementing web search capabilities for Slovak legal sources


## Key Components Under Development

### 1. LangGraph-Based Conversational Agent
- State-based graph workflow using LangGraph
- Specialized nodes for intent classification, entity extraction, and law retrieval
- Web search capabilities targeting Slovak legal sources
- Enhanced context management for more relevant conversation history
- Law caching system to minimize web searches
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

- Migrating from functional pipeline to LangGraph's state-based graph architecture
- Implementing efficient web search for Slovak legal sources
- Designing an effective law caching system with freshness policies
- Creating a reliable RSS monitoring service for law updates
- Ensuring proper integration between cached laws and document context
- Optimizing performance for complex legal queries

## Next Steps

1. **Implement LangGraph Framework**:
   - Install LangGraph and set up the basic infrastructure
   - Define the complete state schema
   - Implement the core nodes (intent classifier, entity extractor)

2. **Develop Law Retrieval and Caching System**:
   - Create database schema for law storage
   - Implement web search functionality for Slovak legal sources
   - Develop caching logic with freshness policies
   - Set up basic RSS monitoring for law updates

3. **Enhance Context Management**:
   - Improve conversation history fetcher with adaptive approach
   - Integrate document context with retrieved laws
   - Implement proper citation formatting
   
4. **Testing and Optimization**:
   - Test with real Slovak legal questions
   - Optimize performance for web searches
   - Refine prompts for Slovak language

## Recent Decisions

- Decided to migrate from functional pipeline to LangGraph's state-based graph architecture
- Designed a law caching system to minimize web searches and improve performance
- Planned implementation of web search capabilities for Slovak legal sources
- Designed a database schema for storing retrieved laws with version tracking
- Planned RSS monitoring service for law updates

## Immediate Next Steps

1. Install LangGraph and set up the basic infrastructure
2. Define the complete state schema for the agent
3. Create database schema for law caching
4. Implement the core nodes (intent classifier, entity extractor)
5. Research web search APIs suitable for Slovak legal sources
