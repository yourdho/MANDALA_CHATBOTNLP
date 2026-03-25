import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import Chatbot from '@/Components/Chatbot';
import AutoCarousel from '@/Components/AutoCarousel';
import ThemeToggle from '@/Components/ThemeToggle';

export default function IndexPublic({ auth, facilities = [] }) {
    return (
        <>
            <Head title="Booking Area | Mandala Arena" />

            <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-[#38BDF8] selection:text-white">

                {/* ──────────── NAVBAR ──────────── */}
                <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 lg:px-20 h-24 bg-white/90 backdrop-blur-md border-b border-slate-100">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#38BDF8] rounded-xl flex items-center justify-center shadow-lg shadow-[#38BDF8]/30">
                            <span className="text-white font-black italic text-xl">M</span>
                        </div>
                        <span className="text-2xl font-black tracking-tight uppercase italic hidden sm:block"
                            style={{ color: 'var(--text-primary)' }}>
                            Mandala <span className="text-[#38BDF8]">Arena</span>
                        </span>
                    </Link>

                    <nav className="flex items-center gap-6">
                        <Link href="/" className="text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-[#38BDF8] transition-colors">
                            Beranda
                        </Link>

                        <div className="flex items-center gap-4 pl-6 border-l"
                            style={{ borderColor: 'var(--border)' }}>
                            <ThemeToggle />
                            {auth.user ? (
                                <Link href={route('dashboard')}
                                    className="px-6 py-2 bg-slate-900 text-white font-black rounded-full hover:bg-[#38BDF8] hover:shadow-lg transition-all text-xs uppercase tracking-widest">
                                    Login
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="inline-flex items-center px-6 py-2 bg-slate-100 text-slate-900 text-xs font-black uppercase tracking-widest rounded-full hover:bg-[#38BDF8] hover:text-white transition-all shadow-sm"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="inline-flex items-center px-6 py-2 bg-[#38BDF8] text-slate-900 text-xs font-black uppercase tracking-widest rounded-full hover:bg-slate-900 hover:text-white transition-all shadow-md shadow-[#38BDF8]/20"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </nav>
                </header>

                <main className="pt-32 pb-24 px-6 lg:px-20 max-w-7xl mx-auto">

                    <div className="text-center mb-16 relative">
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tight mb-4"
                                style={{ color: 'var(--text-primary)' }}>
                                Area Booking <span className="text-[#38BDF8]">Fasilitas</span>
                            </h1>
                            <p className="text-slate-500 font-medium max-w-2xl mx-auto">
                                Pilih zona area olahraga favorit Anda. Segera jadwalkan aktivitas olahraga dengan sistem reservasi instan dan aman dari Mandala Arena.
                            </p>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
                        {facilities.length > 0 ? facilities.map((f, i) => (
                            <motion.div
                                key={f.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="group bg-white rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col"
                            >
                                <div className="relative aspect-video overflow-hidden bg-slate-900 group">
                                    <AutoCarousel images={f.images} name={f.name} />

                                    <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 shadow-lg z-30 pointer-events-none">
                                        <span className="text-white font-black text-[10px] uppercase tracking-widest whitespace-nowrap drop-shadow-sm">Zona Unggulan</span>
                                    </div>

                                    <div className="absolute bottom-6 left-8 z-30 pointer-events-none">
                                        <h3 className="text-3xl md:text-4xl font-['Permanent_Marker'] italic text-white uppercase tracking-tighter drop-shadow-xl">{f.name}</h3>
                                    </div>
                                </div>

                                <div className="p-8 md:p-10 relative bg-white flex flex-col md:flex-row md:items-center justify-between gap-6 border-t-[6px] border-[#38BDF8]">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Tarif Booking</p>
                                        <p className="text-3xl font-black italic text-[#38BDF8] leading-none">
                                            Rp {parseInt(f.price_per_hour).toLocaleString()} <span className="text-xs text-slate-400 uppercase tracking-widest inline-block -translate-y-1">/ Jam</span>
                                        </p>
                                    </div>

                                    <Link
                                        href={route('facility.show', f.id)}
                                        className="shrink-0 block text-center px-10 py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-[#38BDF8] hover:-translate-y-1 hover:shadow-xl hover:shadow-[#38BDF8]/30 transition-all uppercase tracking-widest text-xs"
                                    >
                                        Booking Zona ⚡
                                    </Link>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="col-span-full py-32 text-center rounded-[3rem] bg-white border border-slate-100 shadow-sm">
                                <span className="text-5xl opacity-50 block mb-6">🏟️</span>
                                <p className="text-slate-400 font-bold uppercase tracking-widest">Aset fasilitas sedang disiapkan.</p>
                            </div>
                        )}
                    </div>
                </main>

                <Chatbot />
            </div>
        </>
    );
}
