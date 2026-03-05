import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function Dashboard({ stats }) {
    const user = usePage().props.auth.user;
    const role = user?.role || 'user';
    const flash = usePage().props.flash;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-black text-xl leading-tight" style={{ color: 'var(--text-primary)' }}>Dashboard</h2>
                    <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold border uppercase tracking-wider"
                        style={{ backgroundColor: 'var(--accent-dim)', color: 'var(--accent)', borderColor: 'var(--accent-border)' }}>
                        {role}
                    </span>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8">

                {/* Flash message */}
                {flash?.success && (
                    <div className="mb-5 rounded-xl bg-[#F2D800]/10 border border-[#F2D800]/20 px-4 py-3 text-sm text-[#F2D800]">
                        {flash.success}
                    </div>
                )}

                {/* Welcome card */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border p-5 mb-6 relative overflow-hidden theme-transition"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl pointer-events-none"
                        style={{ backgroundColor: 'var(--accent-dim)' }} />
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-lg flex-shrink-0 border"
                            style={{ backgroundColor: 'var(--accent-dim)', borderColor: 'var(--accent-border)', color: 'var(--accent)' }}>
                            {user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                            <p className="font-semibold text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>
                                Halo, <span style={{ color: 'var(--accent)' }}>{user?.name}</span>
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                Login sebagai <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{role}</span>
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    {role === 'user' && (
                        <>
                            <StatCard delay={0} title="Total Booking" value={stats?.booking_count ?? 0} color="#F2D800" />
                            <StatCard delay={0.1} title="Booking Aktif" value={stats?.active_bookings ?? 0} color="#ffffff" />
                            <StatCard delay={0.2} title="Selesai" value={stats?.completed ?? 0} color="#a78bfa" />
                        </>
                    )}
                    {role === 'mitra' && (
                        <>
                            <StatCard delay={0} title="Total Venue" value={stats?.venue_count ?? 0} color="#F2D800" />
                            <StatCard delay={0.1} title="Booking Bulan Ini" value={stats?.booking_count ?? 0} color="#ffffff" />
                            <StatCard delay={0.2} title="Pendapatan"
                                value={`Rp ${Number(stats?.revenue ?? 0).toLocaleString('id-ID')}`}
                                color="#4ade80" small />
                        </>
                    )}
                    {role === 'admin' && (
                        <>
                            <StatCard delay={0} title="Total Pengguna" value={stats?.total_users ?? 0} color="#F2D800" />
                            <StatCard delay={0.1} title="Total Venue" value={stats?.total_venues ?? 0} color="#ffffff" />
                            <StatCard delay={0.2} title="Pengajuan Mitra Pending" value={stats?.pending_mitra_apps ?? 0} color="#f87171" />
                        </>
                    )}
                </div>

                {/* Mitra application status banner (user only) */}
                {role === 'user' && stats?.mitra_app && (
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="mb-6 rounded-2xl border p-4 sm:p-5 theme-transition"
                        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                        <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Status Pengajuan Mitra</h3>
                        <div className="flex flex-wrap items-center gap-3">
                            <StatusBadge status={stats.mitra_app.status} />
                            {stats.mitra_app.jadwal_temu && (
                                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                    Jadwal temu: <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{stats.mitra_app.jadwal_temu}</span>
                                </span>
                            )}
                        </div>
                        {stats.mitra_app.catatan && (
                            <p className="mt-2 text-xs" style={{ color: 'var(--text-secondary)' }}>{stats.mitra_app.catatan}</p>
                        )}
                    </motion.div>
                )}

                {/* User: Daftar jadi mitra CTA (if no application yet) */}
                {role === 'user' && !stats?.mitra_app && (
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                        className="mb-6 rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 theme-transition"
                        style={{ backgroundColor: 'var(--accent-dim)', borderColor: 'var(--accent-border)' }}>
                        <div className="flex-1">
                            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Punya tempat usaha?</p>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Daftarkan bisnis kamu sebagai Mitra Janjee dan mulai terima booking.</p>
                        </div>
                        <Link href={route('mitra.apply')}
                            className="flex-shrink-0 rounded-full px-5 py-2 text-xs font-bold text-[#1A1818] hover:scale-105 transition-all text-center"
                            style={{ backgroundColor: 'var(--accent)' }}>
                            Daftar Mitra
                        </Link>
                    </motion.div>
                )}

                {/* Quick Actions */}
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Aksi Cepat</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {role === 'user' && (
                            <>
                                <QuickAction href={route('venues.index')} label="Cari Venue" />
                                <QuickAction href={route('bookings.index')} label="Riwayat Booking" />
                                <QuickAction href={route('schedule.index')} label="Jadwal Saya" />
                                <QuickAction href={route('profile.edit')} label="Edit Profil" />
                            </>
                        )}
                        {role === 'mitra' && (
                            <>
                                <QuickAction href={route('mitra.venues.index')} label="Kelola Venue" />
                                <QuickAction href={route('mitra.venues.create')} label="Tambah Venue" />
                                <QuickAction href={route('mitra.bookings.index')} label="Booking Masuk" />
                                <QuickAction href={route('profile.edit')} label="Edit Profil" />
                            </>
                        )}
                        {role === 'admin' && (
                            <>
                                <QuickAction href={route('admin.applications.index')} label="Kelola Pengajuan Mitra" />
                                <QuickAction href={route('venues.index')} label="Semua Venue" />
                                <QuickAction href={route('profile.edit')} label="Edit Profil" />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function StatCard({ title, value, color, delay = 0, small = false }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="rounded-2xl p-5 border relative overflow-hidden theme-transition"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-15 pointer-events-none"
                style={{ backgroundColor: color }} />
            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{title}</p>
            <p className={`mt-1.5 font-black ${small ? 'text-lg sm:text-xl' : 'text-2xl sm:text-3xl'}`}
                style={{ color }}>{value}</p>
        </motion.div>
    );
}

function QuickAction({ href, label }) {
    return (
        <Link href={href}
            className="flex items-center justify-center rounded-xl p-3 sm:p-4 border hover:scale-[1.02] transition-all text-center theme-transition"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <span className="text-xs sm:text-sm font-semibold leading-tight transition-colors" style={{ color: 'var(--text-secondary)' }}>{label}</span>
        </Link>
    );
}

function StatusBadge({ status }) {
    const map = {
        pending: { label: 'Menunggu Review', bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
        approved: { label: 'Disetujui', bg: 'bg-[#F2D800]/10', text: 'text-[#F2D800]', border: 'border-[#F2D800]/20' },
        rejected: { label: 'Ditolak', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
    };
    const s = map[status] ?? map.pending;
    return (
        <span className={`rounded-full px-3 py-1 text-xs font-semibold border ${s.bg} ${s.text} ${s.border}`}>
            {s.label}
        </span>
    );
}
