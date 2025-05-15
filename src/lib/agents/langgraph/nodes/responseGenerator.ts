'use server';

import { ChatPromptTemplate } from "@langchain/core/prompts";
import { LegalAgentState, ProcessingStage } from "../types";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { getModelFlashLite as getModelFlash } from "@/lib/agents/languageModels";

// Define the prompt template for response generation
const responsePrompt = ChatPromptTemplate.fromMessages([
  ["system", `Si právny asistent špecializovaný na slovenské právo. Tvojou úlohou je odpovedať na otázky používateľa jasne, presne a zrozumiteľne.

Dodržiavaj tieto pravidlá:
1. Odkazuj na konkrétne zákony a paragrafy, ak sú relevantné.
2. Vysvetľuj právne pojmy jednoduchým jazykom.
3. Buď praktický a konkrétny, vyhýbaj sa všeobecným radám.
4. Pri odpovediach na dokumenty cituj konkrétne časti.
5. Ak nemáš dostatok informácií, jasne to povedz a požiadaj o doplnenie.

Používaj slovenčinu a buď rešpektujúci k používateľovi.
`],
  ["human", `Otázka používateľa: {userQuery}

Zámer otázky: {intentInfo}

Identifikované entity: {entitiesInfo}

História konverzácie: {conversationHistory}

Kontext dokumentu: {documentContext}

Obsah zákonov: {lawContent}
`]
]);

/**
 * Generates a response for the user query
 */
export async function generateResponse({ state }: { state: LegalAgentState }): Promise<{ state: LegalAgentState }> {
  try {
    // If there's already an error, pass it through
    if (state.error) {
      return { state };
    }

    // Get the language model
    const model = await getModelFlash();

    // Invoke the model
    const response = await responsePrompt
      .pipe(model)
      .pipe(new StringOutputParser())
      .invoke({
        userQuery: state.userQuery,
        intentInfo: JSON.stringify(state.intent || {}),
        entitiesInfo: JSON.stringify(state.extractedEntities || {}),
        conversationHistory: state.conversationHistory || "No previous conversation.",
        documentContext: state.documentContext || "No document context available.",
        lawContent: JSON.stringify(state.retrievedLawContent || []),
      });

    // Prepare source citations
    const sources = [];

    // Add document sources if available
    if (state.documentContext && state.documentId) {
      sources.push({
        title: "Uploaded Document",
        text: "Referenced from uploaded document",
      });
    }

    // Add law sources if available
    if (state.retrievedLawContent) {
      state.retrievedLawContent.forEach(law => {
        sources.push({
          title: law.law,
          section: "Referenced law",
          text: law.source,
        });
      });
    }

    return {
      state: {
        ...state,
        response,
        sources,
        processingStage: ProcessingStage.ResponseGenerated,
      }
    };
  } catch (error) {
    console.error("Error in generateResponse:", error);
    return {
      state: {
        ...state,
        response: "Prepáčte, ale nastal problém pri generovaní odpovede. Prosím, skúste to znova alebo položte otázku iným spôsobom.",
        error: `Error generating response: ${error instanceof Error ? error.message : String(error)}`,
        processingStage: ProcessingStage.Complete,
      }
    };
  }
}
