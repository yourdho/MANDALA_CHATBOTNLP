import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function AdminDashboard({ stats, charts, recent_bookings }) {
    return (
        <AuthenticatedLayout>
            <Head title="Admin Dashboard | Mandala Arena" />

            <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
                {/* ── Page Header ── */}
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b"
                    style={{ borderColor: 'var(--border)' }}>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Dashboard Utama</h1>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Ringkasan performa operasional hari ini.</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Sistem Aktif</span>
                    </div>
                </header>

                {/* ── Key Metrics ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <DashboardStat
                        label="Total Omzet"
                        value={`Rp ${parseInt(stats?.revenue || 0).toLocaleString('id-ID')}`}
                        color="#38BDF8"
                        sub="Akumulasi pendapatan"
                    />
                    <DashboardStat
                        label="Booking Hari Ini"
                        value={stats?.today_bookings || 0}
                        color="#FACC15"
                        sub="Sesi terjadwal hari ini"
                    />
                    <DashboardStat
                        label="Total Pelanggan"
                        value={stats?.total_pilots || 0}
                        color="#A855F7"
                        sub="User terdaftar aktif"
                    />
                    <DashboardStat
                        label="Venue Aktif"
                        value={stats?.active_venues || 0}
                        color="#10B981"
                        sub="Fasilitas siap dipesan"
                    />
                </div>

                {/* ── Main Content Grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Recent Transactions Table */}
                    <div className="lg:col-span-2 rounded-2xl border overflow-hidden shadow-sm flex flex-col"
                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                        <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Antrean Transaksi Terbaru</h3>
                            <Link href={route('admin.bookings.manage')} className="text-[10px] font-bold text-[#38BDF8] uppercase tracking-wider hover:underline">
                                Lihat Semua →
                            </Link>
                        </div>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="text-[10px] font-black uppercase tracking-[0.3em] border-b"
                                    style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                                    <tr>
                                        <th className="px-6 py-6 md:px-10 md:py-10 whitespace-nowrap">Pelanggan</th>
                                        <th className="px-6 py-6 md:px-10 md:py-10 whitespace-nowrap">Fasilitas</th>
                                        <th className="px-6 py-6 md:px-10 md:py-10 whitespace-nowrap">Pembayaran</th>
                                        <th className="px-6 py-6 md:px-10 md:py-10 whitespace-nowrap">Tanggal</th>
                                        <th className="px-6 py-6 md:px-10 md:py-10 text-right whitespace-nowrap">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                                    {recent_bookings?.map((u, i) => (
                                        <motion.tr
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            key={u.id}
                                            className="transition-all group hover:bg-slate-500/5"
                                        >
                                            <td className="px-6 py-6 md:px-10 md:py-10">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-12 h-12 md:w-16 md:h-16 shrink-0 rounded-xl md:rounded-2xl flex items-center justify-center font-black italic text-2xl md:text-3xl text-[#38BDF8] border"
                                                        style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}>
                                                        {u.guest_name?.charAt(0) || u.user?.name?.charAt(0)}
                                                    </div>
                                                    <span className="text-xl md:text-2xl font-black italic uppercase tracking-tighter group-hover:text-[#38BDF8] transition-colors leading-none"
                                                        style={{ color: 'var(--text-primary)' }}>
                                                        {u.guest_name || u.user?.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 md:px-10 md:py-10">
                                                <span className="text-[10px] font-bold text-[#38BDF8] uppercase tracking-wider">{u.facility?.name}</span>
                                            </td>
                                            <td className="px-6 py-6 md:px-10 md:py-10">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase border ${u.payment_status === 'paid' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : 'text-amber-500 border-amber-500/20 bg-amber-500/5'}`}>
                                                    {u.payment_status === 'paid' ? 'Success' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-6 md:px-10 md:py-10">
                                                <div className="flex flex-col">
                                                    <p className="text-sm font-black italic tracking-tighter mb-2 uppercase leading-none" style={{ color: 'var(--text-primary)' }}>{new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--text-secondary)' }}>{new Date(u.created_at).toLocaleTimeString().slice(0, 5)} ZULU</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 md:px-10 md:py-10 text-right">
                                                <Link href={route('admin.bookings.manage')} className="px-6 py-2.5 md:px-8 md:py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all"
                                                    style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                                                    Detail File
                                                </Link>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card List */}
                        <div className="md:hidden divide-y" style={{ borderColor: 'var(--border)' }}>
                            {recent_bookings?.map((u, i) => (
                                <motion.div key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-[#38BDF8] font-black italic text-xl">
                                            {u.guest_name?.charAt(0) || u.user?.name?.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-xl font-black italic uppercase leading-tight" style={{ color: 'var(--text-primary)' }}>{u.guest_name || u.user?.name}</h4>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Booked: {new Date(u.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${u.payment_status === 'paid' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : 'text-amber-500 border-amber-500/20 bg-amber-500/5'}`}>
                                            {u.payment_status === 'paid' ? 'Paid' : 'Pending'}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dashed" style={{ borderColor: 'var(--border)' }}>
                                        <div>
                                            <p className="text-[8px] font-black uppercase tracking-widest text-[#38BDF8] mb-1">Email</p>
                                            <p className="text-[10px] font-bold truncate" style={{ color: 'var(--text-primary)' }}>{u.guest_email || u.user?.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black uppercase tracking-widest text-[#38BDF8] mb-1">WhatsApp</p>
                                            <p className="text-[10px] font-bold" style={{ color: 'var(--text-primary)' }}>{u.guest_phone || u.user?.phone || '-'}</p>
                                        </div>
                                    </div>
                                    <Link href={route('admin.bookings.manage')} className="w-full py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest text-center"
                                        style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                                        View Full Booking File
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Operational Overview Sidebars */}
                    <div className="space-y-6">
                        <div className="rounded-2xl p-6 border shadow-sm" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                            <h3 className="text-sm font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Jam Sibuk Latihan</h3>
                            <div className="space-y-4">
                                {charts?.peak_hours?.slice(0, 4).map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-slate-500/5 rounded-xl border border-transparent hover:border-[#38BDF8]/30 transition-all">
                                        <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{item.hour}</span>
                                        <span className="text-[10px] font-bold text-[#38BDF8] uppercase tracking-wider">{item.count} Sesi</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl p-6 border shadow-sm" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                            <h3 className="text-sm font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Venue Terlaris</h3>
                            <div className="space-y-4">
                                {charts?.popular_sports?.slice(0, 3).map((item, i) => (
                                    <div key={i} className="flex flex-col gap-1">
                                        <div className="flex justify-between items-end mb-1">
                                            <span className="text-[10px] font-bold uppercase tracking-wider truncate w-32" style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                                            <span className="text-[10px] font-bold text-[#38BDF8]">{item.count} Sesi</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-500/10 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(item.count / (Math.max(...charts.popular_sports.map(x => x.count)) || 1)) * 100}%` }}
                                                className="h-full bg-[#38BDF8]"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>

                {/* ── Revenue Progress ── */}
                <div className="rounded-2xl p-8 border shadow-sm" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <div className="flex items-center justify-between mb-10 text-center sm:text-left">
                        <div>
                            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Tren Pendapatan</h3>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Evaluasi omzet bulanan dalam Rp.</p>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#38BDF8]">Live Update</span>
                    </div>
                    <div className="h-48 flex items-end gap-2 sm:gap-4 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
                        {charts?.revenue_trend?.map((item, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-3 h-full justify-end group">
                                <div className="relative w-full flex flex-col items-center justify-end h-full">
                                    <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-xl whitespace-nowrap z-20">
                                        Rp {(item.value / 1000).toLocaleString('id-ID')}k
                                    </div>
                                    <motion.div
                                        initial={{ scaleY: 0 }}
                                        animate={{ height: `${(item.value / (Math.max(...charts.revenue_trend.map(x => x.value)) || 1)) * 100}%` }}
                                        className="w-full max-w-[50px] rounded-t-lg bg-[#38BDF8]/20 border-t-4 border-[#38BDF8] group-hover:bg-[#38BDF8]/40 transition-colors"
                                    />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}

function DashboardStat({ label, value, color, sub }) {
    return (
        <div className="rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all group"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <h4 className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>{label}</h4>
            <div className="space-y-1">
                <p className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{value}</p>
                <p className="text-[9px] font-medium" style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>{sub}</p>
            </div>
            <div className="mt-4 flex items-center justify-between text-[10px] font-bold">
                <div className="flex items-center gap-1.5 p-1 px-2 rounded-md bg-slate-500/5 border border-transparent group-hover:border-[#38BDF8]/20 transition-all">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                    <span style={{ color: 'var(--text-secondary)' }}>Aktif</span>
                </div>
            </div>
        </div>
    );
}
