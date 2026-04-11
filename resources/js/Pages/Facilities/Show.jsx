import { Head, Link, usePage, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Components/Layouts/AuthenticatedLayout';
import Chatbot from '@/Components/Chatbot';
import AutoCarousel from '@/Components/Shared/AutoCarousel';

const PAYMENT_METHODS = [
    {
        id: 'qris',
        label: 'QRIS (Otomatis / Manual)',
        desc: 'Scan QRIS Mandala untuk Verifikasi Instan.',
    },
    {
        id: 'transfer',
        label: 'Transfer Bank / VA',
        desc: 'Transfer ke Virtual Account BCA atau Mandiri.',
    },
    {
        id: 'cod',
        label: 'Bayar di Tempat',
        desc: 'Lakukan Pembayaran Tunai di Lokasi (On-Site).',
    },
];

export default function FacilityShow({ facility, relatedFacilities = [], timeSlots, price_schedules = [], user_vouchers = [] }) {
    const { auth } = usePage().props;
    const isPilates = facility.category?.toLowerCase() === 'pilates';
    const [selectedPackage, setSelectedPackage] = useState('');
    const [selectedCourtId, setSelectedCourtId] = useState(facility.id);
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [bookingDate, setBookingDate] = useState(() => {
        if (typeof window !== 'undefined') {
            return new URLSearchParams(window.location.search).get('date') || new Date().toISOString().split('T')[0];
        }
        return new Date().toISOString().split('T')[0];
    });

    // Dynamic Addons State
    const [selectedAddons, setSelectedAddons] = useState([]);

    // Desktop Horizontal Scroll State
    const timelineRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const onMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.pageX - timelineRef.current.offsetLeft);
        setScrollLeft(timelineRef.current.scrollLeft);
    };
    const onMouseLeave = () => setIsDragging(false);
    const onMouseUp = () => setIsDragging(false);
    const onMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - timelineRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        timelineRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleAddonToggle = (addonName) => {
        setSelectedAddons(prev =>
            prev.includes(addonName)
                ? prev.filter(a => a !== addonName)
                : [...prev, addonName]
        );
    };

    const handleDateChange = (e) => {
        const newDate = e.target.value;
        setBookingDate(newDate);
        setSelectedSlots([]);
        router.get(route('facility.show', facility.id), { date: newDate }, { preserveState: true, preserveScroll: true });
    };

    const toggleMultiCourtSlot = (courtId, time) => {
        if (selectedCourtId !== courtId) {
            setSelectedCourtId(courtId);
            setSelectedSlots([time]);
        } else {
            setSelectedSlots(prev => {
                const newSlots = prev.includes(time)
                    ? prev.filter(t => t !== time)
                    : [...prev, time];
                return newSlots.sort();
            });
        }
    };

    const basePrice = useMemo(() => {
        if (isPilates) {
            const pkg = price_schedules.find(p => p.session_name === selectedPackage);
            return pkg ? Number(pkg.price) : 0;
        }

        const currentFacility = relatedFacilities.find(f => f.id === selectedCourtId) || facility;
        const fallbackPrice = currentFacility.price_per_hour || facility.price_per_hour;

        let total = 0;
        selectedSlots.forEach(slot => {
            const schedule = price_schedules.find(s => {
                if (!s.start_time || !s.end_time) return false;
                const start = s.start_time.substring(0, 5);
                const end = s.end_time.substring(0, 5);
                return slot >= start && slot <= end; // Jam booking berada dalam range
            });
            total += schedule ? Number(schedule.price) : Number(fallbackPrice);
        });
        return total;
    }, [selectedSlots, price_schedules, facility.price_per_hour, isPilates, selectedPackage, selectedCourtId, relatedFacilities]);

    // Calculate Addons Price
    const addonsPrice = useMemo(() => {
        const addons = facility.addons ?? [];
        return selectedAddons.reduce((sum, name) => {
            const addon = addons.find(a => a.name === name);
            return sum + (addon ? Number(addon.price) : 0);
        }, 0);
    }, [selectedAddons, facility.addons]);

    const rawTotal = basePrice + addonsPrice;

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

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [processing, setProcessing] = useState(false);

    const [guestName, setGuestName] = useState(auth?.user?.name || '');
    const [guestEmail, setGuestEmail] = useState(auth?.user?.email || '');
    const [guestPhone, setGuestPhone] = useState(auth?.user?.phone || '');
    const [guestErrors, setGuestErrors] = useState({});

    const openPaymentModal = () => {
        if (isPilates && !selectedPackage) return;
        if (!isPilates && selectedSlots.length === 0) return;
        setPaymentMethod('');
        setShowPaymentModal(true);
    };

    const confirmBooking = () => {
        if (!paymentMethod) return;
        const errs = {};
        if (!auth?.user) {
            if (!guestName.trim()) errs.guest_name = 'Nama lengkap wajib diisi.';
            if (!guestEmail.trim()) errs.guest_email = 'Email aktif wajib diisi.';
        }
        if (!guestPhone.trim()) errs.guest_phone = 'Nomor WhatsApp wajib diisi.';
        if (Object.keys(errs).length > 0) { setGuestErrors(errs); return; }
        setGuestErrors({});

        setProcessing(true);
        router.post(route('bookings.store'), {
            facility_id: (relatedFacilities.length > 1 && !isPilates) ? selectedCourtId : facility.id,
            booking_date: bookingDate,
            start_time: isPilates ? '00:00' : selectedSlots[0],
            end_time: isPilates ? '23:59' : endTime,
            payment_method: paymentMethod,
            guest_name: guestName.trim(),
            guest_email: guestEmail.trim(),
            guest_phone: guestPhone.trim(),
            selected_addons: selectedAddons,
            user_reward_id: selectedVoucher?.id || null,
            session_name: isPilates ? selectedPackage : null,
        }, {
            onError: (errors) => {
                setProcessing(false);
                if (Object.keys(errors).length > 0) setGuestErrors(errors);
            },
            onSuccess: () => { setProcessing(false); setShowPaymentModal(false); },
        });
    };

    const images = facility.images ?? [];

    const content = (
        <div className="min-h-screen selection:bg-[#38BDF8] selection:text-white transition-colors duration-300 pb-20 md:pb-24"
            style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>

            {!auth?.user && (
                <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 lg:px-20 h-24 border-b transition-all"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <Link href="/" className="flex items-center gap-1.5">
                        <img src="/aset_foto/lgo.png" alt="Mandala Arena Logo" className="h-10 w-auto object-contain drop-shadow-md" />
                        <span className="text-2xl font-light tracking-tight italic" style={{ color: 'var(--text-primary)', fontFamily: '"Poppins", sans-serif', fontFeatureSettings: '"ss01", "ss02"' }}>
                            Mandala <span className="text-[#38BDF8]">Arena</span>
                        </span>
                    </Link>
                    <nav className="flex items-center gap-6">
                        <Link href="/" className="text-sm font-bold uppercase tracking-widest text-[#38BDF8] transition-colors">Beranda</Link>
                        <Link href={route('login')} className="px-6 py-2 bg-slate-100 text-slate-900 font-black rounded-full hover:bg-slate-900 hover:text-white transition-all text-xs uppercase tracking-widest shadow-lg">Login</Link>
                    </nav>
                </header>
            )}

            <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-8 lg:py-16 ${!auth?.user ? 'pt-32 lg:pt-40' : 'pt-6 lg:pt-10'} space-y-8 md:space-y-12`}>

                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 md:space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-[#38BDF8]/10 text-[#38BDF8] rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em]">
                        <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#38BDF8] rounded-full animate-pulse" />
                        Portal Misi Terbuka
                    </div>
                    <h1 className="text-2xl sm:text-5xl lg:text-7xl font-black italic uppercase tracking-tighter leading-none" style={{ color: 'var(--text-primary)' }}>
                        {relatedFacilities.length > 1 ? `ZONA ${facility.category}` : facility.name}
                    </h1>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                    className="rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden border-2 bg-slate-900 aspect-video shadow-2xl relative group"
                    style={{ borderColor: 'var(--border)' }}>
                    <AutoCarousel images={images} name={facility.name} />
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-900/80 to-transparent pointer-events-none z-10" />
                </motion.div>

                {relatedFacilities.length > 1 && !isPilates ? (
                    <div className="space-y-8">
                        {relatedFacilities.map(court => (
                            <motion.div key={court.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                className="rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-12 shadow-2xl border-2 overflow-hidden relative"
                                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#38BDF8] via-[#FACC15] to-[#38BDF8]" />

                                <div className="flex items-center gap-4 mb-10 pb-6 border-b border-[#38BDF8]/10">
                                    <div className="w-12 h-12 md:w-16 md:h-16 bg-[#38BDF8] rounded-2xl flex items-center justify-center shadow-lg shadow-[#38BDF8]/30">
                                        <span className="text-slate-900 font-black italic text-2xl md:text-3xl uppercase leading-none">#</span>
                                    </div>
                                    <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter drop-shadow-md text-[#38BDF8]">
                                        {court.name}
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
                                    <div className="lg:col-span-4 space-y-6">
                                        <div>
                                            <h3 className="text-sm font-black italic uppercase tracking-[0.2em] text-[#38BDF8] mb-1">01. Atur Timeline</h3>
                                            <p className="text-[10px] font-bold uppercase opacity-40 italic">Radar Operasi Janjee</p>
                                        </div>
                                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 select-none">
                                            {[...Array(30)].map((_, i) => {
                                                const d = new Date(); d.setDate(d.getDate() + i);
                                                const dateString = d.toISOString().split('T')[0];
                                                const isActive = bookingDate === dateString;
                                                return (
                                                    <button key={dateString} onClick={() => handleDateChange({ target: { value: dateString } })}
                                                        className={`min-w-[70px] py-4 rounded-2xl border-2 transition-all flex flex-col items-center flex-shrink-0 ${isActive ? 'bg-slate-900 border-slate-900 text-white scale-105 shadow-xl' : 'bg-slate-400/5 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400'}`}>
                                                        <span className="text-[8px] font-black uppercase mb-1">{d.toLocaleDateString('id-ID', { weekday: 'short' })}</span>
                                                        <span className="text-xl font-black italic leading-none">{d.getDate()}</span>
                                                        <span className="text-[8px] font-black uppercase mt-1 opacity-70">{d.toLocaleDateString('id-ID', { month: 'short' })}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="lg:col-span-8 space-y-6">
                                        <h3 className="text-sm font-black italic uppercase tracking-[0.2em] text-[#38BDF8]">02. Alokasi Waktu</h3>
                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                                            {court.timeSlots.map(slot => (
                                                <button key={slot.time} disabled={!slot.available} onClick={() => slot.available && toggleMultiCourtSlot(court.id, slot.time)}
                                                    className={`py-5 rounded-2xl border-2 font-black italic text-sm transition-all relative overflow-hidden flex items-center justify-center
                                                    ${selectedCourtId === court.id && selectedSlots.includes(slot.time)
                                                            ? 'bg-[#38BDF8] border-[#38BDF8] text-slate-950 shadow-[0_10px_30px_rgba(56,189,248,0.4)] z-10 scale-110 !opacity-100'
                                                            : slot.available
                                                                ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-200 hover:border-[#38BDF8] hover:scale-105 active:scale-95 shadow-sm'
                                                                : 'bg-slate-100 dark:bg-slate-950 border-dashed border-slate-300 dark:border-slate-800 text-slate-300 dark:text-slate-700/60 cursor-not-allowed line-through opacity-80'
                                                        }
                                                `}>
                                                    <div className="flex flex-col items-center">
                                                        <span>{slot.time}</span>
                                                        <span className="text-[8px] opacity-40 font-bold mt-1 group-hover:opacity-100 transition-opacity">RP {parseInt(slot.price).toLocaleString('id-ID')}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-12 shadow-2xl border-2 overflow-hidden relative"
                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#38BDF8] via-[#FACC15] to-[#38BDF8]" />
                        {isPilates ? (
                            <div className="space-y-6">
                                <h3 className="text-sm font-black italic uppercase tracking-[0.2em] text-[#38BDF8]">01. Pilih Paket Olahraga</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {price_schedules.map(ps => (
                                        <button key={ps.id} onClick={() => setSelectedPackage(ps.session_name)}
                                            className={`p-6 rounded-[2rem] border-2 shadow-2xl transition-all text-left flex flex-col justify-center ${selectedPackage === ps.session_name ? 'bg-[#38BDF8] border-[#38BDF8] text-slate-900 scale-105 shadow-[0_10px_40px_rgba(56,189,248,0.5)] z-10' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-300 hover:border-[#38BDF8] hover:shadow-[0_10px_20px_rgba(56,189,248,0.2)]'}`}>
                                            <div className="font-black italic text-xl uppercase mb-2">{ps.session_name}</div>
                                            <div className={`text-2xl font-black italic tracking-tighter ${selectedPackage === ps.session_name ? 'text-slate-900' : 'text-[#FACC15]'}`}>RP {Number(ps.price).toLocaleString('id-ID')}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                <div className="lg:col-span-4 space-y-6">
                                    <div>
                                        <h3 className="text-sm font-black italic uppercase tracking-[0.2em] text-[#38BDF8] mb-1">01. Atur Timeline</h3>
                                        <p className="text-[10px] font-bold uppercase opacity-40 italic">Radar Operasi Janjee</p>
                                    </div>
                                    <div
                                        ref={timelineRef}
                                        onMouseDown={onMouseDown}
                                        onMouseLeave={onMouseLeave}
                                        onMouseUp={onMouseUp}
                                        onMouseMove={onMouseMove}
                                        className={`flex gap-2 overflow-x-auto no-scrollbar pb-2 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                                    >
                                        {[...Array(30)].map((_, i) => {
                                            const d = new Date(); d.setDate(d.getDate() + i);
                                            const dateString = d.toISOString().split('T')[0];
                                            const isActive = bookingDate === dateString;
                                            return (
                                                <button key={dateString} onClick={() => handleDateChange({ target: { value: dateString } })}
                                                    className={`min-w-[70px] py-4 rounded-2xl border-2 transition-all flex flex-col items-center flex-shrink-0 ${isActive ? 'bg-slate-900 border-slate-900 text-white scale-105 shadow-xl' : 'bg-slate-400/5 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400'}`}>
                                                    <span className="text-[8px] font-black uppercase mb-1">{d.toLocaleDateString('id-ID', { weekday: 'short' })}</span>
                                                    <span className="text-xl font-black italic leading-none">{d.getDate()}</span>
                                                    <span className="text-[8px] font-black uppercase mt-1 opacity-70">{d.toLocaleDateString('id-ID', { month: 'short' })}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="lg:col-span-8 space-y-6">
                                    <h3 className="text-sm font-black italic uppercase tracking-[0.2em] text-[#38BDF8]">02. Alokasi Waktu</h3>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                                        {timeSlots.map(slot => (
                                            <button key={slot.time} disabled={!slot.available} onClick={() => slot.available && toggleMultiCourtSlot(facility.id, slot.time)}
                                                className={`py-5 rounded-2xl border-2 font-black italic text-sm transition-all relative overflow-hidden flex items-center justify-center
                                                ${selectedSlots.includes(slot.time)
                                                        ? 'bg-[#38BDF8] border-[#38BDF8] text-slate-950 shadow-[0_10px_30px_rgba(56,189,248,0.4)] z-10 scale-110 !opacity-100'
                                                        : slot.available
                                                            ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-200 hover:border-[#38BDF8] hover:scale-105 active:scale-95 shadow-sm'
                                                            : 'bg-slate-100 dark:bg-slate-950 border-dashed border-slate-300 dark:border-slate-800 text-slate-300 dark:text-slate-700/60 cursor-not-allowed line-through opacity-80'
                                                    }
                                            `}>
                                                <div className="flex flex-col items-center">
                                                    <span>{slot.time}</span>
                                                    <span className="text-[8px] opacity-40 font-bold mt-1 group-hover:opacity-100 transition-opacity">Rp {parseInt(slot.price).toLocaleString()}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* 04. DYNAMIC ADDONS SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 p-8 rounded-[2.5rem] border-2 space-y-6" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-60 italic">
                            <span>Sistem Harga Dinamis</span>
                            <span>/ Sesi</span>
                        </div>

                        {price_schedules.length > 0 ? (
                            <div className="space-y-3">
                                {price_schedules.map((ps, idx) => (
                                    <div key={idx} className="flex flex-col gap-1 border-b border-slate-700/30 pb-2">
                                        <span className="text-[10px] font-bold uppercase text-[#38BDF8]">{ps.session_name} {ps.start_time ? `(${ps.start_time.substring(0, 5)} - ${ps.end_time.substring(0, 5)})` : ''}</span>
                                        <span className="text-xl font-black italic tracking-tighter" style={{ color: 'var(--text-primary)' }}>RP {parseInt(ps.price).toLocaleString('id-ID')}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-4xl md:text-5xl font-black italic text-[#38BDF8]">RP {parseInt(facility.price_per_hour).toLocaleString('id-ID')}</div>
                        )}
                    </div>

                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(facility.addons ?? []).map(addon => (
                            <div key={addon.name}
                                onClick={() => handleAddonToggle(addon.name)}
                                className={`p-6 rounded-[2rem] border-2 flex items-center gap-4 transition-all cursor-pointer select-none ${selectedAddons.includes(addon.name) ? 'bg-[#FACC15]/10 border-[#FACC15]' : 'bg-slate-400/5'}`}
                                style={{ borderColor: selectedAddons.includes(addon.name) ? '#FACC15' : 'var(--border)' }}>
                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedAddons.includes(addon.name) ? 'bg-[#FACC15] border-[#FACC15]' : 'border-slate-300 dark:border-slate-700'}`}>
                                    {selectedAddons.includes(addon.name) && <span className="text-slate-900 font-black text-[10px]">?</span>}
                                </div>
                                <div className="flex-1">
                                    <span className="text-xs font-black italic uppercase tracking-widest block" style={{ color: 'var(--text-primary)' }}>{addon.name}</span>
                                    <p className="text-[10px] font-bold opacity-40 mt-1 uppercase italic">+ RP {parseInt(addon.price).toLocaleString('id-ID')} / Sesi</p>
                                </div>
                            </div>
                        ))}
                        {(facility.addons ?? []).length === 0 && (
                            <div className="col-span-2 p-8 rounded-[2rem] border-2 border-dashed flex items-center justify-center opacity-30 italic text-[10px] font-black uppercase tracking-widest" style={{ borderColor: 'var(--border)' }}>
                                No Extra Logistics Available for this Sector
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border-2 shadow-xl" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 text-[#38BDF8] italic opacity-40 text-center underline underline-offset-8">Spesifikasi Misi</h3>
                    <p className="text-base md:text-xl leading-relaxed font-medium text-center md:text-left" style={{ color: 'var(--text-primary)' }}>
                        {facility.description || "Infrastruktur olahraga premium yang dirancang untuk performa maksimal dan kenyamanan atlet."}
                    </p>
                </div>

                <AnimatePresence>
                    {(selectedSlots.length > 0 || selectedPackage) && (
                        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
                            className="mt-12 w-full relative z-[60] bg-slate-950 rounded-[3rem] border-2 border-[#38BDF8]/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#38BDF8] via-[#FACC15] to-[#38BDF8]" />
                            <div className="max-w-7xl mx-auto px-6 py-4 md:py-8 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 w-full md:w-auto">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[8px] font-black uppercase tracking-widest opacity-40 italic text-white">Target Misi</span>
                                        <span className="text-xs font-black italic uppercase text-[#38BDF8] truncate max-w-[120px]">
                                            {relatedFacilities.length > 1 && !isPilates ? (relatedFacilities.find(f => f.id === selectedCourtId)?.name || facility.name) : facility.name}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[8px] font-black uppercase tracking-widest opacity-40 italic text-white">{isPilates ? 'Detail Identitas' : 'Timeline'}</span>
                                        <span className="text-xs font-black italic uppercase text-white">{isPilates ? selectedPackage : bookingDate}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[8px] font-black uppercase tracking-widest opacity-40 italic text-white">{isPilates ? 'Layanan Ekstra' : 'Durasi'}</span>
                                        <span className="text-xs font-black italic uppercase text-white">{isPilates ? (selectedAddons.length ? selectedAddons.length + ' Item' : '-') : selectedSlots.length + ' Jam'}</span>
                                    </div>
                                    {!isPilates && (
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[8px] font-black uppercase tracking-widest opacity-40 italic text-white">Jadwal</span>
                                            <span className="text-xs font-black italic uppercase text-white">{selectedSlots[0]}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col sm:flex-row items-center gap-8 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-white/10">
                                    <div className="flex flex-col items-center sm:items-end w-full sm:w-auto">
                                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-1 italic text-white">Total Investasi</span>
                                        <span className="text-2xl md:text-5xl font-black italic text-[#FACC15]">RP {totalHarga.toLocaleString('id-ID')}</span>
                                    </div>
                                    <button onClick={openPaymentModal} className="w-full sm:w-auto px-12 py-5 bg-[#38BDF8] text-slate-900 font-black rounded-2xl text-[10px] md:text-xs uppercase tracking-[0.4em] shadow-xl hover:scale-105 active:scale-95 transition-all italic hover:bg-white group">
                                        GASS BOOKING <span className="inline-block transition-transform group-hover:translate-x-2">?</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <AnimatePresence>
                {showPaymentModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6"
                        onClick={() => !processing && setShowPaymentModal(false)}>
                        <motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }}
                            className="bg-slate-900 border-x-2 border-b-2 border-[#38BDF8]/20 rounded-[3rem] w-full max-w-2xl shadow-[0_50px_200px_-50px_rgba(0,0,0,0.8)] overflow-hidden relative"
                            onClick={e => e.stopPropagation()}>
                            <div className="bg-slate-950 p-8 md:p-10 flex items-center justify-between text-white border-b border-white/5">
                                <div className="flex items-center gap-3"><div className="w-2 h-8 bg-[#38BDF8] rounded-full" /><div><h3 className="text-2xl font-black italic uppercase tracking-tighter">Otorisasi <span className="text-[#38BDF8]">Main</span></h3><p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40">Mandala Final Authorization</p></div></div>
                                <button onClick={() => !processing && setShowPaymentModal(false)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white text-white hover:text-slate-900 transition-all font-bold">?</button>
                            </div>
                            <div className="p-8 md:p-12 space-y-10 overflow-y-auto max-h-[75vh] no-scrollbar">
                                {guestErrors.error && (
                                    <div className="bg-red-500/10 border-2 border-red-500/50 p-4 md:p-6 rounded-2xl flex items-center gap-4 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                                        <div className="w-10 h-10 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center font-black animate-pulse flex-shrink-0 text-xl">!</div>
                                        <p className="text-xs md:text-sm text-red-500 font-black italic uppercase leading-relaxed">{guestErrors.error}</p>
                                    </div>
                                )}
                                <div className="bg-slate-950/50 rounded-3xl p-6 md:p-8 border border-white/5 relative overflow-hidden group">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#38BDF8] mb-6 border-b border-[#38BDF8]/20 pb-4 italic">Rincian Reservasi</h4>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-xs text-white">
                                            <span className="opacity-40 uppercase italic">Fasilitas</span>
                                            <span className="font-black italic uppercase text-right">
                                                {relatedFacilities.length > 1 && !isPilates ? (relatedFacilities.find(f => f.id === selectedCourtId)?.name || facility.name) : facility.name}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-white"><span className="opacity-40 uppercase italic">{isPilates ? 'Timeline Pembelian' : 'Timeline'}</span><span className="font-black italic uppercase text-right">{bookingDate} {!isPilates && `@ ${selectedSlots[0]}`}</span></div>

                                        <div className="flex justify-between items-center text-xs text-white pb-4 border-b border-white/5">
                                            <span className="opacity-40 uppercase italic">{isPilates ? 'Paket Layanan' : `Harga Sewa (${selectedSlots.length} Jam)`}</span>
                                            <div className="text-right">
                                                {isPilates && <span className="font-black text-[#38BDF8] italic uppercase block mb-1">{selectedPackage}</span>}
                                                <span className="font-black text-white italic uppercase block">RP {basePrice.toLocaleString('id-ID')}</span>
                                            </div>
                                        </div>

                                        {selectedAddons.length > 0 && (
                                            <div className="flex flex-col gap-3 py-2 border-b border-white/5 pb-4">
                                                <span className="opacity-40 uppercase italic text-xs text-white block">Add On</span>
                                                {selectedAddons.map(name => {
                                                    const addon = (facility.addons ?? []).find(a => a.name === name);
                                                    return (
                                                        <div key={name} className="flex justify-between items-center text-xs text-white">
                                                            <span className="font-black text-[#38BDF8] italic uppercase pl-2">- {name}</span>
                                                            <span className="font-black italic text-right">+ RP {addon ? parseInt(addon.price).toLocaleString('id-ID') : '0'}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                        <div className="pt-4 flex justify-between items-end">
                                            <span className="text-[10px] font-black uppercase opacity-30 italic">Total Tagihan</span>
                                            <span className="text-3xl font-black italic text-[#FACC15] drop-shadow-[0_0_15px_rgba(250,204,21,0.3)]">RP {totalHarga.toLocaleString('id-ID')}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] italic ml-2 opacity-30 text-white">Otoritas User / Member</label>
                                    {!auth?.user && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <input type="text" placeholder="NAMA LENGKAP" value={guestName} onChange={e => setGuestName(e.target.value)} className={`w-full rounded-2xl bg-white/5 border-2 text-white px-6 py-4 font-black italic text-xs focus:ring-2 focus:ring-[#38BDF8] outline-none transition-all ${guestErrors.guest_name ? 'border-red-500' : 'border-white/5'}`} />
                                                {guestErrors.guest_name && <p className="text-[10px] text-red-500 font-black uppercase italic mt-2 ml-2">{guestErrors.guest_name}</p>}
                                            </div>
                                            <div>
                                                <input type="email" placeholder="EMAIL AKTIF" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} className={`w-full rounded-2xl bg-white/5 border-2 text-white px-6 py-4 font-black italic text-xs focus:ring-2 focus:ring-[#38BDF8] outline-none transition-all ${guestErrors.guest_email ? 'border-red-500' : 'border-white/5'}`} />
                                                {guestErrors.guest_email && <p className="text-[10px] text-red-500 font-black uppercase italic mt-2 ml-2">{guestErrors.guest_email}</p>}
                                            </div>
                                        </div>
                                    )}
                                    <input type="tel" placeholder="NOMOR WHATSAPP AKTIF" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} className="w-full rounded-2xl bg-white/5 border-2 border-white/5 text-white px-6 py-5 font-black italic text-xs focus:ring-2 focus:ring-[#38BDF8] outline-none transition-all" />
                                    {guestErrors.guest_phone && <p className="text-[10px] text-red-500 font-black uppercase italic bg-red-500/10 py-2 px-4 rounded-xl">{guestErrors.guest_phone}</p>}
                                </div>
                                <div className="space-y-6">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] italic ml-2 opacity-30 text-white">Metode Transaksi</label>
                                    <div className="grid grid-cols-1 gap-4">
                                        {PAYMENT_METHODS.map(m => (
                                            <button key={m.id} onClick={() => setPaymentMethod(m.id)}
                                                className={`p-6 rounded-3xl border-2 transition-all flex items-center justify-between group relative overflow-hidden ${paymentMethod === m.id ? 'border-[#38BDF8] bg-white/5 text-white shadow-[0_10px_30px_rgba(56,189,248,0.2)]' : 'border-white/5 bg-white/5 text-white/50 hover:bg-white/10'}`}>
                                                <div className="relative z-10"><p className={`text-xs font-black italic uppercase tracking-widest mb-1 ${paymentMethod === m.id ? 'text-[#38BDF8]' : ''}`}>{m.label}</p><p className="text-[9px] font-bold opacity-30 italic">{m.desc}</p></div>
                                                <div className={`w-8 h-8 rounded-full border-4 relative z-10 transition-all ${paymentMethod === m.id ? 'border-[#38BDF8] bg-slate-900 animate-pulse' : 'border-white/10'}`} />
                                            </button>
                                        ))}
                                    </div>

                                    {/* INFO PEMBAYARAN RINGKAS */}
                                    {paymentMethod && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-[#38BDF8]/5 border border-[#38BDF8]/20 rounded-3xl overflow-hidden shadow-inner">
                                            <div className="p-6 space-y-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-1.5 h-6 bg-[#38BDF8] rounded-full" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#38BDF8] italic text-white underline underline-offset-4 decoration-white/10">Instruksi Otorisasi</span>
                                                </div>

                                                {paymentMethod === 'transfer' && (
                                                    <div className="space-y-4">
                                                        {(() => {
                                                            const category = facility.category?.toLowerCase().replace(' ', '_');
                                                            const bankName = usePage().props.system_settings[`cat_${category}_bank_name`];
                                                            const bankNumber = usePage().props.system_settings[`cat_${category}_bank_number`];
                                                            const bankOwner = usePage().props.system_settings[`cat_${category}_bank_owner`];

                                                            if (bankNumber) {
                                                                return (
                                                                    <div className="bg-slate-950/40 p-8 rounded-[2rem] border-2 border-[#38BDF8]/20 relative group hover:border-[#38BDF8]/50 transition-all text-center">
                                                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-[#38BDF8] text-slate-900 text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-[#38BDF8]/20">
                                                                            REKENING RESMI {facility.category.toUpperCase()}
                                                                        </div>
                                                                        <p className="text-xs font-black italic text-[#FACC15] uppercase mb-2">{bankName}</p>
                                                                        <p className="text-2xl md:text-3xl font-black italic text-white tracking-[0.1em] my-2 select-all">{bankNumber}</p>
                                                                        <p className="text-[10px] font-bold opacity-30 text-white italic">A/N {bankOwner}</p>
                                                                    </div>
                                                                );
                                                            }

                                                            return (
                                                                <div className="bg-slate-950/40 p-8 rounded-[2rem] border-2 border-dashed border-white/10 text-center">
                                                                    <p className="text-xs font-black italic text-white/40 uppercase">Rekening belum dikonfigurasi.</p>
                                                                    <p className="text-[9px] font-bold opacity-20 text-white italic mt-1">Silakan pilih metode lain atau hubungi admin.</p>
                                                                </div>
                                                            );
                                                        })()}
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-white/20 italic text-center">Salin nomor rekening dan transfer sesuai total tagihan.</p>
                                                    </div>
                                                )}

                                                {paymentMethod === 'qris' && (() => {
                                                    const category = facility.category?.toLowerCase().replace(' ', '_');
                                                    const qrisImage = usePage().props.system_settings[`cat_${category}_qris`];

                                                    if (qrisImage) {
                                                        return (
                                                            <div className="flex flex-col items-center gap-6 py-4">
                                                                <div className="p-4 bg-white rounded-[2.5rem] shadow-2xl relative group overflow-hidden">
                                                                    <img src={qrisImage} alt="QRIS Mandala" className="w-48 h-48 md:w-56 md:h-56 object-contain" />
                                                                    <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                                                </div>
                                                                <div className="text-center">
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#FACC15] italic block mb-2 underline underline-offset-4 decoration-[#FACC15]/30">SCAN QRIS {facility.category.toUpperCase()}</span>
                                                                    <p className="text-[8px] font-bold opacity-40 text-white italic uppercase tracking-tighter font-black">Satu QRIS untuk semua channel pembayaran digital.</p>
                                                                </div>
                                                            </div>
                                                        );
                                                    }

                                                    return (
                                                        <div className="py-12 text-center opacity-30 italic">
                                                            <p className="text-xs font-black uppercase">QRIS Belum Tersedia</p>
                                                        </div>
                                                    );
                                                })()}

                                                {paymentMethod === 'cod' && (
                                                    <div className="py-6 text-center space-y-4">
                                                        <div className="w-16 h-16 bg-[#38BDF8]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#38BDF8]/20 animate-pulse">
                                                            <span className="text-2xl">??</span>
                                                        </div>
                                                        <h5 className="text-xs font-black italic uppercase tracking-widest text-white">BAYAR TUNAI DI LOKASI</h5>
                                                        <p className="text-[9px] font-bold opacity-40 text-white italic leading-relaxed uppercase max-w-[300px] mx-auto">
                                                            DATA ANDA AKAN TERDAFTAR SEBAGAI BOOKING PENDING. HARAP SEGERA DATANG KE LOKASI UNTUK VALIDASI.
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="pt-4 border-t border-white/5 text-center">
                                                    <p className="text-[9px] font-black uppercase text-[#38BDF8] italic opacity-70">Konfirmasi via WA Admin: <span className="underline">+62 8XX XXXX XXXX</span></p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                                <button onClick={confirmBooking} disabled={!paymentMethod || processing} className={`w-full rounded-3xl py-7 text-sm font-black transition-all shadow-2xl uppercase tracking-[0.5em] italic ${paymentMethod && !processing ? 'bg-[#38BDF8] text-slate-900 hover:bg-white' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}>
                                    {processing ? 'KOMUNIKASI SERVER...' : 'KONFIRMASI PEMBAYARAN ?'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    if (auth?.user) return <AuthenticatedLayout showChatbot={true}><Head title={`${facility.name} | Mandala Arena`} />{content}</AuthenticatedLayout>;
    return <AuthenticatedLayout showSidebar={false} showChatbot={true}><Head title={`${facility.name} | Mandala Arena`} />{content}</AuthenticatedLayout>;
}
