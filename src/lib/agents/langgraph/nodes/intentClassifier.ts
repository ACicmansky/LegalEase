'use server';

import { ChatPromptTemplate } from "@langchain/core/prompts";
import { LegalAgentState, ProcessingStage, intentSchema } from "../types";
import { StructuredOutputParser } from "langchain/output_parsers";
import { getModelFlashLite } from "@/lib/agents/languageModels";

// Create a structured output parser based on our intent schema
const outputParser = StructuredOutputParser.fromZodSchema(intentSchema);

// Define the prompt template for intent classification
const intentPrompt = ChatPromptTemplate.fromMessages([
  ["system", `Si právny asistent špecializovaný na slovenské právo. Tvojou úlohou je analyzovať otázku používateľa a určiť jej zámer a oblasť práva.

Klasifikuj zámer do jednej z týchto kategórií:
- legal_lookup: Používateľ hľadá informácie o konkrétnom zákone alebo právnej úprave
- document_question: Používateľ sa pýta na obsah alebo význam dokumentu
- procedural: Používateľ sa pýta na právny postup alebo procedúru
- general: Všeobecná otázka bez potreby vyhľadávania v zákonoch

Klasifikuj oblasť práva do jednej z týchto kategórií:
- civil: Občianske právo
- criminal: Trestné právo
- administrative: Správne právo
- commercial: Obchodné právo
- other: Iná oblasť práva

Odpoveď musí byť vo formáte validného JSON objektu s nasledujúcimi poľami:
{format_instructions}
`],
  ["human", `Otázka používateľa: {userQuery}

Predchádzajúce správy: {conversationHistory}`]
]);

/**
 * Classifies the user's intent and legal domain of the query
 */
export async function classifyIntent({ state }: { state: LegalAgentState }): Promise<{ state: LegalAgentState }> {
  try {
    // If there's already an error, pass it through
    if (state.error) {
      return { state };
    }

    // Get the language model
    const model = await getModelFlashLite();

    // Create the formatted prompt with instructions
    const formattedPrompt = await intentPrompt.partial({
      format_instructions: outputParser.getFormatInstructions(),
    });

    // Invoke the model
    const result = await formattedPrompt
      .pipe(model)
      .pipe(outputParser)
      .invoke({
        userQuery: state.userQuery,
        conversationHistory: state.conversationHistory || "No previous conversation.",
      });

    // Return updated state
    return {
      state: {
        ...state,
        intent: result,
        processingStage: ProcessingStage.IntentClassified,
      }
    };
  } catch (error) {
    console.error("Error in classifyIntent:", error);
    return {
      state: {
        ...state,
        error: `Error classifying intent: ${error instanceof Error ? error.message : String(error)}`,
        processingStage: ProcessingStage.Complete,
      }
    };
  }
}
