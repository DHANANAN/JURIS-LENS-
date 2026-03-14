import React, { useState, useEffect, useRef } from 'react';
import { SearchMode, Jurisdiction, HistoryItem } from '../types';

interface HeroSectionProps {
  query: string;
  setQuery: (q: string) => void;
  mode: SearchMode;
  setMode: (m: SearchMode) => void;
  jurisdiction: Jurisdiction;
  setJurisdiction: (j: Jurisdiction) => void;
  onSearch: () => void;
  isLoading: boolean;
  history: HistoryItem[];
  onHistorySelect: (item: HistoryItem) => void;
}

// Mock database for autocomplete demo
const MOCK_CASE_DB = [
  "Kesavananda Bharati v. State of Kerala",
  "Maneka Gandhi v. Union of India",
  "Minerva Mills Ltd. v. Union of India",
  "Golaknath v. State of Punjab",
  "Shah Bano Begum Case",
  "Vishaka v. State of Rajasthan",
  "Puttaswamy v. Union of India (Privacy Case)",
  "Indra Sawhney v. Union of India",
  "ADM Jabalpur v. Shivkant Shukla",
  "S.R. Bommai v. Union of India",
  "Naz Foundation v. Govt. of NCT of Delhi",
  "Navtej Singh Johar v. Union of India",
  "Shayara Bano v. Union of India (Triple Talaq)",
  "M.C. Mehta v. Union of India",
  "Common Cause v. Union of India",
  "D.K. Basu v. State of West Bengal",
  "Mohd. Ahmed Khan v. Shah Bano Begum",
  "Bachchan Singh v. State of Punjab",
  "Olga Tellis v. Bombay Municipal Corporation"
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  query,
  setQuery,
  mode,
  setMode,
  jurisdiction,
  setJurisdiction,
  onSearch,
  isLoading,
  history,
  onHistorySelect
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Autocomplete logic
    if (mode === SearchMode.CASE_NAME && query.length > 2) {
      const filtered = MOCK_CASE_DB.filter(c => 
        c.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [query, mode]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="relative pt-40 pb-24 px-4 overflow-hidden min-h-[75vh] flex flex-col justify-center bg-navy-950">
      
      {/* Restored Background Decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-amber-900/20 rounded-full blur-[150px] -z-10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none"></div>
      
      <div className="max-w-[95rem] mx-auto text-center relative z-10 w-full">
        
        {/* Logo Section */}
        <div className="mb-20 flex flex-col items-center">
          
          <div className="relative w-40 h-40 mb-10 group cursor-default">
             <div className="absolute inset-0 bg-gold-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
             <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-2xl">
               <defs>
                 <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                   <stop offset="0%" stopColor="#d97706" />
                   <stop offset="50%" stopColor="#fbbf24" />
                   <stop offset="100%" stopColor="#d97706" />
                 </linearGradient>
               </defs>
               <path d="M50 10 L85 25 V 55 Q 85 85 50 95 Q 15 85 15 55 V 25 Z" fill="none" stroke="url(#goldGrad)" strokeWidth="4" />
               <path d="M40 25 V 65 Q 40 80 25 80" fill="none" stroke="url(#goldGrad)" strokeWidth="8" strokeLinecap="square" />
               <path d="M60 25 V 80 H 80" fill="none" stroke="url(#goldGrad)" strokeWidth="8" strokeLinecap="square" />
               <line x1="50" y1="20" x2="50" y2="85" stroke="#fbbf24" strokeWidth="4" strokeDasharray="4 4" />
             </svg>
          </div>

          <div className="inline-flex items-center justify-center px-12 py-6 mb-12 border-y-2 border-gold-600/50 bg-navy-900/50 backdrop-blur-sm">
            <span className="text-gold-400 text-xl font-cinzel tracking-[0.3em] font-black uppercase drop-shadow-md">
              AI Legal Research
            </span>
          </div>

          <h1 className="font-display text-8xl md:text-[10rem] font-bold mb-10 tracking-tighter text-parchment-50 drop-shadow-2xl">
            Juris<span className="italic font-serif text-shine text-yellow-500">Lens</span>
          </h1>
          
          <div className="flex items-center justify-center gap-8 opacity-90">
             <div className="h-[2px] w-32 bg-gradient-to-r from-transparent to-gold-500"></div>
             <p className="text-slate-200 text-5xl font-serif italic tracking-wide font-medium">
               "Fiat Justitia Ruat Caelum"
             </p>
             <div className="h-[2px] w-32 bg-gradient-to-l from-transparent to-gold-500"></div>
          </div>
        </div>

        {/* Search Interface - MAXIMUM CONTRAST & SIZE */}
        {!isLoading && (
          <div ref={wrapperRef} className="bg-navy-950/90 rounded-3xl border-2 border-slate-500 shadow-[0_40px_120px_rgba(0,0,0,0.8)] p-12 max-w-[95rem] mx-auto relative z-50 backdrop-blur-md">
            <div className="flex flex-col lg:flex-row gap-8">
              
              <div className="relative min-w-[320px] bg-black border-4 border-white rounded-xl">
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as SearchMode)}
                  className="w-full h-full p-8 bg-black text-white font-cinzel text-2xl font-black tracking-wider outline-none appearance-none cursor-pointer focus:bg-white focus:text-black transition-colors rounded-xl"
                >
                  <option value={SearchMode.CASE_NAME}>CASE NAME</option>
                  <option value={SearchMode.CITATION}>CITATION</option>
                  <option value={SearchMode.TEXT_ANALYSIS}>RAW TEXT</option>
                </select>
                <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-white">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>

              <div className="flex-grow relative bg-black border-4 border-white rounded-xl">
                {mode === SearchMode.TEXT_ANALYSIS ? (
                  <textarea 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="PASTE JUDGMENT TEXT HERE..."
                    className="w-full p-8 bg-black text-white placeholder-gray-500 outline-none resize-none h-40 leading-relaxed font-serif text-3xl font-bold rounded-xl"
                  />
                ) : (
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                    placeholder="SEARCH CASE NAME OR ISSUE..."
                    className="w-full h-full p-8 bg-black text-white placeholder-gray-500 outline-none font-serif text-4xl font-bold tracking-wide rounded-xl"
                    autoComplete="off"
                  />
                )}
                
                {/* Autocomplete Dropdown - High Contrast */}
                {showSuggestions && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-black border-4 border-white rounded-xl z-[100] shadow-2xl">
                    {suggestions.map((s, i) => (
                      <button 
                        key={i}
                        onClick={() => handleSuggestionClick(s)}
                        className="w-full text-left px-10 py-8 text-white text-3xl hover:bg-white hover:text-black font-serif border-b-2 border-white last:border-0 transition-colors font-bold first:rounded-t-lg last:rounded-b-lg"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {mode !== SearchMode.TEXT_ANALYSIS && (
                 <div className="relative min-w-[280px] bg-black border-4 border-white rounded-xl">
                 <select
                   value={jurisdiction}
                   onChange={(e) => setJurisdiction(e.target.value as Jurisdiction)}
                   className="w-full h-full p-8 bg-black text-white text-xl font-cinzel font-black tracking-widest outline-none appearance-none cursor-pointer focus:bg-white focus:text-black transition-colors uppercase rounded-xl"
                 >
                   {Object.values(Jurisdiction).map((j) => (
                     <option key={j} value={j}>{j}</option>
                   ))}
                 </select>
                 <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-white">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7"></path></svg>
                 </div>
               </div>
              )}
             
              <button
                onClick={onSearch}
                disabled={!query.trim()}
                className="bg-gold-500 hover:bg-gold-400 disabled:bg-gray-800 disabled:text-gray-500 text-black font-cinzel font-black text-3xl py-8 px-16 transition-all duration-300 flex items-center justify-center gap-4 min-w-[240px] border-4 border-white rounded-xl shadow-[0_0_20px_rgba(251,191,36,0.4)]"
              >
                 <span className="tracking-widest">SEARCH</span>
              </button>
            </div>
            
            {/* Search History Integration */}
            {history.length > 0 && (
              <div className="mt-12 flex items-center gap-6 overflow-x-auto pb-6 scrollbar-thin">
                <span className="text-xl text-slate-300 font-black uppercase tracking-wider shrink-0 mr-4">RECENT:</span>
                {history.map((item, idx) => (
                   <button 
                     key={idx}
                     onClick={() => onHistorySelect(item)}
                     className="shrink-0 flex items-center gap-4 px-8 py-5 bg-navy-900 border-2 border-slate-600 rounded-lg hover:border-gold-500 hover:text-gold-400 group transition-all"
                   >
                     <span className="text-2xl text-slate-300 font-mono font-bold group-hover:text-gold-400">{item.query}</span>
                   </button>
                ))}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};