import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
}

export default function GuestSuccess({ booking }) {
    const bookingCode = `MA-${String(booking.id).padStart(5, '0')}`;
    const venueName = booking.facility?.name ?? 'Mandala Facility';
    const startDate = new Date(booking.starts_at);
    const endDate = new Date(booking.ends_at);

    // Formatting for display
    const startStr = startDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const endStr = endDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const whatsappMsg = encodeURIComponent(
        `Halo Mandala Arena! Saya ingin konfirmasi booking saya.\n` +
        `Kode Booking: ${bookingCode}\n` +
        `Fasilitas: ${venueName}\n` +
        `Tanggal: ${formatDate(booking.starts_at)}\n` +
        `Waktu: ${startStr} – ${endStr}\n` +
        `Total: Rp ${Number(booking.total_price).toLocaleString('id-ID')}`
    );
    // Placeholder default phone for Mandala Arena (replace with real one if needed)
    const whatsappUrl = `https://wa.me/6282123456789?text=${whatsappMsg}`;

    return (
        <>
            <Head title="Booking Berhasil - Mandala Arena" />

            <div className="min-h-screen flex items-center justify-center p-4 font-sans bg-slate-50">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    className="w-full max-w-md"
                >
                    <div className="bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100">
                        {/* Header */}
                        <div className="bg-slate-900 px-6 py-8 text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#38BDF8]/10 rounded-full blur-3xl -mr-10 -mt-10" />
                            <h2 className="text-2xl font-black italic text-[#38BDF8] uppercase tracking-tighter">Mandala Arena</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-1">Konfirmasi Misi Berhasil</p>
                        </div>

                        {/* Booking Code Bar */}
                        <div className="bg-[#38BDF8] px-6 py-4 flex items-center justify-between">
                            <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">KODE BOOKING</span>
                            <span className="text-lg font-black text-slate-900 font-mono tracking-tighter">{bookingCode}</span>
                        </div>

                        {/* Body */}
                        <div className="px-8 py-8 space-y-6">
                            <div className="flex justify-center">
                                <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-6 py-2 rounded-2xl flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="text-[11px] font-black uppercase tracking-wider">Transaksi Terverifikasi</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nama Pemesan</span>
                                    <span className="text-xs font-black text-slate-800 uppercase italic text-right">{booking.guest_name || booking.user?.name || 'Guest'}</span>
                                </div>
                                <div className="flex justify-between items-center py-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fasilitas</span>
                                    <span className="text-xs font-black text-slate-800 uppercase italic text-right">{venueName}</span>
                                </div>
                                <div className="flex justify-between items-center py-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Waktu</span>
                                    <span className="text-xs font-black text-slate-800 uppercase italic text-right">{startStr} - {endStr}</span>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-slate-50 pb-4">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tanggal</span>
                                    <span className="text-xs font-black text-slate-800 uppercase italic text-right">{formatDate(booking.starts_at)}</span>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-3xl p-6 flex flex-col items-center gap-1 border border-slate-100">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Pembayaran</span>
                                <span className="text-3xl font-black text-[#38BDF8] tracking-tighter">Rp {Number(booking.total_price).toLocaleString('id-ID')}</span>
                            </div>

                            {/* CTAs */}
                            <div className="space-y-3 pt-2">
                                <a href={whatsappUrl} target="_blank" rel="noreferrer"
                                    className="w-full bg-[#38BDF8] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-slate-900 transition-all shadow-lg shadow-[#38BDF8]/20 group">
                                    <span className="group-hover:scale-110 transition-transform">Konfirmasi via WA</span>
                                </a>
                                <Link href={route('facilities.public')} className="w-full border border-slate-200 text-slate-400 py-3 rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:border-[#38BDF8] hover:text-[#38BDF8] transition-all">
                                    Kembali ke Beranda
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </>
    );
}
