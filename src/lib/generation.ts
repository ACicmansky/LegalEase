import { ChatGroq } from "@langchain/groq";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { Document } from "@langchain/core/documents";

export class GenerationEngine {
    public model: ChatGroq;
    public promptTemplate: PromptTemplate;

    constructor() {
        this.model = new ChatGroq({
            apiKey: process.env.GROQ_API_KEY!,
            modelName: "mixtral-8x7b-32768",
            temperature: 0.7,
            maxTokens: 2048,
        });

        this.promptTemplate = PromptTemplate.fromTemplate(`
            You are a legal assistant analyzing documents. Use the following context to answer the question.
            If you don't know the answer, just say that you don't know. Don't try to make up an answer.
            
            Context: {context}
            
            Question: {question}
            
            Answer: Let me help you with that.`
        );
    }

    async generateResponse(
        question: string,
        relevantDocuments: Document[]
    ): Promise<string> {
        const context = relevantDocuments
            .map((doc) => doc.pageContent)
            .join("\n\n");

        const chain = RunnableSequence.from([
            this.promptTemplate,
            this.model,
            new StringOutputParser(),
        ]);

        try {
            const response = await chain.invoke({
                question,
                context,
            });

            return response;
        } catch (error) {
            console.error("Error generating response:", error);
            throw new Error("Failed to generate response");
        }
    }
}