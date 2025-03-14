# Conversational Agent Implementation Design

## Date: 2025-03-14

## Overview

Today I designed a comprehensive implementation plan for the Conversational Agent, following the project's architectural patterns and technical requirements. The design addresses several key aspects:

1. Extending existing types for conversation state tracking
2. Creating dedicated tools for database access
3. Implementing Slovak language prompts
4. Using the functional programming approach
5. Integrating with the existing chat persistence system

## Key Implementation Components

### Type Extensions

New types were designed to extend the existing types.ts file:
- `ConversationIntent` enum for classifying user queries
- `ConversationState` interface for tracking processing stages
- `LegalGuidance` interface for structured guidance responses
- `Source` interface for document references
- `MessageRecord` interface matching the database schema

### Dedicated Database Tools

Following the existing architectural pattern, three new tools were designed:
- `ConversationHistoryFetcher` - Retrieves conversation history from database
- `MessageStore` - Stores AI responses in the database
- `DocumentContextFetcher` - Fetches document analysis for context

### Slovak Language Prompts

Two main prompts were designed in Slovak:
- `conversationPrompt` - For general conversation responses with intent classification
- `guidancePrompt` - For specific legal guidance generation

### Functional Programming Approach

The implementation follows the functional approach established in the document processing agent:
- Main exported function: `processConversation`
- Helper functions for processing stages:
  - `gatherContext` - Fetches conversation history and document context
  - `generateResponse` - Generates AI response with intent classification
  - `generateGuidance` - Generates additional legal guidance when needed

### Integration with Chat Persistence

The implementation integrates with the existing chat system through:
- `chatService.ts` with methods for:
  - `addUserMessage` - Creates user messages
  - `processUserMessage` - Processes messages through the agent
- Updated API route for message processing

## Processing Flow

The conversational agent follows a defined processing flow:
1. User sends a message → stored immediately
2. System gathers context (conversation history & document data)
3. Intent classification & response generation
4. Additional guidance generation for legal queries
5. Storage of AI response with metadata

## Benefits of This Approach

1. **Architecture Alignment**: Follows the established functional pattern
2. **Separation of Concerns**: Database access through tools, not direct queries
3. **Type Safety**: Comprehensive type interfaces for all components
4. **Localization**: Slovak prompts for better user experience
5. **Extensibility**: Easy to add new processing stages or capabilities
6. **Maintainability**: Clear, single-responsibility functions

## Next Steps

1. Implement the designed components
2. Create unit tests for each processing stage
3. Integrate with the frontend UI components
4. Test with various query types and document contexts
5. Refine Slovak prompts based on initial results
