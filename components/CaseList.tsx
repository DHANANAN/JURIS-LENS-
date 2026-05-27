import React from 'react';
import { motion } from 'framer-motion';
import { CaseSearchResult } from '../types';

interface CaseListProps {
  results: CaseSearchResult[];
  onSelect: (result: CaseSearchResult) => void;
}

export const CaseList: React.FC<CaseListProps> = ({ results, onSelect }) => {
  return (
    <div className="max-w-7xl mx-auto px-[var(--space-4)] mb-[var(--space-12)]">
      <div className="text-center mb-[var(--space-10)] sm:mb-[var(--space-20)]">
        <h2 className="font-display text-[var(--text-3xl)] sm:text-[var(--text-7xl)] text-parchment-50 mb-[var(--space-4)] sm:mb-[var(--space-8)] font-bold tracking-tight">Select Case Record</h2>
        <div className="flex items-center justify-center gap-[var(--space-4)] sm:gap-8 text-gold-500/80 font-cinzel text-[var(--text-sm)] sm:text-xl tracking-[0.2em] sm:tracking-[0.3em] font-black">
           <div className="h-[1px] w-[var(--space-12)] sm:w-24 bg-gradient-to-r from-transparent to-gold-500/50"></div>
           <span>MULTIPLE PRECEDENTS FOUND</span>
           <div className="h-[1px] w-[var(--space-12)] sm:w-24 bg-gradient-to-l from-transparent to-gold-500/50"></div>
        </div>
      </div>

      <div className="grid gap-[var(--space-6)] sm:gap-8">
        {results.map((result, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group relative bg-white/5 backdrop-blur-xl border border-white/10 hover:border-gold-500/50 p-[var(--space-6)] sm:p-10 transition-all duration-500 flex flex-col gap-[var(--space-4)] sm:gap-6 rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)]"
          >
            <button onClick={() => onSelect(result)} className="text-left w-full group">
              <div className="flex flex-col md:flex-row justify-between items-start mb-[var(--space-4)] sm:mb-6 gap-[var(--space-4)] sm:gap-6">
                <h3 className="font-display text-[var(--text-xl)] sm:text-4xl md:text-5xl font-bold text-parchment-50 group-hover:text-gold-400 transition-colors leading-tight tracking-tight">
                  {result.caseName}
                </h3>
                <span className="text-[var(--text-xs)] sm:text-xl font-mono text-gold-500/80 bg-white/5 border border-white/10 px-4 sm:px-6 py-2 sm:py-3 font-bold rounded-xl whitespace-nowrap shadow-inner">
                  {result.citation}
                </span>
              </div>
              
              <div className="relative">
                <p className="text-slate-300 font-serif italic text-[var(--text-lg)] sm:text-2xl md:text-3xl border-l-[var(--space-1)] sm:border-l-4 border-gold-500/30 pl-[var(--space-4)] sm:pl-8 group-hover:border-gold-500 transition-colors leading-relaxed font-medium">
                  "{result.context}"
                </p>
              </div>
            </button>

            {/* Display Found PDF Links */}
            {result.sourceUrls && result.sourceUrls.length > 0 && (
              <div className="mt-[var(--space-2)] sm:mt-4 pt-[var(--space-4)] sm:pt-8 border-t border-white/5 flex flex-wrap gap-[var(--space-2)] sm:gap-4 items-center">
                <span className="text-[var(--text-xs)] text-white/30 uppercase tracking-[0.2em] font-black mr-2">SOURCES:</span>
                {result.sourceUrls.map((source, i) => (
                  <a 
                    key={i}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[var(--text-xs)] px-3 sm:px-5 py-1.5 sm:py-2.5 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl text-slate-300 hover:bg-gold-500 hover:text-navy-950 hover:border-gold-500 transition-all font-black uppercase tracking-wider shadow-sm flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()} 
                  >
                    {source.source || 'View Link'}
                  </a>
                ))}
              </div>
            )}
            
            <div className="absolute bottom-0 left-10 right-10 h-[2px] bg-gradient-to-r from-transparent via-gold-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};