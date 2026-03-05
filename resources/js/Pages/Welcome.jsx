import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState, useCallback } from 'react';
import ThemeToggle from '@/Components/ThemeToggle';
import { useTheme } from '@/Components/ThemeContext';

/** Animasi count-up dari 0 → target dalam `duration` ms */
function useCountUp(target, duration = 1400) {
    const [count, setCount] = useState(0);
    const rafRef = useRef(null);
    useEffect(() => {
        if (target === 0) { setCount(0); return; }
        const start = performance.now();
        const animate = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) rafRef.current = requestAnimationFrame(animate);
        };
        rafRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafRef.current);
    }, [target, duration]);
    return count;
}

function formatNum(n) {
    return n.toLocaleString('id-ID');
}

const SLIDES = [
    {
        img: '/images/hero_1.jpg',
        tag: 'Booking dalam hitungan detik',
        title: 'Main Tanpa',
        accent: 'Ribet.',
        sub: 'Booking lapangan futsal, mini soccer, atau venue favorit lainnya dalam hitungan detik.',
    },
    {
        img: '/images/hero_2.jpg',
        tag: 'Jadwal Real-Time',
        title: 'Cek Slot',
        accent: 'Sekarang.',
        sub: 'Lihat ketersediaan lapangan secara real-time dan pilih waktu yang paling cocok buatmu.',
    },
    {
        img: '/images/hero_3.jpg',
        tag: 'Komunitas Futsal Indonesia',
        title: 'Bergabung &',
        accent: 'Berlaga!',
        sub: 'Ribuan pemain sudah mempercayai Janjee untuk pengalaman booking yang mudah dan cepat.',
    },
];

export default function Welcome({ auth, stats = {} }) {
    const { theme } = useTheme();

    // Slideshow state
    const [current, setCurrent] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const intervalRef = useRef(null);

    const activeVenues = useCountUp(stats.active_venues ?? 0);
    const bookingsToday = useCountUp(stats.bookings_today ?? 0);
    const cities = useCountUp(stats.cities ?? 0);

    const goTo = useCallback((idx) => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrent(idx);
        setTimeout(() => setIsTransitioning(false), 800);
    }, [isTransitioning]);

    const next = useCallback(() => {
        goTo((current + 1) % SLIDES.length);
    }, [current, goTo]);

    const prev = useCallback(() => {
        goTo((current - 1 + SLIDES.length) % SLIDES.length);
    }, [current, goTo]);

    // Auto-play
    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setCurrent(prev => (prev + 1) % SLIDES.length);
        }, 5000);
        return () => clearInterval(intervalRef.current);
    }, []);

    // Reset interval on manual nav
    const resetAndGo = (idx) => {
        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setCurrent(prev => (prev + 1) % SLIDES.length);
        }, 5000);
        goTo(idx);
    };

    const slide = SLIDES[current];

    return (
        <>
            <Head title="Janjee - Futsal & Venue Booking" />
            <div className="min-h-screen font-sans theme-transition" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>

                {/* ──────────── NAVBAR ──────────── */}
                <header
                    className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 sm:px-6 lg:px-12 h-16"
                    style={{
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%)',
                        backdropFilter: 'blur(0px)',
                    }}
                >
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <img src="/images/janjee-logo.svg" alt="Janjee"
                            className="h-8 w-8 sm:h-9 sm:w-9 transition-transform group-hover:scale-105" />
                        <span className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow">Janjee</span>
                    </Link>
                    <nav className="flex items-center gap-3 sm:gap-4">
                        <ThemeToggle />
                        {auth.user ? (
                            <Link href={route('dashboard')}
                                className="inline-flex items-center gap-1.5 rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold text-[#1A1818] hover:scale-105 transition-all shadow-lg"
                                style={{ backgroundColor: 'var(--accent)' }}>
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href={route('login')}
                                    className="text-sm font-semibold text-white/80 hover:text-white transition-colors drop-shadow">
                                    Masuk
                                </Link>
                                <Link href={route('register')}
                                    className="rounded-full px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-[#1A1818] hover:scale-105 transition-all shadow-lg"
                                    style={{ backgroundColor: 'var(--accent)' }}>
                                    Daftar
                                </Link>
                            </>
                        )}
                    </nav>
                </header>

                {/* ──────────── HERO SECTION (MULTIPLE CARDS) ──────────── */}
                <section className="relative min-h-[95vh] w-full pt-28 pb-16 overflow-hidden flex flex-col justify-start" style={{ backgroundColor: '#0A0A0A' }}>
                    {/* Background glow or gradient */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#111111] via-[#0A0A0A] to-[#0A0A0A] -z-10" />

                    {/* Decorative glow */}
                    <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#F2D800]/10 rounded-[100%] blur-[100px] pointer-events-none" />

                    {/* Headline / Top Content */}
                    <div className="relative z-30 flex flex-col items-center justify-center px-4 md:px-6 text-center mb-10 md:mb-14 max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur px-4 py-2 text-xs font-semibold text-[#F2D800] mb-5 tracking-wide uppercase"
                        >
                            Booking dalam hitungan detik ⚽
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] text-white drop-shadow-lg"
                        >
                            Main <span style={{ color: '#F2D800' }}>Tanpa Ribet.</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
                            className="mt-4 md:mt-6 text-sm sm:text-lg leading-relaxed text-white/70 max-w-xl mx-auto font-light"
                        >
                            Booking lapangan futsal, mini soccer, atau venue favorit lainnya secara real-time. Temukan lawan, cek jadwal, dan main hari ini juga.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
                            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
                        >
                            <Link href={route('venues.index')}
                                className="w-full sm:w-auto rounded-full px-8 py-3.5 text-sm sm:text-base font-bold text-[#1A1818] hover:scale-105 transition-all shadow-[0_0_20px_rgba(242,216,0,0.3)]"
                                style={{ backgroundColor: '#F2D800' }}>
                                Booking Sekarang →
                            </Link>
                            <a href="#about"
                                className="w-full sm:w-auto rounded-full border border-white/20 px-8 py-3.5 text-sm sm:text-base font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-all">
                                Pelajari Sistemnya
                            </a>
                        </motion.div>

                        {/* Stats Row */}
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 1 }}
                            className="mt-12 flex flex-wrap justify-center gap-8 sm:gap-16 border-t border-white/10 pt-6 px-10"
                        >
                            {[
                                { label: 'Venue Aktif', value: formatNum(activeVenues), suffix: stats.active_venues > 0 ? '+' : '' },
                                { label: 'Total Booking', value: formatNum(bookingsToday), suffix: stats.bookings_today > 0 ? '+' : '' },
                                { label: 'Kota', value: formatNum(cities), suffix: '' },
                            ].map((stat) => (
                                <div key={stat.label} className="text-center">
                                    <p className="text-2xl sm:text-3xl font-black text-white drop-shadow">
                                        {stat.value}{stat.suffix}
                                    </p>
                                    <p className="text-[10px] sm:text-[11px] mt-1 text-white/40 uppercase tracking-widest font-semibold">{stat.label}</p>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* 3D Image Grid (Squarespace style) */}
                    <div className="relative z-20 w-full flex-1 flex flex-col items-center justify-center px-4 overflow-visible" style={{ perspective: '1200px' }}>
                        <div className="relative w-full max-w-[1200px] mx-auto h-[320px] sm:h-[450px] lg:h-[550px] flex items-center justify-center mb-10">

                            {/* Left Box */}
                            <motion.div
                                initial={{ opacity: 0, x: -100, rotateY: 25, z: -150 }}
                                animate={{ opacity: 0.6, x: '-60%', rotateY: 15, z: -100 }}
                                transition={{ duration: 1, delay: 0.4, type: "spring", stiffness: 60 }}
                                whileHover={{ opacity: 0.9, scale: 1.05, z: -50, rotateY: 10, transition: { duration: 0.3 } }}
                                className="absolute top-1/2 -translate-y-1/2 w-[55%] sm:w-[45%] lg:w-[40%] aspect-[4/3] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-white/10 hidden sm:block group cursor-pointer"
                                style={{ transformStyle: 'preserve-3d', filter: 'brightness(0.7)' }}
                            >
                                <img src="/images/hero_cartoon_2.png" alt="Aksi Futsal" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                                    <p className="text-white font-bold text-xl drop-shadow-md pb-2">Kompetisi Sengit 🔥</p>
                                </div>
                            </motion.div>

                            {/* Right Box */}
                            <motion.div
                                initial={{ opacity: 0, x: 100, rotateY: -25, z: -150 }}
                                animate={{ opacity: 0.6, x: '60%', rotateY: -15, z: -100 }}
                                transition={{ duration: 1, delay: 0.6, type: "spring", stiffness: 60 }}
                                whileHover={{ opacity: 0.9, scale: 1.05, z: -50, rotateY: -10, transition: { duration: 0.3 } }}
                                className="absolute top-1/2 -translate-y-1/2 w-[55%] sm:w-[45%] lg:w-[40%] aspect-[4/3] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-white/10 hidden sm:block group cursor-pointer"
                                style={{ transformStyle: 'preserve-3d', filter: 'brightness(0.7)' }}
                            >
                                <img src="/images/hero_cartoon_3.png" alt="Venue Malam" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                                    <p className="text-white font-bold text-xl drop-shadow-md pb-2">Suasana Malam 🌙</p>
                                </div>
                            </motion.div>

                            {/* Center Main Box */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.85, y: 40 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.8, type: "spring", stiffness: 80 }}
                                className="relative z-30 w-[95%] sm:w-[70%] lg:w-[60%] aspect-[4/3] lg:aspect-[16/10] rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xl border border-[#F2D800]/20 bg-[#1A1818] group"
                            >
                                <img src="/images/hero_cartoon_1.png" alt="Live Match" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s] ease-out" />
                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-black/20 to-transparent opacity-90" />

                                {/* Overlay Content */}
                                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 md:p-10 flex flex-col sm:flex-row sm:items-end justify-between gap-5">
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="relative flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                            </span>
                                            <span className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-sm">Layanan Aktif</span>
                                        </div>
                                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white drop-shadow-lg leading-tight">
                                            Siap Bertanding Hari Ini?
                                        </h2>
                                        <p className="text-white/70 text-xs sm:text-sm mt-2 max-w-sm font-medium">Temukan ketersediaan lapangan secara real-time dan rasakan pengalaman booking tercepat.</p>
                                    </div>
                                    <Link href={route('venues.index')} className="rounded-full bg-white px-6 md:px-8 py-3 md:py-3.5 text-[#1A1818] font-black text-sm shadow-[0_4px_15px_rgba(0,0,0,0.5)] hover:scale-105 hover:bg-[#F2D800] transition-all text-center flex-shrink-0">
                                        Mulai Main
                                    </Link>
                                </div>
                            </motion.div>

                        </div>
                    </div>
                </section>

                {/* ──────────── ABOUT / HOW IT WORKS ──────────── */}
                <section id="about" className="py-20 sm:py-28 relative z-10">
                    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }} className="text-center mb-12">
                            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>Cara Kerja</span>
                            <h2 className="mt-3 text-2xl sm:text-3xl font-black" style={{ color: 'var(--text-primary)' }}>Booking Semudah 3 Langkah</h2>
                        </motion.div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                            {[
                                { step: '01', title: 'Cari Venue', desc: 'Jelajahi ratusan venue di kotamu. Filter berdasarkan kategori dan harga.' },
                                { step: '02', title: 'Pilih Jadwal', desc: 'Lihat ketersediaan slot secara real-time dan pilih waktu yang cocok.' },
                                { step: '03', title: 'Booking & Konfirmasi', desc: 'Booking dikonfirmasi langsung oleh mitra. Datang dan main!' },
                            ].map((item, i) => (
                                <motion.div key={item.step}
                                    initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                                    className="rounded-2xl border p-5 sm:p-6 theme-transition"
                                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                                    <span className="text-3xl font-black" style={{ color: 'var(--accent)', opacity: 0.3 }}>{item.step}</span>
                                    <h3 className="mt-3 text-base font-bold" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                                    <p className="mt-2 text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ──────────── CTA ──────────── */}
                <section className="py-16 sm:py-20">
                    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                        <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative rounded-3xl bg-[#F2D800] px-8 sm:px-12 py-10 sm:py-14 text-center overflow-hidden">
                            <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#1A1818]/10 rounded-full blur-2xl pointer-events-none" />
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#1A1818]/10 rounded-full blur-2xl pointer-events-none" />
                            <h2 className="text-2xl sm:text-4xl font-black text-[#1A1818] leading-tight">
                                Siap Main? Booking Tanpa Perlu Daftar!
                            </h2>
                            <p className="mt-3 text-sm text-[#1A1818]/70 max-w-xl mx-auto">
                                Langsung pilih venue dan booking sekarang. Buat akun untuk dapat poin reward ⭐ di setiap transaksi!
                            </p>
                            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link href={route('venues.index')}
                                    className="rounded-full bg-[#1A1818] text-[#F2D800] px-8 py-3 text-sm font-bold hover:bg-[#231F1F] hover:scale-105 transition-all shadow-lg">
                                    Jelajahi Venue →
                                </Link>
                                <Link href={route('register')}
                                    className="text-sm font-semibold text-[#1A1818]/60 hover:text-[#1A1818] transition-colors">
                                    Daftar & dapat poin reward ⭐
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* ──────────── FOOTER ──────────── */}
                <footer className="border-t py-8 theme-transition" style={{ borderColor: 'var(--border)' }}>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <img src="/images/janjee-logo.svg" alt="Janjee" className="h-6 w-6 opacity-60" />
                            <span className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>Janjee</span>
                        </div>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>&copy; 2026 Janjee Booking Platform.</p>
                    </div>
                </footer>
            </div>

            {/* Inline keyframes for progress bar */}
            <style>{`
                @keyframes progressBar {
                    from { width: 0%; }
                    to   { width: 100%; }
                }
            `}</style>
        </>
    );
}
