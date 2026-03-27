import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const PAYMENT_LABEL = {
    lunas_online: { label: 'Midtrans (Lunas)', icon: '' },
    dp_online: { label: 'Midtrans (DP 50%)', icon: '' },
    dp_manual: { label: 'WA Admin (DP/Manual)', icon: '' },
    bayar_ditempat: { label: 'Bayar Kasir', icon: '' },
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
        <AuthenticatedLayout>
            <Head title="Admin Daftar Booking | Mandala Arena" />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-12 mb-12"
                style={{ borderColor: 'var(--border)' }}>
                <div>
                    <p className="text-[10px] font-black text-[#38BDF8] uppercase tracking-[0.3em] mb-4">Tactical Registry</p>
                    <h1 className="text-3xl sm:text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none"
                        style={{ color: 'var(--text-primary)' }}>
                        Daftar <span className="text-[#38BDF8]">Booking</span>
                    </h1>
                </div>
                <div className="flex items-center gap-3 px-5 py-2 rounded-full border"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <div className="w-2 h-2 bg-[#38BDF8] rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest"
                        style={{ color: 'var(--text-secondary)' }}>Manajemen Ops Center</span>
                </div>
            </div>
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
                        { title: 'Total Booking Logged', value: bookings.length, color: '#38BDF8' },
                        { title: 'Jadwal Aktif (Confirmed)', value: activeBookingsCount, color: '#10B981' },
                        { title: 'Pending Approval', value: pendingBookingsCount, color: '#FACC15' },
                    ].map((s, i) => (
                        <motion.div key={s.title}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="rounded-[2rem] p-8 border shadow-sm group relative overflow-hidden"
                            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                            <div className="absolute top-0 right-0 w-24 h-24 blur-3xl opacity-5 pointer-events-none transition-opacity group-hover:opacity-10"
                                style={{ backgroundColor: s.color }} />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4"
                                style={{ color: 'var(--text-secondary)' }}>{s.title}</h3>
                            <p className="text-4xl font-black italic tracking-tighter"
                                style={{ color: 'var(--text-primary)' }}>{s.value}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Mission Roster */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="rounded-[2.5rem] border overflow-hidden shadow-3xl"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <div className="p-4 md:p-8 border-b flex flex-col md:flex-row items-center justify-between gap-4"
                        style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}>
                        <h3 className="text-lg md:text-xl font-black italic uppercase tracking-wider"
                            style={{ color: 'var(--text-primary)' }}>Antrean Transaksi</h3>

                        <div className="flex gap-2">
                            {['all', 'pending', 'confirmed'].map(f => (
                                <button key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-slate-900 text-white shadow-md' : 'bg-white border text-slate-500 hover:border-[#38BDF8]'}`}
                                    style={filter === f ? {} : { background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="text-[10px] font-black uppercase tracking-[0.2em] italic border-b"
                                style={{ background: 'var(--bg-base)', color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>
                                <tr>
                                    <th className="px-8 py-6 rounded-tl-xl w-32">Kode</th>
                                    <th className="px-4 py-6 text-[#38BDF8]">Fasilitas</th>
                                    <th className="px-4 py-6">Penyewa</th>
                                    <th className="px-4 py-6">Jadwal</th>
                                    <th className="px-4 py-6">Harga</th>
                                    <th className="px-4 py-6 text-center">Status</th>
                                    <th className="px-8 py-6 text-right rounded-tr-xl">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
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
                                            <p className="font-black italic text-xl tracking-tighter opacity-30 group-hover:opacity-100 transition-opacity group-hover:text-[#38BDF8]"
                                                style={{ color: 'var(--text-secondary)' }}>
                                                #MA-{b.id}
                                            </p>
                                        </td>
                                        <td className="px-4 py-6">
                                            <span className="text-[10px] font-black px-4 py-1.5 rounded-xl uppercase tracking-[0.1em] border"
                                                style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}>
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
                                                <p className="font-black uppercase tracking-tight text-xs mb-1 group-hover:text-[#38BDF8] transition-colors"
                                                    style={{ color: 'var(--text-primary)' }}>{b.guest_name || b.user?.name}</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[9px] font-bold" style={{ color: 'var(--text-secondary)' }}>{b.guest_phone || b.user?.phone || b.guest_email || b.user?.email}</p>
                                                    {(b.guest_phone || b.user?.phone) && (
                                                        <a
                                                            href={`https://wa.me/${(b.guest_phone || b.user?.phone).replace(/\D/g, '').replace(/^0/, '62')}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                                                            title="Chat WhatsApp"
                                                        >
                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                                                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.766-5.764-5.766zm3.392 8.221c-.142.399-.833.723-1.141.774-.285.051-.613.082-.994-.039-.233-.073-.539-.169-.991-.355-1.924-.788-3.137-2.722-3.235-2.852-.097-.13-.807-1.077-.807-2.062s.521-1.469.707-1.676c.186-.206.408-.258.544-.258.136 0 .272.003.39.01.12.007.281-.045.44.337.162.39.551 1.336.6 1.439.049.103.082.224.013.355-.069.13-.157.283-.313.456-.156.173-.328.385-.168.658.16.272.71 1.171 1.522 1.892.684.608 1.265.798 1.543.917.278.12.441.101.608-.091.168-.192.712-.826.903-1.11.192-.284.383-.24.646-.142.263.099 1.666.784 1.954.929.288.146.48.217.55.337.072.12.072.699-.071 1.098z" />
                                                            </svg>
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-6">
                                            <div className="flex flex-col">
                                                <p className="text-xs font-black uppercase leading-none mb-1" style={{ color: 'var(--text-primary)' }}>
                                                    {new Date(b.starts_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </p>
                                                <p className="text-[9px] font-black uppercase tracking-[0.1em] mb-1" style={{ color: 'var(--text-secondary)' }}>
                                                    {new Date(b.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {new Date(b.ends_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                <p className="text-[9px] text-emerald-600 font-bold bg-emerald-500/10 inline-block px-1 rounded">
                                                    {PAYMENT_LABEL[b.payment_method]?.label || 'Metode Otomatis'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-6">
                                            <p className="font-black text-lg italic tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>
                                                Rp {parseInt(b.total_price).toLocaleString()}
                                            </p>
                                            {b.dp_amount > 0 && (
                                                <p className="text-[9px] font-bold text-amber-600">DP: Rp {parseInt(b.dp_amount).toLocaleString()}</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-6 text-center">
                                            <span className={`inline-block px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusColors[b.status]?.text}`}
                                                style={{ background: 'var(--bg-base)' }}>
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
                                                    className="border text-[9px] font-black px-4 py-2.5 rounded-xl uppercase tracking-widest transition-all shadow-sm"
                                                    style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                                                    Cetak Nota
                                                </button>

                                                {b.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleConfirm(b.id)}
                                                        disabled={processing === b.id}
                                                        className={`text-[9px] font-black px-4 py-2.5 rounded-xl uppercase tracking-widest transition-all shadow-sm ${processing === b.id ? 'bg-emerald-200 text-emerald-800 cursor-wait' : 'bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-105 shadow-emerald-500/30'}`}>
                                                        {processing === b.id ? ' OK...' : ' ACC Pembayaran'}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card List */}
                    <div className="md:hidden divide-y" style={{ borderColor: 'var(--border)' }}>
                        {filteredBookings.length === 0 ? (
                            <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Belum Ada Data.</div>
                        ) : filteredBookings.map((b, i) => (
                            <motion.div key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black italic text-lg shadow-lg">
                                            {b.facility?.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-[#38BDF8] uppercase tracking-[0.2em]">#MA-{b.id}</p>
                                            <h4 className="text-sm font-black italic uppercase leading-tight" style={{ color: 'var(--text-primary)' }}>{b.facility?.name}</h4>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${statusColors[b.status]?.text}`} style={{ background: 'var(--bg-base)' }}>
                                        {statusColors[b.status]?.label}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Penyewa</p>
                                        <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{b.guest_name || b.user?.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-[9px] font-medium" style={{ color: 'var(--text-secondary)' }}>{b.guest_phone || b.user?.phone || 'No Phone'}</p>
                                            {(b.guest_phone || b.user?.phone) && (
                                                <a href={`https://wa.me/${(b.guest_phone || b.user?.phone).replace(/\D/g, '').replace(/^0/, '62')}`} target="_blank" className="p-1 bg-emerald-500 text-white rounded shadow-sm">
                                                    <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.766-5.764-5.766zm3.392 8.221c-.142.399-.833.723-1.141.774-.285.051-.613.082-.994-.039-.233-.073-.539-.169-.991-.355-1.924-.788-3.137-2.722-3.235-2.852-.097-.13-.807-1.077-.807-2.062s.521-1.469.707-1.676c.186-.206.408-.258.544-.258.136 0 .272.003.39.01.12.007.281-.045.44.337.162.39.551 1.336.6 1.439.049.103.082.224.013.355-.069.13-.157.283-.313.456-.156.173-.328.385-.168.658.16.272.71 1.171 1.522 1.892.684.608 1.265.798 1.543.917.278.12.441.101.608-.091.168-.192.712-.826.903-1.11.192-.284.383-.24.646-.142.263.099 1.666.784 1.954.929.288.146.48.217.55.337.072.12.072.699-.071 1.098z" /></svg>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Jadwal</p>
                                        <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{new Date(b.starts_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</p>
                                        <p className="text-[9px] font-medium" style={{ color: 'var(--text-secondary)' }}>{new Date(b.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} WIB</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-500/5 rounded-2xl border border-dashed flex justify-between items-center" style={{ borderColor: 'var(--border)' }}>
                                    <div>
                                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Biaya</p>
                                        <p className="text-sm font-black italic tracking-tighter" style={{ color: 'var(--text-primary)' }}>Rp {parseInt(b.total_price).toLocaleString()}</p>
                                    </div>
                                    {b.payment_status === 'paid' && (
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                            <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                                            <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Paid</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button onClick={() => setNota(b)} className="flex-1 py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest" style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>Cetak Nota</button>
                                    {b.status === 'pending' && (
                                        <button onClick={() => handleConfirm(b.id)} className="flex-1 py-3 rounded-xl bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">ACC Konfirmasi</button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* ── E-Ticket (Nota) Modal for Admin ── */}
            <AnimatePresence>
                {nota && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-md flex items-center justify-center p-6 print:bg-white print:p-0"
                        onClick={() => setNota(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
                            className="rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden border print:rounded-none print:shadow-none print:max-w-none print:border-none"
                            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-8 md:p-12 border-b relative overflow-hidden" style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}>
                                <div className="absolute top-0 right-0 w-44 h-44 bg-[#38BDF8]/10 rounded-full blur-[80px] -mr-20 -mt-20" />
                                <div className="flex items-center gap-6 relative z-10">
                                    <div className="w-16 h-16 bg-[#38BDF8] rounded-2xl flex items-center justify-center font-black italic text-white text-3xl shadow-lg shadow-[#38BDF8]/30">M</div>
                                    <div>
                                        <p className="text-3xl font-black italic uppercase tracking-tighter leading-none" style={{ color: 'var(--text-primary)' }}>Mandala Arena</p>
                                        <p className="text-[10px] font-black text-[#38BDF8] tracking-[0.2em] uppercase mt-2">Kwitansi Admin & E-Ticket</p>
                                    </div>
                                    <button onClick={() => setNota(null)} className="ml-auto w-10 h-10 rounded-xl bg-slate-800/10 flex items-center justify-center text-slate-500 hover:text-white transition-colors print:hidden">×</button>
                                </div>
                            </div>

                            <div className="bg-[#FACC15] px-8 md:px-12 py-3 flex items-center justify-between text-amber-950 font-black">
                                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Kode Booking</span>
                                <span className="text-sm font-black font-mono uppercase tracking-widest">MA-{nota.id}</span>
                            </div>

                            <div className="p-8 md:p-12 space-y-8">
                                <div className="flex flex-col items-center gap-4">
                                    <div className={`px-6 py-2 border rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${nota.status === 'confirmed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                                        Status: {statusColors[nota.status]?.label || nota.status}
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-center" style={{ color: 'var(--text-secondary)' }}>
                                        Data Pelanggan: {nota.user?.name} ({nota.user?.phone || 'Tanpa HP'})
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-2 rounded-[2rem] p-6 border" style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}>
                                    <Row label="Fasilitas" value={nota.facility?.name} highlight />
                                    <Row label="Tanggal" value={new Date(nota.starts_at).toLocaleDateString()} />
                                    <Row label="Jam" value={`${new Date(nota.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(nota.ends_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`} />
                                    <Row label="Skema Pelunasan" value={`${PAYMENT_LABEL[nota.payment_method]?.label ?? nota.payment_method}`} />
                                </div>

                                <div className="flex flex-col md:flex-row items-center justify-between p-6 rounded-[2rem] border-2 gap-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>Total Tagihan</span>
                                        {nota.dp_amount > 0 && <span className="text-[10px] font-bold text-amber-500 uppercase">Menggunakan Skema DP (50%)</span>}
                                    </div>
                                    <span className="text-3xl font-black italic tracking-tighter" style={{ color: 'var(--text-primary)' }}>
                                        Rp {Number(nota.total_price).toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>

                            <div className="p-8 md:p-12 pt-0 flex gap-4 print:hidden">
                                <button
                                    onClick={handlePrint}
                                    className="flex-1 px-6 py-4 bg-slate-900 border border-white/5 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-[#38BDF8] hover:text-slate-900 transition-all shadow-lg"
                                >
                                    Cetak PDF/Printer Nota
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                @media print {
                    .print\\:hidden, nav, header, aside, .chatbot-container, table, button { display: none !important; }
                    .print\\:p-0 { padding: 0 !important; }
                    .print\\:bg-white { background-color: white !important; display: block !important; position: static !important; width: 100% !important; z-index: auto !important; }
                    .print\\:rounded-none { border-radius: 0 !important; }
                    .print\\:shadow-none { box-shadow: none !important; }
                    .print\\:max-w-none { max-width: none !important; }
                    .print\\:border-none { border: none !important; }
                    body { background: white !important; margin: 0 !important; padding: 0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    main { padding: 0 !important; margin: 0 !important; }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}

function Row({ label, value, highlight = false }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b last:border-0 leading-tight md:leading-none gap-2"
            style={{ borderColor: 'var(--border)' }}>
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>{label}</span>
            <span className={`text-xs font-black uppercase tracking-widest sm:text-right ${highlight ? 'text-[#38BDF8]' : ''}`}
                style={highlight ? {} : { color: 'var(--text-primary)' }}>{value}</span>
        </div>
    );
}

