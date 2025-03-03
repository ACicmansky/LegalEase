import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/utils/supabase/server';
import { createOptimizedPipeline } from '@/lib/pipeline';

/**
 * Processes a message through the RAG pipeline and creates an AI response
 */
async function processMessageThroughPipeline(chatId: string, content: string, documentId: string) {
  const supabase = await createSupabaseServerClient();

  // Get chat history for context
  const { data: messageHistory } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true })
    .limit(10); // Last 10 messages for context

  console.log('Processing message through RAG pipeline:', {
    question: content,
    sessionId: chatId,
    documentId: documentId,
    historyLength: messageHistory?.length || 0
  });

  try {
    const pipeline = await createOptimizedPipeline(documentId);

    // Process the request through the pipeline
    const startTime = Date.now();
    const pipelineResponse = await pipeline.invoke({
      question: content,
      sessionId: chatId,
      documentId: documentId || null,
      history: messageHistory || [],
    });

    console.log('RAG pipeline response generated in', Date.now() - startTime, 'ms');

    // Extract response and sources
    let aiContent = pipelineResponse.text || pipelineResponse;
    const sources = pipelineResponse.sources || [];

    if (typeof aiContent === 'string') {
      aiContent = aiContent.replace(/```html|```/g, '');
    }

    // Store AI response
    const { data: aiMessage, error: aiMessageError } = await supabase
      .from('messages')
      .insert({
        content: aiContent,
        chat_id: chatId,
        is_user: false,
        sources: sources,
      })
      .select()
      .single();

    if (aiMessageError) {
      throw new Error(`Failed to create AI message: ${aiMessageError.message}`);
    }

    return aiMessage;
  } catch (pipelineError) {
    console.error('Pipeline execution error:', pipelineError);

    // Create a fallback AI message with error information
    const { data: errorMessage, error: errorMsgError } = await supabase
      .from('messages')
      .insert({
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        chat_id: chatId,
        is_user: false,
      })
      .select()
      .single();

    if (errorMsgError) {
      throw new Error(`Failed to create error message: ${errorMsgError.message}`);
    }

    return errorMessage;
  }
}


// POST /api/chats/[chatId]/process - Process a message through the RAG pipeline
export async function POST(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const chatId = (await params).chatId;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify chat exists and belongs to user
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select(`*, documents(*)`)
      .eq('id', chatId)
      .eq('user_id', user.id)
      .single();

    if (chatError || !chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Get request body
    const { content } = await request.json();
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Process the message and get AI response
    const aiMessage = await processMessageThroughPipeline(chatId, content, chat.document_id);

    // Return the AI message
    return NextResponse.json(aiMessage);
  } catch (error) {
    console.error('Message processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
