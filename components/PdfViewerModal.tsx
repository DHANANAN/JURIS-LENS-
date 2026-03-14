import React, { useEffect } from 'react';
import { CaseSummary } from '../types';

interface PdfViewerModalProps {
  summary: CaseSummary;
  isOpen: boolean;
  onClose: () => void;
  isVakilMode: boolean;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({ summary, isOpen, onClose, isVakilMode }) => {
  if (!isOpen) return null;

  // Prevent background scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const kanoonLink = `https://indiankanoon.org/search/?formInput=${encodeURIComponent(summary.caseName + " " + summary.citation)}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-black">
      
      {/* Modal Content - Full Contrast */}
      <div className={`relative w-full max-w-[95rem] h-full flex flex-col shadow-none ${isVakilMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
        
        {/* Toolbar */}
        <div className={`h-28 shrink-0 flex items-center justify-between px-10 border-b-4 ${isVakilMode ? 'bg-black border-white' : 'bg-white border-black'}`}>
           <div className="flex items-center gap-12">
              <span className={`font-cinzel font-black text-3xl tracking-widest ${isVakilMode ? 'text-neon-green' : 'text-black'}`}>READER</span>
              <div className={`h-12 w-[4px] ${isVakilMode ? 'bg-white' : 'bg-black'}`}></div>
              <span className="font-mono text-2xl opacity-100 truncate max-w-[600px] font-black">{summary.caseName}</span>
           </div>

           <div className="flex items-center gap-8">
              <a 
                href={kanoonLink} 
                target="_blank" 
                rel="noreferrer"
                className={`px-8 py-5 text-xl font-black flex items-center gap-4 transition-colors uppercase tracking-wide border-4 ${isVakilMode ? 'bg-black border-white text-white hover:bg-white hover:text-black' : 'bg-white border-black text-black hover:bg-black hover:text-white'}`}
              >
                OPEN SOURCE ↗
              </a>
              <button 
                onClick={onClose}
                className={`p-5 hover:bg-red-600 hover:text-white border-4 transition-colors font-black ${isVakilMode ? 'border-white text-white' : 'border-black text-black'}`}
              >
                CLOSE X
              </button>
           </div>
        </div>

        {/* Document Area - Solid Background, No Texture */}
        <div className={`flex-1 overflow-auto p-4 md:p-16 flex justify-center ${isVakilMode ? 'bg-black' : 'bg-white'}`}>
           <div className={`w-full max-w-[1400px] min-h-full p-10 md:p-24 ${isVakilMode ? 'bg-black border-l-4 border-r-4 border-white' : 'bg-white'}`}>
              
              {/* Document Header */}
              <div className={`text-center mb-24 pb-16 border-b-[8px] border-double ${isVakilMode ? 'border-white' : 'border-black'}`}>
                 <h2 className={`font-cinzel text-6xl md:text-7xl font-black mb-10 ${isVakilMode ? 'text-white' : 'text-black'}`}>IN THE SUPREME COURT OF INDIA</h2>
                 <p className="font-serif italic text-4xl font-bold mb-10">{summary.jurisdiction} Appellate Jurisdiction</p>
                 <p className={`font-mono text-3xl py-6 px-12 inline-block border-4 font-black ${isVakilMode ? 'bg-black text-white border-white' : 'bg-white text-black border-black'}`}>{summary.citation}</p>
              </div>

              {/* Pseudo-Text Content - Larger Fonts */}
              <div className={`font-serif text-4xl md:text-5xl leading-[2.2] text-justify ${isVakilMode ? 'text-white' : 'text-black'}`}>
                 
                 <p className="mb-20 font-medium">
                   The present appeal arises from the judgment delivered by the {summary.court} in the year {summary.year}. 
                   This case involves significant questions of law regarding {summary.issues.join(', ')}.
                 </p>

                 <h3 className={`font-black text-3xl uppercase tracking-[0.2em] mt-24 mb-12 border-b-4 inline-block ${isVakilMode ? 'text-neon-green border-neon-green' : 'text-black border-black'}`}>1. THE FACTS</h3>
                 <p className="mb-20 font-medium">{summary.facts}</p>

                 <h3 className={`font-black text-3xl uppercase tracking-[0.2em] mt-24 mb-12 border-b-4 inline-block ${isVakilMode ? 'text-neon-green border-neon-green' : 'text-black border-black'}`}>2. THE ISSUES</h3>
                 <ul className="list-decimal pl-16 mb-20 space-y-10">
                   {summary.issues.map((issue, i) => <li key={i} className="pl-6 font-bold">{issue}</li>)}
                 </ul>

                 <h3 className={`font-black text-3xl uppercase tracking-[0.2em] mt-24 mb-12 border-b-4 inline-block ${isVakilMode ? 'text-neon-green border-neon-green' : 'text-black border-black'}`}>3. ANALYSIS</h3>
                 <p className="mb-20 font-medium">{summary.irac.analysis}</p>

                 <h3 className={`font-black text-3xl uppercase tracking-[0.2em] mt-24 mb-12 border-b-4 inline-block ${isVakilMode ? 'text-neon-green border-neon-green' : 'text-black border-black'}`}>4. JUDGMENT</h3>
                 <p className="mb-20 font-black">{summary.decision}</p>
                 
                 <div className="mt-40 pt-16 border-t-8 border-current flex justify-end">
                    <div className="text-center">
                       <p className="font-black text-5xl uppercase">Bench</p>
                       <p className="text-2xl uppercase tracking-widest mt-6 font-bold">JJ. {summary.judges.join(', ')}</p>
                    </div>
                 </div>

              </div>

           </div>
        </div>

      </div>
    </div>
  );
};