import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import Chatbot from '@/Components/Chatbot';

export default function Welcome({ auth }) {
    return (
        <>
            <Head>
                <title>Mandala Arena - Booking Olahraga Modern</title>
                <link href="https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Rock+Salt&display=swap" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-white font-sans text-slate-800 selection:bg-[#38BDF8] selection:text-white">

                {/* ──────────── NAVBAR ──────────── */}
                <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 lg:px-20 h-24 bg-white/90 backdrop-blur-md border-b border-slate-100">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#38BDF8] rounded-xl flex items-center justify-center shadow-lg shadow-[#38BDF8]/30 rotate-3">
                            <span className="text-white font-black italic text-xl font-['Permanent_Marker']">M</span>
                        </div>
                        <span className="text-2xl font-black text-slate-900 tracking-wider font-['Permanent_Marker']">
                            Mandala <span className="text-[#38BDF8]">Arena</span>
                        </span>
                    </Link>

                    <nav className="flex flex-1 justify-end items-center gap-6">
                        <Link href={route('facilities.public')} className="hidden sm:inline-block text-sm font-bold uppercase tracking-widest text-[#38BDF8] hover:text-slate-900 transition-colors">
                            Booking Fasilitas
                        </Link>

                        <div className="flex items-center gap-4 pl-6 border-l border-slate-200">
                            {auth.user ? (
                                <Link href={route('dashboard')} className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-full hover:bg-slate-800 hover:shadow-lg transition-all text-sm uppercase tracking-widest">
                                    Login
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('login')} className="hidden sm:inline-block px-6 py-2.5 border-2 border-slate-200 text-slate-600 font-bold rounded-full hover:border-[#38BDF8] hover:text-[#38BDF8] transition-all text-sm uppercase tracking-widest bg-white">
                                        Login
                                    </Link>
                                    <Link href={route('register')} className="px-6 py-2.5 bg-[#38BDF8] text-white font-bold rounded-full hover:bg-[#38BDF8]/90 hover:shadow-lg hover:shadow-[#38BDF8]/30 transition-all text-sm uppercase tracking-widest">
                                        Daftar
                                    </Link>
                                </>
                            )}
                        </div>
                    </nav>
                </header>

                <main>
                    {/* ──────────── HERO SECTION ──────────── */}
                    <section className="relative pt-32 pb-24 lg:pt-56 lg:pb-40 px-6 lg:px-20 overflow-hidden bg-slate-50">
                        {/* Sports Theme Background Elements */}
                        <div className="absolute top-0 right-0 w-3/4 h-full opacity-10 pointer-events-none">
                            <img src="https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=1200&q=80" alt="Sports Background" className="w-full h-full object-cover mix-blend-multiply" />
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-50 to-transparent" />
                        </div>
                        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[#38BDF8]/10 rounded-full blur-[100px]" />
                        <div className="absolute bottom-0 -left-20 w-[400px] h-[400px] bg-[#FACC15]/10 rounded-full blur-[100px]" />

                        <div className="max-w-5xl mx-auto relative z-10 text-center">

                            <motion.div
                                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center"
                            >
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FACC15]/20 text-[#D97706] rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-8">
                                    <span className="w-2 h-2 bg-[#FACC15] rounded-full animate-pulse" />
                                    Arena Olahraga Urban Modern
                                </div>
                                <motion.h1
                                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                    className="text-6xl md:text-8xl lg:text-[11rem] font-['Permanent_Marker'] font-normal text-slate-900 leading-[0.9] tracking-wider mb-6 drop-shadow-lg -rotate-2"
                                >
                                    Mandala <br />
                                    <span className="text-[#38BDF8] relative inline-block">
                                        Arena
                                        <div className="absolute bottom-4 left-0 w-full h-3 bg-[#FACC15] -z-10 -skew-x-12 opacity-80" />
                                    </span>
                                </motion.h1>
                                <p className="text-lg md:text-xl text-slate-500 font-medium mb-12 max-w-2xl mx-auto">
                                    Booking olahraga jadi lebih mudah. Fasilitas lengkap, jadwal real-time, dan pembayaran online yang aman dengan sistem terintegrasi.
                                </p>
                                <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                                    <Link href={route('facilities.public')} className="px-8 py-4 md:px-10 md:py-5 bg-[#38BDF8] text-white font-black rounded-full hover:bg-[#38BDF8]/90 hover:scale-105 hover:shadow-xl hover:shadow-[#38BDF8]/30 transition-all uppercase tracking-widest text-xs md:text-sm shadow-lg shadow-[#38BDF8]/20 flex items-center gap-2">
                                        ⚡ Mulai Booking
                                    </Link>

                                    <a href="https://mandalaarenavt.com/?utm_source=ig&utm_medium=social&utm_content=link_in_bio" target="_blank" rel="noopener noreferrer" className="px-8 py-4 md:px-10 md:py-5 bg-[#FACC15] text-amber-950 font-black rounded-full hover:bg-[#FACC15]/90 hover:scale-105 hover:shadow-xl hover:shadow-[#FACC15]/30 transition-all uppercase tracking-widest text-xs md:text-sm shadow-lg shadow-[#FACC15]/20 flex items-center gap-2">
                                        🌐 VR Tour Lokasi
                                    </a>

                                    {!auth.user && (
                                        <Link href={route('login')} className="px-8 py-4 md:px-10 md:py-5 bg-white border-2 border-slate-200 text-slate-600 font-black rounded-full hover:border-slate-300 hover:text-slate-900 shadow-sm transition-all uppercase tracking-widest text-xs md:text-sm">
                                            Login
                                        </Link>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </section>

                    {/* ──────────── KEUNGGULAN SECTION ──────────── */}
                    <section className="py-24 px-6 lg:px-20 bg-white">
                        <div className="max-w-7xl mx-auto">
                            <div className="text-center mb-20 relative">
                                <h2 className="text-4xl md:text-5xl font-black italic text-slate-900 uppercase tracking-tight mb-4">
                                    Kenapa <span className="text-[#38BDF8]">Mandala Arena?</span>
                                </h2>
                                <p className="text-slate-500 font-medium max-w-2xl mx-auto">
                                    Platform pelayanan fasilitas olahraga nomor satu di Indonesia. Memberikan kepastian jadwal dan akses fasilitas tanpa batas waktu.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                <FeatureCard
                                    icon="⚡"
                                    title="Booking Mudah"
                                    desc="Pesan lapangan hanya dengan beberapa kali klik. Tanpa ribet, 100% praktis menggunakan interface modern kami."
                                />
                                <FeatureCard
                                    icon="📅"
                                    title="Jadwal Real-time"
                                    desc="Cek ketersediaan jam secara langsung. Anti bentrok dan pasti update dari seluruh jadwal yang telah terverifikasi."
                                />
                                <FeatureCard
                                    icon="💳"
                                    title="Pembayaran Terpadu"
                                    desc="Berbagai metode pembayaran mulai dari Virtual Account (BCA, Mandiri) sampai E-Wallet (QRIS) siap sedia otomatis."
                                />
                            </div>
                        </div>
                    </section>
                </main>

                {/* ──────────── FOOTER ──────────── */}
                <footer className="bg-slate-900 pt-20 pb-10 px-6 lg:px-20 border-t-4 border-[#38BDF8]">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center sm:items-start gap-12">
                        <div className="text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                                <div className="w-10 h-10 bg-[#38BDF8] rounded-xl flex items-center justify-center rotate-3">
                                    <span className="text-white font-black italic text-xl font-['Permanent_Marker']">M</span>
                                </div>
                                <span className="text-2xl font-black tracking-wider text-white font-['Permanent_Marker']">Mandala Arena</span>
                            </div>
                            <p className="text-slate-400 font-medium max-w-sm mb-8">
                                Platform booking fasilitas olahraga premium yang praktis dan modern. Pusat kontrol untuk jadwal latihan fisik harian tim anda.
                            </p>
                            <div className="flex justify-center md:justify-start gap-4">
                                <a href="https://www.instagram.com/mandalaarena" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-[#E1306C] hover:text-white hover:border-[#E1306C] hover:shadow-lg hover:shadow-[#E1306C]/30 transition-all">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                                    </svg>
                                </a>
                                <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-[#25D366] hover:text-white hover:border-[#25D366] hover:shadow-lg hover:shadow-[#25D366]/30 transition-all">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path fillRule="evenodd" d="M12 2A10 10 0 002 12c0 1.77.46 3.43 1.26 4.88L2 22l5.24-1.22A9.97 9.97 0 0012 22a10 10 0 0010-10A10 10 0 0012 2zm.05 18H12a8.03 8.03 0 01-4.08-1.12l-.3-.17-3.03.7.8-2.91-.18-.28A8 8 0 014 12c0-4.42 3.6-8 8.05-8 4.43 0 8.05 3.6 8.05 8S16.48 20 12.05 20zm4.56-6.1c-.25-.13-1.48-.73-1.7-.81-.23-.08-.4-.13-.57.13-.17.25-.65.81-.8.98-.14.16-.3.18-.55.05-1.13-.55-2.02-1.04-2.8-2.35-.15-.25 0-.38.12-.5.12-.11.25-.3.38-.45.12-.16.17-.26.25-.45.08-.18.04-.34-.02-.46-.06-.13-.57-1.39-.78-1.9-.2-.51-.41-.44-.57-.44h-.47c-.17 0-.46.06-.7.31s-.9.88-.9 2.15.93 2.5 1.05 2.68c.13.16 1.83 2.8 4.43 3.9 .62.26 1.11.42 1.49.54.63.2 1.2.17 1.65.1.5-.07 1.48-.6 1.69-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.28z" clipRule="evenodd" />
                                    </svg>
                                </a>
                                <a href="mailto:contact@mandalaarena.com" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-[#EA4335] hover:text-white hover:border-[#EA4335] hover:shadow-lg hover:shadow-[#EA4335]/30 transition-all">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </a>
                                <a href="https://maps.app.goo.gl/9RkguMERWbxZiMpx8" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-[#DB4437] hover:text-white hover:border-[#DB4437] hover:shadow-lg hover:shadow-[#DB4437]/30 transition-all">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        <div className="text-center md:text-right">
                            <h4 className="text-white font-black uppercase tracking-widest mb-6 italic">Kontak Sentral</h4>
                            <ul className="space-y-3 text-slate-400 font-medium">
                                <li>📍 Jalan Jenderal Sudirman, Mandala Residence Blok H 2, Kecamatan Garut Kota, Kabupaten Garut</li>
                                <li>📞 +62 812 3456 7890</li>
                                <li>✉️ contact@mandalaarena.com</li>
                            </ul>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 text-center">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em]">
                            © {new Date().getFullYear()} Mandala Arena Base. Hak Cipta Dilindungi Undang-Undang.
                        </p>
                    </div>
                </footer>

                {/* Chatbot Floating in Bottom Right */}
                <Chatbot />
            </div>
        </>
    );
}

function FeatureCard({ icon, title, desc }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white p-10 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/50 text-center hover:border-[#38BDF8]/30 transition-all"
        >
            <div className="w-16 h-16 bg-slate-50 text-4xl flex items-center justify-center rounded-2xl mx-auto mb-6 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-xl font-black italic text-slate-900 uppercase tracking-tight mb-4">{title}</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
                {desc}
            </p>
        </motion.div>
    );
}
