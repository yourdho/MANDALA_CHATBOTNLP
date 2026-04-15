import React from 'react';
import { motion } from 'framer-motion';

/**
 * ChatInput — Premium polished input area.
 */
export default function ChatInput({ value, onChange, onSubmit, isLoading, isRedirecting }) {
    return (
        <div className="p-4 bg-white/80 backdrop-blur-md border-t border-slate-200/50 z-10 relative">
            <form
                onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
                className="relative flex items-center bg-slate-100/80 border border-slate-200/80 hover:border-sky-300/50 transition-colors rounded-[1.25rem] p-1.5 focus-within:bg-white focus-within:ring-4 focus-within:ring-sky-100 focus-within:border-sky-400"
            >
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={isRedirecting ? 'Menyiapkan halaman...' : 'Ketik pesanan atau pertanyaan...'}
                    disabled={isRedirecting || isLoading}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-[13px] font-medium placeholder:text-slate-400 text-slate-800 outline-none py-2 px-4 disabled:opacity-60"
                    aria-label="Tanya Mandala"
                    autoComplete="off"
                />
                
                <motion.button
                    type="submit"
                    whileHover={value.trim() && !isLoading ? { scale: 1.05 } : {}}
                    whileTap={value.trim() && !isLoading ? { scale: 0.95 } : {}}
                    disabled={!value.trim() || isLoading || isRedirecting}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        value.trim() && !isLoading && !isRedirecting
                            ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30 hover:bg-sky-600'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                    aria-label="Kirim"
                >
                    {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" className="-ml-0.5 mt-0.5">
                            <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z" />
                        </svg>
                    )}
                </motion.button>
            </form>
            
            <div className="text-center mt-2">
                <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Powered by Mandala NLP</span>
            </div>
        </div>
    );
}
