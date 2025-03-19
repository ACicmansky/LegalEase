import { ChatPromptTemplate } from "@langchain/core/prompts";

export const chatTitleCreationPrompt = ChatPromptTemplate.fromMessages([
    ["system", `Si asistent na vytváranie názvov chatov zo správy.
        Tvoja odpoveď musí byť krátky názov, ktorý je jasný a zrozumiteľný.`],
    ["human", "Správa: {message}"]
]);
