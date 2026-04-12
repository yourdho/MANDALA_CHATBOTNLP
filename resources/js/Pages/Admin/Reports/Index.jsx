import AuthenticatedLayout from '@/Components/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';

export default function ReportIndex({
    filters, revenue, averages, transactions, stats, meta, trending,
    daily_trend = [], weekly_trend = [], monthly_trend = [],
    category_breakdown = [], atv_data = {}, occupancy_data = {}, hourly_analysis = []
}) {
    const [queryParams, setQueryParams] = useState({
        range: filters.range || '',
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
        facility_id: filters.facility_id || '',
        category: filters.category || ''
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [chartTab, setChartTab] = useState('daily'); // 'daily' | 'weekly' | 'monthly' | 'hourly'

    // Helper for local date string YYYY-MM-DD
    const getLocalFS = (date = new Date()) => {
        const d = new Date(date);
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    };

    const chartData = useMemo(() => {
        if (chartTab === 'daily') return daily_trend;
        if (chartTab === 'weekly') return weekly_trend;
        if (chartTab === 'monthly') return monthly_trend;
        if (chartTab === 'hourly') return hourly_analysis.map(h => ({ label: h.hour, count: h.count, revenue: 0 }));
        return [];
    }, [chartTab, daily_trend, weekly_trend, monthly_trend, hourly_analysis]);
    const chartMax = Math.max(...chartData.map(d => d.count), 1);
    const revenueMax = Math.max(...chartData.map(d => d.revenue), 1);

    // Sync local state when props change (back button, presets, etc)
    useEffect(() => {
        setQueryParams({
            range: filters.range || '',
            start_date: filters.start_date || '',
            end_date: filters.end_date || '',
            facility_id: filters.facility_id || '',
            category: filters.category || ''
        });
    }, [filters]);

    // Stamp body for print footer timestamp
    useEffect(() => {
        const now = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        document.body.setAttribute('data-print-date', now);
        return () => document.body.removeAttribute('data-print-date');
    }, []);

    const handleFilterChange = (key, value) => {
        let newParams = { ...queryParams, [key]: value };

        // If user manually changes dates, clear the 'range' preset highlight
        if (key === 'start_date' || key === 'end_date') {
            newParams.range = '';

            // Validation: Ensure start date is not after end date
            if (key === 'start_date' && newParams.end_date && value > newParams.end_date) {
                newParams.end_date = value;
            }
            if (key === 'end_date' && newParams.start_date && value < newParams.start_date) {
                newParams.start_date = value;
            }
        }

        setQueryParams(newParams);

        // Clean up parameters (remove empty strings) before sending
        const cleanParams = Object.fromEntries(
            Object.entries(newParams).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
        );

        router.get(route('admin.reports.index'), cleanParams, {
            preserveState: true,
            replace: true,
            preserveScroll: true
        });
    };

    // Helper to trigger date picker if clicks don't penetrate opacity:0 well
    const triggerPicker = (e) => {
        if (e.target.showPicker) {
            try { e.target.showPicker(); } catch (err) { /* ignore fallback */ }
        }
    };

    // Client-side search for transactions
    const filteredTransactions = useMemo(() => {
        if (!searchTerm) return transactions;
        return transactions.filter(t =>
            t.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.facility.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, transactions]);

    const exportToExcel = () => {
        const wb = XLSX.utils.book_new();

        // 1. Data Transaksi
        const transactionRows = [
            ['No. Invoice', 'Tanggal Waktu', 'Nama Pelanggan', 'Fasilitas', 'Durasi', 'Total Bayar (Rp)', 'Metode Pembayaran', 'Status Booking', 'Status Pembayaran'],
            ...filteredTransactions.map(t => [
                `MA-${t.id}`, t.datetime, t.user, t.facility, t.duration, t.total, t.method, t.status, t.payment_status
            ])
        ];
        const wsTransactions = XLSX.utils.aoa_to_sheet(transactionRows);
        XLSX.utils.book_append_sheet(wb, wsTransactions, "Riwayat Transaksi");

        // 2. Ringkasan Eksekutif
        const summaryRows = [
            ['Indikator', 'Nilai'],
            ['Total Pendapatan Kotor (Gross)', revenue.total_gross],
            ['Pendapatan Bersih Estimasi (Net)', revenue.net_income],
            ['Tingkat Pembayaran Berhasil', `${stats.success_rate}%`],
            ['Rata-rata Nilai Transaksi (ATV)', stats.global_atv],
            ['Total Durasi Pemakaian Lapangan', `${stats.total_hours} Jam`],
            ['Rata-rata Okupansi Lapangan', `${Math.round(stats.avg_occupancy)}%`]
        ];
        const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
        XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan Finansial");

        // Name of the file
        const safeStart = queryParams.start_date || 'Semua';
        const safeEnd = queryParams.end_date || 'Data';
        XLSX.writeFile(wb, `Laporan_Keuangan_Mandala_Arena_${safeStart}_SD_${safeEnd}.xlsx`);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Laporan Keuangan - Mandala Arena" />

            <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
                {/* ── HEADER: TACTICAL COMMAND CENTER ── */}
                <header className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-12 border-b-2 border-dashed transition-all"
                    style={{ borderColor: 'var(--border)' }}>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-[#10B981] rounded-full animate-pulse shadow-[0_0_10px_#10B981]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#10B981]">Pusat Laporan Keuangan · Live</span>
                        </div>
                        <h1 className="text-2xl md:text-5xl font-black italic uppercase tracking-tighter" style={{ color: 'var(--text-primary)' }}>
                            Financial <span className="text-[#38BDF8]">Intelligence</span>
                        </h1>
                        <p className="max-w-xl text-xs font-bold uppercase tracking-widest opacity-60 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            Analisis mendalam pendapatan, efisiensi operasional, dan performa setiap kategori lapangan di Mandala Arena secara real-time.
                        </p>
                    </div>

                    <div className="no-print flex flex-col gap-3">

                        {/* Quick preset chips */}
                        <div>
                            <p className="text-[9px] font-black uppercase opacity-40 tracking-widest mb-2">Rentang Waktu</p>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { label: 'Hari Ini', days: 0, key: 'today' },
                                    { label: '7 Hari', days: 7, key: '7days' },
                                    { label: '30 Hari', days: 30, key: '30days' },
                                    { label: 'Bulan Ini', days: -1, key: 'this_month' },
                                    { label: 'Tahun Ini', days: -2, key: 'this_year' },
                                ].map(({ label, days, key }) => {
                                    const isActive = queryParams.range === key;
                                    return (
                                        <button key={label}
                                            onClick={() => {
                                                const now = new Date();
                                                const today = getLocalFS(now);
                                                let start, end = today;
                                                if (days === 0) { start = end; }
                                                else if (days === -1) { start = getLocalFS(new Date(now.getFullYear(), now.getMonth(), 1)); }
                                                else if (days === -2) { start = getLocalFS(new Date(now.getFullYear(), 0, 1)); }
                                                else { const d = new Date(); d.setDate(d.getDate() - days); start = getLocalFS(d); }

                                                const newParams = { ...queryParams, range: key, start_date: start, end_date: end };
                                                setQueryParams(newParams);
                                                router.get(route('admin.reports.index'), newParams, { preserveState: true, replace: true });
                                            }}
                                            className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${isActive
                                                ? 'bg-[#38BDF8] text-slate-900 border-[#38BDF8] shadow-md shadow-[#38BDF8]/30'
                                                : 'border-dashed hover:border-[#38BDF8]/60 hover:text-[#38BDF8]'
                                                }`}
                                            style={{ borderColor: isActive ? undefined : 'var(--border)', color: isActive ? undefined : 'var(--text-secondary)' }}
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Custom date row + facility + print */}
                        <div className="flex items-end gap-3 flex-wrap mt-1">

                            {/* Date range: two premium cards */}
                            <div className="flex items-stretch gap-0 rounded-2xl border overflow-hidden" style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}>

                                {/* FROM card */}
                                <div className="relative flex flex-col px-5 py-3 min-w-[160px] group/from hover:bg-white/5 transition-all cursor-pointer border-r" style={{ borderColor: 'var(--border)' }}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg className="w-3 h-3 text-[#38BDF8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-[8px] font-black uppercase tracking-widest opacity-40" style={{ color: 'var(--text-secondary)' }}>Dari Tanggal</span>
                                    </div>
                                    {/* Formatted display */}
                                    <span className="text-base font-black italic leading-none" style={{ color: 'var(--text-primary)' }}>
                                        {queryParams.start_date
                                            ? new Date(queryParams.start_date + 'T00:00:00').toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                                            : '— Pilih —'}
                                    </span>
                                    <span className="text-[8px] font-bold opacity-30 mt-0.5 uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                                        {queryParams.start_date
                                            ? new Date(queryParams.start_date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long' })
                                            : 'Tanggal mulai'}
                                    </span>
                                    {/* Invisible native input overlay */}
                                    <input type="date" value={queryParams.start_date}
                                        onChange={(e) => handleFilterChange('start_date', e.target.value)}
                                        onClick={triggerPicker}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                        style={{ colorScheme: 'dark' }} />
                                </div>

                                {/* Arrow divider */}
                                <div className="flex items-center px-3 opacity-20">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>

                                {/* TO card */}
                                <div className="relative flex flex-col px-5 py-3 min-w-[160px] group/to hover:bg-white/5 transition-all cursor-pointer border-l" style={{ borderColor: 'var(--border)' }}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg className="w-3 h-3 text-[#38BDF8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-[8px] font-black uppercase tracking-widest opacity-40" style={{ color: 'var(--text-secondary)' }}>Sampai Tanggal</span>
                                    </div>
                                    {/* Formatted display */}
                                    <span className="text-base font-black italic leading-none" style={{ color: 'var(--text-primary)' }}>
                                        {queryParams.end_date
                                            ? new Date(queryParams.end_date + 'T00:00:00').toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                                            : '— Pilih —'}
                                    </span>
                                    <span className="text-[8px] font-bold opacity-30 mt-0.5 uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                                        {queryParams.end_date
                                            ? new Date(queryParams.end_date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long' })
                                            : 'Tanggal akhir'}
                                    </span>
                                    {/* Invisible native input overlay */}
                                    <input type="date" value={queryParams.end_date}
                                        onChange={(e) => handleFilterChange('end_date', e.target.value)}
                                        onClick={triggerPicker}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                        style={{ colorScheme: 'dark' }} />
                                </div>

                                {/* Day count badge */}
                                {queryParams.start_date && queryParams.end_date && (
                                    <div className="flex items-center px-4 border-l" style={{ borderColor: 'var(--border)' }}>
                                        <div className="flex flex-col items-center">
                                            <span className="text-xl font-black italic text-[#38BDF8] leading-none">
                                                {Math.max(1, Math.ceil((new Date(queryParams.end_date) - new Date(queryParams.start_date)) / (1000 * 60 * 60 * 24)) + 1)}
                                            </span>
                                            <span className="text-[7px] font-black uppercase opacity-40 tracking-widest">Hari</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Facility select */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[8px] font-black uppercase opacity-30 tracking-widest ml-1">Filter Lapangan</label>
                                <select
                                    value={queryParams.facility_id}
                                    onChange={(e) => handleFilterChange('facility_id', e.target.value)}
                                    className="border rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none focus:border-[#38BDF8] transition-all min-w-[150px]"
                                    style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
                                >
                                    <option value="">Semua Fasilitas</option>
                                    {meta.facilities.map(f => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Actions Group */}
                            <div className="flex flex-col gap-1.5 md:flex-1">
                                <label className="text-[8px] font-black uppercase opacity-30 tracking-widest ml-1 hidden lg:block">Aksi & Report</label>
                                <div className="flex items-center gap-2">
                                    <button onClick={exportToExcel}
                                        className="flex-1 flex justify-center items-center gap-2 px-4 py-3 bg-emerald-500 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 hover:text-slate-900 transition-all shadow-lg shadow-emerald-500/20 group whitespace-nowrap">
                                        <svg className="w-4 h-4 group-hover:-translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Excel
                                    </button>
                                    <button onClick={() => window.print()}
                                        className="flex-1 flex justify-center items-center gap-2 px-4 py-3 bg-[#38BDF8] text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-lg shadow-[#38BDF8]/20 group whitespace-nowrap">
                                        <svg className="w-4 h-4 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                        </svg>
                                        PDF
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* ── KPI CARDS ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <SummaryCard label="Total Revenue (Kotor)" value={`RP ${Math.round(revenue.total_gross || 0).toLocaleString('id-ID')}`} trend={`${(revenue.comparison?.growth || 0).toFixed(1)}% `} isPositive={(revenue.comparison?.growth || 0) >= 0} color="#38BDF8" description="Total uang masuk dari semua booking lunas." />
                    <SummaryCard label="Rerata Nilai Transaksi" value={`RP ${Math.round(stats.global_atv || 0).toLocaleString('id-ID')} `} subLabel={`${stats.paid_count || 0} Invoice Lunas`} color="#FACC15" description="Rata-rata nominal per satu kali pemesanan (ATV)." />
                    <SummaryCard label="Rasio Pembayaran" value={`${stats.success_rate || 0}% `} subLabel="Checkout vs Payment Ratio" color="#10B981" description="Persentase pesanan yang berhasil dibayar (settlement)." />
                    <SummaryCard label="Okupansi Lapangan" value={`${Math.round(stats.avg_occupancy || 0)}% `} subLabel="Durasi Sewa vs Kapasitas" color="#A855F7" description="Tingkat pemakaian lapangan dibandingkan jam operasional." />
                </div>

                {/* ── LEADERBOARD SECTION ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Top Pelanggan */}
                    <div className="rounded-[3.5rem] p-10 border shadow-2xl relative overflow-hidden"
                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FACC15]/5 rounded-full blur-[60px]" />
                        <div>
                            <h3 className="text-xl font-black italic uppercase tracking-tighter mb-1" style={{ color: 'var(--text-primary)' }}>Pelanggan Loyal</h3>
                            <p className="text-[8px] font-bold opacity-30 uppercase tracking-[0.2em] mb-8">Pemain dengan frekuensi booking terbanyak</p>
                        </div>
                        <div className="space-y-6">
                            {trending.top_players.map((p, i) => (
                                <div key={i} className="flex justify-between items-center group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-[10px] font-black text-emerald-400 italic border border-emerald-500/20">#{i + 1}</div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black italic uppercase leading-none mb-1" style={{ color: 'var(--text-primary)' }}>{p.name}</span>
                                            <span className="text-[8px] font-bold opacity-30 uppercase tracking-[0.2em]">Loyal Member</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-black text-[#38BDF8]">{p.count} Sesi</span>
                                        <p className="text-[8px] font-bold opacity-40 uppercase tracking-widest mt-0.5">RP {Math.round(p.spent || 0).toLocaleString('id-ID')}</p>
                                    </div>
                                </div>
                            ))}
                            {trending.top_players.length === 0 && <p className="text-[10px] font-black uppercase opacity-20 italic">Belum ada data pelanggan.</p>}
                        </div>
                    </div>

                    {/* Statistik per Cabor */}
                    <div className="rounded-[3.5rem] p-10 border shadow-2xl"
                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                        <h3 className="text-xl font-black italic uppercase tracking-tighter mb-1" style={{ color: 'var(--text-primary)' }}>Kategori Olahraga</h3>
                        <p className="text-[8px] font-bold opacity-30 uppercase tracking-[0.2em] mb-8">Dominasi cabor berdasarkan jumlah sesi</p>
                        <div className="space-y-6">
                            {trending.per_category.map((c, i) => (
                                <div key={i} className="p-4 rounded-2xl bg-slate-400/5 border border-dashed transition-all hover:bg-[#38BDF8]/5 group" style={{ borderColor: 'var(--border)' }}>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#38BDF8]">{c.category}</span>
                                        <span className="text-[8px] font-bold px-2 py-0.5 bg-slate-900 text-white rounded uppercase group-hover:bg-[#38BDF8] group-hover:text-slate-900 transition-colors">{c.sessions} Sesi</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                        <p className="text-sm font-black italic uppercase truncate" style={{ color: 'var(--text-primary)' }}>{c.top_user}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Populer per Fasilitas */}
                    <div className="rounded-[3.5rem] p-10 border shadow-2xl"
                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                        <h3 className="text-xl font-black italic uppercase tracking-tighter mb-1" style={{ color: 'var(--text-primary)' }}>Performa Lapangan</h3>
                        <p className="text-[8px] font-bold opacity-30 uppercase tracking-[0.2em] mb-8">Peringkat keterisian lapangan individual</p>
                        <div className="space-y-6">
                            {trending.per_facility.slice(0, 5).map((f, i) => (
                                <div key={i} className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 border flex items-center justify-center text-[#38BDF8] font-black italic text-xs" style={{ borderColor: 'var(--border)' }}>{f.name.charAt(0)}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-[#38BDF8] truncate">{f.name}</p>
                                        <p className="text-xs font-black italic uppercase truncate" style={{ color: 'var(--text-primary)' }}>{f.top_user}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[9px] font-black uppercase opacity-40">{f.sessions} Sesi</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── BOOKING TREND CHART: Per Hari / Minggu / Bulan ── */}
                <div className="rounded-[3.5rem] p-10 border shadow-2xl relative overflow-hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    {/* Header row */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
                        <div>
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter" style={{ color: 'var(--text-primary)' }}>Tren Booking</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mt-1">
                                {chartTab === 'daily' && '30 Hari Terakhir — Jumlah sesi per hari'}
                                {chartTab === 'weekly' && '12 Minggu Terakhir — Jumlah sesi per minggu'}
                                {chartTab === 'monthly' && '12 Bulan Terakhir — Jumlah sesi per bulan'}
                                {chartTab === 'hourly' && 'Analisis Jam Ramai — Preferensi waktu pendaftar (Check-in)'}
                            </p>
                        </div>
                        <div className="no-print flex items-center gap-2 p-1.5 rounded-2xl border flex-shrink-0" style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}>
                            {[['daily', 'Hari'], ['weekly', 'Minggu'], ['monthly', 'Bulan'], ['hourly', 'Jam Ramai']].map(([key, label]) => (
                                <button key={key} onClick={() => setChartTab(key)}
                                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${chartTab === key ? 'bg-[#38BDF8] text-slate-900 shadow-lg' : 'opacity-40 hover:opacity-80'
                                        }`} style={{ color: chartTab === key ? undefined : 'var(--text-primary)' }}>
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Chart area with Y-axis */}
                    {(() => {
                        const totalSesi = chartData.reduce((a, d) => a + d.count, 0);
                        const totalRev = chartData.reduce((a, d) => a + d.revenue, 0);
                        const avgSesi = chartData.length > 0 ? (totalSesi / chartData.length) : 0;
                        const maxCount = Math.max(...chartData.map(d => d.count), 1);
                        const yTicks = [0, Math.round(maxCount * 0.25), Math.round(maxCount * 0.5), Math.round(maxCount * 0.75), maxCount];
                        const step = chartTab === 'daily' ? 5 : 1;
                        const maxIdx = chartData.reduce((best, d, i) => d.count > chartData[best].count ? i : best, 0);

                        return (
                            <>
                                <div className="flex gap-4">
                                    {/* Y-axis labels */}
                                    <div className="flex flex-col justify-between h-64 pb-1 text-right flex-shrink-0 w-8">
                                        {[...yTicks].reverse().map((tick, i) => (
                                            <span key={i} className="text-[9px] font-black opacity-30 leading-none" style={{ color: 'var(--text-secondary)' }}>{tick}</span>
                                        ))}
                                    </div>

                                    {/* Chart + grid */}
                                    <div className="flex-1 relative">
                                        {/* Horizontal gridlines */}
                                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none" style={{ bottom: '0' }}>
                                            {[...yTicks].reverse().map((_, i) => (
                                                <div key={i} className="w-full border-t border-dashed opacity-10" style={{ borderColor: 'var(--border)' }} />
                                            ))}
                                        </div>

                                        {/* Bars */}
                                        <div className="flex items-end gap-[2px] md:gap-1 h-64 relative z-10">
                                            {chartData.map((d, i) => {
                                                const isMax = i === maxIdx;
                                                const heightPct = Math.max(3, (d.count / maxCount) * 100);
                                                return (
                                                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group/bar relative">
                                                        {/* Tooltip */}
                                                        <div className="absolute -top-20 left-1/2 -translate-x-1/2 scale-0 group-hover/bar:scale-100 transition-all origin-bottom bg-slate-900 text-white text-[9px] font-black px-3 py-2 rounded-xl shadow-xl z-30 whitespace-nowrap text-center border border-slate-700">
                                                            <div className="text-[#38BDF8] font-black mb-0.5">{d.label}</div>
                                                            <div className="text-white">{d.count} Sesi</div>
                                                            {chartTab !== 'hourly' && <div className="text-emerald-400 text-[8px]">Rp {parseInt(d.revenue || 0).toLocaleString('id-ID')}</div>}
                                                        </div>
                                                        {/* Bar */}
                                                        <motion.div
                                                            key={chartTab + i}
                                                            initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
                                                            transition={{ delay: i * 0.015, duration: 0.4, ease: 'easeOut' }}
                                                            style={{
                                                                height: `${heightPct}%`, transformOrigin: 'bottom',
                                                                background: isMax ? 'linear-gradient(to top, #38BDF8, #7DD3FC)' : undefined
                                                            }}
                                                            className={`w-full rounded-t-md transition-opacity ${isMax ? 'opacity-100 shadow-lg shadow-[#38BDF8]/30' : 'bg-[#38BDF8] opacity-50 group-hover/bar:opacity-100'
                                                                }`}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* X-axis bottom border */}
                                        <div className="w-full border-t-2 mt-0" style={{ borderColor: 'var(--border)' }} />
                                    </div>
                                </div>

                                {/* X-axis labels — skip intelligently */}
                                <div className="flex items-start gap-[2px] md:gap-1 mt-2 ml-12">
                                    {chartData.map((d, i) => (
                                        <div key={i} className="flex-1 flex justify-center">
                                            {i % step === 0 && (
                                                <span className="text-[8px] font-bold opacity-50 text-center leading-tight" style={{ color: 'var(--text-secondary)' }}>
                                                    {chartTab === 'daily' ? d.label.split('/')[0] : d.label}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Peak annotation */}
                                {chartData.length > 0 && chartData[maxIdx] && (
                                    <div className="mt-4 ml-12 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-[#38BDF8]" />
                                        <span className="text-[9px] font-black uppercase opacity-50 tracking-widest" style={{ color: 'var(--text-primary)' }}>
                                            Puncak: <span className="text-[#38BDF8]">{chartData[maxIdx].label}</span> — {chartData[maxIdx].count} sesi,&nbsp;
                                            Rp {parseInt(chartData[maxIdx].revenue).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                )}

                                {/* Summary cards */}
                                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: 'var(--bg-base)' }}>
                                        <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/10 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5 text-[#38BDF8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase opacity-40 tracking-widest mb-1">Volume Booking</p>
                                            <p className="text-2xl font-black italic leading-none" style={{ color: 'var(--text-primary)' }}>{totalSesi.toLocaleString()}</p>
                                            <p className="text-[8px] opacity-30 uppercase font-bold mt-1">Total sesi lunas dalam periode ini</p>
                                        </div>
                                    </div>
                                    <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: 'var(--bg-base)' }}>
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase opacity-40 tracking-widest mb-1">Akumulasi Pendapatan</p>
                                            <p className="text-xl font-black italic leading-none text-emerald-400">Rp {totalRev.toLocaleString('id-ID')}</p>
                                            <p className="text-[8px] opacity-30 uppercase font-bold mt-1">Total uang masuk dalam periode ini</p>
                                        </div>
                                    </div>
                                    <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: 'var(--bg-base)' }}>
                                        <div className="w-10 h-10 rounded-xl bg-[#FACC15]/10 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5 text-[#FACC15]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase opacity-40 tracking-widest mb-1">Tingkat Pertumbuhan</p>
                                            <p className="text-xl font-black italic leading-none text-[#FACC15]">{revenue.comparison.growth.toFixed(1)}%</p>
                                            <p className="text-[8px] opacity-30 uppercase font-bold mt-1">Dibandingkan periode sebelumnya (MoM/DoD)</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        );
                    })()}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* OCCUPANCY BREAKDOWN */}
                    <div className="rounded-[3.5rem] p-10 border shadow-2xl relative overflow-hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                        <div className="mb-8">
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter" style={{ color: 'var(--text-primary)' }}>Analisis Okupansi Fasilitas</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mt-1">Efisiensi pemakaian lapangan dibandingkan kapasitas jam buka operasional per hari.</p>
                        </div>
                        <div className="space-y-4">
                            {occupancy_data.by_facility?.map((f, i) => (
                                <div key={i} className="rounded-2xl p-4 border border-dashed" style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}>
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-black italic uppercase" style={{ color: 'var(--text-primary)' }}>{f.name}</span>
                                            <span className="text-[8px] font-bold opacity-30 uppercase tracking-[0.2em]">{f.category}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-black italic text-[#38BDF8]">{Math.round(f.occupancy_pct)}%</span>
                                        </div>
                                    </div>
                                    <div className="h-2 w-full bg-slate-900/50 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(f.occupancy_pct, 100)}% ` }} className="h-full bg-[#38BDF8] rounded-full" />
                                    </div>
                                    <div className="flex justify-between mt-2 text-[8px] font-bold opacity-40 uppercase tracking-widest">
                                        <span>Terpakai: {f.booked_hours} Jam</span>
                                        <span>Kapasitas: {f.potential_hours} Jam</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ATV BY CATEGORY */}
                    <div className="rounded-[3.5rem] p-10 border shadow-2xl relative overflow-hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                        <div className="mb-8">
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter" style={{ color: 'var(--text-primary)' }}>Nilai Rata-rata Transaksi (ATV)</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mt-1">Rata-rata nominal belanja (Average Transaction Value) per kategori cabor.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(atv_data.by_category || {}).map(([cat, val], i) => (
                                <div key={i} className="rounded-2xl p-6 bg-slate-900 border border-white/5 relative overflow-hidden group hover:border-[#38BDF8]/50 transition-all">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-[#38BDF8]/10 blur-3xl group-hover:bg-[#38BDF8]/20 transition-all" />
                                    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-[#38BDF8] mb-1">{cat}</p>
                                    <p className="text-xl font-black italic text-white mb-2">RP {Math.round(val.avg).toLocaleString('id-ID')}</p>
                                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Dari {val.count} Sesi pembayaran</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── CATEGORY REVENUE BREAKDOWN ── */}
                <div className="rounded-[3.5rem] p-10 border shadow-2xl" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter" style={{ color: 'var(--text-primary)' }}>Revenue per Cabang Olahraga</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mt-1">Perbandingan pendapatan dan jumlah sesi tiap cabor</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-black uppercase opacity-40 tracking-widest">Total Revenue</p>
                            <p className="text-xl font-black italic text-[#38BDF8]">Rp {category_breakdown.reduce((a, c) => a + c.revenue, 0).toLocaleString('id-ID')}</p>
                        </div>
                    </div>
                    <div className="space-y-5">
                        {category_breakdown.map((c, i) => {
                            const totalRev = category_breakdown.reduce((a, x) => a + x.revenue, 0) || 1;
                            const pct = Math.round((c.revenue / totalRev) * 100);
                            const colors = ['#38BDF8', '#FACC15', '#10B981', '#A855F7', '#F97316'];
                            const color = colors[i % colors.length];
                            return (
                                <div key={i} className="rounded-2xl p-5 border" style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}>
                                    {/* Row 1: name + revenue */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                                            <span className="text-sm font-black italic uppercase" style={{ color: 'var(--text-primary)' }}>{c.category}</span>
                                        </div>
                                        <span className="text-lg font-black italic" style={{ color: 'var(--text-primary)' }}>
                                            Rp {parseInt(c.revenue).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    {/* Progress bar */}
                                    <div className="h-3 rounded-full overflow-hidden mb-3" style={{ background: 'var(--bg-card)' }}>
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}% ` }} transition={{ delay: i * 0.1, duration: 0.6, ease: 'easeOut' }}
                                            className="h-full rounded-full" style={{ backgroundColor: color }} />
                                    </div>
                                    {/* Row 3: stats chips */}
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}>
                                            {c.count} Sesi
                                        </span>
                                        <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}>
                                            {pct}% dari total
                                        </span>
                                        <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}>
                                            Avg Rp {c.count > 0 ? Math.round(c.revenue / c.count).toLocaleString('id-ID') : 0}/sesi
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                        {category_breakdown.length === 0 && <p className="text-[10px] font-black uppercase opacity-20 italic text-center py-10">Tidak ada data pada periode ini.</p>}
                    </div>
                </div>

                {/* ── MONTHLY CHART + ANALISIS ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Monthly Revenue Bar Chart */}
                    <div className="lg:col-span-2 rounded-[3.5rem] p-10 border shadow-2xl relative overflow-hidden group/chart"
                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                        <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-[#38BDF8]/5 rounded-full blur-[140px] -mr-80 -mt-80" />
                        <div className="flex items-start justify-between mb-10 relative z-10">
                            <div>
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter" style={{ color: 'var(--text-primary)' }}>Tren Pendapatan Bulanan</h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mt-1">12 bulan terakhir — hover bar untuk detail</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-black uppercase opacity-40 tracking-widest">Total (12 Bulan)</p>
                                <p className="text-lg font-black italic text-[#38BDF8]">Rp {Object.values(revenue.monthly).reduce((a, v) => a + v, 0).toLocaleString('id-ID')}</p>
                            </div>
                        </div>
                        <div className="flex items-end gap-2 h-64 border-b-2 pb-4 relative z-10" style={{ borderColor: 'var(--border)' }}>
                            {Object.entries(revenue.monthly).slice(-12).map(([key, val], i) => {
                                const maxVal = Math.max(...Object.values(revenue.monthly).slice(-12)) || 1;
                                const heightPct = Math.max(6, (val / maxVal) * 100);
                                return (
                                    <div key={key} className="flex-1 flex flex-col items-center h-full justify-end group/bar">
                                        <div className="relative w-full flex flex-col items-center justify-end h-full">
                                            {/* Tooltip */}
                                            <div className="absolute -top-16 left-1/2 -translate-x-1/2 scale-0 group-hover/bar:scale-100 transition-all bg-slate-900 text-white text-[10px] font-black px-3 py-2 rounded-xl shadow-xl z-20 whitespace-nowrap text-center">
                                                <div className="text-[#38BDF8]">{key}</div>
                                                <div>Rp {parseInt(val).toLocaleString('id-ID')}</div>
                                            </div>
                                            <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: i * 0.05, ease: 'easeOut' }}
                                                className="w-full rounded-t-xl bg-[#38BDF8] opacity-50 group-hover/bar:opacity-100 group-hover/bar:shadow-glow-blue transition-all"
                                                style={{ height: `${heightPct}% `, transformOrigin: 'bottom' }} />
                                        </div>
                                        <span className="text-[8px] font-black uppercase tracking-widest opacity-40 mt-2 transform -rotate-45 origin-left">{key}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Analisis Pendapatan */}
                    <div className="rounded-[3.5rem] p-10 border shadow-2xl flex flex-col gap-6" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter" style={{ color: 'var(--text-primary)' }}>Analisis Pendapatan Lapangan</h3>

                        <div className="rounded-2xl p-6 flex flex-col gap-3" style={{ background: '#0f172a' }}>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#FACC15]" >Prime Time (High Demand)</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">16:00 – 22:00</span>
                            </div>
                            <p className="text-2xl font-black italic text-white">Rp {parseInt(averages.peak_avg).toLocaleString('id-ID')}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Rerata pendapatan per sesi pada jam sibuk</p>
                        </div>

                        {/* Off-peak hours */}
                        <div className="rounded-2xl p-6 flex flex-col gap-3 bg-[#38BDF8]">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Regular Hours (Standard)</span>
                                <span className="text-[10px] font-bold text-slate-700 uppercase">06:00 – 16:00</span>
                            </div>
                            <p className="text-2xl font-black italic text-slate-900">Rp {parseInt(averages.non_peak_avg).toLocaleString('id-ID')}</p>
                            <p className="text-[10px] text-slate-700 font-bold uppercase tracking-widest">Rerata pendapatan per sesi pada jam biasa</p>
                        </div>

                        {/* Difference insight */}
                        {averages.peak_avg > 0 && averages.non_peak_avg > 0 && (
                            <div className="rounded-2xl p-5 border" style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}>
                                <p className="text-[10px] font-black uppercase opacity-40 tracking-widest mb-1">Selisih Peak vs Off-Peak</p>
                                <p className="text-lg font-black italic" style={{ color: 'var(--text-primary)' }}>
                                    +Rp {Math.abs(parseInt(averages.peak_avg) - parseInt(averages.non_peak_avg)).toLocaleString('id-ID')}
                                </p>
                                <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest mt-1">
                                    Peak {Math.round(((averages.peak_avg - averages.non_peak_avg) / averages.non_peak_avg) * 100)}% lebih tinggi
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── TRANSACTION LEDGER ── */}
                <div className="rounded-[4rem] border overflow-hidden shadow-2xl bg-white dark:bg-slate-950 transition-all" style={{ borderColor: 'var(--border)' }}>
                    <div className="p-12 border-b flex flex-col md:flex-row md:items-center justify-between gap-8" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
                        <div><h3 className="text-3xl font-black italic uppercase tracking-tighter" style={{ color: 'var(--text-primary)' }}>Riwayat Transaksi Terperinci</h3><p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.4em] mt-1">Real-time mission data stream.</p></div>
                        <input type="text" placeholder="FILTER BY ID / MEMBER / ASSET..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 pr-6 py-4 bg-slate-100 dark:bg-slate-900 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 ring-[#38BDF8]/30 min-w-[320px] transition-all" style={{ color: 'var(--text-primary)' }} />
                    </div>
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                                <tr>
                                    <th className="px-12 py-8">No. Invoice / ID</th>
                                    <th className="px-12 py-8">Nama Pelanggan</th>
                                    <th className="px-12 py-8">Lapangan / Cabor</th>
                                    <th className="px-12 py-8 text-right">Total Bayar</th>
                                    <th className="px-12 py-8 text-center">Status Bayar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                                {filteredTransactions.length > 0 ? filteredTransactions.slice(0, 15).map((t, idx) => (
                                    <motion.tr key={t.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }} className="hover:bg-[#38BDF8]/5 transition-colors group">
                                        <td className="px-12 py-6"><span className="text-xs font-black italic text-[#38BDF8]">#{t.code}</span></td>
                                        <td className="px-12 py-6">
                                            <div className="flex flex-col"><span className="text-sm font-black italic uppercase" style={{ color: 'var(--text-primary)' }}>{t.user}</span><span className="text-[9px] font-bold opacity-40 uppercase tracking-widest">{t.method} Protocol</span></div>
                                        </td>
                                        <td className="px-12 py-6">
                                            <div className="flex flex-col"><span className="text-[11px] font-black italic uppercase" style={{ color: 'var(--text-primary)' }}>{t.facility}</span><span className="text-[9px] font-bold opacity-40 uppercase tracking-widest mt-1">{t.datetime}</span></div>
                                        </td>
                                        <td className="px-12 py-6 text-right"><span className="text-lg font-black italic text-[#10B981]">RP {t.total.toLocaleString('id-ID')}</span></td>
                                        <td className="px-12 py-6 text-center"><StatusBadge status={t.status} paid={t.payment_status === 'paid'} /></td>
                                    </motion.tr>
                                )) : <tr><td colSpan="5" className="px-12 py-24 text-center text-[10px] font-black uppercase tracking-[0.5em] opacity-20 italic">No matching telemetry.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div >

            <style>{`
        /* ── SCREEN: utilities ── */
        .shadow-glow-blue { box-shadow: 0 0 20px rgba(56, 189, 248, 0.4); }
        .no-scrollbar::-webkit-scrollbar { display: none; }

        /* ══════════════════════════════════════
           PRINT / PDF EXPORT
        ══════════════════════════════════════ */
        @media print {
            /* Page setup */
            @page {
                size: A4 landscape;
                margin: 1.2cm 1.4cm;
            }

            /* ── Reset theme variables to white/black ── */
            :root {
                --bg-base: #ffffff !important;
                --bg-card: #f8f9fa !important;
                --text-primary: #111111 !important;
                --text-secondary: #555555 !important;
                --border: #dddddd !important;
            }

            /* ── Global clean-up ── */
            html, body {
                background: #ffffff !important;
                color: #111111 !important;
                font-size: 10pt;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }

            /* ── Hide non-printable chrome ── */
            nav, aside, header, 
            .no-print, 
            [class*="chatbot"], 
            button, 
            select, 
            input[type="date"], 
            input[type="text"] {
                display: none !important;
            }

            /* ── Main layout: remove sidebar padding ── */
            main { padding: 0 !important; margin: 0 !important; }
            .max-w-7xl { max-width: 100% !important; padding: 0 !important; margin: 0 !important; }

            /* ── Report header: compact one-liner ── */
            header {
                border-bottom: 2px solid #38BDF8 !important;
                padding-bottom: 0.6cm !important;
                margin-bottom: 0.5cm !important;
                flex-direction: row !important;
                align-items: flex-end !important;
                display: flex !important;
            }
            header h1 { font-size: 22pt !important; color: #000 !important; }
            header p  { font-size: 8pt !important; color: #555 !important; }

            /* ── KPI summary cards: 4 columns ── */
            .grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4 {
                display: grid !important;
                grid-template-columns: repeat(4, 1fr) !important;
                gap: 0.4cm !important;
                page-break-inside: avoid;
            }

            /* ── Leaderboard / trend section: 2 columns each ── */
            .grid-cols-1.lg\\:grid-cols-3 {
                display: grid !important;
                grid-template-columns: repeat(3, 1fr) !important;
                gap: 0.4cm !important;
            }
            .grid-cols-1.lg\\:grid-cols-3 > div:first-child {
                grid-column: span 1 !important;
            }

            /* ── Cards: clean boxes ── */
            [class*="rounded-"] {
                border-radius: 20px !important;
                border: 1px solid #ddd !important;
                background: #fff !important;
                box-shadow: none !important;
                page-break-inside: avoid;
                padding: 15px !important;
            }

            /* ── Bar chart tooltips: hide on print ── */
            .group\\/bar .absolute { display: none !important; }

            /* ── Bar chart bars: visible ── */
            [style*="transformOrigin: bottom"], [style*="transform-origin: bottom"] {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            /* ── Transaction table ── */
            table { width: 100% !important; border-collapse: collapse !important; font-size: 8pt !important; }
            thead { background: #f1f5f9 !important; color: #0f172a !important; }
            thead th { padding: 6px 10px !important; font-size: 7.5pt !important; color: #000 !important; }
            tbody td { padding: 5px 10px !important; border-bottom: 1px solid #eee !important; color: #111 !important; }
            tbody tr:nth-child(even) { background: #fafafa !important; }

            /* ── Status badges: text-only ── */
            [class*="bg-emerald"]  { background: #d1fae5 !important; color: #065f46 !important; border: 1px solid #6ee7b7 !important; }
            [class*="bg-rose"]     { background: #fee2e2 !important; color: #991b1b !important; border: 1px solid #fca5a5 !important; }
            [class*="bg-amber"]    { background: #fef3c7 !important; color: #78350f !important; border: 1px solid #fcd34d !important; }

            /* ── Page breaks ── */
            .space-y-12 > * + * { margin-top: 0.4cm !important; }

            /* Force section headers to start new column if needed */
            h3 { font-size: 11pt !important; margin-bottom: 0.25cm !important; color: #000 !important; }
            h4 { font-size: 8pt !important; }

            /* ── Revenue progress bars ── */
            [class*="h-2"] {
                height: 6px !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            /* ── Print footer ── */
            body::after {
                display: block;
                position: fixed;
                bottom: 0.3cm;
                right: 1.4cm;
                font-size: 7pt;
                color: #999;
                font-style: italic;
                content: "Mandala Arena — Laporan Keuangan — " attr(data-print-date);
            }
        }
`}</style>
        </AuthenticatedLayout >
    );
}

function SummaryCard({ label, value, subLabel, trend, isPositive, color, description }) {
    return (
        <div className="rounded-[2.5rem] p-6 md:p-8 border shadow-xl relative overflow-hidden group transition-all" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div className="absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-10" style={{ backgroundColor: color }} />
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-40" style={{ color: 'var(--text-secondary)' }}>{label}</h4>
            <div className="relative z-10 space-y-1">
                <p className="text-3xl font-black italic tracking-tighter leading-none" style={{ color: 'var(--text-primary)' }}>{value}</p>
                {trend ? (
                    <div className="flex items-center gap-2 mt-4"><div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>{isPositive ? '↑' : '↓'} {trend}</div><span className="text-[9px] font-bold opacity-30 uppercase tracking-widest italic">vs Periode Lalu</span></div>
                ) : <p className="text-[9px] font-bold opacity-30 uppercase tracking-widest italic mt-4" style={{ color: 'var(--text-secondary)' }}>{subLabel}</p>}

                {description && (
                    <p className="text-[8px] font-bold opacity-0 group-hover:opacity-40 transition-opacity mt-4 uppercase tracking-[0.1em]" style={{ color: 'var(--text-secondary)' }}>
                        {description}
                    </p>
                )}
            </div>
            <div className="absolute bottom-0 left-0 h-1 transition-all duration-700 w-0 group-hover:w-full opacity-30" style={{ backgroundColor: color }} />
        </div>
    );
}

function StatusBadge({ status, paid }) {
    if (status === 'confirmed' || paid) return <div className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /><span className="text-[10px] font-black uppercase tracking-widest italic">Lunas</span></div>;
    if (status === 'cancelled') return <div className="inline-flex items-center gap-2 px-5 py-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-full"><span className="text-[10px] font-black uppercase tracking-widest italic">Batal</span></div>;
    return <div className="inline-flex items-center gap-2 px-5 py-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full"><span className="text-[10px] font-black uppercase tracking-widest italic">Menunggu</span></div>;
}
