import React, { useState, useEffect } from 'react';

const MOTIVATING_PHRASES = [
  "UPHOLDING THE CONSTITUTION",
  "PURSUING THE TRUTH",
  "BALANCING THE SCALES",
  "EXTRACTING LEGAL WISDOM",
  "NAVIGATING JURISPRUDENCE",
  "PROTECTING RIGHTS",
  "INTERPRETING THE LAW",
  "SEEKING EQUITY"
];

const LEGAL_QUOTES = [
  "Innocent until proven guilty.",
  "Justice delayed is justice denied.",
  "Fiat Justitia Ruat Caelum - Let justice be done though the heavens fall.",
  "Ignorantia juris non excusat - Ignorance of the law excuses no one.",
  "The life of the law has not been logic: it has been experience.",
  "Law is the reason, free from passion.",
  "Stare Decisis - To stand by things decided.",
  "Audi Alteram Partem - Listen to the other side.",
  "Nulla poena sine lege - No penalty without a law.",
  "Actus Reus Non Facit Reum Nisi Mens Sit Rea - The act does not make a person guilty unless the mind is also guilty."
];

export const LoadingGavel = () => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    // Randomize initial quote on mount
    setQuoteIndex(Math.floor(Math.random() * LEGAL_QUOTES.length));

    const quoteInterval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % LEGAL_QUOTES.length);
    }, 4000); 

    const phraseInterval = setInterval(() => {
        setPhraseIndex((prev) => (prev + 1) % MOTIVATING_PHRASES.length);
    }, 2000);

    return () => {
        clearInterval(quoteInterval);
        clearInterval(phraseInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 overflow-hidden relative min-h-[600px]">
      
      {/* 3D Gavel Container - Vertical Strike Animation */}
      <div className="relative w-80 h-[500px] mb-20 flex items-end justify-center perspective-[1000px]">
        
        {/* Sound Block (Base) */}
        <div className="absolute bottom-10 w-72 h-20 bg-[#2a1d15] rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-b-8 border-black flex items-center justify-center z-10">
            <div className="w-[95%] h-[85%] bg-[#3d2b1f] rounded border-2 border-[#5d4037] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
        </div>

        {/* The Vertical Gavel */}
        <div className="absolute bottom-[7rem] left-1/2 -translate-x-1/2 z-20 animate-[gavelVerticalStrike_1.5s_cubic-bezier(0.25,1,0.5,1)_infinite]">
          
          {/* Entire Gavel Assembly - Rigid Construction */}
          <div className="relative flex flex-col items-center">
             
             {/* Handle - Strictly Vertical */}
             <div className="w-10 h-72 bg-gradient-to-r from-[#2a1d15] via-[#5d4037] to-[#2a1d15] rounded-full shadow-2xl relative z-20 border-x border-white/5">
                 <div className="w-full h-24 bg-black/20 absolute top-0 rounded-t-full backdrop-blur-sm"></div>
                 {/* Grip Texture */}
                 <div className="absolute top-20 w-full flex flex-col gap-3 opacity-40">
                    {[...Array(10)].map((_, i) => <div key={i} className="h-[2px] bg-black w-full"></div>)}
                 </div>
             </div>
             
             {/* Head - Horizontal at bottom of handle */}
             <div className="w-80 h-32 bg-gradient-to-b from-[#4e342e] to-[#2a1d15] rounded-xl shadow-2xl relative -mt-6 z-30 border-4 border-[#3e2723] flex items-center justify-between px-4">
                
                {/* Brass End Caps */}
                <div className="h-[90%] w-10 bg-gradient-to-r from-yellow-700 via-yellow-300 to-yellow-700 rounded-sm shadow-inner border border-yellow-900"></div>
                
                {/* Center Band connecting to handle */}
                <div className="absolute left-1/2 -translate-x-1/2 top-0 h-full w-20 bg-[#3e2723]"></div>

                <div className="h-[90%] w-10 bg-gradient-to-r from-yellow-700 via-yellow-300 to-yellow-700 rounded-sm shadow-inner border border-yellow-900"></div>
                
                {/* Shine Highlight */}
                <div className="absolute top-2 left-6 right-6 h-[3px] bg-white/20 rounded-full blur-[1px]"></div>
             </div>
          </div>

        </div>

        {/* Impact Sparkles */}
        <div className="absolute bottom-[7rem] left-1/2 -translate-x-1/2 w-64 h-40 pointer-events-none z-40">
           <div className="w-full h-full animate-[sparkExplosion_1.5s_linear_infinite]">
              <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-gold-400 rounded-full shadow-[0_0_30px_gold]"></div>
              <div className="absolute bottom-0 left-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_40px_white]"></div>
           </div>
        </div>
        
        {/* Dust Cloud */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-80 h-24 bg-white/5 blur-xl rounded-full animate-[dustCloud_1.5s_linear_infinite]"></div>

      </div>
      
      <div className="relative z-10 text-center max-w-[95vw] px-4">
        {/* Motivating Phrase - Single Line, Responsive Font Size */}
        <div className="h-32 overflow-hidden flex flex-col items-center justify-center">
            <h3 className="font-cinzel text-4xl sm:text-5xl md:text-6xl text-gold-500 tracking-[0.2em] font-black animate-fade-in-up drop-shadow-lg whitespace-nowrap overflow-visible">
            {MOTIVATING_PHRASES[phraseIndex]}
            </h3>
        </div>
        
        {/* Animated Quote Carousel */}
        <div className="min-h-[120px] flex items-center justify-center mt-10">
          <p className="font-serif italic text-3xl md:text-4xl text-slate-200 transition-opacity duration-1000 animate-pulse px-4 max-w-5xl font-semibold leading-relaxed">
            "{LEGAL_QUOTES[quoteIndex]}"
          </p>
        </div>
      </div>
      
      <style>{`
        @keyframes gavelVerticalStrike {
          0% { transform: translate(-50%, -300px); opacity: 0; }
          30% { transform: translate(-50%, -300px); opacity: 1; }
          45% { transform: translate(-50%, 0); } /* Impact */
          50% { transform: translate(-50%, -15px); } /* Bounce */
          60% { transform: translate(-50%, 0); } /* Settle */
          90% { transform: translate(-50%, 0); opacity: 1; }
          100% { transform: translate(-50%, 0); opacity: 0; }
        }
        
        @keyframes sparkExplosion {
          0%, 44% { opacity: 0; transform: scale(0); }
          45% { opacity: 1; transform: scale(1); }
          60% { opacity: 0; transform: scale(2); }
          100% { opacity: 0; }
        }

        @keyframes dustCloud {
            0%, 44% { opacity: 0; transform: translate(-50%, 0) scaleX(0.5); }
            45% { opacity: 0.5; transform: translate(-50%, 0) scaleX(1); }
            70% { opacity: 0; transform: translate(-50%, -10px) scaleX(1.5); }
            100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};