import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const PAYMENT_LABEL = {
    transfer_bank: { label: 'Transfer Bank', icon: '🏦' },
    qris: { label: 'QRIS', icon: '📱' },
    bayar_ditempat: { label: 'Bayar di Tempat', icon: '💵' },
};

export default function BookingsIndex({ bookings, stats }) {
    const [nota, setNota] = useState(null); // booking yang sedang dilihat notanya

    const statusColors = {
        confirmed: { bg: 'bg-[#F2D800]/10', text: 'text-[#F2D800]', label: 'Dikonfirmasi' },
        pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', label: 'Menunggu' },
        completed: { bg: 'bg-slate-500/10', text: 'text-slate-400', label: 'Selesai' },
        cancelled: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Dibatalkan' },
    };

    const handleCancel = (id) => {
        if (confirm('Yakin ingin membatalkan booking ini?')) {
            router.patch(route('bookings.cancel', id));
        }
    };

    const handlePrint = () => window.print();

    return (
        <AuthenticatedLayout
            header={<h2 className="font-bold text-xl text-slate-100 leading-tight">Riwayat Booking</h2>}
        >
            <Head title="Bookings" />

            <div className="py-8 sm:py-12 px-4 sm:px-0">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
                        {[
                            { title: 'Total', value: stats.total, color: '#F2D800' },
                            { title: 'Aktif', value: stats.active, color: '#F2D800' },
                            { title: 'Menunggu', value: stats.pending, color: '#f59e0b' },
                        ].map((s, i) => (
                            <motion.div key={s.title}
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-[#231F1F] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-700 shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-3xl opacity-20 pointer-events-none"
                                    style={{ backgroundColor: s.color }} />
                                <h3 className="text-xs font-medium text-slate-400">{s.title}</h3>
                                <p className="mt-1 text-2xl sm:text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Booking List */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="bg-[#231F1F] rounded-2xl border border-slate-700/50 backdrop-blur-sm overflow-hidden">
                        <div className="p-4 sm:p-6 border-b border-slate-700/50">
                            <h3 className="text-base sm:text-lg font-bold text-white">Daftar Booking</h3>
                        </div>

                        {bookings.length === 0 ? (
                            <div className="p-8 sm:p-12 text-center">
                                <p className="text-slate-500 text-sm">Belum ada booking. Yuk mulai booking venue!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-700/50">
                                {bookings.map((booking, index) => (
                                    <motion.div key={booking.id}
                                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 + index * 0.05 }}
                                        className="p-4 sm:p-6 hover:bg-slate-700/20 transition-colors">
                                        <div className="flex flex-col gap-3">
                                            {/* Top */}
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-white font-semibold text-sm sm:text-base leading-snug">{booking.venue}</h4>
                                                    {booking.booking_code && (
                                                        <p className="text-[11px] text-slate-600 font-mono mt-0.5">{booking.booking_code}</p>
                                                    )}
                                                </div>
                                                <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[booking.status]?.bg} ${statusColors[booking.status]?.text}`}>
                                                    {statusColors[booking.status]?.label}
                                                </span>
                                            </div>

                                            {/* Meta */}
                                            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-400">
                                                <span>📅 {booking.date}</span>
                                                <span>🕐 {booking.time}</span>
                                                {booking.payment_method && (
                                                    <span>{PAYMENT_LABEL[booking.payment_method]?.icon} {PAYMENT_LABEL[booking.payment_method]?.label}</span>
                                                )}
                                                {booking.points_earned > 0 && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-[#F2D800]/10 text-[#F2D800] px-2 py-0.5 text-[11px] font-semibold">
                                                        ⭐ +{booking.points_earned} poin
                                                    </span>
                                                )}
                                            </div>

                                            {/* Bottom */}
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-white font-semibold text-sm sm:text-base">{booking.price}</span>
                                                <div className="flex items-center gap-2">
                                                    {/* Nota button — hanya kalau sudah confirmed */}
                                                    {booking.status === 'confirmed' && (
                                                        <button
                                                            onClick={() => setNota(booking)}
                                                            className="text-xs bg-[#F2D800]/10 text-[#F2D800] border border-[#F2D800]/30 px-3 py-1.5 rounded-full font-semibold hover:bg-[#F2D800]/20 transition-all flex items-center gap-1.5"
                                                        >
                                                            🧾 Lihat Nota
                                                        </button>
                                                    )}
                                                    {['pending', 'confirmed'].includes(booking.status) && (
                                                        <button
                                                            onClick={() => handleCancel(booking.id)}
                                                            className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors border border-red-500/20 rounded-full px-3 py-1.5 hover:bg-red-500/10"
                                                        >
                                                            Batalkan
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* ── Nota Modal ── */}
            <AnimatePresence>
                {nota && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 print:bg-white print:p-0"
                        onClick={() => setNota(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
                            className="bg-white text-[#1A1818] rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden print:rounded-none print:shadow-none print:max-w-none"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Nota Header */}
                            <div className="bg-[#1A1818] text-white px-6 py-5 flex items-center gap-3">
                                <img src="/images/janjee-logo.svg" alt="Janjee" className="h-10 w-10" />
                                <div>
                                    <p className="text-xl font-black text-[#F2D800]">Janjee</p>
                                    <p className="text-xs text-slate-400">Nota Pembayaran</p>
                                </div>
                                <button onClick={() => setNota(null)} className="ml-auto text-slate-500 hover:text-white transition-colors text-lg print:hidden">✕</button>
                            </div>

                            {/* Booking Code */}
                            <div className="bg-[#F2D800] px-6 py-3 flex items-center justify-between">
                                <span className="text-[11px] font-bold text-[#1A1818] uppercase tracking-widest">Kode Booking</span>
                                <span className="text-sm font-black text-[#1A1818] font-mono">{nota.booking_code ?? `BKG-${nota.id}`}</span>
                            </div>

                            {/* Nota Body */}
                            <div className="px-6 py-5 space-y-4">
                                {/* Status Badge */}
                                <div className="flex items-center justify-center">
                                    <span className="inline-flex items-center gap-2 rounded-full bg-green-100 text-green-700 font-bold text-sm px-4 py-2">
                                        ✅ BOOKING DIKONFIRMASI
                                    </span>
                                </div>

                                {/* Detail */}
                                <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 overflow-hidden">
                                    <Row label="Venue" value={nota.venue} />
                                    <Row label="Tanggal" value={formatDate(nota.date)} />
                                    <Row label="Jam" value={`${nota.start_time} – ${nota.end_time}`} />
                                    <Row label="Durasi" value={`${durasi(nota.start_time, nota.end_time)} Jam`} />
                                    <Row label="Nama Pemesan" value={nota.user_name} />
                                    <Row label="Metode Bayar" value={`${PAYMENT_LABEL[nota.payment_method]?.icon ?? ''} ${PAYMENT_LABEL[nota.payment_method]?.label ?? nota.payment_method ?? '-'}`} />
                                    <Row label="Dibuat" value={nota.created_at} />
                                </div>

                                {/* Total */}
                                <div className="flex items-center justify-between bg-[#1A1818] text-white rounded-2xl px-4 py-3">
                                    <span className="text-sm font-bold">Total Pembayaran</span>
                                    <span className="text-lg font-black text-[#F2D800]">{nota.price}</span>
                                </div>

                                {/* Info note */}
                                <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                                    Tunjukkan nota ini kepada pegawai / pengelola saat tiba di venue.
                                    Kode booking berfungsi sebagai tanda masuk.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="px-6 pb-6 flex gap-2 print:hidden">
                                <button
                                    onClick={handlePrint}
                                    className="flex-1 rounded-full border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                                >
                                    🖨️ Cetak
                                </button>
                                <button
                                    onClick={() => setNota(null)}
                                    className="flex-1 rounded-full bg-[#1A1818] text-white py-2.5 text-sm font-bold hover:bg-[#2e2a2a] transition-all"
                                >
                                    Tutup
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Print CSS */}
            <style>{`
                @media print {
                    body > * { display: none !important; }
                    .print\\:bg-white { display: flex !important; position: fixed; inset: 0; background: white; }
                    .print\\:hidden { display: none !important; }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}

function Row({ label, value }) {
    return (
        <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-xs text-slate-500">{label}</span>
            <span className="text-xs font-semibold text-slate-800 text-right max-w-[55%]">{value}</span>
        </div>
    );
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function durasi(start, end) {
    if (!start || !end) return 0;
    return parseInt(end) - parseInt(start);
}
