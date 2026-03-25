import { Head, Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import ThemeToggle from '@/Components/ThemeToggle';
import Chatbot from '@/Components/Chatbot';

/* ── SVG Icons ── */
const Icons = {
    dashboard: (
        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    ),
    venues: (
        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
    ),
    bookings: (
        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
    ),
    manage: (
        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    inbox: (
        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
    ),
    profile: (
        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    ),
    logout: (
        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
    ),
    hamburger: (
        <svg className="w-6 h-6 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
    ),
    close: (
        <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
};

function SideNavItem({ href, active, icon, children, badge }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all group ${active
                ? 'bg-[#38BDF8] text-white shadow-lg shadow-[#38BDF8]/20'
                : 'text-slate-500 hover:text-[#38BDF8] hover:bg-[#38BDF8]/5 bg-transparent'
                }`}
        >
            <span className="flex-shrink-0 w-5 flex items-center justify-center">{icon}</span>
            <span className="flex-1">{children}</span>
            {badge > 0 && (
                <span className="rounded-full bg-[#FACC15] text-amber-900 text-[9px] font-black min-w-[20px] h-5 flex items-center justify-center px-1 shadow-sm">
                    {badge}
                </span>
            )}
        </Link>
    );
}

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isAdmin = user?.role === 'admin';
    const isUser = user?.role === 'user';

    const closeSidebar = () => setSidebarOpen(false);

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-white border-r border-slate-100 overflow-hidden">
            {/* Logo */}
            <div className="px-8 py-10 border-b border-slate-50 flex-shrink-0 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-4 group" onClick={closeSidebar}>
                    <div className="w-12 h-12 bg-[#38BDF8] rounded-xl flex items-center justify-center shadow-md shadow-[#38BDF8]/30">
                        <span className="text-white font-black italic text-2xl">M</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black tracking-tight text-slate-900 uppercase italic dark:text-white leading-none">Mandala</span>
                        <span className="text-[#38BDF8] text-[9px] font-black tracking-[0.4em] uppercase leading-none mt-1.5 italic">Arena</span>
                    </div>
                </Link>
                <ThemeToggle />
            </div>

            {/* Nav Items */}
            <nav className="flex-1 overflow-y-auto px-5 py-8 space-y-2">
                <SideNavItem href={route('dashboard')} active={route().current('dashboard')} icon={Icons.dashboard}>
                    Home
                </SideNavItem>

                {isUser && (
                    <>
                        <div className="pt-8 pb-3 px-4">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Main Menu</p>
                        </div>
                        <SideNavItem href={route('facilities.public')} active={false} icon={Icons.venues}>
                            Booking Fasilitas
                        </SideNavItem>
                        <SideNavItem href={route('bookings.index')} active={route().current('bookings.*')} icon={Icons.bookings}>
                            Booking Saya
                        </SideNavItem>
                        <SideNavItem href={route('user.rewards.index')} active={route().current('user.rewards.*')} icon="✨">
                            Tukar Poin & Promo
                        </SideNavItem>


                        <div className="pt-6 pb-3 px-4">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Explore</p>
                        </div>
                        <a
                            href="https://mandalaarenavt.com/?utm_source=ig&utm_medium=social&utm_content=link_in_bio"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all text-slate-500 hover:text-[#FACC15] hover:bg-[#FACC15]/10 group"
                        >
                            <span className="flex-shrink-0 w-5 flex items-center justify-center text-lg">🌐</span>
                            <span className="flex-1">VR Tour Lokasi</span>
                        </a>
                    </>
                )}

                {isAdmin && (
                    <>
                        <div className="pt-8 pb-3 px-4">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admin Modul</p>
                        </div>
                        <SideNavItem href={route('admin.bookings.index')} active={route().current('admin.bookings.*')} icon={Icons.inbox}>
                            <div className="flex flex-col gap-1.5">
                                <span>Daftar Booking</span>
                                <span className="text-[8px] text-slate-400 normal-case leading-tight tracking-normal font-medium">Ini untuk daftar booking yang masuk</span>
                            </div>
                        </SideNavItem>
                        <SideNavItem href={route('admin.facilities.index')} active={route().current('admin.facilities.*')} icon={Icons.manage}>
                            <div className="flex flex-col gap-1.5">
                                <span>Edit Fasilitas</span>
                                <span className="text-[8px] text-slate-400 normal-case leading-tight tracking-normal font-medium">Untuk mengedit lapangan, menambahkan, dan edit jadwal jam</span>
                            </div>
                        </SideNavItem>
                        <SideNavItem href={route('admin.reports.index')} active={route().current('admin.reports.*')} icon={Icons.dashboard}>
                            <div className="flex flex-col gap-1.5">
                                <span>Laporan</span>
                                <span className="text-[8px] text-slate-400 normal-case leading-tight tracking-normal font-medium">Laporan full keuangan langsung bisa import excel, perbulan, perhari</span>
                            </div>
                        </SideNavItem>
                        <SideNavItem href={route('admin.users.index')} active={route().current('admin.users.*')} icon={Icons.profile}>
                            <div className="flex flex-col gap-1.5">
                                <span>User</span>
                                <span className="text-[8px] text-slate-400 normal-case leading-tight tracking-normal font-medium">Jumlah user yang sudah punya akun</span>
                            </div>
                        </SideNavItem>
                        <SideNavItem href={route('admin.rewards.index')} active={route().current('admin.rewards.*')} icon="🏷️">
                            <div className="flex flex-col gap-1.5">
                                <span>Pusat Promo</span>
                                <span className="text-[8px] text-slate-400 normal-case leading-tight tracking-normal font-medium">Buat voucher diskon & atur poin penukaran</span>
                            </div>
                        </SideNavItem>

                    </>
                )}
            </nav>

            {/* Bottom: User Info */}
            <div className="flex-shrink-0 border-t border-slate-50 p-6 bg-slate-50">
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#38BDF8] font-black text-2xl uppercase shadow-sm">
                        {user?.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-slate-800 uppercase tracking-wider truncate leading-none mb-1.5">{user?.name}</p>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-widest leading-none">{user?.role}</span>
                            {isUser && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                    <span className="text-[10px] font-black text-[#FACC15] uppercase tracking-widest leading-none">✨ {user?.points_balance || 0} Poin</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Link href={route('profile.edit')} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[10px] font-bold text-slate-500 hover:text-slate-800 hover:bg-white border border-transparent shadow-sm hover:border-slate-200 transition-all uppercase tracking-widest group">
                        <span className="w-5 group-hover:scale-110 transition-transform">{Icons.profile}</span>
                        Profile
                    </Link>
                    <button
                        onClick={() => router.post(route('logout'))}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[10px] font-bold text-red-500 hover:bg-white hover:text-red-600 border border-transparent shadow-sm hover:border-red-100 transition-all uppercase tracking-widest"
                    >
                        <span className="w-5">{Icons.logout}</span>
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans overflow-x-hidden selection:bg-[#38BDF8] selection:text-white">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-72 lg:flex-col shadow-2xl shadow-slate-200/50">
                <SidebarContent />
            </aside>

            {/* Mobile Drawer */}
            <div className={`fixed inset-0 z-[60] lg:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeSidebar} />
                <div
                    className={`absolute inset-y-0 left-0 w-72 h-full z-10 shadow-2xl transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
                >
                    <button onClick={closeSidebar} className="absolute top-6 right-6 p-2 rounded-xl bg-white text-slate-400 hover:text-slate-800 shadow-md">
                        {Icons.close}
                    </button>
                    <SidebarContent />
                </div>
            </div>

            {/* Mobile Top Bar */}
            <header className="lg:hidden sticky top-0 z-50 flex items-center justify-between px-6 h-20 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
                <button onClick={() => setSidebarOpen(true)} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 hover:border-[#38BDF8] transition-all">
                    {Icons.hamburger}
                </button>
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#38BDF8] rounded-md flex items-center justify-center shadow-sm">
                        <span className="text-white font-black italic text-lg">M</span>
                    </div>
                </Link>
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-lg text-[#38BDF8]">
                    {user?.name?.charAt(0)}
                </div>
            </header>

            {/* Main Content */}
            <div className="lg:ml-72 flex flex-col min-h-screen">
                {header && (
                    <div className="border-b border-slate-100 px-6 sm:px-10 lg:px-16 py-10 bg-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-full bg-[#38BDF8]/5 skew-x-[-15deg] transform translate-x-1/2" />
                        <div className="relative z-10">{header}</div>
                    </div>
                )}
                <main className="flex-1 px-4 sm:px-10 lg:px-16 py-12 relative z-10">{children}</main>
            </div>

            <Chatbot />
        </div>
    );
}
