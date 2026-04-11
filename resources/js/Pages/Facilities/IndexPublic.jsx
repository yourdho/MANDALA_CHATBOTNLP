import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Chatbot from '@/Components/Shared/Chatbot';
import AutoCarousel from '@/Components/Shared/AutoCarousel';
import ThemeToggle from '@/Components/UI/ThemeToggle';
import AuthenticatedLayout from '@/Components/Layouts/AuthenticatedLayout';
import {
    TrophyIcon,
    SparklesIcon,
    StarIcon,
    SunIcon,
    CubeIcon,
    MapIcon,
    UserIcon,
    LockClosedIcon,
    InboxIcon,
    GlobeAltIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const CATEGORIES = [
    { id: 'all', label: 'Semua Arena', icon: <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>, desc: 'Lihat seluruh fasilitas Mandala Arena.' },
    { id: 'Mini Soccer', label: 'Mini Soccer', icon: <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /></svg>, desc: 'Rumput sintetis standar internasional.' },
    { id: 'Padel', label: 'Padel Tennis', icon: <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.5 5.5l-4.5 4.5m4.5-4.5l-4.5-4.5m4.5 4.5V9M11 10l-4 4m0 0l-4-4m4 4v-4m10 6.5a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM12 11h.01" /><circle cx="12" cy="11.5" r="3.5" /></svg>, desc: 'Zonanya olahraga raket modern.' },
    { id: 'Basket', label: 'Basketball', icon: <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10M12 2a15.3 15.3 0 00-4 10 15.3 15.3 0 004 10M2 12h20" /></svg>, desc: 'Lapangan indoor dengan ring pro.' },
    { id: 'Pilates', label: 'Pilates Studio', icon: <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><circle cx="12" cy="7" r="3" /><path d="M5 21v-2a7 7 0 017-7 7 7 0 017 7v2" /></svg>, desc: 'Area tenang untuk core & balance.' },
];

const AMENITIES = [
    { id: 'wc', label: 'WC / Toilet', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    { id: 'parkir', label: 'Parkiran Luas', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z" /></svg> },
    { id: 'mushola', label: 'Mushola', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg> },
    { id: 'loker', label: 'Loker Member', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> },
];

export default function IndexPublic({ auth, facilities = [] }) {
    const [selectedCategory, setSelectedCategory] = useState(() => {
        if (typeof window !== 'undefined') {
            return new URLSearchParams(window.location.search).get('category') || null;
        }
        return null;
    });

    useEffect(() => {
        const handlePopState = () => {
            const params = new URLSearchParams(window.location.search);
            setSelectedCategory(params.get('category') || null);
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const padelFacilities = facilities.filter(f => f.category === 'Padel');
    let baseFacilities = [...facilities].filter(f => f.category !== 'Padel');

    if (padelFacilities.length > 0) {
        baseFacilities.push({
            ...padelFacilities[0],
            name: 'Zona Padel',
            id: padelFacilities[0].id // Directs to the first padel court where tabs will handle switching
        });
    }

    const filteredFacilities = selectedCategory && selectedCategory !== 'all'
        ? baseFacilities.filter(f => f.category === selectedCategory || f.name.toLowerCase().includes(selectedCategory.toLowerCase()))
        : baseFacilities;

    const handleCategorySelect = (cat) => {
        setSelectedCategory(cat);
        const url = window.location.pathname + `?category=${cat}`;
        window.history.pushState(window.history.state, '', url);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleClearCategory = () => {
        setSelectedCategory(null);
        window.history.pushState(window.history.state, '', window.location.pathname);
    };

    const content = (
        <div className="min-h-screen font-sans selection:bg-[#38BDF8] selection:text-white transition-colors duration-300"
            style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>

            <main className="pb-24 px-6 lg:px-20 max-w-7xl mx-auto pt-10">
                <AnimatePresence mode="wait">
                    {!selectedCategory ? (
                        <motion.div
                            key="selector"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="space-y-12"
                        >
                            <div className="text-center mb-16">
                                <h1 className="text-3xl sm:text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none mb-6"
                                    style={{ color: 'var(--text-primary)' }}>
                                    Fasilitas <span className="text-[#38BDF8]">Mandala</span>
                                </h1>
                                <p className="font-bold uppercase tracking-widest text-xs" style={{ color: 'var(--text-secondary)' }}>Pilih area olahraga Anda</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {CATEGORIES.map((cat, i) => (
                                    <motion.button
                                        key={cat.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        onClick={() => handleCategorySelect(cat.id)}
                                        className="group relative rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 text-left border-2 hover:border-[#38BDF8] shadow-xl hover:shadow-[#38BDF8]/20 transition-all overflow-hidden"
                                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#38BDF8]/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
                                        <div className="mb-6 filter group-hover:drop-shadow-[0_0_10px_rgba(56,189,248,0.5)] transition-all text-[#38BDF8] opacity-60 group-hover:opacity-100">
                                            {cat.icon}
                                        </div>
                                        <h3 className="text-xl md:text-3xl font-black italic uppercase tracking-tighter mb-2"
                                            style={{ color: 'var(--text-primary)' }}>{cat.label}</h3>
                                        <p className="text-[10px] font-bold uppercase tracking-widest"
                                            style={{ color: 'var(--text-secondary)' }}>{cat.desc}</p>

                                        <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase text-[#38BDF8] tracking-widest group-hover:gap-4 transition-all">
                                            Eksplorasi Area
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="listing"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-12"
                        >
                            {/* Breadcrumb / Header */}
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-12"
                                style={{ borderColor: 'var(--border)' }}>
                                <div>
                                    <button
                                        onClick={handleClearCategory}
                                        className="text-[10px] font-black text-[#38BDF8] uppercase tracking-widest mb-4 flex items-center gap-2 hover:gap-3 transition-all"
                                    >
                                        Kembali ke Semua Arena
                                    </button>
                                    <h2 className="text-3xl sm:text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none"
                                        style={{ color: 'var(--text-primary)' }}>
                                        Zona <span className="text-[#38BDF8]">{selectedCategory === 'all' ? 'Lengkap' : selectedCategory}</span>
                                    </h2>
                                </div>
                                <p className="font-bold uppercase tracking-widest text-[10px] max-w-xs md:text-right" style={{ color: 'var(--text-secondary)' }}>
                                    Menampilkan semua ketersediaan lapangan dalam kategori {selectedCategory}.
                                </p>
                            </div>

                            {/* Results Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
                                {filteredFacilities.length > 0 ? filteredFacilities.map((f, i) => (
                                    <motion.div
                                        key={f.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="group rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border flex flex-col"
                                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                                    >
                                        <div className="relative aspect-video overflow-hidden bg-slate-900">
                                            <AutoCarousel images={f.images || []} name={f.name} />
                                            <div className="absolute bottom-6 left-8 z-30 pointer-events-none w-[80%]">
                                                <h3 className="text-2xl md:text-5xl font-['Permanent_Marker'] italic text-white uppercase tracking-tighter drop-shadow-2xl truncate">{f.name}</h3>
                                            </div>
                                        </div>

                                        <div className="p-8 md:p-10 space-y-8" style={{ background: 'var(--bg-card)' }}>
                                            {/* Amenities Section */}
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#38BDF8] italic opacity-60">Layanan & Fasilitas Terpadu</h4>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                    {AMENITIES.map(amenity => (
                                                        <div key={amenity.id} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 group-hover:border-[#38BDF8]/30 transition-colors">
                                                            <div className="text-[#38BDF8]">{amenity.icon}</div>
                                                            <span className="text-[9px] font-black uppercase tracking-wider opacity-60 italic">{amenity.label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-8 border-t-[6px] border-[#38BDF8]">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1"
                                                        style={{ color: 'var(--text-secondary)' }}>Tarif Booking</p>
                                                    <p className="text-3xl font-black italic text-[#38BDF8] leading-none">
                                                        {parseInt(f.min_price) === parseInt(f.max_price) ? (
                                                            `RP ${parseInt(f.min_price).toLocaleString('id-ID')}`
                                                        ) : (
                                                            <span className="text-xl sm:text-2xl break-words">
                                                                RP {parseInt(f.min_price).toLocaleString('id-ID')} <span className="opacity-40">-</span> {parseInt(f.max_price).toLocaleString('id-ID')}
                                                            </span>
                                                        )}
                                                        <span className="text-xs uppercase tracking-widest inline-block -translate-y-1 ml-2" style={{ color: 'var(--text-secondary)' }}>/ Jam</span>
                                                    </p>
                                                </div>

                                                <Link
                                                    href={route('facility.show', f.id)}
                                                    className="shrink-0 block text-center px-10 py-5 bg-slate-900 dark:bg-slate-800 text-white font-black rounded-2xl hover:bg-[#38BDF8] hover:-translate-y-1 hover:shadow-xl hover:shadow-[#38BDF8]/30 transition-all uppercase tracking-widest text-xs"
                                                >
                                                    Booking Sekarang
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                )) : (
                                    <div className="col-span-full py-40 text-center rounded-[3rem] border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                                        <ExclamationCircleIcon className="w-16 h-16 mx-auto mb-6 text-[#38BDF8] opacity-30" />
                                        <p className="font-bold uppercase tracking-widest text-[10px]" style={{ color: 'var(--text-secondary)' }}>Belum ada jadwal di zona ini.</p>
                                        <button onClick={handleClearCategory} className="mt-8 text-[10px] font-black uppercase text-[#38BDF8] underline">Kembali Pilih Area</button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* <Chatbot /> */}
        </div>
    );

    if (auth?.user) return <AuthenticatedLayout><Head title="Pilih Arena | Mandala Arena" />{content}</AuthenticatedLayout>;
    return <AuthenticatedLayout showSidebar={false}><Head title="Pilih Arena | Mandala Arena" />{content}</AuthenticatedLayout>;
}
