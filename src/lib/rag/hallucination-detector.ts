// export class HallucinationDetector {
//   private threshold: number;
  
//   constructor(threshold: number = 0.85) {
//     this.threshold = threshold;
//   }

//   async detectHallucination(response: string, context: string): Promise<{ isHallucination: boolean; confidence: number; reason?: string }> {
//     // Check if response contains information not present in context
//     const responseTokens = new Set(response.toLowerCase().split(/\s+/));
//     const contextTokens = new Set(context.toLowerCase().split(/\s+/));
    
//     // Calculate token overlap ratio
//     let overlapCount = 0;
//     for (const token of responseTokens) {
//       if (contextTokens.has(token)) {
//         overlapCount++;
//       }
//     }
    
//     const overlapRatio = overlapCount / responseTokens.size;
//     const confidence = 1 - overlapRatio;

//     // Check for specific hallucination indicators
//     const hasUnsupportedClaims = this.checkUnsupportedClaims(response, context);
//     const hasInconsistentDates = this.checkDateConsistency(response, context);
    
//     if (confidence > this.threshold || hasUnsupportedClaims || hasInconsistentDates) {
//       return {
//         isHallucination: true,
//         confidence,
//         reason: this.getHallucinationReason(confidence, hasUnsupportedClaims, hasInconsistentDates)
//       };
//     }

//     return { isHallucination: false, confidence };
//   }

//   private checkUnsupportedClaims(response: string, context: string): boolean {
//     // Look for definitive statements that aren't backed by context
//     const definitivePatterns = [
//       /definitely|absolutely|always|never|must|all|none/i,
//       /according to|states that|confirms that/i
//     ];

//     return definitivePatterns.some(pattern => {
//       const match = response.match(pattern);
//       if (match) {
//         const surroundingText = this.getTextAroundMatch(response, match.index!, 50);
//         return !context.toLowerCase().includes(surroundingText.toLowerCase());
//       }
//       return false;
//     });
//   }

//   private checkDateConsistency(response: string, context: string): boolean {
//     const datePattern = /\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b|\b\d{1,2}[-/]\d{1,2}[-/]\d{4}\b/g;
//     const responseDates: string[] = response.match(datePattern) || [];
//     const contextDates: string[] = context.match(datePattern) || [];

//     return responseDates.some(date => !contextDates.includes(date));
//   }

//   private getTextAroundMatch(text: string, matchIndex: number, windowSize: number): string {
//     const start = Math.max(0, matchIndex - windowSize);
//     const end = Math.min(text.length, matchIndex + windowSize);
//     return text.slice(start, end);
//   }

//   private getHallucinationReason(confidence: number, hasUnsupportedClaims: boolean, hasInconsistentDates: boolean): string {
//     const reasons: string[] = [];
//     if (confidence > this.threshold) {
//       reasons.push(`Low context overlap (${(confidence * 100).toFixed(1)}% divergence)`);
//     }
//     if (hasUnsupportedClaims) {
//       reasons.push('Contains unsupported definitive claims');
//     }
//     if (hasInconsistentDates) {
//       reasons.push('Contains dates not present in context');
//     }
//     return reasons.join(', ');
//   }
// }
