import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function Show({ booking, wa_link }) {
    // Standard Status Handling
    const getStatusStyles = (status) => {
        switch (status) {
            case 'confirmed': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
            case 'pending': return 'text-[#FACC15] border-[#FACC15]/30 bg-[#FACC15]/10';
            case 'cancelled': return 'text-red-400 border-red-500/30 bg-red-500/10';
            default: return 'text-slate-400 border-slate-500/30 bg-slate-500/10';
        }
    };

    const bookingCode = `MA-${booking.id.toString().padStart(5, '0')}`;

    return (
        <AuthenticatedLayout>
            <Head title={`Misi ${bookingCode} | Mandala Arena`} />

            <div className="max-w-4xl mx-auto space-y-12">
                {/* ══ HEADER: TACTICAL SCAN ══ */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-12"
                    style={{ borderColor: 'var(--border)' }}>
                    <div>
                        <Link href={route('bookings.index')} className="text-[10px] font-black text-[#38BDF8] uppercase tracking-[0.3em] mb-4 flex items-center gap-2 hover:translate-x-1 transition-transform">
                            ← Kembali ke Riwayat
                        </Link>
                        <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none"
                            style={{ color: 'var(--text-primary)' }}>
                            Misi <span className="text-[#38BDF8]">{bookingCode}</span>
                        </h1>
                    </div>
                    <div className="md:text-right">
                        <span className={`px-6 py-2 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] ${getStatusStyles(booking.status)}`}>
                            Status: {booking.status}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* LEFT: MISSION SUMMARY */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* 1. DATA FASILITAS */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="rounded-[2.5rem] p-10 border shadow-2xl"
                            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                            <div className="flex items-start justify-between mb-8">
                                <div>
                                    <p className="text-[10px] font-black text-[#38BDF8] uppercase tracking-[0.4em] mb-2 italic">Data Fasilitas</p>
                                    <h3 className="text-3xl font-black italic uppercase tracking-tighter" style={{ color: 'var(--text-primary)' }}>
                                        {booking.facility.name}
                                    </h3>
                                </div>
                                <div className="w-16 h-16 rounded-2xl bg-slate-900 border flex items-center justify-center" style={{ borderColor: 'var(--border)' }}>
                                    <span className="text-2xl">🏟️</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>Tanggal Misi</p>
                                    <p className="font-black italic text-lg uppercase" style={{ color: 'var(--text-primary)' }}>
                                        {format(new Date(booking.starts_at), 'EEEE, dd MMM yyyy', { locale: id })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>Alokasi Waktu</p>
                                    <p className="font-black italic text-lg uppercase" style={{ color: 'var(--text-primary)' }}>
                                        {format(new Date(booking.starts_at), 'HH:mm')} - {format(new Date(booking.ends_at), 'HH:mm')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>Durasi</p>
                                    <p className="font-black italic text-lg uppercase" style={{ color: 'var(--text-primary)' }}>
                                        {booking.duration_hours} Jam
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>Wasit Tambahan</p>
                                    <p className="font-black italic text-lg uppercase" style={{ color: booking.is_with_referee ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                        {booking.is_with_referee ? 'AKTIF' : 'NON-AKTIF'}
                                    </p>
                                </div>
                                <div className="border-t pt-8 mt-2 col-span-2" style={{ borderColor: 'var(--border)' }}>
                                    <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>Log Transaksi (HQ Timestamp)</p>
                                    <p className="font-black italic text-xs uppercase tracking-[0.1em]" style={{ color: 'var(--text-primary)' }}>
                                        Pesanan dibuat pada: {format(new Date(booking.created_at), 'dd MMM yyyy, HH:mm', { locale: id })} WIB
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* 2. ADUAN & SUPPORT */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            className="rounded-[2.5rem] p-10 border border-[#38BDF8]/20 bg-gradient-to-br from-[#38BDF8]/5 to-transparent">
                            <h4 className="text-xl font-black italic uppercase tracking-tighter mb-4" style={{ color: 'var(--text-primary)' }}>
                                Butuh Bantuan HQ?
                            </h4>
                            <p className="text-xs font-medium leading-relaxed mb-8 max-w-md" style={{ color: 'var(--text-secondary)' }}>
                                Jika Anda memiliki kendala terkait fasilitas, jadwal, atau ingin mengajukan aduan taktis, pusat komando kami siap membantu.
                            </p>
                            <a href={wa_link} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-4 px-8 py-5 rounded-2xl bg-emerald-600 text-white font-black italic uppercase text-xs tracking-[0.2em] hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-900/40 group">
                                <span>Hubungi Admin HQ (WhatsApp)</span>
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </a>
                        </motion.div>
                    </div>

                    {/* RIGHT: FINANCIAL SUMMARY */}
                    <div className="space-y-6">
                        <div className="rounded-[2.5rem] p-8 border shadow-2xl sticky top-12"
                            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                            <p className="text-[10px] font-black text-[#38BDF8] uppercase tracking-[0.4em] mb-8 italic">Financial Intel</p>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                                    <span>Biaya Dasar</span>
                                    <span>Rp {parseInt(booking.total_price + (booking.discount_amount || 0)).toLocaleString('id-ID')}</span>
                                </div>
                                {booking.discount_amount > 0 && (
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                                        <span>Potongan Voucher</span>
                                        <span>-Rp {parseInt(booking.discount_amount).toLocaleString('id-ID')}</span>
                                    </div>
                                )}
                                <div className="border-t pt-4 flex justify-between items-center" style={{ borderColor: 'var(--border)' }}>
                                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>Total Misi</span>
                                    <span className="text-2xl font-black italic text-[#38BDF8]">
                                        Rp {parseInt(booking.total_price).toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5">
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Metode Otorisasi</p>
                                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                                        {booking.payment_method?.replace('_', ' ') || 'SISTEM INSTAN'}
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5">
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Otorisasi Pembayaran</p>
                                    <p className={`text-[10px] font-black uppercase tracking-wider ${booking.payment_status === 'paid' ? 'text-emerald-400' : 'text-[#FACC15]'}`}>
                                        {booking.payment_status === 'paid' ? 'DIOTORISASI (LUNAS)' : 'DALAM PROSES'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
