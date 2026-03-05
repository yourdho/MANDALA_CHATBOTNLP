import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function VenuesIndex({ venues, categories, selectedCategory }) {
    const { auth } = usePage().props;
    const isLoggedIn = !!auth?.user;

    const handleFilter = (cat) => {
        router.get(route('venues.index'), { category: cat === 'Semua' ? 'all' : cat }, { preserveState: true });
    };

    /* ──────────────────────────────────────────
       Inner content — shared between both layouts
    ────────────────────────────────────────── */
    const Content = () => (
        <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
            {/* Heading */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                className="text-center mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                    Explore <span className="text-[#F2D800]">Venues</span>
                </h1>
                <p className="mt-2 text-sm text-slate-400">
                    Temukan lapangan dan layanan terbaik di sekitarmu.
                </p>
            </motion.div>

            {/* Banner: Booking tanpa login (hanya tampil untuk guest) */}
            {!isLoggedIn && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    className="mb-6 flex flex-col sm:flex-row items-center gap-3 rounded-2xl bg-[#F2D800]/8 border border-[#F2D800]/25 px-4 py-3.5"
                >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <span className="text-xl flex-shrink-0">⚡</span>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-[#F2D800]">Booking Langsung Tanpa Login!</p>
                            <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">
                                Klik tombol <strong className="text-white">Booking →</strong> di venue mana saja. Tidak perlu akun. Atau{' '}
                                <Link href={route('login')} className="text-[#F2D800] underline underline-offset-2">masuk</Link>
                                {' '}untuk dapat poin reward ⭐ setiap transaksi.
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5 sm:hidden">
                                Klik <strong className="text-white">Booking →</strong> di venue. Tidak perlu akun.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                        <Link href={route('login')}
                            className="rounded-full border border-[#F2D800]/40 px-3 py-1.5 text-xs font-semibold text-[#F2D800] hover:bg-[#F2D800]/10 transition-all">
                            Masuk
                        </Link>
                        <Link href={route('register')}
                            className="rounded-full bg-[#F2D800] px-3 py-1.5 text-xs font-bold text-[#1A1818] hover:bg-[#ffe800] hover:scale-105 transition-all">
                            Daftar
                        </Link>
                    </div>
                </motion.div>
            )}

            {/* Filter pills — horizontally scrollable on mobile */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar sm:flex-wrap sm:justify-center">
                {['Semua', ...(categories || [])].map((cat) => (
                    <button
                        key={cat}
                        onClick={() => handleFilter(cat)}
                        className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold border transition-all ${(cat === 'Semua' && selectedCategory === 'all') || cat === selectedCategory
                            ? 'border-[#F2D800] text-[#F2D800] bg-[#F2D800]/10'
                            : 'border-[#2e2a2a] text-slate-300 bg-[#231F1F] hover:border-[#F2D800]/40 hover:text-[#F2D800]'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Venue Grid */}
            {venues.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-slate-500 text-sm">Belum ada venue tersedia.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                    {venues.map((venue, index) => (
                        <motion.article
                            key={venue.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: index * 0.06 }}
                            whileHover={{ y: -6 }}
                            className="flex flex-col bg-[#231F1F] rounded-2xl border border-[#2e2a2a] hover:border-[#F2D800]/20 transition-all shadow-sm overflow-hidden"
                        >
                            {/* Cover Photo */}
                            <Link href={route('venues.show', venue.id)} className="block relative w-full h-44 overflow-hidden bg-[#1A1818] flex-shrink-0">
                                {venue.cover_image ? (
                                    <img
                                        src={venue.cover_image}
                                        alt={venue.name}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-700">
                                        <svg className="w-10 h-10 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-xs opacity-40">Belum ada foto</span>
                                    </div>
                                )}
                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#231F1F] via-transparent to-transparent" />
                                {/* Category badge */}
                                <span className="absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-[10px] font-semibold bg-[#1A1818]/80 backdrop-blur-sm text-[#F2D800] border border-[#F2D800]/20">
                                    {venue.category}
                                </span>
                                {/* Rating badge */}
                                <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#1A1818]/80 backdrop-blur-sm rounded-full px-2 py-0.5">
                                    <span className="text-[#F2D800] text-xs">★</span>
                                    <span className="text-white font-semibold text-xs">{venue.rating}</span>
                                    <span className="text-slate-500 text-[10px]">({venue.reviews_count})</span>
                                </div>
                            </Link>

                            {/* Card Body */}
                            <div className="flex flex-col flex-1 p-4 sm:p-5">
                                {/* Name */}
                                <h3 className="text-base font-bold text-white leading-snug">
                                    <Link href={route('venues.show', venue.id)} className="hover:text-[#F2D800] transition-colors">
                                        {venue.name}
                                    </Link>
                                </h3>

                                {/* Lokasi */}
                                <p className="mt-1 text-xs text-slate-500 flex items-center gap-1 truncate">
                                    <svg className="w-3 h-3 flex-shrink-0 text-[#F2D800]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="truncate">{venue.location}</span>
                                </p>

                                {/* Deskripsi fallback */}
                                <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed flex-1">
                                    {venue.description && venue.description !== 'Venue terbaik di kotamu.'
                                        ? venue.description
                                        : 'Venue terbaik di kotamu.'}
                                </p>

                                {/* Bottom */}
                                <div className="mt-4 pt-3 border-t border-[#2e2a2a] flex items-center justify-between gap-2">
                                    <p className="text-sm font-bold text-[#F2D800]">{venue.price}</p>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={route('venues.show', venue.id)}
                                            className="flex-shrink-0 rounded-full border border-[#2e2a2a] px-3 py-1.5 text-xs font-semibold text-slate-400 hover:border-[#F2D800]/40 hover:text-[#F2D800] transition-all"
                                        >
                                            Detail
                                        </Link>
                                        <Link
                                            href={route('venues.show', venue.id)}
                                            className="flex-shrink-0 rounded-full bg-[#F2D800] px-3 py-1.5 text-xs font-bold text-[#1A1818] hover:bg-[#ffe800] hover:scale-105 transition-all shadow-sm shadow-[#F2D800]/20"
                                        >
                                            Booking →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </motion.article>
                    ))}
                </div>
            )}
        </div>
    );

    /* ──────────────────────────────────────────
       Authenticated: gunakan sidebar layout
    ────────────────────────────────────────── */
    if (isLoggedIn) {
        return (
            <AuthenticatedLayout
                header={
                    <h2 className="font-black text-xl text-white leading-tight">
                        Explore <span className="text-[#F2D800]">Venues</span>
                    </h2>
                }
            >
                <Head title="Explore Venues - Janjee" />
                <Content />
            </AuthenticatedLayout>
        );
    }

    /* ──────────────────────────────────────────
       Guest: public header
    ────────────────────────────────────────── */
    return (
        <>
            <Head title="Explore Venues - Janjee" />
            <div className="min-h-screen bg-[#1A1818] text-white font-sans">

                {/* Background glow */}
                <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#F2D800]/5 rounded-full blur-[120px]"></div>
                </div>

                {/* Public sticky navbar */}
                <header className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 lg:px-12 h-14 sm:h-16 bg-[#1A1818]/90 backdrop-blur-md border-b border-[#2e2a2a]">
                    <Link href="/" className="flex items-center gap-2.5">
                        <img src="/images/janjee-logo.svg" alt="Janjee" className="h-8 w-8" />
                        <span className="text-lg sm:text-xl font-black tracking-tight text-[#F2D800]">Janjee</span>
                    </Link>
                    <nav className="flex items-center gap-3">
                        <Link href={route('login')}
                            className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">
                            Masuk
                        </Link>
                        <Link href={route('register')}
                            className="rounded-full bg-[#F2D800] px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-[#1A1818] hover:bg-[#ffe800] hover:scale-105 transition-all shadow-lg shadow-[#F2D800]/20">
                            Daftar
                        </Link>
                    </nav>
                </header>

                <Content />

                <footer className="border-t border-[#2e2a2a] py-8 text-center">
                    <p className="text-xs text-slate-600">&copy; 2026 Janjee Booking Platform.</p>
                </footer>
            </div>
        </>
    );
}
