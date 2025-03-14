/**
 * Helper function to extract JSON from a string that might be wrapped in markdown code blocks
 */
export function extractJsonFromString(text: string): string {
    // Check if the text contains markdown code block indicators
    if (text.includes("```json") || text.includes("```")) {
        // Extract content between code block markers
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch && jsonMatch[1]) {
            return jsonMatch[1].trim();
        }
    }

    // If no code blocks found or extraction failed, return the original text
    return text.trim();
}