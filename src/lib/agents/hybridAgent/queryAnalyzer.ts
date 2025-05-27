'use server';

import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { getModelFlash } from "@/lib/agents/languageModels";
import { IntentClassification, LegalEntities } from "./types";
import { ConversationIntent } from "@/types/chat";
import { z } from "zod";

// Create a model instance
const model = await getModelFlash(0.1); // Lower temperature for analysis tasks

// Combined schema for query analysis (intent + entities)
export const queryAnalysisSchema = z.object({
  intent: z.object({
    category: z.enum([
      ConversationIntent.DocumentQuestion,
      ConversationIntent.LegalGuidance,
      ConversationIntent.Clarification,
      ConversationIntent.General
    ]),
    domain: z.enum(['civil', 'criminal', 'administrative', 'commercial', 'other']),
    confidence: z.number().min(0).max(1),
    reasoning: z.string()
  }),
  entities: z.object({
    laws: z.array(
      z.object({
        name: z.string(),
        section: z.string().optional(),
        description: z.string().optional()
      })
    ),
    legalTerms: z.array(
      z.object({
        term: z.string(),
        context: z.string().optional()
      })
    ),
    dates: z.array(
      z.object({
        date: z.string(),
        description: z.string()
      })
    ),
    procedureTypes: z.array(
      z.object({
        name: z.string(),
        description: z.string()
      })
    )
  })
});

// Combined type for query analysis result
export interface QueryAnalysis {
  intent: IntentClassification;
  entities: LegalEntities;
}

// Query analysis system prompt
const QUERY_ANALYSIS_PROMPT = `
Si expertný slovenský právny asistent s úlohou analyzovať používateľské otázky o slovenskom práve.
Vykonaj súčasne DVE analytické úlohy:

1. KLASIFIKÁCIA ZÁMERU:
   - Urči primárnu kategóriu zámeru:
     * DOCUMENT_QUESTION: Otázky o konkrétnom právnom dokumente, ktorý používateľ prezerá
     * LEGAL_GUIDANCE: Žiadosti o procedurálne usmernenie v právnych záležitostiach
     * CLARIFICATION: Žiadosti o vysvetlenie právnych pojmov alebo konceptov
     * GENERAL: Všeobecné otázky o slovenskom práve
   - Identifikuj právnu oblasť (občianske, trestné, správne, obchodné, iné)
   - Poskytni skóre istoty (0-1) a stručné odôvodnenie

2. EXTRAKCIA ENTÍT:
   - Zákony: Názvy alebo čísla zákonov, kódexov, nariadení alebo predpisov
   - Právne pojmy: Špecifická právna terminológia alebo koncepty
   - Dátumy: Akékoľvek dátumy alebo časové rámce s právnym významom
   - Typy konaní: Typy právnych konaní, podaní alebo žiadostí

Pre slovenský právny kontext venuj osobitnú pozornosť:
- Číslam zákonov vo formáte "Zákon č. X/YYYY Z. z."
- Slovenskej právnej terminológii (v slovenčine aj angličtine)
- Procedurálnym odkazom špecifickým pre slovenský právny systém

Extrahuj len entity, ktoré sa skutočne nachádzajú v otázke. Ak neexistuje žiadna entita určitého typu, vráť pre tento typ prázdne pole.
`;

// Structured output parser for query analysis
const analysisParser = StructuredOutputParser.fromZodSchema(queryAnalysisSchema);

// Create the query analysis prompt template
const analysisPrompt = ChatPromptTemplate.fromMessages([
  ["system", QUERY_ANALYSIS_PROMPT],
  ["system", `Výstup by mal byť v nasledujúcom formáte: ${analysisParser.getFormatInstructions()}`],
  ["human", "{query}"]
]);

/**
 * Analyzes the user's query for both intent and entities in a single step
 * 
 * @param query - The user's query text
 * @returns Promise with the combined analysis result
 */
export async function analyzeQuery(query: string): Promise<QueryAnalysis> {
  try {
    // Run the analysis using the structured prompt
    const result = await analysisPrompt
      .pipe(model)
      .pipe(analysisParser)
      .invoke({
        query
      });

    return result;
  } catch (error) {
    console.error("Error in query analysis:", error);

    // Provide fallback analysis
    return {
      intent: {
        category: ConversationIntent.General,
        domain: 'other',
        confidence: 0.5,
        reasoning: "Nepodarilo sa analyzovať otázku. Výsledok predpokladá všeobecnú otázku."
      },
      entities: {
        laws: [],
        legalTerms: [],
        dates: [],
        procedureTypes: []
      }
    };
  }
}
