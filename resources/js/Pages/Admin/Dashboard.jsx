import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function AdminDashboard({ stats, charts, recent_bookings }) {
    return (
        <AuthenticatedLayout>
            <Head title="Admin Dashboard | Mandala Arena" />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-12 mb-12"
                style={{ borderColor: 'var(--border)' }}>
                <div>
                    <p className="text-[10px] font-black text-[#38BDF8] uppercase tracking-[0.3em] mb-4">Strategic Command Center</p>
                    <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none"
                        style={{ color: 'var(--text-primary)' }}>
                        Mission <span className="text-[#38BDF8]">Control</span>
                    </h1>
                </div>
                <div className="flex items-center gap-3 px-5 py-2 rounded-full border"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <div className="w-2 h-2 bg-[#38BDF8] rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest"
                        style={{ color: 'var(--text-secondary)' }}>Live Telemetry</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-10">

                {/* 1. Tactical Stat matrix */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <StatCard label="Yield Generated" value={`Rp ${parseInt(stats?.revenue || 0).toLocaleString()}`} icon="" color="#38BDF8" />
                    <StatCard label="Mission Today" value={stats?.today_bookings || 0} icon="" color="#FACC15" />
                    <StatCard label="Total Pilots" value={stats?.total_pilots || 0} icon="" color="#A855F7" />
                    <StatCard label="Deployable Units" value={stats?.active_venues || 0} icon="" color="#10B981" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* 2. Revenue Telemetry Trend */}
                    <div className="lg:col-span-2 rounded-[3.5rem] p-12 border shadow-3xl relative overflow-hidden group transition-all"
                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-[#38BDF8]/5 rounded-full blur-[120px] -mr-64 -mt-64 group-hover:scale-110 transition-transform duration-[4s]" />

                        <div className="flex justify-between items-end mb-16 relative z-10">
                            <div>
                                <p className="text-[10px] font-black text-[#38BDF8] uppercase tracking-[0.4em] mb-4">Yield Trajectory</p>
                                <h3 className="text-4xl font-black italic uppercase tracking-tighter leading-none"
                                    style={{ color: 'var(--text-primary)' }}>Revenue <span className="text-[#38BDF8]">Matrix</span></h3>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40 italic"
                                style={{ color: 'var(--text-secondary)' }}>LAST 06 MO TELEMETRY</span>
                        </div>

                        <div className="overflow-x-auto pb-4 scrollbar-hide">
                            <div className="h-64 flex items-end justify-between gap-4 px-4 min-w-[500px] sm:min-w-0">
                                {charts?.revenue_trend?.map((item, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${(item.value / (Math.max(...(charts.revenue_trend.map(x => x.value))) || 1)) * 100}%` }}
                                            className="w-full rounded-2xl group-hover:bg-[#38BDF8] transition-all relative overflow-hidden border border-transparent"
                                            style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}
                                        >
                                            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-[#38BDF8]/10 to-transparent" />
                                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 border text-white text-[10px] font-black px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-2xl whitespace-nowrap"
                                                style={{ borderColor: 'var(--border)' }}>
                                                Rp {(item.value / 1000).toLocaleString('id-ID')}k
                                            </div>
                                        </motion.div>
                                        <span className="text-[10px] font-black uppercase tracking-widest"
                                            style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 3. Operational Analysis */}
                    <div className="space-y-8">
                        <div className="rounded-[3.5rem] p-10 border shadow-3xl transition-all"
                            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                            <p className="text-[10px] font-black text-[#38BDF8] uppercase tracking-[0.4em] mb-4">Peak Engagement</p>
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-8"
                                style={{ color: 'var(--text-primary)' }}>Sector <span className="text-[#38BDF8]">Load</span></h3>
                            <div className="space-y-5">
                                {charts?.peak_hours?.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center p-5 rounded-2xl border transition-all hover:bg-slate-500/5"
                                        style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}>
                                        <div className="flex items-center gap-4">
                                            <span className="w-10 h-10 rounded-xl border flex items-center justify-center text-[10px] font-black uppercase italic"
                                                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: '#38BDF8' }}>T{i + 1}</span>
                                            <span className="text-xs font-black uppercase tracking-widest"
                                                style={{ color: 'var(--text-primary)' }}>{item.hour}</span>
                                        </div>
                                        <span className="text-[10px] font-black text-[#38BDF8] uppercase tracking-[0.2em]">{item.count} SESSIONS</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[3.5rem] p-10 shadow-3xl border transition-all"
                            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                            <p className="text-[10px] font-black text-[#38BDF8] uppercase tracking-[0.4em] mb-4">Asset Performance</p>
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-8"
                                style={{ color: 'var(--text-primary)' }}>Top <span className="text-[#38BDF8]">Assets</span></h3>
                            <div className="space-y-5">
                                {charts?.popular_sports?.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center border-b pb-4" style={{ borderColor: 'var(--border)' }}>
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] truncate max-w-[180px]" style={{ color: 'var(--text-primary)' }}>{item.name}</span>
                                        <span className="text-[10px] font-black text-[#38BDF8] uppercase italic tracking-tighter">{item.count} DEPLOYMENTS</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Recent Bookings Feed */}
                <div className="rounded-[3.5rem] overflow-hidden border shadow-3xl transition-all"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <div className="px-12 py-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b"
                        style={{ borderColor: 'var(--border)' }}>
                        <div>
                            <p className="text-[10px] font-black text-[#38BDF8] uppercase tracking-[0.4em] mb-4">Real-time Deployment Log</p>
                            <h3 className="text-4xl font-black italic uppercase tracking-tighter leading-none"
                                style={{ color: 'var(--text-primary)' }}>Recent <span className="text-[#38BDF8]">Missions</span></h3>
                        </div>
                        <Link href={route('admin.bookings.manage')} className="text-[10px] font-black uppercase tracking-[0.4em] text-[#38BDF8] hover:translate-x-2 transition-transform italic">
                            Operational Archive →
                        </Link>
                    </div>
                    <div className="overflow-x-auto scrollbar-hide">
                        <table className="w-full text-left">
                            <thead className="text-[10px] font-black uppercase tracking-[0.3em] border-b"
                                style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                                <tr>
                                    <th className="px-12 py-10 whitespace-nowrap">Pilot Registry</th>
                                    <th className="px-10 py-10 whitespace-nowrap">Asset Unit</th>
                                    <th className="px-10 py-10 whitespace-nowrap">Yield</th>
                                    <th className="px-10 py-10 whitespace-nowrap">Status</th>
                                    <th className="px-12 py-10 text-right whitespace-nowrap">Relay</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                                {recent_bookings?.map((booking, idx) => (
                                    <tr key={idx} className="transition-all group hover:bg-slate-500/5">
                                        <td className="px-12 py-10">
                                            <div className="flex flex-col gap-2">
                                                <span className="text-lg font-black uppercase italic tracking-tighter leading-none"
                                                    style={{ color: 'var(--text-primary)' }}>
                                                    {booking.guest_name || booking.user?.name || 'UNKNOWN PILOT'}
                                                </span>
                                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60" style={{ color: 'var(--text-secondary)' }}>
                                                    {booking.guest_email || booking.user?.email}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-10">
                                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#38BDF8] italic">
                                                {booking.facility?.name}
                                            </span>
                                        </td>
                                        <td className="px-10 py-10">
                                            <span className="text-xl font-black italic tracking-tighter" style={{ color: 'var(--text-primary)' }}>
                                                Rp {parseInt(booking?.total_price || 0).toLocaleString('id-ID')}
                                            </span>
                                        </td>
                                        <td className="px-10 py-10">
                                            <span className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] border shadow-sm ${booking.payment_status === 'paid' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 'text-red-400 border-red-500/30 bg-red-500/10'
                                                }`}>
                                                {booking.payment_status === 'paid' ? 'MISSION SETTLED' : (booking.payment_status?.toUpperCase() || 'STANDBY')}
                                            </span>
                                        </td>
                                        <td className="px-12 py-10 text-right">
                                            <Link href={route('admin.bookings.manage')}
                                                className="inline-flex w-14 h-14 rounded-2xl border items-center justify-center text-[#38BDF8] hover:bg-[#38BDF8] hover:text-slate-900 transition-all ml-auto group-hover:scale-110 shadow-xl"
                                                style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}>
                                                <span className="font-black italic text-xl">→</span>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}

function StatCard({ label, value, icon, color }) {
    return (
        <motion.div
            whileHover={{ y: -8 }}
            className="rounded-[3rem] p-10 border shadow-2xl group overflow-hidden relative transition-all"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10 group-hover:opacity-20 transition-opacity blur-2xl"
                style={{ backgroundColor: color }} />

            <div className="w-16 h-16 rounded-3xl mb-10 flex items-center justify-center text-3xl transition-transform group-hover:scale-110 shadow-xl border"
                style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}>
                {icon || '📊'}
            </div>

            <span className="text-[10px] font-black uppercase tracking-[0.4em] mb-3 block"
                style={{ color: 'var(--text-secondary)' }}>{label}</span>
            <span className="text-4xl font-black italic tracking-tighter block uppercase leading-none"
                style={{ color: color }}>{value}</span>

            <div className="absolute bottom-0 left-0 h-1.5 transition-all duration-700 w-0 group-hover:w-full opacity-50"
                style={{ background: color }} />
        </motion.div>
    );
}
