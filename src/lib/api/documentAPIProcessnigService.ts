const API_BASE = '/api';

export class DocumentAPIProcessingService {
    /**
     * Process a document for analysis
     * @param document The File object to process
     * @returns Promise with the analysis results as a string
     */
    static async processDocument(document: File): Promise<string> {
        try {
            // Get the file data as an ArrayBuffer
            const fileBuffer = await document.arrayBuffer();

            // Send file as binary data
            const response = await fetch(`${API_BASE}/processDocument`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/octet-stream',
                },
                body: fileBuffer,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to process document`);
            }

            return await response.text();
        } catch (error) {
            console.error('Error in document processing service:', error);
            return error instanceof Error ? error.message : 'Počas analýzy dokumentu sa vyskytla neznáma chyba';
        }
    }
}