import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

const PAYMENT_LABEL = {
    transfer_bank: { label: 'Transfer Bank', icon: '🏦' },
    qris: { label: 'QRIS', icon: '📱' },
    bayar_ditempat: { label: 'Bayar di Tempat', icon: '💵' },
};

function formatDate(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
}

export default function GuestSuccess({ booking }) {
    const whatsappMsg = encodeURIComponent(
        `Halo! Saya ingin konfirmasi booking saya.\n` +
        `Kode Booking: ${booking.booking_code}\n` +
        `Venue: ${booking.venue}\n` +
        `Tanggal: ${formatDate(booking.date)}\n` +
        `Waktu: ${booking.start_time} – ${booking.end_time}\n` +
        `Total: Rp ${Number(booking.total_price).toLocaleString('id-ID')}`
    );
    const whatsappUrl = `https://wa.me/?text=${whatsappMsg}`;

    return (
        <>
            <Head title="Booking Berhasil – Janjee" />

            <div className="min-h-screen flex items-center justify-center p-4 font-sans"
                style={{ background: 'var(--bg-base)' }}>

                <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 24, stiffness: 300 }}
                    className="w-full max-w-md"
                >
                    {/* Success card */}
                    <div className="rounded-3xl overflow-hidden shadow-2xl border"
                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>

                        {/* Header */}
                        <div className="bg-[#1A1818] px-6 py-5 text-center">
                            <img src="/images/janjee-logo.svg" alt="Janjee"
                                className="h-10 w-10 mx-auto mb-2" />
                            <p className="text-xl font-black text-[#F2D800]">Janjee</p>
                            <p className="text-xs text-slate-400">Konfirmasi Booking</p>
                        </div>

                        {/* Booking Code Bar */}
                        <div className="bg-[#F2D800] px-6 py-3 flex items-center justify-between">
                            <span className="text-[11px] font-bold text-[#1A1818] uppercase tracking-widest">
                                Kode Booking
                            </span>
                            <span className="text-sm font-black text-[#1A1818] font-mono">
                                {booking.booking_code}
                            </span>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-5 space-y-4">

                            {/* Status */}
                            <div className="flex justify-center">
                                <span className="inline-flex items-center gap-2 rounded-full bg-green-100 text-green-700 font-bold text-sm px-4 py-2">
                                    ✅ BOOKING BERHASIL
                                </span>
                            </div>

                            {/* Detail rows */}
                            <div className="divide-y rounded-2xl border overflow-hidden"
                                style={{ borderColor: 'var(--border)', divideColor: 'var(--border)' }}>
                                <Row label="Nama" value={booking.guest_name} />
                                <Row label="Venue" value={booking.venue} />
                                <Row label="Tanggal" value={formatDate(booking.date)} />
                                <Row label="Waktu" value={`${booking.start_time} – ${booking.end_time}`} />
                                <Row label="Metode Bayar"
                                    value={`${PAYMENT_LABEL[booking.payment_method]?.icon ?? ''} ${PAYMENT_LABEL[booking.payment_method]?.label ?? booking.payment_method}`} />
                                <Row label="Dibuat" value={booking.created_at} />
                            </div>

                            {/* Total */}
                            <div className="flex items-center justify-between bg-[#1A1818] text-white rounded-2xl px-4 py-3">
                                <span className="text-sm font-bold">Total Pembayaran</span>
                                <span className="text-lg font-black text-[#F2D800]">
                                    Rp {Number(booking.total_price).toLocaleString('id-ID')}
                                </span>
                            </div>

                            {/* Note */}
                            <p className="text-[11px] text-center leading-relaxed"
                                style={{ color: 'var(--text-muted)' }}>
                                Simpan kode booking ini. Tunjukkan kepada pengelola venue saat tiba.
                            </p>

                            {/* Insentif daftar akun */}
                            <div className="rounded-2xl p-4 border text-center space-y-2"
                                style={{ background: 'var(--accent-dim)', borderColor: 'var(--accent-border)' }}>
                                <p className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
                                    🎁 Daftar akun & nikmati lebih banyak keuntungan!
                                </p>
                                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                    Dapatkan poin reward setiap booking, diskon eksklusif, dan riwayat booking otomatis tersimpan.
                                </p>
                                <div className="flex justify-center gap-2">
                                    <Link href={route('register')}
                                        className="rounded-full px-4 py-1.5 text-xs font-bold text-[#1A1818]"
                                        style={{ background: 'var(--accent)' }}>
                                        Daftar Gratis
                                    </Link>
                                    <Link href={route('login')}
                                        className="rounded-full px-4 py-1.5 text-xs font-semibold border"
                                        style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
                                        Masuk
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="px-6 pb-6 flex flex-col gap-2">
                            {/* WhatsApp notify */}
                            <a href={whatsappUrl} target="_blank" rel="noreferrer"
                                className="flex items-center justify-center gap-2 w-full rounded-full py-3 text-sm font-bold text-white transition-all hover:opacity-90"
                                style={{ background: '#25D366' }}>
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.555 4.122 1.528 5.855L.057 23.454a.5.5 0 0 0 .613.612l5.598-1.471A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.944 9.944 0 0 1-5.073-1.386l-.364-.215-3.32.872.887-3.24-.236-.374A9.945 9.945 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                                </svg>
                                Bagikan via WhatsApp
                            </a>

                            <div className="flex gap-2">
                                <Link href={route('venues.index')}
                                    className="flex-1 rounded-full border text-center py-2.5 text-sm font-semibold transition-all"
                                    style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                                    Cari Venue Lain
                                </Link>
                                <button onClick={() => window.print()}
                                    className="flex-1 rounded-full border text-center py-2.5 text-sm font-semibold transition-all"
                                    style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                                    🖨️ Cetak
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </>
    );
}

function Row({ label, value }) {
    return (
        <div className="flex items-center justify-between px-4 py-2.5 bg-white/5">
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</span>
            <span className="text-xs font-semibold text-right max-w-[55%]"
                style={{ color: 'var(--text-primary)' }}>{value}</span>
        </div>
    );
}
