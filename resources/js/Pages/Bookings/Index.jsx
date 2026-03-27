import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const PAYMENT_LABEL = {
    midtrans: { label: 'Online Payment', icon: '' },
    bayar_ditempat: { label: 'Bayar di Kasir', icon: '' },
};

export default function BookingsIndex({ bookings }) {
    const [nota, setNota] = useState(null);
    const { flash } = usePage().props;

    const statusColors = {
        confirmed: { bg: 'bg-[#38BDF8]/20', text: 'text-[#0284c7] border-[#38BDF8]/40', label: 'Terkonfirmasi' },
        pending: { bg: 'bg-[#FACC15]/20', text: 'text-[#d97706] border-[#FACC15]/40', label: 'Menunggu Pembayaran' },
        completed: { bg: 'bg-slate-100', text: 'text-slate-500 border-slate-200', label: 'Selesai' },
        cancelled: { bg: 'bg-red-100', text: 'text-red-600 border-red-200', label: 'Dibatalkan' },
    };

    const handleCancel = (id) => {
        if (confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) {
            router.patch(route('bookings.cancel', id));
        }
    };

    const handlePrint = () => window.print();

    const handlePay = (token) => {
        if (!token) return alert('Token pembayaran tidak valid!');
        window.snap.pay(token, {
            onSuccess: function (result) {
                // We can refresh the page to see 'confirmed'
                window.location.reload();
            },
            onPending: function (result) {
                alert('Terkirim, menunggu proses pembayaran.');
            },
            onError: function (result) {
                alert('Pembayaran gagal dilakukan!');
            },
            onClose: function () {
                // user closed popup
            }
        });
    };

    // Auto-trigger Midtrans if flash has snap_token
    useEffect(() => {
        if (flash?.snap_token) {
            handlePay(flash.snap_token);
        }
    }, [flash]);

    // Derived stats from array instead of prop to match controller structure
    const activeBookingsCount = bookings.filter(b => b.status === 'confirmed').length;
    const pendingBookingsCount = bookings.filter(b => b.status === 'pending').length;

    return (
        <AuthenticatedLayout>
            <Head title="Booking Saya | Mandala Arena" />

            <div className="max-w-7xl mx-auto space-y-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-12"
                    style={{ borderColor: 'var(--border)' }}>
                    <div>
                        <p className="text-[10px] font-black text-[#38BDF8] uppercase tracking-[0.3em] mb-4">Tactical Log</p>
                        <h1 className="text-3xl sm:text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none"
                            style={{ color: 'var(--text-primary)' }}>
                            Daftar <span className="text-[#38BDF8]">Booking</span>
                        </h1>
                    </div>
                </div>

                {flash?.success && !flash?.snap_token && (
                    <div className="p-6 bg-emerald-50 border-2 border-emerald-100 text-emerald-800 rounded-[2rem] font-bold mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                        <div className="flex items-center gap-4">
                            <span className="text-3xl"></span>
                            <span className="text-sm">{flash.success}</span>
                        </div>
                        {flash?.wa_link && (
                            <a
                                href={flash.wa_link}
                                target="_blank"
                                rel="noreferrer"
                                className="px-6 py-3 bg-[#25D366] text-white font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-[#128C7E] hover:scale-105 transition-all shadow-md shadow-[#25D366]/30 animate-bounce whitespace-nowrap"
                            >
                                Buka WhatsApp Admin
                            </a>
                        )}
                    </div>
                )}
                {flash?.error && (
                    <div className="p-4 bg-red-100 border border-red-200 text-red-800 rounded-2xl font-bold mb-6">
                        {flash.error}
                    </div>
                )}

                {/* Tactical Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { title: 'Total Booking', value: bookings.length, color: 'slate' },
                        { title: 'Jadwal Aktif', value: activeBookingsCount, color: 'primary' },
                        { title: 'Menunggu Pembayaran', value: pendingBookingsCount, color: 'accent' },
                    ].map((s, i) => (
                        <motion.div key={s.title}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 border relative overflow-hidden shadow-sm group"
                            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20 pointer-events-none ${s.color === 'primary' ? 'bg-[#38BDF8]' : s.color === 'accent' ? 'bg-[#FACC15]' : 'bg-slate-300'}`} />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4"
                                style={{ color: 'var(--text-secondary)' }}>{s.title}</h3>
                            <p className="text-3xl md:text-4xl font-['Permanent_Marker']"
                                style={{ color: 'var(--text-primary)' }}>{s.value}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Mission Roster */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="rounded-[2.5rem] border overflow-hidden shadow-xl"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <div className="p-6 md:p-8 border-b flex items-center justify-between"
                        style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}>
                        <h3 className="text-lg md:text-xl font-black italic uppercase tracking-widest"
                            style={{ color: 'var(--text-primary)' }}>Riwayat Transaksi</h3>
                    </div>

                    {bookings.length === 0 ? (
                        <div className="p-32 text-center">
                            <p className="font-bold uppercase tracking-[0.2em] animate-pulse"
                                style={{ color: 'var(--text-secondary)' }}>Belum Ada Riwayat Booking.</p>
                        </div>
                    ) : (
                        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                            {bookings.map((booking, index) => (
                                <motion.div key={booking.id}
                                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + index * 0.05 }}
                                    className="p-6 md:p-8 hover:opacity-80 transition-all group overflow-hidden relative">
                                    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">

                                        {/* Status & Code */}
                                        <div className="flex-shrink-0 w-full md:w-32 flex flex-col items-center md:items-start">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusColors[booking.status]?.bg} ${statusColors[booking.status]?.text}`}>
                                                {statusColors[booking.status]?.label}
                                            </span>
                                            {booking.id && (
                                                <p className="text-[10px] text-slate-400 font-mono mt-3 uppercase tracking-widest">MA-{booking.id}</p>
                                            )}
                                        </div>

                                        {/* Core Data */}
                                        <div className="flex-1 min-w-0 text-center md:text-left">
                                            <Link href={route('bookings.show', booking.id)} className="block group/title">
                                                <h4 className="text-slate-900 font-black text-2xl uppercase tracking-tighter leading-none mb-3 group-hover/title:text-[#38BDF8] transition-colors"
                                                    style={{ color: 'var(--text-primary)' }}>
                                                    {booking.facility?.name}
                                                </h4>
                                            </Link>
                                            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em]">
                                                <span> {new Date(booking.starts_at).toLocaleDateString()}</span>
                                                <span> {new Date(booking.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.ends_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                {booking.payment_method && (
                                                    <span className="text-amber-600 font-black">
                                                        {PAYMENT_LABEL[booking.payment_method]?.label || booking.payment_method.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                )}
                                                <Link href={route('bookings.show', booking.id)} className="text-[#38BDF8] hover:underline">
                                                    TACTICAL SCAN →
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-wrap items-center justify-center gap-4 w-full md:w-auto mt-4 md:mt-0">
                                            {/* Midtrans Pay Button */}
                                            {booking.status === 'pending' && booking.payment_token && (
                                                <button
                                                    onClick={() => handlePay(booking.payment_token)}
                                                    className="px-6 py-3 bg-[#38BDF8] text-white font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-[#38BDF8]/90 hover:scale-105 transition-all shadow-md shadow-[#38BDF8]/30"
                                                >
                                                    Bayar Sekarang
                                                </button>
                                            )}

                                            {/* Invoice / E-Ticket */}
                                            {booking.status === 'confirmed' && (
                                                <button
                                                    onClick={() => setNota(booking)}
                                                    className="px-6 py-3 bg-slate-900 text-white font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md"
                                                >
                                                    E-Ticket
                                                </button>
                                            )}

                                            {/* Cancel Option */}
                                            {['pending'].includes(booking.status) && (
                                                <button
                                                    onClick={() => handleCancel(booking.id)}
                                                    className="px-4 py-3 text-[10px] text-red-400 hover:text-red-500 font-black uppercase tracking-widest transition-colors"
                                                >
                                                    Batalkan
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* ── E-Ticket (Nota) Modal ── */}
            <AnimatePresence>
                {nota && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[80] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6 print:bg-white print:p-0"
                        onClick={() => setNota(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
                            className="rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden print:rounded-none print:shadow-none print:max-w-none print:border-none"
                            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', border: '1px solid var(--border)' }}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Logo & Header */}
                            <div className="p-8 md:p-12 border-b relative overflow-hidden"
                                style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}>
                                <div className="absolute top-0 right-0 w-44 h-44 bg-[#38BDF8]/10 rounded-full blur-[80px] -mr-20 -mt-20" />
                                <div className="flex items-center gap-6 relative z-10">
                                    <div className="w-16 h-16 bg-[#38BDF8] rounded-2xl flex items-center justify-center font-black italic text-white text-3xl shadow-lg shadow-[#38BDF8]/30">M</div>
                                    <div>
                                        <p className="text-3xl font-black italic uppercase tracking-tighter leading-none"
                                            style={{ color: 'var(--text-primary)' }}>Mandala Arena</p>
                                        <p className="text-[10px] font-black text-[#38BDF8] tracking-[0.2em] uppercase mt-2">Sports Facility E-Ticket</p>
                                    </div>
                                    <button onClick={() => setNota(null)} className="ml-auto w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors print:hidden"></button>
                                </div>
                            </div>

                            <div className="bg-[#FACC15] px-8 md:px-12 py-3 flex items-center justify-between text-amber-950">
                                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Kode Booking</span>
                                <span className="text-sm font-black font-mono uppercase tracking-widest">MA-{nota.id}</span>
                            </div>

                            <div className="p-8 md:p-12 space-y-8">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="px-6 py-2 bg-green-100 border border-green-200 text-green-700 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                                        Terkonfirmasi - Lunas
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Tunjukkan tiket ini kepada staff kami saat di lokasi.</p>
                                </div>

                                <div className="grid grid-cols-1 gap-2 bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
                                    <Row label="Fasilitas" value={nota.facility?.name} highlight />
                                    <Row label="Tanggal" value={new Date(nota.starts_at).toLocaleDateString()} />
                                    <Row label="Jam" value={`${new Date(nota.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(nota.ends_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`} />
                                    <Row label="Metode Pembayaran" value={`${PAYMENT_LABEL[nota.payment_method]?.label ?? 'Online'}`} />
                                </div>

                                <div className="flex flex-col md:flex-row items-center justify-between bg-white p-6 rounded-[2rem] border-2 border-slate-100 gap-4">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Harga (Lunas)</span>
                                    <span className="text-3xl font-black italic text-slate-900">Rp {Number(nota.total_price).toLocaleString('id-ID')}</span>
                                </div>
                            </div>

                            <div className="p-8 md:p-12 pt-0 flex gap-4 print:hidden">
                                <button
                                    onClick={handlePrint}
                                    className="flex-1 px-6 py-4 bg-slate-100 border border-slate-200 text-slate-600 font-bold rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                                >
                                    Print PDF
                                </button>
                                <button
                                    onClick={() => setNota(null)}
                                    className="px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl text-[10px] uppercase tracking-widest shadow-md hover:bg-slate-800 transition-all"
                                >
                                    Tutup
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                @media print {
                    .print\\:hidden, nav, header, aside, .chatbot-container, .max-w-7xl, button { display: none !important; }
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
        <div className="flex items-center justify-between py-3 border-b last:border-0 leading-none"
            style={{ borderColor: 'var(--border)' }}>
            <span className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: 'var(--text-secondary)' }}>{label}</span>
            <span className={`text-xs font-black uppercase tracking-widest text-right ${highlight ? 'text-[#38BDF8]' : ''}`}
                style={{ color: highlight ? '#38BDF8' : 'var(--text-primary)' }}>{value}</span>
        </div>
    );
}

