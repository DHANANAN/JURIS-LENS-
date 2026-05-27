import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HistoryItem } from '../types';
import { X, Clock, Trash2, Search, ExternalLink } from 'lucide-react';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  isOpen,
  onClose,
  history,
  onSelect,
  onClear
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] no-print"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-navy-950 border-l border-white/10 z-[101] shadow-2xl overflow-hidden flex flex-col no-print"
          >
            {/* Header */}
            <div className="p-[var(--space-4)] sm:p-[var(--space-6)] border-b border-white/10 flex items-center justify-between bg-navy-900/50">
              <div className="flex items-center gap-[var(--space-2)] sm:gap-[var(--space-3)]">
                <Clock className="w-[var(--text-xl)] h-[var(--text-xl)] sm:w-6 sm:h-6 text-gold-500" />
                <h2 className="text-[var(--text-lg)] sm:text-2xl font-cinzel font-black tracking-widest text-parchment-50">Archive</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-[var(--space-2)] hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
              >
                <X className="w-[var(--text-lg)] h-[var(--text-lg)] sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* List */}
            <div className="flex-grow overflow-y-auto p-[var(--space-2)] sm:p-4 custom-scrollbar">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 px-[var(--space-6)]">
                  <Search className="w-[var(--text-5xl)] h-[var(--text-5xl)] sm:w-16 sm:h-16 mb-[var(--space-4)]" />
                  <p className="font-serif text-[var(--text-sm)] sm:text-lg italic">Your legal journey has just begun. No records found in the archive.</p>
                </div>
              ) : (
                <div className="space-y-[var(--space-2)] sm:space-y-3">
                  {history.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <button
                        onClick={() => {
                          onSelect(item);
                          onClose();
                        }}
                        className="w-full text-left p-[var(--space-3)] sm:p-4 rounded-xl bg-white/5 border border-white/5 hover:border-gold-500/50 hover:bg-white/10 transition-all group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-[var(--space-2)] opacity-0 group-hover:opacity-100 transition-opacity">
                           <ExternalLink className="w-[var(--text-xs)] h-[var(--text-xs)] sm:w-4 sm:h-4 text-gold-500" />
                        </div>
                        <div className="flex flex-col gap-[var(--space-1)] pr-[var(--space-4)]">
                          <span className="text-parchment-100 font-serif font-bold text-[var(--text-sm)] sm:text-lg leading-tight line-clamp-2 group-hover:text-gold-400 transition-colors">
                            {item.query}
                          </span>
                          <div className="flex items-center gap-[var(--space-2)] mt-[var(--space-1)]">
                            <span className="text-[clamp(0.5rem,1.5vw,0.65rem)] text-gold-500/80 font-cinzel font-bold tracking-widest bg-gold-500/10 px-[var(--space-1)] py-0.5 rounded">
                              {item.jurisdiction}
                            </span>
                            <span className="text-[clamp(0.5rem,1.5vw,0.65rem)] text-slate-500 font-mono">
                              {new Date(item.timestamp).toLocaleString(undefined, { 
                                month: 'short', 
                                day: 'numeric', 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          <span className="text-[clamp(0.5rem,1.5vw,0.6rem)] text-slate-400 font-cinzel tracking-wider mt-[var(--space-1)] opacity-60">
                            MODE: {item.mode.replace('_', ' ')}
                          </span>
                        </div>
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {history.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-navy-900/50">
                <button
                  onClick={onClear}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all font-cinzel font-bold tracking-widest text-xs"
                >
                  <Trash2 className="w-4 h-4" /> CLEAR ALL HISTORY
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
