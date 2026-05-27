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
    }, 5000); 

    const phraseInterval = setInterval(() => {
        setPhraseIndex((prev) => (prev + 1) % MOTIVATING_PHRASES.length);
    }, 2500);

    return () => {
        clearInterval(quoteInterval);
        clearInterval(phraseInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-[var(--space-6)] overflow-hidden relative min-h-[clamp(300px,80vh,600px)] w-full max-w-6xl mx-auto">
      
      {/* 3D Gavel Container - Vertical Strike Animation */}
      <div className="relative w-full max-w-md h-[clamp(200px,50vh,400px)] mb-[var(--space-8)] flex items-end justify-center perspective-[1200px]">
        
        {/* Sound Block (Base) */}
        <div className="absolute bottom-4 w-[clamp(10rem,40vw,16rem)] h-[var(--space-12)] bg-[#2a1d15] rounded-lg shadow-[0_15px_40px_rgba(0,0,0,0.6)] border-b-4 border-black flex items-center justify-center z-10">
            <div className="w-[92%] h-[80%] bg-[#3d2b1f] rounded border border-[#5d4037] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>
        </div>

        {/* The Vertical Gavel */}
        <div className="absolute bottom-[clamp(3rem,8vw,5rem)] left-1/2 -translate-x-1/2 z-20 will-change-transform animate-[gavelVerticalStrike_2s_ease-in-out_infinite]">
          
          {/* Entire Gavel Assembly - Rigid Construction */}
          <div className="relative flex flex-col items-center">
             
             {/* Handle - Strictly Vertical */}
             <div className="w-[var(--space-6)] h-[clamp(10rem,30vh,16rem)] bg-gradient-to-r from-[#2a1d15] via-[#5d4037] to-[#2a1d15] rounded-full shadow-xl relative z-20 border-x border-white/5">
                 <div className="w-full h-[var(--space-12)] bg-black/10 absolute top-0 rounded-t-full backdrop-blur-sm"></div>
                 {/* Grip Texture */}
                 <div className="absolute top-[var(--space-12)] w-full flex flex-col gap-[var(--space-1)] opacity-30">
                    {[...Array(8)].map((_, i) => <div key={i} className="h-[1px] bg-black w-full"></div>)}
                 </div>
             </div>
             
             {/* Head - Horizontal at bottom of handle */}
             <div className="w-[clamp(10rem,40vw,16rem)] h-[var(--space-16)] bg-gradient-to-b from-[#4e342e] to-[#2a1d15] rounded-lg shadow-xl relative -mt-4 z-30 border-2 border-[#3e2723] flex items-center justify-between px-[var(--space-2)]">
                
                {/* Brass End Caps */}
                <div className="h-[85%] w-[var(--space-6)] bg-gradient-to-r from-yellow-700 via-yellow-300 to-yellow-700 rounded-sm shadow-inner border border-yellow-900"></div>
                
                {/* Center Band connecting to handle */}
                <div className="absolute left-1/2 -translate-x-1/2 top-0 h-full w-[var(--space-12)] bg-[#3e2723]"></div>

                <div className="h-[85%] w-[var(--space-6)] bg-gradient-to-r from-yellow-700 via-yellow-300 to-yellow-700 rounded-sm shadow-inner border border-yellow-900"></div>
             </div>
          </div>

        </div>

        {/* Impact Sparkles */}
        <div className="absolute bottom-[clamp(3rem,8vw,5rem)] left-1/2 -translate-x-1/2 w-[var(--space-24)] h-[var(--space-20)] pointer-events-none z-40">
           <div className="w-full h-full animate-[sparkExplosion_2s_linear_infinite]">
              <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-gold-400 rounded-full shadow-[0_0_20px_gold]"></div>
              <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_30px_white]"></div>
           </div>
        </div>
        
        {/* Dust Cloud */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-64 h-16 bg-white/5 blur-lg rounded-full animate-[dustCloud_2s_linear_infinite]"></div>

      </div>
      
      <div className="relative z-10 text-center w-full px-[var(--space-4)]">
        {/* Motivating Phrase - Single Line, Responsive Font Size */}
        <div className="h-[var(--space-20)] overflow-hidden flex flex-col items-center justify-center">
            <h3 className="font-cinzel text-[var(--text-xl)] sm:text-[var(--text-4xl)] md:text-[var(--text-5xl)] text-gold-500 tracking-[0.2em] font-black animate-fade-in-up drop-shadow-lg leading-tight">
            {MOTIVATING_PHRASES[phraseIndex]}
            </h3>
        </div>
        
        {/* Animated Quote Carousel */}
        <div className="min-h-[clamp(5rem,15vh,8rem)] flex items-center justify-center mt-[var(--space-6)]">
          <p className="font-serif italic text-[var(--text-lg)] sm:text-[var(--text-2xl)] md:text-[var(--text-3xl)] text-slate-200 transition-opacity duration-1000 animate-pulse px-[var(--space-4)] max-w-4xl font-semibold leading-relaxed">
            "{LEGAL_QUOTES[quoteIndex]}"
          </p>
        </div>
      </div>
      
      <style>{`
        @keyframes gavelVerticalStrike {
          0% { transform: translate(-50%, -200px); opacity: 0; }
          20% { transform: translate(-50%, -200px); opacity: 1; }
          40% { transform: translate(-50%, 0); } /* Impact */
          45% { transform: translate(-50%, -10px); } /* Bounce */
          50% { transform: translate(-50%, 0); } /* Settle */
          85% { transform: translate(-50%, 0); opacity: 1; }
          100% { transform: translate(-50%, 0); opacity: 0; }
        }
        
        @keyframes sparkExplosion {
          0%, 39% { opacity: 0; transform: scale(0); }
          40% { opacity: 1; transform: scale(1); }
          55% { opacity: 0; transform: scale(1.5); }
          100% { opacity: 0; }
        }

        @keyframes dustCloud {
            0%, 39% { opacity: 0; transform: translate(-50%, 0) scaleX(0.5); }
            40% { opacity: 0.4; transform: translate(-50%, 0) scaleX(1); }
            65% { opacity: 0; transform: translate(-50%, -5px) scaleX(1.2); }
            100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};