import React from 'react';
import { motion } from 'framer-motion';

export default function QuickReplyChips({ chips, onAction, align = 'start' }) {
    if (!chips || chips.length === 0) return null;

    return (
        <div className={`flex flex-wrap gap-2 mt-3 ${align === 'end' ? 'justify-end' : 'justify-start pl-8'}`}>
            {chips.map((chip, idx) => (
                <motion.button
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onAction(chip.msg)}
                    className="bg-white hover:bg-[#38BDF8] hover:text-white text-slate-600 border border-slate-200 font-semibold px-4 py-2 rounded-xl text-[11px] shadow-sm transition-all whitespace-nowrap active:scale-95"
                >
                    {chip.label}
                </motion.button>
            ))}
        </div>
    );
}
