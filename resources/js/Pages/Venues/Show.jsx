import { Head, Link, usePage, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const PAYMENT_METHODS = [
    {
        id: 'transfer_bank',
        label: 'Transfer Bank',
        desc: 'BCA / Mandiri / BNI / BRI',
        icon: '🏦',
    },
    {
        id: 'qris',
        label: 'QRIS',
        desc: 'Bayar via aplikasi dompet digital',
        icon: '📱',
    },
    {
        id: 'bayar_ditempat',
        label: 'Bayar di Tempat',
        desc: 'Tunai / debit saat tiba di venue',
        icon: '💵',
    },
];

export default function VenueShow({ venue, timeSlots }) {
    const { auth } = usePage().props;
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
    const [lightboxIdx, setLightboxIdx] = useState(null);

    // Payment modal state
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [processing, setProcessing] = useState(false);
    const [guestErrors, setGuestErrors] = useState({});

    // Guest fields (hanya dipakai kalau tidak login)
    const [guestName, setGuestName] = useState('');
    const [guestPhone, setGuestPhone] = useState('');

    const toggleSlot = (time) =>
        setSelectedSlots(prev =>
            prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time].sort()
        );

    const totalHarga = selectedSlots.length * Number(venue.price_raw);
    const endTime = selectedSlots.length > 0
        ? String(parseInt(selectedSlots[selectedSlots.length - 1]) + 1).padStart(2, '0') + ':00'
        : '';

    const openPaymentModal = () => {
        if (selectedSlots.length === 0) return;
        setPaymentMethod('');
        setShowPaymentModal(true);
    };

    const confirmBooking = () => {
        if (!paymentMethod) return;

        // Validasi guest fields kalau tidak login
        if (!auth?.user) {
            const errs = {};
            if (!guestName.trim()) errs.guest_name = 'Nama wajib diisi.';
            if (!guestPhone.trim()) errs.guest_phone = 'Nomor telepon wajib diisi.';
            if (Object.keys(errs).length > 0) { setGuestErrors(errs); return; }
        }
        setGuestErrors({});

        setProcessing(true);
        const payload = {
            venue_id: venue.id,
            booking_date: bookingDate,
            start_time: selectedSlots[0],
            end_time: endTime,
            payment_method: paymentMethod,
        };
        if (!auth?.user) {
            payload.guest_name = guestName.trim();
            payload.guest_phone = guestPhone.trim();
        }
        router.post(route('bookings.store'), payload, {
            onError: (errors) => {
                setProcessing(false);
                // Tampilkan error dari server ke guestErrors
                if (errors.guest_name || errors.guest_phone) {
                    setGuestErrors(errors);
                }
            },
            onSuccess: () => { setProcessing(false); setShowPaymentModal(false); },
        });
    };

    const images = venue.images ?? [];

    return (
        <>
            <Head title={`${venue.name} - Janjee`} />
            <div className="min-h-screen bg-[#1A1818] text-white font-sans">

                {/* Background */}
                <div className="fixed inset-0 -z-10 pointer-events-none">
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#F2D800]/5 rounded-full blur-[120px]" />
                </div>

                {/* Navbar */}
                <header className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 lg:px-12 h-14 sm:h-16 backdrop-blur-md bg-[#1A1818]/80 border-b border-[#2e2a2a]">
                    <Link href="/" className="flex items-center gap-2">
                        <img src="/images/janjee-logo.svg" alt="Janjee" className="h-7 w-7" />
                        <span className="text-lg font-black text-[#F2D800]">Janjee</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link href={route('venues.index')}
                            className="text-sm font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span className="hidden sm:inline">Kembali</span>
                        </Link>
                        {auth?.user ? (
                            <Link href={route('dashboard')}
                                className="rounded-full bg-[#F2D800]/10 border border-[#F2D800]/20 px-3 py-1.5 text-xs font-semibold text-[#F2D800] hover:bg-[#F2D800]/20 transition-all">
                                Dashboard
                            </Link>
                        ) : (
                            <Link href={route('login')}
                                className="rounded-full bg-[#F2D800] px-3 py-1.5 text-xs font-bold text-[#1A1818] hover:bg-[#ffe800] transition-all">
                                Masuk
                            </Link>
                        )}
                    </div>
                </header>

                {/* Photo Gallery */}
                {images.length > 0 ? (
                    <div className="relative">
                        <div className="h-56 sm:h-72 lg:h-96 overflow-hidden cursor-pointer"
                            onClick={() => setLightboxIdx(0)}>
                            <img src={images[0]} alt={venue.name}
                                className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1818] to-transparent" />
                        </div>
                        {images.length > 1 && (
                            <div className="relative flex gap-2 px-4 sm:px-6 lg:px-8 -mt-14 pb-4 overflow-x-auto no-scrollbar z-10">
                                {images.slice(1).map((img, i) => (
                                    <div key={i} onClick={() => setLightboxIdx(i + 1)}
                                        className="flex-shrink-0 w-20 h-14 sm:w-28 sm:h-20 rounded-xl overflow-hidden border-2 border-[#2e2a2a] hover:border-[#F2D800] cursor-pointer transition-all">
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                                <button onClick={() => setLightboxIdx(0)}
                                    className="flex-shrink-0 w-20 h-14 sm:w-28 sm:h-20 rounded-xl border-2 border-dashed border-[#2e2a2a] hover:border-[#F2D800]/30 flex items-center justify-center text-xs text-slate-500 hover:text-[#F2D800] transition-all">
                                    {images.length} Foto
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-48 sm:h-64 bg-[#231F1F] border-b border-[#2e2a2a] flex items-center justify-center">
                        <div className="text-center text-slate-600">
                            <svg className="w-12 h-12 mx-auto mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm">Belum ada foto</p>
                        </div>
                    </div>
                )}

                {/* Lightbox */}
                <AnimatePresence>
                    {lightboxIdx !== null && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
                            onClick={() => setLightboxIdx(null)}>
                            <button className="absolute top-4 right-4 text-white/60 hover:text-white text-xl font-bold">✕</button>
                            <div className="flex items-center gap-4 w-full max-w-4xl" onClick={e => e.stopPropagation()}>
                                <button onClick={() => setLightboxIdx(i => Math.max(0, i - 1))}
                                    className="text-white/50 hover:text-white text-3xl font-light flex-shrink-0">‹</button>
                                <img src={images[lightboxIdx]} alt=""
                                    className="flex-1 max-h-[80vh] object-contain rounded-xl" />
                                <button onClick={() => setLightboxIdx(i => Math.min(images.length - 1, i + 1))}
                                    className="text-white/50 hover:text-white text-3xl font-light flex-shrink-0">›</button>
                            </div>
                            <div className="absolute bottom-4 left-0 right-0 text-center text-sm text-white/40">
                                {lightboxIdx + 1} / {images.length}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main content */}
                <section className="py-6 sm:py-8 relative z-10">
                    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>

                            {/* Header */}
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span className="rounded-full px-3 py-1 text-xs font-semibold bg-[#F2D800]/10 text-[#F2D800] border border-[#F2D800]/20">
                                    {venue.category}
                                </span>
                                {venue.rating > 0 && (
                                    <div className="flex items-center gap-1 text-sm text-slate-400">
                                        <span className="text-yellow-400">★</span>
                                        <span className="text-white font-semibold">{venue.rating}</span>
                                        <span>({venue.reviews_count} ulasan)</span>
                                    </div>
                                )}
                            </div>
                            <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">{venue.name}</h1>
                            <div className="flex items-center gap-1.5 mt-2 text-sm text-slate-400">
                                <svg className="w-4 h-4 flex-shrink-0 text-[#F2D800]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {venue.address}
                            </div>

                            {/* Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8 mt-6 sm:mt-8">

                                {/* Left */}
                                <div className="lg:col-span-2 space-y-5">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        <InfoCard label="Harga / Jam" value={`Rp ${Number(venue.price_raw).toLocaleString('id-ID')}`} accent />
                                        <InfoCard label="Status" value={venue.status === 'open' ? 'Buka' : venue.status === 'closed' ? 'Tutup' : 'Maintenance'} />
                                        <InfoCard label="Dikelola" value={venue.owner} />
                                    </div>

                                    {venue.description && (
                                        <div className="bg-[#231F1F] rounded-2xl border border-[#2e2a2a] p-4 sm:p-5">
                                            <h2 className="text-base font-bold text-white mb-2">Tentang Venue</h2>
                                            <p className="text-sm text-slate-400 leading-relaxed">{venue.description}</p>
                                        </div>
                                    )}

                                    {/* Schedule */}
                                    <div className="bg-[#231F1F] rounded-2xl border border-[#2e2a2a] p-4 sm:p-5">
                                        <h2 className="text-base font-bold text-white mb-3">Pilih Slot Jam</h2>
                                        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-1.5">
                                            {timeSlots.map(slot => (
                                                <button key={slot.time}
                                                    disabled={!slot.available}
                                                    onClick={() => slot.available && toggleSlot(slot.time)}
                                                    className={`rounded-lg py-2 text-xs font-semibold text-center transition-all ${selectedSlots.includes(slot.time)
                                                        ? 'bg-[#F2D800]/30 text-[#F2D800] border-2 border-[#F2D800]'
                                                        : slot.available
                                                            ? 'bg-[#1A1818] text-slate-300 border border-[#2e2a2a] hover:border-[#F2D800]/30 hover:text-[#F2D800] cursor-pointer'
                                                            : 'bg-[#1A1818] text-slate-700 border border-[#2e2a2a] cursor-not-allowed line-through'
                                                        }`}>
                                                    {slot.time}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                                            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border border-[#2e2a2a] bg-[#1A1818]" /> Tersedia</span>
                                            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border-2 border-[#F2D800] bg-[#F2D800]/30" /> Dipilih</span>
                                            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border border-[#2e2a2a] bg-[#1A1818] opacity-40" /> Terisi</span>
                                        </div>
                                    </div>

                                    {/* Reviews */}
                                    {venue.reviews && venue.reviews.length > 0 && (
                                        <div className="bg-[#231F1F] rounded-2xl border border-[#2e2a2a] p-4 sm:p-5">
                                            <h2 className="text-base font-bold text-white mb-3">Ulasan ({venue.reviews_count})</h2>
                                            <div className="space-y-3">
                                                {venue.reviews.map(r => (
                                                    <div key={r.id} className="border-b border-[#2e2a2a] pb-3 last:border-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-white font-semibold text-sm">{r.user}</span>
                                                            <span className="text-yellow-400 text-xs">{'★'.repeat(r.rating)}</span>
                                                            <span className="text-slate-600 text-xs ml-auto">{r.created_at}</span>
                                                        </div>
                                                        <p className="text-slate-400 text-sm">{r.comment}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right — Booking Card */}
                                <div className="lg:col-span-1">
                                    <div className="lg:sticky lg:top-20 bg-[#231F1F] rounded-2xl border border-[#2e2a2a] p-4 sm:p-5 shadow-2xl">
                                        <div className="flex items-center gap-2 mb-4">
                                            <h3 className="text-base font-bold text-white">Booking</h3>
                                            {!auth?.user && (
                                                <span className="rounded-full bg-[#F2D800]/15 border border-[#F2D800]/30 px-2 py-0.5 text-[10px] font-bold text-[#F2D800]">
                                                    ⚡ Tanpa Login
                                                </span>
                                            )}
                                        </div>
                                        <div className="space-y-4">
                                            {/* Date */}
                                            <div>
                                                <label className="text-xs text-slate-400 block mb-1.5">Tanggal</label>
                                                <input type="date" value={bookingDate}
                                                    onChange={e => setBookingDate(e.target.value)}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    className="w-full rounded-xl bg-[#1A1818] border border-[#2e2a2a] text-white px-3 py-2 text-sm focus:border-[#F2D800] focus:outline-none" />
                                            </div>

                                            {/* Price */}
                                            <div className="flex items-center justify-between py-3 border-y border-[#2e2a2a]">
                                                <span className="text-sm text-slate-400">Harga / Jam</span>
                                                <span className="text-base font-black text-[#F2D800]">
                                                    Rp {Number(venue.price_raw).toLocaleString('id-ID')}
                                                </span>
                                            </div>

                                            {/* Summary */}
                                            {selectedSlots.length > 0 && (
                                                <div className="bg-[#1A1818] rounded-xl p-3 space-y-1.5">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-slate-400">Durasi</span>
                                                        <span className="text-white font-semibold">{selectedSlots.length} jam</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-slate-400">Jam</span>
                                                        <span className="text-white font-semibold">{selectedSlots[0]} – {endTime}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm pt-2 border-t border-[#2e2a2a]">
                                                        <span className="text-white font-bold">Total</span>
                                                        <span className="text-[#F2D800] font-black">
                                                            Rp {totalHarga.toLocaleString('id-ID')}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Tombol booking untuk SEMUA pengguna (guest & login) */}
                                            <button
                                                onClick={openPaymentModal}
                                                disabled={selectedSlots.length === 0}
                                                className={`w-full rounded-full py-3 text-sm font-bold transition-all shadow-lg ${selectedSlots.length > 0
                                                    ? 'bg-[#F2D800] text-[#1A1818] hover:bg-[#ffe800] hover:scale-[1.02] shadow-[#F2D800]/20'
                                                    : 'bg-[#2e2a2a] text-slate-600 cursor-not-allowed'
                                                    }`}>
                                                {selectedSlots.length > 0 ? 'Booking Sekarang →' : 'Pilih Jam Dulu'}
                                            </button>

                                            {/* Insentif untuk guest: hint daftar akun */}
                                            {!auth?.user && selectedSlots.length > 0 && (
                                                <p className="text-center text-[11px] text-slate-500 mt-1">
                                                    Atau{' '}
                                                    <Link href={route('login')} className="text-[#F2D800] font-semibold hover:underline">masuk</Link>
                                                    {' '}untuk dapat poin reward ⭐
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                <footer className="border-t border-[#2e2a2a] py-8 text-center">
                    <p className="text-xs text-slate-600">&copy; 2026 Janjee Booking Platform.</p>
                </footer>
            </div>

            {/* ── Payment Method Modal ── */}
            <AnimatePresence>
                {showPaymentModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
                        onClick={() => !processing && setShowPaymentModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="bg-[#1E1B1B] border border-[#2e2a2a] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="px-6 pt-6 pb-4 border-b border-[#2e2a2a]">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="text-lg font-black text-white">Konfirmasi Booking</h3>
                                    <button onClick={() => !processing && setShowPaymentModal(false)} className="text-slate-500 hover:text-white transition-colors text-lg">✕</button>
                                </div>
                                <p className="text-xs text-slate-500">Pembayaran dilakukan setelah mitra mengkonfirmasi booking</p>
                            </div>

                            {/* Booking Summary */}
                            <div className="mx-6 mt-4 bg-[#231F1F] rounded-2xl p-4 border border-[#2e2a2a]">
                                <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider font-semibold">Ringkasan Booking</p>
                                <p className="text-sm font-bold text-white">{venue.name}</p>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-400">
                                    <span>📅 {bookingDate}</span>
                                    <span>🕐 {selectedSlots[0]} – {endTime}</span>
                                    <span>⏱ {selectedSlots.length} jam</span>
                                </div>
                                <div className="mt-3 pt-2 border-t border-[#2e2a2a] flex justify-between">
                                    <span className="text-sm text-slate-400">Total Pembayaran</span>
                                    <span className="text-base font-black text-[#F2D800]">Rp {totalHarga.toLocaleString('id-ID')}</span>
                                </div>
                            </div>

                            {/* ── Data Guest (hanya tampil kalau tidak login) ── */}
                            {!auth?.user && (
                                <div className="px-6 pt-4 pb-2 space-y-3">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Data Pemesan</p>
                                    <div>
                                        <label className="text-xs text-slate-500 block mb-1">Nama Lengkap</label>
                                        <input
                                            type="text"
                                            placeholder="Masukkan nama Anda"
                                            value={guestName}
                                            onChange={e => setGuestName(e.target.value)}
                                            className="w-full rounded-xl bg-[#1A1818] border border-[#2e2a2a] text-white px-3 py-2.5 text-sm focus:border-[#F2D800] focus:outline-none placeholder-slate-600"
                                        />
                                        {guestErrors.guest_name && (
                                            <p className="mt-1 text-xs text-red-400">{guestErrors.guest_name}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 block mb-1">Nomor WhatsApp</label>
                                        <input
                                            type="tel"
                                            placeholder="08xxxxxxxxxx"
                                            value={guestPhone}
                                            onChange={e => setGuestPhone(e.target.value)}
                                            className="w-full rounded-xl bg-[#1A1818] border border-[#2e2a2a] text-white px-3 py-2.5 text-sm focus:border-[#F2D800] focus:outline-none placeholder-slate-600"
                                        />
                                        {guestErrors.guest_phone && (
                                            <p className="mt-1 text-xs text-red-400">{guestErrors.guest_phone}</p>
                                        )}
                                    </div>
                                    <div className="rounded-xl bg-[#F2D800]/5 border border-[#F2D800]/20 p-3">
                                        <p className="text-[11px] text-[#F2D800]/80">
                                            💡 <span className="font-semibold">Tip:</span>{' '}
                                            <Link href={route('login')} className="underline hover:text-[#F2D800]">Masuk sekarang</Link> untuk dapat poin reward ⭐ setiap booking!
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Payment Options */}
                            <div className="px-6 py-4 space-y-2.5">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Metode Pembayaran</p>
                                {PAYMENT_METHODS.map(m => (
                                    <button key={m.id}
                                        onClick={() => setPaymentMethod(m.id)}
                                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${paymentMethod === m.id
                                            ? 'border-[#F2D800] bg-[#F2D800]/10'
                                            : 'border-[#2e2a2a] bg-[#231F1F] hover:border-[#3e3a3a]'
                                            }`}>
                                        <span className="text-2xl">{m.icon}</span>
                                        <div className="flex-1">
                                            <p className={`text-sm font-bold ${paymentMethod === m.id ? 'text-[#F2D800]' : 'text-white'}`}>{m.label}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{m.desc}</p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${paymentMethod === m.id ? 'border-[#F2D800] bg-[#F2D800]' : 'border-[#3e3a3a]'
                                            }`}>
                                            {paymentMethod === m.id && <div className="w-2 h-2 rounded-full bg-[#1A1818]" />}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Confirm Button */}
                            <div className="px-6 pb-6">
                                <button
                                    onClick={confirmBooking}
                                    disabled={!paymentMethod || processing}
                                    className={`w-full rounded-full py-3.5 text-sm font-bold transition-all ${paymentMethod && !processing
                                        ? 'bg-[#F2D800] text-[#1A1818] hover:bg-[#ffe800] hover:scale-[1.02] shadow-lg shadow-[#F2D800]/20'
                                        : 'bg-[#2e2a2a] text-slate-600 cursor-not-allowed'
                                        }`}>
                                    {processing ? 'Memproses...' : 'Konfirmasi Booking'}
                                </button>
                                <p className="text-center text-xs text-slate-600 mt-3">
                                    Booking akan aktif setelah dikonfirmasi oleh mitra
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

function InfoCard({ label, value, accent }) {
    return (
        <div className={`bg-[#231F1F] rounded-2xl border p-3 sm:p-4 ${accent ? 'border-[#F2D800]/20' : 'border-[#2e2a2a]'}`}>
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className={`text-sm sm:text-base font-black truncate ${accent ? 'text-[#F2D800]' : 'text-white'}`}>{value}</p>
        </div>
    );
}
