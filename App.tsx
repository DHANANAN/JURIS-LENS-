import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeroSection } from './components/HeroSection';
import { ResultCard } from './components/ResultCard';
import { LoadingGavel } from './components/LoadingGavel';
import { CaseList } from './components/CaseList';
import { HistoryPanel } from './components/HistoryPanel';
import { searchCaseDatabase, fetchCaseSummary } from './services/geminiService';
import { CaseSummary, CaseSearchResult, SearchMode, Jurisdiction, HistoryItem, SearchFilters } from './types';

function App() {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<SearchMode>(SearchMode.CASE_NAME);
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>(Jurisdiction.INDIA);
  
  // Vakil Mode State
  const [isVakilMode, setIsVakilMode] = useState(false);
  
  // State for Flow Management
  const [searchResults, setSearchResults] = useState<CaseSearchResult[] | null>(null);
  const [summary, setSummary] = useState<CaseSummary | null>(null);
  const [searchHistory, setSearchHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      const messages = isVakilMode 
        ? [
            "SUMMONING SENIOR ADVOCATE...",
            "BRIEFING THE BENCH...",
            "ANALYZING LEGAL LOOPHOLES...",
            "DRAFTING STRATEGIC NOTES...",
            "FINALIZING VAKIL'S TAKE...",
            "SEALING THE DOCUMENT..."
          ]
        : [
            "RETRIEVING CASE SUMMARY...",
            "RESEARCHING PRECEDENTS...",
            "ANALYZING JUDGMENT TEXT...",
            "EXTRACTING RATIO DECIDENDI...",
            "COMPILING LEGAL ANALYTICS...",
            "PREPARING FINAL REPORT..."
          ];
      
      let step = 0;
      setLoadingMessage(messages[0]);
      setLoadingProgress(10);
      
      interval = setInterval(() => {
        step = (step + 1) % messages.length;
        setLoadingMessage(messages[step]);
        setLoadingProgress(prev => Math.min(prev + 20, 95));
      }, 800); // 1.5x faster than 1200ms
    } else {
      setLoadingProgress(0);
    }
    return () => clearInterval(interval);
  }, [isLoading, isVakilMode]);

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
    // Keep last 50 items for a "complete" history experience
    const updated = [newItem, ...searchHistory.filter(item => item.query !== q)].slice(0, 50);
    setSearchHistory(updated);
    localStorage.setItem('jurisLensHistory', JSON.stringify(updated));
  };

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to purge the archives? All local history will be lost.")) {
      setSearchHistory([]);
      localStorage.removeItem('jurisLensHistory');
    }
  };

  const handleInitialSearch = async (overrideQuery?: string, filters?: SearchFilters) => {
    const searchQuery = (overrideQuery || query).trim();
    if (!searchQuery) return;

    setIsLoading(true);
    setError(null);
    setSearchResults(null);
    setSummary(null);

    if (overrideQuery) setQuery(overrideQuery);

    try {
      // ALWAYS REDIRECT CHECK: Citations or Full Case Names
      const isCitation = /AIR\s*\d{4}\s*[A-Z]{1,5}\s*\d+/i.test(searchQuery) || 
                        /\d{4}\s*\d+\s*[A-Z]{2,5}\s*\d+/i.test(searchQuery) ||
                        /\d{4}\s*\(\d+\)\s*[A-Z]{2,5}\s*\d+/i.test(searchQuery) ||
                        /\b[A-Z]{2,}\s+\d{4}\s+\d+\b/i.test(searchQuery);

      const isFullName = /\s+v\.?\s+/i.test(searchQuery) || 
                         /\s+vs\.?\s+/i.test(searchQuery) || 
                         /\s+versus\s+/i.test(searchQuery);

      if (isCitation || isFullName) {
        const result = await fetchCaseSummary(searchQuery, jurisdiction, isVakilMode, mode === SearchMode.TEXT_ANALYSIS);
        setSummary(result);
        addToHistory(searchQuery, mode, jurisdiction);
        return;
      }

      // If advanced search or case name search, we might want to show results first
      if (mode === SearchMode.ADVANCED || mode === SearchMode.CASE_NAME) {
        const results = await searchCaseDatabase(searchQuery, jurisdiction, filters);
        if (results.length === 1) {
          // If only one result, fetch summary directly
          const result = await fetchCaseSummary(
            `${results[0].caseName} ${results[0].citation}`, 
            jurisdiction, 
            isVakilMode, 
            false
          );
          setSummary(result);
        } else {
          setSearchResults(results);
        }
      } else {
        // Direct to summary for citation or text analysis
        const result = await fetchCaseSummary(
          searchQuery, 
          jurisdiction, 
          isVakilMode, 
          mode === SearchMode.TEXT_ANALYSIS
        );
        setSummary(result);
      }
      addToHistory(searchQuery, mode, jurisdiction);
    } catch (err: any) {
      console.error(err);
      if (err.message === "API_KEY_MISSING") {
        setError("API configuration missing. Please add your Gemini API Key in the Settings menu (sidebar) to enable AI research.");
      } else {
        setError("The archives yielded no results for this specific search. Please verify the name, citation, or filters.");
      }
    } finally {
      setIsLoading(false);
      setLoadingMessage(null);
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
      setLoadingMessage(null);
    }
  };

  const resetSearch = () => {
    setSearchResults(null);
    setSummary(null);
    setQuery('');
  };

  const handleHistoryClick = (item: HistoryItem) => {
    setMode(item.mode);
    setJurisdiction(item.jurisdiction);
    setQuery(item.query);
    handleInitialSearch(item.query);
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-700 relative ${isVakilMode ? 'bg-zinc-950 selection:bg-neon-green selection:text-black' : 'bg-slate-900 text-slate-200 selection:bg-gold-500 selection:text-navy-900'}`}>
      
      {/* Breathing Background */}
      <div className={`breathing-bg ${isVakilMode ? 'opacity-30' : 'opacity-100'}`} />
      <div className="fixed inset-0 paper-texture opacity-20 pointer-events-none z-0" />

      {/* Vakil Mode Toggle Button (Floating) */}
      <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 flex flex-col gap-4 items-end no-print">
        <button 
          onClick={() => setIsVakilMode(!isVakilMode)}
          className={`p-3 sm:p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center border-2 ${isVakilMode ? 'bg-black border-neon-green shadow-[0_0_20px_#39ff14]' : 'bg-navy-900 border-gold-500 shadow-gold-500/20'}`}
          title="Toggle Vakil Mode (Street Smart)"
        >
           <span className="text-xl sm:text-2xl">{isVakilMode ? '⚡' : '⚖️'}</span>
        </button>
      </div>

      <nav className="fixed w-full z-50 bg-navy-950/90 backdrop-blur-xl border-b border-white/5 shadow-2xl no-print">
        <div className="max-w-7xl mx-auto px-[var(--space-4)] sm:px-[var(--space-6)] h-[clamp(3.5rem,10vw,5rem)] flex items-center justify-between">
          <div className="flex items-center gap-[var(--space-2)] sm:gap-[var(--space-3)] cursor-pointer group" onClick={resetSearch}>
             <div className="w-[var(--text-xl)] h-[var(--text-xl)] sm:w-10 sm:h-10 relative">
               <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg group-hover:rotate-12 transition-transform">
                 <path d="M45 20 V 65 Q 45 85 25 85" fill="none" stroke={isVakilMode ? "#39ff14" : "#fbbf24"} strokeWidth="10" strokeLinecap="round" />
                 <path d="M20 30 Q 80 10 90 40 T 50 80 T 10 50" fill="none" stroke={isVakilMode ? "#efff04" : "#d97706"} strokeWidth="4" strokeLinecap="round" />
               </svg>
             </div>
             <span className={`font-cinzel text-[var(--text-lg)] sm:text-xl font-bold tracking-widest transition-colors ${isVakilMode ? 'text-neon-green' : 'text-parchment-50'}`}>JURIS<span className={isVakilMode ? 'text-neon-yellow' : 'text-shine'}>LENS</span></span>
          </div>
        </div>
      </nav>

      <main className="relative min-h-screen">
        
        <AnimatePresence mode="wait">
          {!summary && !searchResults && !isLoading && (
            <motion.div 
              key="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "linear" }}
              className="no-print"
            >
              <HeroSection 
                query={query}
                setQuery={setQuery}
                mode={mode}
                setMode={setMode}
                jurisdiction={jurisdiction}
                setJurisdiction={setJurisdiction}
                onSearch={(f) => handleInitialSearch(undefined, f)}
                isLoading={isLoading}
                history={searchHistory}
                onHistorySelect={handleHistoryClick}
                onViewFullHistory={() => setIsHistoryOpen(true)}
              />
            </motion.div>
          )}

          {isLoading && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pt-[var(--space-12)] sm:pt-32 flex flex-col items-center px-[var(--space-4)]"
            >
              {loadingMessage && (
                <div className="text-center mb-[var(--space-6)] sm:mb-12">
                  <motion.span 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`font-cinzel text-[var(--text-3xl)] sm:text-4xl font-black tracking-[0.2em] sm:tracking-[0.3em] ${isVakilMode ? 'text-neon-green' : 'text-gold-500'} drop-shadow-lg`}
                  >
                    {loadingMessage}
                  </motion.span>
                  
                  {/* Progress Bar */}
                  <div className="mt-[var(--space-4)] sm:mt-8 w-[clamp(10rem,50vw,20rem)] sm:w-80 h-1 bg-white/5 rounded-full overflow-hidden mx-auto border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${loadingProgress}%` }}
                      className={`h-full ${isVakilMode ? 'bg-neon-green shadow-[0_0_15px_#39ff14]' : 'bg-gold-500 shadow-[0_0_15px_rgba(251,191,36,0.5)]'}`}
                    />
                  </div>
                </div>
              )}
              <LoadingGavel />
            </motion.div>
          )}

          {!isLoading && searchResults && (
             <motion.div 
               key="results"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 0.15, ease: "linear" }}
               className="pt-32 no-print"
             >
               <div className="max-w-6xl mx-auto px-4 mb-8">
                  <button onClick={resetSearch} className={`flex items-center gap-2 text-xs font-cinzel font-bold tracking-widest ${isVakilMode ? 'text-neon-green hover:text-white' : 'text-gold-600 hover:text-gold-400'}`}>
                    <span>&larr;</span> BACK TO SEARCH
                  </button>
               </div>
               <CaseList results={searchResults} onSelect={handleCaseSelect} />
             </motion.div>
          )}

          {summary && (
            <motion.div 
              key="summary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "linear" }}
              className="pt-24 print-container"
            >
               <div className="max-w-6xl mx-auto px-4 mb-8 no-print">
                  <div className="flex flex-col md:flex-row gap-4">
                    <button onClick={resetSearch} className={`flex items-center gap-2 whitespace-nowrap text-xs font-cinzel font-bold tracking-widest ${isVakilMode ? 'text-neon-green hover:text-white' : 'text-gold-600 hover:text-gold-400'}`}>
                      <span>&larr;</span> NEW SEARCH
                    </button>
                    
                    <div className={`flex-grow flex items-center gap-2 px-4 py-2 border-2 rounded-xl transition-all shadow-lg ${isVakilMode ? 'bg-black border-neon-green/50 focus-within:border-neon-green' : 'bg-navy-900 border-gold-500/50 focus-within:border-gold-500'}`}>
                      <span className="opacity-50">🔍</span>
                      <input 
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleInitialSearch()}
                        placeholder="Search another case..."
                        className="w-full bg-transparent border-none outline-none text-white font-serif text-lg font-bold placeholder:text-white/20"
                      />
                      <button 
                        onClick={() => handleInitialSearch()}
                        className={`text-[10px] font-black font-cinzel tracking-widest px-3 py-1 rounded border transition-all ${isVakilMode ? 'bg-neon-green text-black border-neon-green hover:bg-white' : 'bg-gold-500 text-navy-950 border-gold-500 hover:bg-white'}`}
                      >
                        SEARCH
                      </button>
                    </div>
                  </div>
               </div>
               <ResultCard 
                 summary={summary} 
                 isVakilMode={isVakilMode}
                 onRelatedCaseClick={(name) => {
                   setQuery(name);
                   setMode(SearchMode.CASE_NAME);
                   handleInitialSearch(name);
                   window.scrollTo({ top: 0, behavior: 'smooth' });
                 }}
               />
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-red-900/90 border-2 border-red-500 text-white p-8 rounded-2xl shadow-2xl backdrop-blur-xl max-w-md text-center"
          >
            <p className="font-cinzel font-black text-xl mb-4 tracking-widest">ERROR DETECTED</p>
            <p className="text-lg opacity-90 font-medium mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => handleInitialSearch()} 
                className="px-6 py-2 bg-white text-red-900 font-bold rounded-lg hover:bg-gray-200 transition-colors"
              >
                RETRY
              </button>
              <button 
                onClick={() => setError(null)} 
                className="px-6 py-2 bg-transparent border border-white/30 text-white font-bold rounded-lg hover:bg-white/10 transition-colors"
              >
                DISMISS
              </button>
            </div>
          </motion.div>
        )}

        <HistoryPanel 
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          history={searchHistory}
          onSelect={handleHistoryClick}
          onClear={clearHistory}
        />

        <footer className="w-full py-12 px-4 no-print mt-auto border-t border-white/5 bg-navy-950/20">
          <div className="max-w-7xl mx-auto text-center space-y-4">
             <div className="flex flex-col items-center gap-2">
                <p className={`text-[10px] font-mono tracking-widest uppercase mb-1 font-bold ${isVakilMode ? 'text-neon-green/50' : 'text-gold-500/50'}`}>
                  MIT License
                </p>
                <div className="w-8 h-px bg-white/10"></div>
                <p className="max-w-4xl mx-auto text-[8px] sm:text-[9px] font-serif italic text-slate-500 leading-relaxed tracking-wide uppercase font-bold opacity-60">
                  DISCLAIMER: ALL LEGAL DATA AND INFORMATION AGGREGATED BY JURISLENS ARE RETRIEVED FROM OFFICIAL OPEN-SOURCE REPOSITORIES AND PUBLIC DOMAIN INDEXES MANDATED BY LAW TO BE MAINTAINED AS FREE OPEN INFORMATION. NO CONTENT IS SOURCED FROM ILLEGAL OR COPYRIGHTED PRIVATE REPOSITORIES. UNDER GLOBAL LEGAL DOCTRINE, JUDICIAL RECORDS AND CASE LAWS ARE PUBLIC PROPERTY AND PART OF THE COMMON HERITAGE OF JUSTICE.
                </p>
             </div>
             <p className="text-[10px] items-center justify-center opacity-40 font-cinzel tracking-[0.2em]">
                &copy; 2026 JURISLENS • AI ARCHIVE SYSTEMS
             </p>
          </div>
        </footer>

      </main>
    </div>
  );
}

export default App;