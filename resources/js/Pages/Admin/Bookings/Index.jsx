import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const PAYMENT_LABEL = {
    lunas_online: { label: 'Midtrans (Lunas)', icon: '💳' },
    dp_online: { label: 'Midtrans (DP 50%)', icon: '⚡' },
    dp_manual: { label: 'WA Admin (DP/Manual)', icon: '💬' },
    bayar_ditempat: { label: 'Bayar Kasir', icon: '📍' },
};

export default function BookingAdminIndex({ bookings }) {
    const { flash } = usePage().props;
    const [nota, setNota] = useState(null);
    const [processing, setProcessing] = useState(false);

    // Filter states
    const [filter, setFilter] = useState('all');

    // Real-time listener
    useEffect(() => {
        if (window.Echo) {
            window.Echo.channel('bookings')
                .listen('BookingStatusUpdated', (e) => {
                    // Refresh data fully so everything is in sync
                    router.reload({ only: ['bookings'], preserveScroll: true });
                });
        }
        return () => {
            if (window.Echo) window.Echo.leaveChannel('bookings');
        };
    }, []);

    const statusColors = {
        confirmed: { bg: 'bg-[#38BDF8]/20', text: 'text-[#0284c7] border-[#38BDF8]/40', label: 'Terkonfirmasi' },
        pending: { bg: 'bg-[#FACC15]/20', text: 'text-[#d97706] border-[#FACC15]/40', label: 'Menunggu Payment' },
        completed: { bg: 'bg-emerald-100', text: 'text-emerald-700 border-emerald-200', label: 'Selesai' },
        cancelled: { bg: 'bg-red-100', text: 'text-red-600 border-red-200', label: 'Dibatalkan' },
    };

    const handleConfirm = (id) => {
        if (confirm('Konfirmasi pembayaran pesanan ini secara manual? (Hanya jika transfer terverifikasi)')) {
            setProcessing(id);
            router.patch(route('admin.bookings.confirm', id), {}, {
                onFinish: () => setProcessing(false)
            });
        }
    };

    const handlePrint = () => window.print();

    // Derivations
    const activeBookingsCount = bookings.filter(b => b.status === 'confirmed').length;
    const pendingBookingsCount = bookings.filter(b => b.status === 'pending').length;

    const filteredBookings = bookings.filter(b => {
        if (filter === 'all') return true;
        return b.status === filter;
    });

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-4xl font-['Permanent_Marker'] italic text-slate-900 uppercase tracking-tighter leading-none">
                        Daftar <span className="text-[#38BDF8]">Booking</span>
                    </h2>
                    <span className="hidden sm:inline-block px-4 py-2 bg-[#38BDF8]/10 text-[#38BDF8] text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-[#38BDF8]/30">
                        Manajemen Ops Center
                    </span>
                </div>
            }
        >
            <Head title="Admin Daftar Booking | Mandala Arena" />

            <div className="max-w-7xl mx-auto space-y-12 mb-24">

                {flash?.success && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-green-100 border border-green-200 text-green-800 rounded-2xl font-bold mb-6">
                        {flash.success}
                    </motion.div>
                )}

                {/* Tactical Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { title: 'Total Booking Logged', value: bookings.length, color: 'slate' },
                        { title: 'Jadwal Aktif (Confirmed)', value: activeBookingsCount, color: 'primary' },
                        { title: 'Pending Approval', value: pendingBookingsCount, color: 'accent' },
                    ].map((s, i) => (
                        <motion.div key={s.title}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white rounded-[2rem] p-8 border border-slate-100 relative overflow-hidden shadow-sm group">
                            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20 pointer-events-none ${s.color === 'primary' ? 'bg-[#38BDF8]' : s.color === 'accent' ? 'bg-[#FACC15]' : 'bg-slate-300'}`} />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">{s.title}</h3>
                            <p className="text-4xl font-['Permanent_Marker'] text-slate-800">{s.value}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Mission Roster */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/50">
                    <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row items-center justify-between bg-slate-50/50 gap-4">
                        <h3 className="text-xl font-['Permanent_Marker'] italic text-slate-800 uppercase tracking-wider">Antrean Transaksi</h3>

                        <div className="flex gap-2">
                            {['all', 'pending', 'confirmed'].map(f => (
                                <button key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-slate-900 text-white shadow-md' : 'bg-white border-2 border-slate-100 text-slate-500 hover:border-slate-300'}`}>
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead className="bg-[#38BDF8]/5 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] italic border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-6 rounded-tl-xl w-32">Kode Booking</th>
                                    <th className="px-4 py-6 text-[#38BDF8]">Fasilitas</th>
                                    <th className="px-4 py-6">Penyewa</th>
                                    <th className="px-4 py-6">Jadwal & Pembayaran</th>
                                    <th className="px-4 py-6">Total Harga / DP</th>
                                    <th className="px-4 py-6 text-center">Status</th>
                                    <th className="px-8 py-6 text-right rounded-tr-xl">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredBookings.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="p-32 text-center text-slate-400 font-bold uppercase tracking-[0.2em]">Belum Ada Data Booking.</td>
                                    </tr>
                                ) : filteredBookings.map((b, i) => (
                                    <motion.tr
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        key={b.id}
                                        className="hover:bg-slate-50/80 transition-colors group"
                                    >
                                        <td className="px-8 py-6">
                                            <p className="font-['Permanent_Marker'] italic text-slate-400 text-xl tracking-tighter opacity-70 group-hover:opacity-100 transition-opacity group-hover:text-[#38BDF8]">
                                                #MA-{b.id}
                                            </p>
                                        </td>
                                        <td className="px-4 py-6">
                                            <span className="bg-[#38BDF8]/10 text-slate-800 text-[10px] font-black px-4 py-1.5 rounded-xl uppercase tracking-[0.1em] border border-[#38BDF8]/20">
                                                {b.facility?.name}
                                            </span>
                                            {b.is_with_referee > 0 && (
                                                <span className="ml-2 bg-[#FACC15]/10 text-amber-700 text-[9px] font-black px-2 py-1 rounded-full border border-[#FACC15]/30">
                                                    +WASIT
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-6">
                                            <div className="flex flex-col">
                                                <p className="font-black uppercase tracking-tight text-slate-800 text-xs mb-1 group-hover:text-[#38BDF8] transition-colors">{b.user?.name}</p>
                                                <p className="text-[9px] text-slate-400 font-bold">{b.user?.phone || b.user?.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-6">
                                            <div className="flex flex-col">
                                                <p className="text-slate-800 text-xs font-black uppercase leading-none mb-1">
                                                    {new Date(b.starts_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </p>
                                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.1em] mb-1">
                                                    {new Date(b.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {new Date(b.ends_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                <p className="text-[9px] text-emerald-600 font-bold bg-emerald-50 inline-block px-1 rounded">
                                                    {PAYMENT_LABEL[b.payment_method]?.label || 'Metode Otomatis'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-6">
                                            <p className="font-black text-slate-800 text-lg italic tracking-tight mb-1">
                                                Rp {parseInt(b.total_price).toLocaleString()}
                                            </p>
                                            {b.dp_amount > 0 && (
                                                <p className="text-[9px] font-bold text-amber-600">DP: Rp {parseInt(b.dp_amount).toLocaleString()}</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-6 text-center">
                                            <span className={`inline-block px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusColors[b.status]?.bg} ${statusColors[b.status]?.text}`}>
                                                {statusColors[b.status]?.label || b.status}
                                            </span>
                                            {b.payment_status === 'paid' && (
                                                <p className="text-[9px] font-black text-emerald-600 uppercase mt-1">LUNAS/DP MASUK</p>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex flex-wrap items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setNota(b)}
                                                    className="bg-slate-100 text-slate-600 text-[9px] font-black px-4 py-2.5 rounded-xl uppercase tracking-widest hover:bg-slate-200 transition-all shadow-sm">
                                                    📝 Cetak Nota
                                                </button>

                                                {b.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleConfirm(b.id)}
                                                        disabled={processing === b.id}
                                                        className={`text-[9px] font-black px-4 py-2.5 rounded-xl uppercase tracking-widest transition-all shadow-sm ${processing === b.id ? 'bg-emerald-200 text-emerald-800 cursor-wait' : 'bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-105 shadow-emerald-500/30'}`}>
                                                        {processing === b.id ? '✓ OK...' : '✓ ACC Pembayaran'}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>

            {/* ── E-Ticket (Nota) Modal for Admin ── */}
            <AnimatePresence>
                {nota && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[80] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6 print:bg-white print:p-0"
                        onClick={() => setNota(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
                            className="bg-white border border-slate-100 rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden print:rounded-none print:shadow-none print:max-w-none print:border-none"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="bg-slate-50 p-8 md:p-12 border-b border-slate-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-44 h-44 bg-[#38BDF8]/10 rounded-full blur-[80px] -mr-20 -mt-20" />
                                <div className="flex items-center gap-6 relative z-10">
                                    <div className="w-16 h-16 bg-[#38BDF8] rounded-2xl flex items-center justify-center font-black italic text-white text-3xl shadow-lg shadow-[#38BDF8]/30 font-['Permanent_Marker']">M</div>
                                    <div>
                                        <p className="text-3xl font-['Permanent_Marker'] italic text-slate-800 uppercase tracking-tighter leading-none">Mandala Arena</p>
                                        <p className="text-[10px] font-black text-[#38BDF8] tracking-[0.2em] uppercase mt-2">Kwitansi Admin & E-Ticket</p>
                                    </div>
                                    <button onClick={() => setNota(null)} className="ml-auto w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors print:hidden">✕</button>
                                </div>
                            </div>

                            <div className="bg-[#FACC15] px-8 md:px-12 py-3 flex items-center justify-between text-amber-950">
                                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Kode Booking</span>
                                <span className="text-sm font-black font-mono uppercase tracking-widest">MA-{nota.id}</span>
                            </div>

                            <div className="p-8 md:p-12 space-y-8">
                                <div className="flex flex-col items-center gap-4">
                                    <div className={`px-6 py-2 border rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${nota.status === 'confirmed' ? 'bg-green-100 border-green-200 text-green-700' : 'bg-amber-100 border-amber-200 text-amber-700'}`}>
                                        Status: {statusColors[nota.status]?.label || nota.status}
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Data Pelanggan: {nota.user?.name} ({nota.user?.phone || 'Tanpa HP'})</p>
                                </div>

                                <div className="grid grid-cols-1 gap-2 bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
                                    <Row label="Fasilitas" value={nota.facility?.name} highlight />
                                    <Row label="Tanggal" value={new Date(nota.starts_at).toLocaleDateString()} />
                                    <Row label="Jam" value={`${new Date(nota.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(nota.ends_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`} />
                                    <Row label="Skema Pelunasan" value={`${PAYMENT_LABEL[nota.payment_method]?.label ?? nota.payment_method}`} />
                                </div>

                                <div className="flex flex-col md:flex-row items-center justify-between bg-white p-6 rounded-[2rem] border-2 border-slate-100 gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Tagihan</span>
                                        {nota.dp_amount > 0 && <span className="text-[10px] font-bold text-amber-500 uppercase">Menggunakan Skema DP (50%)</span>}
                                    </div>
                                    <span className="text-3xl font-black italic text-slate-900">Rp {Number(nota.total_price).toLocaleString('id-ID')}</span>
                                </div>
                            </div>

                            <div className="p-8 md:p-12 pt-0 flex gap-4 print:hidden">
                                <button
                                    onClick={handlePrint}
                                    className="flex-1 px-6 py-4 bg-slate-100 border border-slate-200 text-slate-600 font-bold rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                                >
                                    Cetak PDF/Printer Printer
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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

function Row({ label, value, highlight = false }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-slate-100 last:border-0 leading-tight md:leading-none gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
            <span className={`text-xs font-black uppercase tracking-widest sm:text-right ${highlight ? 'text-[#38BDF8]' : 'text-slate-800'}`}>{value}</span>
        </div>
    );
}
