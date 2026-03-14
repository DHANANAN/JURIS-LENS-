import React from 'react';
import { CaseSearchResult } from '../types';

interface CaseListProps {
  results: CaseSearchResult[];
  onSelect: (result: CaseSearchResult) => void;
}

export const CaseList: React.FC<CaseListProps> = ({ results, onSelect }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 mb-32">
      <div className="text-center mb-16">
        <h2 className="font-display text-6xl text-parchment-50 mb-8 font-bold drop-shadow-lg">Select Case Record</h2>
        <div className="flex items-center justify-center gap-6 text-gold-500 font-cinzel text-xl tracking-widest font-black">
           <div className="h-0.5 w-16 bg-gold-500/50"></div>
           <span>MULTIPLE PRECEDENTS FOUND</span>
           <div className="h-0.5 w-16 bg-gold-500/50"></div>
        </div>
      </div>

      <div className="grid gap-10">
        {results.map((result, idx) => (
          <div
            key={idx}
            className="group relative bg-navy-900 border-2 border-slate-600 hover:border-gold-500 p-12 transition-all duration-300 flex flex-col gap-8 rounded-2xl shadow-xl hover:-translate-y-2 hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)]"
          >
            <button onClick={() => onSelect(result)} className="text-left w-full group">
              <div className="flex flex-col md:flex-row justify-between items-start mb-6">
                <h3 className="font-display text-5xl font-bold text-parchment-50 group-hover:text-gold-400 transition-colors leading-tight">
                  {result.caseName}
                </h3>
                <span className="text-xl font-mono text-slate-300 bg-black/50 border border-slate-500 px-6 py-3 mt-4 md:mt-0 font-bold rounded-lg whitespace-nowrap">
                  {result.citation}
                </span>
              </div>
              
              <p className="text-slate-200 font-serif italic text-3xl border-l-[8px] border-slate-600 pl-8 group-hover:border-gold-500 transition-colors leading-relaxed font-medium">
                "{result.context}"
              </p>
            </button>

            {/* Display Found PDF Links */}
            {result.sourceUrls && result.sourceUrls.length > 0 && (
              <div className="mt-6 pt-6 border-t-2 border-slate-700 flex flex-wrap gap-4">
                <span className="text-lg text-slate-400 uppercase tracking-widest font-black self-center mr-4">SOURCES:</span>
                {result.sourceUrls.map((source, i) => (
                  <a 
                    key={i}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-lg px-6 py-3 bg-navy-950 border border-slate-500 rounded-lg text-slate-300 hover:bg-gold-600 hover:text-black hover:border-gold-600 transition-colors font-black uppercase tracking-wider shadow-sm"
                    onClick={(e) => e.stopPropagation()} 
                  >
                    {source.source || 'View Link'} ↗
                  </a>
                ))}
              </div>
            )}
            
            <div className="absolute bottom-0 left-0 w-0 h-2 bg-gold-500 group-hover:w-full transition-all duration-500 ease-out rounded-b-2xl"></div>
          </div>
        ))}
      </div>
    </div>
  );
};