'use server';

import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { getModelFlash } from "@/lib/agents/languageModels";
import { queryAnalysisSchema, QueryAnalysis } from "./types";
import { ConversationIntent } from "@/types/chat";

// Create a model instance
const model = await getModelFlash(0.1); // Lower temperature for analysis tasks

// Query analysis system prompt
const QUERY_ANALYSIS_PROMPT =
  `Si expertný slovenský právny asistent s úlohou analyzovať používateľské otázky z hľadiska slovenského práva.
Vykonaj postupne DVE analytické úlohy:

1. KLASIFIKÁCIA ZÁMERU:
   - Urči primárnu kategóriu zámeru:
     * document_question: Otázky o konkrétnom dokumente, ktorý používateľ prezerá
     * legal_guidance: Žiadosti o procedurálne usmernenie v právnych záležitostiach
     * clarification: Žiadosti o vysvetlenie právnych pojmov, zákonov alebo konceptov
     * general: Všeobecné otázky o slovenskom práve
   - Identifikuj právnu oblasť ('civil', 'criminal', 'administrative', 'commercial', 'other')
   - Poskytni skóre istoty (0-1) a stručné odôvodnenie

2. EXTRAKCIA ZÁKONOV:
   - Extrahuj Zákony, kódexy, nariadenia alebo predpisy, ktoré sa ovplyvňujú otázku
   - Ak neexistuje žiadny zákon, kódex, nariadenie alebo predpis, vráť prázdne pole

Pre slovenský právny kontext venuj osobitnú pozornosť:
- Číslam zákonov vo formáte "Zákon č. X/YYYY Z. z."
- Slovenskej právnej terminológii (v slovenčine aj angličtine)
- Procedurálnym odkazom špecifickým pre slovenský právny systém

Výstup musí byť v formáte JSON:
{{
  "intent": {{
    "category": "legal_guidance",
    "domain": "civil",
    "confidence": 0.85,
    "reasoning": "Používateľ sa pýta na postup pri rozvode"
  }},
  "laws": [
    {{
      "name": "Zákon č. 36/2005 Z. z.",
      "section": "§ 22",
      "description": "Rozvod manželstva, zrušenie manželstva rozvodom."
    }},
    {{
      "name": "Zákon č. 40/1964 Zb.",
      "description": "Občiansky zákonník."
    }}
  ]
}}
`;

// Structured output parser for query analysis
const analysisParser = StructuredOutputParser.fromZodSchema(queryAnalysisSchema);

// Create the query analysis prompt template
const analysisPrompt = ChatPromptTemplate.fromMessages([
  ["system", QUERY_ANALYSIS_PROMPT],
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
      laws: []
    };
  }
}
