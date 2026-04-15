import React from 'react';
import { motion } from 'framer-motion';

export default function ChatHeader({ onClose }) {
    return (
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/60 bg-white/80 backdrop-blur-md relative z-10">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-white shadow-sm flex items-center justify-center text-white overflow-hidden">
                        <span className="font-extrabold italic text-lg tracking-tighter">M</span>
                    </div>
                    {/* Heartbeat Status */}
                    <span className="absolute bottom-0 right-0 flex w-3 h-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full w-3 h-3 bg-emerald-500 border border-white"></span>
                    </span>
                </div>
                <div className="flex flex-col">
                    <h2 className="font-bold text-slate-800 text-sm leading-tight tracking-tight">Mandala Assistant</h2>
                    <span className="text-[11px] font-medium text-emerald-500 mt-0.5 tracking-wide">Online & Ready</span>
                </div>
            </div>
            
            <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                aria-label="Tutup chatbot"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                </svg>
            </motion.button>
        </div>
    );
}
