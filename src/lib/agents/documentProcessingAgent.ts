'use server';

import { getTextExtractor } from 'office-text-extractor'
import { generateText } from "ai";
import { getGemini2_5FlashFromAiSdk, getGeminiFlashLiteFromAiSdk, getGroqFromAiSdk } from "@/lib/agents/languageModels";
import { DocumentProcessingResult } from "./schemas/documentProcessingSchemas";
import { extractJsonFromString } from '@/lib/utils/textProcessing';
import {
    anonymizeDocumentSystemPrompt,
    createAnonymizeDocumentHumanPrompt,
    detailedAnalysisSystemPrompt,
    createDetailedAnalysisHumanPrompt,
    extractKeyInformationSystemPrompt,
    createExtractKeyInformationHumanPrompt,
    legalAnalysisSystemPrompt,
    createLegalAnalysisHumanPrompt,
    consistencyChecksSystemPrompt,
    createConsistencyChecksHumanPrompt,
    simplifiedSummarySystemPrompt,
    createSimplifiedSummaryHumanPrompt
} from "./prompts/documentProcessingAgentPrompts";

export async function processDocument(file: File): Promise<DocumentProcessingResult> {
    try {
        //1. extract text from document
        const buffer = Buffer.from(await file.arrayBuffer());
        const extractor = getTextExtractor();
        const text = await extractor.extractText({ input: buffer, type: "buffer" });

        //2. anonymize text
        const anonymizationModel = await getGroqFromAiSdk();
        const anonymizedText = await generateText({
            model: anonymizationModel,
            system: anonymizeDocumentSystemPrompt,
            prompt: createAnonymizeDocumentHumanPrompt(text),
            temperature: 0.1
        });

        //3. extract key information
        const extractKeyInformationModel = await getGemini2_5FlashFromAiSdk();
        const keyInformation = await generateText({
            model: extractKeyInformationModel,
            system: extractKeyInformationSystemPrompt,
            prompt: createExtractKeyInformationHumanPrompt(anonymizedText.text),
            temperature: 0.1
        });

        //4. perform legal analysis
        const advancedModelWithSearch = await getGemini2_5FlashFromAiSdk(true);
        const legalAnalysis = await generateText({
            model: advancedModelWithSearch,
            system: legalAnalysisSystemPrompt,
            prompt: createLegalAnalysisHumanPrompt(anonymizedText.text, keyInformation.text),
            temperature: 0.1
        });

        //5. perform consistency checks
        const consistencyChecks = await generateText({
            model: advancedModelWithSearch,
            system: consistencyChecksSystemPrompt,
            prompt: createConsistencyChecksHumanPrompt(anonymizedText.text, keyInformation.text, legalAnalysis.text),
            temperature: 0.1
        });

        //6. create detailed analysis summary from previous informations
        const detailedAnalysis = await generateText({
            model: advancedModelWithSearch,
            system: detailedAnalysisSystemPrompt,
            prompt: createDetailedAnalysisHumanPrompt(anonymizedText.text, keyInformation.text, legalAnalysis.text, consistencyChecks.text),
            temperature: 0.1
        });

        //7. create simplified summary
        const simplifiedSummaryModel = await getGeminiFlashLiteFromAiSdk();
        const simplifiedSummary = await generateText({
            model: simplifiedSummaryModel,
            system: simplifiedSummarySystemPrompt,
            prompt: createSimplifiedSummaryHumanPrompt(detailedAnalysis.text),
            temperature: 0.1
        });

        //8. parse and structure results
        try {
            // Parse the JSON responses
            const keyInfoData = extractJsonFromString(keyInformation.text);
            const legalAnalysisData = extractJsonFromString(legalAnalysis.text);
            const consistencyChecksData = extractJsonFromString(consistencyChecks.text);
            const detailedAnalysisData = extractJsonFromString(detailedAnalysis.text);

            // Return structured result according to our schema
            const result: DocumentProcessingResult = {
                anonymizedContent: anonymizedText.text,
                keyInformation: keyInfoData,
                legalAnalysis: legalAnalysisData,
                consistencyChecks: consistencyChecksData,
                detailedAnalysis: detailedAnalysisData,
                simplifiedSummary: simplifiedSummary.text
            };

            return result;
        } catch (parseError: unknown) {
            console.error("Error parsing JSON responses:", parseError);
            throw new Error(`Failed to parse analysis results: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
        }
    } catch (error) {
        console.error("Error processing document:", error);
        throw error;
    }
}