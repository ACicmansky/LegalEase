# Pragmatic LangChain Approach for Legal Agent Implementation
*May 27, 2025*

## Strategic Pivot

After careful consideration, we've decided to pivot back to using LangChain for our conversational agent implementation while maintaining the sequential processing pattern we had designed. This decision is based primarily on:

1. **Time Efficiency** - Using our existing LangChain knowledge allows for faster implementation
2. **Reduced Learning Curve** - The team is already familiar with LangChain patterns
3. **Pragmatic Delivery** - Focusing on delivering core functionality first before optimizing frameworks

This approach allows us to move forward with implementation while postponing the migration to Vercel AI SDK to a later phase of the project.

## Revised Approach

### Core Architecture: Sequential Processing with LangChain

We will implement a sequential processing pattern using LangChain's existing components:

```
User Query → Intent Classification → Entity Extraction → Tool Selection → Law Retrieval → Response Generation → Guidance Creation
```

This maintains the logical flow we had designed but uses LangChain's familiar tools and patterns.

### Implementation Components

1. **Sequential Chain Processors**
   - Use `SequentialChain` or functional composition patterns in LangChain
   - Each processor outputs structured data for the next processor
   - Maintain clear type definitions at each processing boundary

2. **Type Safety**
   - Define clear interfaces for all components
   - Use structured output parsers for classification results
   - Validate data between processing steps

3. **Law Caching System (Unchanged)**
   - Database schema for storing retrieved laws remains as planned
   - Freshness policies and version tracking approach stays the same
   - RSS monitoring design remains valid

### Benefits of This Approach

1. **Faster Implementation** - Using familiar tools speeds up development
2. **Reduced Risk** - Fewer unknowns in implementation approach
3. **Feature Focus** - More attention on legal features vs. framework learning
4. **Migration Path** - Can still transition to Vercel AI SDK in the future

## Implementation Strategy

### Phase 1: Core Functionality (Current Focus)

1. **Intent Classification**
   ```typescript
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

2. **Entity Extraction**
   ```typescript
   async function extractEntities(
     query: string, 
     intent: IntentClassification
   ): Promise<LegalEntities> {
     const prompt = ChatPromptTemplate.fromMessages([
       ["system", "Extract legal entities from this Slovak query..."],
       ["human", `Query: ${query}\nIntent: ${JSON.stringify(intent)}`]
     ]);
     
     return await prompt
       .pipe(model)
       .pipe(structuredOutputParser)
       .invoke();
   }
   ```

3. **Law Retrieval with Database Integration**
   ```typescript
   async function retrieveLawContent(entities: LegalEntities): Promise<LawContent[]> {
     const results = [];
     
     for (const law of entities.laws) {
       // First check database
       const cachedLaw = await checkCachedLaw(law.name, law.section);
       
       if (cachedLaw) {
         results.push(cachedLaw);
       } else {
         // Fallback to search
         // This will be implemented in Phase 2
       }
     }
     
     return results;
   }
   ```

4. **Response Generation**
   ```typescript
   async function generateResponse(
     query: string,
     intent: IntentClassification,
     entities: LegalEntities,
     lawContent: LawContent[],
     documentContext?: string
   ): Promise<string> {
     const prompt = ChatPromptTemplate.fromMessages([
       ["system", "You are a Slovak legal assistant..."],
       ["human", `Query: ${query}
       Intent: ${JSON.stringify(intent)}
       Entities: ${JSON.stringify(entities)}
       Laws: ${JSON.stringify(lawContent)}
       Document: ${documentContext || "No document provided"}`]
     ]);
     
     return await prompt
       .pipe(model)
       .pipe(new StringOutputParser())
       .invoke();
   }
   ```

### Phase 2: Law Retrieval and Caching (Following Phase 1)

1. Implement database schema for law storage
2. Create web search integration for Slovak legal sources
3. Develop caching logic with freshness policies
4. Set up basic RSS monitoring service

### Phase 3: Advanced Features (Future)

1. Consider migration to Vercel AI SDK at this point
2. Implement streaming responses
3. Add enhanced context management
4. Optimize for performance and costs

## Technical Considerations

1. **Code Organization**
   - Create clear module boundaries between processors
   - Use factory functions to compose processing pipelines
   - Define type-safe interfaces between components

2. **Testing**
   - Implement unit tests for each processor
   - Create integration tests for the full pipeline
   - Use mock data for law retrieval during development

3. **Error Handling**
   - Implement graceful fallbacks at each step
   - Provide meaningful error messages
   - Log detailed diagnostics for debugging

## Next Steps

1. Implement the intent classification processor
2. Create the entity extraction processor
3. Build basic law retrieval with database integration
4. Develop response generation with context integration
5. Test the end-to-end flow with real Slovak legal queries

This pragmatic approach allows us to make progress quickly while maintaining the core design principles we've established. It also keeps the door open for future framework optimizations once the core functionality is solidified.
