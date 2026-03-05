import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

// ── Label & warna status ─────────────────────────────────────────────────────
const STATUS_CONFIG = {
    confirmed: { bg: 'bg-[#F2D800]/10', text: 'text-[#F2D800]', label: 'Dikonfirmasi' },
    pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', label: 'Menunggu' },
    completed: { bg: 'bg-slate-500/10', text: 'text-slate-400', label: 'Selesai' },
    cancelled: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Dibatalkan' },
};

const PAYMENT_METHOD_LABEL = {
    transfer_bank: 'Transfer Bank',
    qris: 'QRIS',
    bayar_ditempat: 'Bayar di Tempat',
};

const PAYMENT_STATUS_CONFIG = {
    paid: { text: 'text-green-400', label: '✅ Lunas' },
    unpaid: { text: 'text-red-400', label: '❌ Belum Dibayar' },
    pending: { text: 'text-yellow-400', label: '⏳ Menunggu' },
};

// ── Format nomor WA: 08xxx → 628xxx ─────────────────────────────────────────
function toWhatsAppNumber(phone) {
    if (!phone) return null;
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('08')) return '628' + cleaned.slice(2);
    if (cleaned.startsWith('8')) return '62' + cleaned;
    return cleaned;
}

// ── Modal Konfirmasi ─────────────────────────────────────────────────────────
function ConfirmModal({ booking, onClose, onConfirm }) {
    const waNumber = toWhatsAppNumber(booking.user_phone);
    const waMessage = encodeURIComponent(
        `Halo ${booking.user}, kami dari Janjee ingin mengkonfirmasi booking lapangan ${booking.venue} pada ${booking.date} pukul ${booking.time}. Mohon informasi pembayarannya. Terima kasih!`
    );
    const waUrl = waNumber
        ? `https://wa.me/${waNumber}?text=${waMessage}`
        : null;

    const payStatus = PAYMENT_STATUS_CONFIG[booking.payment_status] ?? { text: 'text-slate-400', label: booking.payment_status };
    const payMethod = PAYMENT_METHOD_LABEL[booking.payment_method] ?? booking.payment_method ?? '-';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
            />

            {/* Modal Card */}
            <motion.div
                className="relative z-10 w-full max-w-sm bg-[#1A1717] border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden"
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            >
                {/* Header */}
                <div className="px-5 pt-5 pb-4 border-b border-slate-700/50">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h3 className="text-white font-bold text-base">Tindakan Booking</h3>
                            <p className="text-slate-400 text-xs mt-0.5">
                                {booking.venue} · {booking.date} · {booking.time}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-500 hover:text-white transition-colors mt-0.5 flex-shrink-0"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Info pemesan */}
                    <div className="mt-3 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#F2D800]/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-[#F2D800] text-xs font-bold">
                                {booking.user?.charAt(0)?.toUpperCase() ?? 'G'}
                            </span>
                        </div>
                        <div className="min-w-0">
                            <p className="text-slate-200 text-sm font-medium truncate">{booking.user}</p>
                            <p className="text-slate-500 text-xs">
                                {booking.user_phone ?? 'Nomor tidak tersedia'}
                                {booking.is_guest && (
                                    <span className="ml-1.5 bg-slate-700 text-slate-400 text-[10px] px-1.5 py-0.5 rounded-full">Guest</span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Status Pembayaran */}
                <div className="px-5 py-3 border-b border-slate-700/50 bg-slate-800/30">
                    <p className="text-xs text-slate-500 mb-1">Status Pembayaran</p>
                    <div className="flex items-center justify-between">
                        <div>
                            <span className={`text-sm font-semibold ${payStatus.text}`}>
                                {payStatus.label}
                            </span>
                            <span className="text-slate-500 text-xs ml-2">via {payMethod}</span>
                        </div>
                        <span className="text-white font-bold text-sm">{booking.price}</span>
                    </div>
                </div>

                {/* Pilihan Tindakan */}
                <div className="p-4 flex flex-col gap-2.5">
                    {/* Tombol Chat WA */}
                    {waUrl ? (
                        <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-green-600/10 border border-green-600/30 hover:bg-green-600/20 transition-all group"
                        >
                            <div className="w-9 h-9 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                    <path d="M12.003 2C6.477 2 2 6.477 2 12.003c0 1.935.53 3.745 1.456 5.287L2 22l4.878-1.428A9.958 9.958 0 0012.003 22C17.528 22 22 17.524 22 12.003 22 6.477 17.528 2 12.003 2zm0 18.154a8.148 8.148 0 01-4.232-1.179l-.303-.18-3.14.92.927-3.07-.2-.314A8.152 8.152 0 013.846 12c0-4.504 3.664-8.17 8.157-8.17 4.495 0 8.155 3.666 8.155 8.17 0 4.506-3.66 8.154-8.155 8.154z" />
                                </svg>
                            </div>
                            <div className="flex-1 text-left">
                                <p className="text-green-400 font-semibold text-sm">Chat via WhatsApp</p>
                                <p className="text-slate-500 text-xs">{booking.user_phone}</p>
                            </div>
                            <svg className="w-4 h-4 text-slate-600 group-hover:text-green-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    ) : (
                        <div className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/40 opacity-60 cursor-not-allowed">
                            <div className="w-9 h-9 rounded-lg bg-slate-700/50 flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                    <path d="M12.003 2C6.477 2 2 6.477 2 12.003c0 1.935.53 3.745 1.456 5.287L2 22l4.878-1.428A9.958 9.958 0 0012.003 22C17.528 22 22 17.524 22 12.003 22 6.477 17.528 2 12.003 2zm0 18.154a8.148 8.148 0 01-4.232-1.179l-.303-.18-3.14.92.927-3.07-.2-.314A8.152 8.152 0 013.846 12c0-4.504 3.664-8.17 8.157-8.17 4.495 0 8.155 3.666 8.155 8.17 0 4.506-3.66 8.154-8.155 8.154z" />
                                </svg>
                            </div>
                            <div className="flex-1 text-left">
                                <p className="text-slate-500 font-semibold text-sm">Chat via WhatsApp</p>
                                <p className="text-slate-600 text-xs">Nomor tidak tersedia</p>
                            </div>
                        </div>
                    )}

                    {/* Tombol Konfirmasi Booking */}
                    <button
                        onClick={() => { onConfirm(booking.id); onClose(); }}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-[#F2D800]/10 border border-[#F2D800]/30 hover:bg-[#F2D800]/20 transition-all group"
                    >
                        <div className="w-9 h-9 rounded-lg bg-[#F2D800]/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5 text-[#F2D800]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="flex-1 text-left">
                            <p className="text-[#F2D800] font-semibold text-sm">Konfirmasi Booking</p>
                            <p className="text-slate-500 text-xs">Tandai booking sebagai dikonfirmasi</p>
                        </div>
                        <svg className="w-4 h-4 text-slate-600 group-hover:text-[#F2D800] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Batalkan */}
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-300 text-xs text-center py-1.5 transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// ── Halaman Utama ─────────────────────────────────────────────────────────────
export default function MitraBookingsIndex({ bookings }) {
    const [activeBooking, setActiveBooking] = useState(null); // booking yang dipilih untuk modal

    const handleConfirm = (id) => {
        router.patch(route('bookings.confirm', id));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-bold text-xl text-slate-100 leading-tight">Booking Masuk</h2>}
        >
            <Head title="Booking Masuk" />

            <div className="py-8 sm:py-12 px-4 sm:px-0">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-[#231F1F] rounded-2xl border border-slate-700/50 backdrop-blur-sm overflow-hidden">
                        <div className="p-4 sm:p-6 border-b border-slate-700/50">
                            <h3 className="text-base sm:text-lg font-bold text-white">
                                Daftar Booking{' '}
                                <span className="text-sm font-normal text-slate-400">({bookings.length})</span>
                            </h3>
                        </div>

                        {bookings.length === 0 ? (
                            <div className="p-10 sm:p-16 text-center">
                                <p className="text-slate-500 text-sm">Belum ada booking masuk.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-700/50">
                                {bookings.map((booking, index) => {
                                    const sc = STATUS_CONFIG[booking.status] ?? { bg: 'bg-slate-700/20', text: 'text-slate-400', label: booking.status };

                                    return (
                                        <motion.div key={booking.id}
                                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="p-4 sm:p-6 hover:bg-slate-700/20 transition-colors">
                                            <div className="flex flex-col gap-2">
                                                {/* Baris atas: nama venue + badge status */}
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <h4 className="text-white font-semibold text-sm sm:text-base">{booking.venue}</h4>
                                                        <p className="text-xs text-slate-400 mt-0.5">
                                                            oleh{' '}
                                                            <span className="text-slate-300">{booking.user}</span>
                                                            {booking.is_guest && (
                                                                <span className="ml-1.5 bg-slate-700 text-slate-400 text-[10px] px-1.5 py-0.5 rounded-full">
                                                                    Guest
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                    <span className={`flex-shrink-0 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${sc.bg} ${sc.text}`}>
                                                        {sc.label}
                                                    </span>
                                                </div>

                                                {/* Baris bawah: info waktu + tombol */}
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                                                        <span>📅 {booking.date}</span>
                                                        <span>🕐 {booking.time}</span>
                                                        <span className="font-semibold text-white">{booking.price}</span>
                                                    </div>

                                                    {booking.status === 'pending' && (
                                                        <button
                                                            onClick={() => setActiveBooking(booking)}
                                                            className="flex-shrink-0 flex items-center gap-1.5 text-xs bg-[#F2D800]/10 text-[#F2D800] border border-[#F2D800]/30 px-3 py-1.5 rounded-full font-medium hover:bg-[#F2D800]/20 transition-all"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                                                            </svg>
                                                            Konfirmasi
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Modal Konfirmasi */}
            <AnimatePresence>
                {activeBooking && (
                    <ConfirmModal
                        booking={activeBooking}
                        onClose={() => setActiveBooking(null)}
                        onConfirm={handleConfirm}
                    />
                )}
            </AnimatePresence>
        </AuthenticatedLayout>
    );
}
