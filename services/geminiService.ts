import { GoogleGenAI, Type, Schema, ThinkingLevel } from "@google/genai";
import { CaseSummary, CaseSearchResult, Jurisdiction, SearchFilters, CaseType, RelevanceSort } from "../types";

const apiKey = process.env.GEMINI_API_KEY;

const checkApiKey = () => {
  if (!apiKey || apiKey.trim() === "") {
    throw new Error("API_KEY_MISSING");
  }
};

const ai = new GoogleGenAI({ apiKey: apiKey || "" });
const modelId = "gemini-3-flash-preview"; 

// Retry logic wrapper with exponential backoff
const withRetry = async <T>(fn: () => Promise<T>, retries = 3): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      const waitTime = Math.pow(2, 3 - retries) * 1000;
      console.warn(`Retrying in ${waitTime}ms... attempts left: ${retries}`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return withRetry(fn, retries - 1);
    }
    throw error;
  }
};

// Schema definition for the structured legal output
const caseSummarySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    caseName: { type: Type.STRING, description: "Official name of the case" },
    citation: { type: Type.STRING, description: "Primary legal citation (e.g., AIR 1973 SC 1461)" },
    court: { type: Type.STRING, description: "Name of the court" },
    year: { type: Type.INTEGER, description: "Year of the judgment" },
    benchStrength: { type: Type.STRING, description: "Number of judges or bench type (e.g., Constitution Bench)" },
    judges: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of judges on the bench"
    },
    jurisdiction: { type: Type.STRING },
    factsAndNarrative: { type: Type.STRING, description: "A comprehensive, all-covering section that integrates material facts with a natural narrative story. Target 600-800 words." },
    timeline: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING, description: "Date or Year" },
          event: { type: Type.STRING, description: "What happened" }
        }
      },
      description: "Chronological sequence of events."
    },
    proceduralHistory: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Step-by-step flow of the case through courts (e.g., ['Trial Court convicted accused', 'High Court acquitted', 'Supreme Court restored conviction'])."
    },
    irac: {
      type: Type.OBJECT,
      properties: {
        issue: { type: Type.STRING, description: "The specific legal question." },
        rule: { type: Type.STRING, description: "The specific statutes or precedents applied." },
        analysis: { type: Type.STRING, description: "Comprehensive application of law to facts." },
        conclusion: { type: Type.STRING, description: "The final holding/conclusion." }
      },
      description: "IRAC Analysis."
    },
    stats: {
      type: Type.OBJECT,
      properties: {
        citationCount: { type: Type.INTEGER, description: "Approximate number of times this case has been cited." },
        sentiment: {
          type: Type.OBJECT,
          properties: {
            positive: { type: Type.NUMBER, description: "Percentage (0-100) of positive citations/affirmations." },
            neutral: { type: Type.NUMBER, description: "Percentage (0-100) of neutral citations." },
            negative: { type: Type.NUMBER, description: "Percentage (0-100) of negative/overruling citations." }
          }
        },
        impactScore: { type: Type.INTEGER, description: "A score from 0 to 100 indicating the legal impact." },
        citationTrend: {
          type: Type.ARRAY,
          items: {
             type: Type.OBJECT,
             properties: {
               period: { type: Type.STRING, description: "Decade or Era (e.g. '1980s')" },
               count: { type: Type.INTEGER, description: "Relative frequency (0-100)" }
             }
          },
          description: "Data for a bar chart showing citation frequency over time."
        },
        benchSplit: {
          type: Type.OBJECT,
          properties: {
            majority: { type: Type.INTEGER, description: "Number of judges in majority" },
            dissent: { type: Type.INTEGER, description: "Number of judges in dissent" }
          }
        },
        legalConcepts: {
           type: Type.ARRAY,
           items: { type: Type.STRING },
           description: "Top 5-7 key legal doctrines/concepts associated with this case."
        }
      }
    },
    vakilTake: {
      type: Type.STRING,
      description: "A street-smart, practical analysis. Target 600-800 words."
    },
    reasoningNote: {
      type: Type.STRING,
      description: "Explain the AI reasoning process: how names were detected, how cases were matched, and how the summary was generated in plain language."
    },
    issues: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of legal issues or questions of law raised"
    },
    petitionerArguments: { type: Type.STRING, description: "Summary of arguments by the Petitioner/Appellant" },
    respondentArguments: { type: Type.STRING, description: "Summary of arguments by the Respondent" },
    decision: { type: Type.STRING, description: "The final verdict/held" },
    ratioDecidendi: { type: Type.STRING, description: "The core legal principle derived (Ratio)" },
    obiterDicta: { type: Type.STRING, description: "Any significant incidental remarks (Obiter)" },
    significance: { type: Type.STRING, description: "Impact on the legal landscape" },
    lawsInvolved: {
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of Specific Acts, Articles, or Sections referenced"
    },
    precedents: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          caseName: { type: Type.STRING },
          citation: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['RELIED_UPON', 'DISTINGUISHED', 'OVERRULED'] }
        }
      },
      description: "Older cases that this judgment relied upon"
    },
    subsequentDevelopments: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          caseName: { type: Type.STRING },
          citation: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['OVERRULED', 'UPHELD', 'CITED'] },
          year: { type: Type.INTEGER }
        }
      },
      description: "List major cases that have cited, overruled, or distinguished this case."
    },
    sources: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ['OFFICIAL PDF', 'LEGAL DB', 'NEWS/MEDIA', 'DIRECT PDF DOWNLOAD'] },
          name: { type: Type.STRING, description: "Name of source (e.g. 'Supreme Court of India', 'LiveLaw', 'Direct PDF Download')" },
          url: { type: Type.STRING, description: "Valid URL" }
        }
      },
      description: "Provide at least 9 distinct links: Official Repositories, Legal DBs, Media Analysis, and at least 2 DIRECT PDF DOWNLOAD links."
    }
  },
  required: ["caseName", "citation", "court", "year", "factsAndNarrative", "irac", "stats", "issues", "decision", "ratioDecidendi", "significance", "subsequentDevelopments", "sources", "proceduralHistory", "petitionerArguments", "respondentArguments"]
};

const searchResultSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      caseName: { type: Type.STRING },
      citation: { type: Type.STRING },
      context: { type: Type.STRING, description: "Brief context" },
      pdfUrl: { type: Type.STRING, description: "PDF link" },
      sourceUrls: { 
        type: Type.ARRAY, 
        items: {
          type: Type.OBJECT,
          properties: {
            source: { type: Type.STRING },
            url: { type: Type.STRING }
          }
        }
      }
    },
    required: ["caseName", "citation", "context"]
  }
};

export const searchCaseDatabase = async (
  query: string,
  jurisdiction: Jurisdiction,
  filters?: SearchFilters
): Promise<CaseSearchResult[]> => {
  return withRetry(async () => {
    checkApiKey();

    const filterContext = filters ? `
      FILTERS:
      - Case Type: ${filters.caseType}
      - Year Range: ${filters.yearStart || 'Any'} to ${filters.yearEnd || 'Any'}
      - Sort By: ${filters.relevance}
    ` : '';

    const prompt = `
      You are an elite Legal Search Engine powered by Gemini. 
      Your mission is to find high-authority, verifiable legal documents.

      User Query: "${query}"
      Jurisdiction: ${jurisdiction}
      ${filterContext}
      
      CRITICAL SEARCH INSTRUCTIONS:
      1. **ENTITY DETECTION**: Automatically detect parties, judges, and specific statutes. 
         - If query is a citation (e.g., '2014 4 SC 1'), prioritize finding the exact case.
         - If query is a topic (e.g., 'Right to Privacy'), find LANDMARK cases first.
      2. **LINK STABILITY (THE GOLDEN RULE)**: 
         - ALWAYS provide a direct Google Search link formatted exactly as: 'https://www.google.com/search?q=[FULL_CASE_NAME]+[SITE_NAME]'
         - Prioritize official court websites (.gov.in, .gov.uk, etc.), Indian Kanoon, and major legal journals (LiveLaw, Bar & Bench).
      3. **PDF EXTRACTION**: 
         - Attempt to find a Direct PDF Download search string: 'https://www.google.com/search?q=[FULL_CASE_NAME]+filetype:pdf'
      4. **CONTEXT**: In the 'context' field, explain the relevance to the user's specific query. Use professional legal terminology.

      Return a JSON array of the top 5 most relevant results.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: searchResultSchema,
        temperature: 0, 
      }
    });

    let text = response.text;
    if (!text) throw new Error("No response generated");
    
    if (text.trim().startsWith("```")) {
      text = text.replace(/^```(json)?\n?/i, "").replace(/\n?```$/, "");
    }

    return JSON.parse(text) as CaseSearchResult[];
  });
};

export const fetchCaseSummary = async (
  query: string, 
  jurisdiction: Jurisdiction,
  isVakilMode: boolean = false,
  isRawText: boolean = false
): Promise<CaseSummary> => {
  return withRetry(async () => {
    checkApiKey();

    let prompt = "";
    
    const persona = isVakilMode 
      ? `You are a legendary Senior Advocate. Provide a STRATEGIC, AUTHORITATIVE, and DETAILED analysis (800+ words for the 'vakilTake' section).
         TONE: Cynical yet deeply insightful, street-smart, and strategic.
         
         KEY REQUIREMENTS FOR 'vakilTake':
         - **Strategic Posturing**: How would you argue this today?
         - **Hidden Precedents**: Mention lesser-known cases that influence this.
         - **Litigation Risks**: What are the dangers of relying on this case?
         - **Modern Context**: How does this play in today's courts?
         
         OTHER REQUIREMENTS:
         - 'stats': Accurate impact score and sentiment analytics.
         - 'factsAndNarrative': A compelling, detailed story of the case (600+ words).`
      : `You are an expert Legal Researcher. Provide a definitive, scholarly summary (600+ words).`;

    if (isRawText) {
      prompt = `
        ${persona}
        Analyze the provided raw judgment text. 
        Extract key elements into the structured format.
        
        Raw Text:
        """
        ${query.substring(0, 30000)} 
        """
      `;
    } else {
      prompt = `
        ${persona}
        The user wants a detailed summary of: "${query}" (${jurisdiction}).
        
        Provide the output in the defined JSON schema.
        
        CONTENT EXPANSION:
        - **Facts & Narrative**: A comprehensive, all-covering section that integrates material facts with a natural narrative story. Ensure it is detailed and authoritative.
        - **Issues Framed**: Clear legal questions at hand.
        - **Holdings and Reasoning**: The 'why' behind the decision, covering all facets.
        - **Citations**: Use Bluebook/OSCOLA/local style. Include parallel citations where relevant.
        - **AI Reasoning Note**: Explain how you detected names, matched cases, and generated this summary.

        SEARCH & LINK PROTOCOL:
        1. **STRATEGY**: Strictly provide **GOOGLE SEARCH URLs** for all sources to ensure stability.
        2. **9 SEARCH LINKS**: Provide exactly 9 links in 'sources'.
        3. **LINK STABILITY**: Use Google Search links for Indian Kanoon, Official Court websites (e.g. sci.gov.in, hc.gov.in), and direct PDF downloads.
        4. **CRITICAL OFFICIAL SOURCE OPTIMIZATION**: The user needs immediate access to the direct official PDF of the case. In India, official pages are often hard to find because secondary citation blogs dominate.
           - The VERY FIRST source in the 'sources' array MUST be of type 'OFFICIAL PDF' or 'DIRECT PDF DOWNLOAD' and link to the primary official judgement text.
           - This first link's URL MUST be constructed using high-precision Google Search parameters to screen out secondary legal articles/citations.
           - Use this precise query URL format for the first listing:
             https://www.google.com/search?q=site:gov.in+OR+site:nic.in+OR+site:indiankanoon.org+"[CASE_NAME]"+judgment+filetype:pdf+-"judgment+relying+upon"+-"judgement+relying+upon"+-"cases+relying+on"+-"cited+in"+-"referring+to"+-"referred+in"
             (Replace [CASE_NAME] with the actual full name of the case with spaces encoded as '+').
        
        ANALYTICS:
        - Accurate 'citationTrend' and 'benchSplit' data.
      `;
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], 
        responseMimeType: "application/json",
        responseSchema: caseSummarySchema,
        temperature: 0,
      }
    });

    let text = response.text;
    if (!text) throw new Error("No response generated");

    if (text.trim().startsWith("```")) {
      text = text.replace(/^```(json)?\n?/i, "").replace(/\n?```$/, "");
    }

    return JSON.parse(text) as CaseSummary;
  });
};
