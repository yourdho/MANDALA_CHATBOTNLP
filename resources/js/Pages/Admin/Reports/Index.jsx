import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function ReportIndex({ revenue_total, platform_fee, bookings_count, popular_facility, monthly_data }) {
    return (
        <AuthenticatedLayout>
            <Head title="Laporan Keuangan - Mandala Arena" />

            <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
                {/* ── Page Header ── */}
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b transition-colors"
                    style={{ borderColor: 'var(--border)' }}>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Laporan Keuangan</h1>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Analisis kinerja pendapatan dan operasional tahun ini.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 border border-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#38BDF8] hover:text-slate-900 transition-all shadow-md group"
                        >
                            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Cetak Laporan
                        </button>
                    </div>
                </header>

                {/* ── Key Metrics ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <SummaryCard
                        label="Total Pendapatan"
                        value={`Rp ${parseInt(revenue_total).toLocaleString('id-ID')}`}
                        subLabel="Pendapatan bruto tahun berjalan"
                        color="#38BDF8"
                    />
                    <SummaryCard
                        label="Total Booking"
                        value={bookings_count}
                        subLabel="Jumlah pesanan diproses"
                        color="#FACC15"
                    />
                    <SummaryCard
                        label="Estimasi Platform Fee"
                        value={`Rp ${parseInt(platform_fee).toLocaleString('id-ID')}`}
                        subLabel="Potongan biaya layanan (estimasi)"
                        color="#A855F7"
                    />
                    <SummaryCard
                        label="Venue Terlaris"
                        value={popular_facility?.name ?? 'N/A'}
                        subLabel="Fasilitas dengan pesanan terbanyak"
                        color="#10B981"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* ── Revenue Chart ── */}
                    <div className="lg:col-span-2 rounded-3xl p-8 border shadow-sm transition-all"
                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Tren Pendapatan Bulanan</h3>
                                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Visualisasi pergerakan yield dalam Rp.</p>
                            </div>
                        </div>

                        <div className="flex items-end gap-3 h-64 border-b pb-4 relative transition-all"
                            style={{ borderColor: 'var(--border)' }}>
                            {monthly_data.map((m, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-4 h-full justify-end group">
                                    <div className="relative w-full flex flex-col items-center justify-end h-full">
                                        <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-xl whitespace-nowrap z-20">
                                            Rp {parseInt(m.total).toLocaleString('id-ID')}
                                        </div>
                                        <motion.div
                                            initial={{ scaleY: 0 }}
                                            animate={{ scaleY: 1 }}
                                            className="w-full max-w-[40px] rounded-t-lg bg-[#38BDF8] opacity-80 group-hover:opacity-100 transition-all shadow-lg"
                                            style={{
                                                height: `${Math.max(5, (m.total / (Math.max(...monthly_data.map(d => d.total)) || 1)) * 100)}%`
                                            }}
                                        />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{m.month.slice(0, 3)}</span>
                                </div>
                            ))}
                            {monthly_data.length === 0 && (
                                <div className="w-full text-center py-10 text-xs italic" style={{ color: 'var(--text-secondary)' }}>Belum ada data bulanan.</div>
                            )}
                        </div>
                    </div>

                    {/* ── Operational Benchmarks ── */}
                    <div className="rounded-3xl p-8 border shadow-sm flex flex-col justify-between"
                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                        <div className="mb-8">
                            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Metrik Operasional</h3>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Indikator performa sistem dalam persen.</p>
                        </div>

                        <div className="space-y-6">
                            <MetricRow label="Peningkatan Pengguna" value="+12%" />
                            <MetricRow label="Tingkat Okupansi" value="84%" />
                            <MetricRow label="Sesi Rata-rata" value="1.8 Jam" />
                            <MetricRow label="Review Fasilitas" value="4.9 / 5" />
                        </div>

                        <div className="mt-10 p-4 bg-slate-500/5 rounded-2xl border border-dashed text-center"
                            style={{ borderColor: 'var(--border)' }}>
                            <p className="text-[10px] font-medium italic" style={{ color: 'var(--text-secondary)' }}>
                                "Performa di kuartal terakhir melampaui estimasi target tahunan."
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Detailed Tabular Data ── */}
                <div className="rounded-3xl border overflow-hidden shadow-sm"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
                        <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Rincian Data Bulanan</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-[10px] font-bold uppercase tracking-widest"
                                style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                                <tr>
                                    <th className="px-6 py-4">Bulan</th>
                                    <th className="px-6 py-4 text-right">Yield Pendapatan</th>
                                    <th className="px-6 py-4 text-center">Status Laporan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                                {monthly_data.map((m, idx) => (
                                    <tr key={idx} className="hover:bg-slate-500/5 transition-colors">
                                        <td className="px-6 py-4 text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{m.month}</td>
                                        <td className="px-6 py-4 text-xs font-bold text-right" style={{ color: 'var(--text-primary)' }}>Rp {parseInt(m.total).toLocaleString('id-ID')}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] font-bold rounded-full border border-emerald-500/20 uppercase">
                                                Finalized
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ──────────── PRINT VIEW (HIDDEN ON SCREEN) ──────────── */}
            <div className="hidden print:block p-10 bg-white text-slate-900 min-h-screen">
                <div className="flex justify-between items-start border-b-2 border-slate-200 pb-8 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold uppercase tracking-tighter">Mandala Arena</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Laporan Operasional & Keuangan</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-slate-500">Tanggal: {new Date().toLocaleDateString('id-ID')}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-10">
                    <div className="p-6 border rounded-2xl">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Total Pendapatan</p>
                        <p className="text-2xl font-bold italic">Rp {parseInt(revenue_total).toLocaleString('id-ID')}</p>
                    </div>
                    <div className="p-6 border rounded-2xl">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Total Transaksi</p>
                        <p className="text-2xl font-bold italic">{bookings_count} Sesi</p>
                    </div>
                </div>

                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                            <th className="border py-4 px-6 text-left">Bulan</th>
                            <th className="border py-4 px-6 text-right">Pendapatan</th>
                        </tr>
                    </thead>
                    <tbody>
                        {monthly_data.map((m, i) => (
                            <tr key={i} className="text-xs font-medium">
                                <td className="border py-3 px-6">{m.month}</td>
                                <td className="border py-3 px-6 text-right">Rp {parseInt(m.total).toLocaleString('id-ID')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="mt-20 pt-10 border-t border-dashed text-center">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">© {new Date().getFullYear()} Mandala Arena. Dokumen bersifat Konfidensial.</p>
                </div>
            </div>

            <style>{`
                @media print {
                    @page { margin: 1cm; size: A4 portrait; }
                    .print\\:hidden, nav, header, aside, .chatbot-container, button { display: none !important; }
                    .print\\:block { display: block !important; }
                    body { background: white !important; margin: 0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}

function SummaryCard({ label, value, subLabel, color }) {
    return (
        <div className="rounded-3xl p-8 border shadow-sm transition-all relative overflow-hidden group hover:border-[#38BDF8]/30"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div className="absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-5 pointer-events-none transition-opacity group-hover:opacity-10"
                style={{ backgroundColor: color }} />

            <h4 className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-secondary)' }}>{label}</h4>
            <div className="space-y-1">
                <p className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{value}</p>
                <p className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>{subLabel}</p>
            </div>

            <div className="mt-6 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                <div className="flex-1 h-[1px]" style={{ background: 'var(--border)' }} />
            </div>
        </div>
    );
}

function MetricRow({ label, value }) {
    return (
        <div className="flex justify-between items-center py-2 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{label}</span>
            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{value}</span>
        </div>
    );
}
