import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function AdminDashboard({ stats, charts, recent_bookings }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-4xl font-['Permanent_Marker'] italic text-slate-900 uppercase tracking-tighter leading-none">
                        Mission <span className="text-[#38BDF8]">Control</span>
                    </h2>
                    <div className="flex items-center gap-3 bg-slate-100 px-5 py-2 rounded-full border border-slate-200">
                        <div className="w-2 h-2 bg-[#38BDF8] rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Telemetry</span>
                    </div>
                </div>
            }
        >
            <Head title="Admin Dashboard | Mandala Arena" />

            <div className="max-w-7xl mx-auto space-y-10">

                {/* 1. Core KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard label="Total Revenue" value={`Rp ${stats.revenue}`} icon="💰" color="#38BDF8" />
                    <StatCard label="Bookings Today" value={stats.today_bookings} icon="📅" color="#FACC15" />
                    <StatCard label="Total Pilots" value={stats.total_pilots} icon="👤" color="#94A3B8" />
                    <StatCard label="Active Venues" value={stats.active_venues} icon="🏟️" color="#10B981" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* 2. Revenue Trend (Simple Visual Bar) */}
                    <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/40">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-xl font-['Permanent_Marker'] italic uppercase text-slate-800">Revenue <span className="text-[#38BDF8]">Trend</span></h3>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Last 6 Months</span>
                        </div>

                        <div className="overflow-x-auto pb-4 scrollbar-hide">
                            <div className="h-64 flex items-end justify-between gap-4 px-4 min-w-[500px] sm:min-w-0">
                                {charts.revenue_trend.map((item, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${(item.value / (Math.max(...charts.revenue_trend.map(x => x.value)) || 1)) * 100}%` }}
                                            className="w-full bg-slate-900 rounded-2xl group-hover:bg-[#38BDF8] transition-all relative"
                                        >
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                Rp {Number(item.value / 1000).toFixed(0)}k
                                            </div>
                                        </motion.div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 3. Popular Sports & Peak Hours */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40">
                            <h3 className="text-md font-['Permanent_Marker'] italic uppercase text-slate-800 mb-6 font-bold">Peak <span className="text-[#38BDF8]">Hours</span></h3>
                            <div className="space-y-4">
                                {charts.peak_hours.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black">{i + 1}</span>
                                            <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">{item.hour}</span>
                                        </div>
                                        <span className="text-[10px] font-black text-[#38BDF8] uppercase tracking-widest">{item.count} Bookings</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-[3rem] p-8 shadow-xl shadow-[#38BDF8]/20">
                            <h3 className="text-md font-['Permanent_Marker'] italic uppercase text-white mb-6 font-bold">Top <span className="text-[#38BDF8]">Venues</span></h3>
                            <div className="space-y-3">
                                {charts.popular_sports.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center text-white/80">
                                        <span className="text-[10px] font-bold uppercase tracking-widest truncate max-w-[150px]">{item.name}</span>
                                        <span className="text-[10px] font-black text-[#38BDF8]">{item.count} Mission</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Recent Bookings Feed */}
                <div className="bg-white rounded-[3rem] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/40">
                    <div className="px-10 py-8 flex justify-between items-center border-b border-slate-50">
                        <h3 className="text-xl font-['Permanent_Marker'] italic uppercase text-slate-800">Recent <span className="text-[#38BDF8]">Bookings</span></h3>
                        <Link href={route('admin.bookings.index')} className="text-[9px] font-black uppercase tracking-[0.2em] text-[#38BDF8] hover:text-slate-900 transition-colors">View All Archive ➡</Link>
                    </div>
                    <div className="overflow-x-auto scrollbar-hide">
                        <table className="w-full text-left min-w-[800px]">
                            <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <tr>
                                    <th className="px-10 py-5">Pilot / Guest</th>
                                    <th className="px-8 py-5">Venue</th>
                                    <th className="px-8 py-5">Total</th>
                                    <th className="px-8 py-5">Payment</th>
                                    <th className="px-10 py-5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {recent_bookings.map((booking, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-10 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-slate-800 uppercase italic tracking-tighter">
                                                    {booking.guest_name || booking.user?.name || 'Unknown Pilot'}
                                                </span>
                                                <span className="text-[9px] text-slate-400 font-medium">{booking.guest_email || booking.user?.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{booking.facility?.name}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[11px] font-black text-slate-900">Rp {Number(booking.total_price).toLocaleString('id-ID')}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${booking.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                                                }`}>
                                                {booking.payment_status}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <Link href={route('admin.bookings.index')} className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-[#38BDF8] hover:text-white transition-all ml-auto">
                                                👁️
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
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg shadow-slate-200/30 flex flex-col items-center group overflow-hidden relative"
        >
            <div className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-10 transition-opacity" style={{ backgroundColor: color, borderRadius: '0 0 0 100%' }} />
            <div className="w-16 h-16 rounded-3xl mb-4 flex items-center justify-center text-3xl transition-transform group-hover:scale-110" style={{ backgroundColor: `${color}15` }}>
                {icon}
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{label}</span>
            <span className="text-2xl font-black text-slate-900 tracking-tighter">{value}</span>
        </motion.div>
    );
}
