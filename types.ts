export enum SearchMode {
  CITATION = 'CITATION',
  CASE_NAME = 'CASE_NAME',
  TEXT_ANALYSIS = 'TEXT_ANALYSIS'
}

export enum Jurisdiction {
  INDIA = 'India',
  USA = 'USA',
  UK = 'UK',
  AUSTRALIA = 'Australia',
  INTERNATIONAL = 'International'
}

export interface CaseSearchResult {
  caseName: string;
  citation: string;
  context: string; // A brief explanation of why this case matches the search
  pdfUrl?: string; // Primary direct link
  sourceUrls?: { source: string; url: string }[]; // List of multiple sources found via search
}

export interface RelatedCase {
  caseName: string;
  citation?: string;
  type: 'OVERRULED' | 'UPHELD' | 'DISTINGUISHED' | 'CITED' | 'RELIED_UPON';
  year?: number;
}

export interface TimelineEvent {
  date: string;
  event: string;
}

export interface IRAC {
  issue: string; // The legal question
  rule: string; // The relevant law/precedent
  analysis: string; // Application of law to facts
  conclusion: string; // The final holding
}

export interface CitationTrend {
  period: string; // e.g., "1980s", "1990s"
  count: number; // e.g., 45
}

export interface CitationStats {
  citationCount: number;
  sentiment: {
    positive: number; // Percentage 0-100
    neutral: number;  // Percentage 0-100
    negative: number; // Percentage 0-100
  };
  impactScore: number; // 0-100 Score
  citationTrend?: CitationTrend[]; // For Bar Chart
  benchSplit?: {
    majority: number;
    dissent: number;
  };
  legalConcepts?: string[]; // For Word Cloud
}

export interface CaseSource {
  type: 'OFFICIAL PDF' | 'LEGAL DB' | 'NEWS/MEDIA';
  name: string;
  url: string;
}

export interface CaseSummary {
  caseName: string;
  citation: string;
  court: string;
  year: number;
  benchStrength: string;
  judges: string[];
  jurisdiction: string;
  
  // Structured Headnote
  facts: string;
  timeline: TimelineEvent[]; 
  proceduralHistory?: string[]; // New: For Flowchart (e.g., Trial Court -> High Court)
  issues: string[];
  petitionerArguments: string;
  respondentArguments: string;
  
  // The Core Judgment
  decision: string; // Held
  ratioDecidendi: string; // The principle of law
  obiterDicta?: string; // Incidental remarks
  
  // Exam Perspective
  irac: IRAC;

  // Analytics
  stats: CitationStats;

  // The Street-Smart "Vakil Mode" Analysis
  vakilTake?: string; 
  
  significance: string; // Impact on law
  lawsInvolved: string[]; // Acts/Sections

  // Lineage
  precedents: RelatedCase[]; // Cases this case relies on
  subsequentDevelopments: RelatedCase[]; // Newer cases that cite this one
  
  sources: CaseSource[]; // 9 distinct links
}

export interface SearchState {
  query: string;
  mode: SearchMode;
  jurisdiction: Jurisdiction;
  rawText?: string;
}

export interface HistoryItem {
  query: string;
  timestamp: number;
  mode: SearchMode;
  jurisdiction: Jurisdiction;
}