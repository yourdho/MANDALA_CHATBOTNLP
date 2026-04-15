import React from 'react';
import { motion } from 'framer-motion';

export default function TypingIndicator() {
    return (
        <div className="flex items-center space-x-1.5 p-4 bg-slate-100 rounded-2xl rounded-tl-none w-fit self-start shadow-sm border border-slate-200/50">
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className="w-2.5 h-2.5 bg-sky-400 rounded-full"
                    animate={{ y: [0, -6, 0] }}
                    transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        repeatType: 'loop',
                        ease: 'easeInOut',
                        delay: i * 0.15,
                    }}
                />
            ))}
        </div>
    );
}
