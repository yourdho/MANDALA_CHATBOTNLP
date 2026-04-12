import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import Chatbot from '@/Components/Chatbot';
import ThemeToggle from '@/Components/UI/ThemeToggle';
import AuthenticatedLayout from '@/Components/Layouts/AuthenticatedLayout';
import AutoCarousel from '@/Components/Shared/AutoCarousel';

/* -- Custom SVGs for Socials -- */
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

export default function Welcome({ auth, promos = [], facilities = [], featuredBlog, recentBlogs }) {
    const user = auth.user;

    return (
        <AuthenticatedLayout showSidebar={false} showChatbot={false}>
            <Head>
                <title>Mandala Arena - Booking Olahraga Modern</title>
                <link href="https://fonts.googleapis.com/css2?family=Rock+Salt&family=Outfit:wght@900&display=swap" rel="stylesheet" />
            </Head>

            <div className="min-h-screen font-sans selection:bg-[#38BDF8] selection:text-white transition-colors duration-300"
                style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>

                {/* -- HORIZONTAL NAVBAR -- */}
                <nav className="fixed inset-x-0 top-0 z-[60] h-16 sm:h-20 flex items-center justify-between px-4 sm:px-6 lg:px-20 border-b backdrop-blur-md transition-all"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <Link href="/" className="flex items-center gap-1.5 flex-shrink-0">
                        <img src="/aset_foto/lgo.png" alt="Mandala Arena Logo" className="h-8 sm:h-10 w-auto object-contain drop-shadow-md" />
                        <div className="flex flex-col">
                            <span className="text-sm sm:text-lg font-light tracking-tight italic dark:text-white leading-none"
                                style={{ color: 'var(--text-primary)', fontFamily: '"Poppins", sans-serif', fontFeatureSettings: '"ss01", "ss02"' }}>Mandala</span>
                            <span className="text-[#38BDF8] text-[8px] sm:text-[10px] font-light tracking-[0.4em] italic leading-none mt-0.5 sm:mt-1"
                                style={{ fontFamily: '"Poppins", sans-serif', fontFeatureSettings: '"ss01", "ss02"' }}>Arena</span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-2 sm:gap-4 lg:gap-8">
                        <div className="hidden lg:flex items-center gap-8">
                            <Link href={route('blog.index')} className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-[#38BDF8] transition-colors" style={{ color: 'var(--text-secondary)' }}>Blog</Link>
                            <Link href={route('facilities.public')} className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-[#38BDF8] transition-colors" style={{ color: 'var(--text-secondary)' }}>Semua Arena</Link>
                            <Link href={route('matchmaking.index')} className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-[#38BDF8] transition-colors" style={{ color: 'var(--text-secondary)' }}>Cari Lawan</Link>
                        </div>

                        <div className="h-8 w-[1px] bg-white/5 mx-2 hidden sm:block" />

                        <div className="flex items-center gap-1 sm:gap-3">
                            <div className="scale-[0.65] sm:scale-100 origin-right flex-shrink-0 -mr-2 sm:mr-0">
                                <ThemeToggle />
                            </div>
                            {user ? (
                                <Link href={route('dashboard')} className="px-3 py-2 sm:px-6 sm:py-2.5 bg-slate-900 border border-white/5 text-white rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-[#FACC15] hover:text-slate-900 transition-all shadow-lg flex-shrink-0">
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('login')} className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest px-1.5 sm:px-4 py-2 hover:text-[#38BDF8] transition-colors flex-shrink-0" style={{ color: 'var(--text-primary)' }}>
                                        Masuk
                                    </Link>
                                    <Link href={route('register')} className="px-3 py-2 sm:px-6 sm:py-2.5 bg-[#38BDF8] text-slate-900 rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-lg shadow-[#38BDF8]/20 flex-shrink-0 whitespace-nowrap">
                                        Daftar
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                <main className="pt-20">
                    {/* ------------ HERO SECTION ------------ */}
                    <section className="relative pt-20 pb-12 md:pt-32 lg:pt-56 lg:pb-40 px-6 lg:px-20 overflow-hidden"
                        style={{ background: 'var(--bg-base)' }}>
                        <div className="absolute inset-0 w-full h-full opacity-30 pointer-events-none">
                            <video src="/aset_foto/vid-all-fasilitas.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover scale-110 grayscale brightness-100" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)] via-transparent to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-base)] via-transparent to-transparent opacity-60" />
                        </div>
                        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[#38BDF8]/10 rounded-full blur-[100px]" />
                        <div className="absolute bottom-0 -left-20 w-[400px] h-[400px] bg-[#FACC15]/10 rounded-full blur-[100px]" />

                        <div className="max-w-7xl mx-auto relative z-10 text-center px-4">
                            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">

                                <motion.h1
                                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                    className="text-[12vw] sm:text-7xl md:text-9xl lg:text-[12rem] font-['Rock_Salt'] font-normal leading-[0.85] tracking-tighter mb-4 drop-shadow-2xl -rotate-2 sm:-rotate-6"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    Mandala <br className="xl:hidden" />
                                    <span className="text-[#38BDF8] relative inline-block">
                                        Arena
                                        <div className="absolute -bottom-1 sm:-bottom-4 left-0 w-full h-1 sm:h-6 bg-[#FACC15] -z-10 -skew-x-[15deg] sm:-skew-x-[30deg] opacity-90" />
                                    </span>
                                </motion.h1>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="text-[10px] sm:text-lg md:text-2xl font-['Outfit'] font-black uppercase tracking-[0.4em] sm:tracking-[0.8em] mb-8 md:mb-12 text-[#FACC15] drop-shadow-[0_0_15px_rgba(250,204,21,0.4)] italic"
                                >
                                    Your Sport Station
                                </motion.div>
                                <p className="text-base sm:text-lg md:text-xl font-medium mb-12 max-w-2xl mx-auto px-4"
                                    style={{ color: 'var(--text-secondary)' }}>
                                    Rasakan pengalaman olahraga terbaik dengan fasilitas premium di Garut. Booking mudah, lapangan berkualitas, dan komunitas yang seru.
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

                    {/* ------------ PROMOTIONS SECTION ------------ */}
                    {promos.length > 0 && (
                        <section className="py-24 px-6 lg:px-20 relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
                            <div className="max-w-7xl mx-auto relative z-10">
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                                    <div className="space-y-4">
                                        <motion.p
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            className="text-[10px] font-black text-[#38BDF8] uppercase tracking-[0.4em]"
                                        >
                                            Limited Time Offers
                                        </motion.p>
                                        <motion.h2
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter"
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            Promo <span className="text-[#FACC15]">Spesial</span>
                                        </motion.h2>
                                    </div>
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        className="hidden md:block flex-1 h-[1px] mx-12 bg-gradient-to-r from-[#38BDF8]/20 to-transparent"
                                    />
                                    <Link href={route('register')} className="text-xs font-black uppercase tracking-widest text-[#FACC15] hover:text-white transition-colors flex items-center gap-2 group">
                                        Dapatkan Semua <span className="group-hover:translate-x-1 transition-transform">?</span>
                                    </Link>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {promos.map((promo, i) => (
                                        <motion.div
                                            key={promo.id}
                                            initial={{ opacity: 0, y: 30 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            viewport={{ once: true }}
                                            className="group relative p-8 rounded-[3rem] border transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#38BDF8]/10 overflow-hidden"
                                            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                                        >
                                            {/* Decorative Background */}
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#38BDF8]/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[#38BDF8]/10 transition-colors" />
                                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#FACC15]/5 rounded-full blur-2xl -ml-12 -mb-12 group-hover:bg-[#FACC15]/10 transition-colors" />

                                            <div className="relative z-10 flex flex-col h-full gap-8">
                                                <div className="flex justify-between items-start">
                                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#38BDF8]/20 to-[#38BDF8]/5 flex items-center justify-center text-3xl shadow-inner border border-[#38BDF8]/10">
                                                        ?
                                                    </div>
                                                    {promo.discount_type === 'percentage' && (
                                                        <div className="px-4 py-2 rounded-full bg-[#FACC15] text-slate-900 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#FACC15]/20">
                                                            {promo.discount_value}% OFF
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-4">
                                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-tight" style={{ color: 'var(--text-primary)' }}>
                                                        {promo.title}
                                                    </h3>
                                                    <p className="text-xs font-medium leading-relaxed opacity-70" style={{ color: 'var(--text-secondary)' }}>
                                                        {promo.description}
                                                    </p>
                                                </div>

                                                <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                                                    <Link
                                                        href={user ? route('user.rewards.index') : route('login')}
                                                        className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#38BDF8] hover:text-slate-900 transition-all shadow-md group-hover:scale-105"
                                                    >
                                                        {user ? 'Klaim Sekarang' : 'Daftar & Klaim'}
                                                    </Link>
                                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">
                                                        {promo.valid_until ? `S/D ${new Date(promo.valid_until).toLocaleDateString('id-ID')}` : 'S&K Berlaku'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Hover Border Glow */}
                                            <div className="absolute inset-0 border-2 border-[#38BDF8]/0 group-hover:border-[#38BDF8]/20 rounded-[3rem] transition-all duration-500 pointer-events-none" />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* ------------ FACILITIES SECTION ------------ */}
                    {facilities.length > 0 && (
                        <section className="py-24 px-6 lg:px-20 border-t border-white/5" style={{ background: 'var(--bg-base)' }}>
                            <div className="max-w-7xl mx-auto">
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                                    <div className="space-y-4">
                                        <motion.p initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} className="text-[10px] font-black text-[#FACC15] uppercase tracking-[0.4em]">Elite Arenas</motion.p>
                                        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter" style={{ color: 'var(--text-primary)' }}>
                                            Fasilitas <span className="text-[#38BDF8]">Unggulan</span>
                                        </motion.h2>
                                    </div>
                                    <Link href={route('facilities.public')} className="text-xs font-black uppercase tracking-widest text-[#38BDF8] hover:text-white transition-colors group italic">
                                        Eksplor Semua <span className="group-hover:translate-x-1 transition-transform inline-block">?</span>
                                    </Link>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                    {facilities.map((f, i) => (
                                        <motion.div
                                            key={f.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="rounded-[3rem] overflow-hidden border group transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-[#38BDF8]/5 hover:-translate-y-2"
                                            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                                        >
                                            <div className="relative aspect-[4/5] overflow-hidden bg-slate-900">
                                                <AutoCarousel images={f.images || []} name={f.name} />
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/20 to-transparent opacity-90 pointer-events-none" />

                                                <div className="absolute top-6 left-6 z-20">
                                                    <span className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-[8px] font-black uppercase tracking-widest">
                                                        {f.category}
                                                    </span>
                                                </div>

                                                <div className="absolute bottom-6 left-6 right-6 pointer-events-none z-20 space-y-2">
                                                    <span className="text-2xl md:text-3xl font-black italic text-white uppercase tracking-tighter drop-shadow-lg block">
                                                        {f.name}
                                                    </span>
                                                    <p className="text-[#38BDF8] text-[10px] font-black uppercase tracking-widest italic opacity-90">
                                                        Mulai RP {parseInt(f.price_per_hour).toLocaleString('id-ID')}/JAM
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="p-8 border-t border-white/5">
                                                <Link
                                                    href={route('facility.show', f.id)}
                                                    className="w-full block py-4 bg-[#38BDF8] text-slate-900 font-black rounded-2xl text-center text-[10px] uppercase tracking-widest shadow-xl shadow-[#38BDF8]/20 hover:bg-white transition-all italic active:scale-95"
                                                >
                                                    Booking Sekarang
                                                </Link>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* ------------ BLOGS SECTION ------------ */}
                    {(featuredBlog || (recentBlogs && recentBlogs.length > 0)) && (
                        <section className="py-24 px-6 lg:px-20 border-t border-white/5" style={{ background: 'var(--bg-card)' }}>
                            <div className="max-w-7xl mx-auto">
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 text-center md:text-left">
                                    <div className="space-y-4">
                                        <motion.p initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} className="text-[10px] font-black text-[#A855F7] uppercase tracking-[0.4em]">Update & News</motion.p>
                                        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter" style={{ color: 'var(--text-primary)' }}>
                                            Berita <span className="text-[#A855F7]">Terupdate</span>
                                        </motion.h2>
                                    </div>
                                    <Link href={route('blog.index')} className="text-xs font-black uppercase tracking-widest text-[#A855F7] hover:text-white transition-colors group italic">
                                        Selengkapnya <span className="group-hover:translate-x-1 transition-transform inline-block">?</span>
                                    </Link>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                    {featuredBlog && (
                                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="lg:col-span-7 group cursor-pointer">
                                            <Link href={route('blog.show', featuredBlog.slug)} className="block space-y-6">
                                                <div className="relative aspect-[16/9] rounded-[3.5rem] overflow-hidden border shadow-2xl transition-all duration-700 group-hover:shadow-[#A855F7]/10"
                                                    style={{ borderColor: 'var(--border)' }}>
                                                    <img src={featuredBlog.thumbnail} alt={featuredBlog.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/10 to-transparent" />
                                                    <div className="absolute bottom-10 left-10 right-10">
                                                        <span className="px-4 py-2 rounded-xl bg-[#A855F7] text-white text-[8px] font-black uppercase tracking-widest mb-4 inline-block shadow-lg">Featured Update</span>
                                                        <h3 className="text-xl md:text-3xl font-black italic uppercase tracking-tighter text-white leading-tight shadow-text">{featuredBlog.title}</h3>
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    )}

                                    <div className="lg:col-span-5 flex flex-col gap-8">
                                        {recentBlogs?.map((post, i) => (
                                            <motion.div key={post.id} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="group">
                                                <Link href={route('blog.show', post.slug)} className="flex items-center gap-6 p-4 rounded-[2.5rem] border hover:bg-[#A855F7]/5 transition-all duration-500" style={{ borderColor: 'var(--border)' }}>
                                                    <div className="w-32 h-32 rounded-[1.5rem] overflow-hidden flex-shrink-0 border border-white/5">
                                                        <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" />
                                                    </div>
                                                    <div className="space-y-2 pr-4">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#A855F7]">{new Date(post.created_at).toLocaleDateString()}</p>
                                                        <h4 className="text-sm font-black italic uppercase tracking-tighter leading-tight" style={{ color: 'var(--text-primary)' }}>{post.title}</h4>
                                                    </div>
                                                </Link>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                </main>


                {/* ------------ FOOTER ------------ */}
                <footer className="pt-20 pb-10 px-6 lg:px-20 border-t-4 border-[#38BDF8]"
                    style={{ background: 'var(--bg-card)' }}>
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center sm:items-start gap-12">
                        <div className="text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-1.5 mb-6 group">
                                <img src="/aset_foto/lgo.png" alt="Mandala Arena Logo" className="h-12 w-auto object-contain drop-shadow-md transition-transform group-hover:scale-105" />
                                <span className="text-3xl font-light tracking-tight italic"
                                    style={{ color: 'var(--text-primary)', fontFamily: '"Poppins", sans-serif', fontFeatureSettings: '"ss01", "ss02"' }}>Mandala Arena</span>
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
                            © {new Date().getFullYear()} KPM CORP. Hak Cipta Dilindungi Undang-Undang.
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

