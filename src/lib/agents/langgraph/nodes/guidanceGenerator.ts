'use server';

import { ChatPromptTemplate } from "@langchain/core/prompts";
import { LegalAgentState, ProcessingStage, LegalIntentCategory, legalGuidanceSchema } from "../types";
import { StructuredOutputParser } from "langchain/output_parsers";
import { getModelFlashLite as getModelFlash } from "@/lib/agents/languageModels";

// Create a structured output parser for legal guidance
const outputParser = StructuredOutputParser.fromZodSchema(legalGuidanceSchema);

// Define the prompt template for guidance generation
const guidancePrompt = ChatPromptTemplate.fromMessages([
  ["system", `Si odborný právny asistent špecializovaný na slovenské právo, zameraný na poskytovanie konkrétnych a vykonateľných právnych rád podľa situácie používateľa.
Tvoja úloha je analyzovať problém používateľa a vytvoriť štruktúrovaný akčný plán, ktorý mu pomôže efektívne a právne správne riešiť situáciu.

Pri odpovediach vždy dodržiavaj tieto pravidlá:
1. Navrhni konkrétne kroky, ktoré používateľ musí podniknúť (vrátane úradov, formulárov alebo postupov).
2. Cituj relevantné slovenské zákony a predpisy, ktoré sa na situáciu vzťahujú.
3. Uveď dôležité termíny a časové rámce, ktoré sú kľúčové pre daný právny postup.
4. Zvýrazni možné riziká alebo následky, aby používateľ pochopil právne dôsledky svojich rozhodnutí.

Odpoveď musí byť vo formáte validného JSON objektu s poľami:
{format_instructions}
`],
  ["human", `Otázka používateľa: {userQuery}

Poskytnutá odpoveď: {initialResponse}

Zámer otázky: {intentInfo}

História konverzácie: {conversationHistory}

Kontext dokumentu: {documentContext}

Obsah zákonov: {lawContent}
`]
]);

/**
 * Generates legal guidance for procedural questions
 */
export async function generateGuidance({ state }: { state: LegalAgentState }): Promise<{ state: LegalAgentState }> {
  try {
    // If there's already an error, pass it through
    if (state.error) {
      return { state };
    }

    // Only generate guidance for certain intent types
    if (state.intent?.category !== LegalIntentCategory.Procedural) {
      return {
        state: {
          ...state,
          processingStage: ProcessingStage.GuidanceGenerated,
        }
      };
    }

    // Get the language model
    const model = await getModelFlash();

    // Create the formatted prompt with instructions
    const formattedPrompt = await guidancePrompt.partial({
      format_instructions: outputParser.getFormatInstructions(),
    });

    // Invoke the model
    const result = await formattedPrompt
      .pipe(model)
      .pipe(outputParser)
      .invoke({
        userQuery: state.userQuery,
        initialResponse: state.response || "",
        intentInfo: JSON.stringify(state.intent || {}),
        conversationHistory: state.conversationHistory || "No previous conversation.",
        documentContext: state.documentContext || "No document context available.",
        lawContent: JSON.stringify(state.retrievedLawContent || []),
      });

    return {
      state: {
        ...state,
        guidance: result,
        processingStage: ProcessingStage.GuidanceGenerated,
      }
    };
  } catch (error) {
    console.error("Error in generateGuidance:", error);
    return {
      state: {
        ...state,
        // Continue without guidance rather than failing the entire process
        processingStage: ProcessingStage.GuidanceGenerated,
      }
    };
  }
}
