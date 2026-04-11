import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

export default function GuestLayout({ children }) {
    useEffect(() => {
        let touchStartX = 0;
        let touchStartY = 0;

        const handleTouchStart = (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        };

        const handleTouchEnd = (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const dx = touchEndX - touchStartX;
            const dy = touchEndY - touchStartY;

            // Detect horizontal swipe from left side (swipe right)
            if (dx > 60 && Math.abs(dx) > Math.abs(dy) * 1.2 && touchStartX < 100) {
                window.history.back();
            }
        };

        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchend', handleTouchEnd);
        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, []);
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-50 font-sans relative overflow-x-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-[#38BDF8]/10 rounded-full blur-[80px] sm:blur-[100px] -mr-32 -mt-32 sm:-mr-64 sm:-mt-64" />
            <div className="absolute bottom-0 left-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-[#FACC15]/10 rounded-full blur-[80px] sm:blur-[100px] -ml-32 -mb-32 sm:-ml-64 sm:-mb-64" />

            <motion.div
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Form Card */}
                <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#38BDF8] via-[#FACC15] to-[#38BDF8]" />
                    {children}
                </div>

                {/* Footer text */}
                <p className="mt-6 sm:mt-10 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    © {new Date().getFullYear()} Mandala Arena Base.
                </p>
            </motion.div>
        </div>
    );
}
