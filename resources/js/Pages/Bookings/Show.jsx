import { Head, Link, usePage, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Components/Layouts/AuthenticatedLayout';

export default function Show({ booking, wa_link }) {
    const { flash, system_settings = {} } = usePage().props;
    const [currentBooking, setCurrentBooking] = useState(booking);

    // Real-time Update Listener
    useEffect(() => {
        const channel = window.Echo.channel(`bookings.${booking.id}`)
            .listen('.BookingStatusUpdated', (e) => {
                router.reload({
                    preserveScroll: true, onSuccess: (page) => {
                        setCurrentBooking(page.props.booking);
                    }
                });
            });

        return () => {
            window.Echo.leave(`bookings.${booking.id}`);
        };
    }, [booking.id]);

    const handlePay = (token) => {
        if (!token) return alert('Token pembayaran tidak valid!');
        window.snap.pay(token, {
            onSuccess: (result) => router.reload(),
            onPending: (result) => alert('Menunggu proses pembayaran.'),
            onError: (result) => alert('Pembayaran gagal!'),
        });
    };

    // Standard Status Handling
    const getStatusStyles = (status) => {
        switch (status) {
            case 'confirmed': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 shadow-lg shadow-emerald-500/20';
            case 'pending': return 'text-[#FACC15] border-[#FACC15]/30 bg-[#FACC15]/10 animate-pulse';
            case 'cancelled': return 'text-red-400 border-red-500/30 bg-red-500/10';
            default: return 'text-slate-400 border-slate-500/30 bg-slate-500/10';
        }
    };

    const bookingCode = `MA-${currentBooking.id.toString().padStart(5, '0')}`;

    return (
        <AuthenticatedLayout>
            <Head title={`Misi ${bookingCode} | Mandala Arena`} />

            {/* OVERLAY SUKSES OTOMATIS */}
            <AnimatePresence>
                {currentBooking.status === 'confirmed' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }}
                            className="max-w-md w-full bg-slate-900 border border-emerald-500/30 p-12 rounded-[3.5rem] shadow-[0_0_100px_rgba(16,185,129,0.2)] text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
                            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(16,185,129,0.5)]">
                                <motion.span initial={{ scale: 0 }} animate={{ scale: 1.5 }} transition={{ type: 'spring', delay: 0.2 }} className="text-4xl">✅</motion.span>
                            </div>
                            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-4">Misi <span className="text-emerald-400">Berhasil!</span></h2>
                            <p className="text-sm font-medium text-slate-400 mb-8 px-4 italic leading-relaxed">Otorisasi tempur telah divalidasi. Jadwal Anda sudah diamankan di sistem pusat Mandala Arena.</p>
                            <div className="space-y-3">
                                <Link href={route('dashboard')} className="block w-full py-5 bg-white text-slate-900 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-all">PANEL Dashboard →</Link>
                                <button onClick={() => setCurrentBooking({ ...currentBooking, status: 'DONE_SHOWN' })} className="text-[9px] font-black uppercase text-slate-500 tracking-widest hover:text-white transition-colors">Tutup & Lihat Detail</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-4xl mx-auto space-y-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-12"
                    style={{ borderColor: 'var(--border)' }}>
                    <div>
                        <Link href={route('bookings.index')} className="text-[10px] font-black text-[#38BDF8] uppercase tracking-[0.3em] mb-4 flex items-center gap-2 hover:translate-x-1 transition-transform">
                            ← Kembali ke Riwayat
                        </Link>
                        <h1 className="text-2xl md:text-5xl font-black italic uppercase tracking-tighter leading-none"
                            style={{ color: 'var(--text-primary)' }}>
                            Misi <span className="text-[#38BDF8]">{bookingCode}</span>
                        </h1>
                    </div>
                    <div className="md:text-right">
                        <span className={`px-6 py-2 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] ${getStatusStyles(currentBooking.status)}`}>
                            {currentBooking.status === 'confirmed' ? 'PEMBAYARAN BERHASIL' : `STATUS: ${currentBooking.status.toUpperCase()}`}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-12">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="rounded-[2.5rem] p-6 md:p-10 border shadow-2xl"
                            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                            <div className="flex items-start justify-between mb-8">
                                <div>
                                    <p className="text-[10px] font-black text-[#38BDF8] uppercase tracking-[0.4em] mb-2 italic">Data Fasilitas</p>
                                    <h3 className="text-3xl font-black italic uppercase tracking-tighter" style={{ color: 'var(--text-primary)' }}>
                                        {currentBooking.facility.name}
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
                                        {format(new Date(currentBooking.starts_at), 'EEEE, dd MMM yyyy', { locale: id })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>Alokasi Waktu</p>
                                    <p className="font-black italic text-lg uppercase" style={{ color: 'var(--text-primary)' }}>
                                        {format(new Date(currentBooking.starts_at), 'HH:mm')} - {format(new Date(currentBooking.ends_at), 'HH:mm')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>Durasi</p>
                                    <p className="font-black italic text-lg uppercase" style={{ color: 'var(--text-primary)' }}>
                                        {currentBooking.duration_hours} Jam
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>Status Pelatih/Wasit</p>
                                    <p className="font-black italic text-lg uppercase" style={{ color: currentBooking.is_with_referee ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                        {currentBooking.is_with_referee ? 'BERANGKAT' : 'KOSONG'}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                        {/* 2. AREA OTORISASI PEMBAYARAN (Ganti dari Support HQ) */}
                        {currentBooking.status === 'pending' && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
                                className="rounded-[2.5rem] p-6 md:p-10 border border-[#38BDF8]/20 bg-gradient-to-br from-[#38BDF8]/10 via-[#38BDF8]/5 to-transparent relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[#38BDF8] blur-[150px] opacity-10 pointer-events-none" />

                                <div className="relative z-10">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center border border-white/10 text-2xl shadow-xl shadow-[#38BDF8]/10">💳</div>
                                        <div>
                                            <h4 className="text-2xl font-black italic uppercase tracking-tighter text-white">Instruksi <span className="text-[#38BDF8]">Pembayaran</span></h4>
                                            <p className="text-[10px] font-black text-[#FACC15] uppercase tracking-[0.3em] italic">Otorisasi {currentBooking.payment_method?.toUpperCase()} Diperlukan</p>
                                        </div>
                                    </div>

                                    {/* TAMPILAN TRANSFER BANK */}
                                    {currentBooking.payment_method === 'transfer' && (
                                        <div className="space-y-6">
                                            {(() => {
                                                const catKey = currentBooking.facility.category?.toLowerCase().replace(' ', '_');
                                                const catBankNumber = system_settings[`cat_${catKey}_bank_number`] || system_settings['bank_bca_number'];
                                                const catBankName = system_settings[`cat_${catKey}_bank_name`] || system_settings['bank_bca_name'];
                                                const catBankOwner = system_settings[`cat_${catKey}_bank_owner`] || 'MANDALA ARENA MGMT';

                                                if (catBankNumber) {
                                                    return (
                                                        <div className="grid grid-cols-1 gap-4">
                                                            <div className="p-8 rounded-[2.5rem] bg-slate-950/80 border border-[#38BDF8]/40 hover:border-[#38BDF8] transition-all shadow-2xl relative overflow-hidden group/bank">
                                                                <div className="flex justify-between items-center mb-6">
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="text-2xl">🏦</span>
                                                                        <span className="px-3 py-1 bg-[#38BDF8]/20 rounded-lg text-[9px] font-black text-[#38BDF8] uppercase tracking-widest">
                                                                            REKENING UTAMA: {catBankName || 'BANK'}
                                                                        </span>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => {
                                                                            navigator.clipboard.writeText(catBankNumber);
                                                                            alert('Nomor Rekening Berhasil Disalin!');
                                                                        }}
                                                                        className="px-4 py-2 bg-[#38BDF8]/10 text-[#38BDF8] text-[8px] font-black rounded-lg uppercase tracking-widest hover:bg-[#38BDF8] hover:text-white transition-all"
                                                                    >
                                                                        📋 SALIN NOMOR
                                                                    </button>
                                                                </div>
                                                                <p className="text-4xl font-black italic text-white tracking-[0.1em] mb-2 drop-shadow-lg">{catBankNumber}</p>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">A.N {catBankOwner}</p>

                                                                <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-3 gap-4">
                                                                    <div className="text-center">
                                                                        <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Kode BCA</p>
                                                                        <p className="text-[10px] font-black text-white">014</p>
                                                                    </div>
                                                                    <div className="text-center">
                                                                        <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Kode Mandiri</p>
                                                                        <p className="text-[10px] font-black text-white">008</p>
                                                                    </div>
                                                                    <div className="text-center">
                                                                        <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Kode BNI</p>
                                                                        <p className="text-[10px] font-black text-white">009</p>
                                                                    </div>
                                                                </div>

                                                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#38BDF8] blur-[100px] opacity-10 pointer-events-none" />
                                                            </div>

                                                            <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                                                                <p className="text-[9px] font-black text-[#FACC15] uppercase tracking-widest mb-3 flex items-center gap-2">
                                                                    <span>💡</span> PANDUAN TRANSFER ANTAR BANK
                                                                </p>
                                                                <p className="text-[9px] text-slate-400 leading-relaxed uppercase font-medium">
                                                                    Jika Anda mentransfer dari bank selain <span className="text-white">{catBankName}</span>, gunakan kombinasi <span className="text-white">Kode Bank + Nomor Rekening</span> di atas. Contoh untuk Mandiri ke BCA: <span className="text-white italic">014{catBankNumber}</span>.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <div className="p-10 bg-slate-950/40 border-2 border-dashed border-white/5 rounded-[3rem] text-center space-y-4">
                                                        <span className="text-3xl">📡</span>
                                                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-relaxed">
                                                            Saluran Pembayaran {currentBooking.facility.category} Sedang Diperbarui.<br />
                                                            Harap Hubungi Admin untuk Eksekusi VA Manuel.
                                                        </h5>
                                                        <a href={`https://wa.me/${system_settings.whatsapp_contact || ''}`} target="_blank" className="inline-block px-6 py-3 bg-[#25D366]/10 text-[#25D366] text-[8px] font-black rounded-xl uppercase tracking-widest hover:bg-[#25D366] hover:text-white transition-all">
                                                            HUBUNGI ADMIN HQ (WHATSAPP) →
                                                        </a>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}

                                    {/* TAMPILAN QRIS */}
                                    {currentBooking.payment_method === 'qris' && (
                                        <div className="flex flex-col md:flex-row items-center gap-12 py-4 w-full">
                                            {(() => {
                                                const catKey = currentBooking.facility.category?.toLowerCase().replace(' ', '_');
                                                const catQris = system_settings[`cat_${catKey}_qris`] || system_settings['qris_image_url'];

                                                if (!catQris) {
                                                    return (
                                                        <div className="w-full p-10 bg-slate-950/40 border-2 border-dashed border-white/5 rounded-[3rem] text-center space-y-4">
                                                            <span className="text-3xl">📲</span>
                                                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-relaxed">
                                                                Kode QRIS {currentBooking.facility.category} Sedang Maintenance.<br />
                                                                Gunakan Metode Transfer atau Hubungi Admin.
                                                            </h5>
                                                            <a href={`https://wa.me/${system_settings.whatsapp_contact || ''}`} target="_blank" className="inline-block px-6 py-3 bg-[#25D366]/10 text-[#25D366] text-[8px] font-black rounded-xl uppercase tracking-widest hover:bg-[#25D366] hover:text-white transition-all">
                                                                KLAIM QRIS VIA WHATSAPP →
                                                            </a>
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <>
                                                        <div className="p-6 bg-white rounded-[3.5rem] shadow-[0_0_80px_rgba(56,189,248,0.15)] relative overflow-hidden flex-shrink-0 mx-auto md:mx-0">
                                                            <img src={catQris} alt="QRIS" className="w-56 h-56 md:w-64 md:h-64 object-contain" />
                                                        </div>
                                                        <div className="space-y-6 text-center md:text-left flex-1">
                                                            <div className="space-y-2">
                                                                <p className="text-xl font-black text-white italic uppercase tracking-tighter leading-tight">Gunakan Seluruh <br /> Dompet Digital / M-Banking</p>
                                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                                                                    Pindai kode QRIS khusus devisi {currentBooking.facility.category} untuk otorisasi cepat.
                                                                </p>
                                                            </div>
                                                            <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#FACC15]/10 border border-[#FACC15]/20 rounded-2xl">
                                                                <span className="text-xl">🛡️</span>
                                                                <p className="text-[9px] font-black text-[#FACC15] uppercase tracking-widest">Sistem Pembayaran Terenkripsi</p>
                                                            </div>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    )}

                                    {currentBooking.payment_method === 'cod' && (
                                        <div className="bg-slate-950/60 p-10 rounded-[3rem] border border-white/5 text-center space-y-6">
                                            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto text-3xl shadow-xl shadow-emerald-500/5">🤝</div>
                                            <div className="space-y-2">
                                                <h5 className="text-xl font-black italic uppercase tracking-tighter text-white">Konfirmasi Langsung Di Lokasi</h5>
                                                <p className="text-xs font-medium text-slate-400 max-w-sm mx-auto leading-relaxed uppercase">Misi Anda telah divalidasi. Harap segera datang ke lokasi atau lapor ke Staff untuk aktivasi jadwal tempur Anda.</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-10 pt-8 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <p className="text-[9px] font-medium text-slate-500 italic uppercase">Konfirmasi Pembayaran Anda akan otomatis divalidasi oleh sistem HQ dalam hitungan menit.</p>
                                        <a href={wa_link} className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-[#38BDF8]/10 text-white hover:text-[#38BDF8] text-[9px] font-black rounded-xl uppercase tracking-widest transition-all border border-white/10 hover:border-[#38BDF8]/30">
                                            <span>HUBUNGI PUSAT KOMANDO (WA)</span>
                                            <span>→</span>
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {currentBooking.status === 'completed' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                                className="rounded-[2.5rem] p-10 border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
                                <h4 className="text-xl font-black italic uppercase tracking-tighter mb-4 text-emerald-400">MISI SELESAI</h4>
                                <p className="text-xs font-medium leading-relaxed mb-8 max-w-md text-slate-400 italic">Terima kasih telah bertanding di Mandala Arena. Rekaman data misi Anda telah diarsipkan secara permanen.</p>
                            </motion.div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-[2.5rem] p-8 border shadow-2xl sticky top-12"
                            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                            <p className="text-[10px] font-black text-[#38BDF8] uppercase tracking-[0.4em] mb-8 italic">Financial Intel</p>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                                    <span>Biaya Dasar</span>
                                    <span>Rp {parseInt(currentBooking.total_price).toLocaleString('id-ID')}</span>
                                </div>
                                <div className="border-t pt-4 flex justify-between items-center" style={{ borderColor: 'var(--border)' }}>
                                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>Total Misi</span>
                                    <span className="text-2xl font-black italic text-[#38BDF8]">Rp {parseInt(currentBooking.total_price).toLocaleString('id-ID')}</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5">
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Metode Otorisasi</p>
                                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                                        {currentBooking.payment_method?.replace(/_/g, ' ') || 'SISTEM INSTAN'}
                                    </p>
                                </div>

                                {currentBooking.status === 'pending' && currentBooking.payment_token && (
                                    <button onClick={() => handlePay(currentBooking.payment_token)} className="w-full py-4 bg-[#38BDF8] text-slate-950 font-black rounded-xl text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-[#38BDF8]/20">Bayar Sekarang (Online)</button>
                                )}

                                <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5">
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Status Otorisasi</p>
                                    <p className={`text-[10px] font-black uppercase tracking-wider ${currentBooking.payment_status === 'paid' ? 'text-emerald-400' : 'text-[#FACC15]'}`}>
                                        {currentBooking.payment_status === 'paid' ? 'DIOTORISASI (LUNAS)' : 'DALAM PROSES'}
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
