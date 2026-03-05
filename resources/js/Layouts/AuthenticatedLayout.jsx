import { Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import ThemeToggle from '@/Components/ThemeToggle';
import { useTheme } from '@/Components/ThemeContext';

/* ── SVG Icons ── */
const Icons = {
    dashboard: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    ),
    venues: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
    ),
    bookings: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
    ),
    schedule: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
    manage: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    inbox: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
    ),
    applications: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    ),
    profile: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    ),
    logout: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
    ),
    hamburger: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
    ),
    close: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
};

function SideNavItem({ href, active, icon, children, badge }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${active
                ? 'bg-[var(--accent-dim)] text-[var(--accent)] border-[var(--accent-border)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] border-transparent'
                }`}
        >
            <span className="flex-shrink-0 w-4 flex items-center justify-center">{icon}</span>
            <span className="flex-1">{children}</span>
            {badge > 0 && (
                <span className="rounded-full bg-red-500 text-white text-[9px] font-bold min-w-[16px] h-4 flex items-center justify-center px-1">
                    {badge}
                </span>
            )}
        </Link>
    );
}

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const { theme } = useTheme();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [pendingBookings, setPendingBookings] = useState(0);
    const [toasts, setToasts] = useState([]);
    const lastIdRef = useRef(null);

    // ── Real-time points ─────────────────────────────────────────
    const [livePoints, setLivePoints] = useState(user?.points_balance ?? 0);
    const isRegularUser = user?.role === 'user';

    useEffect(() => {
        // Sync ke shared state awal
        setLivePoints(user?.points_balance ?? 0);
    }, [user?.points_balance]);

    useEffect(() => {
        if (!isRegularUser) return;

        const fetchPoints = async () => {
            try {
                const res = await fetch('/user/points', {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept': 'application/json',
                    },
                    credentials: 'same-origin',
                });
                if (!res.ok) return;
                const data = await res.json();
                if (data.authenticated && typeof data.points_balance === 'number') {
                    setLivePoints(data.points_balance);
                }
            } catch (_) { }
        };

        // Langsung ambil saat mount
        fetchPoints();

        // Poll setiap 15 detik
        const interval = setInterval(fetchPoints, 15000);
        return () => clearInterval(interval);
    }, [isRegularUser]);
    // ─────────────────────────────────────────────────────────────

    const isMitra = user?.role === 'mitra' || user?.role === 'admin';
    const isAdmin = user?.role === 'admin';
    const pendingApps = usePage().props.pendingMitraApps ?? 0;

    const closeSidebar = () => setSidebarOpen(false);

    const addToast = useCallback((msg) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, msg }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
    }, []);

    // Polling: cek pending booking setiap 30 detik (hanya untuk mitra)
    useEffect(() => {
        if (!isMitra) return;

        const poll = async () => {
            try {
                const res = await fetch(route('mitra.bookings.pending-count'), {
                    headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' },
                    credentials: 'same-origin',
                });
                if (!res.ok) return;
                const data = await res.json();

                setPendingBookings(data.pending);

                if (lastIdRef.current !== null && data.latest_id > lastIdRef.current) {
                    addToast(`🔔 Booking baru masuk! (${data.pending} menunggu konfirmasi)`);
                }
                lastIdRef.current = data.latest_id;
            } catch (_) { }
        };

        poll();
        const interval = setInterval(poll, 30000);
        return () => clearInterval(interval);
    }, [isMitra, addToast]);

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="px-4 py-5 border-b border-[var(--border)] flex-shrink-0">
                <Link href={route('dashboard')} className="flex items-center gap-2.5" onClick={closeSidebar}>
                    <img src="/images/janjee-logo.svg" alt="Janjee" className="h-9 w-9" />
                    <span className="text-xl font-black tracking-tight text-[var(--accent)]">Janjee</span>
                </Link>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
                <SideNavItem href={route('dashboard')} active={route().current('dashboard')} icon={Icons.dashboard}>
                    Dashboard
                </SideNavItem>
                <SideNavItem href={route('venues.index')} active={route().current('venues.*')} icon={Icons.venues}>
                    Explore Venues
                </SideNavItem>
                <SideNavItem href={route('bookings.index')} active={route().current('bookings.index')} icon={Icons.bookings}>
                    Bookings
                </SideNavItem>
                <SideNavItem href={route('schedule.index')} active={route().current('schedule.index')} icon={Icons.schedule}>
                    Jadwal
                </SideNavItem>

                {isAdmin && (
                    <>
                        <div className="pt-4 pb-2 px-1">
                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Admin</p>
                        </div>
                        <SideNavItem
                            href={route('admin.applications.index')}
                            active={route().current('admin.applications.*')}
                            icon={Icons.applications}
                            badge={pendingApps}
                        >
                            Pengajuan Mitra
                        </SideNavItem>
                    </>
                )}

                {isMitra && (
                    <>
                        <div className="pt-4 pb-2 px-1">
                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Mitra</p>
                        </div>
                        <SideNavItem href={route('mitra.venues.index')} active={route().current('mitra.venues.*')} icon={Icons.manage}>
                            Kelola Venue
                        </SideNavItem>
                        <SideNavItem
                            href={route('mitra.bookings.index')}
                            active={route().current('mitra.bookings.*')}
                            icon={Icons.inbox}
                            badge={pendingBookings}
                        >
                            Booking Masuk
                        </SideNavItem>
                    </>
                )}
            </nav>

            {/* Bottom: user info + theme toggle + profile + logout */}
            <div className="flex-shrink-0 border-t border-[var(--border)] p-3">
                {/* Theme toggle */}
                <div className="flex items-center justify-between px-2 py-2 mb-2">
                    <span className="text-xs font-medium text-[var(--text-muted)]">
                        {theme === 'dark' ? 'Mode Gelap' : 'Mode Terang'}
                    </span>
                    <ThemeToggle />
                </div>

                <div className="flex items-center gap-3 px-2 py-2 mb-1">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--accent-dim)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] font-black text-sm">
                        {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{user?.name}</p>
                        <p className="text-xs text-[var(--text-muted)] truncate">{user?.email}</p>
                    </div>
                    <span className="text-[9px] font-bold bg-[var(--accent-dim)] text-[var(--accent)] border border-[var(--accent-border)] px-1.5 py-0.5 rounded-full uppercase">
                        {user?.role}
                    </span>
                </div>

                {/* Poin reward — hanya tampil untuk role user */}
                {user?.role === 'user' && (
                    <Link href={route('profile.edit')}
                        className="flex items-center justify-between mx-2 mb-2 rounded-xl px-3 py-2 transition-all hover:opacity-80"
                        style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)' }}>
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm">⭐</span>
                            <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>Poin Saya</span>
                        </div>
                        <span
                            key={livePoints}
                            className="text-sm font-black"
                            style={{ color: 'var(--accent)', transition: 'all 0.3s' }}
                        >
                            {livePoints.toLocaleString('id-ID')}
                        </span>
                    </Link>
                )}
                <SideNavItem href={route('profile.edit')} active={route().current('profile.*')} icon={Icons.profile}>
                    Profile
                </SideNavItem>
                <button
                    onClick={() => router.post(route('logout'))}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/5 border border-transparent transition-all"
                >
                    <span className="flex-shrink-0 w-4 flex items-center justify-center">{Icons.logout}</span>
                    Log Out
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen font-sans" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>
            {/* Background glow */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full blur-[140px]"
                    style={{ backgroundColor: 'var(--glow-color)' }} />
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-60 lg:flex-col border-r theme-transition"
                style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border)' }}>
                <SidebarContent />
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden" onClick={closeSidebar} />
            )}

            {/* Mobile drawer */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 border-r transition-transform duration-300 ease-in-out lg:hidden theme-transition ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
                style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border)' }}
            >
                <button onClick={closeSidebar}
                    className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors"
                    style={{ color: 'var(--text-secondary)' }}>
                    {Icons.close}
                </button>
                <SidebarContent />
            </aside>

            {/* Mobile top bar */}
            <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 backdrop-blur-md border-b theme-transition"
                style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border)' }}>
                <button onClick={() => setSidebarOpen(true)}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                    aria-label="Buka menu">
                    {Icons.hamburger}
                </button>
                <Link href={route('dashboard')} className="flex items-center gap-2">
                    <img src="/images/janjee-logo.svg" alt="Janjee" className="h-7 w-7" />
                    <span className="text-lg font-black tracking-tight" style={{ color: 'var(--accent)' }}>Janjee</span>
                </Link>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    {/* Poin badge mobile (hanya role user) */}
                    {user?.role === 'user' && (
                        <Link href={route('profile.edit')}
                            className="hidden sm:flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold"
                            style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}>
                            ⭐ <span key={livePoints}>{livePoints.toLocaleString('id-ID')}</span>
                        </Link>
                    )}
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm"
                        style={{ backgroundColor: 'var(--accent-dim)', border: '1px solid var(--accent-border)', color: 'var(--accent)' }}>
                        {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                </div>
            </header>

            {/* Main content */}
            <div className="lg:ml-60 flex flex-col min-h-screen">
                {header && (
                    <div className="border-b px-4 sm:px-6 lg:px-8 py-4 theme-transition"
                        style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border)' }}>
                        {header}
                    </div>
                )}
                <main className="flex-1 relative z-10">{children}</main>
            </div>

            {/* Toast Notifications */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className="pointer-events-auto flex items-start gap-3 rounded-2xl shadow-2xl px-4 py-3.5 min-w-[280px] max-w-sm border theme-transition"
                        style={{
                            backgroundColor: 'var(--bg-card)',
                            borderColor: 'var(--accent-border)',
                            animation: 'slideUp 0.3s ease',
                        }}
                    >
                        <span className="text-xl flex-shrink-0">🔔</span>
                        <div className="flex-1">
                            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Booking Baru!</p>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{t.msg.replace('🔔 ', '')}</p>
                            <a
                                href={route('mitra.bookings.index')}
                                className="text-[11px] font-semibold hover:underline mt-1 inline-block"
                                style={{ color: 'var(--accent)' }}
                            >
                                Lihat Booking →
                            </a>
                        </div>
                        <button
                            onClick={() => setToasts(prev => prev.filter(t2 => t2.id !== t.id))}
                            className="text-sm mt-0.5 transition-colors"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
