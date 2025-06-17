# Document Processing Enhancement Plan
*June 17, 2025*

## Overview

Today we finalized our plan for enhancing the document processing workflow with a focus on GDPR compliance, anonymization, and two-tier summary generation. This represents a significant improvement to our document handling capabilities and aligns with our MVP priorities.

## Technical Approach

### 1. Vercel AI SDK Migration

We will migrate the document processing agent to use Vercel AI SDK, following the same approach used for the conversational agent. This will provide:
- Consistent architecture across agents
- Improved streaming capabilities
- Better integration with our existing Vercel AI SDK components
- Enhanced error handling

### 2. Privacy-First Document Processing

Our new document processing workflow follows these steps:
1. **In-Memory Text Extraction**: Use `office-text-extractor` to extract text from files (DOCX, PPTX, XLSX, PDF) without storing the original file
2. **Anonymization**: Use Mistral models (which don't train on user data) to identify and anonymize PII
3. **Anonymized Storage**: Only store the anonymized text version of documents
4. **Analysis of Anonymized Content**: All subsequent processing steps work exclusively with anonymized text

### 3. Anonymization Strategy

We'll use Mistral models via Vercel AI SDK to identify and replace:
- Names and surnames of natural persons
- Personal identification numbers
- Dates of birth
- Addresses
- ID documents
- Contact information (phone, email, IP, URL)
- Bank details
- Property identifiers
- Confidential information and trade secrets

Anonymization will replace PII with realistic but fake data while maintaining internal consistency.

### 4. Two-Tier Summary Approach

1. **Professional Detailed Analysis**:
   - Comprehensive legal review
   - Risk assessment
   - Recommendations and next steps
   - Legal opinion
   - Saved to database for reference

2. **User-Friendly Summary**:
   - Simplified explanation
   - Key points in plain language
   - Presented as first message in chat
   - Links to access more detailed information

## Technical Considerations

- **Data Flow**: Buffer → Text Extraction → Anonymization → Storage → Analysis → Two-tier Summaries
- **Prompt Engineering**: Need to create specialized prompts for anonymization, focusing on Slovak-specific PII patterns
- **Performance**: Monitor performance impacts of the additional anonymization step
- **Consistency**: Ensure replaced entities maintain consistency throughout the document
- **Verification**: Consider implementing verification steps to confirm anonymization quality

## GDPR Benefits

- No storage of original documents
- Anonymized processing and storage
- Use of privacy-focused models (Mistral)
- Clear documentation of anonymization process
- Minimized data exposure

## Next Steps

1. Implement the Vercel AI SDK migration for document processing agent
2. Create anonymization function with Mistral models
3. Modify document storage to save anonymized text only
4. Enhance analysis capabilities for professional summaries
5. Implement two-tier summary generation
6. Connect user-friendly summary to chat interface
