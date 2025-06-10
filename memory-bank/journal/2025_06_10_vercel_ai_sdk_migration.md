# Vercel AI SDK Migration
*June 10, 2025*

## Overview

Today we're beginning the migration of our UI components to work with Vercel AI SDK, following our successful implementation of the backend conversational agent using this SDK. This represents a significant architectural pivot from our previous LangChain/LangGraph approach, which encountered integration challenges with Gemini's native search capabilities.

## Background

Previously, we attempted to implement a hybrid approach:
- LangChain for functional components and base processing
- LangGraph for ReAct agent patterns
- Google Gemini for LLM capabilities with integrated search

However, this approach presented several challenges:
1. Integration issues between LangGraph and Gemini's native search
2. Complex setup and maintenance requirements
3. Limited streaming capabilities affecting the user experience

## Vercel AI SDK Implementation

We've successfully implemented the backend conversational agent with Vercel AI SDK, which provides:
1. Streamlined integration with Google Gemini
2. Built-in streaming response capabilities
3. Simplified error handling and response processing
4. Better developer experience with Next.js integration

```typescript
// Example of our Vercel AI SDK implementation in conversationalAgentStreaming.ts
export async function streamStructuredResponse(
  chatId: string,
  messageContent: string,
  documentId?: string,
): Promise<ConversationResponse> {
  try {
    // ... context gathering code ...

    // Set up messages for Vercel AI SDK
    const messages: CoreMessage[] = [
      { role: "system", content: conversationSystemPrompt },
      { role: "user", content: humanPrompt }
    ];

    // Use Vercel AI SDK streamText to create a streaming response
    const stream = await generateText({
      model,
      messages,
      temperature: 0.1
    });

    // Process the streaming response
    const jsonString = extractJsonFromString(stream.text);
    const parsedResponse = JSON.parse(jsonString);
    
    return parsedResponse as ConversationResponse;
  } catch (error) {
    // Error handling
  }
}
```

## UI Migration Plan

Now that the backend is successfully using Vercel AI SDK, we're migrating the UI components to take full advantage of the streaming capabilities:

1. **Replace Current Chat UI**
   - Implement Vercel AI SDK UI components
   - Enable real-time streaming of responses
   - Maintain existing styling with Tailwind and ShadCN

2. **Enhance UX**
   - Add loading states and optimistic updates
   - Improve typing indicators
   - Implement seamless streaming transitions

3. **Preserve Features**
   - Document context awareness
   - Slovak language support
   - Source attribution display

## Benefits of the Shift

1. **Improved Performance**
   - Real-time streaming responses
   - Lower latency for initial response
   - Better handling of long responses

2. **Developer Experience**
   - Simplified architecture
   - Tighter integration with Next.js
   - Better type safety and error handling

3. **User Experience**
   - More responsive interface
   - Immediate feedback
   - Smoother interaction flow

## Technical Debt Addressed

This migration addresses several items of technical debt:
1. Complex integration between LangChain and LangGraph
2. Limited streaming capabilities affecting UX
3. Cumbersome error handling in multi-framework setup

## Next Steps

1. Implement Vercel AI SDK UI components
2. Test streaming performance with various scenarios
3. Ensure proper handling of different response types
4. Update documentation to reflect the new architecture

## Lessons Learned

1. **Framework Selection** - Consider streaming capabilities from the start for LLM-powered applications
2. **Simplicity First** - Simpler architectures often lead to better maintainability
3. **User Experience** - Prioritize response times and immediate feedback
