'use server';

import { ChatPromptTemplate } from "@langchain/core/prompts";
import { LegalAgentState, ProcessingStage, extractedEntitiesSchema } from "../types";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { getModelFlashLite } from "@/lib/agents/languageModels";

// Create a structured output parser based on our entities schema
const outputParser = StructuredOutputParser.fromZodSchema(extractedEntitiesSchema);

// Define the prompt template for entity extraction
const entityPrompt = ChatPromptTemplate.fromMessages([
  ["system", `Si právny asistent špecializovaný na slovenské právo. Tvojou úlohou je identifikovať právne entity v otázke používateľa.

Extrahuj nasledujúce typy entít:
1. Zákony alebo právne predpisy (vrátane čísel paragrafov, ak sú uvedené)
2. Právne pojmy
3. Dátumy a časové obdobia relevantné pre právny prípad
4. Typy právnych postupov alebo konaní

Odpoveď musí byť vo formáte validného JSON objektu s nasledujúcimi poľami:
{format_instructions}

Príklady zákonov v slovenskej právnej terminológii:
- Zákon č. 40/1964 Zb. Občiansky zákonník
- Zákon č. 300/2005 Z. z. Trestný zákon
- Zákon č. 513/1991 Zb. Obchodný zákonník
- Zákon č. 311/2001 Z. z. Zákonník práce
`],
  ["human", `Otázka používateľa: {userQuery}

Zámer otázky: {intentInfo}`]
]);

/**
 * Extracts legal entities from the user query
 */
export async function extractEntities({ state }: { state: LegalAgentState }): Promise<{ state: LegalAgentState }> {
  try {
    // If there's already an error, pass it through
    if (state.error) {
      return { state };
    }

    // If we don't have intent information, we can't extract entities properly
    if (!state.intent) {
      return {
        state: {
          ...state,
          extractedEntities: {
            laws: [],
            legalTerms: [],
            dates: [],
            procedureTypes: []
          },
          processingStage: ProcessingStage.EntitiesExtracted,
        }
      };
    }

    // Get the language model
    const model = await getModelFlashLite();

    // Create the formatted prompt with instructions
    const formattedPrompt = await entityPrompt.partial({
      format_instructions: outputParser.getFormatInstructions(),
    });

    // Invoke the model
    const result = await formattedPrompt
      .pipe(model)
      .pipe(outputParser)
      .invoke({
        userQuery: state.userQuery,
        intentInfo: JSON.stringify(state.intent),
      });

    // Return updated state
    return {
      state: {
        ...state,
        extractedEntities: result,
        processingStage: ProcessingStage.EntitiesExtracted,
      }
    };
  } catch (error) {
    console.error("Error in extractEntities:", error);
    return {
      state: {
        ...state,
        extractedEntities: {
          laws: [],
          legalTerms: [],
          dates: [],
          procedureTypes: []
        },
        error: `Error extracting entities: ${error instanceof Error ? error.message : String(error)}`,
        processingStage: ProcessingStage.EntitiesExtracted,
      }
    };
  }
}
