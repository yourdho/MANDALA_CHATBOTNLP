import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function ReportIndex({ revenue_total, platform_fee, bookings_count, popular_facility, monthly_data }) {
    return (
        <AuthenticatedLayout>
            <Head title="Laporan Keuangan | Mandala Arena" />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-12 mb-12 px-4 print:hidden"
                style={{ borderColor: 'var(--border)' }}>
                <div>
                    <p className="text-[10px] font-black text-[#38BDF8] uppercase tracking-[0.3em] mb-4">Financial Intelligence Terminal</p>
                    <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none"
                        style={{ color: 'var(--text-primary)' }}>
                        Analytics <span className="text-[#38BDF8]">Log</span>
                    </h1>
                </div>
                <div className="flex items-center gap-3 px-5 py-2 rounded-full border"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest"
                        style={{ color: 'var(--text-secondary)' }}>
                        REAL-TIME DATA FEED ACTIVE
                    </span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-12 pb-20 print:hidden">

                {/* Tactical Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <StatCard title="Total Pendapatan" value={`Rp ${parseInt(revenue_total).toLocaleString()}`} unit="Total IDR" highlight />
                    <StatCard title="Misi Selesai" value={bookings_count} unit="Successful Sessions" color="#FACC15" />
                    <StatCard title="Estimasi Fee" value={`Rp ${parseInt(platform_fee).toLocaleString()}`} unit="IDR Tax Estimate" color="#A855F7" />
                    <StatCard title="Aset Terpopuler" value={popular_facility?.name ?? 'N/A'} unit="Peak Performance Unit" color="#10B981" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Revenue Trends Chart - Industrial look */}
                    <div className="lg:col-span-2 rounded-[3.5rem] p-12 border shadow-3xl relative overflow-hidden group transition-all"
                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-[#38BDF8]/5 rounded-full blur-[120px] -mr-64 -mt-64 group-hover:scale-110 transition-transform duration-[4s]" />

                        <div className="flex justify-between items-end mb-16 relative z-10">
                            <div>
                                <p className="text-[10px] font-black text-[#38BDF8] uppercase tracking-[0.4em] mb-4">Revenue Trends Matrix</p>
                                <h3 className="text-4xl font-black italic uppercase tracking-tighter leading-none"
                                    style={{ color: 'var(--text-primary)' }}>
                                    Monthly <span className="text-[#38BDF8]">Telemetry</span>
                                </h3>
                            </div>
                        </div>

                        <div className="flex items-end gap-3 md:gap-6 h-80 border-b pb-4 relative z-10 mt-12"
                            style={{ borderColor: 'var(--border)' }}>
                            {monthly_data.map((m, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                                    <motion.div
                                        initial={{ scaleY: 0 }}
                                        animate={{ scaleY: 1 }}
                                        transition={{ duration: 1.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                                        className="w-full rounded-t-xl relative group/bar hover:bg-[#38BDF8] transition-all origin-bottom border-x border-t"
                                        style={{
                                            background: 'var(--bg-base)',
                                            borderColor: 'var(--border)',
                                            height: `${Math.max(10, (m.total / (Math.max(...monthly_data.map(d => d.total)) || 1)) * 100)}%`
                                        }}
                                    >
                                        <div className="absolute -top-14 left-1/2 -translate-x-1/2 text-[10px] font-black px-4 py-2 rounded-xl opacity-0 group-hover/bar:opacity-100 transition-all shadow-2xl pointer-events-none z-20 whitespace-nowrap"
                                            style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                                            Rp {parseInt(m.total).toLocaleString()}
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#38BDF8]/20 to-transparent opacity-0 group-hover/bar:opacity-100 transition-opacity" />
                                    </motion.div>
                                    <span className="text-[10px] font-black uppercase tracking-widest truncate w-full text-center mt-4"
                                        style={{ color: 'var(--text-secondary)' }}>{m.month.slice(0, 3)}</span>
                                </div>
                            ))}
                            {monthly_data.length === 0 && (
                                <div className="w-full text-center font-bold uppercase tracking-widest pb-8" style={{ color: 'var(--text-secondary)' }}>Belum ada data grafik bulan ini.</div>
                            )}
                        </div>
                    </div>

                    {/* Operational Summary Card */}
                    <div className="rounded-[3.5rem] p-12 border shadow-3xl group relative overflow-hidden transition-all"
                        style={{ background: 'var(--text-primary)', borderColor: 'var(--border)' }}>
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#38BDF8]/10 rounded-full blur-[100px] -mb-32 -mr-32" />

                        <div className="relative z-10 flex flex-col h-full items-center text-center">
                            <p className="text-[10px] font-black text-[#38BDF8] uppercase tracking-[0.4em] mb-4">Operational Status</p>
                            <h3 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-12"
                                style={{ color: 'var(--bg-card)' }}>
                                System Summary
                            </h3>

                            <div className="space-y-6 w-full max-w-xs">
                                <ActivityRow label="New Pilots" value="+12%" color="primary" invert />
                                <ActivityRow label="Sector Engagement" value="84%" color="accent" invert />
                                <ActivityRow label="Avg Session Time" value="1.8h" color="primary" invert />
                                <ActivityRow label="Unit Efficiency" value="4.9/5" color="accent" invert />
                            </div>
                        </div>

                        <button onClick={() => window.print()}
                            className="w-full mt-10 border-2 text-[10px] font-black py-5 rounded-2xl uppercase tracking-[0.3em] hover:scale-105 transition-all italic hover:bg-[#38BDF8] hover:border-[#38BDF8]"
                            style={{ background: 'transparent', borderColor: 'var(--border)', color: 'var(--bg-card)' }}>
                            Print Tactical Document
                        </button>
                    </div>
                </div>
            </div>

            {/* ──────────── PRINT VIEW (HIDDEN ON SCREEN) ──────────── */}
            <div className="hidden print:block p-16 bg-white text-slate-900 min-h-screen">
                <div className="border-b-8 border-slate-900 pb-12 mb-16 flex justify-between items-end">
                    <div>
                        <h1 className="text-6xl font-black italic uppercase tracking-tighter">Mandala<span className="text-[#38BDF8]">Arena</span></h1>
                        <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 mt-2">Official Mission & Operational Recap</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[11px] font-black uppercase tracking-widest mb-1">Coded On: {new Date().toLocaleDateString('id-ID')}</p>
                        <p className="text-[11px] font-black uppercase tracking-widest">Sector Year: {new Date().getFullYear()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-16 mb-24">
                    <div className="space-y-6 border-l-[10px] border-[#38BDF8] pl-10 py-4">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Total Revenue Generated</h3>
                        <p className="text-6xl font-black italic tracking-tighter">Rp {parseInt(revenue_total).toLocaleString()}</p>
                    </div>
                    <div className="space-y-6 border-l-[10px] border-[#FACC15] pl-10 py-4">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Total Tactical Deployments</h3>
                        <p className="text-6xl font-black italic tracking-tighter">{bookings_count} SESSIONS</p>
                    </div>
                </div>

                <div className="mb-24">
                    <h3 className="text-sm font-black italic uppercase tracking-[0.4em] mb-12 border-b pb-6">Monthly Revenue Matrix Telemetry</h3>
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-900 text-white text-left uppercase text-[10px] font-black tracking-widest italic">
                                <th className="py-6 px-8 border border-slate-900">Mission Month</th>
                                <th className="py-6 px-8 border border-slate-900 text-right">Yield Value (IDR)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-900">
                            {monthly_data.map((m, i) => (
                                <tr key={i} className="text-xs font-black uppercase italic tracking-tighter">
                                    <td className="py-5 px-8 border border-slate-900">{m.month}</td>
                                    <td className="py-5 px-8 border border-slate-900 text-right">Rp {parseInt(m.total).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-auto pt-24 text-center border-t-2 border-slate-100 italic">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">This document was automatically compiled by Mandala Arena HQ Terminal. Classification: CONFIDENTIAL.</p>
                </div>
            </div>

            <style>{`
                @media print {
                    @page { margin: 1cm; size: A4 portrait; }
                    .print\\:hidden, nav, header, aside, .chatbot-container, button { display: none !important; }
                    .print\\:block { display: block !important; }
                    body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    main { padding: 0 !important; margin: 0 !important; }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}

function StatCard({ title, value, unit, highlight = false, color = '#38BDF8' }) {
    return (
        <motion.div
            whileHover={{ y: -8 }}
            className={`rounded-[2.5rem] p-10 border transition-all shadow-2xl relative overflow-hidden group`}
            style={{
                background: highlight ? '#38BDF8' : 'var(--bg-card)',
                borderColor: highlight ? '#38BDF8' : 'var(--border)'
            }}
        >
            <div className="absolute top-0 right-0 w-32 h-32 blur-[80px] group-hover:scale-150 transition-transform duration-1000 opacity-10" style={{ backgroundColor: highlight ? 'white' : color }} />

            <p className={`text-[10px] font-black uppercase tracking-[0.4em] mb-12 block ${highlight ? 'text-white' : 'text-[#38BDF8]'}`}>
                {title}
            </p>
            <div className="flex flex-col gap-2 relative z-10">
                <span className={`text-4xl font-black italic tracking-tighter uppercase leading-none ${highlight ? 'text-white text-center italic drop-shadow-2xl' : ''}`}
                    style={{ color: highlight ? 'white' : 'var(--text-primary)' }}>
                    {value}
                </span>
                <span className={`text-[10px] font-black uppercase tracking-[0.4em] mt-2 italic ${highlight ? 'text-white/60' : ''}`}
                    style={{ color: highlight ? 'white' : 'var(--text-secondary)' }}>
                    {unit}
                </span>
            </div>
        </motion.div>
    );
}

function ActivityRow({ label, value, color, invert = false }) {
    const textColor = color === 'primary' ? '#38BDF8' : '#FACC15';

    return (
        <div className="flex justify-between items-end border-b pb-4" style={{ borderColor: invert ? 'rgba(255,255,255,0.1)' : 'var(--border)' }}>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: invert ? 'rgba(255,255,255,0.4)' : 'var(--text-secondary)' }}>{label}</span>
            <span className={`text-3xl font-black italic tracking-tighter leading-none`} style={{ color: textColor }}>{value}</span>
        </div>
    );
}
