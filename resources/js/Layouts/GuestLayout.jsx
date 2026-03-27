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

            // Detect horizontal swipe from left edge (dx > 100 and startX < 60)
            if (dx > 100 && Math.abs(dx) > Math.abs(dy) * 2 && touchStartX < 60) {
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
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 font-sans relative">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#38BDF8]/10 rounded-full blur-[100px] -mr-64 -mt-64" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#FACC15]/10 rounded-full blur-[100px] -ml-64 -mb-64" />

            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Brand Header */}
                {/* <div className="mb-10 text-center">
                    <Link href="/" className="inline-flex flex-col items-center gap-4 group">
                        <div className="w-16 h-16 bg-[#38BDF8] rounded-xl flex items-center justify-center shadow-lg shadow-[#38BDF8]/30 group-hover:rotate-3 transition-transform">
                            <span className="text-white font-black italic text-3xl font-['Permanent_Marker']">M</span>
                        </div>
                        <span className="text-3xl font-black text-slate-900 tracking-wider font-['Permanent_Marker'] mt-2">
                            Mandala <span className="text-[#38BDF8]">Arena</span>
                        </span>
                    </Link>
                </div> */}

                {/* Form Card */}
                <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#38BDF8] via-[#FACC15] to-[#38BDF8]" />
                    {children}
                </div>

                {/* Footer text */}
                <p className="mt-10 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    © {new Date().getFullYear()} Mandala Arena Base.
                </p>
            </motion.div>
        </div>
    );
}
