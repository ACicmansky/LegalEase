# System Patterns

## Architecture Overview

The application follows a modern web architecture with Next.js serving both frontend and backend functionality, now focused on an AI Agents approach:

```
┌─────────────────────────────────────────┐
│                 Client                  │
│  (Next.js + React + Tailwind + ShadCN)  │
└───────────────────┬─────────────────────┘
                    │
┌───────────────────┼─────────────────────┐
│                   │                     │
│    ┌─────────────▼──────────────┐      │
│    │     Next.js API Routes     │      │
│    └─────────────┬──────────────┘      │
│                  │                      │
│    ┌─────────────▼──────────────┐      │
│    │    AI Agents Orchestration  │      │
│    └─────────────┬──────────────┘      │
│                  │                      │
│    ┌─────────────▼──────────────┐      │
│    │       Supabase Layer       │      │
│    └──────────────────────────────     │
│                                        │
│               Server                   │
└─────────────────────────────────────────┘
```

## Design Patterns

### 1. Repository Pattern
- Separation of data access logic from business logic
- Supabase client implementation for database operations
- Consistent interface for data operations

### 2. Service Layer Pattern
- Business logic encapsulated in service modules
- Separation of concerns between UI, API, and data access
- Reusable services for document processing, chat, and AI integration

### 3. Component-Based Architecture
- Reusable UI components with ShadCN/UI and Tailwind
- Composition over inheritance for UI elements
- Consistent styling and behavior across the application

### 4. API-First Design
- Well-defined API contracts for frontend-backend communication
- RESTful API routes with consistent patterns
- Type safety with TypeScript interfaces

### 5. Agent-Based Architecture
- Specialized AI agents for specific tasks
- Clear responsibility separation between agents
- Simple communication protocol between agents and system

## Key System Components

### Document Processing Pipeline
```
Upload → Validation → Agent Analysis → Summary Generation → Storage
```

### Chat System
```
User Query → Agent Processing → Response Generation → Storage
```

### Authentication Flow
```
Login/Register → JWT Token → Secure Session → Row Level Security
```

## Data Flow

1. **Document Upload Flow**
   - User uploads document
   - Backend validates document
   - Document Processing Agent analyzes the document
   - Agent extracts key information and generates summary
   - Document and analysis results saved to database

2. **Chat Interaction Flow**
   - User sends query
   - System provides document context to Conversational Agent
   - Agent generates response based on document context
   - Response and history saved to database

3. **Document Generation Flow**
   - User fills form with requirements
   - System processes requirements
   - AI generates document based on templates and requirements
   - Document presented to user for download

## Security Patterns

- **Authentication:** JWT-based authentication with Supabase Auth
- **Authorization:** Row Level Security (RLS) for data access control
- **Data Protection:** Encryption for sensitive data
- **Input Validation:** Server-side validation for all inputs

## Agent Architecture

### 1. Document Processing Agent
- **Responsibility:** Analyze legal documents, extract key information
- **Capabilities:** Document parsing, legal entity recognition, consistency checking
- **Outputs:** Document summary, key clauses, legal implications

### 2. Conversational Agent
- **Responsibility:** Engage in follow-up discussions about documents
- **Capabilities:** Question answering, next-step guidance, clarification
- **Inputs:** User query, document context, conversation history

### 3. Agent Communication
- **Message Format:** Structured data with clear input/output contracts
- **Context Passing:** Efficient sharing of document context between agents
- **Error Handling:** Graceful fallback mechanisms for agent failures
