import React, { useState, useEffect } from 'react';
import { HeroSection } from './components/HeroSection';
import { ResultCard } from './components/ResultCard';
import { LoadingGavel } from './components/LoadingGavel';
import { CaseList } from './components/CaseList';
import { PdfViewerModal } from './components/PdfViewerModal'; 
import { searchCaseDatabase, fetchCaseSummary } from './services/geminiService';
import { CaseSummary, CaseSearchResult, SearchMode, Jurisdiction, HistoryItem } from './types';

function App() {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<SearchMode>(SearchMode.CASE_NAME);
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>(Jurisdiction.INDIA);
  
  // Vakil Mode State
  const [isVakilMode, setIsVakilMode] = useState(false);
  
  // PDF Modal State
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  
  // State for Flow Management
  const [searchResults, setSearchResults] = useState<CaseSearchResult[] | null>(null);
  const [summary, setSummary] = useState<CaseSummary | null>(null);
  const [searchHistory, setSearchHistory] = useState<HistoryItem[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('jurisLensHistory');
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const addToHistory = (q: string, m: SearchMode, j: Jurisdiction) => {
    const newItem: HistoryItem = { query: q, timestamp: Date.now(), mode: m, jurisdiction: j };
    const updated = [newItem, ...searchHistory.filter(item => item.query !== q)].slice(0, 6);
    setSearchHistory(updated);
    localStorage.setItem('jurisLensHistory', JSON.stringify(updated));
  };

  const handleInitialSearch = async (overrideQuery?: string) => {
    const searchQuery = overrideQuery || query;
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);
    setSearchResults(null);
    setSummary(null);

    if (overrideQuery) setQuery(overrideQuery);

    try {
      if (mode === SearchMode.TEXT_ANALYSIS) {
        const result = await fetchCaseSummary(searchQuery, jurisdiction, isVakilMode, true);
        setSummary(result);
      } else {
        const matches = await searchCaseDatabase(searchQuery, jurisdiction);
        setSearchResults(matches);
      }
      addToHistory(searchQuery, mode, jurisdiction);
    } catch (err) {
      console.error(err);
      setError("The archives yielded no results. Please verify your query or citation.");
    } finally {
      if (mode !== SearchMode.TEXT_ANALYSIS) {
        setIsLoading(false);
      }
    }
  };

  const handleCaseSelect = async (selectedCase: CaseSearchResult) => {
    setIsLoading(true);
    setSearchResults(null);
    setError(null);

    try {
      const fullQuery = `${selectedCase.caseName} ${selectedCase.citation}`;
      const result = await fetchCaseSummary(fullQuery, jurisdiction, isVakilMode, false);
      setSummary(result);
    } catch (err) {
      console.error(err);
      setError("Unable to retrieve the full case roll.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetSearch = () => {
    setSearchResults(null);
    setSummary(null);
    setQuery('');
    setIsPdfOpen(false);
  };

  const handleHistoryClick = (item: HistoryItem) => {
    setMode(item.mode);
    setJurisdiction(item.jurisdiction);
    setQuery(item.query);
    handleInitialSearch(item.query);
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${isVakilMode ? 'bg-zinc-950 selection:bg-neon-green selection:text-black' : 'bg-slate-900 text-slate-200 selection:bg-gold-500 selection:text-navy-900'}`}>
      
      {/* Vakil Mode Toggle Button (Floating) */}
      <button 
        onClick={() => setIsVakilMode(!isVakilMode)}
        className={`fixed bottom-8 right-8 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center border-2 ${isVakilMode ? 'bg-black border-neon-green shadow-[0_0_20px_#39ff14]' : 'bg-navy-900 border-gold-500 shadow-gold-500/20'}`}
        title="Toggle Vakil Mode (Street Smart)"
      >
         <span className="text-2xl">{isVakilMode ? '⚡' : '⚖️'}</span>
      </button>

      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-navy-950/90 backdrop-blur-xl border-b border-white/5 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={resetSearch}>
             <div className="w-10 h-10 relative">
               <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg group-hover:rotate-12 transition-transform">
                 <path d="M45 20 V 65 Q 45 85 25 85" fill="none" stroke={isVakilMode ? "#39ff14" : "#fbbf24"} strokeWidth="10" strokeLinecap="round" />
                 <path d="M20 30 Q 80 10 90 40 T 50 80 T 10 50" fill="none" stroke={isVakilMode ? "#efff04" : "#d97706"} strokeWidth="4" strokeLinecap="round" />
               </svg>
             </div>
             <span className={`font-cinzel text-xl font-bold tracking-widest transition-colors ${isVakilMode ? 'text-neon-green' : 'text-parchment-50'}`}>JURIS<span className={isVakilMode ? 'text-neon-yellow' : 'text-shine'}>LENS</span></span>
          </div>
        </div>
      </nav>

      <main className="relative min-h-screen">
        
        {!summary && !searchResults && !isLoading && (
          <HeroSection 
            query={query}
            setQuery={setQuery}
            mode={mode}
            setMode={setMode}
            jurisdiction={jurisdiction}
            setJurisdiction={setJurisdiction}
            onSearch={() => handleInitialSearch()}
            isLoading={isLoading}
            history={searchHistory}
            onHistorySelect={handleHistoryClick}
          />
        )}

        {isLoading && (
          <div className="pt-20">
            <LoadingGavel />
          </div>
        )}

        {!isLoading && searchResults && (
           <div className="pt-32 animate-fade-in-up">
             <CaseList results={searchResults} onSelect={handleCaseSelect} />
           </div>
        )}

        {summary && (
          <div className="pt-24 animate-fade-in-up">
             <div className="max-w-6xl mx-auto px-4 mb-4">
                <button onClick={resetSearch} className={`flex items-center gap-2 text-xs font-cinzel font-bold tracking-widest ${isVakilMode ? 'text-neon-green hover:text-white' : 'text-gold-600 hover:text-gold-400'}`}>
                  <span>&larr;</span> NEW SEARCH
                </button>
             </div>
             <ResultCard 
               summary={summary} 
               isVakilMode={isVakilMode}
               onOpenPdf={() => setIsPdfOpen(true)}
               onRelatedCaseClick={(name) => {
                 setQuery(name);
                 setMode(SearchMode.CASE_NAME);
                 handleInitialSearch(name);
                 window.scrollTo({ top: 0, behavior: 'smooth' });
               }}
             />
          </div>
        )}

        {/* PDF Modal */}
        {summary && (
          <PdfViewerModal 
            summary={summary}
            isOpen={isPdfOpen}
            onClose={() => setIsPdfOpen(false)}
            isVakilMode={isVakilMode}
          />
        )}

      </main>
    </div>
  );
}

export default App;