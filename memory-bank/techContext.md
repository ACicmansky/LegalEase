# Technical Context

## Tech Stack

### Frontend
- **Framework:** React.js with Next.js for server-side rendering
- **Styling:** Tailwind CSS for rapid UI development
- **Components:** ShadCN/UI for reusable UI elements
- **State Management:** React Context API / React Query
- **HTTP Client:** Axios for API communication
- **Internationalization:** i18next (Slovak & English support)

### Backend
- **Framework:** Next.js API routes
- **Database:** PostgreSQL via Supabase
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage
- **Vector Store:** Supabase Vector Store for embeddings

### AI & NLP
- **Framework:** LangChain for AI orchestration
- **Models:** 
  - Hugging Face Llama 3.3 for legal chatbot and document analysis
  - Hugging Face Transformers (LegalBERT) for legal text processing
- **Document Processing:** OCR capabilities for scanned documents

### Security & Compliance
- **Authentication:** Supabase Auth with JWT
- **Data Protection:** GDPR-compliant encryption
- **Access Control:** Row Level Security (RLS) in Supabase

## Development Environment
- **Version Control:** GitHub
- **Project Management:** Jira/Trello
- **Communication:** Slack
- **API Testing:** Postman

## Architecture Overview
- Next.js for both frontend and backend (API routes)
- Supabase for database, authentication, and storage
- LangChain for AI integration and document processing
- Vector embeddings for semantic search capabilities

## Key Dependencies
- TypeScript for type safety
- LangChain for AI orchestration
- Supabase Client for database operations
- ShadCN/UI and Tailwind CSS for UI components
