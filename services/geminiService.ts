import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CaseSummary, CaseSearchResult, Jurisdiction } from "../types";

const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || "" });
const modelId = "gemini-3-flash-preview"; 

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
    facts: { type: Type.STRING, description: "Extensive and detailed narrative of the material facts. Target 500+ words." },
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
      description: "A street-smart, practical analysis."
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
          type: { type: Type.STRING, enum: ['OFFICIAL PDF', 'LEGAL DB', 'NEWS/MEDIA'] },
          name: { type: Type.STRING, description: "Name of source (e.g. 'Supreme Court of India', 'LiveLaw')" },
          url: { type: Type.STRING, description: "Valid URL" }
        }
      },
      description: "Provide at least 9 distinct links: Official Repositories, Legal DBs, and Media Analysis."
    }
  },
  required: ["caseName", "citation", "court", "year", "facts", "irac", "stats", "issues", "decision", "ratioDecidendi", "significance", "subsequentDevelopments", "sources", "proceduralHistory", "petitionerArguments", "respondentArguments"]
};

const searchResultSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      caseName: { type: Type.STRING },
      citation: { type: Type.STRING },
      context: { type: Type.STRING, description: "Why this case matches the query" },
      pdfUrl: { type: Type.STRING, description: "Primary direct URL to PDF if available" },
      sourceUrls: { 
        type: Type.ARRAY, 
        items: {
          type: Type.OBJECT,
          properties: {
            source: { type: Type.STRING, description: "Source Name (e.g., Supreme Court, Indian Kanoon)" },
            url: { type: Type.STRING, description: "The direct link" }
          }
        },
        description: "List of multiple sources found via Google Search"
      }
    },
    required: ["caseName", "citation", "context"]
  }
};

export const searchCaseDatabase = async (
  query: string,
  jurisdiction: Jurisdiction
): Promise<CaseSearchResult[]> => {
  try {
    if (!apiKey) throw new Error("API Key not found");

    const prompt = `
      You are an elite Legal Search Engine powered by Gemini.
      User Query: "${query}"
      Jurisdiction: ${jurisdiction}
      
      SEARCH INSTRUCTIONS:
      1. **BOOLEAN LOGIC**: Strictly interpret 'AND', 'OR', 'NOT'.
      2. **ISSUE SEARCH**: Identify landmark cases for issue-based queries.

      GROUNDING & PDF RETRIEVAL (CRITICAL):
      You MUST search specifically within these repositories for DIRECT PDF/HTML links:
      
      INDIA:
      - Supreme Court: main.sci.gov.in (Prioritize)
      - Indian Kanoon: indiankanoon.org
      - eCourts: ecourts.gov.in
      - High Courts: delhihighcourt.nic.in, bombayhighcourt.nic.in, etc.
      
      GLOBAL:
      - CourtListener, BAILII, AustLII, CanLII, HUDOC.

      Return a JSON array of the top 4 most relevant cases.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: searchResultSchema,
        temperature: 0.1, 
      }
    });

    let text = response.text;
    if (!text) throw new Error("No response generated");
    
    if (text.trim().startsWith("```")) {
      text = text.replace(/^```(json)?\n?/i, "").replace(/\n?```$/, "");
    }

    return JSON.parse(text) as CaseSearchResult[];
  } catch (error) {
    console.error("Search Error:", error);
    throw error;
  }
};

export const fetchCaseSummary = async (
  query: string, 
  jurisdiction: Jurisdiction,
  isVakilMode: boolean = false,
  isRawText: boolean = false
): Promise<CaseSummary> => {
  try {
    if (!apiKey) throw new Error("API Key not found");

    let prompt = "";
    
    const persona = isVakilMode 
      ? `You are a legendary Senior Advocate. Provide EXHAUSTIVE, STRATEGIC, and DETAILED analysis (3000 words equivalent).
         TONE: Authoritative, cynical, bold.
         
         KEY REQUIREMENTS:
         - 'stats': You MUST estimate the impact score (0-100) and citation sentiment.
         - 'facts': Long narrative (600+ words).
         - 'irac': Deep breakdown.`
      : `You are an expert Legal Researcher. Provide a comprehensive summary (1000 words).`;

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
        
        SEARCH REQUIREMENT:
        You MUST find **9 DISTINCT LINKS** for the 'sources' array.
        Scan Official, Legal DBs, and reputable Media.
        
        1. **OFFICIAL REPOSITORIES (3)**: 
           - 'sci.gov.in', 'ecourts.gov.in', High Court websites.
           - International: 'govinfo.gov', 'curia.europa.eu'.
           
        2. **LEGAL DATABASES (3)**: 
           - 'indiankanoon.org', 'casemine.com', 'manupatra.com', 'legalcrystal.com'.
           - 'courtlistener.com', 'canlii.org', 'bailii.org'.
           
        3. **MEDIA & ANALYSIS (3)**: 
           - 'livelaw.in', 'barandbench.com', 'scconline.com', 'thehindu.com', 'bloombergquint.com'.
           
        EXTRACTION REQUIREMENT:
        - **Procedural History**: Extract the path from lower courts to the final court as a list of strings (e.g. "Trial Court convicted", "High Court acquitted").
        - **Arguments**: Clearly separate Petitioner vs Respondent arguments.
        - **Judges**: List all judges on the bench.
        
        ANALYTICS:
        - Populate 'citationTrend' (Decadal).
        - Populate 'benchSplit' (Majority/Dissent).
        - Populate 'legalConcepts' (Doctrines).
      `;
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], 
        responseMimeType: "application/json",
        responseSchema: caseSummarySchema,
        temperature: 0.2, 
      }
    });

    let text = response.text;
    if (!text) throw new Error("No response generated");

    if (text.trim().startsWith("```")) {
      text = text.replace(/^```(json)?\n?/i, "").replace(/\n?```$/, "");
    }

    return JSON.parse(text) as CaseSummary;

  } catch (error) {
    console.error("Gemini Legal Search Error:", error);
    throw error;
  }
};