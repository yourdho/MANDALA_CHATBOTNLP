import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import Chatbot from '@/Components/Chatbot';
import ThemeToggle from '@/Components/ThemeToggle';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

/* ── Custom SVGs for Socials ── */
const Icons = {
    instagram: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.31.975.975 1.247 2.242 1.31 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.063 1.366-.335 2.633-1.31 3.608-.975.975-2.242 1.247-3.608 1.31-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.063-2.633-.335-3.608-1.31-.975-.975-1.247-2.242-1.31-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.334-2.633 1.31-3.608.975-.975 2.242-1.247 3.608-1.31 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-4.717 2.924-4.869 4.869-.058 1.281-.072 1.688-.072 4.947s.014 3.668.072 4.947c.152 1.944.511 4.67 4.869 4.869 1.281.058 1.688.072 4.947.072s3.668-.014 4.947-.072c4.357-.199 4.717-2.924 4.869-4.869.058-1.281.072-1.688.072-4.947s-.014-3.668-.072-4.947c-.152-1.944-.511-4.669-4.869-4.869-1.281-.058-1.688-.072-4.947-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
    ),
    whatsapp: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.766-5.764-5.766zm3.392 8.221c-.142.399-.833.723-1.141.774-.285.051-.613.082-.994-.039-.233-.073-.539-.169-.991-.355-1.924-.788-3.137-2.722-3.235-2.852-.097-.13-.807-1.077-.807-2.062s.521-1.469.707-1.676c.186-.206.408-.258.544-.258.136 0 .272.003.39.01.12.007.281-.045.44.337.162.39.551 1.336.6 1.439.049.103.082.224.013.355-.069.13-.157.283-.313.456-.156.173-.328.385-.168.658.16.272.71 1.171 1.522 1.892.684.608 1.265.798 1.543.917.278.12.441.101.608-.091.168-.192.712-.826.903-1.11.192-.284.383-.24.646-.142.263.099 1.666.784 1.954.929.288.146.48.217.55.337.072.12.072.699-.071 1.098z" />
        </svg>
    ),
    gmail: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    ),
    location: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    )
};

export default function Welcome({ auth }) {
    const user = auth.user;

    return (
        <AuthenticatedLayout showSidebar={false} showChatbot={false}>
            <Head>
                <title>Mandala Arena - Booking Olahraga Modern</title>
                <link href="https://fonts.googleapis.com/css2?family=Rock+Salt&display=swap" rel="stylesheet" />
            </Head>

            <div className="min-h-screen font-sans selection:bg-[#38BDF8] selection:text-white transition-colors duration-300"
                style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>

                {/* ── HORIZONTAL NAVBAR ── */}
                <nav className="fixed inset-x-0 top-0 z-[60] h-20 flex items-center justify-between px-6 lg:px-20 border-b backdrop-blur-md transition-all"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#38BDF8] rounded-xl flex items-center justify-center shadow-lg shadow-[#38BDF8]/30">
                            <span className="text-white font-black italic text-xl leading-none">M</span>
                        </div>
                        <span className="text-xl font-black uppercase tracking-tighter italic hidden sm:block"
                            style={{ color: 'var(--text-primary)' }}>Mandala <span className="text-[#38BDF8]">Arena</span></span>
                    </div>

                    <div className="flex items-center gap-4 lg:gap-8">
                        <div className="hidden md:flex items-center gap-8">
                            <Link href={route('facilities.public')} className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-[#38BDF8] transition-colors" style={{ color: 'var(--text-secondary)' }}>Semua Arena</Link>
                            <Link href={route('matchmaking.index')} className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-[#38BDF8] transition-colors" style={{ color: 'var(--text-secondary)' }}>Cari Lawan</Link>
                        </div>

                        <div className="h-8 w-[1px] bg-white/5 mx-2 hidden sm:block" />

                        <div className="flex items-center gap-3">
                            <ThemeToggle />
                            {user ? (
                                <Link href={route('dashboard')} className="px-6 py-2.5 bg-slate-900 border border-white/5 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#FACC15] hover:text-slate-900 transition-all shadow-lg">
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('login')} className="text-[10px] font-black uppercase tracking-widest px-4 py-2 hover:text-[#38BDF8] transition-colors" style={{ color: 'var(--text-primary)' }}>
                                        Masuk
                                    </Link>
                                    <Link href={route('register')} className="px-6 py-2.5 bg-[#38BDF8] text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-lg shadow-[#38BDF8]/20">
                                        Daftar
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                <main className="pt-20">
                    {/* ──────────── HERO SECTION ──────────── */}
                    <section className="relative pt-32 pb-24 lg:pt-56 lg:pb-40 px-6 lg:px-20 overflow-hidden"
                        style={{ background: 'var(--bg-base)' }}>
                        <div className="absolute inset-0 w-full h-full opacity-30 pointer-events-none">
                            <img src="https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=1600&q=80" alt="Sports Background" className="w-full h-full object-cover scale-110 grayscale brightness-50" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)] via-transparent to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-base)] via-transparent to-transparent opacity-60" />
                        </div>
                        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[#38BDF8]/10 rounded-full blur-[100px]" />
                        <div className="absolute bottom-0 -left-20 w-[400px] h-[400px] bg-[#FACC15]/10 rounded-full blur-[100px]" />

                        <div className="max-w-7xl mx-auto relative z-10 text-center px-4">
                            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">

                                <motion.h1
                                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                    className="text-[12vw] sm:text-7xl md:text-9xl lg:text-[12rem] font-['Rock_Salt'] font-normal leading-[0.85] tracking-tighter mb-12 drop-shadow-2xl -rotate-2 sm:-rotate-6"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    Mandala <br className="xl:hidden" />
                                    <span className="text-[#38BDF8] relative inline-block">
                                        Arena
                                        <div className="absolute -bottom-1 sm:-bottom-4 left-0 w-full h-1 sm:h-6 bg-[#FACC15] -z-10 -skew-x-[30deg] opacity-90" />
                                    </span>
                                </motion.h1>
                                <p className="text-base sm:text-lg md:text-xl font-medium mb-12 max-w-2xl mx-auto px-4"
                                    style={{ color: 'var(--text-secondary)' }}>

                                </p>
                                <div className="flex flex-col sm:flex-row justify-center gap-4 px-6">
                                    <Link href={route('facilities.public')} className="w-full sm:w-auto px-8 py-5 bg-[#38BDF8] text-slate-900 font-black rounded-full hover:bg-slate-900 hover:text-white hover:scale-105 transition-all uppercase tracking-widest text-xs md:text-sm shadow-lg shadow-[#38BDF8]/20 flex items-center justify-center gap-2 italic">
                                        Mulai Booking Sekarang
                                    </Link>
                                    <a href="https://mandalaarenavt.com/?utm_source=ig&utm_medium=social&utm_content=link_in_bio" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto px-8 py-5 bg-[#FACC15] text-slate-900 font-black rounded-full hover:scale-105 transition-all uppercase tracking-widest text-xs md:text-sm shadow-lg shadow-[#FACC15]/20 flex items-center justify-center gap-2 italic">
                                        VR Tour Lokasi
                                    </a>
                                </div>
                            </motion.div>
                        </div>
                    </section>
                </main>

                {/* ──────────── FOOTER ──────────── */}
                <footer className="pt-20 pb-10 px-6 lg:px-20 border-t-4 border-[#38BDF8]"
                    style={{ background: 'var(--bg-card)' }}>
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center sm:items-start gap-12">
                        <div className="text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-4 mb-6 group">
                                <div className="w-12 h-12 bg-[#38BDF8] rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
                                    <span className="text-white font-black italic text-xl">M</span>
                                </div>
                                <span className="text-3xl font-black tracking-tight uppercase italic"
                                    style={{ color: 'var(--text-primary)' }}>Mandala Arena</span>
                            </div>
                            <p className="font-medium max-w-sm mb-8"
                                style={{ color: 'var(--text-secondary)' }}>
                                Platform booking fasilitas olahraga premium yang praktis dan modern. Pusat kendali untuk jadwal latihan rutin tim Anda.
                            </p>

                            {/* SOCIAL BUTTONS */}
                            <div className="flex justify-center md:justify-start gap-4">
                                <SocialLink icon={Icons.instagram} href="https://www.instagram.com/mandalaarena" color="#E1306C" label="Instagram" />
                                <SocialLink icon={Icons.whatsapp} href="https://wa.me/6287892312759" color="#25D366" label="WhatsApp" />
                                <SocialLink icon={Icons.gmail} href="mailto:contact@mandalaarena.com" color="#EA4335" label="Gmail" />
                                <SocialLink icon={Icons.location} href="https://maps.app.goo.gl/9RkguMERWbxZiMpx8" color="#38BDF8" label="Google Maps" />
                            </div>
                        </div>

                        <div className="text-center md:text-right">
                            <h4 className="font-black uppercase tracking-widest mb-6 italic"
                                style={{ color: 'var(--text-primary)' }}>Kontak Pusat</h4>
                            <ul className="space-y-3 font-medium"
                                style={{ color: 'var(--text-secondary)' }}>
                                <li className="text-sm"> Jalan Jenderal Sudirman, Mandala Residence Blok H 2,<br />Kecamatan Garut Kota, Kabupaten Garut</li>
                                <li> 087892312759</li>
                                <li className="flex items-center justify-center md:justify-end gap-2">
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em]"
                            style={{ color: 'var(--text-secondary)' }}>
                            © {new Date().getFullYear()} Mandala Arena Base. Hak Cipta Dilindungi Undang-Undang.
                        </p>
                    </div>
                </footer>


            </div>
        </AuthenticatedLayout>
    );
}

function SocialLink({ icon, href, color, label }) {
    return (
        <motion.a
            whileHover={{ y: -3, scale: 1.1 }}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-lg group relative"
            style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            title={label}
        >
            <div className="group-hover:text-white transition-colors" style={{ color: 'inherit' }}>
                {icon}
            </div>
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity" />
        </motion.a>
    );
}

