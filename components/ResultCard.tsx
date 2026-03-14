import React from 'react';
import { CaseSummary, RelatedCase } from '../types';

interface ResultCardProps {
  summary: CaseSummary;
  onRelatedCaseClick?: (name: string) => void;
  isVakilMode: boolean;
  onOpenPdf: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ summary, onRelatedCaseClick, isVakilMode, onOpenPdf }) => {
  
  // Theme configuration - "RUSTY & VISIBLE"
  // Strategy: Textures + High Contrast Text + Massive Fonts
  const theme = isVakilMode ? {
    bgMain: 'bg-zinc-950',
    bgPaper: 'bg-zinc-950', 
    texture: 'bg-noise', // Grainy texture
    textMain: 'text-white', 
    textBody: 'text-gray-100', // Near white for readability
    textMuted: 'text-gray-300',
    border: 'border-dashed border-neon-green', 
    accent: 'text-neon-green', 
    highlight: 'bg-zinc-900',
    fontHead: 'font-mono tracking-widest',
    fontBody: 'font-mono text-xl md:text-2xl leading-[2]', 
    stampBorder: 'border-neon-green',
    stampText: 'text-neon-green',
    stampOpacity: 'opacity-100',
    btnClass: 'bg-black border-4 border-neon-green text-neon-green hover:bg-neon-green hover:text-black font-mono uppercase tracking-widest text-xl py-4 px-8 font-black rounded-lg shadow-[0_0_15px_rgba(57,255,20,0.4)]',
    trajectoryTitle: 'text-neon-green',
    sectionDivider: 'border-gray-600',
    graphBar: 'bg-neon-green',
    conceptPill: 'bg-black text-neon-green border-neon-green shadow-[0_0_10px_rgba(57,255,20,0.2)]',
    flowLine: 'bg-neon-green',
    flowNode: 'bg-black border-neon-green'
  } : {
    bgMain: 'bg-parchment-100',
    bgPaper: 'bg-[#fcfaf2]', // Warm white parchment
    texture: 'bg-noise', // Adds the "paper" feel
    textMain: 'text-slate-950', // Deepest slate/black
    textBody: 'text-slate-950', 
    textMuted: 'text-slate-800', 
    border: 'border-solid border-amber-900', // Rusty brown
    accent: 'text-amber-900', 
    highlight: 'bg-amber-100', 
    fontHead: 'font-cinzel',
    fontBody: 'font-serif font-bold text-2xl md:text-4xl leading-[2.2]', 
    stampBorder: 'border-amber-900',
    stampText: 'text-amber-900',
    stampOpacity: 'opacity-90',
    btnClass: 'bg-parchment-100 border-4 border-amber-900 text-amber-950 hover:bg-amber-900 hover:text-parchment-100 font-bold tracking-widest text-xl py-4 px-8 rounded-lg shadow-lg',
    trajectoryTitle: 'text-amber-950',
    sectionDivider: 'border-amber-900/50',
    graphBar: 'bg-amber-800',
    conceptPill: 'bg-parchment-50 border-amber-900 text-amber-950 font-bold shadow-sm',
    flowLine: 'bg-amber-800',
    flowNode: 'bg-parchment-50 border-amber-900'
  };

  const renderRelatedCase = (rc: RelatedCase) => (
    <button 
      onClick={() => onRelatedCaseClick && onRelatedCaseClick(rc.caseName)}
      className={`block w-full text-left group mb-6 last:mb-0 p-8 border-4 transition-all shadow-md rounded-xl ${isVakilMode ? 'bg-black/50 border-gray-600 hover:border-neon-green border-dashed' : 'bg-white/60 border-amber-900/40 hover:border-amber-900 hover:bg-amber-50'}`}
    >
      <div className="flex items-center gap-4 mb-4">
        <span className={`text-base font-black px-4 py-2 border-2 uppercase tracking-wider rounded ${
          isVakilMode 
           ? 'border-white text-white'
           : (rc.type === 'OVERRULED' ? 'border-red-800 text-red-800 bg-red-50' : 'border-slate-800 text-slate-900 bg-slate-200')
        }`}>
          {rc.type.replace('_', ' ')}
        </span>
        <span className={`text-xl font-black ${isVakilMode ? 'text-white font-mono' : 'text-slate-900 font-mono'}`}>{rc.year}</span>
      </div>
      <div className={`${isVakilMode ? 'text-white group-hover:text-neon-green font-mono text-2xl truncate' : 'font-serif text-slate-950 text-3xl font-black group-hover:text-amber-800 decoration-2 underline-offset-4'}`}>
        {rc.caseName}
      </div>
    </button>
  );

  return (
    <div className="max-w-[90rem] mx-auto -mt-6 mb-32 relative z-10 px-4 md:px-8">
      
      {/* The Document Container - Rounded, Textured, Shadowed */}
      <div className={`${theme.bgPaper} ${theme.texture} rounded-[2rem] shadow-[0_20px_70px_-10px_rgba(0,0,0,0.5)] border-[6px] ${theme.border} overflow-hidden relative group transition-colors duration-500`}>
        
        {/* Petrol/Stain Overlay (Subtle) */}
        {!isVakilMode && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-200/20 via-transparent to-transparent pointer-events-none mix-blend-multiply"></div>
        )}
        
        {/* Giant Watermark - Restored */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 z-0 overflow-hidden">
           <span className={`font-black text-[20vw] -rotate-45 whitespace-nowrap ${isVakilMode ? 'text-neon-green' : 'text-amber-900'}`}>
             {isVakilMode ? 'CONFIDENTIAL' : 'JUDGMENT'}
           </span>
        </div>

        {/* Rusty Stamp - Restored & High Contrast */}
        <div className={`absolute top-8 right-8 md:right-16 w-56 h-56 border-[8px] ${theme.stampBorder} rounded-full flex items-center justify-center ${theme.stampOpacity} pointer-events-none rotate-[-12deg] z-20 mix-blend-multiply ${isVakilMode ? 'invert' : ''}`}>
            <div className={`w-48 h-48 border-[6px] border-dashed ${theme.stampBorder} rounded-full flex flex-col items-center justify-center text-center p-4`}>
                <span className={`font-black text-xl ${theme.stampText} tracking-widest ${isVakilMode ? 'font-mono' : 'font-cinzel'}`}>
                  {isVakilMode ? 'TOP SECRET' : 'OFFICIAL'}
                </span>
                <span className={`font-black text-sm ${theme.stampText} tracking-widest mt-2 uppercase`}>
                   Verified Copy
                </span>
                <div className="flex gap-2 my-3">
                  {[1,2,3].map(i => <div key={i} className={`w-3 h-3 rounded-full bg-current opacity-100 ${theme.stampText}`}></div>)}
                </div>
            </div>
        </div>

        {/* Top Bar */}
        <div className={`h-6 w-full ${isVakilMode ? 'bg-gradient-to-r from-gray-800 via-neon-green to-gray-800' : 'bg-gradient-to-r from-amber-900 via-gold-600 to-amber-900'}`}></div>

        {/* Header Section */}
        <div className={`px-8 md:px-20 py-16 border-b-[6px] ${theme.sectionDivider} relative z-10 bg-inherit`}>
           <div className="flex items-center gap-6 mb-8">
             <span className={`${theme.fontHead} text-2xl font-black tracking-[0.25em] uppercase ${theme.textMain}`}>
                {summary.court} • {summary.year}
             </span>
           </div>
           
           <h2 className={`${isVakilMode ? 'font-mono text-white tracking-tighter' : 'font-display text-slate-950'} text-7xl md:text-9xl font-black leading-[1.1] mb-12 drop-shadow-sm`}>
              {summary.caseName}
           </h2>
           
           <div className="flex flex-wrap items-center gap-6">
             <span className={`font-mono text-3xl font-black tracking-wide px-8 py-4 rounded-lg shadow-sm ${isVakilMode ? 'border-4 border-white text-white bg-black' : 'border-4 border-slate-900 bg-slate-900 text-parchment-50'}`}>
               {summary.citation}
             </span>
             {summary.benchStrength && (
                <span className={`font-mono text-2xl font-black uppercase tracking-wider px-6 py-4 rounded-lg shadow-sm ${isVakilMode ? 'text-white border-2 border-white' : 'text-slate-900 bg-parchment-200 border-2 border-amber-900'}`}>
                   Bench: {summary.benchStrength}
                </span>
             )}
           </div>

           {/* Bench Display */}
           <div className={`mt-16 pt-12 border-t-4 ${theme.sectionDivider}`}>
              <h4 className={`text-xl font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-4 ${theme.textMain}`}>
                <span className="text-3xl">⚖️</span> Honorable Bench
              </h4>
              <div className="flex flex-wrap gap-6">
                {summary.judges?.map((judge, i) => (
                  <div key={i} className={`flex items-center gap-4 px-8 py-5 border-[4px] shadow-sm rounded-lg ${isVakilMode ? 'bg-black border-neon-green text-white' : 'bg-parchment-50 border-amber-900 text-slate-900'}`}>
                    <span className={`text-2xl opacity-100 font-serif font-black ${isVakilMode ? 'text-neon-green' : 'text-amber-800'}`}>J.</span>
                    <span className={`text-2xl font-black uppercase ${theme.fontHead}`}>{judge.replace(/^J\.\s*/, '')}</span>
                  </div>
                ))}
              </div>
           </div>
        </div>

        {/* Main Content Body */}
        <div className={`p-8 md:p-20 relative z-10 ${theme.textBody}`}>
            
            {/* Vakil's Take */}
            {isVakilMode && summary.vakilTake && (
              <div className="mb-24 p-12 bg-black border-[6px] border-neon-green rounded-xl shadow-[0_0_40px_rgba(57,255,20,0.15)] relative">
                <h3 className="font-mono text-neon-green font-black text-4xl mb-8 flex items-center gap-6 uppercase tracking-widest border-b-4 border-gray-700 pb-6">
                    <span className="text-5xl">⚡</span> VAKIL'S STRATEGY NOTE
                </h3>
                <p className="font-mono text-3xl md:text-4xl leading-relaxed text-white font-bold">{summary.vakilTake}</p>
              </div>
            )}

            {/* Procedural History Flowchart */}
            {summary.proceduralHistory && summary.proceduralHistory.length > 0 && (
              <div className="mb-24">
                 <h4 className={`${theme.fontHead} ${theme.textMain} text-2xl font-black uppercase tracking-[0.2em] mb-12`}>Procedural History</h4>
                 <div className="flex flex-col gap-8">
                    {summary.proceduralHistory.map((step, i) => (
                      <div key={i} className="flex items-start gap-6 relative">
                        {/* Connecting Line */}
                        {i < summary.proceduralHistory!.length - 1 && (
                          <div className={`absolute left-8 top-16 bottom-[-2rem] w-[6px] ${theme.flowLine} z-0`}></div>
                        )}
                        <div className={`flex-shrink-0 w-16 h-16 flex items-center justify-center text-2xl font-black border-4 rounded-full z-10 shadow-lg ${isVakilMode ? 'bg-neon-green text-black border-black' : 'bg-amber-900 text-white border-parchment-50'}`}>
                             {i + 1}
                        </div>
                        <div className={`flex-grow p-8 border-4 rounded-xl shadow-md ${theme.flowNode}`}>
                           <p className={`text-2xl font-black leading-snug ${isVakilMode ? 'text-white' : 'text-slate-900'}`}>{step}</p>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {/* Facts */}
            <div className="mb-24">
              <h4 className={`${theme.fontHead} ${theme.textMain} text-3xl font-black uppercase tracking-[0.2em] mb-10 border-b-8 ${theme.sectionDivider} pb-6`}>Facts of the Case</h4>
              <p className={`text-left ${theme.fontBody}`}>{summary.facts}</p>
            </div>

            {/* Legal Duel (Arguments) */}
            {(summary.petitionerArguments || summary.respondentArguments) && (
              <div className="mb-24 grid grid-cols-1 md:grid-cols-2 gap-16">
                 <div className={`p-12 border-l-[12px] rounded-r-xl shadow-md ${isVakilMode ? 'bg-gray-900 border-white' : 'bg-parchment-50 border-slate-800'}`}>
                    <h4 className="text-xl uppercase font-black tracking-widest mb-8 underline decoration-4 decoration-slate-400/50 underline-offset-8">Petitioner's Arguments</h4>
                    <p className={`text-2xl md:text-3xl leading-relaxed ${theme.textMain} font-bold`}>{summary.petitionerArguments || "Not available."}</p>
                 </div>
                 <div className={`p-12 border-l-[12px] rounded-r-xl shadow-md ${isVakilMode ? 'bg-gray-900 border-neon-green' : 'bg-parchment-50 border-amber-800'}`}>
                    <h4 className="text-xl uppercase font-black tracking-widest mb-8 underline decoration-4 decoration-amber-400/50 underline-offset-8">Respondent's Arguments</h4>
                    <p className={`text-2xl md:text-3xl leading-relaxed ${theme.textMain} font-bold`}>{summary.respondentArguments || "Not available."}</p>
                 </div>
              </div>
            )}

            {/* Ratio Decidendi - HIGHLIGHTED */}
            <div className={`mb-24 relative p-16 border-[8px] rounded-2xl shadow-xl ${isVakilMode ? 'bg-black border-neon-green border-dashed' : 'bg-parchment-50 border-amber-900'}`}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-12 py-5 bg-black border-4 border-white rounded-full shadow-lg">
                <span className={`${theme.fontHead} font-black text-white tracking-[0.25em] text-xl`}>RATIO DECIDENDI</span>
              </div>
              <p className={`${isVakilMode ? 'font-mono text-white text-3xl md:text-4xl leading-relaxed text-center font-bold' : 'font-display text-5xl md:text-6xl text-slate-950 font-black italic text-center leading-tight'}`}>
                "{summary.ratioDecidendi}"
              </p>
            </div>

            {/* Held */}
            <div className={`p-16 mb-24 rounded-2xl shadow-lg border-l-[16px] ${isVakilMode ? 'bg-gray-900 border-neon-green' : 'bg-amber-100 border-amber-900'}`}>
               <h4 className={`${theme.fontHead} text-3xl font-black mb-8 uppercase tracking-widest ${theme.textMain}`}>JUDGMENT HELD:</h4>
               <p className={`${theme.fontBody} font-black`}>{summary.decision}</p>
            </div>

            {/* IRAC - UNIFIED FLOW */}
            {summary.irac && (
              <div className={`mb-24 rounded-2xl shadow-2xl overflow-hidden border-[6px] ${isVakilMode ? 'bg-black border-gray-600' : 'bg-parchment-50 border-amber-900'}`}>
                <div className={`p-10 border-b-8 ${theme.sectionDivider} ${isVakilMode ? 'bg-gray-900' : 'bg-amber-100'}`}>
                  <h3 className={`${theme.fontHead} text-5xl font-black tracking-widest flex items-center gap-6 ${theme.textMain}`}><span className="text-6xl">⚖️</span> IRAC ANALYSIS</h3>
                </div>
                <div className="p-12 space-y-16">
                  {/* Issue */}
                  <div className="flex flex-col md:flex-row gap-10">
                     <div className={`w-24 h-24 shrink-0 flex items-center justify-center font-black text-4xl border-4 rounded-full shadow-md ${isVakilMode ? 'bg-black text-neon-green border-neon-green' : 'bg-amber-900 text-parchment-50 border-amber-700'}`}>I</div>
                     <div className="flex-1">
                       <h4 className="font-black text-2xl mb-4 uppercase tracking-wider underline offset-8">ISSUE</h4>
                       <p className={`leading-relaxed text-left ${isVakilMode ? 'font-mono text-white text-2xl font-bold' : 'font-serif font-bold text-4xl text-slate-950'}`}>{summary.irac.issue}</p>
                     </div>
                  </div>
                  {/* Rule */}
                  <div className="flex flex-col md:flex-row gap-10">
                     <div className={`w-24 h-24 shrink-0 flex items-center justify-center font-black text-4xl border-4 rounded-full shadow-md ${isVakilMode ? 'bg-black text-neon-green border-neon-green' : 'bg-amber-900 text-parchment-50 border-amber-700'}`}>R</div>
                     <div className="flex-1">
                       <h4 className="font-black text-2xl mb-4 uppercase tracking-wider underline offset-8">RULE</h4>
                       <p className={`leading-loose text-left ${isVakilMode ? 'font-mono text-white text-2xl font-bold' : 'font-serif font-bold text-3xl text-slate-950'}`}>{summary.irac.rule}</p>
                     </div>
                  </div>
                  {/* Analysis */}
                  <div className="flex flex-col md:flex-row gap-10">
                     <div className={`w-24 h-24 shrink-0 flex items-center justify-center font-black text-4xl border-4 rounded-full shadow-md ${isVakilMode ? 'bg-black text-neon-green border-neon-green' : 'bg-amber-900 text-parchment-50 border-amber-700'}`}>A</div>
                     <div className="flex-1">
                       <h4 className="font-black text-2xl mb-4 uppercase tracking-wider underline offset-8">ANALYSIS</h4>
                       <p className={`leading-loose text-left ${isVakilMode ? 'font-mono text-white text-2xl font-bold' : 'font-serif font-bold text-3xl text-slate-950'}`}>{summary.irac.analysis}</p>
                     </div>
                  </div>
                  {/* Conclusion */}
                  <div className={`flex flex-col md:flex-row gap-10 p-10 border-4 rounded-xl ${isVakilMode ? 'border-neon-green bg-gray-900' : 'border-amber-900 bg-amber-50'}`}>
                     <div className={`w-24 h-24 shrink-0 flex items-center justify-center font-black text-4xl rounded-lg shadow-md ${isVakilMode ? 'bg-neon-green text-black' : 'bg-amber-900 text-white'}`}>C</div>
                     <div className="flex-1">
                       <h4 className="font-black text-2xl mb-4 uppercase tracking-wider underline offset-8">CONCLUSION</h4>
                       <p className={`font-black text-3xl md:text-5xl leading-relaxed ${isVakilMode ? 'text-neon-green' : 'text-slate-950'}`}>{summary.irac.conclusion}</p>
                     </div>
                  </div>
                </div>
              </div>
            )}

            {/* Trajectory */}
            <div className={`border-t-[12px] p-16 mb-24 rounded-b-[2rem] ${isVakilMode ? 'bg-black border-gray-700' : 'bg-parchment-100 border-amber-900'}`}>
              <h3 className={`${theme.fontHead} text-center text-5xl mb-16 tracking-[0.2em] font-black uppercase ${theme.textMain}`}>Legal Trajectory</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                <div>
                  <h4 className={`text-2xl font-black tracking-widest mb-10 pb-4 border-b-8 ${theme.sectionDivider} ${theme.textMain}`}>PRECEDENTS</h4>
                  <div className="space-y-8">{summary.precedents?.length > 0 ? summary.precedents.map((p, i) => <div key={i}>{renderRelatedCase(p)}</div>) : <p className="text-3xl italic font-bold">No precedents listed.</p>}</div>
                </div>
                <div>
                  <h4 className={`text-2xl font-black tracking-widest mb-10 pb-4 border-b-8 ${theme.sectionDivider} ${theme.textMain}`}>SUBSEQUENT DEVELOPMENTS</h4>
                  <div className="space-y-8">{summary.subsequentDevelopments?.length > 0 ? summary.subsequentDevelopments.map((p, i) => <div key={i}>{renderRelatedCase(p)}</div>) : <p className="text-3xl italic font-bold">No developments listed.</p>}</div>
                </div>
              </div>
            </div>

            {/* BOTTOM SECTION: Statistics & Sources */}
            <div className={`mt-32 pt-24 border-t-[8px] ${theme.sectionDivider}`}>
                
                {/* 1. Statistics & Infographics */}
                {summary.stats && (
                   <div className="mb-32">
                      <h3 className={`${theme.fontHead} text-center text-5xl font-black mb-24 tracking-widest uppercase ${theme.textMain}`}>Analytics</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-16 items-start">
                          
                          {/* INFOGRAPHIC 1: Sentiment & Impact */}
                          <div className={`flex flex-col items-center p-12 border-8 rounded-2xl h-[35rem] shadow-xl ${isVakilMode ? 'bg-gray-900 border-gray-600' : 'bg-parchment-50 border-amber-900'}`}>
                             <h4 className={`text-2xl uppercase font-black tracking-widest mb-10 ${theme.textMain}`}>Impact Score</h4>
                             <div className={`w-full flex-1 flex flex-col items-center justify-center`}>
                                <div className="relative w-full h-full flex items-center justify-center">
                                    {/* Donut Chart Simulation with Border Radius */}
                                    <div className={`w-64 h-64 rounded-full border-[20px] flex items-center justify-center ${isVakilMode ? 'border-neon-green' : 'border-amber-600'}`}>
                                        <span className={`font-black text-8xl ${theme.textMain}`}>{summary.stats.impactScore}</span>
                                    </div>
                                </div>
                                <span className={`text-2xl font-black mt-6 uppercase ${theme.textMain}`}>OUT OF 100</span>
                             </div>
                          </div>

                          {/* INFOGRAPHIC 2: Trend - Simplified for visibility */}
                          <div className={`flex flex-col p-12 border-8 rounded-2xl h-[35rem] shadow-xl ${isVakilMode ? 'bg-gray-900 border-gray-600' : 'bg-parchment-50 border-amber-900'}`}>
                             <h4 className={`text-2xl uppercase font-black tracking-widest mb-10 text-center ${theme.textMain}`}>Citation Timeline</h4>
                             {summary.stats.citationTrend ? (
                               <div className="flex items-end justify-between h-full gap-4 mt-auto w-full pb-4">
                                  {summary.stats.citationTrend.map((item, idx) => (
                                    <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end">
                                      <div 
                                        className={`w-full rounded-t-lg border-2 ${theme.graphBar} border-black/20`} 
                                        style={{ height: `${item.count}%`, minHeight: '20px' }}
                                      ></div>
                                      <span className={`text-xl mt-6 font-mono rotate-[-90deg] origin-center font-black ${theme.textMain}`}>{item.period}</span>
                                    </div>
                                  ))}
                               </div>
                             ) : (
                               <div className="flex items-center justify-center h-full text-3xl font-bold italic">No Data</div>
                             )}
                          </div>

                          {/* INFOGRAPHIC 3: Bench Split - Simplified */}
                          <div className={`flex flex-col p-12 border-8 rounded-2xl h-[35rem] shadow-xl ${isVakilMode ? 'bg-gray-900 border-gray-600' : 'bg-parchment-50 border-amber-900'}`}>
                             <h4 className={`text-2xl uppercase font-black tracking-widest mb-10 text-center ${theme.textMain}`}>Judicial Split</h4>
                             {summary.stats.benchSplit ? (
                               <div className="flex flex-col items-center justify-center h-full gap-12 w-full">
                                  <div className="text-center w-full">
                                    <span className="text-8xl font-black text-green-600 block">{summary.stats.benchSplit.majority}</span>
                                    <span className={`text-xl uppercase tracking-widest font-black ${theme.textMain}`}>Majority</span>
                                  </div>
                                  <div className={`h-1 w-full ${theme.bgMain} border-t-4 ${theme.sectionDivider}`}></div>
                                  <div className="text-center w-full">
                                    <span className="text-8xl font-black text-red-600 block">{summary.stats.benchSplit.dissent}</span>
                                    <span className={`text-xl uppercase tracking-widest font-black ${theme.textMain}`}>Dissent</span>
                                  </div>
                               </div>
                             ) : (
                               <div className="flex items-center justify-center h-full text-3xl font-bold italic">Unanimous</div>
                             )}
                          </div>
                      </div>
                      
                      {/* Concept Cloud */}
                      {summary.stats.legalConcepts && (
                        <div className="mt-20 text-center">
                           <h4 className={`text-2xl uppercase font-black tracking-widest mb-10 ${theme.textMain}`}>Key Legal Concepts</h4>
                           <div className="flex flex-wrap justify-center gap-6">
                             {summary.stats.legalConcepts.map((concept, idx) => (
                               <span key={idx} className={`px-8 py-4 text-3xl border-4 rounded-full ${theme.conceptPill}`}>
                                 {concept}
                               </span>
                             ))}
                           </div>
                        </div>
                      )}

                   </div>
                )}

                {/* 2. Source Links */}
                <div className={`p-16 border-[8px] rounded-2xl ${isVakilMode ? 'bg-black border-gray-600' : 'bg-parchment-50 border-amber-900'}`}>
                    <h3 className={`${theme.fontHead} text-center text-4xl font-black mb-12 tracking-widest uppercase ${theme.textMain}`}>Sources</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
                        {summary.sources && summary.sources.map((source, idx) => (
                           <a 
                             key={idx} 
                             href={source.url} 
                             target="_blank" 
                             rel="noreferrer"
                             className={`flex flex-col items-center justify-center p-10 border-4 h-48 rounded-xl shadow-lg transition-transform hover:-translate-y-2 ${isVakilMode ? 'bg-gray-900 border-white hover:bg-neon-green hover:text-black hover:border-neon-green text-white' : 'bg-white border-amber-900 hover:bg-amber-900 hover:text-white text-slate-900'}`}
                           >
                              <span className="text-2xl font-black uppercase text-center mb-2">
                                {source.type}
                              </span>
                              <span className="text-xl text-center leading-tight font-bold">
                                {source.name}
                              </span>
                              <span className="mt-4 text-lg uppercase font-black underline">
                                GO TO LINK &rarr;
                              </span>
                           </a>
                        ))}
                    </div>
                </div>

            </div>
        </div>

      </div>
    </div>
  );
};