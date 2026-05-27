import React, { useRef, useState } from 'react';
import { CaseSummary, RelatedCase } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ExternalLink, FileDown, Download, AlertCircle, CheckCircle2, Scale, Gavel, BookOpen, History, Info, TrendingUp, Users, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

interface ResultCardProps {
  summary: CaseSummary;
  onRelatedCaseClick?: (name: string) => void;
  isVakilMode: boolean;
}

export const ResultCard: React.FC<ResultCardProps> = ({ summary, onRelatedCaseClick, isVakilMode }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const officialSource = summary.sources?.find(
    s => s.type === 'OFFICIAL PDF' || s.type === 'DIRECT PDF DOWNLOAD'
  ) || (summary.sources && summary.sources.length > 0 ? summary.sources[0] : null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    setDownloadError(null);

    try {
      // Create a searchable, multi-page A4 PDF
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let cursorY = margin;

      // Helper to add a new page if needed
      const checkPageBreak = (neededHeight: number) => {
        if (cursorY + neededHeight > pageHeight - margin) {
          doc.addPage();
          drawPageBackground();
          cursorY = margin;
          return true;
        }
        return false;
      };

      // Helper to draw the "Official Stamp"
      const drawStamp = (x: number, y: number) => {
        doc.saveGraphicsState();
        doc.setGState(new (doc as any).GState({ opacity: 0.6 }));
        doc.setDrawColor(isVakilMode ? '#39ff14' : '#78350f');
        doc.setLineWidth(1.5);
        
        // Outer double circle
        doc.circle(x, y, 22, 'S');
        doc.setLineWidth(0.5);
        doc.circle(x, y, 20, 'S');
        
        // Inner dashed circle
        doc.setLineDashPattern([1, 1], 0);
        doc.circle(x, y, 17, 'S');
        doc.setLineDashPattern([], 0);
        
        // Center Star/Symbol
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('★', x, y + 1, { align: 'center' });
        
        // Circular text
        doc.setFontSize(6);
        const radius = 18.5;
        const text = isVakilMode ? '• JURISLENS INTELLIGENCE • TOP SECRET •' : '• SUPREME COURT OF JURISLENS • OFFICIAL •';
        for (let i = 0; i < text.length; i++) {
          const angle = (i / text.length) * Math.PI * 2 - Math.PI / 2;
          const tx = x + Math.cos(angle) * radius;
          const ty = y + Math.sin(angle) * radius;
          doc.text(text[i], tx, ty, { angle: (angle * 180 / Math.PI) + 90, align: 'center' });
        }
        
        doc.setFontSize(8);
        doc.text('VERIFIED', x, y - 5, { align: 'center' });
        doc.text('COPY', x, y + 7, { align: 'center' });
        
        doc.restoreGraphicsState();
      };

      // Helper to draw background and watermark
      const drawPageBackground = () => {
        // Background
        doc.setFillColor(isVakilMode ? '#0a0a0a' : '#fcfaf2');
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        
        // Watermark
        doc.saveGraphicsState();
        doc.setGState(new (doc as any).GState({ opacity: 0.05 }));
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(60);
        doc.setTextColor(isVakilMode ? '#39ff14' : '#78350f');
        doc.text(isVakilMode ? 'CONFIDENTIAL' : 'JUDGMENT', pageWidth / 2, pageHeight / 2, {
          align: 'center',
          angle: 45
        });
        doc.restoreGraphicsState();
      };

      // Helper to draw a section header
      const drawHeader = (text: string) => {
        checkPageBreak(20);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(isVakilMode ? '#39ff14' : '#78350f');
        doc.text(text.toUpperCase(), margin, cursorY);
        cursorY += 4;
        doc.setLineWidth(0.5);
        doc.setDrawColor(isVakilMode ? '#39ff14' : '#78350f');
        doc.line(margin, cursorY, margin + 40, cursorY);
        cursorY += 8;
      };

      // Helper to draw body text
      const drawBody = (text: string, size = 11, style = 'normal') => {
        doc.setFont('helvetica', style);
        doc.setFontSize(size);
        doc.setTextColor(isVakilMode ? '#ffffff' : '#0f172a');
        const lines = doc.splitTextToSize(text, contentWidth);
        
        for (const line of lines) {
          if (checkPageBreak(size * 0.5)) {
            // Page break handled
          }
          doc.text(line, margin, cursorY);
          cursorY += size * 0.5;
        }
        cursorY += 5;
      };

      // Initial Page Setup
      drawPageBackground();

      // 1. Title & Case Info
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(isVakilMode ? '#ffffff' : '#0f172a');
      const titleLines = doc.splitTextToSize(summary.caseName, contentWidth);
      doc.text(titleLines, margin, cursorY + 10);
      cursorY += (titleLines.length * 8) + 10;

      doc.setFontSize(11);
      doc.setTextColor(isVakilMode ? '#39ff14' : '#78350f');
      doc.text(`${summary.court} | ${summary.year} | ${summary.citation}`, margin, cursorY);
      cursorY += 12;

      // 1.5. Laws Involved
      if (summary.lawsInvolved && summary.lawsInvolved.length > 0) {
        drawHeader("Laws Involved");
        drawBody(summary.lawsInvolved.join(', '));
      }

      // 2. Facts & Narrative
      drawHeader("Facts & Narrative");
      drawBody(summary.factsAndNarrative);

      // 2.5. Timeline
      if (summary.timeline && summary.timeline.length > 0) {
        drawHeader("Timeline of Events");
        summary.timeline.forEach(t => {
          doc.setFont('helvetica', 'bold');
          doc.text(`${t.date}:`, margin, cursorY);
          cursorY += 5;
          drawBody(t.event);
          checkPageBreak(10);
        });
      }

      // 2.6. Procedural History
      if (summary.proceduralHistory && summary.proceduralHistory.length > 0) {
        drawHeader("Procedural History");
        drawBody(summary.proceduralHistory.join(' -> '));
      }

      // 3. Arguments
      if (summary.petitionerArguments) {
        drawHeader("Petitioner's Arguments");
        drawBody(summary.petitionerArguments);
      }
      if (summary.respondentArguments) {
        drawHeader("Respondent's Arguments");
        drawBody(summary.respondentArguments);
      }

      // 4. Ratio Decidendi
      drawHeader("Ratio Decidendi");
      drawBody(summary.ratioDecidendi, 11, 'bolditalic');

      // 5. Decision
      drawHeader("Judgment Held");
      drawBody(summary.decision, 11, 'bold');

      // 6. IRAC
      if (summary.irac) {
        drawHeader("IRAC Analysis");
        doc.setFont('helvetica', 'bold');
        doc.text("ISSUE:", margin, cursorY);
        cursorY += 5;
        drawBody(summary.irac.issue);
        
        doc.setFont('helvetica', 'bold');
        doc.text("RULE:", margin, cursorY);
        cursorY += 5;
        drawBody(summary.irac.rule);
        
        doc.setFont('helvetica', 'bold');
        doc.text("ANALYSIS:", margin, cursorY);
        cursorY += 5;
        drawBody(summary.irac.analysis);
        
        doc.setFont('helvetica', 'bold');
        doc.text("CONCLUSION:", margin, cursorY);
        cursorY += 5;
        drawBody(summary.irac.conclusion, 11, 'bold');
      }

      // 6.5. Precedents & Subsequent Developments
      if (summary.precedents && summary.precedents.length > 0) {
        drawHeader("Precedents Relied Upon");
        summary.precedents.forEach(p => {
          doc.setFont('helvetica', 'bold');
          doc.text(`${p.caseName} (${p.citation})`, margin, cursorY);
          cursorY += 5;
          doc.setFont('helvetica', 'italic');
          doc.text(`Type: ${p.type}`, margin + 5, cursorY);
          cursorY += 8;
          checkPageBreak(10);
        });
      }

      if (summary.subsequentDevelopments && summary.subsequentDevelopments.length > 0) {
        drawHeader("Subsequent Developments");
        summary.subsequentDevelopments.forEach(s => {
          doc.setFont('helvetica', 'bold');
          doc.text(`${s.caseName} (${s.citation})`, margin, cursorY);
          cursorY += 5;
          doc.setFont('helvetica', 'italic');
          doc.text(`Type: ${s.type} | Year: ${s.year}`, margin + 5, cursorY);
          cursorY += 8;
          checkPageBreak(10);
        });
      }

      // 7. Vakil's Take
      if (isVakilMode && summary.vakilTake) {
        drawHeader("Vakil's Strategy Note");
        drawBody(summary.vakilTake, 11, 'bold');
      }

      // 7.1. AI Reasoning Note
      if (summary.reasoningNote) {
        drawHeader("AI Reasoning Note");
        drawBody(summary.reasoningNote, 10, 'italic');
      }

      // 7.5. Analytics Summary
      if (summary.stats) {
        drawHeader("Legal Analytics");
        doc.setFont('helvetica', 'bold');
        doc.text(`Impact Score: ${summary.stats.impactScore}/100`, margin, cursorY);
        cursorY += 8;
        doc.text(`Bench Split: ${summary.stats.benchSplit?.majority} (Majority) - ${summary.stats.benchSplit?.dissent} (Dissent)`, margin, cursorY);
        cursorY += 8;
        if (summary.stats.legalConcepts) {
          doc.text("Key Legal Concepts:", margin, cursorY);
          cursorY += 5;
          drawBody(summary.stats.legalConcepts.join(', '));
        }
      }

      // 8. Sources & Direct Downloads
      drawHeader("Sources & Direct Downloads");
      summary.sources.forEach(s => {
        const isDirect = s.type === 'DIRECT PDF DOWNLOAD' || s.name.toLowerCase().includes('pdf');
        doc.setFont('helvetica', isDirect ? 'bold' : 'normal');
        if (isDirect) doc.setTextColor('#10b981'); // Emerald for direct PDF
        else doc.setTextColor(isVakilMode ? '#ffffff' : '#0f172a');
        
        doc.text(`• ${s.name} (${s.type})`, margin, cursorY);
        cursorY += 5;
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor('#3b82f6');
        doc.textWithLink(s.url, margin + 5, cursorY, { url: s.url });
        doc.setFontSize(11);
        cursorY += 8;
        checkPageBreak(10);
      });

      // Footer on all pages
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`JurisLens AI Legal Report - Page ${i} of ${pageCount} - ${summary.citation}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      }

      const safeCaseName = summary.caseName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      doc.save(`${safeCaseName}_JL.pdf`);
      
    } catch (err) {
      console.error('PDF Error:', err);
      setDownloadError('Failed to generate searchable PDF.');
    } finally {
      setIsDownloading(false);
    }
  };

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
    fontBody: 'font-mono text-[var(--text-lg)] sm:text-[var(--text-xl)] lg:font-sans lg:text-lg xl:text-xl lg:leading-relaxed lg:tracking-normal', 
    stampBorder: 'border-neon-green',
    stampText: 'text-neon-green',
    stampOpacity: 'opacity-100',
    btnClass: 'bg-black border-4 border-neon-green text-neon-green hover:bg-neon-green hover:text-black font-mono uppercase tracking-widest text-[var(--text-lg)] sm:text-[var(--text-xl)] py-4 px-8 font-black rounded-lg shadow-[0_0_15px_rgba(57,255,20,0.4)]',
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
    paperEffect: 'shadow-[inset_0_0_100px_rgba(0,0,0,0.05)] after:content-[""] after:absolute after:inset-0 after:bg-[url("https://www.transparenttextures.com/patterns/natural-paper.png")] after:opacity-20 after:pointer-events-none',
    textMain: 'text-slate-950', // Deepest slate/black
    textBody: 'text-slate-950', 
    textMuted: 'text-slate-800', 
    border: 'border-solid border-amber-900', // Rusty brown
    accent: 'text-amber-900', 
    highlight: 'bg-amber-100', 
    fontHead: 'font-cinzel',
    fontBody: 'font-serif font-bold text-[var(--text-xl)] sm:text-[var(--text-2xl)] lg:font-sans lg:font-normal lg:text-lg xl:text-xl lg:leading-relaxed text-slate-950', 
    stampBorder: 'border-amber-900',
    stampText: 'text-amber-900',
    stampOpacity: 'opacity-90',
    btnClass: 'bg-parchment-100 border-4 border-amber-900 text-amber-950 hover:bg-amber-900 hover:text-parchment-100 font-bold tracking-widest text-[var(--text-lg)] sm:text-[var(--text-xl)] py-4 px-8 rounded-lg shadow-lg',
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
      className={`block w-full text-left group mb-4 sm:mb-6 last:mb-0 p-4 sm:p-8 border-2 sm:border-4 transition-all shadow-md rounded-xl ${isVakilMode ? 'bg-black/50 border-gray-600 hover:border-neon-green border-dashed' : 'bg-white/60 border-amber-900/40 hover:border-amber-900 hover:bg-amber-50'}`}
    >
      <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-4">
        <span className={`text-xs sm:text-base font-black px-2 sm:px-4 py-1 sm:py-2 border-2 uppercase tracking-wider rounded ${
          isVakilMode 
           ? 'border-white text-white'
           : (rc.type === 'OVERRULED' ? 'border-red-800 text-red-800 bg-red-50' : 'border-slate-800 text-slate-900 bg-slate-200')
        }`}>
          {rc.type.replace('_', ' ')}
        </span>
        <span className={`text-lg sm:text-xl font-black ${isVakilMode ? 'text-white font-mono' : 'text-slate-900 font-mono'}`}>{rc.year}</span>
      </div>
      <div className={`${isVakilMode ? 'text-white group-hover:text-neon-green font-mono text-xl sm:text-2xl truncate' : 'font-serif text-slate-950 text-2xl sm:text-3xl font-black group-hover:text-amber-800 decoration-2 underline-offset-4'}`}>
        {rc.caseName}
      </div>
    </button>
  );

  return (
    <div className="max-w-[90rem] mx-auto -mt-6 mb-16 sm:mb-32 relative z-10 px-3 sm:px-4 md:px-8 result-card-print" ref={cardRef}>
      
      {/* The Document Container - Rounded, Textured, Shadowed */}
      <div className={`${theme.bgPaper} ${theme.texture} ${theme.paperEffect || ''} paper-texture rounded-2xl sm:rounded-[2rem] shadow-[0_20px_70px_-10px_rgba(0,0,0,0.5)] border-[4px] sm:border-[6px] ${theme.border} overflow-hidden relative group transition-colors duration-500`}>
        
        {/* Deckled Edge Effect */}
        {!isVakilMode && (
          <div className="absolute inset-x-0 top-0 h-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiPjxwYXRoIGQ9Ik0wIDEwIEMyMCAwIDgwIDAgMTAwIDEwIEwgMTAwIDAgTCAwIDAgWiIgZmlsbD0iI2Y1ZjVmNCIvPjwvc3ZnPg==')] bg-repeat-x bg-[length:100px_16px] z-30 opacity-50"></div>
        )}

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
 
        {/* Rusty Stamp - RESPONSIVE & ELEGANT */}
        <div className={`absolute top-4 sm:top-12 right-4 sm:right-12 md:right-20 w-[clamp(6rem,15vw,16rem)] h-[clamp(6rem,15vw,16rem)] border-[clamp(2px,1vw,10px)] ${theme.stampBorder} rounded-full flex items-center justify-center ${theme.stampOpacity} pointer-events-none rotate-[-15deg] z-20 no-print ${isVakilMode ? 'opacity-30' : 'mix-blend-multiply'}`}>
            <div className={`w-full h-full border-[clamp(2px,0.5vw,6px)] border-double ${theme.stampBorder} rounded-full flex flex-col items-center justify-center text-center p-[var(--space-2)] relative`}>
                <div className={`absolute inset-0 border-[clamp(1px,0.2vw,2px)] border-dashed ${theme.stampBorder} rounded-full scale-[0.85]`}></div>
                <span className={`font-black text-[clamp(0.6rem,1.5vw,1.5rem)] ${theme.stampText} tracking-widest ${isVakilMode ? 'font-mono' : 'font-cinzel'}`}>
                  {isVakilMode ? 'TOP SECRET' : 'OFFICIAL'}
                </span>
                <span className={`font-black text-[clamp(0.5rem,1.2vw,1.125rem)] ${theme.stampText} tracking-widest mt-1 uppercase`}>
                   Verified Copy
                </span>
                <div className="flex gap-1 sm:gap-3 my-1 sm:my-4">
                  {[1,2,3,4,5].map(i => <div key={i} className={`w-[2px] sm:w-2 h-[2px] sm:h-2 rounded-full bg-current opacity-100 ${theme.stampText}`}></div>)}
                </div>
                <span className={`font-black text-[clamp(0.4rem,0.8vw,0.75rem)] ${theme.stampText} tracking-[0.3em] uppercase opacity-80`}>
                  Supreme Court of JurisLens
                </span>
                <div className={`absolute -bottom-1 sm:-bottom-2 font-black text-[clamp(0.8rem,2vw,1.875rem)] ${theme.stampText}`}>★</div>
            </div>
        </div>

        {/* Top Bar */}
        <div className={`h-6 w-full ${isVakilMode ? 'bg-gradient-to-r from-gray-800 via-neon-green to-gray-800' : 'bg-gradient-to-r from-amber-900 via-gold-600 to-amber-900'}`}></div>

        {/* Header Section */}
        <div className={`px-[var(--space-4)] sm:px-[var(--space-8)] md:px-[var(--space-16)] py-[var(--space-6)] sm:py-[var(--space-12)] border-b-[4px] sm:border-b-[6px] ${theme.sectionDivider} relative z-10 bg-inherit`}>
           <div className="flex items-center gap-[var(--space-3)] sm:gap-[var(--space-4)] mb-[var(--space-6)] sm:mb-[var(--space-8)]">
             <span className={`${theme.fontHead} text-[var(--text-sm)] sm:text-[var(--text-xl)] font-black tracking-[0.25em] uppercase ${theme.textMain}`}>
                {summary.court} • {summary.year}
             </span>
           </div>
           
           <h2 className={`${isVakilMode ? 'font-mono text-white tracking-tighter' : 'font-display lg:font-sans text-white'} text-[clamp(2rem,6vw,3.5rem)] lg:text-5xl xl:text-6xl font-black leading-[1.1] mb-[var(--space-6)] sm:mb-[var(--space-10)] drop-shadow-2xl bg-navy-950/80 p-8 sm:p-12 rounded-[2rem] border-l-[16px] sm:border-l-[24px] ${theme.border} relative overflow-hidden group`}>
              <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r from-transparent via-gold-500/30 to-transparent"></div>
              {summary.caseName}
           </h2>
           
            <div className="flex flex-wrap items-center gap-[var(--space-4)] sm:gap-[var(--space-6)]">
             <span className={`font-mono text-[var(--text-lg)] sm:text-[var(--text-2xl)] md:text-[var(--text-3xl)] font-black tracking-wide px-[var(--space-4)] sm:px-[var(--space-8)] py-[var(--space-2)] sm:py-[var(--space-4)] rounded-lg shadow-sm ${isVakilMode ? 'border-2 sm:border-4 border-white text-white bg-black' : 'border-2 sm:border-4 border-slate-900 bg-slate-900 text-parchment-50'}`}>
               {summary.citation}
             </span>
             <div className="flex flex-col gap-[var(--space-2)] sm:gap-[var(--space-4)] w-full sm:w-auto">
               <button 
                 onClick={handleDownloadPdf}
                 disabled={isDownloading}
                 className={`font-mono text-[var(--text-sm)] sm:text-[var(--text-xl)] font-black uppercase tracking-widest px-[var(--space-4)] sm:px-[var(--space-8)] py-[var(--space-3)] sm:py-[var(--space-4)] rounded-lg shadow-lg border-2 sm:border-4 transition-all hover:scale-105 active:scale-95 no-print ${isVakilMode ? 'bg-neon-green border-neon-green text-black hover:bg-white hover:border-white' : 'bg-black border-black text-white hover:bg-white hover:text-black'} disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto`}
               >
                 {isDownloading ? 'GENERATING...' : 'DOWNLOAD PDF ↓'}
               </button>
               {downloadError && (
                 <span className="text-red-500 font-bold text-xs sm:text-sm animate-pulse">{downloadError}</span>
               )}
             </div>
             {officialSource && (
                <div className="flex flex-col w-full sm:w-auto">
                  <a 
                    href={officialSource.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`font-mono text-[var(--text-sm)] sm:text-[var(--text-xl)] text-center flex items-center justify-center gap-2 font-black uppercase tracking-widest px-[var(--space-4)] sm:px-[var(--space-8)] py-[var(--space-3)] sm:py-[var(--space-4)] rounded-lg shadow-lg border-2 sm:border-4 transition-all hover:scale-105 active:scale-95 no-print ${isVakilMode ? 'bg-black border-neon-green text-neon-green hover:bg-neon-green hover:text-black' : 'bg-amber-900 border-amber-950 text-white hover:bg-white hover:text-black'} w-full sm:w-auto`}
                  >
                    <span>OFFICIAL PDF</span>
                    <ExternalLink className="w-4 h-4 sm:w-6 sm:h-6" />
                  </a>
                </div>
              )}
              {summary.benchStrength && (
                <span className={`font-mono text-lg sm:text-2xl font-black uppercase tracking-wider px-4 sm:px-6 py-2 sm:py-4 rounded-lg shadow-sm ${isVakilMode ? 'text-white border-2 border-white' : 'text-slate-900 bg-parchment-200 border-2 border-amber-900'}`}>
                   Bench: {summary.benchStrength}
                </span>
             )}
           </div>

           {/* Bench Display */}
           <div className={`mt-[var(--space-8)] sm:mt-[var(--space-12)] pt-[var(--space-6)] sm:pt-[var(--space-10)] border-t-2 sm:border-t-4 ${theme.sectionDivider}`}>
              <h4 className={`text-lg sm:text-xl font-black uppercase tracking-[0.2em] mb-6 sm:mb-8 flex items-center gap-3 sm:gap-4 ${theme.textMain}`}>
                <span className="text-2xl sm:text-3xl">⚖️</span> Honorable Bench
              </h4>
              <div className="flex flex-wrap gap-3 sm:gap-6">
                {summary.judges?.map((judge, i) => (
                  <div key={i} className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-8 py-3 sm:py-5 border-[2px] sm:border-[4px] shadow-sm rounded-lg ${isVakilMode ? 'bg-black border-neon-green text-white' : 'bg-parchment-50 border-amber-900 text-slate-900'}`}>
                    <span className={`text-xl sm:text-2xl opacity-100 font-serif font-black ${isVakilMode ? 'text-neon-green' : 'text-amber-800'}`}>J.</span>
                    <span className={`text-xl sm:text-2xl font-black uppercase ${theme.fontHead}`}>{judge.replace(/^J\.\s*/, '')}</span>
                  </div>
                ))}
              </div>
           </div>
        </div>

        {/* Main Content Body */}
        <div className={`p-[var(--space-4)] sm:p-[var(--space-8)] md:p-[var(--space-16)] relative z-10 ${theme.textBody}`}>
            
            {/* Vakil's Take */}
            {isVakilMode && summary.vakilTake && (
              <div className="mb-[var(--space-10)] sm:mb-[var(--space-16)] p-[var(--space-4)] sm:p-[var(--space-10)] bg-black border-[clamp(2px,1vw,6px)] border-neon-green rounded-xl shadow-[0_0_40px_rgba(57,255,20,0.15)] relative">
                <h3 className="font-mono text-neon-green font-black text-[var(--text-xl)] sm:text-[var(--text-3xl)] mb-[var(--space-4)] sm:mb-[var(--space-6)] flex items-center gap-[var(--space-3)] sm:gap-[var(--space-4)] uppercase tracking-widest border-b-2 border-gray-700 pb-[var(--space-4)]">
                    <span className="text-[var(--text-3xl)] sm:text-[var(--text-5xl)]">⚡</span> VAKIL'S STRATEGY NOTE
                </h3>
                <div className="space-y-[var(--space-4)] sm:space-y-[var(--space-6)]">
                  {summary.vakilTake.split('\n').filter(p => p.trim()).map((paragraph, i) => (
                    <p key={i} className="font-mono text-[var(--text-lg)] sm:text-[var(--text-2xl)] md:text-[var(--text-3xl)] leading-relaxed text-white font-bold">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Procedural History Flowchart */}
            {summary.proceduralHistory && summary.proceduralHistory.length > 0 && (
              <div className="mb-[var(--space-12)] sm:mb-[var(--space-16)]">
                 <h4 className={`${theme.fontHead} ${theme.textMain} text-[var(--text-xl)] sm:text-[var(--text-2xl)] font-black uppercase tracking-[0.2em] mb-[var(--space-8)] sm:mb-[var(--space-10)]`}>Procedural History</h4>
                 <div className="flex flex-col gap-[var(--space-6)] sm:gap-[var(--space-8)]">
                    {summary.proceduralHistory.map((step, i) => (
                      <div key={i} className="flex items-start gap-[var(--space-4)] sm:gap-[var(--space-6)] relative">
                        {/* Connecting Line */}
                        {i < summary.proceduralHistory!.length - 1 && (
                          <div className={`absolute left-[clamp(1.5rem,3.5vw,2rem)] top-[clamp(3.5rem,8vw,4rem)] bottom-[-var(--space-6)] w-[ clamp(2px,1vw,6px) ] ${theme.flowLine} z-0`}></div>
                        )}
                        <div className={`flex-shrink-0 w-[clamp(3rem,8vw,4rem)] h-[clamp(3rem,8vw,4rem)] flex items-center justify-center text-[var(--text-lg)] sm:text-[var(--text-2xl)] font-black border-2 sm:border-4 rounded-full z-10 shadow-lg ${isVakilMode ? 'bg-neon-green text-black border-black' : 'bg-amber-900 text-white border-parchment-50'}`}>
                             {i + 1}
                        </div>
                        <div className={`flex-grow p-[var(--space-4)] sm:p-[var(--space-8)] border-2 sm:border-4 rounded-xl shadow-md ${theme.flowNode}`}>
                           <p className={`text-[var(--text-lg)] sm:text-[var(--text-2xl)] font-black leading-snug ${isVakilMode ? 'text-white' : 'text-slate-900'}`}>{step}</p>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {/* Facts & Narrative */}
            <div className="mb-[var(--space-12)] sm:mb-[var(--space-16)] section-block">
              <h4 className={`${theme.fontHead} ${theme.textMain} text-[var(--text-2xl)] sm:text-[var(--text-3xl)] font-black uppercase tracking-[0.2em] mb-[var(--space-6)] sm:mb-[var(--space-8)] border-b-4 sm:border-b-8 ${theme.sectionDivider} pb-[var(--space-4)]`}>Facts & Narrative</h4>
              <p className={`text-left ${theme.fontBody}`}>{summary.factsAndNarrative}</p>
            </div>

            {/* Legal Duel (Arguments) */}
            {(summary.petitionerArguments || summary.respondentArguments) && (
              <div className="mb-[var(--space-12)] sm:mb-[var(--space-16)] grid grid-cols-1 md:grid-cols-2 gap-[var(--space-6)] sm:gap-[var(--space-12)] section-block">
                 <div className={`p-[var(--space-6)] sm:p-[var(--space-10)] border-l-[clamp(8px,2vw,16px)] rounded-r-xl shadow-md ${isVakilMode ? 'bg-gray-900 border-white' : 'bg-parchment-50 border-slate-800'}`}>
                    <h4 className="text-[var(--text-sm)] sm:text-[var(--text-xl)] uppercase font-black tracking-widest mb-[var(--space-4)] sm:mb-[var(--space-6)] underline decoration-2 sm:decoration-4 decoration-slate-400/50 underline-offset-8">Petitioner's Arguments</h4>
                    <p className={`text-[var(--text-lg)] sm:text-[var(--text-2xl)] lg:font-sans lg:font-normal lg:text-lg xl:text-xl lg:leading-relaxed ${theme.textMain} font-bold lg:font-normal`}>{summary.petitionerArguments || "Not available."}</p>
                 </div>
                 <div className={`p-[var(--space-6)] sm:p-[var(--space-10)] border-l-[clamp(8px,2vw,16px)] rounded-r-xl shadow-md ${isVakilMode ? 'bg-gray-900 border-neon-green' : 'bg-parchment-50 border-amber-800'}`}>
                    <h4 className="text-[var(--text-sm)] sm:text-[var(--text-xl)] uppercase font-black tracking-widest mb-[var(--space-4)] sm:mb-[var(--space-6)] underline decoration-2 sm:decoration-4 decoration-amber-400/50 underline-offset-8">Respondent's Arguments</h4>
                    <p className={`text-[var(--text-lg)] sm:text-[var(--text-2xl)] lg:font-sans lg:font-normal lg:text-lg xl:text-xl lg:leading-relaxed ${theme.textMain} font-bold lg:font-normal`}>{summary.respondentArguments || "Not available."}</p>
                 </div>
              </div>
            )}

            {/* Ratio Decidendi - HIGHLIGHTED */}
            <div className={`mb-[var(--space-10)] sm:mb-[var(--space-16)] relative p-[var(--space-6)] sm:p-[var(--space-12)] border-2 sm:border-[8px] rounded-2xl shadow-xl section-block ${isVakilMode ? 'bg-black border-neon-green border-dashed' : 'bg-parchment-50 border-amber-900'}`}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 sm:px-12 py-2 sm:py-5 bg-black border-2 sm:border-4 border-white rounded-full shadow-lg whitespace-nowrap">
                <span className={`${theme.fontHead} font-black text-white tracking-[0.25em] text-[var(--text-xs)] sm:text-[var(--text-xl)]`}>RATIO DECIDENDI</span>
              </div>
              <p className={`${isVakilMode ? 'font-mono text-white text-[var(--text-xl)] sm:text-[var(--text-3xl)] lg:font-sans lg:text-2xl xl:text-3xl leading-relaxed text-center font-bold' : 'font-display text-[var(--text-2xl)] sm:text-[var(--text-4xl)] lg:font-sans lg:text-3xl xl:text-4xl text-slate-950 font-black lg:font-extrabold italic lg:not-italic text-center leading-relaxed font-semibold'}`}>
                "{summary.ratioDecidendi}"
              </p>
            </div>

            {/* Held */}
            <div className={`p-[var(--space-6)] sm:p-[var(--space-12)] mb-[var(--space-12)] sm:mb-[var(--space-16)] rounded-2xl shadow-lg border-l-[clamp(8px,2vw,16px)] section-block ${isVakilMode ? 'bg-gray-900 border-neon-green' : 'bg-amber-100 border-amber-900'}`}>
               <h4 className={`${theme.fontHead} text-[var(--text-xl)] sm:text-[var(--text-3xl)] font-black mb-[var(--space-4)] sm:mb-[var(--space-8)] uppercase tracking-widest ${theme.textMain}`}>JUDGMENT HELD:</h4>
               <p className={`${theme.fontBody} font-black lg:font-bold`}>{summary.decision}</p>
            </div>

            {/* IRAC - UNIFIED FLOW */}
            {summary.irac && (
              <div className={`mb-[var(--space-12)] sm:mb-[var(--space-16)] rounded-2xl shadow-2xl overflow-hidden border-[var(--space-1)] sm:border-[var(--space-2)] section-block ${isVakilMode ? 'bg-black border-gray-600' : 'bg-parchment-50 border-amber-900'}`}>
                <div className={`p-[var(--space-4)] sm:p-[var(--space-10)] border-b-2 sm:border-b-8 ${theme.sectionDivider} ${isVakilMode ? 'bg-gray-900' : 'bg-amber-100'}`}>
                  <h3 className={`${theme.fontHead} text-[var(--text-3xl)] sm:text-[var(--text-5xl)] font-black tracking-widest flex items-center gap-[var(--space-4)] sm:gap-[var(--space-6)] ${theme.textMain}`}><span className="text-[var(--text-4xl)] sm:text-[var(--text-6xl)]">⚖️</span> IRAC ANALYSIS</h3>
                </div>
                <div className="p-[var(--space-4)] sm:p-[var(--space-12)] space-y-[var(--space-8)] sm:space-y-[var(--space-16)]">
                  {/* Issue */}
                  <div className="flex flex-col md:flex-row gap-[var(--space-4)] sm:gap-[var(--space-10)]">
                     <div className={`w-12 h-12 sm:w-24 sm:h-24 shrink-0 flex items-center justify-center font-black text-[var(--text-xl)] sm:text-4xl border-2 sm:border-4 rounded-full shadow-md ${isVakilMode ? 'bg-black text-neon-green border-neon-green' : 'bg-amber-900 text-parchment-50 border-amber-700'}`}>I</div>
                     <div className="flex-1">
                       <h4 className="font-black text-[var(--text-sm)] sm:text-[var(--text-2xl)] mb-[var(--space-2)] sm:mb-[var(--space-4)] uppercase tracking-wider underline offset-8">ISSUE</h4>
                       <p className={`leading-relaxed text-left ${isVakilMode ? 'font-mono text-white text-[var(--text-sm)] sm:text-[var(--text-2xl)] lg:font-sans lg:text-lg xl:text-xl font-bold lg:font-normal' : 'font-serif font-bold text-[var(--text-lg)] sm:text-[var(--text-4xl)] lg:font-sans lg:text-lg xl:text-xl text-slate-950 lg:font-normal'}`}>{summary.irac.issue}</p>
                     </div>
                  </div>
                  {/* Rule */}
                  <div className="flex flex-col md:flex-row gap-[var(--space-4)] sm:gap-[var(--space-10)]">
                     <div className={`w-12 h-12 sm:w-24 sm:h-24 shrink-0 flex items-center justify-center font-black text-[var(--text-xl)] sm:text-4xl border-2 sm:border-4 rounded-full shadow-md ${isVakilMode ? 'bg-black text-neon-green border-neon-green' : 'bg-amber-900 text-parchment-50 border-amber-700'}`}>R</div>
                     <div className="flex-1">
                       <h4 className="font-black text-[var(--text-sm)] sm:text-[var(--text-2xl)] mb-[var(--space-2)] sm:mb-[var(--space-4)] uppercase tracking-wider underline offset-8">RULE</h4>
                       <p className={`leading-loose text-left ${isVakilMode ? 'font-mono text-white text-[var(--text-sm)] sm:text-[var(--text-2xl)] lg:font-sans lg:text-lg xl:text-xl font-bold lg:font-normal' : 'font-serif font-bold text-[var(--text-base)] sm:text-[var(--text-3xl)] lg:font-sans lg:text-lg xl:text-xl text-slate-950 lg:font-normal'}`}>{summary.irac.rule}</p>
                     </div>
                  </div>
                  {/* Analysis */}
                  <div className="flex flex-col md:flex-row gap-[var(--space-4)] sm:gap-[var(--space-10)]">
                     <div className={`w-12 h-12 sm:w-24 sm:h-24 shrink-0 flex items-center justify-center font-black text-[var(--text-xl)] sm:text-4xl border-2 sm:border-4 rounded-full shadow-md ${isVakilMode ? 'bg-black text-neon-green border-neon-green' : 'bg-amber-900 text-parchment-50 border-amber-700'}`}>A</div>
                     <div className="flex-1">
                       <h4 className="font-black text-[var(--text-sm)] sm:text-[var(--text-2xl)] mb-[var(--space-2)] sm:mb-[var(--space-4)] uppercase tracking-wider underline offset-8">ANALYSIS</h4>
                       <p className={`leading-loose text-left ${isVakilMode ? 'font-mono text-white text-[var(--text-sm)] sm:text-[var(--text-2xl)] lg:font-sans lg:text-lg xl:text-xl font-bold lg:font-normal' : 'font-serif font-bold text-[var(--text-base)] sm:text-[var(--text-3xl)] lg:font-sans lg:text-lg xl:text-xl text-slate-950 lg:font-normal'}`}>{summary.irac.analysis}</p>
                     </div>
                  </div>
                  {/* Conclusion */}
                  <div className={`flex flex-col md:flex-row gap-[var(--space-4)] sm:gap-[var(--space-10)] p-[var(--space-4)] sm:p-[var(--space-10)] border-2 sm:border-4 rounded-xl ${isVakilMode ? 'border-neon-green bg-gray-900' : 'border-amber-900 bg-amber-50'}`}>
                     <div className={`w-12 h-12 sm:w-24 sm:h-24 shrink-0 flex items-center justify-center font-black text-[var(--text-xl)] sm:text-4xl rounded-lg shadow-md ${isVakilMode ? 'bg-neon-green text-black' : 'bg-amber-900 text-white'}`}>C</div>
                     <div className="flex-1">
                       <h4 className="font-black text-[var(--text-sm)] sm:text-[var(--text-2xl)] mb-[var(--space-2)] sm:mb-[var(--space-4)] uppercase tracking-wider underline offset-8">CONCLUSION</h4>
                       <p className={`font-black text-[var(--text-lg)] sm:text-[var(--text-3xl)] md:text-[var(--text-5xl)] lg:font-sans lg:text-2xl xl:text-3xl leading-relaxed ${isVakilMode ? 'text-neon-green lg:font-sans' : 'text-slate-950 lg:font-sans font-black'}`}>{summary.irac.conclusion}</p>
                     </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Reasoning Note */}
            {summary.reasoningNote && (
              <div className={`mb-24 p-12 border-4 rounded-xl shadow-md ${isVakilMode ? 'bg-black border-gray-700' : 'bg-parchment-50 border-amber-900/30'}`}>
                <h4 className={`${theme.fontHead} ${theme.textMain} text-xl font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-4`}>
                  <Info className="w-6 h-6 text-blue-500" /> AI Reasoning Note
                </h4>
                <p className={`text-xl md:text-2xl italic ${theme.textMuted} font-bold`}>{summary.reasoningNote}</p>
              </div>
            )}

            {/* Legal Trajectory */}
            <div className={`border-t-[clamp(8px,2vw,16px)] p-[var(--space-6)] sm:p-[var(--space-16)] mb-[var(--space-12)] sm:mb-[var(--space-24)] rounded-b-[2rem] section-block ${isVakilMode ? 'bg-black border-gray-700' : 'bg-parchment-100 border-amber-900'}`}>
              <h3 className={`${theme.fontHead} text-center text-[var(--text-2xl)] sm:text-[var(--text-5xl)] mb-[var(--space-8)] sm:mb-[var(--space-16)] tracking-[0.2em] font-black uppercase ${theme.textMain}`}>Legal Trajectory</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--space-8)] sm:gap-[var(--space-20)]">
                <div>
                  <h4 className={`text-[var(--text-lg)] sm:text-[var(--text-2xl)] font-black tracking-widest mb-[var(--space-6)] sm:mb-[var(--space-10)] pb-[var(--space-2)] sm:pb-[var(--space-4)] border-b-4 sm:border-b-8 ${theme.sectionDivider} ${theme.textMain}`}>PRECEDENTS</h4>
                  <div className="space-y-[var(--space-4)] sm:space-y-[var(--space-8)]">{summary.precedents?.length > 0 ? summary.precedents.map((p, i) => <div key={i}>{renderRelatedCase(p)}</div>) : <p className="text-[var(--text-xl)] sm:text-[var(--text-3xl)] italic font-bold">No precedents listed.</p>}</div>
                </div>
                <div>
                  <h4 className={`text-[var(--text-lg)] sm:text-[var(--text-2xl)] font-black tracking-widest mb-[var(--space-6)] sm:mb-[var(--space-10)] pb-[var(--space-2)] sm:pb-[var(--space-4)] border-b-4 sm:border-b-8 ${theme.sectionDivider} ${theme.textMain}`}>SUBSEQUENT DEVELOPMENTS</h4>
                  <div className="space-y-[var(--space-4)] sm:space-y-[var(--space-8)]">{summary.subsequentDevelopments?.length > 0 ? summary.subsequentDevelopments.map((p, i) => <div key={i}>{renderRelatedCase(p)}</div>) : <p className="text-[var(--text-xl)] sm:text-[var(--text-3xl)] italic font-bold">No developments listed.</p>}</div>
                </div>
              </div>
            </div>

            {/* BOTTOM SECTION: Statistics & Sources */}
            <div className={`mt-32 pt-24 border-t-[8px] ${theme.sectionDivider}`}>
                
                {/* 1. Statistics & Infographics */}
                {summary.stats && (
                   <div className="mb-16 sm:mb-32 section-block">
                      <h3 className={`${theme.fontHead} text-center text-5xl font-black mb-12 sm:mb-24 tracking-widest uppercase ${theme.textMain}`}>Analytics</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-16 items-start">
                          
                          {/* INFOGRAPHIC 1: Sentiment & Impact */}
                          <div className={`flex flex-col items-center p-6 sm:p-12 border-4 sm:border-8 rounded-2xl h-[25rem] sm:h-[35rem] shadow-xl ${isVakilMode ? 'bg-gray-900 border-gray-600' : 'bg-parchment-50 border-amber-900'}`}>
                             <h4 className={`text-lg sm:text-2xl uppercase font-black tracking-widest mb-6 sm:mb-10 ${theme.textMain}`}>Impact Score</h4>
                             <div className={`w-full flex-1 flex flex-col items-center justify-center`}>
                                <div className="relative w-full h-full flex items-center justify-center">
                                    {/* Donut Chart Simulation with Border Radius */}
                                    <div className={`w-40 h-40 sm:w-64 sm:h-64 rounded-full border-[12px] sm:border-[20px] flex items-center justify-center ${isVakilMode ? 'border-neon-green' : 'border-amber-600'}`}>
                                        <span className={`font-black text-5xl sm:text-8xl ${theme.textMain}`}>{summary.stats.impactScore}</span>
                                    </div>
                                </div>
                                <span className={`text-lg sm:text-2xl font-black mt-4 sm:mt-6 uppercase ${theme.textMain}`}>OUT OF 100</span>
                             </div>
                          </div>

                          {/* INFOGRAPHIC 2: Trend - Simplified for visibility */}
                          <div className={`flex flex-col p-6 sm:p-12 border-4 sm:border-8 rounded-2xl h-[25rem] sm:h-[35rem] shadow-xl ${isVakilMode ? 'bg-gray-900 border-gray-600' : 'bg-parchment-50 border-amber-900'}`}>
                             <h4 className={`text-lg sm:text-2xl uppercase font-black tracking-widest mb-6 sm:mb-10 text-center ${theme.textMain}`}>Citation Timeline</h4>
                             {summary.stats.citationTrend ? (
                               <div className="flex items-end justify-between h-full gap-2 sm:gap-4 mt-auto w-full pb-4">
                                  {summary.stats.citationTrend.map((item, idx) => (
                                    <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end">
                                      <div 
                                        className={`w-full rounded-t-lg border-2 ${theme.graphBar} border-black/20`} 
                                        style={{ height: `${item.count}%`, minHeight: '10px' }}
                                      ></div>
                                      <span className={`text-sm sm:text-xl mt-4 sm:mt-6 font-mono rotate-[-90deg] origin-center font-black ${theme.textMain}`}>{item.period}</span>
                                    </div>
                                  ))}
                               </div>
                             ) : (
                               <div className="flex items-center justify-center h-full text-2xl sm:text-3xl font-bold italic">No Data</div>
                             )}
                          </div>

                          {/* INFOGRAPHIC 3: Bench Split - Simplified */}
                          <div className={`flex flex-col p-6 sm:p-12 border-4 sm:border-8 rounded-2xl h-[25rem] sm:h-[35rem] shadow-xl ${isVakilMode ? 'bg-gray-900 border-gray-600' : 'bg-parchment-50 border-amber-900'}`}>
                             <h4 className={`text-lg sm:text-2xl uppercase font-black tracking-widest mb-6 sm:mb-10 text-center ${theme.textMain}`}>Judicial Split</h4>
                             {summary.stats.benchSplit ? (
                               <div className="flex flex-col items-center justify-center h-full gap-6 sm:gap-12 w-full">
                                  <div className="text-center w-full">
                                    <span className="text-5xl sm:text-8xl font-black text-green-600 block">{summary.stats.benchSplit.majority}</span>
                                    <span className={`text-lg sm:text-xl uppercase tracking-widest font-black ${theme.textMain}`}>Majority</span>
                                  </div>
                                  <div className={`h-1 w-full ${theme.bgMain} border-t-2 sm:border-t-4 ${theme.sectionDivider}`}></div>
                                  <div className="text-center w-full">
                                    <span className="text-5xl sm:text-8xl font-black text-red-600 block">{summary.stats.benchSplit.dissent}</span>
                                    <span className={`text-lg sm:text-xl uppercase tracking-widest font-black ${theme.textMain}`}>Dissent</span>
                                  </div>
                               </div>
                             ) : (
                               <div className="flex items-center justify-center h-full text-2xl sm:text-3xl font-bold italic">Unanimous</div>
                             )}
                          </div>
                      </div>
                      
                      {/* Concept Cloud */}
                      {summary.stats.legalConcepts && (
                        <div className="mt-12 sm:mt-20 text-center">
                           <h4 className={`text-lg sm:text-2xl uppercase font-black tracking-widest mb-6 sm:mb-10 ${theme.textMain}`}>Key Legal Concepts</h4>
                           <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
                             {summary.stats.legalConcepts.map((concept, idx) => (
                               <span key={idx} className={`px-4 sm:px-8 py-2 sm:py-4 text-xl sm:text-3xl border-2 sm:border-4 rounded-full ${theme.conceptPill}`}>
                                 {concept}
                               </span>
                             ))}
                           </div>
                        </div>
                      )}

                   </div>
                )}

                {/* 2. Source Links */}
                <div className={`p-6 sm:p-16 border-[4px] sm:border-[8px] rounded-2xl section-block ${isVakilMode ? 'bg-black border-gray-600' : 'bg-parchment-50 border-amber-900'}`}>
                    <h3 className={`${theme.fontHead} text-center text-2xl sm:text-4xl font-black mb-8 sm:mb-12 tracking-widest uppercase ${theme.textMain}`}>Sources & Direct Downloads</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-10">
                        {summary.sources && summary.sources.map((source, idx) => {
                           const isDirectPdf = source.type === 'DIRECT PDF DOWNLOAD' || source.name.toLowerCase().includes('pdf');
                           return (
                            <a 
                              key={idx} 
                              href={source.url} 
                              target="_blank" 
                              rel="noreferrer"
                              className={`flex flex-col items-center justify-center p-6 sm:p-10 border-2 sm:border-4 h-40 sm:h-56 rounded-xl shadow-lg transition-all hover:-translate-y-2 relative overflow-hidden group ${isVakilMode ? 'bg-gray-900 border-white hover:bg-neon-green hover:text-black hover:border-neon-green text-white' : 'bg-white border-amber-900 hover:bg-amber-900 hover:text-white text-slate-900'} ${isDirectPdf ? 'ring-4 ring-emerald-500/30' : ''}`}
                            >
                               {isDirectPdf && (
                                 <div className="absolute top-0 right-0 bg-emerald-500 text-white px-2 sm:px-4 py-1 text-[10px] sm:text-xs font-black uppercase tracking-tighter rounded-bl-lg animate-pulse">
                                   DIRECT PDF
                                 </div>
                               )}
                               <div className="mb-2 sm:mb-4">
                                 {isDirectPdf ? <FileDown className="w-6 h-6 sm:w-10 sm:h-10" /> : <ExternalLink className="w-6 h-6 sm:w-10 sm:h-10" />}
                               </div>
                               <span className="text-lg sm:text-xl font-black uppercase text-center mb-1 sm:mb-2">
                                 {source.type}
                               </span>
                               <span className="text-sm sm:text-lg text-center leading-tight font-bold opacity-80 line-clamp-1">
                                 {source.name}
                               </span>
                               <span className="mt-4 sm:mt-6 text-xs sm:text-sm uppercase font-black border-b-2 border-current">
                                 {isDirectPdf ? 'DOWNLOAD NOW' : 'GO TO LINK'} &rarr;
                               </span>
                            </a>
                           );
                        })}
                    </div>
                </div>

                {/* AI Research Disclaimer */}
                <div className={`mt-16 sm:mt-24 pt-8 sm:pt-12 border-t-[4px] ${theme.sectionDivider} opacity-60 no-print`}>
                    <div className="flex flex-col md:flex-row gap-6 sm:gap-10 items-start">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 ${theme.stampBorder}`}>
                             <span className={`text-xl sm:text-2xl font-black ${theme.stampText}`}>!</span>
                        </div>
                        <div>
                            <h4 className={`${theme.fontHead} text-lg sm:text-xl font-black tracking-widest ${theme.textMain} mb-4 uppercase`}>
                                ARCHIVE STABILITY & VERIFICATION NOTICE
                            </h4>
                            <p className={`${theme.fontBody} text-base sm:text-lg leading-relaxed ${theme.textMuted} italic !text-base !leading-normal`}>
                                JurisLens is an AI-enhanced research instrument. While we utilize elite neural reasoning to extract ratio decidendi and subsequent developments, this output is generated through algorithmic synthesis of public records. Legal professionals must perform independent verification of citations and holdings through primary official gazettes. JurisLens is a guide, not a final legal authority.
                            </p>
                            <div className={`mt-6 inline-flex items-center gap-4 text-xs sm:text-sm font-cinzel font-black tracking-widest ${theme.textMain}`}>
                                <span>STATUS: VERIFIED ARCHIVE</span>
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

      </div>
    </div>
  );
};