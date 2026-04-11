import React from 'react';

/**
 * RenderText — Parses a simple markdown-like string and renders it
 * with bold (**text**) and italic (_text_) support.
 */
function RenderText({ text }) {
    const lines = text.split('\n');
    return (
        <div className="space-y-0.5">
            {lines.map((line, i) => {
                const parts = line.split(/(\*\*[^*]+\*\*|_[^_]+_)/g);
                const rendered = parts.map((part, j) => {
                    if (part.startsWith('**') && part.endsWith('**'))
                        return (
                            <strong key={j} className="font-black italic text-[#38BDF8] uppercase leading-none tracking-widest text-[11px]">
                                {part.slice(2, -2)}
                            </strong>
                        );
                    if (part.startsWith('_') && part.endsWith('_'))
                        return <em key={j} className="text-slate-400 not-italic">{part.slice(1, -1)}</em>;
                    return <span key={j}>{part}</span>;
                });
                return (
                    <p key={i} className={`text-xs ${line.trim() === '' ? 'h-2' : (line.startsWith('•') ? 'pl-2 border-l-2 border-[#38BDF8]/20 ml-1' : '')}`}>
                        {rendered}
                    </p>
                );
            })}
        </div>
    );
}

/**
 * ChatHeader — Top bar of the chatbot window.
 * Shows the bot avatar, name, online status, and a close button.
 */
export default function ChatHeader({ onClose }) {
    return (
        <div className="bg-white px-6 py-5 flex items-center justify-between border-b border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#38BDF8]/10 rounded-full blur-3xl -mr-10 -mt-10" />

            <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 bg-[#38BDF8]/10 border border-[#38BDF8]/20 rounded-2xl flex items-center justify-center font-black text-[#38BDF8] text-xl">
                    M
                </div>
                <div>
                    <h3 className="font-['Permanent_Marker'] italic uppercase tracking-tighter leading-none text-slate-900 text-xl">
                        Mandala Bot
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-[9px] text-emerald-500 font-black uppercase tracking-[0.2em]">
                            Online Sekarang
                        </span>
                    </div>
                </div>
            </div>

            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all z-20 pointer-events-auto"
                aria-label="Tutup chatbot"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                </svg>
            </button>
        </div>
    );
}

export { RenderText };
