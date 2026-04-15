import { Head, Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import ThemeToggle from '@/Components/UI/ThemeToggle';
import Chatbot from '@/Components/Chatbot';

/* -- SVG Icons -- */
const Icons = {
    dashboard: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    calendar: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    manage: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    profile: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    logout: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
    users: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    shoppingBag: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 11-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
    home: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    blog: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>,
    location: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
};

export default function AuthenticatedLayout({ children, showSidebar = true, showChatbot = true }) {
    const { auth, flash } = usePage().props;
    const user = auth?.user;
    const isAdmin = user?.role === 'admin';

    // Auto-suppress sidebar if Guest member is detected
    const sidebarVisible = showSidebar && !!user;

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showFlash, setShowFlash] = useState(false);

    // Auto-dismiss Flash Message
    useEffect(() => {
        if (flash?.message) {
            setShowFlash(true);
            const timer = setTimeout(() => {
                setShowFlash(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [flash?.message]);

    useEffect(() => {
        if (sidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [sidebarOpen]);

    const closeSidebar = () => setSidebarOpen(false);

    // Mobile Swipe-Back Support Fallback
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

    const SidebarContent = () => (
        <div className="flex flex-col h-full border-r overflow-hidden transition-colors duration-300"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>

            {/* Logo */}
            <div className="px-6 py-8 border-b flex-shrink-0 flex items-center justify-between"
                style={{ borderColor: 'var(--border)' }}>
                <Link href="/" className="flex items-center gap-3 group" onClick={closeSidebar}>
                    <img src="/aset_foto/logo_mandala.png" alt="Mandala Arena Logo" className="h-14 w-auto object-contain drop-shadow-lg transition-transform group-hover:scale-110" />
                    <div className="flex flex-col">
                        <span className="text-2xl font-light tracking-tight italic dark:text-white leading-none"
                            style={{ color: 'var(--text-primary)', fontFamily: '"Poppins", sans-serif', fontFeatureSettings: '"ss01", "ss02"' }}>Mandala</span>
                        <span className="text-[#38BDF8] text-xs font-light tracking-[0.4em] italic leading-none mt-1"
                            style={{ fontFamily: '"Poppins", sans-serif', fontFeatureSettings: '"ss01", "ss02"' }}>Arena</span>
                    </div>
                </Link>
                <div className="lg:hidden">
                    <ThemeToggle />
                </div>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 overflow-y-auto py-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

                <SideNavItem href={route('dashboard')} active={route().current('dashboard')} icon={Icons.dashboard}>
                    <div className="flex flex-col gap-1">
                        <span className="font-bold text-[11px] uppercase tracking-widest italic" style={{ color: 'var(--text-primary)' }}>Menu</span>
                        <span className="text-[9px] normal-case leading-tight tracking-normal font-medium" style={{ color: 'var(--text-secondary)' }}>Status Akun</span>
                    </div>
                </SideNavItem>

                {!isAdmin && (
                    <SideNavItem href={route('facilities.public')} active={route().current('facilities.public') || route().current('facility.show')} icon={Icons.calendar}>
                        <div className="flex flex-col gap-1">
                            <span className="font-bold text-[11px] uppercase tracking-widest italic" style={{ color: 'var(--text-primary)' }}>Fasilitas Arena</span>
                            <span className="text-[9px] normal-case leading-tight tracking-normal font-medium" style={{ color: 'var(--text-secondary)' }}>Booking lapangan</span>
                        </div>
                    </SideNavItem>
                )}

                {!isAdmin && (
                    <SideNavItem href={route('bookings.index')} active={route().current('bookings.*')} icon={Icons.calendar}>
                        <div className="flex flex-col gap-1">
                            <span className="font-bold text-[11px] uppercase tracking-widest italic" style={{ color: 'var(--text-primary)' }}>Riwayat Booking</span>
                            <span className="text-[9px] normal-case leading-tight tracking-normal font-medium" style={{ color: 'var(--text-secondary)' }}>Daftar pesanan Anda</span>
                        </div>
                    </SideNavItem>
                )}

                {!isAdmin && (
                    <SideNavItem href={route('matchmaking.index')} active={route().current('matchmaking.*')} icon={Icons.users}>
                        <div className="flex flex-col gap-1">
                            <span className="font-bold text-[11px] uppercase tracking-widest italic" style={{ color: 'var(--text-primary)' }}>Cari Lawan Main</span>
                            <span className="text-[9px] normal-case leading-tight tracking-normal font-medium" style={{ color: 'var(--text-secondary)' }}>Sparing & Matchmaking</span>
                        </div>
                    </SideNavItem>
                )}

                <SideNavItem isExternal={true} href="https://mandalaarenavt.com/?utm_source=ig&utm_medium=social&utm_content=link_in_bio" active={false} icon={Icons.location}>
                    <div className="flex flex-col gap-1">
                        <span className="font-bold text-[11px] uppercase tracking-widest italic" style={{ color: 'var(--text-primary)' }}>VR Tour Lokasi</span>
                        <span className="text-[9px] normal-case leading-tight tracking-normal font-medium" style={{ color: 'var(--text-secondary)' }}>Lihat kondisi arena 360°</span>
                    </div>
                </SideNavItem>

                {!isAdmin && (
                    <SideNavItem href={route('user.rewards.index')} active={route().current('user.rewards.*')} icon={Icons.shoppingBag}>
                        <div className="flex flex-col gap-1">
                            <span className="font-bold text-[11px] uppercase tracking-widest italic" style={{ color: 'var(--text-primary)' }}>Promo diskon</span>
                            <span className="text-[9px] normal-case leading-tight tracking-normal font-medium" style={{ color: 'var(--text-secondary)' }}>Tukar poin loyalty</span>
                        </div>
                    </SideNavItem>
                )}

                {!isAdmin && (
                    <SideNavItem href={route('blog.index')} active={route().current('blog.*')} icon={Icons.dashboard}>
                        <div className="flex flex-col gap-1">
                            <span className="font-bold text-[11px] uppercase tracking-widest italic" style={{ color: 'var(--text-primary)' }}>Mandala Blog</span>
                            <span className="text-[9px] normal-case leading-tight tracking-normal font-medium" style={{ color: 'var(--text-secondary)' }}>Berita & Artikel Arena</span>
                        </div>
                    </SideNavItem>
                )}

                {isAdmin && (
                    <>
                        <div className="px-8 mt-12 mb-8">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em]"
                                style={{ color: 'var(--text-secondary)' }}>Administrator Area</p>
                        </div>
                        <SideNavItem href={route('admin.bookings.manage')} active={route().current('admin.bookings.*')} icon={Icons.calendar}>
                            <div className="flex flex-col gap-1">
                                <span className="font-bold text-[11px] uppercase tracking-widest italic" style={{ color: 'var(--text-primary)' }}>Kelola Booking</span>
                                <span className="text-[9px] normal-case leading-tight tracking-normal font-medium" style={{ color: 'var(--text-secondary)' }}>Log seluruh arena</span>
                            </div>
                        </SideNavItem>
                        <SideNavItem href={route('admin.facilities.index')} active={route().current('admin.facilities.*')} icon={Icons.manage}>
                            <div className="flex flex-col gap-1">
                                <span className="font-bold text-[11px] uppercase tracking-widest italic" style={{ color: 'var(--text-primary)' }}>Edit Fasilitas</span>
                                <span className="text-[9px] normal-case leading-tight tracking-normal font-medium" style={{ color: 'var(--text-secondary)' }}>Edit lapangan & jam</span>
                            </div>
                        </SideNavItem>

                        <SideNavItem href={route('admin.pricing.index')} active={route().current('admin.pricing.*')} icon={Icons.manage}>
                            <div className="flex flex-col gap-1">
                                <span className="font-bold text-[11px] uppercase tracking-widest italic" style={{ color: 'var(--text-primary)' }}>Setelan Pembayaran</span>
                                <span className="text-[9px] normal-case leading-tight tracking-normal font-medium" style={{ color: 'var(--text-secondary)' }}>Edit No Rekening & QRIS</span>
                            </div>
                        </SideNavItem>

                        <SideNavItem href={route('admin.reports.index')} active={route().current('admin.reports.*')} icon={Icons.dashboard}>
                            <div className="flex flex-col gap-1">
                                <span className="font-bold text-[11px] uppercase tracking-widest italic" style={{ color: 'var(--text-primary)' }}>Laporan</span>
                                <span className="text-[9px] normal-case leading-tight tracking-normal font-medium" style={{ color: 'var(--text-secondary)' }}>Export data keuangan</span>
                            </div>
                        </SideNavItem>
                        <SideNavItem href={route('admin.users.index')} active={route().current('admin.users.*')} icon={Icons.profile}>
                            <div className="flex flex-col gap-1">
                                <span className="font-bold text-[11px] uppercase tracking-widest italic" style={{ color: 'var(--text-primary)' }}>Staff & User</span>
                                <span className="text-[9px] normal-case leading-tight tracking-normal font-medium" style={{ color: 'var(--text-secondary)' }}>Manajemen personnel</span>
                            </div>
                        </SideNavItem>
                        <SideNavItem href={route('admin.rewards.index')} active={route().current('admin.rewards.*')} icon={Icons.manage}>
                            <div className="flex flex-col gap-1">
                                <span className="font-bold text-[11px] uppercase tracking-widest italic" style={{ color: 'var(--text-primary)' }}>Pusat Promo</span>
                                <span className="text-[9px] normal-case leading-tight tracking-normal font-medium" style={{ color: 'var(--text-secondary)' }}>Voucher & Poin</span>
                            </div>
                        </SideNavItem>
                        <SideNavItem href={route('admin.blog.index')} active={route().current('admin.blog.index') || route().current('admin.blog.create') || route().current('admin.blog.edit') || route().current('admin.blog_categories.*')} icon={Icons.dashboard}>
                            <div className="flex flex-col gap-1">
                                <span className="font-bold text-[11px] uppercase tracking-widest italic" style={{ color: 'var(--text-primary)' }}>Blog Artikel</span>
                                <span className="text-[9px] normal-case leading-tight tracking-normal font-medium" style={{ color: 'var(--text-secondary)' }}>Mading informasi User</span>
                            </div>
                        </SideNavItem>
                    </>
                )
                }
            </nav >

            {/* Bottom: User Info */}
            {
                user ? (
                    <div className="flex-shrink-0 border-t p-4 pb-28 lg:pb-4 transition-colors"
                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                        <Link href={route('profile.edit')} className="flex items-center gap-3 mb-4 p-2 rounded-xl hover:bg-[#38BDF8]/5 transition-all group">
                            <div className="flex-shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center text-[#38BDF8] font-black text-xl uppercase shadow-sm group-hover:scale-105 transition-transform"
                                style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}>
                                {user?.name?.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-black uppercase tracking-wider truncate leading-none mb-1 group-hover:text-[#38BDF8] transition-colors"
                                    style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] font-bold truncate uppercase tracking-widest leading-none"
                                        style={{ color: 'var(--text-secondary)' }}>{user?.role}</span>
                                    {user?.role === 'user' && (
                                        <>
                                            <span className="w-1 h-1 rounded-full opacity-30" style={{ background: 'var(--text-secondary)' }} />
                                            <span className="text-[9px] font-black text-[#FACC15] uppercase tracking-widest leading-none"> {user?.points_balance || 0} Poin</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </Link>

                        <Link href={route('logout')} method="post" as="button"
                            className="w-full flex items-center justify-between px-6 py-4 rounded-2xl bg-slate-900 text-white hover:bg-[#FACC15] hover:text-slate-900 transition-all shadow-lg shadow-black/5 group">
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] italic">Log Out</span>
                            <span className="group-hover:translate-x-1 transition-transform">{Icons.logout}</span>
                        </Link>
                    </div>
                ) : (
                    <div className="flex-shrink-0 border-t p-6 pb-28 lg:pb-6 transition-colors"
                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                        <Link href={route('login')}
                            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-[#38BDF8] text-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-lg shadow-[#38BDF8]/20 group">
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] italic">Login</span>
                            <span className="group-hover:translate-x-1 transition-transform">{Icons.profile}</span>
                        </Link>
                    </div>
                )
            }
        </div >
    );


    return (
        <div className="min-h-screen transition-colors duration-300"
            style={{ background: 'var(--bg-base)' }}>

            {/* Flash Overlay */}
            <AnimatePresence>
                {showFlash && flash?.message && (
                    <motion.div
                        initial={{ opacity: 0, y: -40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] w-full max-w-sm px-4"
                    >
                        <div className={`p-6 rounded-[2rem] border-2 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6 ${flash?.type === 'error' ? 'bg-rose-500/10 border-rose-500 text-rose-500 shadow-rose-500/20' : 'bg-[#38BDF8]/10 border-[#38BDF8] text-[#38BDF8] shadow-[#38BDF8]/20'}`}>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] mb-1 italic">Tactical Update</span>
                                <p className="text-sm font-black italic uppercase tracking-tight">{flash.message}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                {flash?.wa_link && (
                                    <a
                                        href={flash.wa_link}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-6 py-2 bg-[#25D366] text-white font-black rounded-xl text-[9px] uppercase tracking-widest hover:bg-[#128C7E] hover:scale-105 transition-all shadow-md shadow-[#25D366]/30 animate-pulse whitespace-nowrap"
                                    >
                                        Buka WA Admin
                                    </a>
                                )}
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Header Nav (Only if sidebar exists) */}
            {sidebarVisible && (
                <header className="lg:hidden fixed inset-x-0 top-0 z-50 h-16 flex items-center justify-between px-6 border-b transition-all backdrop-blur-md"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <Link href="/" className="flex items-center gap-2">
                        <img src="/aset_foto/logo_mandala.png" alt="Mandala Arena Logo" className="h-10 w-auto object-contain drop-shadow-md" />
                        <div className="flex flex-col">
                            <span className="text-base font-light tracking-tight italic dark:text-white leading-none"
                                style={{ color: 'var(--text-primary)', fontFamily: '"Poppins", sans-serif', fontFeatureSettings: '"ss01", "ss02"' }}>Mandala</span>
                            <span className="text-[#38BDF8] text-[9px] font-light tracking-[0.4em] italic leading-none mt-0.5"
                                style={{ fontFamily: '"Poppins", sans-serif', fontFeatureSettings: '"ss01", "ss02"' }}>Arena</span>
                        </div>
                    </Link>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                    </div>
                </header>
            )}

            {/* Layout Container */}
            <div className="flex min-h-screen">
                {/* Desktop Sidebar */}
                {sidebarVisible && (
                    <aside className="hidden lg:block w-72 flex-shrink-0 h-screen sticky top-0 border-r"
                        style={{ borderColor: 'var(--border)' }}>
                        <SidebarContent />
                    </aside>
                )}

                {/* Mobile Sidebar Overlay */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={closeSidebar} className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm lg:hidden" />
                            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                                className="fixed inset-y-0 left-0 z-[130] w-[280px] lg:hidden origin-left"
                                style={{ background: 'var(--bg-card)', borderRight: '1px solid var(--border)' }}>
                                <SidebarContent />
                            </motion.aside>
                        </>
                    )}
                </AnimatePresence>

                {/* MAIN CONTENT AREA */}
                <main className={`flex-1 w-full ${sidebarVisible ? 'pt-16 lg:pt-0' : 'pt-0'}`}>
                    <div className={`${sidebarVisible ? 'p-4 lg:p-12 pb-32 lg:pb-12 max-w-[1600px] mx-auto' : 'pb-32 lg:pb-0'}`}>
                        {children}
                    </div>
                </main>
            </div>

            {/* -- TACTICAL MOBILE BOTTOM DOCK -- */}
            <div className="lg:hidden fixed bottom-0 inset-x-0 z-[110] p-4 pointer-events-none">
                <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl backdrop-blur-xl flex items-center justify-around p-2 pointer-events-auto max-w-sm mx-auto">
                    <Link href={route('facilities.public')} className={`p-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${route().current('facilities.public') || route().current('facility.show') ? 'bg-[#38BDF8] text-slate-900' : 'text-slate-400'}`}>
                        <div className="flex-shrink-0">{Icons.calendar}</div>
                        <span className="text-[7px] font-black uppercase tracking-tighter italic">Arena</span>
                    </Link>
                    <Link href={user ? route('bookings.index') : route('matchmaking.index')} className={`p-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${(user ? route().current('bookings.*') : route().current('matchmaking.index')) ? 'bg-[#38BDF8] text-slate-900' : 'text-slate-400'}`}>
                        <div className="flex-shrink-0">{user ? Icons.calendar : Icons.users}</div>
                        <span className="text-[7px] font-black uppercase tracking-tighter italic">{user ? 'Riwayat' : 'Sparing'}</span>
                    </Link>
                    <Link href={user ? route('dashboard') : '/'} className={`p-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${(user ? route().current('dashboard') : route().current('welcome')) ? 'bg-[#38BDF8] text-slate-900' : 'text-slate-400'}`}>
                        <div className="flex-shrink-0">{Icons.home}</div>
                        <span className="text-[7px] font-black uppercase tracking-tighter italic">Base</span>
                    </Link>
                    <Link href={route('blog.index')} className={`p-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${route().current('blog.index') ? 'bg-[#38BDF8] text-slate-900' : 'text-slate-400'}`}>
                        <div className="flex-shrink-0">{Icons.blog}</div>
                        <span className="text-[7px] font-black uppercase tracking-tighter italic">Blog</span>
                    </Link>
                    <button onClick={() => setSidebarOpen(true)} className={`p-3 rounded-2xl flex flex-col items-center gap-1 transition-all text-slate-400`}>
                        <div className="flex-shrink-0">{Icons.manage}</div>
                        <span className="text-[7px] font-black uppercase tracking-tighter italic">Menu</span>
                    </button>
                </div>
            </div>

            {/* Always Shown Floating Controls */}
            <div className={`fixed bottom-24 right-6 sm:bottom-8 sm:right-8 z-[100] flex flex-col gap-4 overflow-visible`}>
                {showChatbot && <Chatbot />}
            </div>
        </div>
    );
}

function SideNavItem({ href, active, icon, children, isExternal = false }) {
    if (isExternal) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-4 px-6 py-4 rounded-[1.5rem] transition-all relative group overflow-hidden ${active ? 'bg-[#38BDF8] text-slate-950 shadow-[0_10px_30px_rgba(56,189,248,0.3)] z-10' : 'bg-transparent text-slate-500 hover:bg-[#38BDF8]/5 hover:text-[#38BDF8]'}`}>
                <div className={`flex-shrink-0 transition-transform group-hover:scale-110 ${active ? 'text-slate-950' : 'text-slate-400 group-hover:text-[#38BDF8]'}`}>
                    {icon}
                </div>
                <div className="flex-1 truncate">{children}</div>
                {active && <motion.div layoutId="nav-pill" className="absolute right-0 w-1.5 h-8 bg-slate-950 rounded-l-full" />}
            </a>
        );
    }
    return (
        <Link href={href} className={`flex items-center gap-4 px-6 py-4 rounded-[1.5rem] transition-all relative group overflow-hidden ${active ? 'bg-[#38BDF8] text-slate-950 shadow-[0_10px_30px_rgba(56,189,248,0.3)] z-10' : 'bg-transparent text-slate-500 hover:bg-[#38BDF8]/5 hover:text-[#38BDF8]'}`}>
            <div className={`flex-shrink-0 transition-transform group-hover:scale-110 ${active ? 'text-slate-950' : 'text-slate-400 group-hover:text-[#38BDF8]'}`}>
                {icon}
            </div>
            <div className="flex-1 truncate">{children}</div>
            {active && <motion.div layoutId="nav-pill" className="absolute right-0 w-1.5 h-8 bg-slate-950 rounded-l-full" />}
        </Link>
    );
}
