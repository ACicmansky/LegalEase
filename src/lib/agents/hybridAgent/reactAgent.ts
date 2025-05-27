'use server';

import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { EnhancedAgentState, IntentClassification, LegalEntities } from "./types";
import { getModelFlash } from "@/lib/agents/languageModels";
import { googleSearchRetrievalTool } from "@/lib/agents/tools/webSearchTools";
import { GetDocumentAnalysisTool } from "@/lib/agents/tools/documentAnalysisTools";
import { GetConversationHistoryTool } from "@/lib/agents/tools/conversationTools";

/**
 * Creates a ReAct agent configured for legal response generation
 * 
 * @returns The configured ReAct agent
 */
export async function createLegalReactAgent() {
  // Define the system prompt for our legal agent
  const systemPrompt = `
Ste sofistikovaný slovenský právny asistent navrhnutý na pomoc používateľom s právnymi otázkami.
Máte prístup k nástrojom, ktoré vám pomôžu poskytovať presné a užitočné odpovede.

SCHOPNOSTI:
- Vyhľadávanie konkrétnych slovenských zákonov a právnych kódexov
- Získavanie viacerých zákonov na základe entít extrahovaných z otázky
- Získavanie histórie konverzácie pre kontext, keď je to potrebné
- Prístup k analýze dokumentov, keď používatelia odkazujú na právne dokumenty
- Poskytovanie presných právnych informácií s riadnymi citáciami
- Vysvetľovanie zložitých právnych konceptov jasným jazykom

POKYNY:
- Vždy citujte svoje zdroje pri odkazovaní na zákony
- Históriu konverzácie alebo kontext dokumentu získavajte iba vtedy, keď je to potrebné pre aktuálnu otázku
- Buďte jasní ohľadom úrovne istoty vašich odpovedí
- Pri neistote priznajte obmedzenia namiesto hádania
- Pri procedurálnych otázkach poskytnite podrobný návod krok za krokom
- Používajte slovenskú právnu terminológiu správne
- Formátujte odpovede štruktúrovane a ľahko čitateľne

DÔLEŽITÉ: V slovenskom právnom kontexte buďte obzvlášť opatrní pri:
- Odkazovaní na zákony v štandardnom slovenskom formáte (napr. "Zákon č. 40/1964 Zb. Občiansky zákonník")
- Rešpektovaní tradície kontinentálneho práva slovenského právneho systému
- Zohľadnení dôsledkov práva EÚ, kde je to relevantné
`;

  // Initialize tools
  const conversationHistoryTool = new GetConversationHistoryTool();
  const documentContextTool = new GetDocumentAnalysisTool();

  // Define the tools available to the agent
  const tools = [
    //googleSearchRetrievalTool,        // For searching individual laws
    documentContextTool,          // For retrieving document analysis when needed
    conversationHistoryTool,       // For retrieving conversation history when needed
  ];

  // Create the agent model
  const model = await getModelFlash();
  const modelWithSearchTool = model.bindTools([googleSearchRetrievalTool]);

  // Create the prompt template
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemPrompt],
    ["human", "{input}"]
  ]);

  // Create the ReAct agent
  const agent = createReactAgent({
    llm: modelWithSearchTool,
    tools: tools,
    prompt
  });

  return agent;
}

/**
 * Generate a legal response using the ReAct agent
 * 
 * @param query - User's original query
 * @param intent - Classified intent
 * @param entities - Extracted entities
 * @param state - Current agent state
 * @returns Updated agent state with response
 */
export async function generateResponse(
  query: string,
  intent: IntentClassification,
  entities: LegalEntities,
  state: EnhancedAgentState
): Promise<EnhancedAgentState> {
  try {
    // Create the agent (or reuse from cache in production)
    const agent = await createLegalReactAgent();

    // Prepare the input for the agent with context that allows it to decide which tools to use
    const input = `
Dopyt používateľa: ${query}

Klasifikácia zámeru:
Kategória: ${intent.category}
Oblasť: ${intent.domain}
Miera istoty: ${intent.confidence}
Zdôvodnenie: ${intent.reasoning}

Extrahované entity:
${JSON.stringify(entities, null, 2)}

ID konverzácie: ${state.chatId}
${state.documentId ? `ID dokumentu: ${state.documentId}` : ''}

Vašou úlohou je vygenerovať komplexnú odpoveď na dopyt používateľa.

Na základe dopytu a zámeru:
1. Rozhodnite, či potrebujete vyhľadať konkrétne zákony uvedené v entitách
2. Určite, či by bola história konverzácie užitočná pre kontext
3. Ak sa dopyt týka dokumentu, zvážte získanie analýzy dokumentu
4. Vygenerujte komplexnú odpoveď s využitím všetkých relevantných informácií

Používajte svoje nástroje podľa potreby na zhromaždenie informácií - nepredpokladajte, že nejaké informácie boli už vopred získané.
`;

    // Invoke the agent
    const result = await agent.invoke({ messages: input });

    // Parse the agent's response
    const response = result.messages[result.messages.length - 1].content.toString();

    // In a production implementation, we would extract sources and other metadata
    // from the agent's response for more structured output

    // For now, just return the basic response
    return {
      ...state,
      response,
      processingStage: state.processingStage
    };
  } catch (error) {
    console.error("Error generating response with ReAct agent:", error);

    // Return the state with an error response
    return {
      ...state,
      response: "Ospravedlňujem sa, ale vyskytla sa chyba pri generovaní odpovede. Skúšajte prosím znovu.",
      error: error instanceof Error ? error.message : "Neznáma chyba"
    };
  }
}
