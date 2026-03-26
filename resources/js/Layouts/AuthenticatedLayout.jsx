import { Head, Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import ThemeToggle from '@/Components/ThemeToggle';
import Chatbot from '@/Components/Chatbot';

/* ── SVG Icons ── */
const Icons = {
    dashboard: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    calendar: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    manage: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    profile: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    logout: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
    users: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    shoppingBag: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 11-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
};

export default function AuthenticatedLayout({ children, showSidebar = true }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const isAdmin = user?.role === 'admin';

    // Auto-suppress sidebar if Guest pilot is detected
    const sidebarVisible = showSidebar && !!user;

    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (sidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [sidebarOpen]);

    const closeSidebar = () => setSidebarOpen(false);

    const SidebarContent = () => (
        <div className="flex flex-col h-full border-r overflow-hidden transition-colors duration-300"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>

            {/* Logo */}
            <div className="px-6 py-8 border-b flex-shrink-0 flex items-center justify-between"
                style={{ borderColor: 'var(--border)' }}>
                <Link href="/" className="flex items-center gap-3 group" onClick={closeSidebar}>
                    <div className="w-10 h-10 bg-[#38BDF8] rounded-xl flex items-center justify-center shadow-md shadow-[#38BDF8]/30">
                        <span className="text-white font-black italic text-xl">M</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-black tracking-tight uppercase italic dark:text-white leading-none"
                            style={{ color: 'var(--text-primary)' }}>Mandala</span>
                        <span className="text-[#38BDF8] text-[10px] font-black tracking-[0.4em] uppercase leading-none mt-1 italic">Arena</span>
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
                        <span className="font-bold text-[11px] uppercase tracking-widest italic" style={{ color: 'var(--text-primary)' }}>Dashboard</span>
                        <span className="text-[9px] normal-case leading-tight tracking-normal font-medium" style={{ color: 'var(--text-secondary)' }}>Status Akun</span>
                    </div>
                </SideNavItem>

                {!isAdmin && (
                    <SideNavItem href={route('bookings.index')} active={route().current('bookings.*')} icon={Icons.calendar}>
                        <div className="flex flex-col gap-1">
                            <span className="font-bold text-[11px] uppercase tracking-widest italic" style={{ color: 'var(--text-primary)' }}>Riwayat Booking</span>
                            <span className="text-[9px] normal-case leading-tight tracking-normal font-medium" style={{ color: 'var(--text-secondary)' }}>Daftar pesanan Anda</span>
                        </div>
                    </SideNavItem>
                )}

                {!isAdmin && (
                    <SideNavItem href={route('facilities.public')} active={route().current('facilities.public') || route().current('facility.show')} icon={Icons.calendar}>
                        <div className="flex flex-col gap-1">
                            <span className="font-bold text-[11px] uppercase tracking-widest italic" style={{ color: 'var(--text-primary)' }}>Fasilitas Arena</span>
                            <span className="text-[9px] normal-case leading-tight tracking-normal font-medium" style={{ color: 'var(--text-secondary)' }}>Booking lapangan</span>
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

                {!isAdmin && (
                    <SideNavItem href={route('user.rewards.index')} active={route().current('user.rewards.*')} icon={Icons.shoppingBag}>
                        <div className="flex flex-col gap-1">
                            <span className="font-bold text-[11px] uppercase tracking-widest italic" style={{ color: 'var(--text-primary)' }}>Reward Market</span>
                            <span className="text-[9px] normal-case leading-tight tracking-normal font-medium" style={{ color: 'var(--text-secondary)' }}>Tukar poin loyalty</span>
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
                        <SideNavItem href={route('admin.chatbot.index')} active={route().current('admin.chatbot.*')} icon={Icons.manage}>
                            <div className="flex flex-col gap-1">
                                <span className="font-bold text-[11px] uppercase tracking-widest italic" style={{ color: 'var(--text-primary)' }}>Chatbot NLP</span>
                                <span className="text-[9px] normal-case leading-tight tracking-normal font-medium" style={{ color: 'var(--text-secondary)' }}>Kamus slank & greeting</span>
                            </div>
                        </SideNavItem>
                    </>
                )}
            </nav>

            {/* Bottom: User Info */}
            {user ? (
                <div className="flex-shrink-0 border-t p-4 transition-colors"
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
                <div className="flex-shrink-0 border-t p-6 transition-colors"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <Link href={route('login')}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-[#38BDF8] text-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-lg shadow-[#38BDF8]/20 group">
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] italic">Akses Terminal</span>
                        <span className="group-hover:translate-x-1 transition-transform">{Icons.profile}</span>
                    </Link>
                </div>
            )}
        </div>
    );

    // Layout Container
    const { flash } = usePage().props;

    return (
        <div className="min-h-screen transition-colors duration-300"
            style={{ background: 'var(--bg-base)' }}>

            {/* Flash Overlay */}
            <AnimatePresence>
                {flash?.message && (
                    <motion.div
                        initial={{ opacity: 0, y: -40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] w-full max-w-sm px-4"
                    >
                        <div className={`p-6 rounded-[2rem] border-2 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-6 ${flash?.type === 'error' ? 'bg-rose-500/10 border-rose-500 text-rose-500 shadow-rose-500/20' : 'bg-[#38BDF8]/10 border-[#38BDF8] text-[#38BDF8] shadow-[#38BDF8]/20'}`}>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] mb-1 italic">Tactical Update</span>
                                <p className="text-sm font-black italic uppercase tracking-tight">{flash.message}</p>
                            </div>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Header Nav (Only if sidebar exists) */}
            {sidebarVisible && (
                <header className="lg:hidden fixed inset-x-0 top-0 z-50 h-16 flex items-center justify-between px-6 border-b transition-all backdrop-blur-md"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#38BDF8] rounded-xl flex items-center justify-center shadow-lg shadow-[#38BDF8]/30">
                            <span className="text-white font-black italic text-lg leading-none">M</span>
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest italic" style={{ color: 'var(--text-primary)' }}>Mandala</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <button onClick={() => setSidebarOpen(true)} className="p-2 -mr-2" style={{ color: 'var(--text-primary)' }}>
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                        </button>
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
                                onClick={closeSidebar} className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden" />
                            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                                className="fixed inset-y-0 left-0 z-[70] w-[280px] lg:hidden origin-left"
                                style={{ background: 'var(--bg-card)', borderRight: '1px solid var(--border)' }}>
                                <SidebarContent />
                            </motion.aside>
                        </>
                    )}
                </AnimatePresence>

                {/* MAIN CONTENT AREA */}
                <main className={`flex-1 w-full ${sidebarVisible ? 'pt-16 lg:pt-0' : 'pt-0'}`}>
                    <div className={`${sidebarVisible ? 'p-4 lg:p-12' : ''} max-w-[1600px] mx-auto`}>
                        {children}
                    </div>
                </main>
            </div>

            {/* Always Shown Floating Controls */}
            <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-4">
                <div className="shadow-2xl rounded-full overflow-hidden">
                    <ThemeToggle />
                </div>
                <Chatbot />
            </div>
        </div>
    );
}

function SideNavItem({ href, active, icon, children }) {
    return (
        <Link href={href}
            className={`group flex items-center gap-4 px-6 py-4 transition-all relative ${active ? 'bg-[#38BDF8]/5' : ''}`}>
            {active && (
                <motion.div layoutId="nav-active" className="absolute left-0 w-1.5 h-8 bg-[#38BDF8] rounded-r-full shadow-glow-blue" />
            )}
            <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${active ? 'bg-[#38BDF8] text-white shadow-lg shadow-[#38BDF8]/30 scale-105' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600 dark:bg-slate-800'}`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                {children}
            </div>
        </Link>
    );
}
