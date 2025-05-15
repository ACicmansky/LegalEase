# LegalEases: AI-Powered Legal Assistant

[![Next.js](https://img.shields.io/badge/Next.js-13.5+-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.io/)
[![Vercel AI SDK](https://img.shields.io/badge/Vercel_AI_SDK-black?style=for-the-badge&logo=vercel)](https://sdk.vercel.ai/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)

## 🌟 Overview

LegalEases is an AI-powered legal assistant built for the Slovak market. It aims to make legal information accessible and affordable to everyone by leveraging advanced language models and sophisticated retrieval augmented generation (RAG) techniques.

### 🎯 Core Features

#### 📄 Legal Document Explanation
- Upload and analyze legal documents (PDF, DOCX, TXT)
- Get simple explanations of complex legal clauses
- Highlight important terms, obligations, and potential risks

#### 💬 AI-Powered Legal Chatbot
- Ask legal questions in Slovak
- Get responses based on current Slovak legislation
- Covers common legal topics (contracts, agreements, consumer rights)

#### 📝 Legal Document Generation
- Create basic legal documents through guided forms
- Generate contracts, NDAs, and other documents
- Download as professional PDF files

## 🛠️ Technology Stack

### Frontend
- **Framework**: React.js with Next.js App Router
- **Styling**: Tailwind CSS
- **UI Components**: ShadCN/UI
- **State Management**: React Context API & TanStack Query
- **Forms**: React Hook Form with Zod validation

### Backend & Data
- **API Routes**: Next.js API routes
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Vector Store**: Supabase Vector Store for embeddings

### AI & NLP
- **AI Framework**: Vercel AI SDK with Google AI SDK integration
- **Orchestration Tools**: Custom sequential processing pipeline
- **Models**: Google Gemini 2.0 Flash

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager
- Supabase account
- Google API key for model access

### Environment Setup

Create a `.env.local` file in the project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://bvomllgtdxyblstbretm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Model Configuration
GOOGLE_API_KEY=your_google_api_key
```

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application running.

## 📊 System Architecture

### Legal Agent Pipeline

Our system uses a sophisticated sequential processing pipeline for handling legal queries:

1. **Intent Classification**: Identifies query type (lookup, document question, procedural)
2. **Entity Extraction**: Recognizes laws, sections, terms, and relevant dates
3. **Law Retrieval**: Fetches relevant laws with efficient caching system
4. **Response Generation**: Creates comprehensive answers with proper citations
5. **Guidance Formulation**: Provides step-by-step instructions for procedural queries

### Law Caching System

To optimize performance and reduce costs, we implement a law caching system that:

- Stores retrieved laws in the database
- Tracks version history and updates
- Ensures freshness of legal content
- Monitors official sources for updates

## 🧪 Development

### Code Style & Standards

This project follows strict TypeScript practices:
- No use of `any` type
- SOLID principles
- Airbnb Style Guide
- PascalCase for React component files

### Folder Structure

```
├── public/               # Static assets
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # Reusable UI components
│   ├── lib/
│   │   ├── agents/       # AI agents implementation
│   │   ├── db/           # Database utilities
│   │   └── utils/        # Helper functions
│   ├── types/            # TypeScript types and interfaces
│   └── styles/           # Global styles
├── docs/                 # Documentation
└── memory-bank/          # Project context documentation
```

### Running Tests

```bash
# Run unit tests
npm run test

# Run end-to-end tests
npm run test:e2e
```

## 📝 License

This project is licensed under a proprietary license. All rights reserved.

### Usage Restrictions

- All usage and modification of this codebase requires explicit written permission from the author
- No public distribution or redistribution is permitted
- No derivative works may be created without authorization
- The software is provided as-is with no warranty

---

Built with ❤️ for making legal assistance accessible to everyone in Slovakia.

© 2025 LegalEases. All rights reserved.
