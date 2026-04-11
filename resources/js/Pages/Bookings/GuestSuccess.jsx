import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
}

export default function GuestSuccess({ booking }) {
    const { flash, system_settings = {} } = usePage().props;
    const bookingCode = `MA-${String(booking.id).padStart(5, '0')}`;
    const venueName = booking.facility?.name ?? 'Mandala Facility';
    const startDate = new Date(booking.starts_at);
    const endDate = new Date(booking.ends_at);

    const startStr = startDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const endStr = endDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    // Midtrans Logic is handled via global script in app.blade.php
    useEffect(() => {
        if (flash?.snap_token) {
            window.snap.pay(flash.snap_token, {
                onSuccess: (result) => window.location.reload(),
                onPending: (result) => console.log('Pending:', result),
                onError: (result) => console.error('Error:', result)
            });
        }
    }, [flash]);

    const handleRePay = () => {
        if (booking.payment_token) {
            window.snap.pay(booking.payment_token);
        }
    };

    const whatsappMsg = encodeURIComponent(
        `Halo Mandala Arena! Saya ingin konfirmasi booking GUEST saya.\n` +
        `Kode Booking: ${bookingCode}\n` +
        `Fasilitas: ${venueName}\n` +
        `Tanggal: ${formatDate(booking.starts_at)}\n` +
        `Waktu: ${startStr} – ${endStr}\n` +
        `Total: Rp ${Number(booking.total_price).toLocaleString('id-ID')}`
    );
    const whatsappUrl = `https://wa.me/6287892312759?text=${whatsappMsg}`;

    const isPaid = booking.payment_status === 'paid' || booking.payment_status === 'settlement' || booking.payment_status === 'confirmed';

    return (
        <>
            <Head title="Booking Berhasil - Mandala Arena" />

            <div className="min-h-screen flex items-center justify-center p-4 font-sans bg-slate-50 dark:bg-slate-950 transition-colors">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    className="w-full max-w-md"
                >
                    <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 transition-all">
                        {/* Header */}
                        <div className="bg-slate-900 dark:bg-black px-6 py-10 text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#38BDF8]/10 rounded-full blur-3xl -mr-10 -mt-10" />
                            <h2 className="text-2xl font-black italic text-[#38BDF8] uppercase tracking-tighter">Mandala Arena</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-1">Konfirmasi Misi Guest</p>
                        </div>

                        {/* Booking Code Bar */}
                        <div className="bg-[#38BDF8] px-8 py-5 flex items-center justify-between shadow-inner">
                            <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">KODE BOOKING</span>
                            <span className="text-xl font-black text-slate-900 font-mono tracking-tighter">{bookingCode}</span>
                        </div>

                        {/* Body */}
                        <div className="px-10 py-10 space-y-8">
                            <div className="flex justify-center">
                                {isPaid ? (
                                    <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 px-6 py-2.5 rounded-2xl flex items-center gap-2">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                        <span className="text-[11px] font-black uppercase tracking-widest">Transaksi Lunas </span>
                                    </div>
                                ) : (
                                    <div className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20 px-6 py-2.5 rounded-2xl flex items-center gap-2">
                                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                                        <span className="text-[11px] font-black uppercase tracking-widest">Menunggu Pembayaran</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Nama Pemesan</span>
                                    <span className="text-xs font-black text-slate-800 dark:text-white uppercase italic">{booking.guest_name || 'Guest User'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Area Arena</span>
                                    <span className="text-xs font-black text-slate-800 dark:text-white uppercase italic">{venueName}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-y border-slate-50 dark:border-slate-800/50">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Waktu Sesi</span>
                                    <span className="text-xs font-black text-slate-800 dark:text-white uppercase italic">{startStr} - {endStr}</span>
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-8 flex flex-col items-center gap-1 border border-slate-100 dark:border-slate-800 shadow-inner">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Total Tagihan</span>
                                <span className="text-4xl font-black text-[#38BDF8] tracking-tighter">Rp {Number(booking.total_price).toLocaleString('id-ID')}</span>
                            </div>

                            {!isPaid && (
                                <div className="space-y-4 p-6 rounded-3xl bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5">
                                    <p className="text-[9px] font-black text-[#FACC15] uppercase tracking-widest text-center italic">Instruksi Manual / QRIS</p>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">BANK BCA</span>
                                            <span className="text-xs font-black italic text-slate-900 dark:text-white uppercase tracking-tighter">{system_settings.bank_bca_number || '8420-9912-22'}</span>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">BANK MANDIRI</span>
                                            <span className="text-xs font-black italic text-slate-900 dark:text-white uppercase tracking-tighter">{system_settings.bank_mandiri_number || '121-00-123456-7'}</span>
                                        </div>
                                        <p className="text-[8px] font-medium text-slate-500 italic text-center mt-2 uppercase">A.N {system_settings.bank_bca_name || 'MANDALA ARENA MANAGEMENT'}</p>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 shadow-sm">
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1 overflow-hidden">
                                            <img src={system_settings.qris_image_url || "https://upload.wikimedia.org/wikipedia/commons/a/a2/QRIS_logo.svg"} alt="QRIS" className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[9px] font-black text-slate-900 dark:text-white italic uppercase tracking-tighter">Scan QRIS</p>
                                            <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Tersedia via Midtrans Snap</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* CTAs */}
                            <div className="space-y-4 pt-4">
                                {!isPaid && (
                                    <button onClick={handleRePay}
                                        className="w-full bg-[#FACC15] text-slate-900 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-[#38BDF8] hover:text-white transition-all shadow-xl shadow-[#FACC15]/20 group">
                                        <span className="group-hover:scale-110 transition-transform">Selesaikan Pembayaran </span>
                                    </button>
                                )}

                                <a href={whatsappUrl} target="_blank" rel="noreferrer"
                                    className="w-full bg-slate-900 dark:bg-slate-800 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-[#38BDF8] transition-all shadow-xl shadow-black/10 group">
                                    <span className="group-hover:scale-110 transition-transform">Konfirmasi via WA</span>
                                </a>

                                <div className="pt-4 text-center">
                                    <Link href={route('welcome')} className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-[#38BDF8] transition-colors">
                                        Kembali ke Beranda
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Security Badge */}
                        <div className="bg-slate-50 dark:bg-slate-800/30 px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-4 grayscale opacity-50">
                            <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Powered by Midtrans Snap</span>
                            <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700" />
                            <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Mandala Arena Security</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </>
    );
}

