import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AutoCarousel({ images = [], name = 'Facility' }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!images || images.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 4000); // 4 seconds auto slide

        return () => clearInterval(interval);
    }, [images]);

    if (!images || images.length === 0) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 border border-slate-200">
                <span className="text-4xl opacity-20 block mb-2">📸</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Gambar Belum Tersedia</span>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full overflow-hidden bg-slate-900 group">
            <AnimatePresence initial={false} mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0"
                >
                    {images[currentIndex].endsWith('.mp4') ? (
                        <video src={images[currentIndex]} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                    ) : (
                        <img
                            src={images[currentIndex]}
                            alt={`${name} ${currentIndex + 1}`}
                            className="w-full h-full object-cover"
                        />
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-slate-900/20 opacity-80 pointer-events-none transition-opacity duration-500" />

            {/* Indicators */}
            {images.length > 1 && (
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20 pointer-events-none">
                    {images.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1.5 rounded-full backdrop-blur-md transition-all duration-500 ${idx === currentIndex ? 'w-8 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'w-2 bg-white/40'}`}
                        />
                    ))}
                </div>
            )}

            {/* Tag/Info Overlay Top */}
            <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 shadow-lg z-20 pointer-events-none">
                <span className="text-white font-black text-[9px] uppercase tracking-[0.2em] shadow-sm">
                    {currentIndex + 1} / {images.length} • Auto Slide
                </span>
            </div>
        </div>
    );
}
