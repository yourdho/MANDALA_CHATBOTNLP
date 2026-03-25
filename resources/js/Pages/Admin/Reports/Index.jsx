import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function ReportIndex({ revenue_total, platform_fee, bookings_count, popular_facility, monthly_data }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-4xl font-['Permanent_Marker'] italic text-slate-900 uppercase tracking-tighter leading-none">
                        Laporan <span className="text-[#38BDF8]">Keuangan</span>
                    </h2>
                    <span className="hidden sm:inline-block px-4 py-2 bg-[#38BDF8]/10 text-[#38BDF8] text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-[#38BDF8]/30">
                        Operational Analytics
                    </span>
                </div>
            }
        >
            <Head title="Laporan Keuangan | Mandala Arena" />

            <div className="max-w-7xl mx-auto space-y-12 pb-20">

                {/* Tactical Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <StatCard title="Total Pendapatan" value={`Rp ${parseInt(revenue_total).toLocaleString()}`} unit="IDR" highlight />
                    <StatCard title="Misi / Booking Selesai" value={bookings_count} unit="Transaksi" />
                    <StatCard title="Estimasi Pajak/Fee" value={`Rp ${parseInt(platform_fee).toLocaleString()}`} unit="IDR" />
                    <StatCard title="Fasilitas Terpopuler" value={popular_facility?.name ?? 'N/A'} unit="Unit" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Revenue Trends Chart - Industrial look */}
                    <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#38BDF8]/5 rounded-full blur-[100px]" />

                        <div className="flex justify-between items-end mb-16 relative z-10">
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic mb-2">Trend Pendapatan</h3>
                                <p className="text-3xl font-['Permanent_Marker'] italic text-slate-800 uppercase tracking-tight leading-none">Grafik Bulanan <span className="text-[#38BDF8]">Mandala Arena</span></p>
                            </div>
                        </div>

                        <div className="flex items-end gap-4 h-72 border-b border-slate-100 pb-2 relative z-10 mt-8">
                            {monthly_data.map((m, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scaleY: 0 }}
                                    animate={{ scaleY: 1 }}
                                    transition={{ duration: 1.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                                    className="flex-1 bg-slate-100 rounded-t-xl relative group/bar hover:bg-[#38BDF8] transition-all origin-bottom border-x border-t border-slate-200"
                                    style={{ height: `${Math.max(10, (m.total / (revenue_total || 1)) * 400)}%` }}
                                >
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-3 py-2 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-all shadow-lg pointer-events-none z-20 whitespace-nowrap">
                                        Rp {parseInt(m.total).toLocaleString()}
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#38BDF8]/10 to-transparent opacity-0 group-hover/bar:opacity-100 transition-opacity" />
                                </motion.div>
                            ))}
                            {monthly_data.length === 0 && (
                                <div className="w-full text-center text-slate-300 font-bold uppercase tracking-widest pb-8">Belum ada data grafik bulan ini.</div>
                            )}
                        </div>
                    </div>

                    {/* Operational Summary Card */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 border border-slate-800 shadow-xl shadow-slate-900/20 group relative overflow-hidden">
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#FACC15]/10 rounded-full blur-[60px]" />

                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#38BDF8] italic mb-2">Ringkasan Operasional</h3>
                                <p className="text-3xl font-['Permanent_Marker'] italic text-white uppercase tracking-tight leading-none mb-12">Data Analitik</p>

                                <div className="space-y-8">
                                    <ActivityRow label="Registrasi Baru" value="+12%" color="primary" />
                                    <ActivityRow label="Pelanggan Aktif" value="84%" color="accent" />
                                    <ActivityRow label="Rata-rata Main" value="1.8 Jam" color="primary" />
                                    <ActivityRow label="Rating Fasilitas" value="4.9 / 5" color="accent" />
                                </div>
                            </div>

                            <button onClick={() => window.print()} className="w-full mt-10 bg-white/10 border border-white/20 text-white text-[10px] font-black py-5 rounded-2xl uppercase tracking-[0.4em] hover:bg-[#38BDF8] hover:border-[#38BDF8] hover:shadow-lg hover:shadow-[#38BDF8]/30 transition-all italic">
                                CETAK PDF LAPORAN
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @media print {
                    body > * { display: none !important; }
                    .print\\:bg-white { display: block !important; position: absolute; left: 0; top: 0; min-width: 100vw; min-height: 100vh; z-index: 9999; }
                    .print\\:hidden { display: none !important; }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}

function StatCard({ title, value, unit, highlight = false }) {
    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            className={`rounded-[2rem] p-8 md:p-10 border transition-all ${highlight ? 'bg-[#38BDF8] border-[#38BDF8] shadow-xl shadow-[#38BDF8]/30' : 'bg-white border-slate-100 shadow-sm shadow-slate-100'}`}
        >
            <span className={`text-[10px] font-black uppercase tracking-[0.4em] italic mb-6 block ${highlight ? 'text-white/80' : 'text-slate-400'}`}>
                {title}
            </span>
            <div className="flex flex-col gap-2">
                <span className={`text-3xl md:text-4xl font-['Permanent_Marker'] italic tracking-tight uppercase leading-none ${highlight ? 'text-white drop-shadow-sm' : 'text-slate-800'}`}>
                    {value}
                </span>
                <span className={`text-[9px] font-black uppercase tracking-[0.5em] mt-2 ${highlight ? 'text-white/60' : 'text-[#38BDF8]/60'}`}>
                    SATUAN: {unit}
                </span>
            </div>
        </motion.div>
    );
}

function ActivityRow({ label, value, color }) {
    const textColor = color === 'primary' ? 'text-[#38BDF8]' : 'text-[#FACC15]';

    return (
        <div className="flex justify-between items-end border-b border-slate-700/50 pb-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</span>
            <span className={`text-2xl font-['Permanent_Marker'] italic tracking-tight leading-none ${textColor}`}>{value}</span>
        </div>
    );
}
