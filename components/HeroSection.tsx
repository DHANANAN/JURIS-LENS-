import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchMode, Jurisdiction, HistoryItem, SearchFilters, CaseType, RelevanceSort } from '../types';
import { ChevronDown, Filter, X, Calendar, Briefcase, SortAsc } from 'lucide-react';

interface HeroSectionProps {
  query: string;
  setQuery: (q: string) => void;
  mode: SearchMode;
  setMode: (m: SearchMode) => void;
  jurisdiction: Jurisdiction;
  setJurisdiction: (j: Jurisdiction) => void;
  onSearch: (filters?: SearchFilters) => void;
  isLoading: boolean;
  history: HistoryItem[];
  onHistorySelect: (item: HistoryItem) => void;
  onViewFullHistory: () => void;
}

// Landmark cases for autocomplete suggestions
const LANDMARK_CASES = [
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
  "Olga Tellis v. Bombay Municipal Corporation",
  "L. Chandra Kumar v. Union of India",
  "Supreme Court Advocates-on-Record Association v. Union of India (NJAC Case)",
  "Justice K.S. Puttaswamy (Retd.) v. Union of India (Aadhaar Case)",
  "Joseph Shine v. Union of India (Adultery Case)",
  "Indian Young Lawyers Association v. State of Kerala (Sabarimala Case)",
  "M. Siddiq (D) Thr Lrs v. Mahant Suresh Das (Ayodhya Case)",
  "Anuradha Bhasin v. Union of India (Internet Shutdown Case)",
  "Arnab Ranjan Goswami v. Union of India",
  "State of Bombay v. Narasu Appa Mali",
  "Champakam Dorairajan v. State of Madras",
  "Berubari Union Case",
  "K.M. Nanavati v. State of Maharashtra",
  "Sajjan Singh v. State of Rajasthan",
  "I.C. Golaknath v. State of Punjab",
  "R.C. Cooper v. Union of India (Bank Nationalization Case)",
  "Madhav Rao Scindia v. Union of India (Privy Purse Case)",
  "Keshvananda Bharati v. State of Kerala",
  "Indira Gandhi v. Raj Narain",
  "Maneka Gandhi v. Union of India",
  "Minerva Mills v. Union of India",
  "Waman Rao v. Union of India",
  "Bachchan Singh v. State of Punjab",
  "Mithu v. State of Punjab",
  "Kehar Singh v. Union of India",
  "S.R. Bommai v. Union of India",
  "Vishaka v. State of Rajasthan",
  "Samatha v. State of Andhra Pradesh",
  "Vineet Narain v. Union of India",
  "Chairman, Railway Board v. Chandrima Das",
  "Danial Latifi v. Union of India",
  "T.M.A. Pai Foundation v. State of Karnataka",
  "P.A. Inamdar v. State of Maharashtra",
  "Rameshwar Prasad v. Union of India",
  "I.R. Coelho v. State of Tamil Nadu",
  "Selvi v. State of Karnataka",
  "Society for Unaided Private Schools of Rajasthan v. Union of India",
  "Lily Thomas v. Union of India",
  "National Legal Services Authority v. Union of India (NALSA Case)",
  "Shreya Singhal v. Union of India (Section 66A Case)",
  "Supreme Court Advocates-on-Record Association v. Union of India (Second Judges Case)",
  "Special Reference No. 1 of 1998 (Third Judges Case)",
  "Abhiram Singh v. C.D. Commachen",
  "Justice K.S. Puttaswamy (Retd.) v. Union of India (Privacy Judgment)",
  "Shayara Bano v. Union of India (Triple Talaq Case)",
  "Navtej Singh Johar v. Union of India (Decriminalization of Section 377)",
  "Joseph Shine v. Union of India (Decriminalization of Adultery)",
  "Indian Young Lawyers Association v. State of Kerala (Sabarimala Judgment)",
  "M. Siddiq (D) Thr Lrs v. Mahant Suresh Das (Ayodhya Judgment)",
  "Internet and Mobile Association of India v. Reserve Bank of India (Crypto Case)",
  "Anuradha Bhasin v. Union of India (Kashmir Internet Case)",
  "Secretary, Ministry of Defence v. Babita Puniya (Permanent Commission for Women)",
  "Vineeta Sharma v. Rakesh Sharma (Hindu Succession Rights)",
  "Amnesty International India v. Union of India",
  "TATA Consultancy Services Ltd v. Cyrus Investments Pvt Ltd",
  "Amazon.com NV Investment Holdings LLC v. Future Retail Ltd",
  "Neil Aurelio Nunes v. Union of India (OBC Reservation in NEET)",
  "Jacob Puliyel v. Union of India (Vaccine Mandate Case)",
  "S.G. Vombatkere v. Union of India (Sedition Case)",
  "Zakia Ahsan Jafri v. State of Gujarat",
  "Vijay Madanlal Choudhary v. Union of India (PMLA Case)",
  "Supriyo @ Koushik Yo v. Union of India (Same-Sex Marriage Case)",
  "Animal Welfare Board of India v. Union of India (Jallikattu Case)",
  "Government of NCT of Delhi v. Union of India (Services Case)",
  "In Re: Article 370 of the Constitution",
  "Association for Democratic Reforms v. Union of India (Electoral Bonds Case)"
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
  onHistorySelect,
  onViewFullHistory
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Advanced Filters State
  const [caseType, setCaseType] = useState<CaseType>(CaseType.ALL);
  const [yearStart, setYearStart] = useState<number | undefined>(undefined);
  const [yearEnd, setYearEnd] = useState<number | undefined>(undefined);
  const [relevance, setRelevance] = useState<RelevanceSort>(RelevanceSort.RELEVANCE);

  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleSearch = () => {
    const filters: SearchFilters = {
      caseType,
      yearStart,
      yearEnd,
      relevance
    };
    onSearch(filters);
  };

  useEffect(() => {
    // Debounced dynamic suggestions
    const timer = setTimeout(async () => {
      if (mode === SearchMode.CASE_NAME && query.length > 3) {
        // Filter from landmark cases list
        const filtered = LANDMARK_CASES.filter(c => 
          c.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5);
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      } else {
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
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
          
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 mb-6 sm:mb-10 group cursor-default">
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

          <div className="inline-flex items-center justify-center px-6 py-3 sm:px-12 sm:py-6 mb-8 sm:mb-12 border-y-2 border-gold-600/50 bg-navy-900/50 backdrop-blur-sm">
            <span className="text-gold-400 text-sm sm:text-xl font-cinzel tracking-[0.3em] font-black uppercase drop-shadow-md">
              AI Legal Research
            </span>
          </div>

          <h1 className="font-display text-[clamp(3.5rem,2.5rem+8vw,10rem)] font-bold mb-[var(--space-4)] sm:mb-[var(--space-6)] tracking-tighter text-parchment-50 drop-shadow-2xl">
            Juris<span className="italic font-serif text-shine text-yellow-500">Lens</span>
          </h1>
          
          <div className="flex items-center justify-center gap-[var(--space-4)] sm:gap-[var(--space-8)] opacity-90">
             <div className="h-[2px] w-[var(--space-12)] sm:w-[var(--space-16)] bg-gradient-to-r from-transparent to-gold-500"></div>
             <p className="text-slate-200 text-[clamp(1.25rem,1.1rem+0.8vw,2.5rem)] font-serif italic tracking-wide font-medium">
               "Fiat Justitia Ruat Caelum"
             </p>
             <div className="h-[2px] w-[var(--space-12)] sm:w-[var(--space-16)] bg-gradient-to-l from-transparent to-gold-500"></div>
          </div>
        </div>

        {/* Search Interface - REFINED & ELEGANT */}
        {!isLoading && (
          <div ref={wrapperRef} className="bg-navy-900/80 rounded-[var(--space-5)] sm:rounded-[var(--space-8)] border border-white/10 shadow-[0_40px_120px_rgba(0,0,0,0.6)] p-[var(--space-4)] sm:p-[var(--space-6)] md:p-[var(--space-10)] max-w-[95rem] mx-auto relative z-50">
            <div className="flex flex-col lg:flex-row gap-[var(--space-4)] sm:gap-[var(--space-6)]">
              
              <div className="relative min-w-full lg:min-w-[280px] bg-white/5 border border-white/20 rounded-xl sm:rounded-2xl overflow-hidden group hover:border-gold-500/50 transition-all">
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as SearchMode)}
                  className="w-full h-full p-[var(--space-4)] sm:p-[var(--space-5)] bg-transparent text-parchment-100 font-cinzel text-[clamp(1rem,0.9rem+0.25vw,1.25rem)] sm:text-xl font-bold tracking-widest outline-none appearance-none cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <option value={SearchMode.CASE_NAME} className="bg-navy-950 text-white">CASE NAME</option>
                  <option value={SearchMode.CITATION} className="bg-navy-950 text-white">CITATION</option>
                  <option value={SearchMode.TEXT_ANALYSIS} className="bg-navy-950 text-white">RAW TEXT</option>
                  <option value={SearchMode.ADVANCED} className="bg-navy-950 text-white">ADVANCED</option>
                </select>
                <div className="absolute right-[var(--space-4)] top-1/2 -translate-y-1/2 pointer-events-none text-gold-500/70 group-hover:text-gold-400 transition-colors">
                  <ChevronDown className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={3} />
                </div>
              </div>

              <div className="flex-grow relative bg-white/5 border border-white/20 rounded-xl sm:rounded-2xl group hover:border-gold-500/50 transition-all">
                {mode === SearchMode.TEXT_ANALYSIS ? (
                  <textarea 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="PASTE JUDGMENT TEXT HERE..."
                    className="w-full p-[var(--space-4)] sm:p-[var(--space-6)] bg-transparent text-parchment-50 placeholder-white/30 outline-none resize-none h-32 md:h-40 leading-relaxed font-serif text-[clamp(1.1rem,1rem+0.4vw,1.5rem)] md:text-2xl font-medium"
                  />
                ) : (
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="SEARCH CASE NAME OR ISSUE..."
                    style={{ fontSize: query.length > 25 ? 'clamp(1rem, 0.9rem + 0.5vw, 1.5rem)' : 'clamp(1.1rem, 1rem + 1vw, 2.5rem)' }}
                    className="w-full h-full p-[var(--space-4)] sm:p-[var(--space-6)] bg-transparent text-parchment-50 placeholder-white/30 outline-none font-serif font-medium tracking-wide transition-all"
                    autoComplete="off"
                  />
                )}
                
                {/* Autocomplete Dropdown - Refined */}
                <AnimatePresence>
                  {showSuggestions && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 right-0 top-full mt-[var(--space-2)] sm:mt-4 bg-navy-900/95 backdrop-blur-2xl border border-white/10 rounded-xl sm:rounded-2xl z-[100] shadow-2xl overflow-hidden"
                    >
                      {suggestions.map((s, i) => (
                        <button 
                          key={i}
                          onClick={() => handleSuggestionClick(s)}
                          className="w-full text-left px-[var(--space-4)] sm:px-8 py-[var(--space-3)] sm:py-6 text-parchment-100 text-[var(--text-sm)] sm:text-xl hover:bg-gold-500 hover:text-navy-950 font-serif border-b border-white/5 last:border-0 transition-all font-medium"
                        >
                          {s}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {mode !== SearchMode.TEXT_ANALYSIS && (
                 <div className="relative min-w-full lg:min-w-[240px] bg-white/5 border border-white/20 rounded-xl sm:rounded-2xl group hover:border-gold-500/50 transition-all">
                 <select
                   value={jurisdiction}
                   onChange={(e) => setJurisdiction(e.target.value as Jurisdiction)}
                   className="w-full h-full p-4 sm:p-6 bg-transparent text-parchment-100 text-base sm:text-lg font-cinzel font-bold tracking-widest outline-none appearance-none cursor-pointer hover:bg-white/5 transition-colors uppercase"
                 >
                   {Object.values(Jurisdiction).map((j) => (
                     <option key={j} value={j} className="bg-navy-950">{j}</option>
                   ))}
                 </select>
                 <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gold-500/70 group-hover:text-gold-400 transition-colors">
                    <ChevronDown className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={3} />
                 </div>
               </div>
              )}
             
              <button
                onClick={handleSearch}
                disabled={!query.trim()}
                className="bg-gold-500 hover:bg-gold-400 disabled:bg-white/5 disabled:text-white/20 text-navy-950 font-cinzel font-black text-[clamp(1.1rem,1rem+0.5vw,1.5rem)] py-[var(--space-4)] sm:py-[var(--space-5)] px-[var(--space-6)] sm:px-[var(--space-10)] transition-all duration-300 flex items-center justify-center gap-4 min-w-full lg:min-w-[200px] rounded-xl sm:rounded-2xl shadow-[0_10px_30px_rgba(251,191,36,0.3)] hover:shadow-[0_15px_40px_rgba(251,191,36,0.5)] hover:-translate-y-1 active:translate-y-0"
              >
                 <span className="tracking-widest">SEARCH DATABASE</span>
              </button>
            </div>

            {/* Advanced Filters Toggle */}
            <div className="mt-8 flex justify-end">
              <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-white font-cinzel text-xl font-bold hover:text-gold-400 transition-colors"
              >
                <Filter className="w-6 h-6" />
                {showAdvanced ? 'HIDE FILTERS' : 'ADVANCED FILTERS'}
              </button>
            </div>

            {/* Advanced Filters Panel */}
            <AnimatePresence>
              {showAdvanced && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-8 border-t-2 border-white/20">
                    
                    <div className="flex flex-col gap-4">
                      <label className="text-white font-cinzel text-lg font-bold flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-gold-500" /> CASE TYPE
                      </label>
                      <select 
                        value={caseType}
                        onChange={(e) => setCaseType(e.target.value as CaseType)}
                        className="bg-black border-2 border-white text-white p-4 rounded-lg font-serif text-xl outline-none focus:border-gold-500"
                      >
                        {Object.values(CaseType).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <div className="flex flex-col gap-4">
                      <label className="text-white font-cinzel text-lg font-bold flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gold-500" /> YEAR RANGE
                      </label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="number" 
                          placeholder="FROM"
                          value={yearStart || ''}
                          onChange={(e) => setYearStart(e.target.value ? parseInt(e.target.value) : undefined)}
                          className="w-full bg-black border-2 border-white text-white p-4 rounded-lg font-serif text-xl outline-none focus:border-gold-500"
                        />
                        <span className="text-white font-bold">TO</span>
                        <input 
                          type="number" 
                          placeholder="TO"
                          value={yearEnd || ''}
                          onChange={(e) => setYearEnd(e.target.value ? parseInt(e.target.value) : undefined)}
                          className="w-full bg-black border-2 border-white text-white p-4 rounded-lg font-serif text-xl outline-none focus:border-gold-500"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <label className="text-white font-cinzel text-lg font-bold flex items-center gap-2">
                        <SortAsc className="w-5 h-5 text-gold-500" /> SORT BY
                      </label>
                      <select 
                        value={relevance}
                        onChange={(e) => setRelevance(e.target.value as RelevanceSort)}
                        className="bg-black border-2 border-white text-white p-4 rounded-lg font-serif text-xl outline-none focus:border-gold-500"
                      >
                        {Object.values(RelevanceSort).map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                      </select>
                    </div>

                    <div className="flex items-end">
                      <button 
                        onClick={() => {
                          setCaseType(CaseType.ALL);
                          setYearStart(undefined);
                          setYearEnd(undefined);
                          setRelevance(RelevanceSort.RELEVANCE);
                        }}
                        className="w-full bg-white/10 hover:bg-white/20 text-white font-cinzel font-bold py-4 rounded-lg transition-colors border-2 border-white/20"
                      >
                        RESET FILTERS
                      </button>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Search History Integration - Vertical List */}
            {history.length > 0 && (
              <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-lg sm:text-xl text-gold-500 font-cinzel font-black tracking-[0.2em] uppercase">Search History</span>
                    <div className="h-px w-12 sm:w-24 bg-gold-500/50"></div>
                  </div>
                  {history.length > 3 && (
                    <button 
                      onClick={onViewFullHistory}
                      className="text-xs sm:text-sm font-cinzel font-bold text-gold-500/70 hover:text-gold-400 transition-colors tracking-[0.1em] border-b border-gold-500/30 pb-0.5"
                    >
                      VIEW ARCHIVE &rarr;
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {history.slice(0, 6).map((item, idx) => (
                    <button 
                      key={idx}
                      onClick={() => onHistorySelect(item)}
                      className="flex items-center justify-between p-3 sm:p-4 bg-white/5 border border-white/10 rounded-xl hover:border-gold-500/50 hover:bg-white/10 group transition-all text-left"
                    >
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-lg text-parchment-100 font-serif font-bold truncate group-hover:text-gold-400 transition-colors">
                          {item.query}
                        </span>
                        <span className="text-[10px] sm:text-xs text-slate-400 font-mono uppercase tracking-tighter">
                          {new Date(item.timestamp).toLocaleDateString()} • {item.mode}
                        </span>
                      </div>
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <SearchIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

// Internal helper icon
const SearchIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);
