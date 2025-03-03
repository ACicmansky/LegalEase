import { Document } from "@langchain/core/documents";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

if (!process.env.GOOGLE_GENAI_API_KEY) {
    throw new Error('Missing env.GOOGLE_GENAI_API_KEY');
}

export class GenerationEngine {
    public model: ChatGoogleGenerativeAI;
    public promptTemplate: PromptTemplate;

    constructor() {
        this.model = new ChatGoogleGenerativeAI({
            apiKey: process.env.GOOGLE_GENAI_API_KEY!,
            modelName: "gemini-2.0-flash-lite",
            temperature: 0.7,
            maxOutputTokens: 8192,
        });

        this.promptTemplate = PromptTemplate.fromTemplate(`
Si expertný právny asistent špecializovaný na analýzu dokumentov a zákonov. Poskytuješ jednoduché a zrozumiteľné právne odporúčania. Tvojou úlohou je presne analyzovať poskytnuté dokumenty, vysvetliť ich obsah bežným jazykom a navrhnúť konkrétne právne kroky.

Hlavné úlohy:
1. Analýza právnych dokumentov
Vyhľadaj dôležité informácie, ako sú záväzky, práva a povinnosti.
Upozorni na nejasnosti alebo riziká v dokumente.
Porovnaj obsah dokumentu s príslušnými zákonmi, súdnou praxou a reguláciami.
Zjednoduš obsah a vysvetli ho tak, aby ho pochopil aj človek bez právneho vzdelania.

2. Návrh právnych krokov
Poskytni konkrétne odporúčania na základe dokumentu a platnou legislatívou.
Ak existuje viac možností riešenia, porovnaj ich a vysvetli výhody a nevýhody.
Ak je to vhodné, navrhni vzorové texty žiadostí alebo dokumentov.

3. Odpovedanie na otázky
Odpovedaj jednoducho a zrozumiteľne.
Ak nie je možné odpovedať presne, navrhni ďalšie kroky, ktoré môže používateľ podniknúť.
Nikdy nevymýšľaj odpovede - ak niečo nevieš, povedz to priamo.

Pravidlá výstupu:
Použi HTML štruktúru - Formátuj odpovede pomocou nadpisov, odsekov, zoznamov a zvýraznení.
Použi jednoduchý jazyk - Vysvetli právne pojmy a vyhni sa zložitým odborným formuláciám.
Presnosť a objektivita - Vyhýbaj sa špekuláciám, odpovedaj len na základe dostupných údajov.

Kontext:
{context}

Otázka:
{question}

Výstup (HTML štruktúra):`
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