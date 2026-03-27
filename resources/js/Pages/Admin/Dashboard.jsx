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
                        <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Dashboard Utama</h1>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Ringkasan performa operasional hari ini.</p>
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
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-[10px] font-bold uppercase tracking-widest"
                                    style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                                    <tr>
                                        <th className="px-6 py-4">Pelanggan</th>
                                        <th className="px-6 py-4">Fasilitas</th>
                                        <th className="px-6 py-4">Total</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                                    {recent_bookings?.map((booking, idx) => (
                                        <tr key={idx} className="hover:bg-slate-500/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{booking.guest_name || booking.user?.name || 'User'}</span>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{booking.guest_phone || booking.user?.phone}</span>
                                                        {(booking.guest_phone || booking.user?.phone) && (
                                                            <a href={`https://wa.me/${(booking.guest_phone || booking.user?.phone).replace(/\D/g, '').replace(/^0/, '62')}`} target="_blank" className="p-1 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors">
                                                                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.766-5.764-5.766zm3.392 8.221c-.142.399-.833.723-1.141.774-.285.051-.613.082-.994-.039-.233-.073-.539-.169-.991-.355-1.924-.788-3.137-2.722-3.235-2.852-.097-.13-.807-1.077-.807-2.062s.521-1.469.707-1.676c.186-.206.408-.258.544-.258.136 0 .272.003.39.01.12.007.281-.045.44.337.162.39.551 1.336.6 1.439.049.103.082.224.013.355-.069.13-.157.283-.313.456-.156.173-.328.385-.168.658.16.272.71 1.171 1.522 1.892.684.608 1.265.798 1.543.917.278.12.441.101.608-.091.168-.192.712-.826.903-1.11.192-.284.383-.24.646-.142.263.099 1.666.784 1.954.929.288.146.48.217.55.337.072.12.072.699-.071 1.098z" /></svg>
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] font-bold text-[#38BDF8] uppercase tracking-wider">{booking.facility?.name}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Rp {parseInt(booking?.total_price || 0).toLocaleString('id-ID')}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase border ${booking.payment_status === 'paid' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : 'text-amber-500 border-amber-500/20 bg-amber-500/5'}`}>
                                                    {booking.payment_status === 'paid' ? 'Success' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link href={route('admin.bookings.manage')} className="p-2 hover:bg-[#38BDF8]/10 rounded-lg text-[#38BDF8] transition-colors inline-block">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5l7 7-7 7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
