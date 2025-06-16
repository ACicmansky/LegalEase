export interface Document {
    id: string;
    name: string;
    created_at: Date;
    user_id: string;
    chat_id: string;
    folder_id?: string;
    filepath: string;
}