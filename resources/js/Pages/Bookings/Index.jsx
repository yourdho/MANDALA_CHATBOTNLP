import AuthenticatedLayout from '@/Components/Layouts/AuthenticatedLayout';
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
        confirmed: { bg: 'bg-[#38BDF8]/20', text: 'text-[#38BDF8] border-[#38BDF8]/40', label: 'Terkonfirmasi' },
        pending: { bg: 'bg-[#FACC15]/20', text: 'text-[#FACC15] border-[#FACC15]/40', label: 'Menunggu Pembayaran' },
        completed: { bg: 'bg-slate-100', text: 'text-slate-500 border-slate-200', label: 'Selesai' },
        cancelled: { bg: 'bg-red-500/20', text: 'text-red-400 border-red-500/40', label: 'Dibatalkan' },
        refund_processing: { bg: 'bg-amber-500/20', text: 'text-amber-400 border-amber-500/40', label: 'Refund Diproses' },
        refund_successful: { bg: 'bg-green-500/20', text: 'text-green-400 border-green-500/40', label: 'Refund Berhasil' },
    };

    const handleCancel = (id) => {
        if (confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) {
            router.patch(route('bookings.cancel', id));
        }
    };

    const handlePrint = (id) => {
        if (!id) return;
        window.open(route('bookings.invoice', id), '_blank');
    };

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
                        <h1 className="text-2xl md:text-5xl font-black italic uppercase tracking-tighter leading-none"
                            style={{ color: 'var(--text-primary)' }}>
                            Daftar <span className="text-[#38BDF8]">Booking</span>
                        </h1>
                    </div>
                </div>


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
                            className="rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 border relative overflow-hidden shadow-sm group"
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
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto mt-4 md:mt-0">
                                            {/* Check Detail Button (Primary Action) */}
                                            <Link
                                                href={route('bookings.show', booking.id)}
                                                className="px-5 py-3 border border-[#38BDF8]/40 text-[#38BDF8] font-black rounded-xl text-[9px] uppercase tracking-widest hover:bg-[#38BDF8] hover:text-slate-950 transition-all shadow-lg shadow-[#38BDF8]/10 italic"
                                            >
                                                CHECK DETAIL →
                                            </Link>

                                            {/* Midtrans Pay Button */}
                                            {booking.status === 'pending' && booking.payment_token && (
                                                <button
                                                    onClick={() => handlePay(booking.payment_token)}
                                                    className="px-5 py-3 bg-[#38BDF8] text-slate-950 font-black rounded-xl text-[9px] uppercase tracking-widest hover:scale-105 transition-all shadow-md shadow-[#38BDF8]/30 italic"
                                                >
                                                    BAYAR SKRG
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

            {/* ── E-Ticket / Nota Invoice Modal ── */}
            <AnimatePresence>
                {nota && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[150] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4"
                        onClick={() => setNota(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
                            className="rounded-[2rem] w-[95%] sm:w-full max-w-2xl bg-white shadow-2xl overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="max-h-[90vh] overflow-y-auto">
                                <InvoiceContent nota={nota} paymentLabel={PAYMENT_LABEL} />
                            </div>
                            <div className="flex gap-3 p-6 border-t border-gray-100 bg-white sticky bottom-0 z-10">
                                <button
                                    onClick={() => handlePrint(nota.id)}
                                    className="flex-1 px-6 py-3 bg-gray-900 text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                    Tampilkan E-Ticket
                                </button>
                                <button
                                    onClick={() => setNota(null)}
                                    className="px-8 py-3 border border-gray-200 text-gray-500 font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-gray-50 transition-all"
                                >
                                    Tutup
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
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

function InvoiceContent({ nota, paymentLabel }) {
    const startDate = new Date(nota.starts_at);
    const endDate = new Date(nota.ends_at);
    const formattedDate = startDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    const startTime = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTime = endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const duration = nota.duration_hours || Math.round((endDate - startDate) / 3600000);
    const basePrice = Number(nota.total_price) - Number(nota.referee_price || 0) - Number(nota.addons_total_price || 0);
    const invoiceNo = String(nota.id).padStart(6, '0');
    const paymentMethodLabel = paymentLabel[nota.payment_method]?.label || nota.payment_method?.replace(/_/g, ' ').toUpperCase() || 'Online';

    return (
        <div style={{ 
            fontFamily: "'Helvetica Neue', Arial, sans-serif", 
            background: '#fff', 
            color: '#111', 
            minHeight: '296mm',
            height: '296mm',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxSizing: 'border-box'
        }}>
            {/* Top Strip */}
            <div style={{ padding: '40px 48px 0' }}>
                {/* Header: Logo + Invoice Number */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                    <div>
                        <div style={{ fontWeight: 900, fontSize: '18px', letterSpacing: '-0.02em', lineHeight: 1 }}>MANDALA</div>
                        <div style={{ fontWeight: 900, fontSize: '18px', letterSpacing: '-0.02em', color: '#38BDF8', lineHeight: 1 }}>ARENA</div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#555' }}>
                        <div style={{ marginBottom: '2px' }}>NO. {invoiceNo}</div>
                    </div>
                </div>

                {/* INVOICE Title */}
                <div style={{ fontSize: '64px', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '28px', color: '#111' }}>
                    INVOICE
                </div>

                {/* Date */}
                <div style={{ marginBottom: '28px', fontSize: '13px' }}>
                    <span style={{ fontWeight: 700 }}>Date:&nbsp;&nbsp;</span>{formattedDate}
                </div>

                {/* Billed To / From */}
                <div style={{ display: 'flex', gap: '48px', marginBottom: '36px' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '8px' }}>Kepada:</div>
                        <div style={{ fontSize: '13px', lineHeight: 1.7, color: '#333' }}>
                            <div>{nota.guest_name || nota.user?.name || 'Pelanggan'}</div>
                            <div>{nota.guest_phone || nota.user?.phone || '-'}</div>
                            <div>{nota.guest_email || nota.user?.email || ''}</div>
                        </div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '8px' }}>Dari:</div>
                        <div style={{ fontSize: '13px', lineHeight: 1.7, color: '#333' }}>
                            <div>Mandala Arena</div>
                            <div>Jl. Olahraga No. 1, Kota</div>
                            <div>mandala-arena@mandala.com</div>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0', fontSize: '13px' }}>
                    <thead>
                        <tr style={{ background: '#e8e8e8' }}>
                            <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 700, letterSpacing: '0.04em', fontSize: '12px' }}>Item</th>
                            <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 700, letterSpacing: '0.04em', fontSize: '12px' }}>Qty</th>
                            <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 700, letterSpacing: '0.04em', fontSize: '12px' }}>Harga</th>
                            <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 700, letterSpacing: '0.04em', fontSize: '12px' }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Facility row */}
                        <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                            <td style={{ padding: '14px 16px' }}>
                                <div style={{ fontWeight: 600 }}>{nota.facility?.name}</div>
                                <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{formattedDate}, {startTime} – {endTime}</div>
                            </td>
                            <td style={{ textAlign: 'right', padding: '14px 16px' }}>{duration} jam</td>
                            <td style={{ textAlign: 'right', padding: '14px 16px' }}>Rp {Math.round(basePrice / (duration || 1)).toLocaleString('id-ID')}</td>
                            <td style={{ textAlign: 'right', padding: '14px 16px' }}>Rp {basePrice.toLocaleString('id-ID')}</td>
                        </tr>
                        {/* Referee add-on if present */}
                        {Number(nota.referee_price) > 0 && (
                            <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                                <td style={{ padding: '14px 16px' }}>Wasit / Referee</td>
                                <td style={{ textAlign: 'right', padding: '14px 16px' }}>1</td>
                                <td style={{ textAlign: 'right', padding: '14px 16px' }}>Rp {Number(nota.referee_price).toLocaleString('id-ID')}</td>
                                <td style={{ textAlign: 'right', padding: '14px 16px' }}>Rp {Number(nota.referee_price).toLocaleString('id-ID')}</td>
                            </tr>
                        )}
                        {/* Total row */}
                        <tr style={{ borderTop: '2px solid #ddd' }}>
                            <td colSpan="3" style={{ textAlign: 'right', padding: '14px 16px', fontWeight: 700, fontSize: '13px' }}>Total</td>
                            <td style={{ textAlign: 'right', padding: '14px 16px', fontWeight: 900, fontSize: '14px' }}>Rp {Number(nota.total_price).toLocaleString('id-ID')}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Divider */}
                <div style={{ height: '1px', background: '#ddd', margin: '28px 0' }} />

                {/* Payment Method + Note */}
                <div style={{ marginBottom: '16px', fontSize: '13px' }}>
                    <span style={{ fontWeight: 700 }}>Metode Pembayaran:</span>&nbsp; {paymentMethodLabel}
                </div>
                <div style={{ marginBottom: '40px', fontSize: '13px' }}>
                    <span style={{ fontWeight: 700 }}>Catatan:</span>&nbsp; Terima kasih telah memilih Mandala Arena. Tunjukkan tiket ini kepada staff kami saat tiba di lokasi.
                </div>
            </div>

            {/* Wave Footer */}
            <div style={{ position: 'relative', height: '140px', overflow: 'hidden', marginTop: 'auto' }}>
                <svg viewBox="0 0 728 140" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100%' }}>
                    <path d="M0,140 L0,80 Q200,120 400,90 Q550,70 728,110 L728,140 Z" fill="#e8e8e8" />
                    <path d="M0,140 L0,100 Q180,80 350,110 Q520,140 728,120 L728,140 Z" fill="#333333" />
                </svg>
            </div>
        </div>
    );
}
