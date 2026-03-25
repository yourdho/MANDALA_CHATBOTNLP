import { Head, Link, usePage, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Chatbot from '@/Components/Chatbot';
import AutoCarousel from '@/Components/AutoCarousel';

const PAYMENT_METHODS = [
    {
        id: 'lunas_online',
        label: 'Transfer / QRIS (Lunas 100%)',
        desc: 'Sistem OTOMATIS Tervefikasi.',
        icon: '💳',
    },
    {
        id: 'dp_online',
        label: 'Transfer / QRIS (DP 50%)',
        desc: 'DP via Midtrans & Lunas di Tempat.',
        icon: '⚡',
    },
    {
        id: 'dp_manual',
        label: 'Bayar DP di Admin',
        desc: 'WhatsApp Admin untuk Transfer Manual.',
        icon: '💬',
    },
];

export default function FacilityShow({ facility, timeSlots, user_vouchers = [] }) {
    const { auth } = usePage().props;
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [bookingDate, setBookingDate] = useState(() => {
        if (typeof window !== 'undefined') {
            return new URLSearchParams(window.location.search).get('date') || new Date().toISOString().split('T')[0];
        }
        return new Date().toISOString().split('T')[0];
    });

    const isMiniSoccer = facility.name.toLowerCase().includes('mini soccer');
    const [withReferee, setWithReferee] = useState(false);

    const handleDateChange = (e) => {
        const newDate = e.target.value;
        setBookingDate(newDate);
        setSelectedSlots([]);
        router.get(route('facility.show', facility.id), { date: newDate }, { preserveState: true, preserveScroll: true });
    };

    const toggleSlot = (time) =>
        setSelectedSlots(prev => {
            const newSlots = prev.includes(time)
                ? prev.filter(t => t !== time)
                : [...prev, time];
            return newSlots.sort();
        });

    const basePrice = selectedSlots.length * Number(facility.price_per_hour);
    const refereePrice = isMiniSoccer && withReferee ? 50000 : 0;
    const rawTotal = basePrice + refereePrice;

    // Voucher selection
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const discountAmount = useMemo(() => {
        if (!selectedVoucher) return 0;
        const reward = selectedVoucher.reward;
        let disc = 0;
        if (reward.discount_type === 'percentage') {
            disc = rawTotal * (Number(reward.discount_value) / 100);
            if (reward.max_discount && disc > Number(reward.max_discount)) {
                disc = Number(reward.max_discount);
            }
        } else {
            disc = Number(reward.discount_value);
        }
        return Math.min(disc, rawTotal);
    }, [selectedVoucher, rawTotal]);

    const totalHarga = rawTotal - discountAmount;

    const endTime = selectedSlots.length > 0
        ? String(parseInt(selectedSlots[selectedSlots.length - 1].split(':')[0]) + 1).padStart(2, '0') + ':00'
        : '';

    // Payment modal state
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [processing, setProcessing] = useState(false);

    // Guest fields
    const [guestPhone, setGuestPhone] = useState(auth?.user?.phone || '');
    const [guestErrors, setGuestErrors] = useState({});

    const openPaymentModal = () => {
        if (selectedSlots.length === 0) return;
        setPaymentMethod('');
        setShowPaymentModal(true);
    };

    const confirmBooking = () => {
        if (!paymentMethod) return;

        const errs = {};
        if (!guestPhone.trim()) errs.guest_phone = 'Nomor WhatsApp wajib diisi.';

        if (Object.keys(errs).length > 0) { setGuestErrors(errs); return; }
        setGuestErrors({});

        setProcessing(true);
        const payload = {
            facility_id: facility.id,
            booking_date: bookingDate,
            start_time: selectedSlots[0],
            end_time: endTime,
            payment_method: paymentMethod,
            guest_phone: guestPhone.trim(),
            is_with_referee: withReferee,
            user_reward_id: selectedVoucher?.id || null,
        };

        router.post(route('bookings.store'), payload, {
            onError: (errors) => {
                setProcessing(false);
                if (errors.guest_phone) {
                    setGuestErrors(errors);
                }
            },
            onSuccess: () => { setProcessing(false); setShowPaymentModal(false); },
        });
    };

    const images = facility.images ?? [];

    return (
        <>
            <Head title={`${facility.name} | Mandala Arena Booking`} />
            <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-[#38BDF8] selection:text-white">

                {/* ──────────── NAVBAR ──────────── */}
                <header className="sticky top-0 z-50 flex items-center justify-between px-6 lg:px-20 h-24 bg-white/90 backdrop-blur-md border-b border-slate-100">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#38BDF8] rounded-xl flex items-center justify-center shadow-lg shadow-[#38BDF8]/30">
                            <span className="text-white font-black italic text-xl">M</span>
                        </div>
                        <span className="text-2xl font-black tracking-tight text-slate-900 uppercase italic">
                            Mandala <span className="text-[#38BDF8]">Arena</span>
                        </span>
                    </Link>

                    <nav className="flex items-center gap-6">
                        <Link href="/" className="hidden sm:inline-block text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-[#38BDF8] transition-colors">
                            Kembali ke Home
                        </Link>
                        {auth?.user ? (
                            <Link href={route('dashboard')} className="px-6 py-2.5 bg-[#38BDF8] text-white font-bold rounded-full hover:bg-[#38BDF8]/90 transition-all text-sm uppercase tracking-widest shadow-lg shadow-[#38BDF8]/30">
                                Dashboard ✨
                            </Link>
                        ) : (
                            <Link href={route('login')} className="px-6 py-2.5 border-2 border-slate-200 text-slate-600 font-bold rounded-full hover:border-[#38BDF8] hover:text-[#38BDF8] transition-all text-sm uppercase tracking-widest">
                                Login untuk Booking
                            </Link>
                        )}
                    </nav>
                </header>

                <main className="max-w-7xl mx-auto px-6 lg:px-20 py-16">

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                        {/* Title & Info */}
                        <div className="lg:col-span-12 xl:col-span-8">
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#38BDF8]/10 text-[#38BDF8] rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
                                    <span className="w-2 h-2 bg-[#38BDF8] rounded-full animate-pulse" />
                                    Fasilitas Tersedia
                                </div>
                                <h1 className="text-5xl md:text-7xl font-black italic text-slate-900 uppercase tracking-tighter leading-none mb-6">
                                    {facility.name}
                                </h1>
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex items-center gap-2 bg-white border border-slate-100 px-4 py-2 rounded-xl shadow-sm">
                                        <span className="text-sm text-[#FACC15]">⭐</span>
                                        <span className="text-xs font-bold text-slate-600">4.9 / 5.0 Rating</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white border border-slate-100 px-4 py-2 rounded-xl shadow-sm">
                                        <span className="text-sm text-[#38BDF8]">📍</span>
                                        <span className="text-xs font-bold text-slate-600">Mandala Arena Center</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white border border-slate-100 px-4 py-2 rounded-xl shadow-sm">
                                        <span className="text-sm text-emerald-500">💳</span>
                                        <span className="text-xs font-bold text-slate-600">Online Payment Active</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Booking Sidebar / Ringkasan Panel */}
                        <div className="lg:col-span-12 xl:col-span-4 xl:row-span-2">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 sticky top-32"
                            >
                                <h3 className="text-2xl font-black italic text-slate-900 uppercase tracking-tight mb-8">
                                    Detail <span className="text-[#38BDF8]">Booking</span>
                                </h3>

                                <div className="space-y-6">
                                    {/* Pilih Tanggal */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pilih Tanggal</label>
                                        <input
                                            type="date"
                                            value={bookingDate}
                                            onChange={handleDateChange}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full rounded-2xl bg-slate-50 border-none text-slate-700 font-bold px-5 py-4 focus:ring-2 focus:ring-[#38BDF8] transition-all outline-none"
                                        />
                                    </div>

                                    {/* Info Harga / Jam */}
                                    <div className="flex items-center justify-between py-6 border-y border-slate-100">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Harga / Jam</span>
                                        <span className="text-2xl font-black italic text-[#38BDF8]">
                                            Rp {parseInt(facility.price_per_hour).toLocaleString()}
                                        </span>
                                    </div>

                                    {/* Tambah Wasit (Khusus Mini Soccer) */}
                                    {isMiniSoccer && selectedSlots.length > 0 && (
                                        <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                            <input
                                                type="checkbox"
                                                id="wasit"
                                                checked={withReferee}
                                                onChange={(e) => setWithReferee(e.target.checked)}
                                                className="mt-1 w-5 h-5 rounded text-[#FACC15] focus:ring-[#FACC15] border-amber-200"
                                            />
                                            <div>
                                                <label htmlFor="wasit" className="text-sm font-bold text-slate-800 cursor-pointer block">Tambah Wasit Pertandingan</label>
                                                <p className="text-xs font-medium text-slate-500 mt-1">Biaya tambahan +Rp 50.000 (Flat) per sesi booking untuk menjaga ritme kompetisi.</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Ringkasan Harga */}
                                    <AnimatePresence>
                                        {selectedSlots.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                                className="bg-slate-900 rounded-3xl p-6 shadow-xl space-y-4 overflow-hidden"
                                            >
                                                <div className="flex justify-between items-center text-slate-300">
                                                    <span className="text-xs font-bold">Durasi main</span>
                                                    <span className="text-sm font-bold text-white">{selectedSlots.length} Jam</span>
                                                </div>
                                                <div className="flex justify-between items-center text-slate-300">
                                                    <span className="text-xs font-bold">Jadwal</span>
                                                    <span className="text-sm font-bold text-[#FACC15]">{selectedSlots[0]} – {endTime}</span>
                                                </div>

                                                <div className="flex justify-between items-center text-slate-300">
                                                    <span className="text-xs font-bold">Harga Lapangan</span>
                                                    <span className="text-sm font-bold opacity-80">Rp {basePrice.toLocaleString()}</span>
                                                </div>

                                                {withReferee && (
                                                    <div className="flex justify-between items-center text-slate-300">
                                                        <span className="text-xs font-bold">Biaya Wasit</span>
                                                        <span className="text-sm font-bold text-[#FACC15]">+ Rp 50.000</span>
                                                    </div>
                                                )}

                                                <div className="pt-4 border-t border-slate-700 flex justify-between items-end">
                                                    <span className="text-xs font-black text-white uppercase tracking-widest">Total Bayar</span>
                                                    <span className="text-3xl font-black italic text-[#38BDF8]">
                                                        Rp {totalHarga.toLocaleString()}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Tombol Lanjut ke Pembayaran */}
                                    {auth?.user ? (
                                        <button
                                            onClick={openPaymentModal}
                                            disabled={selectedSlots.length === 0}
                                            className={`w-full rounded-2xl py-5 text-sm font-black transition-all uppercase tracking-widest shadow-lg ${selectedSlots.length > 0
                                                ? 'bg-[#FACC15] text-amber-900 hover:bg-[#FACC15]/90 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#FACC15]/30'
                                                : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                                                }`}
                                        >
                                            {selectedSlots.length > 0 ? 'Lanjut ke Pembayaran' : 'Pilih Jam Terlebih Dahulu'}
                                        </button>
                                    ) : (
                                        <div className="space-y-4">
                                            <Link
                                                href={route('login')}
                                                className="w-full block text-center rounded-2xl py-5 text-sm font-black bg-slate-900 text-white hover:bg-[#38BDF8] transition-all uppercase tracking-widest shadow-lg"
                                            >
                                                Login / Daftar
                                            </Link>
                                            <p className="text-center text-xs text-slate-500 font-bold">
                                                Daftar dalam 1 menit, langsung bisa booking jadwal.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>

                        {/* Interactive Main Content Area */}
                        <div className="lg:col-span-12 xl:col-span-8 space-y-12">

                            {/* SLOT PICKER */}
                            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-100 overflow-hidden relative">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#38BDF8] to-[#FACC15]" />
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                                    <h3 className="text-2xl font-black italic text-slate-900 uppercase tracking-tight">Pilih Jam <span className="text-[#38BDF8]">Main</span></h3>
                                    <div className="flex items-center gap-4 border border-slate-100 rounded-full px-4 py-2 bg-slate-50">
                                        <div className="w-3 h-3 rounded-full bg-slate-200" /> <span className="text-[10px] font-bold text-slate-500 uppercase">Tersedia</span>
                                        <div className="w-3 h-3 rounded-full bg-[#38BDF8] shadow-md shadow-[#38BDF8]/40" /> <span className="text-[10px] font-bold text-slate-500 uppercase">Dipilih</span>
                                        <div className="w-3 h-3 rounded-full bg-red-100" /> <span className="text-[10px] font-bold text-slate-500 uppercase">Penuh</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4">
                                    {timeSlots.map(slot => (
                                        <button key={slot.time}
                                            disabled={!slot.available}
                                            onClick={() => slot.available && toggleSlot(slot.time)}
                                            className={`group relative rounded-2xl py-4 flex flex-col items-center justify-center transition-all border-2 ${selectedSlots.includes(slot.time)
                                                ? 'bg-[#38BDF8]/10 border-[#38BDF8] text-[#38BDF8] shadow-lg shadow-[#38BDF8]/10'
                                                : slot.available
                                                    ? 'bg-white border-slate-200 text-slate-600 hover:border-[#38BDF8]/50 hover:text-[#38BDF8] cursor-pointer'
                                                    : 'bg-slate-50 border-transparent text-slate-300 cursor-not-allowed overflow-hidden shadow-inner'
                                                }`}
                                        >
                                            <span className="text-sm font-black italic uppercase tracking-tighter leading-none">{slot.time}</span>
                                            {!slot.available && (
                                                <div className="absolute inset-0 bg-red-500/5 flex items-center justify-center">
                                                    <div className="w-full h-[2px] bg-red-500/20 -rotate-45" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Feature Grid Mini */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <FacilityTrait icon="⚡" label="Penerangan Premium" />
                                <FacilityTrait icon="🚿" label="Kamar Mandi & Loker" />
                                <FacilityTrait icon="🅿️" label="Parkir Luas" />
                                <FacilityTrait icon="📶" label="Free Wi-Fi" />
                            </div>

                            {/* Large Image Showcase Gallery */}
                            <div className="rounded-[3rem] overflow-hidden border-2 border-slate-100 relative group bg-slate-900 aspect-video shadow-2xl shadow-slate-200/50">
                                <AutoCarousel images={images} name={facility.name} />

                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-900/80 to-transparent opacity-80 pointer-events-none z-10" />

                                <div className="absolute bottom-10 left-10 pointer-events-none z-20">
                                    <span className="text-4xl md:text-5xl font-['Permanent_Marker'] italic text-white uppercase tracking-tighter drop-shadow-xl">{facility.name}</span>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50">
                                <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest mb-4">Deskripsi Lapangan</h3>
                                <p className="text-lg text-slate-600 leading-relaxed font-medium">
                                    {facility.description || "Fasilitas Mandala Arena dirancang dengan mempertimbangkan performa dan kenyamanan. Booking sekarang dan nikmati arena olahraga berstandar tinggi untuk turnamen, fun match, atau sekadar latihan rutin."}
                                </p>
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="py-12 px-6 lg:px-20 border-t border-slate-100 bg-white">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#38BDF8] rounded-md flex items-center justify-center font-black italic text-white">M</div>
                            <span className="text-sm font-black text-slate-400 uppercase tracking-widest italic opacity-80">© {new Date().getFullYear()} Mandala Arena</span>
                        </div>
                        <p className="text-xs font-bold text-slate-400">Pusat Olahraga Modern & Praktis.</p>
                    </div>
                </footer>
            </div>

            {/* ── Payment Confirmation Modal ── */}
            <AnimatePresence>
                {showPaymentModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[70] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6"
                        onClick={() => !processing && setShowPaymentModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            className="bg-white border text-slate-900 border-slate-100 rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="bg-slate-50 p-8 border-b border-slate-100 flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-black italic text-slate-900 uppercase tracking-tight leading-none">Konfirmasi <span className="text-[#38BDF8]">Pembayaran</span></h3>
                                </div>
                                <button onClick={() => !processing && setShowPaymentModal(false)} className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all font-bold">✕</button>
                            </div>

                            <div className="p-8 space-y-8">
                                {/* Summary Box */}
                                <div className="bg-slate-900 rounded-2xl p-6 relative overflow-hidden text-white shadow-xl shadow-slate-900/20">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#38BDF8]/20 rounded-full blur-3xl" />
                                    <p className="text-xl font-black italic text-white uppercase tracking-tight mb-4">{facility.name}</p>
                                    <div className="flex flex-wrap gap-6 text-xs font-bold text-slate-300 uppercase tracking-widest">
                                        <div className="flex items-center gap-2">📅 <span className="text-white">{bookingDate}</span></div>
                                        <div className="flex items-center gap-2">🕒 <span className="text-white">{selectedSlots[0]} - {endTime}</span></div>
                                        {withReferee && <div className="flex items-center gap-2">🚩 <span className="text-[#FACC15]">+Wasit</span></div>}
                                    </div>
                                    <div className="mt-6 pt-6 border-t border-slate-700 space-y-2">
                                        {selectedVoucher && (
                                            <div className="flex justify-between items-center text-xs font-bold text-emerald-400">
                                                <span>Promo: {selectedVoucher.reward?.title}</span>
                                                <span>- Rp {discountAmount.toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Akhir</span>
                                            <span className="text-3xl font-black italic text-[#38BDF8]">Rp {totalHarga.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Input */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Nomor WhatsApp Aktif</label>
                                    <input
                                        type="tel"
                                        placeholder="08xxxxxxxxxx"
                                        value={guestPhone}
                                        onChange={e => setGuestPhone(e.target.value)}
                                        className="w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-800 px-6 py-4 font-bold focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent outline-none transition-all placeholder:text-slate-300"
                                    />
                                    {guestErrors.guest_phone && (
                                        <p className="text-xs text-red-500 font-bold">{guestErrors.guest_phone}</p>
                                    )}
                                </div>

                                {/* Voucher Selection (If any) */}
                                {user_vouchers.length > 0 && (
                                    <div className="space-y-4">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block italic">Pilih Voucher Tersedia ✨</label>
                                        <div className="flex flex-wrap gap-3">
                                            {user_vouchers.map(v => (
                                                <button
                                                    key={v.id}
                                                    onClick={() => setSelectedVoucher(selectedVoucher?.id === v.id ? null : v)}
                                                    className={`px-4 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${selectedVoucher?.id === v.id
                                                        ? 'bg-[#38BDF8] text-white border-[#38BDF8] shadow-lg shadow-[#38BDF8]/20'
                                                        : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                                                        }`}
                                                >
                                                    {v.reward?.title}
                                                    {selectedVoucher?.id === v.id && <span className="ml-2">✓</span>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Payment Choice */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {PAYMENT_METHODS.map(m => (
                                        <button key={m.id}
                                            onClick={() => setPaymentMethod(m.id)}
                                            className={`p-5 rounded-2xl border-2 transition-all text-left flex items-start gap-4 ${paymentMethod === m.id
                                                ? 'border-[#38BDF8] bg-[#38BDF8]/5 shadow-md shadow-[#38BDF8]/10'
                                                : 'border-slate-100 bg-white hover:border-slate-300'
                                                }`}>
                                            <span className="text-3xl bg-slate-50 p-2 rounded-xl border border-slate-100">{m.icon}</span>
                                            <div>
                                                <p className={`text-sm font-black uppercase tracking-tight mb-1 ${paymentMethod === m.id ? 'text-[#38BDF8]' : 'text-slate-700'}`}>{m.label}</p>
                                                <p className="text-[10px] font-bold text-slate-500">{m.desc}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {/* Final Confirm */}
                                <button
                                    onClick={confirmBooking}
                                    disabled={!paymentMethod || processing}
                                    className={`w-full rounded-2xl py-5 text-sm font-black transition-all shadow-lg uppercase tracking-widest ${paymentMethod && !processing
                                        ? 'bg-[#38BDF8] text-white hover:bg-[#38BDF8]/90 hover:-translate-y-1 hover:shadow-[#38BDF8]/30'
                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                                        }`}
                                >
                                    {processing ? 'Memproses Pesanan...' : 'Selesaikan Pembayaran'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Chatbot />
        </>
    );
}

function FacilityTrait({ icon, label }) {
    return (
        <div className="bg-white border border-slate-100 shadow-sm shadow-slate-100 rounded-2xl p-5 flex flex-col items-center gap-2 group hover:border-[#38BDF8]/30 transition-all">
            <span className="text-3xl group-hover:scale-110 transition-transform duration-300 bg-slate-50 p-3 rounded-xl">{icon}</span>
            <span className="text-[10px] font-bold text-slate-500 text-center">{label}</span>
        </div>
    );
}
