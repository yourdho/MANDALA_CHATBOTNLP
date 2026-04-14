import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhotoIcon } from '@heroicons/react/24/outline';

export default function AutoCarousel({ images = [], name = 'Facility' }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const timeoutRef = useRef(null);

    const resetTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    useEffect(() => {
        if (!images || images.length <= 1 || isFullScreen) return;
        resetTimeout();
        timeoutRef.current = setTimeout(() => {
            setDirection(1);
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 5000);

        return () => resetTimeout();
    }, [currentIndex, images, isFullScreen]);

    const handlePrev = (e) => {
        e?.stopPropagation();
        setDirection(-1);
        setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    };

    const handleNext = (e) => {
        e?.stopPropagation();
        setDirection(1);
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const handleDotClick = (e, index) => {
        e?.stopPropagation();
        setDirection(index > currentIndex ? 1 : -1);
        setCurrentIndex(index);
    };

    if (!images || images.length === 0) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <PhotoIcon className="w-12 h-12 text-[#38BDF8] opacity-20 mb-2" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Gambar Belum Tersedia</span>
            </div>
        );
    }

    const variants = {
        enter: (direction) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
            scale: 1.1
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.95
        })
    };

    return (
        <>
            <div
                className="relative w-full h-full overflow-hidden bg-slate-950 group cursor-zoom-in"
                onClick={() => setIsFullScreen(true)}
            >
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.4 },
                            scale: { duration: 0.6 }
                        }}
                        className="absolute inset-0"
                    >
                        {typeof images[currentIndex] === 'string' && (images[currentIndex].endsWith('.mp4') || images[currentIndex].endsWith('.webm')) ? (
                            <video src={images[currentIndex]} autoPlay loop muted playsInline className="w-full h-full object-cover" onMouseOver={(e) => e.target.muted = true} />
                        ) : (
                            <img
                                src={images[currentIndex]}
                                alt={`${name} ${currentIndex + 1}`}
                                className="w-full h-full object-cover"
                            />
                        )}
                    </motion.div>
                </AnimatePresence>

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20 opacity-60 pointer-events-none z-10" />

                {images.length > 1 && (
                    <>
                        <button
                            onClick={handlePrev}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center rounded-2xl bg-black/30 backdrop-blur-xl border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-[#38BDF8] hover:text-slate-950 hover:scale-110 active:scale-95"
                        >
                            <span className="text-2xl font-black italic">←</span>
                        </button>
                        <button
                            onClick={handleNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center rounded-2xl bg-black/30 backdrop-blur-xl border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-[#38BDF8] hover:text-slate-950 hover:scale-110 active:scale-95"
                        >
                            <span className="text-2xl font-black italic">→</span>
                        </button>
                    </>
                )}



                <div className="absolute top-6 right-6 bg-slate-950/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 z-20 pointer-events-none group-hover:bg-[#38BDF8]/20 group-hover:border-[#38BDF8]/40 transition-all">
                    <span className="text-white font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#38BDF8] rounded-full animate-pulse" />
                        {currentIndex + 1} <span className="opacity-30">/</span> {images.length}
                    </span>
                </div>

                {/* Click Hint */}
                <div className="absolute top-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                    <div className="bg-slate-950/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2">
                        <span className="text-white font-black text-[8px] uppercase tracking-widest">Klik untuk Memperbesar</span>
                    </div>
                </div>
            </div>

            {/* Fullscreen Modal / Lightbox */}
            <AnimatePresence>
                {isFullScreen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[999] bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-10"
                        onClick={() => setIsFullScreen(false)}
                    >
                        <motion.button
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="absolute top-6 right-6 w-14 h-14 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white text-white hover:text-slate-900 transition-all font-black text-xl z-[1001]"
                            onClick={() => setIsFullScreen(false)}
                        >
                            ✕
                        </motion.button>

                        <div className="relative w-full max-w-6xl aspect-video md:aspect-auto md:h-[80vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>
                            <AnimatePresence initial={false} custom={direction} mode="wait">
                                <motion.div
                                    key={currentIndex}
                                    custom={direction}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.1 }}
                                    transition={{ duration: 0.3 }}
                                    className="w-full h-full flex items-center justify-center"
                                >
                                    {typeof images[currentIndex] === 'string' && (images[currentIndex].endsWith('.mp4') || images[currentIndex].endsWith('.webm')) ? (
                                        <video src={images[currentIndex]} autoPlay loop muted playsInline className="max-w-full max-h-full rounded-3xl shadow-2xl" onMouseOver={(e) => e.target.muted = true} />
                                    ) : (
                                        <img
                                            src={images[currentIndex]}
                                            alt={`${name} Fullscreen`}
                                            className="max-w-full max-h-full rounded-3xl object-contain shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                                        />
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            {/* Fullscreen Controls */}
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={handlePrev}
                                        className="absolute left-0 md:-left-20 top-1/2 -translate-y-1/2 w-16 h-16 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white hover:bg-[#38BDF8] hover:text-slate-900 transition-all text-2xl font-black italic active:scale-95"
                                    >
                                        ←
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        className="absolute right-0 md:-right-20 top-1/2 -translate-y-1/2 w-16 h-16 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white hover:bg-[#38BDF8] hover:text-slate-900 transition-all text-2xl font-black italic active:scale-95"
                                    >
                                        →
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Fullscreen Caption/Info */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="mt-8 text-center space-y-2"
                        >
                            <h2 className="text-white font-black italic text-2xl uppercase tracking-tighter">{name}</h2>
                            <p className="text-[#38BDF8] font-bold text-xs uppercase tracking-[0.4em]">Tampilan Panorama • {currentIndex + 1} / {images.length}</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

