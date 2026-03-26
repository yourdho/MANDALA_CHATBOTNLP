import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Chatbot from '@/Components/Chatbot';
import AutoCarousel from '@/Components/AutoCarousel';
import ThemeToggle from '@/Components/ThemeToggle';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const CATEGORIES = [
    { id: 'all', label: 'Semua Arena', icon: '🏟️', desc: 'Lihat seluruh fasilitas Mandala Arena.' },
    { id: 'Mini Soccer', label: 'Mini Soccer', icon: '⚽', desc: 'Rumput sintetis standar internasional.' },
    { id: 'Padel', label: 'Padel Tennis', icon: '🎾', desc: 'Zonanya olahraga raket modern.' },
    { id: 'Basket', label: 'Basketball', icon: '🏀', desc: 'Lapangan indoor dengan ring pro.' },
    { id: 'Pilates', label: 'Pilates Studio', icon: '🧘', desc: 'Area tenang untuk core & balance.' },
];

export default function IndexPublic({ auth, facilities = [] }) {
    const [selectedCategory, setSelectedCategory] = useState(null);

    const filteredFacilities = selectedCategory && selectedCategory !== 'all'
        ? facilities.filter(f => f.category === selectedCategory || f.name.toLowerCase().includes(selectedCategory.toLowerCase()))
        : facilities;

    const handleCategorySelect = (cat) => {
        setSelectedCategory(cat);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
                                <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none mb-6"
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
                                        className="group relative rounded-[3rem] p-10 text-left border-2 hover:border-[#38BDF8] shadow-xl hover:shadow-[#38BDF8]/20 transition-all overflow-hidden"
                                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#38BDF8]/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
                                        <span className="text-6xl block mb-6 filter group-hover:drop-shadow-[0_0_10px_rgba(56,189,248,0.5)] transition-all grayscale opacity-50">{cat.icon}</span>
                                        <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2"
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
                                        onClick={() => setSelectedCategory(null)}
                                        className="text-[10px] font-black text-[#38BDF8] uppercase tracking-widest mb-4 flex items-center gap-2 hover:gap-3 transition-all"
                                    >
                                        Kembali ke Semua Arena
                                    </button>
                                    <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none"
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
                                        className="group rounded-[3rem] overflow-hidden shadow-2xl border flex flex-col"
                                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                                    >
                                        <div className="relative aspect-video overflow-hidden bg-slate-900">
                                            <AutoCarousel images={f.images || []} name={f.name} />
                                            <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 z-30 pointer-events-none">
                                                <span className="text-white font-black text-[10px] uppercase tracking-widest">Premium Zona</span>
                                            </div>
                                            <div className="absolute bottom-6 left-8 z-30 pointer-events-none w-[80%]">
                                                <h3 className="text-3xl md:text-5xl font-['Permanent_Marker'] italic text-white uppercase tracking-tighter drop-shadow-2xl truncate">{f.name}</h3>
                                            </div>
                                        </div>

                                        <div className="p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border-t-[6px] border-[#38BDF8]"
                                            style={{ background: 'var(--bg-card)' }}>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1"
                                                    style={{ color: 'var(--text-secondary)' }}>Tarif Booking</p>
                                                <p className="text-3xl font-black italic text-[#38BDF8] leading-none">
                                                    Rp {parseInt(f.price_per_hour).toLocaleString()} <span className="text-xs uppercase tracking-widest inline-block -translate-y-1" style={{ color: 'var(--text-secondary)' }}>/ Jam</span>
                                                </p>
                                            </div>

                                            <Link
                                                href={route('facility.show', f.id)}
                                                className="shrink-0 block text-center px-10 py-5 bg-slate-900 dark:bg-slate-800 text-white font-black rounded-2xl hover:bg-[#38BDF8] hover:-translate-y-1 hover:shadow-xl hover:shadow-[#38BDF8]/30 transition-all uppercase tracking-widest text-xs"
                                            >
                                                Booking Sekarang
                                            </Link>
                                        </div>
                                    </motion.div>
                                )) : (
                                    <div className="col-span-full py-40 text-center rounded-[3rem] border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                                        <span className="text-6xl opacity-30 block mb-6 grayscale text-center">🏜️</span>
                                        <p className="font-bold uppercase tracking-widest text-[10px]" style={{ color: 'var(--text-secondary)' }}>Belum ada jadwal di zona ini.</p>
                                        <button onClick={() => setSelectedCategory(null)} className="mt-8 text-[10px] font-black uppercase text-[#38BDF8] underline">Kembali Pilih Area</button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <Chatbot />
        </div>
    );

    return (
        <AuthenticatedLayout>
            <Head title="Pilih Area | Mandala Arena" />
            {content}
        </AuthenticatedLayout>
    );
}
