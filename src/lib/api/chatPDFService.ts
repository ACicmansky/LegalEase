// ChatPDF API Service
// Documentation: https://www.chatpdf.com/docs/api/backend

export interface ChatPDFMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatPDFReference {
  pageNumber: number;
}

export interface ChatPDFResponse {
  content: string;
  references?: ChatPDFReference[];
}

export class ChatPDFService {
  private static readonly API_BASE = 'https://api.chatpdf.com';
  private static readonly API_KEY = process.env.CHATPDF_API_KEY || '';

  /**
   * Upload a file to ChatPDF
   * @param file The file to upload
   * @returns The source ID of the uploaded file
   */
  static async uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.API_BASE}/sources/add-file`, {
      method: 'POST',
      headers: {
        'x-api-key': this.API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload file: ${await response.text()}`);
    }

    const data = await response.json();
    return data.sourceId;
  }

  /**
   * Send a chat message to ChatPDF
   * @param sourceId The source ID of the PDF
   * @param messages The chat history
   * @param referenceSources Whether to include reference sources in the response
   * @returns The response from ChatPDF
   */
  static async chat(
    sourceId: string, 
    messages: ChatPDFMessage[], 
    referenceSources: boolean = false
  ): Promise<ChatPDFResponse> {
    const response = await fetch(`${this.API_BASE}/chats/message`, {
      method: 'POST',
      headers: {
        'x-api-key': this.API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceId,
        messages,
        referenceSources,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to chat with PDF: ${await response.text()}`);
    }

    return response.json();
  }

  /**
   * Delete a PDF from ChatPDF
   * @param sourceId The source ID of the PDF to delete
   */
  static async delete(sourceId: string): Promise<void> {
    const response = await fetch(`${this.API_BASE}/sources/delete`, {
      method: 'POST',
      headers: {
        'x-api-key': this.API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sources: [sourceId],
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete PDF: ${await response.text()}`);
    }
  }
}