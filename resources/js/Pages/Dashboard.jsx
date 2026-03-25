import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function Dashboard({ stats, facilities = [] }) {
    const user = usePage().props.auth.user;
    const isUser = user?.role === 'user';
    const isAdmin = user?.role === 'admin';

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                    <h2 className="text-4xl md:text-5xl font-black italic tracking-tight text-slate-900 uppercase leading-none">
                        Dashboard <span className="text-[#38BDF8]">Arena</span>
                    </h2>
                    <div className="flex items-center gap-4">
                        <span className="bg-slate-50 text-slate-500 text-[10px] font-bold px-4 py-2 rounded-xl uppercase tracking-widest border border-slate-200">
                            Role: {user?.role}
                        </span>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard | Mandala Arena" />

            <div className="max-w-7xl mx-auto space-y-16 pb-20">

                {/* 1. Welcome Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                    className="relative rounded-[2.5rem] bg-white p-12 overflow-hidden border border-slate-100 shadow-xl shadow-slate-100/50 group"
                >
                    <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-[#38BDF8]/5 rounded-full blur-[100px] -mr-96 -mt-96 group-hover:scale-110 transition-transform duration-[3s]" />
                    <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-[#FACC15]/5 rounded-full blur-[100px] -ml-64 -mb-64" />

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
                        <div className="md:col-span-8">
                            <h3 className="text-slate-400 font-bold uppercase text-xs tracking-[0.3em] mb-4">Mandala Arena Center</h3>
                            <h1 className="text-4xl md:text-6xl font-black italic text-slate-900 uppercase tracking-tighter leading-none mb-6 drop-shadow-sm">
                                Selamat datang, <span className="text-[#38BDF8]">{user?.name}</span> ⚡
                            </h1>
                            <p className="text-slate-500 font-medium max-w-lg leading-relaxed md:text-lg">
                                Siap untuk berolahraga hari ini? Cek ketersediaan lapangan dan booking sekarang juga.
                            </p>
                        </div>
                        <div className="md:col-span-4 flex justify-center md:justify-end">
                            <div className="w-40 h-40 bg-slate-50 border-2 border-slate-100 rounded-3xl flex flex-col items-center justify-center shadow-lg shadow-slate-200/50 relative overflow-hidden group/rank">
                                <div className="absolute inset-0 bg-[#38BDF8]/5 opacity-0 group-hover/rank:opacity-100 transition-opacity" />
                                <span className="text-6xl font-black italic text-[#38BDF8] group-hover/rank:scale-110 transition-transform duration-500">M</span>
                                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mt-2">Verified</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 2. List Fasilitas (User Only) */}
                {isUser && (
                    <div className="space-y-10">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black italic text-slate-900 uppercase tracking-tight">Fasilitas <span className="text-[#38BDF8]">Tersedia</span></h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pilih area olahraga Anda</p>
                            </div>
                            <div className="hidden md:block w-24 h-[1px] bg-slate-200" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {facilities.map((f, i) => (
                                <motion.div
                                    key={f.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 group hover:border-[#38BDF8]/30 transition-all shadow-lg shadow-slate-100/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#38BDF8]/10"
                                >
                                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                                        <img
                                            src={f.images?.[0] || 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=500'}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]"
                                            alt={f.name}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-80" />
                                        <div className="absolute bottom-5 left-5">
                                            <span className="text-2xl font-black italic text-white uppercase tracking-tighter drop-shadow-md">{f.name}</span>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Mulai Dari</p>
                                                <p className="text-lg font-black text-[#FACC15] drop-shadow-sm">Rp {parseInt(f.price_per_hour).toLocaleString()}</p>
                                            </div>
                                            <Link
                                                href={route('facility.show', f.id)}
                                                className="px-6 py-3 bg-[#38BDF8] text-white font-bold rounded-xl text-xs uppercase tracking-widest shadow-md hover:bg-[#38BDF8]/90 transition-all shadow-[#38BDF8]/20"
                                            >
                                                Pesan ⚡
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. Stats Grid (Admin/User) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {isUser ? (
                        <>
                            <StatCard title="Total Booking" value={stats?.total_bookings ?? 0} unit="Sesi Olahraga" color="#38BDF8" icon="🏟️" />
                            <StatCard title="Booking Aktif" value={stats?.active_bookings ?? 0} unit="Jadwal Mendatang" color="#FACC15" icon="🕒" />
                            <StatCard title="Saldo Poin" value={user?.points_balance || 0} unit="Mandala Tokens" color="#A855F7" icon="✨" />
                        </>
                    ) : (
                        <>
                            <StatCard title="Total Pendapatan" value={`Rp ${parseInt(stats?.total_revenue ?? 0).toLocaleString()}`} unit="IDR Keseluruhan" color="#38BDF8" icon="💰" />
                            <StatCard title="Booking Hari Ini" value={stats?.bookings_today ?? 0} unit="Sesi Aktif" color="#FACC15" icon="👥" />
                            <StatCard title="Total User" value={stats?.total_users ?? 0} unit="Member Terdaftar" color="#10B981" icon="👤" />
                        </>
                    )}
                </div>

                {/* 4. Riwayat Booking / Table Log */}
                <div className="space-y-8">
                    <div className="flex items-center gap-6">
                        <h3 className="text-2xl font-black italic text-slate-900 uppercase tracking-tight">Riwayat <span className="text-[#38BDF8]">Terbaru</span></h3>
                        <div className="h-[1px] flex-1 bg-slate-200" />
                    </div>

                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
                        <div className="divide-y divide-slate-100">
                            {isUser ? (
                                stats?.recent_missions?.length > 0 ? (
                                    stats.recent_missions.map((m, i) => (
                                        <motion.div
                                            key={m.id}
                                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between p-8 hover:bg-slate-50 transition-all group"
                                        >
                                            <div className="flex items-center gap-6 mb-4 sm:mb-0">
                                                <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black italic text-2xl text-[#38BDF8]">
                                                    {m.facility?.name?.charAt(0) || 'F'}
                                                </div>
                                                <div>
                                                    <h4 className="text-xl font-black italic text-slate-900 uppercase tracking-tight mb-1 group-hover:text-[#38BDF8] transition-colors">{m.facility?.name}</h4>
                                                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                                        {new Date(m.starts_at).toLocaleDateString()} • {new Date(m.starts_at).toLocaleTimeString().slice(0, 5)} - {new Date(m.ends_at).toLocaleTimeString().slice(0, 5)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between sm:justify-end sm:gap-6 ml-20 sm:ml-0">
                                                <div className="text-left sm:text-right">
                                                    <p className="text-lg font-black text-slate-800 italic tracking-tighter uppercase mb-2">Rp {parseInt(m.total_price).toLocaleString()}</p>
                                                    <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest inline-block ${m.status === 'confirmed'
                                                        ? 'bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20 shadow-sm'
                                                        : m.status === 'cancelled' || m.status === 'failed'
                                                            ? 'bg-red-50 text-red-500 border border-red-100'
                                                            : 'bg-amber-50 text-amber-600 border border-amber-100'
                                                        }`}>
                                                        {m.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="py-24 text-center bg-slate-50/50">
                                        <span className="text-5xl opacity-40">🏟️</span>
                                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-6">Belum ada riwayat booking.</p>
                                    </div>
                                )
                            ) : (
                                <div className="py-24 text-center bg-slate-50/50">
                                    <span className="text-6xl text-[#38BDF8] italic opacity-50">M</span>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-6 max-w-sm mx-auto">Masuk ke menu Admin Modul di sidebar untuk detail operasional harian.</p>
                                </div>
                            )}
                        </div>
                        {isUser && stats?.recent_missions?.length > 0 && (
                            <Link href={route('bookings.index')} className="block w-full py-6 bg-slate-50 text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-slate-800 transition-colors border-t border-slate-100">
                                Lihat Semua Riwayat ❯
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function StatCard({ title, value, unit, color, icon }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`bg-white p-8 md:p-10 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/50 relative overflow-hidden group hover:border-[${color}]/30`}
            style={{ borderBottomWidth: '4px', borderBottomColor: color }}
        >
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-1000`} style={{ backgroundColor: color, opacity: 0.1 }} />
            <div className="flex justify-between items-start mb-6">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{title}</span>
                <span className="text-2xl opacity-50">{icon}</span>
            </div>
            <div className="flex flex-col gap-2 relative z-10">
                <span className={`text-4xl lg:text-5xl font-black italic tracking-tight uppercase leading-none`} style={{ color: color }}>
                    {value}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">{unit}</span>
            </div>
        </motion.div>
    );
}
