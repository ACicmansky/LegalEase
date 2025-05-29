import { ChatPromptTemplate } from "@langchain/core/prompts";

export const chatTitleCreationPrompt = ChatPromptTemplate.fromMessages([
    ["system", `Si asistent na vytváranie názvov chatov zo správy.
        Tvoja odpoveď musí obsahovať iba samotný názov chatu - krátky, jasný a zrozumiteľný.
        Nepoužívaj žiadne úvodné frázy ako "Názov:", "Názov chatu:" alebo iné označenia.
        Vráť iba samotný text názvu.`],
    ["human", "Správa: {message}"]
]);
