import AuthenticatedLayout from '@/Components/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import AutoCarousel from '@/Components/Shared/AutoCarousel';

export default function Dashboard({ stats, facilities = [], promos = [] }) {
    const user = usePage().props.auth.user;
    const isUser = user?.role === 'user';
    const isAdmin = user?.role === 'admin';

    // Status mapping for localized display
    const statusMap = {
        'confirmed': 'Mission Success',
        'pending': 'Standby',
        'cancelled': 'Aborted',
        'failed': 'System Error'
    };

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard | Mandala Arena" />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-12 mb-12 px-4"
                style={{ borderColor: 'var(--border)' }}>
                <div>
                    <p className="text-[10px] font-black text-[#38BDF8] uppercase tracking-[0.3em] mb-4">Member Terminal</p>
                    <h1 className="text-2xl md:text-7xl font-black italic uppercase tracking-tighter leading-none"
                        style={{ color: 'var(--text-primary)' }}>
                        Dashboard <span className="text-[#38BDF8]">Arena</span>
                    </h1>
                </div>
                <div className="flex items-center gap-3 px-5 py-2 rounded-full border"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <div className="w-2 h-2 bg-[#FACC15] rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest"
                        style={{ color: 'var(--text-secondary)' }}>
                        Peran: {isAdmin ? 'Administrator' : 'Field Member'}
                    </span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-16 pb-20">

                {/* 1. Welcome Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                    className="relative rounded-[3.5rem] p-6 md:p-12 overflow-hidden border shadow-3xl group transition-all"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                >
                    <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-[#38BDF8]/5 rounded-full blur-[120px] -mr-96 -mt-96 group-hover:scale-110 transition-transform duration-[4s]" />
                    <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-[#FACC15]/5 rounded-full blur-[120px] -ml-64 -mb-64" />

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-12 items-center text-center md:text-left">
                        <div className="md:col-span-8">
                            <p className="font-black text-[#38BDF8] uppercase text-[10px] tracking-[0.4em] mb-6">Identification Protocol</p>
                            <h1 className="text-2xl md:text-6xl font-black italic uppercase tracking-tighter leading-none mb-6"
                                style={{ color: 'var(--text-primary)' }}>
                                Selamat datang, <br className="sm:hidden" /> <span className="text-[#38BDF8] underline decoration-2 md:decoration-4 decoration-[#38BDF8]/20">{user?.name}</span>
                            </h1>
                            <p className="font-bold max-w-lg leading-relaxed text-[11px] md:text-sm uppercase tracking-wide opacity-80"
                                style={{ color: 'var(--text-secondary)' }}>
                                Siap untuk berolahraga hari ini? Cek ketersediaan lapangan dan booking sekarang juga.
                            </p>
                        </div>
                        <div className="md:col-span-4 flex justify-center md:justify-end">
                            <div className="w-32 h-32 border-2 rounded-[2.5rem] flex flex-col items-center justify-center shadow-2xl relative overflow-hidden group/rank transition-all"
                                style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}>
                                <div className="absolute inset-0 bg-[#38BDF8]/10 opacity-0 group-hover/rank:opacity-100 transition-opacity" />
                                <span className="text-5xl font-black italic text-[#38BDF8] group-hover/rank:scale-125 transition-transform duration-700">M</span>
                                <span className="text-[10px] font-black uppercase tracking-widest mt-2" style={{ color: 'var(--text-secondary)' }}>Active</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
                {/* 3. Stats Grid (Admin/User) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {isUser ? (
                        <>
                            <StatCard title="Total Booking" value={stats?.total_bookings ?? 0} unit="Sesi Olahraga" color="#38BDF8" icon="" />
                            <StatCard title="Booking Aktif" value={stats?.active_bookings ?? 0} unit="Jadwal Mendatang" color="#FACC15" icon="" />
                            <StatCard title="Saldo Poin" value={user?.points_balance || 0} unit="Token Mandala" color="#A855F7" icon="" />
                        </>
                    ) : (
                        <>
                            <StatCard title="Total Pendapatan" value={`RP ${parseInt(stats?.total_revenue ?? 0).toLocaleString('id-ID')}`} unit="Total IDR" color="#38BDF8" icon="" />
                            <StatCard title="Booking Hari Ini" value={stats?.bookings_today ?? 0} unit="Sesi Aktif" color="#FACC15" icon="" />
                            <StatCard title="Total Pengguna" value={stats?.total_users ?? 0} unit="Anggota Terdaftar" color="#10B981" icon="" />
                        </>
                    )}
                </div>
                {/* 2.5 Promo / Diskon (User Only) */}
                {isUser && promos.length > 0 && (
                    <div className="space-y-10">
                        <div className="flex items-center justify-between">
                            <div className="space-y-4">
                                <h3 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter" style={{ color: 'var(--text-primary)' }}>
                                    Promo <span className="text-[#FACC15]">Mandala</span>
                                </h3>
                                <p className="text-[10px] font-black text-[#FACC15] uppercase tracking-[0.4em]">Available Rewards & Discounts</p>
                            </div>
                            <div className="hidden md:block flex-1 h-[1px] ml-12" style={{ background: 'var(--border)' }} />
                            <Link href={route('user.rewards.index')} className="text-[10px] uppercase font-black tracking-widest text-[#FACC15] hover:underline whitespace-nowrap ml-4">Lihat Promo</Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {promos.map((promo, i) => (
                                <motion.div
                                    key={promo.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-6 rounded-[2rem] border overflow-hidden relative group hover:-translate-y-2 transition-all shadow-xl"
                                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#FACC15]/10 rounded-full blur-2xl group-hover:scale-150 transition-all opacity-50" />
                                    <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="w-10 h-10 rounded-xl bg-[#FACC15]/20 flex items-center justify-center text-[#FACC15] text-xl">🎉</div>
                                                <div className="px-3 py-1 rounded-full bg-[#FACC15]/10 text-[#FACC15] text-[8px] font-black uppercase tracking-widest border border-[#FACC15]/20">
                                                    {promo.points_required} Points
                                                </div>
                                            </div>
                                            <h4 className="text-xl font-black italic uppercase tracking-tighter mb-2" style={{ color: 'var(--text-primary)' }}>{promo.title}</h4>
                                            <p className="text-[10px] uppercase tracking-widest opacity-60 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{promo.description}</p>
                                        </div>
                                        <Link href={route('user.rewards.index')} className="w-full block py-3 bg-[#FACC15] text-slate-900 rounded-xl text-center text-[10px] font-black uppercase tracking-widest shadow-md hover:scale-105 transition-all outline-none">
                                            Klaim Promo
                                        </Link>
                                    </div>
                                    <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#FACC15] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. List Fasilitas (User Only) */}
                {isUser && (
                    <div className="space-y-10">
                        <div className="flex items-center justify-between">
                            <div className="space-y-4">
                                <h3 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter" style={{ color: 'var(--text-primary)' }}>
                                    Fasilitas <span className="text-[#38BDF8]">Tersedia</span>
                                </h3>
                                <p className="text-[10px] font-black text-[#38BDF8] uppercase tracking-[0.4em]">Strategic Area Selection</p>
                            </div>
                            <div className="hidden md:block flex-1 h-[1px] ml-12" style={{ background: 'var(--border)' }} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {facilities.map((f, i) => (
                                <motion.div
                                    key={f.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="rounded-[2.5rem] overflow-hidden border group transition-all shadow-2xl"
                                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                                >
                                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
                                        <AutoCarousel images={f.images || []} name={f.name} />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-80 pointer-events-none" />
                                        <div className="absolute bottom-5 left-5 pointer-events-none z-20">
                                            <span className="text-2xl font-black italic text-white uppercase tracking-tighter drop-shadow-md">{f.name}</span>
                                        </div>
                                    </div>
                                    <div className="p-6 md:p-8">
                                        <div className="flex justify-between items-end gap-4">
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>Tactical Access</p>
                                                <p className="text-2xl font-black italic tracking-tighter text-[#FACC15]">RP {parseInt(f.price_per_hour).toLocaleString('id-ID')}<span className="text-[10px] opacity-60 ml-2 italic">/ Hour</span></p>
                                            </div>
                                            <Link
                                                href={route('facility.show', f.id)}
                                                className="px-8 py-3 bg-[#38BDF8] text-slate-900 font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-[#38BDF8]/20 hover:scale-105 transition-all"
                                            >
                                                Booking
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}



                {/* 4. Riwayat Booking / Table Log */}
                <div className="space-y-12">
                    <div className="flex items-center gap-8 px-4">
                        <div className="space-y-4">
                            <h3 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter" style={{ color: 'var(--text-primary)' }}>
                                Riwayat <span className="text-[#38BDF8]">Terbaru</span>
                            </h3>
                            <p className="text-[10px] font-black text-[#38BDF8] uppercase tracking-[0.4em]">Mission Log Telemetry</p>
                        </div>
                        <div className="flex-1 h-[1px]" style={{ background: 'var(--border)' }} />
                    </div>

                    <div className="bg-white rounded-[2rem] border overflow-hidden shadow-none transition-colors"
                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                            {isUser ? (
                                stats?.recent_missions?.length > 0 ? (
                                    stats.recent_missions.map((m, i) => (
                                        <motion.div
                                            key={m.id}
                                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-8 hover:bg-slate-400/5 transition-all group"
                                        >
                                            <div className="flex items-center gap-6 mb-4 sm:mb-0">
                                                <div className="w-16 h-16 rounded-2xl border flex items-center justify-center font-black italic text-2xl text-[#38BDF8] transition-transform group-hover:scale-110"
                                                    style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}>
                                                    {m.facility?.name?.charAt(0) || 'F'}
                                                </div>
                                                <div>
                                                    <h4 className="text-lg md:text-xl font-black italic uppercase tracking-tight mb-1 group-hover:text-[#38BDF8] transition-colors"
                                                        style={{ color: 'var(--text-primary)' }}>{m.facility?.name}</h4>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60" style={{ color: 'var(--text-secondary)' }}>
                                                        {new Date(m.starts_at).toLocaleDateString()} • {new Date(m.starts_at).toLocaleTimeString('id-ID').slice(0, 5)} - {new Date(m.ends_at).toLocaleTimeString('id-ID').slice(0, 5)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between sm:justify-end sm:gap-8 mt-4 sm:mt-0 p-4 sm:p-0 rounded-2xl bg-slate-500/5 sm:bg-transparent border sm:border-0 border-white/5">
                                                <div className="text-left sm:text-right">
                                                    <p className="text-xl md:text-2xl font-black italic tracking-tighter uppercase mb-1 sm:mb-2" style={{ color: 'var(--text-primary)' }}>RP {parseInt(m.total_price).toLocaleString('id-ID')}</p>
                                                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest inline-block border ${m.status === 'confirmed'
                                                        ? 'text-[#38BDF8] border-[#38BDF8]/20 bg-[#38BDF8]/5'
                                                        : m.status === 'cancelled' || m.status === 'failed'
                                                            ? 'text-red-400 border-red-500/20 bg-red-500/5'
                                                            : 'text-amber-400 border-amber-500/20 bg-amber-500/5'
                                                        }`}>
                                                        {statusMap[m.status] || m.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="py-24 text-center" style={{ background: 'var(--bg-base)' }}>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--text-secondary)' }}>Belum ada riwayat booking.</p>
                                    </div>
                                )
                            ) : (
                                <div className="py-24 text-center" style={{ background: 'var(--bg-base)' }}>
                                    <span className="text-7xl font-black italic text-[#38BDF8] opacity-20">M</span>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-8 max-w-xs mx-auto" style={{ color: 'var(--text-secondary)' }}>
                                        Masuk ke menu Modul Admin di sidebar untuk detail operasional harian Anda secara real-time.
                                    </p>
                                </div>
                            )}
                        </div>
                        {isUser && stats?.recent_missions?.length > 0 && (
                            <Link href={route('bookings.index')} className="block w-full py-8 text-center text-[10px] font-black uppercase tracking-[0.4em] transition-colors border-t"
                                style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                                Lihat Semua Riwayat →
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout >
    );
}

function StatCard({ title, value, unit, color, icon }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`p-6 md:p-8 rounded-[2.5rem] border shadow-2xl relative overflow-hidden group transition-all`}
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
            <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] group-hover:scale-150 transition-transform duration-1000 opacity-5`} style={{ backgroundColor: color }} />
            <div className="flex justify-between items-start mb-6">
                <span className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--text-secondary)' }}>{title}</span>
                <span className="text-2xl transition-transform group-hover:scale-110">{icon || '📊'}</span>
            </div>
            <div className="flex flex-col gap-1 relative z-10">
                <span className={`text-3xl font-black italic tracking-tighter uppercase leading-none`} style={{ color: color }}>
                    {value}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-2" style={{ color: 'var(--text-primary)' }}>{unit}</span>
            </div>
            <div className="absolute bottom-0 left-0 h-1 transition-all duration-500 w-0 group-hover:w-full opacity-50" style={{ backgroundColor: color }} />
        </motion.div>
    );
}
